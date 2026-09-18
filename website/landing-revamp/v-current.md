# CASTRO

### My Five-Year Plan to Build a Framework Over a Weekend

Bun, Preact. ~1350 lines.
Delivered in three months, ahead of schedule.

_The satire is optional. The code compiles._

**[Get Started]** **[Read the Source]**

---

## The Means of Production

A static site generator built on Bun and Preact. JSX and Markdown go in, static HTML comes out. Interactive islands where you need them.

```tsx
// pages/index.tsx
import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} />;
}
```

Pages with no islands ship no JavaScript at all — the cost only exists where you use it.

---

## The Standing Directives _(raised surface)_

Every island has a directive, written or not. It decides when — and whether — that island's JavaScript reaches the browser.

**comrade:visible** `DEFAULT`
_"Only work when the people are watching."_
Hydrates when the island scrolls into view. Right for most islands.

**comrade:eager**
_"Some comrades wait. This one doesn't."_
Hydrates as soon as the element mounts. For above-the-fold UI that can't wait.

**comrade:patient**
_"Takes the shift nobody else wants."_
Hydrates once the browser goes idle. For important UI that isn't on the
critical path.

> There was a fourth, `no:pasaran`. It didn't hydrate anything, which was the
> point, which was also why it isn't here.

---

## Demonstration

One island, `comrade:visible`. JavaScript was not downloaded for this card until
you scrolled to it. Open the Network tab and reload if you'd like to watch it
not happen.

_[FiveYearPlan island demo, comrade:visible]_

---

## Self-Criticism _(raised surface)_

Anyone can build a framework now. That is roughly the point, and it isn't the
whole story. A language model will write you a static site generator this
afternoon. It will also write you three more abstractions than you need, and it
will keep doing that indefinitely. Most of the work was removing things. The
~1,350 lines are what survived.

The existing tools are good. Astro carries more than I wanted to carry.
Eleventy asked me to assemble more than I wanted to assemble. I wanted JSX and
Markdown in, static HTML out, islands only where I ask for them. That is a
small want, and this is a small thing that satisfies it.

---

## A Framework Small Enough to Read

The commented source covers the dev server, file-based routing, structured
errors, the build pipeline, and the hydration runtime. Each module is meant to
fit in your head.

You can trace a page from file to route to HTML. You can see exactly where an
island's JavaScript gets requested. When something is wrong, you can find it.

**[Read the Source]**

---

**Workers of the Web, Unite.**
**Seize the Means of Rendering.**

_Built with Castro | The People's Framework_ · [GitHub] · MIT · © 2026-present
