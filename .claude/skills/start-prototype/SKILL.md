---
name: start-prototype
description: Start the local dev server for this prototype. Installs dependencies if needed, frees the port, and opens the localhost link.
---

Start the Vite dev server for this prototype.

## Step 1 — Find the port

Read `vite.config.ts` in the current working directory. Extract the `server.port` value. If no port is configured, use **5173**.

## Step 2 — Check dependencies

Output: `Checking dependencies…`

```bash
ls node_modules 2>/dev/null | head -1
```

If the result is empty, output `Installing dependencies…` then run:

```bash
npm install
```

Wait for it to finish before continuing.

## Step 3 — Free the port

```bash
lsof -ti:PORT | xargs kill -9 2>/dev/null || true
```

## Step 4 — Start the server

Output: `Starting dev server…`

```bash
npm run dev -- --port PORT 2>&1 1>/dev/null &
```

## Step 5 — Done

Output this line immediately (correct port, nothing else):

**Click the link to start the prototype:** [http://localhost:PORT](http://localhost:PORT)
