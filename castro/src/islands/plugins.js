import { join } from "node:path";
import { OUTPUT_DIR } from "../constants.js";
import { getAdapter } from "./adapter.js";
import { islands } from "./registry.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

/**
 * Default plugins - the minimal set needed for islands to work
 * @type {CastroPlugin[]}
 */
export const defaultPlugins = [castroIslandRuntime(), frameworkIslands()];

/**
 * Plugin that discovers and compiles island components.
 * Framework-agnostic — uses the configured adapter.
 * @returns {CastroPlugin}
 */
function frameworkIslands() {
	return {
		name: "islands-framework",

		/**
		 * Build hook: discover, compile, and load islands into registry
		 */
		async onBuild() {
			await islands.load();
		},

		/**
		 * Return import map (CDN URLs) for the active framework runtime
		 */
		getImportMap() {
			if (islands.getAll().size === 0) return null;
			return getAdapter().importMap;
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

		getAssets() {
			return [
				{
					tag: "script",
					attrs: { type: "module", src: "/castro-island.js" },
				},
			];
		},

		async onBuild() {
			// Copy runtime file to dist (Bun.write auto-creates directories)
			const source = Bun.file(join(import.meta.dir, "./hydration.js"));
			const destPath = join(OUTPUT_DIR, "castro-island.js");

			await Bun.write(destPath, source);
		},
	};
}
