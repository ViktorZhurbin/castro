/** Wraps an HTML string to distinguish safe markup from user text. */
export class HtmlString {
	constructor(html: string);
	value: string;
}

/** JSX factory for SSR — produces HTML strings, not DOM nodes. */
export function h(
	tag: string | Function,
	props: Record<string, any> | null,
	...children: any[]
): HtmlString;

/** Concatenates children into a single HtmlString. */
export function Fragment(props: { children: any }): HtmlString;
