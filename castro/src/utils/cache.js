/**
 * Persistent Cache Management
 *
 * Handles compilation artifact caching in node_modules/.cache/castro/.
 * This is low-level compiler infrastructure that manages module loading
 * and cache lifecycle.
 *
 * Why persistent caching?
 * - Cache survives process exit for debugging and inspection
 * - Fresh cache on startup ensures consistent builds
 * - File-based (not memory) enables proper module resolution for bare imports
 * - Uses file:// URLs so Node.js can resolve preact, preact/hooks, etc.
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { messages } from "../messages/index.js";

// ============================================================================
// Cache Root Directory
// ============================================================================

/** Cache directory for compiled modules (persistent, not cleaned on exit) */
export const CACHE_ROOT = join(process.cwd(), "node_modules/.cache/castro");

// ============================================================================
// Lifecycle Management
// ============================================================================

/**
 * Clean up cache directory at startup
 *
 * Called once at the beginning of the process to ensure a fresh state.
 * Files persist after the process exits for inspection and debugging.
 */
export function cleanupTempDir() {
	try {
		rmSync(CACHE_ROOT, { recursive: true, force: true });
	} catch {}
}

// ============================================================================
// Cache Path Generation
// ============================================================================

/**
 * Ensures the directory exists and returns the path
 * @param {string} subpath
 * @returns {string}
 */
export function resolveTempDir(subpath) {
	const resolvedSubpath = resolve(process.cwd(), subpath);
	const relativeSubpath = relative(process.cwd(), resolvedSubpath);
	const dirPath = join(CACHE_ROOT, relativeSubpath);

	mkdirSync(dirPath, { recursive: true });

	return dirPath;
}

/**
 * Generates the cache file path for compiled code
 *
 * Mirrors the source file structure inside node_modules/.cache/castro/
 * For example: pages/blog/post.tsx → node_modules/.cache/castro/pages/blog/post.tsx.js
 *
 * @param {string} sourcePath
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr" for SSR builds)
 * @returns {string}
 */
export function createTempPath(sourcePath, subpath = "") {
	const parsed = parse(sourcePath);
	const targetDir = resolveTempDir(join(parsed.dir, subpath));
	const fullPath = join(targetDir, `${parsed.base}.js`);

	return fullPath;
}

// ============================================================================
// Module Loading
// ============================================================================

/**
 * Load code from cache file and import it as a module
 *
 * Writes compiled code to a cache file in node_modules/.cache/castro
 * and imports it as an ES module. This approach allows proper module
 * resolution for packages like preact, which is essential since all code
 * must share the same instance.
 *
 * @param {string} sourcePath - Original source path
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath] - Optional subdirectory
 * @returns {Promise<any>} The imported module
 */
export async function getModule(sourcePath, content, subpath) {
	const fileUrl = writeTempFile(sourcePath, content, subpath);
	const module = await import(fileUrl);

	return module;
}

/**
 * Write content to cache file and return importable URL
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 * @returns {string}
 */
function writeTempFile(sourcePath, content, subpath = "") {
	const fullPath = createTempPath(sourcePath, subpath);

	try {
		writeFileSync(fullPath, content);
	} catch (err) {
		const error = /** @type {Error} */ (err);
		console.error(messages.errors.cacheWriteFailed(fullPath, error.message));
		throw err;
	}

	// pathToFileURL is essential for Windows support in ESM imports
	const pathUrl = pathToFileURL(fullPath).href;

	// Cache-busting ensures fresh imports
	return `${pathUrl}?t=${Date.now()}`;
}
