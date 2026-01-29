Based on a review of the latest code in the `castro/` directory, you have already successfully implemented **Mission A** (using SSR modules for identity) and **Mission B** (registry time separation). The brittle regex-based `imports.js` has indeed been removed in favor of direct name comparison in `wrapper-jsx.js`.

### Should you proceed with Mission C?

**Yes.** While the current "direct name comparison" in `wrapper-jsx.js` is simple, it relies on a "guess": it assumes that any component whose function name matches an entry in the global `islands` registry is an island.

**The risk:** If you import a local component named `Counter` that is *not* an island, but an island named `Counter` exists elsewhere in the project, Castro will accidentally wrap your local component in a hydration boundary. **Mission C** makes this deterministic by checking the actual module resolution path provided by `esbuild`.

---

# Implementation Plan: Mission C (Module-Aware Detection)

## 1. What & Why

* **What**: Transition island detection from "name-guessing" to "path-verification" using esbuild's build metadata (`metafile`).
* **Why**: To prevent accidental wrapping of components that happen to share names with islands but were not imported from the `islands/` directory.
* **Expected End State**: `wrapper-jsx.js` only wraps components that `esbuild` confirms were imported from the `islands/` folder for that specific page.

---

## 2. Files to Modify

* `castro/src/build/compile-jsx.js` - Enable metadata generation.
* `castro/src/build/page-jsx.js` - Pass metadata to the wrapper.
* `castro/src/islands/wrapper-jsx.js` - Use metadata for precise detection.

---

## 3. Non-Negotiable Rules

* Preserve ALL existing educational JSDoc comments.
* Maintain ~50% comment density to explain the "Module-Aware" concept.
* Include `.js` extensions on all imports.
* Do NOT change exported function signatures (e.g., `compileJSX`, `wrapIslandsInJSX`).

---

## 4. Implementation Steps

### Step 1: Enable esbuild Metadata

**Goal**: Configure the compiler to output a dependency graph.
**Files**: `castro/src/build/compile-jsx.js`

1. Locate `esbuild.build` around line 31.
2. Add `metafile: true` to the configuration object.
3. Update the return statement to include the metafile:

```js
return {
    module: await getModule(sourcePath, jsFile.text),
    cssFiles,
    metafile: result.metafile // Added for Mission C
};

```

### Step 2: Extract Imported Islands

**Goal**: Identify which island files are actually used by the current page.
**Files**: `castro/src/build/page-jsx.js`

1. Locate the `compileJSX` call around line 43.
2. Destructure the new `metafile` property.
3. Before calling `wrapIslandsInJSX`, extract the list of imported island paths from the metafile:

```js
// Filter esbuild inputs to find anything coming from the islands directory
const importedIslands = Object.keys(metafile.inputs).filter(path =>
    path.includes(`/${ISLANDS_DIR}/`)
);

// Update wrapIslandsInJSX call to accept these candidates
const islandVNode = wrapIslandsInJSX(contentVNode, importedIslands);

```

### Step 3: Precise VNode Transformation

**Goal**: Only wrap components that exist in the `importedIslands` list.
**Files**: `castro/src/islands/wrapper-jsx.js`

1. Update `wrapIslandsInJSX` to accept `importedIslands` as a second parameter.
2. Pass `importedIslands` into `transformVNodeTree`.
3. Inside `transformVNodeTree`, refine the check around line 111:

```js
const componentName = vnodeType.name;
const island = islands.getIsland(componentName);

// Module-aware check: match name AND ensure the island's source path
// was actually among the imports detected by esbuild for this page.
const isImportedIsland = island && importedIslands.some(path =>
    path.endsWith(island.sourcePath)
);

if (componentName && isImportedIsland) {
    return wrapIslandComponent(vnode, componentName);
}

```

---

## 5. Final State Checklist

* [ ] `compile-jsx.js` returns `result.metafile`.
* [ ] `page-jsx.js` extracts island paths from the metafile before rendering.
* [ ] `wrapper-jsx.js` logic combines `islands.isIsland()` check with a path-verification check.
* [ ] All new logic is documented with educational JSDoc explaining why path verification is safer than name-guessing.

---

## 6. Edge Cases

* **Case 1**: Multiple components share a name, but only one is an island.
* **Behavior**: Only the one imported from `islands/` is wrapped; the other remains static.


* **Case 2**: An island is imported but never used in the JSX tree.
* **Behavior**: It is detected in the `metafile` but `transformVNodeTree` never encounters it, so no boundary is created and no JS is shipped (unless it's an eager CSS import).

---

# Analysis: Mission C Module-Aware Detection

  The Problem is Real ✅

  Yes, there's a genuine bug. Here's the scenario:

  // pages/index.tsx
  import Counter from "../components/LocalCounter.tsx";  // NOT an island

  export default () => <Counter />;

  If an island named Counter exists in islands/Counter.tsx, the current code will:
  1. ✅ Render the correct LocalCounter to HTML
  2. ❌ Wrap it with island metadata pointing to islands/Counter.tsx
  3. ❌ Client hydrates with the wrong JavaScript bundle

  Result: Static HTML is correct, but client-side hydration fails/misbehaves.

  ---
  But the Proposed Solution Has Problems ⚠️

  1. We Already Tried This

  We just spent effort removing metafile detection because:
  - Path matching is fragile (relative vs absolute)
  - Adds complexity
  - Didn't provide clear benefits

  2. The Path Matching is Still Broken

  importedIslands.some(path => path.endsWith(island.sourcePath))

  This will fail because:
  - island.sourcePath = islands/counter.tsx (relative)
  - metafile paths = islands/counter.tsx (relative, from CWD)
  - path.endsWith() works here... until someone uses nested folders
    - islands/ui/counter.tsx ends with counter.tsx ✗
    - Multiple files could match!

  3. We'd Re-introduce 30+ Lines of Path Normalization

  Just look at what we removed earlier - all that complexity comes back.

  ---
  Better Alternatives

  Option 1: Detect Name Collisions at Build Time (Simplest)

  // In registry.load()
  if (this.#islands.has(component.name)) {
    throw new Error(
      `Island name collision: "${component.name}" is defined multiple times.\n` +
      `  1. ${existingIsland.sourcePath}\n` +
      `  2. ${component.sourcePath}\n\n` +
      `Island names must be unique across the project.`
    );
  }

  Pros:
  - 5 lines of code
  - Catches problem immediately at build time
  - Clear error message
  - No runtime overhead

  Cons:
  - Prevents legitimate use of same name in different contexts
  - But is this actually a con? Islands should probably have unique names anyway.

  Option 2: Component Identity via WeakMap (Most Correct)

  // In registry
  const componentToIsland = new WeakMap();

  // When loading islands
  const module = await getModule(sourcePath, ssrCode, "ssr");
  componentToIsland.set(module.default, component);

  // In VNode walking
  if (componentToIsland.has(vnodeType)) {
    const island = componentToIsland.get(vnodeType);
    return wrapIslandComponent(vnode, island);
  }

  Pros:
  - Uses actual function reference, not name
  - 100% accurate detection
  - No name collision issues
  - Elegant solution

  Cons:
  - Requires keeping SSR component functions in memory
  - More complex than name checking

  Option 3: Just Document the Limitation (Pragmatic)

  Add to docs:
  Island component names must be unique across your entire project. Castro uses component function names for
  detection.

  Pros:
  - Zero code changes
  - This is a reasonable constraint
  - Most projects already follow this naturally

  Cons:
  - Edge case still exists
  - Could bite users

  ---
  My Recommendation: Don't Do Mission C

  Instead, choose one of:

  1. Quick fix: Add name collision detection (Option 1) - 5 lines
  2. Better fix: Use WeakMap for identity checking (Option 2) - 15 lines
  3. Document: Just note the limitation (Option 3) - 0 lines

  All three are simpler and more reliable than bringing back metafile path matching.

  ---
  Why Not Metafile?
  ┌─────────────────┬───────────────────────────┬───────────────────┬───────────────────┐
  │     Aspect      │     Metafile Approach     │   Alternative 1   │   Alternative 2   │
  ├─────────────────┼───────────────────────────┼───────────────────┼───────────────────┤
  │ Complexity      │ High (30+ lines)          │ Low (5 lines)     │ Medium (15 lines) │
  ├─────────────────┼───────────────────────────┼───────────────────┼───────────────────┤
  │ Reliability     │ Fragile paths             │ ✅ Bulletproof    │ ✅ Bulletproof    │
  ├─────────────────┼───────────────────────────┼───────────────────┼───────────────────┤
  │ Performance     │ Parse metafile every page │ ✅ One-time check │ ✅ Direct lookup  │
  ├─────────────────┼───────────────────────────┼───────────────────┼───────────────────┤
  │ Maintainability │ Path edge cases           │ ✅ Simple         │ ✅ Clean          │
  └─────────────────┴───────────────────────────┴───────────────────┴───────────────────┘
  The metafile approach solves the problem but at 10x the complexity of simpler solutions.

  ---
  Is It Worth Going Back?

  No. The name collision issue is real but rare, and far simpler solutions exist. Adding back metafile detection
  would:
  - Re-introduce complexity we just eliminated
  - Create new edge cases (path matching)
  - Slow down builds (metafile parsing)
  - Add maintenance burden

  Recommend: Implement Option 1 (collision detection) as a 5-line safeguard, then move on.
