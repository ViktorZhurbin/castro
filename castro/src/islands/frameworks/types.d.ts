/**
 * Framework Configuration Type
 *
 * Every framework config file (preact.js, solid.js, etc.) must
 * export a default object matching this shape.
 */

import type { Asset, ImportsMap } from "../../types.d.ts";

/**
 * Defines how islands are compiled, rendered (SSR), and hydrated.
 */
export type FrameworkConfig = {
	/** Framework identifier (e.g. "preact", "solid") */
	id: string;

	/** Bun.build configuration for compiling components */
	getBuildConfig: (target?: "ssr") => Partial<Bun.BuildConfig>;

	/** CDN URLs for browser-side module loading via import map */
	importMap: ImportsMap;

	/**
	 * Assets injected into <head> for pages using this framework.
	 * E.g. Solid's hydration coordination script.
	 * Only included on pages that actually render islands from this framework.
	 */
	headAssets?: Asset[];

	/**
	 * Client-side hydration code string.
	 *
	 * Injected into the compiled island bundle by compiler.js.
	 * Runs in the browser when the island's <castro-island> triggers hydration.
	 *
	 * Variables available at runtime (provided by the virtual entry wrapper):
	 * - Component: the imported island component function
	 * - props: deserialized from data-props attribute
	 * - container: the <castro-island> DOM element
	 */
	hydrateFnString: string;

	/**
	 * Server-side rendering function.
	 * Called at build time by marker.js to generate static HTML for the island.
	 */

	// biome-ignore lint/complexity/noBannedTypes: to keep it framework agnostic
	renderSSR: (Component: Function, props: Record<string, unknown>) => string;
};
