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

// ─── Core types ──────────────────────────────────────────────────────── //

export type Directive = "comrade:eager" | "comrade:patient" | "comrade:visible";

export type ImportsMap = Record<string, string>;

export type CastroConfig = {
	port?: number;
	markdown?: { options?: Bun.markdown.Options };
	srcDir?: string;
	/**
	 * Extra npm packages to vendor to /dist/vendor/ and share across islands
	 * via the import map, e.g. ["@preact/signals"]. Anything not listed here
	 * gets bundled into each island bundle separately.
	 */
	clientDependencies?: string[];
};

export type DefaultConfig = Required<Pick<CastroConfig, "port" | "srcDir">>;

export type IslandComponent = {
	sourcePath: string;
	publicJsPath: string;
	cssContent?: string;
	ssrCode: string;
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
