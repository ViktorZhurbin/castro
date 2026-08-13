/**
 * Serialized via .toString() for the inline script rendered by
 * ThemeToggle.tsx — see ClientScript's docblock. Must stay self-contained:
 * no references outside its own parameters and browser globals.
 *
 * A two-state toggle expressing three underlying states — explicit light,
 * explicit dark, or no override (follow system) — per
 * https://lea.verou.me/blog/2026/dark-mode-toggles/. Every click compares
 * the target appearance against the *current* system preference, checked
 * fresh at the moment of the click rather than cached or watched via a
 * media-query listener: if the target matches system, the stored override
 * is cleared (back to following system); otherwise the target is stored.
 * This lets an override outlive an unrelated system change and never
 * strips an explicit choice based on an event the user didn't cause.
 */
export function initState(storageKey: string, dark: string, light: string) {
  const btn = document.getElementById("theme-toggle") as HTMLButtonElement | null;

  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const target = current === dark ? light : dark;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? dark : light;

    document.documentElement.setAttribute("data-theme", target);

    if (target === systemTheme) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, target);
    }
  });
}
