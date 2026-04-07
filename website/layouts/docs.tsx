import { Footer } from "@components/Footer.tsx";
import { MenuIcon } from "@components/icons/MenuIcon";
import { PageShell } from "@components/PageShell.tsx";
import type { VNode } from "preact";

export interface DocsLayoutProps {
	title: string;
	path?: string;
	section?: SectionKey;
	children: VNode;
}

type SectionKey = "how-it-works" | "guide" | "reference";

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
	reference: {
		title: "REFERENCE",
		links: [
			{ href: "/reference/config", label: "Configuration" },
			{ href: "/reference/plugin-api", label: "Plugin API" },
		],
	},
};

const DocsLayout = (props: DocsLayoutProps) => {
	const { title, path, section = "guide", children } = props;
	const { title: sectionTitle, links } = sidebarSections[section];

	return (
		<PageShell title={title} activePath={path}>
			{/* Mobile: DaisyUI drawer overlay */}
			<div class="drawer lg:hidden flex-1 overflow-hidden">
				<input id="docs-drawer" type="checkbox" class="drawer-toggle" />

				<div class="drawer-content flex flex-col overflow-hidden">
					{/* Mobile toggle bar — must be inside drawer-content per DaisyUI */}
					<div class="bg-base-100 border-b-2 border-base-content flex items-center px-4 py-2">
						<label
							htmlFor="docs-drawer"
							class="btn btn-ghost btn-square btn-sm tooltip tooltip-right"
							aria-label="Open sidebar"
							data-tip="Open sidebar"
						>
							<MenuIcon />
						</label>
					</div>

					<DocsContent>{children}</DocsContent>
				</div>

				{/* Mobile sidebar overlay */}
				<div class="drawer-side z-60 border-r-2 border-base-content">
					<label
						htmlFor="docs-drawer"
						aria-label="Close sidebar"
						class="drawer-overlay"
					/>
					<div class="bg-base-200 min-h-full w-64 flex flex-col">
						<SidebarNav
							sectionTitle={sectionTitle}
							links={links}
							activePath={path}
						/>
					</div>
				</div>
			</div>

			{/* Desktop: simple flex layout, sidebar always visible */}
			<div class="hidden lg:flex flex-1 overflow-hidden">
				<aside class="shrink-0 w-64 bg-base-200 border-r-2 border-base-content overflow-y-auto flex flex-col">
					<SidebarNav
						sectionTitle={sectionTitle}
						links={links}
						activePath={path}
					/>
				</aside>

				<DocsContent>{children}</DocsContent>
			</div>
		</PageShell>
	);
};

export default DocsLayout;

// Layout-specific components below

function DocsContent({ children }: { children: VNode }) {
	return (
		<div class="flex flex-col flex-1 overflow-y-auto">
			<main class="flex-1 prose prose-castro py-12 px-6 max-w-3xl">
				{children}
			</main>
			<Footer />
		</div>
	);
}

function SidebarNav({
	sectionTitle,
	links,
	activePath,
}: {
	sectionTitle: string;
	links: { href: string; label: string }[];
	activePath?: string;
}) {
	return (
		<>
			<div class="px-6 py-4 bg-base text-base-content border-b-2 border-base-content">
				<h2 class="font-display text-4xl m-0 tracking-wider leading-none">
					{sectionTitle}
				</h2>
			</div>

			<nav class="flex flex-col">
				{links.map((link) => {
					const isActive = activePath === link.href;
					return (
						<a
							key={link.href}
							href={link.href}
							class={`px-6 py-3 font-bold border-l-4 ${
								isActive
									? "border-primary bg-base-content text-base-100"
									: "border-transparent hover:border-base-content hover:bg-base-300 text-base-content"
							}`}
						>
							{link.label}
						</a>
					);
				})}
			</nav>
		</>
	);
}
