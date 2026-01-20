import { dirname } from "node:path";
import * as esbuild from "esbuild";
import { FrameworkConfig } from "../framework-config.js";
import { CLIENT_RUNTIME_ALIAS } from "../reef-island/plugin.js";
import { createMountingEntry } from "./create-mounting-entry.js";

/**
 * @import { BuildResult } from "esbuild"
 * @import { SupportedFramework } from "../../../types/island.js"
 */

/**
 * @param {Object} params
 * @param {string} params.sourcePath
 * @param {string} params.outputPath
 * @param {SupportedFramework} params.framework
 *
 * @returns {Promise<BuildResult>}
 */
export async function compileIslandClient({
	sourcePath,
	outputPath,
	framework,
}) {
	const config = FrameworkConfig[framework];
	const entry = createMountingEntry(sourcePath, framework);
	const pluginConfig = config.getBuildConfig();

	const result = await esbuild.build({
		stdin: {
			contents: entry,
			resolveDir: dirname(sourcePath),
			loader: "js",
		},
		outfile: outputPath,
		bundle: true,
		format: "esm",
		target: "es2020",
		write: false,
		...pluginConfig,
		external: [...(pluginConfig.external ?? []), CLIENT_RUNTIME_ALIAS],
	});

	return result;
}
