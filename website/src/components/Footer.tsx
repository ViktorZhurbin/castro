import "./Footer.css";

export function Footer() {
	return (
		<footer class="footer">
			<div class="container">
				<div class="footer-brand">
					<p class="footer-mark">CASTRO</p>
					<p class="footer-desc">A static site generator built to be read.</p>
					<a
						class="btn btn-base"
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
					>
						GitHub
					</a>
				</div>
			</div>
			<hr class="divider" />
			<div class="container footer-baseline">
				<span class="footer-slogan-small">Workers of the web, unite!</span>
				<span class="footer-meta">
					Built with Castro · MIT · © 2026-present
				</span>
			</div>
		</footer>
	);
}
