import * as esbuild from "esbuild";
import { createTempPath, getModule } from "./tempDir.js";

/**
 * Compile JSX/TSX to JavaScript using esbuild
 *
 * @param {string} sourcePath
 *
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
