/**
 * Nav data source for both the header link and the docs sidebar. One section
 * today (docs has one IA branch); Header and DocsLayout both map over
 * `navSections` so a second section would show up in both places for free.
 */

export interface NavLink {
  href: string;
  label: string;
}

export interface NavSection {
  key: string;
  title: string;
  href: string;
  links: NavLink[];
}

export const navSections: NavSection[] = [
  {
    key: "docs",
    title: "Docs",
    href: "/docs/quick-start",
    links: [
      { href: "/docs/quick-start", label: "Quick Start" },
      { href: "/docs/islands", label: "Islands" },
      { href: "/docs/config", label: "Configuration" },
    ],
  },
];
