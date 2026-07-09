import "@vktrz/css/style.css";
import type { ComponentChildren } from "preact";
import { Header } from "./Header";
import { ThemeScript } from "./theme/ThemeScript";
import "./PageShell.css";

interface PageShellProps {
	title: string;
	children: ComponentChildren;
}

export function PageShell({ title, children }: PageShellProps) {
	return (
		<html lang="en">
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
			<body>
				<Header />
				{children}
			</body>
		</html>
	);
}
