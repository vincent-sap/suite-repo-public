---
name: create-page
description: Create a new page in this prototype based on an existing template. Use when a designer wants to add a new screen.
---

Create a new page in this prototype based on one of the available templates.

Do not ask dev-related questions. Keep it simple — this prototype is used by designers and product managers.

## Step 1 — Show templates

Output the following list as plain text — do NOT use AskUserQuestion here:

---

**Which template would you like to use? Reply with the number.**

1. **Settings** — form layout with sections, Save/Reset buttons in the header
2. **Settings wide** — same as Settings but content stretches full width
3. **Table + Settings** — table at the top, settings form below
4. **Table + Settings wide** — same but full width
5. **Tabbed** — content split into tabs (ObjectPage with IconTabBar)
6. **Two column** — content split into a main area and a narrower right column
7. **Two column + panel** — two columns with a collapsible side panel
8. **Side nav** — page with its own secondary left navigation
9. **Side nav wide** — same but wider content area
10. **Copy an existing page** — start from a page already in this prototype
11. **Contribute to an existing page** — add content to a page that already exists

You can preview all templates at `/#/templates` in the running prototype.

---

Wait for the user to reply with a number, then continue.

## Step 2 — Ask for page name

Ask (plain text, no AskUserQuestion):

> **What should the page be called?** (e.g. "Process Overview", "Risk Dashboard")

Wait for the reply. Derive the file name in PascalCase (e.g. `ProcessOverview.tsx`) and the route path in kebab-case (e.g. `process-overview`).

## Step 3 — Ask for domain

List the existing domains from `src/domains/` as a numbered plain text list:

> **Which area does this page belong to? Reply with the number.**

```bash
ls src/domains/
```

Output the folders as a numbered list. Wait for the reply.

If the user isn't sure, suggest the closest match based on the page name.

If the user wants a **new domain** (none of the existing ones fit): ask for the new domain name, create the folder `src/domains/<new-domain>/`, and use that.

If "Copy an existing page" was chosen in Step 1: ask them to name the page they want to copy, find it in `src/domains/`, and copy it to the chosen domain location with the new name. Then continue to Steps 4b–6 to wire it up.

If "Contribute to an existing page" was chosen in Step 1: ask which page they want to contribute to, find it in `src/domains/`, open it, and ask what they'd like to add or change. Make the requested changes and skip the remaining steps (no new file, route, or nav needed).

## Step 4 — Create the file

Create `src/domains/<domain>/<PageName>.tsx` based on the chosen template.

Template file mapping:
- 1 → `src/templates/pages/TemplateSettingsPage.tsx`
- 2 → `src/templates/pages/TemplateSettingsPageWide.tsx`
- 3 → `src/templates/pages/TemplateTableSettingsPage.tsx`
- 4 → `src/templates/pages/TemplateTableSettingsPageWide.tsx`
- 5 → `src/templates/pages/TemplateTabbedPage.tsx`
- 6 → `src/templates/pages/TemplateTwoColumnPage.tsx`
- 7 → `src/templates/pages/TemplateTwoColumnPagePanel.tsx`
- 8 → `src/templates/pages/TemplateSideNavPage.tsx`
- 9 → `src/templates/pages/TemplateSideNavPageWide.tsx`

Read the template file first, then create the new page based on its structure. Replace the component name, title, and any placeholder content — keep the layout and imports intact. Template imports use `../../templates/pages/...` relative paths; adjust them to match the new file's depth under `src/domains/<domain>/`.

## Step 4b — Export from the domain index

Add the component to `src/domains/<domain>/index.ts` so `App.tsx` can import it from the domain barrel:

```ts
export { default as <PageName> } from './<PageName>'
```

If the domain has no `index.ts` yet (e.g. a brand-new domain), create one with just this line.

## Step 5 — Add the route

There are TWO cases. Decide based on whether this is a Workspace Settings page.

### Case A — Regular page (most pages)

In `src/App.tsx`:
1. Add to the matching domain import block near the top, e.g. `import { ..., <PageName> } from './domains/<domain>'`
2. Add the route inside `<Route path="/" element={<PCAProvider><Shell /></PCAProvider>}>`, alongside the other top-level routes (NOT inside the `settings` block):
   ```tsx
   <Route path="<page-name>" element={<<PageName> />} />
   ```

### Case B — Workspace Settings page (templates 1–4, or clearly a settings screen)

1. Import as in Case A.
2. Add the route INSIDE the `<Route path="settings">` block in `App.tsx` (note: no `settings/` prefix on the child path):
   ```tsx
   <Route path="<page-name>" element={<<PageName> />} />
   ```
   The full URL becomes `/settings/<page-name>`.
3. Register it in the settings registry `src/data/settingsPages.ts` — add one entry to `SETTINGS_PAGES`:
   ```ts
   { path: '/settings/<page-name>', text: '<Nav Label>', group: '<Group Title>', keywords: ['...', '...'] },
   ```
   Use an existing `group` title (e.g. 'Workspace', 'Security') so it lands in the right sidebar section. The settings sidebar nav AND the settings search pick this up automatically — nothing else to edit for settings nav.

## Step 6 — Add to main navigation (regular pages only)

Skip this for Settings pages — they appear in the settings sidebar automatically via Step 5 Case B.

For a regular page, ask (plain text):

> **Add this page to the main sidebar navigation?** Reply with **yes** or **no**.

If yes, edit `src/shared/components/Shell/ShellSideNavigation.tsx`:
1. Add one line to the `NAV_ROUTES` map: `'<Nav Label>': '/<page-name>',`
2. Add a `<SideNavigationItem icon="<icon>" text="<Nav Label>" selected={s('<Nav Label>')} />` in the desired group. Use a sensible icon from an existing item as reference. The `selected` state is derived automatically — no extra props needed.

## Step 7 — Done

Tell the user:

> **Page created!** Open your prototype and go to `/#/<page-name>` (or `/#/settings/<page-name>` for settings) to see it.
>
> Edit `src/domains/<domain>/<PageName>.tsx` to build out the content.
