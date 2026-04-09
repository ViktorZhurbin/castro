---
title: Build Pipeline - Castro
layout: docs
path: /how-it-works
section: how-it-works
---

# THE BUILD PIPELINE

Castro's build pipeline has three moving parts. Understanding all three is understanding island architecture - not just how Castro works, but why it works the way it does.


## THE DUAL COMPILATION

Islands compile before any pages are processed. Each `.island.tsx` file goes through `Bun.build` twice - once for the server (producing an SSR module that's pre-loaded into a registry) and once for the browser (producing a hashed JS bundle written to `dist/islands/`). The server needs a Bun module; the browser needs an ES module. Same source, two targets.

<div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch mb-12">
  <!-- SOURCE NODE: Heavy anchor block -->
  <div class="border-2 border-neutral border-b-8 bg-base-200 p-6 flex flex-col items-center justify-center text-center">
    <div class="bg-primary text-primary-content font-mono font-bold text-sm px-3 py-1 mb-4">
      Counter.island.tsx
    </div>
    <p class="text-sm text-base-content/90">
      Your island source file
    </p>
  </div>
  <!-- DIRECTIONAL ARROWS: Massive and stark -->
  <div class="flex flex-col items-center justify-center gap-6 md:gap-16 text-neutral font-display">
    <!-- Desktop: Two arrows pointing to the two output blocks -->
    <span class="hidden md:block text-5xl leading-none">→</span>
    <span class="hidden md:block text-5xl leading-none">→</span>
    <!-- Mobile: Downward flow -->
    <span class="md:hidden text-5xl leading-none py-2">↓ ↓</span>
  </div>
  <!-- OUTCOME NODES: Thick dashed cut-outs -->
  <div class="flex flex-col gap-4">
    <!-- Output 1: SSR Module -->
    <div class="border-4 border-dashed border-neutral bg-base-200 p-5">
      <div class="mb-3">
        <span class="bg-neutral text-neutral-content font-mono font-bold text-sm px-2 py-1 inline-block">
          SSR Module
        </span>
      </div>
      <p class="text-sm text-base-content/90">
        Runs at build time. Renders the island to HTML on the server. Stored in-memory, and accessed during page rendering.
      </p>
    </div>
    <!-- Output 2: Client Bundle -->
    <div class="border-4 border-dashed border-neutral bg-base-200 p-5">
      <div class="mb-3">
        <span class="bg-neutral text-neutral-content font-mono font-bold text-sm px-2 py-1 inline-block">
          Counter-a1b2.js
        </span>
      </div>
      <p class="text-sm text-base-content/90">
        Client bundle. Put into <code>dist/islands/</code>. Loaded by the browser on demand.
      </p>
    </div>
  </div>
</div>

→ [compiler.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/compiler.js) · [registry.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/registry.js)

<aside class="alert">
  Islands can import CSS too. The build extracts each island's styles and injects them per-page - only CSS for islands actually rendered on a given page gets included.
</aside>


## THE INTERCEPTION

When `Bun.build` compiles your page, the `islandMarkerPlugin` intercepts every `.island.tsx` import. Instead of bundling the real component, it swaps in a lightweight stub that calls `renderMarker()`. Your page never ships the interactive component code. The Party has already arranged for it to be delivered separately, on demand.

### WHAT YOU WRITE

```jsx
import Counter from
  "./Counter.island.tsx";

export default function Page() {
  return (
    <Counter initialCount={5} />
  );
}
```

### WHAT IT COMPILES TO

```javascript
import { renderMarker } from
  "castro/islands/marker.js";

const Counter = (props) =>
  renderMarker(
    "components/Counter.island.tsx",
    props
  );

export default function Page() {
  return Counter({ initialCount: 5 });
}
```

→ [buildPlugins.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/buildPlugins.js)


## THE ASSEMBLY

`renderToString()` traverses the entire component tree in one synchronous pass - page, layout, and all. When it hits a marker stub, `renderMarker()` looks up the pre-loaded SSR module, renders the island to HTML, and wraps it in a `<castro-island>` element. HTML ships instantly. JavaScript loads on demand.


```html
<!DOCTYPE html>
<html>
  <head>
    <script type="importmap">
      { "imports": { "date-fns": "/vendor/date-fns.js?v=3.6.0", ... } }
    </script>
    <script type="module" src="/castro-island.js"></script>
  </head>
  <body>
    <h1>My Page</h1>
    <p>Static content renders instantly.</p>

    <!-- This is the island ↓ -->
    <castro-island
      directive="comrade:visible"
      import="/islands/Counter-a1b2.js"
      data-props='{"initialCount":5}'>
        <button>Count: 5</button>
    </castro-island>

  </body>
</html>
```

<aside class="alert">
  The <code>&lt;castro-island&gt;</code> custom element wraps server-rendered HTML. The <code>import</code> attribute points to the client JS bundle. The <code>directive</code> attribute controls when it hydrates.
</aside>

→ [marker.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/marker.js) · [renderPage.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/builder/renderPage.js)


## THE EXCEPTION

Not all interactivity goes through the island pipeline.`ClientScript` bypasses
it entirely — a plain function serialized via `.toString()` and injected as an
inline `<script>` IIFE at render time. No bundle, no hydration, no custom element.
```jsx
// At build time, this:
<ClientScript fn={initToggle} args={["theme", "dark", "light"]} />

// Becomes this in the HTML:
<script>(function initToggle(storageKey, dark, light) {
  // ... your function body
})("theme", "dark", "light")</script>
```

It's the right tool when you need to touch the DOM but don't need reactive
state — and it's a useful reminder that the island pipeline is opt-in, not
mandatory.

-----

<div class="flex flex-wrap gap-4">
  <a href="/how-it-works/hydration" class="not-prose c-btn c-btn-base">
    Next: Hydration →
  </a>
  <a href="/guide/quick-start" class="not-prose c-btn c-btn-base">
    Quick Start Guide →
  </a>
</div>
