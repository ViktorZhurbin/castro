/** @type {string[] | null} */
let _depsCache = null;

/**
 * Clears the cache so the next getProjectDependencies() call re-reads
 * package.json. The dev server rebuilds in-process across the whole session,
 * so without this a dependency added mid-session would stay bundled instead
 * of external until the process restarted.
 */
export function resetDependenciesCache() {
	_depsCache = null;
}

/**
 * Returns all package names from the project's package.json for use as
 * Bun.build `external` entries during page/layout/island SSR compilation.
 *
 * devDependencies are intentionally included: this runs at build time, so all
 * installed packages are available in node_modules. Pages and layouts only import
 * local files (components, islands) — not devDependencies directly — so externalizing them
 * causes no harm and avoids false bundling if a local file happens to share a
 * name with a package. Including all three dependency groups also enables
 * tsconfig `paths` aliases: Bun resolves imports that aren't in the external
 * list, so local aliases like `@components/` pass through to path resolution.
 *
 * Results are cached for the duration of a single build.
 *
 * @returns {Promise<string[]>}
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
