import type { Asset } from "@vktrz/castro";

// Legacy: returns the shape Castro's removed plugin API consumed.
export function tailwind(options: { input: string | string[] }): {
	name: string;
	watchDirs: string[];
	onPageBuild(): Promise<void>;
	getPageAssets(): Asset[];
};
