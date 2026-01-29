/**
 * Island Compiler
 *
 * Compiles island components for both client and server:
 * - Client: Bundled JS that runs in the browser
 * - Server: Code that runs at build time for SSR
 *
 * We compile twice because the environments differ:
 * - Browser needs bundled code with import map externals
 * - Node.js needs unbundled code that can import packages
 */

import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { getModule } from "../config.js";
import { PreactConfig } from "./preact-config.js";

/**
 * @import { IslandComponent } from "../types.d.ts"
 */

/**
 * Compile an island component for both client and SSR
 *
 * Centralizes all path logic - takes filesystem paths, returns public HTTP paths.
 *
 * @param {{ sourcePath: string, outputPath: string, publicPath: string }} params
 * @returns {Promise<IslandComponent>}
 */
export async function compileIsland({ sourcePath, outputPath, publicPath }) {
	try {
		// Compile SSR version first (runs at build time in Node.js)
		const ssrCode = await compileIslandSSR({ sourcePath });

		if (!ssrCode) {
			throw new Error(`Failed to compile SSR code for ${sourcePath}`);
		}

		// Use getModule to dynamically import the component
		const module = await getModule(sourcePath, ssrCode, "ssr");

		// Extract component name from the imported module
		const componentName = module.default?.name;

		// Validate that island has a default export with a name
		if (!module.default || !componentName) {
			const fileName = basename(sourcePath);
			throw new Error(
				`\n❌ Island "${fileName}" must have a default export.\n\n` +
					`Example:\n` +
					`  ${styleText("cyan", `export default function MyComponent(props) {`)}\n` +
					`  ${styleText("cyan", "  return <div>...</div>;")}\n` +
					`  ${styleText("cyan", "}")}\n`,
			);
		}

		// Compile client version (runs in browser)
		const clientBuildResult = await compileIslandClient({
			sourcePath,
			outputPath,
		});

		// Write files and construct public paths
		let publicCssPath;

		if (clientBuildResult.outputFiles) {
			await mkdir(dirname(outputPath), { recursive: true });

			for (const file of clientBuildResult.outputFiles) {
				// Write to disk
				await writeFile(file.path, file.text);

				// Track CSS file for public path
				if (file.path.endsWith(".css")) {
					const cssFileName = basename(file.path);
					publicCssPath = `/${dirname(publicPath)}/${cssFileName}`.replace(
						/\/+/g,
						"/",
					);
				}
			}
		}

		return {
			ssrCode,
			sourcePath,
			publicJsPath: publicPath,
			publicCssPath,
			name: componentName,
		};
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
		throw err;
	}
}

/**
 * Compile island for client-side execution
 *
 * Creates a module that exports a mounting function.
 * The mounting function handles hydration when called.
 *
 * @param {{ sourcePath: string, outputPath: string }} params
 * @returns {Promise<esbuild.BuildResult>}
 */
async function compileIslandClient({ sourcePath, outputPath }) {
	const config = PreactConfig;

	// Create entry point that imports component and exports mounting function
	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${PreactConfig.hydrateFnString}
		}
	`.trim();

	const buildConfig = config.getBuildConfig();

	// Build configuration for island client bundle (browser execution)
	const result = await esbuild.build({
		stdin: {
			contents: virtualEntry, // Use generated mounting code as entry (not a file)
			resolveDir: dirname(sourcePath),
			loader: "js",
		},
		outfile: outputPath,
		bundle: true, // Bundle all dependencies into single browser-ready file
		format: "esm", // Output ES modules (modern browsers support)
		target: "es2020", // Browser target (supports modern JS features)
		write: false, // Keep output in memory for processing
		loader: {
			".css": "css", // Extract CSS into separate files for <link> injection
		},
		...buildConfig, // Framework-specific settings (JSX config, etc.)
	});

	return result;
}

/**
 * Compile island for server-side rendering (Node.js execution)
 *
 * SSR compilation differs from client:
 * - Target is Node.js, not browser
 * - CSS imports are stubbed out (Node can't import CSS files)
 * - Result is kept in memory, not written to disk
 * - Used only to generate static HTML at build time
 *
 * @param {{ sourcePath: string }} params
 * @returns {Promise<string | undefined>} Compiled code or undefined if compilation failed
 */
async function compileIslandSSR({ sourcePath }) {
	const config = PreactConfig;
	const buildConfig = config.getBuildConfig();

	try {
		// CSS stub plugin - intercepts CSS imports and returns empty module.
		// Components often import CSS (e.g., import "./counter.css"), which
		// works in browsers but breaks in Node.js. During SSR we only need
		// the HTML output, so we stub out CSS imports.
		/** @type {esbuild.Plugin} */
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

		// Build configuration for island SSR (Node.js execution at build time)
		const result = await esbuild.build({
			entryPoints: [sourcePath],
			bundle: true, // Bundle component and dependencies for execution
			format: "esm", // Output ES modules
			platform: "node", // Node.js platform (enables Node-specific optimizations)
			target: "node22", // Node.js target (this code runs at build time for SSR)
			write: false, // Keep output in memory for immediate execution
			...buildConfig, // Framework-specific settings (JSX config, etc.)
			plugins: [...(buildConfig.plugins ?? []), cssStubPlugin], // Stub CSS imports
		});

		return result.outputFiles?.[0].text || "";
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		console.warn(
			styleText("yellow", `SSR compilation skipped for ${sourcePath}:`),
			err.message,
		);
	}
}
