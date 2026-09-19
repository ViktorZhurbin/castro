# Website Design Reference

The Castro website is set as a broadsheet: a national Soviet newspaper with some budget — one paper, one ink, one accent pigment, hierarchy made from type size and rule thickness. Cheap to print, so simple; not so cheap that it looks unfinished. This document describes the design system so that UI changes stay consistent with that identity. What the site says, and to whom, is in `README.md`.

## Principles

- **Print, not product.** Every choice should be one a newspaper press could make: ink on paper, rules, type size and weight, one spot color. Tinted panels, grey captions, soft shadows, rounded corners, gradients, and decoration read as SaaS — the failure mode `README.md` describes.
- **Consistency over variety.** A new element takes an existing type role, rule weight, and spacing from this document. A new font, weight, size step, color, or rule weight needs a reason the existing set can't serve.
- **Two themes, both maintained.** Light is the paper; dark is for night development. Check every change in both.
- **Readable in every state.** Hover, active, and selected states keep full contrast — see the hover rule under Color System.

## Design source

The design was made in Claude Design, project "Castro" (`https://claude.ai/design/p/337d145f-eb74-4006-ab6e-3008d078ceb4`), file `Castro A Broadsheet.dc.html`; `Castro Broadsheet Preview.dc.html` shows it at desktop and mobile widths in both themes. The project also holds rejected directions (`Castro B Poster`, `Castro C Dossier`) — not specs.

The site and the design file are kept in step by hand; nothing syncs them. When a visual change lands on the site, update the `.dc.html` to match, and copy this file over the project's `uploads/DESIGN.md`. The design file loads its fonts from Google Fonts because it can't reach the site's self-hosted files; that is the one intended difference.

## CSS Architecture

The visual system lives in the `@vktrz/bare-css` package (`packages/bare-css/src/`), pulled in via `import "@vktrz/bare-css/index.css"` in `PageShell`. The package is organized as:

- **`tokens.css`** — the source of truth. Global settings (zero radius, no shadows/transitions, the three font families), the raw materials (`--ink-*`, `--canvas-*`, `--color-*`), the spacing/type/border scales, and the theme role variables (`--primary`, `--background-color`, etc.) mapped separately for light and dark.
- **`reset.css`** — box model, root text defaults, focus outline, `hr`.
- **`typography.css`** — bare headings/prose/lists/links/code, including the heading size scale and `md` breakpoint bump.
- **`elements.css`** — pre-styled `button` (bare = the ink-bordered slab; `.primary` fills it), `.btn-square` icon buttons, `.divider`, tables.
- **`layout.css`** — the responsive `.container`.

The package styles bare tags directly (PicoCSS-style): a plain `<button>` already looks designed; classes only add intent (`.primary`, `.full`) or a distinct shape (`.btn-square`). Anchors that should look like buttons take `role="button"`.

Each component and page has its own co-located CSS file consuming these tokens. Component classes always win.

## Color System

Three roles per theme, nothing else:

| Variable             | Light     | Dark  | Use on                                      |
| -------------------- | --------- | ----- | ------------------------------------------- |
| `--background-color` | Newsprint | Soot  | Page surface                                |
| `--color`            | Ink black | Chalk | All text, all rules                         |
| `--primary`          | Crimson   | Gold  | Accent bar, star, section numbers, CTA fill |

`--primary-inverse` is the text color on a `--primary` fill (the paper color). `--contrast-background` / `--contrast-inverse` are the inverted block — ink ground, paper text — used for hover states, the active half of the Day/Night toggle, and the footer.

**No muted text, no tinted surfaces.** Captions and secondary labels are full ink; a section never sits on a second background color. Hierarchy comes from size, weight, and rule thickness. Grey text reads as SaaS, not as print. The one exception is `--code-background` (`--canvas-*-shade`, the same paper one step darker): the docs use it behind code blocks and inline code.

Accent on text is reserved for display-size figures (section numbers, the `1,350` tally, the Five-Year Plan readout, the docs page title) and the footer slogan. Body text is never colored; links are ink with an accent underline.

Gold on the chalk footer fails contrast, so the footer slogan switches to crimson in dark mode (`Footer.css`). Check contrast whenever accent meets the inverted block.

**Hover rule.** Hover swaps to the inverted block: `--contrast-background` ground, `--contrast-inverse` text. Text on an accent ground is always `--primary-inverse`, never ink.

`--color-success` / `--color-error` exist only for the museum islands.

## Typography

Two web fonts, two files (~31 KB), self-hosted in `public/fonts/` (latin subset, declared and preloaded in `PageShell`). Body text uses the system sans, so it costs no download. Adding a face adds a file, so it needs a reason (see Principles).

- **Display** (`var(--font-display)`, Oswald, variable 500–700): headings, buttons, slogans, figures. Headings are uppercase globally with `letter-spacing: 0.01em`; `h1` is 700, other headings 600, buttons and sub-heads 500. Code inside a heading keeps its case.
- **Body** (`var(--font-family)`, system sans): running text. The italic appears once — the hero's pull quote.
- **Labels** (`var(--font-family-monospace)`, IBM Plex Mono 400): code, the header strip, footer baseline, badges, card captions. Labels set in mono are uppercase with `letter-spacing: 0.14em`. Nothing outside mono gets wide tracking — buttons stay at `0.04em`.

**15px floor.** `--text-sm` (0.9375rem) is the smallest step in the scale; nothing goes below it, including code.

**Font sizes**: Use `var(--text-sm)` through `var(--text-4xl)` in components. The landing page's fluid sizes are `clamp()` expressions in its component CSS, taken from the design.

## Border System

All rules are ink. Weight carries the hierarchy:

| Variable             | Value      | Typical use                                                      |
| -------------------- | ---------- | ---------------------------------------------------------------- |
| `--border-1`         | 1px ink    | Hairlines: between list rows, under a card caption, column rules |
| `--border-2`         | 2px ink    | Small controls (theme toggle), `hr`                              |
| `--border-3`         | 3px ink    | Cards, buttons, the header underline, section title rules        |
| `--border-4`         | 4px ink    | Docs sidebar edge                                                |
| `--border-8`         | 8px ink    | Top of every landing section                                     |
| `--border-primary-4` | 4px accent | Decorative dividers (404)                                        |

Inline code takes a 1.5px ink border — a chip, heavier than a hairline and lighter than a structural rule.

## Layout Conventions

**Zero border radius, no shadows, no transitions.** Hover states change instantly.

**Gutter**: `--gutter` (`PageShell.css`) is the side margin for the header, footer, and every landing section, so all edges line up.

**Breakpoints** (documented in `@vktrz/bare-css`): `sm` 576px / `md` 768px / `lg` 1024px / `xl` 1280px / `xxl` 1536px. Landing columns wrap by `flex-basis` instead of breakpoints; each text column caps its measure in `ch`.

**Spacing**: Use `var(--spacing-*)` for fixed gaps. The scale runs from `--spacing-4xs` (0.1× base unit) to `--spacing-6xl` (6× base unit).

## Buttons

| Selector        | Fill        | Border  | Use               |
| --------------- | ----------- | ------- | ----------------- |
| `button` (bare) | Transparent | 3px ink | Neutral / default |
| `.primary`      | Accent      | Accent  | Primary action    |
| `.full`         | —           | —       | Stretch to 100%   |
| `.btn-square`   | Transparent | —       | Icon-only shape   |

Buttons are Oswald 500, uppercase, `--text-lg`. Hover swaps to the inverted ink block.

## Landing Page Structure

- **Header** — mono strip: star (the only link home from the docs) and tagline left; Docs, GitHub, and the Day/Night toggle right. The tagline hides below 560px. The toggle is one button styled as two halves (`ThemeToggle.tsx` says why).
- **Hero** — full-width `CASTRO` nameplate with the star, a 12px accent bar, then the headline beside the standfirst and CTAs.
- **Sections** — `Section` (`website/src/pages/_components/index/Section.tsx`) owns the 8px top rule, the gutter, and the numbered title. Numbers come from a CSS counter. Add a section by rendering one; use `.section-columns` for a prose-beside-card body.
- **Footer** — the inverted block: slogan in the accent, mono baseline under a paper rule. Docs pages render the same footer, full-width.

Docs pages and `404` have no design file of their own: they take the `bare-css` element styles plus the shared header and footer. Keep them on those defaults; no landing-page treatments. The docs layout (`layouts/docs.css`) adds two things: the page `h1` in the accent, and the `--code-background` fill on `pre` and inline code.

## Adding New UI

- **Visual emphasis**: reach for rule weight, size, and the inverted block — not color on text.
- **Cards**: `border: var(--border-3)`, a caption strip on top with a hairline or 3px rule under it. No background fill.
- **Labels and badges**: mono, uppercase, `var(--text-sm)`, `letter-spacing: 0.14em`. A filled badge is accent ground + `--primary-inverse` text; see `.directives-default` in `StandingDirectives.css`.
- **Lists of items**: rows separated by `--border-1`, closed by `--border-3` (see `.directives`).
- **Figures**: Oswald 600 in `--primary`, with a mono label under a 3px rule (see `.small-tally`).
- **Icons**: `color: currentColor` for structural icons, `var(--primary)` for the star.
