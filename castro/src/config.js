/**
 * Configuration Loader
 *
 * Loads user configuration from castro.config.js in the project root.
 * The config file is optional — all values have sensible defaults.
 *
 * Uses top-level await so the config is ready before any other module
 * accesses it. This works because Bun (and ES modules in general)
 * resolve the full import graph before executing consumer code.
 */

import { join } from "node:path";

/** @type {Required<import("./config.d.ts").CastroConfig>} */
const defaults = {
	port: 3000,
	messages: "satirical",
};

const CONFIG_FILE = "castro.config.js";

const VALID_PRESETS = /** @type {const} */ (["satirical", "serious"]);

/**
 * Resolved configuration with defaults applied.
 * Exported as a live binding so consumers always see the latest value
 * after `loadConfig()` is called.
 *
 * @type {Required<import("./config.d.ts").CastroConfig>}
 */
export let config = { ...defaults };

/**
 * Load (or reload) configuration from the project's castro.config.js.
 *
 * On reload, a cache-busting query parameter is appended to the import
 * path so Bun fetches the updated file instead of returning a cached module.
 */
export async function loadConfig() {
	const configPath = join(process.cwd(), CONFIG_FILE);

	try {
		const imported = await import(`${configPath}?t=${Date.now()}`);
		const userConfig = imported.default ?? {};

		config = {
			port:
				typeof userConfig.port === "number" ? userConfig.port : defaults.port,
			messages: VALID_PRESETS.includes(userConfig.messages)
				? userConfig.messages
				: defaults.messages,
		};
	} catch {
		// No config file or invalid — use defaults
		config = { ...defaults };
	}
}

// Initial load at import time
await loadConfig();
