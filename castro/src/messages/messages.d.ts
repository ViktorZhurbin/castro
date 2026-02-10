/**
 * Message Configuration Type
 *
 * Defines the shape of message presets (serious and communist).
 * Both presets must implement this interface exactly.
 */

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
		success: (count: string, time: string) => string;
		noFiles: string;
		writingFile: (source: string, dest: string) => string;
		fileSuccess: (file: string, time: string) => string;
		fileFailure: (file: string, err: string) => string;
		islandFailed: (err: unknown) => string;
		ssrSkipped: (source: string, err: string) => string;
		ssrCompileFailed: (source: string) => string;
		noJsOutput: (source: string) => string;
	};

	// File operation messages
	files: {
		changed: (path: string) => string;
		compiled: (count: number) => string;
		layoutsLoaded: (names: string) => string;
	};

	// Error messages
	errors: {
		routeConflict: (file1: string, file2: string) => string;
		layoutNotFound: (name: string) => string;
		missingDefaultLayout: () => string;
		noLayoutsDir: (dir: string) => string;
		islandNoExport: (file: string) => string;
		pageBuildFailed: (file: string, err: string) => string;
		jsxNoExport: (filePath: string) => string;
		invalidMeta: (file: string, issues: string[]) => string;
		islandDefaultExportMissing: (fileName: string) => string;
		islandAnonymousExport: (file: string) => string;
		islandNotFoundRegistry: (name: string) => string;
		islandRenderFailed: (name: string, err: string) => string;
		multipleDirectives: (directives: string) => string;
		noLayoutFiles: (dir: string) => string;
		cacheWriteFailed: (path: string, err: string) => string;
		unsupportedFramework: (name: string) => string;
	};

	// CLI command messages
	commands: {
		unknown: (cmd: string) => string;
		usage: string;
	};

	// Cache management messages
	purge: {
		success: string;
	};
}
