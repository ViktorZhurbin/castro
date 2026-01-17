export default function BlogSpecialLayout({ title, content }) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title} - Blog</title>
				<link rel="stylesheet" href="/styles.css" />
			</head>
			<body>
				<header>
					<h1>
						<a href="/index.html">reef</a> / Blog
					</h1>
					<nav>
						<a href="/index.html">← Back to Home</a>
						<a href="/blog/my-first-post.html">First Post</a>
						<a href="/blog/test-frontmatter.html">Frontmatter</a>
					</nav>
				</header>
				<main>
					<article dangerouslySetInnerHTML={{ __html: content }} />
				</main>
				<footer>
					<p>
						This is a <b>special</b> blog layout!
					</p>
				</footer>
			</body>
		</html>
	);
}
