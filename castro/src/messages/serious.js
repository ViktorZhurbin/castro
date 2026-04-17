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
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileFailure: (file) => `✗ Failed to build ${file}`,
	},

	// File operations
	files: {
		changed: (path) => `Changed: ${path}`,
	},

	// Errors — structured payloads (v1 scope: build-time fatals only)
	errors: {
		ROUTE_CONFLICT: ({ route1, route2 }) => ({
			title: "Route conflict",
			message: "Two pages map to the same URL",
			notes: [route1, route2],
			hint: "Remove or rename one of these files",
		}),

		LAYOUT_NOT_FOUND: ({ layoutName, sourceFile }) => ({
			title: "Layout not found",
			message: `Layout '${layoutName}' does not exist in layouts/`,
			hint: `Create the layout, or change the layout for ${sourceFile}`,
		}),

		LAYOUT_MISSING_DEFAULT: () => ({
			title: "Missing default layout",
			message: "layouts/default.jsx is required",
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
			title: "Markdown frontmatter syntax error",
			message: `YAML parsing failed: ${reason}`,
			hint: "Check the frontmatter block at the top of the file",
		}),

		META_INVALID: ({ file, issues }) => ({
			title: "Invalid page meta",
			message: `${file} has invalid meta properties`,
			notes: issues,
			hint: "Check that all meta properties have correct types",
		}),

		BUNDLE_FAILED: () => ({
			title: "Build failed",
			message: "Error during JavaScript compilation",
			hint: "Check the code frame and error location above",
		}),

		MULTIPLE_DIRECTIVES: ({ directives }) => ({
			title: "Multiple hydration directives",
			message: `Component has both ${directives.join(" and ")}`,
			hint: "Use only one hydration directive per island",
		}),

		ISLAND_NOT_FOUND: ({ islandId }) => ({
			title: "Island not found",
			message: `Island '${islandId}' failed to load`,
			hint: "This is a Castro internal error — please report it",
		}),

		NO_PAGES: ({ dir }) => ({
			title: "No pages found",
			message: `No .md or .jsx/.tsx files found in ${dir}`,
			hint: "Create at least one page file to continue",
		}),

		UNEXPECTED: () => ({
			title: "Unexpected error",
			message: "An error occurred during the build",
			hint: "Check the error details above",
		}),

		// SSR error title — rendered inline in islands/marker.js, not thrown
		ssrErrorTitle: "⚠️ Server Rendering Error",

		// Out of scope (v2+)
		islandRenderFailed: (name, err) =>
			`❌ Failed to render island "${name}": ${err}`,
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
