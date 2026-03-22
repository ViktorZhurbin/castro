# Castro

*An educational framework for understanding island architecture*

Castro is a working Static Site Generator that implements island architecture in ~1300 lines of well-commented, readable code. The communist theme makes it memorable. The architecture lessons are real.

**Learn by reading code, not documentation.**

> [!NOTE]
> Castro requires [Bun](https://bun.sh) 1.3.8+

## What Is This?

Island architecture is how modern frameworks (Astro, Marko, Fresh, Qwik) achieve great performance. Instead of shipping JavaScript for your entire page, you selectively hydrate only the interactive components. The rest stays as static HTML.

Castro shows you exactly how this works by implementing it from scratch.

## Quick Start

```bash
mkdir my-site && cd my-site
bun init -y
bun add @vktrz/castro preact
```

Create a page (`pages/index.tsx`):

```tsx
export default function Home() {
  return <h1>Hello, world!</h1>;
}
```

```bash
bun castro dev    # → http://localhost:3000
bun castro build  # → dist/
```

See the [Quick Start guide](https://castro-web.pages.dev/guide/quick-start) for the full walkthrough — layouts, islands, directives, and more.

## How It Works

1. **Build time** — pages compile to static HTML, islands get separate JS bundles
2. **Browser receives** — pure HTML, no JavaScript executed yet
3. **Hydration triggers** — based on directive (`comrade:visible`, `lenin:awake`, or `no:pasaran`)
4. **Island loads** — JavaScript downloaded, component becomes interactive

See [How It Works](https://castro-web.pages.dev/how-it-works) for the full build pipeline and hydration deep-dive.

## Documentation

**Website:** [castro-web.pages.dev](https://castro-web.pages.dev)

- [Quick Start](https://castro-web.pages.dev/guide/quick-start) — install, project structure, first island
- [Configuration](https://castro-web.pages.dev/guide/configuration) — `castro.config.js` reference
- [Multi-Framework](https://castro-web.pages.dev/guide/multi-framework) — Preact + Solid on the same page
- [Plugins](https://castro-web.pages.dev/guide/plugins) — the `CastroPlugin` interface, Tailwind example
- [The Build Pipeline](https://castro-web.pages.dev/how-it-works) — compilation, interception, rendering
- [Hydration](https://castro-web.pages.dev/how-it-works/hydration) — the `<castro-island>` custom element

**Reading the source:** every file has comments explaining the implementation.

- `castro/src/cli.js` — entry point
- `castro/src/builder/` — build orchestration
- `castro/src/islands/` — island architecture implementation
- `castro/src/dev/server.js` — development server

## Why "Castro"?

Because learning complex architectural patterns should be memorable. The communist satire is a wrapper around serious educational code. The framework is real. The performance benefits are real. The puns just make it stick.

## Project Status

Castro is an educational project — a real, working framework, but the primary goal is teaching. Use it for small websites, personal blogs, or to learn how island architecture works internally.

For production projects, consider [Astro](https://astro.build), [Fresh](https://fresh.deno.dev), or another framework of your liking.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — The people's license

---

*"From each component according to its complexity, to each page according to its needs."*