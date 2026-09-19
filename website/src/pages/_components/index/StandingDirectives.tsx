import "./StandingDirectives.css";
import { Section } from "./Section";

const directives = [
  {
    name: "comrade:visible",
    isDefault: true,
    slogan: "Only work when the people are watching.",
    behaviour: "Hydrates when the island scrolls into view. Right for most islands.",
  },
  {
    name: "comrade:eager",
    slogan: "Some comrades wait. This one doesn't.",
    behaviour: "Hydrates as soon as the element mounts. For above-the-fold UI that can't wait.",
  },
  {
    name: "comrade:patient",
    slogan: "Takes the shift nobody else wants.",
    behaviour:
      "Hydrates once the browser goes idle. For important UI that isn't on the critical path.",
  },
];

export function StandingDirectives() {
  return (
    <Section title="The Standing Directives">
      <p class="directives-intro">
        Every island has a directive, written or not. It decides when that island's JavaScript
        loads.
      </p>

      <dl class="directives">
        {directives.map(({ name, slogan, behaviour, isDefault }) => (
          <div key={name}>
            <dt>
              <code>{name}</code>
              {isDefault && <span class="directives-default label">DEFAULT</span>}
            </dt>
            <dd class="directives-slogan">{slogan}</dd>
            <dd class="directives-behaviour">{behaviour}</dd>
          </div>
        ))}
      </dl>

      <aside class="directives-aside">
        There was a fourth, <code>no:pasaran</code>. It didn't hydrate anything, which was the
        point, which was also why it isn't here.
      </aside>
    </Section>
  );
}
