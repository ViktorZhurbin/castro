/**
 * Build Output Verifier
 *
 * Builds the test site, then checks the HTML output using Bun's test runner.
 * Tests cover static pages, all three directives, component composition,
 * CSS modules, markdown, and multi-framework (Preact + Solid) islands.
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

// ------ Multi-framework (Preact + Solid on same page) ------

test("mixed page has both Preact and Solid islands", async () => {
	const html = await readHtml("mixed.html");
	const count = (html.match(/<castro-island/g) || []).length;
	expect(count).toBe(2);
});

test("mixed page has Preact import map entries", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain('"preact"');
});

test("mixed page has Solid import map entries", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain('"solid-js"');
});

test("mixed page has Preact SSR content", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain("Count:");
});

test("mixed page has Solid SSR content", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain("Solid:");
});

// ------ Import map generation ------

test("static pages have no import map script tag", async () => {
	const html = await readHtml("static.html");
	expect(html).not.toContain('type="importmap"');
});

test("pages with islands have import map script tag", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain('type="importmap"');
});

test("plugin getImportMap contributes vendor entries", async () => {
	const html = await readHtml("mixed.html");
	// vendorDependencies plugin should add Preact and Solid to import map
	expect(html).toContain('"preact":');
	expect(html).toContain('"solid-js":');
	// Check they're vendored URLs (not CDN)
	expect(html).toContain('"/vendor/');
});

// ------ User import map ------

test("user import map entries appear in pages with islands", async () => {
	const html = await readHtml("mixed.html");
	expect(html).toContain('"custom-lib": "https://esm.sh/custom-lib"');
});

test("user import map entries are absent from static pages", async () => {
	const html = await readHtml("static.html");
	expect(html).not.toContain("custom-lib");
});

// ------ User importMap → external (signals via config, not built-in) ------

test("user importMap entries are treated as external in island bundles", async () => {
	const html = await readHtml("comrade-visible.html");
	// @preact/signals is in the import map (added via castro.config.ts, not built-in)
	expect(html).toContain('"@preact/signals"');
	expect(html).toContain("esm.sh/@preact/signals");
});

// ------ Solid-only page ------

test("solid-only page renders SSR content", async () => {
	const html = await readHtml("solid-only.html");
	expect(html).toContain("Solid:");
});

test("solid-only page has island wrapper", async () => {
	const html = await readHtml("solid-only.html");
	expect(html).toContain("<castro-island");
});

// ------ castro-jsx framework (signals + direct DOM) ------

test("castro-jsx island renders SSR content", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain("Castro: 5");
});

test("castro-jsx island has island wrapper", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain("<castro-island");
	expect(html).toContain('directive="comrade:visible"');
});

test("castro-jsx island has island runtime", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain("castro-island.js");
});

test("castro-jsx island has JS bundle reference", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain('import="/islands/CastroCounter');
});

// ------ castro-jsx: Fragment in reactive conditional ------
// Exercises the stable anchor pattern in bindReactiveChild. Before the fix,
// returning a Fragment from a reactive conditional broke on the second render
// because DocumentFragment dissolves on insert, leaving the anchor dangling.

test("castro-jsx fragment island renders SSR fragment children", async () => {
	const html = await readHtml("castro-jsx.html");
	// show() starts true → Fragment branch → both spans should appear in SSR
	expect(html).toContain("Fragment A");
	expect(html).toContain("Fragment B");
});

test("castro-jsx fragment island has island wrapper", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain('import="/islands/CastroFragmentToggle');
});

test("castro-jsx island has local runtime in import map (no CDN)", async () => {
	const html = await readHtml("castro-jsx.html");
	expect(html).toContain('"@vktrz/castro-jsx/dom"');
	expect(html).toContain('"@vktrz/castro-jsx/signals"');
	expect(html).toContain('"/vendor/_vktrz_castro-jsx_dom.js');
	expect(html).toContain('"/vendor/_vktrz_castro-jsx_signals.js');
});

// ------ onAfterBuild: conditional asset writing ------

test("castro-jsx runtime exists in vendor dist", async () => {
	const vendorDir = join(distDir, "vendor");
	const file = Bun.file(join(vendorDir, "_vktrz_castro-jsx_dom.js"));
	expect(await file.exists()).toBe(true);
});

test("castro-island.js exists in dist (hydrated islands used)", async () => {
	const file = Bun.file(join(distDir, "castro-island.js"));
	expect(await file.exists()).toBe(true);
});
