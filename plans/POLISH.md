Error recovery in the dev server is partial. If a page build fails during watch mode, the error logs but there's no clear recovery path — the watcher keeps going, but the user experience of "what just broke and how do I fix it" isn't great yet.

The page rebuild granularity is smart (single page rebuild on page change, full rebuild on layout/island change), but there's no debouncing. Rapid saves will trigger multiple rebuilds.

There's no data loading story. Pages are pure components with no mechanism for fetching data at build time (no getStaticProps equivalent, no loader pattern). For a static site this matters — the moment you want to generate pages from a data source, you need this.

No dynamic routes. The glob-based page discovery works for file-based routing, but there's no [slug].tsx pattern or getStaticPaths equivalent.

The Markdown story is thin. Frontmatter parsing works, Bun.markdown.html() does the conversion, but there's no way to use components inside Markdown (no MDX equivalent), no syntax highlighting, no custom renderers