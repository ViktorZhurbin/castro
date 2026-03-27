# Castro

Educational Static Site Generator (~1500 LOC) teaching island architecture. Communist satire wraps serious, well-commented code. Preact for page rendering, multiple frameworks (bare-jsx, Preact, Solid) for islands, Bun for everything else.

Comparable to:
- Fresh, Marko (though way less advanced), early Astro (pre-marketplace era), Eleventy + is-land.
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
- `plugins/` — plugins (`@vktrz/castro-tailwind`)
- `website/` — demo playground that consumes castro
- `test-site/` — minimal test site exercising bare-jsx, Preact, and Solid islands

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
  frameworks/           Per-framework configs (bare-jsx.js, preact.js, solid.js, types.d.ts)
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
  cache.js              Module caching with content-hashed filenames
  ids.js                Island ID generation (project-relative paths)
  format.js             Time formatting
  validateMeta.js       Page metadata validation

types.d.ts              Shared types (IslandComponent, PageMeta, CastroPlugin, etc.)
jsx.d.ts                JSX namespace for custom directives
```

### Runtime Structure (`castro/runtime/`)

Framework runtimes that ship with Castro — code that runs in the browser or during SSR, as opposed to `src/` which runs during the build.

```
signals/
  index.js      createSignal, createEffect
  index.d.ts    Signal type declarations

jsx/
  dom/
    index.js    Browser h() with fine-grained reactive DOM bindings
    index.d.ts  h/Fragment types for the DOM entry point
  ssr/
    index.js    Server h() returning HTML strings (XSS-safe)
    index.d.ts  h/Fragment/HtmlString types for the SSR entry point
```

Exported from `@vktrz/castro` as:
- `@vktrz/castro/signals` — signals only (user-facing import for island components)
- `@vktrz/castro/runtime/jsx/dom` — h, Fragment, signals (browser; injected by build plugin)
- `@vktrz/castro/runtime/jsx/ssr` — h, Fragment, HtmlString (server; injected by build plugin)

## Architecture

### Build Pipeline

1. `cli.js` → `buildAll()` → clean dist, copy public/, run plugins, build pages
2. Pages (JSX/MD) compiled via `Bun.build` with two plugins:
   - `castroExternalsPlugin` — keeps Castro internals external (singleton sharing)
   - `islandMarkerPlugin` — replaces `.island.tsx` imports with marker stubs
3. `packages: "external"` handles node_modules (incl. path aliases)
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

### Import Map

`castro.config.js` accepts an `importMap` object mapping bare specifiers to CDN URLs. Entries are merged into the page's `<script type="importmap">` after framework defaults (user entries win on conflict). Any import map key is automatically treated as external during island client compilation — Bun won't bundle it, the browser loads it from the CDN instead.

### User Plugins

`castro.config.js` accepts a `plugins` array of `CastroPlugin` objects. User plugins are merged with internal plugins (island runtime, Preact islands) and participate in the same build lifecycle:
- `onPageBuild()` — runs before pages are built (and on every page save in dev for user plugins)
- `onAfterBuild(context)` — runs after all pages are built. Receives `{ usedFrameworks: Set<string> }` so plugins can conditionally write assets (e.g., only copy a runtime if the framework was actually used)
- `getPageAssets()` — injects `<link>`/`<style>`/`<script>` tags into every page
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
- **Framework configs** are loaded per-island via `frameworkConfig.js` (async load + sync cache pattern). bare-jsx is the default framework; Preact and Solid are built-in alternatives. Plugins can register additional frameworks via `CastroPlugin.frameworkConfig`. Directory convention (`components/solid/`, `components/preact/`, `components/bare-jsx/`) auto-detects registered frameworks. Override the default with `framework: "preact"` in `castro.config.js`.
- **bare-jsx framework** ships its ~2KB runtime (`castro/runtime/`) inside the `@vktrz/castro` package — no CDN, no third-party dependencies. The runtime is built once by `bareRuntimePlugin` (via `onAfterBuild`) and served as `/bare-jsx.js`, shared across all bare islands via import map. Uses `Bun.Transpiler` in a build plugin to transform JSX with classic mode (`h()` factory), bypassing the project's tsconfig. Island components import signals from `@vktrz/castro/signals`; the build plugin injects `h`/`Fragment` from `@vktrz/castro/runtime/jsx/dom` (client) or `@vktrz/castro/runtime/jsx/ssr` (server) — two specifiers because they must resolve to different files in SSR (`signals.js` vs `jsx-ssr.js`). In the browser both map to `/bare-jsx.js` via import map. The `onResolve` hook in SSR builds maps these specifiers to absolute paths so they get bundled (not externalized). Re-render hydration (clear + mount) instead of DOM walking. Known limitations: no effect disposal, no batching, no fragment-aware reactive replacement (reactive conditionals must return single root elements, not Fragments).
- **`IslandComponent.ssrModule`** typed as `{ default: Function }` (framework-agnostic). Pre-loaded by the registry, accessed synchronously by `renderMarker()`.
- **`renderSSR` accepts `Function`**, not `ComponentType`. Each framework config casts internally.
- **Island CSS** tracked per-page via `pageState` in `marker.js`, not on the registry singleton. The runtime script is included when `usedIslands.size > 0`.
- **Island imports must use relative paths**, not tsconfig `paths` aliases. `Bun.build`'s `packages: "external"` treats `@`-prefixed imports as scoped npm packages and externalizes them before path alias resolution runs, so the `islandMarkerPlugin` never intercepts them.

## Testing

`test-site/` is a single test site that exercises the full build pipeline with bare-jsx, Preact, and Solid islands. Run with `bun test:sites`. Tests verify:
- Static pages (no islands)
- All three directives (`comrade:visible`, `comrade:patient`, `lenin:awake`)
- Component composition (islands in static components, static components in islands, islands in layouts)
- CSS modules in static components and islands
- Multi-framework pages (Preact + Solid islands on the same page)
- bare-jsx framework (signals + direct DOM, no CDN dependencies)
- Solid-only pages (SSR without Preact islands)

The test structure (pages, components, islands, layouts) mirrors a real site and serves as a reference for expected patterns.

## What NOT to Change

- Code must stay educational and well-commented — every file should explain "why"
- Keep core LOC under ~1600 (currently ~1540, includes bare-jsx runtime)
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
- `components/DirectiveCard.tsx` — card with explicit color map (avoids dynamic Tailwind class interpolation)
- `components/PropagandaRadio.island.tsx` — Preact radio with cycling headlines (`lenin:awake`)
- `components/bare-jsx/Redactor.island.tsx` — bare-jsx censorship toggle (`comrade:patient`)
- `components/solid/FiveYearPlan.island.tsx` — Solid progress tracker (`comrade:visible`)
- `components/ThemeToggle.island.tsx` — `lenin:awake` island, DaisyUI swap + theme-controller

**Docs pages** (`how-it-works/`, `guide/`): each exports a `meta` with `layout: "docs"`, `path: "<exact-url>"`, and `section: "<section-key>"`. The `path` field drives sidebar active highlighting and header active state — **update it if a page's URL changes**. The `section` field selects which sidebar group is shown (`"how-it-works"` or `"guide"`).

**DaisyUI reference**: `.claude/docs/daisyui-llms.txt`

## Maintaining This File

If your changes affect anything documented above (file structure, commands, architecture, design decisions), update this file as part of the same change. This file is the primary context source for AI-assisted development.
