import type { ComponentChildren } from "preact";
import { useId } from "preact/hooks";

import "./default.css";

type Props = { title: string; children: ComponentChildren };

export default function Layout({ title, children }: Props) {
  // Layouts render as VNodes, so hooks have a dispatcher here too.
  const id = useId();

  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body data-layout-id={id}>{children}</body>
    </html>
  );
}
