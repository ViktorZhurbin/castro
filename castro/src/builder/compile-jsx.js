import { dirname, resolve } from "node:path";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";

// Absolute path to Castro internals for the generated code imports
const CASTRO_SRC = resolve(dirname(import.meta.path), "..");

/**
 * Generates the source code for a Marker Component.
 *
 * @param {string} islandId - The unique ID (e.g., "src/islands/Counter.tsx")
 * @returns {string} JavaScript code that exports a marker component function
 */
function generateMarkerCode(islandId) {
	// Import the real marker implementation from marker.js
	// This keeps the logic in a real file that can be linted, debugged, and type-checked
	const MARKER_PATH = resolve(CASTRO_SRC, "islands/marker.js");

	// JSON.stringify ensures proper escaping of special chars in islandId
	return `
    import { renderMarker } from "${MARKER_PATH}";
    export default (props) => renderMarker(${JSON.stringify(islandId)}, props);
  `.trim();
}

/**
 * Plugin to replace .island.tsx imports with the Marker Code above
 * @type {Bun.BunPlugin}
 */
const islandMarkerPlugin = {
	name: "island-marker",
	setup(build) {
		build.onLoad({ filter: /\.island\.[jt]sx$/ }, (args) => {
			const islandId = getIslandId(args.path);

			const code = generateMarkerCode(islandId);

			return {
				contents: code,
				loader: "js",
			};
		});
	},
};

/**
 * Plugin to control module resolution during page compilation.
 *
 * When Bun.build compiles a page, it encounters imports from three sources.
 * This plugin classifies each import and decides whether to bundle it or
 * leave it as an external reference (resolved at runtime by Bun):
 *
 * 1. Castro internals (marker.js, registry.js, framework-config.js)
 *    → External. Must share the same singleton instances as the build process.
 *    If bundled, each page would get its own copy of the registry, breaking
 *    island usage tracking and CSS injection.
 *
 * 2. Bare specifiers ("preact", "preact/hooks", etc.)
 *    → External. Node module imports resolved by Bun at runtime, not bundled.
 *
 * 3. Relative imports ("./components/Button.jsx", "../Footer.tsx")
 *    → Bundled. User components that should be inlined into the page.
 *
 * @type {Bun.BunPlugin}
 */
const resolveImportsPlugin = {
	name: "resolve-imports",

	setup(build) {
		// The filter (/.*/) intercepts ALL module resolution requests.
		// We return early for externals; anything else falls through to
		// Bun's default bundling behavior.
		build.onResolve({ filter: /.*/ }, (args) => {
			// Castro internals → external (singleton sharing)
			if (args.path.startsWith(CASTRO_SRC)) {
				return { path: args.path, external: true };
			}

			// Bare specifiers (no "." or "/" prefix) → external (node_modules)
			if (!args.path.startsWith(".") && !args.path.startsWith("/")) {
				return { path: args.path, external: true };
			}

			// Relative/absolute imports → no return → bundled by Bun
		});
	},
};

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for injection.
 * Uses the island-marker plugin to replace island imports with marker components.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 */
export async function compileJSX(sourcePath) {
	// Build configuration
	// Bun.build requires absolute entrypoints when using onResolve plugins
	const absoluteSourcePath = resolve(sourcePath);

	const result = await Bun.build({
		entrypoints: [absoluteSourcePath],
		target: "bun",
		format: "esm",
		// Pages and layouts compile to Preact VNodes (not HTML strings directly).
		// The final renderToString() call in render-page.js converts the complete
		// VNode tree to HTML in one pass. This is a build-time convenience —
		// Preact is NOT shipped to the browser for static pages.
		jsx: { runtime: "automatic", importSource: "preact" },
		loader: {
			".css": "css",
		},
		define: {
			// makes sure we use production mode for SSG
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
		cssFiles,
	};
}
