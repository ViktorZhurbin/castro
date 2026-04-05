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
		success: (count) => `✓ Delivered ${count} pages to the people.`,
		noFiles: "⚠️  No pages found to build.",
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileFailure: (file, err) => `Sabotage detected in ${file}: ${err}`,
		islandFailed: (err) => `Island build failed: ${err}`,
		ssrCompileFailed: (source, err) =>
			`Failed to compile SSR code for ${source}: ${err}`,
		bundleFailed: (errors) => `Production halted\n${errors}`,
		noJsOutput: (source) => `No JavaScript output generated for ${source}`,
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
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
		layoutNotFound: (layoutName, sourceFilePath) =>
			`❌ Layout '${layoutName}' not found in layouts/\n` +
			`   Create the missing layout file, or change layout for ${sourceFilePath}.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/\n` +
			`   Create layouts/default.jsx to continue.`,

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`,

		noDefaultExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.`,

		// Layout build errors
		layoutBuildFailed: (fileName, errorMessage) =>
			`❌ Layout build failed (sabotage detected)\n\n` +
			`   Layout: ${fileName}\n` +
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
			`❌ Island "${name}" failed to load. This is a Castro bug.`,
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
		ssrErrorTitle: "⚠️ Counter-revolutionary logic detected",
		multipleDirectives: (directives) =>
			`❌ Multiple directives on same component: ${directives}. Pick one.`,
		noLayoutFiles: (dir) =>
			`❌ No layout files found in ${dir}\nCreate at least default.jsx`,
		cacheWriteFailed: (path, err) =>
			`❌ Failed to write cache file: ${path}\n${err}`,
		frameworkUnsupported: (name) =>
			`❌ Framework "${name}" is not recognized by the Party.\n` +
			`   Built-in: preact, solid. Others require a framework plugin.`,
		frameworkConfigInvalid: (pluginName, missing) =>
			`❌ Plugin "${pluginName}" submitted incomplete papers.\n` +
			`   Missing: ${missing}`,
		frameworkConfigNoDetection: (pluginName) =>
			`❌ Plugin "${pluginName}" framework lacks detection mechanism.\n` +
			`   Frameworks must declare detectImports, detectExports, or both.`,
		frameworkLoadFailed: (name, err) =>
			`❌ Framework "${name}" collapsed during initialization.\n` + `   ${err}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},
};
