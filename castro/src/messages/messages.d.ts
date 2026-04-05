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
		success: (count: string) => string;
		noFiles: string;
		writingFile: (source: string, dest: string) => string;
		fileFailure: (file: string, err: string) => string;
		islandFailed: (err: unknown) => string;
		ssrCompileFailed: (source: string, errMessage: string) => string;
		bundleFailed: (errors: string) => string;
		noJsOutput: (source: string) => string;
	};

	// File operation messages
	files: {
		changed: (path: string) => string;
	};

	// Error messages
	errors: {
		routeConflict: (file1: string, file2: string) => string;
		layoutNotFound: (name: string, sourceFilePath: string) => string;
		missingDefaultLayout: () => string;
		noLayoutsDir: (dir: string) => string;
		noDefaultExport: (file: string) => string;
		layoutBuildFailed: (file: string, err: string) => string;
		jsxNoExport: (filePath: string) => string;
		invalidMeta: (file: string, issues: string[]) => string;
		islandNotFoundRegistry: (name: string) => string;
		islandRenderFailed: (name: string, err: string) => string;
		ssrErrorTitle: string;
		multipleDirectives: (directives: string) => string;
		noLayoutFiles: (dir: string) => string;
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
