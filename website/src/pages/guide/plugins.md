---
title: Plugins - Castro Guide
layout: docs
path: /guide/plugins
---

# PLUGINS

The Party approves extensions. Plugins hook into Castro's build pipeline to inject assets, process files, and register new island frameworks - keeping the core small while the ecosystem grows.

For the complete plugin API reference, see [Plugin API →](/reference/plugin-api).


## Using a Plugin

Add plugins to the `plugins` array in `castro.config.ts`:

```typescript
import { defineConfig } from "@vktrz/castro";
import { castroJsx } from "@vktrz/castro-jsx";
import { tailwind } from "@vktrz/castro-tailwind";

export default defineConfig({
  plugins: [castroJsx(), tailwind({ input: "styles/app.css" })],
});
```


## BUILDING A PLUGIN

A plugin is a plain object with named hooks that run at specific points in the build pipeline. The `@vktrz/castro-tailwind` plugin is a real-world example — it compiles CSS before every build and auto-injects the `<link>` tag into each page:

```javascript
import { basename, dirname } from "node:path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

export function tailwind({ input }) {
  const processor = postcss([tailwindcss()]);

  return {
    name: "castro-tailwind",
    watchDirs: [dirname(input)],

    async onPageBuild() {
      const source = await Bun.file(input).text();
      const result = await processor.process(source, { from: input });

      await Bun.write(`dist/${basename(input)}`, result.css);
    },

    getPageAssets() {
      return [
        {
          tag: "link",
          attrs: { rel: "stylesheet", href: `/${basename(input)}` }
        },
      ];
    },
  };
}
```

`onPageBuild` re-compiles on every change. `getPageAssets` injects the result into every page's `<head>`. `watchDirs` connects the two — without it, CSS changes wouldn't trigger a rebuild in dev mode.

That's the full plugin. For complete plugin examples see [packages/](https://github.com/ViktorZhurbin/castro/tree/main/packages).

-----

<div class="btn-group">
  <a href="/guide/components-islands" class="btn btn-base">
    ← Components & Islands
  </a>
  <a href="/reference/plugin-api" class="btn btn-base">
    Plugin API →
  </a>
</div>

