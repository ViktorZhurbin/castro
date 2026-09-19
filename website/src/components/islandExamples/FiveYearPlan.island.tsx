import { useEffect, useState } from "preact/hooks";

import "./FiveYearPlan.css";

// Production status messages shown on the button after a quota is fulfilled.
// Displayed briefly before returning to the default work prompt.
const FULFILLMENT_MESSAGES = [
  "QUOTA FULFILLED. QUOTA RAISED.",
  "TARGET ACHIEVED. NEW TARGET ISSUED.",
  "THE PLAN SUCCEEDS. THE PLAN CONTINUES.",
  "OUTPUT NOTED. NORMS ADJUSTED.",
];

export default function FiveYearPlan(props: { className?: string }) {
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [fulfilled, setFulfilled] = useState(false);
  const [fulfillmentMessage, setFulfillmentMessage] = useState("");

  // Badge derives directly from progress — no separate effect needed.
  // Stakhanovite: real historical term for Soviet overachievers, rewarded
  // (and then quietly resented) for exceeding quotas.
  const badge =
    progress >= 50
      ? { text: "STAKHANOVITE PACE", style: "badge-primary" }
      : progress >= 25
        ? { text: "SATISFACTORY TOIL", style: "badge-secondary" }
        : null;

  // The badge row is always rendered, invisible when there's no badge yet —
  // otherwise its appearance at 25% adds a row height that shifts the card
  // below it. Placeholder text matches the real badges' length (17 chars)
  // so the reserved width is right from the first render too.
  const badgeText = badge?.text ?? "SATISFACTORY TOIL";
  const badgeStyle = badge?.style ?? "badge-empty";

  // Clear the fulfillment flash after a short delay.
  useEffect(() => {
    if (!fulfilled) return;
    const id = setTimeout(() => setFulfilled(false), 2200);
    return () => clearTimeout(id);
  }, [fulfilled]);

  function work() {
    const next = progress + 5;

    if (next >= 100) {
      const msg = FULFILLMENT_MESSAGES[Math.floor(Math.random() * FULFILLMENT_MESSAGES.length)];

      if (msg) {
        setFulfillmentMessage(msg);
      }

      setFulfilled(true);
      setCycle((c) => c + 1);
      setProgress(0);
    } else {
      setProgress(next);
    }
  }

  return (
    <div class={`five-year-plan ${props.className ?? ""}`}>
      {/* Header */}
      <div class="five-year-plan-header">
        <h4>FIVE-YEAR PLAN</h4>
        <h4 class="label">CYCLE #{cycle}</h4>
      </div>

      {/* Content */}
      <div class="five-year-plan-content">
        <div class="five-year-plan-readout">
          <h3>TRACTOR OUTPUT</h3>
          <h3>{progress.toString().padStart(3, " ")}%</h3>
        </div>

        <div class="five-year-plan-badge-row">
          <div class={`badge label ${badgeStyle}`}>{badgeText}</div>
        </div>

        <progress value={progress} max="100" />

        <button class="primary full" onClick={work}>
          {fulfilled ? fulfillmentMessage : "WORK HARDER, COMRADE!"}
        </button>
      </div>
    </div>
  );
}
