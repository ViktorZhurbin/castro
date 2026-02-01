import { dirname, resolve } from "node:path";
import { getIslandId } from "../../utils/ids.js";

/**
 * esbuild plugin to tag island components with their source path ID.
 *
 * Uses the "Proxy Module" pattern:
 * - Intercepts imports to islands/
 * - Returns a virtual module that imports the real component
 * - Attaches .islandId property to the default export
 * - Re-exports both default and named exports
 *
 * @type {import('esbuild').Plugin}
 */
export const islandTaggingPlugin = {
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
			// Use utility to generate ID (matches registry.js)
			const id = getIslandId(sourcePath);
			const importPath = sourcePath.replaceAll("\\", "/"); // JS strings need forward slashes

			return {
				resolveDir: dirname(sourcePath), // Needed for esbuild to resolve imports in the proxy
				// Cleaner proxy content:
				// 1. No unused imports
				// 2. Clear structure with numbered steps
				contents: `
					import DefaultComponent from "${importPath}";

					// 1. Tag the default export (if it exists)
					if (DefaultComponent) {
						DefaultComponent.islandId = "${id}";
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
