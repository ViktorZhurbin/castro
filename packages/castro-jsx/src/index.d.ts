/** A valid child in castro-jsx: DOM nodes, primitives, or reactive functions. */
export type Child =
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| (() => Child);
export type Children = Child | Child[];

/** A castro-jsx component function — receives props, returns a DOM node. */
export type Component = (props: Record<string, any>) => Node;

/** JSX factory — turns `<div class="x">` into real DOM nodes. */
export function createElement(
	tag: string | Component,
	props: Record<string, any> | null,
	...children: Children[]
): Node;

/** Groups children without a wrapper element via DocumentFragment. */
export function Fragment(props: { children: Children }): DocumentFragment;

// Classic JSX transform (`@jsx createElement`) resolves the `JSX` namespace
// globally, not through `jsxImportSource` — so intrinsic elements are typed
// here rather than per-tag, matching the runtime's untyped setAttribute model.
declare global {
	namespace JSX {
		type Element = Node;
		interface IntrinsicElements {
			[tag: string]: Record<string, any>;
		}
		interface ElementChildrenAttribute {
			children: {};
		}
	}
}
