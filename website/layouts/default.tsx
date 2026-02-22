import type { VNode } from "preact";
import { Footer } from "../components/Footer.tsx";
import { Header } from "../components/Header.tsx";

interface Props {
	title: string;
	children: VNode;
}

const themeScript = `(function(){var t=localStorage.getItem("castro-theme");if(t)document.documentElement.setAttribute("data-theme",t)})()`;

const DefaultLayout = (props: Props) => {
	const { title, children } = props;

	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
				<Header />
				<main>
					{children}

					<Footer />
				</main>
			</body>
		</html>
	);
};

export default DefaultLayout;
