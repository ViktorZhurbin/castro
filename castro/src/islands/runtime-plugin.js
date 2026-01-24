/**
 * Castro Island Runtime Plugin
 *
 * Loads the castro-island custom element that handles lazy hydration.
 * This is the client-side infrastructure that makes islands work.
 */

import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

/** Alias for importing client runtime in compiled islands */
export const CLIENT_RUNTIME_ALIAS = "castro/client-runtime";

/**
 * Plugin that loads the castro-island custom element runtime
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
				{
					tag: "script",
					attrs: { type: "module", src: "/castro-client-runtime.js" },
				},
			];
		},

		getImportMap() {
			return { [CLIENT_RUNTIME_ALIAS]: "/castro-client-runtime.js" };
		},

		async onBuild({ outputDir }) {
			await mkdir(dirname(outputDir), { recursive: true });

			// Copy runtime files to dist
			await copyFile(
				join(import.meta.dirname, "./hydration.js"),
				join(outputDir, "castro-island.js"),
			);

			await copyFile(
				join(import.meta.dirname, "./client-runtime.js"),
				join(outputDir, "castro-client-runtime.js"),
			);
		},
	};
}
