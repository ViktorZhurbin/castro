# Castro

### The People's Framework

**Your Five-Year Plan to Understand Your Framework**

_Bun. Preact. ~1350 lines. Islands. Possibly overplanned._

_"The satire is optional. The code compiles."_

**[Get Started]** **[Read the Source]**

## The Means of Production

A static site generator built on Bun and Preact. JSX and Markdown go in, static HTML comes out. Interactive islands where you need them.

The core is about 1,350 lines of commented source — small enough to read in one sitting. It includes dev server, structured errors, file-based routing, and more.

## The Production Cycle

**Collection**
Castro walks pages directory, resolving each file to a route.

**Rendering**
JSX and Markdown render to static HTML at build time. Islands are wrapped in
a `<castro-island>` marker. Pages with no islands ship no hydration runtime
at all — the cost only exists where you use it.

**Hydration**
HTML reaches the browser and is readable immediately. Each `<castro-island>`
then loads its bundle according to its directive — or never does.

## The Standing Directives

Each island receives a directive from the Central Committee. The directive determines when — and whether — its JavaScript reaches the browser.

**`comrade:eager`** — _"Some comrades wait. This one doesn't."_ / _"Ready before you asked"_
Hydrates on page load. Use for components the user reaches for immediately.

**`comrade:visible` (default)** — _"Only work when the people are watching" / "Labour begins when the inspector arrives."_
The component hydrates when it scrolls into view. Default behavior.

**`comrade:patient`** — _"Work when nobody else is busy" / "Serves the collective once the essential work is done." / "Takes the shift nobody else wants."_
Hydrates during browser idle time. For important content that isn't critical-path.

<!-- Should read as commentary on the list above rather than a phantom member of it. -->
<aside>
  There was a fourth, `no:pasaran`. It didn't hydrate anything, which was the point, which was also why it isn't here.
</aside>

## DEMONSTRATION

Identical `LabourRecord` components, one per directive, each reporting on its own hydration.

_[live LabourRecord — `comrade:eager`]_
↑ Reported for duty before you finished reading this line.

_[live LabourRecord — `comrade:visible`]_
↑ Was still an unhydrated record until this card entered the viewport.

_[live LabourRecord — `comrade:patient`]_
↑ Waited for the browser to run out of more important work.

## A FRAMEWORK SMALL ENOUGH TO READ

Castro is a working static site generator, not an attempt to replace civilization.

The implementation stays small enough to inspect, follow, and change.

You can trace the build pipeline. You can see where rendering happens. You can see when an island receives JavaScript.

The code is the explanation.

**[Read the Source]**

**PROLETARIANS OF THE BUILD STEP, UNITE.**
**THE OUTPUT DIRECTORY BELONGS TO THE PEOPLE.**

[About] [GitHub]

_Built with Castro | The People's Framework_

---

Build both, use #1 for now:

1. **Note on the island example — `LabourRecord`:** a personnel card showing the component's own status (`ON THE ROSTER — NOT YET REPORTED` before hydration; on hydration it stamps the time since page load and the bytes delivered, and enables a `REPORT FOR DUTY` counter button). PropagandaRadio, FiveYearPlan and Redactor are satirical toys bolted onto behaviour that has nothing to do with hydration — the joke and the demonstration run on separate tracks. Here the card's content _is_ the hydration event, so the bureaucratic frame and the technical thing being shown are the same object, and the difference between the four directives is visible on the page instead of in the Network tab.

2. **Island demo note:** Replace PropagandaRadio / FiveYearPlan / Redactor with a single component called **`CentralCommittee`** — a live build-stats panel that "reports" Castro's own last build: pages rendered, islands hydrated by directive, total JS shipped. Real numbers, state-bureaucracy framing. Better fit than the three precedents because it's about the tool itself (self-aware, not decorative), the data is always true (no confected scenario), and the joke is the same one the page is making — a planning apparatus applied to something one person built in an afternoon.
