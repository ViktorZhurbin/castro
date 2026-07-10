/**
 * Codegen — the only pass with judgment in it.
 *
 * Turns the node tree into a `createElement(...)` expression. The single
 * decision it makes, per `{}` hole, is whether to inline it (static, set once)
 * or wrap it in a thunk `() => (expr)` (dynamic, bound reactively by the
 * castro-jsx runtime, which treats any function as reactive). It never parses
 * the expression inside the braces — it only decides what to do with it.
 *
 * @import { CNode, CElement } from "./types.js"
 */

const IF = "comrade:if";

/**
 * Emit the whole template as a single Fragment expression.
 *
 * @param {CNode[]} nodes
 * @returns {string}
 */
export function emit(nodes) {
	return `createElement(Fragment, null${args(children(nodes))})`;
}

/**
 * @param {CNode[]} nodes
 * @returns {string[]} flat list of argument expressions
 */
function children(nodes) {
	return nodes.flatMap((node) =>
		node.type === "text" ? text(node.value) : [element(node)],
	);
}

/**
 * @param {CElement} node
 * @returns {string}
 */
function element(node) {
	// comrade:if turns the element into a reactive child: () => cond ? <el> : null
	const cond = node.attrs[IF];
	const attrs = cond ? omit(node.attrs, IF) : node.attrs;
	const el = `createElement(${str(node.tag)}, ${props(attrs)}${args(children(node.children))})`;
	return cond ? `() => (${unwrap(cond)}) ? ${el} : null` : el;
}

/**
 * Split a text node into static string segments and reactive `{expr}` holes.
 *
 * @param {string} value
 * @returns {string[]}
 */
function text(value) {
	/** @type {string[]} */
	const parts = [];
	let last = 0;
	for (const m of value.matchAll(/\{([^{}]+)\}/g)) {
		const index = m.index ?? 0;
		if (index > last) parts.push(str(value.slice(last, index)));
		parts.push(`() => (${(m[1] ?? "").trim()})`);
		last = index + m[0].length;
	}
	if (last < value.length) parts.push(str(value.slice(last)));
	return parts;
}

/**
 * @param {Record<string, string>} attrs
 * @returns {string} an object literal, or "null"
 */
function props(attrs) {
	const keys = Object.keys(attrs);
	if (keys.length === 0) return "null";

	const entries = keys.map((key) => {
		const value = attrs[key];
		if (!isHole(value)) return `${str(key)}: ${str(value)}`;

		const expr = unwrap(value);
		// Event handlers pass the function straight through; other dynamic
		// attributes get a thunk so the runtime binds them reactively.
		return key.startsWith("on")
			? `${str(key)}: ${expr}`
			: `${str(key)}: () => (${expr})`;
	});

	return `{ ${entries.join(", ")} }`;
}

/** @param {string} value */
function isHole(value) {
	const t = value.trim();
	return t.startsWith("{") && t.endsWith("}");
}

/** @param {string} value */
function unwrap(value) {
	return value.trim().slice(1, -1).trim();
}

/**
 * @param {Record<string, string>} obj
 * @param {string} key
 */
function omit(obj, key) {
	const { [key]: _, ...rest } = obj;
	return rest;
}

/** @param {string[]} list */
function args(list) {
	return list.length ? `, ${list.join(", ")}` : "";
}

/** @param {string} value */
function str(value) {
	return JSON.stringify(value);
}
