/**
 * Dependency Vendoring
 *
 * Bundles the shared client dependencies — each used framework's own plus any
 * `config.clientDependencies` — into dist/vendor/ and produces the import map
 * that points browsers at them.
 *
 * Three places that must agree on the dependency set (collectClientDeps):
 * - vendorClientDeps() runs once after all pages build, writing the bundles
 *   for every framework used anywhere on the site.
 * - getIslandImportMap() runs per island page, emitting specifier → URL
 *   entries for just that page's own usedFrameworks.
 * - The island client compile marks the same set external (compiler.js),
 *   scoped to that one island's framework.
 *
 * Both output halves are gated on island usage by the caller — a site that
 * renders no islands ships neither.
 */

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path/posix";
import { config } from "../config.js";
import { OUTPUT_DIR } from "../constants.js";
import { getFrameworkConfig } from "../islands/frameworkConfig.js";
import { safeBunBuild } from "../utils/bunBuild.js";
import { resolveTempDir } from "../utils/cache.js";

/** @import { ImportsMap } from "../types.d.ts" */

const VENDOR_OUTPUT_DIR = "vendor";

/**
 * Every dependency shared across the given frameworks' islands via the
 * import map, plus user-configured extras. Anything not in this set gets
 * bundled into each island bundle separately.
 *
 * @param {Iterable<string>} frameworkIds
 * @returns {Set<string>}
 */
export function collectClientDeps(frameworkIds) {
	const frameworkDeps = [...frameworkIds].flatMap(
		(id) => getFrameworkConfig(id).clientDependencies,
	);
	return new Set([...frameworkDeps, ...(config.clientDependencies ?? [])]);
}

/**
 * Bundle the shared client dependencies into dist/vendor/.
 *
 * @param {Iterable<string>} frameworkIds - every framework used anywhere on the site
 */
export async function vendorClientDeps(frameworkIds) {
	/** @type { string[] } */
	const entrypoints = [];

	/** @type { Record<string, string> } */
	const files = {};

	const virtualRoot = resolveTempDir("vendor-dependencies");
	await mkdir(virtualRoot, { recursive: true });

	// Each dependency gets a virtual entry module that re-exports everything
	// from the real package. Bun.build resolves 'preact' from node_modules,
	// bundles it, and writes it to dist/vendor/.
	for (const pkg of collectClientDeps(frameworkIds)) {
		const virtualPath = resolve(virtualRoot, `${getSafePkgName(pkg)}.js`);

		entrypoints.push(virtualPath);

		// Re-export both named and default exports.
		// Many ESM-only packages (e.g. preact/hooks) have no default export;
		// in that case we re-export the namespace so `import x from 'preact/hooks'`
		// at least resolves to something usable instead of undefined.
		files[virtualPath] =
			`import * as m from '${pkg}'; export * from '${pkg}'; export default m.default || m;`;
	}

	// Bundle the virtual entries and write the output to dist/vendor/
	await safeBunBuild({
		entrypoints,
		files,
		root: virtualRoot,
		outdir: join(OUTPUT_DIR, VENDOR_OUTPUT_DIR),
		format: "esm",
		target: "browser",
		// splitting extracts shared code into chunks. Without it, preact and
		// preact/hooks would each bundle the full preact internals independently.
		// It's also what keeps a single Preact instance: a vendored dep that
		// imports preact (e.g. @preact/signals) shares the chunk the vendored
		// preact entry points at.
		splitting: true,
		minify: true,
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
	});
}

/**
 * Import map for an island page: specifier → vendored URL for each shared
 * client dependency, scoped to the frameworks that page's islands actually use.
 *
 * @param {Iterable<string>} frameworkIds - this page's usedFrameworks
 * @returns {ImportsMap}
 */
export function getIslandImportMap(frameworkIds) {
	/** @type {ImportsMap} */
	const importMap = {};

	for (const dep of collectClientDeps(frameworkIds)) {
		// Real framework would probably have cache busting - we don't.
		importMap[dep] = `/${VENDOR_OUTPUT_DIR}/${getSafePkgName(dep)}.js`;
	}

	return importMap;
}

/**
 * Flattens package names
 *
 * @example "preact/hooks" -> "preact_hooks"
 *
 * @param {string} name
 */
function getSafePkgName(name) {
	return name.replace(/[@/]/g, "_");
}
