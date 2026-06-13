/**
 * Markdown frontmatter parsing.
 *
 * Splits a markdown file's optional YAML frontmatter block from its body.
 * Kept out of buildPage.js so that file stays a thin md/jsx dispatcher —
 * this is the one chunky helper the markdown path needs.
 */

import { CastroError } from "../utils/errors.js";

/**
 * Parse YAML frontmatter from a markdown file.
 *
 * Extracts the YAML block between --- delimiters and returns
 * the parsed data and remaining markdown content.
 *
 * @param {string} fileContent - Raw file content with optional frontmatter
 * @param {string} sourceFilePath
 * @returns {{ meta: Record<string, unknown>, markdown: string }}
 */
export function parseFrontmatter(fileContent, sourceFilePath) {
	/**
	 * Grammar ported from vfile-matter (github.com/vfile/vfile-matter).
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
		const yamlBlock = match.groups.yaml.trim();
		// match[0] spans both fences, so the body is everything after it.
		const markdown = fileContent.slice(match[0].length);

		const parsed = yamlBlock ? Bun.YAML.parse(yamlBlock) : {};

		const meta = /** @type {Record<string, unknown>} */ (
			typeof parsed === "object" && parsed !== null ? parsed : {}
		);

		return { meta, markdown };
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		throw new CastroError("YAML_PARSE_FAILED", {
			sourceFilePath,
			errorMessage: err instanceof Error ? err.message : String(err),
		});
	}
}
