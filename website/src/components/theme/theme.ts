/**
 * Rendered inline in <head> by ThemeScript.tsx, so it runs before first
 * paint and the page never flashes the wrong theme.
 *
 * Resolution only ever *reads* the stored preference. Writing back the
 * resolved theme when nothing was stored would turn "follow system" into a
 * permanent pin on the first page load — see theme.test.ts.
 *
 * The toggle is a two-state button expressing three underlying states —
 * explicit light, explicit dark, or no override (follow system) — per
 * https://lea.verou.me/blog/2026/dark-mode-toggles/. Every click compares
 * the target appearance against the system preference read at the moment of
 * the click, not cached or watched via a media-query listener: if the target
 * matches system, the stored override is cleared; otherwise the target is
 * stored. So an override outlives an unrelated system change, and an
 * explicit choice is never dropped because of an event the user didn't cause.
 *
 * The click listener sits on `document` because the button doesn't exist yet
 * when this runs in <head>.
 */
export function initTheme() {
  const systemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  try {
    const storedTheme = localStorage.getItem("theme");
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme();

    document.documentElement.setAttribute("data-theme", theme);
  } catch {}

  document.addEventListener("click", (event) => {
    if (!(event.target as Element).closest("#theme-toggle")) return;

    const target =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", target);

    if (target === systemTheme()) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", target);
    }
  });
}
