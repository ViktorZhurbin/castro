# Testing Backlog

Known coverage gaps, deferred deliberately. Each entry says what is uncovered, what breaks silently today, and the approach that was judged right — enough to act on without re-deriving the analysis.

Ordered by value per line of test. Everything cheaper than these has already landed.

## 1. The dev server's testable surface is accidental

`resolveStaticFile` and `debounceRebuilds` are tested because they are the only two exports. Everything else lives inside the ~250-line `startDevServer()` closure in `core/src/dev/server.js` and is unreachable:

- `isIgnored()` — the editor-temp-file denylist glob
- the **mtime-changed predicate** in `watchDir`
- `broadcast()`'s dead-controller eviction
- the 404 → `404.html` fallback, gated on the `Accept` header

The mtime filter is the one that earns the extraction. CLAUDE.md gives it a full paragraph: it is a macOS-FSEvents-only guard against a self-rebuild loop, invisible on Linux, explicitly flagged as "don't treat it as dead code when testing there." An untested platform-specific guard whose failure mode does not reproduce on the other platform is the canonical thing that rots unnoticed. That is what justifies it against the brevity default — it is not defensive code surviving an edge case, it is a documented behavioral guard with no pin.

**Approach**

- Extract the mtime predicate and `isIgnored` to module scope and export both. Test directly; no fixture needed.
- `broadcast()` and the 404 fallback need no extraction — start `Bun.serve` on port 0 in-process, `fetch` it, assert. That also covers the `Accept: text/html` branch and the SSE endpoint holding a connection open, which is the live-reload transport's only would-be test.

**Fix the latent constraint while in here.** `core/src/dev/server.test.js` calls `process.chdir()` at module scope, and its own docblock admits this is safe _only because Bun runs one test file at a time_. That is a constraint on the whole suite, not just that file — parallel test files would break it. `OUTPUT_ROOT` resolving lazily instead of at module scope removes both the `chdir` and the constraint.

Estimated 2-3 hours for both halves.

## 2. Hydration is never executed

`core/src/dev/liveReload.js` (177 lines) and `core/src/islands/castroIsland.js` (157 lines) — ~9% of core, both in the bucket CLAUDE.md says earns its lines on purpose — have no test that runs them.

The attribute-contract test at the bottom of `tests/site/verify.test.js` pins the _names_ both sides of the seam agree on, and nothing more. Uncovered: the `IntersectionObserver` and `requestIdleCallback` branch selection, the `hydrate()` path, error handling for a failed dynamic import, and the entire error overlay.

**What breaks silently:** the observer branch stops firing, or the overlay stops rendering a payload field. The contract test still passes, because the attribute names never moved.

**Approach, and why it is deferred**

Real coverage needs a DOM — `happy-dom` registered via `bun test --preload`, then mount a `<castro-island>`, drive the upgrade, assert the component hydrated. The price is one devDependency and a second execution environment to keep working, against 334 lines readable in one sitting. That is a genuine tension with the brevity default, not an oversight.

Re-evaluate once entry 1 lands. The question to answer then: has anything in these two files actually broken without being noticed? If not, the contract test may be the right permanent ceiling.

Note: this is a question about whether the _project_ ships a DOM unit test. It is unrelated to verifying UI changes by hand, which stays manual either way.

## Known limitation of the `tests/site` layer

Build-time throws cannot be pinned per-test. `tests/site/verify.test.js` builds once in `beforeAll`, so any regression that makes the build throw aborts the whole file as a single failure — the individual tests never run. Coverage of a build-time guard therefore comes from the _fixture existing_, not from the assertion.

This is why the `{null}` / `{undefined}` island children in `pages/comrade-eager.tsx` are load-bearing: mutation testing confirmed that narrowing the guard to reject `null` escapes the entire suite without them, and is caught by the build failing with them. Don't delete a fixture because its assertion looks redundant.

## Working practice

Every entry above should be verified the way the landed ones were: **write the test, then break the code it covers and confirm it goes red.** Also confirm whether any pre-existing test catches the same mutation — if one does, the new test may not be adding what it claims. A test that cannot go red is worth less than the lines it costs.

## Not on this list, on purpose

Filtered against "Two Forces" in the root CLAUDE.md — testing these would assert the opposite of intended behavior: output-path collisions, dev-server input hardening (`/%ZZ`, traversal), dead-island elimination, production concurrency, runtime config validation, cross-platform paths.

Also rejected: a coverage-percentage gate. In a repo whose default is to delete code that merely survives an edge case, a ratchet incentivizes exactly the tests that rule wants gone. `bun test --coverage` as a one-time diagnostic to locate seams is fine.
