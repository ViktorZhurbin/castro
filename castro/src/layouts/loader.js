/**
 * Layout Loader
 *
 * Discovers and compiles layout components from the layouts/ directory.
 *
 * Educational note: Layouts are JSX components that wrap your content.
 * They typically define the HTML shell (head, body) and common elements
 * (header, footer, navigation).
 */

import { rmSync } from "node:fs";
import { access, glob } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { styleText } from "node:util";
import { compileJSX } from "../build/compile-jsx.js";
import { LAYOUTS_DIR, resolveTempDir } from "../config.js";

/**
 * @import { LayoutComponent } from '../types.d.ts'
 */

/**
 * Discover, compile, and load all JSX layouts
 *
 * @returns {Promise<Map<string, LayoutComponent>>} Map of layout name to render function
 */
export async function loadLayouts() {
	/** @type {Map<string, LayoutComponent>} */
	const layouts = new Map();

	// Check if layouts directory exists
	try {
		await access(LAYOUTS_DIR);
	} catch (e) {
		const err = /** @type {NodeJS.ErrnoException} */ (e);

		if (err.code === "ENOENT") {
			throw new Error(
				`Layouts directory not found: ${LAYOUTS_DIR}\nCreate it and add at least default.jsx`,
			);
		}
		throw err;
	}

	// Ensure clean temp dir for compiled layouts
	const tempDirPath = resolveTempDir(LAYOUTS_DIR);
	rmSync(tempDirPath, { recursive: true, force: true });

	// Process layouts
	await Array.fromAsync(
		glob(join(LAYOUTS_DIR, "**/*.{jsx,tsx}")),
		async (sourceFilePath) => {
			const fileName = basename(sourceFilePath);
			const layoutName = basename(fileName, extname(fileName));

			try {
				const layoutModule = await compileJSX(sourceFilePath);

				if (!layoutModule.default) {
					throw new Error(
						`Layout ${fileName} must have a default export function`,
					);
				}

				layouts.set(layoutName, layoutModule.default);
			} catch (e) {
				const err = /** @type {NodeJS.ErrnoException} */ (e);

				throw new Error(`Failed to load layout ${fileName}: ${err.message}`);
			}
		},
	);

	// Validate
	if (layouts.size === 0) {
		throw new Error(
			`No layout files found in ${LAYOUTS_DIR}\nCreate at least default.jsx`,
		);
	}

	console.info(
		styleText("green", "✓ Loaded layouts:"),
		Array.from(layouts.keys()).join(", "),
	);

	if (!layouts.has("default")) {
		throw new Error("Required layout 'default.jsx' not found in layouts/");
	}

	return layouts;
}
