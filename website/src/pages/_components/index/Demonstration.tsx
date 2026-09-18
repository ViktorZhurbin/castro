import FiveYearPlan from "@/components/islandExamples/FiveYearPlan.island";

import { Section } from "./Section";

import "./Demonstration.css";

export function Demonstration() {
  return (
    <Section title="Demonstration">
      <p>
        One island, <code>comrade:visible</code>. JavaScript was not downloaded for this card until
        you scrolled to it. Open the Network tab and reload if you'd like to watch it not happen.
      </p>
      {/* The <castro-island> host is inline by default; this gives it a block
          box so the card can carry margin like any other section element. */}
      <div class="demonstration-card">
        <FiveYearPlan comrade:visible />
      </div>
    </Section>
  );
}
