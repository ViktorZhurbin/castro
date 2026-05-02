import { relative } from "node:path/posix";
import { PROJECT_ROOT } from "../constants";

/**
 * Generate a stable ID from a file path.
 * The ID is project-relative and consistent across builds.
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {string} A normalized project-relative path
 *
 * @example "src/islands/ui/Button.tsx"
 */
export function getIslandId(filePath) {
	return relative(PROJECT_ROOT, filePath);
}
