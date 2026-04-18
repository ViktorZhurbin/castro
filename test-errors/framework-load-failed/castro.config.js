export default {
	plugins: [{
		name: "crashing-plugin",
		get frameworkConfig() {
			throw new Error("Plugin initialization failed");
		}
	}]
};
