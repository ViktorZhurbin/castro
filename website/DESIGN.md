# Website Design Guidelines

The Castro website is a Soviet Constructivist propaganda poster, not a SaaS landing page. Every design decision should serve that aesthetic.

## The Aesthetic

Constructivism relies on **visual violence**: stark blacks and whites, pure reds, industrial iron, unbleached paper, heavy structural geometry. The zero-radius borders (`--radius-*: 0rem`) and Bebas Neue are non-negotiable anchors of this identity. Never soften them.

The satirical framing—communist state wrapping a JavaScript framework—only works if the design commits fully. Muddiness, softness, or SaaS-ness breaks the joke.

## Color Rules

### Use color structurally, not typographically

The biggest recurring mistake: applying `text-primary`, `text-secondary`, or `text-accent` to headings and body copy to "add color." This is the SaaS habit. It fails both the aesthetic and WCAG AA contrast.

**What to do instead:**
- Put color on borders, backgrounds, and structural elements
- Keep text stark: `text-base-content` or `text-primary` only
- A thick colored border-top on a card (like `FeatureCard`) carries more visual weight than colored text anyway

### Which colors belong on text

| Color | On text? | Why |
|-------|----------|-----|
| `primary` | ✓ Yes | High-contrast red (light) / gold (dark) — passes AA |
| `base-content` | ✓ Yes | This is the default text color — always safe |
| `secondary` | ✗ No | Industrial iron (light) / red (dark) — use for borders/backgrounds |
| `accent` | ✗ No | Gold (light) / grey (dark) — low contrast against cream/dark backgrounds |
| `neutral` | ✗ No | Use as background for high-contrast blocks |

### Never use `secondary` for text

`secondary` was the original mistake that caused contrast failures. In both themes it's a mid-tone that sits uncomfortably against the base colors. It belongs on borders, backgrounds, and structural dividers — not typography.

### Semantic colors (info/success/warning/error) are for alerts only

Don't reach for `text-success` to make something feel positive, or `text-warning` to add urgency. Semantic colors exist for `.alert` components and status indicators. Using them decoratively dilutes their meaning and usually fails contrast.

## Theme Color Reference

### Light theme (`castro`)
- `base-100`: Unbleached paper/cream — the page background
- `primary`: True Soviet Red — headlines, CTAs, bullets, accents
- `secondary`: Industrial Iron (dark grey) — structural borders, dividers
- `accent`: Propaganda Gold — structural highlights (borders, icons), never text
- `neutral`: Stark Black — high-contrast backgrounds (hero reverse blocks)

### Dark theme (`castro-dark`)
- `primary` flips to Gold (high contrast on charcoal)
- `secondary` becomes True Soviet Red
- `accent` becomes Concrete Grey
- Theme is halloween-industrial, not a simple dark inversion

## Typography

- **Headings** (`font-display`, Bebas Neue): use `letter-spacing: 0.05em` (handled globally by `.font-display` in `app.css`). Use `text-primary` for hero/section-level; `text-base-content` for subsection headers.
- **Body**: Barlow at `font-weight: 500`. Let it be black on cream. Don't add color to body text.
- **Prose** (`prose-castro`): docs pages (`layouts/docs.tsx`) render content inside `<main class="prose prose-castro">`. The `prose` class activates `@tailwindcss/typography` styles; `prose-castro` overrides the plugin's CSS variables with DaisyUI theme colors (configured in `app.css`).

## Layout & Structure

- Zero border radius everywhere — the theme variables handle this.
- Heavy borders over shadows — `border-2` or `border-t-8` conveys structure; `shadow-*` conveys SaaS softness
- `btn-neutral` (stark black/charcoal) as the secondary CTA — not `btn-outline`, which reads as "ghost" and gets lost
- Default alerts (no semantic class) get a thick `border-l-primary` left border via `app.css`. Semantic alerts (`alert-success`, `alert-warning`, etc.) use DaisyUI's built-in styling unchanged.

## What "Gentle SaaS" Looks Like (Avoid This)

These are patterns to actively reject:

- Soft gradient backgrounds
- Rounded cards or buttons
- Pastel or muted badge colors
- Colored text to differentiate sections (use borders or backgrounds instead)
- Hover shadows that lift cards
- Centered, narrow, paragraph-heavy hero sections with small fonts
- `secondary` or `accent` on headings

If a UI pattern would look at home on a Stripe or Vercel marketing page, it probably doesn't belong here.
