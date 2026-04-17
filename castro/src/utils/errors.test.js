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
