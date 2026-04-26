---
title: Quick Start - Castro Guide
layout: docs
path: /build/quick-start
---

# QUICK START


Mobilize a static site with interactive islands in under three minutes. Follow the state-approved blueprint.

## PREREQUISITES

Castro runs on **Bun 1.3.8+**, so you'd need to [install](https://bun.sh) it. It uses Bun's build pipeline, dev server, Markdown and YAML parsers. Node will not work here. The old ways have failed.

## SCAFFOLD (RECOMMENDED)

The fastest way to start:

```sh
bunx create-castro
```

This creates a new directory with a working Castro project and runs `bun install`. Then:

```sh
cd my-castro-site
bun run dev
```


## DETAILS & MANUAL SETUP


### 1. INSTALLATION

```sh
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

### 2. PROJECT STRUCTURE

Castro follows a convention-over-configuration structure. There is no required config file - create the directories and start building.

```text
my-site/
├── layouts/          ← HTML shell components
├── pages/            ← one file = one output route
├── components/       ← shared UI
└── public/           ← assets copied directly to dist/
```

### 3. CREATE A LAYOUT

Layouts wrap your page content. `layouts/default.tsx` is required - it automatically wraps every page. You can add more layouts and use them by setting the file name in `meta.layout` in page file (see below).

<aside class="alert">
  Layouts and pages use Preact - Castro's engine for build-time rendering. No Preact ships to the browser unless you use a Preact island on the page (see <a href="/build/components-islands">Components & Islands</a>).
  <br/>
  <br/>
  Layouts must use a <code>default export</code>.
</aside>

Each layout receives `children` prop which is a page content. You can pass other props from pages.

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

### 4. CREATE A PAGE

Pages live in `pages/`. Both `.tsx` and `.md` files are supported.

#### TSX PAGE

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

The named <code>meta</code> export is optional - it allows to pass any custom props to the layout. It also allows to use a non-default layout - `meta.layout: string`. Or no layout at all - `meta.layout: "none" | false`.

In Markdown, `frontmatter` serves the same purpose:

#### MARKDOWN PAGE

```markdown
---
title: About
layout: none
---

# About

Every `.md` file in `pages/` becomes an HTML route.

This page would use a layout defined in `layouts/special.tsx`
```

### 5. ADD COMPONENTS

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

### 6. ADD AN ISLAND

New to island architecture? [Start here](/concept/island-architecture).

Name an island file `*.island.tsx` — it gets pre-rendered at build time and hydrated in the browser.

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

For details on islands, directives, and alternative frameworks see [Components & Islands →](/build/components-islands)

### 7. CONFIGURATION (OPTIONAL)

Castro works without config. When you need it, see [Configuration →](/reference/config)

### 8. RUN IT

```sh
bun run dev      # dev server at http://localhost:3000
bun run build    # production build → dist/
```

The dev server watches for changes and reloads automatically. The build produces static HTML in `dist/` ready to be distributed to the masses.

### WHAT'S NEXT

<div class="btn-group">
  <a href="/build/components-islands" class="btn btn-base">COMPONENTS & ISLANDS →</a>
  <a href="/reference/config" class="btn btn-base">CONFIGURATION →</a>
</div>
