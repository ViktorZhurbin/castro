/// <reference types="bun" />
/// <reference path="./jsx.d.ts" />

export { ClientScript } from "./components/ClientScript";

/**
 * Castro Type Definitions
 */

export type {
	CastroErrorPayload,
	CodeFrame,
	ErrorCode,
} from "./errors.d.ts";
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

export type CastroConfig = {
	port?: number;
	messages?: "satirical" | "serious";
	plugins?: CastroPlugin[];
	importMap?: Record<string, string>;
	clientDependencies?: string[];
	markdown?: { options?: Bun.markdown.Options };
	srcDir?: string;
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
	getImportMap?: (context: { usedFrameworks: Set<string> }) => ImportsMap;
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
	ssrModule?: { default: AnyFunction };
};

export type PageMeta = {
	layout?: string | "none" | false;
	title?: string;
	[key: string]: unknown;
};

export type AnyFunction = (...args: never) => unknown;

/** Identity function that provides type inference for castro config file */
export function defineConfig(config: CastroConfig): CastroConfig;
