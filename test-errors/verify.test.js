/**
 * Error DX Regression Suite
 *
 * Runs `castro build` in each test-errors/NN-* fixture and asserts that stderr
 * matches the committed golden. Catches wrong error codes, leaked Bun stack
 * frames, broken rendering (missing hints, dropped notes, misaligned carets),
 * and any other regression in the structured error output pipeline.
 *
 * Usage:
 *   bun test test-errors              # compare against goldens
 *   UPDATE_SNAPSHOTS=1 bun test test-errors  # regenerate goldens
 */

import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const testErrorsDir = import.meta.dir;

/** @param {string} s */
function escapeRegex(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} raw
 * @param {string} caseDir
 */
function normalizeStderr(raw, caseDir) {
	return raw
		.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
		.replace(new RegExp(escapeRegex(caseDir), "g"), "<FIXTURE>")
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n")
		.trimEnd();
}

/**
 * @param {string} goldenPath
 * @param {string} actual
 */
async function readOrUpdateGolden(goldenPath, actual) {
	if (process.env.UPDATE_SNAPSHOTS) {
		await Bun.write(goldenPath, actual + "\n");
		return null;
	}
	const f = Bun.file(goldenPath);
	if (!(await f.exists())) {
		throw new Error(
			`Missing golden: ${goldenPath}\nRun UPDATE_SNAPSHOTS=1 bun test test-errors to generate.`,
		);
	}
	return (await f.text()).trimEnd();
}

const caseDirs = readdirSync(testErrorsDir)
	.filter((name) => /^\d{2}-/.test(name))
	.sort()
	.map((name) => join(testErrorsDir, name));

for (const caseDir of caseDirs) {
	const caseName = caseDir.split("/").pop();

	test(`error case: ${caseName}`, async () => {
		const result = Bun.spawnSync(
			[join(caseDir, "node_modules/.bin/castro"), "build"],
			{ cwd: caseDir, stderr: "pipe", stdout: "pipe" },
		);

		expect(result.exitCode).toBe(1);

		const normalized = normalizeStderr(result.stderr.toString(), caseDir);
		const goldenPath = join(caseDir, "expected.stderr.txt");
		const expected = await readOrUpdateGolden(goldenPath, normalized);

		if (expected !== null) {
			expect(normalized).toBe(expected);
		}
	});
}
