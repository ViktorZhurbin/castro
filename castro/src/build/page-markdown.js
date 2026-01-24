/**
 * Markdown Page Builder
 *
 * Builds a single markdown file to HTML.
 *
 * Educational note: Markdown is great for content-heavy pages
 * like blog posts. This builder:
 * 1. Parses frontmatter (YAML at top) for metadata
 * 2. Converts markdown to HTML
 * 3. Wraps in a layout
 */

import { readFile } from "node:fs/promises";
import { styleText } from "node:util";
import matter from "gray-matter";
import { marked } from "marked";
import { renderToString } from "preact-render-to-string";
import { layouts } from "../layouts/registry.js";
import { resolveLayout } from "../layouts/resolver.js";
import { buildPageShell } from "./page-shell.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * Build a single markdown file to HTML
 *
 * @param {string} sourceFileName - Relative path from pages/
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} [options]
 */
export async function buildMarkdownPage(sourceFileName, options = {}) {
	await buildPageShell(sourceFileName, ".md", options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		const allLayouts = layouts.getAll();

		// Read and parse markdown with frontmatter
		const sourceFileContent = await readFile(sourceFilePath, "utf-8");
		const { data: meta, content: markdown } = matter(sourceFileContent);

		// Resolve which layout to use
		const layoutName = await resolveLayout(sourceFilePath, meta);

		const layoutFn = allLayouts.get(layoutName);

		if (!layoutFn) {
			throw new Error(
				`Layout '${styleText("magenta", layoutName)}' not found in layouts/`,
			);
		}

		const title = meta.title || sourceFileName.replace(".md", "");
		const contentHtml = await marked(markdown);

		const layoutVNode = layoutFn({
			title,
			content: contentHtml,
			...meta,
		});

		const layoutHtml = renderToString(layoutVNode);

		await writeHtmlPage(layoutHtml, outputFilePath);
	});
}
