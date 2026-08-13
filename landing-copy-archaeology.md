# Landing page copy — recovered vocabulary

Everything below existed on the site at some point and was cut during the
sanitization pass that culminated in commit `7f5efe5` ("trim the website").
Organized by where it lived on the page. Verbatim quotes unless marked
"(paraphrase)". Not a plan — just raw material.

## Hero

Ran from the very first landing page (`80bc1b1`) through the brutalist era,
died at `7f5efe5`.

- Kicker under the logo: **THE PEOPLE'S FRAMEWORK** — currently only survives
  in the `<title>` tag (`Castro - The People's Framework`), never rendered
  on the page itself.
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
prose only. The directive _names_ `no:pasaran`/`lenin:awake` are gone from
the code, not just the copy — reviving the slogans doesn't require reviving
the old names, they can reattach to whatever directives exist now
(`comrade:visible`, `comrade:eager`, `comrade:patient`).

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
