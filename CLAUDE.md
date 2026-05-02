# Castro

Castro is a static site generator built to be read. The machinery that makes a real framework — build plugins, per-page async state, a module cache, a structured error system, SSE-based live reload — is each small enough to hold in your head and documented as its own self-contained piece. Communist satire wraps the prose; the code itself stays serious.

Preact for page rendering and islands, optional multiple frameworks (Solid, castro-jsx) for islands, Bun for everything else.

Peer reference: Fresh, early Astro, Eleventy + is-land, Marko, Capri, Mastro, Iles, Enhance.

> Update this file when your changes affect what's documented here. Don't restate what lives in module docblocks or type definitions — link instead.


## Commands

```
bun run dev          # dev server with live reload (website playground)
bun run build        # production build (website playground)
bun format           # Biome formatter (tabs, double quotes)
bun check            # format + core checks + site tests (run before committing)
bun test:site        # build and verify test sites only
bun test:errors      # run error DX golden suite (tests/errors/)
bun loc              # LOC count (core only, excludes messages/)
```

## Monorepo Layout

- `core/` — core SSG engine (the npm package `@vktrz/castro`)
- `packages/` — packages and plugins (e.g., `@vktrz/castro-jsx`, `@vktrz/castro-solid`, `@vktrz/castro-tailwind`)
- `website/` — demo playground that consumes castro
- `tests/site/` — minimal test site exercising castro-jsx, Solid (via plugin), Preact, and signal libraries

### Core Module Structure (`core/src/`)

Each subsystem is independently readable as a study in framework machinery — read module docblocks for file-level detail.

- **Build pipeline** (`builder/`) — how a JSX tree, a layout tree, and island markers compose into a single `renderToString()` pass.
- **Islands runtime** (`islands/`, `islands/frameworks/`, `islands/plugins/`) — how a build plugin swaps real components for HTML markers at compile time, the trick that makes islands work.
- **Module cache** (`utils/cache.js`) — write-string-to-disk-then-import: the pattern bundlers use to bust ESM caches.
- **Structured errors** (`utils/errors.js`, `utils/renderError.js`, `dev/liveReload.js`, `messages/`) — typed error codes, code-frame extraction, terminal renderer, browser overlay, voice presets.
- **Dev server** (`dev/`) — `Bun.serve`, file watchers, debounced rebuilds, SSE live reload.
- **Per-page state** (`islands/marker.js`) — `AsyncLocalStorage` for isolating concurrent build state without globals.
- `cli.js`, `config.js`, `constants.js` — entry point, config loader, shared path constants.
- `layouts/` — layout discovery and compilation.
- `errors.d.ts`, `types.d.ts`, `jsx.d.ts` — structured error payload types, shared types, JSX namespace for custom directives.

The reference implementations for hydration patterns are [core/src/islands/hydration.js](core/src/islands/hydration.js) and [core/src/islands/compiler.js](core/src/islands/compiler.js) — read them before changing how islands work.


## Reference Documentation

`.claude/docs/` has focused references for Bun APIs that differ from Node. Read the relevant file before working in an area.

| Working on...                          | Read / look at                                              |
|----------------------------------------|-------------------------------------------------------------|
| Bun.build, bundler, compilation        | `bun-bundler.md` + `core/src/builder/compileJsx.js` (real usage)    |
| Bun.build plugins, onLoad/onResolve    | `bun-plugins.md` + `core/src/islands/buildPlugins.js` (real usage)  |
| Bun.Transpiler, AST import scanning    | `bun-transpiler.md` + `core/src/islands/buildPlugins.js`            |
| Bun.serve, Bun.file, Glob, import.meta | `bun-apis.md`                                              |
| Dev server (SSE, file watching)        | `core/src/dev/server.js` (read the source)                          |
| Markdown processing                    | `bun-markdown.md`                                          |
| Island hydration, custom elements      | `core/src/islands/hydration.js` (read the source)                   |


## Architecture

Cross-file invariants. For per-step build mechanics, read the relevant module docblock.

### Build Pipeline

`cli.js` → `buildAll()` orchestrates the build (see [buildAll.js](core/src/builder/buildAll.js) docblock for the step list). Two `Bun.build` plugins are always active: `castroExternalsPlugin` (keeps Castro internals external for singleton sharing) and `islandMarkerPlugin` (replaces `.island.tsx` imports with marker stubs). Compiled page modules are loaded via `getModule()` with content-hashed file paths to bust Bun's import cache (Bun caches by path, not query string). The full VNode tree — page + layout + islands — renders in a single synchronous `renderToString()` pass; SSR modules must be pre-loaded.

### Island Tracking

`marker.js` tracks which islands each page uses via AsyncLocalStorage — each page build runs inside `runWithPageState()`, which provides a fresh `{ usedIslands, usedFrameworks }` context scoped to that async call tree. This isolation is what makes parallel builds safe. Only CSS for islands actually rendered on a page gets injected; the `<castro-island>` runtime script is also gated on island usage.

### Import Map & Dependency Vendoring

Framework dependencies are vendored to `/dist/vendor/` by the internal `vendorDependencies` plugin. Each framework declares `clientDependencies`; users can add more via `castro.config.ts`. Plugins contribute import-map entries through `getImportMap`, which runs only on pages with islands (static pages have no import map). User `importMap` entries override plugin-generated ones. **Any import map key is automatically treated as external during island client compilation** — Bun won't bundle it.

### User Plugins

User plugins implement `CastroPlugin` (see [types.d.ts](core/src/types.d.ts) for the full hook contract). Hooks: `getPageAssets`, `getImportMap`, `onPageBuild`, `onAfterBuild`, plus optional `frameworkConfig` and `watchDirs`. They run alongside internal plugins in the same lifecycle. In dev mode, `onPageBuild()` re-runs on every save for user plugins.

### Dev Server

File watchers on `pages/`, `layouts/`, `components/`, `public/`, and any plugin `watchDirs` rebuild on change. Editor temp files and OS metadata are filtered via a denylist glob; everything else triggers a rebuild. Rapid changes are debounced so builds never overlap. Cache busting relies on content-hashed filenames (`post.tsx.a1b2c3d4.js`) because Bun's module loader ignores query strings.

**Build error handling:** Errors are structured as `CastroErrorPayload` (see [errors.d.ts](core/src/errors.d.ts)). Two independent renderers consume the payload: `renderErrorToTerminal()` colors the terminal output, and the browser overlay (`core/src/dev/liveReload.js`) renders a shadow DOM tree. On failure, the server logs to the terminal and sends the payload over SSE — no reload, keeping the last good page visible. On the next successful build, `reload` is sent. The payload shape decouples structure from voice — both `serious.js` and `satirical.js` return the same payload shape with different title/hint text. Test-errors sandbox at `tests/errors/` has 14 isolated error cases for manual verification.


## Conventions

- **ES Modules**, Bun 1.3.8+. **Biome** formatting: tabs, double quotes (`bun format`).
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Bun-native APIs** over Node equivalents — `Bun.file().exists()`, `Bun.file().json()`, etc. If going async requires changing a caller, do it explicitly rather than falling back to Node.
- **No `createElement`** — use JSX or `h()` from preact. **No non-null assertions** (`foo!.bar`).
- **Module docblocks**: 3-8 lines on the file's architectural role. **Inline comments**: answer "why?" or "why not the obvious way?" — delete anything that restates what the code says. **JSDoc prose**: only when name + types aren't enough.
- Never condescend. No "Educational note:" or "Simply put:" prefixes.
- Benchmark: [compiler.js](core/src/islands/compiler.js) and [hydration.js](core/src/islands/hydration.js).


## Messages

All user-facing strings live in `core/src/messages/`. Voice is pluggable — `satirical.js` and `serious.js` are two implementations of the same `Messages` interface, demonstrating that error structure and error tone are fully decoupled. **Never use inline strings for user-facing output.** Use `styleText` from `node:util` for colored logs. Tone, satire, and emoji rules: see [core/src/messages/README.md](core/src/messages/README.md).

**After changing any error message text**, regenerate the stderr goldens: `UPDATE_SNAPSHOTS=1 bun test:errors`. Inspect the diff before committing — each golden in `tests/errors/*/expected.stderr.txt` should show clean structured output.


## Key Design Decisions

- **Preact is permanently the page/layout rendering engine.** Pages and layouts always use Preact for SSR and VNode tree construction. Preact is a build-time dependency only — never shipped to the browser for static pages. Other frameworks (castro-jsx, Solid) are limited to islands.
- **Multi-framework is a plugin-level capability, not a headline feature.** Islands can use different frameworks, but they can't nest, share state across frameworks, or avoid TypeScript pragmas.
- **Layouts receive `children` (VNode)**, not a pre-rendered `content` HTML string. The entire tree renders in a single `renderToString()` pass.
- **Framework detection via AST scanning.** Each framework declares `detectImports` (e.g. `["solid-js"]`); the registry scans an island's imports and picks the first match, defaulting to Preact. Plugins register additional frameworks via `CastroPlugin.frameworkConfig`.
- **Island imports must use relative paths**, not tsconfig aliases. The `islandMarkerPlugin` intercepts imports at the AST level; tsconfig path aliases resolve after Bun's AST walk, so aliased imports don't trigger island detection.
- **tsconfig.json path aliases** are supported natively in page imports. `getProjectDependencies()` externalizes all `package.json` dependencies, so Bun resolves local alias paths normally.
- **Multi-framework type checking** requires per-file `/** @jsxImportSource */` pragmas for non-default frameworks (e.g. `/** @jsxImportSource solid-js */` for Solid). The pragma is the only mechanism `tsc` honors per-file — TypeScript uses the root tsconfig's JSX settings for all transitively imported files regardless of any nested tsconfig.
- **Three hydration directives: `comrade:eager`, `comrade:patient`, `comrade:visible` (default).** `comrade:eager` hydrates immediately. `comrade:visible` hydrates on intersection. `comrade:patient` uses `requestIdleCallback` with load-event gating and Safari fallback.


## Configuration

Optional `castro.config.{ts,js,mjs}` exports a `CastroConfig` — the loader tries `.ts`, `.js`, `.mjs` in order. `defineConfig` (re-exported from `@vktrz/castro`) is an identity function for type inference. All options are in [core/src/types.d.ts](core/src/types.d.ts).

Two non-obvious behaviors: `srcDir` shifts where pages/layouts/components are read from but never affects output paths — `dist/` is always the root. `importMap` entries override plugin-generated entries on island pages; static pages get no import map.


## Testing

`bun test:site` builds and verifies `tests/site/`, which exercises the full pipeline across castro-jsx, Preact, and Solid (all directives, multi-framework pages, CSS modules, component composition). The site mirrors a real project's structure — **use it as the reference for expected patterns** when you're unsure how something should be wired up.


## Non-Goals

Castro is a working SSG, but not a hardened one. The following are deliberately not handled, and code that defends against them should be cut, not added:

- **Windows native support.** Internal paths are posix. We don't normalize Windows separators in core code.
- **Graceful recovery from missing required directories.** `pages/` missing throws naturally — fatal error, not a warning. (`public/` is optional by design; its absence is silently skipped.)
- **Cross-process or cross-machine cache busting.** No `?v=…` on vendored URLs. Hard-refresh on package upgrade.
- **Production-grade concurrency.** All page builds run via `Promise.all`. Real SSGs cap concurrency to bound memory; we don't.
- **Hostile or unusual filesystems.** No retry on transient I/O. No defense against atime feedback loops, network mounts, or case-insensitive collisions.
- **Runtime validation of TypeScript-typed configuration.** If TypeScript catches it, we don't re-check at runtime.
- **Backwards compatibility.** Pre-1.0; breaking changes land freely.

When evaluating any defensive code path, ask whether it teaches framework machinery or whether it survives one of the cases above. If the latter, it's a candidate for deletion with a comment pointing here.


## What NOT to Change

- Every file should explain "why" — the subsystem framing and module docblocks are load-bearing documentation.
- Comments may declare what Castro deliberately doesn't handle (see Non-Goals). Such comments are preferred over defensive code paths.
- Satire belongs in messages/docs/CLI output only, never in the code logic itself.
- `website/dist/` and `tests/site/dist/` are ephemeral, cleaned on every build.


## Website Playground (`website/`)

Demo site that consumes castro. Uses PicoCSS v2 (CDN) plus three co-located stylesheets in `public/styles/` — no preprocessor, no build step for CSS. Each component/page has its own co-located CSS file.

**Read [website/DESIGN.md](website/DESIGN.md) before any UI change** — it documents the color system, typography, layout conventions, and the structure of the three style files. Customization & CSS variable references: [.claude/docs/pico.md](.claude/docs/pico.md), [.claude/docs/pico-variables-css.md](.claude/docs/pico-variables-css.md).

**Docs page `path` contract.** Pages under `src/pages/concept/` and `src/pages/how-it-works/` export a `meta` with `layout: "docs"` and `path: "<exact-url>"`. The `path` drives sidebar active state and header highlighting — **update it whenever the page's URL changes**, or the nav silently goes wrong.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (same convention as `_components/`). Currently `_build/` and `_reference/` exist but are not built or linked from the nav.

**Site information architecture.** The public nav shows two sections: **Concept** (`/concept/island-architecture`) and **How It Works** (`/how-it-works`). The concept page is the primary entry point. The homepage CTA points there.

**Canonical tsconfig.** [website/tsconfig.json](website/tsconfig.json) is the source of truth; [packages/create-castro/template/tsconfig.json](packages/create-castro/template/tsconfig.json) shares the same `compilerOptions` but uses root-level `pages/`/`layouts/` (no `srcDir`) instead of the website's `src/` layout.