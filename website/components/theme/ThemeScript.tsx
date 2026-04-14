import { ClientScript } from "@vktrz/castro";
import { DARK, LIGHT, STORAGE_KEY } from "./constants.ts";

export function ThemeScript() {
	return <ClientScript fn={themeInit} args={[STORAGE_KEY, DARK, LIGHT]} />;
}

/**
 * Runs before first paint to prevent theme flash.
 * Written as a real function for readability and type checking,
 * serialized via .toString() for the inline script.
 */
function themeInit(storageKey: string, dark: string, light: string) {
	try {
		const storedTheme = localStorage.getItem(storageKey);

		let theme: string;
		if (storedTheme === light || storedTheme === dark) {
			theme = storedTheme;
		} else if (window.matchMedia("(prefers-color-scheme:dark)").matches) {
			theme = dark;
		} else {
			theme = light;
		}

		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem(storageKey, theme);
	} catch (_) {}
}
