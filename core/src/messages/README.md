# Message Guidelines

**Rule 1: Clarity First, Satire Second**

User-facing messages must be scannable at a glance. Satire should enhance, not obscure. If it only adds flavor, cut it.

**Rule 2: The Grandiosity Gap**

The joke lives in the distance between the language and the event. The language is ideological and grand. The event is technical and small. Never reverse this.

When both the frame and the event are grand, it's noise. When neither is, it's not satire. The gap is the joke.

## Testing it

Ask yourself:
1. **Can I scan it?** Find the error in < 2 seconds?
2. **Does it smile?** Is the joke actually funny?
3. **Does it illuminate?** Does the satirical frame make the technical event more visible?
4. **Is the gap right?** Grand language, small event — not the reverse?

If you hesitate on any question, remove the satire.

## Emoji Policy

**Allowed:**
- `✓` - Success/completion
- `❌` - Errors/failures
- `⚠️` - Warnings (sparingly)

**Banned:**
- Decorative emojis (🚨, 📝, ✅, 💥, 🏝️, ⏭️, 🧹, etc.)
- Emoji prefixes on status messages
- Any emoji that adds visual noise without information

## Satire Guidelines

### ✓ Good Satire
- **Opening/closing messages**: "Realizing the Five-Year Plan", "Delivered to the people"
- **One punchline per error**: "The revolution cannot serve two masters" (route conflict)
- **Subtle wordplay**: "Revised" instead of "Changed"
- **Actually funny**: Makes you smile without hunting for the error

### ✗ Bad Satire
- **Status message clutter**: "📝 Distributing..." instead of "Writing..."
- **Just different wording**: "Island construction failed" (not funny, just verbose)
- **Trying too hard**: "The people rejected island"
- **Overused jokes**: "The manifesto is corrupted" everywhere
- **Obscures meaning**: If you need to re-read to find the actual error

### Satire Placement
- ✓ **Edges**: Opening, closing, error punchlines
- ✗ **Middle**: Status updates, file operations, logs

## Error Payload Shape

`messages.errors.*` keys feed into `CastroError()` in `utils/errors.js`. Each key is a function `(tokens) => { title, message?, hint?, notes? }` — even error codes with no tokens take a zero-arg function, so every entry has a consistent shape.

`CastroError` merges the result with the call-site `tokens` and optional `CodeFrame[]` into a `CastroErrorPayload`. The payload is the single source of truth — two independent renderers consume it: `renderErrorToTerminal()` (terminal) and the shadow-DOM overlay in `dev/liveReload.js` (browser). Neither renderer parses strings; both read structured fields.

Voice (title/hint text) lives here. Data (file paths, token values, frame positions) lives at the throw site.

## Error Message Structure

```javascript
// Good - Clear structure with optional punchline at end
errors: {
  routeConflict: (file1, file2) =>
    `❌ Route conflict: Two pages claim the same route\n\n` +
    `   · ${file1}\n` +
    `   · ${file2}\n\n` +
    `   The revolution cannot serve two masters.`,  // ← Punchline at end
}

// Bad - Satire obscures the problem
errors: {
  routeConflict: (file1, file2) =>
    `❌ Ideological inconsistency detected.\n\n` +  // ← Too verbose
    `   The Central Committee has identified...\n` +  // ← Obscures info
    `   · ${file1}\n` +
    `   · ${file2}\n\n` +
    `   The revolution cannot serve...\n` +          // ← Joke stretched
    `   Eliminate one to restore order.`,            // ← Too much
}
```

## Voice Philosophy

Castro speaks in a communist satire voice:
- Communist theme (educational framework context)
- One joke maximum per error
- Satire at edges, clarity in the middle
- If a joke doesn't land, cut it

## Examples

### Status Messages
```javascript
// Good
writingFile: (source, dest) => `Writing ${source} → ${dest}`,
fileSuccess: (file, time) => `✓ ${file} (${time})`,

// Bad - Emoji clutter
writingFile: (source, dest) => `📝 Distributing ${source} → ${dest}`,
fileSuccess: (file, time) => `✅ ${file} (${time})`,
```

### Error Messages
```javascript
// Good - Punchline at end
pageBuildFailed: (file, err) =>
  `❌ Build failed (sabotage detected)\n\n` +
  `   Page: ${file}\n` +
  `   Error: ${err}`,

// Bad - Joke stretched thin
pageBuildFailed: (file, err) =>
  `❌ The Ministry of Construction reports failure\n\n` +
  `   Comrade: ${file}\n` +
  `   Counterrevolutionary activity: ${err}\n` +
  `   The Party demands immediate correction.`,
```

## Type Safety

The error table is typed by `ErrorMessages` in `types.d.ts`:
```typescript
export type ErrorMessages = {
  [K in ErrorCode]: (tokens: ErrorTokens[K]) => ErrorContent;
};
```

The `errors` object in `index.js` is annotated `@satisfies {ErrorMessages}`, so every `ErrorCode` must have a factory and each factory's tokens are checked against the throw site.

## When in Doubt

If a satirical message is more than 20% longer or 2x harder to scan than the plain technical phrasing, simplify it.

**Remember:** Users don't read error messages for entertainment. They scan for information. Satire should be a bonus, not a barrier.
