/**
 * Framework Config Registry
 *
 * The built-in preact framework is registered at module load.
 * User plugins provide additional framework configs via registerFramework(),
 * called from plugins.js before any builds run.
 *
 * All frameworks must declare `detectImports` because framework discovery
 * is purely AST-based — no directory convention.
 */

import { CastroError } from "../utils/errors.js";
import preactConfig from "./frameworks/preact.js";

/**
 * @import { FrameworkConfig } from "../types.d.ts"
 */

/**
 * In-memory cache of loaded framework configs.
 * @type {Map<string, FrameworkConfig>}
 */
const loadedConfigs = new Map();

/** @type {(keyof FrameworkConfig)[]} */
const REQUIRED_FIELDS = [
	"id",
	"detectImports",
	"getBuildConfig",
	"clientDependencies",
	"hydrateClientPath",
	"renderSSR",
];

/**
 * Register a framework config.
 * Validates required fields and detection arrays so broken configs fail early.
 *
 * @param {FrameworkConfig} frameworkConfig
 * @param {string} pluginName - Name of the plugin providing this config
 */
export async function registerFramework(frameworkConfig, pluginName) {
	const missing = REQUIRED_FIELDS.filter((f) => !frameworkConfig[f]);

	if (missing.length > 0) {
		throw new CastroError("FRAMEWORK_CONFIG_INVALID", {
			pluginName,
			missing: missing.join(", "),
		});
	}

	if (!(await Bun.file(frameworkConfig.hydrateClientPath).exists())) {
		throw new CastroError("FRAMEWORK_CONFIG_INVALID", {
			pluginName,
			missing: `hydrateClientPath points to non-existent file: ${frameworkConfig.hydrateClientPath}`,
		});
	}

	loadedConfigs.set(frameworkConfig.id, frameworkConfig);
}

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

// Register built-in frameworks at module load
await registerFramework(preactConfig, "castro-preact");
