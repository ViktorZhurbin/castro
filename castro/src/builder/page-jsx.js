/**
 * JSX Page Builder
 *
 * Builds a single JSX/TSX page to HTML.
 *
 * JSX pages are components that render at build time. They can:
 * - Export `meta` object with { title, layout, custom fields }
 * - Use islands for interactive parts
 * - Import other components
 * - Import CSS files (automatically extracted and linked)
 *
 * Example page structure:
 *   import "./index.css";
 *   export const meta = { title: "About", layout: "default" };
 *   export default function About() {
 *     return <div>Content here</div>;
 *   }
 */

import { dirname } from "node:path";
import { messages } from "../messages/index.js";
import { validateMeta } from "../utils/validateMeta.js";
import { compileJSX } from "./compile-jsx.js";
import { renderPageVNode } from "./render-page-vnode.js";
import { writeCSSFiles } from "./write-css.js";

/**
 * Build a single JSX page to HTML
 *
 * @param {string} sourceFilePath
 * @param {string} outputFilePath
 */
export async function buildJSXPage(sourceFilePath, outputFilePath) {
	// Compile and import the JSX page (also extracts CSS)
	const { module: pageModule, cssFiles } = await compileJSX(sourceFilePath);

	if (!pageModule.default || typeof pageModule.default !== "function") {
		throw new Error(messages.errors.jsxNoExport(sourceFilePath));
	}

	// Write CSS files to output directory and collect assets
	const outputDir = dirname(outputFilePath);
	const pageCssAssets = await writeCSSFiles(cssFiles, outputDir);

	// Extract metadata (includes layout preference)
	const meta = pageModule.meta || {};

	// Validate metadata against schema
	const validatedMeta = validateMeta(meta, sourceFilePath);

	// Use shared rendering pipeline
	// Pass the page component function so it can be called with the hook active
	await renderPageVNode({
		createContentVNode: pageModule.default,
		outputFilePath,
		sourceFilePath,
		meta: validatedMeta,
		pageCssAssets,
	});
}
