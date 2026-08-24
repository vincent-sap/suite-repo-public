---
name: publish-prototype
description: Build and publish to GitHub Pages in one go — combines build + commit + push. Use this when you're ready to share an update.
---

Build the prototype and publish it to GitHub Pages.

## Step 1 — Detect repo

```bash
git remote get-url origin 2>&1
```

Extract from the remote URL:
- **GITHUB_HOST**, **ORG**, **REPO**
- **PAGES_URL** = `https://pages.GITHUB_HOST/ORG/REPO/`

If there is no git remote, stop:
> "This repo isn't on GitHub yet. Run `/set-me-up` to set up a GitHub repo and GitHub Pages first."

## Step 2 — Check if GitHub Pages is configured

```bash
git log --oneline -1 -- docs/ 2>&1
```

If no output (first publish ever), tell the user:

> This looks like the first publish. GitHub Pages needs to be pointed at the right place first.
>
> Open [https://GITHUB_HOST/ORG/REPO/settings/pages](https://GITHUB_HOST/ORG/REPO/settings/pages), set the branch to **main** and folder to **/docs**, then click **Save**.

Ask via `AskUserQuestion` before continuing:

```
AskUserQuestion({
  questions: [{
    question: "Ready to continue?",
    header: "Pages setup",
    multiSelect: false,
    options: [
      { label: "Proceed", description: "Pages is configured — continue" },
      { label: "Cancel", description: "Stop so I can configure GitHub Pages first" }
    ]
  }]
})
```

## Step 3 — Build

```bash
npm run build 2>&1
```

If the build fails, print the errors and stop.

After the build, verify `docs/index.html` exists.

## Step 4 — Check if docs/ actually changed

```bash
git diff --name-only origin/main -- docs/ 2>/dev/null
git status --short -- docs/ 2>/dev/null
```

If both return no output:
> "The build produced no changes — the current version is already live at: [PAGES_URL](PAGES_URL)"

Stop.

## Step 5 — Ask for commit message

Derive a suggested message from any changed source files, or use `"Publish"` if only `docs/` changed.

Use `AskUserQuestion` to confirm:

```
AskUserQuestion({
  questions: [{
    question: "Commit message?",
    header: "Commit msg",
    multiSelect: false,
    options: [
      { label: "<suggested message>", description: "Confirm and proceed" },
      { label: "Cancel", description: "Stop — don't commit or push" }
    ]
  }]
})
```

## Step 6 — Commit and push

```bash
git add -A
git commit -m "<confirmed message>" && git push origin main 2>&1
```

## Step 7 — Confirm

**Published! GitHub Pages will update at:** [PAGES_URL](PAGES_URL)

(Usually takes 1–2 minutes to rebuild.)
