/**
 * JSX DOM Runtime — Real DOM Nodes with Reactive Bindings
 *
 * A no-virtual-DOM JSX factory. When a prop or child is a function
 * (signal getter), it's wrapped in an effect that updates that specific
 * DOM node or attribute — no re-rendering, no diffing. Conceptually
 * how SolidJS works, minus the compiler.
 */

/**
 * @import { Children } from "./index.d.ts"
 */

import { createEffect } from "../../signals/index.js";

/**
 * Sets or removes an attribute on a DOM element.
 * Boolean `true` → bare attribute (`disabled`), falsy → remove.
 * Uses `class` not `className`, string `style` not object — we call
 * setAttribute directly, no React-style prop mapping.
 *
 * @param {Element} element
 * @param {string} key
 * @param {string | boolean | number | null | undefined} value
 */
function setAttr(element, key, value) {
	if (value == null || value === false) {
		element.removeAttribute(key);
	} else {
		element.setAttribute(key, value === true ? "" : String(value));
	}
}

/**
 * JSX factory — turns `<div class="x">` into real DOM nodes.
 *
 * @param {string | ((props: Record<string, any>) => Node)} tag
 * @param {Record<string, any> | null} props
 * @param {...Children} children
 * @returns {Node}
 */
export function createElement(tag, props, ...children) {
	if (typeof tag === "function") {
		return tag({
			...props,
			children: children.length === 1 ? children[0] : children,
		});
	}

	const element = document.createElement(tag);

	// Event handlers must be checked first — `onClick` is a function
	// but should addEventListener, not create a reactive effect.
	for (const [key, value] of Object.entries(props ?? {})) {
		if (key === "children") continue;

		if (key.startsWith("on") && typeof value === "function") {
			element.addEventListener(key.slice(2).toLowerCase(), value);
		} else if (typeof value === "function") {
			createEffect(() => setAttr(element, key, value()));
		} else {
			setAttr(element, key, value);
		}
	}

	for (const child of children.flat(Infinity)) {
		appendChild(element, child);
	}

	return element;
}

/**
 * Appends a child to a parent element. Function children are
 * treated as reactive and bound via effect.
 *
 * @param {Node} parent
 * @param {any} child
 */
function appendChild(parent, child) {
	if (child == null || child === false || child === true) return;

	if (child instanceof Node) {
		parent.appendChild(child);
	} else if (typeof child === "function") {
		bindReactiveChild(parent, child);
	} else {
		parent.appendChild(document.createTextNode(String(child)));
	}
}

/**
 * Binds a reactive child to the DOM using a stable anchor pattern.
 * A permanent comment node marks the insertion point — it never moves.
 * On each signal change, old nodes are removed and new ones inserted
 * before the anchor. This supports Fragments (which dissolve on insert)
 * because we snapshot their childNodes before insertion.
 *
 * Reactive children in JSX:
 *   {count}                → signal getter returning text
 *   {show() && <X />}      → conditional returning node or false
 *   {a() ? <X /> : <Y />}  → ternary returning different nodes
 *   {() => <><A /><B /></>} → fragment with multiple children
 *
 * @param {Node} parent
 * @param {() => any} child
 */
function bindReactiveChild(parent, child) {
	const anchor = document.createComment("");
	parent.appendChild(anchor);

	/** @type {ChildNode[]} */
	let currentNodes = [];

	createEffect(() => {
		for (const node of currentNodes) node.remove();

		const val = child();

		/** @type {ChildNode[]} */
		let newNodes;
		if (val instanceof DocumentFragment) {
			// Grab children before insertion empties the fragment
			newNodes = /** @type {ChildNode[]} */ (Array.from(val.childNodes));
		} else if (val instanceof Node) {
			newNodes = [/** @type {ChildNode} */ (val)];
		} else if (val != null && val !== false && val !== true) {
			newNodes = [document.createTextNode(String(val))];
		} else {
			// Falsy → empty array; the anchor holds the position
			newNodes = [];
		}

		for (const node of newNodes) anchor.parentNode.insertBefore(node, anchor);
		currentNodes = newNodes;
	});
}

/**
 * Fragment — groups children without a wrapper element.
 * Uses DocumentFragment, which transfers its children to the parent
 * on append (the fragment itself disappears).
 *
 * @param {{ children: Children }} props
 * @returns {DocumentFragment}
 */
export function Fragment({ children }) {
	const frag = document.createDocumentFragment();
	for (const child of [children].flat(Infinity)) {
		appendChild(frag, child);
	}
	return frag;
}
