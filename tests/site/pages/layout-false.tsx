import Card from "../components/Card.tsx";
import Counter from "../components/Counter.island.tsx";

// `layout: false` pages have no <head>/<body> shell — this page exists to
// guard against injectTags() silently dropping CSS, the import map, the
// island runtime, and inline island styles when there's no </head> or
// </body> anchor to inject before (see writeHtmlPage.js). Card is here for
// its CSS module: without it the page has no <link> to drop.
export const meta = { title: "LayoutFalse", layout: false };

export default function LayoutFalse() {
	return (
		<div>
			<h1>No Layout Test</h1>
			<Card>Styled by a CSS module</Card>
			<Counter initial={1} comrade:eager />
		</div>
	);
}
