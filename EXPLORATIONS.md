# Explorations

Castro is a playground. Things get built from scratch here on purpose — but
only some things. This file is the filter, written down after learning it the
hard way.

## The filter

A new exploration has to pass all four:

1. **Fits in one head.** The entire surface — code, concepts, failure modes —
   stays readable in one sitting. Signals was ~160 lines; bare-css is a handful
   of token and element files. If it needs a directory tree to navigate, it's
   already too big.

2. **No ecosystem tail.** The thing must be useful with only the code in this
   repo. Anything whose usefulness depends on tooling that would also have to
   be built — editor support, language servers, plugin ecosystems — is out, no
   matter how small the core is. `.castro` files died here: the compiler was
   small and worked; making the _format_ pleasant to write meant rebuilding
   what funded teams maintain for `.astro`/`.svelte`/`.vue`.

3. **Teaches one thing.** Each build exists to learn a specific mechanism:
   the SSG → bundling and islands, signals → fine-grained reactivity,
   bare-css → tokens instead of a framework. When the learning is done and
   only integration work remains, stop.

4. **Replaces something actually used here.** bare-css replaced Pico CSS, most
   of which was overridden or unused anyway. A build with no consumer in this
   repo is a demo, and demos rot.

## Scale reference

- The SSG itself: the ceiling. Months of refinement — don't casually reopen it.
- signals / castro-jsx / bare-css: the sweet spot. Days, not weeks.
- A bundler, a file format, an editor extension: over the line, regardless of
  how the first prototype feels.

## Past experiments, preserved as tags

- `frameworks-plugin-api` — last commit where the user-facing plugin API
  existed: config-loaded plugins registering island frameworks.
- `multi-framework` — plugin API removed, but the framework registry still in
  core: Preact, Solid, and castro-jsx islands side by side. Solid was overkill
  for islands; the registry was later collapsed to Preact-only.
- `castro-jsx-revived-with-dsl-v0` — the castro-jsx runtime, signals, and a
  working `.castro` DSL compiler (frontmatter + template + `{}` holes →
  `createElement` calls). Reverted: the runtime and compiler passed
  the filter, the file format failed rule 2.

## Candidates to experiment with

1. DOM morphing for live reload — my top pick. Right now a rebuild sends reload over SSE and the browser does a full page reload: scroll position lost, form state lost, island state lost. The upgrade: fetch the new HTML, diff it against the live DOM, and patch in place (what idiomorph/morphdom do — ~300 lines for a respectable version). It passes every rule: bounded algorithm you can hold in one head; zero ecosystem tail; the consumer is your own dev loop, every single day; and the learning is real — tree-walking, node identity, attribute reconciliation. And there's a poetic angle: this repo's whole thesis is "no virtual DOM, no diffing" — and here's the one place where diffing is genuinely earned, in the dev server where it makes every rebuild feel instant. The thing you refused at runtime, welcomed where it belongs.

2. View-transition navigation ("turbo-mini"). ~100–150 lines of client script: intercept same-origin link clicks, fetch the next page, swap it in through document.startViewTransition(). Teaches a modern platform API most people haven't touched, and makes a static site feel app-like for near-zero cost. One honest warning: head-merging and script re-execution are exactly where Turbo/htmx ballooned — you'd need to fence it hard ("naive head swap, islands re-hydrate, that's it"). Also note it composes with #1: same swap mechanics, two consumers.

3. Island inspector overlay. A dev-only panel (you already have the shadow-DOM error overlay as a pattern) listing each <castro-island> on the page: its directive, hydration state, props, when it fired. Smallest of the three, teaches instrumentation, and gives the islands runtime the observability it currently lacks. A good "one evening" build if #1 feels too big to start.

And two that your filter correctly rejects, which is worth seeing because it proves the doc works:

- Static full-text search (pagefind-mini — inverted index at build time, tiny client) — genuinely great learning, right size, but fails rule 4 today: the site is one landing page and a 404. Nothing to search. Shelve it; it becomes viable the day the site grows content.

- Hand-rolled string SSR to replace preact-render-to-string — tempting because the branch proved it's only ~140 lines. But it reopens the refined core for zero user-visible gain, and the learning already happened on the branch. Rules 3 and the scale reference both say no.
