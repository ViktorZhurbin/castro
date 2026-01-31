# Message Guidelines

**Rule 1: Clarity First, Satire Second**

User-facing messages must be scannable at a glance. Satire should enhance, not obscure.

## Emoji Policy

**Allowed:**
- `✓` - Success/completion
- `❌` - Errors/failures
- `⚠️` - Warnings (sparingly)

**Banned:**
- Decorative emojis (🚨, 📝, ✅, 💥, 🏝️, ⏭️, 🧹, etc.)
- Emoji prefixes on status messages
- Any emoji that adds visual noise without information

## Satire Guidelines (Communist Preset)

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

## Testing Your Changes

Run a build and read the output:
```bash
pnpm build
```

Ask yourself:
1. **Can I scan it?** Find the error in < 2 seconds?
2. **Does it smile?** Is the joke actually funny?
3. **Is it necessary?** Does it add value or just noise?

If you hesitate on any question, remove the satire.

## Preset Philosophy

**Serious Preset:**
- Technical, professional tone
- No jokes, no satire
- Clear, actionable messages

**Satirical Preset:**
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

All messages must match `messages.d.ts`:
```typescript
export interface Messages {
  devServer: { /* ... */ };
  build: { /* ... */ };
  // etc.
}
```

Both presets must implement the same interface exactly.

## When in Doubt

Compare with the serious preset. If your satirical message is more than 20% longer or 2x harder to scan, simplify it.

**Remember:** Users don't read error messages for entertainment. They scan for information. Satire should be a bonus, not a barrier.
