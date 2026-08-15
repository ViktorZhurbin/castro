# Landing page copy — recovered vocabulary

Everything below existed on the site at some point and was cut during the
sanitization pass that culminated in commit `7f5efe5` ("trim the website").
Organized by where it lived on the page. Verbatim quotes unless marked
"(paraphrase)". Not a plan — just raw material.

## The original landing page (`80bc1b1`, Jan 25) — full text

The very first landing page this project ever had, the day it got a website
at all. Before any of the sanitization passes. Full committed, no hedging
anywhere — the joke lives in proper nouns and headers, the prose paragraphs
underneath stay plain and technical. This is the strongest reference for
"don't take this seriously," stronger than anything from the brutalist era
quoted below.

> **[star emblem]**
>
> # Castro
>
> ### The People's Framework
>
> **The Educational Island Architecture Framework**
> **(That Happens to Be Communist)**
>
> _"The satire is optional. The knowledge is real."_
>
> **[Read the Manifesto]** **[View Source Code]** **[Start Tutorial]**
>
> ---
>
> ## The Revolutionary Directives
>
> Learn how modern SSGs work by reading ~1500 lines of well-commented code.
> Three hydration strategies. Zero configuration.
>
> **no:pasaran** — _"They shall not pass (to the client)"_
> Component renders at build time. No JavaScript shipped to client. Pure
> static HTML for maximum performance.
> _[live counter demo]_
> ↑ Try clicking. Nothing happens. Zero JS was sent to your browser.
>
> **lenin:awake** — _"The leader is always ready"_
> Component becomes interactive immediately on page load. Full
> interactivity from the start.
> _[live counter demo]_
> ↑ This counter is interactive immediately. JS loaded on page load.
>
> **comrade:visible** — _"Only work when the people are watching"_
> Component hydrates when scrolled into viewport. Lazy loading with
> IntersectionObserver. Default behavior.
> _[live counter demo]_
> ↑ JS loads when scrolled into view. Open DevTools Network tab to verify.
>
> ---
>
> ## How The Revolution Works
>
> Island architecture explained. No magic, just smart progressive
> enhancement.
>
> **1 — Build Time**
> Castro compiles your pages and renders all islands to static HTML. Every
> component gets server-side rendered, creating instant visual content.
>
> **2 — Browser Receives HTML**
> Pure HTML arrives first. Your page is visible immediately. No waiting for
> JavaScript bundles. Islands are wrapped in `<castro-island>` custom
> elements.
>
> **3 — Selective Hydration**
> JavaScript loads based on your directive. `no:pasaran` stays static.
> `lenin:awake` hydrates immediately. `comrade:visible` waits for viewport
> intersection.
>
> **4 — Interactive Islands**
> Components become interactive exactly when needed. Fast initial load,
> progressive enhancement, minimal JavaScript. This is island architecture.
>
> ---
>
> **Workers of the Web, Unite!**
> **Seize the Means of Rendering.**
>
> [About] [GitHub]
>
> _Built with Castro | The People's Framework_

`/manifesto` and `/tutorial` were dead links from day one — never built.
`/about` didn't exist yet either (came later at `9684d9d`). All three CTA
targets, not two — "Start Tutorial" is a third button this early version
had that no later version kept.

## Hero (later eras)

- Kicker under the logo: **THE PEOPLE'S FRAMEWORK** — currently only survives
  in the `<title>` tag (`Castro - The People's Framework`), never rendered
  on the page itself.
- Original tagline (`80bc1b1`, see above): **"The Educational Island
  Architecture Framework (That Happens to Be Communist)"**
- Tagline (brutalist era, `7580509` → `514b420`): **"Your Five-Year Plan to
  Learn Island Architecture"**
- Quote line (present from the start, killed at `7f5efe5`): **"The satire is
  optional. The knowledge is real."** — replaced by the current, weaker
  rhyme: "The satire is optional. The code is serious."

Current hero has none of these — just "A Static Site Generator Built to Be
Read" and the flat "code is serious" line.

## Section headers

- **WHAT THE PARTY OFFERS** — header over the feature-card grid. Grid itself
  is gone entirely from the current landing (no equivalent section).
- **HOW THE REVOLUTION WORKS** — header over the pipeline explainer, present
  from `80bc1b1` through `28b90ea`. Downgraded to "HOW IT WORKS AT RUNTIME"
  (`40bf571`), then to today's flat **HOW IT WORKS**.

## Feature card copy

- `~1500 LINES OF CODE` (later `~1300`) — a feature card built around the
  LOC count itself as the pitch: _"A working Static Site Generator in ~1500
  lines of well-commented code. Learn island architecture by reading the
  source."_ Replaced by the blander "READABLE BY DESIGN."

## The live directive demo ("THE REVOLUTIONARY DIRECTIVES")

Biggest loss. From `80bc1b1` through `f32618b`, the landing page had a live
grid of three real hydration-directive counters, each with its own slogan:

| Directive         | Slogan                                   | Caption under the demo                                                     |
| ----------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| `no:pasaran`      | "They shall not pass (to the client)"    | "↑ Try clicking. Nothing happens. Zero JS was sent to your browser."       |
| `lenin:awake`     | "The leader is always ready"             | "↑ This counter is interactive immediately. JS loaded on page load."       |
| `comrade:visible` | "Only work when the people are watching" | "↑ JS loads when scrolled into view. Open DevTools Network tab to verify." |

Demoted to a standalone `/showcase` page at `f32618b`, then gutted:
`no:pasaran` deleted outright (`9877a85`), `lenin:awake` renamed to
`comrade:eager` (`135f460`, losing the personality-cult joke), `comrade:idle`
renamed to `comrade:patient` (`0d1e8bf`). None of the three slogans survive
anywhere today — `docs/islands.md` describes the same mechanics in flat
prose only.

Current directive names, for reference: `comrade:eager`, `comrade:patient`,
`comrade:visible` (`core/src/jsx.d.ts`). `comrade:visible` kept its original
name throughout every era. `no:pasaran` has no current equivalent at all —
it was deleted, not renamed, because "static, no JS" isn't really a
hydration directive, it's just... not using an island. `comrade:idle`/
`comrade:patient` (wait-for-idle-time) wasn't part of the original three;
it was added later, separately from the `no:pasaran` → nothing lineage.

### Decision: restoring the original directive names

The standardized names (`comrade:eager`/`comrade:patient`/`comrade:visible`)
happened during the period this project was aiming to be an educational
framework other people might actually adopt — sober, memorable, teachable
API surface made sense under that goal. That's no longer the goal; this is
personal software again. Current lean is to restore the original names
together with their punchlines (`lenin:awake` → "The leader is always
ready", etc.) rather than keep the sanitized names with the jokes bolted on
separately.

`no:pasaran` is the one exception worth thinking through before reviving:
semantically it never quite made sense as a _directive_, since an island
with no interactivity and no hydration isn't a variant of an island, it's
just a regular server-rendered component wearing an island's clothes — the
honest move would be to not use an island there at all. It could still come
back as pure sarcasm rather than a real functional directive: e.g. a joke
example in docs/marketing copy showing someone reaching for `no:pasaran`
and being told to just use a component, or a directive that exists in name
only and behaves identically to omitting the directive. Not settled yet —
flagged here rather than decided.

## Island examples

Recovered in full and committed separately (`website/src/components/islandExamples/FiveYearPlan.{tsx,css}`,
`Redactor.{tsx,css}`) — not wired into any page yet.

**FiveYearPlan** — click-to-work progress toy, deleted whole at `7f5efe5`:

- Header: `FIVE-YEAR PLAN` / `CYCLE #{n}`
- Readout label: `TRACTOR OUTPUT`
- Badges as progress climbs: `STAKHANOVITE PACE` (≥50%), `SATISFACTORY
TOIL` (≥25%)
- Default button label: **`WORK HARDER, COMRADE!`**
- On completing a cycle, one random fulfillment line flashes on the button:
  `QUOTA FULFILLED. QUOTA RAISED.` / `TARGET ACHIEVED. NEW TARGET ISSUED.`
  / `THE PLAN SUCCEEDS. THE PLAN CONTINUES.` / `OUTPUT NOTED. NORMS
ADJUSTED.`

**Redactor** — censorship toggle, also deleted at `7f5efe5`:

- Header: `FIELD REPORT № 2847`, classification badge (`CLASSIFICATION:
PENDING` → `CLASSIFICATION: APPROVED`)
- Toggled stats: Q3 grain output `43% of target` → `HISTORIC SURPLUS` ·
  District 7 tractors `3 of 11` → `ALL OF THEM` · Saturday brigade sign-ups
  `12%` → `UNANIMOUS`
- Button: `SUBMIT FOR REVIEW` → `✓ APPROVED FOR DISTRIBUTION`

**PropagandaRadio** (still live today) originally also had these headlines,
cut at `c20848b` and never restored: _"Harvest exceeds expectations by
400%"_, _"Framework stability improved by decree"_, _"Central Committee
approves new CSS standard."_

## Footer

Original, present from `80bc1b1`, restyled at `035b8a5`:

```
WORKERS OF THE WEB, UNITE!
SEIZE THE MEANS OF RENDERING.
```

The second line was cut at `edbf61a` when the footer was rebuilt into a
nav-link grid. Today's footer keeps only the first line, standing alone —
it wasn't written as a standalone joke, it lost its other half.

## Page names / routes

- **`/manifesto`** — linked from the CTA buttons ("Read the Manifesto")
  from the very first landing page through `f32618b`. Never actually
  built — a dead link the entire time it existed.
- **`/showcase`** — hosted the live directive demo, removed with it.
- **`/about`** — existed `9684d9d` → `7f5efe5`, contained the line _"The
  communist theme makes it memorable. The lessons are real."_

## Misc

- README closing line (`f32618b`, cut, never restored): _"From each
  component according to its complexity, to each page according to its
  needs."_ — parody of "from each according to his ability..."
- `MIT — The people's license` — still in the current README, no revival
  needed.

---

## Trying out "Your Five-Year Plan to Learn Island Architecture"

The original works because "Five-Year Plan" (grand, ideological) collides
with "learn a web framework" (small, mundane) — that's the gap the
messages README calls the actual joke. Problem: "Learn Island Architecture"
is no longer accurate framing — the current site's own IA docs
(`website/CLAUDE.md`) deliberately keep the landing page from teaching
island architecture; that's `docs/islands.md`'s job now. Reusing it as-is
would contradict a decision you've already made about the site.

Swapping only the back half, keeping "Your Five-Year Plan to ___":

- **"...Ship Less JavaScript"** — ties directly to what islands actually
  buy you; mundane and specific, which is what makes the grand framing
  funny rather than just grand-on-grand.
- **"...Read Your Own Framework"** — echoes the current (true, unfunny)
  descriptor "Built to Be Read" but gives it a joke chassis.
- **"...Escape Astro"** — the most honest one, since Castro's whole name is
  literally that wordplay, and the origin story you told me is exactly
  "Astro got too complex, I left." Riskiest — reads as a jab at a real
  project, and grandiose-plan-to-quit-a-framework is a slightly different
  joke shape (personal grievance vs. ideological absurdity).
- **"...Build a Static Site"** — safest, most literal, weakest joke; probably
  too flat to earn the "Five-Year Plan" setup.

**Decided: "Your Five-Year Plan to Ship Less JavaScript."** It's the actual
value prop, it's small and technical (the event side of the gap), and it
doesn't step on the docs-don't-teach-architecture decision.
