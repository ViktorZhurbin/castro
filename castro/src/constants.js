/**
 * Static Configuration Constants
 *
 * Directory paths and file names that define the project structure.
 * These values never change and form the lowest-level dependency layer.
 *
 * This file has no dependencies on other modules, making it safe to import
 * from anywhere without risk of circular dependencies.
 */

/** Output directory for built files */
export const OUTPUT_DIR = "dist";

/** Static assets that get copied as-is */
export const PUBLIC_DIR = "public";

/** Layout components directory */
export const LAYOUTS_DIR = "layouts";

/** Source pages (markdown and JSX) */
export const PAGES_DIR = "pages";

/** Island components directory */
export const ISLANDS_DIR = "islands";
