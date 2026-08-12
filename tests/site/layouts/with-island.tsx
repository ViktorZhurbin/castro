import type { LayoutProps } from "@vktrz/castro";

import Counter from "../components/Counter.island.tsx";

export default function WithIsland({ title, children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>
        <nav>
          <Counter initial={0} comrade:eager />
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
