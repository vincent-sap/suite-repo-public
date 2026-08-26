---
name: ui5-patterns
description: Component usage patterns for @ui5/webcomponents-react and @signavio/sap-signavio-uixtension — icons registration, popover/dialog padding, padding rules. Load this when working on UI components.
---

# UI5 / UIxtension Patterns

## Popover padding

`ui5-popover` has default inner padding. To remove it, add the `no-padding-popover` CSS class — it targets `::part(content)` in `App.css`:

```tsx
<Popover className="no-padding-popover" ...>
```

Always use this class on popovers that contain a `List` or other flush content.

## Dialog body padding

UI5 `Dialog` has built-in content padding. Do not add extra padding wrapper divs inside dialogs — it creates double spacing.

For dialogs with flush/custom-layout content (full-width lists, two-column layouts), add `className="no-padding-dialog"` to strip it:

```tsx
<Dialog className="no-padding-dialog" ...>
  {/* flush content directly */}
</Dialog>
```

## UI5 padding rule

Never add padding or margin wrapper divs around UI5 components. `ObjectPageSection`, `DynamicPage`, `SigTableWrapper`, `List`, etc. already include their own spacing.

✅ Correct:
```tsx
<ObjectPageSection ...>
  <SigTableWrapper ...>...</SigTableWrapper>
</ObjectPageSection>
```

❌ Wrong:
```tsx
<ObjectPageSection ...>
  <div style={{ margin: '1.25rem 1.5rem 1.5rem' }}>
    <SigTableWrapper ...>...</SigTableWrapper>
  </div>
</ObjectPageSection>
```

## UIxtension / @signavio/icons usage

Icons from `@signavio/icons` register themselves into the `SAP-icons-v4` collection. To use one:

1. **Register it** in `src/icons/registerIcons.ts` — import the specific file (never `AllIcons.js`):
   ```ts
   import '@signavio/icons/dist/company-memory.js'
   ```

2. **Reference it** with the `SAP-icons-v4/` prefix:
   ```tsx
   <SideNavigationItem icon="SAP-icons-v4/company-memory" ... />
   <Icon name="SAP-icons-v4/company-memory" />
   ```
