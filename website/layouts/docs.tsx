import { Footer } from "@components/Footer.tsx";
import { MenuIcon } from "@components/icons/MenuIcon.tsx";
import { PageShell } from "@components/PageShell.tsx";
import type { ComponentChildren } from "preact";
import "./docs.css";

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

export default function DocsLayout({ title, path, children }: DocsLayoutProps) {
	return (
		<PageShell title={title} activePath={path}>
			<div class="docs-shell">
				{/* * PURE CSS TOGGLE: Hidden checkbox controls the mobile sidebar state
				 * Zero JavaScript required.
				 */}
				<input
					type="checkbox"
					id="docs-drawer"
					class="docs-drawer-toggle"
					hidden
					aria-hidden="true"
				/>

				{/* Backdrop — clicking this label unchecks the checkbox on mobile */}
				<label
					htmlFor="docs-drawer"
					class="docs-overlay"
					aria-label="Close sidebar"
				/>

				{/* Sidebar Navigation */}
				<aside class="docs-sidebar">
					<nav>
						{Object.values(sidebarSections).map(({ title, links }) => (
							<div class="docs-sidebar-section" key={title}>
								<h3>{title}</h3>
								<ul>
									{links.map((link) => (
										<li key={link.href}>
											<a
												href={link.href}
												aria-current={path === link.href ? "page" : undefined}
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

				{/* Scrolling Content Container */}
				<div class="docs-content">
					{/* Mobile-only navigation strip — Must be INSIDE the scrolling container to stick */}
					<div class="docs-mobile-bar">
						<label
							htmlFor="docs-drawer"
							class="btn-square"
							aria-label="Open sidebar"
						>
							<MenuIcon />
						</label>
					</div>

					<div class="docs-scrolled-content">
						<main class="container">{children}</main>
						<Footer />
					</div>
				</div>
			</div>
		</PageShell>
	);
}
