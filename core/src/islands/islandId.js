/**
 * Island ID
 *
 * Derives the stable ID islands are tracked and looked up by everywhere else
 * (registry, pageState, marker rendering): the source path relative to the
 * project root, so it stays consistent across builds and machines.
 */

import { relative } from "node:path/posix";

import { PROJECT_ROOT } from "../constants.js";

/**
 * @param {string} sourceFilePath
 * @returns {string} A normalized project-relative path
 *
 * @example "src/islands/ui/Button.tsx"
 */
export function getIslandId(sourceFilePath) {
  return relative(PROJECT_ROOT, sourceFilePath);
}
