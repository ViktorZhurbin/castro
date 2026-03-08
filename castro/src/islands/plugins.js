import { join } from "node:path";
import { userPlugins } from "../config.js";
import { OUTPUT_DIR } from "../constants.js";
import { registerFramework } from "./framework-config.js";
import { islands } from "./registry.js";

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
const internalPlugins = [castroIslandRuntime(), preactIslands()];
export const allPlugins = [...internalPlugins, ...userPlugins];

/**
 * Plugin that discovers and compiles Preact island components
 * @returns {CastroPlugin}
 */

function preactIslands() {
	return {
		name: "islands-preact",

		/**
		 * Build hook: discover, compile, and load islands into registry
		 */
		async onPageBuild() {
			await islands.load();
		},
	};
}

/**
 * Loads the <castro-island> custom element runtime (client-side)
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

		async onPageBuild() {
			// Copy runtime file to dist (Bun.write auto-creates directories)
			const source = Bun.file(join(import.meta.dir, "./hydration.js"));
			const destPath = join(OUTPUT_DIR, "castro-island.js");

			await Bun.write(destPath, source);
		},
	};
}
