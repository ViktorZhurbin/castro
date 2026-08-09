# Testing

`bun test:site` builds and verifies `tests/site/`, which exercises the full pipeline with Preact islands (all directives, multiple islands per page, CSS modules, component composition, signals, and one island nested under `components/ui/` that pins nested bundle URLs — don't flatten it). The site mirrors a real project's structure — **use it as the reference for expected patterns** when you're unsure how something should be wired up. It also builds and verifies `tests/site-srcdir/`, a minimal fixture pinning the `srcDir` output contract — the only place in `tests/` that sets `srcDir`.

Its last section pins the hydration seam: the marker attributes the build emits, matched against `dist/castro-island.js` — the runtime is only ever read as text there, so this catches a rename on either side but never proves an island actually hydrates. Nothing does; that stays manual.

Sites are type-checked by `bun check`, which is load-bearing rather than incidental: hydration directives are typed `true` (not `boolean`), so `comrade:eager={false}` is rejected at compile time instead of being reinterpreted at runtime. `tests/site/types/islandContracts.tsx` holds `@ts-expect-error` pins for that rule and for islands-reject-children; it is never built, and a loosened rule surfaces as an unused-directive error.

`bun test:errors` runs the golden suite in `tests/errors/`, which covers the terminal renderer only. After changing `messages/` or `renderError.js`, regenerate goldens with `bun test:errors:up` and inspect the diff before committing. The browser overlay isn't golden-tested — verify it by hand: load an error case in the dev server and eyeball the overlay.
