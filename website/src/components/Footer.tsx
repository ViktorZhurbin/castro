import "./Footer.css";

const guideLinks = [
	{ href: "/guide/quick-start", label: "Quick Start" },
	{ href: "/guide/components-islands", label: "Components & Islands" },
	{ href: "/guide/plugins", label: "Plugins" },
];

const howItWorksLinks = [
	{ href: "/how-it-works", label: "Build Pipeline" },
	{ href: "/how-it-works/source", label: "Reading the Source" },
	{ href: "/how-it-works/hydration", label: "Hydration" },
];

const referenceLinks = [
	{ href: "/reference/config", label: "Config" },
	{ href: "/reference/plugin-api", label: "Plugin API" },
	{ href: "/about", label: "About" },
];

export function Footer() {
	return (
		<footer class="footer">
			<div class="container footer-grid">
				<div class="footer-brand">
					<p class="footer-mark">CASTRO</p>
					<p class="footer-desc">
						The static site generator that teaches island architecture.
						MIT licensed.
					</p>
					<a
						class="footer-star"
						href="https://github.com/ViktorZhurbin/castro"
						target="_blank"
						rel="noopener"
					>
						★ Star on GitHub
					</a>
				</div>

				<FooterNavColumn title="Guide" links={guideLinks} />
				<FooterNavColumn title="How It Works" links={howItWorksLinks} />
				<FooterNavColumn title="Reference" links={referenceLinks} />

				<div class="footer-baseline">
					<span class="footer-slogan-small">
						Workers of the web, unite.
					</span>
					<span class="footer-meta">
						Built with Castro · MIT · © {new Date().getFullYear()}
					</span>
				</div>
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
