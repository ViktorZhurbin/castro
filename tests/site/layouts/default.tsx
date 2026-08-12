import type { LayoutProps } from "@vktrz/castro";
import { useId } from "preact/hooks";

import "./default.css";

export default function Layout({ title, children }: LayoutProps) {
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
