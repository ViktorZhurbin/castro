/**
 * Layouts Registry
 *
 * Holds all loaded layout components.
 * Layouts are JSX components that wrap page content. They typically
 * define the HTML shell (<html>, <head>, <body>) and common elements
 * like headers, footers, and navigation.
 */

import { access, rm } from "node:fs/promises";
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
	 * Resolve a page's `layout` meta field to a concrete layout component.
	 * Anything other than a string falls back to `"default"`.
	 *
	 * @param {unknown} layout
	 * @returns {{ id: LayoutId, component: LayoutComponent | undefined }}
	 */
	resolve(layout) {
		const id = typeof layout === "string" ? layout : "default";

		return { id, component: this.#layouts.get(id) };
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

		// Bun.file().exists() returns false for directories, so use fs.access here.
		try {
			await access(LAYOUTS_DIR);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			if (err.code === "ENOENT") {
				throw new CastroError("NO_LAYOUTS_DIR");
			}

			throw err;
		}

		// Clear cached compilations so dev-mode edits to layouts pick up.
		await rm(resolveTempDir(LAYOUTS_DIR), { recursive: true, force: true });

		const layoutGlob = new Bun.Glob("**/*.{jsx,tsx}");

		for await (const relativePath of layoutGlob.scan(LAYOUTS_DIR)) {
			const sourceFilePath = join(LAYOUTS_DIR, relativePath);
			const layoutId = basename(relativePath, extname(relativePath));

			const { module: layoutModule, cssFiles } =
				await compileJSX(sourceFilePath);

			if (!layoutModule.default) {
				throw new CastroError("LAYOUT_NO_DEFAULT_EXPORT", {
					file: relativePath,
				});
			}

			this.#layouts.set(layoutId, layoutModule.default);

			const layoutsDir = join(OUTPUT_DIR, LAYOUTS_DIR);
			const layoutCssAssets = await writeCSSFiles(cssFiles, layoutsDir);

			if (layoutCssAssets.length > 0) {
				this.#cssAssets.set(layoutId, layoutCssAssets);
			}
		}

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
