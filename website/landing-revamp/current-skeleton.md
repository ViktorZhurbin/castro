```md
# CASTRO

### A Five-Year Plan to Understand One's Own Framework

Bun, Preact. ~1350 lines.
Delivered in three months, ahead of schedule.

_"The satire is optional. The code compiles."_

**[Get Started]** **[Read the Source]**

---

## The Means of Production

A static site generator built on Bun and Preact. JSX and Markdown go in, static HTML
comes out. Interactive islands where you need them.

Each island carries a directive. It decides when — and whether — that island's
JavaScript reaches the browser.

**comrade:visible** `DEFAULT`
Hydrates when the island scrolls into view. Right for most islands.

**comrade:patient**
Hydrates once the browser goes idle. For important UI that isn't on the critical path.

**comrade:eager**
Hydrates as soon as the element mounts. For above-the-fold UI that can't wait.

> There was a fourth, `no:pasaran`. It didn't hydrate anything, which was the point,
> which was also why it isn't here.

---

## The Production Cycle *(raised surface)*

**01 — COLLECTION**
Castro walks the pages directory, resolving each file to a route.

**02 — RENDERING**
JSX and Markdown render to static HTML at build time. Islands are wrapped in a
`<castro-island>` marker. Pages with no islands ship no hydration runtime at all —
the cost only exists where you use it.

**03 — HYDRATION**
HTML reaches the browser and is readable immediately. Each `<castro-island>` then
loads its bundle according to its directive — or never does.

---

## Demonstration

JS loaded when the card scrolled into view. Check with Network tab open

_[FiveYearPlan island demo, comrade:visible]_

---

## A Framework Small Enough to Read *(raised surface)*

The core is about 1,350 lines of commented source — dev server, structured errors,
file-based routing, and the rest of it. Small enough to inspect, follow, and change.

You can trace the build pipeline. You can see where rendering happens. You can see
when an island receives JavaScript.

**[Read the Source]**

---
**Workers of the web, unite.**

_Built with Castro | The People's Framework_ · [GitHub] · MIT · © 2026-present
```
