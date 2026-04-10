import { ClientScript } from "@vktrz/castro";
import { MenuIcon } from "./icons/MenuIcon.tsx";
import "./DocsSidebar.css";

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

export function DocsSidebar({ activePath }: { activePath?: string }) {
	return (
		<>
			<div id="docs-overlay" class="docs-overlay" />

			<aside id="docs-sidebar" class="docs-sidebar">
				<nav>
					{Object.values(sidebarSections).map(({ title, links }) => (
						<div class="docs-sidebar-section" key={title}>
							<h3>{title}</h3>
							<ul>
								{links.map((link) => (
									<li>
										<a
											key={link.href}
											href={link.href}
											aria-current={
												activePath === link.href ? "page" : undefined
											}
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</aside>

			<div class="docs-mobile-bar">
				<button class="docs-toggle" id="docs-toggle" aria-label="Open sidebar">
					<MenuIcon />
				</button>
			</div>

			<ClientScript fn={initSidebar} />
		</>
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
