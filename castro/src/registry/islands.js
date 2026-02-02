/**
 * Islands Registry
 *
 * Central command for the islands system. Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { loadIslands } from "./loadIslands.js";

/**
 * @import { IslandComponent, IslandsMap } from '../types.js'
 */

/**
 * Singleton registry for islands
 */
class IslandsRegistry {
	/** @type {IslandsMap} */
	#islands = new Map();

	/**
	 * CSS content for each island (name -> CSS string)
	 *
	 * @type {Map<string, string>}
	 */
	#cssManifest = new Map();

	/**
	 * Load (or reload) all islands from disk
	 */
	async load() {
		const { islands, cssManifest } = await loadIslands();

		this.#islands = islands;
		this.#cssManifest = cssManifest;
	}

	/**
	 * Get all islands
	 *
	 * @returns {IslandsMap}
	 */
	getAll() {
		return this.#islands;
	}

	/**
	 * Check if an island is registered by ID
	 *
	 * @param {string} id - The island's source path ID (e.g., "src/islands/Counter.tsx")
	 * @returns {boolean}
	 */
	isIsland(id) {
		return this.#islands.has(id);
	}

	/**
	 * Get island metadata from registry by ID
	 *
	 * @param {string} id - The island's source path ID (e.g., "src/islands/Counter.tsx")
	 *
	 * @returns {IslandComponent | undefined}
	 */
	getIsland(id) {
		return this.#islands.get(id);
	}

	/**
	 * Get the CSS manifest mapping island names to CSS content
	 *
	 * @returns {Map<string, string>} Island name -> CSS content
	 */
	getCssManifest() {
		return this.#cssManifest;
	}
}

// Export singleton instance
export const islands = new IslandsRegistry();
