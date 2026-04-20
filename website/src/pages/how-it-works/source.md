---
title: Reading the Source - Castro
layout: docs
path: /how-it-works/source
section: how-it-works
---

# READING THE SOURCE

Castro's [core/src/](https://github.com/ViktorZhurbin/castro/tree/main/core/src) is relatively small. This page is a reading order — the sequence
that makes the system legible. Start here, follow the thread.

The entry point for everything is [core/src/cli.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/cli.js). Two commands, two paths.
Everything else flows from `buildAll()` or `startDevServer()`.

---

## THE BUILD SEQUENCE

Follow this sequence to trace a page from source file to HTML on disk.

[builder/buildAll.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/buildAll.js) — the orchestrator. Read this first: it's a short
file that names every step in order. The comments are the map.

[builder/buildPage.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/buildPage.js) — one page, one pass. Handles both `.tsx` and `.md`
sources, delegates to `compileJsx.js` or Bun's markdown parser.

[builder/compileJsx.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/compileJsx.js) — runs `Bun.build` with the two always-on plugins
(`castroExternalsPlugin` and `islandMarkerPlugin`). The module docblock explains
the content-hash caching strategy that busts Bun's import cache.

[layouts/](https://github.com/ViktorZhurbin/castro/tree/main/core/src/layouts/) — discovers and compiles the layout that wraps each page. Read
after `buildPage.js` — it's the missing link between page compilation and
`renderPage.js`.

[builder/renderPage.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/renderPage.js) — wraps content in a layout, calls
`renderToString()`, hands off to `writeHtmlPage.js`. This is where the VNode
tree assembles.

[builder/writeHtmlPage.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/writeHtmlPage.js) — final step. Gathers all assets, injects them
into `<head>`, writes to disk.

---

## THE ISLAND PIPELINE

The island system is the core of what makes Castro interesting. Read these in order.

[islands/compiler.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/compiler.js) — compiles each `.island.tsx` twice: once for the
server (SSR module), once for the browser (hashed JS bundle). The dual
compilation is explained in the module docblock.

[islands/buildPlugins.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/buildPlugins.js) — the `islandMarkerPlugin`. This is the interception
step: replaces real island imports with lightweight stubs during page compilation.
Short file, high leverage.

[islands/marker.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/marker.js) — what the stub calls at render time. Looks up the
pre-loaded SSR module, renders it to HTML, wraps it in `<castro-island>`.

[islands/registry.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/registry.js) — the in-memory store that holds pre-compiled SSR
modules. Loaded once before any pages build.

[islands/hydration.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/hydration.js) — client-side only. The `<castro-island>` custom
element: reads the directive, waits accordingly, imports the client bundle,
calls the mounting function. This is the browser half of the pipeline.

---

## THE PLUGIN SYSTEM

[islands/plugins.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/plugins.js) — the plugin registry. Internal plugins (island
runtime, vendor bundling) and user plugins from config all go through here.

[islands/frameworkConfig.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/frameworkConfig.js) — loads and caches framework configs. Each
framework (Preact, vanilla, Solid, castro-jsx) is a config object, not a
special code path.

[islands/frameworks/](https://github.com/ViktorZhurbin/castro/tree/main/core/src/islands/frameworks/) — the built-in framework configs. [preact.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/frameworks/preact.js) and
[vanilla.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/frameworks/vanilla.js) are the reference implementations. Read these after
`frameworkConfig.js` — they're short and show exactly what a framework
contributes.

---

## SUPPORTING FILES

These are worth reading but not the main thread.

[utils/cache.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/utils/cache.js) — the write-to-disk-then-import pattern. Unusual but
standard in build tools. The docblock explains why `eval()` doesn't work here.

[config.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/config.js) — loads `castro.config.js`. Simple, but the comment on load
order is worth knowing.

[messages/](https://github.com/ViktorZhurbin/castro/tree/main/core/src/messages/) — all user-facing strings. Two presets, one interface.
`README.md` in this folder explains the voice rules.

---

## WHERE TO START FOR A SPECIFIC QUESTION

| I want to understand... | Start here |
|---|---|
| How islands compile | [islands/compiler.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/compiler.js) |
| How the build intercepts imports | [islands/buildPlugins.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/buildPlugins.js) |
| How hydration timing works | [islands/hydration.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/hydration.js) |
| How pages become HTML | [builder/renderPage.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/builder/renderPage.js) |
| How plugins hook in | [islands/plugins.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/plugins.js) |
| How to write a framework plugin | [islands/frameworks/preact.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/frameworks/preact.js) |
| How errors are structured | [utils/errors.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/utils/errors.js) + [errors.d.ts](https://github.com/ViktorZhurbin/castro/blob/main/core/src/errors.d.ts) |

<div class="btn-group">
  <a href="/how-it-works/hydration" class="btn btn-base">
    ← Back to Island Hydration
  </a>
</div>
