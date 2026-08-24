# Layout Templates — Intent & Usage Guide

Use this file to rebuild settings pages with the correct layouts. When given a screenshot or description of a page: (1) read this file in full, (2) use the Decision Guide at the bottom to identify the right template, (3) open the corresponding template file in `src/templates/pages/` and reproduce its structure with real data and API calls in place of the mock content.

This file is the authoritative reference for the layout template library in `src/templates/pages/`.

Use the templates as a reference for component structure and layout only — do not copy hooks, mock data, or any state management. Replace all mock content with real data and API calls when rebuilding.

> **Dependency note:** These templates require `@signavio/sap-signavio-uixtension` **≥ 2.19.6**.

---

## 1. Settings Page (Narrow)

**File:** `TemplateSettingsPage.tsx`
**Route:** `/templates/settings`

### When to use
For workspace or object settings that are primarily form-based. Content is center-constrained to a readable width. Not suitable for wide tables.

### Structure
```
DynamicPage
  └── div.narrowContent
        └── FlexBox (Column)
              ├── SettingsSection (form fields)
              │     └── SettingsSectionRow
              │           ├── Label
              │           └── Input / Select
              ├── SettingsSection (checkboxes)
              │     └── SettingsSectionRow
              │           └── div.checkboxRow > CheckBox + description Text
              └── SettingsSection (table, flush)
                    └── SigTableWrapper
                          └── Table
```

### Key rules
- Use `<div className={s.narrowContent}>` to constrain width
- Use `className="tpl-stack"` on the outer `FlexBox`
- Use `className="tpl-stack--flush"` on the `FlexBox` that wraps a table section — removes the horizontal gap so the table toolbar sits flush
- Table title inside `SigTableWrapper` uses `<Title level="H5" size="H6">` (one level smaller than page title)
- Boolean settings use `CheckBox`, not `Switch` — changes are staged and committed on save
- Floating footer appears only when `isDirty` is true

---

## 2. Settings Page — Wide

**File:** `TemplateSettingsPageWide.tsx`
**Route:** `/templates/settings-wide`

### When to use
Same as Settings Page but content reaches page edges. Use when the page contains a table that needs full width — e.g. a resource list.

### Structure
```
DynamicPage
  └── FlexBox (Column, tpl-stack tpl-stack--wide)       ← form sections
        └── SettingsSection > SettingsSectionRow
  └── FlexBox (Column, tpl-stack tpl-stack--wide tpl-stack--flush)  ← table section
        └── SettingsSection
              └── SigTableWrapper (with sortSlot, searchSlot, businessActionsSlot)
                    └── Table
```

### Key rules
- Use `className="tpl-stack--wide"` instead of narrow — no center constraint
- The table `FlexBox` also gets `tpl-stack--flush` to remove padding
- `sortSlot` uses `<TableSort>` component (see below)
- `businessActionsSlot` contains the primary action button (e.g. "Add Item")
- Table title: `<Title level="H5" size="H6">`

---

## 3. Table Settings Page (Narrow)

**File:** `TemplateTableSettingsPage.tsx`
**Route:** `/templates/table-settings`

### When to use
When the settings page is primarily a table — e.g. a list of users, groups, or resources — rather than a list of form fields. Use the narrow variant when the table doesn't need much horizontal space; constraining the width keeps it readable and avoids unnecessary stretching.

### Structure
```
DynamicPage
  └── div.narrowContent
        ├── AudienceSectionBar        ← audience filter (Everyone / Modelers / Admins)
        └── FlexBox (tpl-stack--flush)
              └── SigTableWrapper
                    └── Table
```

### Key rules
- `AudienceSectionBar` state is local (`useState`) — not in hooks, since it's page-specific UI state
- No `SettingsSection` wrapper around the table — `SigTableWrapper` is direct child
- Use `tpl-stack--flush` so the table toolbar sits flush with the page edges
- `narrowContent` constrains both the audience bar and the table

---

## 4. Table Settings Page — Wide

**File:** `TemplateTableSettingsPageWide.tsx`
**Route:** `/templates/table-settings-wide`

### When to use
Same as Table Settings Page (Narrow) but full-width. Use when the table has many columns and needs the space — otherwise prefer narrow to avoid unnecessary stretching.

### Structure
```
DynamicPage
  ├── AudienceSectionBar        ← sits outside narrowContent, full width
  └── SigTableWrapper           ← direct child of DynamicPage, full width
        └── Table
```

### Key rules
- No `div.narrowContent` wrapper — everything is full width
- `AudienceSectionBar` and `SigTableWrapper` are direct children of `DynamicPage`
- No `SettingsSection` wrapper

---

## 5. Tabbed Page

**File:** `TemplateTabbedPage.tsx`
**Route:** `/templates/tabbed`

### When to use
For complex detail views with multiple distinct aspects (General, Features, Access, etc.). Each tab is a full section, not a filtered view of the same content. Use when the content per tab is substantial enough to warrant its own page.

### Structure
```
ObjectPage (mode="IconTabBar")
  ├── ObjectPageSection id="general"
  │     └── div.narrowContent > FlexBox > SettingsSection > SettingsSectionRow
  ├── ObjectPageSection id="features"
  │     └── div.narrowContent > FlexBox > SettingsSection > SettingsSectionRow (checkboxes)
  └── ObjectPageSection id="access"
        └── div.narrowContent > FlexBox > SettingsSection > SettingsSectionRow
```

### Key rules
- Use `ObjectPage` with `mode="IconTabBar"` — not `DynamicPage` with injected tabs
- Save/Cancel buttons live in `actionsBar` on `ObjectPageTitle`, visible only when `isDirty`
- No floating footer — actions are inline in the header
- Each section gets `div.narrowContent` for consistent width constraint
- `hidePinButton` on `ObjectPage`

---

## 6. Two-Column — Detail Page

**File:** `TemplateTwoColumnPage.tsx`
**Route:** `/templates/two-column`

### When to use
When selecting a list item opens a full detail/edit page on the right. Use when the detail view is complex enough to be a standalone form.

### Structure
```
FlexibleColumnLayout (layout: OneColumn → TwoColumnsMidExpanded)
  ├── startColumn: DynamicPage
  │     └── SigTableWrapper > Table (clickable rows)
  └── midColumn: ObjectPage (when item selected) — DynamicPage also allowed
        ├── ObjectPageTitle > decline button in slot="navigationBar"
        └── ObjectPageSection > FlexBox > SettingsSection > SettingsSectionRow
```

### Key rules
- Starts collapsed (`layout: 'OneColumn'`), opens to `TwoColumnsMidExpanded` on row click
- Close button: `<Button slot="navigationBar" design="Transparent" icon="decline" />`
- Prefer `ObjectPage` for the mid column; `DynamicPage` is acceptable if the content is purely form-based with no tabs
- `isDirty` / `showFooter` applies only to the mid column
- Clicking a row sets `selected` and switches layout — both managed by `useTwoColumnLayout()`
- Selected row gets `background: var(--sapList_SelectionBackgroundColor)`
- `midColumn` renders `<div />` when nothing is selected

---

## 7. Two-Column — Side Panel

**File:** `TemplateTwoColumnPagePanel.tsx`
**Route:** `/templates/two-column-panel`

### When to use
When selecting a list item opens a narrow panel on the right. Use for contextual detail, metadata, or master–detail where the detail doesn't require much space. The panel is 30% width; the table gets 70%. If the detail requires a full form with many fields, use the Detail Page instead.

### Structure
```
FlexibleColumnLayout (layout: OneColumn → TwoColumnsStartExpanded, 70/30)
  ├── startColumn: DynamicPage
  │     └── SigTableWrapper > Table (clickable rows)
  └── midColumn: SigRightSidePanel (when item selected)
        └── FlexBox (Column, gap 1.5rem)
              ├── SidePanelSection > SidePanelCard > SidePanelGrid (Label + Text pairs)
              ├── SidePanelSection > SidePanelList > List
              └── SidePanelSection > Button (actions)
```

### Key rules
- Use `TwoColumnsStartExpanded` (not `TwoColumnsMidExpanded`) so start = 70%, mid = 30%
- `layoutsConfiguration={TWO_COLUMN_PANEL_LAYOUTS}` sets the exact 70/30 split
- `style={{ '--_ui5_fcl_separator_btn_display': 'none' }}` hides the FCL resize handle
- `SigRightSidePanel` always gets `useBoldText={false}` when it acts as a master–detail panel (i.e. the panel shows the detail of a selected list item). For other uses — supplementary info, service panels, contextual side content — omit the prop or set it to `true`.
- `SigRightSidePanel` is wrapped in `<div style={{ height: '100%', overflow: 'hidden' }}>`
- Close via `toggleRightSidePanel={handleClose}` — no separate decline button
- Label/value pairs in the panel use `<Label showColon>` + `<Text>`
- Save/Cancel for panel actions are inline, shown only when `isDirty`
- Managed by `useTwoColumnPanelLayout()` from hooks

---

## 8. Side Nav + Content

**Files:** `TemplateSideNavPage.tsx` (narrow), `TemplateSideNavPageWide.tsx` (wide)
**Routes:** `/templates/side-nav`, `/templates/side-nav-wide`

### When to use
For settings pages with multiple named sections accessible via a persistent left navigation rail. Use when sections are categorically distinct (General, Access, Appearance, Advanced) and users need to jump between them frequently.

### Structure
```
DynamicPage
  └── div.tpl-sidenav-layout (ref={layoutRef})
        ├── div.tpl-sidenav-rail (hidden when narrow)
        │     └── List > ListItemStandard (nav items)
        └── div.tpl-sidenav-content (+ narrowContent on narrow variant)
              └── FlexBox > SettingsSection list
                    ├── SettingsSection (title header — no title prop)
                    │     └── div.tpl-sidenav-nav-title
                    │           ├── VariantManagement (narrow: dropdown nav)
                    │           └── Title H4 (wide: section label)
                    ├── SettingsSection (form content)
                    │     └── SettingsSectionRow > Label + Input/Select
                    └── SettingsSection (options, etc.)
```

### Key rules
- Layout switches at 700px (narrowing) / 740px (widening) via `ResizeObserver` in `useSideNavLayout()`
- When narrow: `VariantManagement` replaces the rail as a dropdown section switcher
- When wide: a `<Title level="H4">` shows the active section label
- The title `SettingsSection` has no `title` prop — it's just used for consistent spacing
- `div.tpl-sidenav-nav-title` provides `padding: 0.5rem 1rem` (defined in `templates.css`)
- Nav items come from `NAV_ITEMS` in `mockData.ts`
- Active section label comes from `useSideNavLayout()` → `activeLabel`
- Narrow variant: `tpl-stack` + `narrowContent`; Wide variant: `tpl-stack--wide`

---

## General Rules

### Saving model

Settings pages use **manual save**: all changes are staged and committed only when the user explicitly clicks Save. The floating footer (or inline header actions on tabbed pages) appears only when `isDirty` is true. Boolean fields use `CheckBox` instead of `Switch` because `Switch` implies immediate effect.

The manual save model does **not** apply to flows with a clear, self-contained commit action. If the final step already represents the user's intent — e.g. "Create User", "Apply", "Submit", "Import" — that button is the save. No separate Save/Cancel footer is needed.

### `Title` level vs. size

`level` and `size` on `<Title>` are independent props. `level` sets the semantic heading level in the DOM (`H1`–`H6`) for accessibility and document structure — it must match the heading hierarchy of the page. `size` controls the visual size only and can be set freely regardless of level.

Always set `level` to match the page's heading structure, not the desired visual size. Use `size` to adjust appearance independently.

```tsx
// Table title inside a settings page: semantically H5, visually smaller (H6)
<Title level="H5" size="H6">Items ({count})</Title>
```

### UIxtension component props
`SigTableWrapper`, `SigChipV2`, `SigRightSidePanel`, and other `@signavio/sap-signavio-uixtension` components are documented in the UI5 MCP server. Use the `ui5wc_get_component_info` tool to look up available props, slots, and events before using them — do not guess prop names.

UIxtension components can be identified in the DOM by their `data-component` attribute, e.g. `data-component="sig-table-wrapper"`, `data-component="sig-chip-v2"`. Use this to match a rendered element back to its component name for MCP lookup.
Every table in this codebase is wrapped in `SigTableWrapper` from `@signavio/sap-signavio-uixtension`. Never render a bare `<Table>` without it. `SigTableWrapper` provides the toolbar with title, search, sort, and action slots:

```tsx
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'

<SigTableWrapper
  titleSlot={<ToolbarItem><Title level="H5" size="H6" wrappingType="None">Items ({count})</Title></ToolbarItem>}
  sortSlot={<TableSort sortOptions={['Name', 'Type']} />}
  searchSlot={<ToolbarItem><Input placeholder="Search" type={'Search' as any} value={search} onInput={...} /></ToolbarItem>}
  businessActionsSlot={<ToolbarItem><Button icon="add" design="Emphasized">Add</Button></ToolbarItem>}
>
  <Table headerRow={<TableHeaderRow>...</TableHeaderRow>}>
    {items.map(...)}
  </Table>
</SigTableWrapper>
```

All slots are optional — include only those relevant to the page.

### Rebuild shared components from source if needed
When rebuilding a page in a real app, copy `SettingsSection`, `AudienceSectionBar`, and `SidePanelSection` **exactly** as defined in the source files — including their CSS. Do not approximate or invent the structure from memory, and do not just loosely adapt them. Read the source files first, then reproduce them 1:1.

`SettingsSection` and `AudienceSectionBar` are **settings-only** components. Use them only on settings pages — not on general-purpose pages like browse views, detail pages, or dashboards.

- `src/templates/pages/components/SettingsSection.tsx` + `SettingsPage.module.css`
- `src/templates/pages/components/AudienceSectionBar.tsx` + `SettingsPage.module.css`
- `src/templates/pages/components/SidePanelSection.tsx` + `SidePanelSection.css`
- `src/templates/pages/templates.css` — all shared layout and shell classes

**Read all CSS files before rebuilding.** Spacing, borders, colors, and responsive behavior all live there.

---



### `SettingsSection` *(settings pages only)*
```tsx
<SettingsSection title="Section Title" subtitle="Optional description." action={<Button>...</Button>}>
  <SettingsSectionRow>
    <Label>Field Name</Label>
    <Input ... />
  </SettingsSectionRow>
</SettingsSection>
```
- `title` and `subtitle` are optional
- `action` renders in the section header (e.g. a "Delete" button for Danger Zone)
- `SettingsSectionRow` provides consistent row padding

### `TableSort`
```tsx
import { TableSort } from './components/TableSort'

// Inside SigTableWrapper sortSlot:
sortSlot={<TableSort sortOptions={['Name', 'Type', 'Owner']} />}
```
- Renders a `SigChipV2` chip that opens a sort popover
- `leadingIcon` shows current direction (sort-ascending / sort-descending)
- `trailingIcon="slim-arrow-down"` signals the dropdown
- Popover contains a `SegmentedButton` (Ascending / Descending) + `List` of sort fields
- Props: `sortOptions` (required), `selectedOption`, `direction` ('asc' | 'desc')
- Currently non-functional in templates — wire up real sort state when rebuilding

### `AudienceSectionBar` *(settings pages only)*
```tsx
<AudienceSectionBar value={audience} onChange={setAudience} />
```
- Renders a segmented audience filter (Everyone / Modelers / Admins)
- State is always local to the page (`useState`) — not in hooks
- Used in Table Settings templates only

### `SidePanelSection` / `SidePanelCard` / `SidePanelGrid` / `SidePanelList`
```tsx
<SidePanelSection title="Details">
  <SidePanelCard>
    <SidePanelGrid>
      <Label showColon>Name</Label>
      <Text>Value</Text>
    </SidePanelGrid>
  </SidePanelCard>
</SidePanelSection>
```
- Used inside `SigRightSidePanel` only
- `SidePanelGrid` renders a two-column label/value grid
- `SidePanelList` provides flush padding for `List` items

---

## Decision Guide

| Situation | Template |
|---|---|
| Form-only settings, center-constrained | Settings Page (Narrow) |
| Form + wide table on the same page | Settings Page (Wide) |
| Settings page primarily a table, few columns | Table Settings Page (Narrow) |
| Settings page primarily a table, many columns | Table Settings Page (Wide) |
| Multiple categorical sections with tabs | Tabbed Page |
| List → full edit/form detail on the right | Two-Column — Detail Page |
| List → contextual detail or master–detail with compact detail | Two-Column — Side Panel |
| Categorically navigable sections with persistent rail | Side Nav + Content |

### Settings-only vs general-purpose templates

**Settings Page** and **Table Settings Page** are exclusively for settings screens — pages where the user configures workspace or object behaviour.

**Tabbed Page**, **Two-Column (Detail + Side Panel)**, and **Side Nav + Content** are general-purpose layouts. Use them for any kind of page — settings, browse, detail views, dashboards, or anything else that fits the structure.

### Narrow vs Wide
- **Narrow**: Use when all content fits in a readable line length (~600–700px). Forms, checkboxes, short selects.
- **Wide**: Use when a table needs to reach page edges, or when the layout benefits from full viewport width.

### Two-Column: Detail vs Side Panel
- Use **Detail Page** when the detail requires a full form with many fields and its own Save/Cancel — i.e. it's effectively a page.
- Use **Side Panel** when the detail is compact enough to fit in 35% width — metadata, a short form, a list of members, or read-mostly info.

### Table Settings vs Settings (Wide) with table
- Use **Table Settings** when the page is *primarily* a table — e.g. a list of users, groups, or resources. Use narrow unless the table has many columns that need the space.
- Use **Settings Wide** when the page has *both* form sections and a table — the table is one section among several.
