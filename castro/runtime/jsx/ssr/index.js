/**
 * JSX SSR Runtime — HTML String Generation
 *
 * Server-side counterpart to jsx-dom.js. Same h(tag, props, ...children)
 * interface, but concatenates HTML strings instead of creating DOM nodes.
 * Function values (signals) are resolved immediately — no reactivity on
 * the server, just a static snapshot.
 *
 * The HtmlString wrapper distinguishes framework-generated markup (safe)
 * from user text (needs escaping), preventing XSS. Same problem React
 * solves with $$typeof symbols — here it's a visible class instead.
 */

// Re-exported so island components can import signals from the same
// module the build plugin injects (jsx-ssr.js for SSR, jsx-dom.js for client).
// Without this, components would need a separate import for signals.
export { createEffect, createMemo, createSignal } from "../../signals/index.js";

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
 * Resolves a child value to an HTML string.
 * Server-side counterpart to appendStaticChild in jsx-dom.js.
 * Functions (signals) are called immediately. HtmlString values pass
 * through as safe markup; everything else is escaped as text.
 *
 * @param {any} child
 * @returns {string}
 */
function resolveChild(child) {
	const val = typeof child === "function" ? child() : child;
	if (val == null || val === false || val === true) return "";
	return val instanceof HtmlString ? val.value : escapeHtml(String(val));
}

/**
 * JSX factory for SSR — produces HTML strings, not DOM nodes.
 *
 * @param {string | Function} tag
 * @param {Record<string, any> | null} props
 * @param {...any} children
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
		return result instanceof HtmlString
			? result
			: new HtmlString(escapeHtml(String(result ?? "")));
	}

	let html = `<${tag}`;

	for (const [key, value] of Object.entries(props ?? {})) {
		// Skip children (handled below) and event handlers (no DOM to bind in SSR)
		if (key === "children" || key.startsWith("on")) continue;

		// Resolve reactive values (signals) to their current snapshot
		const resolved = typeof value === "function" ? value() : value;
		if (resolved == null || resolved === false) continue;

		// Boolean true → bare attribute (e.g. `disabled`), otherwise quoted value
		html +=
			resolved === true
				? ` ${key}`
				: ` ${key}="${escapeHtml(String(resolved))}"`;
	}

	if (VOID_ELEMENTS.has(tag)) return new HtmlString(`${html} />`);

	html += ">";

	for (const child of children.flat(Infinity)) {
		html += resolveChild(child);
	}

	return new HtmlString(`${html}</${tag}>`);
}

/**
 * Fragment — concatenates children into a single HtmlString.
 *
 * @param {{ children: any }} props
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
