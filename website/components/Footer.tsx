import "./Footer.css";

export function Footer() {
	return (
		<footer class="footer">
			{/* Slogan locked hard left */}
			<div class="footer-slogan">
				<p>WORKERS OF THE WEB, UNITE!</p>
				<p>SEIZE THE MEANS OF RENDERING.</p>
			</div>

			{/* Utilities anchored right */}
			<div class="footer-nav-section">
				<nav class="footer-nav">
					<a href="/about">About</a>
					<a
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
					>
						GitHub
					</a>
				</nav>
				<p class="footer-info">
					Built with Castro <br />
					The People's Framework
				</p>
			</div>
		</footer>
	);
}
