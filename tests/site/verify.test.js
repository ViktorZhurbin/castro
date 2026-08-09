/**
 * Build Output Verifier
 *
 * Builds the test site, then checks the HTML output using Bun's test runner.
 * Tests cover static pages, all three directives, component composition,
 * CSS modules, markdown, and the vendored Preact import map.
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
