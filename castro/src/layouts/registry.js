/**
 * Layouts Registry
 *
 * Holds all loaded layout components.
 * Layouts are JSX components that wrap page content. They typically
 * define the HTML shell (<html>, <head>, <body>) and common elements
 * like headers, footers, and navigation.
 *
 * Example layout:
 *   export default ({ title, content }) => (
 *     <html>
 *       <head><title>{title}</title></head>
 *       <body dangerouslySetInnerHTML={{ __html: content }} />
 *     </html>
 *   );
 */

import { rmSync } from "node:fs";
import { access, glob } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { compileJSX } from "../builder/compile-jsx.js";
import { writeCSSFiles } from "../builder/write-css.js";
import { LAYOUTS_DIR, OUTPUT_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { resolveTempDir } from "../utils/cache.js";

/**
 * @import { VNode } from "preact";
 * @import { Asset } from '../types.js'
 *
 * @typedef {(props: {
 * 		title: string;
 * 		content: string;
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
			const err = /** @type {NodeJS.ErrnoException} */ (e);

			if (err.code === "ENOENT") {
				throw new Error(messages.errors.noLayoutsDir(LAYOUTS_DIR));
			}

			throw err;
		}

		// Clean cache dir to ensure fresh compilation.
		// In dev mode, stale cached layouts can cause issues when files change.
		const tempDirPath = resolveTempDir(LAYOUTS_DIR);

		rmSync(tempDirPath, { recursive: true, force: true });

		// Process layouts
		await Array.fromAsync(
			glob(join(LAYOUTS_DIR, "**/*.{jsx,tsx}")),
			async (sourceFilePath) => {
				const fileName = basename(sourceFilePath);

				/** @type {LayoutId} */
				const layoutId = basename(fileName, extname(fileName));

				try {
					// Compile and extract CSS
					const { module: layoutModule, cssFiles } =
						await compileJSX(sourceFilePath);

					if (!layoutModule.default) {
						throw new Error(messages.errors.islandNoExport(fileName));
					}

					this.#layouts.set(layoutId, layoutModule.default);

					// Write layout CSS to dist/layouts/
					const layoutsDir = join(OUTPUT_DIR, LAYOUTS_DIR);
					const layoutCssAssets = await writeCSSFiles(cssFiles, layoutsDir);

					if (layoutCssAssets.length > 0) {
						this.#cssAssets.set(layoutId, layoutCssAssets);
					}
				} catch (e) {
					const err = /** @type {NodeJS.ErrnoException} */ (e);

					throw new Error(
						messages.errors.pageBuildFailed(fileName, err.message),
					);
				}
			},
		);

		// Validate
		if (this.#layouts.size === 0) {
			throw new Error(messages.errors.noLayoutFiles(LAYOUTS_DIR));
		}

		const layoutNames = Array.from(this.#layouts.keys()).join(", ");

		console.info(styleText("green", messages.files.layoutsLoaded(layoutNames)));

		if (!this.#layouts.has("default")) {
			throw new Error(messages.errors.missingDefaultLayout());
		}
	}
}

// Export singleton instance
export const layouts = new LayoutsRegistry();
