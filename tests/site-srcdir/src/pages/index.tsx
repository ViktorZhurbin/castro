import Counter from "../components/Counter.island.tsx";

export const meta = { title: "srcDir Test" };

export default function Index() {
  return (
    <>
      <h1>srcDir Test</h1>
      <Counter initial={1} comrade:eager />
    </>
  );
}
