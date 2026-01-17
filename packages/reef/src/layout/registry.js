import { loadLayouts } from "./loader.js";

/**
 * @import { LayoutComponent } from '../types/layout.js';
 */

/**
 * Singleton registry for layouts
 * Provides a clean interface for loading and accessing layouts
 */
class LayoutsRegistry {
	/** @type {Map<string, LayoutComponent>} */
	#layouts = new Map();

	/**
	 * Load (or reload) all layouts
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
	 * @param {string} name - Layout name
	 * @returns {LayoutComponent | undefined}
	 */
	get(name) {
		return this.#layouts.get(name);
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();

// Load layouts on module initialization
await layouts.load();
