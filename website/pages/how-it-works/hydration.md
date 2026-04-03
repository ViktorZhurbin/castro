---
title: Island Hydration — Castro
layout: docs
path: /how-it-works/hydration
section: how-it-works
---

# ISLAND HYDRATION

The build pipeline produces static HTML with `<castro-island>` wrappers. Now the browser takes over — a custom element decides when and how to make each island interactive.

---

## THE CUSTOM ELEMENT

The browser loads `castro-island.js` and registers a `<castro-island>` custom element. When one connects to the DOM, `connectedCallback()` reads the `directive` attribute and decides what happens next.

<div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-8">
  <div class="card card-bordered border-base-300 bg-base-200 p-6 text-center">
    <span class="badge badge-primary mb-3 mx-auto">connectedCallback()</span>
    <p class="text-sm text-base-content/80">Fires when the element enters the DOM. Reads the <code>directive</code> attribute.</p>
  </div>

  <div class="flex flex-col items-center gap-2 text-base-content/80">
    <span class="hidden md:block text-2xl">→</span>
    <span class="md:hidden text-2xl">↓</span>
  </div>

  <div class="flex flex-col gap-4">
    <div class="card card-bordered border-primary bg-base-200 p-4">
      <div class="flex items-center mb-2 gap-2">
        <span class="badge badge-primary">comrade:visible</span>
        <span class="badge badge-sm badge-dash">default</span>
      </div>
      <p class="text-sm text-base-content/80">Wait for the element to enter the viewport via <code>IntersectionObserver</code> (with a 100px buffer). Then hydrate.</p>
    </div>
    <div class="card card-bordered border-accent bg-base-200 p-4">
      <span class="badge badge-accent mb-2">comrade:patient</span>
      <p class="text-sm text-base-content/80">Wait for the browser to be idle via <code>requestIdleCallback</code>. Then hydrate.</p>
    </div>
    <div class="card card-bordered border-accent bg-base-200 p-4">
      <span class="badge badge-accent mb-2">comrade:eager</span>
      <p class="text-sm text-base-content/80">Hydrate immediately. No waiting. JS loads as soon as the element connects.</p>
    </div>
  </div>
</div>

→ [hydration.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/hydration.js)

---

## THE IMPORT

When it's time to hydrate, the element does `await import(this.getAttribute("import"))` to load its client bundle. The bundle contains a bare `import("preact")` — no URL. The import map, injected into the page's `<head>` by the build pipeline, is what tells the browser where to fetch it. The framework files are bundled in `/dist/vendor/` and re-used across all islands.

### ISLAND BUNDLE

```javascript
// Counter-a1b2.js
import Component from './Counter.tsx';

export default async (container, props) => {
  const { h, hydrate }
    = await import("preact");

  hydrate(h(Component, props), container);
};
```

Generated at compile time. The `import("preact")` call is a bare specifier — it doesn't bundle Preact.

### IMPORT MAP

Injected into every page that uses islands. Framework defaults are merged with any entries from `importMap` in your config (user entries win on conflict).

```html
<script type="importmap">
{
  "imports": {
    <!-- Bundled from node_modules into /dist/vendor/ at build time -->
    <!-- Defined by frameworks and by user through config.clientDependencies -->
    "preact": "/vendor/preact.js?v=10.28.3",
    "preact/hooks": "/vendor/preact_hooks.js?v=10.28.3",
    "date-fns": "/vendor/date-fns.js?v=2.30.0",

    <!-- Loaded from CDN -->
    <!-- from config.importMap -->
    "@mui/material/": "https://esm.sh/@mui/material/"
  }
}
</script>
```

→ [compiler.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/compiler.js) · [writeHtmlPage.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/builder/writeHtmlPage.js)

---

## THE MOUNT

The client bundle's default export is a mounting function, generated at compile time with a framework-specific `hydrateFnString`. The custom element calls `module.default(this, props)` — the framework takes over the existing SSR HTML inside the container. No re-render, just attaching event listeners to the existing DOM.

<aside class="alert">
  <code>hydrate()</code> is different from <code>render()</code> — it reuses the server-rendered DOM nodes instead of replacing them. The page never flashes or re-renders. It just becomes interactive.
</aside>

```javascript
// Inside hydration.js — the hydrate() method

const propsJson = this.dataset.props;
const props = propsJson ? JSON.parse(propsJson) : {};

// Dynamic import — triggers network request for the island JS
const module = await import(this.getAttribute("import"));

// Call the mounting function — framework hydrates the container
await module.default(this, props);

// Mark as ready (useful for CSS transitions or testing)
this.setAttribute("ready", "");
```

→ [compiler.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/compiler.js) · [frameworks/preact.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/frameworks/preact.js)

---

## SUMMARY

```
HTML arrives
  → <castro-island> connects to DOM
    → directive decides timing
      → JS imports on demand
        → hydrate() attaches to existing DOM
          → interactive
```

The build pipeline produces the HTML. The custom element brings it to life.

<div class="flex flex-wrap gap-4">
  <a href="/how-it-works" class="btn btn-outline btn-primary">
    ← Back to The Build Pipeline
  </a>
</div>
