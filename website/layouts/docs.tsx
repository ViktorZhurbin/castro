import { Footer } from "@components/Footer.tsx";
import { MenuIcon } from "@components/icons/MenuIcon";
import { PageShell } from "@components/PageShell.tsx";
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

export default function DocsLayout(props: DocsLayoutProps) {
	const { title, path, children } = props;

	return (
		<PageShell title={title} activePath={path}>
			<div class="drawer lg:drawer-open flex-1 overflow-hidden">
				<input id="docs-drawer" type="checkbox" class="drawer-toggle" />

				<div class="drawer-content flex flex-col overflow-hidden">
					{/* Mobile-only toggle bar */}
					<div class="lg:hidden bg-base-100 border-b-2 border-base-content flex items-center px-4">
						<label
							htmlFor="docs-drawer"
							class="btn btn-ghost btn-square btn-sm"
							aria-label="Open sidebar"
						>
							<MenuIcon />
						</label>
					</div>

					<div class="flex flex-col flex-1 overflow-y-auto">
						<main class="flex-1 prose prose-castro py-12 px-6 max-w-3xl snap-start">
							{children}
						</main>
						<Footer />
					</div>
				</div>

				<div class="drawer-side z-60 border-r-2 border-base-content">
					{/* Overlay closes drawer on mobile; hidden on desktop via drawer-open */}
					<label
						htmlFor="docs-drawer"
						aria-label="Close sidebar"
						class="drawer-overlay"
					/>
					<div class="bg-base-200 min-h-full w-64 border-6 lg:border-none transition-none">
						<SidebarNav activePath={path} />
					</div>
				</div>
			</div>
		</PageShell>
	);
}

// Layout-specific components below

function SidebarNav(props: { activePath?: string }) {
	return (
		<div class="flex flex-col py-2 divide-y-2">
			{Object.values(sidebarSections).map(({ title, links }) => (
				<div class="px-4 py-6">
					<h3 class="mb-2">{title}</h3>

					<nav class="flex flex-col">
						{links.map((link) => {
							const isActive = props.activePath === link.href;

							return (
								<a
									key={link.href}
									href={link.href}
									class={`px-3 py-1 border-l-4 ${
										isActive
											? "border-primary bg-base-content text-base-100"
											: "border-transparent hover:border-primary hover:bg-base-content hover:text-base-100"
									}`}
								>
									{link.label}
								</a>
							);
						})}
					</nav>
				</div>
			))}
		</div>
	);
}
