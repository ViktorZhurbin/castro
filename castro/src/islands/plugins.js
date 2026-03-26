import { join } from "node:path";
import { userPlugins } from "../config.js";
import { OUTPUT_DIR } from "../constants.js";
import { registerFramework } from "./frameworkConfig.js";
import { BARE_JSX_RUNTIME } from "./frameworks/bare-jsx.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

// Register any frameworks provided by user plugins.
// Must happen before island discovery so framework configs are
// available when registry.js calls loadFrameworkConfig().
for (const plugin of userPlugins) {
	if (plugin.frameworkConfig) {
		registerFramework(plugin.frameworkConfig, plugin.name);
	}
}

/**
 * Internal plugins (islands) + user plugins (from castro.config.js).
 * Build pipeline and dev server iterate this merged list.
 * @type {CastroPlugin[]}
 */
const internalPlugins = [castroIslandRuntime(), bareRuntimePlugin()];
export const allPlugins = [...internalPlugins, ...userPlugins];

/**
 * Bundles the bare-jsx runtime into dist for browser loading.
 *
 * bare-jsx islands externalize their runtime imports (signals, h, Fragment)
 * and resolve them via import map → /bare-jsx.{version}.js. Only writes
 * when at least one page actually used a bare-jsx island.
 *
 * @returns {CastroPlugin}
 */
function bareRuntimePlugin() {
	return {
		name: "bare-jsx-runtime",

		async onAfterBuild({ usedFrameworks }) {
			if (!usedFrameworks.has("bare-jsx")) return;

			const entrypoint = join(
				import.meta.dir,
				"..",
				"..",
				"runtime",
				"jsx",
				"dom",
				"index.js",
			);

			const result = await Bun.build({
				entrypoints: [entrypoint],
				format: "esm",
				target: "browser",
				minify: true,
			});

			if (result.success && result.outputs[0]) {
				await Bun.write(join(OUTPUT_DIR, BARE_JSX_RUNTIME), result.outputs[0]);
			}
		},
	};
}

/**
 * Copies the <castro-island> custom element runtime to dist.
 * Only writes when at least one page needs client-side hydration.
 *
 * @returns {CastroPlugin}
 */
function castroIslandRuntime() {
	return {
		name: "castro-island-runtime",

		getPageAssets(params = {}) {
			if (params.needsHydration) {
				return [
					{
						tag: "script",
						attrs: { type: "module", src: "/castro-island.js" },
					},
				];
			}

			return [];
		},

		async onAfterBuild({ needsHydration }) {
			if (!needsHydration) return;

			await Bun.write(
				join(OUTPUT_DIR, "castro-island.js"),
				Bun.file(join(import.meta.dir, "./hydration.js")),
			);
		},
	};
}
