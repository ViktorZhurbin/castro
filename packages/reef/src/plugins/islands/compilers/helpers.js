import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";

/**
 * Creates virtual entry that exports the component
 */
export function createVirtualEntry(sourcePath) {
	return `
import Component from './${basename(sourcePath)}';
export default Component;
`.trim();
}

/**
 * Base esbuild config shared by all frameworks
 */
export const baseBuildConfig = {
	bundle: true,
	format: "esm",
	target: "es2020",
	write: false,
	logLevel: "warning",
};

/**
 * Compiles island with framework-specific esbuild config
 */
export async function compileIslandWithConfig({
	sourcePath,
	outputPath,
	frameworkConfig,
}) {
	const virtualEntry = createVirtualEntry(sourcePath);

	try {
		const result = await esbuild.build({
			stdin: {
				contents: virtualEntry,
				resolveDir: dirname(sourcePath),
				loader: "js",
			},
			...baseBuildConfig,
			outfile: outputPath,
			...frameworkConfig,
		});

		return writeBuildOutput(result, outputPath);
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
	}
}

async function writeBuildOutput(result, outputPath) {
	let cssOutputPath = null;

	// Write all output files (JS and potential CSS)
	if (result.outputFiles) {
		await mkdir(dirname(outputPath), { recursive: true });

		for (const file of result.outputFiles) {
			await writeFile(file.path, file.text);

			if (file.path.endsWith(".css")) {
				cssOutputPath = file.path;
			}
		}
	}

	return { cssOutputPath };
}
