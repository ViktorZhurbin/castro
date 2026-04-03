/** @type {string[] | null} */
let _depsCache = null;

/**
 * Reads the project's package.json and returns a list of all dependencies.
 * Includes dependencies, devDependencies, and peerDependencies.
 * Results are cached for the duration of the build.
 *
 * @returns {Promise<string[]>} List of package names
 */
export async function getProjectDependencies() {
	if (_depsCache) return _depsCache;

	try {
		const pkg = await Bun.file("package.json").json();

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
 * @param {string} name
 */
export const getSafePkgName = (name) => name.replace(/[@/]/g, "_");
