/**
 * Tests for error building and normalization utilities.
 * Validates payload structure only; terminal/browser rendering is manual.
 */

import { test } from "bun:test";
import { CastroError, toPayload } from "./errors.js";

test("CastroError creates structured payload with tokens", () => {
	const err = new CastroError("ROUTE_CONFLICT", {
		route1: "pages/about.md",
		route2: "pages/about.tsx",
		outputPath: "about.html",
	});

	if (!err.castroPayload) {
		throw new Error("Missing castroPayload");
	}

	const payload = err.castroPayload;

	if (payload.code !== "ROUTE_CONFLICT") {
		throw new Error(`Expected code ROUTE_CONFLICT, got ${payload.code}`);
	}

	if (!payload.title) {
		throw new Error("Missing title");
	}

	if (!payload.message) {
		throw new Error("Missing message");
	}

	if (!payload.hint) {
		throw new Error("Missing hint");
	}

	if (!payload.notes || payload.notes.length === 0) {
		throw new Error("Expected notes array");
	}
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
		{ layoutName: "missing", sourceFilePath: "pages/about.md" },
		frames,
	);

	const payload = err.castroPayload;

	if (!Array.isArray(payload.frames) || payload.frames.length !== 2) {
		throw new Error(`Expected 2 frames, got ${payload.frames?.length}`);
	}

	const [first] = payload.frames;
	if (
		first.file !== "/project/pages/about.md" ||
		first.line !== 3 ||
		first.lineText !== "layout: missing"
	) {
		throw new Error("Frame fields not preserved correctly");
	}
});

test("CastroError defaults to empty frames array", () => {
	const err = new CastroError("NO_LAYOUTS_DIR", undefined);

	if (
		!Array.isArray(err.castroPayload.frames) ||
		err.castroPayload.frames.length !== 0
	) {
		throw new Error("Expected empty frames array by default");
	}
});

test("CastroError surfaces errorMessage token in payload", () => {
	const err = new CastroError("ISLAND_RENDER_FAILED", {
		islandId: "Counter",
		errorMessage: "window is not defined",
	});

	const payload = err.castroPayload;

	if (payload.errorMessage !== "window is not defined") {
		throw new Error(
			`Expected errorMessage to be "window is not defined", got ${payload.errorMessage}`,
		);
	}
});

test("toPayload passes through CastroError payload unchanged", () => {
	const err = new CastroError("NO_PAGES", { dir: "pages/" });
	const payload = toPayload(err);

	if (payload !== err.castroPayload) {
		throw new Error(
			"toPayload should return the exact castroPayload reference",
		);
	}

	if (payload.code !== "NO_PAGES") {
		throw new Error(`Expected code NO_PAGES, got ${payload.code}`);
	}
});

test("toPayload normalizes plain Error to UNEXPECTED", () => {
	const plainErr = new Error("boom");
	const payload = toPayload(plainErr);

	if (payload.code !== "UNEXPECTED") {
		throw new Error(`Expected UNEXPECTED, got ${payload.code}`);
	}

	if (payload.message !== "boom") {
		throw new Error(`Expected message "boom", got ${payload.message}`);
	}
});

test("toPayload normalizes non-Error thrown values", () => {
	const payload = toPayload("something went wrong");

	if (payload.code !== "UNEXPECTED") {
		throw new Error(`Expected UNEXPECTED, got ${payload.code}`);
	}

	if (payload.message !== "something went wrong") {
		throw new Error(`Expected string value as message, got ${payload.message}`);
	}
});
