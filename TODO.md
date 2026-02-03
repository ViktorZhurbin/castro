# Roadmap

## Restructure 

```sh
src/
├── cli.js
├── constants.js
├── build/                 # Was "builder" - The Build Lifecycle
│   ├── index.js           # (was builder.js) The orchestrator
│   ├── pages.js           # MERGED: page-base, page-jsx, page-markdown
│   ├── renderer.js        # (was render-page-vnode.js)
│   ├── writer.js          # MERGED: page-writer, inject-assets, write-css
│   └── compiler.js        # MERGED: compile-jsx + island-tagging-plugin
├── islands/               # Domain: Interactive Components
│   ├── registry.js        # MERGED: islands.js + loadIslands.js
│   ├── compiler.js        # (Specific to island compilation)
│   ├── plugins.js         # MERGED: plugins.js + preact-plugin + runtime-plugin
│   ├── hydration.js       # (Client-side code)
│   └── wrapper.js         # (Runtime interception)
├── layouts/               # Domain: Layouts
│   └── registry.js        # MERGED: layouts.js + loadLayouts.js
├── dev/
├── messages/
└── utils/
```

## Support CSS modules

Maybe it already works, thanks to esbuild.

## npx castro create

- `npx castro create` CLI command to scaffold new projects

### Implement "getStaticPaths"?

If I want to generate a blog from an API, I currently have to write a script to generate `.md` files. Allowing a page to export `export async function getPaths() { ... }` (like Next.js `getStaticPaths`) would be a massive level-up.

Steal the `getStaticPaths` concept from Next.js/Astro. Allow a single `.tsx` file to generate multiple `.html` pages based on data. This moves Castro from "Toy" to "CMS-capable."

May involve some routing changes.
