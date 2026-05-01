/**
 * Layouts Registry
 *
 * Holds all loaded layout components.
 * Layouts are JSX components that wrap page content. They typically
 * define the HTML shell (<html>, <head>, <body>) and common elements
 * like headers, footers, and navigation.
 */

import { rmSync } from "node:fs";
import { access } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { compileJSX } from "../builder/compileJsx.js";
import { writeCSSFiles } from "../builder/writeCss.js";
import { LAYOUTS_DIR, OUTPUT_DIR } from "../constants.js";
import { resolveTempDir } from "../utils/cache.js";
import { CastroError } from "../utils/errors.js";

/**
 * @import { VNode } from "preact";
 * @import { Asset } from '../types.d.ts'
 *
 * @typedef {(props: {
 * 		title: string;
 * 		children: VNode;
 * 		[key: string]: unknown;
 *	}) => VNode} LayoutComponent
 *
 * @typedef {string} LayoutId - Layout filename without extension
 */

/**
 * Singleton registry for layouts
 */
class LayoutsRegistry {
	/**
	 * Map of layout IDs to layout JSX components
	 * @type {Map<LayoutId, LayoutComponent>}
	 */
	#layouts = new Map();

	/**
	 * Map of layout IDs to layout CSS assets
	 * @type {Map<LayoutId, Asset[]>}
	 */
	#cssAssets = new Map();

	/**
	 * @param {LayoutId} id
	 */
	getLayout(id) {
		return this.#layouts.get(id);
	}

	/**
	 * @param {LayoutId} id
	 */
	getCssAssets(id) {
		return this.#cssAssets.get(id);
	}

	/**
	 * Discover, compile, and load all JSX layouts
	 */
	async load() {
		this.#layouts.clear();
		this.#cssAssets.clear();

		// Check if layouts directory exists
		try {
			await access(LAYOUTS_DIR);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			if (err.code === "ENOENT") {
				throw new CastroError("NO_LAYOUTS_DIR");
			}

			throw err;
		}

		// Clean cache dir to ensure fresh compilation.
		// In dev mode, stale cached layouts can cause issues when files change.
		const tempDirPath = resolveTempDir(LAYOUTS_DIR);

		rmSync(tempDirPath, { recursive: true, force: true });

		// Process layouts
		const layoutGlob = new Bun.Glob("**/*.{jsx,tsx}");

		for await (const relativePath of layoutGlob.scan(LAYOUTS_DIR)) {
			const sourceFilePath = join(LAYOUTS_DIR, relativePath);
			const fileName = basename(sourceFilePath);

			/** @type {LayoutId} */
			const layoutId = basename(fileName, extname(fileName));

			// Compile and extract CSS
			const { module: layoutModule, cssFiles } =
				await compileJSX(sourceFilePath);

			if (!layoutModule.default) {
				throw new CastroError("LAYOUT_NO_DEFAULT_EXPORT", { file: fileName });
			}

			this.#layouts.set(layoutId, layoutModule.default);

			// Write layout CSS to dist/layouts/
			const layoutsDir = join(OUTPUT_DIR, LAYOUTS_DIR);
			const layoutCssAssets = await writeCSSFiles(cssFiles, layoutsDir);

			if (layoutCssAssets.length > 0) {
				this.#cssAssets.set(layoutId, layoutCssAssets);
			}
		}

		// Validate
		if (this.#layouts.size === 0) {
			throw new CastroError("NO_LAYOUT_FILES", { dir: LAYOUTS_DIR });
		}

		if (!this.#layouts.has("default")) {
			throw new CastroError("LAYOUT_MISSING_DEFAULT");
		}
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();
