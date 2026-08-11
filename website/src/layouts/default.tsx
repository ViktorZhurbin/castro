import type { ComponentChildren } from "preact";

import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";

import "./default.css";

interface Props {
  title: string;
  description?: string;
  children: ComponentChildren;
}

export default function DefaultLayout(props: Props) {
  const { title, description, children } = props;

  return (
    <PageShell title={title} description={description}>
      <main class="default-main">
        {children}

        <Footer />
      </main>
    </PageShell>
  );
}
