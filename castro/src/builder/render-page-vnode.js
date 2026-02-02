/**
 * Shared Page Rendering Pipeline
 *
 * Unified rendering logic for both JSX and Markdown pages.
 * Handles island wrapping, layout application, CSS collection, and writing.
 */

import { basename } from "node:path";
import { renderToString } from "preact-render-to-string";
import { islandWrapper } from "../islands/wrapper-jsx.js";
import { layouts } from "../layouts/registry.js";
import { messages } from "../messages/index.js";
import { writeHtmlPage } from "./page-writer.js";

/**
 * @import { VNode } from "preact"
 * @import { Asset, PageMeta } from "../types.d.ts"
 */

/**
 * Render a page VNode through the complete pipeline
 *
 * @param {{
 *   createContentVNode: () => VNode,
 *   outputFilePath: string,
 *   sourceFilePath: string,
 *   meta: PageMeta,
 *   pageCssAssets?: Asset[],
 * }} params
 */
export async function renderPageVNode({
	// Passing the factory function ensures the hook is active exactly when the VNodes are created
	createContentVNode,
	outputFilePath,
	sourceFilePath,
	meta,
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

		if (meta.layout === false || meta.layout === "none") {
			vnodeToRender = contentVNode;
		} else {
			// Resolve layout from frontmatter/meta
			const layoutName =
				typeof meta.layout === "string" ? meta.layout : "default";

			// Get the layout component from the registry
			const layoutFn = layouts.getLayout(layoutName);

			// Validate that the requested layout actually exists
			if (!layoutFn) {
				throw new Error(messages.errors.layoutNotFound(layoutName));
			}

			// Render content to HTML string for layout
			const contentHtml = renderToString(contentVNode);

			// Get layout CSS assets
			const layoutCssAssets = layouts.getCssAssets(layoutName);
			pageAndLayoutCssAssets.push(...layoutCssAssets);

			// Apply layout
			const title =
				meta.title || basename(sourceFilePath).replace(/\.(md|[jt]sx)$/, "");

			// Layout VNode created with hook active (wraps any islands in layout)
			vnodeToRender = layoutFn({
				...meta,
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
