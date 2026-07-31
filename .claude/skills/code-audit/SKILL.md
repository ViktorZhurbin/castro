---
name: code-audit
description: Run a code-audit pass over a package or directory, producing one findings doc (fixes come later, batched by theme). Use when the user says "/audit", "audit this package", "do an audit of X", or asks for a systematic pass over a codebase area to find inconsistencies, dead abstractions, doc/code drift, or untested seams — as opposed to fixing a specific known bug.
---

# Code audit

A repeatable pass over a package or directory. Produces **one findings doc**;
fixes come after, batched by theme. Do not fix anything while auditing —
that's step 4, and it should be a decision the user signs off on, not
something that happens inline.

If the user gave a target (a package, a directory), audit that. If not, ask
which package/directory before starting — don't guess at scope.

## 0. Size it first

```sh
find <target> -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) | xargs wc -l | sort -rn
```

Match the glob to what the target actually uses — a JSDoc-typed `.js` codebase
and a `.ts`/`.tsx` codebase can coexist in the same monorepo (e.g. `core/` vs.
`website/`); don't drop either from the count.

CSS modules, fixtures, and other non-`.ts(x)` files a flow touches can carry
real bugs too — an undefined CSS custom property is as dead as an
unreachable branch. Widen the glob to whatever the flow actually reads.

File count × average length picks the granularity — decide from the numbers,
never default to "go file by file":

- **Many small files** (<100 lines avg) → problems live in the **boundaries**:
  needless indirection, one-caller helpers, concepts with two names. Trace
  flows. A file-by-file read scores each file "fine" and finds none of it.
- **Few large files** → problems live inside them. Read them directly.

## 1. Trace each flow in execution order

Find the entry points, follow the data. Write down only: where data changes
shape, where a hop adds nothing, where one concept has two names.

Note any **contract spanning two flows** (a build→runtime seam, a
serialization boundary). Those are the highest-consequence and usually the
least tested — every unit test on either side can pass while the whole thing
is broken.

## 2. Read the project's own docs against the source

Highest yield per minute, and the step most often skipped. Published docs,
README, CLAUDE.md. Look for:

- syntax the docs teach that no test covers
- examples that don't actually run
- behavior documented nowhere near the code that implements it
- the public API the docs imply vs. what's actually exported

Divergence is a finding in **either** direction — the doc may be right and
the code wrong, or the reverse.

## 3. Consistency sweep, mechanically

Grep across every file at once: comment style, naming, prop handling, error
construction, `type` vs `interface`. "Inconsistent" is a property of the
_set_ — invisible when reading one file at a time.

## Rules while auditing

**Don't fix during the read.** Local decisions made before the global
picture is in are how fragmented code gets more fragmented. Batch fixes by
theme afterward.

**Assume intent before defect.** Odd code is often load-bearing. Before
"fixing" anything that implies a design decision: check the docs, then ask
the user — odd code has turned out to be deliberate design more than once.

**Verify by executing, not reading.** Force values into assertion failures
to read them off the diff (Vitest suppresses `console.log`). To prove a test
actually guards something, break the source and confirm it fails — this is
how overstated findings get caught.

**Record corrections.** When a finding turns out wrong or overstated, remove it from
the output doc.

**Tag breaking vs. internal as you go.** Nearly free during the pass,
expensive to reconstruct later — and it's what makes the doc usable for
release planning.

## 4. Fix, batched by theme

Only after the user signs off on the findings. Each fix is new code and gets
judged as new code — the finding justifies changing something, it does not
pre-approve whatever you write.

**Re-read the project's stated non-goals before writing the fix.** Most
codebases name things they deliberately don't handle (this one: `CLAUDE.md`
→ "Two Forces"). A defensive branch, cache, or compatibility shim has to
clear that bar like any feature would — an audit is an easy place to smuggle
in code the project already decided not to have.

**A fix that needs its own guard is bigger than the finding.** If patching X
opens Y and you write a second block to close Y, stop and price the pair
against just leaving X alone. Net lines matter, and so does the fact that
the second block is now load-bearing for a problem that didn't exist before.

**When the fix removes a capability, grep for what only existed to serve
it.** Coercions, `| false` unions, optional returns, fallback branches — the
feature goes, the scaffolding stays, and it reads as intentional forever
after.

**Prove the fix on the real path.** Tests passing isn't the same as running
the thing. Anything touching user-facing output — messages, logs, error
rendering — gets read with your own eyes at least once, including boring
values (0, 1, empty).

**Adding the Nth copy of a file is a finding, not a fixture.** Before a fix
lands new fixtures/configs/test sites, check what the existing ones already
duplicate. Widening an existing fixture usually beats cloning one.

**Comment the non-obvious fact once, then stop.** Earn the lines by saying
what a reader can't infer from the code — not by narrating the fix or
restating the finding. Write it once, at the site a reader hits first; if it
doesn't fit in a couple of lines, its home is the module docblock or
`CLAUDE.md`.

**A rename is finished only when the new rule holds everywhere.** If a
renamed symbol's doc has to say "or" ("absolute or project-relative"), the
name lost — that ambiguity is what the rename was supposed to kill. Sweep
every call site and every doc comment, or don't rename.

## The output doc

One `AUDIT.md` file, amended in place as items resolve. It
must be readable **cold**, by someone with no context:

- findings, each with severity and a breaking/internal tag

**Nothing committed may reference it.** Not a code comment, not a test, not
another doc — no "see AUDIT.md #3". The doc is deleted at the end of the
pass, so every pointer becomes a dead link. Where a fix needs the rationale,
write it at that line instead of citing the doc.

## Retiring findings as they resolve

The findings doc is temporary. As each finding resolves:

1. **Give durable content a home before compressing the entry.**
   Deferred work, a confirmed-intentional oddity goes in the package's `CLAUDE.md`.
   A rationale the code needs goes in a comment at the relevant line.
   Nothing to home? The finding likely wasn't durable enough to need one.
2. **Then remove the entry**. Early on, the doc's job is proving findings
   are real; near the end it's tracking what's still open — don't leave
   resolved items.
