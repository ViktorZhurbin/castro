# Castro Development Guide

Read @ABOUT.md, @README.md for more context.

## Build & Dev Commands
- **Dev Server**: `bun run dev` (starts website playground)
- **Build Website**: `bun run build` (builds website playground)
- **Lint/Format**: `bun format` (uses Biome)
- **Type Check**: `bun type-check` (run tsc for all workspaces)
- **All Checks**: `bun check` (run all checks)
- **Metrics**: `bun loc` (count core lines of code)

## Code Style & Patterns
- **Language**: Use ES Modules (import/export) and Bun 1.3.8+.
- **Formatting**: Strictly follow Biome defaults (tabs, double quotes) via `bun format`.
- **Documentation**: Use JSDoc for all types and function intent. Use .d.ts files only for reusable types.
- **Errors**: Prefer loud startup failures (native errors) over defensive programming. Use `styleText` from `node:util` for colored terminal logs.
- **Messages**: All user-facing strings (errors, warnings, logs) must be defined in `src/messages/` and typed via `src/messages/messages.d.ts`. Import and use the centralized `messages` object instead of inline strings. Both `serious.js` (technical tone) and `communist.js` (satirical tone) presets must be kept in sync. Check `src/messages/README.md` for guidelines.
- **Dependencies**: Prioritize built-in Bun APIs over external packages to keep the footprint small.

## Project Structure & Context
- **Educational**: Code is serious and well-commented; satire is in CLI output, error messages, and docs only.
- **Monorepo**: `castro/` is the core engine; `website/` is the demo playground.
- **Architecture**: Minimalist SSG with "islands" architecture using Web Components as hydration boundaries.
- **Output**: `website/dist/` is ephemeral and cleaned automatically on build.

## This project is comparable to:
- **Fresh** (architecture)
- **Marko** (compiler philosophy)
- **Qwik** (tree analysis, though much heavier)
- early **Astro** (pre-marketplace era)
- **Eleventy** + is-land
