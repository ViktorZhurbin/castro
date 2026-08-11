---
title: Quick Start - Castro Guide
description: Mobilize a static site with interactive islands in under three minutes.
layout: docs
path: /docs/quick-start
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

`create-castro` prompts for a project name (Enter accepts `my-castro-site`) and installs dependencies for you. That's a working project at `http://localhost:3000`.

## PROJECT STRUCTURE

Castro follows convention over configuration — no required config file, just directories:

```text
my-site/
├── layouts/          ← HTML shell components
├── pages/             ← one file = one output route
├── components/        ← shared UI
├── public/             ← assets copied directly to dist/
└── castro.config.ts    ← optional, see Configuration below
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

The `meta` export is optional. It's passed to the layout alongside `children`, and if it has no `title`, one is derived from the filename.

### Markdown pages

```markdown
---
title: About
---

# About

Some text.
```

Every `.md` file in `pages/` becomes an HTML route. Frontmatter fills the same role as `meta` in a `.tsx` page.

## ROUTING

Each page's route is derived from its path under `pages/`:

- `pages/index.tsx` → `/`
- `pages/blog.tsx` → `/blog`
- `pages/blog/index.tsx` → `/blog` — `index` files collapse into their parent directory's route

Files and directories prefixed with `_` are skipped entirely — they're not built and don't get a route. Use this for drafts or private helpers, e.g. `pages/_drafts/`, `pages/_partial.tsx`.

Two pages that resolve to the same route — `pages/blog.tsx` and `pages/blog/index.tsx`, for instance — fail the build with a route conflict rather than silently picking one.

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

<div class="docs-nav">
  <a href="/docs/islands" role="button" class="docs-nav-next">Next: Islands →</a>
</div>
