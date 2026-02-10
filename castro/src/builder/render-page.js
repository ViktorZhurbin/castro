/**
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles layout application, CSS collection, and writing.
 *
 * Island detection happens at build time (via the marker plugin in compile-jsx.js),
 * not at render time. When this module calls renderToString, any island imports
 * in the page have already been replaced with marker components that handle
 * SSR and <castro-island> wrapping.
 */

import { basename } from "node:path";
import { getAdapter } from "../islands/adapter.js";
import { resetUsedIslands } from "../islands/marker.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { writeHtmlPage } from "./write-html-page.js";

/**
 * @import { Asset, PageMeta } from "../types.js"
 */

/**
 * Render a page through the complete pipeline.
 *
 * @param {{
 *   createContentVNode: () => unknown,
 *   outputFilePath: string,
 *   sourceFilePath: string,
 *   pageMeta: PageMeta,
 *   pageCssAssets?: Asset[],
 * }} params
 */
export async function renderPage({
	createContentVNode,
	outputFilePath,
	sourceFilePath,
	pageMeta,
	pageCssAssets = [],
}) {
	const adapter = getAdapter();

	// Reset island tracking for this page
	// Marker components populate this set during rendering
	const usedIslands = resetUsedIslands();

	const pageAndLayoutCssAssets = [...pageCssAssets];

	// Create content (marker components are already in place from compilation)
	const contentVNode = createContentVNode();

	// Support pages that render full HTML themselves (layout: false)
	let vnodeToRender;

	if (pageMeta.layout === false || pageMeta.layout === "none") {
		vnodeToRender = contentVNode;
	} else {
		// Resolve layout from frontmatter/meta
		const layoutName =
			typeof pageMeta.layout === "string" ? pageMeta.layout : "default";

		const layoutComponent = layouts.getLayout(layoutName);

		if (!layoutComponent) {
			throw new Error(messages.errors.layoutNotFound(layoutName));
		}

		// Render content to HTML string for layout injection
		const contentHtml = adapter.renderToString(contentVNode);

		// Get layout CSS assets
		const layoutCssAssets = layouts.getCssAssets(layoutName) ?? [];
		pageAndLayoutCssAssets.push(...layoutCssAssets);

		// Apply layout (layout VNode also gets marker components resolved)
		const title =
			pageMeta.title || basename(sourceFilePath).replace(/\.(md|[jt]sx)$/, "");

		vnodeToRender = layoutComponent({
			...pageMeta,
			content: contentHtml,
			title,
		});
	}

	// Render final page to HTML
	const html = adapter.renderToString(vnodeToRender);

	// Write HTML with all CSS assets
	await writeHtmlPage(html, outputFilePath, {
		usedIslands,
		pageCssAssets: pageAndLayoutCssAssets,
	});
}
