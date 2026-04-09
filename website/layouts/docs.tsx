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
			{/* Main flex container safely locks to the viewport height left by the header */}
			<div class="flex flex-1 overflow-hidden relative">
				{/* Hidden checkbox controls the mobile sidebar state via Tailwind 'peer' */}
				<input id="docs-drawer" type="checkbox" class="peer hidden" />

				{/* Mobile Overlay: Solid stark block, clicking it resets the checkbox */}
				<label
					htmlFor="docs-drawer"
					aria-label="Close sidebar"
					class="fixed inset-0 bg-neutral/80 z-20 hidden peer-checked:block lg:hidden cursor-pointer"
				/>

				{/* Sidebar: Fixed pop-over on mobile, static structural block on desktop */}
				<aside
					class={`fixed inset-y-0 left-0 z-30 w-64 bg-base-200 border-r-4 border-neutral hidden peer-checked:flex flex-col lg:border-r-2 lg:static lg:flex lg:shrink-0`}
				>
					<div class="flex-1 overflow-y-auto">
						<SidebarNav activePath={path} />
					</div>
				</aside>

				{/* Content Container: Isolated scrolling context */}
				<div class="flex-1 flex flex-col min-w-0 overflow-y-auto bg-base-100 scroll-pt-16 lg:scroll-pt-8">
					{/* Mobile toggle bar (sticky) */}
					<div class="lg:hidden sticky top-0 z-10 bg-base-100 border-b-2 border-neutral flex items-center px-4 py-1">
						<label
							htmlFor="docs-drawer"
							class="c-btn-square c-btn-square-base btn-xs"
							aria-label="Open sidebar"
						>
							<MenuIcon />
						</label>
					</div>

					{/* Main document flow */}
					<main class="flex-1 prose prose-castro py-12 px-6 max-w-3xl snap-start">
						{children}
					</main>

					<Footer />
				</div>
			</div>
		</PageShell>
	);
}

// Layout-specific components below

function SidebarNav(props: { activePath?: string }) {
	return (
		<div class="flex flex-col py-2 divide-y-2 divide-neutral">
			{Object.values(sidebarSections).map(({ title, links }) => (
				<div class="px-4 py-6" key={title}>
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
											? "border-primary bg-neutral text-neutral-content"
											: "border-transparent text-base-content hover:bg-neutral hover:text-neutral-content"
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
