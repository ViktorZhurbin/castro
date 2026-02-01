/**
 * Islands Registry
 *
 * Central command for the islands system. Handles:
 * 1. Discovery & Compilation (Build time)
 * 2. Storage (Registry of available islands)
 * 3. Resolution (Mapping imports to islands during page rendering)
 */

import { access, glob, mkdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { styleText } from "node:util";
import { messages } from "../messages/index.js";
import { getIslandId } from "../utils/ids.js";
import { compileIsland } from "./compiler.js";

/**
 * @import { IslandComponent, IslandsMap } from '../types.d.ts'
 */

/**
 * Singleton registry for islands
 */
class IslandsRegistry {
	/** @type {IslandsMap} */
	#islands = new Map();
	/** @type {Map<string, string>} CSS content for each island (name -> CSS string) */
	#cssManifest = new Map();

	/**
	 * Load (or reload) all islands from disk
	 * @param {{ islandsDir: string, outputDir: string }} options
	 * @returns {Promise<void>}
	 */
	async load({ islandsDir, outputDir }) {
		// Clear existing islands and manifest (for reload support)
		this.#islands.clear();
		this.#cssManifest.clear();

		try {
			// Check if islands directory exists
			await access(islandsDir);
		} catch (e) {
			const err = /** @type {NodeJS.ErrnoException} */ (e);
			if (err.code === "ENOENT") {
				console.warn(
					styleText("red", `Islands directory not found:`),
					styleText("magenta", islandsDir),
				);
				return;
			}
			throw err;
		}

		// Prepare output directory
		const outputIslandsDir = join(outputDir, islandsDir);
		await mkdir(outputIslandsDir, { recursive: true });

		// Process each island file
		/** @type {{ sourcePath: string }[]} */
		const compiledIslands = [];

		await Array.fromAsync(
			glob(join(islandsDir, "**/*.{jsx,tsx}")),
			async (sourcePath) => {
				// Calculate output directory structure preserving nesting
				// path.join automatically normalizes "." segments, so we don't need
				// explicit checks for top-level files (e.g., join('islands', '.') → 'islands')
				const relativeDir = dirname(relative(islandsDir, sourcePath));

				// Output directory: dist/islands/ui (automatically handles dot segments)
				const outputDir = join(outputIslandsDir, relativeDir);

				// Public URL base: /islands/ui
				// We join with path.join for robust handling, then normalize to forward slashes
				const publicDir = `/${join(islandsDir, relativeDir)}`.replaceAll(
					"\\",
					"/",
				);

				try {
					// Compiler handles hashing and returns specific hashed filenames
					const component = await compileIsland({
						sourcePath,
						outputDir,
						publicDir,
					});

					const id = getIslandId(sourcePath);

					this.#islands.set(id, component);

					// Store CSS content in manifest for later injection
					// Map ID -> CSS string for later lookup during rendering
					if (component.cssContent) {
						this.#cssManifest.set(id, component.cssContent);
					}

					compiledIslands.push({ sourcePath });
				} catch (e) {
					const err = /** @type {NodeJS.ErrnoException} */ (e);
					throw new Error(err.message);
				}
			},
		);

		// Log compiled islands
		if (compiledIslands.length > 0) {
			console.info(
				styleText("green", messages.files.compiled(compiledIslands.length)),
			);
			for (const { sourcePath } of compiledIslands) {
				const relativePath = relative(process.cwd(), sourcePath);
				console.info(`  · ${styleText("cyan", relativePath)}`);
			}
		}
	}

	/**
	 * Get all islands
	 * @returns {IslandsMap}
	 */
	getAll() {
		return this.#islands;
	}

	/**
	 * Check if an island is registered by ID
	 *
	 * @param {string} id - The island's source path ID (e.g., "src/islands/Counter.tsx")
	 * @returns {boolean}
	 */
	isIsland(id) {
		return this.#islands.has(id);
	}

	/**
	 * Get island metadata from registry by ID
	 *
	 * @param {string} id - The island's source path ID (e.g., "src/islands/Counter.tsx")
	 * @returns {IslandComponent | undefined}
	 */
	getIsland(id) {
		return this.#islands.get(id);
	}

	/**
	 * Get the CSS manifest mapping island names to CSS content
	 *
	 * @returns {Map<string, string>} Island name -> CSS content
	 */
	getCssManifest() {
		return this.#cssManifest;
	}
}

// Export singleton instance
export const islands = new IslandsRegistry();
