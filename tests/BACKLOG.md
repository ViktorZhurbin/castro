# Testing Backlog

Known coverage gaps, deferred deliberately. Each entry says what is uncovered, what breaks silently today, and the approach that was judged right — enough to act on without re-deriving the analysis.

Ordered by value per line of test as each was written.

## 1. Hydration is never executed

`core/src/dev/liveReload.js` (177 lines) and `core/src/islands/castroIsland.js` (157 lines) — ~9% of core, both in the bucket CLAUDE.md says earns its lines on purpose — have no test that runs them.

The attribute-contract test at the bottom of `tests/site/verify.test.js` pins the _names_ both sides of the seam agree on, and nothing more. Uncovered: the `IntersectionObserver` and `requestIdleCallback` branch selection, the `hydrate()` path, error handling for a failed dynamic import, and the entire error overlay.

**What breaks silently:** the observer branch stops firing, or the overlay stops rendering a payload field. The contract test still passes, because the attribute names never moved.

**Approach, and why it is deferred**

Real coverage needs a DOM — `happy-dom` registered via `bun test --preload`, then mount a `<castro-island>`, drive the upgrade, assert the component hydrated. The price is one devDependency and a second execution environment to keep working, against 334 lines readable in one sitting. That is a genuine tension with the brevity default, not an oversight.

Re-evaluate the next time either file changes substantially. The question to answer then: has anything in them actually broken without being noticed? If not, the contract test may be the right permanent ceiling.

Note: this is a question about whether the _project_ ships a DOM unit test. It is unrelated to verifying UI changes by hand, which stays manual either way.

## What the dev-server tests still do not cover

The dev server's own entry is closed — `core/src/dev/server.js` now exports `resolveStaticFile`, `isIgnored`, `hasFileChanged`, `broadcast`, `createFetchHandler`, and `debounceRebuilds`, all tested. Two gaps survive on purpose:

- **`hasFileChanged`'s tests pin the predicate's logic, not the FSEvents rebuild loop.** That loop is unreproducible on Linux either way — don't read the green tests as covering the macOS guard end to end.
- **`watchDir` and `startDevServer` are still closure-scoped and untested.** Measured, not assumed: inverting the `!` in `if (!(await hasFileChanged(...))) continue;`, or deleting that line outright, leaves the whole suite green. Covering it means extracting the watch loop from the `for await`, which buys much less than the fetch-handler extraction did — the logic left in `watchDir` is three lines of glue.

`broadcast()`'s eviction guard is now pinned by "a dead connection is evicted without stopping the others." It looks like the defensive code CLAUDE.md deletes, and a probe on Bun 1.3.14 found a client disconnect never actually reaches it — but `broadcast` is called inside the try at `server.js` whose catch reports build failures, so a throwing `enqueue` would abort the loop mid-broadcast _and_ surface as a fabricated build error. The test pins the contract that matters regardless of how a controller dies: one stale connection must not cost the others their live reload.

## Known limitation of the `tests/site` layer

Build-time throws cannot be pinned per-test. `tests/site/verify.test.js` builds once in `beforeAll`, so any regression that makes the build throw aborts the whole file as a single failure — the individual tests never run. Coverage of a build-time guard therefore comes from the _fixture existing_, not from the assertion.

This is why the `{null}` / `{undefined}` island children in `pages/comrade-eager.tsx` are load-bearing: mutation testing confirmed that narrowing the guard to reject `null` escapes the entire suite without them, and is caught by the build failing with them. Don't delete a fixture because its assertion looks redundant.

## Working practice

Every entry above should be verified the way the landed ones were: **write the test, then break the code it covers and confirm it goes red.** Also confirm whether any pre-existing test catches the same mutation — if one does, the new test may not be adding what it claims. A test that cannot go red is worth less than the lines it costs.

Three lessons from the dev-server tests, all worth repeating:

- **Mutate the branch that _does_ something, not just the skips.** The two obvious mutations of `hasFileChanged` (drop the mtime compare, drop the `isDirectory()` skip) both target early returns. The one that mattered was the `catch`: a failed stat means the file was deleted and must **still** rebuild, so `catch { return false }` silently stops deletions from rebuilding — a user-visible dev-server regression that both obvious mutations leave green.
- **A green mutation can expose a weak pre-existing test.** Deleting the containment check in `resolveStaticFile` survived the whole suite, because `/` finds `dist/index.html` before it ever reaches the `dist.html` sibling — the assertion that claimed to cover it passed on candidate order alone. It took a second fixture whose output dir has no index to reach the check at all.
- **A surviving mutation sometimes means the code should go, not that a test is missing.** Deleting the explicit `Content-Type: text/html` from the 404 response changed nothing observable, because Bun infers the type from the extension — and the explicit spelling was actually dropping the charset the inference includes. The fix was to delete the header and assert the inferred outcome, not to pin a redundant line.

## Not on this list, on purpose

Filtered against "Two Forces" in the root CLAUDE.md — testing these would assert the opposite of intended behavior: output-path collisions, dev-server input hardening (`/%ZZ`, traversal), dead-island elimination, production concurrency, runtime config validation, cross-platform paths.

Also rejected: a coverage-percentage gate. In a repo whose default is to delete code that merely survives an edge case, a ratchet incentivizes exactly the tests that rule wants gone. `bun test --coverage` as a one-time diagnostic to locate seams is fine.
