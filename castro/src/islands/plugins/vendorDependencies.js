import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { config } from "../../config.js";
import { OUTPUT_DIR } from "../../constants.js";
import { getSafePkgName } from "../../utils/dependencies.js";
import { getFrameworkConfig } from "../frameworkConfig.js";

/**
 * @import { CastroPlugin } from '../../types.d.ts'
 */

/**
 * Bundles third-party dependencies into dist/vendor/.
 * Only bundles the dependencies that were actually used on the page.
 *
 * @returns {CastroPlugin}
 */
export function vendorDependencies() {
	return {
		name: "vendor-dependencies",

		async onAfterBuild({ usedFrameworks }) {
			/** @type { string[] } */
			const entrypoints = [];

			/** @type { Record<string, string> } */
			const files = {};

			// Define a fake root directory for our virtual files.
			// This ensures Bun's outdir structure perfectly mirrors the package names.
			const virtualRoot = resolve(process.cwd(), ".castro-vendor");
			await mkdir(virtualRoot, { recursive: true });

			const frameworkDeps = [...usedFrameworks].flatMap(
				(id) => getFrameworkConfig(id).clientDependencies || [],
			);

			const allClientDeps = new Set([
				...(config.clientDependencies || []),
				...frameworkDeps,
			]);

			if (allClientDeps.size === 0) return;

			// Create virtual entry points
			for (const pkg of allClientDeps) {
				const virtualPath = resolve(virtualRoot, `${getSafePkgName(pkg)}.js`);

				entrypoints.push(virtualPath);
				// Re-export both named and default exports
				files[virtualPath] =
					`import * as m from '${pkg}'; export * from '${pkg}'; export default m.default || m;`;
			}

			// Bundle and write to `virtualRoot` directory
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
