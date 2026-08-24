---
name: export-prototype
description: Build a self-contained, offline HTML prototype ZIP for sharing or usability testing.
---

Build a self-contained prototype ZIP (`prototype.zip`) — all assets inlined, works on `file://` and any web server. Output lives in `prototype-export/` (gitignored, never committed).

## Step 1 — Confirm

Output to the user:

> This skill will:
> 1. Create a `prototype-export/` folder (gitignored, never committed)
> 2. Build the prototype with self-contained asset paths
> 3. Create **prototype.zip**, ready to share or upload to usertesting.com
>
> Your source files are not changed.

Ask:

```
AskUserQuestion({
  questions: [{
    question: "Ready to export?",
    header: "Export",
    multiSelect: false,
    options: [
      { label: "Export", description: "Run the build and create prototype.zip" },
      { label: "Cancel", description: "Stop" }
    ]
  }]
})
```

If "Cancel", stop.

## Step 2 — Update .gitignore

```bash
grep -qxF 'prototype-export/' .gitignore 2>/dev/null || echo 'prototype-export/' >> .gitignore
```

## Step 3 — Build

Write `prototype-export/vite.config.export.ts`:

```ts
import { defineConfig } from 'vite'
import baseConfig from '../vite.config'

export default defineConfig({
  ...baseConfig,
  base: './',
  build: {
    ...baseConfig.build,
    outDir: 'prototype-export/prototype-source',
    emptyOutDir: true,
  },
})
```

Then build:

```bash
npx vite build --config prototype-export/vite.config.export.ts 2>&1
```

If the build fails, print the errors and stop.

Verify `prototype-export/prototype-source/index.html` exists.

## Step 4 — Write build-info.txt

```bash
date && git rev-parse --short HEAD 2>/dev/null && git rev-parse --abbrev-ref HEAD 2>/dev/null
```

Write `prototype-export/build-info.txt`:
```
Built:  <datetime>
Commit: <short hash>
Branch: <branch name>
```

## Step 5 — ZIP

```bash
cd prototype-export/prototype-source && zip -r ../prototype.zip . 2>&1
```

Verify `prototype-export/prototype.zip` exists.

## Step 6 — Done

**Export complete.**

- **prototype.zip** — upload to usertesting.com, or share directly
- Test locally: open `prototype-export/prototype-source/index.html`

The `prototype-export/` folder is excluded from version control.

---

**Note:** If your prototype has annotations or items testers should not see, hide them before exporting — wrap JSX with `{false && ...}` to keep the code intact.
