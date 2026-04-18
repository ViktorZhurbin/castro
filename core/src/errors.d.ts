/**
 * Error codes and payload shapes for Castro build-time fatal errors.
 * Decouples error structure from message voice — the payload holds data,
 * messages/*.js holds language. Two independent renderers consume this:
 * terminal (styleText) and browser (shadow DOM).
 */

export type ErrorTokens = {
	ROUTE_CONFLICT: { route1: string; route2: string; outputPath: string };
	LAYOUT_NOT_FOUND: { layoutName: string; sourceFilePath: string };
	LAYOUT_MISSING_DEFAULT: undefined;
	NO_LAYOUTS_DIR: undefined;
	NO_LAYOUT_FILES: { dir: string };
	LAYOUT_NO_DEFAULT_EXPORT: { file: string };
	PAGE_NO_DEFAULT_EXPORT: { file: string };
	META_INVALID: { file: string; issues: string[] };
	ISLAND_NOT_FOUND: { islandId: string };
	NO_PAGES: { dir: string };
	FRAMEWORK_CONFIG_INVALID: { pluginName: string; missing: string };
	FRAMEWORK_CONFIG_NO_DETECTION: { pluginName: string };
	BUNDLE_FAILED: { errorMessage: string } | undefined;
	YAML_PARSE_FAILED: { errorMessage: string; sourceFilePath: string };
	CACHE_WRITE_FAILED: { path: string; errorMessage: string };
	ISLAND_RENDER_FAILED: { islandId: string; errorMessage: string };
	FRAMEWORK_LOAD_FAILED: { name: string; errorMessage: string };
	CONFIG_LOAD_FAILED: { path: string; errorMessage: string };
	UNEXPECTED: undefined;
};

export type ErrorCode = keyof ErrorTokens;

/**
 * A source location with optional context line from file.
 */
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

/**
 * Structured error payload: data + code, voice in messages/*.js.
 */
export interface CastroErrorPayload extends ErrorContent {
	code: ErrorCode;
	frames?: CodeFrame[]; // 0..N source locations
}
