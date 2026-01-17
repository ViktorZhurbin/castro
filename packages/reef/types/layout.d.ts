/**
 * Layout and frontmatter type definitions
 */

/**
 * Props passed to layout component functions
 * Note: Assets and import maps are injected automatically by the framework
 */
export interface LayoutProps {
	/** Page title */
	title: string;
	/** Rendered HTML content from markdown */
	content: string;
	/** Additional properties from frontmatter are spread here */
	[key: string]: unknown;
}

/**
 * Frontmatter data parsed from markdown files
 */
export interface PageMeta {
	/** Optional page title (overrides filename) */
	title?: string;
	/** Optional layout name (defaults to 'default') */
	layout?: string;
	/** Any other custom fields */
	[key: string]: unknown;
}

/**
 * Layout component function type
 */
export type LayoutComponent = (props: LayoutProps) => unknown;
