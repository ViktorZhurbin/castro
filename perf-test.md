What to Measure
Looking at your buildPage pipeline, the work per-page breaks down into three phases:

compileJSX: Calls Bun.build to compile the page/layout. This runs in native code (Zig/C++) and is asynchronous.

renderPage: Calls Preact's renderToString. This is strictly synchronous JavaScript and blocks the event loop.

writeHtmlPage: Gathers assets and writes to disk (async I/O).

When you parallelize via Promise.all, Bun.build and file I/O will scale nicely. However, renderToString will bottleneck on the single JavaScript thread. Your benchmark needs to explicitly measure how these phases interact.

Creating a Meaningful Dataset
Don't rely on downloaded samples. Write a quick generate-bench.js script in your repository to scaffold a massive tests/perf-site/ before you run the benchmark.

You should generate three distinct page profiles to see exactly where parallelization helps and where it chokes:

Pure Markdown (1000+ pages)

Why: Isolates Bun.markdown.html and disk I/O.

Expectation: You should see significant speedups here when parallelized, as I/O can overlap and Bun's markdown parser is fast.

Heavy Static JSX (1000+ pages)

Why: Generate pages with deep, nested component trees (e.g., Layout -> Page -> Section -> Grid -> Card -> Text).

Expectation: This stresses compileJSX and renderToString. Parallelization might show diminishing returns here because the synchronous renderToString calls will queue up and thrash the single JS thread.

Island-Heavy Pages (500+ pages)

Why: Generate pages that import 5-10 different .island.tsx components.

Expectation: This stresses the islandMarkerPlugin interception and the synchronous renderMarker lookups against the islands registry.

The Measurement Setup
Focus your timing strictly on the page loop, excluding the initial island and layout compilation (which happen sequentially before pages are processed).

In buildAll.js:

JavaScript
performance.mark('pages-start');

// Your new Promise.all parallel loop
await Promise.all(Array.from(pagesMap.entries()).map(async ([outputPath, sourcePath]) => {
    // ...
}));

performance.mark('pages-end');
const measurement = performance.measure('pages-build', 'pages-start', 'pages-end');
console.log(`Page loop took: ${measurement.duration.toFixed(2)}ms`);
