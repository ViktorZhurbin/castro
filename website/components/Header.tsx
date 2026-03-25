import ThemeToggle from "./ThemeToggle.island.tsx";

export const Header = ({ activePath }: { activePath?: string }) => {
	const isHowItWorks = activePath?.startsWith("/how-it-works");
	const isGuide = activePath?.startsWith("/guide");

	return (
		<header className="navbar sticky top-0 z-50 bg-base-100 border-b-2 border-primary min-h-12 px-6">
			<div className="navbar-start">
				<a href="/" className="btn btn-ghost btn-sm gap-1" aria-label="Home">
					<span className="font-display text-xl text-primary leading-none">
						CASTRO
					</span>
				</a>
				<a
					href="/guide/quick-start"
					className={`btn btn-ghost btn-sm font-display text-sm ${isGuide ? "btn-active" : ""}`}
				>
					GUIDE
				</a>
				<a
					href="/how-it-works"
					className={`btn btn-ghost btn-sm font-display text-sm ${isHowItWorks ? "btn-active" : ""}`}
				>
					HOW IT WORKS
				</a>
			</div>
			<div className="navbar-end gap-2">
				<ThemeToggle lenin:awake />
			</div>
		</header>
	);
};
