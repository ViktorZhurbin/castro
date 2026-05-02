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

import { CastroError } from "./utils/errors.js";
import { PROJECT_ROOT, posixJoin } from "./utils/paths.js";

/** @type {DefaultConfig} */
const defaults = {
	port: 3000,
	messages: "satirical",
	srcDir: ".",
};

/** @type {CastroConfig} */
let userConfig = {};

for (const ext of [".ts", ".js", ".mjs"]) {
	const configPath = posixJoin(PROJECT_ROOT, `castro.config${ext}`);

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
