# Landing page copy — recovered vocabulary

## Why this document exists

This project (a static site generator, personal hobby software) has gone
through several tonal eras: fully satirical at launch, then progressively
sanitized into serious marketing copy, then stripped to bare minimalism,
then back to a plain/serious landing page — while the docs section stayed
informational throughout and should **stay that way**. The only surviving
joke on the current landing page was an orphaned footer line ("Workers of
the web, unite!") and one live island (`PropagandaRadio`); even the hero
copy explicitly disclaimed the bit ("The satire is optional. The code is
serious.").

The person driving this wants to reverse that drift — **specifically on
the landing page, not the docs** — because the project's whole premise is
self-aware and unserious (the name is a pun on Astro; the whole thing
exists because Astro felt too complex, and Eleventy too messy for personal use,
not because anyone is trying to compete with them). The goal is for a
first-time visitor to understand within seconds that this isn't trying to
be a serious competing SSG — before they read a single sentence of prose,
ideally — the way the old `no:pasaran`/Five-Year-Plan/Ministry-of-Truth
material used to land it.

This document is the raw material for that rework: everything below
existed on the site at some point and was cut during the sanitization pass
that culminated in commit `7f5efe5` ("trim the website"), recovered via
git archaeology across two passes. Organized by where it lived on the
page. Verbatim quotes unless marked "(paraphrase)". **This is vocabulary,
not a plan** — nothing here is committed to being reused as-is; some of it
(the "Learn Island Architecture" framing, the plugin-era jokes) actively
conflicts with decisions already made about the current site and needs
adapting rather than copy-pasting. Two working islands recovered during
this effort (`FiveYearPlan`, `Redactor`) are committed at
`website/src/components/islandExamples/` but not wired into any page yet.
Also see the "Decision" note under Directives below — restoring the
original directive names (`no:pasaran`, `lenin:awake`, etc.) alongside
their punchlines is the current direction, since the reason they got
sanitized (this project briefly aiming to be an adoptable framework for
others) no longer applies.

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
honest move would be to not use an island there at all. Turns out a past
version of this project already had this exact conversation with itself:
at `5af7a7c`, `no:pasaran`'s showcase description read _"Component renders
at build time only. In practice, use a regular Component.tsx if you don't
need interactivity. **This directive is here for the memes.**"_ — shipped
self-awareness, one commit before the whole thing got deleted at `9877a85`.
That's the sarcasm option, already written, just needs a new home.

That same commit (`5af7a7c`) also shipped a dedicated component for the
`no:pasaran` demo card, **`BureaucraticPermit.island.tsx`**, deleted one
commit later at `9877a85` — lived for exactly one commit:

```
FORM 27B/6 — REQUEST FOR CLIENT-SIDE INTERACTIVITY
☐ Component requires user interaction
☐ Static HTML is insufficient
☐ I have read the Party's rendering guidelines
[SUBMIT REQUEST]
FORM STATUS: PERMANENTLY PENDING
```

— with a large rotated watermark reading **"JS DENIED"** stamped diagonally
across the card. All checkboxes and the button are disabled; nothing on
the form can ever be submitted, which is the joke: the form itself
performs the "permanently pending" request it describes.

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

## More gems (deeper archaeology pass)

Second pass through the full `80bc1b1..7f5efe5` range (181 commits), looking
specifically for what the first pass missed. `no:pasaran`'s `BureaucraticPermit`
island and its "here for the memes" line are folded into the directives
section above since they answer that section's open question directly;
everything else new is here.

### Directive slogans not yet captured

The doc already has the original three (`no:pasaran`/`lenin:awake`/
`comrade:visible`) and notes `comrade:idle`→`comrade:patient` existed
later without quoting its copy. It went through three slogans across three
commits:

- `"Work when nobody else is busy"` — as `comrade:idle`, `b7b107b`
- `"Oh don't mind me, I'll hydrate when everyone else is done"` — renamed
  to `comrade:patient`, `0d1e8bf`
- `"Serves the collective once the essential work is complete."` — later
  copy pass, `e2af088`

`comrade:eager` (the renamed `lenin:awake`) also got its own replacement
slogan once "the leader is always ready" was lost to the rename:
**"Some comrades wait. This one doesn't."** (`135f460`, reused through
`e2af088`). A "live demonstration" caption from the same era (`e2af088`):
_"Before hydration, it is pure, state-approved HTML. Upon intersection, the
`comrade:visible` directive executes, the Preact runtime is distributed,
and the component becomes interactive."_ — bureaucratic verbs
(state-approved, distributed) laid over ordinary hydration mechanics. None
of this survives; `core/src/jsx.d.ts` and `docs/islands.md` are flat
technical prose only today.

### 404 page — one line never restored

The 404 page is the only page whose voice survived intact to HEAD, but it
wasn't always this short. Full original, commit `63b6c39` (first commit in
the whole range):

```
This page has been redacted by the Ministry of Truth.
It never existed.

Perhaps it was a counter-revolutionary element that needed correction.

[Return to the Collective]
```

The first two lines and the button are exactly what's in
`website/src/pages/404.tsx` today. The middle line — **"Perhaps it was a
counter-revolutionary element that needed correction."** — was cut at
`11e8e25` ("switching to daisyUI - p1", a restyle commit with no reason to
touch copy) and never came back.

### Redactor's earlier drafts

The doc has the final shipped version (`FIELD REPORT № 2847`). Two earlier,
distinct drafts existed before it landed there:

- **`b7b107b`/`5af7a7c`** — no field-report framing yet, just three toggled
  lines: _"The recent harvest was poor → **GLORIOUS**. The tractors are old
  and unreliable → **MAGNIFICENT**. Worker morale has declined →
  **SKYROCKETED** since the last policy change."_ Toggle button:
  `APPLY STATE CENSORSHIP`.
- **`f42acaa`** — adds the field-report chrome, but numbered **"FIELD
  REPORT № 1947"** (not 2847 — the number changed later), same
  harvest/tractor/morale content. Toggle: `APPLY STATE CENSORSHIP` →
  `✓ CENSORSHIP ACTIVE — REVEAL TRUTH`.
- **`ff745bd`** — toggle wording becomes `SUBMIT FOR REVIEW` →
  **`✓ APPROVED BY THE MINISTRY OF TRUTH`** — a direct callback to the 404
  page's Ministry of Truth, in the doc above. Lost before the final
  "APPROVED FOR DISTRIBUTION" wording shipped — the callback never made it
  to the version that got recovered into
  `website/src/components/islandExamples/Redactor.island.tsx`. Worth
  reconsidering: "APPROVED BY THE MINISTRY OF TRUTH" ties two separate
  jokes on the site together; "APPROVED FOR DISTRIBUTION" doesn't reference
  anything else.

### Error messages — a lost joke, and a whole deleted feature

`castro.config.ts` used to have a **`messages: "satirical" | "serious"`**
option — a user-facing toggle to turn the entire bit off, with `satirical.js`
and `serious.js` as two complete implementations of the same interface.
Removed at `d5c82ff` ("use a single satirical voice for messaging") — the
satirical preset was inlined as the only voice, which is consistent with
where this doc is trying to push things back to, but the point stands that
the joke used to be optional at the infrastructure level, not just the
landing page.

One error factory died alongside the plugin system removal that same day
(`e5cc3c9`) and was never replaced with an equivalent joke:

```js
CACHE_WRITE_FAILED: ({ path, errorMessage }) => ({
  title: "Cache write failed",
  message: `Compiled output at ${path} could not be requisitioned:`,
  hint: "Check disk space and write permissions",
}),
```

"Could not be **requisitioned**" for a plain disk-write failure — small
event, grand verb, exactly the shape the messages README asks for. Today's
equivalent (if one exists) uses plain phrasing.

Also from the plugin-system era, `FRAMEWORK_CONFIG_INVALID`: _"Plugin has
incomplete **papers** — missing: X"_, hint: _"Fill in the missing fields to
**pass inspection**."_ Plugin-specific, so not directly revivable (the
plugin system is gone), but the papers/inspection framing is reusable
vocabulary for any other validation error.

### Config docs — the satire made explicit as a feature

From `2a6c546` ("tighten the docs"), before the docs became "usage only,
plain informational" per `website/CLAUDE.md`:

- `port` option: _"The port the dev server listens on. 3000 is the
  default. **The Party has no strong feelings about this.**"_
- `messages` option (back when it was configurable, see above): _"Controls
  CLI output tone. 'satirical' wraps build output in communist bureaucracy
  humor. 'serious' delivers the same information without the ideology.
  **Both are equally correct. Only one is more fun.**"_
- On the island marker plugin: _"Your page never ships the interactive
  component code. **The Party has already arranged for it to be delivered
  separately, on demand.**"_

All three died with the docs-overhaul pass. Not for reviving in docs
now — you've already decided docs stay plain — but the register ("no
strong feelings," "equally correct, only one is more fun") is good hero/
footer material: it's self-aware about the bit existing at all, which is
close to what you're going for on the landing page.

### DESIGN.md — the original design manifesto

`035b8a5`'s original `website/DESIGN.md` (dev-facing, not visitor copy, but
worth knowing about since it explains the _reasoning_ behind the visual
register you're trying to get back to):

> "The Castro website is **a Soviet Constructivist propaganda poster, not a
> SaaS landing page**. Every design decision should serve that aesthetic."
>
> "Constructivism relies on **visual violence**... The satirical framing...
> only works if the design commits fully. Muddiness, softness, or
> SaaS-ness **breaks the joke**."

Section header: _"What 'Gentle SaaS' Looks Like (Avoid This)."_ Rewritten to
flat descriptive prose by `cfcb9f5`; today's `website/DESIGN.md` opens with
the much tamer "The Castro website uses a Soviet Constructivist
aesthetic... This document describes the design system." Same information,
zero commitment to the bit — a documentation-level instance of the exact
drift this whole doc is tracking.

One more from this era, a now-deleted dev-only style-guide page
(`e099577`, "add /theme page"): every row of its typography-scale specimen
used **"The workers seize the means of production."** as filler text at
every font size instead of lorem ipsum. Small, but a good instinct — even
internal tooling stayed in character.

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
