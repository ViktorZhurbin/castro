/**
 * Serious preset - Straightforward technical messages
 * No satire, just clear information
 *
 * @type {import('./messages.d.ts').Messages}
 */

export const serious = {
	// CLI startup
	devServer: {
		ready: (url) =>
			`Dev server running at ${url}\nWatching for file changes...`,
		serverError: (msg) => `Server error: ${msg}`,
		watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`,
	},

	build: {
		starting: "Building site...",
		success: (count) => `✓ Build complete: ${count} pages.`,
		noFiles: "⚠️  No pages found to build.",
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileFailure: (file, err) => `✗ Failed to build ${file}: ${err}`,
		islandFailed: (err) => `Island build failed: ${err}`,
		ssrCompileFailed: (source, err) =>
			`Failed to compile SSR code for ${source}: ${err}`,
		bundleFailed: (errors) => `Build failed\n${errors}`,
		noJsOutput: (source) => `No JavaScript output generated for ${source}`,
	},

	// File operations
	files: {
		changed: (path) => `Changed: ${path}`,
	},

	// Errors
	errors: {
		// Route conflicts
		routeConflict: (file1, file2) =>
			`❌ Route conflict: Multiple pages map to the same URL\n\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   Remove or rename one of these files.`,

		// Missing layouts
		layoutNotFound: (layoutName, sourceFilePath) =>
			`❌ Layout '${layoutName}' not found in layouts/ directory.\n` +
			`   Create the missing layout file, or change layout for ${sourceFilePath}.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/ directory.\n` +
			`   Create layouts/default.jsx to continue.`,

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`,

		noDefaultExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.`,

		// Layout build errors
		layoutBuildFailed: (fileName, errorMessage) =>
			`❌ Failed to build layout\n\n` +
			`   Layout: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (filePath) =>
			`❌ ${filePath} must export a default function.\n` +
			`   Pages require a default export.`,

		invalidMeta: (fileName, issues) =>
			`❌ The page 'meta' is incomplete.\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Check the page 'meta' export.`,
		islandNotFoundRegistry: (name) =>
			`❌ Island "${name}" failed to load. This is a Castro bug.`,
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
		ssrErrorTitle: "⚠️ Server Rendering Error",
		multipleDirectives: (directives) =>
			`❌ Multiple directives on same component: ${directives}. Use only one.`,
		noLayoutFiles: (dir) =>
			`❌ No layout files found in ${dir}\nCreate at least default.jsx`,
		cacheWriteFailed: (path, err) =>
			`❌ Failed to write cache file: ${path}\n${err}`,
		frameworkUnsupported: (name) =>
			`❌ Framework "${name}" is not supported.\n` +
			`   Built-in: preact, solid. Others require a framework plugin.`,
		frameworkConfigInvalid: (pluginName, missing) =>
			`❌ Plugin "${pluginName}" provides an invalid frameworkConfig.\n` +
			`   Missing: ${missing}`,
		frameworkConfigNoDetection: (pluginName) =>
			`❌ Plugin "${pluginName}" framework config is missing detection.\n` +
			`   Frameworks must declare detectImports, detectExports, or both.`,
		frameworkLoadFailed: (name, err) =>
			`❌ Failed to load framework "${name}".\n` + `   ${err}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown command: ${cmd}\n   Available commands: dev, build`,
		usage: "Usage: castro [dev|build]",
	},
};
