/**
 * Page Renderer
 *
 * Renders a page through the full pipeline: content VNode → layout wrapping →
 * renderToString() → HTML file with injected assets.
 *
 * Both JSX and Markdown pages flow through this single function.
 * Page and layout render in one top-level renderToString() pass; each island
 * instance renders through its own nested synchronous call (marker.js), so an
 * island used three times renders three times. Synchronous throughout, which
 * is why island SSR modules must be pre-loaded.
 */

import { basename } from "node:path/posix";

import { h } from "preact";
import { renderToString } from "preact-render-to-string";

import { PAGE_EXT_PATTERN } from "../constants.js";
import { getPageState } from "../islands/pageState.js";
import { layouts } from "../layouts.js";
import { CastroError } from "../utils/errors.js";
import { writeHtmlPage } from "./writeHtmlPage.js";

/**
 * @import { PageMeta } from "../types.d.ts"
 * @import { FunctionComponent } from "preact"
 */

/**
 * @param {{
 *   pageComponent: FunctionComponent<PageMeta & { title: string }>,
 *   outputFilePath: string,
 *   sourceFilePath: string,
 *   pageMeta: PageMeta,
 *   pageCssTags?: string[],
 * }} params
 */
export async function renderPage({
  pageComponent,
  outputFilePath,
  sourceFilePath,
  pageMeta,
  pageCssTags = [],
}) {
  const cssTags = [...pageCssTags];

  const layout = layouts.resolve(pageMeta.layout);

  if (!layout.component) {
    throw new CastroError("LAYOUT_NOT_FOUND", {
      layoutId: layout.id,
      sourceFilePath,
    });
  }

  cssTags.push(...layouts.getCssTags(layout.id));

  const title = pageMeta.title || basename(sourceFilePath).replace(PAGE_EXT_PATTERN, "");

  // Page and layout see the same props, so `title` means the same thing in
  // both — the frontmatter value, or the filename once it has been derived.
  const pageProps = { ...pageMeta, title };

  // h() rather than calling the components directly: Preact installs the hook
  // dispatcher only while rendering a VNode, so a direct call leaves useState
  // and friends without one. Passing props here is what makes them arrive at all.
  const vnodeToRender = h(layout.component, {
    ...pageProps,
    children: h(pageComponent, pageProps),
  });

  const finalHtml = renderToString(vnodeToRender);

  const state = getPageState();

  await writeHtmlPage(finalHtml, outputFilePath, {
    cssTags,
    usedIslands: state.usedIslands,
  });
}
