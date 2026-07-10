/**
 * castro-jsx Island Bindings
 *
 * The second built-in island framework, alongside Preact (preact.js). Unlike
 * Preact, no jsx build-config override is needed: island source files opt in
 * with an explicit import plus a classic-mode pragma (`@jsxRuntime classic` /
 * `@jsx createElement`), which Bun's bundler honors per file even though the
 * project tsconfig is locked to Preact's automatic runtime. The runtime
 * itself lives in packages/castro-jsx — see its docblocks.
 */

/**
 * @import { AnyFunction } from "../types.d.ts"
 */

/** Shared deps vendored to /dist/vendor/ and resolved via the island import map. */
export const CASTRO_JSX_CLIENT_DEPS = ["@vktrz/castro-jsx", "@vktrz/signals"];

/** Browser hydration module, inlined verbatim into each island bundle. */
export const CASTRO_JSX_CLIENT_PATH = new URL(
	import.meta.resolve("@vktrz/castro-jsx/hydrate.client.js"),
).pathname;

/**
 * Render an island to static HTML at build time.
 *
 * The SSR compile resolves `@vktrz/castro-jsx` through its "bun" export
 * condition (src/ssr.js), so calling the component directly returns an
 * HtmlString rather than a DOM node — no factory call needed here, unlike
 * Preact's `h(Component, props)`.
 *
 * `Component` is typed as AnyFunction (the island SSR module's default export is
 * untyped) and cast to its SSR shape for the call.
 *
 * @param {AnyFunction} Component
 * @param {Record<string, unknown>} props
 * @returns {string}
 */
export function renderIslandToString(Component, props) {
	const render = /** @type {(props: Record<string, unknown>) => { value: string }} */ (
		Component
	);
	return render(props).value;
}
