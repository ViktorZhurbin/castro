/**
 * Configuration Loader
 *
 * Loads optional castro.config.(ts|js|mjs) from the project root.
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
	srcDir: ".",
};

/** @type {CastroConfig} */
let userConfig = {};

// TODO: consider adding "CONFIG_LOAD_FAILED" error, and config validation
for (const ext of [".ts", ".js", ".mjs"]) {
	try {
		const configPath = join(process.cwd(), `castro.config${ext}`);
		userConfig = (await import(configPath)).default ?? {};
		break;
	} catch {
		// Not found or failed — try next extension
	}
}

const { plugins: userPlugins = [], ...userRest } = userConfig;

/** @type {CastroConfig & DefaultConfig} */
export const config = { ...defaults, ...userRest };

export { userPlugins };
