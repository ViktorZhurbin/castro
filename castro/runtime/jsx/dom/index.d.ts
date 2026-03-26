export {
	createEffect,
	createMemo,
	createSignal,
} from "../../signals/index.d.ts";

/** JSX factory — creates real DOM elements with reactive bindings. */
export function h(
	tag: string | Function,
	props: Record<string, any> | null,
	...children: any[]
): Node;

/** Groups children without a wrapper element via DocumentFragment. */
export function Fragment(props: { children: any }): DocumentFragment;
