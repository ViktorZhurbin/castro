/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files, compiles each for
 * both client (browser bundle) and server (SSR), and pre-loads SSR modules
 * into memory so renderMarker() can access them synchronously.
 */

import { access } from "node:fs/promises";
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
import { getIslandId, toPosix } from "./utils.js";

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

		// Islands are optional — a project with no components/ dir is valid.
		try {
			await access(COMPONENTS_DIR);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			if (err.code === "ENOENT") return;

			throw err;
		}

		const islandGlob = new Bun.Glob("**/*.island.{jsx,tsx}");

		for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
			const sourcePath = join(COMPONENTS_DIR, relativePath);
			const frameworkId = await detectFramework(sourcePath);
			const { outputDir, publicDir } = derivePaths(relativePath);

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
 * Derive the on-disk output directory and the public URL prefix for an island,
 * preserving its source-tree nesting (e.g. `ui/Button.island.tsx` →
 * `dist/islands/ui/`, `/islands/ui`). Public paths are normalized to posix
 * since they ship to the browser.
 *
 * @param {string} relativePath - Path of the island source relative to COMPONENTS_DIR
 * @returns {{ outputDir: string, publicDir: string }}
 */
function derivePaths(relativePath) {
	const relativeDir = dirname(relativePath);
	return {
		outputDir: join(OUTPUT_DIR, ISLANDS_OUTPUT_DIR, relativeDir),
		publicDir: toPosix(`/${join(ISLANDS_OUTPUT_DIR, relativeDir)}`),
	};
}

const transpiler = new Bun.Transpiler({ loader: "tsx" });

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
		let errorMessage;
		let frames;

		if (e instanceof AggregateError) {
			errorMessage = e.errors.map((err) => err.message).join("\n");
			frames = [{ file: resolve(sourcePath) }];
		} else {
			const err = /** @type {BuildMessage} */ (e);
			errorMessage = err.message;
			frames = [bunLogToFrame(err)];
		}

		throw new CastroError("BUNDLE_FAILED", { errorMessage }, frames);
	}

	const fwConfigs = getLoadedFrameworkConfigs();

	// Match package-level import prefixes.
	// E.g., "solid-js/web" matches the "solid-js" detector.
	const importPaths = scanned.imports.map((i) => i.path);

	for (const fwConfig of fwConfigs) {
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
