# shared/components — what lives where

Components used across **more than one domain**, plus the app shell. If a
component is only used by a single domain, it belongs in that domain
(`src/domains/<domain>/`), not here.

## Map

| Folder / file | What it is | Used by |
|---|---|---|
| `Shell.tsx` | App frame (top bar, side nav, settings layout). The one true shared component. | root (`App.tsx`), templates |
| `Shell/` | Shell-only subparts: `ShellSideNavigation`, `SettingsSidebar`, `AboutDialog`, `ConventionsDialog`, `ConnectionsSettingsView`, `UserSettingsDialogView` | Shell |
| `panels/SuiteContextPanel.tsx` | Right-hand context rail + panel frame. Domain-specific panels (Diagram Attributes, Atoms) are passed in via the `renderPanel(id)` prop — see `panels/CLAUDE.md` for the usage pattern. | modeler |
| `panels/SuiteContextPanel/` | Domain-free subpanels of the context rail: `JouleChatPanel` | SuiteContextPanel |
| `panels/CommentsPanel.tsx` | Comments panel (plain TextArea, mock threads) | tvm |
| `panels/CommentsTab.tsx` | Threaded comments tab (self-contained, mock data) | repository (AssetInfoPanel), SuiteContextPanel |
| `panels/DictionaryPanel.tsx` | Dictionary lookup panel | modeler |
| `panels/JouleInput.tsx` | Joule prompt input | modeler, Shell |
| `dialogs/WelcomeModal.tsx` | First-run welcome dialog | Shell |
| `feedback/HotspotTooltip.tsx` | Guided-tour hotspot tooltip | Shell |
| `feedback/SaveStateIndicator.tsx` | "Saved / Saving" status pill | `useMockSave` hook |
| `feedback/StickyNote.tsx` | Draggable sticky note (kept for reuse) | settings |
| `search/SearchDropdown.tsx` | Global search dropdown results | Shell |
| `dashboard/` | Generic dashboard tiles (`StatTile`, `MetricCard`, `ChartCard`, `SparkLine`, badges…) | reporting only — borderline, could move to `domains/reporting/` if reporting stops sharing them |

## Maintenance

When you add a component here, add a row above. When a component ends up used
by only one domain, **move it into that domain** and drop its row. Keeping this
table honest is what stops `shared/` from turning back into a dumping ground.

## Rule: shared/ must not import from domains/

A component under `shared/` may not `import` from `src/domains/`. If a shared
component needs domain-specific content, it takes it as a prop/slot and the
domain passes it in. `SuiteContextPanel` does this: it renders its own rail +
frame and calls `renderPanel(id)` for panels it doesn't own (Diagram Attributes,
Atoms live in modeler and are handed in from `ModelerLayout`). This keeps the
dependency arrow one-way (domains → shared) and shared reusable.
