/**
 * Configuration Loader
 *
 * Loads optional castro.config.js from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 *
 * User plugins (CastroPlugin[]) are extracted separately
 * so they can be wired into the build pipeline without polluting config.
 */

/** @import { CastroConfig, DefaultConfig } from './types' */

import { join } from "node:path";

/** @type {DefaultConfig} */
const defaults = {
	port: 3000,
	messages: "satirical",
};

/** @type {CastroConfig} */
let userConfig = {};

try {
	const configPath = join(process.cwd(), "castro.config.js");
	userConfig = (await import(configPath)).default ?? {};
} catch {
	// No config file — use defaults
}

const { plugins: userPlugins = [], ...userRest } = userConfig;

/** @type {CastroConfig & DefaultConfig} */
export const config = {
	...defaults,
	...userRest,
};

export { userPlugins };
