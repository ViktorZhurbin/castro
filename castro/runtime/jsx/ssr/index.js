/**
 * JSX SSR Runtime — HTML String Generation
 *
 * Server-side counterpart to jsx/dom.js. Same h(tag, props, ...children)
 * interface, but returns HTML strings. Function values (signals) are
 * resolved immediately — no reactivity on the server, just a snapshot.
 *
 * HtmlString distinguishes framework markup (safe) from user text
 * (needs escaping), preventing XSS — same role as React's $$typeof.
 */

/**
 * @import { Children } from "./index.d.ts"
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
 * Escapes the four HTML-significant characters: & < > "
 * Single quotes are safe — attribute values are always double-quoted.
 * @param {string} str
 */
function escapeHtml(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/**
 * Resolves a child value to an HTML string. Server-side counterpart
 * to appendChild in jsx/dom.js. HtmlString passes through as safe
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

	return escapeHtml(String(val));
}

/**
 * JSX factory — turns `<div class="x">` into an HTML string.
 *
 * @param {string | ((props: Record<string, any>) => HtmlString)} tag
 * @param {Record<string, any> | null} props
 * @param {...Children} children
 * @returns {HtmlString}
 */
export function h(tag, props, ...children) {
	if (typeof tag === "function") {
		const result = tag({
			...props,
			children: children.length === 1 ? children[0] : children,
		});
		// Components should return HtmlString (from calling h() internally),
		// but if one returns a raw string/number, escape it to prevent XSS.
		if (result instanceof HtmlString) {
			return result;
		}

		return new HtmlString(escapeHtml(String(result ?? "")));
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
			resolved === true
				? ` ${key}`
				: ` ${key}="${escapeHtml(String(resolved))}"`;

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
