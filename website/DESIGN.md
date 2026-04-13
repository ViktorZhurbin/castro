# Website Design Reference

The Castro website uses a Soviet Constructivist aesthetic: unbleached paper, propaganda red, industrial iron, heavy geometry. This document describes the design system so that UI changes stay consistent with that identity.

## CSS Architecture

Three static files in `public/styles/` define the visual system, applied in this order:

**`pico-theme.css`** — The color palette and all Pico overrides. Structured in three layers:
- Global settings: zero border radius, no shadows, no transitions, Bebas Neue + Barlow as fonts
- Raw material variables: `--ink-*`, `--canvas-*`, `--color-*` — semantic names for what colors physically are
- Theme role variables: Pico's `--pico-primary`, `--pico-background-color`, etc., mapped separately for light and dark themes

**`base.css`** — Utility variables consumed by all component CSS:
- `--spacing-*` spacing scale (multiples of Pico's spacing unit)
- `--text-*` font-size scale
- `--border-*` border variants
- Heading typography overrides and the breakpoint reference comment

**`components.css`** — Shared classes: `.btn` variants, `.badge`, `.alert`, `.diagram-*`.

Each component and page has its own co-located CSS file. No preprocessor — files are merged into a single CSS file per page and served directly.

## Color System

`pico-theme.css` uses two naming layers. Work with the Pico role variables in component CSS; reference the raw materials only when defining new theme rules.

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

### Pico Role Variables (per-theme)

| Variable | Light | Dark | Use on |
|---|---|---|---|
| `--pico-primary` | Crimson | Gold | Headlines, CTAs, accents |
| `--pico-secondary` | Iron grey | Blood red | Borders, backgrounds |
| `--pico-contrast` | Black | White | Stark blocks, `.btn-neutral` |
| `--pico-background-color` | Cream | Charcoal | Page surface |
| `--pico-code-background-color` | Newsprint | Slate | Secondary surface (cards, code blocks) |
| `--pico-color` | Black | Chalk | Body text |
| `--pico-muted-color` | Graphite | Ash | Secondary labels, captions |
| `--pico-muted-border-color` | Black | Concrete | Standard border color |

`--color-accent` is outside Pico's role system: mustard (light) / concrete grey (dark). Use it for icon highlights and structural accents — not text.

### Color on Text

`--pico-primary` and `--pico-color` are the only role variables that reliably pass WCAG AA contrast on the theme backgrounds. `--pico-secondary` is a mid-tone in both themes and shouldn't appear as text. Color belongs on borders, backgrounds, and geometric elements — a thick crimson border-top on a card carries more visual weight than a crimson heading anyway.

## Typography

**Display** (`var(--font-display)`, Bebas Neue): headings, nav items, step numbers, uppercase labels. Global `letter-spacing: 0.05em` is applied in `base.css` to all heading elements. Don't remove it.

**Body** (Barlow, `font-weight: 500`): set via `--pico-font-family` and `--pico-font-weight`. Default for all other text.

**Font sizes**: Use `var(--text-xs)` through `var(--text-2xl)` for `font-size` declarations. Raw rem values belong in `base.css` only, where the scale is defined.

**Heading scale**: `h1` and `h2` override `--pico-font-size` in `base.css`, with a responsive bump at 768px. `h1` uses `--pico-h1-color: var(--pico-primary)` so top-level headings are automatically crimson/gold.

## Border System

The constructivist visual weight comes from border geometry, not shadows. Four weights are defined in `base.css`:

| Variable | Value | Typical use |
|---|---|---|
| `--border-2` | 2px solid muted border color | Cards, dividers, form elements |
| `--border-4` | 4px solid muted border color | Structural separators (sidebar) |
| `--border-accent-4` | 4px solid primary | Section dividers (footer top, page dividers) |
| `--border-accent-8` | 8px solid primary | Major emphasis (hero hr, alert left border) |

These apply to any border side: `border: var(--border-2)`, `border-top: var(--border-accent-4)`, `border-left: var(--border-accent-8)`.

Cards typically combine `border: var(--border-2)` with a heavier directional border (`border-left-width: 6px` or `border-top-width: 8px`) for structural emphasis.

## Layout Conventions

**Zero border radius** — `--pico-border-radius: 0rem` in `pico-theme.css` applies globally to all Pico components. Don't add `border-radius` in component CSS.

**No shadows** — `--pico-box-shadow: none` (and card, button, dropdown equivalents) is set globally. Use border weight for depth, not shadows.

**No transitions** — `--pico-transition: 0s`. Hover states change instantly.

**Breakpoints** (Pico's standard scale, documented in `base.css`):
`sm` 576px / `md` 768px / `lg` 1024px / `xl` 1280px / `xxl` 1536px.
The site uses `576px` for mobile nav collapse, `768px` for layout switches, `1024px` for sidebar behavior.

**Spacing**: Use `var(--spacing-*)` throughout. The scale runs from `--spacing-4xs` (0.1× Pico unit) to `--spacing-6xl` (6× Pico unit).

## Buttons

`.btn` base class from `components.css`, with variants:

| Class | Fill | Text | Use |
|---|---|---|---|
| `.btn-primary` | Crimson | White | Primary action |
| `.btn-neutral` | Black | White | Secondary action |
| `.btn-base` | Transparent | Black | Tertiary / inline |
| `.btn-square` | Transparent | — | Icon-only |

All buttons use `border-bottom-width: 4px` for a structural slab weight. Hover states swap fill colors — no lift, no shadow, no transition.

`.btn-neutral` is the default secondary CTA. `.btn-base` reads as too light for most contexts.

## Adding New UI

When building a new component or page section:

- **Visual emphasis**: Reach for border weight and background color, not text color. `border-top: var(--border-accent-4)` on a section header reads stronger than making the heading crimson.
- **Cards**: `border: var(--border)` + a heavy directional border side. Background: `var(--pico-code-background-color)` (newsprint/slate) to lift from page surface.
- **Labels and badges**: Use `var(--font-display)` + uppercase + `var(--text-xs)` or `var(--text-sm)`. See `.badge` in `components.css`.
- **Dividers**: `border-top: var(--border-accent-4)` with a constrained `max-width` for decorative separators; `border-top: var(--border-heavy)` for structural ones.
- **Icons**: Match `color: currentColor` or `color: var(--pico-primary)` depending on whether the icon is structural or decorative.
