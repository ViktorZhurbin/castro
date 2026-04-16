# Bun.Transpiler

Used in Castro's `islands/buildPlugins.js` for AST scanning — detecting framework-specific exports/imports at compile time without running the code.

## API

```ts
const transpiler = new Bun.Transpiler({ loader: "tsx" });

// Synchronous — returns transpiled JS string (no module resolution, no execution)
const js = transpiler.transformSync(code);
transpiler.transformSync(code, "tsx"); // override loader per call

// Async version — runs in Bun's worker threadpool; usually slower due to thread overhead
const js = await transpiler.transform(code);

// Scan for imports and exports (type-only imports are excluded)
const { imports, exports } = transpiler.scan(code);

// Faster scan — imports only, slightly less accurate
const imports = transpiler.scanImports(code);
```

## Import kinds

`scan()` / `scanImports()` return `{ path: string, kind: ImportKind }[]`:

```ts
type ImportKind =
  | "import-statement"   // import foo from 'bar'
  | "require-call"       // require('foo')
  | "dynamic-import"     // import('./foo')
  | "require-resolve"    // require.resolve('foo')
  | "import-rule"        // @import in CSS
  | "url-token"          // url() in CSS
```

## Constructor options

```ts
new Bun.Transpiler({
  loader?: "js" | "jsx" | "ts" | "tsx",
  target?: "browser" | "bun" | "node",
  define?: Record<string, string>,       // compile-time replacements
  tsconfig?: string | TSConfig,          // custom JSX factory, importSource, etc.
  trimUnusedImports?: boolean,           // default false
  exports?: {
    eliminate?: string[];                // remove named exports
    replace?: Record<string, string>;    // rename exports
  },
})
```
