/**
 * @import { SupportedFramework, IslandPluginConfig } from "../../types/island.js";
 */

import { getSolidBabelPlugin } from "./solid/babel-plugin.js";

/**
 * @type {Record<SupportedFramework, IslandPluginConfig>}
 */
export const FrameworkConfig = {
	solid: {
		framework: "solid",
		defaultDir: "islands-solid",
		elementSuffix: "-solid",
		getBuildConfig: (ssr) => ({
			plugins: [getSolidBabelPlugin(ssr)],
			external: ["solid-js", "solid-js/web"],
		}),
		importMap: {
			"solid-js": "https://esm.sh/solid-js",
			"solid-js/web": "https://esm.sh/solid-js/web",
		},
	},

	preact: {
		framework: "preact",
		defaultDir: "islands-preact",
		elementSuffix: "-preact",
		getBuildConfig: () => ({
			jsx: "automatic",
			jsxImportSource: "preact",
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		}),
		importMap: {
			preact: "https://esm.sh/preact",
			"preact/hooks": "https://esm.sh/preact/hooks",
			"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
		},
	},
};
