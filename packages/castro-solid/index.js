/**
 * castro-solid Plugin for Castro
 *
 * Solid.js framework support for Castro islands.
 * Bun has no native Solid JSX support, so we use Babel with babel-preset-solid
 * to transform JSX at build time. The Babel transform is build-time-only;
 * client bundles don't include it.
 *
 * Legacy: this targets Castro's removed plugin API — core no longer loads
 * plugins or registers extra frameworks. Kept for reference only.
 */

import * as babel from "@babel/core";
import tsPreset from "@babel/preset-typescript";
import solidPreset from "babel-preset-solid";
import { generateHydrationScript, renderToString } from "solid-js/web";

/**
 * The framework-config contract the removed plugin API consumed, inlined
 * here since core no longer exports it.
 *
 * @typedef {{
 *  id: string,
 *  getBuildConfig: (target?: string) => object,
 *  clientDependencies: string[],
 *  detectImports: string[],
 *  headAssets?: string[],
 *  hydrateClientPath: string,
 *  renderSSR: (Component: (props: object) => unknown, props: Record<string, unknown>) => string,
 * }} FrameworkConfig
 */

/**
 * Bun.build plugin that transforms Solid JSX via Babel.
 *
 * Babel and its presets are lazy-imported on first use so the cost
 * is only paid when a Solid island actually needs compilation.
 *
 * The Babel transform differs between client and SSR:
 * - Client ("dom"): generates fine-grained reactive DOM operations
 * - SSR ("ssr"): generates string concatenation for renderToString
 *
 * @param {"dom" | "ssr"} generate - Solid output mode
 * @returns {import("bun").BunPlugin}
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
const frameworkConfig = {
	id: "solid",

	getBuildConfig: (target) => ({
		plugins: [solidBabelPlugin(target ?? "dom")],
	}),

	headAssets: [generateHydrationScript()],

	clientDependencies: ["solid-js", "solid-js/web"],

	detectImports: ["solid-js"],

	hydrateClientPath: new URL("./hydrate.client.js", import.meta.url).pathname,

	renderSSR: (Component, props) => renderToString(() => Component(props)),
};

/**
 * Register the Solid framework.
 *
 * @returns {{ name: string, frameworkConfig: FrameworkConfig }}
 */
export function castroSolid() {
	return {
		name: "castro-solid",
		frameworkConfig,
	};
}
