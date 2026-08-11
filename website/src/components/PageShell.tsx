import "@vktrz/bare-css/index.css";
import type { ComponentChildren } from "preact";

import { Header } from "./Header";
import { ThemeScript } from "./theme/ThemeScript";

import "./PageShell.css";

interface PageShellProps {
  title: string;
  description?: string;
  activePath?: string;
  children: ComponentChildren;
}

export function PageShell({ title, description, activePath, children }: PageShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700&family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header activePath={activePath} />
        {children}
      </body>
    </html>
  );
}
