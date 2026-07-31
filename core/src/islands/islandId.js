import { relative } from "node:path/posix";

import { PROJECT_ROOT } from "../constants.js";

/**
 * Generate a stable ID from a file path.
 * The ID is project-relative and consistent across builds.
 *
 * @param {string} sourceFilePath
 * @returns {string} A normalized project-relative path
 *
 * @example "src/islands/ui/Button.tsx"
 */
export function getIslandId(sourceFilePath) {
  return relative(PROJECT_ROOT, sourceFilePath);
}
