/**
 * Tests for error building and normalization utilities.
 * Validates payload structure only; terminal/browser rendering is manual.
 */

import { expect, test } from "bun:test";
import { CastroError, toPayload } from "./errors.js";

test("CastroError creates structured payload with tokens", () => {
	const err = new CastroError("ROUTE_CONFLICT", {
		route: "/about",
		file1: "pages/about.md",
		file2: "pages/about.tsx",
	});

	expect(err.castroPayload).toBeDefined();

	const payload = err.castroPayload;

	expect(payload.code).toBe("ROUTE_CONFLICT");
	expect(payload.title).toBeTruthy();
	expect(payload.message).toBeTruthy();
	expect(payload.hint).toBeTruthy();
	expect(payload.notes?.length).toBeGreaterThan(0);
});

test("CastroError preserves frames in payload", () => {
	/** @type {import("../types.d.ts").CodeFrame[]} */
	const frames = [
		{
			file: "/project/pages/about.md",
			line: 3,
			column: 1,
			lineText: "layout: missing",
		},
		{ file: "/project/layouts/missing.jsx" },
	];

	const err = new CastroError(
		"LAYOUT_NOT_FOUND",
		{ layoutId: "missing", sourceFilePath: "pages/about.md" },
		frames,
	);

	const payload = err.castroPayload;

	expect(payload.frames).toBeArray();
	expect(payload.frames).toHaveLength(2);

	// Optional chaining (rather than destructuring) avoids relying on a
	// type-narrowing `if` for `frames`, which is optional on the payload type.
	const first = payload.frames?.[0];
	expect(first?.file).toBe("/project/pages/about.md");
	expect(first?.line).toBe(3);
	expect(first?.column).toBe(1);
	expect(first?.lineText).toBe("layout: missing");
});

test("CastroError defaults to empty frames array", () => {
	const err = new CastroError("NO_DEFAULT_LAYOUT", { dir: "layouts" });

	expect(err.castroPayload.frames).toBeArray();
	expect(err.castroPayload.frames).toHaveLength(0);
});

test("CastroError surfaces errorMessage token in payload", () => {
	const err = new CastroError("ISLAND_RENDER_FAILED", {
		islandId: "Counter",
		sourceFilePath: "pages/index.tsx",
		errorMessage: "window is not defined",
	});

	const payload = err.castroPayload;

	expect(payload.errorMessage).toBe("window is not defined");
});

test("toPayload passes through CastroError payload unchanged", () => {
	const err = new CastroError("NO_PAGES", { dir: "pages/" });
	const payload = toPayload(err);

	expect(payload).toBe(err.castroPayload);
	expect(payload.code).toBe("NO_PAGES");
});

test("toPayload normalizes plain Error to UNEXPECTED", () => {
	const plainErr = new Error("boom");
	const payload = toPayload(plainErr);

	expect(payload.code).toBe("UNEXPECTED");
	// Raw text is errorMessage; message/hint come from the UNEXPECTED factory,
	// so the fallback renders like every other error instead of a bare string.
	expect(payload.errorMessage).toBe("boom");
	expect(payload.message).toBe("The revolution has encountered an anomaly");
	expect(payload.hint).toBeString();
});

test("toPayload normalizes non-Error thrown values", () => {
	const payload = toPayload("something went wrong");

	expect(payload.code).toBe("UNEXPECTED");
	expect(payload.errorMessage).toBe("something went wrong");
});
