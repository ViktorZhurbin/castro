/**
 * Module Cache — write-to-disk-then-import pattern
 *
 * This is the build-tool plumbing that makes everything else work.
 * The pattern looks unusual but is standard in build tools (webpack,
 * Vite, esbuild all do variants of this internally):
 *
 * 1. Bun.build() compiles a page/island to a JavaScript string
 * 2. We write that string to a .js file in node_modules/.cache/castro/
 * 3. We import() the file via a file:// URL
 *
 * Why not just eval() the code or use in-memory modules?
 * - The compiled code contains bare imports (e.g., `import { h } from "preact"`)
 * - These only resolve correctly from a real file on disk, where Node/Bun's
 *   module resolution can walk up to node_modules/
 * - A file:// URL ensures Bun treats it as a proper module with full resolution
 *
 * Cache busting: Bun's module loader caches by file path and ignores query
 * strings. We use content-hashed filenames so changed code gets a new path.
 */

import { rmSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path/posix";
import { CastroError } from "./errors.js";
import { PROJECT_ROOT } from "./paths.js";

const CACHE_DIR = join(PROJECT_ROOT, "node_modules/.cache/castro");

/**
 * Clean cache directory. Called once at startup to ensure fresh state.
 */
export function cleanupCacheDir() {
	rmSync(CACHE_DIR, { recursive: true, force: true });
}

/**
 * Returns a cache subdirectory path. Callers rely on Bun.write / Bun.build
 * to create the directory on first use.
 * @param {string} subpath
 * @returns {string}
 */
export function resolveTempDir(subpath) {
	const resolvedSubpath = resolve(PROJECT_ROOT, subpath);
	const relativeSubpath = relative(PROJECT_ROOT, resolvedSubpath);

	return join(CACHE_DIR, relativeSubpath);
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
 * Write compiled code to a cache file and import it as an ES module.
 *
 * This is where the write-to-disk-then-import pattern happens:
 * code string → .js file on disk → dynamic import() → live module.
 *
 * @param {string} sourcePath - Original source path (for cache directory structure)
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr")
 * @returns {Promise<any>} The imported module
 */
export async function getModule(sourcePath, content, subpath) {
	const path = createTempPath(sourcePath, content, subpath);

	try {
		await Bun.write(path, content);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);

		throw new CastroError("CACHE_WRITE_FAILED", { path, errorMessage });
	}

	// file:// URL ensures Bun's module resolver can find bare imports
	const fileUrl = Bun.pathToFileURL(path);

	return import(fileUrl.href);
}
