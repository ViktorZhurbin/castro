/**
 * Build Output Verifier
 *
 * Builds the test site, then checks the HTML output using Bun's test runner.
 * Tests cover static pages, all three directives, component composition,
 * CSS modules, markdown, and the vendored Preact import map. The last section
 * crosses into dist/castro-island.js to pin the marker attributes the build
 * and the browser runtime have to agree on.
 *
 * Usage: bun test:site
 */

import { beforeAll, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { join } from "node:path";

const siteDir = import.meta.dir;
const distDir = join(siteDir, "dist");

/** @param {string} file */
async function readHtml(file) {
  const f = Bun.file(join(distDir, file));
  if (!(await f.exists())) throw new Error(`Missing output file: ${file}`);
  return f.text();
}

beforeAll(() => {
  execSync("bun run build", { cwd: siteDir, stdio: "inherit" });
});

// ------ Static page (no islands) ------

test("static page renders content", async () => {
  const html = await readHtml("static.html");
  expect(html).toContain("<h1>Static Page</h1>");
  expect(html).toContain("<!DOCTYPE html>");
});

test("static page has no island artifacts", async () => {
  const html = await readHtml("static.html");
  expect(html).not.toContain("castro-island");
  expect(html).not.toContain("castro-island.js");
  expect(html).not.toContain("<style>");
});

// ------ Private path skip (`_`-prefixed pages) ------
// scanPages() skips any relativeSourcePath with a path segment starting with
// `_` — two arms of one `.split("/").some(...)` check: a private directory
// (pages/_drafts/) and a private file at the top level (pages/_partial.tsx).
// If either arm regresses, the fixture below starts emitting a real route
// and nothing else in this suite would notice — every other test only
// asserts what dist/ contains, never what it must not.

test("a page inside an `_`-prefixed directory produces no output file", async () => {
  const file = Bun.file(join(distDir, "_drafts", "wip.html"));
  expect(await file.exists()).toBe(false);
});

test("an `_`-prefixed file at the top level produces no output file", async () => {
  const file = Bun.file(join(distDir, "_partial.html"));
  expect(await file.exists()).toBe(false);
});

// Mirrors scanPages()'s own segment check against the actual build output,
// rather than the two fixture paths above — catches a leak under a filename
// this suite doesn't know to look for, not just a regression of the skip
// itself.
test("no emitted page path contains an `_`-prefixed segment", async () => {
  const glob = new Bun.Glob("**/*.html");
  const leaked = [...glob.scanSync(distDir)].filter((relativeOutputPath) =>
    relativeOutputPath.split("/").some((segment) => segment.startsWith("_")),
  );
  expect(leaked).toEqual([]);
});

// ------ comrade:visible directive ------

test("comrade:visible has island wrapper", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:visible"');
});

test("comrade:visible has island runtime", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain("castro-island.js");
});

test("comrade:visible has island JS bundle reference", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain('import="/');
});

test("comrade:visible has SSR content", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain("Count:");
});

test("comrade:visible has island CSS", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain("<style>");
  expect(html).toContain("color: red");
});

// ------ comrade:patient directive ------

test("comrade:patient has island wrapper", async () => {
  const html = await readHtml("comrade-patient.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:patient"');
});

test("comrade:patient has island runtime", async () => {
  const html = await readHtml("comrade-patient.html");
  expect(html).toContain("castro-island.js");
});

test("comrade:patient has island JS bundle reference", async () => {
  const html = await readHtml("comrade-patient.html");
  expect(html).toContain('import="/');
});

test("comrade:patient has SSR content", async () => {
  const html = await readHtml("comrade-patient.html");
  expect(html).toContain("Count:");
});

test("comrade:patient has island CSS", async () => {
  const html = await readHtml("comrade-patient.html");
  expect(html).toContain("<style>");
  expect(html).toContain("color: red");
});

// ------ comrade:eager directive ------

test("comrade:eager has correct directive", async () => {
  const html = await readHtml("comrade-eager.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:eager"');
});

test("comrade:eager has island runtime", async () => {
  const html = await readHtml("comrade-eager.html");
  expect(html).toContain("castro-island.js");
});

// The page nests `{false && <span/>}`, which leaves `children: false` — legal
// (it nested nothing) but not a prop, so it must not reach the browser.
test("a false-branch child is not serialized into data-props", async () => {
  const html = await readHtml("comrade-eager.html");
  expect(html).toContain("&quot;initial&quot;:10");
  expect(html).not.toContain("&quot;children&quot;");
});

// null and undefined nest nothing for the same reason `false` does, and
// renderMarker() must pass all three. Narrowing the guard to reject either one
// throws on `{cond ? <X/> : null}` — the page below is the only thing in the
// suite that would notice, and it notices by failing the build outright.
//
// Asserting the whole serialized object, not just the surviving prop: that is
// what makes the name true here, since a leaked `children` key would show up
// inside these braces rather than merely somewhere on the page.
test("a null child is not serialized into data-props", async () => {
  const html = await readHtml("comrade-eager.html");
  expect(html).toContain('data-props="{&quot;initial&quot;:11}"');
});

test("an undefined child is not serialized into data-props", async () => {
  const html = await readHtml("comrade-eager.html");
  expect(html).toContain('data-props="{&quot;initial&quot;:12}"');
});

// ------ Shell-less layout (no <head>/<body> to anchor to) ------
// injectTags() anchors injection to </head> or </body>; layouts/bare.tsx
// returns a fragment with neither. Guards against the fix regressing to a
// silent no-op that drops the import map, runtime script, and CSS
// (writeHtmlPage.js).

test("shell-less layout page still has DOCTYPE and content", async () => {
  const html = await readHtml("bare-layout.html");
  expect(html).toContain("<!DOCTYPE html>");
  expect(html).toContain("<h1>Bare Layout Test</h1>");
});

test("shell-less layout page still gets the island runtime and import map", async () => {
  const html = await readHtml("bare-layout.html");
  expect(html).toContain("castro-island.js");
  expect(html).toContain('type="importmap"');
});

test("shell-less layout page still gets inline island CSS", async () => {
  const html = await readHtml("bare-layout.html");
  expect(html).toContain("<style>");
  expect(html).toContain("color: red");
});

test("shell-less layout page still gets its page CSS link", async () => {
  const html = await readHtml("bare-layout.html");
  expect(html).toContain('href="/bare-layout.css"');
});

// ------ Nested layouts (layout id includes the directory) ------
// layouts/nested/default.tsx deliberately shares a basename with
// layouts/default.tsx. Before layout ids included the directory, whichever
// one the glob visited last silently won for id "default".

test("page selecting a nested layout by its directory-qualified id renders that layout", async () => {
  const html = await readHtml("nested-layout.html");
  expect(html).toContain('id="nested-layout-marker"');
  expect(html).toContain("<h1>Nested Layout Page</h1>");
});

test("pages using the plain default layout are not overridden by the nested one", async () => {
  const html = await readHtml("static.html");
  expect(html).not.toContain('id="nested-layout-marker"');
});

test("nested and root layouts extract CSS to distinct files", async () => {
  const rootHtml = await readHtml("static.html");
  const nestedHtml = await readHtml("nested-layout.html");
  expect(rootHtml).toContain('href="/layouts/default.css"');
  expect(nestedHtml).toContain('href="/layouts/nested/default.css"');
});

// ------ Page props and hooks ------

test("page receives its frontmatter as props", async () => {
  const html = await readHtml("page-props.html");
  expect(html).toContain("<h1>Page Props</h1>");
  expect(html).toContain("<p>From frontmatter</p>");
});

test("page and layout see the same title", async () => {
  const html = await readHtml("page-props.html");
  expect(html).toContain("<title>Page Props</title>");
  expect(html).toContain("<h1>Page Props</h1>");
});

test("hooks work in a page", async () => {
  const html = await readHtml("page-props.html");
  expect(html).toContain(">5</span>");
  expect(html).toMatch(/data-hook-id="[^"]+"/);
});

test("hooks work in a layout", async () => {
  const html = await readHtml("static.html");
  expect(html).toMatch(/data-layout-id="[^"]+"/);
});

// ------ Multiple islands ------

test("multi page has both islands", async () => {
  const html = await readHtml("multi.html");
  const count = (html.match(/<castro-island/g) || []).length;
  expect(count).toBe(2);
});

test("multi page has CSS for both islands", async () => {
  const html = await readHtml("multi.html");
  expect(html).toContain("color: red");
  expect(html).toContain("font-weight: bold");
});

// ------ Nested island (derivePaths preserves source-tree nesting) ------
// components/ui/Badge.island.tsx must emit under /islands/ui/, not flattened
// to /islands/. Badge is the fixture rather than Counter because the vendored-
// deps test below globs `islands/Counter.island-*.js`, and `*` doesn't cross a
// directory separator.

test("a nested island keeps its directory in the bundle URL", async () => {
  const html = await readHtml("multi.html");
  expect(html).toContain('import="/islands/ui/Badge.island-');
});

// ------ Component composition ------

test("island inside static component gets wrapper", async () => {
  const html = await readHtml("compound.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain("Count:");
  expect(html).toContain("<h2>Nested Island</h2>");
});

test("static component inside island renders", async () => {
  const html = await readHtml("multi.html");
  expect(html).toContain('<span class="label">');
});

test("island in layout renders with wrapper", async () => {
  const html = await readHtml("layout-island.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:eager"');
  expect(html).toContain("Count:");
  expect(html).toContain("<h1>Layout Island Test</h1>");
});

// ------ Island import resolution (extensionless + tsconfig alias) ------
// islandMarkerPlugin matches the resolved `.island.[jt]sx` path in an onLoad
// hook, so the import specifier's form shouldn't matter. If resolution missed
// the marker, the real component would bundle inline: "Count:" would still
// render but the <castro-island> wrapper would be absent — so asserting the
// wrapper is what distinguishes a real island from a silent inline fallback.

test("extensionless island import still produces an island", async () => {
  const html = await readHtml("island-no-ext.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:visible"');
  expect(html).toContain('import="/');
  expect(html).toContain("Count:");
});

test("tsconfig alias island import still produces an island", async () => {
  const html = await readHtml("island-alias.html");
  expect(html).toContain("<castro-island");
  expect(html).toContain('directive="comrade:visible"');
  expect(html).toContain('import="/');
  expect(html).toContain("Count:");
});

// ------ CSS modules ------

test("CSS modules in static components get scoped class names", async () => {
  const html = await readHtml("cssmodules.html");
  expect(html).toMatch(/class="card_[^"]+"/);
  expect(html).toContain("Hello from card");
});

test("CSS modules in static components extract CSS to file", async () => {
  const html = await readHtml("cssmodules.html");
  expect(html).toContain('href="/cssmodules.css"');
});

test("CSS modules in islands get scoped class in SSR and CSS", async () => {
  const html = await readHtml("cssmodules.html");
  // Scoped class in extracted CSS
  expect(html).toMatch(/\.clicker_[^\s{]+/);
  // Same scoped class in SSR-rendered markup (not just after hydration)
  expect(html).toMatch(/class="clicker_[^"]+"/);
});

// ------ Markdown page ------

test("markdown page renders to HTML", async () => {
  const html = await readHtml("markdown.html");
  expect(html).toContain("<p>Paragraph content here.</p>");
});

test("markdown page has no island artifacts", async () => {
  const html = await readHtml("markdown.html");
  expect(html).not.toContain("castro-island");
});

test("markdown page renders GFM tables when configured", async () => {
  const html = await readHtml("markdown.html");
  expect(html).toContain("<table>");
  expect(html).toContain("<td>");
});

test("markdown page renders GFM task lists when configured", async () => {
  const html = await readHtml("markdown.html");
  expect(html).toContain('type="checkbox"');
});

test("markdown page generates anchor tags in headings", async () => {
  const html = await readHtml("markdown.html");
  expect(html).toContain("<h2 id=");
  expect(html).toContain("<a href=");
});

// ------ Import map generation ------

test("static pages have no import map script tag", async () => {
  const html = await readHtml("static.html");
  expect(html).not.toContain('type="importmap"');
});

test("pages with islands have import map script tag", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain('type="importmap"');
});

test("island pages map Preact to vendored URLs", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain('"preact":');
  // Vendored locally (not a CDN URL)
  expect(html).toContain('"/vendor/');
});

// ------ User clientDependencies (@preact/signals via castro.config.ts) ------

test("user clientDependencies appear in the import map", async () => {
  const html = await readHtml("comrade-visible.html");
  expect(html).toContain('"@preact/signals": "/vendor/_preact_signals.js"');
});

test("user clientDependencies are vendored to dist", async () => {
  const file = Bun.file(join(distDir, "vendor", "_preact_signals.js"));
  expect(await file.exists()).toBe(true);
});

test("island bundles import vendored deps instead of inlining them", async () => {
  // Counter.island.tsx imports @preact/signals; the bundle must keep it as a
  // bare specifier for the import map to resolve, not an inlined copy.
  const glob = new Bun.Glob("islands/Counter.island-*.js");
  const [bundlePath] = [...glob.scanSync(distDir)];
  expect(bundlePath).toBeDefined();

  const bundle = await Bun.file(join(distDir, bundlePath)).text();
  expect(bundle).toContain('"@preact/signals"');
  expect(bundle).not.toContain("signals-core");
});

// ------ Conditional island output ------

test("vendored Preact runtime exists in dist", async () => {
  const file = Bun.file(join(distDir, "vendor", "preact.js"));
  expect(await file.exists()).toBe(true);
});

test("castro-island.js exists in dist (hydrated islands used)", async () => {
  const file = Bun.file(join(distDir, "castro-island.js"));
  expect(await file.exists()).toBe(true);
});

// ------ Hydration seam (build output ↔ shipped runtime) ------
//
// Every test above stops at the marker the build emits; castro-island.js is
// its only consumer and nothing here executes it. Rename an attribute on
// either side and the whole suite still passes while the site ships islands
// that never hydrate — the one break no other layer can see.
//
// Both sides are read out of dist/: the attributes off real markup, the
// runtime as the byte-for-byte file the browser loads. Matching against
// core's source instead would let a renamed attribute pass on the strength of
// a stale docblock — castroIsland.js's own header spells out a full marker.

async function readRuntime() {
  return Bun.file(join(distDir, "castro-island.js")).text();
}

/**
 * The opening `<castro-island …>` tag of the first marker in a built page.
 * @param {string} file
 */
async function readMarkerTag(file) {
  const tag = (await readHtml(file)).match(/<castro-island\s[^>]*>/)?.[0];
  if (!tag) throw new Error(`No island marker in ${file}`);
  return tag;
}

/** @param {string} tag */
function attributeNames(tag) {
  // Consuming each quoted value keeps the scan from matching inside one.
  return [...tag.matchAll(/\s([a-z-]+)="[^"]*"/g)].map((m) => m[1]);
}

/**
 * Whether the runtime reads `attr`. A `data-*` attribute reaches JS through
 * `dataset`, prefix dropped and camelCased — the one place the two sides
 * spell the same attribute differently.
 *
 * @param {string} runtime
 * @param {string} attr
 */
function readsAttribute(runtime, attr) {
  if (attr.startsWith("data-")) {
    const key = attr.slice("data-".length).replace(/-(.)/g, (_, c) => c.toUpperCase());

    return runtime.includes(`dataset.${key}`);
  }

  return runtime.includes(`getAttribute("${attr}")`);
}

test("the runtime registers the element tag the build emits", async () => {
  const tagName = (await readMarkerTag("comrade-visible.html")).match(/<([a-z-]+)/)?.[1];
  expect(tagName).toBe("castro-island");

  // Quoted, so the match is the ELEMENT_TAG literal and not a docblock
  // mention of `<castro-island>`.
  expect(await readRuntime()).toContain(`"${tagName}"`);
});

test("the runtime reads every attribute the build puts on a marker", async () => {
  const runtime = await readRuntime();
  const attrs = attributeNames(await readMarkerTag("comrade-visible.html"));

  // Pinned as a set so the loop below can't pass by finding nothing, and so a
  // new marker attribute has to be handled here rather than shipped unread.
  expect(new Set(attrs)).toEqual(new Set(["directive", "import", "data-props"]));

  expect(attrs.filter((attr) => !readsAttribute(runtime, attr))).toEqual([]);
});

test("every directive the build emits is handled by the runtime", async () => {
  const runtime = await readRuntime();

  const emitted = new Set(
    await Promise.all(
      ["comrade-eager.html", "comrade-patient.html", "comrade-visible.html"].map(
        async (page) => (await readMarkerTag(page)).match(/directive="([^"]+)"/)?.[1],
      ),
    ),
  );

  // The directive dispatch is the runtime's only switch.
  const cases = new Set([...runtime.matchAll(/case "([^"]+)":/g)].map((m) => m[1]));

  expect([...cases].filter((c) => !emitted.has(c))).toEqual([]);
  // The remainder is what the `default` branch absorbs, and which directive
  // that is has to stay a decision: the default also catches a malformed or
  // absent one, so whatever lands there hydrates every broken marker too.
  expect([...emitted].filter((d) => !cases.has(d))).toEqual(["comrade:visible"]);
});
