# Castro

*An educational framework for understanding island architecture*

Castro is a working Static Site Generator that implements island architecture in ~1100 lines of well-commented, readable code. The communist theme makes it memorable. The architecture lessons are real.

**Learn by reading code, not documentation.**

> [!NOTE]
> Castro requires Bun 1.3.8+ to be installed on your env - [instructions](https://bun.com/docs/installation)

## What Is This?

Island architecture is how modern frameworks (Astro, Marko, Fresh, Qwik) achieve great performance. Instead of shipping JavaScript for your entire page, you selectively hydrate only the interactive components. The rest stays as static HTML.

Castro shows you exactly how this works by implementing it from scratch.

In essence, Castro splits the render tree **at build time** into:
1. static HTML
2. interactive islands (pre-rendered + hydrated on demand)

## What You'll Learn

Reading through Castro's codebase, you'll understand:

- **Island Architecture** - How to selectively hydrate components
- **SSR/SSG** - Build-time vs runtime rendering strategies
- **Progressive Enhancement** - Static HTML first, JavaScript on demand
- **Web Components** - Using custom elements as hydration boundaries
- **Build Tools** - How Bun's bundler compilation pipelines work
- **Dev Servers** - File watching, live reload via SSE
- **Plugin Systems** - Extensible architecture patterns

The code is extensively commented to explain not just *what* it does, but *why* and *how*.

## Quick Start

```bash
bun add @vktrz/castro preact
```

**Project structure:**
```
my-site/
├── pages/             # Your content (.md, .jsx, .tsx)
│   └── index.md
├── layouts/           # Page layouts (.jsx, .tsx)
│   └── default.jsx
└── components/        # Components (.jsx, .tsx)
    └── Button.jsx
    └── Button.island.jsx
```

**Component types:**
- By default, all `.{jsx,tsx}` files are static UI components, server-side only, no JS shipped to client
- Use `.island` suffix for when you need client-side interactivity, eg: `ComponentName.island.{jsx,tsx}`

**Add scripts to package.json:**
```json
{
  "scripts": {
    "dev": "castro",
    "build": "castro build"
  }
}
```

**Create a layout** (`layouts/default.jsx`):
```jsx
export default ({ title, children }) => (
  <html>
    <head>
      <title>{title}</title>
    </head>
    <body>{children}</body>
  </html>
);
```

**Create a page** (`pages/index.md`):
```markdown
---
title: My Site
---

# Hello World

This is static HTML. Fast to load, no JavaScript needed.
```

**Create reusable components** (`components/Button.jsx`):
```jsx
export function Button({ href, children }) {
  return <a href={href} className="btn">{children}</a>;
}
```

Import components in pages, layouts, or islands:
```jsx
import { Button } from "../components/Button.jsx";

export default function Home() {
  return (
    <div>
      <Button href="/about">Learn More</Button>
    </div>
  );
}
```

**Add an island** (`counter.island.tsx`):
```tsx
import { useState } from "preact/hooks";

export default function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use the island** in any `.jsx`/`.tsx` file:
```jsx
<Counter initialCount={5} />
```

Run `bun run dev` and visit `http://localhost:3000`.

## The Revolutionary Directives

While learning, you get communist-themed hydration directives:

- **`comrade:visible`** - Hydrate when scrolled into view (default)
  *"Only work when the people are watching"*

- **`lenin:awake`** - Hydrate immediately on page load
  *"The leader is always ready"*

- **`no:pasaran`** - Static render only, no JavaScript shipped
  *"They shall not pass (to the client)"*

These map to standard island patterns. The names just make them more memorable while learning.

Example usage:
```jsx
<Counter lenin:awake initialCount={6} />
```

## How It Works

1. **Build time**: Castro compiles your pages and islands
   - Pages → HTML
   - Islands have separate JS bundles
   - Islands are wrapped into an internal <castro-island> custom component which handles hydration (loads component's JS, makes it interactive) on the client

2. **Browser receives**: Pure HTML
   - Page loads instantly
   - No JavaScript executed yet

3. **Hydration triggers**: Based on directive
   - `comrade:visible`: (default) When scrolled into viewport
   - `lenin:awake`: Immediately
   - `no:pasaran`: Never (stays static)

4. **Island loads**: JavaScript downloaded and component becomes interactive

Result: Fast initial page load, progressive enhancement, minimal JavaScript.

## Why "Castro"?

Because learning complex architectural patterns should be memorable. The communist satire is a wrapper around serious educational code.

The framework is real. The performance benefits are real. The puns just make it stick while you read the implementation.

## Project Status

Castro is an educational project. It's a real, working framework that you can use, but the primary goal is teaching. Use it to:

- Learn how island architecture works internally
- Understand modern SSG compilation pipelines
- See Web Components as hydration boundaries
- Study a complete but minimal build tool

You can use it for small websites, personal blogs, etc. For larger projects with higher risks, consider [Astro](https://astro.build), [Fresh](https://fresh.deno.dev), or another framework of your liking.

## Documentation

The code is the documentation. Start reading from:

- `castro/src/cli.js` - Entry point
- `castro/src/builder/build-all.js` - Build orchestration
- `castro/src/islands/` - Island architecture implementation
- `castro/src/dev/server.js` - Development server

Every file has comments explaining the implementation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Requirements

- Bun 1.3.8+
- Preact 10+ (peer dependency)

## License

MIT - The people's license

---

*"From each component according to its complexity, to each page according to its needs."*
