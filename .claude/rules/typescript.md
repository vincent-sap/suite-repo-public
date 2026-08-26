---
paths:
  - "src/**/*.{ts,tsx}"
---

# TypeScript / React rules for this project

## Routing

- Settings routes live under `/settings/` — adding a new settings page means: route in `App.tsx` under `<Route path="settings">`, entry in `SETTINGS_NAV` in `src/shared/components/Shell/SettingsSidebar.tsx`, and path in `src/settingsSearch.ts`.
- Non-settings pages: flat route directly under `<Route path="/">` in `App.tsx`, nav item in `src/shared/components/Shell/ShellSideNavigation.tsx`.

## Key files

| What | File |
|---|---|
| Routes | `src/App.tsx` |
| Shell layout + nav logic | `src/shared/components/Shell.tsx` (~250 lines) |
| Side navigation items | `src/shared/components/Shell/ShellSideNavigation.tsx` |
| Settings sidebar + SETTINGS_NAV | `src/shared/components/Shell/SettingsSidebar.tsx` |
| User settings dialog | `src/shared/components/Shell/UserSettingsDialogView.tsx` |
| Settings search index | `src/settingsSearch.ts` |

## Never guess prop names

Always query UI5/UIxtension component APIs via the MCP tools (`ui5wc_get_component_info`, `get_component_api`) before using a component you haven't seen in this codebase.
