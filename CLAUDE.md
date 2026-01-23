# Reef Development Guide

## Build & Dev Commands
- **Dev Server**: `pnpm dev` (starts website playground)
- **Build Website**: `pnpm build`
- **Lint/Format**: `pnpm format` (uses Biome)
- **Type Check**: `pnpm --filter @vktrz/reef type-check`
- **Metrics**: `pnpm loc` (count core lines of code)

## Code Style & Patterns
- **Language**: Use ES Modules (import/export) and Node.js 24+.
- **Formatting**: Strictly follow Biome defaults (tabs, double quotes) via `pnpm format`.
- **Documentation**: Use JSDoc for core logic types and function intent; use TypeScript for layouts and islands.
- **Reactivity**: Islands follow the convention `<framework>-<filename>` (e.g., `Counter.tsx` in `islands/solid/` becomes `<solid-counter>`).
- **Errors**: Prefer loud startup failures (native errors) over defensive programming. Use `styleText` from `node:util` for colored terminal logs.
- **Dependencies**: Prioritize built-in Node.js APIs over external packages to keep the footprint small.

## Project Structure & Context
- **Experimental**: No legacy support or backward compatibility required; delete or refactor aggressively.
- **Monorepo**: `packages/reef/` is the core engine; `website/` is the demo playground.
- **Architecture**: Minimalist SSG with an "islands" architecture using Web Components as hydration boundaries.
- **Output**: `website/dist/` is ephemeral and cleaned automatically on build.
