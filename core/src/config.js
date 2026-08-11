/**
 * Configuration Loader
 *
 * Loads optional castro.config.ts from the project root.
 * Missing file = all defaults. No validation — bad values fail loudly.
 *
 * Read once, at import: constants.js derives the *_DIR constants from `srcDir`
 * at that moment and the dev server has already bound `port`, so a running
 * process cannot pick up an edit — only a restart can.
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

export const CONFIG_FILE = "castro.config.ts";

/** Absolute path to the config file, watched by the dev server. */
export const configFilePath = join(process.cwd(), CONFIG_FILE);

if (await Bun.file(configFilePath).exists()) {
  try {
    userConfig = (await import(configFilePath)).default ?? {};
  } catch (err) {
    throw new CastroError("CONFIG_LOAD_FAILED", {
      configFile: CONFIG_FILE,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
  }
}

/** @type {CastroConfig & DefaultConfig} */
export const config = { ...defaults, ...userConfig };
