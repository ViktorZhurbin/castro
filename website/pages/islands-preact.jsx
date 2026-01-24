export default function Landing() {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Welcome to Castro</title>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<header>
					<h1>Island Demo</h1>
					<p>Educational SSG with island architecture</p>
				</header>

				<main>
					<section>
						<h2>Try the Interactive Counter</h2>
						<p>This island is automatically detected and hydrated:</p>
						<preact-counter></preact-counter>
					</section>

					<section>
						<h2>Features</h2>
						<ul>
							<li>Markdown + JSX layouts for content</li>
							<li>Full JSX pages for structure</li>
							<li>Island architecture with Preact</li>
							<li>Zero JavaScript by default</li>
							<li>Live reload in dev mode</li>
						</ul>
					</section>

					<section>
						<h2>Getting Started</h2>
						<p>
							This page is written in JSX (<code>pages/islands-preact.jsx</code>
							) and rendered to static HTML at build time.
						</p>
						<p>
							Islands like <code>&lt;preact-counter&gt;</code> are automatically
							detected and their scripts injected.
						</p>
					</section>
				</main>

				<footer>
					<p>
						Built with Castro | <a href="/">Back to home</a>
					</p>
				</footer>
			</body>
		</html>
	);
}
