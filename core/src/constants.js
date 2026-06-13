/**
 * Shared path constants.
 *
 * Importing this pulls in config.js, which reads castro.config.ts once at
 * startup — the srcDir-derived dirs (LAYOUTS_DIR, PAGES_DIR, COMPONENTS_DIR)
 * need that value. That config load is the only I/O in this module's import
 * chain; otherwise it's safe to import from anywhere in the build.
 */

import { join } from "node:path/posix";
import { config } from "./config.js";

/** Filename of the <castro-island> custom-element runtime in dist/. */
export const ISLAND_RUNTIME_FILE = "castro-island.js";

/** Matches a page source extension (.md/.jsx/.tsx) so it can be stripped or swapped for .html. */
export const PAGE_EXT_PATTERN = /\.(md|[jt]sx)$/;

export const OUTPUT_DIR = "dist";
export const PUBLIC_DIR = "public";
export const ISLANDS_OUTPUT_DIR = "islands";
export const LAYOUTS_DIR = join(config.srcDir, "layouts");
export const PAGES_DIR = join(config.srcDir, "pages");
export const COMPONENTS_DIR = join(config.srcDir, "components");

export const PROJECT_ROOT = process.cwd();
