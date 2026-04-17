/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files, compiles each for
 * both client (browser bundle) and server (SSR), and pre-loads SSR modules
 * into memory so renderMarker() can access them synchronously.
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
	COMPONENTS_DIR,
	ISLANDS_OUTPUT_DIR,
	OUTPUT_DIR,
} from "../constants.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";
import { compileIsland } from "./compiler.js";
import { getLoadedFrameworkConfigss } from "./frameworkConfig.js";

/**
 * Transpiler for scanning imports and exports from component source files.
 * Reused across all island compilations for efficiency.
 */
const transpiler = new Bun.Transpiler({ loader: "tsx" });

/**
 * @import { IslandComponent } from '../types.d.ts'
 *
 * @typedef {ReturnType<typeof getIslandId>} IslandId
 */

class IslandsRegistry {
	/** @type {Map<IslandId, IslandComponent>} */
	#islands = new Map();

	/**
	 * Island ID → CSS content string, used for per-page CSS injection
	 * @type {Map<IslandId, string>}
	 */
	#cssManifest = new Map();

	count() {
		return this.#islands.size;
	}

	/** @param {IslandId} id */
	getIsland(id) {
		return this.#islands.get(id);
	}

	getCssManifest() {
		return this.#cssManifest;
	}

	/**
	 * Discover, compile, and load all islands from disk.
	 */
	async load() {
		this.#islands.clear();
		this.#cssManifest.clear();

		const outputIslandsDir = join(OUTPUT_DIR, ISLANDS_OUTPUT_DIR);
		await mkdir(outputIslandsDir, { recursive: true });

		const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");

		for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
			const sourcePath = join(COMPONENTS_DIR, relativePath);

			// Determine which framework this island uses.
			const frameworkId = await detectFramework(sourcePath);

			// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
			const relativeDir = dirname(relativePath);
			const outputDir = join(outputIslandsDir, relativeDir);
			const publicDir = `/${join(ISLANDS_OUTPUT_DIR, relativeDir)}`.replaceAll(
				"\\",
				"/",
			);

			const component = await compileIsland({
				sourcePath,
				outputDir,
				publicDir,
				frameworkId,
			});

			const islandId = getIslandId(sourcePath);

			// Pre-load SSR module so renderMarker() can access it synchronously
			// during renderToString() traversal
			component.ssrModule = await getModule(
				sourcePath,
				component.ssrCode,
				"ssr",
			);

			this.#islands.set(islandId, component);

			if (component.cssContent) {
				this.#cssManifest.set(islandId, component.cssContent);
			}
		}
	}
}

export const islands = new IslandsRegistry();

/**
 * Detect the framework for an island.
 *
 * Scans the file's AST for imports and exports, then checks each loaded
 * framework's detection arrays. Detection order:
 *
 * 1. Export signature: explicit exports like `hydrate` are the strongest
 *    signal — they override any import-based match. A vanilla island that
 *    imports "preact" for SSR props must still be treated as vanilla.
 * 2. Import scanning: package-level import matching (e.g., "solid-js").
 * 3. Default: Preact.
 *
 * All frameworks must declare at least one detection method (detectImports
 * or detectExports) so AST-based detection always succeeds.
 *
 * @param {string} sourcePath - Absolute path to the island source file
 * @returns {Promise<string>} Framework id
 */
async function detectFramework(sourcePath) {
	const code = await Bun.file(sourcePath).text();
	const scanned = transpiler.scan(code);
	const fwConfigs = getLoadedFrameworkConfigss();

	// Exports first: an explicit `export function hydrate` is the strongest signal.
	// A vanilla island may import "preact" for SSR types — the hydrate export should win.
	for (const fwConfig of fwConfigs) {
		if (fwConfig.detectExports?.some((exp) => scanned.exports.includes(exp))) {
			return fwConfig.id;
		}
	}

	// Imports second: match package-level prefixes.
	// E.g., "solid-js/web" matches the "solid-js" detector.
	const importPaths = scanned.imports.map((i) => i.path);

	for (const fwConfig of fwConfigs) {
		if (!fwConfig.detectImports) continue;

		const matched = fwConfig.detectImports.some((detector) =>
			importPaths.some(
				(importPath) =>
					importPath === detector || importPath.startsWith(`${detector}/`),
			),
		);

		if (matched) return fwConfig.id;
	}

	// Default to Preact
	return "preact";
}
