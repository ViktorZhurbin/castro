import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ISLANDS_DIR, OUTPUT_DIR } from "../constants.js";
import { FrameworkConfig } from "./framework-config.js";
import { islands } from "./registry.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

/**
 * Default plugins - the minimal set needed for islands to work
 * @type {CastroPlugin[]}
 */
export const defaultPlugins = [castroIslandRuntime(), preactIslands()];

/**
 * Plugin that discovers and compiles Preact island components
 * @returns {CastroPlugin}
 */

export function preactIslands() {
	return {
		name: "islands-preact",

		// Watch islands directory for changes in dev mode
		watchDirs: [ISLANDS_DIR],

		/**
		 * Build hook: discover, compile, and load islands into registry
		 */
		async onBuild() {
			await islands.load();
		},

		/**
		 * Return import map (CDN URLs) for Preact runtime
		 */
		getImportMap() {
			if (islands.getAll().size === 0) return null;

			return FrameworkConfig.preact.importMap;
		},
	};
}

/**
 * Loads the <castro-island> custom element runtime (client-side)
 * @returns {CastroPlugin}
 */

export function castroIslandRuntime() {
	return {
		name: "castro-island-runtime",

		getAssets() {
			return [
				{
					tag: "script",
					attrs: { type: "module", src: "/castro-island.js" },
				},
			];
		},

		async onBuild() {
			await mkdir(dirname(OUTPUT_DIR), { recursive: true });

			// Copy runtime file to dist
			await copyFile(
				join(import.meta.dirname, "./hydration.js"),
				join(OUTPUT_DIR, "castro-island.js"),
			);
		},
	};
}
