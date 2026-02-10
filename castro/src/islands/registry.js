/**
 * Islands Registry
 *
 * Holds all loaded islands.
 * Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { mkdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { styleText } from "node:util";
import { ISLANDS_OUTPUT_DIR, OUTPUT_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { getIslandId } from "../utils/ids.js";
import { initAdapter } from "./adapter.js";
import { compileIsland } from "./compiler.js";

/**
 * @import { IslandComponent } from '../types.js'
 *
 * @typedef {ReturnType<typeof getIslandId>} IslandId
 */

/**
 * Singleton registry for islands
 */
class IslandsRegistry {
	/**
	 * Map of island ID -> IslandComponent
	 * @type {Map<IslandId, IslandComponent>}
	 */
	#islands = new Map();

	/**
	 * Map of island ID > CSS content string
	 * @type {Map<IslandId, string>}
	 */
	#cssManifest = new Map();

	getAll() {
		return this.#islands;
	}

	/**
	 * @param {IslandId} id
	 */
	isIsland(id) {
		return this.#islands.has(id);
	}

	/**
	 * @param {IslandId} id
	 */
	getIsland(id) {
		return this.#islands.get(id);
	}

	getCssManifest() {
		return this.#cssManifest;
	}

	/**
	 * Load (or reload) all islands from disk.
	 *
	 * Scans the project for .island.{jsx,tsx} files (the naming convention
	 * that identifies interactive components). Islands can live anywhere
	 * in the project — not just an islands/ directory.
	 */
	async load() {
		this.#islands.clear();
		this.#cssManifest.clear();

		// Adapter must be ready before we compile islands
		await initAdapter();

		// Output directory for compiled island client bundles
		const outputIslandsDir = join(OUTPUT_DIR, ISLANDS_OUTPUT_DIR);
		await mkdir(outputIslandsDir, { recursive: true });

		// Scan the entire project for .island.{jsx,tsx} files
		const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");

		for await (const relativePath of islandGlob.scan(".")) {
			// Skip build artifacts and dependencies
			if (
				relativePath.startsWith("node_modules/") ||
				relativePath.startsWith("dist/") ||
				relativePath.startsWith(".")
			) {
				continue;
			}

			const sourcePath = relativePath;

			// All compiled islands go into a flat output directory
			// (avoids deep nesting in dist/)
			const outputDir = outputIslandsDir;
			const publicDir = `/${ISLANDS_OUTPUT_DIR}`;

			try {
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
				});

				const islandId = getIslandId(sourcePath);
				this.#islands.set(islandId, component);

				if (component.cssContent) {
					this.#cssManifest.set(islandId, component.cssContent);
				}
			} catch (e) {
				const err = /** @type {Bun.ErrorLike} */ (e);
				throw new Error(err.message);
			}
		}

		// Log compiled islands
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

// Export singleton instance
export const islands = new IslandsRegistry();
