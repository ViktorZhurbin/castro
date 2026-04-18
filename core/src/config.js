/**
 * Configuration Loader
 *
 * Loads optional castro.config.(ts|js|mjs) from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 *
 * User plugins (CastroPlugin[]) are extracted separately
 * so they can be wired into the build pipeline without polluting config.
 */

/** @import { CastroConfig, DefaultConfig } from './types.js' */

import { join } from "node:path";
import { CastroError } from "./utils/errors.js";

/** @type {DefaultConfig} */
const defaults = {
	port: 3000,
	messages: "satirical",
	srcDir: ".",
};

/** @type {CastroConfig} */
let userConfig = {};

for (const ext of [".ts", ".js", ".mjs"]) {
	const configPath = join(process.cwd(), `castro.config${ext}`);

	if (!(await Bun.file(configPath).exists())) continue;

	try {
		userConfig = (await import(configPath)).default ?? {};

		break;
	} catch (err) {
		throw new CastroError("CONFIG_LOAD_FAILED", {
			path: `castro.config${ext}`,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}

const { plugins: userPlugins = [], ...userRest } = userConfig;

/** @type {CastroConfig & DefaultConfig} */
export const config = { ...defaults, ...userRest };

export { userPlugins };
