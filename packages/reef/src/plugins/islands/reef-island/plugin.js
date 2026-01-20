import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

export const CLIENT_RUNTIME_ALIAS = "reef/client-runtime";

/**
 * @import { ReefPlugin } from '../../../types/plugin.js';
 *
 * Plugin to load the reef-island custom element runtime
 *
 * @returns {ReefPlugin} Plugin instance
 */
export function reefIsland() {
	return {
		name: "reef-island",

		getAssets() {
			return [
				{
					tag: "script",
					attrs: { type: "module", src: "/reef-island.js" },
				},
				{
					tag: "script",
					attrs: { type: "module", src: "/reef-client-runtime.js" },
				},
			];
		},

		getImportMap() {
			return { [CLIENT_RUNTIME_ALIAS]: "/reef-client-runtime.js" };
		},

		async onBuild({ outputDir }) {
			await mkdir(dirname(outputDir), { recursive: true });

			// Copy runtime to dist during build

			await copyFile(
				join(import.meta.dirname, "./custom-element.js"),
				join(outputDir, "reef-island.js"),
			);

			await copyFile(
				join(import.meta.dirname, "../utils/client-runtime.js"),
				join(outputDir, "reef-client-runtime.js"),
			);
		},
	};
}
