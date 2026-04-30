import { h } from "preact";

/**
 * Serializes a function and executes it immediately in the browser.
 * Perfect for 0kb interactive elements that don't need a framework runtime.
 */
export function ClientScript({
	fn,
	args = [],
}: {
	fn: (...args: never) => unknown;
	args?: unknown[];
}) {
	const argsString = args.map(serializeArg).join(", ");

	// Stringify the function invocation with args (IIFE)
	const scriptContent = `(${fn.toString()})(${argsString});`;

	return h("script", {
		dangerouslySetInnerHTML: { __html: scriptContent },
	});
}

/**
 * Safely serializes arguments for cross-network boundary execution.
 * Handles `undefined` correctly to prevent syntax errors (e.g., `fn(1,,3)`).
 * Throws at build time if the user tries to pass an unserializable type.
 */
function serializeArg(arg: unknown): string {
	if (arg === undefined) {
		return "undefined";
	}

	const type = typeof arg;
	if (type === "function" || type === "symbol") {
		throw new Error(
			`ClientScript: Cannot pass ${type}s as arguments. ` +
				`Arguments must be JSON-serializable to cross the server/client boundary.`,
		);
	}

	return JSON.stringify(arg);
}
