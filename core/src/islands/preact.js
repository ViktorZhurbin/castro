/**
 * Preact Island Bindings
 *
 * Islands are always Preact — so is page/layout rendering (see CLAUDE.md).
 * This is the small set of Preact-specific values the island build needs: the
 * JSX build config, the deps to vendor, the browser hydration source path, and
 * the SSR renderer. It replaced a framework registry that only ever had one
 * entry.
 */

import { join } from "node:path/posix";

import { h } from "preact";
import { renderToString } from "preact-render-to-string";

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
export const PREACT_CLIENT_DEPS = ["preact", "preact/hooks", "preact/jsx-runtime"];

/**
 * Browser hydration module, inlined verbatim into each island bundle.
 * `import.meta.dir`, not `new URL(...).pathname` — the URL form percent-encodes
 * spaces and other reserved characters, and `Bun.file()` can't read the result.
 */
export const PREACT_CLIENT_PATH = join(import.meta.dir, "preact.client.js");

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
  return renderToString(h(/** @type {ComponentType<any>} */ (Component), props));
}
