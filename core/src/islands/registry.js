/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files, compiles each for
 * both client (browser bundle) and server (SSR), and pre-loads SSR modules
 * into memory so renderMarker() can access them synchronously.
 */

import { dirname, join, resolve } from "node:path";
import {
	COMPONENTS_DIR,
	ISLANDS_OUTPUT_DIR,
	OUTPUT_DIR,
} from "../constants.js";
import { bunLogToFrame } from "../utils/bunBuild.js";
import { getModule } from "../utils/cache.js";
import { CastroError } from "../utils/errors.js";
import { compileIsland } from "./compiler.js";
import { getLoadedFrameworkConfigs } from "./frameworkConfig.js";
import { getIslandId } from "./islandId.js";

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

		const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");

		try {
			for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
				const sourcePath = join(COMPONENTS_DIR, relativePath);

				// Determine which framework this island uses.
				const frameworkId = await detectFramework(sourcePath);

				// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
				const relativeDir = dirname(relativePath);
				const outputDir = join(outputIslandsDir, relativeDir);
				const publicDir =
					`/${join(ISLANDS_OUTPUT_DIR, relativeDir)}`.replaceAll("\\", "/");

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
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			// ENOENT means COMPONENTS_DIR doesn't exist, which is fine
			if (err.code !== "ENOENT") {
				throw err;
			}
		}
	}
}

export const islands = new IslandsRegistry();

/**
 * Detect the framework for an island.
 *
 * Scans the file's AST for imports, then matches against each loaded
 * framework's detectImports array. Falls back to Preact.
 *
 * @param {string} sourcePath - Absolute path to the island source file
 * @returns {Promise<string>} Framework id
 */
async function detectFramework(sourcePath) {
	const code = await Bun.file(sourcePath).text();

	let scanned;
	try {
		scanned = transpiler.scan(code);
	} catch (e) {
		// transpiler.scan() throws its own error shape on syntax errors
		if (e instanceof AggregateError) {
			const errorMessage = e.errors.map((e) => e.message).join("\n");
			const frames = [{ file: resolve(sourcePath) }];

			throw new CastroError("BUNDLE_FAILED", { errorMessage }, frames);
		}

		const err = /** @type {BuildMessage} */ (e);
		const frames = [bunLogToFrame(err)];

		throw new CastroError(
			"BUNDLE_FAILED",
			{ errorMessage: err.message },
			frames,
		);
	}

	const fwConfigs = getLoadedFrameworkConfigs();

	// Match package-level import prefixes.
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
