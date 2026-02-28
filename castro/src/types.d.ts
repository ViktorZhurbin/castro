/// <reference path="./jsx.d.ts" />

/**
 * Castro Type Definitions
 */

export type { FrameworkConfig } from "./islands/frameworks/types.d.ts";

export type Directive = "lenin:awake" | "comrade:visible" | "no:pasaran";

export type Asset = {
	tag: string;
	attrs?: Record<string, string | boolean>;
	content?: string;
};

export type ImportsMap = Record<string, string>;

export type CastroPlugin = {
	name: string;
	getPageAssets?: (params?: { needsHydration?: boolean }) => Asset[];
	onPageBuild?: () => Promise<void>;
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
