# Suite Replica

A forkable high-fidelity prototype of the SAP Signavio Suite — built for designers and product managers to explore, extend, and hand off to engineers. No engineering background needed to get started.

Built with [UI5 Web Components for React](https://sap.github.io/ui5-webcomponents-react/) and [SAP Signavio UIxtension](https://www.npmjs.com/package/@signavio/sap-signavio-uixtension).

> ⚠️ **This is an AI-generated prototype.** The code was written by AI, is **not production-ready**, and has **not been properly reviewed by humans**. Use it for exploration and design hand-off only — never as a basis for production code.

<div align="center">
  <br>
  <a href="https://pages.github.tools.sap/D062098/suite-replica-vinc" target="_blank">
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

## Before you start — required access

Make sure you have the following CAM profiles before setting up. Request them at [cam.int.sap/cam/ui/admin?item=request](https://cam.int.sap/cam/ui/admin?item=request)

| CAM profile | Why |
|---|---|
| [`CAM_PROD_ARTIFACTORY_INT`](https://cam.int.sap/cam/ui/admin?item=request&profile_uuid=FA163E0449A61EDFB5FE99B36CAF6FDC) | Install packages from SAP's package registry |
| [`CAM_PROD_ARTIFACTORY`](https://cam.int.sap/cam/ui/admin?item=request&profile_uuid=00163EB4A6991EEBB59DD3147B2A57E4) | Install packages from SAP's package registry |
| [`BPI Signavio Github Process Manager Developer`](https://cam.int.sap/cam/ui/admin?item=request&profile_uuid=FA163EF13B451EEFBED2AE491C91D327) | Access UIxtension components in the UI5 MCP |

## Getting started

1. Fork this repo on [github.tools.sap](https://github.tools.sap/signavio-experience/suite-replica)
2. Open VSCode and press **"Clone Git Repository"** — paste your fork URL and choose a folder
   - Alternatively: create an empty folder, open a terminal in it and run `gh repo clone github.tools.sap/<your-forked-repo> .`
3. Open the cloned folder in [Claude Code](https://claude.ai/code)
4. Run `/set-me-up` — Claude walks you through Artifactory login, dependencies, and GitHub Pages
5. Run `/setup-mcps` — install the Figma MCP and UI5 MCP
6. Run `/start-prototype` — start the local dev server

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

---

## Initial setup

New to Claude Code? Do this once before anything else.

**Install these apps:**

- [VSCode](https://code.visualstudio.com/download) — code editor
- [Python](https://www.python.org/downloads/) — helps Claude Code make script-based changes
- [Node.js](https://nodejs.org/en/download) — includes npm, which installs packages
- [Homebrew](https://brew.sh/) (Mac only) — package manager, needed to install Git
- [Git](https://git-scm.com/install/) — version control
- [Hyperspace AI](https://ai-docs.portal.hyperspace.tools.sap/llm-proxy/installation/desktop-app/) — SAP's AI proxy (see Getting Started in the linked docs)
- [Claude Code](https://code.claude.com/docs/en/setup#native-install-recommended) — AI coding assistant

**Log in to Git:**

Open a terminal and run:
```
gh auth login --hostname github.tools.sap
```

**Start the Hyperspace AI app** before using Claude Code.

**Set up your Claude environment** following the [Hyperspace AI + Claude guide](https://ai-docs.portal.hyperspace.tools.sap/llm-proxy/recipes/claude/).
