/**
 * Layouts Registry
 *
 * Holds all loaded layout components.
 * Layouts are JSX components that wrap page content. They typically
 * define the HTML shell (<html>, <head>, <body>) and common elements
 * like headers, footers, and navigation.
 */

import { access } from "node:fs/promises";
import { dirname, extname, join } from "node:path/posix";
import { compileJSX } from "./builder/compileJsx.js";
import { writeCSSFiles } from "./builder/writeCss.js";
import { LAYOUTS_DIR, LAYOUTS_OUTPUT_DIR, OUTPUT_DIR } from "./constants.js";
import { CastroError } from "./utils/errors.js";

/**
 * @import { VNode } from "preact";
 *
 * @typedef {(props: {
 * 		title: string;
 * 		children: VNode;
 * 		[key: string]: unknown;
 *	}) => VNode} LayoutComponent
 *
 * @typedef {string} LayoutId - Layout's path relative to LAYOUTS_DIR, extension
 * stripped, posix-style (e.g. `layouts/nested/default.tsx` -> "nested/default").
 * Includes the directory so same-basename layouts in different folders don't
 * collide.
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
	 * Map of layout IDs to stylesheet <link> tags
	 * @type {Map<LayoutId, string[]>}
	 */
	#cssTags = new Map();

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
	getCssTags(id) {
		return this.#cssTags.get(id);
	}

	/**
	 * Discover, compile, and load all JSX layouts
	 */
	async load() {
		this.#layouts.clear();
		this.#cssTags.clear();

		// Bun.file().exists() returns false for directories, so use fs.access here.
		try {
			await access(LAYOUTS_DIR);
		} catch (e) {
			const err = /** @type {Bun.ErrorLike} */ (e);

			if (err.code === "ENOENT") {
				throw new CastroError("NO_DEFAULT_LAYOUT", { dir: LAYOUTS_DIR });
			}

			throw err;
		}

		const layoutGlob = new Bun.Glob("**/*.{jsx,tsx}");

		for await (const relativePath of layoutGlob.scan(LAYOUTS_DIR)) {
			const sourceFilePath = join(LAYOUTS_DIR, relativePath);
			const ext = extname(relativePath);
			const layoutId = relativePath.slice(0, -ext.length);

			const { module: layoutModule, cssFiles } =
				await compileJSX(sourceFilePath);

			if (!layoutModule.default) {
				throw new CastroError("LAYOUT_NO_DEFAULT_EXPORT", {
					file: relativePath,
				});
			}

			this.#layouts.set(layoutId, layoutModule.default);

			// Output dir mirrors the layout's nesting under LAYOUTS_OUTPUT_DIR (not
			// LAYOUTS_DIR, which is srcDir-prefixed) so two layouts with the same
			// basename get distinct CSS files, and the public URL never leaks
			// srcDir (see ISLANDS_OUTPUT_DIR for the same split applied to islands).
			const layoutOutputDir = join(
				OUTPUT_DIR,
				LAYOUTS_OUTPUT_DIR,
				dirname(relativePath),
			);
			const layoutCssTags = await writeCSSFiles(cssFiles, layoutOutputDir);

			if (layoutCssTags.length > 0) {
				this.#cssTags.set(layoutId, layoutCssTags);
			}
		}

		// Missing layouts/, empty layouts/, and layout files without a default.*
		// among them all converge on the same fix, so they share one error.
		if (!this.#layouts.has("default")) {
			throw new CastroError("NO_DEFAULT_LAYOUT", { dir: LAYOUTS_DIR });
		}
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();
