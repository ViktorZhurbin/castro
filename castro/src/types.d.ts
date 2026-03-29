/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

export type { FrameworkConfig } from "./islands/frameworks/types.d.ts";

export type Directive = "comrade:eager" | "comrade:patient" | "comrade:visible";

/**
 * A raw HTML string or a structured tag definition.
 * Raw strings are injected as-is (e.g. Solid's `generateHydrationScript()`).
 */
export type Asset =
	| string
	| {
			tag: string;
			attrs?: Record<string, string | boolean>;
			content?: string;
	  };

export type ImportsMap = Record<string, string>;

/** Passed to onAfterBuild — aggregated across all pages in the build. */
export type BuildContext = {
	/** Framework IDs that had at least one island rendered (e.g. "bare-jsx", "preact", "solid") */
	usedFrameworks: Set<string>;
};

export type CastroPlugin = {
	name: string;
	getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
	/** Runs before pages are built. Use for pre-build work (e.g. CSS compilation). */
	onPageBuild?: () => Promise<void>;
	/** Runs after all pages are built. Receives build context for conditional work. */
	onAfterBuild?: (context: BuildContext) => Promise<void>;
	/** Directories to watch in dev mode. Changes trigger onPageBuild() + browser reload. */
	watchDirs?: string[];
	/**
	 * Register a custom framework for island rendering.
	 * Plugins providing this bypass the built-in frameworks/ directory entirely.
	 */
	frameworkConfig?: FrameworkConfig;
};

export type IslandComponent = {
	sourcePath: string;
	publicJsPath: string;
	cssContent?: string;
	ssrCode: string;
	/** Which framework this island uses */
	frameworkId: string;
	// biome-ignore lint/complexity/noBannedTypes: framework-agnostic callable
	ssrModule?: { default: Function };
};

export type PageMeta = {
	layout?: string | "none" | false;
	title?: string;
	[key: string]: unknown;
};
