/**
 * Islands Registry
 *
 * Singleton store for all compiled island components.
 * At build time, discovers .island.{jsx,tsx} files, compiles each for
 * both client (browser bundle) and server (SSR), and pre-loads SSR modules
 * into memory so renderMarker() can access them synchronously.
 */

import { access } from "node:fs/promises";
import { dirname, join } from "node:path/posix";
import {
	COMPONENTS_DIR,
	ISLANDS_OUTPUT_DIR,
	OUTPUT_DIR,
} from "../constants.js";
import { getModule } from "../utils/cache.js";
import { compileIsland } from "./compiler.js";
import { getIslandId } from "./utils.js";

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
			const { outputDir, publicDir } = derivePaths(relativePath);

			const component = await compileIsland({
				sourcePath,
				outputDir,
				publicDir,
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
		publicDir: join("/", ISLANDS_OUTPUT_DIR, relativeDir),
	};
}
