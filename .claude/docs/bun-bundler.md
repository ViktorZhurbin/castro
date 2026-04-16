# Bun.build — Castro reference

Castro uses `Bun.build()` in three places:
- `builder/compileJsx.js` — compile pages/layouts for SSR (`target: "bun"`)
- `islands/compiler.js` — compile island client bundles (`target: "browser"`)
- `islands/compiler.js` — compile island SSR modules (`target: "bun"`)

## API shape

```ts
const result = await Bun.build({
  entrypoints: string[];   // required — one output bundle per entry
  outdir?: string;         // write to disk; omit to get in-memory Blob outputs
  target?: "browser" | "bun" | "node";  // default: "browser"
  format?: "esm" | "cjs" | "iife";      // default: "esm"
  external?: string[];     // imports left as-is (not bundled)
  plugins?: BunPlugin[];
  naming?: string | { entry?: string; chunk?: string; asset?: string };
  define?: Record<string, string>;  // compile-time identifier replacement
  sourcemap?: "none" | "linked" | "inline" | "external";  // default: "none"
  minify?: boolean | { whitespace?: boolean; syntax?: boolean; identifiers?: boolean };
  splitting?: boolean;     // code splitting for shared chunks
  throw?: boolean;         // default true — rejects on build failure
});
```

## Return value

```ts
interface BuildOutput {
  success: boolean;
  outputs: BuildArtifact[];          // one per entrypoint (+ chunks/assets if splitting)
  logs: Array<BuildMessage | ResolveMessage>;  // warnings on success
}

interface BuildArtifact extends Blob {
  kind: "entry-point" | "chunk" | "asset" | "sourcemap";
  path: string;    // absolute path when outdir is set
  hash: string | null;
  loader: string;
  sourcemap: BuildArtifact | null;
}
```

On failure (with default `throw: true`), `Bun.build` rejects with an `AggregateError`. Each item in `error.errors` is a `BuildMessage` or `ResolveMessage`.

Without `outdir`, outputs are in-memory Blobs — read with `await output.text()`.

## Options used by Castro

### `target`

- `"bun"` — SSR compilation (pages, layouts, island SSR modules). Keeps Node/Bun APIs available; marks output with `// @bun` pragma so Bun skips re-transpilation.
- `"browser"` — island client bundles. Bun resolves `"browser"` export conditions in `package.json`.

### `external`

Imports left as bare specifiers in the output — not bundled, resolved at runtime.

```ts
external: ["preact", "preact/hooks"]  // exact matches
external: ["*"]                       // mark everything external
```

Castro passes all `package.json` dependencies as `external` for SSR builds (via `getProjectDependencies()`). For island client builds, import map keys are added as externals so the browser resolves them via the import map.

### `naming`

Template tokens: `[name]`, `[ext]`, `[hash]`, `[dir]`.

```ts
// Castro uses this for island client bundles (cache-busting via hash)
naming: { entry: "Counter-[hash].[ext]" }
// → Counter-a1b2c3d4.js
```

Can be a plain string (applies to entry bundles only) or an object with `entry`, `chunk`, and `asset` keys.

### `define`

Compile-time text replacement. Values must be valid JSON or JS expressions as strings.

```ts
define: {
  "process.env.NODE_ENV": JSON.stringify("production"),
  // → replaces all occurrences with "production" (including the quotes)
}
```

### `plugins`

`BunPlugin[]` — run during bundling, before output is written. See `bun-plugins.md`.

### `format`

Castro always uses `"esm"`. Both SSR and browser builds are ES modules.

## Error handling pattern (Castro style)

```ts
const result = await Bun.build({ ... });
// With throw: true (default), a failed build throws AggregateError.
// Castro wraps Bun.build in try/catch and surfaces result.logs on success.

if (!result.success) {
  for (const log of result.logs) console.error(log);
}
```
