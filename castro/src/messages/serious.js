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
		success: (count, time) => `✓ Build complete: ${count} pages in ${time}`,
		noFiles: "⚠️  No files found to build.",
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileSuccess: (file, time) => `✓ ${file} (${time})`,
		fileFailure: (file, err) => `✗ Failed to build ${file}: ${err}`,
		islandFailed: (err) => `Island build failed: ${err}`,
		ssrSkipped: (source, err) =>
			`SSR compilation skipped for ${source}: ${err}`,
		ssrCompileFailed: (source) => `Failed to compile SSR code for ${source}`,
		noJsOutput: (source) => `No JavaScript output generated for ${source}`,
	},

	// File operations
	files: {
		changed: (path) => `Changed: ${path}`,
		compiled: (count) => `✓ Compiled ${count} island${count === 1 ? "" : "s"}:`,
		layoutsLoaded: (names) => `✓ Loaded layouts: ${names}`,
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
		layoutNotFound: (layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/ directory.\n` +
			`   Create the missing layout file.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/ directory.\n` +
			`   Create layouts/default.jsx to continue.`,

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`,

		islandNoExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   Island components require a default export.`,

		// Page build errors
		pageBuildFailed: (fileName, errorMessage) =>
			`❌ Failed to build page\n\n` +
			`   Page: ${fileName}\n` +
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
		islandDefaultExportMissing: (fileName) =>
			`❌ Island "${fileName}" must have a default export.\n\n` +
			`Example:\n` +
			`  export default function MyComponent(props) {\n` +
			`  return <div>...</div>;\n` +
			`  }`,
		islandAnonymousExport: (fileName) =>
			`⚠️  Island "${fileName}" has an anonymous default export and won't hydrate.\n` +
			`   Use a named export: export default function MyComponent() { ... }`,
		islandNotFoundRegistry: (name) =>
			`❌ Island "${name}" not found in registry`,
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
		multipleDirectives: (directives) =>
			`❌ Multiple directives on same component: ${directives}. Use only one.`,
		noLayoutFiles: (dir) =>
			`❌ No layout files found in ${dir}\nCreate at least default.jsx`,
		cacheWriteFailed: (path, err) =>
			`❌ Failed to write cache file: ${path}\n${err}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown command: ${cmd}\n   Available commands: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	purge: {
		success: "✓ Build directory cleaned.",
	},
};
