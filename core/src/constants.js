/**
 * Shared constants — safe to import from anywhere (no I/O, no module dependencies).
 */

import { join } from "node:path/posix";
import { config } from "./config.js";

/** Filename of the <castro-island> custom-element runtime in dist/. */
export const ISLAND_RUNTIME_FILE = "castro-island.js";

export const OUTPUT_DIR = "dist";
export const PUBLIC_DIR = "public";
export const ISLANDS_OUTPUT_DIR = "islands";
export const LAYOUTS_DIR = join(config.srcDir, "layouts");
export const PAGES_DIR = join(config.srcDir, "pages");
export const COMPONENTS_DIR = join(config.srcDir, "components");

export const PROJECT_ROOT = process.cwd();
