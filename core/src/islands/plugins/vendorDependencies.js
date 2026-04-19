import { dirname, join, resolve } from "node:path";
import { config } from "../../config.js";
import { OUTPUT_DIR } from "../../constants.js";
import { safeBunBuild } from "../../utils/bunBuild.js";
import { resolveTempDir } from "../../utils/cache.js";
import { getFrameworkConfig } from "../frameworkConfig.js";

/**
 * @import { CastroPlugin, ImportsMap } from '../../types.js'
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
 *   specifier→URL entries (e.g., "preact" → "/vendor/preact.js?v=10.28.3").
 *   Uses version query strings for cache busting: when a package upgrades,
 *   the URL changes and browsers re-fetch instead of serving stale code.
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
			const configDeps = config.clientDependencies || [];
			const frameworkDeps = [...usedFrameworks].flatMap(
				(id) => getFrameworkConfig(id).clientDependencies || [],
			);

			if (!configDeps.length && !frameworkDeps.length) return;

			const allClientDeps = new Set([...configDeps, ...frameworkDeps]);

			/** @type { string[] } */
			const entrypoints = [];

			/** @type { Record<string, string> } */
			const files = {};

			const virtualRoot = resolveTempDir("vendor-dependencies");

			// Each dependency gets a virtual entry module that re-exports everything
			// from the real package. Bun.build resolves 'preact' from node_modules,
			// bundles it, and writes it to dist/vendor/.
			for (const pkg of allClientDeps) {
				const virtualPath = resolve(virtualRoot, `${getSafePkgName(pkg)}.js`);

				entrypoints.push(virtualPath);

				// Re-export both named and default exports
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
			const configDeps = config.clientDependencies || [];
			const frameworkDeps = [...usedFrameworks].flatMap(
				(id) => getFrameworkConfig(id).clientDependencies || [],
			);

			const allClientDeps = new Set([...configDeps, ...frameworkDeps]);
			/** @type {ImportsMap} */
			const importMap = {};

			for (const dep of allClientDeps) {
				const safeName = getSafePkgName(dep);

				const version = await resolvePkgVersion(dep);
				importMap[dep] = version
					? `/${VENDOR_OUTPUT_DIR}/${safeName}.js?v=${version}`
					: `/${VENDOR_OUTPUT_DIR}/${safeName}.js`;
			}

			return importMap;
		},
	};
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

/**
 * Resolves a package version by walking up from its entry point to find
 * package.json. Avoids require(pkg/package.json), which throws
 * ERR_PACKAGE_PATH_NOT_EXPORTED when a package's exports map doesn't include
 * "./package.json".
 *
 * @param {string} dep - full specifier, e.g. "preact/hooks" or "@vktrz/castro-jsx"
 * @returns {Promise<string | undefined>}
 */
async function resolvePkgVersion(dep) {
	const [part1, part2] = dep.split("/");
	// "@vktrz/castro-jsx/dom" → "@vktrz/castro-jsx", "preact/hooks" → "preact"
	const pkgRoot = dep.startsWith("@") ? `${part1}/${part2}` : part1;

	try {
		let dir = dirname(Bun.resolveSync(pkgRoot, process.cwd()));
		while (dir !== dirname(dir)) {
			const candidate = join(dir, "package.json");
			const file = Bun.file(candidate);
			if (await file.exists()) {
				const pkg = await file.json();
				// Skip structural package.json files (e.g. {"type":"module"}) that
				// lack a name — only the real package root has a matching name field.
				if (pkg.name === pkgRoot) return pkg.version;
			}
			dir = dirname(dir);
		}
	} catch {
		// package not resolvable — version omitted, URL still valid
	}
}
