/// <reference types="bun" />
// oxlint-disable-next-line typescript/triple-slash-reference
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
  ROUTE_CONFLICT: { route: string; file1: string; file2: string };
  LAYOUT_NOT_FOUND: { layoutId: string; sourceFilePath: string };
  NO_DEFAULT_LAYOUT: { dir: string };
  LAYOUT_NO_DEFAULT_EXPORT: { file: string };
  PAGE_NO_DEFAULT_EXPORT: { file: string };
  ISLAND_NOT_FOUND: { islandId: string; sourceFilePath: string };
  NO_PAGES: { dir: string };
  BUNDLE_FAILED: undefined;
  BUNDLE_NO_OUTPUT: { sourceFilePath: string };
  YAML_PARSE_FAILED: { errorMessage: string; sourceFilePath: string };
  ISLAND_RENDER_FAILED: {
    islandId: string;
    sourceFilePath: string;
    errorMessage: string;
  };
  ISLAND_HAS_CHILDREN: { islandId: string; sourceFilePath: string };
  ISLAND_MULTIPLE_DIRECTIVES: {
    islandId: string;
    sourceFilePath: string;
    directives: string[];
  };
  ISLAND_PROPS_NOT_SERIALIZABLE: {
    islandId: string;
    sourceFilePath: string;
    errorMessage: string;
  };
  CONFIG_LOAD_FAILED: { path: string; errorMessage: string };
  UNEXPECTED: undefined;
};

export type ErrorCode = keyof ErrorTokens;

/** A source location with optional context line from file. */
export type CodeFrame = {
  file?: string; // absolute path
  line?: number;
  column?: number;
  lineText?: string; // source line for display
  message?: string; // why this location failed, e.g. `Could not resolve: "./x"`
};

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
export type CastroErrorPayload = ErrorContent & {
  code: ErrorCode;
  frames?: CodeFrame[]; // 0..N source locations
};

// ─── Core types ──────────────────────────────────────────────────────── //

export type Directive = "comrade:eager" | "comrade:patient" | "comrade:visible";

export type ImportsMap = Record<string, string>;

export type CastroConfig = {
  port?: number;
  markdown?: { options?: Bun.markdown.Options };
  /**
   * Source root for `pages/`, `layouts/`, and `components/`, e.g. `"src"`.
   * `public/` is not affected — it stays at the project root — and output is
   * always `dist/`, with no srcDir segment in emitted URLs.
   */
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
  sourceFilePath: string;
  publicJsPath: string;
  /** Empty when the island imports no stylesheet. */
  cssContent: string;
  ssrModule: { default: AnyFunction };
};

export type PageMeta = {
  /**
   * Layout id: the path under `layouts/` with the extension stripped, so
   * `layouts/nested/default.tsx` is `"nested/default"`. Omit for `"default"`.
   */
  layout?: string;
  title?: string;
  [key: string]: unknown;
};

export type AnyFunction = (...args: never) => unknown;

/**
 * Identity function that provides type inference for castro config file.
 * Runtime implementation lives in index.js (the package entry); this is the
 * type the package exports under the same name.
 */
export function defineConfig(config: CastroConfig): CastroConfig;
