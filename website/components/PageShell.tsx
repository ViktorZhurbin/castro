import type { ComponentChildren } from "preact";
import { Header } from "./Header";
import { ThemeScript } from "./theme/ThemeScript";
import "./PageShell.css";

interface PageShellProps {
	title: string;
	activePath?: string;
	children: ComponentChildren;
}

export function PageShell({ title, activePath, children }: PageShellProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<ThemeScript />
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
				/>
				<link rel="stylesheet" href="/styles/pico-theme.css" />
				<link rel="stylesheet" href="/styles/base.css" />
				<link rel="stylesheet" href="/styles/components.css" />
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
				<Header activePath={activePath} />
				{children}
			</body>
		</html>
	);
}
