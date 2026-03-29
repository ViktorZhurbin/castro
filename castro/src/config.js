/**
 * Configuration Loader
 *
 * Loads optional castro.config.js from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 *
 * User plugins (CastroPlugin[]) are extracted separately
 * so they can be wired into the build pipeline without polluting config.
 *
 * @import { CastroPlugin } from './types.js'
 *
 * @typedef {{
 * 	port?: number,
 * 	messages?: "satirical" | "serious",
 * 	defaultIslandFramework?: string,
 * 	plugins?: CastroPlugin[],
 * 	importMap?: Record<string, string>
 * }} CastroConfig
 */

import { join } from "node:path";

/** @type {Required<Omit<CastroConfig, "plugins">>} */
const defaults = {
	port: 3000,
	messages: "satirical",
	defaultIslandFramework: "preact",
	importMap: {},
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

/** @type {Required<Omit<CastroConfig, "plugins">>} */
export const config = { ...defaults, ...userRest };

/** @type {CastroPlugin[]} */
export { userPlugins };
