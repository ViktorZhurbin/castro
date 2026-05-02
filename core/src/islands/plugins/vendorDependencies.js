import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path/posix";
import { config } from "../../config.js";
import { OUTPUT_DIR } from "../../constants.js";
import { safeBunBuild } from "../../utils/bunBuild.js";
import { resolveTempDir } from "../../utils/cache.js";
import { getFrameworkConfig } from "../frameworkConfig.js";

/**
 * @import { CastroPlugin, ImportsMap } from '../../types.d.ts'
 */

const VENDOR_OUTPUT_DIR = "vendor";

/**
 * Vendors client dependencies and maps them to import specifiers.
 *
 * Owns both phases of the vendoring process:
 *
 * Phase 1: onAfterBuild() — bundles framework dependencies into dist/vendor/.
 *   Only bundles frameworks actually used on at least one page. A site using
 *   only Preact won't ship Solid's runtime.
 *
 * Phase 2: getImportMap() — generates the import map that tells browsers where
 *   those files live. Called per-page, only for pages with islands. Returns
 *   specifier → URL entries (e.g., "preact" → "/vendor/preact.js").
 *
 * Both phases use getSafePkgName() to derive filenames — they must agree or
 * the import map will reference files that don't exist.
 *
 * @returns {CastroPlugin}
 */
export function vendorDependencies() {
	return {
		name: "vendor-dependencies",

		async onAfterBuild({ usedFrameworks }) {
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

			// Bundle and write to `virtualRoot` directory
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
		},

		async getImportMap({ usedFrameworks }) {
			const allClientDeps = collectClientDeps(usedFrameworks);
			/** @type {ImportsMap} */
			const importMap = {};

			for (const dep of allClientDeps) {
				// No cache busting — see Non-Goals.
				importMap[dep] = `/${VENDOR_OUTPUT_DIR}/${getSafePkgName(dep)}.js`;
			}

			return importMap;
		},
	};
}

/**
 * Union of user-configured client deps and the deps of every framework
 * actually used on a built page. Both hooks must agree on this set —
 * onAfterBuild bundles the files, getImportMap points at them.
 *
 * @param {Set<string>} usedFrameworks
 * @returns {Set<string>}
 */
function collectClientDeps(usedFrameworks) {
	const configDeps = config.clientDependencies || [];
	const frameworkDeps = [...usedFrameworks].flatMap(
		(id) => getFrameworkConfig(id).clientDependencies || [],
	);

	return new Set([...configDeps, ...frameworkDeps]);
}

/**
 * Flattens package names
 *
 * @example "preact/hooks" -> "preact_hooks", "@vktrz/castro-jsx/dom" -> "_vktrz_castro-jsx_dom"
 *
 * @param {string} name
 */
function getSafePkgName(name) {
	return name.replace(/[@/]/g, "_");
}
