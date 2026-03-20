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
import { config as castroConfig } from "../config.js";
import {
	COMPONENTS_DIR,
	ISLANDS_OUTPUT_DIR,
	OUTPUT_DIR,
} from "../constants.js";
import { getModule } from "../utils/cache.js";
import { getIslandId } from "../utils/ids.js";
import { compileIsland } from "./compiler.js";
import { isKnownFramework, loadFrameworkConfig } from "./framework-config.js";

/**
 * @import { IslandComponent } from '../types.js'
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

			// Determine which framework this island uses and ensure its config is loaded.
			// Convention: islands in components/solid/ use "solid", etc.
			// Falls back to the default from castro.config.js.
			const frameworkId = await detectFramework(relativePath);

			// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
			const relativeDir = dirname(relativePath);
			const outputDir = join(outputIslandsDir, relativeDir);
			const publicDir = `/${join(ISLANDS_OUTPUT_DIR, relativeDir)}`.replaceAll(
				"\\",
				"/",
			);

			try {
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
			} catch (e) {
				const err = /** @type {Bun.ErrorLike} */ (e);

				throw new Error(err.message);
			}
		}
	}
}

/**
 * Tracks directory names that don't match any framework, so we don't
 * retry failed dynamic imports for every island in that directory.
 * @type {Set<string>}
 */
const nonFrameworkDirs = new Set();

/**
 * Detect and load the framework for an island based on its directory path.
 *
 * Convention: if the first directory segment inside components/ matches
 * a known or loadable framework, use it. Otherwise fall back to the
 * project default from castro.config.js.
 *
 * Must be async because the framework might not be cached yet — if a
 * directory name matches a built-in framework file (e.g. "solid"), we
 * need to dynamically import it to confirm it's valid.
 *
 * Examples:
 *   "solid/Counter.island.tsx"  → "solid"
 *   "ui/Button.island.tsx"      → default from config
 *   "Counter.island.tsx"        → default from config
 *
 * @param {string} relativePath - Path relative to components directory
 * @returns {Promise<string>} Framework id
 */
async function detectFramework(relativePath) {
	const firstSegment = relativePath.split("/")[0];

	// Root-level files (no subdirectory) have the filename as firstSegment —
	// no point trying to load "Counter.island.tsx" as a framework.
	if (firstSegment.includes(".")) {
		return castroConfig.framework;
	}

	// Already registered (built-in pre-loaded at startup, or plugin-provided)
	if (isKnownFramework(firstSegment)) {
		return firstSegment;
	}

	// Already tried and failed — skip the dynamic import
	if (nonFrameworkDirs.has(firstSegment)) {
		return castroConfig.framework;
	}

	// Try loading as a built-in framework. If components/solid/ exists and
	// frameworks/solid.js exists, this succeeds and caches the config.
	// If not (e.g. components/ui/), the import fails silently and we
	// fall back to the default.
	try {
		await loadFrameworkConfig(firstSegment);
		return firstSegment;
	} catch {
		nonFrameworkDirs.add(firstSegment);
		return castroConfig.framework;
	}
}

export const islands = new IslandsRegistry();
