/**
 * Preact Framework Configuration
 *
 * This file contains all Preact-specific settings for island compilation.
 * Educational note: Each framework needs to know:
 * 1. How to compile components (esbuild config)
 * 2. How to hydrate on the client (runtime code)
 * 3. How to render on the server (SSR function)
 * 4. What imports the browser needs (import map)
 */

/**
 * @import * as preact from "preact"
 * @import * as esbuild from "esbuild"
 * @import { ImportMap } from "../types.d.ts"
 */

/**
 * @type {{
 * 	framework: "preact";
 * 	elementPrefix: string;
 * 	getBuildConfig: (ssr?: boolean) => esbuild.BuildOptions;
 * 	importMap: ImportMap;
 * 	hydrateFnString: string;
 * 	renderSSR: (Component: preact.ComponentType, props: Record<string, unknown>) => Promise<string>;
 * }}
 */
export const PreactConfig = {
	framework: "preact",
	elementPrefix: "preact",

	/**
	 * esbuild configuration for compiling Preact components
	 * Uses automatic JSX transform (no need to import h)
	 */
	getBuildConfig: () => ({
		jsx: "automatic",
		jsxImportSource: "preact",
		external: ["preact", "preact/hooks", "preact/jsx-runtime"],
	}),

	/**
	 * Import map tells the browser where to load Preact from
	 * Using esm.sh CDN for zero-config module loading
	 */
	importMap: {
		preact: "https://esm.sh/preact",
		"preact/hooks": "https://esm.sh/preact/hooks",
		"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
	},

	/**
	 * Client-side hydration code
	 * This runs in the browser when an island becomes interactive
	 *
	 * Educational note: hydrate() attaches event listeners to existing HTML
	 * without re-rendering. This is the "magic" of islands - the HTML is
	 * already there from SSR, we just make it interactive.
	 */
	hydrateFnString: `
		const { h, hydrate } = await import("preact");
		hydrate(h(Component, props), container);
	`,

	/**
	 * Server-side rendering function
	 * Runs at build time to generate static HTML
	 */
	renderSSR: async (Component, props) => {
		const { h } = await import("preact");
		const { render } = await import("preact-render-to-string");

		return render(h(Component, props));
	},
};
