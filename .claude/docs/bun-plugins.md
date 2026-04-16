# Bun Plugins

Used in Castro via `islands/buildPlugins.js`. A plugin is `{ name: string, setup(build) }` passed to `Bun.build({ plugins })`.

## Hook signatures

```ts
type PluginBuilder = {
  // Run once when bundling starts
  onStart(callback: () => void | Promise<void>): void;

  // Intercept module resolution — return a new path or nothing
  onResolve(
    args: { filter: RegExp; namespace?: string },
    callback: (args: { path: string; importer: string }) => { path: string; namespace?: string } | void
  ): void;

  // Intercept module load — return replacement source or nothing
  onLoad(
    args: { filter: RegExp; namespace?: string },
    callback: (args: { path: string; importer: string; namespace: string }) => {
      contents?: string;
      loader?: Loader;
      exports?: Record<string, any>;
    } | void
  ): void;

  config: BuildConfig;
};

type Loader = "js" | "jsx" | "ts" | "tsx" | "json" | "toml" | "yaml" | "file" | "napi" | "wasm" | "text" | "css" | "html";
```

## Patterns used in Castro

**`onResolve` — mark imports external:**
```js
build.onResolve({ filter: /.*/ }, (args) => {
  if (args.path.startsWith(CASTRO_SRC)) {
    return { path: args.path, external: true };
  }
});
```

**`onLoad` — replace module contents with generated code:**
```js
build.onLoad({ filter: /\.island\.[jt]sx$/ }, (args) => {
  return { contents: generateStubCode(args.path), loader: "js" };
});
```

## Namespaces

Every module has a namespace. Default is `"file"`. Use `namespace` in filter args to scope hooks to a virtual namespace (e.g. `"bun:"`, `"node:"`).

## `.defer()`

`onLoad` also receives a `defer` function (second arg before callback). Calling `await defer()` delays execution until all other modules have loaded — useful when your generated contents depend on what other modules export.
