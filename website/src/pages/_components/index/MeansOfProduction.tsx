import { Section } from "./Section";

import "./MeansOfProduction.css";

export function MeansOfProduction() {
  return (
    <Section title="The Means of Production">
      <div class="section-columns">
        <div class="production-text">
          <p>
            JSX and Markdown go in, static HTML comes out. Interactive islands where you need them.
          </p>
          <p class="production-claim">Pages with no islands ship no JavaScript.</p>
        </div>

        <figure class="production-code">
          <figcaption class="label">pages/index.tsx</figcaption>
          <pre>
            {/* One expression child, so <code> holds a single text node —
                syntaxHighlight() skips any block that doesn't. */}
            <code class="language-tsx">
              {`import Counter from "../components/Counter.island";

export default function Home() {
  return <Counter initial={5} />;
}`}
            </code>
          </pre>
        </figure>
      </div>
    </Section>
  );
}
