/**
 * Satirical preset - Communist-themed messages
 * One joke maximum per error, prioritizes clarity
 *
 * @type {import('./messages.d.ts').Messages}
 */
export const satirical = {
	// CLI startup
	devServer: {
		ready: (url) =>
			`The revolution is live at ${url}\n` +
			`The State is watching for changes...`,
		serverError: (msg) => `Server has collapsed: ${msg}`,
		watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`,
	},

	build: {
		starting: "Realizing the Five-Year Plan...",
		success: (count, time) =>
			`✓ Delivered ${count} pages to the people in ${time}`,
		noFiles: "⚠️  No files found. The collective is empty.",
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileSuccess: (file, time) => `✓ ${file} (${time})`,
		fileFailure: (file, err) => `Sabotage detected in ${file}: ${err}`,
		islandFailed: (err) => `Island build failed: ${err}`,
		ssrSkipped: (source, err) =>
			`SSR compilation skipped for ${source}: ${err}`,
		ssrCompileFailed: (source) => `Failed to compile SSR code for ${source}`,
		noJsOutput: (source) => `No JavaScript output generated for ${source}`,
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
		compiled: (count) => `✓ Compiled ${count} island${count === 1 ? "" : "s"}:`,
		layoutsLoaded: (names) => `✓ Loaded layouts: ${names}`,
	},

	// The Ministry of Errors
	errors: {
		// Route conflicts
		routeConflict: (file1, file2) =>
			`❌ Route conflict: Two pages claim the same route\n\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   The revolution cannot serve two masters.`,

		// Missing layouts
		layoutNotFound: (layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/\n` +
			`   Create the missing layout file.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/\n` +
			`   Create layouts/default.jsx to continue.`,

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`,

		islandNoExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   Island components require a default export.`,

		// Page build errors
		pageBuildFailed: (fileName, errorMessage) =>
			`❌ Build failed (sabotage detected)\n\n` +
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (filePath) =>
			`❌ ${filePath} must export a default function.\n` +
			`   Pages require a default export.`,

		invalidMeta: (fileName, issues) =>
			`❌ Invalid page metadata\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Check the page 'meta' export.`,
		islandNotFoundRegistry: (name) =>
			`❌ Island "${name}" not found in registry`,
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
		ssrErrorTitle: "⚠️ Counter-revolutionary logic detected",
		multipleDirectives: (directives) =>
			`❌ Multiple directives on same component: ${directives}. Use only one.`,
		noLayoutFiles: (dir) =>
			`❌ No layout files found in ${dir}\nCreate at least default.jsx`,
		cacheWriteFailed: (path, err) =>
			`❌ Failed to write cache file: ${path}\n${err}`,
		frameworkUnsupported: (name) =>
			`❌ Framework "${name}" is not recognized by the Party.\n` +
			`   Approved frameworks: preact`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},
};
