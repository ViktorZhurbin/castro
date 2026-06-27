import "./Footer.css";

export function Footer() {
	return (
		<footer class="footer">
			<div class="container footer-baseline">
				<span class="footer-slogan-small">Workers of the web, unite!</span>
				<span class="footer-meta">
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
					>
						GitHub
					</a>{" "}
					· MIT · © 2026-present
				</span>
			</div>
		</footer>
	);
}
