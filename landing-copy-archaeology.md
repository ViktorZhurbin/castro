# Recovered copy — putting the register back

_Scratch file. Draft material for one rework; delete it once that lands. Git
keeps it if it's ever needed again._

## What this is

Castro is personal software. It exists because Astro was too complex and
Eleventy too messy for a React developer's taste — both grown over years into
extended APIs, and Astro heavy with it. What was actually wanted was smaller:
JSX that turns into static HTML, with optional islands here and there, minimal
overhead, minimal learning curve. That's what this is — it isn't competing with
anything.

The project has been through several identities: purely satirical at the start,
then serious with satire pushed to the edges (the `messages/` system is the
surviving piece of that era), then an educational artifact, then stripped to
pure minimalism — docs deleted, a landing page that just explained what it does.
It has now come full circle back to the first idea.

The website is dogfooding — the demo site built with the framework, and a space
to experiment (see `EXPLORATIONS.md` for ideas parked for later). Its landing
page is currently in the register of the minimalist era: boring, serious,
implicitly competing. That's the wrong register. A first-time visitor should
understand within seconds, ideally before reading a sentence of prose, not to
take this seriously.

**Scope.** The landing page is the priority, but the rework isn't confined to
it: directive names in `core/src/jsx.d.ts`, the `messages/` prose, and the
README are all user-facing and all in scope. There are zero external users, so
breaking changes are free — a directive rename costs a find-and-replace across
pages that one person wrote. **The docs section is the exception** and stays
plain informational (`website/CLAUDE.md`).

**Everything below is draft material, not a plan.** It's copy that existed on
the site at some point, recovered from git and annotated from today's
perspective — what it was, why it died, whether it still fits. Nothing here has
been decided. Some actively conflicts with how the site works now: the "Learn
Island Architecture" framing contradicts the docs-teach-islands split, and the
plugin-era jokes reference a system that no longer exists. Those need adapting,
not copy-pasting. Open threads are collected at the bottom.

Verbatim quotes unless marked "(paraphrase)". Two working islands recovered
during this effort — `website/src/components/islandExamples/FiveYearPlan.island.tsx`
and `Redactor.island.tsx` (each with a sibling `.css`) — are committed but not
wired into any page yet.

## The original landing page (`80bc1b1`, Jan 25) — full text

The first landing page the project ever had, the day it got a website at all,
before any sanitization pass. Fully committed, no hedging anywhere — the joke
lives in proper nouns and headers while the prose paragraphs underneath stay
plain and technical. This is the strongest reference for "don't take this
seriously," stronger than anything from the brutalist era quoted below.

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

---

# By place on the page

## Hero

- Kicker under the logo: **THE PEOPLE'S FRAMEWORK** — today it survives only in
  the `<title>` tag (`Castro - The People's Framework`), never rendered on the
  page itself.
- Original tagline (`80bc1b1`): **"The Educational Island Architecture
  Framework (That Happens to Be Communist)"**
- Tagline (brutalist era, `7580509` → `514b420`): **"Your Five-Year Plan to
  Learn Island Architecture"**
- Quote line (present from the start, killed at `7f5efe5`): **"The satire is
  optional. The knowledge is real."** — replaced by the current:
  "The satire is optional. The code is serious."

## Section headers

- **WHAT THE PARTY OFFERS** — header over the feature-card grid. The grid itself
  is gone entirely; the current landing has no equivalent section.
- **HOW THE REVOLUTION WORKS** — header over the pipeline explainer, present
  from `80bc1b1` through `28b90ea`. Downgraded to "HOW IT WORKS AT RUNTIME"
  (`40bf571`), then to today's flat **HOW IT WORKS**.

## Feature cards

- `~1500 LINES OF CODE` (later `~1300`) — a card built around the LOC count
  itself as the pitch: _"A working Static Site Generator in ~1500 lines of
  well-commented code. Learn island architecture by reading the source."_
  Replaced by the blander "READABLE BY DESIGN." The number still holds:
  `bun loc` reports 1364 lines of core code today, so a revived card would read
  ~1350.

## The directive demo ("THE REVOLUTIONARY DIRECTIVES")

The biggest loss. From `80bc1b1` through `f32618b` the landing page had a live
grid of real hydration-directive counters, each with its own slogan. It was
demoted to a standalone `/showcase` page at `f32618b`, then gutted. None of the
slogans survive anywhere today — `docs/islands.md` describes the same mechanics
in flat prose.

### Name lineage

| Original (`80bc1b1`) | What happened                                                | Today             |
| -------------------- | ------------------------------------------------------------ | ----------------- |
| `no:pasaran`         | deleted outright, `9877a85`                                  | no equivalent     |
| `lenin:awake`        | renamed, `135f460`                                           | `comrade:eager`   |
| `comrade:visible`    | untouched through every era                                  | `comrade:visible` |
| —                    | `comrade:idle` added later (`b7b107b`), renamed at `0d1e8bf` | `comrade:patient` |

`no:pasaran` was deleted rather than renamed because "static, no JS" isn't
really a hydration directive — it's just not using an island (see Open threads
below for whether it comes back anyway). `comrade:idle` / `comrade:patient`
(wait-for-idle-time) wasn't part of the original three and has no connection to
the `no:pasaran` lineage. Current names live in `core/src/jsx.d.ts`.

### Slogans, by directive

**`no:pasaran`** — _"They shall not pass (to the client)"_
Caption: _"↑ Try clicking. Nothing happens. Zero JS was sent to your browser."_

**`lenin:awake`** — _"The leader is always ready"_
Caption: _"↑ This counter is interactive immediately. JS loaded on page load."_
After the rename to `comrade:eager` cost it that line, it got a replacement:
**"Some comrades wait. This one doesn't."** (`135f460`, reused through
`e2af088`).

**`comrade:visible`** — _"Only work when the people are watching"_
Caption: _"↑ JS loads when scrolled into view. Open DevTools Network tab to
verify."_
A "live demonstration" caption from the same era (`e2af088`): _"Before
hydration, it is pure, state-approved HTML. Upon intersection, the
`comrade:visible` directive executes, the Preact runtime is distributed, and
the component becomes interactive."_ — bureaucratic verbs (state-approved,
distributed) laid over ordinary hydration mechanics.

**`comrade:idle` / `comrade:patient`** — three slogans across three commits:

- _"Work when nobody else is busy"_ — as `comrade:idle`, `b7b107b`
- _"Oh don't mind me, I'll hydrate when everyone else is done"_ — renamed to
  `comrade:patient`, `0d1e8bf`
- _"Serves the collective once the essential work is complete."_ — later copy
  pass, `e2af088`

### `no:pasaran`'s self-aware version, and its demo island

A past version of the project already had the "is this even a directive"
conversation with itself. At `5af7a7c`, `no:pasaran`'s showcase description
read: _"Component renders at build time only. In practice, use a regular
Component.tsx if you don't need interactivity. **This directive is here for the
memes.**"_ — shipped self-awareness, one commit before the whole thing was
deleted at `9877a85`.

That same commit shipped a dedicated component for the `no:pasaran` demo card,
**`BureaucraticPermit.island.tsx`**, deleted one commit later — it lived for
exactly one commit:

```
FORM 27B/6 — REQUEST FOR CLIENT-SIDE INTERACTIVITY
☐ Component requires user interaction
☐ Static HTML is insufficient
☐ I have read the Party's rendering guidelines
[SUBMIT REQUEST]
FORM STATUS: PERMANENTLY PENDING
```

— with a large rotated watermark reading **"JS DENIED"** stamped diagonally
across the card. All checkboxes and the button are disabled; nothing on the
form can ever be submitted, which is the joke: the form performs the
permanently pending request it describes.

## Island examples

### FiveYearPlan

Click-to-work progress toy, deleted whole at `7f5efe5`, now recovered to
`website/src/components/islandExamples/FiveYearPlan.island.tsx`:

- Header: `FIVE-YEAR PLAN` / `CYCLE #{n}`
- Readout label: `TRACTOR OUTPUT`
- Badges as progress climbs: `STAKHANOVITE PACE` (≥50%), `SATISFACTORY TOIL` (≥25%)
- Default button label: **`WORK HARDER, COMRADE!`**
- On completing a cycle, one random fulfillment line flashes on the button:
  `QUOTA FULFILLED. QUOTA RAISED.` / `TARGET ACHIEVED. NEW TARGET ISSUED.` /
  `THE PLAN SUCCEEDS. THE PLAN CONTINUES.` / `OUTPUT NOTED. NORMS ADJUSTED.`

### Redactor

Censorship toggle, also deleted at `7f5efe5`, recovered to
`Redactor.island.tsx`. The shipped version:

- Header: `FIELD REPORT № 2847`, classification badge (`CLASSIFICATION: PENDING`
  → `CLASSIFICATION: APPROVED`)
- Toggled stats: Q3 grain output `43% of target` → `HISTORIC SURPLUS` ·
  District 7 tractors `3 of 11` → `ALL OF THEM` · Saturday brigade sign-ups
  `12%` → `UNANIMOUS`
- Button: `SUBMIT FOR REVIEW` → `✓ APPROVED FOR DISTRIBUTION`

Three earlier drafts, in order:

- **`b7b107b` / `5af7a7c`** — no field-report framing yet, just three toggled
  lines: _"The recent harvest was poor → **GLORIOUS**. The tractors are old and
  unreliable → **MAGNIFICENT**. Worker morale has declined → **SKYROCKETED**
  since the last policy change."_ Toggle button: `APPLY STATE CENSORSHIP`.
- **`f42acaa`** — adds the field-report chrome, but numbered **"FIELD REPORT
  № 1947"** (the number changed later), same harvest/tractor/morale content.
  Toggle: `APPLY STATE CENSORSHIP` → `✓ CENSORSHIP ACTIVE — REVEAL TRUTH`.
- **`ff745bd`** — toggle wording becomes `SUBMIT FOR REVIEW` → **`✓ APPROVED BY
THE MINISTRY OF TRUTH`**, a direct callback to the 404 page. Lost before the
  final "APPROVED FOR DISTRIBUTION" wording shipped, so the callback isn't in
  the recovered file.

### PropagandaRadio

Still live today, and the only island on the current landing page. Three
headlines it used to carry:

- _"Framework stability improved by decree"_ and _"Central Committee approves
  new CSS standard"_ — both cut at `c20848b`.
- _"Harvest exceeds expectations by 400%"_ — not cut there; `c20848b` reworded
  it to _"Harvest exceeds **projections** by 400%"_, which survived until
  `0735afd` (Aug 3, "fix island example"). See the provenance note at the
  bottom: that's outside the range both archaeology passes swept.

## Footer

Original, present from `80bc1b1`, restyled at `035b8a5`:

```
WORKERS OF THE WEB, UNITE!
SEIZE THE MEANS OF RENDERING.
```

The second line was cut at `edbf61a` when the footer was rebuilt into a nav-link
grid. Today's footer keeps only the first line, standing alone — it wasn't
written as a standalone joke, it lost its other half.

## 404

The only page whose voice survived intact to HEAD, though it wasn't always this
short. Full original, `63b6c39` (the page didn't exist yet at `80bc1b1`):

```
This page has been redacted by the Ministry of Truth.
It never existed.

Perhaps it was a counter-revolutionary element that needed correction.

[Return to the Collective]
```

The first two lines and the button are exactly what's in
`website/src/pages/404.tsx` today. The middle line — **"Perhaps it was a
counter-revolutionary element that needed correction."** — was cut at `11e8e25`
("switching to daisyUI - p1", a restyle commit with no reason to touch copy)
and never came back.

## Routes and page names

- **`/manifesto`** — linked from the CTA buttons ("Read the Manifesto") from the
  very first landing page through `f32618b`. Never built; a dead link the entire
  time it existed.
- **`/tutorial`** — the third CTA on the original landing only. Also never built.
- **`/showcase`** — hosted the live directive demo, removed with it.
- **`/about`** — existed `9684d9d` → `7f5efe5`, contained the line _"The
  communist theme makes it memorable. The lessons are real."_

---

# Illustrations

The one part of the site that was never really attempted: the jokes have always
been text.

## Assets that exist

**`website/assets/space-castro.jpg`** — cartoon Fidel in a spacesuit with a
cigar, "CUBA LIBRE" stencilled on the chest, red-star shoulder patch, planets
behind. The project in one picture, and the reason this whole thread started.
**Not a candidate for the site as it is** — it's a visual reminder that
illustration is an option at all, kept around so the idea doesn't get lost
again. Anything that ships would need drawing to the site's register.

**`website/castro-build-time.png`** (`6bd6cd7`, deleted at `e3cebed`) — a
constructivist BUILD TIME infographic: factory, gears, cream/black/red, one
conveyor labelled "Static HTML" and another "Isolated JS". Never on the landing
page; it was a docs-era diagram. Recoverable from git, and it's the clearest
existing sample of the register `DESIGN.md` was originally describing.

## Prompts that survive without images

From `website/docs-outline/` (added `12b6863` Mar 8, deleted `b452ad4` Mar 21) —
an educational-era plan for a "Codebase Tour" that never shipped. Each section
carried an illustration prompt:

- _"A stylized digital illustration of Fidel Castro in a 1960s Soviet spacesuit,
  smoking a cigar. He is holding two identical blueprints. One blueprint has a
  server rack drawn on it, and the other has a web browser window. The
  background is a starry space scene with a subtle red tint."_ — the same
  character as `space-castro.jpg`, but doing something specific (the dual
  compile: one island, two builds).
- _"A cartoonish border checkpoint booth. A file folder labeled
  'Counter.island.tsx' is trying to cross. A stern border guard with a red star
  on his hat is confiscating the folder and handing back a rubber-stamped piece
  of paper that says '<castro-island>'."_ — the marker plugin, exactly.
- _"A retro-futuristic constructivist propaganda poster. A giant, mechanical
  printing press (representing the Build Pipeline) is stamping out thousands of
  identical paper documents (Static HTML), while a separate, glowing red
  conveyor belt carefully transports small, vibrant terrariums (Interactive
  Islands) to the front."_

Its section titles were jokes over plain technical goals: **"The Means of
Production"** (build pipeline), **"The Dual Mandate"** (island compilation),
**"The Checkpoint"** (interception and markers) — each with a stated "Vibe":
_"a grand, top-down view of the factory floor"_, _"bureaucratic redundancy that
actually makes sense"_, _"border control and passport swapping."_

The same outline states the composition rule the `80bc1b1` landing page follows
without naming it:

> **"Satire as a Wrapper:** The jokes are confined to the section titles ("The
> Means of Production") and the illustrations, leaving the technical explanation
> pure and easy to digest."

It's why the original landing page works and why the sanitized versions don't:
the jokes were never load-bearing on the explanation, so removing them didn't
clarify anything — it just removed the jokes.

---

# Beyond the landing page

## Error messages (`core/src/messages/`)

The one subsystem where the voice survived.

## Config docs

From `2a6c546` ("tighten the docs"), before the docs became usage-only. Docs
stay plain, so these aren't for reviving where they came from — kept for the
register:

- `port`: _"The port the dev server listens on. 3000 is the default. **The Party
  has no strong feelings about this.**"_
- `messages` (back when it was configurable): _"Controls CLI output tone.
  'satirical' wraps build output in communist bureaucracy humor. 'serious'
  delivers the same information without the ideology. **Both are equally
  correct. Only one is more fun.**"_
- On the island marker plugin: _"Your page never ships the interactive component
  code. **The Party has already arranged for it to be delivered separately, on
  demand.**"_

"No strong feelings about this" and "equally correct, only one is more fun" are
self-aware about the bit existing at all — close to what the landing page is
reaching for.

## DESIGN.md

`035b8a5`'s original `website/DESIGN.md` (dev-facing, but it explains the
reasoning behind the visual register):

> "The Castro website is **a Soviet Constructivist propaganda poster, not a SaaS
> landing page**. Every design decision should serve that aesthetic."
>
> "Constructivism relies on **visual violence**... The satirical framing... only
> works if the design commits fully. Muddiness, softness, or SaaS-ness **breaks
> the joke**."

Section header: _"What 'Gentle SaaS' Looks Like (Avoid This)."_ Rewritten to
flat descriptive prose by `cfcb9f5`; today's `website/DESIGN.md` opens with the
much tamer "The Castro website uses a Soviet Constructivist aesthetic... This
document describes the design system." Same information, zero commitment — a
documentation-level instance of the exact drift this doc tracks.

A now-deleted dev-only style-guide page (`e099577`, "add /theme page") used
**"The workers seize the means of production."** as filler text at every size in
its typography specimen, instead of lorem ipsum — even internal tooling stayed
in character.

## README

- Closing line (`f32618b`, cut, never restored): _"From each component according
  to its complexity, to each page according to its needs."_
- `MIT — The people's license` — still in the current README, no revival needed.

---

# Open threads

Questions this material raises. None are settled.

**Restoring the original directive names.** The standardized names
(`comrade:eager` / `comrade:patient` / `comrade:visible`) were chosen while the
project was aiming to be an educational framework others might adopt — a sober,
teachable API surface made sense under that goal, and the goal is gone. The lean
is toward restoring the original names together with their punchlines
(`lenin:awake` → "the leader is always ready") rather than keeping sanitized
names with jokes bolted on separately. The rename touches `core/src/jsx.d.ts`,
`docs/islands.md`, and every page using a directive — mechanical, and free.

**Whether `no:pasaran` comes back at all.** The "here for the memes" line above
is one answer to why it was never quite a real directive — shipped sarcasm,
already written, needing a new home — and `BureaucraticPermit` is a demo card
built for exactly this.

**Redactor's toggle wording.** "APPROVED BY THE MINISTRY OF TRUTH" ties the
island to the 404 page; "APPROVED FOR DISTRIBUTION" (what's in the recovered
file) references nothing else.

**A hero tagline.** "Your Five-Year Plan to Learn Island Architecture" works
because a grand ideological frame collides with a small mundane event — the gap
`messages/README.md` calls the actual joke. But "Learn Island Architecture" now
contradicts the site's own IA, where teaching islands is `docs/islands.md`'s
job. Keeping the frame and swapping the back half:

- **"...Ship Less JavaScript"** — ties to what islands actually buy you; mundane
  and specific, which is what makes the grand framing funny rather than
  grand-on-grand. Current front-runner.
- **"...Read Your Own Framework"** — echoes the current true-but-unfunny
  descriptor "Built to Be Read", with a joke chassis under it.
- **"...Escape Astro"** — the most honest, since the name is that wordplay and
  the origin story is exactly "Astro got too complex, I left." Riskiest: reads
  as a jab at a real project, and a grand plan to quit a framework is a
  different joke shape (personal grievance vs. ideological absurdity).
- **"...Build a Static Site"** — safest, most literal, probably too flat to earn
  the "Five-Year Plan" setup.

Unresolved either way: where it goes. Today's hero has three text lines (`h2`,
subtitle, quote). Does the tagline replace the `h2` or sit above it as a kicker,
and does "The satire is optional. The knowledge is real." return in the same
pass?

**Whether illustration becomes a thread at all.** An image lands before any
prose is read, which is exactly the stated goal, and three unshipped prompts
survive with a working recipe: joke in the title and the picture, plain
technical prose underneath. The border-checkpoint one maps onto the marker
plugin exactly. Against it: `space-castro.jpg` is a full-colour cartoon and the
site is cream, black, and one red, so anything that ships has to be drawn to the
site's register rather than dropped in — posterized, or framed as a stamped
poster panel. Different work from a copy pass either way, and copy comes first.

---

## Provenance

Recovered across two `git log` passes over `80bc1b1..7f5efe5` (363 commits) —
the first landing page through "trim the website", the commit that culminated
the sanitization — plus a later pass over deleted image assets and
`website/docs-outline/`.

That range is not the whole story. `0735afd` (Aug 3) removed a PropagandaRadio
headline more than a month after `7f5efe5`, which means the drift continued past
the range those passes swept. Anything after `7f5efe5` has not been searched.
