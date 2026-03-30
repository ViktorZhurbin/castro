import type { Children } from "./dom/index";

// The castro-jsx build plugin uses classic mode (createElement factory), so these are
// only resolved by TypeScript — not imported at runtime.
export declare function jsx(
	type: string | ((props: Record<string, any>) => Node),
	props: Record<string, any> | null,
	key?: string,
): Node;
export declare const jsxs: typeof jsx;
export { Fragment } from "./dom/index";

/**
 * A value or a zero-argument getter — castro-jsx's reactive attribute pattern.
 * The DOM runtime wraps function props in effects; plain values are set once.
 */
export type Signalish<T> = T | (() => T);

/** Shorthand for Signalish<T>. */
type S<T> = Signalish<T>;

/** Event handler type. */
type Handler<E extends Event = Event> = (event: E) => void;

/**
 * Props accepted by any HTML element in castro-jsx.
 * All attribute values accept either a plain value or a reactive getter function.
 * Event handler names follow `on<EventName>` convention (e.g. `onClick`, `onInput`).
 */
type HTMLProps = {
	class?: S<string | undefined>;
	style?: S<string | undefined>;
	id?: S<string | undefined>;
	hidden?: S<boolean | undefined>;
	tabindex?: S<number | string | undefined>;
	title?: S<string | undefined>;
	href?: S<string | undefined>;
	src?: S<string | undefined>;
	alt?: S<string | undefined>;
	type?: S<string | undefined>;
	value?: S<string | number | undefined>;
	checked?: S<boolean | undefined>;
	disabled?: S<boolean | undefined>;
	placeholder?: S<string | undefined>;
	name?: S<string | undefined>;
	min?: S<number | string | undefined>;
	max?: S<number | string | undefined>;
	selected?: S<boolean | undefined>;
	readonly?: S<boolean | undefined>;
	required?: S<boolean | undefined>;
	for?: S<string | undefined>;
	target?: S<string | undefined>;
	rel?: S<string | undefined>;
	action?: S<string | undefined>;
	method?: S<string | undefined>;
	width?: S<number | string | undefined>;
	height?: S<number | string | undefined>;
	children?: Children;
	onClick?: Handler<MouseEvent>;
	onInput?: Handler<InputEvent>;
	onChange?: Handler<Event>;
	onSubmit?: Handler<SubmitEvent>;
	onKeyDown?: Handler<KeyboardEvent>;
	onKeyUp?: Handler<KeyboardEvent>;
	onFocus?: Handler<FocusEvent>;
	onBlur?: Handler<FocusEvent>;
	onMouseEnter?: Handler<MouseEvent>;
	onMouseLeave?: Handler<MouseEvent>;
	// Any other attribute — accepts reactive getters, event handlers, or static values
	[attr: string]:
		| S<string | number | boolean | null | undefined>
		| Handler
		| Children
		| undefined;
};

export declare namespace JSX {
	type Element = Node;

	interface IntrinsicElements {
		[tagName: string]: HTMLProps;
	}
}
