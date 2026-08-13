/**
 * Serialized via .toString() for the inline script rendered by
 * ThemeScript.tsx — see ClientScript's docblock. Must stay self-contained:
 * no references outside its own parameters and browser globals.
 *
 * Only ever *reads* the stored preference. A version that writes back the
 * resolved theme even when nothing was stored would silently turn "follow
 * system" into a permanent pin on the very first page load, which is the
 * exact failure this file's tests pin — see themeInit.test.ts.
 */
export function themeInit(storageKey: string, dark: string, light: string) {
  try {
    const storedTheme = localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? dark : light;
    const theme = storedTheme === light || storedTheme === dark ? storedTheme : systemTheme;

    document.documentElement.setAttribute("data-theme", theme);
  } catch {}
}
