---
title: Configuration - Castro Guide
layout: docs
---

# CONFIGURATION

Castro works without any config file. When you need to customize behavior, create `castro.config.ts` at your project root.

```typescript
type CastroConfig = {
  port?: number;
  srcDir?: string;
  markdown?: { options?: Bun.markdown.Options };
  clientDependencies?: string[];
};
```

→ [config.js](https://github.com/ViktorZhurbin/castro/blob/main/core/src/config.js), [types.d.ts](https://github.com/ViktorZhurbin/castro/blob/main/core/src/types.d.ts)

## EXAMPLE

Serve on port 4123 with GFM tables enabled:

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  port: 4123,
  markdown: { options: { tables: true } },
});
```

`defineConfig` is an identity function — it returns the config object unchanged. Its only job is type inference in `.ts` files and editor autocomplete in `.js` files. A JSDoc hint works too:

```javascript
// castro.config.js
/** @type {import("@vktrz/castro").CastroConfig} */
export default {
  port: 4123,
};
```

## REFERENCE

### `port`

`port?: number` — default: `3000`

The port the dev server listens on.

### `srcDir`

`srcDir?: string` — default: `"."`

Groups `pages/`, `layouts/`, and `components/` under a single directory. Useful once your project root gets cluttered.

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  srcDir: "src",
});
```

Output is identical either way — paths in `dist/` are always relative to the project root, not to `srcDir`. `public/` stays at the project root regardless.

### `markdown`

`markdown?: { options?: Bun.markdown.Options }` — default: `{}`

Castro renders `.md` pages with `Bun.markdown.html`. `markdown.options` is passed through as-is — it enables heading anchors, tables, and other syntax extensions.

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  markdown: {
    options: { headings: true },
  },
});
```

See [Bun's Markdown documentation](https://bun.sh/docs/runtime/markdown) for the full list of options.

### `clientDependencies`

`clientDependencies?: string[]` — default: `[]`

Extra npm packages to vendor to `/dist/vendor/` and share across islands via an import map, e.g. `["@preact/signals"]`. Anything not listed here gets bundled into each island's own bundle instead of shared.

```typescript
import { defineConfig } from "@vktrz/castro";

export default defineConfig({
  clientDependencies: ["@preact/signals"],
});
```

## WHAT'S NEXT

- [Quick Start →](/docs/quick-start) — project structure, layouts, pages
- [Islands →](/docs/islands) — interactive components and hydration directives
