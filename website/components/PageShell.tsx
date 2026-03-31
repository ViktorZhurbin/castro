import type { VNode } from "preact";
import { Header } from "./Header.tsx";
import { ThemeScript } from "./ThemeScript.tsx";

interface PageShellProps {
	title: string;
	activePath?: string;
	children: VNode;
}

export function PageShell({ title, activePath, children }: PageShellProps) {
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
				<Header activePath={activePath} />
				{children}
			</body>
		</html>
	);
}
