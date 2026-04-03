/**
 * Framework Config Loader
 *
 * Manages framework configurations with three access patterns:
 *
 * 1. Plugin registration: registerFramework() lets plugins provide a
 *    FrameworkConfig directly, bypassing the built-in frameworks/ directory.
 *    Called at module load time from plugins.js, before any builds run.
 *
 * 2. Async loading (build time): loadFrameworkConfig("preact") dynamically
 *    imports frameworks/preact.js and caches it. Called by registry.js
 *    when discovering islands, before any rendering happens.
 *
 * 3. Sync access (render time): getFrameworkConfig("preact") returns the
 *    cached config instantly. Called by marker.js during renderToString(),
 *    which is synchronous — no opportunity to await.
 *
 * The async/sync split is necessary because renderToString() traverses the
 * VNode tree synchronously, but framework configs may need async imports.
 */

import { messages } from "../messages/index.js";

/**
 * @import { FrameworkConfig } from "./frameworks/types.d.ts"
 */

/**
 * In-memory cache of loaded framework configs.
 * Populated during build initialization, read during rendering.
 * @type {Map<string, FrameworkConfig>}
 */
const loadedConfigs = new Map();

/** @type {(keyof FrameworkConfig)[]} */
const REQUIRED_FIELDS = [
	"id",
	"getBuildConfig",
	"clientDependencies",
	"hydrateFnString",
	"renderSSR",
];

/**
 * Register a framework config directly (used by plugins).
 * Bypasses the dynamic import from ./frameworks/ entirely.
 * Validates required fields so broken configs fail early with a clear error.
 *
 * @param {FrameworkConfig} frameworkConfig
 * @param {string} pluginName - Name of the plugin providing this config
 */
export function registerFramework(frameworkConfig, pluginName) {
	const missing = REQUIRED_FIELDS.filter((f) => !frameworkConfig[f]);

	if (missing.length > 0) {
		throw new Error(
			messages.errors.frameworkConfigInvalid(pluginName, missing.join(", ")),
		);
	}

	loadedConfigs.set(frameworkConfig.id, frameworkConfig);
}

/**
 * Check if a framework id has been registered (built-in or plugin).
 * Used by registry.js to detect framework folder conventions.
 *
 * @param {string} id
 * @returns {boolean}
 */
export function isKnownFramework(id) {
	return loadedConfigs.has(id);
}

/**
 * Load a framework config file and cache it for later sync access.
 *
 * Dynamically imports from ./frameworks/{id}.js. This means:
 * - Only the frameworks actually used get their dependencies loaded
 * - Missing framework dependencies fail at build time with a clear error,
 *   not at module-load time when the config file is first parsed
 *
 * @param {string} id
 * @returns {Promise<FrameworkConfig>}
 */
export async function loadFrameworkConfig(id) {
	const cached = loadedConfigs.get(id);

	if (cached) return cached;

	try {
		const mod = await import(`./frameworks/${id}.js`);
		const frameworkConfig = /** @type {FrameworkConfig} */ (mod.default);

		loadedConfigs.set(id, frameworkConfig);

		return frameworkConfig;
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		// Module not found → unsupported framework name.
		// Any other error → the config file exists but broke during load.
		if (
			err.code === "ERR_MODULE_NOT_FOUND" ||
			err.code === "MODULE_NOT_FOUND"
		) {
			throw new Error(messages.errors.frameworkUnsupported(id));
		}

		throw new Error(messages.errors.frameworkLoadFailed(id, err.message));
	}
}

/**
 * Get a previously loaded framework config (synchronous).
 *
 * Must only be called after loadFrameworkConfig() has completed for this
 * framework id. Throws if the config wasn't pre-loaded — this indicates
 * a bug in the build pipeline (registry should load configs before rendering).
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

// Pre-load Preact (the default framework) at startup.
// This ensures the default config is always available, even if no
// islands explicitly request it.
await loadFrameworkConfig("preact");
