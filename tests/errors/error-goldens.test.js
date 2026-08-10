/**
 * Error DX Regression Suite
 *
 * Runs `castro build` in each tests/errors/* fixture and asserts that stderr
 * matches the committed golden. Catches wrong error codes, leaked Bun stack
 * frames, broken rendering (missing hints, dropped notes, misaligned carets),
 * and any other regression in the structured error output pipeline.
 *
 * Usage:
 *   bun test:errors              # compare against goldens
 *   UPDATE_SNAPSHOTS=1 bun test:errors  # regenerate goldens
 */

import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { messages } from "../../core/src/messages/index.js";

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
			`Missing golden: ${goldenPath}\nRun test errors command with UPDATE_SNAPSHOTS=1 to generate.`,
		);
	}
	return (await f.text()).trimEnd();
}

// Every directory here is a fixture — except dotfile dirs, which tooling
// drops in and which have no castro binary to spawn.
const caseDirs = readdirSync(testErrorsDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
	.map((entry) => join(testErrorsDir, entry.name))
	.sort();

for (const caseDir of caseDirs) {
	const caseName = caseDir.split("/").pop();

	test(`error case: ${caseName}`, async () => {
		// A fixture linked by `bun install` has this; a freshly added one that
		// nobody installed yet does not, and spawnSync's ENOENT names only the
		// missing path.
		const castroBin = join(caseDir, "node_modules/.bin/castro");
		if (!(await Bun.file(castroBin).exists())) {
			throw new Error(`No castro binary in ${caseName} — run \`bun install\` at the repo root.`);
		}

		const result = Bun.spawnSync([castroBin, "build"], {
			cwd: caseDir,
			stderr: "pipe",
			stdout: "pipe",
		});

		// Every fixture is a build that must fail.
		expect(result.exitCode).toBe(1);

		const normalized = normalizeStderr(result.stderr.toString(), caseDir);
		const goldenPath = join(caseDir, "expected.stderr.txt");
		const expected = await readOrUpdateGolden(goldenPath, normalized);

		if (expected !== null) {
			expect(normalized).toBe(expected);
		}
	});
}

// README.md hand-maintains a table mapping each fixture dir to the
// ErrorCode it pins — it has drifted before (see commit ccb5771). Parsing it
// here turns a future drift into a failing test instead of stale prose.
const readmeText = await Bun.file(join(testErrorsDir, "README.md")).text();
const tableRowPattern = /^\|\s*`([^`]+)`\s*\|[^|]*\|\s*`([^`]+)`\s*\|/gm;

/** @type {Map<string, string>} fixture dir name -> the ErrorCode the table says it pins */
const documentedFixtures = new Map(
	[...readmeText.matchAll(tableRowPattern)].map((match) => [match[1], match[2]]),
);

test("README table lists exactly the fixture dirs on disk", () => {
	const onDisk = new Set(caseDirs.map((dir) => dir.split("/").pop()));
	const documentedDirs = new Set(documentedFixtures.keys());

	const undocumented = [...onDisk].filter((dir) => !documentedDirs.has(dir)).sort();
	const stale = [...documentedDirs].filter((dir) => !onDisk.has(dir)).sort();

	expect({ undocumented, stale }).toEqual({ undocumented: [], stale: [] });
});

// Codes no fixture can pin — README.md's prose below the table explains all
// three: the first two are internal invariants no user input can arrange,
// the third is the toPayload() catch-all no single scenario reaches.
const EXEMPT_ERROR_CODES = [
	"ISLAND_NOT_FOUND", // internal invariant; its own hint says "please report it"
	"BUNDLE_NO_OUTPUT", // fires only when a successful Bun.build yields no .js output
	"UNEXPECTED", // toPayload() fallback for any non-CastroError throw
];

test("every ErrorCode is pinned by a fixture or explicitly exempted", () => {
	const allCodes = Object.keys(messages.errors).sort();
	const covered = new Set([...documentedFixtures.values(), ...EXEMPT_ERROR_CODES]);

	expect([...covered].sort()).toEqual(allCodes);
});
