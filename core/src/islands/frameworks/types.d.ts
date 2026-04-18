/**
 * Framework Configuration Type
 *
 * Every framework config file (preact.js, solid.js, etc.) must
 * export a default object matching this shape.
 */

import type { AnyFunction, Asset } from "../../types.js";

/**
 * Defines how islands are compiled, rendered (SSR), and hydrated.
 */
export type FrameworkConfig = {
	/** Framework identifier (e.g. "preact", "solid") */
	id: string;

	/** Bun.build configuration for compiling components */
	getBuildConfig: (target?: "ssr") => Partial<Bun.BuildConfig>;

	/**
	 * Shared dependencies to be vendored and added to the browser import map.
	 * E.g. ["preact", "preact/hooks"]
	 */
	clientDependencies: string[];

	/**
	 * Exported names to scan for automatic framework detection.
	 * E.g. ["hydrate"] means any island exporting a `hydrate` function
	 * will use this framework.
	 *
	 * Checked before detectImports.
	 */
	detectExports?: string[];

	/**
	 * Package names to scan imports for automatic framework detection.
	 * E.g. ["solid-js"] means any island importing "solid-js" or "solid-js/web"
	 * will use this framework.
	 *
	 * Checked after detectExports.
	 */
	detectImports?: string[];

	/**
	 * Assets injected into <head> for pages using this framework.
	 * E.g. Solid's hydration coordination script.
	 * Only included on pages that actually render islands from this framework.
	 */
	headAssets?: Asset[];

	/**
	 * Custom import statement for the virtual entry point.
	 * By default, compiler.js generates `import Component from './${basename}'`.
	 * Frameworks that don't need the full default export (e.g., vanilla) can
	 * override this to import only what hydrateFnString needs, enabling
	 * tree-shaking of unused SSR code.
	 */
	virtualEntryImport?: (basename: string) => string;

	/**
	 * Client-side hydration code string.
	 *
	 * Injected into the compiled island bundle by compiler.js.
	 * Runs in the browser when the island's <castro-island> triggers hydration.
	 *
	 * Variables available at runtime (provided by the virtual entry wrapper):
	 * - Component: the imported island component function (if using default import)
	 * - props: deserialized from data-props attribute
	 * - container: the <castro-island> DOM element
	 */
	hydrateFnString: string;

	/**
	 * Server-side rendering function.
	 * Called at build time by marker.js to generate static HTML for the island.
	 */

	// AnyFunction to keep it framework agnostic
	renderSSR: (Component: AnyFunction, props: Record<string, unknown>) => string;
};
