import "../styles/index.css";
import type { ComponentChildren } from "preact";

import { Header } from "./Header";

import "./PageShell.css";

/**
 * Self-hosted latin subsets, downloaded from Google Fonts. Oswald is a
 * variable font: one file covers every weight the site uses (500–700).
 * Body text uses the system sans (`--font-family` in `styles/tokens.css`), so it
 * needs no file.
 */
const FONT_FACES = `
@font-face {
  font-family: "Oswald";
  font-weight: 500 700;
  font-display: swap;
  src: url("/fonts/oswald-latin.woff2") format("woff2");
}
@font-face {
  font-family: "IBM Plex Mono";
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/ibm-plex-mono-400-latin.woff2") format("woff2");
}`;

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
        {/* "only" asks the browser not to auto-darken the page: it has one theme. */}
        <meta name="color-scheme" content="only light" />
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Both faces render above the fold, so fetch them alongside the CSS
            instead of after it has been parsed. */}
        <link
          rel="preload"
          href="/fonts/oswald-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/ibm-plex-mono-400-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Inline, not in a bundled stylesheet: Bun's CSS bundler resolves
            every url() as an import, and these files live in public/, which
            is only copied into dist/, never bundled. */}
        <style dangerouslySetInnerHTML={{ __html: FONT_FACES }} />
      </head>
      <body>
        <Header activePath={activePath} />
        {children}
      </body>
    </html>
  );
}
