# Test-Errors Sandbox

Isolated test cases for Castro error DX, one per error code. Each is a minimal self-contained Castro site.

## Running a test

```bash
cd test-errors/NN-<name>
bun castro dev
```

Then observe the terminal output and browser overlay (localhost:3000).

To verify fixes work, edit the broken file in place — the dev server will rebuild and show a `reload` event if the fix succeeds.

## Error Cases

| Dir | Error | Expected code | Breaks |
|-----|-------|---------------|--------|
| `00-route-conflict` | Two pages map to same route | `ROUTE_CONFLICT` | `pages/about.md` + `pages/about.tsx` |
| `01-layout-not-found` | Page references missing layout | `LAYOUT_NOT_FOUND` | page has `layout: "ghost"`, only `default.jsx` exists |
| `02-missing-default-layout` | No default layout in layouts/ | `LAYOUT_MISSING_DEFAULT` | `layouts/other.jsx` only (no `default.jsx`) |
| `03-no-layouts-dir` | layouts/ directory missing | `NO_LAYOUTS_DIR` | no `layouts/` at all |
| `04-empty-layouts-dir` | layouts/ exists but empty | `NO_LAYOUT_FILES` | `layouts/` exists but empty |
| `05-page-no-default-export` | Page has no default export | `PAGE_NO_DEFAULT_EXPORT` | `pages/oops.tsx` has only named exports |
| `06-layout-no-default` | Layout has no default export | `LAYOUT_NO_DEFAULT_EXPORT` | `layouts/default.jsx` has only named exports |
| `07-yaml-broken` | Markdown frontmatter syntax error | `YAML_PARSE_FAILED` | `pages/post.md` has `title: [unclosed` |
| `08-meta-wrong-types` | Meta object has wrong types | `META_INVALID` | `export const meta = { title: 42 }` |
| `09-page-syntax-error` | Page has syntax error | `BUNDLE_FAILED` | `pages/broken.tsx` unclosed brace |
| `10-layout-syntax-error` | Layout has syntax error | `BUNDLE_FAILED` | `layouts/default.jsx` unclosed brace |
| `11-island-syntax-error` | Island has syntax error | `BUNDLE_FAILED` | `components/Counter.island.tsx` unclosed brace |
| `12-island-import-missing` | Page imports non-existent island | `BUNDLE_FAILED` | imports `./components/Ghost.island.tsx` which doesn't exist |
| `13-multiple-directives` | Island has multiple hydration directives | `MULTIPLE_DIRECTIVES` | `<Counter comrade:eager comrade:visible />` |

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
