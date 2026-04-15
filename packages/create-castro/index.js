#!/usr/bin/env bun
import { cp, rename } from "node:fs/promises";
import { join } from "node:path";
import { styleText } from "node:util";
import { version } from "./package.json";

async function question(promptText) {
	process.stdout.write(promptText);

	// `console` is async-iterable over stdin lines in Bun (and Node 23+)
	for await (const line of console) {
		return line.trim();
	}

	return "";
}

async function getUsername() {
	try {
		const proc = Bun.spawn(["git", "config", "user.name"], {
			stdout: "pipe",
			stderr: "ignore",
		});
		const name = await proc.stdout.text();
		return name.trim().split(" ")[0];
	} catch {
		return "";
	}
}

async function main() {
	const username = await getUsername();

	const title = `create-castro ${styleText("gray", `v${version}`)}`;
	const greeting = username ? `  Welcome, Comrade ${username}.` : "";
	console.log(`\n${styleText("bold", title)}${greeting}\n`);

	let projectName = await question("Project name (my-castro-site): ");

	projectName = projectName || "my-castro-site";

	const targetDir = join(process.cwd(), projectName);
	const templateDir = join(import.meta.dir, "template");

	console.log(styleText("gray", `\nCopying template to ./${projectName}...`));
	await cp(templateDir, targetDir, { recursive: true });

	// npm strips .gitignore when publishing — template uses _gitignore as workaround
	try {
		await rename(join(targetDir, "_gitignore"), join(targetDir, ".gitignore"));
	} catch {}

	console.log(styleText("gray", "Installing dependencies..."));
	try {
		const proc = Bun.spawn(["bun", "install"], {
			cwd: targetDir,
			stdout: "ignore",
			stderr: "pipe",
		});
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			const stderr = await proc.stderr.text();
			console.warn(
				styleText("yellow", "⚠️  Auto-install failed. Run bun install manually."),
			);
			if (stderr) {
				console.warn(styleText("gray", stderr));
			}
		}
	} catch {
		console.warn(
			styleText("yellow", "⚠️  Auto-install failed. Run bun install manually."),
		);
	}

	console.log(
		styleText("green", "\n✓ Commissioning complete. The people await.\n"),
	);
	console.log("Next steps:");
	console.log(styleText("cyan", `  cd ${projectName}`));
	console.log(styleText("cyan", "  bun run dev"));
	console.log(styleText("gray", `\n  bun run build  to build for production\n`));
}

main().catch((err) => {
	console.error(styleText("red", `\n❌ Commissioning failed: ${err.message}`));
	process.exit(1);
});
