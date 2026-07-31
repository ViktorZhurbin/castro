import "./default.css";

// Deliberately shares a basename with layouts/default.tsx — regression
// fixture for layout ids including the directory.
export default function NestedDefaultLayout({ title, children }) {
	return (
		<html>
			<head>
				<title>{title}</title>
			</head>
			<body>
				<p id="nested-layout-marker">NESTED LAYOUT</p>
				{children}
			</body>
		</html>
	);
}
