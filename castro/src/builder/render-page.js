/**
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles island wrapping, layout application, CSS collection, and writing.
 */

import { basename } from "node:path";
import { renderToString } from "preact-render-to-string";
import { islandWrapper } from "../islands/wrapper.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { writeHtmlPage } from "./write-html-page.js";

/**
 * @import { VNode } from "preact"
 * @import { Asset, PageMeta } from "../types.js"
 */

/**
 * Render a page VNode through the complete pipeline
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
	// Passing the factory function ensures the hook is active exactly when the VNodes are created
	createContentVNode,
	outputFilePath,
	sourceFilePath,
	pageMeta,
	pageCssAssets = [],
}) {
	// Install hook to intercept islands during VNode creation
	// Hook remains active for both page content and layout rendering
	const usedIslands = await islandWrapper.install();

	const pageAndLayoutCssAssets = [...pageCssAssets];

	try {
		// Create content VNode with hook active (wraps any islands in content)
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

			// Render content to HTML string for layout
			const contentHtml = renderToString(contentVNode);

			// Get layout CSS assets
			const layoutCssAssets = layouts.getCssAssets(layoutName) ?? [];
			pageAndLayoutCssAssets.push(...layoutCssAssets);

			// Apply layout
			const title =
				pageMeta.title ||
				basename(sourceFilePath).replace(/\.(md|[jt]sx)$/, "");

			// Layout VNode created with hook active (wraps any islands in layout)
			vnodeToRender = layoutComponent({
				...pageMeta,
				content: contentHtml,
				title,
			});
		}

		// Render final page
		const html = renderToString(vnodeToRender);

		// Write HTML with all CSS assets
		// Pass tracking data so the writer can build the final CSS injection
		await writeHtmlPage(html, outputFilePath, {
			usedIslands,
			pageCssAssets: pageAndLayoutCssAssets,
		});
	} finally {
		// Always uninstall hook after page is complete
		islandWrapper.uninstall();
	}
}
