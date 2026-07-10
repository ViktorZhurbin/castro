import { expect, test } from "bun:test";
import { compile } from "./index.js";

const source = await Bun.file(
	new URL("../examples/Counter.castro", import.meta.url),
).text();
const out = compile(source);

test("hoists imports to module scope, keeps setup inside the component", () => {
	expect(out).toStartWith(
		'import { createElement, Fragment } from "@vktrz/castro-jsx";',
	);
	expect(out).toContain('import { createSignal } from "@vktrz/signals";');
	expect(out).toContain("export default function Component() {");
	expect(out).toContain("\tconst [count, setCount] = createSignal(0);");
});

test("wraps dynamic holes in thunks; statics stay static; events pass through", () => {
	expect(out).toContain("() => (count())"); // reactive text hole
	expect(out).toContain('"Clicked "'); // static segments preserved
	expect(out).toContain('" times"');
	expect(out).toContain('"onClick": inc'); // event handler passed through
	expect(out).not.toContain("() => (inc)"); // ...not thunk-wrapped
});

test("comrade:if compiles to a reactive conditional child", () => {
	expect(out).toContain("() => (count() > 5) ?");
	expect(out).toContain('createElement("p", null,');
	expect(out).not.toContain("comrade:if"); // directive consumed, not emitted
});

test("full emitted module", () => {
	expect(out).toMatchSnapshot();
});
