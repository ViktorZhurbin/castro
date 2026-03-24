# Castro

*Educational Static Site Generator (~1300 LOC) that teaches island architecture.*

Communist satire wraps serious, well-commented code. Preact for rendering, multiple frameworks for islands, Bun for everything else.

> [!NOTE]
> Requires [Bun](https://bun.sh) 1.3.8+

## Quick Start

```bash
mkdir my-site && cd my-site
bun init -y
bun add @vktrz/castro preact
```

```bash
bun castro dev    # → http://localhost:3000
bun castro build  # → dist/
```

## Documentation

**[castro-web.pages.dev](https://castro-web.pages.dev)** — quick start, configuration, plugins, build pipeline, hydration.

**Learn by reading code:** every file in `castro/src/` has comments explaining the implementation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — The people's license
