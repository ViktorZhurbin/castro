---
title: Plugin API - Castro Reference
layout: docs
path: /reference/plugin-api
section: reference
---

# PLUGIN API

Complete API reference for `CastroPlugin`. For usage examples, see [Plugins →](/guide/plugins).

```typescript
type CastroPlugin = {
  name: string;
  getPageAssets?: (params?: { hasIslands?: boolean }) => Asset[];
  getImportMap?: (context: { usedFrameworks: Set<string> }) => ImportsMap;
  onPageBuild?: () => Promise<void>;
  onAfterBuild?: (context: { usedFrameworks: Set<string> }) => Promise<void>;
  watchDirs?: string[];
  frameworkConfig?: FrameworkConfig;
};
```

→ [plugins.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/islands/plugins.js) · [types.d.ts](https://github.com/ViktorZhurbin/castro/blob/main/core/src/types.d.ts) · [frameworks/](https://github.com/ViktorZhurbin/castro/tree/main/core/src/islands/frameworks) · [castro-jsx/](https://github.com/ViktorZhurbin/castro/tree/main/packages/castro-jsx)


### `name`

**Required.** A unique identifier for the plugin, used in error messages.


### `getPageAssets`

Called once per page. Returns an array of `Asset` objects to inject into the page's `<head>`. Receives `hasIslands` so plugins can conditionally inject assets only on pages that use islands.

```typescript
getPageAssets?(params?: { hasIslands?: boolean }): Asset[]
```

Use this to inject stylesheets, scripts, or framework-specific hydration code conditionally. For example, only include a framework's hydration script on pages that actually use that framework's islands.


### `getImportMap`

Called once per page that has islands. Returns an `ImportsMap` object mapping import specifiers to URLs. Plugins use this to dynamically generate entries based on which frameworks are actually used.

```typescript
getImportMap?(context: { usedFrameworks: Set<string> }): ImportsMap
```

For example, the `vendorDependencies` plugin uses this to map framework package names to vendored URLs with cache-busting query strings like `/vendor/preact.js?v=10.28.3`. Only frameworks actually used on the page get import map entries.


### `onPageBuild`

Called before pages are built. In dev mode, runs on every file change (page, layout, or component).

```typescript
onPageBuild?(): Promise<void>
```

Use this for preprocessing steps like compiling CSS, copying static assets, or generating data files.


### `onAfterBuild`

Runs after all pages are built. Receives build context for conditional work.

```typescript
onAfterBuild?(context: { usedFrameworks: Set<string> }): Promise<void>
```

Use it for post-build tasks like bundling files to disk (e.g., vendoring dependencies). The `usedFrameworks` set tells you which frameworks were actually used across all pages, so you can skip bundling unused frameworks.


### `watchDirs`

An array of directories (relative to project root) to watch in dev mode. When any file in a watched directory changes, `onPageBuild()` is called and the browser reloads.

```typescript
watchDirs?: string[]
```

Example: if your plugin compiles CSS from a custom `src/` directory, add `watchDirs: ["src"]` so changes to `src/**/*.css` trigger a rebuild.


### `frameworkConfig`

Registers a framework to use in islands. This is how Castro's plugin architecture
earns its keep - the same interface that ships Preact is available to anyone.

```typescript
frameworkConfig?: FrameworkConfig
```

See [frameworks/](https://github.com/ViktorZhurbin/castro/tree/main/core/src/islands/frameworks) for built-in configs, and [castro-jsx](https://github.com/ViktorZhurbin/castro/tree/main/packages/castro-jsx) as an example of an external framework plugin.


### `Asset` Type

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

<div class="btn-group">
  <a href="/reference/config" class="btn btn-base">
    ← Configuration
  </a>
</div>
