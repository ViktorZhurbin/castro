import type { ComponentChildren } from "preact";
import { Header } from "./Header.tsx";
import { ThemeScript } from "./ThemeScript.tsx";

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
				{/* Pico CSS — semantic base styles */}
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
				/>
				{/* Castro theme tokens (maps colors to --pico-* vars) */}
				<link rel="stylesheet" href="/styles/pico-theme.css" />
				{/* Global base element styles */}
				<link rel="stylesheet" href="/styles/base.css" />
				{/* .c-* component classes */}
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
			<body style="display: flex; flex-direction: column; min-height: 100vh;">
				<Header activePath={activePath} />
				{children}
			</body>
		</html>
	);
}
