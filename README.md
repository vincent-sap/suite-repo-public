# Suite Replica

A forkable high-fidelity prototype of the SAP Signavio Suite — built for designers and product managers to explore, extend, and hand off to engineers. No engineering background needed to get started.

Built with [UI5 Web Components for React](https://sap.github.io/ui5-webcomponents-react/) and [SAP Signavio UIxtension](https://www.npmjs.com/package/@signavio/sap-signavio-uixtension).

<div align="center">
  <br>
  <a href="PAGES_URL_PLACEHOLDER" target="_blank">
    <img src="https://img.shields.io/badge/Open%20Prototype-%E2%86%92-0070f3?style=for-the-badge&labelColor=0070f3&color=0054a6&logoColor=white" alt="Open Prototype" />
  </a>
  <br><br>
</div>

---

## What's included

- **Repository** — table, list, and grid views, context menus, filter/sort/column management
- **Workspace Settings** — full navigation with realistic UI across all major settings areas
- **TVM** — Objectives, Initiatives, Strategy Execution, Improvement Opportunities, Discover
- **Process Landscape** — hierarchy management, canvas view, catalog view
- **Home Dashboard** — customisable widget grid
- **Suite shell** — ShellBar, side navigation, workspace selector
- **Templates** — 9 reusable page layouts at `/#/templates`

## Getting started

1. Fork this repo on [github.tools.sap](https://github.tools.sap/signavio-experience/suite-replica)
2. Clone your fork and open it in [Claude Code](https://claude.ai/code)
3. Run `/set-me-up` — Claude walks you through Artifactory login, dependencies, and GitHub Pages
4. Run `/setup-mcps` — install the Figma MCP and UI5 MCP
5. Run `/start-prototype` — start the local dev server

## Skills

| Skill | What it does |
|---|---|
| `/set-me-up` | First-time setup after forking |
| `/setup-mcps` | Install Figma and UI5 MCP servers |
| `/start-prototype` | Start the local dev server |
| `/create-page` | Add a new page from templates |
| `/save-prototype` | Commit and push source changes |
| `/publish-prototype` | Build and publish to GitHub Pages |
| `/export-prototype` | Export a ZIP for usertesting |
| `/ps-check` | SAP Product Standards compliance check |

## Deploy

```bash
npm run build
git add docs/ src/
git commit -m "Your change"
git push origin main
```

GitHub Pages serves from the `docs/` folder on `main`. Always build before pushing.
