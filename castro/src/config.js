/**
 * Configuration Loader
 *
 * Loads optional castro.config.js from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 *
 * @typedef {{ port?: number, messages?: "satirical" | "serious" }} CastroConfig
 */

import { join } from "node:path";

/** @type {Required<CastroConfig>} */
const defaults = { port: 3000, messages: "satirical" };

/** @type {CastroConfig} */
let userConfig = {};

try {
	const configPath = join(process.cwd(), "castro.config.js");
	userConfig = (await import(configPath)).default ?? {};
} catch {
	// No config file — use defaults
}

/** @type {Required<CastroConfig>} */
export const config = { ...defaults, ...userConfig };
