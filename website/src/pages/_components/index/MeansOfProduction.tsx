import { Section } from "./Section";

export function MeansOfProduction() {
  return (
    <Section title="The Means of Production">
      <p>
        A static site generator built on Bun and Preact. JSX and Markdown go in, static HTML comes
        out. Interactive islands where you need them.
      </p>

      <pre>
        <code>{`// pages/index.tsx
import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} />;
}`}</code>
      </pre>

      <p>
        Pages with no islands ship no JavaScript at all — the cost only exists where you use it.
      </p>
    </Section>
  );
}
