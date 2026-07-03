/**
 * End-to-end proof of the whole pipeline: compile a .castro file, run the
 * emitted module against the real castro-jsx runtime in a DOM, and check that
 * it renders and *reacts*. This is the "it works" milestone, automated.
 */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { compile } from "./index.js";

/** @type {() => Node} */
let Component;

beforeAll(async () => {
	GlobalRegistrator.register(); // window/document/Node globals for the runtime

	const source = compile(
		await Bun.file(
			new URL("../examples/Counter.castro", import.meta.url),
		).text(),
	);

	// Emit into dist/ (gitignored, inside the package) so the bare-specifier
	// imports resolve against the workspace at import time.
	const entry = new URL("../dist/Counter.compiled.js", import.meta.url);
	await Bun.write(entry, source);
	Component = (await import(entry.pathname)).default;
});

afterAll(() => GlobalRegistrator.unregister());

test("renders initial state and reacts to clicks", () => {
	const app = document.createElement("div");
	app.append(Component());

	const button = /** @type {HTMLButtonElement} */ (app.querySelector("button"));
	expect(button.textContent).toBe("Clicked 0 times");
	expect(app.querySelector("p")).toBeNull(); // comrade:if false at 0

	for (let i = 0; i < 6; i++) button.click();

	expect(button.textContent).toBe("Clicked 6 times"); // reactive text updated
	expect(app.querySelector("p")?.textContent).toBe(
		"The proletariat tires of clicking.", // comrade:if flipped past 5
	);
});
