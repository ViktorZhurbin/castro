export default function DefaultLayout({ title, content }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<header>
					<h1>
						<nav>
							<a href="/index.html">reef</a>
							<a href="/blog/index.html">blog</a>
						</nav>
					</h1>
					<nav>
						<a href="/index.html">Home</a>
						<a href="/islands-preact.html">Preact Plugin</a>
						<a href="/islands-solid.html">Solid Plugin</a>
					</nav>
				</header>

				{/* Main Content */}
				<main dangerouslySetInnerHTML={{ __html: content }} />
			</body>
		</html>
	);
}
