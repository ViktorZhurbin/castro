import { dirname, resolve } from "node:path";
import * as esbuild from "esbuild";
import { messages } from "../messages/index.js";
import { createTempPath, getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";

/**
 * esbuild plugin to tag island components with their source path ID.
 *
 * Uses the "Proxy Module" pattern:
 * - Intercepts imports to islands/
 * - Returns a virtual module that imports the real component
 * - Attaches .islandId property to the default export
 * - Re-exports both default and named exports
 *
 * @type {esbuild.Plugin}
 */
const islandTaggingPlugin = {
	name: "island-tagging",
	setup(build) {
		// 1. Intercept imports to islands
		build.onResolve({ filter: /\/islands\/.*\.[jt]sx$/ }, (args) => {
			// If we're already in the proxy namespace, let the import through naturally.
			// This prevents infinite loops regardless of importer location.
			if (args.namespace === "island-proxy") {
				return null; // Let esbuild resolve naturally
			}

			// Otherwise, hijack the import and send to proxy namespace
			return {
				path: resolve(args.resolveDir, args.path),
				namespace: "island-proxy",
			};
		});

		// 2. Serve the proxy module
		build.onLoad({ filter: /.*/, namespace: "island-proxy" }, (args) => {
			const sourcePath = args.path;
			const islandId = getIslandId(sourcePath);
			const importPath = sourcePath.replaceAll("\\", "/");

			return {
				resolveDir: dirname(sourcePath), // Needed for esbuild to resolve imports in the proxy

				contents: `
					import DefaultComponent from "${importPath}";

					// 1. Tag the default export (if it exists)
					if (DefaultComponent) {
						DefaultComponent.islandId = "${islandId}";
					}

					// 2. Re-export named exports directly
					export * from "${importPath}";

					// 3. Re-export the tagged default
					export default DefaultComponent;
				`,

				loader: "js", // Proxy is always JS (esbuild will parse JSX if needed)
			};
		});
	},
};

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * Also extracts any imported CSS files for injection.
 * Uses the island-tagging plugin to inject component IDs.
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 * @returns {Promise<{ module: any, cssFiles: esbuild.OutputFile[] }>}
 */
export async function compileJSX(sourcePath) {
	const outputPath = createTempPath(sourcePath);

	// Build configuration (Node.js SSR at build time)
	const result = await esbuild.build({
		entryPoints: [sourcePath],
		write: false, // Keep output in memory for immediate execution
		outfile: outputPath,
		jsx: "automatic", // Use new JSX transform (no need to import h)
		jsxImportSource: "preact", // Auto-import JSX runtime from preact
		bundle: true, // Resolve all imports to single output
		packages: "external", // Don't bundle node_modules (keep as imports for Node.js)
		format: "esm", // Output ES modules
		target: "node22", // Node.js target (this code runs at build time, not in browser)
		logLevel: "warning",
		loader: {
			".css": "css", // Extract CSS into separate files for injection
		},
		plugins: [islandTaggingPlugin], // Inject island IDs during import
	});

	// Separate JS and CSS output files
	const jsFile = result.outputFiles.find((f) => f.path.endsWith(".js"));
	const cssFiles = result.outputFiles.filter((f) => f.path.endsWith(".css"));

	if (!jsFile) {
		throw new Error(messages.build.noJsOutput(sourcePath));
	}

	return {
		module: await getModule(sourcePath, jsFile.text),
		cssFiles, // For file writing
	};
}
