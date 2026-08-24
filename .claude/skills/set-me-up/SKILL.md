---
name: set-me-up
description: First-time setup after forking this prototype. Sets up SAP Artifactory, installs dependencies, and installs the team's security guidelines. Run this once after cloning.
---

# Set me up

Welcome! This skill sets up everything you need to start working on and sharing this prototype.

Be encouraging and non-technical. This prototype is used by designers and product managers — avoid dev jargon.

## Step 1 — Welcome

Greet the user:

> Welcome! I'll get this prototype ready to run in a few minutes.

Then ask:

```
AskUserQuestion({
  questions: [
    {
      question: "Have you already logged in to SAP Artifactory? (Required to install packages)",
      header: "Artifactory",
      multiSelect: false,
      options: [
        { label: "Yes, I'm logged in", description: "Go straight to install" },
        { label: "No, I need to log in", description: "I'll show you the commands" }
      ]
    }
  ]
})
```

---

## Step 2 — Artifactory login (if needed)

If the user is not logged in, tell them to run these commands in a **new terminal tab** (not inside Claude Code), then come back:

```
npm login --registry=https://common.repositories.cloud.sap/artifactory/api/npm/signavio-npm-releases/ --scope=@signavio
npm login --registry https://common.repositories.cloud.sap/artifactory/api/npm/3rd-party-npm-proxy/
npm config set registry https://common.repositories.cloud.sap/artifactory/api/npm/3rd-party-npm-proxy/
```

Ask them to confirm when done:

```
AskUserQuestion({
  questions: [{
    question: "Done logging in to Artifactory?",
    header: "Artifactory",
    multiSelect: false,
    options: [
      { label: "Yes, I'm logged in now", description: "Continue with setup" },
      { label: "I'll do it later", description: "Stop here for now" }
    ]
  }]
})
```

If "I'll do it later", stop.

---

## Step 3 — Install dependencies

```bash
npm install
```

If this fails with a 401/403 error, remind the user to complete the Artifactory login from Step 2.

---

## Step 4 — Install security guidelines

Install the team's AI security skill directly from GitHub (never copied into this repo):

```bash
SKILL_DIR="$HOME/.claude/skills/security-guidelines"
mkdir -p "$SKILL_DIR"
curl -fsSL "https://raw.githubusercontent.tools.sap/signavio-experience/SKILL-security-guidelines/main/SKILL.md" \
  -o "$SKILL_DIR/SKILL.md" \
  -H "Authorization: token $(gh auth token --hostname github.tools.sap 2>/dev/null || echo '')" \
  2>&1
```

If the download fails, tell the user:
> "I couldn't install the security guidelines automatically. You can do it manually later:
> `gh api --hostname github.tools.sap repos/signavio-experience/SKILL-security-guidelines/contents/SKILL.md --jq '.content' | base64 -d > ~/.claude/skills/security-guidelines/SKILL.md`"

Continue regardless.

---

## Step 5 — Check if repo is already on GitHub

```bash
git remote get-url origin 2>/dev/null || echo "no-remote"
```

**If a remote exists** (the user forked the repo — most common case):

Extract **ORG**, **REPO**, **GITHUB_HOST** from the remote URL.
Set **PAGES_URL** = `https://pages.GITHUB_HOST/ORG/REPO/`

Tell the user:
> "Your repo is already on GitHub at: `https://GITHUB_HOST/ORG/REPO`"

Skip to Step 6 (GitHub Pages check).

**If no remote exists** (cloned from ZIP, or local only):

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Where should this prototype live?",
    header: "GitHub",
    multiSelect: false,
    options: [
      { label: "signavio-experience org (Recommended)", description: "Your whole team can find and contribute — GitHub Pages is publicly accessible either way" },
      { label: "My personal account", description: "For quick experiments you don't want cluttering the shared org" },
      { label: "Keep it local only", description: "No GitHub — just run it on my computer" }
    ]
  }]
})
```

If "Keep it local only": skip to Step 7 (Done, local variant).

Otherwise continue with Step 5b.

### Step 5b — Create GitHub repo

Ask for a repo name (suggest the current folder name as default).

If **signavio-experience org**:
- **PAGES_URL** = `https://pages.github.tools.sap/signavio-experience/REPO/`
- **VITE_BASE** = `/signavio-experience/REPO/`

If **personal account**: ask for their SAP User-ID (starts with I + 6 digits), then:
- **PAGES_URL** = `https://pages.github.tools.sap/USER_ID/REPO/`
- **VITE_BASE** = `/USER_ID/REPO/`

Update `vite.config.ts`: set `base` to **VITE_BASE** (keep `build.outDir: 'docs'`).

Check if `gh` is installed:
```bash
gh --version 2>/dev/null && echo "ok" || echo "missing"
```
If missing: `brew install gh`, then `gh auth login --hostname github.tools.sap`.

**For signavio-experience org:**
```bash
gh repo create signavio-experience/REPO --internal --source=. --remote=origin --push \
  --hostname github.tools.sap
```

If 403 (no org access): fall back to personal account and tell the user to ask their GitHub admin for org access later.

**For personal account:**
```bash
gh repo create REPO --private --source=. --remote=origin --push \
  --hostname github.tools.sap
```

---

## Step 6 — GitHub Pages check

Tell the user to do this one-time manual step if they haven't already:

1. Open `https://GITHUB_HOST/ORG/REPO/settings/pages`
2. Under **Build and deployment → Source**: select **Deploy from a branch**
3. Set **Branch** to `main`, **Folder** to `/docs`, click **Save**

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Have you set up GitHub Pages already?",
    header: "GitHub Pages",
    multiSelect: false,
    options: [
      { label: "Yes, it's set up", description: "Continue" },
      { label: "Not yet", description: "I'll do it now and come back" },
      { label: "Skip for now", description: "I'll set it up later" }
    ]
  }]
})
```

If "Not yet": wait, then ask again. If "Skip for now": continue.

---

## Step 7 — Update README

Ask the user for a short description:

```
AskUserQuestion({
  questions: [{
    question: "Give this prototype a short description for the README?",
    header: "README",
    multiSelect: false,
    options: [
      { label: "Skip for now", description: "I'll update the README later" }
    ]
  }]
})
```

Whether or not the user adds a description, always update the README in the same commit — replace the placeholder link with the real Pages URL, and insert the description if provided:

```bash
sed -i '' "s|PAGES_URL_PLACEHOLDER|PAGES_URL|g" README.md
# if description provided, also update the description line
git add README.md
git commit -m "Update README"
git push origin main 2>&1
```

If "local only" was chosen: skip this step entirely.

---

## Step 8 — Done

**If on GitHub:**

> **You're all set!**
>
> - `/setup-mcps` — set up Figma and UI5 MCP servers (recommended next step)
> - `/start-prototype` — start the dev server and begin building
> - `/create-page` — add a new page to the prototype
> - `/publish-prototype` — share your latest changes at: **PAGES_URL**

**If local only:**

> **You're all set!**
>
> - `/setup-mcps` — set up Figma and UI5 MCP servers (recommended next step)
> - `/start-prototype` — start the dev server and begin building
> - `/create-page` — add a new page to the prototype
