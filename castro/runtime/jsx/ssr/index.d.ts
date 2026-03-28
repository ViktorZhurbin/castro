/** Wraps an HTML string to distinguish safe markup from user text. */
export class HtmlString {
	constructor(html: string);
	value: string;
}

/** A valid child in SSR: HtmlStrings, primitives, or reactive functions. */
export type Child =
	| HtmlString
	| string
	| number
	| boolean
	| null
	| undefined
	| (() => Child);
export type Children = Child | Child[];

/** A bare-jsx component function — receives props, returns an HtmlString. */
export type Component = (props: Record<string, any>) => HtmlString;

/** JSX factory — turns `<div class="x">` into an HTML string. */
export function h(
	tag: string | Component,
	props: Record<string, any> | null,
	...children: Children[]
): HtmlString;

/** Concatenates children into a single HtmlString. */
export function Fragment(props: { children: Children }): HtmlString;
