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

export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
	getImportMap?: () => ImportsMap | null;
	onPageBuild?: () => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};

export type IslandComponent = {
	sourcePath: string;
	publicJsPath: string;
	cssContent?: string;
	ssrCode: string;
	// biome-ignore lint/complexity/noBannedTypes: framework-agnostic callable
	ssrModule?: { default: Function };
};

export type PageMeta = {
	layout?: string | "none" | false;
	title?: string;
	[key: string]: unknown;
};
