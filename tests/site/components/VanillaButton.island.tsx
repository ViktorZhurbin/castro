/**
 * Vanilla Island: Pure JavaScript Hydration (Root-level, no folder)
 *
 * The default export is JSX for server-side rendering.
 * The hydrate named export is plain JavaScript for client-side behavior.
 * No folder prefix — vanilla framework detected by "hydrate" export!
 */

// 1. Server-side rendering (JSX)
export default function VanillaButton(props: { label?: string }) {
	const label = props.label ?? "Click me";
	return (
		<button class="vanilla-button" data-clicks="0">
			{label} (0)
		</button>
	);
}

// 2. Client-side hydration (plain JavaScript)
export function hydrate(container: HTMLElement, props: { label?: string }) {
	let clicks = 0;
	const btn = container.querySelector(".vanilla-button");

	if (!btn) return;

	const updateText = () => {
		const label = props.label ?? "Click me";
		btn.textContent = `${label} (${clicks})`;
	};

	btn.addEventListener("click", () => {
		clicks++;
		updateText();
	});
}
