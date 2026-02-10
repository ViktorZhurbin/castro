This plan assumes you are starting from the master branch. The framework-adapters-v1 branch introduced leaky abstractions that are harder to fix than to rebuild cleanly.
1. What & Why
 * What's changing: Moving from "Implicit Detection" (runtime hooks) to "Explicit Convention" (.island.tsx) for islands. The "Host" (Pages/Layouts) remains native Preact, while Islands use the "Adapter Pattern" (Markers) to support Solid.js.
 * Why: To allow Solid.js islands (which use a different runtime/compiler) to coexist within Preact pages without "dirty" stubbing or runtime crashes.
 * Expected end state: Pages are always Preact. Islands can be Preact or Solid (configured via FRAMEWORK constant). options.vnode hook is removed; .island.tsx files are automatically replaced with Marker Components during page build.
2. Files to Modify
src/constants.js - Add FRAMEWORK constant.
src/islands/framework-config.js - [NEW] Define build/SSR strategies for Preact vs Solid.
src/islands/solid/babel-plugin.js - [NEW] Babel plugin for Solid compilation.
src/builder/esbuild/plugin-island-tagging.js - Update to generate "Marker Components" for .island.tsx files.
src/builder/render-page-vnode.js - Remove the options.vnode hook installation (no longer needed).
src/islands/compiler.js - Compile the real island source using the active framework config.
src/islands/hydration.js - Make hydration logic generic/injectable.
src/islands/plugins.js - Inject framework-specific hydration code at runtime.
src/types.d.ts - Update types for framework config.
3. Non-Negotiable Rules
 * Start from master branch state.
 * Preserve ALL existing JSDoc.
 * Do NOT add npm dependencies (use dynamic imports for solid-js etc).
 * Keep Page Builder Simple: src/builder/compile-jsx.js must NOT change (it stays native Preact).
 * Explicit Convention: Only files ending in .island.tsx (or .island.jsx) are treated as islands.
 * Synchronous Page Rendering: Markers must return VNodes synchronously.
4. Implementation Steps
Step 1: Configuration Infrastructure
Goal: Set up the FRAMEWORK constant and the configuration strategy.
Files: src/constants.js, src/islands/framework-config.js, src/islands/solid/babel-plugin.js
Changes in src/constants.js:
 * Add FRAMEWORK constant export (default "preact").
Create src/islands/solid/babel-plugin.js:
 * Implement the getSolidBabelPlugin (same as discussed previously) to handle Solid JSX compilation.
Create src/islands/framework-config.js:
 * Implement the Registry pattern:
   * init(): Async pre-load of SSR deps.
   * getBuildConfig(ssr): Returns Bun/esbuild config (Native for Preact, Babel-plugin for Solid).
   * renderSSR(Component, props): Sync function to render HTML string.
   * hydrateFnString: The code to inject into hydration.js.
   * marker(path, props): [NEW] Helper to generate the Marker VNode (Preact h calls).
<!-- end list -->
// Example helper for Preact config in framework-config.js
marker: (path, props) => {
  // Returns: h("castro-island", { path, props: JSON.stringify(props) })
  // Note: This logic runs inside the Page Build, so it must use Preact 'h'
}

Step 2: The Bridge (Marker Generation)
Goal: Intercept .island.tsx imports and replace them with Preact Marker Components.
Files: src/builder/esbuild/plugin-island-tagging.js
Changes in src/builder/esbuild/plugin-island-tagging.js:
 * Change filter to /\.island\.[jt]sx$/.
 * Remove the old "inject islandId" logic.
 * Instead, generate a Marker Module:
<!-- end list -->
// Generated Marker Module Content
import { h } from "preact";
import { FRAMEWORK } from "../../constants.js"; // Adjust path

export default function IslandMarker(props) {
  const islandPath = "/dist/islands/Counter.js"; // logic to derive this
  const serialized = JSON.stringify(props);
  
  // Return the Custom Element wrapper
  return h("castro-island", {
     path: islandPath,
     "data-props": serialized,
     // Optional: Call renderSSR() here if we want SEO content
  });
}

Step 3: Island Compilation
Goal: Compile the real island source code using the correct framework settings.
Files: src/islands/compiler.js
Changes in src/islands/compiler.js:
 * Import FrameworkConfig.
 * In compileIsland and compileIslandSSR, replace hardcoded config with FrameworkConfig.current.getBuildConfig(ssr).
 * Ensure plugins are merged correctly (spread buildConfig.plugins before adding CSS stub).
Step 4: Runtime Cleanup
Goal: Remove the old "Magic Hook" detection mechanism.
Files: src/builder/render-page-vnode.js
Changes in src/builder/render-page-vnode.js:
 * Remove import { installIslandHooks } ....
 * Remove the installIslandHooks() call inside the rendering pipeline.
 * The renderer now just renders the Page VNode. Since Islands are now just standard Preact components (Markers), they render naturally without hooks.
Step 5: Hydration & Plugins
Goal: Generate the correct client-side runtime.
Files: src/islands/hydration.js, src/islands/plugins.js
Changes in src/islands/hydration.js:
 * Replace content with the Generic Shell (injectable comments).
Changes in src/islands/plugins.js:
 * Update runtimePlugin to read FrameworkConfig and inject imports/hydration logic into the shell.
 * Update frameworkIslands plugin to use FrameworkConfig for import maps and assets.
 * Call FrameworkConfig.current.init() in registry.load().
Step 6: Types
Goal: Update type definitions.
Files: src/types.d.ts
Changes in src/types.d.ts:
 * Add IslandFrameworkConfig.
 * Update IslandComponent (remove originalComponent, add ssrComponent if needed, though Markers might simplify this).
5. Final State Checklist
 * [ ] FRAMEWORK constant controls the build.
 * [ ] Pages are always compiled as Preact (no Babel).
 * [ ] Files named *.island.tsx are detected as islands.
 * [ ] Page HTML contains <castro-island> tags for islands.
 * [ ] dist/castro-island.js contains the correct framework hydration logic.
 * [ ] No options.vnode hooks are active during render.
6. Edge Cases
Case 1: Forgot .island extension
Behavior: The component is treated as a static Preact component. If it contains Solid syntax/hooks, the Page Build will fail (or render nothing useful). This is expected (Explicit Convention).
Case 2: SEO/SSR Content
Behavior: In this V1 plan, Markers render an empty <castro-island>. Solid content is client-only.
Future Fix: The Marker can import the SSR'd HTML from the registry and inject it via dangerouslySetInnerHTML.
Case 3: Nested Islands
Behavior: Since Markers are just components, a Page can render a Layout which renders an Island. Works natively via Preact composition.
