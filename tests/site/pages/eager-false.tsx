import Counter from "../components/Counter.island.tsx";

// The directives are typed `boolean`, so an explicit `={false}` is valid TS.
// processProps() used to match on key presence, which turned the directive on.
export const meta = { title: "EagerFalse" };

export default function EagerFalse() {
	return (
		<div>
			<h1>Eager False Test</h1>
			<Counter initial={10} comrade:eager={false} />
		</div>
	);
}
