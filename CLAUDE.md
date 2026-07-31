# Castro

Castro is a static site generator built to be read. Each module is small enough to hold in your head. Communist satire wraps the prose; the code itself stays serious.

Preact for page rendering and islands, Bun for everything else.

Peer reference: Fresh, early Astro, Eleventy + is-land, Marko, Capri, Mastro, Iles, Enhance.

> Update this file when your changes affect what's documented here. Don't restate what lives in module docblocks or type definitions — reference the file instead.

## Commands

```
bun run dev          # dev server with live reload (website playground)
bun run build        # production build (website playground)
bun format           # Biome (tabs, double quotes) + Prettier for Markdown
bun check            # format + core checks + site tests (run before committing)
bun test:site        # build and verify test sites only
bun test:errors      # run error DX golden suite (tests/errors/)
bun loc              # LOC count (core only, excludes messages/)
```

## Monorepo Layout

- `core/` — core SSG engine (the npm package `@vktrz/castro`)
- `packages/` — `create-castro`, the project scaffolder
- `EXPLORATIONS.md` — the scope/complexity filter for building anything new here; read it before starting a package
- `website/` — demo playground that consumes castro. `website/tsconfig.json` is the canonical tsconfig; `packages/create-castro/template/tsconfig.json` shares the same `compilerOptions` but uses root-level `pages/`/`layouts/` instead of `src/`.
- `tests/site/` — minimal test site exercising Preact islands, all hydration directives, CSS modules, signals, layout CSS extraction, a shell-less layout, and nested layouts sharing a basename with the root one
- `tests/site-srcdir/` — pins the `srcDir` output contract: a `srcDir: "src"` site with a layout that imports CSS, asserting the emitted URL never leaks the `src` segment
- `tests/errors/` — isolated error cases for manual DX verification of the error overlay and terminal renderer

### Core Module Structure (`core/src/`)

Read module docblocks for file-level detail.

- **Build pipeline** (`builder/`) — how a JSX tree, a layout tree, and island markers compose into a single `renderToString()` pass.
- **Islands runtime** (`islands/`) — how a build plugin swaps real components for HTML markers at compile time, the trick that makes islands work. `islandMarkerPlugin` matches the resolved `.island.[jt]sx` path in an `onLoad` hook, so any import form Bun resolves works — relative, extensionless, or tsconfig alias (Bun resolves `paths` natively; see `compiler.js`).
- **Module cache** (`utils/cache.js`) — write-string-to-disk-then-import: the pattern bundlers use to bust ESM caches.
- **Structured errors** (`utils/errors.js`, `utils/renderError.js`, `dev/liveReload.js`, `messages/`) — typed error codes, code-frame extraction, terminal renderer, browser overlay, a single satirical voice. If the browser overlay is ever removed, collapse the payload/renderer split — a single-consumer abstraction isn't worth keeping.
- **Dev server** (`dev/`) — `Bun.serve`, file watchers, debounced rebuilds, SSE live reload.
- **Per-page state** (`islands/pageState.js`) — `AsyncLocalStorage` for isolating concurrent build state without globals.
- `cli.js`, `config.js`, `constants.js` — entry point, config loader, shared path constants.
- `layouts.js` — layout discovery and compilation.
- `types.d.ts`, `jsx.d.ts` — structured error payload types, shared types, JSX namespace for custom directives.

The reference implementations for hydration patterns are `core/src/islands/castroIsland.js` and `core/src/islands/compiler.js` — read them before changing how islands work.

## Architecture

How the subsystems connect across files. For mechanics inside a single step, read its module docblock.

### Build Pipeline

`cli.js` → `buildAll()` orchestrates the build (see `core/src/builder/buildAll.js` docblock for the step list). Three `Bun.build` plugins are always active: `castroExternalsPlugin` (keeps Castro internals external for singleton sharing), `cssPackagePlugin` (resolves bare `.css` imports to absolute paths so a stylesheet from an npm package — e.g. `@vktrz/bare-css` — bundles like local CSS instead of being externalized as a JS dep), and `islandMarkerPlugin` (replaces `.island.tsx` imports with marker stubs). Compiled page modules are loaded via `getModule()` with content-hashed file paths to bust Bun's import cache (Bun caches by path, not query string). The full VNode tree — page + layout + islands — renders in a single synchronous `renderToString()` pass; SSR modules must be pre-loaded.

### Island Tracking

`pageState.js` provides the AsyncLocalStorage context: each page build runs inside `runWithPageState()`, which gives it a fresh `{ usedIslands }` set scoped to that async call tree. `marker.js` records islands into that set as it renders them. This isolation is what makes parallel builds safe. Only CSS for islands actually rendered on a page gets injected; the `<castro-island>` runtime script and the vendored Preact bundle are also gated on island usage.

### Import Map & Dependency Vendoring

`PREACT_CLIENT_DEPS` plus any `config.clientDependencies` are vendored to `/dist/vendor/` by `vendorClientDeps()` (`core/src/builder/vendor.js`) — once, after all pages build, only when some island was rendered. Each island page gets a matching import map (`getIslandImportMap()`); static pages get none. Every dep in this set is treated as external during island compilation — the browser resolves it via the import map; everything else gets bundled per island.

### Dev Server

File watchers on `pages/`, `layouts/`, `components/`, and `public/` rebuild on change. Editor temp files and OS metadata are filtered via a denylist glob; everything else triggers a rebuild. Rapid changes are debounced so builds never overlap. Cache busting relies on content-hashed filenames (`post.tsx.a1b2c3d4.js`) because Bun's module loader ignores query strings. The mtime filter in `dev/server.js` guards against a macOS-specific self-rebuild loop: FSEvents surfaces the build's own file reads as change events; Linux inotify doesn't — don't treat the filter as dead code when testing there.

**Build error handling:** Errors are structured as `CastroErrorPayload` (see `core/src/types.d.ts`). Two independent renderers consume the payload: `renderErrorToTerminal()` colors the terminal output, and the browser overlay (`core/src/dev/liveReload.js`) renders a shadow DOM tree. On failure, the server logs to the terminal and sends the payload over SSE — no reload, keeping the last good page visible. On the next successful build, `reload` is sent.

## Conventions

- **Biome** for linting/formatting.
- **JSDoc** for all types and function intent. `.d.ts` files only for shared/reusable types.
- **Bun-native APIs** over Node equivalents — `Bun.file().exists()`, `Bun.file().json()`, etc. If going async requires changing a caller, do it explicitly rather than falling back to Node.
- **No `createElement`** — use JSX or `h()` from preact.
- **No non-null assertions** (`foo!.bar`).
- **Path names** say what they're relative to: `relativeSourcePath`/`relativeOutputPath` are relative to a scan root (the `*_DIR` constants in `constants.js`) and are what `Bun.Glob.scan()` yields, while `sourceFilePath`/`outputFilePath` include that root and are what you pass to file APIs — `outputDir` is always a directory, and bare `sourcePath`/`outputPath`/`filePath` are banned as ambiguous between the two. If a name's JSDoc still has to say "absolute _or_ relative," it isn't done — that ambiguity is exactly what these names exist to remove.
- **`type` over `interface`** in `.d.ts` — one declaration form, and no accidental declaration merging across files.
- **Module docblocks**: 3-8 lines on the file's architectural role; **inline comments** answer "why?" or "why not the obvious way," never restate the code, and stop at the non-obvious fact — one that outgrows its code belongs in the docblock or here instead; **JSDoc prose** only when name + types aren't enough.
- Never condescend. No "Educational note:" or "Simply put:" prefixes.

## Messages

All user-facing strings live in `core/src/messages/`. Message factories keyed by `ErrorCode` (typed via `ErrorMessages`) return a `CastroErrorPayload`; wording lives here, structure lives in the payload. **Never use inline strings for user-facing output.** Use `styleText` from `node:util` for colored logs. Tone, satire, and emoji rules: see `core/src/messages/README.md`.

## Key Design Decisions

- Preact handles SSR and VNode tree construction everywhere, including islands; it's a build-time dependency, never shipped to the browser for static pages. Preact-specific build values live in `core/src/islands/preact.js`.
- **Layouts receive `children` (VNode)**, not a pre-rendered `content` HTML string.
- **Islands take props, never children** — including string children, which would survive the `data-props` JSON trip. `renderMarker` throws `ISLAND_HAS_CHILDREN`; the reasoning for the flat rule is at that throw site.
- **Island props are JSON, and nothing checks that they are.** The build→runtime seam is `JSON.stringify` in `marker.js` and `JSON.parse` in `castroIsland.js`, unvalidated at both ends — the only guard is the `ISLAND_PROPS_NOT_SERIALIZABLE` throw for values `JSON.stringify` outright rejects. Everything merely _lossy_ passes silently: a `Date` arrives as a string, a function or `undefined` doesn't arrive at all. SSR renders with the real value while the client hydrates with the coerced one, and Preact patches over the mismatch without a word. Pass island props as JSON primitives, or reconstruct richer values inside the island.

## Configuration

`srcDir` shifts the source root for pages/layouts/components; output is always `dist/` regardless. All options are in `core/src/types.d.ts`.

## Testing

See `tests/CLAUDE.md` for what each test suite covers and how to regenerate goldens.

## Two Forces

**Brevity** is the default. For any defensive code path: if it merely survives an edge case rather than teaching framework machinery, delete it. The cases we deliberately don't handle:

- **Cross-platform**: posix filesystem only (Linux, macOS, WSL). No Windows path normalization.
- **Graceful recovery**: `pages/` throws naturally when missing; `public/` is silently skipped.
- **Cache invalidation**: no CDN fingerprinting, no cross-run state. Content-hashed filenames cover in-session module cache busting only.
- **Production concurrency**: `Promise.all` only — no queue, no retry, no memory bounding.
- **Hostile filesystems**: no I/O retry, no defense against unusual mounts. (The mtime filter in `dev/server.js` is a deliberate carve-out — see Dev Server.)
- **Runtime config validation**: TypeScript catches misconfigs; no runtime re-validation.
- **User extensibility**: no plugin API, no hook system. Last worked at commit `fdf04bd`.
- **Backwards compatibility**: package is unpublished; breaking changes land freely.
- **Dead island elimination**: every `*.island.{jsx,tsx}` under `components/` compiles and writes a client bundle to `dist/islands/`, whether or not a page imports it. Per-page `usedIslands` gating decides what the HTML _references_, not what ships. Pruning would mean deferring compilation until after pages render, but SSR modules have to be loaded before that — not worth the inversion.

**Day-to-day DX** is the named exception. These subsystems cost lines on purpose and survive brevity passes intact:

- structured errors;
- the satirical voice (`messages/`);
- live-reload dev server (`dev/`);

Anything outside these earns its lines by teaching machinery; propose removing one rather than acting unprompted.
