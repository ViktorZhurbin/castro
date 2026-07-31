import type { ComponentChildren } from "preact";

import Counter from "../components/Counter.island.tsx";

type Props = { title: string; children: ComponentChildren };

export default function WithIsland({ title, children }: Props) {
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
