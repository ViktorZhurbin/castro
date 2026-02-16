/**
 * Build Output Verifier
 *
 * Builds each test site, then checks the HTML output using Bun's test runner.
 * Auto-discovers subdirectories of test-sites/ so adding a new framework
 * (e.g. test-sites/solid/) is picked up automatically.
 *
 * Usage: bun test test-sites/verify.test.js
 */

import { beforeAll, describe, expect, test } from "bun:test";
import { execSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const testSitesDir = import.meta.dir;
const dirs = await readdir(testSitesDir, { withFileTypes: true });
const siteDirs = dirs
	.filter((d) => d.isDirectory())
	.map((d) => ({ name: d.name, path: join(testSitesDir, d.name) }));

/** @param {string} distDir @param {string} file */
async function readHtml(distDir, file) {
	const f = Bun.file(join(distDir, file));
	if (!(await f.exists())) throw new Error(`Missing output file: ${file}`);
	return f.text();
}

for (const site of siteDirs) {
	describe(site.name, () => {
		const distDir = join(site.path, "dist");

		beforeAll(() => {
			execSync("bun run build", { cwd: site.path, stdio: "inherit" });
		});

		// ------ Static page (no islands) ------

		test("static page renders content", async () => {
			const html = await readHtml(distDir, "static.html");
			expect(html).toContain("<h1>Static Page</h1>");
			expect(html).toContain("<!DOCTYPE html>");
		});

		test("static page has no island artifacts", async () => {
			const html = await readHtml(distDir, "static.html");
			expect(html).not.toContain("castro-island");
			expect(html).not.toContain("castro-island.js");
			expect(html).not.toContain("<style>");
		});

		// ------ comrade:visible directive ------

		test("comrade:visible has island wrapper", async () => {
			const html = await readHtml(distDir, "visible.html");
			expect(html).toContain("<castro-island");
			expect(html).toContain('directive="comrade:visible"');
		});

		test("comrade:visible has island runtime", async () => {
			const html = await readHtml(distDir, "visible.html");
			expect(html).toContain("castro-island.js");
		});

		test("comrade:visible has island JS bundle reference", async () => {
			const html = await readHtml(distDir, "visible.html");
			expect(html).toContain('import="/');
		});

		test("comrade:visible has SSR content", async () => {
			const html = await readHtml(distDir, "visible.html");
			expect(html).toContain("Count:");
		});

		test("comrade:visible has island CSS", async () => {
			const html = await readHtml(distDir, "visible.html");
			expect(html).toContain("<style>");
			expect(html).toContain("color: red");
		});

		// ------ lenin:awake directive ------

		test("lenin:awake has correct directive", async () => {
			const html = await readHtml(distDir, "awake.html");
			expect(html).toContain("<castro-island");
			expect(html).toContain('directive="lenin:awake"');
		});

		test("lenin:awake has island runtime", async () => {
			const html = await readHtml(distDir, "awake.html");
			expect(html).toContain("castro-island.js");
		});

		// ------ no:pasaran directive ------

		test("no:pasaran renders HTML content", async () => {
			const html = await readHtml(distDir, "nopasaran.html");
			expect(html).toContain("Count:");
		});

		test("no:pasaran has no island wrapper", async () => {
			const html = await readHtml(distDir, "nopasaran.html");
			expect(html).not.toContain("<castro-island");
		});

		test("no:pasaran ships no client JS", async () => {
			const html = await readHtml(distDir, "nopasaran.html");
			expect(html).not.toContain('import="/');
			expect(html).not.toContain("castro-island.js");
		});

		// ------ Multiple islands ------

		test("multi page has both islands", async () => {
			const html = await readHtml(distDir, "multi.html");
			const count = (html.match(/<castro-island/g) || []).length;
			expect(count).toBe(2);
		});

		test("multi page has CSS for both islands", async () => {
			const html = await readHtml(distDir, "multi.html");
			expect(html).toContain("color: red");
			expect(html).toContain("font-weight: bold");
		});

		// ------ Component composition ------

		test("island inside static component gets wrapper", async () => {
			const html = await readHtml(distDir, "compound.html");
			expect(html).toContain("<castro-island");
			expect(html).toContain("Count:");
			expect(html).toContain("<h2>Nested Island</h2>");
		});

		test("static component inside island renders", async () => {
			const html = await readHtml(distDir, "multi.html");
			expect(html).toContain('<span class="label">');
		});

		test("island in layout renders with wrapper", async () => {
			const html = await readHtml(distDir, "layout-island.html");
			expect(html).toContain("<castro-island");
			expect(html).toContain('directive="lenin:awake"');
			expect(html).toContain("Count:");
			expect(html).toContain("<h1>Layout Island Test</h1>");
		});

		// ------ CSS modules ------

		test("CSS modules in static components get scoped class names", async () => {
			const html = await readHtml(distDir, "cssmodules.html");
			expect(html).toMatch(/class="card_[^"]+"/);
			expect(html).toContain("Hello from card");
		});

		test("CSS modules in static components extract CSS to file", async () => {
			const html = await readHtml(distDir, "cssmodules.html");
			expect(html).toContain('href="/cssmodules.css"');
		});

		test("CSS modules in islands get scoped class in SSR and CSS", async () => {
			const html = await readHtml(distDir, "cssmodules.html");
			// Scoped class in extracted CSS
			expect(html).toMatch(/\.clicker_[^\s{]+/);
			// Same scoped class in SSR-rendered markup (not just after hydration)
			expect(html).toMatch(/class="clicker_[^"]+"/);
		});

		// ------ Markdown page ------

		test("markdown page renders to HTML", async () => {
			const html = await readHtml(distDir, "markdown.html");
			expect(html).toContain("<h1>Markdown Heading</h1>");
			expect(html).toContain("<p>Paragraph content here.</p>");
		});

		test("markdown page has no island artifacts", async () => {
			const html = await readHtml(distDir, "markdown.html");
			expect(html).not.toContain("castro-island");
		});
	});
}
