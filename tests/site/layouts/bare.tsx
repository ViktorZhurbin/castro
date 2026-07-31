import type { ComponentChildren } from "preact";

type Props = { children: ComponentChildren };

// A layout with no <head>/<body> shell. Nothing stops a layout from
// returning a bare fragment, and injectTags() has no anchor to inject
// before when one does — see writeHtmlPage.js.
export default function BareLayout({ children }: Props) {
  return <div>{children}</div>;
}
