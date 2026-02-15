# Castro

Educational Static Site Generator (~1100 LOC) teaching island architecture. Communist satire wraps serious, well-commented code. Preact for rendering, Bun for everything else.

Comparable to: Fresh (architecture), Marko (compiler philosophy), early Astro (pre-marketplace era), Eleventy + is-land.

## Commands

```
bun run dev          # dev server with live reload (website playground)
bun run build        # production build (website playground)
bun format           # Biome formatter (tabs, double quotes)
bun type-check       # tsc across all workspaces
bun check            # format + type-check + knip (run before committing)
bun loc              # LOC count (core only, excludes messages/)
```

## Monorepo Layout

- `castro/` — core SSG engine (the npm package `@vktrz/castro`)
- `website/` — demo playground that consumes castro

### Core Module Structure (`castro/src/`)

```
cli.js                  Entry point (dev | build)
config.js               Loads castro.config.js
constants.js            Shared path constants

builder/
  build-all.js          Full site build orchestration
  build-page.js         Single page build (JSX or Markdown)
  compile-jsx.js        Bun.build pipeline + island marker plugin
  render-page.js        VNode → HTML via renderToString
  write-html-page.js    HTML assembly (assets, CSS injection, import maps)
  write-css.js          CSS file extraction

islands/
  compiler.js           Island SSR + client compilation
  registry.js           Singleton island store + SSR module preloading
  marker.js             Build-time island renderer (replaces old vnode hook)
  framework-config.js   Framework-specific config (currently Preact only)
  plugins.js            Castro plugin definitions (island runtime, import maps)
  hydration.js          Client-side <castro-island> custom element

layouts/
  registry.js           Layout discovery and compilation

dev/
  server.js             Dev server (Bun.serve + file watching + SSE)
  live-reload.js        Client-side SSE reconnection script

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

### Dev Server

File watchers rebuild on change. Page changes → single page rebuild. Layout/component changes → full rebuild. All watchers have per-iteration error handling so a build failure doesn't kill the watcher.

**Cache busting:** Bun's module loader caches by file path and ignores query strings. We use content-hashed filenames (`post.tsx.a1b2c3d4.js`) so changed code gets a new path.

## Code Conventions

- **ES Modules** (import/export), Bun 1.3.8+
- **Biome** for formatting: tabs, double quotes. Run `bun format` before committing.
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Dependencies**: Prefer built-in Bun APIs. Keep the footprint minimal.
- **No `createElement`** — use JSX or `h()` from preact.
- **No non-null assertions** (e.g. `foo!.bar`) in TypeScript.

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
- **`frameworkConfig` singleton** resolved at startup from `config.framework`. Fails loud if unsupported.
- **`IslandComponent.ssrModule`** typed as `{ default: Function }` (framework-agnostic). Pre-loaded by the registry, accessed synchronously by `renderMarker()`.
- **`renderSSR` accepts `Function`**, not `ComponentType`. Each framework config casts internally.
- **Island CSS** tracked per-page via `usedIslands` Set in `marker.js`, not on the registry singleton.

## What NOT to Change

- Code must stay educational and well-commented — every file should explain "why"
- Keep core LOC under ~1500 (currently ~1100)
- Satire belongs in messages/docs/CLI output only, never in the code logic itself
- `website/dist/` is ephemeral, cleaned on every build

## Maintaining This File

If your changes affect anything documented above (file structure, commands, architecture, design decisions), update this file as part of the same change. This file is the primary context source for AI-assisted development.
