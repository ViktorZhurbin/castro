/**
 * Preact Island Bindings
 *
 * Islands are always Preact — so is page/layout rendering (see CLAUDE.md).
 * This is the small set of Preact-specific values the island build needs: the
 * JSX build config, the deps to vendor, the browser hydration source path, and
 * the SSR renderer. It replaced a framework registry that only ever had one
 * entry.
 */

import { h } from "preact";
import { render } from "preact-render-to-string";

/**
 * @import { ComponentType } from "preact"
 * @import { AnyFunction } from "../types.d.ts"
 */

/**
 * Bun.build JSX settings. Automatic runtime, so components don't need
 * `import { h }`. Shared by the client and SSR compiles.
 */
export const PREACT_BUILD_CONFIG = {
	jsx: { runtime: /** @type {const} */ ("automatic"), importSource: "preact" },
};

/** Shared deps vendored to /dist/vendor/ and resolved via the island import map. */
export const PREACT_CLIENT_DEPS = [
	"preact",
	"preact/hooks",
	"preact/jsx-runtime",
];

/** Browser hydration module, inlined verbatim into each island bundle. */
export const PREACT_CLIENT_PATH = new URL("./preact.client.js", import.meta.url)
	.pathname;

/**
 * Render an island to static HTML at build time.
 *
 * `Component` is typed as AnyFunction (the island SSR module's default export is
 * untyped) and cast to a Preact component for the `h()` call.
 *
 * @param {AnyFunction} Component
 * @param {Record<string, unknown>} props
 * @returns {string}
 */
export function renderIslandToString(Component, props) {
	return render(h(/** @type {ComponentType<any>} */ (Component), props));
}
