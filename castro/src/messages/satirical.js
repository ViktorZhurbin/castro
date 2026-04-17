/**
 * Satirical preset - Communist-themed messages
 * One joke maximum per error, prioritizes clarity
 *
 * @type {import('./messages.js').Messages}
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
		writingFile: (source, dest) => `Writing ${source} → ${dest}`,
		fileFailure: (file) => `Sabotage detected in ${file}`,
	},

	// File operations
	files: {
		changed: (path) => `Revised: ${path}`,
	},

	// The Ministry of Errors
	errors: {
		ROUTE_CONFLICT: ({ route1, route2, outputPath }) => ({
			title: "Route conflict",
			message: `Two pages claim the same route - ${outputPath}`,
			notes: [route1, route2],
			hint: "The revolution cannot serve two masters — remove the impostor",
		}),

		LAYOUT_NOT_FOUND: ({ layoutName, sourceFilePath }) => ({
			title: "Layout not found",
			message: `Layout '${layoutName}' has defected from layouts/`,
			hint: `Create the missing layout, or change layout for ${sourceFilePath}`,
		}),

		LAYOUT_MISSING_DEFAULT: () => ({
			title: "Missing default layout",
			message: "default.jsx not found in layouts/",
			hint: "Create layouts/default.jsx to continue",
		}),

		NO_LAYOUTS_DIR: () => ({
			title: "Layouts directory missing",
			message: `No layouts/ directory found`,
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

		YAML_PARSE_FAILED: ({ error, sourceFilePath }) => ({
			title: "Invalid Markdown frontmatter",
			message: `Frontmatter parsing in ${sourceFilePath} failed: ${error}`,
			hint: "Check the frontmatter block for counter-revolutionary syntax",
		}),

		META_INVALID: ({ file, issues }) => ({
			title: "Invalid page meta",
			message: `${file} submitted incomplete papers`,
			notes: issues,
			hint: "Check that all meta properties are properly formed",
		}),

		BUNDLE_FAILED: () => ({
			title: "Production halted",
			message: "Error during JavaScript compilation",
			hint: "Check the code frame and error location above",
		}),

		MULTIPLE_DIRECTIVES: () => ({
			title: "Multiple hydration directives",
			message: `Components should serve a single purpose, defined by state`,
			hint: "Use only one hydration directive per island",
		}),

		ISLAND_NOT_FOUND: ({ islandId }) => ({
			title: "Island defected",
			message: `Island '${islandId}' failed to load`,
			hint: "This is a Castro internal error — please report it",
		}),

		NO_PAGES: ({ dir }) => ({
			title: "No pages found",
			message: `The revolution requires at least one page in ${dir}`,
			hint: "Create a .md or .jsx/.tsx file in pages/ to continue",
		}),

		FRAMEWORK_CONFIG_INVALID: ({ pluginName, missing }) => ({
			title: "Invalid framework config",
			message: `Plugin "${pluginName}" submitted incomplete papers — missing: ${missing}`,
			hint: "Fill in the missing fields to pass inspection",
		}),

		FRAMEWORK_CONFIG_NO_DETECTION: ({ pluginName }) => ({
			title: "Framework config missing detection",
			message: `Plugin "${pluginName}" cannot identify its comrades — no detection declared`,
			hint: "Declare detectImports, detectExports, or both",
		}),

		CACHE_WRITE_FAILED: ({ path, error }) => ({
			title: "Cache write failed",
			message: `The State could not stockpile compiled output at ${path}: ${error}`,
			hint: "Check disk space and write permissions",
		}),

		ISLAND_RENDER_FAILED: ({ islandId, error }) => ({
			title: "Island SSR failed",
			message: `${islandId} collapsed on the server: ${error}`,
			hint: "The island will show an error box instead — fix the component to render correctly",
		}),

		FRAMEWORK_LOAD_FAILED: ({ name, error }) => ({
			title: "Framework failed to load",
			message: `Plugin "${name}" collapsed during registration: ${error}`,
			hint: "Check the plugin's frameworkConfig for initialization errors",
		}),

		UNEXPECTED: () => ({
			title: "Unexpected error",
			message: "The revolution has encountered an anomaly",
			hint: "Check the error details above",
		}),

		// SSR error title — rendered inline in islands/marker.js, not thrown
		ssrErrorTitle: "⚠️ Counter-revolutionary logic detected",

		// Out of scope (v2+)
		frameworkUnsupported: (name) =>
			`❌ Framework "${name}" is not recognized by the Party.\n` +
			`   Built-in: preact, solid. Others require a framework plugin.`,
	},

	// Commands
	commands: {
		unknown: (cmd) =>
			`❌ Unknown directive: ${cmd}\n   The Party recognizes only: dev, build`,
		usage: "Usage: castro [dev|build]",
	},
};
