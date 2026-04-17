export default {
	plugins: [{
		name: "no-detection-plugin",
		frameworkConfig: {
			id: "no-detection",
			getBuildConfig: () => ({}),
			clientDependencies: [],
			hydrateFnString: "// hydrate",
			renderSSR: () => "",
			// detectImports and detectExports both absent
		}
	}]
};
