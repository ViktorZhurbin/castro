import { readFileSync } from "node:fs";
import { join } from "node:path";

/** @type {string[] | null} */
let _depsCache = null;

/**
 * Reads the project's package.json and returns a list of all dependencies.
 * Includes dependencies, devDependencies, and peerDependencies.
 * Results are cached for the duration of the build.
 *
 * @returns {string[]} List of package names
 */
export function getProjectDependencies() {
	if (_depsCache) return _depsCache;

	try {
		const pkgPath = join(process.cwd(), "package.json");
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

		_depsCache = Object.keys({
			...pkg.dependencies,
			...pkg.devDependencies,
			...pkg.peerDependencies,
		});
	} catch {
		_depsCache = [];
	}

	return _depsCache;
}

/**
 * Flattens package names
 * @example "preact/hooks" -> "preact_hooks", "@vktrz/castro-jsx/dom" -> "_vktrz_castro-jsx_dom"
 *
 * @param {string} pkgName
 */
export function getSafePkgName(pkgName) {
	return pkgName.replace(/[@/]/g, "_");
}
