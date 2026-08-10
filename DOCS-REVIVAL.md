# Docs revival — notes for later

Captured from a planning conversation. Not acted on yet.

## The reframe

Castro's framing has moved: markdown→HTML toy → SSG (reacting against Astro's
complexity, 11ty's weirdness) → JSX + minimalism as the core idea → Bun cut
dependencies to near zero → briefly aimed at being a teaching artifact →
pulled back because writing tutorials/explanations wasn't fun, only building
was → website trimmed to a single landing page → that now feels too invisible
to count as a real, published artifact.

Current direction: bring back **minimal usage documentation** (not a teaching
artifact) as a small, real thing that's published and used. "Readable code"
and "teaching artifact" were never the same claim — readable code is a
property of the source; teaching is a job (tutorials, explanations, upkeep)
that was correctly dropped. Usage docs are the on-ramp to the source, not a
resumption of the teaching job.

Commit `fb85c21` ("delete unbuilt website docs") is the key precedent: the
old docs weren't deleted for being bad, they were deleted for being
**unpublished** — pure maintenance cost, no return. That's the ledger this
revival inverts.

## What already exists in git history

Recoverable, not written from scratch:

- `git show fb85c21^:website/src/pages/_build/quick-start.md`
- `git show fb85c21^:website/src/pages/_reference/config.md`
- `git show fb85c21^:website/src/pages/_build/components-islands.tsx`
- `git show 7f5efe5^:website/src/layouts/docs.tsx` (docs layout, sidebar)
- `git show 7f5efe5^:website/src/nav.ts` (nav — delete rather than revive,
  see below)

## Target scope — three pages, ceiling not floor

1. **Quick start** — `bunx create-castro`, Bun version, `dev`/`build`,
   directory shape (`pages/`, `layouts/`, `components/`, `public/`,
   `_`-prefix exclusion), default export + `meta`, markdown pages +
   frontmatter, layouts receive `children`, layout id resolution
   (`nested/default`).
2. **Islands** — `.island.tsx` naming, the three `comrade:*` directives +
   implicit default, props-only/no-children, props must be JSON
   (the JSON-lossiness gotcha is the one genuinely non-obvious thing worth
   prose).
3. **Config** — a table: `port`, `srcDir`, `markdown.options`,
   `clientDependencies`.

No architecture/internals page — that duplicates `CLAUDE.md` and is the page
that got boring last time. Docs cover the _usage_ surface only, not the
machinery. Error codes get shown (overlay screenshot), not enumerated.

If the real usage surface ever needs more than these three pages to document
honestly, that's a signal there are too many moving parts — not a cue to add
pages.

## Known drift to fix when recovering the old docs

- `layout: false` no longer works — `layouts.js:56` defaults to `"default"`
  and anything unresolved throws `LAYOUT_NOT_FOUND`. Needs a real fix in the
  doc (either restore the behavior or stop documenting it).
- Bun version requirement: `1.3.8+` → `1.3.14+`.
- `config.md` is missing `clientDependencies`.
- Dead links to `/concept/island-architecture` and "alternative frameworks"
  — the multi-framework registry is gone (Preact-only now).
- `components-islands.tsx` needs the most rework; predates the
  Preact-only collapse.
- `nav.ts` points at pages that were never written — with only 3 pages,
  drop the sidebar/nav entirely rather than reviving it. Header nav +
  in-page headings is enough.

## Guardrails (failure modes from the last attempt)

- **Don't reopen the design system.** `bare-css` tokens already exist; reuse
  `docs.tsx` minus the sidebar. Picking colors again is a sign of drift back
  into the thing that killed momentum last time.
- **Don't hand-maintain code snippets long-term.** Point samples at files
  that are already built/tested (`packages/create-castro/template/*`,
  `tests/site/*`) rather than freehand snippets that silently rot.
- Size the work so **writing** is ~one afternoon (mostly editing recovered
  prose) and **building** stays the enjoyable part — if writing balloons,
  that's the same failure mode recurring, not a reason to push through.

## Open follow-up: audit "teaching" leftovers

Separate from writing new docs — before or alongside this work, sweep the
codebase for leftover framing/artifacts from the "teaching artifact" era that
no longer match the current direction. Candidates to check (not yet audited):

- `README.md`, root `CLAUDE.md`, `website/CLAUDE.md`, `website/DESIGN.md`
  for teaching-oriented language.
- `website/README.md` ("RULES" section on satirical voice — check it still
  matches the usage-docs framing, not a teaching one).
- Any comments/docblocks in `core/src/` written to explain _mechanics_ to a
  learner rather than the _why_ to a maintainer (per the project's own
  inline-comment convention).
- Old deleted-but-not-purged references to teaching/tutorial framing in
  commit messages, tags (`castro-jsx-revived-with-dsl-v0`, etc.) — informational
  only, not something to rewrite, but worth knowing about when reasoning
  about project history.
- `EXPLORATIONS.md` candidate list and "Two Forces" section in root
  `CLAUDE.md` for any phrasing that still implies a pedagogical mission
  rather than "readable code, minimal usage docs."
