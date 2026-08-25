# Project Instructions

## Context: who uses this project

This is a **non-production design prototype** used by designers and product managers — not engineers. When helping with this project:

- Do not ask about deployment, CI/CD, performance optimisation, or production concerns
- Do not suggest abstracting or refactoring code beyond what the immediate task needs
- Prefer simple, readable solutions over clever or idiomatic ones
- **When creating or modifying pages, always look at the existing templates first** — `/#/templates` in the running prototype, source in `src/templates/pages/`. They show the correct structure, spacing, and component usage.

## Build output

The build output directory is **`/docs/`** — this is intentional for GitHub Pages hosting. Never change `outDir` in `vite.config.ts`. When asked to build or publish, always run:

```sh
npm run build
```

This outputs to `/docs/`. **Always build before pushing** — commit the `/docs/` folder together with your source changes so GitHub Pages stays in sync.

## Component library

**Avoid raw HTML elements (`<div>`, `<span>`, `<section>`, `<p>`, `<ul>`, `<button>`, etc.) for layout or UI structure.** When a UI5 or UIxtension component exists for the use case, use it instead. Plain `<div>` is acceptable only when no suitable component exists.

**NEVER guess prop names or event signatures.** Always query them first via the UI5 MCP tools (`ui5wc_get_component_info`, `ui5wc_get_guidelines`, `get_component_api`, etc.).

Only use components from the installed packages: `@ui5/webcomponents-react` and `@signavio/sap-signavio-uixtension`.

## Dependencies

### @signavio/sap-signavio-uixtension minimum version

This project requires `@signavio/sap-signavio-uixtension` **≥ 2.19.6**. Always run `npm install` after pulling before building — missing this step can result in an older cached version being bundled.

### Popover padding

`ui5-popover` has default inner padding. To remove it, add the `no-padding-popover` CSS class — it targets `::part(content)` in `App.css`:

```tsx
<Popover className="no-padding-popover" ...>
```

Always use this class on popovers that contain a `List` or other flush content.

### UIxtension / @signavio/icons usage

Icons from `@signavio/icons` register themselves into the `SAP-icons-v4` collection. To use one:

1. **Register it** in [src/icons/registerIcons.ts](src/icons/registerIcons.ts) — import the specific file (never `AllIcons.js`, it overrides UI5 icons):
   ```ts
   import '@signavio/icons/dist/company-memory.js'
   ```

2. **Reference it** with the `SAP-icons-v4/` prefix:
   ```tsx
   <SideNavigationItem icon="SAP-icons-v4/company-memory" ... />
   <Icon name="SAP-icons-v4/company-memory" />
   ```

### Dialog body padding

UI5 `Dialog` has its own built-in content padding. Do not add extra padding wrapper divs inside dialogs — it creates double spacing.

For dialogs with flush/custom-layout content (full-width lists, two-column layouts), add `className="no-padding-dialog"` to strip the built-in padding:

```tsx
<Dialog className="no-padding-dialog" ...>
  {/* flush content directly */}
</Dialog>
```

## UI5 padding rule

**Never add padding or margin wrapper divs around UI5 components.** UI5 components (`ObjectPageSection`, `DynamicPage` content, `SigTableWrapper`, `List`, etc.) already include their own internal spacing. Adding a wrapper `<div style={{ padding/margin: '...' }}>` creates double spacing and visual inconsistency.

✅ Correct — component directly as child:
```tsx
<ObjectPageSection ...>
  <SigTableWrapper ...>...</SigTableWrapper>
</ObjectPageSection>
```

❌ Wrong — unnecessary wrapper div:
```tsx
<ObjectPageSection ...>
  <div style={{ margin: '1.25rem 1.5rem 1.5rem' }}>
    <SigTableWrapper ...>...</SigTableWrapper>
  </div>
</ObjectPageSection>
```

When in doubt, look at the templates in `src/templates/pages/` — they show the correct structure.
