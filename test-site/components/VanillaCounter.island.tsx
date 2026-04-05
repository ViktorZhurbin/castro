/**
 * Vanilla Island: Pure JavaScript Hydration
 *
 * The default export is JSX for server-side rendering.
 * The hydrate named export is plain JavaScript for client-side behavior.
 * The client bundle ships only hydrate() — zero framework runtime.
 */

// 1. Server-side rendering (JSX)
export default function VanillaCounter(props: { initial?: number }) {
	const count = props.initial ?? 0;
	return (
		<button class="vanilla-counter" data-count={count}>
			Vanilla: {count}
		</button>
	);
}

// 2. Client-side hydration (plain JavaScript)
export function hydrate(container: HTMLElement, props: { initial?: number }) {
	let count = props.initial ?? 0;
	const btn = container.querySelector(".vanilla-counter");

	if (!btn) return;

	const updateText = () => {
		btn.textContent = `Vanilla: ${count}`;
	};

	btn.addEventListener("click", () => {
		count++;
		updateText();
	});
}
