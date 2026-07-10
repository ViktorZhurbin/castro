/**
 * Hand-written recursive-descent parser: template string → `CNode[]`.
 *
 * Unlocks unquoted `={expr}` attributes: real HTML grammar ends an unquoted value at the first
 * space or `>`, which breaks on `comrade:if={count() > 5}`. This parser instead
 * reads a balanced `{...}` span for both quoted and unquoted holes, so spaces
 * and `>` inside the braces are just part of the expression. It does not track
 * quotes *inside* an expression, so a hole containing a string literal with an
 * unbalanced `}` (e.g. `title={"foo}bar"}`) will mis-parse — acceptable for v0.
 *
 * `{}` holes survive untouched: in text they ride along inside the text value,
 * in attributes they come through as the full `{expr}` span (braces included).
 * Interpreting them is codegen's job, not the parser's.
 *
 * @import { CNode, CElement } from "./types.js"
 */

const TAG_NAME = /[a-zA-Z][a-zA-Z0-9-]*/y;
const ATTR_NAME = /[^\s=/>]+/y;
const WHITESPACE = /\s*/y;

/**
 * @param {string} template
 * @returns {CNode[]}
 */
export function parse(template) {
	return parseNodes(template, 0, null).nodes;
}

/**
 * Parse siblings until EOF or a closing tag for `parentTag`.
 *
 * @param {string} input
 * @param {number} pos
 * @param {string | null} parentTag
 * @returns {{ nodes: CNode[], pos: number }}
 */
function parseNodes(input, pos, parentTag) {
	/** @type {CNode[]} */
	const nodes = [];

	while (pos < input.length && !isClosingTag(input, pos)) {
		const step = parseNext(input, pos);
		if (step.node) nodes.push(step.node);
		pos = step.pos;
	}

	if (pos < input.length && parentTag === null) {
		throw new Error(`Unexpected closing tag at position ${pos}`);
	}

	return { nodes, pos };
}

/**
 * One parsing step at `pos`: a comment (no node), an element, or a run of
 * text up to the next tag.
 *
 * @param {string} input
 * @param {number} pos
 * @returns {{ node: CNode | null, pos: number }}
 */
function parseNext(input, pos) {
	if (input.startsWith("<!--", pos)) {
		return { node: null, pos: skipComment(input, pos) };
	}

	if (input[pos] === "<") return parseElement(input, pos);

	const { value, pos: next } = readUntil(input, pos, "<");
	// Drop whitespace-only text between elements, as JSX does.
	/** @type {CNode | null} */
	const node = value.trim() === "" ? null : { type: "text", value };
	return { node, pos: next };
}

/**
 * @param {string} input
 * @param {number} pos
 * @returns {boolean}
 */
function isClosingTag(input, pos) {
	return input[pos] === "<" && input[pos + 1] === "/";
}

/**
 * @param {string} input
 * @param {number} pos position of the opening `<`
 * @returns {{ node: CElement, pos: number }}
 */
function parseElement(input, pos) {
	pos += 1; // consume "<"

	const tag = match(TAG_NAME, input, pos);
	if (!tag) throw new Error(`Expected a tag name at position ${pos}`);
	pos += tag.length;

	/** @type {Record<string, string>} */
	const attrs = {};
	pos = skipWhitespace(input, pos);
	while (pos < input.length && input[pos] !== "/" && input[pos] !== ">") {
		const name = match(ATTR_NAME, input, pos);
		if (!name) break;
		pos += name.length;

		pos = skipWhitespace(input, pos);
		if (input[pos] === "=") {
			pos = skipWhitespace(input, pos + 1);
			const value = readAttrValue(input, pos);
			attrs[name] = value.value;
			pos = value.pos;
		} else {
			attrs[name] = "";
		}
		pos = skipWhitespace(input, pos);
	}

	const selfClosing = input[pos] === "/" && input[pos + 1] === ">";
	if (selfClosing) {
		return {
			node: { type: "element", tag: tag.toLowerCase(), attrs, children: [] },
			pos: pos + 2,
		};
	}

	if (input[pos] !== ">") throw new Error(`Expected ">" at position ${pos}`);
	pos += 1; // consume ">"

	const { nodes: children, pos: afterChildren } = parseNodes(input, pos, tag);

	const closeAt = input.indexOf(">", afterChildren);
	if (closeAt === -1) throw new Error(`Unclosed tag "${tag}"`);

	return {
		node: { type: "element", tag: tag.toLowerCase(), attrs, children },
		pos: closeAt + 1,
	};
}

/**
 * Read an attribute value at `pos`: quoted, brace-expression, or bare token.
 *
 * @param {string} input
 * @param {number} pos
 * @returns {{ value: string, pos: number }}
 */
function readAttrValue(input, pos) {
	const quote = input[pos];
	if (quote === '"' || quote === "'") {
		const end = input.indexOf(quote, pos + 1);
		if (end === -1)
			throw new Error(`Unterminated quoted value at position ${pos}`);
		return { value: input.slice(pos + 1, end), pos: end + 1 };
	}

	if (quote === "{") return readBraceExpr(input, pos);

	return readUntil(input, pos, /[\s/>]/);
}

/**
 * Read a balanced `{...}` span starting at `pos`, braces included — so
 * `comrade:if={count() > 5}` reads as one token despite the space and `>`.
 *
 * @param {string} input
 * @param {number} pos position of the opening "{"
 * @returns {{ value: string, pos: number }}
 */
function readBraceExpr(input, pos) {
	let depth = 0;
	let i = pos;
	for (; i < input.length; i++) {
		if (input[i] === "{") depth += 1;
		else if (input[i] === "}") {
			depth -= 1;
			if (depth === 0) {
				i += 1;
				break;
			}
		}
	}
	if (depth !== 0) throw new Error(`Unbalanced "{" at position ${pos}`);
	return { value: input.slice(pos, i), pos: i };
}

/**
 * @param {string} input
 * @param {number} pos
 * @param {string | RegExp} stop single char or regex matched char-by-char
 * @returns {{ value: string, pos: number }}
 */
function readUntil(input, pos, stop) {
	const test =
		typeof stop === "string"
			? /** @param {string} c */ (c) => c === stop
			: /** @param {string} c */ (c) => stop.test(c);

	let i = pos;
	while (i < input.length && !test(input[i])) i += 1;
	return { value: input.slice(pos, i), pos: i };
}

/**
 * @param {string} input
 * @param {number} pos
 * @returns {number}
 */
function skipComment(input, pos) {
	const end = input.indexOf("-->", pos);
	return end === -1 ? input.length : end + 3;
}

/**
 * @param {string} input
 * @param {number} pos
 * @returns {number}
 */
function skipWhitespace(input, pos) {
	const ws = match(WHITESPACE, input, pos);
	return pos + (ws?.length ?? 0);
}

/**
 * @param {RegExp} regex sticky (`y` flag) regex
 * @param {string} input
 * @param {number} pos
 * @returns {string | null}
 */
function match(regex, input, pos) {
	regex.lastIndex = pos;
	const result = regex.exec(input);
	return result?.[0] ?? null;
}
