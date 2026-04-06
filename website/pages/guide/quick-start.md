---
title: Quick Start - Castro Guide
layout: docs
path: /guide/quick-start
section: guide
---

# QUICK START

Mobilize a static site with interactive islands in under three minutes. Follow the state-approved blueprint.

## PREREQUISITES

Castro runs on [Bun](https://bun.sh) 1.3.8+. It uses Bun's build pipeline, markdown parser, YAML parser, and dev server. Node will not work here. The old ways have failed.

```bash
curl -fsSL https://bun.sh/install | bash  # takes ~10 seconds
```

## 1. INSTALLATION

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

## 2. PROJECT STRUCTURE

Castro follows a convention-over-configuration structure. There is no required config file - create the directories and start building.

```text
my-site/
├── layouts/          ← HTML shell components
├── pages/            ← one file = one output route
├── components/       ← shared UI
└── public/           ← assets copied directly to dist/
```

## 3. CREATE A LAYOUT

Layouts wrap your page content in standard HTML. `layouts/default.tsx` is the default layout.

<aside class="alert">
  Layouts and pages use Preact - Castro's engine for build-time rendering. No Preact ships to the browser unless you explicitly deploy an island. Layouts must use a <code>default export</code>.
</aside>

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

## 4. CREATE A PAGE

Pages live in `pages/`. Both `.tsx` and `.md` files are supported.

<aside class="alert">
  JSX pages require a <code>default export</code> for the component.
  <br />
  <br />
  The named <code>meta</code> export is optional - it allows to set page title, use a non-default layout, and pass any custom props to the layout.
</aside>

### TSX PAGE

```tsx
// pages/index.tsx
import type { PageMeta } from "@vktrz/castro";

// optional
export const meta: PageMeta = {
  title: "Home",
  layout: "special",
  // ...pass any props to the layout component
};

export default function Home() {
  return <h1>Hello, world!</h1>;
}
```

### MARKDOWN PAGE

```markdown
---
title: About
layout: special
---

# About

This page renders from Markdown. Every `.md` file in `pages/` becomes an HTML route.
```

## 5. ADD COMPONENTS

Shared UI lives in `components/`. A regular `.tsx` component is server-rendered at build time and shipped to the browser as plain HTML.

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

## 6. ADD AN ISLAND

You only need an island when a component requires client-side interactivity. Name it `*.island.tsx` - it gets pre-rendered at build time and hydrated in the browser.

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

Use it in a page with a directive - the directive controls when the island's JavaScript loads:

```tsx
import Counter from "../components/Counter.island.tsx";

export default function Home() {
  return (
    <div>
      <h1>My Site</h1>

      {/* comrade:patient waits for browser idle time before hydrating */}
      <Counter initial={5} comrade:patient />
    </div>
  );
}
```

For details on islands, directives, and alternative frameworks see [Components & Islands →](/guide/components-islands)

## 7. CONFIGURATION (OPTIONAL)

Castro works without config. When you need it, see [Configuration →](/reference/config)

## 8. RUN IT

```bash
bun run dev      # dev server at http://localhost:3000
bun run build    # production build → dist/
```

The dev server watches for changes and reloads automatically. The build produces static HTML in `dist/` ready to be distributed to the masses.

## WHAT'S NEXT

<div class="flex flex-wrap gap-4">
  <a href="/guide/components-islands" class="btn btn-outline btn-primary">
    Components & Islands →
  </a>
  <a href="/reference/config" class="btn btn-outline btn-primary">
    Configuration →
  </a>
</div>
