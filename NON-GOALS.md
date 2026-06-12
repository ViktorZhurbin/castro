# Non-Goals

Castro is a working SSG, but not a hardened one. The cases below are deliberately not handled. Code that defends against them obscures framework machinery without teaching anything, and should be cut rather than added.

When evaluating any defensive code path, ask: does this teach how a framework works, or does it survive one of the cases below? If the latter, it's a candidate for deletion with a comment linking here.

## Cross-platform compatibility

Castro assumes a posix filesystem (Linux, macOS, WSL). Internal paths are posix throughout; we don't normalize Windows separators, handle case-insensitive collisions, or test against Windows-native Bun.

## Graceful recovery from missing project structure

Required directories (currently `pages/`) throw naturally when missing — no friendly fallback, no recovery. Optional directories (currently `public/`) are silently skipped. The distinction is documented per-directory; there is no general "is this required?" abstraction.

## Cache invalidation across processes or machines

Castro doesn't fingerprint dependencies for browser caches (no `?v=…` on vendor URLs), doesn't version artifacts for CDN deployment, and doesn't track build state across runs. Within a single dev session, content-hashed filenames cover module-cache busting; everything else is the user's hard-refresh.

## Production-grade concurrency

Page builds run as `Promise.all`. We don't bound concurrency to manage memory pressure under `Bun.build`, don't queue, don't retry. Sites with hundreds of pages will work; sites with thousands may not.

## Hostile or unusual filesystems

No retry on transient I/O errors. No defense against feedback loops from filesystem metadata (atime, indexer-triggered events, etc.) beyond what the OS-level watcher provides. Network filesystems and unusual mounts are out of scope.

## Runtime validation of typed configuration

If TypeScript can catch a misconfiguration at compile time, we don't re-validate it at runtime. Plain JS users get whatever runtime errors fall out naturally.

## User-facing extensibility

Castro is a small thing you read front-to-back, not a framework you extend. Although it's easy enough to implement (and both used to be implemented), there is no plugin API and no user-registered frameworks. The build pipeline talks to itself directly instead of through a hook system, because an extension API serves a user base the project isn't trying to have. Adding an abstraction "so users could plug in X" is the thing to cut, not add.

The plugin API, multi-framework islands, and the packages that implemented them (`castro-jsx`, `castro-solid`, `tailwind`) last worked at commit `fdf04bd` — check that out if a piece is ever worth salvaging (`castro-jsx` in particular).

## Backwards compatibility

Pre-1.0. Breaking changes land freely. There is no migration tooling, no deprecation cycle, no compatibility shims.
