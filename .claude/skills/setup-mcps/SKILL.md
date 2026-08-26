---
name: setup-mcps
description: Set up MCP servers for this prototype — Figma MCP and the UI5/Signavio MCP. Run this once after set-me-up.
---

# Set up MCP servers

Be friendly and non-technical. Guide the user step by step.

---

## Step 1 — Welcome

Ask which MCPs the user wants to set up:

```
AskUserQuestion({
  questions: [{
    question: "Which MCP servers would you like to set up?",
    header: "MCP servers",
    multiSelect: true,
    options: [
      {
        label: "Figma MCP",
        description: "Lets Claude read your Figma designs directly. Only install if you actively work with Figma — it adds ~20 tool schemas to every conversation."
      },
      {
        label: "UI5 MCP",
        description: "Lets Claude look up UI5 and Signavio component APIs. Recommended for everyone building with this prototype."
      }
    ]
  }]
})
```

Continue with the selected steps. If neither is selected, tell the user they can re-run `/setup-mcps` any time.

---

## Step 2 — Figma MCP (if selected)

### Step 2a — Install Figma skills

First check if Figma skills are already installed:

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

If not installed or "Yes, update":

```bash
rm -rf /tmp/figma-mcp-guide
git clone --depth 1 https://github.com/figma/mcp-server-guide.git /tmp/figma-mcp-guide 2>&1
cp -r /tmp/figma-mcp-guide/skills/. .claude/skills/
rm -rf /tmp/figma-mcp-guide
```

If the download fails, tell the user they can skip and re-run `/setup-mcps` later.

### Step 2b — Install Figma MCP server

Tell the user:

> **Installing Figma MCP**
>
> Follow the setup instructions here:
> https://portal.hyperspace.tools.sap/workspaces/hyperspace-mcp-registry-pilots/ai-mcp-registry/com.figma.mcp%2Fmcp
>
> Go to **Setup → Setup for Claude**.
>
> **Tip:** The Figma MCP adds significant context overhead. Disable it when you're not actively working with Figma:
> ```
> claude mcp disable figma
> ```
> Re-enable when needed:
> ```
> claude mcp enable figma
> ```

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Done installing Figma MCP?",
    header: "Figma MCP",
    multiSelect: false,
    options: [
      { label: "Yes, done", description: "Continue" },
      { label: "Skip for now", description: "I'll set it up later" }
    ]
  }]
})
```

---

## Step 3 — UI5 MCP (if selected)

### Step 3a — Check Node.js version

```bash
node --version 2>&1
```

The UI5 MCP requires Node.js **≥ 20.17.0** or **≥ 22.9.0**. If below that, tell the user to update at https://nodejs.org (LTS) and re-run this skill after.

### Step 3b — GitHub token

Tell the user:

> The UI5 MCP needs a GitHub token to access component data from the internal SAP GitHub. Here's how to create one:
>
> 1. Open: https://github.tools.sap/settings/tokens
> 2. Click **"Generate new token"** → **"Generate new token (classic)"**
> 3. Give it any name (e.g. "UI5 MCP")
> 4. Tick **`repo`** under Select scopes
> 5. Click **"Generate token"** — copy it, you'll only see it once

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Do you have your GitHub token ready?",
    header: "GitHub token",
    multiSelect: false,
    options: [
      { label: "Yes, I have it", description: "Continue" },
      { label: "Skip for now", description: "I'll run /setup-mcps again later" }
    ]
  }]
})
```

If "Skip for now", jump to Step 4.

### Step 3c — Add token to shell profile

Tell the user to run this in a **new terminal tab**, replacing `YOUR_TOKEN`:

```
echo 'export MCP_UI5_GITHUB_TOKEN=YOUR_TOKEN' >> ~/.zshrc && source ~/.zshrc
```

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Done adding the token?",
    header: "Shell token",
    multiSelect: false,
    options: [
      { label: "Yes, done", description: "Continue" },
      { label: "Skip for now", description: "I'll set it up later" }
    ]
  }]
})
```

If "Skip for now", jump to Step 4.

### Step 3d — Install via plugin

Tell the user to open a terminal, type `claude`, and run:

```
/plugin marketplace add https://github.tools.sap/SAP-Signavio-T-A/signavio-plugin.git
```
then:
```
/plugin install ui5-webcomponents
```

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

## Step 4 — Done

Tell the user what's set up and remind them about the Figma MCP context tip:

> **MCP setup complete!** Restart Claude Code to activate.
>
> **Tip:** Disable the Figma MCP when not working with Figma to keep context lean:
> ```
> claude mcp disable figma
> ```

If anything was skipped:
> Run `/setup-mcps` again to install the parts you skipped.
