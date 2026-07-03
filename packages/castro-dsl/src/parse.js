/**
 * The swappable parser seam. Its only contract: a template string → `CNode[]`.
 *
 * Today it adapts node-html-parser. A hand-written minimal parser could replace
 * this one file with zero downstream changes — that's the whole point of the
 * seam (and the unlock for unquoted `={expr}` attributes; see EXPLORATIONS.md).
 *
 * `{}` holes survive untouched: in text they ride along inside the text value,
 * in attributes they come through as the (quote-stripped) attribute string.
 * Interpreting them is codegen's job, not the parser's.
 *
 * @import { CNode } from "./types.js"
 */

import { parse as parseHtml } from "node-html-parser";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
 * @param {string} template
 * @returns {CNode[]}
 */
export function parse(template) {
	return adapt(parseHtml(template).childNodes);
}

/**
 * @param {any[]} nodes
 * @returns {CNode[]}
 */
function adapt(nodes) {
	/** @type {CNode[]} */
	const out = [];
	for (const node of nodes) {
		if (node.nodeType === TEXT_NODE) {
			// Drop whitespace-only text between elements, as JSX does.
			if (node.rawText.trim() === "") continue;
			out.push({ type: "text", value: node.rawText });
		} else if (node.nodeType === ELEMENT_NODE) {
			out.push({
				type: "element",
				tag: node.rawTagName.toLowerCase(),
				attrs: { ...node.attributes },
				children: adapt(node.childNodes),
			});
		}
		// comments and anything else are ignored
	}
	return out;
}
