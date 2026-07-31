import { join } from "node:path/posix";
import { PROJECT_ROOT } from "../constants.js";

/** @type {string[] | null} */
let depsCache = null;

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
 * Cached for the process lifetime: a dependency added mid-session needs a
 * restart to be picked up.
 *
 * @returns {Promise<string[]>}
 */
export async function getProjectDependencies() {
	if (depsCache) return depsCache;

	const pkg = await Bun.file(join(PROJECT_ROOT, "package.json")).json();

	depsCache = Object.keys({
		...pkg.dependencies,
		...pkg.devDependencies,
		...pkg.peerDependencies,
	});

	return depsCache;
}
