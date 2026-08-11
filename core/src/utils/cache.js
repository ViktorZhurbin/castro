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
 * Why not import the source directly and skip the compile? Pages need island
 * imports swapped for markers first; island SSR needs the bundler's CSS-module
 * class names (see compileIslandSSR in islands/compiler.js).
 *
 * Cache busting: Bun's module loader caches by file path and ignores query
 * strings. We use content-hashed filenames so changed code gets a new path.
 */

import { rmSync } from "node:fs";
import { join, parse, relative, resolve } from "node:path/posix";

import { PROJECT_ROOT } from "../constants.js";

const CACHE_DIR = join(PROJECT_ROOT, "node_modules/.cache/castro");

/**
 * Clean cache directory. Called once at CLI startup, not per build: the
 * content hash in each filename already isolates runs from each other, and
 * Bun caches modules by path in memory, so wiping mid-session buys no
 * invalidation — just an rmSync on every dev rebuild.
 */
export function cleanupCacheDir() {
  rmSync(CACHE_DIR, { recursive: true, force: true });
}

/**
 * Returns a cache subdirectory path. Does not create it: a caller that goes
 * on to Bun.write/Bun.build an output file into it gets the directory for
 * free; a caller that needs it to exist on its own (e.g. a virtual build
 * root) must create it.
 * @param {string} subpath
 * @returns {string}
 */
export function resolveCacheDir(subpath) {
  const resolvedSubpath = resolve(PROJECT_ROOT, subpath);
  const relativeSubpath = relative(PROJECT_ROOT, resolvedSubpath);

  return join(CACHE_DIR, relativeSubpath);
}

/**
 * Cache file path with content hash for cache busting.
 *
 * Example: pages/index.tsx → .cache/castro/pages/index.tsx.a1b2c3d4.js
 *
 * @param {string} sourceFilePath
 * @param {string} content - Compiled code (used for hash)
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr")
 * @returns {string}
 */
function createCacheFilePath(sourceFilePath, content, subpath = "") {
  const parsed = parse(sourceFilePath);
  const hash = Bun.hash(content).toString(36);
  const targetDir = resolveCacheDir(join(parsed.dir, subpath));

  return join(targetDir, `${parsed.base}.${hash}.js`);
}

/**
 * Write compiled code to a cache file and import it as an ES module.
 *
 * This is where the write-to-disk-then-import pattern happens:
 * code string → .js file on disk → dynamic import() → live module.
 *
 * @param {string} sourceFilePath - Original source path (for cache directory structure)
 * @param {string} content - Compiled JavaScript code
 * @param {string} [subpath] - Optional subdirectory (e.g., "ssr")
 * @returns {Promise<any>} The imported module
 */
export async function getModule(sourceFilePath, content, subpath) {
  const cacheFilePath = createCacheFilePath(sourceFilePath, content, subpath);

  // A failed write (disk full, bad permissions) throws raw
  await Bun.write(cacheFilePath, content);

  // file:// URL ensures Bun's module resolver can find bare imports
  const fileUrl = Bun.pathToFileURL(cacheFilePath);

  return import(fileUrl.href);
}
