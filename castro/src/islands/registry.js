/**
 * Islands Registry
 *
 * Holds all loaded islands.
 * Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { access, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { styleText } from "node:util";
import { ISLANDS_DIR, OUTPUT_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { getIslandId } from "../utils/ids.js";
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
	 * Load (or reload) all islands from disk
	 */
	async load() {
		this.#islands.clear();
		this.#cssManifest.clear();

		try {
			// Check if islands directory exists
			await access(ISLANDS_DIR);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			if (err.code === "ENOENT") {
				console.warn(
					styleText("red", `Islands directory not found:`),
					styleText("magenta", ISLANDS_DIR),
				);
			}

			throw err;
		}

		// Prepare output directory
		const outputIslandsDir = join(OUTPUT_DIR, ISLANDS_DIR);
		await mkdir(outputIslandsDir, { recursive: true });

		const islandGlob = new Bun.Glob("**/*.{jsx,tsx}");

		for await (const relativePath of islandGlob.scan(ISLANDS_DIR)) {
			const sourcePath = join(ISLANDS_DIR, relativePath);

			// Calculate output directory structure preserving nesting
			const relativeDir = dirname(relativePath);

			const outputDir = join(outputIslandsDir, relativeDir);

			// Public URL base: /islands/ui
			const publicDir = `/${join(ISLANDS_DIR, relativeDir)}`.replaceAll(
				"\\",
				"/",
			);

			try {
				// Compiler handles hashing and returns specific hashed filenames
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
				});

				const islandId = getIslandId(sourcePath);

				this.#islands.set(islandId, component);

				// Map ID -> CSS string for later lookup during rendering
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
