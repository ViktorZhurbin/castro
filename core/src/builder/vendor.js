/**
 * Dependency Vendoring
 *
 * Bundles the framework client dependencies used across the build into
 * dist/vendor/ and produces the import map that points browsers at them.
 *
 * Two halves that must agree on filenames (getSafePkgName):
 * - vendorClientDeps() runs once after all pages build, writing the bundles.
 * - getIslandImportMap() runs per island page, emitting specifier → URL entries.
 *
 * A site that renders no islands ships neither — both are gated on usage by the
 * caller.
 */

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path/posix";
import { OUTPUT_DIR } from "../constants.js";
import { getFrameworkConfig } from "../islands/frameworkConfig.js";
import { safeBunBuild } from "../utils/bunBuild.js";
import { resolveTempDir } from "../utils/cache.js";

/** @import { ImportsMap } from "../types.d.ts" */

const VENDOR_OUTPUT_DIR = "vendor";

/**
 * Bundle the client dependencies of every framework used on a built page into
 * dist/vendor/. A site using only Preact won't ship anything else.
 *
 * @param {Set<string>} usedFrameworks
 */
export async function vendorClientDeps(usedFrameworks) {
	const allClientDeps = collectClientDeps(usedFrameworks);

	if (!allClientDeps.size) return;

	/** @type { string[] } */
	const entrypoints = [];

	/** @type { Record<string, string> } */
	const files = {};

	const virtualRoot = resolveTempDir("vendor-dependencies");
	await mkdir(virtualRoot, { recursive: true });

	// Each dependency gets a virtual entry module that re-exports everything
	// from the real package. Bun.build resolves 'preact' from node_modules,
	// bundles it, and writes it to dist/vendor/.
	for (const pkg of allClientDeps) {
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
		splitting: true,
		minify: true,
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
		},
	});
}

/**
 * Import map for an island page: specifier → vendored URL for each client
 * dependency of the frameworks the page used.
 *
 * @param {Set<string>} usedFrameworks
 * @returns {ImportsMap}
 */
export function getIslandImportMap(usedFrameworks) {
	const allClientDeps = collectClientDeps(usedFrameworks);
	/** @type {ImportsMap} */
	const importMap = {};

	for (const dep of allClientDeps) {
		// No cache busting — see NON-GOALS.md.
		importMap[dep] = `/${VENDOR_OUTPUT_DIR}/${getSafePkgName(dep)}.js`;
	}

	return importMap;
}

/**
 * The client deps of every framework actually rendered on a built page.
 * vendorClientDeps bundles these files; getIslandImportMap points at them.
 *
 * @param {Set<string>} usedFrameworks
 * @returns {Set<string>}
 */
function collectClientDeps(usedFrameworks) {
	return new Set(
		[...usedFrameworks].flatMap(
			(id) => getFrameworkConfig(id).clientDependencies || [],
		),
	);
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
