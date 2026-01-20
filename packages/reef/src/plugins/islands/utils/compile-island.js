import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { compileIslandClient } from "./compile-island-client.js";
import { compileIslandSSR } from "./compile-island-ssr.js";

/**
 * @import { SupportedFramework } from '../../../types/island.js';
 */

/**
 * Compiles client and SSR versions of an island
 *
 * @param {Object} params
 * @param {string} params.sourcePath
 * @param {string} params.outputPath
 * @param {SupportedFramework} params.framework
 */
export async function compileIsland({ sourcePath, outputPath, framework }) {
	try {
		// Compile client version
		const clientBuildResult = await compileIslandClient({
			sourcePath,
			outputPath,
			framework,
		});

		// Compile SSR version (pure component for Node.js)
		const ssrCode = await compileIslandSSR({ sourcePath, framework });

		const { cssOutputPath } = await writeBuildOutput(
			clientBuildResult,
			outputPath,
		);

		return {
			ssrCode,
			cssOutputPath,
		};
	} catch (err) {
		console.info(styleText("red", "Island build failed: "), err);
	}
}

/**
 * @param {Partial<esbuild.BuildResult>} result
 * @param {string} outputPath
 */
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
