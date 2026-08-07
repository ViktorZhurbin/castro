import "./CTAButtons.css";

function cx(...classes: Array<string | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function CTAButtons(props: { className?: string }) {
  return (
    <div class={cx("cta-buttons-container", props.className)}>
      <a
        href="https://github.com/ViktorZhurbin/castro"
        target="_blank"
        rel="noopener"
        role="button"
        class="primary"
      >
        READ THE SOURCE
      </a>
    </div>
  );
}
