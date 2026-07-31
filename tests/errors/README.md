# Test-Errors Sandbox

Isolated test cases for Castro error DX, one per error code. Each is a minimal self-contained Castro site.

## Automated coverage

```bash
bun test:errors
```

Runs `castro build` in all fixtures and compares stderr against committed goldens in `expected.stderr.txt`. Catches wrong error codes, leaked Bun stack frames, and broken rendering (missing hints, dropped notes, misaligned carets).

To regenerate goldens after an intentional message change:

```bash
UPDATE_SNAPSHOTS=1 bun test:errors
```

Inspect the diff before committing — each golden should show clean structured output with no raw stack frames.

## Manual inspection

```bash
cd tests/errors/<name>
bun castro dev
```

Then observe the terminal output and browser overlay (localhost:3000).

To verify fixes work, edit the broken file in place — the dev server will rebuild and show a `reload` event if the fix succeeds.

## Error Cases

| Dir | Error | Expected code | Breaks |
|-----|-------|---------------|--------|
| `config-load-failed` | castro.config.ts throws while loading | `CONFIG_LOAD_FAILED` | config throws at module scope |
| `no-pages` | pages/ exists but holds no pages | `NO_PAGES` | `pages/` empty (`.gitkeep` only) |
| `route-conflict` | Two pages map to same route | `ROUTE_CONFLICT` | `pages/about.md` + `pages/about.tsx` |
| `layout-not-found` | Page references missing layout | `LAYOUT_NOT_FOUND` | page has `layout: "ghost"`, only `default.jsx` exists |
| `missing-default-layout` | No default layout in layouts/ | `NO_DEFAULT_LAYOUT` | `layouts/other.jsx` only (no `default.jsx`) |
| `no-layouts-dir` | layouts/ directory missing | `NO_DEFAULT_LAYOUT` | no `layouts/` at all |
| `empty-layouts-dir` | layouts/ exists but empty | `NO_DEFAULT_LAYOUT` | `layouts/` exists but empty |
| `page-no-default-export` | Page has no default export | `PAGE_NO_DEFAULT_EXPORT` | `pages/oops.tsx` has only named exports |
| `layout-no-default` | Layout has no default export | `LAYOUT_NO_DEFAULT_EXPORT` | `layouts/default.jsx` has only named exports |
| `yaml-broken` | Markdown frontmatter syntax error | `YAML_PARSE_FAILED` | `pages/post.md` has `title: [unclosed` |
| `page-syntax-error` | Page has syntax error | `BUNDLE_FAILED` | `pages/broken.tsx` unclosed brace |
| `layout-syntax-error` | Layout has syntax error | `BUNDLE_FAILED` | `layouts/default.jsx` unclosed brace |
| `island-syntax-error` | Island has syntax error | `BUNDLE_FAILED` | `components/Counter.island.tsx` unclosed brace |
| `island-import-missing` | Page imports non-existent island | `BUNDLE_FAILED` | imports `./components/Ghost.island.tsx` which doesn't exist |
| `island-render-failed` | Island render fails at build time | `ISLAND_RENDER_FAILED` | hydrate export throws error |
| `island-children` | Island is passed children | `ISLAND_HAS_CHILDREN` | `<Counter>` wraps `<strong>hi</strong>`; islands take props only |
| `island-props-not-serializable` | Island prop can't become JSON | `ISLAND_PROPS_NOT_SERIALIZABLE` | `<Counter data={...}>` where `data` holds a reference to itself |

Two codes have no fixture on purpose: `ISLAND_NOT_FOUND` is an internal invariant — its own hint says "please report it" — and `UNEXPECTED` is the `toPayload()` fallback for any non-`CastroError` throw, so no single scenario pins it.

## Verification Checklist

For each error, verify in the terminal and browser:

- **Terminal**:
  - New structured error format (title, message, hint)
  - Code frame with line numbers where applicable
  - Color applied correctly (red title, yellow hint, gray frames)

- **Browser overlay**:
  - Title in red with `❌` prefix
  - Message and notes (if present)
  - Code frame with syntax highlighting and caret
  - File link as `vscode://file/...` (clickable in VS Code)
  - Hint footer in yellow

- **Fix verification**:
  - Edit the broken file to fix the error
  - Dev server rebuilds
  - SSE sends `reload` event
  - Overlay clears, page loads successfully
