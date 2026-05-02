/**
 * Path Utilities
 *
 * Bottom-of-the-stack module — depends on nothing else in the project.
 * Establishes the single rule for core/: all internal paths are posix.
 *
 * Normalization happens once at the boundaries where non-posix strings can
 * enter (process.cwd, Bun build outputs, Bun watcher events, user config).
 * Every downstream join/relative/dirname then produces posix output uniformly.
 */

import { posix } from "node:path";

/**
 * Normalize backslashes to forward slashes.
 * Called only at "entry point" sites — paths already in posix form are unaffected.
 *
 * @param {string} path
 * @returns {string}
 */
export function toPosix(path) {
	return path.replaceAll("\\", "/");
}

/**
 * Project root, frozen at module load.
 * Replaces all `process.cwd()` calls in core/ — one syscall, one normalized value.
 *
 * @type {string}
 */
export const PROJECT_ROOT = toPosix(process.cwd());

/**
 * Join path segments as posix, normalizing each input first.
 * Defensive against the few callers that pass values straight from
 * Windows-leaking sources (Bun.resolveSync, import.meta.path, etc.).
 *
 * @param {...string} segments
 * @returns {string}
 */
export function posixJoin(...segments) {
	return posix.join(...segments.map(toPosix));
}
