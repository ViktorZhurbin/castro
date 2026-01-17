import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Writes esbuild output files to disk and returns the CSS path if generated
 * @param {import('esbuild').BuildResult} result
 * @param {string} outputPath
 * @returns {Promise<{cssOutputPath: string | null}>} The path to the generated CSS file, or null
 */
export async function writeBuildOutput(result, outputPath) {
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
