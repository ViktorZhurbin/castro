import { dirname, extname, join } from "node:path";
import { styleText } from "node:util";
import { h } from "preact";
import { OUTPUT_DIR, PAGES_DIR } from "../constants.js";
import { messages } from "../messages/index.js";
import { validateMeta } from "../utils/validateMeta.js";
import { compileJSX } from "./compile-jsx.js";
import { renderPage } from "./render-page.js";
import { writeCSSFiles } from "./write-css.js";

/**
 * @param {string} relativeSourcePath - Relative path of source file
 */
export async function buildPage(relativeSourcePath) {
	const sourceExt = extname(relativeSourcePath);
	const relativeOutputPath = relativeSourcePath.replace(sourceExt, ".html");

	const outputFilePath = join(OUTPUT_DIR, relativeOutputPath);
	const sourceFilePath = join(PAGES_DIR, relativeSourcePath);

	try {
		if (sourceExt === ".md") {
			await buildMarkdownPage(sourceFilePath, outputFilePath);
		} else {
			await buildJSXPage(sourceFilePath, outputFilePath);
		}
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.error(
			styleText("red", messages.build.fileFailure(sourceFilePath, err.message)),
		);
		throw err;
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
		throw new Error(messages.errors.jsxNoExport(sourceFilePath));
	}

	// Write CSS files to output directory and collect assets
	const outputDir = dirname(outputFilePath);
	const pageCssAssets = await writeCSSFiles(cssFiles, outputDir);

	// Extract metadata (includes layout preference)
	const meta = pageModule.meta || {};

	// Validate metadata against schema
	const validatedMeta = validateMeta(meta, sourceFilePath);

	// Use shared rendering pipeline
	// Pass the page component function so it can be called with the hook active
	await renderPage({
		createContentVNode: pageModule.default,
		outputFilePath,
		sourceFilePath,
		pageMeta: validatedMeta,
		pageCssAssets,
	});
}

/**
 * Build a single markdown file to HTML
 *
 * @param {string} sourceFilePath
 * @param {string} outputFilePath
 */

async function buildMarkdownPage(sourceFilePath, outputFilePath) {
	// Read and parse markdown with frontmatter
	const sourceFileContent = await Bun.file(sourceFilePath).text();
	const { meta, markdown } = parseFrontmatter(sourceFileContent);

	// Type assertion: we know meta is valid PageMeta after validation
	const validatedMeta = validateMeta(meta, sourceFilePath);

	// Convert markdown to HTML
	const contentHtml = Bun.markdown.html(markdown);

	// Use shared rendering pipeline
	// Pass a function that creates the VNode wrapper for markdown content
	await renderPage({
		createContentVNode: () =>
			h("div", {
				dangerouslySetInnerHTML: { __html: contentHtml },
			}),
		outputFilePath,
		sourceFilePath,
		pageMeta: validatedMeta,
	});
}

/**
 * Parse YAML frontmatter from a markdown file
 *
 * Extracts the YAML block between --- delimiters and returns
 * the parsed data and remaining markdown content.
 *
 * @param {string} fileContent - Raw file content with optional frontmatter
 * @returns {{ meta: Record<string, unknown>, markdown: string }}
 */
function parseFrontmatter(fileContent) {
	/**
	 * Regex based on "vfile-matter": https://github.com/vfile/vfile-matter/blob/main/lib/index.js#L37
	 * ^---               - Start of file + opening delimiter.
	 * (?:\r?\n|\r)       - Line break (LF, CRLF, or CR).
	 * (?<yaml>[\s\S]*?)  - Named group "yaml": non-greedy match of content.
	 * (?:\r?\n|\r)?      - Optional line break before closing (handles empty blocks).
	 * ---                - Closing delimiter.
	 * (?:\r?\n|\r|$)     - Line break OR end of file (prevents partial matches).
	 */
	const regex =
		/^---(?:\r?\n|\r)(?<yaml>[\s\S]*?)(?:\r?\n|\r)?---(?:\r?\n|\r|$)/;

	const match = regex.exec(fileContent);

	if (!match?.groups) {
		return { meta: {}, markdown: fileContent };
	}

	try {
		// match[0] is the whole block (---yaml---)
		const yamlBlock = match.groups.yaml.trim();
		const markdown = fileContent.slice(match[0].length);

		// Using Bun's native high-performance YAML parser
		const parsed = yamlBlock ? Bun.YAML.parse(yamlBlock) : {};

		const meta = /** @type {Record<string, unknown>} */ (
			typeof parsed === "object" && parsed !== null ? parsed : {}
		);

		return { meta, markdown };
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		throw new Error(`Failed to parse YAML frontmatter: ${err.message}`);
	}
}
