# Castro website

This is a demo site that consumes Castro. Global styling comes from `import "@vktrz/bare-css/index.css"` in `PageShell`. Each component/page also has its own co-located CSS file that consumes the `bare-css` package's tokens (`--primary`, `--spacing-*`, `--text-*`, `--border-*`).

**Read `README.md` before writing or changing copy, or deciding what goes on a page** — what the site is, who reads it, the voice, and the SaaS failure mode.

**Read `DESIGN.md` before any visual change** — site CSS, `packages/bare-css`, or porting a Claude Design mockup. It holds the principles, tokens, type, rules, and where the design source lives. The tokens and pre-styled bare elements live in `@vktrz/bare-css` (`packages/bare-css/src/`); the site defines only component-specific CSS on top.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture:**

- Landing page (`src/pages/index.tsx`),
- `404`,
- `docs/` section

`src/nav.ts` is the single source of truth for docs navigation — both `Header.tsx` (top nav link, active-state) and `layouts/docs.tsx` (sidebar) map over its `navSections`. A second docs section would show up in both places for free; don't hand-roll a second nav list.

The landing page explains what Castro is and demonstrates an island example. The other components in `src/components/islandExamples/` are a museum: kept for reference and future work.

The docs section covers actual usage: how to structure a project, write pages/layouts, use islands, configure the build. Internals/architecture live in the root `CLAUDE.md` and module docblocks.
