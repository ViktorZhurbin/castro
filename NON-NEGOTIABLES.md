# Non-Negotiables

The counterweight to [NON-GOALS.md](./NON-GOALS.md). That file lists what brevity cuts; this one lists what brevity must **not** cut. These subsystems cost lines on purpose — they buy day-to-day DX, not framework lessons, so the "does it teach machinery?" test would wrongly flag them for deletion.

When a brevity pass reaches one of these, stop. If you're trimming inside one, keep the subsystem intact and cite this file in the comment (`// kept on purpose — see NON-NEGOTIABLES.md`).

Brevity is the default; these are the named exceptions. Anything outside this list still earns its lines by teaching framework machinery.

## Structured errors

`utils/errors.js`, `utils/renderError.js`, `dev/liveReload.js`, `messages/`.

One `CastroErrorPayload`, two renderers (terminal + browser overlay), structure decoupled from voice. The indirection is the part a trimmer will misread as over-engineering; it's what turns a raw stack trace into a scannable, actionable error surface.

## The satirical voice

`messages/` (rules in [core/src/messages/README.md](core/src/messages/README.md)).

Every user-facing string routes through `messages/` so the communist-satire voice stays consistent and the jokes stay at the edges (openings, closings, error punchlines). Inline strings look shorter; that's the misread — the voice is the project's identity, not flavor text.

## The live-reload dev server

`dev/`.

`Bun.serve` with SSE live reload, debounced rebuilds that never overlap, and the FSEvents mtime filter that breaks the macOS self-rebuild loop. None of it is required to *produce* a build, which is what makes it look cuttable; all of it is required for the local iteration loop to feel good.
