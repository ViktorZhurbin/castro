/**
 * Layouts Registry
 *
 * Singleton that holds all loaded layout components.
 * Layouts are JSX functions that wrap page content.
 *
 * Educational note: A "registry" is a pattern for storing
 * and accessing shared resources. Here we store layout
 * functions so any page can use them.
 */

import { loadLayouts } from "./loader.js";

/**
 * @import { LayoutComponent } from '../types.d.ts'
 */

/**
 * Singleton registry for layouts
 */
class LayoutsRegistry {
	/** @type {Map<string, LayoutComponent>} */
	#layouts = new Map();

	/**
	 * Load (or reload) all layouts from disk
	 * @returns {Promise<void>}
	 */
	async load() {
		this.#layouts = await loadLayouts();
	}

	/**
	 * Get all layouts
	 * @returns {Map<string, LayoutComponent>}
	 */
	getAll() {
		return this.#layouts;
	}

	/**
	 * Get a specific layout by name
	 * @param {string} name - Layout name (filename without extension)
	 * @returns {LayoutComponent | undefined}
	 */
	get(name) {
		return this.#layouts.get(name);
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();
