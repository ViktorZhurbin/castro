import { join } from "node:path";
import { OUTPUT_DIR } from "../../constants.js";

/**
 * @import { CastroPlugin } from '../../types.js'
 */

/**
 * Copies the <castro-island> custom element runtime to dist.
 * Only writes when at least one page needs client-side hydration.
 *
 * @returns {CastroPlugin}
 */
export function castroIslandRuntime() {
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
				Bun.file(join(import.meta.dir, "../hydration.js")),
			);
		},
	};
}
