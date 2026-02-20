import "./TutorialNav.css";
import { CHAPTERS } from "./TutorialSidebar.tsx";

interface Props {
	currentSlug?: string;
}

export function TutorialNav({ currentSlug }: Props) {
	const currentIndex = CHAPTERS.findIndex((ch) => ch.slug === currentSlug);
	const prev = currentIndex > 0 ? CHAPTERS[currentIndex - 1] : null;
	const next =
		currentIndex < CHAPTERS.length - 1 ? CHAPTERS[currentIndex + 1] : null;

	return (
		<nav className="tutorial-nav">
			{prev ? (
				<a href={`/tutorial/${prev.slug}`} className="tutorial-nav-link prev">
					<span className="tutorial-nav-label">Previous</span>
					<span className="tutorial-nav-title">
						{prev.number}. {prev.title}
					</span>
				</a>
			) : (
				<span />
			)}
			{next ? (
				<a href={`/tutorial/${next.slug}`} className="tutorial-nav-link next">
					<span className="tutorial-nav-label">Next</span>
					<span className="tutorial-nav-title">
						{next.number}. {next.title}
					</span>
				</a>
			) : (
				<a href="/tutorial" className="tutorial-nav-link next">
					<span className="tutorial-nav-label">Back to</span>
					<span className="tutorial-nav-title">Tutorial Index</span>
				</a>
			)}
		</nav>
	);
}
