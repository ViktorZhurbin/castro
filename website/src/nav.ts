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
		key: "concept",
		title: "Concept",
		href: "/concept/island-architecture",
		links: [
			{ href: "/concept/island-architecture", label: "Island Architecture" },
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
		key: "build",
		title: "Build",
		href: "/build/quick-start",
		links: [
			{ href: "/build/quick-start", label: "Quick Start" },
			{ href: "/build/components-islands", label: "Components & Islands" },
			{ href: "/build/plugins", label: "Plugins" },
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
