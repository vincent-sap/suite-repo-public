# Settings domain

Contains all Workspace Settings pages. Each page is a single `.tsx` file directly in this folder (sub-components go in `components/`).

**Adding a new settings page:**
1. Create `PageName.tsx` here — use a template from `src/templates/pages/`
2. Add route in `src/App.tsx` under `<Route path="settings">`
3. Add nav entry in `src/shared/components/Shell/SettingsSidebar.tsx` → `SETTINGS_NAV`
4. Add search keywords in `src/settingsSearch.ts`
