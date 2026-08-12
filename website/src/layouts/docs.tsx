import type { LayoutProps } from "@vktrz/castro";

import { Footer } from "@/components/Footer";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { PageShell } from "@/components/PageShell";
import { navSections } from "@/nav";

import "./docs.css";

export default function DocsLayout({
  title,
  description,
  path,
  children,
}: LayoutProps<{ path?: string }>) {
  return (
    <PageShell title={title} description={description} activePath={path}>
      <div class="docs-shell">
        {/* Pure CSS toggle: a hidden checkbox drives the mobile sidebar state, no JS required. */}
        <input
          type="checkbox"
          id="docs-drawer"
          class="docs-drawer-toggle"
          hidden
          aria-hidden="true"
        />

        {/* Backdrop — clicking this label unchecks the checkbox on mobile */}
        <label htmlFor="docs-drawer" class="docs-overlay" aria-label="Close sidebar" />

        <aside class="docs-sidebar">
          <nav>
            {navSections.map(({ key, title: sectionTitle, links }) => (
              <div class="docs-sidebar-section" key={key}>
                <h3>{sectionTitle.toUpperCase()}</h3>
                <ul>
                  {links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} aria-current={path === link.href ? "page" : undefined}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div class="docs-content">
          {/* Mobile-only navigation strip — must stay inside the scrolling container to stick */}
          <div class="docs-mobile-bar">
            <label htmlFor="docs-drawer" class="btn-square" aria-label="Open sidebar">
              <MenuIcon />
            </label>
          </div>

          <main class="container">{children}</main>
          <Footer />
        </div>
      </div>
    </PageShell>
  );
}
