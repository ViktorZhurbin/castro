import "./Footer.css";

export function Footer() {
  return (
    <footer class="footer">
      <div class="container footer-slogan">
        <p>Workers of the Web, Unite.</p>
        <p>Seize the Means of Rendering.</p>
      </div>
      <div class="container footer-baseline">
        <span class="footer-tagline">Built with Castro | The People's Framework</span>
        <span class="footer-meta">
          <a href="https://github.com/ViktorZhurbin/castro" target="_blank" rel="noopener">
            GitHub
          </a>{" "}
          · MIT · © 2026-present
        </span>
      </div>
    </footer>
  );
}
