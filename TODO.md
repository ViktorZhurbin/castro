## Support CSS modules

Maybe it already works, thanks to esbuild.

## Lazy island discovery

Instead of scanning the whole project tree for `.island.{jsx,tsx}` files at startup,
discover islands lazily during page compilation when imports are encountered.

The build plugin already intercepts `.island.tsx` imports. It could register newly-found
islands with the registry on the fly, compiling them on first encounter:

```js
// In the island marker plugin
build.onLoad({ filter: /\.island\.[jt]sx$/ }, async (args) => {
  if (!islands.isIsland(islandId)) {
    await islands.compileAndRegister(args.path);
  }
  // Return marker as usual
});
```

Benefits: faster startup (no upfront glob scan), naturally handles islands in any directory.
Trade-off: first page that uses an island pays the compilation cost; island CSS tracking
becomes order-dependent. Worth revisiting after the adapter system stabilizes.

## npx castro create

`npx castro create` CLI command to scaffold new projects
