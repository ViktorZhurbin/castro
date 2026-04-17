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
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
	},

	// The Ministry of Errors — structured payloads (v1 scope: build-time fatals only)
	errors: {
		ROUTE_CONFLICT: ({ files }) => ({
			title: "Route conflict",
			message: "Two pages claim the same revolution",
			notes: /** @type {string[]} */ (files),
			hint: "The workers cannot serve two masters — remove one",
		}),

		LAYOUT_NOT_FOUND: ({ layoutName, sourceFile }) => ({
			title: "Layout not found",
			message: `Layout '${layoutName}' has defected from layouts/`,
			hint: `Create the layout, or re-educate ${sourceFile}`,
		}),

		LAYOUT_MISSING_DEFAULT: () => ({
			title: "Missing default layout",
			message: "layouts/default.jsx is mandatory for the collective",
			hint: "Create layouts/default.jsx to continue",
		}),

		NO_LAYOUTS_DIR: ({ dir }) => ({
			title: "Layouts directory missing",
			message: `No layouts/ directory found at ${dir}`,
			hint: "Create the directory with at least default.jsx",
		}),

		NO_LAYOUT_FILES: ({ dir }) => ({
			title: "Layouts directory is empty",
			message: `No layout files found in ${dir}`,
			hint: "Create at least default.jsx",
		}),

		LAYOUT_NO_DEFAULT_EXPORT: ({ file }) => ({
			title: "Layout has no default export",
			message: `${file} must export a default function`,
			hint: "Add a default export to this layout",
		}),

		PAGE_NO_DEFAULT_EXPORT: ({ file }) => ({
			title: "Page has no default export",
			message: `${file} must export a default function`,
			hint: "Add a default export to this page",
		}),

		YAML_PARSE_FAILED: ({ reason }) => ({
			title: "Markdown frontmatter sabotage",
			message: `YAML parsing failed: ${reason}`,
			hint: "Check the frontmatter block for counter-revolutionary syntax",
		}),

		META_INVALID: ({ file, issues }) => ({
			title: "Invalid page meta",
			message: `${file} submitted incomplete papers`,
			notes: /** @type {string[]} */ (issues),
			hint: "Check that all meta properties are properly formed",
		}),

		BUNDLE_FAILED: () => ({
			title: "Production halted",
			message: "Error during JavaScript compilation",
			hint: "Check the code frame and error location above",
		}),

		MULTIPLE_DIRECTIVES: ({ directives }) => ({
			title: "Multiple hydration directives",
			message: `Component cannot serve both ${/** @type {string[]} */ (directives).join(" and ")}`,
			hint: "Use only one hydration directive per island",
		}),

		ISLAND_NOT_FOUND: ({ islandId }) => ({
			title: "Island defected",
			message: `Island '${islandId}' failed to load`,
			hint: "This is a Castro internal error — please report it",
		}),

		UNEXPECTED: () => ({
			title: "Unexpected error",
			message: "The revolution has encountered an anomaly",
			hint: "Check the error details above",
		}),

		// SSR error title — rendered inline in islands/marker.js, not thrown
		ssrErrorTitle: "⚠️ Counter-revolutionary logic detected",

		// Out of scope (v2+)
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
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
