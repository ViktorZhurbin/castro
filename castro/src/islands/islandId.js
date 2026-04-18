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
	const projectRelativePath = relative(process.cwd(), filePath);

	// replaceAll() ensures Windows backslashes don't break the ID
	return projectRelativePath.replaceAll("\\", "/");
}
