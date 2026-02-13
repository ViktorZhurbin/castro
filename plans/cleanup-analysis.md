# Castro Framework Analysis
## A Staff-Level Architectural Review

*Post-merge state of `html-string-approach` into `main` (commit `a0faea0`)*

---

## Part 1: The Architecture as It Stands

### The Build Pipeline

Here's the actual data flow, traced from the code:

```
cli.js
 └─ buildAll()                           [build-all.js]
      ├─ rm + mkdir dist/
      ├─ cp public/ → dist/
      ├─ plugins.onBuild()               [plugins.js]
      │    ├─ castroIslandRuntime.onBuild()  → copies hydration.js to dist/
      │    └─ preactIslands.onBuild()        → islands.load()  [registry.js]
      │         └─ for each *.island.{jsx,tsx} in components/:
      │              ├─ compileIsland()       [compiler.js]
      │              │    ├─ compileIslandSSR()    → Bun.build(target: "bun", css-stub plugin)
      │              │    └─ compileIslandClient() → Bun.build(target: "browser", virtual entry)
      │              ├─ getModule(ssrCode)    → write to cache, dynamic import
      │              └─ store in #islands, #ssrModules, #cssManifest
      ├─ layouts.load()                   [layouts/registry.js]
      │    └─ for each *.{jsx,tsx} in layouts/:
      │         └─ compileJSX()           [compile-jsx.js]  ← same function used for pages
      └─ for each page in pages/:
           └─ buildPage()                 [build-page.js]
                ├─ .md → parseFrontmatter + Bun.markdown.html → renderPage()
                └─ .jsx/.tsx → compileJSX() → renderPage()
                                              [render-page.js]
                     ├─ resetUsedIslands()
                     ├─ createContentVNode()    ← markers fire here synchronously
                     ├─ layoutComponent({ children: contentVNode })
                     ├─ renderToString(fullTree) ← single pass
                     └─ writeHtmlPage()         [write-html-page.js]
                          ├─ resolvePageContext()  → CSS + import maps + live reload
                          ├─ runTransforms()       → plugin HTML transforms
                          └─ injectAssets()        → splice into </head> or </body>
```

This is clean. It flows in one direction. There are no callbacks, no hooks, no mutable global state being toggled on and off. A reader can start at `cli.js` and follow each function call to the next file without hitting any "wait, where does this get called from?" moments.

### The Compile-Time Island Detection Mechanism

This is the architectural centerpiece and it's genuinely clever *in the good way* — it's not a trick, it's a well-chosen design point. Here's exactly what happens:

When `compileJSX()` runs `Bun.build()` on a page file, two plugins intercept the build:

**Plugin 1: `islandMarkerPlugin`** — When Bun encounters an import like `import MyCounter from "../components/MyCounter.island.tsx"`, the plugin intercepts the `.island.tsx` file load. Instead of returning the actual component code, it returns:

```js
import { renderMarker } from "/absolute/path/to/castro/src/islands/marker.js";
export default (props) => renderMarker("components/MyCounter.island.tsx", props);
```

This is the key insight: **the island never gets bundled into the page**. The page gets a thin proxy function instead. When `renderToString()` calls this function during VNode traversal, `renderMarker()` does the SSR rendering and wraps the result in `<castro-island>` HTML.

**Plugin 2: `resolveImportsPlugin`** — Ensures Castro internals (`marker.js`, `registry.js`, `framework-config.js`) stay external so they share the same singleton instances as the build process. Without this, each compiled page would get its own copy of the registry, and `usedIslands` tracking would break.

This is architecturally sound. The boundary between "page compilation" and "island compilation" is the file naming convention (`.island.tsx`), enforced by a Bun build plugin regex. No runtime hooks, no prototype patching, no global state toggling.

### What's Good About the Current Architecture

**Single `renderToString` call per page.** The old approach rendered content to HTML, passed it as a string prop to the layout, then rendered the layout. Now the content VNode is passed as `children` to the layout, and the entire tree renders in one pass. This means islands in layouts are detected through the same mechanism as islands in pages — no special handling needed.

**The cache system (`cache.js`) solves a real problem and explains why.** The comments explain that file-based caching is necessary because Bun's module resolution needs `file://` URLs to resolve bare specifiers like `preact`. This is the kind of non-obvious constraint that would be invisible in a production framework but is exactly what an educational codebase should surface.

**The dual compilation in `compiler.js` is well-motivated.** The comments clearly explain why islands are compiled twice: SSR targets Bun (can import node_modules directly), client targets the browser (uses import maps for CDN loading). The CSS stub plugin for SSR is a nice touch — it explains that CSS imports break during SSR because there's no DOM, so they get replaced with empty modules.

**The `FrameworkConfig` pattern in `framework-config.js` is well-designed for education.** It collects all five things you need to know about a framework integration in one object: how to compile, how to hydrate, how to SSR, what to put in the import map, and what JSX settings to use. Someone wanting to understand "what would it take to add Solid support?" can look at one object and see the complete surface area.

**The plugin system (`CastroPlugin` type) is minimal but complete.** Five hooks: `onBuild`, `getAssets`, `getImportMap`, `transform`, `watchDirs`. No plugin lifecycle management, no dependency resolution between plugins. This is appropriate for the project's scope.

### What's Still Rough

**1. Live reload is silently broken in dev mode.**

`cli.js` sets `NODE_ENV = "production"` for the `build` command but never sets `NODE_ENV = "development"` for the `dev` command. The dev server calls `buildAll()` without setting the environment. Meanwhile, `write-html-page.js` line 75 checks:

```js
if (process.env.NODE_ENV === "development") {
    assets.push(await getLiveReloadAsset());
}
```

Unless the user's shell already has `NODE_ENV=development`, the live reload script never gets injected. The SSE endpoint in `server.js` works, the watcher works, but the browser never connects because the `<script>` tag isn't in the HTML.

Fix: add `process.env.NODE_ENV = "development"` to the `dev` case in `cli.js`, or (better) invert the check to `if (process.env.NODE_ENV !== "production")`.

**2. The error handling chain double-wraps messages.**

`render-page.js` catches errors and prepends the source file path:
```js
e.message = `${sourceFilePath}: ${e.message}`;
```

Then `build-page.js` catches the re-thrown error and wraps it again:
```js
styleText("red", messages.build.fileFailure(sourceFilePath, err.message))
```

A build failure for `pages/index.tsx` will produce something like:
```
Sabotage detected in pages/index.tsx: pages/index.tsx: Cannot read property 'default' of undefined
```

The file path appears twice. `render-page.js` should either not modify the error, or `build-page.js` should not add the file path.

**3. `no:pasaran` comment says "display:contents" but code doesn't set it.**

```js
// marker.js line 93
// Use display:contents to avoid layout shifts while keeping a wrapper
return h("div", {
    dangerouslySetInnerHTML: { __html: ssrHtml },
});
```

The comment is a leftover from a previous iteration. The `div` has no style at all. This is fine functionally (an unstyled `div` is harmless as a wrapper), but the comment is misleading.

**4. Blog post references a data cascade feature that doesn't exist.**

`website/pages/blog/index.md` says "The layout for this post was resolved via the `reef.js` file in the blog directory, demonstrating the 11ty-style data cascade." But there is no `reef.js` file anywhere in the project. This is vestigial content from the Reef era. A reader trying Castro would see this page and be confused.

**5. `isIsland()` method on the registry is never called.**

`IslandsRegistry.isIsland(id)` exists but nothing in the codebase uses it. It was probably used by the old `wrapper.js` to check if a VNode's component was registered. The marker approach doesn't need it because detection happens at compile time, not at render time. Dead code.

**6. The `purge` command exists but isn't in the usage text.**

```js
// communist.js
usage: "Usage: castro [dev|build]",
```

The CLI accepts `castro purge` but the help text only mentions `dev` and `build`.

**7. `compileIslandSSR` returns `undefined` on failure instead of throwing.**

```js
// compiler.js line 156
async function compileIslandSSR({ sourcePath }) {
    // ...
    try {
        // ...
    } catch (e) {
        console.warn(styleText("yellow", messages.build.ssrSkipped(...)));
        // implicit return undefined
    }
}
```

The caller checks for this:
```js
if (!ssrCode) {
    throw new Error(messages.build.ssrCompileFailed(sourcePath));
}
```

This means an SSR compilation failure produces *two* messages — a yellow warning from `compileIslandSSR` and then a thrown error from `compileIsland`. Either the function should throw directly (let the caller handle it), or it should return `undefined` silently and let the caller be the sole reporter. Currently it does both.

---

## Part 2: As an Educational Codebase

### What Makes It Work for Learning

**The 1,114 executable lines (excluding messages) tell a complete story.** That's not an approximation — it's the actual count from this codebase. Within those lines, a reader encounters: a CLI parser, a build orchestrator, a JSX compiler with plugins, a YAML frontmatter parser, a markdown-to-HTML pipeline, a layout system, an island compiler with dual-target output, an SSR rendering pipeline, a custom element hydration runtime, a dev server with file watching and SSE-based live reload, an asset injection system with import maps, and a CSS extraction pipeline.

That's an extraordinary amount of ground covered in ~1,100 lines. For comparison, Astro's compiler alone (`@astrojs/compiler`, the Go-based `.astro` file parser) is roughly 15,000 lines. Fresh's server runtime is about 5,000. Even 11ty's core template engine module is about 2,000 lines.

**The comment density is genuinely educational, not decorative.** Looking at `compile-jsx.js`, the comments on `resolveImportsPlugin` don't just say *what* — they explain the three categories of imports, why each category needs different treatment, and what breaks if you get it wrong. `cache.js` explains why file-based caching is needed instead of in-memory (Bun's module resolution requires `file://` URLs). These are the kinds of insights that would take someone hours of debugging to discover on their own.

**The file structure mirrors the conceptual architecture.** `builder/` handles the build pipeline, `islands/` handles island detection and hydration, `layouts/` handles layout management, `dev/` handles development tooling. Someone reading the README can form a mental model and then find the code exactly where they'd expect it. This matters more than people think — many codebases have logical organization that doesn't match their file structure, forcing readers to build two mental maps.

**The `FrameworkConfig` object is a pedagogical gem.** It answers the question "what does framework-specific mean in an SSG?" in 40 lines of code. Five properties, five concerns, one object. A reader who understands this object understands the interface between a framework and an SSG at a conceptual level. This is the kind of thing that transfers — after reading Castro's Preact config, you'd be able to look at how Astro integrates React or Solid and recognize the same patterns.

### Where the Educational Value Could Be Stronger

**The `write-html-page.js` pipeline (210 lines) is the longest file and the hardest to follow.** It does four things — resolution, transformation, injection, and output — but the `injectAssets` function is doing string manipulation that's not particularly educational. The `indexOf("</head>")` approach works, but a reader learns more from understanding *why* assets need to go in `<head>` than from seeing string slicing. A comment about "why `</head>` and not `</body>`" (render-blocking CSS needs to be in head; scripts can go in either) would help.

**The cache system is infrastructure, not architecture.** `cache.js` is 125 lines of file path manipulation and module loading. It's necessary, but it's plumbing. The educational insight is in the *why* (explained well in the header comment), not in the *how* (path joining and file writing). This is the one area where the code-as-documentation principle doesn't fully work — someone reads through 70 lines of path resolution and cache busting and doesn't learn much about SSGs or island architecture.

**The relationship between `marker.js` and `compile-jsx.js` could use a "how to read this" guide.** The key insight — that `islandMarkerPlugin` replaces island imports with marker functions that execute during `renderToString` — spans two files and requires understanding Bun's build plugin system. A reader who doesn't know what `build.onLoad` does will be lost. A comment at the top of `compile-jsx.js` saying "if you're new to Bun build plugins, start by reading [link]" would be valuable.

**There's no tutorial page.** The website links to `/tutorial` and `/manifesto`, neither of which exist. The blog post references features that don't exist (data cascade). The documentation site is Castro's own website, which is a good idea (dogfooding), but it currently shows more of the *satire* than the *education*. The landing page demonstrates the three directives beautifully — that's excellent — but doesn't guide someone through reading the source code.

---

## Part 3: Comparison with Other Frameworks

### Castro vs Astro

**Astro** is a production SSG/SSR framework with ~100,000+ lines across its monorepo. Here's where the comparison is interesting:

**Island detection:** Astro uses a custom `.astro` file format parsed by a Go-based compiler that identifies framework components and wraps them in `<astro-island>` custom elements. Castro achieves the same result with a Bun build plugin and a 30-line marker function. The approach is fundamentally the same — detect at compile time, wrap in custom element, hydrate on demand — but Astro needs the custom file format because it supports mixing multiple frameworks (React + Svelte + Vue in one page), while Castro's single-framework model lets it use standard `.tsx` files.

**Hydration directives:** Astro uses `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`. Castro has `lenin:awake` (≈ `client:load`), `comrade:visible` (≈ `client:visible`), and `no:pasaran` (≈ no directive / static). Castro is missing `client:idle` (uses `requestIdleCallback`) and `client:media` (hydrate based on media query). These would be straightforward to add to `hydration.js` — each is about 10-15 lines in the `connectedCallback` switch.

**Where Castro teaches what Astro hides:** Astro's `<astro-island>` custom element does the same thing as Castro's `<castro-island>`, but it's buried in 500+ lines of runtime code with Base64-encoded props, framework detection, and cross-framework compatibility logic. Castro's `hydration.js` does the same core job in 122 lines with clear comments explaining every step. Someone who reads Castro's hydration code will understand how Astro's works too — the fundamental mechanism is identical.

**Where Astro is genuinely more sophisticated:** Astro has partial hydration *within* components (you can have a static header and interactive body in the same component), server-side rendering at request time (not just build time), content collections with type-safe schemas, and middleware. These are features that make Astro production-ready but that add thousands of lines of complexity that obscure the core architecture.

### Castro vs 11ty (Eleventy)

**11ty** is the closest spiritual relative. Both are SSGs that prioritize simplicity and minimal JavaScript. But the comparison reveals how different the philosophies are:

**Template languages:** 11ty supports 11 template languages (Markdown, Nunjucks, Liquid, Handlebars, Mustache, EJS, Haml, Pug, JavaScript, HTML, WebC). Castro supports 2 (Markdown and JSX/TSX). This isn't a limitation for Castro's educational purpose — JSX is the lingua franca of modern component-based web development. Supporting it teaches readers about JSX compilation, VNode trees, and `renderToString`. Supporting Nunjucks would teach them about template string interpolation, which is less relevant to modern framework architecture.

**Island architecture:** 11ty's approach to islands is through the `<is-land>` web component by Zach Leatherman. It's an *add-on*, not a first-class architectural concept. You drop `<is-land>` into your template and it handles lazy loading. Castro's approach is the opposite — islands are the *reason the framework exists*. They're detected at compile time, compiled separately, SSR'd at build time, and hydrated on demand. The entire build pipeline is organized around this distinction.

**Data cascade:** 11ty has a sophisticated data cascade: global data → directory data → template data → front matter, with computed data and JavaScript data files at every level. Castro has frontmatter and `meta` exports. This is an area where Castro could learn from 11ty — not by implementing the full cascade, but by adding a `castro.data.js` convention for directory-level defaults. The blog post in the website already references this feature; implementing it would be maybe 30-40 lines and would teach about convention-over-configuration patterns.

**Bundle size philosophy:** 11ty ships zero JavaScript by default. Castro ships zero JavaScript for static pages, but includes the `castro-island.js` runtime (122 lines, ~2KB minified) and `castro-island.js` the custom element registration on every page, even if that page has no islands. This is a minor but real difference — a pure-content site built with Castro still loads a script that registers a custom element that's never used.


### Castro vs Fresh (Deno)

**Fresh** is the most architecturally similar framework. Both use islands architecture as a first-class concept, both use a naming convention for island detection (Fresh uses an `islands/` directory, Castro uses `.island.tsx` suffix), and both use web components as the hydration boundary.

**Where they diverge on detection:** Fresh's approach is directory-based: anything in `islands/` is an island. Castro's is suffix-based: anything ending in `.island.tsx` is an island regardless of directory. Castro's approach is more flexible (islands can live alongside their non-island siblings in `components/`) but requires the naming convention to be understood.

**Server-side rendering:** Fresh does SSR at request time (server-rendered on every page load), while Castro does SSG at build time (rendered once, served as static files). This is the fundamental architectural difference. Fresh can show user-specific content and handle dynamic data; Castro produces static files that can be served from a CDN with zero server infrastructure. For educational purposes, Castro's approach is simpler to explain and trace through.

**Runtime size:** Fresh ships Preact's full runtime (~4KB) plus a few hundred bytes of island bootstrap code. Castro ships Preact via CDN import map only for pages that use islands. For static pages, both ship zero framework JavaScript, but Castro always includes the custom element registration script.

**Where Fresh teaches different lessons:** Fresh's just-in-time rendering model teaches about edge computing, streaming SSR, and request-time data fetching. Castro's build-time model teaches about compile-time optimization, static analysis, and progressive enhancement. They're complementary educational experiences. If Castro teaches "how does the build pipeline work?", Fresh teaches "how does the serving pipeline work?"

---

## Part 4: Honest Assessment — Is the Architecture Robust?

### What's Genuinely Solid

**The compile-time island detection is the right abstraction at the right level.** It doesn't rely on runtime introspection, global state mutation, or framework-specific hooks. It's a Bun build plugin that runs before rendering even starts. The boundary is clean: the plugin runs during `Bun.build()`, the marker function runs during `renderToString()`, and nothing crosses that boundary except a string (the island ID).

**The singleton pattern for registries is appropriate.** Both `IslandsRegistry` and `LayoutsRegistry` are singletons with private `Map` fields. The `#` private fields are a good choice — they prevent external code from reaching into the registry's internals, which matters for maintaining the contract between "registry loads everything" and "marker looks up by ID."

**The `renderMarker` function is a clean synchronous seam.** During `renderToString()` traversal, Preact calls component functions synchronously. The marker function can't be async. The registry pre-loads SSR modules at build startup specifically to satisfy this constraint. This is a *motivated* design decision — the comments explain the constraint, and the architecture follows from it.

**The CSS pipeline (extract → manifest → inject) handles the hard case well.** Island CSS is extracted during island compilation, stored in the registry's CSS manifest, tracked per-page via `usedIslands`, and injected as inline `<style>` tags. Page and layout CSS are extracted by `Bun.build`'s CSS loader and written as separate files with `<link>` tags. The two paths are different because they solve different problems (island CSS is per-component and needs deduplication; page CSS is per-file and doesn't), and the code makes this distinction clear.

### What's Still a "Clever Trick"

**The `getModule()` / `writeTempFile()` pattern in `cache.js` is the one remaining piece of "magic."** The function writes JavaScript code to a file in `node_modules/.cache/castro/`, then immediately `import()`s it via a `file://` URL with a cache-busting timestamp. This works, and it's well-commented, but it's the one part of the pipeline where a reader might think "wait, we're writing code to disk and then importing it? Is that... normal?"

The answer is: yes, this is how many build tools work internally (webpack's in-memory filesystem, Vite's module graph), but they usually hide it behind abstractions. Castro exposes it, which is educational. But it would benefit from a more prominent "here be dragons" comment explaining that this is the one piece of genuine build-tool plumbing in the codebase.

**The `resolveImportsPlugin` with catch-all `filter: /.*/` is necessary but subtle.** Intercepting every single module resolution request to classify imports into three buckets (Castro internals, bare specifiers, relative imports) is correct, but a reader who doesn't understand Bun's plugin system will find this confusing. The comment is good, but the concept of "external means don't bundle, let Bun resolve at import time" is not self-evident.

**Virtual entry points in `compileIslandClient`.** The client-side island compilation creates a virtual file (`counter.virtual.js`) that imports the real component and wraps it in a mounting function. This virtual file is never written to disk — it exists only in Bun's build configuration via the `files` option. This is a well-established pattern (Vite, Rollup, and esbuild all support virtual modules), but it requires knowing that build tools can operate on files that don't exist on the filesystem.

### Architectural Gaps to Think About

**No incremental builds.** Every `buildAll()` call clears `dist/` and rebuilds everything. For a site with 10 pages, this is fine. For 1,000 pages, it would be slow. 11ty and Astro both support incremental builds. This isn't a bug — it's a scope decision. But the rebuild-everything-on-change behavior in the dev server means that editing a component triggers a full site rebuild, which could become a DX issue as the website grows.

**No streaming SSR.** `renderToString()` produces the entire HTML string in memory before writing to disk. Modern SSR frameworks (Next.js, SolidStart, Fresh) can stream HTML chunks to the browser as they render. This is beyond Castro's scope (it's a static site generator, not a server), but it's worth noting that the architecture doesn't prevent it — `renderToString` could be replaced with `renderToReadableStream` if someone wanted to experiment.

**No content collections.** Astro's content collections provide typed access to markdown frontmatter across multiple files. Castro's frontmatter is validated per-file with a simple schema (`title: string, layout: string | boolean`). A `pages/blog/` directory with 50 posts has no way to generate an index page listing all posts. This would be a natural next feature and would teach about build-time data aggregation.

---

## Part 5: Fresh Perspective — Where Castro Could Go

### The Missed Teaching Opportunity: The Data Flow Diagram

Castro has the right architecture for generating a *visual representation of its own build pipeline*. Imagine a page at `/internals` that renders a Mermaid diagram of the actual build flow, generated at build time by introspecting the codebase itself. This is the kind of meta-educational content that would make Castro unique — not just "read the code" but "the code explains itself."

### The Satire as Pedagogical Device

Right now the satire is in the presentation layer (error messages, CLI output, directive names). This is the right placement. But there's an underexploited opportunity: **the satire could be the mnemonic device for the architecture itself.**

Consider: the three directives map to three fundamental web performance strategies. Instead of names that require explanation, the communist framing creates stories:

- `no:pasaran` — "they shall not pass (to the client)" → static rendering, zero JS. The name encodes the concept.
- `lenin:awake` — "the leader is always ready" → eager loading, immediate hydration. The name encodes the urgency.
- `comrade:visible` — "only work when the people are watching" → lazy loading, intersection observer. The name encodes the trigger condition.

These are memorable precisely *because* they're absurd. Six months after reading Castro's code, someone will remember "no:pasaran means no JavaScript" even if they've forgotten every Astro directive name. This is a legitimate educational advantage that Castro isn't marketing enough. The README mentions the names but doesn't frame them as mnemonic devices.

### The "Minimal Viable Framework" Thesis

Castro occupies an interesting position in the framework landscape. It's not minimal (that would be something like `Bun.build` + `renderToString` in a single file). It's not comprehensive (that's Astro). It's *minimal-complete* — it has exactly the pieces needed to demonstrate the full island architecture lifecycle, with nothing extra.

This is a genuinely hard design constraint to satisfy. Most educational projects err toward one extreme: either they're so minimal they skip important parts (no CSS handling, no dev server, no layout system), or they grow features until they're no longer readable. Castro sits at approximately the right point. The 1,114 lines of executable code include everything a reader needs to understand, with nothing they'd need to skip.

The comparison I'd make isn't to other SSG frameworks. It's to projects like **Redux** (a state management library that taught a generation of developers about unidirectional data flow by being simple enough to understand completely) or **Express** (an HTTP framework that taught a generation about middleware by being ~500 lines of readable code). Castro could serve the same role for island architecture — the framework people read to understand the concept, not the framework they use in production.

### What I'd Prioritize Next

If I were planning the next phase, in order of impact:

1. **Fix the live reload bug.** It's likely broken right now for most users. One line fix.

2. **Build the tutorial page.** The website links to `/tutorial` but it doesn't exist. A single page walking through "open `compile-jsx.js`, here's what happens when you import an island" would multiply the educational value of the codebase.

3. **Add `client:idle` as a fourth directive** (`comrade:idle`?). It's 10 lines in `hydration.js` and demonstrates `requestIdleCallback`, which is a useful browser API to know about.

4. **Clean up the blog post content.** Remove the reef.js data cascade reference. Replace with content that actually demonstrates what Castro can do.

5. **Add a `/internals` page** to the website that shows the build pipeline visually. Build it with Castro. This is the ultimate dogfooding — the framework's documentation site uses the framework to explain the framework.

6. **Consider conditional loading of `castro-island.js`.** Only inject the custom element registration script on pages that actually have islands. The plugin system already knows this (via `usedIslands`) — it's a matter of checking `usedIslands.size > 0` before adding the script asset.

### The Question You Didn't Ask: Is This a Framework or a Textbook?

The most interesting thing about Castro is that the answer is "both, and the tension is productive." The communist theme makes it a *thing* — it has personality, it's memorable, it's shareable. The educational comments make it a *learning resource* — someone can read through it in an afternoon and understand island architecture. The fact that it actually works (you can build real websites with it) gives the education credibility.

Most educational projects fail because they're not real software. Most real software fails as education because it's too complex. Castro threads the needle by being small enough to understand completely, real enough to use, and weird enough to remember.

The ~1,100 executable lines represent a genuine constraint: every line you add makes the codebase harder to read as an educational resource, and every line you remove makes it less capable as a real tool. You're at approximately the right point. Guard this constraint aggressively.