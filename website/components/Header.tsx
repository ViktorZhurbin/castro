import ThemeToggle from "./ThemeToggle.island.tsx";

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 bg-neutral text-neutral-content border-b-2 border-primary/30">
			<div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-end">
				<ThemeToggle lenin:awake />
			</div>
		</header>
	);
};
