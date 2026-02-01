/**
 * Markdown Page Builder
 *
 * Builds a single markdown file to HTML using the unified JSX pipeline.
 *
 * Process:
 * 1. Parse frontmatter (YAML between --- delimiters) for metadata
 * 2. Convert markdown body to HTML using marked
 * 3. Wrap HTML in a VNode (for consistent pipeline with JSX pages)
 * 4. Pass through island wrapping (enables layouts to use islands)
 * 5. Resolve layout and render
 *
 * Example markdown file:
 *   ---
 *   title: My Post
 *   layout: blog
 *   ---
 *   # Heading
 *   Content here...
 */

import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { marked } from "marked";
import { h } from "preact";
import { validateMeta } from "../utils/validateMeta.js";
import { buildPageShell } from "./page-shell.js";
import { renderPageVNode } from "./render-page-vnode.js";

/**
 * Build a single markdown file to HTML
 *
 * @param {string} sourceFileName - Relative path from pages/
 * @param {{ logOnSuccess?: boolean, logOnStart?: boolean }} [options]
 */
export async function buildMarkdownPage(sourceFileName, options = {}) {
	await buildPageShell(sourceFileName, ".md", options, async (ctx) => {
		const { sourceFilePath, outputFilePath } = ctx;

		// Read and parse markdown with frontmatter
		const sourceFileContent = await readFile(sourceFilePath, "utf-8");
		const { data: meta, content: markdown } = matter(sourceFileContent);

		// Type assertion: we know meta is valid PageMeta after validation
		const validatedMeta = validateMeta(meta, sourceFileName);

		// Convert markdown to HTML
		const contentHtml = await marked(markdown);

		// Use shared rendering pipeline
		// Pass a function that creates the VNode wrapper for markdown content
		await renderPageVNode({
			createContentVNode: () =>
				h("div", {
					dangerouslySetInnerHTML: { __html: contentHtml },
				}),
			outputFilePath,
			sourceFileName,
			meta: validatedMeta,
		});
	});
}
