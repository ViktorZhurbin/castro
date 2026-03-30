import { createSignal } from "@vktrz/castro-jsx/signals";

/**
 * Exercises the stable anchor pattern in bindReactiveChild.
 * The reactive conditional returns a Fragment (<>...</>) with two children —
 * the case that previously broke because DocumentFragment dissolves on insert,
 * leaving the old `current` pointer dangling.
 */
export default function CastroFragmentToggle() {
	const [show, setShow] = createSignal(true);

	return (
		<div>
			{() =>
				show() ? (
					<>
						<span>Fragment A</span>
						<span>Fragment B</span>
					</>
				) : (
					<span>Single</span>
				)
			}
			<button onClick={() => setShow((s) => !s)}>Toggle</button>
		</div>
	);
}
