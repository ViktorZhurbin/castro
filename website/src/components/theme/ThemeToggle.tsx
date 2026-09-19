import "./ThemeToggle.css";

/**
 * Looks like a two-button Day/Night switch but is one button: every click
 * flips the theme (handled by the script in theme.ts), so a second button
 * would only add a case where clicking the already-active half does nothing.
 * The filled half follows `data-theme` in CSS.
 */
export function ThemeToggle() {
  return (
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
      <span class="theme-toggle-day">Day</span>
      <span class="theme-toggle-night">Night</span>
    </button>
  );
}
