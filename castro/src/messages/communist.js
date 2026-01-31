/**
 * Satirical preset - Communist-themed messages
 * One joke maximum per error, prioritizes clarity
 *
 * @type {import('./messages.js').Messages}
 */
export const satirical = {
	// CLI startup
	devServer: {
		ready: (url) => `The revolution is live at ${url}`,
		watching: "The State is watching for changes...",
		serverError: (msg) => `🚨 The State has collapsed: ${msg}`,
		watchError: (dir, msg) => `⚠️  The State cannot observe ${dir}: ${msg}`,
	},

	build: {
		starting: "Realizing the Five-Year Plan...",
		success: (count, time) =>
			`✓ Delivered ${count} pages to the people in ${time}`,
		noFiles: "⚠️  No files found. The collective is empty.",
		writingFile: (source, dest) => `📝 Distributing ${source} → ${dest}`,
		fileSuccess: (file, time) => `✅ ${file} (${time})`,
		fileFailure: (file, err) => `💥 Sabotage in ${file}: ${err}`,
		islandFailed: (err) => `🏝️  Island construction failed: ${err}`,
		ssrSkipped: (source, err) => `⏭️  Skipped SSR for ${source}: ${err}`,
		ssrCompileFailed: (source) => `❌ SSR compilation failed for ${source}`,
		noJsOutput: (source) => `❌ No JavaScript generated for ${source}`,
	},

	// File operations
	files: {
		changed: (path) => `📝 Revised: ${path}`,
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
			`   The revolution cannot serve two masters - eliminate one.`,

		// Missing layouts
		layoutNotFound: (layoutName) =>
			`❌ Layout '${layoutName}' not found in layouts/\n` +
			`   Every page needs leadership - create the missing layout.`,

		missingDefaultLayout: () =>
			`❌ Required layout 'default.jsx' not found in layouts/\n` +
			`   The default layout is mandatory. Create it immediately.`,

		noLayoutsDir: (layoutsDir) =>
			`❌ Layouts directory not found: ${layoutsDir}\n` +
			`   Create it and add at least default.jsx - the revolution needs structure.`,

		islandNoExport: (fileName) =>
			`⚠️  ${fileName} must export a default function.\n` +
			`   The collective requires proper structure.`,

		// Page build errors
		pageBuildFailed: (fileName, errorMessage) =>
			`❌ Build failed (sabotage detected)\n\n` +
			`   Page: ${fileName}\n` +
			`   Error: ${errorMessage}`,

		jsxNoExport: (fileName) =>
			`❌ JSX page ${fileName} must export a default function.\n` +
			`   Components serve the collective, not themselves.`,

		// Config errors
		configLoadFailed: (errorMessage) =>
			`❌ The manifesto is corrupted!\n\n` +
			`   Error: ${errorMessage}\n\n` +
			`   Revise manifesto.js and eliminate errors.`,

		invalidMeta: (fileName, issues) =>
			`❌ The page 'meta' is incomplete.\n\n` +
			`   Page: ${fileName}\n` +
			`   Issues:\n` +
			issues.map((i) => `   - ${i}`).join("\n") +
			`\n\n   Correct the 'meta' export to satisfy the bureaucracy.`,
		islandDefaultExportMissing: (fileName) =>
			`❌ Island "${fileName}" must identify itself (default export).\n\n` +
			`Example:\n` +
			`  export default function MyComponent(props) {\n` +
			`  return <div>...</div>;\n` +
			`  }`,
		islandNotFoundRegistry: (name) =>
			`❌ Island "${name}" has vanished from the registry!`,
		islandRenderFailed: (name, err) =>
			`❌ The people rejected island "${name}": ${err}`,
		multipleDirectives: (directives) =>
			`❌ Ideological conflict: Multiple directives on same component (${directives}). Decree only one.`,
		noLayoutFiles: (dir) =>
			`❌ No layout found in ${dir}. The state needs structure - add default.jsx.`,
		configAccessFailed: (path) => `❌ The manifesto is inaccessible: ${path}`,
		cacheWriteFailed: (path, err) =>
			`❌ Failed to archive cache at ${path}: ${err}`,
	},

	// Config
	config: {
		changed: "\n⚙️  Manifesto revised. The revolution must restart...",
		restarting: "Restarting...",
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},

	purge: {
		success: "🧹 Counter-revolutionary artifacts eliminated.",
	},
};
