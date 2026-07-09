# Castro website

This is a demo site that consumes Castro. Global styling comes from `@vktrz/css` (a sibling package), pulled in via `import "@vktrz/css/style.css"` in `PageShell` — castro bundles it into the page CSS. Each component/page also has its own co-located CSS file that consumes the package's tokens (`--primary`, `--spacing-*`, `--text-*`, `--border-*`).

**Read `DESIGN.md` before any UI change** — it documents the color system, typography, and layout conventions. The tokens and pre-styled bare elements now live in `@vktrz/css` (`packages/css/src/`); the site defines only component-specific CSS on top.

**Hidden page directories.** Directories prefixed with `_` are excluded from the build (e.g. `_components/`).

**Site information architecture.** A single landing page (`src/pages/index.tsx`: Hero + HowItWorks + IslandShowcase) plus a `404`. No docs section, no public nav — the header is just Home, GitHub, and the theme toggle. The landing explains what Castro is, demonstrates one live island (`PropagandaRadio`, the site's only `<castro-island>`), and points at the source; it deliberately doesn't try to teach island architecture. Keep it that way.
