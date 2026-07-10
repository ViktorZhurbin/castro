/**
 * JSX SSR Runtime — HTML String Generation
 *
 * Server-side counterpart to index.js. Same createElement(tag, props, ...children)
 * interface, but returns HTML strings instead of DOM nodes. Function values
 * (signals) are resolved immediately — no reactivity on the server, just a
 * snapshot at render time.
 *
 * HtmlString distinguishes framework markup (safe) from user text (needs
 * escaping), preventing XSS — same role as React's $$typeof.
 *
 * Resolved via the "bun" export condition in package.json — Bun.build picks
 * this file over index.js whenever target is "bun" (core's SSR compile),
 * with no source rewriting or build plugin required.
 */

/**
 * @import { Children } from "./ssr.d.ts"
 */

/** HTML elements that have no closing tag (self-closing) */
const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
]);

/**
 * Wraps an HTML string so child processing can distinguish framework-
 * generated markup (safe) from user-provided text (needs escaping).
 */
export class HtmlString {
	/** @param {string} html */
	constructor(html) {
		this.value = html;
	}
}

/**
 * Resolves a child value to an HTML string. Server-side counterpart
 * to appendChild in index.js. HtmlString passes through as safe
 * markup; everything else is escaped.
 *
 * @param {any} child
 * @returns {string}
 */
function resolveChild(child) {
	const val = typeof child === "function" ? child() : child;

	if (val == null || val === false || val === true) {
		return "";
	}

	if (val instanceof HtmlString) {
		return val.value;
	}

	return Bun.escapeHTML(val);
}

/**
 * JSX factory — turns `<div class="x">` into an HTML string.
 *
 * @param {string | ((props: Record<string, any>) => HtmlString)} tag
 * @param {Record<string, any> | null} props
 * @param {...Children} children
 * @returns {HtmlString}
 */
export function createElement(tag, props, ...children) {
	if (typeof tag === "function") {
		const result = tag({
			...props,
			children: children.length === 1 ? children[0] : children,
		});
		// Components should return HtmlString (from calling createElement() internally),
		// but if one returns a raw string/number, escape it to prevent XSS.
		if (result instanceof HtmlString) {
			return result;
		}

		return new HtmlString(Bun.escapeHTML(result ?? ""));
	}

	let html = `<${tag}`;

	for (const [key, value] of Object.entries(props ?? {})) {
		// Skip children (handled below) and event handlers (no DOM in SSR)
		if (key === "children" || key.startsWith("on")) {
			continue;
		}

		const resolved = typeof value === "function" ? value() : value;

		if (resolved == null || resolved === false) {
			continue;
		}

		const propString =
			resolved === true ? ` ${key}` : ` ${key}="${Bun.escapeHTML(resolved)}"`;

		html += propString;
	}

	if (VOID_ELEMENTS.has(tag)) {
		return new HtmlString(`${html} />`);
	}

	html += ">";

	for (const child of children.flat(Infinity)) {
		html += resolveChild(child);
	}

	return new HtmlString(`${html}</${tag}>`);
}

/**
 * Fragment — concatenates children into a single HtmlString.
 *
 * @param {{ children: Children }} props
 * @returns {HtmlString}
 */
export function Fragment({ children }) {
	let html = "";
	// children comes from props (may be a single element), so wrap before flattening
	for (const child of [children].flat(Infinity)) {
		html += resolveChild(child);
	}
	return new HtmlString(html);
}
