import { relative } from "node:path";

/**
 * Generate a stable ID from a file path
 * The ID is project-relative and consistent across builds.
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {string} A normalized project-relative path
 *
 * @example "src/islands/ui/Button.tsx"
 */
export function getIslandId(filePath) {
	return toPosix(relative(process.cwd(), filePath));
}

/**
 * Normalize a path to forward slashes.
 * Used wherever we build URLs or stable IDs from filesystem paths so Windows
 * backslashes don't leak into output that the browser or registry will see.
 *
 * @param {string} path
 * @returns {string}
 */
export function toPosix(path) {
	return path.replaceAll("\\", "/");
}
