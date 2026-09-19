import { Section } from "./Section";

import "./SmallEnoughToRead.css";

export function SmallEnoughToRead() {
  return (
    <Section title="A Framework Small Enough to Read">
      <div class="section-columns">
        <div class="small-text">
          <p>
            Dev server, file-based routing, structured errors, build pipeline, hydration runtime —
            ~1,350 lines in all. Each module is commented and meant to fit in your head.
          </p>
          <p>
            You can trace a page from file to route to HTML. You can see exactly where an island's
            JavaScript gets requested.
          </p>
        </div>

        <div class="small-tally">
          <div class="small-tally-figure">1,350</div>
          <div class="small-tally-label label">Lines, total output</div>
          <a
            href="https://github.com/ViktorZhurbin/castro"
            target="_blank"
            rel="noopener"
            role="button"
            class="full"
          >
            READ THE SOURCE
          </a>
        </div>
      </div>
    </Section>
  );
}
