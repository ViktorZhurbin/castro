export {
	Accessor,
	createEffect,
	createSignal,
	Setter,
} from "../../signals/index.d.ts";

/** A valid child in bare-jsx: DOM nodes, primitives, or reactive functions. */
export type Child =
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| (() => Child);
export type Children = Child | Child[];

/** A bare-jsx component function — receives props, returns a DOM node. */
export type Component = (props: Record<string, any>) => Node;

/** JSX factory — turns `<div class="x">` into real DOM nodes. */
export function h(
	tag: string | Component,
	props: Record<string, any> | null,
	...children: Children[]
): Node;

/** Groups children without a wrapper element via DocumentFragment. */
export function Fragment(props: { children: Children }): DocumentFragment;
