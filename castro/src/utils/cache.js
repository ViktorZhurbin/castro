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
 * - Uses file:// URLs so Bun can resolve preact, preact/hooks, etc.
 */

import { mkdirSync, rmSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import { messages } from "../messages/index.js";

// ============================================================================
// Cache Root Directory
// ============================================================================

/** Cache directory for compiled modules (persistent, not cleaned on exit) */
const CACHE_ROOT = join(process.cwd(), "node_modules/.cache/castro");

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
 * Includes a content hash in the filename to bust Bun's module cache.
 * Bun caches imported modules by file path (ignoring query strings),
 * so overwriting the same file and re-importing it returns stale code.
 * A content-based hash ensures a new path whenever the code changes.
 *
 * Example: pages/index.tsx → .cache/castro/pages/index.tsx.a1b2c3d4.js
 *
 * @param {string} sourcePath
 * @param {string} content - Compiled code (used for hash)
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr" for SSR builds)
 * @returns {string}
 */
function createTempPath(sourcePath, content, subpath = "") {
	const parsed = parse(sourcePath);
	const hash = Bun.hash(content).toString(36);
	const targetDir = resolveTempDir(join(parsed.dir, subpath));

	const fullPath = join(targetDir, `${parsed.base}.${hash}.js`);

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
	const fileUrl = await writeTempFile(sourcePath, content, subpath);
	const module = await import(fileUrl);

	return module;
}

/**
 * Write content to cache file and return importable URL
 * @param {string} sourcePath
 * @param {string} content
 * @param {string} [subpath]
 * @returns {Promise<string>}
 */
async function writeTempFile(sourcePath, content, subpath = "") {
	const fullPath = createTempPath(sourcePath, content, subpath);

	try {
		await Bun.write(fullPath, content);
	} catch (err) {
		const error = /** @type {Error} */ (err);

		console.error(messages.errors.cacheWriteFailed(fullPath, error.message));

		throw err;
	}

	const fileUrl = Bun.pathToFileURL(fullPath);

	return fileUrl.href;
}
