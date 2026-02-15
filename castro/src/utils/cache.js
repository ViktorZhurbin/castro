/**
 * Cache Management
 *
 * Compiled modules are cached in node_modules/.cache/castro/ as files
 * (not in memory) so Bun can resolve bare imports like preact and preact/hooks.
 *
 * Filenames include a content hash to bust Bun's module cache, which caches
 * by file path and ignores query strings. Without hashing, editing a file
 * and re-importing it returns stale code.
 */

import { mkdirSync, rmSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path";
import { messages } from "../messages/index.js";

const CACHE_DIR = join(process.cwd(), "node_modules/.cache/castro");

/**
 * Clean cache directory. Called once at startup to ensure fresh state.
 */
export function cleanupCacheDir() {
	try {
		rmSync(CACHE_DIR, { recursive: true, force: true });
	} catch {}
}

/**
 * Ensures a cache subdirectory exists and returns its path.
 * @param {string} subpath
 * @returns {string}
 */
export function resolveTempDir(subpath) {
	const resolvedSubpath = resolve(process.cwd(), subpath);
	const relativeSubpath = relative(process.cwd(), resolvedSubpath);
	const dirPath = join(CACHE_DIR, relativeSubpath);

	mkdirSync(dirPath, { recursive: true });

	return dirPath;
}

/**
 * Cache file path with content hash for cache busting.
 *
 * Example: pages/index.tsx → .cache/castro/pages/index.tsx.a1b2c3d4.js
 *
 * @param {string} sourcePath
 * @param {string} content - Compiled code (used for hash)
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr")
 * @returns {string}
 */
function createTempPath(sourcePath, content, subpath = "") {
	const parsed = parse(sourcePath);
	const hash = Bun.hash(content).toString(36);
	const targetDir = resolveTempDir(join(parsed.dir, subpath));

	return join(targetDir, `${parsed.base}.${hash}.js`);
}

/**
 * Write compiled code to cache and import it as an ES module.
 *
 * @param {string} sourcePath - Original source path
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath] - Optional subdirectory
 * @returns {Promise<any>} The imported module
 */
export async function getModule(sourcePath, content, subpath) {
	const fullPath = createTempPath(sourcePath, content, subpath);

	try {
		await Bun.write(fullPath, content);
	} catch (err) {
		const error = /** @type {Error} */ (err);

		console.error(messages.errors.cacheWriteFailed(fullPath, error.message));

		throw err;
	}

	return import(Bun.pathToFileURL(fullPath).href);
}
