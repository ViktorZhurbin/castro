# Castro website

This is a demo site that consumes Castro. Uses PicoCSS v2 (CDN) plus three co-located stylesheets in `public/styles/`. Each component/page has its own co-located CSS file.

**Read `DESIGN.md` before any UI change** — it documents the color system, typography, layout conventions, and the structure of the three style files. Customization & CSS variable references: `./.claude/docs/pico.md`, `./.claude/docs/pico-variables-css.md`.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture.** A single landing page (`src/pages/index.tsx`: Hero + HowItWorks + IslandShowcase) plus a `404`. No docs section, no public nav — the header is just Home, GitHub, and the theme toggle. The landing explains what Castro is, demonstrates one live island (`PropagandaRadio`, the site's only `<castro-island>`), and points at the source; it deliberately doesn't try to teach island architecture. Keep it that way.
