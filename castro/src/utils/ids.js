import { relative } from "node:path";

/**
 * Generate a stable ID from a file path
 *
 * The ID is project-relative and consistent across builds.
 * Format: "src/islands/Counter.tsx" or "src/islands/ui/Button.tsx"
 *
 * @param {string} filePath - Absolute path to the file
 * @returns {string} Project-relative ID with forward slashes (Windows-safe)
 */
export function getIslandId(filePath) {
	// relative() gives us the project-relative path
	// replaceAll() ensures Windows backslashes don't break the ID
	return relative(process.cwd(), filePath).replaceAll("\\", "/");
}
