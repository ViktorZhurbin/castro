# Contributing

Castro is an educational project. PRs welcome if they:

- **Improve code clarity/comments** - Make it easier to learn from
- **Fix bugs** - Keep it working correctly
- **Enhance educational value** - Better examples, clearer explanations

Joke PRs are fun but secondary to learning value.

## Comment Guidelines

Castro is educational code — comments are part of the teaching. But they should respect the reader's intelligence.

**Good comments** explain *why* something exists, or provide context that isn't obvious from the code:

```js
// Bun names CSS outputs like "page.tsx.css" — strip the source extension
const cssFileName = originalName.replace(/\.(jsx|tsx|js|ts)\.css$/, ".css");

// rootMargin extends the viewport boundary:
// start loading 100px before element enters viewport
{ rootMargin: "100px" }
```

**Bad comments** restate what the code already says:

```js
// Get the layout component from the registry
const layoutComponent = layouts.getLayout(layoutName);

// Write CSS to disk
await Bun.write(cssOutputPath, cssText);
```

Rules of thumb:
- If the code is clear, the comment is clutter
- Module-level docblocks should explain the file's role in the architecture
- Inline comments earn their place by answering "why?" or "why not the obvious way?"
- Never be condescending — the reader is a developer, not a student

## Requirements

- Bun 1.3.8+
- Preact 10+ (peer dependency)
