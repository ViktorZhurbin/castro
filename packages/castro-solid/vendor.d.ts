// Babel presets that don't ship their own type declarations
declare module "@babel/preset-typescript" {
	const preset: import("@babel/core").PluginItem;
	export default preset;
}

declare module "babel-preset-solid" {
	const preset: import("@babel/core").PluginItem;
	export default preset;
}
