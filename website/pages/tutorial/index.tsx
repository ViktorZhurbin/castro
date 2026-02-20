import "./index.css";
import type { PageMeta } from "@vktrz/castro";
import { CHAPTERS } from "../../components/TutorialSidebar.tsx";

export const meta: PageMeta = {
	title: "Tutorial — Castro",
	layout: "tutorial",
	slug: "index",
};

export default function TutorialIndex() {
	return (
		<>
			<div className="tutorial-hero">
				<h1>How Castro Works</h1>
				<p className="tutorial-hero-subtitle">
					Six chapters. ~15 minutes. The complete build pipeline from source
					files to interactive islands.
				</p>
			</div>

			<div className="chapter-grid">
				{CHAPTERS.map((ch) => (
					<a
						key={ch.slug}
						href={`/tutorial/${ch.slug}`}
						className="chapter-card"
					>
						<span className="chapter-card-number">{ch.number}</span>
						<h2 className="chapter-card-title">{ch.title}</h2>
						<p className="chapter-card-desc">{CHAPTER_DESCRIPTIONS[ch.slug]}</p>
					</a>
				))}
			</div>
		</>
	);
}

const CHAPTER_DESCRIPTIONS: Record<string, string> = {
	"big-picture":
		"The full system in 60 seconds — two pipelines, one merge point.",
	"pages-to-html":
		"How Markdown and JSX files become static HTML through Bun.build.",
	layouts: "The HTML shell that wraps every page in a single render pass.",
	islands:
		"The core trick — double compilation, marker swaps, and selective hydration.",
	"asset-injection":
		"CSS, import maps, and scripts assembled into the final HTML.",
	"dev-server": "File watching, rebuilds, and SSE-based live reload.",
};
