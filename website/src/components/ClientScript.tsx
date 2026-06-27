import { h } from "preact";

/**
 * A way to add an inline script in JSX with SSR.
 */
export function ClientScript(props: {
	args?: readonly unknown[];
	// biome-ignore lint/suspicious/noExplicitAny: this is fine :)
	fn: (...args: any[]) => unknown;
}) {
	const { fn, args = [] } = props;
	const argsString = args.map((a) => JSON.stringify(a)).join(", ");

	return h("script", {
		dangerouslySetInnerHTML: { __html: `(${fn.toString()})(${argsString});` },
	});
}
