import { compileIsland } from "../utils/compile-island.js";
import { createIslandPlugin } from "../utils/create-island-plugin.js";

/**
 * Reef Islands Preact Plugin
 * Enables interactive islands architecture with Preact JSX components
 */
export const preactIslands = createIslandPlugin({
	framework: "preact",
	defaultDir: "islands-preact",
	elementSuffix: "-preact",
	compilerFn: compilePreactIsland,
	importMap: {
		preact: "https://cdn.jsdelivr.net/npm/preact@10.28.2/+esm",
		"preact/hooks": "https://cdn.jsdelivr.net/npm/preact@10.28.2/hooks/+esm",
		"preact/jsx-runtime":
			"https://cdn.jsdelivr.net/npm/preact@10.28.2/jsx-runtime/+esm",
	},
});

async function compilePreactIsland({ sourcePath, outputPath }) {
	return compileIsland({
		sourcePath,
		outputPath,
		framework: "preact",
		getBuildConfig: () => ({
			jsx: "automatic",
			jsxImportSource: "preact",
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		}),
	});
}
