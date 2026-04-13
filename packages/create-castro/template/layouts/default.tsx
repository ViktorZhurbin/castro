import type { VNode } from "preact";

export default function Layout({
	title,
	children,
}: {
	title: string;
	children: VNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
			</head>
			<body>
				<main>{children}</main>
			</body>
		</html>
	);
}
