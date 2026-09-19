import FiveYearPlan from "@/components/islandExamples/FiveYearPlan.island";

import { Section } from "./Section";

import "./Demonstration.css";

export function Demonstration() {
  return (
    <Section title="Demonstration">
      <div class="section-columns">
        <p class="demonstration-text">
          The Five-Year Plan, as a <code>comrade:visible</code> island. Its JavaScript didn't load
          until you scrolled here. Scroll to the top, open the Network tab, reload, and come back
          down. The request arrives when you do.
        </p>
        {/* The <castro-island> host is inline by default; this gives it a
            block box so the card can size like any other column. */}
        <div class="demonstration-card">
          <FiveYearPlan comrade:visible />
        </div>
      </div>
    </Section>
  );
}
