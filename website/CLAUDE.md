# Castro website

This is a demo site that consumes Castro. Global styling comes from `@vktrz/bare-css` (a sibling package), pulled in via `import "@vktrz/bare-css/index.css"` in `PageShell` — castro bundles it into the page CSS. Each component/page also has its own co-located CSS file that consumes the package's tokens (`--primary`, `--spacing-*`, `--text-*`, `--border-*`).

**Read `README.md` before writing any site copy** — it holds the rules for where the satirical voice goes and where it doesn't.

**Read `DESIGN.md` before any UI change** — it documents the color system, typography, and layout conventions. The tokens and pre-styled bare elements now live in `@vktrz/bare-css` (`packages/bare-css/src/`); the site defines only component-specific CSS on top.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture:**

- Landing page (`src/pages/index.tsx`),
- `404`,
- `docs/` section

`src/nav.ts` is the single source of truth for docs navigation — both `Header.tsx` (top nav link, active-state) and `layouts/docs.tsx` (sidebar) map over its `navSections`. A second docs section would show up in both places for free; don't hand-roll a second nav list.

The landing still explains what Castro is and demonstrates one live island (`PropagandaRadio`, the site's only `<castro-island>`) without teaching island architecture — that's `docs/islands.md`'s job now. The docs section covers **usage only**: how to structure a project, write pages/layouts, use islands, configure the build. It is not an internals/architecture writeup — that already lives in the root `CLAUDE.md` and module docblocks, and duplicating it here is the thing that made the previous docs attempt a chore. If documenting the real usage surface ever needs more than these three pages, treat that as a signal the surface grew, not a cue to add pages.
