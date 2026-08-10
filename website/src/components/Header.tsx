import { navSections } from "@/nav";

import { GithubIcon } from "./icons/GithubIcon";
import { StarIcon } from "./icons/StarIcon";
import { ThemeToggle } from "./theme/ThemeToggle";

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
    <header class="navbar">
      <div class="navbar-start">
        <a href="/" class="btn-square btn-square-primary" aria-label="Home">
          <StarIcon />
        </a>
        {navLinks}
      </div>

      <div class="navbar-end">
        <a class="btn-square" href="https://github.com/ViktorZhurbin/castro">
          <GithubIcon />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
