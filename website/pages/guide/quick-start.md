---
title: Quick Start — Castro Guide
layout: docs
path: /guide/quick-start
section: guide
---

# QUICK START

Build a static site with interactive islands in a few minutes.

## PREREQUISITES

Castro runs on [Bun](https://bun.sh) 1.3.8+. It uses Bun's build pipeline, markdown parser, YAML parser, and dev server — Node won't work. If you don't have it:

```bash
curl -fsSL https://bun.sh/install | bash  # takes ~10 seconds
```

-----

## INSTALL

```bash
mkdir my-site && cd my-site
bun init -y
bun add @vktrz/castro
```

Add the build and dev scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "castro dev",
    "build": "castro build"
  }
}
```

-----

## PROJECT STRUCTURE

Castro follows a convention-over-configuration structure. There is no required config file — create the directories and start building.

```text
my-site/
├── layouts/          ← HTML shell components
├── pages/            ← one file = one output page
├── components/       ← shared components (not pages)
├── public/           ← copied to dist/ as-is
└── castro.config.js  ← optional
```

-----

## CREATE A LAYOUT

Layouts wrap your page content. The default layout is loaded automatically. Create `layouts/default.tsx`:

```tsx
import type { VNode } from "preact";

interface Props {
  title: string;
  children: VNode;
}

export default function DefaultLayout({ title, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

<aside class="alert">
  Layouts and pages always use Preact — it's Castro's rendering engine at build time. Preact is never shipped to the browser unless you have Preact islands.
</aside>

<aside class="alert">
  Layouts must use a default export — the build pipeline loads <code>layoutModule.default</code>. It receives <code>title</code> (from page meta or filename), <code>children</code> (the page content), and any other fields from the page's <code>meta</code> export — all spread in by the build pipeline.
</aside>

-----

## CREATE A PAGE

Pages live in `pages/`. Both `.tsx` and `.md` files are supported.

<aside class="alert">
  Pages require a default export (the component function). The named <code>meta</code> export is optional — it sets <code>title</code>, <code>layout</code>, and any custom fields passed to the layout.
</aside>

### TSX PAGE

```tsx
// pages/index.tsx
import type { PageMeta } from "@vktrz/castro";

export const meta: PageMeta = {
  title: "Home",
};

export default function Home() {
  return <h1>Hello, world!</h1>;
}
```

### MARKDOWN PAGE

```markdown
---
title: About
---

# About

This page renders from Markdown. Every `.md` file in `pages/` becomes an HTML page.
```

-----

## ADD COMPONENTS

Shared UI lives in `components/`. A regular `.tsx` component is server-rendered at build time — no JavaScript sent to the browser, no hydration, just HTML.

```tsx
// components/Card.tsx
export function Card({ title, body }: { title: string; body: string }) {
  return (
    <div class="card">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
```

Import and use it in any page — it renders to static HTML, nothing more.

-----

## ADD AN ISLAND

You only need an island when a component requires client-side interactivity. Name it `*.island.tsx` — it gets pre-rendered at build time and hydrated in the browser.

```tsx
// components/Counter.island.tsx
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Use it in a page with a directive — the directive controls when the island's JavaScript loads:

```tsx
import Counter from "../components/Counter.island.tsx";

export default function Home() {
  return (
    <div>
      <h1>My Site</h1>
      <Counter initial={5} comrade:patient />
    </div>
  );
}
```

For details on islands, client directives and frameworks see [Components & Islands →](https://www.google.com/search?q=/guide/components-islands)

-----

## RUN IT

```bash
bun run dev      # dev server at http://localhost:3000
bun run build    # production build → dist/
```

The dev server watches for file changes and reloads the browser automatically. The build produces static HTML in `dist/` ready to deploy anywhere.

-----

## CONFIGURATION

Castro works without any config file. When you need to customize behavior, create `castro.config.js` at your project root.

```javascript
// castro.config.js
export default {
  port: 3000,
  messages: "satirical",
  plugins: [],
  importMap: {},
};
```

→ [config.js](https://github.com/ViktorZhurbin/castro/blob/main/castro/src/config.js)

### `port`

`port?: number` — default: `3000`. The port the dev server listens on.

### `messages`

`messages?: "satirical" | "serious"` — default: `"satirical"`. Controls CLI output tone. Both contain the same information.

### `plugins`

`plugins?: CastroPlugin[]` — default: `[]`. Plugins hook into the build pipeline to inject assets, run processors, and register custom island frameworks. See [Plugins](https://www.google.com/search?q=/guide/plugins).

### `importMap`

`importMap?: Record<string, string>` — default: `{}`. Additional entries merged into the `<script type="importmap">` on every island page.

```javascript
importMap: {
  "my-lib": "https://esm.sh/my-lib@1.0.0",
  "preact": "https://some-cdn.sh/preact@10.0.0"
}
```

`import X from "my-lib"` will be treated as external during island compilation — the browser loads it from CDN instead of bundling. It also allows to override default CDN links - for example, to use a different CDN for Preact.

-----

This website's own config — Tailwind plugin, port 3000, satirical messages:

```javascript
import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [tailwind({ input: "styles/app.css" })],
  port: 3000,
  messages: "satirical",
};
```

→ [website/castro.config.js](https://github.com/ViktorZhurbin/castro/blob/main/website/castro.config.js)

-----

## WHAT'S NEXT

<div class="flex flex-wrap gap-4">
  <a
    href="/guide/components-islands"
    class="btn btn-outline btn-primary"
  >
    Components & Islands →
  </a>
  <a href="/guide/plugins" class="btn btn-outline btn-primary">
    Plugins →
  </a>
</div>
