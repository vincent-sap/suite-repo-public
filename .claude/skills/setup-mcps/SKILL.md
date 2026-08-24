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

Ask first:

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
SKILLS_DIR=".claude/skills"
FIGMA_SKILLS="figma-design-to-code figma-use figma-generate-design figma-use-figjam figma-generate-diagram"
BASE_URL="https://api.github.com/repos/figma/mcp-server-guide/contents/skills"

for skill in $FIGMA_SKILLS; do
  echo "Downloading $skill..."
  # Recursively download skill files via GitHub API
  python3 - <<PYEOF
import urllib.request, json, os, pathlib

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "curl/7.0"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def download_dir(api_url, local_dir):
    pathlib.Path(local_dir).mkdir(parents=True, exist_ok=True)
    for item in fetch(api_url):
        if item["type"] == "file" and item["download_url"]:
            req = urllib.request.Request(item["download_url"], headers={"User-Agent": "curl/7.0"})
            with urllib.request.urlopen(req) as r:
                content = r.read()
            with open(os.path.join(local_dir, item["name"]), "wb") as f:
                f.write(content)
        elif item["type"] == "dir":
            download_dir(item["url"], os.path.join(local_dir, item["name"]))

download_dir("$BASE_URL/$skill", "$SKILLS_DIR/$skill")
print("  done")
PYEOF
done
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

## Step 5b — UI5 MCP: Install the MCP server

Run this to add the UI5 MCP to your user-level Claude config (token stays private, never in the repo):

```bash
claude mcp add ui5 \
  --scope user \
  -e MCP_UI5_GITHUB_TOKEN=$MCP_UI5_GITHUB_TOKEN \
  -- npx -y @sap-signavio/sap-ui5-webcomponents-mcp@latest 2>&1
```

If this fails:
- With `MCP_UI5_GITHUB_TOKEN is not set` → the token wasn't exported correctly. Ask the user to open a new terminal tab, run `source ~/.zshrc`, then restart Claude Code.
- With a 401/403 error → the token may not have `repo` scope. Ask them to create a new token with `repo` access.
- With any other error → show the error and suggest they try again after restarting Claude Code.

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
