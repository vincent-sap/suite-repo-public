---
name: setup-mcps
description: Install the MCP servers and skills needed for this prototype — Figma MCP and the UI5/Signavio MCP. Run this once after set-me-up.
---

# Set up MCP servers

This installs two MCP servers and downloads the latest Figma skills. Run this once after `/set-me-up`.

Be friendly and non-technical. Guide the user step by step.

---

## Step 1 — Welcome

Tell the user:

> I'll set up two tools that make working with Figma and UI5 components much easier:
>
> 1. **Figma MCP** — lets Claude read your Figma designs directly
> 2. **UI5 MCP** — lets Claude look up UI5 and Signavio components
>
> The Figma MCP is already configured for this project. The UI5 MCP needs a GitHub token — I'll walk you through it.

---

## Step 2 — Install Figma skills

First, check if Figma skills are already installed:

```bash
ls .claude/skills/figma-use 2>/dev/null && echo "installed" || echo "missing"
```

If already installed, ask:

```
AskUserQuestion({
  questions: [{
    question: "Figma skills are already installed. Update them to the latest version?",
    header: "Figma skills",
    multiSelect: false,
    options: [
      { label: "Yes, update", description: "Pull the latest version from Figma" },
      { label: "Skip", description: "Keep the current version" }
    ]
  }]
})
```

If not installed, ask:

```
AskUserQuestion({
  questions: [{
    question: "Download the latest Figma skills? These teach Claude how to read your Figma designs, build screens from components, and create diagrams — always pulled fresh so they stay up to date.",
    header: "Figma skills",
    multiSelect: false,
    options: [
      { label: "Yes, download", description: "Includes: design-to-code, use Figma, generate design, FigJam, diagrams" },
      { label: "Skip", description: "I don't need Figma skills right now" }
    ]
  }]
})
```

If "Skip", jump to Step 3.

Download the latest Figma skills from the official Figma repository:

```bash
rm -rf /tmp/figma-mcp-guide
git clone --depth 1 https://github.com/figma/mcp-server-guide.git /tmp/figma-mcp-guide 2>&1
cp -r /tmp/figma-mcp-guide/skills/. .claude/skills/
rm -rf /tmp/figma-mcp-guide
```

If the download fails (network issue), tell the user they can skip this for now and re-run `/setup-mcps` later.

---

## Step 3 — UI5 MCP: Check Node.js version

```bash
node --version 2>&1
```

The UI5 MCP requires Node.js **≥ 20.17.0** or **≥ 22.9.0**. Check the version:
- If the version is below 20.17.0, tell the user to update Node.js at https://nodejs.org (LTS version) and re-run this skill after updating.
- Otherwise, continue.

---

## Step 4 — UI5 MCP: GitHub token

Tell the user:

> The UI5 MCP needs a GitHub token to access component data from the internal SAP GitHub. Here's how to create one:
>
> 1. Open a **new browser tab** and go to: https://github.tools.sap/settings/tokens
> 2. Click **"Generate new token"** → **"Generate new token (classic)"**
> 3. Give it any name (e.g. "UI5 MCP")
> 4. Under **Select scopes**, tick **`repo`**
> 5. Click **"Generate token"** at the bottom
> 6. **Copy the token** — you'll only see it once

Ask the user to confirm when they have the token:

```
AskUserQuestion({
  questions: [{
    question: "Do you have your GitHub token ready?",
    header: "GitHub token",
    multiSelect: false,
    options: [
      { label: "Yes, I have it", description: "Continue with setup" },
      { label: "Skip for now", description: "I'll run /setup-mcps again later" }
    ]
  }]
})
```

If "Skip for now", jump to Step 6.

---

## Step 5 — UI5 MCP: Add token to shell profile

Tell the user:

> I need to add the token to your shell so the MCP server can use it. Open a **new terminal tab** (outside Claude Code) and run this command — replace `YOUR_TOKEN` with the token you just copied:

```
echo 'export MCP_UI5_GITHUB_TOKEN=YOUR_TOKEN' >> ~/.zshrc && source ~/.zshrc
```

> After running it, come back here and confirm.

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Done adding the token to your shell?",
    header: "Shell token",
    multiSelect: false,
    options: [
      { label: "Yes, done", description: "Continue" },
      { label: "Skip for now", description: "I'll set it up later" }
    ]
  }]
})
```

If "Skip for now", jump to Step 6.

---

## Step 5b — UI5 MCP: Install via plugin

Tell the user:

> Now we'll install the UI5 MCP. This gives Claude direct access to UI5 and Signavio component docs — so it always uses the right APIs when building your prototype.
>
> Open a terminal, type `claude`, and enter these two commands one by one:
>
> ```
> /plugin marketplace add https://github.tools.sap/SAP-Signavio-T-A/signavio-plugin.git
> ```
> ```
> /plugin install ui5-webcomponents
> ```

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Done installing the UI5 MCP?",
    header: "UI5 MCP",
    multiSelect: false,
    options: [
      { label: "Yes, done", description: "Continue" },
      { label: "Skip for now", description: "I'll set it up later" }
    ]
  }]
})
```

---

## Step 6 — Done

Tell the user what's installed:

> **MCP setup complete!**
>
> Restart Claude Code to activate the new servers, then you'll have:

If Figma skills downloaded successfully:
> - **Figma MCP** — use `/figma-design-to-code`, `/figma-use` and other Figma skills to work with your designs
> - **Figma skills** — updated to the latest version

If UI5 MCP was installed:
> - **UI5 MCP** — Claude can now look up UI5 web components and Signavio UIxtension components directly

If anything was skipped:
> Run `/setup-mcps` again to install the parts you skipped.
