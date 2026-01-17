import { access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PAGES_DIR } from "../constants/dir.js";

/**
 * @import { PageMeta } from '../types/layout.js';
 */

/**
 * Resolve which layout to use for a content file via data cascade
 * Priority: frontmatter > reef.js (walking up tree) > default
 *
 * @param {string} filePath - Path to markdown file (relative or absolute)
 * @param {PageMeta} meta - Parsed frontmatter from file
 * @returns {Promise<string>} Layout name to use
 */
export async function resolveLayout(filePath, meta = {}) {
	if (meta?.layout) return meta.layout;

	// Walk up directory tree looking for reef.js
	const reefData = await findReefData(filePath);

	if (reefData?.layout) return reefData.layout;

	return "default";
}

/**
 * Walk up directory tree from file path looking for reef.js files
 * Stops at PAGES_DIR boundary
 *
 * @param {string} filePath - Path to page file (relative or absolute)
 * @returns {Promise<PageMeta|null>} reef.js data object or null if not found
 *
 * @example
 * // pages/blog/nested/post.md
 * // Checks: pages/blog/nested/reef.js → pages/blog/reef.js → pages/reef.js
 * const data = await findReefData('pages/blog/nested/post.md');
 * // → { layout: 'blog', tags: ['tech'] }
 */
async function findReefData(filePath) {
	// Resolve to absolute path to handle both relative and absolute inputs
	const absoluteFilePath = resolve(filePath);
	let currentDir = dirname(absoluteFilePath);
	const pagesDirAbsolute = resolve(PAGES_DIR);

	while (currentDir.startsWith(pagesDirAbsolute)) {
		const reefPath = join(currentDir, "reef.js");

		try {
			// Check if reef.js exists
			await access(reefPath);

			// Load with cache busting for dev mode
			// Query param forces fresh load when file changes
			const reefUrl = pathToFileURL(reefPath).href;
			const reefModule = await import(`${reefUrl}?t=${Date.now()}`);

			if (reefModule.default) {
				return reefModule.default;
			}
		} catch {
			// reef.js doesn't exist or failed to load, continue up the tree
		}

		// Move up one directory
		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) break; // Reached filesystem root
		currentDir = parentDir;
	}

	return null;
}
