import type { VNode } from "preact";
import { Footer } from "../components/Footer.tsx";
import { Header } from "../components/Header.tsx";
import { ThemeScript } from "../components/ThemeScript.tsx";

interface Props {
	title: string;
	path?: string;
	section?: SectionKey;
	children: VNode;
}

type SectionKey = "how-it-works" | "guide";

const sidebarSections: Record<
	SectionKey,
	{ title: string; links: { href: string; label: string }[] }
> = {
	"how-it-works": {
		title: "HOW IT WORKS",
		links: [
			{ href: "/how-it-works", label: "Build Pipeline" },
			{ href: "/how-it-works/hydration", label: "Hydration" },
		],
	},
	guide: {
		title: "GUIDE",
		links: [
			{ href: "/guide/quick-start", label: "Quick Start" },
			{ href: "/guide/configuration", label: "Configuration" },
			{ href: "/guide/multi-framework", label: "Multi-Framework" },
			{ href: "/guide/plugins", label: "Plugins" },
		],
	},
};

const DocsLayout = (props: Props) => {
	const { title, path, section = "guide", children } = props;

	const { title: sectionTitle, links } = sidebarSections[section];

	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<ThemeScript />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700&family=Bebas+Neue&display=swap"
				/>
			</head>
			<body>
				<Header activePath={path} />
				<div className="drawer lg:drawer-open">
					<input id="docs-drawer" type="checkbox" className="drawer-toggle" />
					<div className="drawer-content">
						<label
							htmlFor="docs-drawer"
							className="btn btn-ghost btn-sm lg:hidden m-4"
							aria-label="Open sidebar"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
							Menu
						</label>
						<main>{children}</main>
						<Footer />
					</div>
					<div className="drawer-side z-40">
						<label
							htmlFor="docs-drawer"
							aria-label="Close sidebar"
							className="drawer-overlay"
						/>
						<ul className="menu bg-base-200 min-h-full w-56 p-4 pt-6">
							<li className="menu-title font-display text-primary">
								{sectionTitle}
							</li>
							{links.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										className={path === link.href ? "menu-active" : ""}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</body>
		</html>
	);
};

export default DocsLayout;
