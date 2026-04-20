export interface NavLink {
	href: string;
	label: string;
}

export interface NavSection {
	key: string;
	title: string;
	href: string;
	links: NavLink[];
}

export const navSections: NavSection[] = [
	{
		key: "guide",
		title: "Guide",
		href: "/guide/quick-start",
		links: [
			{ href: "/guide/quick-start", label: "Quick Start" },
			{ href: "/guide/components-islands", label: "Components & Islands" },
			{ href: "/guide/plugins", label: "Plugins" },
		],
	},
	{
		key: "how-it-works",
		title: "How It Works",
		href: "/how-it-works",
		links: [
			{ href: "/how-it-works", label: "Build Pipeline" },
			{ href: "/how-it-works/hydration", label: "Island Hydration" },
			{ href: "/how-it-works/source", label: "Reading the Source" },
		],
	},
	{
		key: "reference",
		title: "Reference",
		href: "/reference/config",
		links: [
			{ href: "/reference/config", label: "Configuration" },
			{ href: "/reference/plugin-api", label: "Plugin API" },
		],
	},
];
