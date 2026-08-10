---
title: Quick Start - Castro Guide
layout: docs
---

# QUICK START

Mobilize a static site with interactive islands in under three minutes.

## PREREQUISITES

Castro runs on **Bun 1.3.14+** — [install it](https://bun.sh) first. It uses Bun's build pipeline, dev server, and Markdown/YAML parsers. Node will not work here.

## SCAFFOLD

```sh
bunx create-castro
cd my-castro-site
bun run dev
```

That's a working project at `http://localhost:3000`.

## PROJECT STRUCTURE

Castro follows convention over configuration — no required config file, just directories:

```text
my-site/
├── layouts/          ← HTML shell components
├── pages/             ← one file = one output route
├── components/        ← shared UI
└── public/             ← assets copied directly to dist/
```

## LAYOUTS

`layouts/default.tsx` is required — it wraps every page unless a page sets a different one. A layout receives `children` (the page content, a VNode — not a rendered string) plus whatever props the page passes through its `meta` export.

```tsx
import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  title: string;
}

export default function DefaultLayout({ title, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>{title}</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

Add more layouts under `layouts/` and select one per page via `meta.layout` — the value is the path under `layouts/` with the extension stripped, so `layouts/docs.tsx` is `"docs"`.

## PAGES

Pages live in `pages/`. Both `.tsx` and `.md` files work.

### TSX pages

```tsx
// pages/index.tsx
export const meta = {
  title: "Home",
  // layout: "docs", // optional, defaults to "default"
};

export default function Home() {
  return <h1>Hello, world!</h1>;
}
```

The `meta` export is optional. It's passed to the layout alongside `children`.

### Markdown pages

```markdown
---
title: About
---

# About

Every `.md` file in `pages/` becomes an HTML route. Frontmatter fills the same role as `meta` in a `.tsx` page.
```

## COMPONENTS

Shared UI lives in `components/`. A regular `.tsx` component is server-rendered at build time and shipped as plain HTML — no JavaScript.

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

For interactive components, see [Islands →](/docs/islands).

## CONFIGURATION (OPTIONAL)

Castro works without a config file. When you need one, see [Configuration →](/docs/config).

## RUN IT

```sh
bun run dev      # dev server at http://localhost:3000
bun run build    # production build → dist/
```

The dev server watches for changes and reloads automatically. `bun run build` produces static HTML in `dist/`, ready to deploy anywhere that serves files.

## WHAT'S NEXT

- [Islands →](/docs/islands) — interactive components and hydration directives
- [Configuration →](/docs/config) — the full `castro.config.ts` reference
