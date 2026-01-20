import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { styleText } from "node:util";
import * as esbuild from "esbuild";
import { compileIslandSSR } from "./compile-island-ssr.js";
import { createMountingEntry } from "./create-mounting-entry.js";

/**
 * @import { SupportedFramework } from '../../../types/island.js';
 */

/**
 * Base esbuild config shared by all frameworks
 * @type { Partial<esbuild.BuildOptions> }
 */
const baseBuildConfig = {
	bundle: true,
	format: "esm",
	target: "es2020",
	write: false,
	logLevel: "warning",
};

/**
 * Compiles island with framework-specific esbuild config
 * Compiles both client and SSR versions
 *
 * @param {Object} params
 * @param {string} params.sourcePath
 * @param {string} params.outputPath
 * @param {SupportedFramework} params.framework
 * @param {(ssr?: boolean) => Partial<esbuild.BuildOptions>} params.getBuildConfig
 */
export async function compileIsland({
	sourcePath,
	outputPath,
	framework,
	getBuildConfig,
}) {
	const entry = createMountingEntry(sourcePath, framework);

	try {
		// Compile client version (with mounting logic)
		const result = await esbuild.build({
			stdin: {
				contents: entry,
				resolveDir: dirname(sourcePath),
				loader: "js",
			},
			outfile: outputPath,
			...baseBuildConfig,
			...getBuildConfig(),
		});

		const output = await writeBuildOutput(result, outputPath);

		// Compile SSR version (pure component for Node.js)
		const ssrCode = await compileIslandSSR({
			sourcePath,
			framework,
			buildConfig: getBuildConfig(true),
		});

		return {
			...output,
			ssrCode,
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
	let jsOutputPath = null;

	// Write all output files (JS and potential CSS)
	if (result.outputFiles) {
		await mkdir(dirname(outputPath), { recursive: true });

		for (const file of result.outputFiles) {
			await writeFile(file.path, file.text);

			if (file.path.endsWith(".css")) {
				cssOutputPath = file.path;
			} else if (file.path.endsWith(".js")) {
				jsOutputPath = file.path;
			}
		}
	}

	return { cssOutputPath, jsOutputPath };
}
