# @vktrz/castro-tailwind

Tailwind CSS v4 + PostCSS integration for Castro.

## Install

```bash
bun add @vktrz/castro-tailwind tailwindcss
```

## Usage

```ts
// castro.config.ts
import { defineConfig } from "@vktrz/castro";
import { tailwind } from "@vktrz/castro-tailwind";

export default defineConfig({
  plugins: [
    tailwind({ input: "styles/app.css" }),
  ],
});
```

The `input` option accepts a single path or an array of paths, relative to your project root. Each file is processed through PostCSS and written to `dist/` on every build. A `<link>` tag is auto-injected into every page.

## DaisyUI

DaisyUI v5 works via Tailwind's `@plugin` directive — no extra PostCSS setup needed:

```css
/* styles/app.css */
@import "tailwindcss";
@plugin "daisyui";
```

Install it separately: `bun add daisyui`
