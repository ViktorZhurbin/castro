/**
 * Message Configuration Type
 *
 * Defines the shape of message presets (serious and communist).
 * Both presets must implement this interface exactly.
 */

import type { ErrorMessageDef } from "../errors.d.ts";

export interface Messages {
	// Dev server startup and runtime messages
	devServer: {
		ready: (url: string) => string;
		serverError: (msg: string) => string;
		watchError: (dir: string, msg: string) => string;
	};

	// Build process messages
	build: {
		starting: string;
		success: (count: string) => string;
		noFiles: string;
		writingFile: (source: string, dest: string) => string;
		fileFailure: (file: string, err: string) => string;
	};

	// File operation messages
	files: {
		changed: (path: string) => string;
	};

	// Error messages — structured payloads for terminal and browser renderers.
	// Shape: static object { title, hint } or function returning { title, message, hint, notes? }
	errors: {
		// Build-time fatal errors (v1 scope)
		ROUTE_CONFLICT: ErrorMessageDef;
		LAYOUT_NOT_FOUND: ErrorMessageDef;
		LAYOUT_MISSING_DEFAULT: ErrorMessageDef;
		NO_LAYOUTS_DIR: ErrorMessageDef;
		NO_LAYOUT_FILES: ErrorMessageDef;
		LAYOUT_NO_DEFAULT_EXPORT: ErrorMessageDef;
		PAGE_NO_DEFAULT_EXPORT: ErrorMessageDef;
		YAML_PARSE_FAILED: ErrorMessageDef;
		META_INVALID: ErrorMessageDef;
		BUNDLE_FAILED: ErrorMessageDef;
		MULTIPLE_DIRECTIVES: ErrorMessageDef;
		ISLAND_NOT_FOUND: ErrorMessageDef;
		UNEXPECTED: ErrorMessageDef;

		// SSR error title — rendered inline in islands/marker.js, not thrown
		ssrErrorTitle: string;

		// Out of scope (v2+)
		islandRenderFailed: (name: string, err: string) => string;
		cacheWriteFailed: (path: string, err: string) => string;
		frameworkUnsupported: (name: string) => string;
		frameworkConfigInvalid: (pluginName: string, missing: string) => string;
		frameworkConfigNoDetection: (pluginName: string) => string;
		frameworkLoadFailed: (name: string, err: string) => string;
	};

	// CLI command messages
	commands: {
		unknown: (cmd: string) => string;
		usage: string;
	};
}
