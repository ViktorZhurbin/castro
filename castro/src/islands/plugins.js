import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { config, userPlugins } from "../config.js";
import { OUTPUT_DIR } from "../constants.js";
import { getSafePkgName } from "../utils/dependencies.js";
import { getFrameworkConfig, registerFramework } from "./frameworkConfig.js";

/**
 * @import { CastroPlugin } from '../types.d.ts'
 */

// Register any frameworks provided by user plugins.
// Must happen before island discovery so framework configs are
// available when registry.js calls loadFrameworkConfig().
for (const plugin of userPlugins) {
	if (plugin.frameworkConfig) {
		registerFramework(plugin.frameworkConfig, plugin.name);
	}
}

/**
 * Internal plugins (islands) + user plugins (from castro.config.js).
 * Build pipeline and dev server iterate this merged list.
 * @type {CastroPlugin[]}
 */
const internalPlugins = [castroIslandRuntime(), vendorDependencies()];
export const allPlugins = [...internalPlugins, ...userPlugins];

/**
 * Copies the <castro-island> custom element runtime to dist.
 * Only writes when at least one page needs client-side hydration.
 *
 * @returns {CastroPlugin}
 */
function castroIslandRuntime() {
	return {
		name: "castro-island-runtime",

		getPageAssets(params = {}) {
			if (params.hasIslands) {
				return [
					{
						tag: "script",
						attrs: { type: "module", src: "/castro-island.js" },
					},
				];
			}

			return [];
		},

		async onAfterBuild({ usedFrameworks }) {
			if (!usedFrameworks.size) return;

			await Bun.write(
				join(OUTPUT_DIR, "castro-island.js"),
				Bun.file(join(import.meta.dir, "./hydration.js")),
			);
		},
	};
}

/**
 * Bundles third-party dependencies into dist/vendor/.
 * Only bundles the dependencies that were actually used on the page.
 *
 * @returns {CastroPlugin}
 */
function vendorDependencies() {
	return {
		name: "vendor-dependencies",

		async onAfterBuild({ usedFrameworks }) {
			const entrypoints = [];
			/** @type { Record<string, string> } */
			const files = {};

			// Define a fake root directory for our virtual files.
			// This ensures Bun's outdir structure perfectly mirrors the package names.
			const virtualRoot = resolve(process.cwd(), ".castro-vendor");
			await mkdir(virtualRoot, { recursive: true });

			// 1. Gather dependencies to vendor
			const depsToVendor = new Set(config.clientDependencies || []);

			for (const id of usedFrameworks) {
				const fwConfig = getFrameworkConfig(id);
				if (fwConfig.clientDependencies) {
					for (const dep of fwConfig.clientDependencies) {
						depsToVendor.add(dep);
					}
				}
			}

			if (depsToVendor.size === 0) return;

			// 2. Create virtual entry points
			for (const pkg of depsToVendor) {
				const safeName = getSafePkgName(pkg);
				const virtualPath = resolve(virtualRoot, `${safeName}.js`);

				// Re-export both named and default exports
				files[virtualPath] =
					`import * as m from '${pkg}'; export * from '${pkg}'; export default m.default || m;`;
				entrypoints.push(virtualPath);
			}

			// 3. Bundle
			const result = await Bun.build({
				entrypoints,
				files,
				root: virtualRoot,
				outdir: join(OUTPUT_DIR, "vendor"),
				format: "esm",
				target: "browser",
				splitting: true, // Extracts shared logic into chunks
				minify: true,
			});

			if (!result.success) {
				console.error("Failed to vendor dependencies:", result.logs);
			}
		},
	};
}
