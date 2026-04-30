import { navSections } from "@/nav";
import "./Footer.css";

export function Footer() {
	return (
		<footer class="footer">
			<div class="container footer-grid">
				<div class="footer-brand">
					<p class="footer-mark">CASTRO</p>
					<p class="footer-desc">SSG that teaches island architecture.</p>
					<a
						class="btn btn-base"
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
					>
						GitHub
					</a>
				</div>

				{navSections.map(({ key, title, links }) => (
					<FooterNavColumn
						key={key}
						title={title}
						links={links}
					/>
				))}
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

function FooterNavColumn({
	title,
	links,
}: {
	title: string;
	links: { href: string; label: string }[];
}) {
	return (
		<nav class="footer-col">
			<h4>{title}</h4>
			<ul>
				{links.map((l) => (
					<li>
						<a href={l.href}>{l.label}</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
