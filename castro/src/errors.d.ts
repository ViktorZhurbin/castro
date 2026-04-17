/**
 * Error codes and payload shapes for Castro build-time fatal errors.
 * Decouples error structure from message voice — the payload holds data,
 * messages/*.js holds language. Two independent renderers consume this:
 * terminal (styleText) and browser (shadow DOM).
 */

export type ErrorCode =
	| "ROUTE_CONFLICT"
	| "LAYOUT_NOT_FOUND"
	| "LAYOUT_MISSING_DEFAULT"
	| "NO_LAYOUTS_DIR"
	| "NO_LAYOUT_FILES"
	| "LAYOUT_NO_DEFAULT_EXPORT"
	| "PAGE_NO_DEFAULT_EXPORT"
	| "YAML_PARSE_FAILED"
	| "META_INVALID"
	| "BUNDLE_FAILED"
	| "MULTIPLE_DIRECTIVES"
	| "ISLAND_NOT_FOUND"
	| "UNEXPECTED";

/**
 * A source location with optional context line from file.
 */
export interface CodeFrame {
	file: string; // absolute path
	line?: number;
	column?: number;
	lineText?: string; // source line for display
}

type ErrorContent = {
	title: string; // "Route conflict", "Layout not found", etc.
	message?: string; // one-line explanation
	hint?: string; // actionable next step
	notes?: string[]; // call-site bullets (conflicting files, invalid fields, etc.)
};

// Error message definition: static object or function taking tokens
export type ErrorMessageDef =
	| ErrorContent
	| ((tokens: Record<string, any>) => ErrorContent);

/**
 * Structured error payload: data + code, voice in messages/*.js.
 */
export interface CastroErrorPayload extends ErrorContent {
	code: ErrorCode;
	frames?: CodeFrame[]; // 0..N source locations
}
