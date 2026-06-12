# Castro

*A static site generator built to be read.*

Communist satire wraps serious, well-commented code. Preact for pages and islands, Bun for everything else.

Castro is a personal tool, not a framework: no plugin API, no extension points, no user base to serve (see [NON-GOALS.md](NON-GOALS.md)). What it has instead is the machinery of a real framework — build pipeline, islands runtime, module cache, structured errors, dev server with live reload — each piece small enough to hold in your head and documented as its own self-contained read.

> [!NOTE]
> Requires [Bun](https://bun.sh) 1.3.8+

## Quick Start

```bash
bunx create-castro
cd my-castro-site
```

```bash
bun castro dev    # → http://localhost:3000
bun castro build  # → dist/
```

## Documentation

**[castro.vktrz.workers.dev](https://castro.vktrz.workers.dev)** — the island-architecture concept and a guided tour of how Castro works under the hood.

**Or just read the source:** `core/src/` is about 1,400 lines. Start at [core/src/builder/buildAll.js](core/src/builder/buildAll.js) — it names every build step in order — and follow the module docblocks from there.

## License

MIT — The people's license
