# Explorations

A lineup of standalone-but-composable tools to pick up on a coding itch — **not**
a roadmap with deadlines. Castro core (`core/`) is finished and frozen; everything
here lives beside it under `packages/` and never modifies core unless a note says so.

## The unifying spine

One contract ties the whole lineup together, and the runtime literally branches on it:

> **A reactive value is a nullary function. The JSX runtime reactively binds
> anything that's a function** (`typeof value === "function"` in `packages/castro-jsx`).

So `signals` is the foundation; the JSX runtime, the DSL, and a future store all
speak that same shape. A store query that returns an `Accessor` drops into a DSL
`{}` hole and "just works" — none of the pieces need to know about each other.

## Modules

- **`packages/signals`** — ✅ done. SolidJS-style `createSignal` / `createEffect`,
  dynamic dependency tracking. Pure, zero deps.
- **`packages/castro-jsx`** — ✅ done. No-vdom JSX DOM runtime. Functions passed as
  props/children get wrapped in effects; static values are set once. "How SolidJS
  works, minus the compiler."
- **`packages/castro-dsl`** — 🚧 in progress. `.castro` files: `---` frontmatter
  fence (verbatim JS) + HTML-shaped template + `{}` interpolation holes +
  `comrade:*` directives. Compiles to `createElement` calls targeting `castro-jsx`.
  The compiler's one piece of judgment: **wrap dynamic holes in thunks** (`() => expr`)
  so the runtime makes them reactive. That's the whole spine — it's the compiler
  the JSX runtime's docblock says it's missing. The parser (`parse.js`) is
  hand-written — no borrowed HTML parser — specifically so `={expr}` holes can be
  unquoted (`comrade:if={count() > 5}`); it reads a brace-depth-balanced span
  instead of following HTML's quoted-attribute grammar.

## Further explorations (don't lose these)

### `comrade:for` / `comrade:show` directives

- `comrade:if` → reactive child `() => cond ? <node> : null` (v0 target).
- `comrade:for={t of items()}` → `() => <>{items().map(t => <li/>)}</>` — wrap the map
  in a **Fragment**. Note: `bindReactiveChild` handles a Node, a Fragment, or text —
  **not a bare array**. Lists must go through Fragment, or the runtime needs one added
  case. This is the single seam where the DSL pokes the runtime.

### SSR runtime

`jsx/ssr/` was dropped on restore (DOM-only v0). Needed before `.castro` can be a
server-rendered castro page.

### `.castro` as a first-class castro page/island type

Integrate the compiler into `core/`'s build pipeline so `.castro` files are pages or
islands. This is the only exploration that touches core. The compiled output is the
same `createElement` tree a `.tsx` island produces, so it should ride the existing
island pipeline.

### Reactive DB store with signals (the big learning project)

A store module that exposes signals. `query(fn)` returns an `Accessor` built from
`createSignal` + `createEffect`, so query results are reactive values that drop into
DSL holes with **zero compiler changes**. Fenced in layers, each a usable stopping point:

1. In-memory reactive tables.
2. Add persistence (localStorage / IndexedDB) — the honest meaning of "offline-first".
3. Add indexing / real query refinement — where the actual database learning lives.

**NON-GOAL (the trap):** cross-client sync, conflict resolution, CRDTs, a server.
That's where InstantDB/TinyBase/Dexie spend their genius; it's un-finishable solo and
illegible by nature. Stay local, single-client, persistence-as-file.

## Design decisions worth remembering

- **Why a DSL and not a Babel/transform plugin?** Functionally a plugin works (Solid
  proves it). The DSL wins on ownership + legibility: a `.castro` file has no tsconfig
  / JSX-source ambiguity (the old `castro-jsx` plugin had to spin up `Bun.Transpiler`
  with an overridden tsconfig to escape the project's Preact `react-jsx` setting), and
  the frontmatter split is a "document with sections" that a `.tsx` expression-host
  can't cleanly express. Same reasons `.astro` / `.svelte` / `.vue` exist.
- **Why signals and castro-jsx are separate packages.** `signals` is the shared
  primitive (JSX runtime now, store later). Separating it makes the unifying contract
  visible. The original bundled them into one output _file_ for island shipping — a
  build concern, not a source-structure one.
- **Repo structure.** `core/` stays at the root (its position signals "protagonist").
  If a sibling ever needs to import it, move it to `packages/castro` (not
  `packages/core` — "core of what?" once it's a peer). Don't restructure speculatively.
- **Memorial, not fork.** Keeping castro alive as an imported, depended-on package is a
  better memorial than a dead fork or a buried commit. If a ritual marker is wanted,
  `git tag` the finished state rather than forking.
