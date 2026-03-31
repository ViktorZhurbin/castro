import type { VNode } from "preact";
import { Footer } from "../components/Footer.tsx";
import { Header } from "../components/Header.tsx";
import { ThemeScript } from "../components/ThemeScript.tsx";

interface Props {
	title: string;
	children: VNode;
}

const DefaultLayout = (props: Props) => {
	const { title, children } = props;

	return (
		<html lang="en" className="h-screen overflow-hidden scroll-smooth">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<ThemeScript />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700&family=Bebas+Neue&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="h-screen flex flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto">
					{children}

					<Footer />
				</main>
			</body>
		</html>
	);
};

export default DefaultLayout;
