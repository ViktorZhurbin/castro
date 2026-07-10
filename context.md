At this point, I want to put this project on hold, but I want to leave it in a good shape. I think that code wise it is in a good place at this point. I've had a few trimming rounds and I don't think I can trim more than that. And functionally it works for me. So I may even publish it so I can use it in my other projects when needed.

What's left is the website/. I have a few options for it. First, just unpublish it because currently the link to the website is attached to the repository and it serves as a sort of a business card for it but it's pretty much out of date and sort of in transition state at this point. Another option is to trim it down to just a landing page for the most part which explains what it is shortly without trying to go deeper, without trying to be educational as we abandoned that goal. And third would be to review what exists currently and just shape it up so that it's all coherent, it's up to date, and it's minimalist in spirit.

Here's a summary oriented around my earlier threads and decisions, with Claude responses condensed to what actually mattered. Quite a few changes happened afterwards, so some code references are out of date.

# THREAD 1

---

## What you started with

You asked for a critical read of `core/src/` to identify code that was trying too hard to be a real production SSG — edge-case handling and defensive plumbing that obscured the educational core. Underlying this was a tension you named explicitly: Castro as a _genuinely useful tool you'd use yourself_ vs. Castro as a _readable, educational artifact_. You floated the idea of two parallel projects — a working version and a distilled educational one — but couldn't see a clean sync strategy between them.

**Conclusion you reached:** not two projects. Cut the defensive plumbing from the single codebase, use a NON-GOALS.md as the explicit permission slip, and let the cuts make the source readable enough to write about.

---

## The plumbing audit

I read through all of `core/src/` and proposed a tiered list. The things we agreed to cut:

- `utils/paths.js` — Windows path normalization nobody needs on macOS/Linux
- `validateMeta()` in `buildPage.js` — runtime re-check of what TypeScript already types
- `resolvePkgVersion()` in `vendorDependencies.js` — 30-line filesystem walk to put `?v=` on import map URLs
- `runPool()` in `buildAll.js` — custom bounded concurrency, replaced with `Promise.all`
- The four watcher IIFEs in `dev/server.js` — collapsed into one `watchDir()` helper (mtime tracking kept but hidden inside it)
- The clean-URL candidate ladder in `dev/server.js` — simplified to a straightforward three-step resolution
- `process.exit(1)` indirection in `dev/server.js` (the `exitCode = 1` comment)
- The `onerror` handler in `liveReload.js` — logged and did nothing

The error system was initially my biggest cut candidate. You reframed that.

---

## The framing shift (your key move)

You said Castro was over-focused on islands, and that the educational scope should expand to _framework machinery in general_ — the error system, dev server, module cache, per-page async state, all of it. This flipped the error system from "noise obscuring the islands lesson" to "headline subsystem worth its own writeup." The right question for any piece of code became: does this teach how a framework works, or does it just survive edge cases? The latter is a cut; the former stays and gets documented.

This also resolved the two-projects tension. You don't need a parallel lite version if the source itself is clean enough to read, and the educational layer is a series of subsystem writeups anchored on the actual running code.

---

## NON-GOALS.md

You pushed back on "see Non-Goals" as a comment pattern — pointing to CLAUDE.md leads nowhere for real readers, and the original bullet list was too implementation-specific ("No `?v=…` on vendored URLs" won't make sense in a month).

The solution: a dedicated `NON-GOALS.md` at repo root with `h2`-anchored sections, so comments can link directly to a specific anchor (e.g. `// see NON-GOALS.md#cache-invalidation-across-processes-or-machines`). The sections are written principle-first with implementation details as parentheticals. Sections: cross-platform compatibility, graceful recovery from missing project structure, cache invalidation across processes, production-grade concurrency, hostile filesystems, runtime validation of typed config, backwards compatibility.

---

## The cuts that actually landed

Phase 1 executed: `paths.js` deleted, `validateMeta` gone, `resolvePkgVersion` gone, `runPool` → `Promise.all`, watchers collapsed, clean URLs simplified, `pages/` now fails loud. ~229 lines removed across 17 files.

You asked which of the cuts should get inline comments explaining the absence. Short answer: only where a future reader would think "shouldn't this handle X?" — the `pages/` missing-dir case, the vendored URL without a version string, and the clean-URL simplification. Everything else the absence is self-evident and a comment would just be noise.

---

## What's still open

Small remaining cuts identified in the final review pass — not blocking, but next logical step if you want another LOC pass:

- `try { Bun.serve() } catch` wrapper in `server.js` — the outer CLI catch handles it already
- SIGINT/SIGTERM explicit handlers — Bun handles these by default
- 404 fallback ladder — still library-grade compared to its simplified neighbors
- Runtime `if (!errorFn)` guard in `errors.js` — same logic as `validateMeta`, TypeScript covers it
- `PUBLIC_DIR` try/catch → `Bun.file().exists()` pre-check (cleaner pattern, no type assertion)
- `components/` ENOENT in `registry.js` → same

The bigger open question you're at now: which subsystem gets the first writeup? The structured error system was my suggestion — cleanest entry point, already has test artifacts, and it just got promoted from overhead to showcase.

---

# THREAD 2

**Starting tension.** I came in mid-deliberation about Castro's future. The "island architecture" positioning had given the project meaning, but I'd realized islands aren't actually that deep to teach — and that framing felt like an artifact of an earlier phase. I floated widening the scope to "teaching interesting pieces of a framework" (dev server, messaging, islands-in-detail) but couldn't recover a sense of meaning from the broader framing. Diagnosis I arrived at: the islands constraint felt like meaning _because it was a constraint_ — sharp, finishable, falsifiable. Widening removed the fence without building a new one.

**The deeper realization.** Working through it, I named the real shape: I'd been doing two things at once — an educational artifact and a working framework-product (docs, DX, messaging system, "wannabe Astro" phase). Going back to roots: I wanted an SSG with islands and JSX. I built one. Everything after was distribution strategy layered on something already complete. The educational angle was partly a justification scaffold to make six months of work mean something to others — and when I asked myself whether I actually care about "the community," the uncertainty was the answer. Conclusion: strip the secondary justification, return to the object.

**What that left me deciding between:**

- _Shrink to fit-in-head, front-to-back readable_ (naive-but-working, the Crafting Interpreters "spine" model). Appealing but the messaging system breaks the working-memory budget.
- _Keep it whole, drop educational framing_, let the satirical SSG stand as what it is.
- My writing aversion killed the "standalone dissection posts" option — I want code readable through naming, files, and comments, not prose. So the menu narrowed.

**The measurement.** We pulled the actual repo. Key finding: messaging was only ~12% of code and the cuttable part was "just two sets of strings" — **inlining it is a conceptual cut, not a size cut.** The real head-space cost was `islands/` (513 LOC), specifically the framework-registration abstraction and plugin system. Critical insight that emerged: **framework registration and the plugin system are the same abstraction at two layers** (a plugin's main job is registering a framework), and the plugin system had zero internal consumers except two island plugins that are really just build steps. Tailwind (its only non-framework user) was dead. So the whole thing folds into the builder.

**The decision I committed to.** Collapse all three together under one bet: _Castro is a small thing you read front-to-back, not a framework you extend._ Preact-only core, framework packages (Solid/castro-jsx) treated as residue, plugin system removed, satirical voice inlined to one voice — **but keep the structured `ErrorCode`-keyed error table** (renderer + golden tests depend on it; reduce messaging _around_ the error system, not through it). The guiding principle throughout: the LOC delta is modest; the win is conceptual surface.

**Outcome (verified by static review of the cutdown repo).** All three parts landed cleanly. 1,998 → 1,645 LOC; `islands/` 513 → 319; under the ~1,500 soft limit excluding messages. Zero residue of the deleted abstractions (no orphaned hooks, no size-1 sets, no generic-config lookups). Inlined `preact.js` reads as plain constants. `BUNDLE_FAILED` reporting moved to the compile path rather than degrading. Vendor splitting + the `preact/hooks` namespace re-export survived intact. Docs (`CLAUDE.md`/`NON-GOALS.md`) record the removals as honest history. Still unverified (needs Bun env): typecheck, test suite, a real build/dev smoke test — that's what the Claude Code review prompt covers.

**Still genuinely open** (the thing I said I'd sit with): whether "Preact-only, closed, read front-to-back" is the final positioning, or whether I keep it whole as the working tool. The cutdown branch is reversible by design — it's the experiment that resolves the question, not a commitment.

---
