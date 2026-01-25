import type { FunctionComponent } from "preact";
import { Footer } from "../components/Footer.tsx";

interface DefaultLayoutProps {
	title: string;
	content: string;
}

/**
 * Default layout for Castro website.
 * Uses the same structure as the homepage with header and footer components.
 */
const DefaultLayout: FunctionComponent<DefaultLayoutProps> = ({
	title,
	content,
}) => {
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
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<main dangerouslySetInnerHTML={{ __html: content }} />

				<Footer />
			</body>
		</html>
	);
};

export default DefaultLayout;
