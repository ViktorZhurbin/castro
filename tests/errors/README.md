# Test-Errors Sandbox

Isolated test cases for Castro error DX: one fixture per failure scenario, together covering every `ErrorCode`. A code can have more than one fixture — `BUNDLE_FAILED` has four, `NO_DEFAULT_LAYOUT` has three — when distinct scenarios produce it. Each fixture is a minimal self-contained Castro site.

## Automated coverage

```bash
bun test:errors
```

Runs `castro build` in all fixtures and compares stderr against committed goldens in `expected.stderr.txt`. Catches wrong error codes, leaked Bun stack frames, and broken rendering (missing hints, dropped notes, misaligned carets).

To regenerate goldens after an intentional message change:

```bash
bun test:errors:up    # UPDATE_SNAPSHOTS=1 bun test:errors
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
| `island-default-not-function` | Island default export isn't callable | `ISLAND_DEFAULT_NOT_FUNCTION` | `components/Silent.island.tsx` has `export default 42` |
| `island-render-failed` | Island render fails at build time | `ISLAND_RENDER_FAILED` | hydrate export throws error |
| `island-children` | Island is passed children | `ISLAND_HAS_CHILDREN` | `<Counter>` wraps `<strong>hi</strong>`; islands take props only |
| `island-multiple-directives` | Island carries two hydration directives | `ISLAND_MULTIPLE_DIRECTIVES` | `<Counter comrade:eager comrade:visible />` |
| `island-props-not-serializable` | Island prop can't become JSON | `ISLAND_PROPS_NOT_SERIALIZABLE` | `<Counter data={...}>` where `data` holds a reference to itself |

An island whose default export is *missing entirely* is `BUNDLE_FAILED`, not `ISLAND_DEFAULT_NOT_FUNCTION` — the client compile's `import Component from ...` fails first, with `No matching export in "components/Silent.island.tsx" for import "default"`. Its code frame points at the generated `*.virtual.js` entry rather than a file on disk, so the message is what names the island, not the location. `ISLAND_DEFAULT_NOT_FUNCTION` covers the case that compile can't see: a default that exists and isn't callable.

The fixture's default is a *primitive*, and that is the point. An object default throws inside `renderToString` on its own — `[object Object] is not a valid HTML tag name` — so without the guard it surfaces as `ISLAND_RENDER_FAILED` and the fixture would only prove that one error preempts another. `export default 42` is the case nothing else catches: the build exits 0 and ships `<42></42>`.

Some codes have no fixture on purpose. `ISLAND_NOT_FOUND` and `BUNDLE_NO_OUTPUT` are internal invariants — the first says "please report it" in its own hint, and the second fires only when a *successful* `Bun.build` yields no `.js` output, which no user input can arrange. `UNEXPECTED` is the `toPayload()` fallback for any non-`CastroError` throw, so no single scenario pins it.

The table above is not documentation of the suite — it is an input to it. `error-goldens.test.js` parses these rows and fails when they stop matching the directories on disk, or when an `ErrorCode` is covered by neither a fixture nor the `EXEMPT_ERROR_CODES` list in that file. Only the table is parsed; the exemption list itself lives in the test, and the paragraph above is prose for a human reader, not an input the test reads. Keep it in sync by hand when `EXEMPT_ERROR_CODES` changes.

## Adding a fixture

Skipping step 4 is the one that fails cryptically.

1. `mkdir tests/errors/<name>` and write the smallest site that triggers the error — usually `pages/index.tsx` plus `layouts/default.jsx`.
2. A `package.json` named `@test-errors/<name>`, depending on `"@vktrz/castro": "workspace:*"` and the same Preact range as `core/package.json`. Copy a neighbour; `tests/preact-range.test.js` fails if the range drifts.
3. A `tsconfig.json` holding only `{ "extends": "../tsconfig.base.json" }` — for the editor, since nothing type-checks these.
4. **`bun install` at the repo root.** Until you do, the fixture has no `node_modules/.bin/castro` to spawn.
5. `bun test:errors:up` to write `expected.stderr.txt`, then read it — structured output, no raw stack frames.
6. Add the row to the table above, or the run goes red.

## Why this directory is exempt from lint and format

`.oxlintrc.json` and `.oxfmtrc.json` both ignore `**/tests/errors`. Several fixtures are deliberately unparseable — an unclosed brace is the entire point of `page-syntax-error` — and neither tool can format what it cannot parse. The exclusion is directory-wide rather than per-file, which is why this tree is tab-indented while the rest of the repo is two-space: nothing here is ever reformatted.

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
