import { posix } from "node:path";
import { PROJECT_ROOT, toPosix } from "../utils/paths.js";

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
	return posix.relative(PROJECT_ROOT, toPosix(filePath));
}
