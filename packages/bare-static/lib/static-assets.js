import fsPromises from "node:fs/promises";
import path from "node:path";

const COMPONENTS_DIR = "./components";

/**
 * Copy static assets (components, vendor) to output directory
 * @param {string} outputDir - The output directory path
 * @returns {Promise<string[]>} Array of script tags for components
 */
export async function copyStaticAssets(outputDir) {
	const componentScripts = []

	// Copy components directory if it exists and has files
	try {
		const files = await fsPromises.readdir(COMPONENTS_DIR);
		const jsFiles = files.filter((f) => f.endsWith(".js"));

		if (!jsFiles.length) return componentScripts;

		const componentsOutputDir = "components";

		await fsPromises.mkdir(
			path.join(outputDir, componentsOutputDir),
			{ recursive: true },
		);

		for (const fileName of jsFiles) {
			try {
				await fsPromises.copyFile(
					path.join(COMPONENTS_DIR, fileName),
					path.join(outputDir, componentsOutputDir, fileName),
				);

				// Generate script tag
				componentScripts.push(
					`<script type="module" src="/${componentsOutputDir}/${fileName}"></script>`,
				);
			} catch (err) {
				throw new Error(
					`Failed to copy component ${fileName}: ${err.message}`,
				);
			}
		}

		// Copy bare-signals from package if it exists
		const bareSignalsSource = "../bare-signals/lib/index.js";
		try {
			await fsPromises.access(bareSignalsSource);
			const vendorDir = path.join(outputDir, "vendor");
			await fsPromises.mkdir(vendorDir, { recursive: true });
			await fsPromises.copyFile(
				bareSignalsSource,
				path.join(vendorDir, "bare-signals.js"),
			);
		} catch {
			// bare-signals package not found, skip (user will handle dependencies)
		}
	} catch (err) {
		// If it's ENOENT (directory doesn't exist), silently skip - nothing to do
		if (err.code === "ENOENT") return componentScripts;

		// Otherwise, it's a real error - rethrow it
		throw err;
	}

	return componentScripts;
}
