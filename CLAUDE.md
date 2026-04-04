# Castro

Educational Static Site Generator (~1500 LOC) teaching island architecture. Communist satire wraps serious, well-commented code. Preact for page rendering and islands, optional multiple frameworks (Solid, castro-jsx) for islands, Bun for everything else.

Comparable to:
- Fresh, Marko (though way less advanced), early Astro, Eleventy + is-land.
- Also, to smaller peers: Capri, Mastro, Iles, Enhance.

## Commands

```
bun run dev          # dev server with live reload (website playground)
bun run build        # production build (website playground)
bun format           # Biome formatter (tabs, double quotes)
bun check            # format + core checks + site tests (run before committing)
bun test:sites       # build and verify test sites only
bun loc              # LOC count (core only, excludes messages/)
```

## Monorepo Layout

- `castro/` — core SSG engine (the npm package `@vktrz/castro`)
- `packages/` — packages and plugins (e.g., `@vktrz/castro-jsx`, `@vktrz/castro-tailwind`)
- `website/` — demo playground that consumes castro
- `test-site/` — minimal test site exercising castro-jsx, Preact, and Solid islands

### Core Module Structure (`castro/src/`)

```
cli.js                  Entry point (dev | build)
config.js               Loads castro.config.js
constants.js            Shared path constants

builder/
  buildAll.js          Full site build orchestration
  buildPage.js         Single page build (JSX or Markdown)
  compileJsx.js        Bun.build pipeline for pages and layouts
  renderPage.js        VNode → HTML via renderToString
  writeHtmlPage.js    HTML assembly (assets, CSS injection, import maps)
  writeCss.js          CSS file extraction

islands/
  buildPlugins.js      Bun.build plugins for compile-time island interception
  compiler.js           Island SSR + client compilation
  registry.js           Singleton island store + SSR module preloading
  marker.js             Build-time island renderer
  frameworkConfig.js   Framework config loader (async load + sync cache)
  frameworks/           Built-in framework configs (preact.js, solid.js, types.d.ts)
  plugins.js            Plugin registry (internal + user plugins from config)
  hydration.js          Client-side <castro-island> custom element

layouts/
  registry.js           Layout discovery and compilation

dev/
  server.js             Dev server (Bun.serve + file watching + SSE)
  liveReload.js        Client-side SSE reconnection script

messages/
  messages.d.ts         Shared interface (both presets implement this)
  communist.js          Satirical preset
  serious.js            Technical preset
  index.js              Exports active preset based on config
  README.md             Message writing guidelines

utils/
  dependencies.js       Reads package.json for accurate Bun.build `external` arrays
  cache.js              Module caching with content-hashed filenames
  ids.js                Island ID generation (project-relative paths)
  format.js             Time formatting
  validateMeta.js       Page metadata validation

types.d.ts              Shared types (IslandComponent, PageMeta, CastroPlugin, etc.)
jsx.d.ts                JSX namespace for custom directives
```


## Architecture

### Build Pipeline

1. `cli.js` → `buildAll()` → clean dist, copy public/, run plugins, build pages
2. Pages (JSX/MD) compiled via `Bun.build` with two plugins:
   - `castroExternalsPlugin` — keeps Castro internals external (singleton sharing)
   - `islandMarkerPlugin` — replaces `.island.tsx` imports with marker stubs
3. `external: getProjectDependencies()` externalizes all project dependencies. Supports tsconfig.json path aliases natively.
4. Compiled page module is loaded via `getModule()` (content-hashed file path to bust Bun's import cache)
5. `renderToString()` renders the full VNode tree (page + layout + islands) in one pass
6. Islands encountered during render: marker calls `renderMarker()` → registry lookup → SSR → `<castro-island>` wrapper

### Island Detection (Compile-Time)

Old approach used `options.vnode` hook (runtime monkey-patch). Current approach:
- At `Bun.build` time, `.island.tsx` files are intercepted by `islandMarkerPlugin`
- Their content is replaced with a stub that imports `renderMarker()` from `marker.js`
- `renderMarker()` is called synchronously during `renderToString()` traversal
- SSR modules are pre-loaded in registry because `renderToString()` is synchronous

### Island Tracking

`marker.js` maintains a module-level `usedIslands` Set (reset per page render). Only CSS for islands actually rendered on a page gets injected. The `<castro-island>` runtime script is also only included on pages that use islands.

### Import Map & Dependency Vendoring

By default, framework dependencies are automatically vendored to `/dist/vendor/` via the `vendorDependencies` plugin:
1. Each framework declares `clientDependencies` (e.g., Preact declares `["preact", "preact/hooks", "preact/jsx-runtime"]`)
2. User can add custom `clientDependencies` in `castro.config.js`
3. Plugin `getImportMap` hooks generate per-page entries: `{ "preact": "/vendor/preact.js?v=10.28.3", ... }` with version query strings for cache busting
4. User `importMap` entries (from `castro.config.js`) override plugin-generated entries on pages with islands, allowing CDN swaps or custom versioning. Static pages have no import map.

Any import map key is automatically treated as external during island client compilation — Bun won't bundle it. Plugins use `getImportMap` to contribute entries based on which frameworks are actually used on each page.

### User Plugins

`castro.config.js` accepts a `plugins` array of `CastroPlugin` objects. User plugins are merged with internal plugins (island runtime, Preact islands) and participate in the same build lifecycle:
- `getPageAssets(params)` — called per-page. Injects `<link>`/`<style>`/`<script>` tags. Receives `{ hasIslands }` so plugins can conditionally inject only on pages with islands.
- `getImportMap(context)` — called only on pages with islands. Plugins contribute import map entries (e.g., vendored dependencies). Receives `{ usedFrameworks }` so entries are based on which frameworks are actually used on that page.
- `onPageBuild()` — runs before pages are built (and on every page save in dev for user plugins)
- `onAfterBuild(context)` — runs after all pages are built. Receives `{ usedFrameworks: Set<string> }` so plugins can conditionally write assets (e.g., only bundle dependencies if the framework was actually used)
- `frameworkConfig` — optional `FrameworkConfig` object to register a custom framework for islands
- `watchDirs` — directories to watch in dev mode; changes trigger `onPageBuild()` + reload

### Dev Server

File watchers rebuild on change. Page changes → single page rebuild + user plugin rebuild. Layout/component changes → full rebuild (all plugins). Plugin `watchDirs` get their own watchers. All watchers have per-iteration error handling so a build failure doesn't kill the watcher.

**Cache busting:** Bun's module loader caches by file path and ignores query strings. We use content-hashed filenames (`post.tsx.a1b2c3d4.js`) so changed code gets a new path.

## Code Conventions

- **ES Modules** (import/export), Bun 1.3.8+
- **Biome** for formatting: tabs, double quotes. Run `bun format` before committing.
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Dependencies**: Prefer built-in Bun APIs. Keep the footprint minimal.
- **No `createElement`** — use JSX or `h()` from preact.
- **No non-null assertions** (e.g. `foo!.bar`) in TypeScript.

## Comments

This is an educational codebase — comments matter. But they should respect the reader.

- **Module docblocks**: Explain the file's role in the architecture. Keep it to 3-8 lines.
- **Inline comments**: Earn their place by answering "why?" or "why not the obvious way?". Delete comments that restate what the code says.
- **JSDoc on functions**: Type signatures are required. Prose descriptions only when the name + types aren't enough.
- **Never condescend**: The reader is a developer. No "Educational note:" or "Simply put:" prefixes. Explain the concept directly.
- **Benchmark**: `compiler.js` and `hydration.js` are the standard for comment quality.

## Messages

Use `styleText` from `node:util` for colored logs.

All user-facing strings live in `src/messages/`. Both `communist.js` and `serious.js` must implement the same `Messages` interface from `messages.d.ts`. Never use inline strings for user-facing output.

Key rules from `src/messages/README.md`:
- Clarity first, satire second
- Allowed emojis: `✓`, `❌`, `⚠️` only
- Satire at edges (opening/closing), not in status messages
- One punchline per error, at the end
- If a joke doesn't land, cut it

## Key Design Decisions

- **Layouts receive `children` (VNode)**, not a pre-rendered `content` HTML string. The entire tree renders in a single `renderToString()` pass.
- **Framework configs** are loaded per-island via `frameworkConfig.js` (async load + sync cache pattern). Preact is the default framework; Solid is a built-in alternative. Plugins can register additional frameworks via `CastroPlugin.frameworkConfig` (e.g., `@vktrz/castro-jsx` registers the castro-jsx framework). Directory convention (`components/solid/`, `components/preact/`, `components/castro-jsx/`) auto-detects registered frameworks. Islands not in a subdirectory default to Preact. Pages and layouts always use Preact. Each framework declares `clientDependencies` (browser-side packages to vendor) rather than hardcoded CDN URLs.
- **`IslandComponent.ssrModule`** typed as `{ default: Function }` (framework-agnostic). Pre-loaded by the registry, accessed synchronously by `renderMarker()`.
- **`renderSSR` accepts `Function`**, not `ComponentType`. Each framework config casts internally.
- **Island CSS** tracked per-page via `pageState` in `marker.js`, not on the registry singleton. The runtime script is included when `usedIslands.size > 0`.
- **tsconfig.json path aliases** are now supported natively. `getProjectDependencies()` reads `package.json` and passes all dependency keys to `external`, allowing aliases to resolve correctly before Bun's module loader processes them.
- **Multi-framework type checking** requires per-file `/** @jsxImportSource */` pragmas for non-default frameworks (e.g. `/** @jsxImportSource @vktrz/castro-jsx */` for castro-jsx, `/** @jsxImportSource solid-js */` for Solid). The pragma is the only mechanism `tsc` honors per-file — TypeScript uses the root tsconfig's JSX settings for transitively imported files regardless of any nested tsconfig. Each framework package provides its own JSX type definitions (e.g., `castro-jsx` provides `Signalish<T>`, `HTMLProps`).

## Testing

`test-site/` is a single test site that exercises the full build pipeline with castro-jsx, Preact, and Solid islands. Run with `bun test:sites`. Tests verify:
- Static pages (no islands)
- All three directives (`comrade:visible`, `comrade:patient`, `comrade:eager`)
- Component composition (islands in static components, static components in islands, islands in layouts)
- CSS modules in static components and islands
- Multi-framework pages (Preact + Solid islands on the same page)
- castro-jsx framework plugin (signals + direct DOM, no CDN dependencies)
- Solid-only pages (SSR without Preact islands)

The test structure (pages, components, islands, layouts) mirrors a real site and serves as a reference for expected patterns.

## What NOT to Change

- Code must stay educational and well-commented — every file should explain "why"
- Keep core LOC under ~1600 (currently ~1500)
- Satire belongs in messages/docs/CLI output only, never in the code logic itself
- `website/dist/` and `test-site/dist/` are ephemeral, cleaned on every build
- Island imports must use relative paths, not tsconfig aliases (documented in `compileJsx.js`)

## Website Playground (`website/`)

Demo site that consumes castro. Uses Tailwind CSS v4 + DaisyUI v5 via `@vktrz/castro-tailwind`.

**CSS pipeline**: `styles/app.css` → `@vktrz/castro-tailwind` plugin (PostCSS + `@tailwindcss/postcss`) → `dist/app.css`. Fully integrated into Castro's build — `castro build` and `castro dev` handle CSS automatically. The `<link>` tag is auto-injected via the plugin's `getPageAssets()`.

**Themes**: Two custom DaisyUI themes defined in `styles/app.css` — `castro` (light, cream/gold/red) and `castro-dark` (dark, halloween-inspired). Theme toggle persists via `localStorage`, flash-prevention script in layout `<head>`.

**Key files**:
- `styles/app.css` — Tailwind + DaisyUI config, both custom theme definitions, `font-display`/`font-sans` theme
- `layouts/default.tsx` — HTML shell, Google Fonts (Bebas Neue + Barlow), ThemeToggle island
- `layouts/docs.tsx` — docs layout with DaisyUI drawer sidebar; section-aware via `sidebarSections` map keyed by `"how-it-works"` / `"guide"`
- `components/Header.tsx` — sticky navbar; GUIDE and HOW IT WORKS links go active when `activePath` starts with `/guide` or `/how-it-works`
- `components/PropagandaRadio.island.tsx` — Preact radio with cycling headlines (`comrade:eager`)
- `components/castro-jsx/BarePropagandaRadio.island.tsx` — castro-jsx port of PropagandaRadio, used on the directives guide page
- `components/castro-jsx/BareRedactor.island.tsx` — castro-jsx censorship toggle (`comrade:patient`)
- `components/castro-jsx/BareFiveYearPlan.island.tsx` — castro-jsx port of FiveYearPlan, used on the directives guide page
- `components/solid/FiveYearPlan.island.tsx` — Solid progress tracker (`comrade:visible`)
- `components/ThemeToggle.island.tsx` — `comrade:eager` island, DaisyUI swap + theme-controller
- `pages/guide/directives.tsx` — prose + live demos for all three directives, one castro-jsx island per directive

**Docs pages** (`how-it-works/`, `guide/`): each exports a `meta` with `layout: "docs"`, `path: "<exact-url>"`, and `section: "<section-key>"`. The `path` field drives sidebar active highlighting and header active state — **update it if a page's URL changes**. The `section` field selects which sidebar group is shown (`"how-it-works"` or `"guide"`).

**Reference Documentation**: `.claude/docs/` contains tool and framework references with a consistent naming pattern: `{tool}-{concept}.md` (e.g., `bun-bundler.md`, `bun-server.md`, `daisyui-llms.md`) and concept-specific files (e.g., `web-components.md`, `preact-render-to-string.md`). When working with a specific library, search by tool prefix or concept name.

## Maintaining This File

If your changes affect anything documented above (file structure, commands, architecture, design decisions), update this file as part of the same change. This file is the primary context source for AI-assisted development.
