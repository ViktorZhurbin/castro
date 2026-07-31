import type { ComponentChildren } from "preact";

import "./default.css";

type Props = { title: string; children: ComponentChildren };

export default function Layout({ title, children }: Props) {
  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
