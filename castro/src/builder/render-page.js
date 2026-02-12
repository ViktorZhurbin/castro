/**
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles layout application, CSS collection, and writing.
 */

import { basename } from "node:path";
import { renderToString } from "preact-render-to-string";
import { getUsedIslands, resetUsedIslands } from "../islands/marker.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { writeHtmlPage } from "./write-html-page.js";

/**
 * @import { Asset, PageMeta } from "../types.js"
 * @import { VNode } from "preact"
 */

/**
 * Render a page through the complete pipeline
 *
 * @param {{
 *   createContentVNode: () => VNode,
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
	const pageAndLayoutCssAssets = [...pageCssAssets];

	// Reset island usage tracking for this page
	resetUsedIslands();

	try {
		// Get page content as a VNode
		const contentVNode = createContentVNode();

		// Support pages that render full HTML themselves (layout: false)
		let vnodeToRender;

		if (pageMeta.layout === false || pageMeta.layout === "none") {
			vnodeToRender = contentVNode;
		} else {
			// Resolve layout from frontmatter/meta
			const layoutName =
				typeof pageMeta.layout === "string" ? pageMeta.layout : "default";

			// Get the layout component from the registry
			const layoutComponent = layouts.getLayout(layoutName);

			// Validate that the requested layout actually exists
			if (!layoutComponent) {
				throw new Error(messages.errors.layoutNotFound(layoutName));
			}

			// Get layout CSS assets
			const layoutCssAssets = layouts.getCssAssets(layoutName) ?? [];
			pageAndLayoutCssAssets.push(...layoutCssAssets);

			// Apply layout
			const title =
				pageMeta.title ||
				basename(sourceFilePath).replace(/\.(md|[jt]sx)$/, "");

			// Layouts are Preact components
			// Pass contentVNode as children for the layout to use
			vnodeToRender = layoutComponent({
				...pageMeta,
				title,
				children: contentVNode,
			});
		}

		// Render VNode tree to HTML string
		const finalHtml = renderToString(vnodeToRender);

		// Write HTML with all CSS assets
		await writeHtmlPage(finalHtml, outputFilePath, {
			usedIslands: getUsedIslands(),
			pageCssAssets: pageAndLayoutCssAssets,
		});
	} catch (e) {
		// Attach source context to the error.
		if (e instanceof Error) {
			e.message = `${sourceFilePath}: ${e.message}`;
		}

		// Let the outer build-page.js error boundary handle message formatting.
		throw e;
	}
}
