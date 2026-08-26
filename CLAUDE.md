# Project Instructions

## Context: who uses this project

This is a **non-production design prototype** used by designers and product managers — not engineers. When helping with this project:

- Do not ask about deployment, CI/CD, performance optimisation, or production concerns
- Do not suggest abstracting or refactoring code beyond what the immediate task needs
- Prefer simple, readable solutions over clever or idiomatic ones
- **When creating or modifying pages, always look at the existing templates first** — `/#/templates` in the running prototype, source in `src/templates/pages/`. They show the correct structure, spacing, and component usage.

## Build output

The build output directory is **`/docs/`** — intentional for GitHub Pages. Never change `outDir` in `vite.config.ts`. Always run:

```sh
npm run build
```

Always build before pushing — commit `/docs/` together with source changes.

## Component library

**Avoid raw HTML elements for layout or UI structure.** Use UI5 or UIxtension components instead. Plain `<div>` is acceptable only when no suitable component exists.

**NEVER guess prop names or event signatures.** Always query them first via the UI5 MCP tools.

**NEVER build custom base components** — if it's a common UI pattern, a UI5 or UIxtension component exists for it.

Only use components from the installed packages:
- `@ui5/webcomponents-react` and `@signavio/sap-signavio-uixtension` — primary UI components
- `@xyflow/react` — flow/graph diagrams
- `recharts` — charts and data visualisation
- `lucide-react` — icons not available in `@signavio/icons`
- `tailwindcss` — utility styling where UI5 CSS vars don't cover the need

For component usage patterns (popover padding, dialog padding, icon registration, UI5 padding rule) — run `/ui5-patterns`.

## Dependencies

### @signavio/sap-signavio-uixtension minimum version

This project requires `@signavio/sap-signavio-uixtension` **≥ 2.19.6**. Always run `npm install` after pulling.
