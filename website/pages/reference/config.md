---
title: Configuration - Castro Reference
layout: docs
path: /reference/config
section: reference
---

# CONFIGURATION

Castro works without any config file. When you need to customize behavior, create `castro.config.js` at your project root.

```typescript
type CastroConfig = {
  port?: number;
  messages?: "satirical" | "serious";
  plugins?: CastroPlugin[];
  importMap?: Record<string, string>;
  clientDependencies?: string[];
}
```

→ [config.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/config.js)



## Example

Tailwind plugin, port 4123, serious messages:

```javascript
import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [tailwind({ input: "styles/app.css" })],
  port: 4123,
  messages: "serious",
};
```

→ [website/castro.config.js](https://github.com/ViktorZhurbin/castro/blob/main/website/castro.config.js)


## REFERENCE

### `port`

`port?: number` - default: `3000`

The port the dev server listens on. 3000 is the default. The Party has no strong feelings about this.


### `messages`

`messages?: "satirical" | "serious"` - default: `"satirical"`

Controls CLI output tone. "satirical" wraps build output in communist bureaucracy humor. "serious" delivers the same information without the ideology. Both are equally correct. Only one is more fun.


### `plugins`

`plugins?: CastroPlugin[]` - default: `[]`

Plugins hook into the build pipeline to inject assets, run processors, and register custom island frameworks. See [Plugin API →](/reference/plugin-api).


### `clientDependencies`

`clientDependencies?: string[]` - default: `[]`

A list of NPM packages to be pre-bundled and shared across all islands.

By default, each island bundles its own copy of every dependency it uses. If multiple islands use the same package, you get duplicate code. Adding a package to `clientDependencies` extracts it into a single, shared `/vendor/filename.js` file that all islands reference via the import map.

Example: if five islands use `date-fns`, instead of bundling it five times:

```javascript
// castro.config.js
export default {
  clientDependencies: ["date-fns"],
};
```

Now `date-fns` is bundled once and shared. Works for exact package names only - if you need subpath routing (e.g., `@mui/material/Button`, `@mui/material/Popper`), use `importMap` instead.


### `importMap`

`importMap?: Record<string, string>` - default: `{}`

A map of import specifiers to URLs. Use it to override plugin-generated import map entries - for example, swapping a vendored URL for a CDN, or providing custom versions of packages.

When you need wildcard routing for subpaths like `@mui/material/Button`, `@mui/material/Popper`, etc., add them here:

```javascript
// castro.config.js
export default {
  importMap: {
    "@mui/material/": "https://esm.sh/@mui/material/"
  }
};
```

User-provided entries override plugin-generated entries on pages with islands. They have no effect on purely static pages.

-----

<div class="flex flex-wrap gap-4">
  <a href="/reference/plugin-api" class="btn-doc-next">
    Plugin API →
  </a>
</div>
