import { userPlugins } from "../config.js";
import { registerFramework } from "./frameworkConfig.js";
import { castroIslandRuntime } from "./plugins/castroIslandRuntime.js";
import { vendorDependencies } from "./plugins/vendorDependencies.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

// Register any frameworks provided by user plugins.
// Must happen before island discovery so all framework detection arrays
// are available when registry.js scans islands for AST-based detection.
for (const plugin of userPlugins) {
	if (plugin.frameworkConfig) {
		await registerFramework(plugin.frameworkConfig, plugin.name);
	}
}

/**
 * Internal plugins (islands) + user plugins (from castro config file).
 * Build pipeline and dev server iterate this merged list.
 * @type {CastroPlugin[]}
 */
const internalPlugins = [castroIslandRuntime(), vendorDependencies()];

export const allPlugins = [...internalPlugins, ...userPlugins];
