import "./TutorialSidebar.css";

export const CHAPTERS = [
	{ slug: "big-picture", title: "The Big Picture", number: 1 },
	{ slug: "pages-to-html", title: "Pages to HTML", number: 2 },
	{ slug: "layouts", title: "Layouts", number: 3 },
	{ slug: "islands", title: "Islands", number: 4 },
	{ slug: "asset-injection", title: "Asset Injection", number: 5 },
	{ slug: "dev-server", title: "Dev Server", number: 6 },
];

interface Props {
	currentSlug?: string;
}

export function TutorialSidebar({ currentSlug }: Props) {
	return (
		<aside className="tutorial-sidebar">
			<div className="sidebar-title">Chapters</div>
			<nav>
				<ul className="sidebar-chapters">
					{CHAPTERS.map((ch) => (
						<li
							key={ch.slug}
							className={`sidebar-chapter${currentSlug === ch.slug ? " active" : ""}`}
						>
							<a href={`/tutorial/${ch.slug}`}>
								<span className="sidebar-chapter-number">{ch.number}.</span>
								{ch.title}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
