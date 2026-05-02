/**
 * Page Renderer
 *
 * Renders a page through the full pipeline: content VNode → layout wrapping →
 * renderToString() → HTML file with injected assets.
 *
 * Both JSX and Markdown pages flow through this single function.
 * The entire VNode tree (page + layout + any islands) renders in one
 * renderToString() pass, which is why island SSR modules must be pre-loaded.
 */

import { basename } from "node:path/posix";
import { renderToString } from "preact-render-to-string";
import { getPageState } from "../islands/marker.js";
import { layouts } from "../layouts/registry.js";
import { CastroError } from "../utils/errors.js";
import { writeHtmlPage } from "./writeHtmlPage.js";

/**
 * @import { Asset, PageMeta } from "../types.d.ts"
 * @import { VNode } from "preact"
 */

/**
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

	const contentVNode = createContentVNode();

	// Pages can opt out of layouts with `layout: false`
	let vnodeToRender;

	if (pageMeta.layout === false) {
		vnodeToRender = contentVNode;
	} else {
		const layout = layouts.resolve(pageMeta.layout);

		if (!layout.component) {
			throw new CastroError("LAYOUT_NOT_FOUND", {
				layoutId: layout.id,
				sourceFilePath,
			});
		}

		const layoutCssAssets = layouts.getCssAssets(layout.id) ?? [];
		pageAndLayoutCssAssets.push(...layoutCssAssets);

		const title =
			pageMeta.title || basename(sourceFilePath).replace(/\.(md|[jt]sx)$/, "");

		vnodeToRender = layout.component({
			...pageMeta,
			title,
			children: contentVNode,
		});
	}

	const finalHtml = renderToString(vnodeToRender);

	const state = getPageState();
	await writeHtmlPage(finalHtml, outputFilePath, {
		usedIslands: state.usedIslands,
		usedFrameworks: state.usedFrameworks,
		pageCssAssets: pageAndLayoutCssAssets,
	});
}
