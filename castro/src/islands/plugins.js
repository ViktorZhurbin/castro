import { join } from "node:path";
import { FRAMEWORK, ISLANDS_DIR, OUTPUT_DIR } from "../constants.js";
import { FrameworkConfig } from "./framework-config.js";
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
 * Plugin that discovers and compiles island components for the active framework
 * @returns {CastroPlugin}
 */

function frameworkIslands() {
	return {
		name: `islands-${FRAMEWORK}`,

		// Watch islands directory for changes in dev mode
		watchDirs: [ISLANDS_DIR],

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

			// Get the active framework's import map
			const config = FrameworkConfig[FRAMEWORK];
			return config?.importMap ?? null;
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
			// Copy hydration.js runtime file to dist
			// The file is framework-agnostic because framework-specific hydration
			// is baked into each island's mounting function during compilation
			const source = Bun.file(join(import.meta.dir, "./hydration.js"));
			const destPath = join(OUTPUT_DIR, "castro-island.js");

			await Bun.write(destPath, source);
		},
	};
}
