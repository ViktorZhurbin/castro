import { join } from "node:path";
import { userPlugins } from "../config.js";
import { OUTPUT_DIR } from "../constants.js";
import { registerFramework } from "./frameworkConfig.js";

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
const internalPlugins = [castroIslandRuntime()];
export const allPlugins = [...internalPlugins, ...userPlugins];

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
			if (params.hasIslands) {
				return [
					{
						tag: "script",
						attrs: { type: "module", src: "/castro-island.js" },
					},
				];
			}

			return [];
		},

		async onAfterBuild({ usedFrameworks }) {
			if (!usedFrameworks.size) return;

			await Bun.write(
				join(OUTPUT_DIR, "castro-island.js"),
				Bun.file(join(import.meta.dir, "./hydration.js")),
			);
		},
	};
}
