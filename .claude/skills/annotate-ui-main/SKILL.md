---
name: annotate-ui-main
description: Add callout annotations to prototype screens. Overlays numbered markers and a legend panel for design handoff and review.
---

This skill adds numbered callout annotations to any prototype page. Each annotation is a numbered circle marker placed over the page content, linked to a description in a collapsible legend panel. Used for design handoff, stakeholder walkthroughs, and review sessions.

Do not ask dev-related questions. Keep it simple — this prototype is used by designers and product managers.

---

## Step 1 — Check for the AnnotationLayer component

Check if `src/shared/components/feedback/AnnotationLayer.tsx` exists.

If it does NOT exist, create it with this exact content:

```tsx
import { useState } from 'react'
import { Button } from '@ui5/webcomponents-react'

export interface Annotation {
  id: number
  /** Percentage from left of the container (0–100) */
  x: number
  /** Percentage from top of the container (0–100) */
  y: number
  /** Short label shown in the legend header */
  label: string
  /** Full description shown in the legend body */
  description: string
}

interface AnnotationLayerProps {
  annotations: Annotation[]
  children: React.ReactNode
}

export default function AnnotationLayer({ annotations, children }: AnnotationLayerProps) {
  const [visible, setVisible] = useState(true)
  const [legendOpen, setLegendOpen] = useState(true)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}

      {/* Toggle button — fixed top-right */}
      <div style={{ position: 'fixed', top: 56, right: legendOpen && visible ? 332 : 16, zIndex: 1100, transition: 'right 0.2s ease' }}>
        <Button
          design={visible ? 'Emphasized' : 'Default'}
          icon={visible ? 'hide' : 'show'}
          onClick={() => setVisible(v => !v)}
          tooltip={visible ? 'Hide annotations' : 'Show annotations'}
        >
          {visible ? 'Annotations on' : 'Annotations off'}
        </Button>
      </div>

      {visible && (
        <>
          {/* Numbered markers */}
          {annotations.map(a => (
            <div
              key={a.id}
              title={a.label}
              style={{
                position: 'absolute',
                left: `${a.x}%`,
                top: `${a.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 1050,
                pointerEvents: 'none',
              }}
            >
              {/* Pulse ring */}
              <div style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                background: 'rgba(27, 144, 255, 0.18)',
                animation: 'hotspot-pulse-outer 2.4s ease-in-out infinite',
              }} />
              {/* Badge */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#1b90ff', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'72', Arial, sans-serif",
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
              }}>
                {a.id}
              </div>
            </div>
          ))}

          {/* Legend panel */}
          {legendOpen && (
            <div style={{
              position: 'fixed', top: 48, right: 0, bottom: 0, width: 320,
              background: 'var(--sapBaseColor, #fff)',
              borderLeft: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
              zIndex: 1040, overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Panel header */}
              <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 8,
                borderBottom: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
                fontFamily: "'72', Arial, sans-serif", fontWeight: 700, fontSize: 15,
                color: 'var(--sapTextColor, #1d2d3e)',
                flexShrink: 0,
              }}>
                Annotations
                <Button design="Transparent" icon="decline" onClick={() => setLegendOpen(false)} tooltip="Close" />
              </div>

              {/* Annotation entries */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {annotations.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                      background: '#1b90ff', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'72', Arial, sans-serif", fontSize: 13, fontWeight: 700,
                      marginTop: 1,
                    }}>
                      {a.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'72', Arial, sans-serif", fontWeight: 700, fontSize: 13,
                        color: 'var(--sapTextColor, #1d2d3e)', marginBottom: 4,
                      }}>
                        {a.label}
                      </div>
                      <div style={{
                        fontFamily: "'72', Arial, sans-serif", fontSize: 13,
                        color: 'var(--sapContent_LabelColor, #556b82)', lineHeight: '1.4',
                      }}>
                        {a.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reopen legend button when closed */}
          {!legendOpen && (
            <div style={{ position: 'fixed', top: 96, right: 16, zIndex: 1100 }}>
              <Button design="Default" icon="list" onClick={() => setLegendOpen(true)} tooltip="Show annotation legend" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

After creating the component, add it to the `shared/components/CLAUDE.md` table:

```
| `feedback/AnnotationLayer.tsx` | Numbered callout markers + legend panel for design annotation/handoff | annotation-enabled pages |
```

---

## Step 2 — Identify the page to annotate

Ask (plain text, no AskUserQuestion):

> **Which page do you want to annotate?**
> Reply with the route (e.g. `/home`, `/repository`) or the filename (e.g. `Home.tsx`).

Wait for the reply, then find the page component file in `src/domains/`.

---

## Step 3 — Collect annotations

Ask (plain text, no AskUserQuestion):

> **List each element you want to annotate.** For each one, provide:
> - A short label (e.g. "Process List")
> - A description (e.g. "All processes are listed here, sortable by name or last modified date")
> - Where it sits on screen: describe it naturally (e.g. "top navigation bar", "center of the page", "save button in the bottom bar", "left sidebar")
>
> Example: **1. Header bar** — "The main toolbar provides access to create, filter, and export actions." (top of page)

Wait for the user's reply. From the natural-language positions, translate to approximate `x` / `y` percentages using this guide:

| Description | Approx x% | Approx y% |
|---|---|---|
| Top-left | 10 | 8 |
| Top-center | 50 | 8 |
| Top-right | 90 | 8 |
| Left sidebar | 6 | 50 |
| Center of page | 50 | 50 |
| Bottom bar / footer | 50 | 92 |
| Right panel | 90 | 40 |
| Table header row | 50 | 28 |
| First row of a list/table | 50 | 38 |
| Filter bar | 50 | 20 |
| Page title / breadcrumb | 25 | 12 |

Adjust values to avoid overlapping markers when multiple annotations are nearby — stagger them by ±5%.

---

## Step 4 — Apply annotations to the page

Read the page component file. Then:

1. **Add the import** at the top:
   ```tsx
   import AnnotationLayer, { type Annotation } from '../../shared/components/feedback/AnnotationLayer'
   ```
   Adjust the relative path to match the file's depth under `src/domains/<domain>/`.

2. **Define the annotations array** just above the return statement (or as a module-level constant if the component has no state):
   ```tsx
   const ANNOTATIONS: Annotation[] = [
     { id: 1, x: 50, y: 8,  label: 'Header Bar',   description: 'The main toolbar provides access to create, filter, and export actions.' },
     { id: 2, x: 10, y: 50, label: 'Left Sidebar',  description: 'Navigation between process groups and favorites.' },
     // ... one entry per annotation
   ]
   ```

3. **Wrap the outermost JSX element** returned by the component with `<AnnotationLayer annotations={ANNOTATIONS}>`:
   ```tsx
   return (
     <AnnotationLayer annotations={ANNOTATIONS}>
       {/* existing page JSX unchanged */}
     </AnnotationLayer>
   )
   ```
   Do NOT restructure the page content — just wrap the outermost element.

---

## Step 5 — Done

Tell the user:

> **Annotations added!** Open the page in the prototype to see the numbered markers.
>
> - Click **"Annotations on/off"** (top-right) to toggle visibility.
> - Click **×** on the legend panel to collapse it.
>
> To adjust marker positions, edit the `x` / `y` values in the `ANNOTATIONS` array in `src/domains/<domain>/<PageName>.tsx` (0 = left/top edge, 100 = right/bottom edge of the page content area).
>
> To remove annotations entirely, unwrap `<AnnotationLayer>` and delete the import and `ANNOTATIONS` array.
