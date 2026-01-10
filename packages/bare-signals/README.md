# Bare Signals

Primitive implementation of reactive signals inspired by [Solid.js](https://github.com/solidjs/solid/blob/main/packages/solid/src/reactive/signal.ts).

Built as a learning project to understand how fine-grained reactivity works under the hood.

## Core Concepts

**Signals** - Reactive values with automatic dependency tracking
**Effects** - Functions that auto-run when their signal dependencies change
**Memos** - Cached computed values that only recompute when dependencies change

## Interactive Demo

```bash
npm run demo
```

Open `http://localhost:3000/demo` to see an interactive demo in your browser.
