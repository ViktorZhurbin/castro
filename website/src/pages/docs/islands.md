---
title: Islands - Castro Guide
description: Every component starts as static HTML. Islands are how you add interactivity for the parts that actually need it.
layout: docs
path: /docs/islands
---

# ISLANDS

Every component in Castro starts as static HTML. Islands are how you add interactivity for the parts that actually need it.

|                      | JS shipped                 | When to use                                   |
| -------------------- | -------------------------- | --------------------------------------------- |
| **Static component** | 0 bytes                    | Anything that doesn't need the DOM at runtime |
| **Island**           | Your code + Preact runtime | Reactive state, complex UI                    |

## THE HYDRATION LINE

Name a file `*.island.tsx` under `components/` and Castro treats it differently: server-rendered to static HTML at build time, then hydrated in the browser — attaching to that same HTML rather than replacing it. Islands are only discovered under `components/`; the same file elsewhere is a plain import and fails with `ISLAND_NOT_FOUND` at build time. You control exactly **when** hydration happens with a directive.

```tsx
// components/Counter.island.tsx
import { useState } from "preact/hooks";

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

```tsx
// pages/index.tsx
import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} comrade:patient />;
}
```

## DIRECTIVES

Three directives control when an island's JavaScript is fetched and hydrated. Pick one — carrying two on the same island is a build error.

### `comrade:visible` — the default

Hydrates when the element is within 100px of entering the viewport. Right for most islands: JavaScript loads only once the user actually reaches the component.

### `comrade:patient`

Hydrates after the browser goes idle (`requestIdleCallback`). For important but non-critical UI — loaded early, blocks nothing.

### `comrade:eager`

Hydrates immediately when the element mounts. For above-the-fold UI where interactivity can't wait.

## PROPS

Island props cross a real boundary: they're serialized with `JSON.stringify` at build time and read back with `JSON.parse` in the browser. Nothing validates that trip in either direction.

Stick to JSON primitives — strings, numbers, booleans, plain objects and arrays. Anything else is either coerced (a `Date` arrives as a string) or silently dropped (`undefined`, functions), and the server-rendered HTML won't match what the client hydrates with. `JSON.stringify` outright rejecting a value (a circular reference, a `BigInt`) is the one case Castro catches for you, at build time.

Islands also can't take children — including string children, which would survive the props round-trip anyway. Pass everything as props.

Next: [Quick Start →](/docs/quick-start) — project structure, layouts, pages · [Configuration →](/docs/config) — the full `castro.config.ts` reference
