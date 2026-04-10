import { Footer } from "@components/Footer.tsx";
import { MenuIcon } from "@components/icons/MenuIcon";
import { PageShell } from "@components/PageShell.tsx";
import { ClientScript } from "@vktrz/castro";
import type { ComponentChildren } from "preact";

export interface DocsLayoutProps {
	title: string;
	path?: string;
	children: ComponentChildren;
}

type SectionKey = "how-it-works" | "guide" | "reference";

const sidebarSections: Record<
	SectionKey,
	{ title: string; links: { href: string; label: string }[] }
> = {
	guide: {
		title: "GUIDE",
		links: [
			{ href: "/guide/quick-start", label: "Quick Start" },
			{ href: "/guide/components-islands", label: "Components & Islands" },
			{ href: "/guide/plugins", label: "Plugins" },
		],
	},
	"how-it-works": {
		title: "HOW IT WORKS",
		links: [
			{ href: "/how-it-works", label: "1. Build Pipeline" },
			{ href: "/how-it-works/hydration", label: "2. Island Hydration" },
		],
	},
	reference: {
		title: "REFERENCE",
		links: [
			{ href: "/reference/config", label: "Configuration" },
			{ href: "/reference/plugin-api", label: "Plugin API" },
		],
	},
};

const picoHead = (
	<>
		<link
			rel="stylesheet"
			href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
		/>
		<link rel="stylesheet" href="/styles/pico-theme.css" />
		<link rel="stylesheet" href="/styles/docs.css" />
	</>
);

export default function DocsLayout(props: DocsLayoutProps) {
	const { title, path, children } = props;

	return (
		<PageShell title={title} activePath={path} head={picoHead}>
			<div class="docs-shell">
				<div id="docs-overlay" class="docs-overlay" />

				<aside id="docs-sidebar" class="docs-sidebar">
					<div style={{ flex: 1, overflowY: "auto" }}>
						<SidebarNav activePath={path} />
					</div>
				</aside>

				<div class="docs-content">
					<div class="docs-mobile-bar">
						<button
							class="docs-toggle"
							id="docs-toggle"
							aria-label="Open sidebar"
						>
							<MenuIcon />
						</button>
					</div>

					<main class="container">{children}</main>

					<Footer />
				</div>
			</div>

			<ClientScript fn={initSidebar} />
		</PageShell>
	);
}

function SidebarNav(props: { activePath?: string }) {
	return (
		<nav style={{ padding: 0 }}>
			{Object.values(sidebarSections).map(({ title, links }) => (
				<div class="docs-sidebar-section" key={title}>
					<h3>{title}</h3>

					<div style={{ display: "flex", flexDirection: "column" }}>
						{links.map((link) => {
							const isActive = props.activePath === link.href;

							return (
								<a
									key={link.href}
									href={link.href}
									aria-current={isActive ? "page" : undefined}
								>
									{link.label}
								</a>
							);
						})}
					</div>
				</div>
			))}
		</nav>
	);
}

function initSidebar() {
	const toggle = document.getElementById(
		"docs-toggle",
	) as HTMLButtonElement | null;
	const sidebar = document.getElementById("docs-sidebar") as HTMLElement | null;
	const overlay = document.getElementById("docs-overlay") as HTMLElement | null;

	if (!toggle || !sidebar || !overlay) return;

	toggle.addEventListener("click", () => {
		const isOpen = sidebar.classList.toggle("is-open");
		overlay.classList.toggle("is-open", isOpen);
	});

	overlay.addEventListener("click", () => {
		sidebar.classList.remove("is-open");
		overlay.classList.remove("is-open");
	});
}
