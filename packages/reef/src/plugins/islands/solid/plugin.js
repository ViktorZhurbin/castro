import { compileIsland } from "../utils/compile-island.js";
import { createIslandPlugin } from "../utils/create-island-plugin.js";
import { getSolidBabelPlugin } from "./babel-plugin.js";

/**
 * Reef Islands Solid Plugin
 * Enables interactive islands architecture with Solid JSX components
 */
export const solidIslands = createIslandPlugin({
	framework: "solid",
	defaultDir: "islands-solid",
	elementSuffix: "-solid",
	compilerFn: compileSolidIsland,
	importMap: {
		"solid-js": "https://esm.sh/solid-js",
		"solid-js/web": "https://esm.sh/solid-js/web",
	},
});

async function compileSolidIsland({ sourcePath, outputPath }) {
	return compileIsland({
		sourcePath,
		outputPath,
		framework: "solid",
		getBuildConfig: (ssr) => ({
			plugins: [getSolidBabelPlugin(ssr)],
			external: ["solid-js", "solid-js/web"],
		}),
	});
}
