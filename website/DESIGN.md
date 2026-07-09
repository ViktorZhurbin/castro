# Website Design Reference

The Castro website uses a Soviet Constructivist aesthetic: unbleached paper, propaganda red, industrial iron, heavy geometry. This document describes the design system so that UI changes stay consistent with that identity.

## CSS Architecture

The visual system lives in the `@vktrz/bare-css` package (`packages/bare-css/src/`), pulled in via `import "@vktrz/bare-css/style.css"` in `PageShell` — castro bundles it into the page CSS. The package is organized as:

- **`tokens.css`** — the source of truth. Global settings (zero radius, no shadows/transitions, Bebas Neue + Barlow), the raw-material variables (`--ink-*`, `--canvas-*`, `--color-*` — what colors physically are), the spacing/type/border scales, and the theme role variables (`--primary`, `--background-color`, etc.) mapped separately for light and dark.
- **`reset.css`** — box model, root text defaults, focus outline, `hr`.
- **`typography.css`** — bare headings/prose/lists/links/code, including the heading size scale and `md` breakpoint bump.
- **`elements.css`** — pre-styled `button` (bare = the neutral bordered look; `.primary` fills it), `.btn-square` icon buttons, `.divider`, tables.
- **`layout.css`** — the responsive `.container`.

The package styles bare tags directly (Pico-style): a plain `<button>` already looks designed; classes only add intent (`.primary`, `.full`) or a distinct shape (`.btn-square`). Anchors that should look like buttons take `role="button"`.

Each component and page has its own co-located CSS file consuming these tokens. No preprocessor — Castro bundles the package and all component CSS into each page's stylesheet. The package styles bare elements (low specificity); component classes always win.

## Color System

`@vktrz/bare-css` uses two naming layers. Work with the role variables in component CSS; reference the raw materials only when defining new theme rules.

### Raw Materials (defined in `:root`)

Inks (text and structural lines):

- `--ink-black`, `--ink-white` — pure opposites
- `--ink-chalk` — off-white for dark mode body text
- `--ink-graphite` — heavy grey for light mode secondary text
- `--ink-ash` — pale grey for dark mode secondary text

Canvases (backgrounds):

- `--canvas-cream`, `--canvas-newsprint`, `--canvas-cardboard` — light mode surfaces, warm and slightly dirty
- `--canvas-charcoal`, `--canvas-slate` — dark mode surfaces

Pigments:

- `--color-crimson` — Soviet red, the primary pigment in light mode
- `--color-gold` — propaganda gold, the primary pigment in dark mode
- `--color-iron`, `--color-concrete` — industrial greys for secondary roles

### Semantic Role Variables (per-theme)

| Variable                  | Light     | Dark      | Use on                                 |
| ------------------------- | --------- | --------- | -------------------------------------- |
| `--primary`               | Crimson   | Gold      | Headlines, CTAs, accents               |
| `--secondary`             | Iron grey | Blood red | Borders, backgrounds                   |
| `--contrast`              | Black     | White     | Stark blocks, `.btn-neutral`           |
| `--background-color`      | Cream     | Charcoal  | Page surface                           |
| `--code-background-color` | Newsprint | Slate     | Secondary surface (cards, code blocks) |
| `--color`                 | Black     | Chalk     | Body text                              |
| `--muted-color`           | Graphite  | Ash       | Secondary labels, captions             |
| `--muted-border-color`    | Black     | Concrete  | Standard border color                  |

`--color-accent` is outside the role system: mustard (light) / concrete grey (dark). Use it for icon highlights and structural accents — not text.

### Color on Text

`--primary` and `--color` are the only role variables that reliably pass WCAG AA contrast on the theme backgrounds. `--secondary` is a mid-tone in both themes and shouldn't appear as text. Color belongs on borders, backgrounds, and geometric elements — a thick crimson border-top on a card carries more visual weight than a crimson heading anyway.

## Typography

**Display** (`var(--font-display)`, Bebas Neue): headings, uppercase labels, the brand mark. Global `letter-spacing: 0.05em` is applied in `@vktrz/bare-css` to all heading elements. Don't remove it.

**Body** (Barlow, `font-weight: 500`): set via `--font-family` and `--font-weight`. Default for all other text.

**Font sizes**: Use `var(--text-xs)` through `var(--text-2xl)` for `font-size` declarations. Raw rem values belong in `@vktrz/bare-css` only, where the scale is defined.

**Heading scale**: `h1` and `h2` override `--font-size` in `@vktrz/bare-css`, with a responsive bump at 768px. `h1` uses `--h1-color: var(--primary)` so top-level headings are automatically crimson/gold.

## Border System

The constructivist visual weight comes from border geometry, not shadows. Four weights are defined in `@vktrz/bare-css`:

| Variable            | Value                        | Typical use                                  |
| ------------------- | ---------------------------- | -------------------------------------------- |
| `--border-2`        | 2px solid muted border color | Cards, dividers, form elements               |
| `--border-4`        | 4px solid muted border color | Structural separators                        |
| `--border-accent-4` | 4px solid primary            | Section dividers (footer top, page dividers) |
| `--border-accent-8` | 8px solid primary            | Major emphasis (hero hr)                     |

These apply to any border side: `border: var(--border-2)`, `border-top: var(--border-accent-4)`, `border-left: var(--border-accent-8)`.

Cards typically combine `border: var(--border-2)` with a heavier directional border (`border-left-width: 6px` or `border-top-width: 8px`) for structural emphasis.

## Layout Conventions

**Zero border radius** — `--border-radius: 0rem` in `@vktrz/bare-css` applies globally. Don't add `border-radius` in component CSS.

**No shadows** — `--box-shadow: none` (and card, button, dropdown equivalents) is set globally. Use border weight for depth, not shadows.

**No transitions** — `--transition: 0s`. Hover states change instantly.

**Breakpoints** (documented in `@vktrz/bare-css`):
`sm` 576px / `md` 768px / `lg` 1024px / `xl` 1280px / `xxl` 1536px.
The site uses `768px` for the main layout switches (hero, how-it-works list).

**Spacing**: Use `var(--spacing-*)` throughout. The scale runs from `--spacing-4xs` (0.1× base unit) to `--spacing-6xl` (6× base unit).

## Buttons

Buttons are pre-styled in `@vktrz/bare-css` (`elements.css`) — a bare `<button>` already carries the base look. Anchors that should read as buttons take `role="button"`.

| Selector        | Fill        | Text  | Use               |
| --------------- | ----------- | ----- | ----------------- |
| `button` (bare) | Transparent | Black | Neutral / default |
| `.primary`      | Crimson     | White | Primary action    |
| `.full`         | —           | —     | Stretch to 100%   |
| `.btn-square`   | Transparent | —     | Icon-only shape   |

All buttons use `border-bottom-width: 4px` for a structural slab weight. Hover swaps fill to the contrast block — no lift, no shadow, no transition.

## Adding New UI

When building a new component or page section:

- **Visual emphasis**: Reach for border weight and background color, not text color. `border-top: var(--border-accent-4)` on a section header reads stronger than making the heading crimson.
- **Cards**: `border: var(--border)` + a heavy directional border side. Background: `var(--code-background-color)` (newsprint/slate) to lift from page surface.
- **Labels and badges**: Use `var(--font-display)` + uppercase + `var(--text-xs)` or `var(--text-sm)`. See `.badge` in `components.css`.
- **Dividers**: `border-top: var(--border-accent-4)` with a constrained `max-width` for decorative separators; `border-top: var(--border-heavy)` for structural ones.
- **Icons**: Match `color: currentColor` or `color: var(--primary)` depending on whether the icon is structural or decorative.
