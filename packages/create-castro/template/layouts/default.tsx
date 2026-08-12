import type { LayoutProps } from "@vktrz/castro";

export default function Layout({ title, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
