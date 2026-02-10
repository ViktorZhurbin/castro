import { dirname, isAbsolute, resolve } from "node:path";
import { getAdapter, initAdapter } from "../islands/adapter.js";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";

/**
 * Absolute path to Castro's src/ directory.
 * Used in marker plugin to generate imports that point to live singleton modules.
 */
const CASTRO_SRC_DIR = resolve(
	dirname(import.meta.url.replace("file://", "")),
	"..",
);

/** Absolute path to marker.js — used by islandMarkerPlugin in generated code */
const MARKER_PATH = resolve(CASTRO_SRC_DIR, "islands/marker.js");

/**
 * Bun.build plugin that handles module resolution for page compilation.
 *
 * Two responsibilities:
 * 1. Externalizes imports to Castro's own src/ directory. These are generated
 *    by islandMarkerPlugin and must resolve to the LIVE singleton modules
 *    (same instances as the build process), not bundled copies.
 * 2. Externalizes all bare-specifier imports (npm packages like "preact").
 *    This replaces `packages: "external"` in the build config because that
 *    option takes priority over plugins and would prevent us from handling
 *    Castro internal imports.
 *
 * @type {Bun.BunPlugin}
 */
const resolveImportsPlugin = {
	name: "resolve-imports",
	setup(build) {
		// Externalize Castro internal imports (absolute paths to src/).
		// The islandMarkerPlugin generates these as absolute paths so Bun
		// preserves them as-is in the output (Bun keeps the original specifier
		// for external imports, so we must use the final path directly).
		build.onResolve({ filter: /.*/ }, (args) => {
			if (args.path.startsWith(CASTRO_SRC_DIR)) {
				return { path: args.path, external: true };
			}

			// Externalize bare specifiers (npm packages)
			// Bare specifiers don't start with . or /
			if (!args.path.startsWith(".") && !args.path.startsWith("/")) {
				return { path: args.path, external: true };
			}

			// Let Bun handle relative imports normally (bundle them)
			return undefined;
		});
	},
};

/**
 * Bun.build plugin that replaces .island.tsx imports with marker components.
 *
 * When a page imports a .island.tsx file, instead of loading the real component
 * source (which may use a different framework's JSX), we return a lightweight
 * marker component. The marker handles SSR and hydration wrapping at render time.
 *
 * This is the build-time equivalent of the old options.vnode runtime hook,
 * but framework-agnostic: the page never sees the real island source.
 *
 * @type {Bun.BunPlugin}
 */
const islandMarkerPlugin = {
	name: "island-marker",
	setup(build) {
		build.onLoad({ filter: /\.island\.[jt]sx$/ }, async (args) => {
			const islandId = getIslandId(args.path);

			// Use absolute path to marker.js so Bun preserves it exactly in
			// the output. The resolveImportsPlugin externalizes paths under
			// CASTRO_SRC_DIR, ensuring the compiled page imports the live
			// singleton module rather than a bundled copy.
			return {
				contents: `
					import { createMarker } from "${MARKER_PATH}";
					export default createMarker("${islandId}");
				`,
				loader: "js",
			};
		});
	},
};

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for injection.
 * Uses the island marker plugin to replace .island.tsx imports with
 * marker components that handle SSR and hydration wrapping.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 */
export async function compileJSX(sourcePath) {
	// Ensure adapter is initialized (idempotent)
	await initAdapter();

	const adapter = getAdapter();
	const { jsx } = adapter.getBuildConfig();

	// Bun.build with onResolve plugins requires absolute entrypoint paths.
	// Relative paths silently produce zero outputs when plugins are active.
	const absolutePath = isAbsolute(sourcePath)
		? sourcePath
		: resolve(sourcePath);

	// Build configuration (Bun SSR at build time)
	// Note: we do NOT use packages: "external" here because it takes priority
	// over plugins and would swallow our Castro internal imports before
	// resolveImportsPlugin can handle them. Instead, resolveImportsPlugin
	// externalizes all bare specifiers (npm packages) for us.
	const result = await Bun.build({
		entrypoints: [absolutePath],
		target: "bun",
		format: "esm",
		jsx,
		loader: {
			".css": "css",
		},
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		plugins: [resolveImportsPlugin, islandMarkerPlugin],
	});

	if (!result.success) {
		const errors = result.logs.map((log) => log.message).join("\n");
		throw new Error(`Bundle failed for ${sourcePath}:\n${errors}`);
	}

	const jsFile = result.outputs.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputs.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new Error(messages.build.noJsOutput(sourcePath));
	}

	const jsText = await jsFile.text();

	return {
		module: await getModule(sourcePath, jsText),
		cssFiles, // For file writing
	};
}
