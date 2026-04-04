import { Footer } from "@components/Footer.tsx";
import { MobileMenuButton } from "@components/MobileMenuButton.tsx";
import { PageShell } from "@components/PageShell.tsx";
import type { VNode } from "preact";

export interface DocsLayoutProps {
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
			{ href: "/how-it-works", label: "1. Build Pipeline" },
			{ href: "/how-it-works/hydration", label: "2. Island Hydration" },
		],
	},
	guide: {
		title: "GUIDE",
		links: [
			{ href: "/guide/quick-start", label: "Quick Start" },
			{ href: "/guide/components-islands", label: "Components & Islands" },
			{ href: "/guide/plugins", label: "Plugins" },
		],
	},
};

const DocsLayout = (props: DocsLayoutProps) => {
	const { title, path, section = "guide", children } = props;

	return (
		<PageShell title={title} activePath={path}>
			<DocsDrawer path={path} section={section}>
				{children}
			</DocsDrawer>
		</PageShell>
	);
};

export default DocsLayout;

// Layout-specific components below

function DocsDrawer({
	path,
	section,
	children,
}: {
	path?: string;
	section: SectionKey;
	children: VNode;
}) {
	const { title: sectionTitle, links } = sidebarSections[section];

	return (
		<div class="flex-1 flex flex-col overflow-hidden">
			<div class="bg-base-100 border-b border-base-content/30 flex justify-between items-center lg:hidden px-4 py-2">
				<MobileMenuButton htmlFor="docs-drawer" ariaLabel="Open sidebar" />
				{/* Future: right TOC drawer toggle goes here */}
			</div>

			<div class="drawer lg:drawer-open flex-1 overflow-hidden">
				<input id="docs-drawer" type="checkbox" class="drawer-toggle" />

				<div class="drawer-content flex flex-col overflow-y-auto scroll-pt-6 lg:scroll-pt-18 scroll-smooth">
					<main class="flex-1 prose prose-castro py-12 px-6 max-w-3xl">
						{children}
					</main>

					<Footer />
				</div>
				<DocsSidebar
					sectionTitle={sectionTitle}
					links={links}
					activePath={path}
				/>
			</div>
		</div>
	);
}

function DocsSidebar({
	sectionTitle,
	links,
	activePath,
}: {
	sectionTitle: string;
	links: { href: string; label: string }[];
	activePath?: string;
}) {
	return (
		<div class="drawer-side z-40">
			<label
				htmlFor="docs-drawer"
				aria-label="Close sidebar"
				class="drawer-overlay"
			/>
			<ul class="menu bg-base-200 min-h-full w-56 p-4 pt-6">
				<li class="menu-title font-display text-primary">{sectionTitle}</li>
				{links.map((link) => (
					<li key={link.href}>
						<a
							href={link.href}
							class={activePath === link.href ? "menu-active" : ""}
						>
							{link.label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
