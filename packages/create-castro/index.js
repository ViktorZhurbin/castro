#!/usr/bin/env bun
import { cp, rename } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";

async function question(promptText) {
	process.stdout.write(promptText);

	// `console` is async-iterable over stdin lines in Bun (and Node 23+)
	for await (const line of console) {
		return line.trim();
	}

	return "";
}

async function main() {
	console.log(styleText("red", "\nCASTRO — SITE COMMISSIONING INITIATED\n"));

	let projectName = await question(
		"Name of the collective's project (my-castro-site): ",
	);

	projectName = projectName || "my-castro-site";

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
