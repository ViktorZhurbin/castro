/**
 * JSX Compiler
 *
 * Compiles JSX/TSX files to JavaScript using esbuild.
 * Used for pages and layouts at build time.
 *
 * esbuild is very fast and handles:
 * - JSX/TSX transpilation
 * - TypeScript type stripping (types removed, not checked)
 * - Module bundling
 */

import * as esbuild from "esbuild";
import { createTempPath, getModule } from "../config.js";

/**
 * Compile JSX/TSX to JavaScript and import the module
 *
 * @param {string} sourcePath - Path to JSX/TSX file
 * @returns {Promise<any>} The imported module
 */
export async function compileJSX(sourcePath) {
	const outputPath = createTempPath(sourcePath);

	const result = await esbuild.build({
		entryPoints: [sourcePath],
		write: false, // Keep output in memory, don't write to disk
		outfile: outputPath,
		jsx: "automatic", // Use new JSX transform (no need to import h)
		jsxImportSource: "preact", // Auto-import JSX runtime from preact
		bundle: true, // Include all imports in output
		packages: "external", // Don't bundle node_modules, keep as imports
		format: "esm", // Output ES modules
		target: "node22", // We're running this in Node.js, not browser
		logLevel: "warning",
	});

	return await getModule(sourcePath, result.outputFiles[0].text);
}
