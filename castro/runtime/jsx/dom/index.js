/**
 * JSX DOM Runtime — Real DOM Nodes with Reactive Bindings
 *
 * A VDOM-less JSX factory. Creates actual DOM elements and wires up
 * fine-grained reactivity via signals. When a prop or child is
 * a function (signal getter), it's wrapped in an effect that updates that
 * specific DOM node or attribute — no re-rendering, no diffing.
 *
 * Conceptually how SolidJS works, minus the compiler: Solid compiles JSX
 * into similar createElement + effect code at build time. Here we do it
 * at runtime via h(), which is simpler to read but slightly less efficient.
 *
 * Conventions (differs from React/Preact):
 * - Use `class`, not `className` (we set attributes directly, no mapping)
 * - Style must be a string, not an object (`style="color: red"`)
 *
 * Limitations:
 * - No fragment-aware reactive replacement (reactive conditionals must
 *   return single root elements, not Fragments — the DocumentFragment
 *   dissolves on insert, breaking subsequent replaceWith calls)
 */

import { createEffect } from "../../signals/index.js";

// Re-exported so island components can import signals from the same
// module the build plugin injects (jsx-dom.js for client, jsx-ssr.js for SSR).
// Without this, components would need a separate import for signals.
export { createEffect, createMemo, createSignal } from "../../signals/index.js";

/**
 * JSX factory — creates real DOM elements with reactive bindings.
 *
 * Runs ONCE per component, producing the actual DOM tree. Reactivity is
 * handled by effects on individual nodes, not by re-rendering.
 *
 * @param {string | Function} tag
 * @param {Record<string, any> | null} props
 * @param {...any} children
 * @returns {Node}
 */
export function h(tag, props, ...children) {
	if (typeof tag === "function") {
		return tag({
			...props,
			children: children.length === 1 ? children[0] : children,
		});
	}

	const element = document.createElement(tag);

	// Props split into three tiers:
	// 1. Event handlers (on* + function) → addEventListener (bound once, not reactive)
	// 2. Reactive values (non-event functions) → effect that re-sets the attribute
	// 3. Static values → setAttribute once
	for (const [key, value] of Object.entries(props ?? {})) {
		if (key === "children") continue;

		if (key.startsWith("on") && typeof value === "function") {
			element.addEventListener(key.slice(2).toLowerCase(), value);
		} else if (typeof value === "function") {
			// Reactive attribute: effect re-sets it whenever the signal changes
			createEffect(() => {
				const resolved = value();
				if (resolved == null || resolved === false) {
					element.removeAttribute(key);
				} else {
					element.setAttribute(key, resolved === true ? "" : String(resolved));
				}
			});
		} else if (value != null && value !== false) {
			element.setAttribute(key, value === true ? "" : String(value));
		}
	}

	for (const child of children.flat(Infinity)) {
		appendStaticChild(element, child);
	}

	return element;
}

/**
 * Appends a static (non-reactive) child to a parent element.
 * Function children are handed off to bindReactiveChild.
 *
 * @param {Node} parent
 * @param {any} child
 */
function appendStaticChild(parent, child) {
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
 * Binds a reactive child (signal, conditional, ternary) to the DOM.
 *
 * Inserts a placeholder comment, then creates an effect that swaps
 * in the current value whenever the signal changes. Each update
 * replaces the previous node in-place via replaceWith().
 *
 * Examples of reactive children:
 *   {count}           → signal getter returning text
 *   {show() && <X />} → conditional returning node or false
 *   {a() ? <X /> : <Y />} → ternary returning different nodes
 *
 * @param {Node} parent
 * @param {Function} child
 */
function bindReactiveChild(parent, child) {
	// Comment node as position anchor — invisible in the DOM, won't affect layout
	const placeholder = document.createComment("");
	let current = /** @type {ChildNode} */ (placeholder);
	parent.appendChild(placeholder);

	createEffect(() => {
		const val = child();

		/** @type {Node} */
		let next;
		if (val instanceof Node) {
			next = val;
		} else if (val != null && val !== false && val !== true) {
			next = document.createTextNode(String(val));
		} else {
			// Falsy/empty → invisible comment node holds the position so
			// the next truthy value can replaceWith() into the same slot
			next = document.createComment("");
		}

		current.replaceWith(next);
		current = /** @type {ChildNode} */ (next);
	});
}

/**
 * Fragment — groups children without a wrapper element.
 * Uses DocumentFragment, a real DOM API that transfers its children
 * to the parent when appended (the fragment itself disappears).
 *
 * @param {{ children: any }} props
 * @returns {DocumentFragment}
 */
export function Fragment({ children }) {
	const frag = document.createDocumentFragment();
	// children comes from props (may be a single element), so wrap before flattening
	for (const child of [children].flat(Infinity)) {
		appendStaticChild(frag, child);
	}
	return frag;
}
