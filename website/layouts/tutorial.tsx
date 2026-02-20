import "./tutorial.css";
import type { VNode } from "preact";
import { Footer } from "../components/Footer.tsx";
import { TutorialNav } from "../components/TutorialNav.tsx";
import { TutorialSidebar } from "../components/TutorialSidebar.tsx";

interface Props {
	title: string;
	children: VNode;
	slug?: string;
}

const TutorialLayout = (props: Props) => {
	const { title, children, slug } = props;

	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=PT+Sans:wght@400;700&display=swap"
					rel="stylesheet"
				/>
				<link rel="stylesheet" href="/global.css" />
			</head>
			<body>
				<div className="tutorial-layout">
					<TutorialSidebar currentSlug={slug} />
					<main>
						<article className="tutorial-content">
							{children}
							{slug && slug !== "index" && <TutorialNav currentSlug={slug} />}
						</article>
					</main>
				</div>
				<Footer />
			</body>
		</html>
	);
};

export default TutorialLayout;
