/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

export type Directive = "lenin:awake" | "comrade:visible" | "no:pasaran";

export type Asset = {
	tag: string;
	attrs?: Record<string, string | boolean>;
	content?: string;
};

export type ImportsMap = Record<string, string>;

export type Adapter = {
	name: string;
	/** Bun.build config for JSX compilation (transform, externals) */
	getBuildConfig: () => Partial<import("bun").BuildConfig>;
	/** Render a VNode/component tree to HTML string (sync) */
	renderToString: (vnode: any) => string;
	/** Render a single component with props to HTML (sync, used for island SSR) */
	renderComponentToString: (
		Component: any,
		props: Record<string, unknown>,
	) => string;
	/** Create a virtual DOM element (h() for Preact, equivalent for others) */
	createElement: (
		type: any,
		props: Record<string, unknown> | null,
		...children: any[]
	) => any;
	/** Return the prop object for injecting raw HTML into an element */
	rawHtmlProp: (html: string) => Record<string, unknown>;
	/** Client-side hydration code string injected into island bundles */
	hydrateFnString: string;
	/** Import map entries for browser (CDN URLs) */
	importMap: ImportsMap;
};

export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getAssets?: () => Asset[];
	getImportMap?: () => ImportsMap | null;
	onBuild?: () => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};

export type IslandComponent = {
	name: string;
	sourcePath: string;
	publicJsPath: string;
	publicCssPath?: string;
	cssContent?: string;
	ssrCode?: string;
	/** Loaded SSR module with default export being the component function */
	ssrModule: { default: Function };
};

export type PageMeta = {
	layout?: string | "none" | false;
	title?: string;
	[key: string]: unknown;
};
