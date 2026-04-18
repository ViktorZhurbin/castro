/**
 * Message Configuration Type
 *
 * Defines the shape of message presets (serious and satirical).
 * Both presets must implement this interface exactly.
 */

import type { ErrorCode, ErrorContent, ErrorTokens } from "../types.d.ts";

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
		writingFile: (source: string, dest: string) => string;
	};

	// File operation messages
	files: {
		changed: (path: string) => string;
	};

	// CLI command messages
	commands: {
		unknown: (cmd: string) => string;
		usage: string;
	};

	// Exception error messages — structured payloads for terminal and browser renderers.
	errors: { [K in ErrorCode]: (tokens: ErrorTokens[K]) => ErrorContent };
}
