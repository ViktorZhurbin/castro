import { expect, test } from "bun:test";
import { createEffect, createSignal } from "./index.js";

// createEffect is a no-op when `window` is undefined (the SSR guard).
// Stub it so the reactive path runs under bun's DOM-less test environment.
globalThis.window ??= /** @type {any} */ ({});

test("effect re-runs when a read signal changes", () => {
	const [count, setCount] = createSignal(0);
	let observed = -1;

	createEffect(() => {
		observed = count();
	});
	expect(observed).toBe(0); // runs immediately to establish the dependency

	setCount(5);
	expect(observed).toBe(5); // re-runs on write

	setCount((c) => c + 1);
	expect(observed).toBe(6); // updater form
});

test("effect only re-runs for signals it actually read", () => {
	const [a, setA] = createSignal(0);
	const [, setB] = createSignal(0);
	let runs = 0;

	createEffect(() => {
		a();
		runs++;
	});
	expect(runs).toBe(1);

	setB(1); // b was never read — no re-run
	expect(runs).toBe(1);

	setA(1);
	expect(runs).toBe(2);
});
