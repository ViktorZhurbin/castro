# Non-Negotiables

These subsystems are kept whole through brevity passes. They cost lines on purpose and are not candidates for the deletion rule in [NON-GOALS.md](./NON-GOALS.md). When trimming inside one, keep the subsystem intact and note `// kept — see NON-NEGOTIABLES.md`.

**Who this binds.** This list is direction for agents and contributors, not a law over the maintainer. It records what *currently* earns its lines so a routine brevity pass doesn't strip it on autopilot — it is not a claim these can never go. The maintainer adds and removes entries freely; if you're an agent, treat dropping an entry as the maintainer's call, and propose it rather than act unprompted. Absent that direction, keep these intact.

**Kept as wholes, not frozen shapes.** Each entry is justified by a design that's true *today*. If the maintainer removes an entry, simplify the architecture it protected to match — don't preserve the old shape out of habit, and don't cite this file as a reason the shape can't change.

## Structured errors

`utils/errors.js`, `utils/renderError.js`, `dev/liveReload.js`, `messages/`.

Typed error codes, code-frame extraction, a terminal renderer, and a browser overlay — all consuming one `CastroErrorPayload`. The structure (payload decoupled from voice, two independent renderers) is what turns a stack trace into a scannable, actionable error surface.

The payload/renderer split earns its abstraction *because* two renderers consume it. If the browser overlay (`dev/liveReload.js`) is ever cut, collapse the indirection too — a single-consumer payload abstraction is over-engineering, not a non-negotiable. The DX point worth defending is in-browser error surfacing, not the indirection that currently serves it.

## The satirical voice

`messages/` (rules in [core/src/messages/README.md](core/src/messages/README.md)).

All user-facing strings route through `messages/` so tone stays consistent and the jokes stay at the edges — openings, closings, error punchlines. Inline strings are not an acceptable shortcut.

## The live-reload dev server

`dev/`.

FSEvents mtime filter is needed to break the macOS self-rebuild loop.
