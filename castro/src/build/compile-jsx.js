/**
 * JSX Compiler
 *
 * Compiles JSX/TSX files to JavaScript using esbuild.
 * Used for both pages and layouts.
 *
 * Educational note: esbuild is blazingly fast because it's
 * written in Go. We use it for all compilation in Castro.
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
		write: false,
		outfile: outputPath,
		jsx: "automatic",
		jsxImportSource: "preact",
		bundle: true,
		packages: "external",
		format: "esm",
		target: "node22",
		logLevel: "warning",
	});

	return await getModule(sourcePath, result.outputFiles[0].text);
}
