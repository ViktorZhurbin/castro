import { navSections } from "@/nav";

import { StarIcon } from "./icons/StarIcon";

import "./Header.css";

interface HeaderProps {
  activePath?: string;
}

export function Header({ activePath }: HeaderProps) {
  const navLinks = navSections.map(({ key, title, href }) => {
    const isActive = activePath?.startsWith(`/${key}`);

    return (
      <a key={href} href={href} aria-current={isActive ? "page" : undefined}>
        {title}
      </a>
    );
  });

  return (
    <header class="navbar label">
      <div class="navbar-start">
        <a href="/" class="navbar-home btn-square" aria-label="Home">
          <StarIcon />
        </a>
        <span class="navbar-tagline">The People's Framework</span>
      </div>

      <div class="navbar-end">
        {navLinks}
        <a href="https://github.com/ViktorZhurbin/castro">GitHub</a>
      </div>
    </header>
  );
}
