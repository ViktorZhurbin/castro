---
title: Quick Start - Castro Guide
layout: docs
path: /guide/quick-start
section: guide
---

# QUICK START

Mobilize a static site with interactive islands in under three minutes. Follow the state-approved blueprint.

## PREREQUISITES

Castro runs on Bun 1.3.8+, so you'd need to [install](https://bun.sh) it. It uses Bun's build pipeline, markdown parser, YAML parser, and dev server. Node will not work here. The old ways have failed.


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

Layouts wrap your page content in standard HTML. `layouts/default.tsx` is the required default.

<aside class="alert">
  Layouts and pages use Preact - Castro's engine for build-time rendering. No Preact ships to the browser unless you explicitly deploy an island.
  <br/>
  <br/>
  Layouts must use a <code>default export</code>.
</aside>

Each layout receives `children` prop which is a page content. You can pass other props from page components (see below).

```tsx
import type { ComponentChildren } from "preact";

// layout props come from pages
interface Props {
  children: ComponentChildren; // page content, automatic
  // props from a page ↓
  title: string;
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

### TSX PAGE

```tsx
// pages/index.tsx

// optional, pass any props to the layout component
export const meta = {
  title: "Home",
  layout: "special",
  // ...any other props
};

export default function Home() {
  return <h1>Hello, world!</h1>;
}
```

<aside class="alert">
  JSX pages require a <code>default export</code> for the component.
</aside>

The named <code>meta</code> export is optional - it allows to pass any custom props to the layout, or use a non-default layout. In Markdown, `frontmatter` serves the same purpose:

### MARKDOWN PAGE

```markdown
---
title: About
layout: special
---

# About

Every `.md` file in `pages/` becomes an HTML route.

This page would use a layout defined in `layouts/special.tsx`
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

<div class="flex flex-wrap gap-4 mt-6">
  <a href="/guide/components-islands" class="not-prose c-btn c-btn-base">COMPONENTS & ISLANDS →</a>
  <a href="/reference/config" class="not-prose c-btn c-btn-base">CONFIGURATION →</a>
</div>
