import type { VNode } from "preact";
import { Footer } from "../components/Footer.tsx";

interface Props {
	title: string;
	children: VNode;
}

const DefaultLayout = (props: Props) => {
	const { title, children } = props;

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
				<link rel="stylesheet" href="./output.css"></link>
			</head>
			<body>
				<main>
					{children}

					<Footer />
				</main>
			</body>
		</html>
	);
};

export default DefaultLayout;
