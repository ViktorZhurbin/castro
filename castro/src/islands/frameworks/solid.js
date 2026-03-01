/**
 * Solid Framework Configuration
 *
 * Dynamically imported by framework-config.js when a Solid island is
 * discovered. Bun has no native Solid JSX support, so we use Babel
 * with babel-preset-solid to transform JSX at build time.
 *
 * The Babel transform differs between client and SSR:
 * - Client ("dom"): generates fine-grained reactive DOM operations
 * - SSR ("ssr"): generates string concatenation for renderToString
 */

import * as babel from "@babel/core";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import { generateHydrationScript, renderToString } from "solid-js/web";

/**
 * @import { FrameworkConfig } from "./types.d.ts"
 */

/**
 * Bun.build plugin that transforms Solid JSX via Babel.
 *
 * Babel and its presets are lazy-imported on first use so the cost
 * is only paid when a Solid island actually needs compilation.
 *
 * @param {"dom" | "ssr"} generate - Solid output mode
 * @returns {Bun.BunPlugin}
 */
function solidBabelPlugin(generate) {
	return {
		name: "solid-babel",
		setup(build) {
			build.onLoad({ filter: /\.[jt]sx$/ }, async ({ path }) => {
				/** @type {import("@babel/core").PluginItem[]} */
				const presets = [
					[solidPreset, { generate, hydratable: true }],
					[tsPreset],
				];

				const source = await Bun.file(path).text();
				const result = await babel.transformAsync(source, {
					filename: path,
					presets,
				});

				return { contents: result?.code ?? "", loader: "js" };
			});
		},
	};
}

/** @type {FrameworkConfig} */
export default {
	id: "solid",

	getBuildConfig: (target) => ({
		plugins: [solidBabelPlugin(target ?? "dom")],
		external: ["solid-js", "solid-js/web"],
	}),

	headAssets: [generateHydrationScript()],

	importMap: {
		"solid-js": "https://esm.sh/solid-js",
		"solid-js/web": "https://esm.sh/solid-js/web",
	},

	hydrateFnString: `
		const { hydrate } = await import("solid-js/web");
		hydrate(() => Component(props), container);
	`,

	renderSSR: (Component, props) => renderToString(() => Component(props)),
};
