/**
 * Configuration Loader
 *
 * Loads optional castro.config.ts from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 */

/** @import { CastroConfig, DefaultConfig } from './types' */

import { join } from "node:path/posix";
import { CastroError } from "./utils/errors.js";

/** @type {DefaultConfig} */
const defaults = {
	port: 3000,
	srcDir: ".",
};

/** @type {CastroConfig} */
let userConfig = {};

const CONFIG_FILE = "castro.config.ts";
const configPath = join(process.cwd(), CONFIG_FILE);

if (await Bun.file(configPath).exists()) {
	try {
		userConfig = (await import(configPath)).default ?? {};
	} catch (err) {
		throw new CastroError("CONFIG_LOAD_FAILED", {
			path: CONFIG_FILE,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}

/** @type {CastroConfig & DefaultConfig} */
export const config = { ...defaults, ...userConfig };
