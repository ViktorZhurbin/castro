import type { ComponentChildren } from "preact";
import { Footer } from "@/components/Footer";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { PageShell } from "@/components/PageShell";
import { navSections } from "@/nav";
import "./docs.css";

export interface DocsLayoutProps {
	title: string;
	path?: string;
	children: ComponentChildren;
}

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
						{navSections.map(({ key, title, links }) => (
							<div class="docs-sidebar-section" key={key}>
								<h3>{title.toUpperCase()}</h3>
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

					<div>
						<main class="container">{children}</main>
						<Footer />
					</div>
				</div>
			</div>
		</PageShell>
	);
}
