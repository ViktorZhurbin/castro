/**
 * JSX Page Builder
 *
 * Builds a single JSX/TSX page to HTML.
 *
 * Educational note: JSX pages are React-like components that
 * render to HTML at build time. They can:
 * - Export metadata (title, layout preference)
 * - Use islands for interactive parts
 * - Import other components
 */

import { styleText } from "node:util";
import { renderToString } from "preact-render-to-string";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { compileJSX } from "./compile-jsx.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * Build a single JSX page to HTML
 *
 * @param {string} sourceFileName - Relative path from pages/
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} [options]
 */
export async function buildJSXPage(sourceFileName, options = {}) {
	await buildPageShell(sourceFileName, /\.[jt]sx$/, options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		const allLayouts = layouts.getAll();

		// Compile and import the JSX page
		const pageModule = await compileJSX(sourceFilePath);

		if (!pageModule.default || typeof pageModule.default !== "function") {
			throw new Error(
				`JSX page ${sourceFileName} must have a default export function`,
			);
		}

		// Extract metadata (includes layout preference)
		const meta = pageModule.meta || {};

		let layoutVNode;

		// Support layout: false for pages that render full HTML
		if (meta.layout === false) {
			layoutVNode = pageModule.default();
		} else {
			const contentVNode = pageModule.default();

			const layoutName = await resolveLayout(sourceFilePath, meta);

			const layoutFn = allLayouts.get(layoutName);

			if (!layoutFn) {
				throw new Error(
					`Layout '${styleText("magenta", layoutName)}' not found in layouts/`,
				);
			}

			const title = meta.title || sourceFileName.replace(/\.[jt]sx$/, "");
			const contentHtml = renderToString(contentVNode);

			layoutVNode = layoutFn({
				title,
				content: contentHtml,
				...meta,
			});
		}

		const layoutHtml = renderToString(layoutVNode);

		await writeHtmlPage(layoutHtml, outputFilePath);
	});
}
