# Castro

Educational Static Site Generator teaching island architecture. Communist satire wraps serious, well-commented code. Preact for page rendering and islands, optional multiple frameworks (Solid, castro-jsx) for islands, Bun for everything else.

Peer reference: Fresh, early Astro, Eleventy + is-land, Marko, Capri, Mastro, Iles, Enhance.


## Maintaining This File

If your changes affect anything documented above (commands, architecture, design decisions, invariants), update this file as part of the same change.

**Don't duplicate docblocks, type definitions, or per-file listings — link to them.** This file should hold cross-file invariants and pointers, not encyclopedia entries. If a fact lives in one source file already, point at that file instead of restating it here.


## Commands

```
bun run dev          # dev server with live reload (website playground)
bun run build        # production build (website playground)
bun format           # Biome formatter (tabs, double quotes)
bun check            # format + core checks + site tests (run before committing)
bun test:sites       # build and verify test sites only
bun test:errors      # run error DX golden suite (tests/errors/)
bun loc              # LOC count (core only, excludes messages/)
```

## Monorepo Layout

- `core/` — core SSG engine (the npm package `@vktrz/castro`)
- `packages/` — packages and plugins (e.g., `@vktrz/castro-jsx`, `@vktrz/castro-solid`, `@vktrz/castro-tailwind`)
- `website/` — demo playground that consumes castro
- `tests/site/` — minimal test site exercising castro-jsx, Solid (via plugin), Preact, and signal libraries

### Core Module Structure (`core/src/`)

Subdirectory roles — read each file's module docblock for its specific responsibility.

- `cli.js`, `config.js`, `constants.js` — entry point, config loader, shared path constants
- `builder/` — page build pipeline (orchestration, JSX/Markdown compilation, render, HTML assembly, CSS extraction)
- `islands/` — island compilation, registry, island ID generation, build-time marker, runtime hydration custom element, framework configs, plugin registry
- `islands/frameworks/` — built-in framework configs (Preact, vanilla)
- `islands/plugins/` — internal plugins (island runtime injection, dependency vendoring)
- `layouts/` — layout discovery and compilation
- `dev/` — dev server (Bun.serve + watchers + SSE) and live-reload client
- `messages/` — `satirical.js` and `serious.js` presets implementing `messages.d.ts`
- `components/ClientScript.tsx` — function-as-inline-IIFE serializer (zero-framework client behavior)
- `utils/` — dependency externals, content-hashed module cache, Bun.build wrapper, debounce, error building and terminal rendering
- `errors.d.ts` — structured error payload types (`ErrorCode`, `CodeFrame`, `CastroErrorPayload`)
- `types.d.ts`, `jsx.d.ts` — shared types and JSX namespace for custom directives

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

`marker.js` maintains a module-level `usedIslands` Set, reset per page render. Only CSS for islands actually rendered on a page gets injected; the `<castro-island>` runtime script is also gated on island usage.

### Import Map & Dependency Vendoring

Framework dependencies are vendored to `/dist/vendor/` by the internal `vendorDependencies` plugin. Each framework declares `clientDependencies`; users can add more via `castro.config.ts`. Plugins contribute import-map entries through `getImportMap`, which runs only on pages with islands (static pages have no import map). User `importMap` entries override plugin-generated ones. **Any import map key is automatically treated as external during island client compilation** — Bun won't bundle it.

### User Plugins

User plugins implement `CastroPlugin` (see [types.d.ts](core/src/types.d.ts) for the full hook contract). Hooks: `getPageAssets`, `getImportMap`, `onPageBuild`, `onAfterBuild`, plus optional `frameworkConfig` and `watchDirs`. They run alongside internal plugins in the same lifecycle. In dev mode, `onPageBuild()` re-runs on every save for user plugins.

### Dev Server

File watchers on `pages/`, `layouts/`, `components/`, `public/`, and any plugin `watchDirs` rebuild on change. Editor temp files and OS metadata are filtered via a denylist glob; everything else triggers a rebuild. Rapid changes are debounced so builds never overlap. Cache busting relies on content-hashed filenames (`post.tsx.a1b2c3d4.js`) because Bun's module loader ignores query strings.

**Build error handling:** Errors are structured as `CastroErrorPayload` (see [errors.d.ts](core/src/errors.d.ts)). Two independent renderers consume the payload: `renderErrorToTerminal()` colors the terminal output, and the browser overlay (`core/src/dev/liveReload.js`) renders a shadow DOM tree. On failure, the server logs to the terminal and sends the payload over SSE — no reload, keeping the last good page visible. On the next successful build, `reload` is sent. The payload shape decouples structure from voice — both `serious.js` and `satirical.js` return the same payload shape with different title/hint text. Test-errors sandbox at `tests/errors/` has 14 isolated error cases for manual verification.

## Code Conventions

- **ES Modules** (import/export), Bun 1.3.8+
- **Biome** for formatting: tabs, double quotes. Run `bun format` before committing.
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Dependencies**: Prefer built-in Bun APIs. Keep the footprint minimal. Prefer native Bun async file APIs (`Bun.file().exists()`, `Bun.file().json()`, etc.) over Node equivalents — even if it requires making a caller async. Suggest that change explicitly rather than silently falling back to Node.
- **No `createElement`** — use JSX or `h()` from preact.
- **No non-null assertions** (e.g. `foo!.bar`) in TypeScript.

## Comments

This is an educational codebase — comments matter, but they respect the reader.

- **Module docblocks**: 3-8 lines explaining the file's architectural role.
- **Inline comments**: earn their place by answering "why?" or "why not the obvious way?". Delete comments that restate what the code says.
- **JSDoc on functions**: type signatures required; prose only when name + types aren't enough.
- **Never condescend.** No "Educational note:" or "Simply put:" prefixes — the reader is a developer.
- **Benchmark**: [compiler.js](core/src/islands/compiler.js) and [hydration.js](core/src/islands/hydration.js) set the standard for comment quality.

## Messages

All user-facing strings live in `core/src/messages/`. Both `satirical.js` and `serious.js` implement the `Messages` interface from `messages.d.ts`. **Never use inline strings for user-facing output.** Use `styleText` from `node:util` for colored logs. Tone, satire, and emoji rules: see [core/src/messages/README.md](core/src/messages/README.md).

**After changing any error message text**, regenerate the stderr goldens: `UPDATE_SNAPSHOTS=1 bun test:errors`. Inspect the diff before committing — each golden in `tests/errors/*/expected.stderr.txt` should show clean structured output.

## Key Design Decisions

- **Preact is permanently the page/layout rendering engine.** Pages and layouts always use Preact for SSR and VNode tree construction. Preact is a build-time dependency only — never shipped to the browser for static pages. Other frameworks (castro-jsx, Solid) are limited to islands.
- **Multi-framework is a plugin-level capability, not a headline feature.** Islands can use different frameworks, but they can't nest, share state across frameworks, or avoid TypeScript pragmas.
- **Layouts receive `children` (VNode)**, not a pre-rendered `content` HTML string. The entire tree renders in a single `renderToString()` pass.
- **Framework detection via AST scanning.** Detection order: exports first (strongest signal — vanilla's `hydrate` wins even if importing `preact`), imports second, Preact default. Plugins register additional frameworks via `CastroPlugin.frameworkConfig`.
- **Island imports must use relative paths**, not tsconfig aliases. The `islandMarkerPlugin` intercepts imports at the AST level; tsconfig path aliases resolve after Bun's AST walk, so aliased imports don't trigger island detection.
- **tsconfig.json path aliases** are supported natively in page imports. `getProjectDependencies()` externalizes all `package.json` dependencies, so Bun resolves local alias paths normally.
- **Multi-framework type checking** requires per-file `/** @jsxImportSource */` pragmas for non-default frameworks (e.g. `/** @jsxImportSource solid-js */` for Solid). The pragma is the only mechanism `tsc` honors per-file — TypeScript uses the root tsconfig's JSX settings for all transitively imported files regardless of any nested tsconfig.
- **`ClientScript` for zero-framework client behavior.** Accepts a plain function and optional JSON-serializable args, serializes them as an inline IIFE `<script>`. The escape hatch between "static component" and "full island."
- **Vanilla islands for island lifecycle without framework runtime.** Full island experience (directives, prop serialization, lazy loading) but zero client dependencies. Default export is Preact JSX for SSR; named `hydrate` export is plain JS for the browser. Perfect for D3, Three.js, or localized interactivity.
- **Three hydration directives: `comrade:eager`, `comrade:patient`, `comrade:visible` (default).** `comrade:eager` hydrates immediately. `comrade:visible` hydrates on intersection. `comrade:patient` uses `requestIdleCallback` with load-event gating and Safari fallback.

## Configuration

Optional `castro.config.{ts,js,mjs}` exports a default `CastroConfig`. The loader tries `.ts`, `.js`, `.mjs` in that order. All options live on the `CastroConfig` type in [core/src/types.d.ts](core/src/types.d.ts) — that file is the source of truth.

Use `defineConfig` (re-exported from `@vktrz/castro`) for type inference in `.ts`/`.js` configs without needing a JSDoc hint. It's an identity function.

Two options worth flagging because their behavior isn't obvious from the type:
- `srcDir` shifts where pages/layouts/components are *read from* but does not affect output paths — `dist/` is always the root.
- `importMap` entries override plugin-generated entries on island pages; static pages get no import map at all.

## Testing

`bun test:sites` builds and verifies `tests/site/`, which exercises the full pipeline across castro-jsx, Preact, Solid, and vanilla islands (all directives, multi-framework pages, CSS modules, component composition). The site mirrors a real project's structure — **use it as the reference for expected patterns** when you're unsure how something should be wired up.

## What NOT to Change

- Code must stay educational and well-commented — every file should explain "why"
- Satire belongs in messages/docs/CLI output only, never in the code logic itself
- `website/dist/` and `tests/site/dist/` are ephemeral, cleaned on every build
- Island imports must use relative paths, not tsconfig aliases (documented in `compileJsx.js`)

## Website Playground (`website/`)

Demo site that consumes castro. Uses PicoCSS v2 (CDN) plus three co-located stylesheets in `public/styles/` — no preprocessor, no build step for CSS. Each component/page has its own co-located CSS file.

**Read [website/DESIGN.md](website/DESIGN.md) before any UI change** — it documents the color system, typography, layout conventions, and the structure of the three style files. Customization & CSS variable references: [.claude/docs/pico.md](.claude/docs/pico.md), [.claude/docs/pico-variables-css.md](.claude/docs/pico-variables-css.md).

**Docs page `path` contract.** Pages under `src/pages/how-it-works/`, `src/pages/guide/`, `src/pages/reference/` export a `meta` with `layout: "docs"` and `path: "<exact-url>"`. The `path` drives sidebar active state and header highlighting — **update it whenever the page's URL changes**, or the nav silently goes wrong.

**Canonical tsconfig.** [website/tsconfig.json](website/tsconfig.json) is the source of truth; [packages/create-castro/template/tsconfig.json](packages/create-castro/template/tsconfig.json) shares the same `compilerOptions` but uses root-level `pages/`/`layouts/` (no `srcDir`) instead of the website's `src/` layout.
