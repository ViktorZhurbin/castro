// Island imported via a tsconfig `paths` alias (@/* → ./*). Bun resolves the
// alias to the real .island.tsx file, so the marker onLoad still fires.
import Counter from "@/components/Counter.island";

export const meta = { title: "IslandAlias" };

export default function IslandAlias() {
	return (
		<div>
			<h1>Island Alias</h1>
			<Counter initial={9} comrade:visible />
		</div>
	);
}
