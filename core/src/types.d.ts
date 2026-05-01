/// <reference types="bun" />
/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

// ─── Error types ──────────────────────────────────────────────────── //

/**
 * Error codes and payload shapes for Castro build-time fatal errors.
 * Decouples error structure from message voice — the payload holds data,
 * messages/*.js holds language. Two independent renderers consume this:
 * terminal (styleText) and browser (shadow DOM).
 */

export type ErrorTokens = {
	ROUTE_CONFLICT: { route1: string; route2: string; outputPath: string };
	LAYOUT_NOT_FOUND: { layoutId: string; sourceFilePath: string };
	LAYOUT_MISSING_DEFAULT: undefined;
	NO_LAYOUTS_DIR: undefined;
	NO_LAYOUT_FILES: { dir: string };
	LAYOUT_NO_DEFAULT_EXPORT: { file: string };
	PAGE_NO_DEFAULT_EXPORT: { file: string };
	META_INVALID: { file: string; issues: string[] };
	ISLAND_NOT_FOUND: { islandId: string };
	NO_PAGES: { dir: string };
	FRAMEWORK_CONFIG_INVALID: { pluginName: string; missing: string };
	BUNDLE_FAILED: { errorMessage: string } | undefined;
	YAML_PARSE_FAILED: { errorMessage: string; sourceFilePath: string };
	CACHE_WRITE_FAILED: { path: string; errorMessage: string };
	ISLAND_RENDER_FAILED: { islandId: string; errorMessage: string };
	CONFIG_LOAD_FAILED: { path: string; errorMessage: string };
	UNEXPECTED: undefined;
};

export type ErrorCode = keyof ErrorTokens;

/** A source location with optional context line from file. */
export interface CodeFrame {
	file?: string; // absolute path
	line?: number;
	column?: number;
	lineText?: string; // source line for display
}

export type ErrorContent = {
	title: string; // "Route conflict", "Layout not found", etc.
	message?: string; // one-line explanation
	hint?: string; // actionable next step
	notes?: string[]; // call-site bullets (conflicting files, invalid fields, etc.)
	errorMessage?: string; // error.message from a JavaScript exception
};

/** Structured error payload: data + code, voice in messages/*.js. */
export interface CastroErrorPayload extends ErrorContent {
	code: ErrorCode;
	frames?: CodeFrame[]; // 0..N source locations
}

// ─── Framework types ─────────────────────────────────────────────────── //

/**
 * Defines how islands are compiled, rendered (SSR), and hydrated.
 * Every framework config file (preact.js, solid.js, etc.) must
 * export a default object matching this shape.
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
	 * Package names to scan imports for automatic framework detection.
	 * E.g. ["solid-js"] means any island importing "solid-js" or "solid-js/web"
	 * will use this framework.
	 */
	detectImports: string[];

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

// ─── Core types ──────────────────────────────────────────────────────── //

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

export type CastroConfig = {
	port?: number;
	messages?: "satirical" | "serious";
	plugins?: CastroPlugin[];
	importMap?: Record<string, string>;
	clientDependencies?: string[];
	markdown?: { options?: Bun.markdown.Options };
	srcDir?: string;
	/** Max concurrent page builds. Defaults to CPU count. Override with CASTRO_CONCURRENCY env var. */
	concurrency?: number;
};

export type DefaultConfig = Required<
	Pick<CastroConfig, "port" | "messages" | "srcDir">
>;

/** Passed to onAfterBuild — aggregated across all pages in the build. */
export type BuildContext = {
	/** Framework IDs that had at least one island rendered (e.g. "castro-jsx", "preact", "solid") */
	usedFrameworks: Set<string>;
};

export type CastroPlugin = {
	name: string;
	/** Adds HTML assets to the page. Called per-page for all pages. */
	getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
	/** Adds entries to the page's import map. Called per-page for all pages. */
	getImportMap?: (context: {
		usedFrameworks: Set<string>;
	}) => Promise<ImportsMap> | ImportsMap;
	/** Runs before pages are built. Use for pre-build work (e.g. CSS compilation). */
	onPageBuild?: () => Promise<void> | void;
	/** Runs after all pages are built. Receives build context for conditional work. */
	onAfterBuild?: (context: BuildContext) => Promise<void> | void;
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
	ssrModule?: { default: AnyFunction };
};

export type PageMeta = {
	layout?: string | false;
	title?: string;
	[key: string]: unknown;
};

export type AnyFunction = (...args: never) => unknown;

/** Identity function that provides type inference for castro config file */
export function defineConfig(config: CastroConfig): CastroConfig;
