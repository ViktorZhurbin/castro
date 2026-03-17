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
		watchError: (dir, msg) => `Could not watch ${dir}: ${msg}`, // Unused? Low value and clarity
	},

	build: {
		starting: "Realizing the Five-Year Plan...",
		success: (count, time) =>
			`✓ Delivered ${count} pages to the people in ${time}`,
		noFiles: "⚠️  No files found. The collective is empty.", // Bad joke?
		writingFile: (source, dest) => `Writing ${source} → ${dest}`, // Any interesting beurocratic synonyms for "writing"?
		fileSuccess: (file, time) => `✓ ${file} (${time})`, // drop time. is this useful?
		fileFailure: (file, err) => `Sabotage detected in ${file}: ${err}`, // is it clear enough?
		islandFailed: (err) => `Island build failed: ${err}`, // no joke
		ssrCompileFailed: (source, err) =>
			`Failed to compile SSR code for ${source}: ${err}`, // no joke?
		bundleFailed: (errors) => `Production halted\n${errors}`,
		noJsOutput: (source) => `No JavaScript output generated for ${source}`, // why serious?
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
		compiled: (count) => `✓ Compiled ${count} island${count === 1 ? "" : "s"}:`, // loaded and compiled?
		layoutsLoaded: (names) => `✓ Loaded layouts: ${names}`,
	},

	// The Ministry of Errors
	errors: {
		// Route conflicts
		routeConflict: (file1, file2) =>
			`❌ Route conflict: Two pages claim the same route\n\n` +
			`   · ${file1}\n` +
			`   · ${file2}\n\n` +
			`   The revolution cannot serve two masters.`, // Nice wrapping: clarity first, joke as a polishing pass

		// Missing layouts
		layoutNotFound: (layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/\n` +
			`   Create the missing layout file.`, // why serious?

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/\n` +
			`   Create layouts/default.jsx to continue.`, // why serious?

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create the directory and add at least default.jsx`, // why serious?

		islandNoExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   Island components require a default export.`, // is it still a requirement?

		// Page build errors
		pageBuildFailed: (fileName, errorMessage) =>
			`❌ Build failed (sabotage detected)\n\n` + // why both?
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (filePath) =>
			`❌ ${filePath} must export a default function.\n` +
			`   Pages require a default export.`, // are they?

		invalidMeta: (fileName, issues) =>
			`❌ Invalid page metadata\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Check the page 'meta' export.`, // too much?
		islandNotFoundRegistry: (name) =>
			`❌ Island "${name}" not found in registry`, // why serious? user doesn't know what is registry
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`, // useless?
		ssrErrorTitle: "⚠️ Counter-revolutionary logic detected",
		multipleDirectives: (directives) =>
			`❌ Multiple directives on same component: ${directives}. Use only one.`, // last part is dumb
		noLayoutFiles: (dir) =>
			`❌ No layout files found in ${dir}\nCreate at least default.jsx`, // I've seen this above?
		cacheWriteFailed: (path, err) =>
			`❌ Failed to write cache file: ${path}\n${err}`, // infernal error, is it useful?
		frameworkUnsupported: (name) =>
			`❌ Framework "${name}" is not recognized by the Party.\n` +
			`   Approved: preact. Others require a framework plugin.`, // no longer true? Remove hard coded values 
		frameworkConfigInvalid: (pluginName, missing) =>
			`❌ Plugin "${pluginName}" submitted incomplete papers.\n` +
			`   Missing: ${missing}`, // plugin or framework?
		frameworkLoadFailed: (name, err) =>
			`❌ Framework "${name}" collapsed during initialization.\n` + `   ${err}`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`, // needs polishing 
		usage: "Usage: castro [dev|build]", // ??
	},
};
