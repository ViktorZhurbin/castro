import Counter from "../components/Counter.island.tsx";

export default function WithIsland({ title, children }) {
	return (
		<html>
			<head>
				<title>{title}</title>
			</head>
			<body>
				<nav>
					<Counter initial={0} lenin:awake />
				</nav>
				<main>{children}</main>
			</body>
		</html>
	);
}
