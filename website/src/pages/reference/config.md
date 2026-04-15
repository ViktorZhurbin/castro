---
title: Configuration - Castro Reference
layout: docs
path: /reference/config
section: reference
---

# CONFIGURATION

Castro works without any config file. When you need to customize behavior, create `castro.config.ts` at your project root.

```typescript
type CastroConfig = {
  port?: number;
  messages?: "satirical" | "serious";
  srcDir?: string;
  plugins?: CastroPlugin[];
  importMap?: Record<string, string>;
  clientDependencies?: string[];
  markdown?: { options?: Bun.markdown.Options };
}
```

→ [config.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/config.js)



## Example

Tailwind plugin, port 4123, serious messages:

```typescript
import { defineConfig } from "@vktrz/castro";
import { tailwind } from "@vktrz/castro-tailwind";

export default defineConfig({
  plugins: [tailwind({ input: "styles/app.css" })],
  port: 4123,
  messages: "serious",
});
```

`defineConfig` is an identity function — it returns the config object unchanged. Its only job is to give you type inference in `.ts` files and editor autocomplete in `.js` files.

You can use a JSDoc type hint as well:

```javascript
// castro.config.js
/** @type {import("@vktrz/castro").CastroConfig} */
export default {
  port: 4123,
  messages: "serious",
};
```


## REFERENCE

### `port`

`port?: number` - default: `3000`

The port the dev server listens on. 3000 is the default. The Party has no strong feelings about this.


### `messages`

`messages?: "satirical" | "serious"` - default: `"satirical"`

Controls CLI output tone. "satirical" wraps build output in communist bureaucracy humor. "serious" delivers the same information without the ideology. Both are equally correct. Only one is more fun.


### `srcDir`

`srcDir?: string` - default: `"."`

Groups `pages/`, `layouts/`, and `components/` under a single directory. Useful once your project root gets cluttered.

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  srcDir: "src",
});
```

The output is identical either way — paths in `dist/` are always relative to the project root, not to `srcDir`. `public/` stays at the project root regardless.


### `plugins`

`plugins?: CastroPlugin[]` - default: `[]`

Plugins hook into the build pipeline to inject assets, run processors, and register custom island frameworks. See [Plugin API →](/reference/plugin-api).


### `clientDependencies`

`clientDependencies?: string[]` - default: `[]`

A list of NPM packages to be pre-bundled and shared across all islands.

By default, each island bundles its own copy of every dependency it uses. If multiple islands use the same package, you get duplicate code. Adding a package to `clientDependencies` extracts it into a single, shared `/vendor/filename.js` file that all islands reference via the import map.

Example: if five islands use `date-fns`, instead of bundling it five times:

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  clientDependencies: ["date-fns"],
});
```

Now `date-fns` is bundled once and shared. Works for exact package names only - if you need subpath routing (e.g., `@mui/material/Button`, `@mui/material/Popper`), use `importMap` instead.


### `importMap`

`importMap?: Record<string, string>` - default: `{}`

A map of import specifiers to URLs. Use it to override plugin-generated import map entries - for example, swapping a vendored URL for a CDN, or providing custom versions of packages.

When you need wildcard routing for subpaths like `@mui/material/Button`, `@mui/material/Popper`, etc., add them here:

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  importMap: {
    "@mui/material/": "https://esm.sh/@mui/material/",
  },
});
```

User-provided entries override plugin-generated entries on pages with islands. They have no effect on purely static pages.


### `markdown`

`markdown?: { options?: Bun.markdown.Options }` - default: `{}`

Castro is using `Bun.markdown.html` to render `.md` pages. `markdown.options` is passed to it as-is as the second parameter. It allows to render heading anchors, tables, and other syntax extensions.

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  markdown: {
    options: { headings: true },
  },
});
```

See [Bun's Markdown documentation](https://bun.sh/docs/runtime/markdown) for the full list of options.

-----

<div class="btn-group">
  <a href="/reference/plugin-api" class="btn btn-base">
    Plugin API →
  </a>
</div>
