import DocsLayout, { type DocsLayoutProps } from "./docs.tsx";

export default function MarkdownDocsLayout(props: DocsLayoutProps) {
	return (
		<DocsLayout {...props}>
			{/* The 'prose' class automatically styles raw h1, p, pre, code, etc. */}
			<article className="prose prose-castro py-12 px-6 max-w-4xl mx-auto">
				{props.children}
			</article>
		</DocsLayout>
	);
}
