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
