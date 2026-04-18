export default {
	plugins: [{
		name: "bad-framework-plugin",
		frameworkConfig: {
			id: "broken",
			// Missing: getBuildConfig, clientDependencies, hydrateFnString, renderSSR
		}
	}]
};
