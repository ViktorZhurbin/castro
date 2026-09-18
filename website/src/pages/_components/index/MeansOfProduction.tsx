import { Section } from "./Section";

export function MeansOfProduction() {
  return (
    <Section title="The Means of Production">
      <p>JSX and Markdown go in, static HTML comes out. Interactive islands where you need them.</p>

      <pre>
        <code>{`// pages/index.tsx
import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} />;
}`}</code>
      </pre>

      <p>Pages with no islands ship no JavaScript.</p>
    </Section>
  );
}
