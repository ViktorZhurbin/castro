#!/usr/bin/env bun
import { cp, rename } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";

async function question(promptText) {
	const input = await new Promise((resolve) => {
		// For pipe/redirect input: read from stdin
		if (!process.stdin.isTTY) {
			const chunks = [];
			process.stdin.on("data", (chunk) => chunks.push(chunk));
			process.stdin.on("end", () => {
				resolve(Buffer.concat(chunks).toString().trim());
			});
			return;
		}

		// For interactive terminal: read line from stdin
		process.stdout.write(promptText);

		let line = "";
		const onData = (chunk) => {
			const str = chunk.toString();
			const newline = str.indexOf("\n");
			if (newline !== -1) {
				line += str.slice(0, newline);
				process.stdin.removeListener("data", onData);
				process.stdin.removeListener("end", onEnd);
				process.stdin.pause();
				resolve(line);
			} else {
				line += str;
			}
		};

		const onEnd = () => {
			process.stdin.removeListener("data", onData);
			resolve(line);
		};

		process.stdin.on("data", onData);
		process.stdin.on("end", onEnd);
		process.stdin.resume();
	});

	return input;
}

async function main() {
	console.log(styleText("red", "\nCASTRO — SITE COMMISSIONING INITIATED\n"));

	let projectName = await question(
		"Name of the collective's project (my-castro-site): ",
	);

	projectName = projectName.trim() || "my-castro-site";

	const targetDir = join(process.cwd(), projectName);
	const templateDir = join(import.meta.dir, "template");

	console.log(
		styleText(
			"gray",
			`\nDistributing state-approved files to ./${projectName}...`,
		),
	);
	await cp(templateDir, targetDir, { recursive: true });

	// npm strips .gitignore when publishing — template uses _gitignore as workaround
	try {
		await rename(join(targetDir, "_gitignore"), join(targetDir, ".gitignore"));
	} catch {}

	console.log(styleText("gray", "Enrolling dependencies in the collective..."));
	try {
		const proc = Bun.spawn(["bun", "install"], {
			cwd: targetDir,
			stdio: ["ignore", "ignore", "ignore"],
		});
		await proc.exited;
	} catch {
		console.warn(
			styleText("yellow", "⚠️  Auto-install failed. Run bun install manually."),
		);
	}

	console.log(
		styleText("green", "\n✓ Commissioning complete. The people await.\n"),
	);
	console.log("To begin your labor:");
	console.log(styleText("cyan", `  cd ${projectName}`));
	console.log(styleText("cyan", "  bun run dev\n"));
}

main().catch((err) => {
	console.error(styleText("red", `\n❌ Commissioning failed: ${err.message}`));
	process.exit(1);
});
