# Castro website

This is a demo site that consumes Castro. Uses PicoCSS v2 (CDN) plus three co-located stylesheets in `public/styles/`. Each component/page has its own co-located CSS file.

**Read `DESIGN.md` before any UI change** — it documents the color system, typography, layout conventions, and the structure of the three style files. Customization & CSS variable references: `./.claude/docs/pico.md`, `./.claude/docs/pico-variables-css.md`.

**Docs page `path` contract.** Pages under `src/pages/concept/` and `src/pages/how-it-works/` export a `meta` with `layout: "docs"` and `path: "<exact-url>"`. The `path` drives sidebar active state and header highlighting — **update it whenever the page's URL changes**, or the nav silently goes wrong.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture.** The public nav shows two sections: **Concept** (`/concept/island-architecture`) and **How It Works** (`/how-it-works`). The concept page is the primary entry point. The homepage CTA points there.
