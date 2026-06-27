# Castro

_A static site generator built to be read._

Preact for pages and islands, Bun for everything else.

> [!NOTE]
> Requires [Bun](https://bun.sh) 1.3.8+

## Quick Start

```bash
bunx create-castro
cd my-castro-site
```

```bash
bun run dev    # → http://localhost:3000
bun run build  # → dist/
```

## Documentation

The source is the documentation. `core/src/` is about 1,300 lines. Start at [core/src/builder/buildAll.js](core/src/builder/buildAll.js) — it names every build step in order — and follow the module docblocks from there. Architecture across files lives in [CLAUDE.md](CLAUDE.md).

A one-page introduction lives at [castro.vktrz.workers.dev](https://castro.vktrz.workers.dev).

## License

MIT — The people's license
