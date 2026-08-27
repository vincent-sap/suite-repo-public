# panels — SuiteContextPanel usage

`SuiteContextPanel.tsx` exports the right-hand context panel used in the modeler.
It is two pieces that share the same `activePanel` state:

- **`SuiteContextRail`** — the thin always-visible icon rail on the far right.
  One icon per entry in the `PANELS` registry (grouped into section 1 / 2).
- **`SuiteContextPanelContent`** — the wide panel that opens when a rail icon is
  active. Renders `null` when `activePanel` is `null`.

Both take `activePanel` + `onTogglePanel`. The consumer (e.g. `ModelerLayout`)
owns that state and passes it to both.

## The `renderPanel` slot — how to plug in your own panels

`SuiteContextPanelContent` must NOT import domain code (repository, etc.) — that
would couple `shared/` to a domain. Instead it asks the consumer for panel
content via an optional `renderPanel(id)` prop.

Resolution order inside `SuiteContextPanelContent`:

1. `renderPanel(activePanel)` is called first. **If it returns something, that
   wins** — your panel, your `SigRightSidePanel`, your header actions, your title.
2. Otherwise it falls back to the built-in panels shared knows about:
   `joule-chat` → `JouleChatPanel`, `comments` → `CommentsTab`, and a generic
   placeholder for the rest.

So "optionally supply your own panel" is already the model: return content for
the ids you own, return `null`/`undefined` for the ones you want the default.

### Example: consumer supplies domain panels (from ModelerLayout)

```tsx
const renderPanel = (id: string) => {
  if (id === 'diagram-attributes') {
    const asset = makeMockAsset(assetId)          // uses repository's SelectedAssetInfo
    return <AssetInfoPanel externalSelectedAsset={asset} onClose={() => togglePanel(null)} /* … */ />
  }
  if (id === 'atoms') {
    return <AtomsPanel onClose={() => togglePanel(null)} />
  }
  return null   // everything else → shared default (Joule, Comments, placeholder)
}

<SuiteContextPanelContent
  activePanel={activePanel}
  onTogglePanel={togglePanel}
  renderPanel={renderPanel}
  pendingMessage={pendingMessage}
  onPendingConsumed={() => setPendingMessage(null)}
/>
```

### Example: override a built-in panel to add header actions

Want the Comments panel to have header actions? Don't change shared — return
your own panel for `comments` and set `contentActionsSlot` yourself:

```tsx
if (id === 'comments') {
  return (
    <SigRightSidePanel
      headerTitle="Comments"
      isOpen
      toggleRightSidePanel={() => togglePanel(null)}
      contentActionsSlot={[/* your action components */]}
      style={{ width: '100%', height: '100%', maxWidth: 'none' }}
    >
      <CommentsTab />
    </SigRightSidePanel>
  )
}
```

`SigRightSidePanel` (uixtension) offers more slots you control this way:
`contentActionsSlot`, `subHeaderSlot`, `tabSlot`, `navigationSlot`, `titleSlot`,
`footerArea`. Query its full API in `node_modules/@signavio/sap-signavio-uixtension`
before use — don't guess prop names.

## Adding a panel to the rail

The rail icons come from the `PANELS` array at the top of `SuiteContextPanel.tsx`
(id, label, icon, section). Add an entry there, then handle its `id` in your
`renderPanel` (or let it fall through to the placeholder). The `PANELS` list is
currently hard-coded in shared — if a second domain ever needs a *different* set
of rail icons, lift `PANELS` to a prop too.
