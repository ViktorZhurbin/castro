import { DARK, LIGHT, STORAGE_KEY } from "../lib/theme.ts";

type LightTheme = typeof LIGHT;
type DarkTheme = typeof DARK;
type Theme = LightTheme | DarkTheme;

/**
 * Runs before first paint to prevent theme flash.
 * Written as a real function for readability and type checking,
 * serialized via .toString() for the inline script.
 */
function themeInit(storageKey: string, light: LightTheme, dark: DarkTheme) {
	try {
		const storedTheme = localStorage.getItem(storageKey);
		let theme: Theme;

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

const script = `(${themeInit.toString()})("${STORAGE_KEY}","${LIGHT}","${DARK}")`;

export function ThemeScript() {
	return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
