/// <reference types="bun" />
/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

// ─── Error types ──────────────────────────────────────────────────── //

/**
 * Error codes and payload shapes for Castro build-time fatal errors.
 * Decouples error structure from message voice — the payload holds data,
 * messages/ holds language. Two independent renderers consume this:
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
	ISLAND_NOT_FOUND: { islandId: string };
	NO_PAGES: { dir: string };
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

/** The error table: one renderer-ready payload factory per error code. */
export type ErrorMessages = {
	[K in ErrorCode]: (tokens: ErrorTokens[K]) => ErrorContent;
};

/** Structured error payload: data + code, voice in messages/. */
export interface CastroErrorPayload extends ErrorContent {
	code: ErrorCode;
	frames?: CodeFrame[]; // 0..N source locations
}

// ─── Framework types ─────────────────────────────────────────────────── //

/**
 * Defines how islands are compiled, rendered (SSR), and hydrated.
 * Every framework config file (preact.js) must export a default
 * object matching this shape.
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
	 * Absolute path to the framework's browser-side hydration module.
	 *
	 * Read by compiler.js and inlined verbatim into the per-island bundle.
	 * The file must export a named function with this exact signature:
	 *
	 *   export async function hydrate(container, props, Component) { ... }
	 *
	 * Constraints: no Node-only imports, no captured closure variables — the
	 * source is copy-pasted into a Bun.build virtual entry and bundled for the
	 * browser. Use `new URL("./my.client.js", import.meta.url).pathname` so the
	 * path is correct regardless of working directory.
	 */
	hydrateClientPath: string;

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
	markdown?: { options?: Bun.markdown.Options };
	srcDir?: string;
};

export type DefaultConfig = Required<Pick<CastroConfig, "port" | "srcDir">>;

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
