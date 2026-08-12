/// <reference types="bun" />
// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 *
 * The first section is what `package.json`'s `types` entry promises a consuming
 * project: config, and the props a page or layout is handed. The internal
 * sections below it are the build's own vocabulary — they live here because
 * these types are shared across `core/src`, not because anyone outside imports
 * them.
 */

import type { VNode } from "preact";

// ─── Public API ──────────────────────────────────────────────────────── //

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

/**
 * Identity function that provides type inference for castro config file.
 * Runtime implementation lives in index.js (the package entry); this is the
 * type the package exports under the same name.
 */
export function defineConfig(config: CastroConfig): CastroConfig;

/**
 * A page's frontmatter: `meta` in a JSX page, the YAML block in a Markdown one.
 * The index signature is what lets a project carry its own fields; annotate a
 * page's `meta` with `satisfies PageMeta` to have the known ones checked while
 * keeping the rest.
 */
export type PageMeta = {
  /**
   * Layout id: the path under `layouts/` with the extension stripped, so
   * `layouts/nested/default.tsx` is `"nested/default"`. Omit for `"default"`.
   */
  layout?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
};

/**
 * What a page component receives: its own frontmatter, plus the `title`
 * renderPage.js derives (frontmatter value, or the filename as a fallback) —
 * which is why `title` is required here while `PageMeta` leaves it optional.
 *
 * `T` narrows custom frontmatter that the index signature would otherwise
 * hand back as `unknown`, e.g. `PageProps<{ subtitle: string }>`.
 */
export type PageProps<T = unknown> = PageMeta & T & { title: string };

/**
 * What a layout component receives: exactly a page's props, plus the page
 * itself as `children`. Both are handed the same object — see "Layouts receive
 * children (VNode)" in CLAUDE.md for why this is a VNode and not an HTML string.
 *
 * `VNode<any>`, not bare `VNode`: the latter means `VNode<{}>`, and `VNode` is
 * invariant in its props, so the page node renderPage.js builds — which carries
 * the page's own props — would not be assignable to it.
 */
export type LayoutProps<T = unknown> = PageProps<T> & { children: VNode<any> };

// ─── Internal: errors ────────────────────────────────────────────────── //

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
  ISLAND_DEFAULT_NOT_FUNCTION: { file: string };
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
  CONFIG_LOAD_FAILED: { configFile: string; errorMessage: string };
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

/**
 * Structured error payload: data + code, voice in messages/.
 *
 * Every field must survive `JSON.stringify` — the payload crosses an SSE wire
 * to the browser overlay (dev/server.js → dev/liveReload.js) with nothing
 * validating either end, exactly like island props.
 */
export type CastroErrorPayload = ErrorContent & {
  code: ErrorCode;
  frames?: CodeFrame[]; // 0..N source locations
};

// ─── Internal: build ─────────────────────────────────────────────────── //

export type Directive = "comrade:eager" | "comrade:patient" | "comrade:visible";

export type ImportsMap = Record<string, string>;

export type DefaultConfig = Required<Pick<CastroConfig, "port" | "srcDir">>;

export type IslandComponent = {
  sourceFilePath: string;
  publicJsPath: string;
  /** Empty when the island imports no stylesheet. */
  cssContent: string;
  /** Guaranteed callable by the check in compileIsland(), not by the loader. */
  ssrModule: { default: AnyFunction };
};

export type AnyFunction = (...args: never) => unknown;
