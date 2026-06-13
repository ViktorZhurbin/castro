# Castro

Castro is a static site generator built to be read. The machinery that makes a real framework — build plugins, per-page async state, a module cache, a structured error system, SSE-based live reload — is each small enough to hold in your head and documented as its own self-contained piece. Communist satire wraps the prose; the code itself stays serious.

Preact for page rendering and islands, Bun for everything else.

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
- `packages/` — `create-castro`, the project scaffolder
- `website/` — demo playground that consumes castro
- `tests/site/` — minimal test site exercising Preact islands, all hydration directives, CSS modules, and signals

### Core Module Structure (`core/src/`)

Each subsystem is independently readable as a study in framework machinery — read module docblocks for file-level detail.

- **Build pipeline** (`builder/`) — how a JSX tree, a layout tree, and island markers compose into a single `renderToString()` pass.
- **Islands runtime** (`islands/`) — how a build plugin swaps real components for HTML markers at compile time, the trick that makes islands work. Preact-specific build values live in `islands/preact.js`.
- **Module cache** (`utils/cache.js`) — write-string-to-disk-then-import: the pattern bundlers use to bust ESM caches.
- **Structured errors** (`utils/errors.js`, `utils/renderError.js`, `dev/liveReload.js`, `messages/`) — typed error codes, code-frame extraction, terminal renderer, browser overlay, a single satirical voice.
- **Dev server** (`dev/`) — `Bun.serve`, file watchers, debounced rebuilds, SSE live reload.
- **Per-page state** (`islands/marker.js`) — `AsyncLocalStorage` for isolating concurrent build state without globals.
- `cli.js`, `config.js`, `constants.js` — entry point, config loader, shared path constants.
- `layouts/` — layout discovery and compilation.
- `types.d.ts`, `jsx.d.ts` — structured error payload types, shared types, JSX namespace for custom directives.

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

`marker.js` tracks which islands each page uses via AsyncLocalStorage — each page build runs inside `runWithPageState()`, which provides a fresh `{ usedIslands }` context scoped to that async call tree. This isolation is what makes parallel builds safe. Only CSS for islands actually rendered on a page gets injected; the `<castro-island>` runtime script and the vendored Preact bundle are also gated on island usage.

### Import Map & Dependency Vendoring

The shared client dependencies — Preact's own (`PREACT_CLIENT_DEPS` in [islands/preact.js](core/src/islands/preact.js)) plus any `config.clientDependencies` — are vendored to `/dist/vendor/` by the builder's `vendorClientDeps()` step ([builder/vendor.js](core/src/builder/vendor.js)), which runs once after all pages build, only when some island was rendered. The matching import map (`getIslandImportMap()`) is emitted per island page; static pages get none. **Every shared client dependency is treated as external during island client compilation** — Bun won't bundle it; the browser resolves it through the import map at runtime. Anything not in that set gets bundled into each island bundle separately.

### Extensibility

Castro has no user plugin or extension API — it is a closed thing you read, not a framework you extend (see [NON-GOALS.md](NON-GOALS.md)).

### Dev Server

File watchers on `pages/`, `layouts/`, `components/`, and `public/` rebuild on change. Editor temp files and OS metadata are filtered via a denylist glob; everything else triggers a rebuild. Rapid changes are debounced so builds never overlap. Cache busting relies on content-hashed filenames (`post.tsx.a1b2c3d4.js`) because Bun's module loader ignores query strings.

**Build error handling:** Errors are structured as `CastroErrorPayload` (see [types.d.ts](core/src/types.d.ts)). Two independent renderers consume the payload: `renderErrorToTerminal()` colors the terminal output, and the browser overlay (`core/src/dev/liveReload.js`) renders a shadow DOM tree. On failure, the server logs to the terminal and sends the payload over SSE — no reload, keeping the last good page visible. On the next successful build, `reload` is sent. The payload shape decouples structure from voice — the renderers consume a `CastroErrorPayload`, while the title/hint wording lives separately in `messages/`. Test-errors sandbox at `tests/errors/` has 13 isolated error cases for manual verification.


## Conventions

- **ES Modules**, Bun 1.3.8+. **Biome** formatting: tabs, double quotes (`bun format`).
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Bun-native APIs** over Node equivalents — `Bun.file().exists()`, `Bun.file().json()`, etc. If going async requires changing a caller, do it explicitly rather than falling back to Node.
- **No `createElement`** — use JSX or `h()` from preact. **No non-null assertions** (`foo!.bar`).
- **Module docblocks**: 3-8 lines on the file's architectural role. **Inline comments**: answer "why?" or "why not the obvious way?" — delete anything that restates what the code says. **JSDoc prose**: only when name + types aren't enough.
- Never condescend. No "Educational note:" or "Simply put:" prefixes.
- Benchmark: [compiler.js](core/src/islands/compiler.js) and [hydration.js](core/src/islands/hydration.js).


## Messages

All user-facing strings live in `core/src/messages/`. The error table is decoupled from structure: factories keyed by `ErrorCode` (typed via `ErrorMessages`) return the same `CastroErrorPayload` the renderers consume, so tone and structure stay independent. **Never use inline strings for user-facing output.** Use `styleText` from `node:util` for colored logs. Tone, satire, and emoji rules: see messages [README.md](core/src/messages/README.md).

**After changing any error message text**, regenerate the stderr goldens: `UPDATE_SNAPSHOTS=1 bun test:errors`. Inspect the diff before committing — each golden in `tests/errors/*/expected.stderr.txt` should show clean structured output.


## Key Design Decisions

- **Preact is the only framework — pages, layouts, and islands.** Preact handles SSR and VNode tree construction everywhere; it's a build-time dependency, never shipped to the browser for static pages. Islands are also Preact. The Preact-specific build values live in [islands/preact.js](core/src/islands/preact.js); there is no framework registry or detection.
- **Layouts receive `children` (VNode)**, not a pre-rendered `content` HTML string. The entire tree renders in a single `renderToString()` pass.
- **Island imports must use relative paths**, not tsconfig aliases. The `islandMarkerPlugin` intercepts imports at the AST level; tsconfig path aliases resolve after Bun's AST walk, so aliased imports don't trigger island detection.
- **tsconfig.json path aliases** are supported natively in page imports. `getProjectDependencies()` externalizes all `package.json` dependencies, so Bun resolves local alias paths normally.
- **Three hydration directives: `comrade:eager`, `comrade:patient`, `comrade:visible` (default).** `comrade:eager` hydrates immediately. `comrade:visible` hydrates on intersection. `comrade:patient` uses `requestIdleCallback` with load-event gating and Safari fallback.


## Configuration

Optional `castro.config.ts` exports a `CastroConfig` — that exact filename is the only one the loader checks. `defineConfig` (re-exported from `@vktrz/castro`) is an identity function for type inference. All options are in [core/src/types.d.ts](core/src/types.d.ts).

Non-obvious behavior: `srcDir` shifts where pages/layouts/components are read from but never affects output paths — `dist/` is always the root. Island pages get an auto-generated import map for the vendored deps (Preact's plus `clientDependencies`); static pages get none.


## Testing

`bun test:site` builds and verifies `tests/site/`, which exercises the full pipeline with Preact islands (all directives, multiple islands per page, CSS modules, component composition, signals). The site mirrors a real project's structure — **use it as the reference for expected patterns** when you're unsure how something should be wired up.


## Two Forces

Castro is pulled by two opposing pressures. Both are deliberate; when they conflict, name which one you're serving and why.

**Brevity** cuts defensive code, edge cases, plugins, and extensibility until they're genuinely needed. See [NON-GOALS.md](./NON-GOALS.md) for what this means in practice and the deletion rule. When evaluating any defensive code path, ask whether it teaches framework machinery or whether it merely survives one of the cases listed there. If the latter, it's a candidate for deletion with a comment pointing to NON-GOALS.

**Day-to-day DX** keeps a few subsystems that cost lines on purpose — structured errors, the satirical voice, the live-reload dev server. See [NON-NEGOTIABLES.md](./NON-NEGOTIABLES.md) for the list and why each survives a brevity pass.

The two forces are not symmetric: brevity is the default, and the non-negotiables are the named exceptions. Anything outside that list earns its lines by teaching framework machinery.


## What NOT to Change

- Every file should explain "why" — the subsystem framing and module docblocks are load-bearing documentation.
- Comments may declare what Castro deliberately doesn't handle (see ./NON-GOALS.md). Such comments are preferred over defensive code paths.
- Satire belongs in messages/docs/CLI output only, never in the code logic itself.
- `website/dist/` and `tests/site/dist/` are ephemeral, cleaned on every build.


## Website Playground (`website/`)

Demo site that consumes castro. Uses PicoCSS v2 (CDN) plus three co-located stylesheets in `public/styles/` — no preprocessor, no build step for CSS. Each component/page has its own co-located CSS file.

**Read [website/DESIGN.md](website/DESIGN.md) before any UI change** — it documents the color system, typography, layout conventions, and the structure of the three style files. Customization & CSS variable references: [.claude/docs/pico.md](.claude/docs/pico.md), [.claude/docs/pico-variables-css.md](.claude/docs/pico-variables-css.md).

**Docs page `path` contract.** Pages under `src/pages/concept/` and `src/pages/how-it-works/` export a `meta` with `layout: "docs"` and `path: "<exact-url>"`. The `path` drives sidebar active state and header highlighting — **update it whenever the page's URL changes**, or the nav silently goes wrong.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture.** The public nav shows two sections: **Concept** (`/concept/island-architecture`) and **How It Works** (`/how-it-works`). The concept page is the primary entry point. The homepage CTA points there.

**Canonical tsconfig.** [website/tsconfig.json](website/tsconfig.json) is the source of truth; [packages/create-castro/template/tsconfig.json](packages/create-castro/template/tsconfig.json) shares the same `compilerOptions` but uses root-level `pages/`/`layouts/` (no `srcDir`) instead of the website's `src/` layout.
