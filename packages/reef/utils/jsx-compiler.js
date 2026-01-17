import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

/**
 * Compile JSX/TSX to JavaScript using esbuild
 *
 * @param {string} sourcePath - Path to JSX/TSX source file
 * @param {string} outputPath - Path to write compiled JS
 *
 * @returns {Promise<any>} The imported module
 */
export async function compileJSX(sourcePath, outputPath) {
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

	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, result.outputFiles[0].text);

	const moduleUrl = `${pathToFileURL(outputPath).href}?t=${Date.now()}`;

	return await import(moduleUrl);
}
