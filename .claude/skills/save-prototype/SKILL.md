---
name: save-prototype
description: Commit all local changes and push to GitHub — without building. Use this to save source changes only.
---

Upload local changes to GitHub — commits any changed files and pushes to `main`.

## Step 1 — Detect repo

```bash
git remote get-url origin 2>&1
```

Extract from the remote URL (e.g. `https://github.tools.sap/signavio-experience/explorer-sunset`):
- **GITHUB_HOST** (e.g. `github.tools.sap`)
- **ORG** (e.g. `signavio-experience`)
- **REPO** (e.g. `explorer-sunset`)
- **PAGES_URL** = `https://pages.GITHUB_HOST/ORG/REPO/`

If there is no git remote, stop:
> "This repo isn't on GitHub yet — there's nothing to push to. Run `/set-me-up` to set up a GitHub repo first."

## Step 2 — Check for changes

```bash
git status --short 2>&1
```

Do not show raw output — translate changed files into a plain-language summary, e.g. "I found changes to your homepage and two component files."

If there are no changes at all, print:
> "Nothing to upload — no local changes found."

and stop.

## Step 3 — Ask for commit message

Derive a suggested message from the changed file names. Use `AskUserQuestion` to confirm:

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

If the user selects "Cancel", stop immediately.

## Step 4 — Commit and push

```bash
git add -A
git commit -m "<confirmed message>" && git push origin main 2>&1
```

## Step 5 — Confirm

If `docs/` was included in the commit:

**Uploaded! GitHub Pages will update at:** [PAGES_URL](PAGES_URL)

(Usually takes 1–2 minutes to rebuild.)

Otherwise:

**Uploaded to GitHub.**
