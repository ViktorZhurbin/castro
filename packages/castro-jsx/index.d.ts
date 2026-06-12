// Legacy: the framework-config shape Castro's removed plugin API consumed,
// inlined here since core no longer exports it.
type FrameworkConfig = {
	id: string;
	getBuildConfig: (target?: string) => object;
	clientDependencies: string[];
	detectImports: string[];
	hydrateClientPath: string;
	renderSSR: (
		Component: (props: object) => unknown,
		props: Record<string, unknown>,
	) => string;
};

export function castroJsx(): { name: string; frameworkConfig: FrameworkConfig };
