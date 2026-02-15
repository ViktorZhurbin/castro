/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files, compiles each for
 * both client (browser bundle) and server (SSR), and pre-loads SSR modules
 * into memory so renderMarker() can access them synchronously.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { styleText } from "node:util";
import {
	COMPONENTS_DIR,
	ISLANDS_OUTPUT_DIR,
	OUTPUT_DIR,
} from "../constants.js";
import { messages } from "../messages/index.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";
import { compileIsland } from "./compiler.js";

/**
 * @import { IslandComponent } from '../types.js'
 *
 * @typedef {ReturnType<typeof getIslandId>} IslandId
 */

class IslandsRegistry {
	/** @type {Map<IslandId, IslandComponent>} */
	#islands = new Map();

	/**
	 * Island ID → CSS content string, used for per-page CSS injection
	 * @type {Map<IslandId, string>}
	 */
	#cssManifest = new Map();

	count() {
		return this.#islands.size;
	}

	/** @param {IslandId} id */
	getIsland(id) {
		return this.#islands.get(id);
	}

	getCssManifest() {
		return this.#cssManifest;
	}

	/**
	 * Discover, compile, and load all islands from disk.
	 */
	async load() {
		this.#islands.clear();
		this.#cssManifest.clear();

		const outputIslandsDir = join(OUTPUT_DIR, ISLANDS_OUTPUT_DIR);
		await mkdir(outputIslandsDir, { recursive: true });

		const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");

		for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
			const sourcePath = join(COMPONENTS_DIR, relativePath);

			// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
			const relativeDir = dirname(relativePath);
			const outputDir = join(outputIslandsDir, relativeDir);
			const publicDir = `/${join(ISLANDS_OUTPUT_DIR, relativeDir)}`.replaceAll(
				"\\",
				"/",
			);

			try {
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
				});

				const islandId = getIslandId(sourcePath);

				// Pre-load SSR module so renderMarker() can access it synchronously
				// during renderToString() traversal
				component.ssrModule = await getModule(
					sourcePath,
					component.ssrCode,
					"ssr",
				);

				this.#islands.set(islandId, component);

				if (component.cssContent) {
					this.#cssManifest.set(islandId, component.cssContent);
				}
			} catch (e) {
				const err = /** @type {Bun.ErrorLike} */ (e);

				throw new Error(err.message);
			}
		}

		if (this.#islands.size > 0) {
			console.info(
				styleText("green", messages.files.compiled(this.#islands.size)),
			);

			for (const component of this.#islands.values()) {
				const relativePath = relative(process.cwd(), component.sourcePath);

				console.info(`  · ${styleText("cyan", relativePath)}`);
			}
		}
	}
}

export const islands = new IslandsRegistry();
