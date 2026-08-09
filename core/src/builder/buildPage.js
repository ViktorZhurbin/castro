/**
 * Page Builder
 *
 * Builds a single source file (JSX/TSX or Markdown) to an HTML output file.
 * Both paths on every exported function come from the caller: scanPages()
 * already derived the route when it checked for conflicts, so re-deriving it
 * here would be a second copy of the source→route mapping to keep in sync.
 */

import { dirname, extname } from "node:path/posix";

import { h } from "preact";

import { config } from "../config.js";
import { CastroError } from "../utils/errors.js";
import { compileJSX } from "./compileJsx.js";
import { parseFrontmatter } from "./markdown.js";
import { renderPage } from "./renderPage.js";
import { writeCSSFiles } from "./writeCss.js";

/**
 * @param {string} sourceFilePath
 * @param {string} outputFilePath
 */
export async function buildPage(sourceFilePath, outputFilePath) {
  if (extname(sourceFilePath) === ".md") {
    await buildMarkdownPage(sourceFilePath, outputFilePath);
  } else {
    await buildJSXPage(sourceFilePath, outputFilePath);
  }
}

/**
 * Build a single JSX page to HTML
 *
 * @param {string} sourceFilePath
 * @param {string} outputFilePath
 */

async function buildJSXPage(sourceFilePath, outputFilePath) {
  // Compile and import the JSX page (also extracts CSS)
  const { module: pageModule, cssFiles } = await compileJSX(sourceFilePath);

  if (typeof pageModule.default !== "function") {
    throw new CastroError("PAGE_NO_DEFAULT_EXPORT", { file: sourceFilePath });
  }

  // Write CSS files to output directory and collect their <link> tags
  const outputDir = dirname(outputFilePath);
  const pageCssTags = await writeCSSFiles(cssFiles, outputDir);

  // Use shared rendering pipeline
  await renderPage({
    pageComponent: pageModule.default,
    outputFilePath,
    sourceFilePath,
    pageMeta: pageModule.meta || {},
    pageCssTags,
  });
}

/**
 * Build a single markdown file to HTML
 *
 * @param {string} sourceFilePath
 * @param {string} outputFilePath
 */

async function buildMarkdownPage(sourceFilePath, outputFilePath) {
  // Markdown pages skip Bun.build entirely — no CSS extraction step.
  // They inherit layout CSS via renderPage(), but have no page-level CSS.
  const sourceFileContent = await Bun.file(sourceFilePath).text();
  const { meta, markdown } = parseFrontmatter(sourceFileContent, sourceFilePath);

  // Convert markdown to HTML using configured options
  const contentHtml = Bun.markdown.html(markdown, config.markdown?.options ?? {});

  // Use shared rendering pipeline
  await renderPage({
    pageComponent: () =>
      h("div", {
        dangerouslySetInnerHTML: { __html: contentHtml },
      }),
    outputFilePath,
    sourceFilePath,
    pageMeta: meta,
  });
}
