import type { LayoutProps } from "@vktrz/castro";

import "./default.css";

export default function Layout({ title, children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
