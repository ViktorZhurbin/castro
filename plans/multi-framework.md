## 1. What & Why (3 sentences max)

- Replace the singleton `frameworkConfig` with a per-island framework resolution system, so different islands can use different UI frameworks (Preact, Solid, etc.) in the same project.
- This enables multi-framework testing without separate test sites and validates that the `FrameworkConfig` abstraction works for more than one framework.
- Expected end state: islands in `components/solid/` use Solid config, all others use the default from `castro.config.js`. A single page can render islands from multiple frameworks side by side.

---

## 2. Files to Modify

```
castro/src/islands/framework-config.js  - Replace singleton export with async loader + sync cache
castro/src/islands/frameworks/preact.js - NEW: Extract Preact config to its own file
castro/src/islands/frameworks/types.d.ts - NEW: Shared type for framework config files
castro/src/islands/compiler.js          - Accept frameworkName param, resolve config dynamically
castro/src/islands/marker.js            - Read framework config from island data instead of singleton
castro/src/islands/registry.js          - Detect framework from folder convention, pass to compiler
castro/src/islands/plugins.js           - Remove getImportMap (moved to write-html-page)
castro/src/builder/write-html-page.js   - Aggregate import maps from used islands directly
castro/src/types.d.ts                   - Add frameworkName to IslandComponent type
castro/src/messages/messages.d.ts       - Add frameworkLoadFailed message
castro/src/messages/serious.js          - Add frameworkLoadFailed message
castro/src/messages/communist.js        - Add frameworkLoadFailed message
```

---

## 3. Non-Negotiable Rules

Castro-specific constraints:
- Preserve ALL existing JSDoc comments (update as needed)
- Add JSDoc to any new functions (@param, @returns, @import)
- Maintain ~50% comment density (educational code)
  - DO NOT add "Educational note" text, just explain things in clear way. Don't be too "educational"
- User-facing errors go through messages.js with styleText()
- Include .js extensions on all imports (Node ESM)
- Do NOT add npm dependencies
- Do NOT deviate from the plan. If something doesn't work - stop and report back.
- The page shell (pages, layouts) always uses Preact. Only island compilation/SSR is framework-routed.
- `import { h } from "preact"` in `marker.js` MUST stay — it creates VNodes for the page shell, not for island rendering.

---

## 4. Implementation Steps

### Step 1: Add message for framework load failures

**Goal**: Add error message for when a framework config file can't be loaded
**Files**: `castro/src/messages/messages.d.ts`, `castro/src/messages/serious.js`, `castro/src/messages/communist.js`

**Changes in `castro/src/messages/messages.d.ts`**:

In the `errors` block, after `frameworkUnsupported`, add:

```ts
frameworkLoadFailed: (name: string, err: string) => string;
```

**Changes in `castro/src/messages/serious.js`**:

In the `errors` block, after `frameworkUnsupported`, add:

```js
frameworkLoadFailed: (name, err) =>
    `❌ Failed to load framework "${name}": ${err}\n` +
    `   Is the framework file present in src/islands/frameworks/?`,
```

**Changes in `castro/src/messages/communist.js`**:

In the `errors` block, after `frameworkUnsupported`, add:

```js
frameworkLoadFailed: (name, err) =>
    `❌ Failed to load framework "${name}": ${err}\n` +
    `   The Party cannot find this framework's config file.`,
```

---

### Step 2: Add `frameworkName` to `IslandComponent` type

**Goal**: Type the new field that each island carries
**Files**: `castro/src/types.d.ts`

**Changes in `castro/src/types.d.ts`**:

Find the `IslandComponent` type:

```ts
export type IslandComponent = {
	sourcePath: string;
	publicJsPath: string;
	cssContent?: string;
	ssrCode: string;
	// biome-ignore lint/complexity/noBannedTypes: framework-agnostic callable
	ssrModule?: { default: Function };
};
```

Replace with:

```ts
export type IslandComponent = {
	sourcePath: string;
	publicJsPath: string;
	cssContent?: string;
	ssrCode: string;
	/** Which framework this island uses (e.g., "preact", "solid") */
	frameworkName: string;
	// biome-ignore lint/complexity/noBannedTypes: framework-agnostic callable
	ssrModule?: { default: Function };
};
```

Also remove `getImportMap` from `CastroPlugin` type. Find:

```ts
export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
	getImportMap?: () => ImportsMap | null;
	onPageBuild?: () => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};
```

Replace with:
```ts
export type CastroPlugin = {
	name: string;
	watchDirs?: string[];
	getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
	onPageBuild?: () => Promise<void>;
	transform?: (ctx: {
		content: string;
	}) => Promise<{ html: string; assets: Asset[] }>;
};
```

---

### Step 3: Create framework config type definition

**Goal**: Shared type for all framework config files
**Files**: `castro/src/islands/frameworks/types.d.ts` (NEW)

Create new file `castro/src/islands/frameworks/types.d.ts`:

```ts
/**
 * Framework Configuration Type
 *
 * Every framework config file (preact.js, solid.js, etc.) must
 * export a default object matching this shape.
 */

import type { ImportsMap } from "../../types.d.ts";

export type FrameworkConfig = {
	/** Framework identifier */
	framework: string;
	/** Bun.build configuration for compiling components */
	getBuildConfig: () => Partial<Bun.BuildConfig>;
	/** CDN URLs for browser-side module loading via import map */
	importMap: ImportsMap;
	/** Code string injected into island client bundles for hydration */
	hydrateFnString: string;
	/** Server-side rendering function, called at build time */
	renderSSR: (
		Component: Function,
		props: Record<string, unknown>,
	) => string;
};
```

---

### Step 4: Extract Preact config to its own file

**Goal**: Move the Preact framework config into `frameworks/preact.js` so each framework is isolated with its own dependencies
**Files**: `castro/src/islands/frameworks/preact.js` (NEW)

Create new file `castro/src/islands/frameworks/preact.js`:

```js
/**
 * Preact Framework Configuration
 *
 * Defines how Preact islands are compiled, rendered (SSR), and hydrated.
 * Each framework config provides four things:
 * 1. getBuildConfig() — Bun.build settings (JSX transform, externals)
 * 2. importMap — CDN URLs for browser-side module loading
 * 3. hydrateFnString — Code injected into the client bundle for hydration
 * 4. renderSSR() — Server-side rendering function for build-time HTML
 *
 * This file is dynamically imported by framework-config.js only when
 * a Preact island is discovered. This isolation means adding a new
 * framework (e.g., Solid) is just creating a new file in this directory
 * with the same shape — no changes to core code needed.
 */

import { h } from "preact";
import { render } from "preact-render-to-string";

/**
 * @import * as preact from "preact"
 * @import { FrameworkConfig } from "./types.d.ts"
 */

/** @type {FrameworkConfig} */
export default {
	framework: "preact",

	/**
	 * Bun.build settings for compiling Preact components.
	 * Uses automatic JSX transform so components don't need `import { h }`.
	 * Marks Preact packages as external — they're loaded via import map in the browser.
	 * @return {Partial<Bun.BuildConfig>}
	 */
	getBuildConfig: () => ({
		jsx: { runtime: "automatic", importSource: "preact" },
		external: ["preact", "preact/hooks", "preact/jsx-runtime"],
	}),

	/**
	 * Import map tells the browser where to load Preact from.
	 * Using esm.sh CDN for zero-config module loading.
	 */
	importMap: {
		preact: "https://esm.sh/preact",
		"preact/hooks": "https://esm.sh/preact/hooks",
		"preact/jsx-runtime": "https://esm.sh/preact/jsx-runtime",
	},

	/**
	 * Client-side hydration code string.
	 *
	 * Injected into the compiled island bundle by compiler.js.
	 * Runs in the browser when the island's <castro-island> triggers hydration.
	 *
	 * Variables available at runtime (provided by the virtual entry wrapper):
	 * - Component: the imported island component function
	 * - props: deserialized from data-props attribute
	 * - container: the <castro-island> DOM element
	 */
	hydrateFnString: `
		const { h, hydrate } = await import("preact");
		hydrate(h(Component, props), container);
	`,

	/**
	 * Server-side rendering function.
	 * Called at build time by marker.js to generate static HTML for the island.
	 */
	renderSSR: (Component, props) =>
		render(h(/** @type {preact.ComponentType<any>} */ (Component), props)),
};
```

---

### Step 5: Rewrite `framework-config.js` as async loader + sync cache

**Goal**: Replace the singleton with a dynamic loader that imports framework files on demand and caches them for synchronous access during rendering
**Files**: `castro/src/islands/framework-config.js`

Replace the entire file contents with:

```js
/**
 * Framework Config Loader
 *
 * Manages framework configurations with two access patterns:
 *
 * 1. Async loading (build time): loadFrameworkConfig("preact") dynamically
 *    imports frameworks/preact.js and caches it. Called by registry.js
 *    when discovering islands, before any rendering happens.
 *
 * 2. Sync access (render time): getFrameworkConfig("preact") returns the
 *    cached config instantly. Called by marker.js during renderToString(),
 *    which is synchronous — no opportunity to await.
 *
 * This split is necessary because renderToString() traverses the VNode tree
 * synchronously, but framework configs may need async imports to avoid
 * crashing when a framework's dependencies aren't installed.
 */

import { config } from "../config.js";
import { messages } from "../messages/index.js";

/**
 * @import { FrameworkConfig } from "./frameworks/types.d.ts"
 */

/**
 * In-memory cache of loaded framework configs.
 * Populated during build initialization, read during rendering.
 * @type {Map<string, FrameworkConfig>}
 */
const loadedConfigs = new Map();

/**
 * Load a framework config file and cache it for later sync access.
 *
 * Dynamically imports from ./frameworks/{name}.js. This means:
 * - Only the frameworks actually used get their dependencies loaded
 * - Missing framework dependencies fail at build time with a clear error,
 *   not at module-load time when the config file is first parsed
 *
 * @param {string} frameworkName - e.g., "preact", "solid"
 * @returns {Promise<FrameworkConfig>}
 */
export async function loadFrameworkConfig(frameworkName) {
	const cached = loadedConfigs.get(frameworkName);
	if (cached) return cached;

	try {
		const mod = await import(`./frameworks/${frameworkName}.js`);
		const fwConfig = /** @type {FrameworkConfig} */ (mod.default);

		loadedConfigs.set(frameworkName, fwConfig);
		return fwConfig;
	} catch (e) {
		const err = /** @type {Error} */ (e);
		throw new Error(
			messages.errors.frameworkLoadFailed(frameworkName, err.message),
		);
	}
}

/**
 * Get a previously loaded framework config (synchronous).
 *
 * Must only be called after loadFrameworkConfig() has completed for this
 * framework name. Throws if the config wasn't pre-loaded — this indicates
 * a bug in the build pipeline (registry should load configs before rendering).
 *
 * @param {string} frameworkName
 * @returns {FrameworkConfig}
 */
export function getFrameworkConfig(frameworkName) {
	const fwConfig = loadedConfigs.get(frameworkName);

	if (!fwConfig) {
		throw new Error(
			messages.errors.frameworkLoadFailed(
				frameworkName,
				"Config was not pre-loaded. This is a Castro bug.",
			),
		);
	}

	return fwConfig;
}

// Pre-load the default framework from castro.config.js at startup.
// This ensures the default config is always available, even if no
// islands explicitly request it.
await loadFrameworkConfig(config.framework);
```

---

### Step 6: Update `compiler.js` to accept framework name

**Goal**: Route compilation through the correct framework config per island
**Files**: `castro/src/islands/compiler.js`

**Changes**:

1. Replace import at line 16:

Find:
```js
import { frameworkConfig } from "./framework-config.js";
```

Replace with:
```js
import { getFrameworkConfig } from "./framework-config.js";
```

2. Update `compileIsland()` signature and body (lines 28-68):

Find (line 28):
```js
 * @param {{ sourcePath: string, outputDir: string, publicDir: string }} params
```

Replace with:
```js
 * @param {{ sourcePath: string, outputDir: string, publicDir: string, frameworkName: string }} params
```

Find (lines 31-40):
```js
export async function compileIsland({ sourcePath, outputDir, publicDir }) {
	try {
		// Compile SSR version first (runs at build time in Bun)
		const ssrCode = await compileIslandSSR({ sourcePath });

		// Compile client version (runs in browser)
		const clientResult = await compileIslandClient({
			sourcePath,
			outputDir,
		});
```

Replace with:
```js
export async function compileIsland({ sourcePath, outputDir, publicDir, frameworkName }) {
	try {
		// Compile SSR version first (runs at build time in Bun)
		const ssrCode = await compileIslandSSR({ sourcePath, frameworkName });

		// Compile client version (runs in browser)
		const clientResult = await compileIslandClient({
			sourcePath,
			outputDir,
			frameworkName,
		});
```

Find the return block (lines 59-64):
```js
		return {
			ssrCode,
			sourcePath,
			publicJsPath,
			cssContent,
		};
```

Replace with:
```js
		return {
			ssrCode,
			sourcePath,
			publicJsPath,
			cssContent,
			frameworkName,
		};
```

3. Update `compileIslandClient()` (lines 78-126):

Find (line 78):
```js
 * @param {{ sourcePath: string, outputDir: string }} params
```

Replace with:
```js
 * @param {{ sourcePath: string, outputDir: string, frameworkName: string }} params
```

Find (line 80):
```js
async function compileIslandClient({ sourcePath, outputDir }) {
```

Replace with:
```js
async function compileIslandClient({ sourcePath, outputDir, frameworkName }) {
```

Find (lines 87-95):
```js
	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${frameworkConfig.hydrateFnString}
		}
	`.trim();

	const buildConfig = frameworkConfig.getBuildConfig();
```

Replace with:
```js
	const fwConfig = getFrameworkConfig(frameworkName);

	const virtualEntry = `
		import Component from './${basename(sourcePath)}';

		export default async (container, props = {}) => {
			${fwConfig.hydrateFnString}
		}
	`.trim();

	const buildConfig = fwConfig.getBuildConfig();
```

4. Update `compileIslandSSR()` (lines 137-186):

Find (line 137):
```js
 * @param {{ sourcePath: string }} params
```

Replace with:
```js
 * @param {{ sourcePath: string, frameworkName: string }} params
```

Find (lines 139-140):
```js
async function compileIslandSSR({ sourcePath }) {
	const buildConfig = frameworkConfig.getBuildConfig();
```

Replace with:
```js
async function compileIslandSSR({ sourcePath, frameworkName }) {
	const fwConfig = getFrameworkConfig(frameworkName);
	const buildConfig = fwConfig.getBuildConfig();
```

---

### Step 7: Update `registry.js` to detect framework from folder convention

**Goal**: Determine which framework each island uses based on its directory path, load the config, and pass it to the compiler
**Files**: `castro/src/islands/registry.js`

**Changes**:

1. Add imports after line 21 (after the `compileIsland` import):

```js
import { loadFrameworkConfig } from "./framework-config.js";
import { config as castroConfig } from "../config.js";
```

2. Inside `load()`, after the `sourcePath` assignment (line 65), add framework detection.

Find:
```js
		for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
			const sourcePath = join(COMPONENTS_DIR, relativePath);

			// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
			const relativeDir = dirname(relativePath);
```

Replace with:
```js
		for await (const relativePath of islandGlob.scan(COMPONENTS_DIR)) {
			const sourcePath = join(COMPONENTS_DIR, relativePath);

			// Determine which framework this island uses.
			// Convention: islands in components/solid/ use "solid", etc.
			// Falls back to the default from castro.config.js.
			const frameworkName = detectFramework(relativePath);
			await loadFrameworkConfig(frameworkName);

			// Preserve directory nesting in output (e.g., ui/Button → islands/ui/Button)
			const relativeDir = dirname(relativePath);
```

3. Update the `compileIsland` call (lines 76-80):

Find:
```js
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
				});
```

Replace with:
```js
				const component = await compileIsland({
					sourcePath,
					outputDir,
					publicDir,
					frameworkName,
				});
```

4. Add the `detectFramework` function at the bottom of the file, **before** the final `export const islands` line:

```js
/**
 * Known framework names that can be used as folder conventions.
 * An island in components/solid/ uses "solid", etc.
 * @type {Set<string>}
 */
const KNOWN_FRAMEWORKS = new Set(["preact", "solid"]);

/**
 * Detect which framework an island uses based on its directory path.
 *
 * Convention: if the first directory segment inside components/ matches
 * a known framework name, use that framework. Otherwise fall back to
 * the project default from castro.config.js.
 *
 * Examples:
 *   "solid/Counter.island.tsx"  → "solid"
 *   "ui/Button.island.tsx"      → default from config
 *   "Counter.island.tsx"        → default from config
 *
 * @param {string} relativePath - Path relative to components directory
 * @returns {string} Framework name
 */
function detectFramework(relativePath) {
	const firstSegment = relativePath.split("/")[0];

	if (KNOWN_FRAMEWORKS.has(firstSegment)) {
		return firstSegment;
	}

	return castroConfig.framework;
}
```

---

### Step 8: Update `marker.js` to use per-island framework config

**Goal**: Route SSR rendering through the correct framework config for each island
**Files**: `castro/src/islands/marker.js`

**Changes**:

1. Replace import at line 17:

Find:
```js
import { frameworkConfig } from "./framework-config.js";
```

Replace with:
```js
import { getFrameworkConfig } from "./framework-config.js";
```

2. In `renderMarker()`, replace lines 47-68:

Find:
```js
export function renderMarker(islandId, props = {}) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new Error(messages.errors.islandNotFoundRegistry(islandId));
	}

	usedIslands.add(islandId);

	const { directive, cleanProps } = processProps(props);

	let ssrHtml = "";

	try {
		ssrHtml = frameworkConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.error(messages.errors.islandRenderFailed(islandId, err.message));

		ssrHtml = frameworkConfig.renderSSR(SSRError, { islandId, error: err });
	}
```

Replace with:
```js
export function renderMarker(islandId, props = {}) {
	const island = islands.getIsland(islandId);

	if (!island?.ssrModule) {
		throw new Error(messages.errors.islandNotFoundRegistry(islandId));
	}

	usedIslands.add(islandId);

	// Each island carries its framework name from compilation.
	// Resolve the config synchronously from the pre-loaded cache.
	const fwConfig = getFrameworkConfig(island.frameworkName);

	const { directive, cleanProps } = processProps(props);

	let ssrHtml = "";

	try {
		ssrHtml = fwConfig.renderSSR(island.ssrModule.default, cleanProps);
	} catch (e) {
		const err = /** @type {Bun.ErrorLike} */ (e);

		console.error(messages.errors.islandRenderFailed(islandId, err.message));

		// Error fallback always uses Preact's renderSSR since the SSRError
		// component is a Preact component (uses h() from preact)
		const defaultConfig = getFrameworkConfig("preact");
		ssrHtml = defaultConfig.renderSSR(SSRError, { islandId, error: err });
	