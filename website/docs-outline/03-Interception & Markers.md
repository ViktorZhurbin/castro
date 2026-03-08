Section 3: Interception & Markers

**The Educational Goal:** Explain the cleverest part of the framework: how `islandMarkerPlugin` intercepts the import of an island at build time, replacing it with a stub that renders `<castro-island>`.
**The Vibe:** Border control and passport swapping.

* **Interactive Component Suggestion:** **The "Inspect the Contraband" Toggle Viewer.**
* Build a custom Castro component for the docs site that shows a split-pane or a toggle button.
* *State 1 (The Smuggler):* Shows standard JSX: `import Counter from "./Counter.island.tsx";`
* *State 2 (The Checkpoint):* The user clicks "Apply Marker Plugin". The code visually transforms (with a slick DaisyUI transition) into the generated stub: `import { renderMarker } from "marker.js"; export default (props) => renderMarker("Counter.island.tsx", props);`
* *Caption:* "The Party intercepts your interactive code at the border and issues it a temporary visa."


* **Illustration Prompt:** *"A cartoonish border checkpoint booth. A file folder labeled 'Counter.island.tsx' is trying to cross. A stern border guard with a red star on his hat is confiscating the folder and handing back a rubber-stamped piece of paper that says '<castro-island>'."*
