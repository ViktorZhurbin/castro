---
title: Plugins — Castro Guide
layout: docs-markdown
path: /guide/plugins
section: guide
---

# PLUGINS

Plugins hook into Castro's build pipeline to inject assets, process files, and register new island frameworks.

---

## Plugin Interface

```typescript
type CastroPlugin = {
  name: string;
  getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
  onPageBuild?: () => Promise<void>;
  watchDirs?: string[];
  frameworkConfig?: FrameworkConfig;
};
```

### `name`

**Required.** A unique identifier for the plugin, used in error messages.

### `getPageAssets`

Called once per page render. Returns an array of `Asset` objects to inject into the page's `<head>`. Receives `hasIslands` so plugins can conditionally inject assets only on pages that use islands — see [Hydration](/how-it-works/hydration) for how Castro decides which pages need client JS.

### `onPageBuild`

Called before pages are built. In dev mode, runs on every file change (page, layout, or component). Use this for preprocessing steps like compiling CSS, copying static assets, or generating data files.

### `watchDirs`

An array of directories (relative to project root) to watch in dev mode. When any file in a watched directory changes, `onPageBuild()` is called and the browser reloads.

### `frameworkConfig`

Registers a framework to use in islands.

See [frameworks/](https://github.com/ViktorZhurbin/castro/tree/main/castro/src/islands/frameworks) for built-in configs, and [castro-jsx](https://github.com/ViktorZhurbin/castro/tree/main/packages/castro-jsx) as an example of an external config.

→ [plugins.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/islands/plugins.js) · [types.d.ts](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/types.d.ts) · [frameworks/](https://github.com/ViktorZhurbin/castro/tree/main/castro/src/islands/frameworks) · [castro-jsx/](https://github.com/ViktorZhurbin/castro/tree/main/packages/castro-jsx)

-----

## Using a Plugin

Add plugins to the `plugins` array in `castro.config.js`:

```javascript
import { castroJsx } from "@vktrz/castro-jsx";
import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [castroJsx(), tailwind({ input: "styles/app.css" })],
};
```

See [packages/](https://github.com/ViktorZhurbin/castro/tree/main/packages) for full plugin examples.

-----

## `Asset` Type

`getPageAssets()` returns `Asset[]`. An asset is either a raw HTML string or a structured tag definition:

```typescript
type Asset =
  | string
  | {
      tag: string;
      attrs?: Record<string, string | boolean>;
      content?: string;
    };
```

**Examples:**

```javascript
// Structured tag: produces <link rel="stylesheet" href="/app.css">
{ tag: "link", attrs: { rel: "stylesheet", href: "/app.css" } }

// Structured tag with content: produces <script>...</script>
{ tag: "script", content: "console.log('hello')" }

// Inline style: produces <style>...</style>
{ tag: "style", content: ":root { --brand: red }" }

// Boolean attr: produces <script type="module" defer src="/app.js">
{ tag: "script", attrs: { type: "module", defer: true, src: "/app.js" } }

// Raw string: injected as-is (useful for frameworks like Solid
// that provide their own generateHydrationScript())
"<script>/* raw hydration script */</script>"
```

-----

<div class="flex flex-wrap gap-4">
  <a
    href="/guide/components-islands"
    class="btn btn-outline btn-primary"
  >
    ← Components & Islands
  </a>
  <a href="/how-it-works" class="btn btn-outline btn-primary">
    How It Works →
  </a>
</div>

