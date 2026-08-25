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

If "Copy an existing page" was chosen in Step 1: ask them to name the page they want to copy, find it in `src/domains/`, and copy it to the chosen domain location with the new name. Then skip to Step 5.

If "Contribute to an existing page" was chosen in Step 1: ask which page they want to contribute to, find it in `src/domains/`, open it, and ask what they'd like to add or change. Make the requested changes and skip Steps 2–5 (no new file or route needed).

## Step 4 — Create the file

Create `src/domains/<domain>/<PageName>.tsx` based on the chosen template.

Use the corresponding file in `src/templates/pages/` as the reference — copy its structure but replace placeholder content with empty sections and a meaningful title.

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

Read the template file first, then create the new page based on its structure. Replace the component name, title, and any placeholder content — keep the layout and imports intact.

## Step 5 — Add the route

Open `src/App.tsx`. Add the import and route:

```tsx
import <PageName> from './domains/<domain>/<PageName>'
// inside <Routes>:
<Route path="<page-name>" element={<<PageName> />} />
```

## Step 6 — Add to navigation (optional)

Ask (plain text):

> **Add this page to the sidebar navigation?** Reply with **yes** or **no**.

If yes: open `src/shared/components/Shell.tsx`, find the `SideNavigation`, and add a `SideNavigationItem` for the new page. Use a sensible icon from the existing items as a reference.

## Step 7 — Done

Tell the user:

> **Page created!** Open your prototype and go to `/#/<page-name>` to see it.
>
> Edit `src/domains/<domain>/<PageName>.tsx` to build out the content.
