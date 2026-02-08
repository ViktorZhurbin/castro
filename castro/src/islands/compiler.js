/**
 * Island Compiler
 *
 * Compiles island components for both client and server:
 * - Client: Bundled JS that runs in the browser
 * - Server: Code that runs at build time for SSR
 *
 * We compile twice because the environments differ:
 * - Browser needs bundled code with import map externals
 * - Bun needs unbundled code that can import packages
 */

import { basename, dirname, extname, resolve } from "node:path";
import { styleText } from "node:util";
import { FRAMEWORK } from "../constants.js";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";
import { FrameworkConfig } from "./framework-config.js";

/**
 * @import { IslandComponent } from "../types.d.ts"
 */

/**
 * Compile an island component for both client and SSR
 *
 * Handles hashing and file writing. The compiler generates hashed filenames
 * for cache busting and returns the actual public paths to use in HTML.
 *
 * @param {{ sourcePath: string, outputDir: string, publicDir: string }} params
 * @returns {Promise<IslandComponent>}
 */
export async function compileIsland({ sourcePath, outputDir, publicDir }) {
	try {
		// Compile SSR version first (runs at build time in Bun)
		const ssrCode = await compileIslandSSR({ sourcePath });

		if (!ssrCode) {
			throw new Error(messages.build.ssrCompileFailed(sourcePath));
		}

		// Use getModule to dynamically import the component
		const module = await getModule(sourcePath, ssrCode, "ssr");

		// Extract component name from the imported module
		const componentName = module.default?.name;

		// Validate that island has a default export with a name
		if (!module.default || !componentName) {
			const fileName = basename(sourcePath);
			throw new Error(messages.errors.islandDefaultExportMissing(fileName));
		}

		// Compile client version (runs in browser)
		const clientResult = await compileIslandClient({
			sourcePath,
			outputDir,
		});

		// Find the actual generated files (with hashes)
		const jsFile = clientResult.outputs.find((f) => f.path.endsWith(".js"));
		const cssFile = clientResult.outputs.find((f) => f.path.endsWith(".css"));

		if (!jsFile) {
			throw new Error(messages.build.noJsOutput(sourcePath));
		}

		// Construct public paths using the generated filenames
		// Normalize to forward slashes for cross-platform URL compatibility
		const publicJsPath = `${publicDir}/${basename(jsFile.path)}`.replaceAll(
			"\\",
			"/",
		);

		let publicCssPath;
		let cssContent = "";
		if (cssFile) {
			cssContent = await cssFile.text();
			publicCssPath = `${publicDir}/${basename(cssFile.path)}`.replaceAll(
				"\\",
				"/",
			);
		}

		return {
			ssrCode,
			sourcePath,
			publicJsPath,
			publicCssPath,
			cssContent,
			name: componentName,
		};
	} catch (err) {
		console.info(styleText("red", messages.build.islandFailed(err)));
		throw err;
	}
}

/**
 * Compile island for client-side execution
 *
 * Creates a module that exports a mounting function.
 * The mounting function handles hydration when called.
 * Outputs files with content hashes for cache busting.
 *
 * Uses the active framework's build configuration for JSX handling,
 * loaders, and plugins (e.g., Babel for Solid.js).
 *
 * @param {{ sourcePath: string, outputDir: string }} params
 * @returns {Promise<Bun.BuildOutput>}
 */
async function compileIslandClient({ sourcePath, outputDir }) {
	const config = FrameworkConfig[FRAMEWORK];
	if (!config) {
		throw new Error(
			`Unknown framework: ${FRAMEWORK}. Check constants.js FRAMEWORK setting.`,
		);
	}
	// Get clean name (e.g. "counter" from "counter.tsx")
	const componentName = basename(sourcePath, extname(sourcePath));

	// Create entry point that imports component and exports mounting function
	// The mounting function receives the container element and props from the
	// <castro-island> custom element, and performs framework-specific hydration
	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${config.hydrateFnBody}
		}
	`.trim();

	// Get framework-specific build config (may be async for Solid Babel plugin)
	const buildConfig = config.getBuildConfig();
	const resolvedBuildConfig =
		buildConfig instanceof Promise ? await buildConfig : buildConfig;

	// Virtual entry path must be absolute and in same directory as the island source
	// so relative imports resolve correctly (Bun.build files requires absolute paths)
	const virtualEntryPath = resolve(
		dirname(sourcePath),
		`${componentName}.virtual.js`,
	);

	// Build configuration for island client bundle (browser execution)
	const result = await Bun.build({
		entrypoints: [virtualEntryPath],
		// Virtual file system: maps the virtual entry path to its contents
		files: { [virtualEntryPath]: virtualEntry },
		outdir: outputDir, // Bun auto-writes to disk when outdir is set
		naming: { entry: `${componentName}-[hash].[ext]` },
		format: "esm", // Output ES modules (modern browsers support)
		target: "browser", // Browser target (supports modern JS features)
		define: {
			// makes sure we use production jsx transform
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
		loader: {
			".css": "css", // Extract CSS into separate files for <link> injection
		},
		...resolvedBuildConfig, // Framework-specific settings (JSX config, plugins, externals)
	});

	if (!result.success) {
		const errors = result.logs.map((log) => log.message).join("\n");
		throw new Error(`Client bundle failed for ${sourcePath}:\n${errors}`);
	}

	return result;
}

/**
 * Compile island for server-side rendering (Bun execution)
 *
 * SSR compilation differs from client:
 * - Target is Bun, not browser
 * - CSS imports are stubbed out (SSR doesn't need CSS files)
 * - Result is kept in memory, not written to disk
 * - Used only to generate static HTML at build time
 *
 * Uses framework-specific config with SSR=true flag for Babel transforms.
 *
 * @param {{ sourcePath: string }} params
 * @returns {Promise<string | undefined>} Compiled code or undefined if compilation failed
 */
async function compileIslandSSR({ sourcePath }) {
	const config = FrameworkConfig[FRAMEWORK];
	if (!config) {
		throw new Error(
			`Unknown framework: ${FRAMEWORK}. Check constants.js FRAMEWORK setting.`,
		);
	}

	// Get framework-specific build config (may be async for Solid Babel plugin)
	const buildConfig = config.getBuildConfig();
	const resolvedBuildConfig =
		buildConfig instanceof Promise ? await buildConfig : buildConfig;

	try {
		// CSS stub plugin - intercepts CSS imports and returns empty module.
		// Components often import CSS (e.g., import "./counter.css"), which
		// works in browsers but breaks during SSR. During SSR we only need
		// the HTML output, so we stub out CSS imports.
		/** @type {Bun.BunPlugin} */
		const cssStubPlugin = {
			name: "css-stub",
			setup(build) {
				build.onResolve({ filter: /\.css$/ }, () => ({
					path: "css-stub",
					namespace: "css-stub",
				}));

				build.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({
					contents: "export default {};",
					loader: "js",
				}));
			},
		};

		// Build configuration for island SSR (Bun execution at build time)
		const result = await Bun.build({
			entrypoints: [sourcePath],
			format: "esm", // Output ES modules
			target: "bun", // Bun target (this code runs at build time for SSR)
			define: {
				// makes sure we use production jsx transform
				"process.env.NODE_ENV": JSON.stringify("production"),
			},
			...resolvedBuildConfig, // Framework-specific settings (JSX config, plugins, externals)
			plugins: [
				...(resolvedBuildConfig.plugins || []), // Include framework plugins (e.g., Babel for Solid)
				cssStubPlugin, // Stub CSS imports
			],
		});

		if (!result.success) {
			const errors = result.logs.map((log) => log.message).join("\n");
			throw new Error(`SSR bundle failed for ${sourcePath}:\n${errors}`);
		}

		const output = result.outputs[0];
		return output ? await output.text() : "";
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.warn(
			styleText("yellow", messages.build.ssrSkipped(sourcePath, err.message)),
		);
	}
}
