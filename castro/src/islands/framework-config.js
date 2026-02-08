/**
 * Framework Configuration Strategy
 *
 * Defines how different frameworks (Preact, Solid) are handled:
 * - Build: Bun.build config (JSX settings, loaders, plugins)
 * - SSR: Synchronous renderer that produces HTML string at build time
 * - Hydration: Client-side code to attach interactivity to static HTML
 * - Import Map: CDN URLs for framework runtime dependencies
 *
 * All SSR renderers MUST be synchronous because they're called
 * from Preact's options.vnode hook, which doesn't support async.
 */

/**
 * @typedef {{
 *   framework: string;
 *   getBuildConfig: () => Partial<Bun.BuildConfig> | Promise<Partial<Bun.BuildConfig>>;
 *   importMap: import('../types.js').ImportsMap;
 *   clientImports: string[];
 *   hydrateFnBody: string;
 *   renderSSR: (Component: any, props: Record<string, unknown>) => string;
 * }} FrameworkConfigItem
 */

/**
 * @import { ImportsMap } from "../types.js"
 */

/**
 * Framework configurations
 *
 * Each framework needs:
 * 1. getBuildConfig() - Returns Bun.build options (JSX config, loaders, plugins)
 * 2. renderSSR(Component, props) - Synchronous SSR renderer (MUST be sync!)
 * 3. clientImports[] - Import statements needed in the hydration shell
 * 4. hydrateFnBody - JavaScript code that attaches interactivity to HTML
 * 5. importMap - CDN URLs for browser to load framework from
 *
 * @type {Record<string, FrameworkConfigItem>}
 */
export const FrameworkConfig = {
	/**
	 * Preact Configuration
	 *
	 * Preact is a lightweight JSX framework with excellent SSR support.
	 * We use preact-render-to-string for synchronous SSR rendering.
	 */
	preact: {
		framework: "preact",

		/**
		 * Bun.build configuration for Preact islands
		 *
		 * Uses automatic JSX transform (no need to import h in components).
		 * Marks Preact packages as external so they're loaded from import map.
		 *
		 * @returns {Partial<Bun.BuildConfig>}
		 */
		getBuildConfig: () => ({
			jsx: { runtime: "automatic", importSource: "preact" },
			external: ["preact", "preact/hooks", "preact/jsx-runtime"],
		}),

		/**
		 * Client-side imports needed for Preact hydration
		 *
		 * These are injected into the hydration shell and executed
		 * in the browser when an island loads.
		 */
		clientImports: ['const { h, hydrate } = await import("preact");'],

		/**
		 * Client-side hydration function body
		 *
		 * This JavaScript runs in the browser after Component and props
		 * are loaded. It attaches event listeners and makes the island interactive.
		 *
		 * Variables in scope:
		 * - Component: the imported component function
		 * - props: the parsed props from data-props attribute
		 * - container: the DOM element (this castro-island element)
		 */
		hydrateFnBody: `
			// Preact hydration: attach event listeners to existing HTML
			hydrate(h(Component, props), container);
		`,

		/**
		 * Synchronous SSR renderer for Preact
		 *
		 * Called at build time to render islands to static HTML.
		 * Uses preact-render-to-string for synchronous rendering.
		 * CRITICAL: Must be synchronous (no async/await) because called
		 * from Preact's options.vnode hook which doesn't support promises.
		 *
		 * @param {any} Component - The Preact component function
		 * @param {Record<string, unknown>} props - Component props
		 * @returns {string} Static HTML
		 */
		renderSSR: (Component, props) => {
			// These are imported at the top level by the wrapper before
			// renderSSR is called, so they're available here synchronously.
			// Using import.meta.require (Bun feature) for sync access.
			// @ts-ignore - globalThis is augmented at runtime by wrapper
			const { h } = globalThis.__preactH;
			// @ts-ignore - globalThis is augmented at runtime by wrapper
			const { render } = globalThis.__preactRenderToString;

			if (!h || !render) {
				throw new Error(
					"Preact not initialized. Wrapper must call loadPreactDependencies() first.",
				);
			}

			return render(h(Component, props));
		},

		/**
		 * Import map for browser
		 *
		 * Tells the browser where to load Preact from.
		 * Uses esm.sh CDN for zero-config module loading.
		 */
		importMap: {
			preact: "https://esm.sh/preact",
			"preact/hooks": "https://esm.sh/preact/hooks",
			"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
		},
	},

	/**
	 * Solid.js Configuration
	 *
	 * Solid is a fine-grained reactive JavaScript framework.
	 * Uses Babel plugin for JSX compilation and renderToString for SSR.
	 *
	 * @todo Implement after Preact is stable
	 */
	solid: {
		framework: "solid",

		/**
		 * Bun.build configuration for Solid islands
		 *
		 * Solid requires Babel plugin for JSX transformation.
		 * The plugin is loaded dynamically to avoid hard dependency.
		 *
		 * @returns {Promise<Partial<Bun.BuildConfig>>}
		 */
		getBuildConfig: async () => {
			// Dynamically import the Solid Babel plugin
			// This throws if user hasn't installed babel dependencies
			const { getSolidBabelPlugin } = await import("./solid/babel-plugin.js");

			return {
				plugins: [getSolidBabelPlugin(false)],
				external: ["solid-js", "solid-js/web"],
			};
		},

		/**
		 * Client-side imports needed for Solid hydration
		 */
		clientImports: ['import { hydrate } from "solid-js/web";'],

		/**
		 * Client-side hydration function body for Solid
		 *
		 * Solid uses `hydrate()` for SSR-friendly component attachment.
		 */
		hydrateFnBody: `
			// Solid hydration: attach to existing HTML from SSR
			hydrate(() => Component(props), container);
		`,

		/**
		 * Synchronous SSR renderer for Solid
		 *
		 * Uses renderToString from solid-js/web.
		 *
		 * @param {any} Component - The Solid component function
		 * @param {Record<string, unknown>} props - Component props
		 * @returns {string} Static HTML
		 */
		renderSSR: (Component, props) => {
			// @ts-ignore - globalThis is augmented at runtime by wrapper
			const { renderToString } = globalThis.__solidRenderToString;

			if (!renderToString) {
				throw new Error(
					"Solid not initialized. Wrapper must call loadSolidDependencies() first.",
				);
			}

			return renderToString(() => Component(props));
		},

		/**
		 * Import map for Solid
		 */
		importMap: {
			"solid-js": "https://esm.sh/solid-js",
			"solid-js/web": "https://esm.sh/solid-js/web",
		},
	},
};
