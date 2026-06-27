// Island imported without the .tsx extension. islandMarkerPlugin matches the
// resolved path, so Bun re-adding the extension still hits the marker onLoad.
import Counter from "../components/Counter.island";

export const meta = { title: "IslandNoExt" };

export default function IslandNoExt() {
	return (
		<div>
			<h1>Island No Extension</h1>
			<Counter initial={7} comrade:visible />
		</div>
	);
}
