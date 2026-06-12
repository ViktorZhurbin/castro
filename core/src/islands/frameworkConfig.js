/**
 * Framework Config Registry
 *
 * The built-in preact framework is registered at module load. The registry
 * indirection is a remnant of the multi-framework phase — every island is now
 * Preact (see registry.js). All frameworks must declare `detectImports`
 * because framework discovery is purely AST-based — no directory convention.
 */

import preactConfig from "./frameworks/preact.js";

/**
 * @import { FrameworkConfig } from "../types.d.ts"
 */

/**
 * In-memory cache of loaded framework configs.
 * @type {Map<string, FrameworkConfig>}
 */
const loadedConfigs = new Map();

/**
 * Get a framework config synchronously.
 *
 * Must only be called after the framework has been registered.
 * Throws if the config wasn't pre-loaded — this indicates a bug in the build pipeline.
 *
 * @param {string} id
 * @returns {FrameworkConfig}
 */
export function getFrameworkConfig(id) {
	const frameworkConfig = loadedConfigs.get(id);

	if (!frameworkConfig) {
		throw new Error(
			`Framework "${id}" was not pre-loaded. This is a Castro bug.`,
		);
	}

	return frameworkConfig;
}

/**
 * Get all registered frameworks.
 * Used during island discovery to match frameworks against AST scans.
 *
 * @returns {FrameworkConfig[]}
 */
export function getLoadedFrameworkConfigs() {
	return Array.from(loadedConfigs.values());
}

// Register the built-in framework at module load. No shape validation —
// the config ships with Castro, so a broken one is a Castro bug any build
// catches immediately (the plugin-era validation died with the plugin system).
loadedConfigs.set(preactConfig.id, preactConfig);
