import Counter from "../components/Counter.island.tsx";

export const meta = { title: "EagerTest" };

export default function EagerTest() {
  return (
    <div>
      <h1>Eager Test</h1>
      {/* A false branch leaves `children: false`, which nested nothing —
			    matching ISLAND_HAS_CHILDREN on key presence fails this build.
			    Counter declares no `children` prop, so writing the pin at all
			    needs the opt-out below (see types/islandContracts.tsx). */}
      {/* @ts-expect-error */}
      <Counter initial={10} comrade:eager>
        {/* oxlint-disable-next-line no-constant-binary-expression */}
        {false && <span>never</span>}
      </Counter>
      {/* null and undefined children pass the same guard as false — a
          `{cond ? <X/> : null}` or an unset conditional both nest nothing. */}
      {/* @ts-expect-error */}
      <Counter initial={11} comrade:eager>
        {null}
      </Counter>
      {/* @ts-expect-error */}
      <Counter initial={12} comrade:eager>
        {undefined}
      </Counter>
    </div>
  );
}
