import type { LayoutProps } from "@vktrz/castro";

import { Footer } from "@/components/Footer";
import { PageShell } from "@/components/PageShell";

import "./default.css";

export default function DefaultLayout(props: LayoutProps) {
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
