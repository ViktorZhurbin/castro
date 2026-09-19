# Castro

A static site generator on Bun and Preact. JSX and Markdown go in, static HTML comes out. Interactive islands where you need them; pages with no islands ship no JavaScript.

~1,350 lines, built with an LLM over three months. Each module is commented and meant to be read end to end.

> [!NOTE]
> Requires [Bun](https://bun.sh) 1.3.14+

## Quick start

```sh
bunx create-castro
```

An island is a component imported from a `*.island.tsx` file. A directive decides when its JavaScript loads: `comrade:visible` (default), `comrade:eager`, or `comrade:patient`.

```tsx
import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} comrade:patient />;
}
```

## Reading the source

Start in `core/src/`:

- `builder/buildAll.js` — the build, step by step
- `islands/compiler.js`, `islands/castroIsland.js` — how an island becomes a marker at build time and hydrates in the browser
- `dev/` — dev server and live reload

## Documentation

[castro.vktrz.workers.dev](https://castro.vktrz.workers.dev) — landing page with a live island demo; [docs](https://castro.vktrz.workers.dev/docs/quick-start) for usage.

## License

MIT — The people's license
