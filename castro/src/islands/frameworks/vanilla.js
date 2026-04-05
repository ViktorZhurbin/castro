/**
 * Vanilla Framework Configuration
 *
 * A plain JavaScript island with zero framework runtime.
 * The island is server-rendered as JSX (reusing Preact), but the client
 * hydration is pure JavaScript — no VDOM, no reactive state, just DOM.
 *
 * Perfect for D3 charts, Three.js canvases, or simple DOM interactions.
 */

import { h } from "preact";
import { render } from "preact-render-to-string";

/**
 * @import { FrameworkConfig } from "./types.d.ts"
 */

/** @type {FrameworkConfig} */
export default {
	id: "vanilla",

	/**
	 * Bun.build settings for compiling vanilla components.
	 * Uses automatic JSX for parsing the file (the default export uses JSX).
	 * For client builds, externalize Preact so it isn't bundled — the virtual
	 * entry only imports the named hydrate export anyway, so the JSX code
	 * won't be referenced at runtime.
	 */
	getBuildConfig: (target) => ({
		jsx: { runtime: "automatic", importSource: "preact" },
		// Externalize Preact in client build; for SSR, Preact is a build dep
		external: target === "ssr" ? [] : ["preact", "preact/jsx-runtime"],
	}),

	/** Zero client dependencies — vanilla hydration ships nothing */
	clientDependencies: [],

	/**
	 * Only import the hydrate function; the default export (JSX) is
	 * unused by the client. Bun's tree-shaking eliminates the SSR code
	 * and its JSX imports, resulting in pure vanilla JavaScript.
	 */
	virtualEntryImport: (basename) => `import { hydrate } from './${basename}';`,

	/**
	 * Client-side hydration: just call the hydrate function with the
	 * container DOM element and props.
	 */
	hydrateFnString: `
		if (hydrate) {
			hydrate(container, props);
		}
	`,

	/**
	 * Server-side rendering: use Preact's h() and renderToString()
	 * for SSR. The default export is a regular JSX component.
	 */
	renderSSR: (Component, props) =>
		render(h(/** @type {any} */ (Component), props)),
};
