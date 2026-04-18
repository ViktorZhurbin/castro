# Parallelize page builds

## Context

AsyncLocalStorage-scoped `pageState` just landed, removing the race condition that made parallel builds unsafe. The remaining work is small — most shared state in the pipeline is either init-once/read-many (registries, config) or content-hashed/path-unique (compile cache, CSS outputs, HTML outputs). Three concrete changes are needed: **concurrency cap**, **log ordering**, **error semantics**. Nothing architectural.

Motivation: today a cold production build is linear in page count because each `buildPage()` awaits the next. Most of that time is `Bun.build` + `renderToString` + `Bun.write`, all of which release the event loop. A bounded `Promise.all` cuts wall time significantly for sites with dozens+ pages.

## What's already safe (verified)

- **Island tracking** — AsyncLocalStorage scopes `usedIslands`/`usedFrameworks` per page.
- **Compile cache** — `getModule()` uses content-hashed paths ([cache.js:62-68](core/src/utils/cache.js#L62-L68)). Idempotent writes for identical content; unique paths for different content.
- **Page CSS output paths** — derived from per-page `outputFilePath`; route-conflict detection already prevents collisions.
- **Page HTML writes** — per-page unique output path.
- **Islands registry, layouts registry, frameworkConfig cache** — init-once in `buildAll` before the page loop; read-only during page builds.
- **Plugin hooks** — `getPageAssets`/`getImportMap` are pure-ish (build new objects per call); `onPageBuild` runs before the loop; `onAfterBuild` after.
- **Idempotent lazy caches** — `_depsCache` in [dependencies.js:2](core/src/utils/dependencies.js#L2), `_liveReloadCache` in [writeHtmlPage.js:107](core/src/builder/writeHtmlPage.js#L107). Two concurrent readers can both do the first-time read; result is deterministic so the races are benign.
- **Dev server** — already serializes rebuilds via `debounceAsync` in [server.js:168](core/src/dev/server.js#L168). Parallelism here only speeds up production.
- **Error test goldens** — each error fixture runs a separate `castro build` subprocess with a single failing page; parallelism doesn't change per-test output.

## What needs to change

### 1. Concurrency cap — `core/src/builder/buildAll.js`

Unbounded `Promise.all` on hundreds of pages would spawn that many concurrent `Bun.build` calls. Bun.build is already worker-pooled internally, so stacking it doesn't help and hurts memory. Cap at CPU count.

Inline helper (no new dependency), put it next to `scanPages` in `buildAll.js`:

```js
/**
 * Run `tasks` with at most `limit` in flight at once. Preserves input order
 * in the results array. Fail-fast: first rejection aborts remaining work
 * that hasn't started, in-flight tasks still complete.
 *
 * @template T
 * @param {number} limit
 * @param {Array<() => Promise<T>>} tasks
 * @returns {Promise<T[]>}
 */
async function runPool(limit, tasks) {
  const results = new Array(tasks.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  });
  await Promise.all(workers);
  return results;
}
```

Default limit: `navigator.hardwareConcurrency || 4`. Expose as `config.concurrency` on `CastroConfig` so users can tune (esp. CI). Respect `CASTRO_CONCURRENCY=1` env var for debugging — forces sequential, makes failure traces readable.

### 2. Log ordering — `core/src/builder/buildAll.js:63-71`

Current code logs `messages.build.writingFile(sourcePath, outputPath)` *before* `buildPage(sourcePath)`. With parallel builds that emits lines in scan order but completion happens out of order — confusing when a build is slow because you see its "writing" line, then a different page finishes first.

Fix: log on completion instead. Rename the message semantically (it was always lying a little — it logged before the write). Options:

- **Simple**: keep current text, move log call to after `buildPage` returns.
- **Slightly better**: rename to `messages.build.wrotePage` / past tense, adjust both `serious.js` and `satirical.js`. Also regenerate error goldens if any reference this text.

Proposal: go with the simple move. The tense mismatch is minor and keeps the message module untouched.

### 3. Error semantics — `core/src/builder/buildAll.js`

Current behavior: sequential + `await` → first error stops the build immediately.

With `runPool` as written above: first rejection propagates; workers already running their current task finish, but no new tasks start. That matches the spirit of "fail fast" closely enough — in-flight builds only do a few more ms of work before the rejection surfaces.

Alternative considered: `Promise.allSettled` to collect all errors and report them as a batch. Attractive for CI logs, but changes UX (longer time to first error signal) and requires message plumbing to render multi-error output. **Not doing this in this change.**

One subtle thing: `CastroError` contains structured payload rendered via `renderErrorToTerminal`. Parallel builds producing multiple errors would interleave partial renders. With fail-fast semantics that's mostly a non-issue because only one error surfaces at a time. Worth verifying manually by breaking two pages and confirming the output is readable.

### 4. `pageState` aggregation — already correct

The existing loop does:
```js
const { usedFrameworks } = await runWithPageState(() => buildPage(sourcePath));
buildContext.usedFrameworks = buildContext.usedFrameworks.union(usedFrameworks);
```

Parallel version does the same union after each task resolves — the order of unions doesn't matter (`Set.union` is commutative). No change needed beyond wiring `runPool`.

## Files modified

- [core/src/builder/buildAll.js](core/src/builder/buildAll.js) — add `runPool`, replace page-build for-loop with `runPool(limit, tasks)`, move log call to after `buildPage`.
- [core/src/types.d.ts](core/src/types.d.ts) — add optional `concurrency?: number` to `CastroConfig`.
- [core/src/config.js](core/src/config.js) — no change needed; `concurrency` is just read via `config.concurrency ?? default`.

## Files NOT modified (intentionally)

- `marker.js`, `renderPage.js`, `buildPage.js`, `compileJsx.js`, `writeCss.js`, `writeHtmlPage.js`, registries, plugins — all already parallel-safe.
- Messages modules — keep "writing" wording; just log later.
- Dev server — unchanged; serialized rebuilds still make sense there.

## Verification

1. **Correctness first — sequential regression**: set `CASTRO_CONCURRENCY=1` and run `bun check`, `bun test:sites`, `bun test:errors`. Output should be byte-identical to pre-change.
2. **Parallel path**: default concurrency, run `bun test:sites` and `bun run build` in `website/`. Compare `dist/` to a sequential-build reference — every file should be byte-identical (HTML, CSS, islands JS, vendor, public copies).
3. **Stress test**: add a throwaway script that scaffolds 200 trivial pages, run production build with `time`. Expect sub-linear scaling vs. sequential baseline. Not committed — just a sanity check locally.
4. **Error UX**: break two pages simultaneously (syntax error in each), run build, confirm the surfaced error is still cleanly rendered and the build exits non-zero.
5. **Dev server**: run `bun run dev`, save a page with islands. Since dev debounces to a single build, parallelism should be invisible. Confirm live reload still emits correct per-page CSS and runtime.
6. **Error goldens**: `bun test:errors` — each golden runs a separate subprocess with one failing page, so output is unaffected. Verify anyway.

## Educational note

This pairs nicely with the ALS refactor as a teaching moment: "here's the hidden cost of a singleton, here's the native fix (ALS), here's what unlocks (bounded parallelism), here's why you still want a concurrency cap instead of pure `Promise.all` (worker-pool thrash on Bun.build)."

Worth a 3–4 line inline comment on `runPool` explaining why it's bounded, not a bare `Promise.all`.

## Out of scope / follow-ups

- **`Promise.allSettled` multi-error aggregation** — deferred; requires message plumbing and a UX decision.
- **Parallelizing layout/island compilation** (`layouts.load()`, `islands.load()` in `buildAll.js:55-56`) — those are already internally doing their own work; auditing them for parallelism is a separate change.
- **Dev server parallel rebuilds** — dev intentionally serializes; not changing.
