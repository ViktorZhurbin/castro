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

// ------ Conditional island output ------

test("vendored Preact runtime exists in dist", async () => {
	const file = Bun.file(join(distDir, "vendor", "preact.js"));
	expect(await file.exists()).toBe(true);
});

test("castro-island.js exists in dist (hydrated islands used)", async () => {
	const file = Bun.file(join(distDir, "castro-island.js"));
	expect(await file.exists()).toBe(true);
});
