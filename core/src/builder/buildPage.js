import { dirname, extname, join } from "node:path/posix";
import { h } from "preact";
import { config } from "../config.js";
import { OUTPUT_DIR, PAGE_EXT_PATTERN, PAGES_DIR } from "../constants.js";
import { CastroError } from "../utils/errors.js";
import { compileJSX } from "./compileJsx.js";
import { parseFrontmatter } from "./markdown.js";
import { renderPage } from "./renderPage.js";
import { writeCSSFiles } from "./writeCss.js";

/**
 * @param {string} relativeSourcePath - Relative path of source file
 */
export async function buildPage(relativeSourcePath) {
	const sourceExt = extname(relativeSourcePath);
	const relativeOutputPath = relativeSourcePath.replace(
		PAGE_EXT_PATTERN,
		".html",
	);

	const outputFilePath = join(OUTPUT_DIR, relativeOutputPath);
	const sourceFilePath = join(PAGES_DIR, relativeSourcePath);

	if (sourceExt === ".md") {
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

	if (!pageModule.default || typeof pageModule.default !== "function") {
		throw new CastroError("PAGE_NO_DEFAULT_EXPORT", { file: sourceFilePath });
	}

	// Write CSS files to output directory and collect their <link> tags
	const outputDir = dirname(outputFilePath);
	const pageCssTags = await writeCSSFiles(cssFiles, outputDir);

	// Use shared rendering pipeline
	// Pass the page component function to be called to get a VNode
	await renderPage({
		createContentVNode: pageModule.default,
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
	const { meta, markdown } = parseFrontmatter(
		sourceFileContent,
		sourceFilePath,
	);

	// Convert markdown to HTML using configured options
	const contentHtml = Bun.markdown.html(
		markdown,
		config.markdown?.options ?? {},
	);

	// Use shared rendering pipeline
	await renderPage({
		createContentVNode: () =>
			h("div", {
				dangerouslySetInnerHTML: { __html: contentHtml },
			}),
		outputFilePath,
		sourceFilePath,
		pageMeta: meta,
	});
}
