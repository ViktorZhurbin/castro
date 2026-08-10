import type { ComponentChildren } from "preact";

import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";

import "./docs.css";

interface Props {
  title: string;
  children: ComponentChildren;
}

export default function DocsLayout({ title, children }: Props) {
  return (
    <PageShell title={title}>
      <main class="default-main">
        <div class="container docs-content">{children}</div>

        <Footer />
      </main>
    </PageShell>
  );
}
