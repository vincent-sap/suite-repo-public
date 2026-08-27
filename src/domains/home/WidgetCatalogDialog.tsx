import { useState, useRef } from 'react'
import { Dialog, Button, Icon, Title, Bar, List, ListItemCustom } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { MyTasksWidget, buildMyTasksPreviewGroups } from './widgets/MyTasksWidget'
import { QuickLinksWidget, buildQuickLinksPreviewItems } from './widgets/QuickLinksWidget'
import type { WidgetType } from './widgets/types'
import './WidgetCatalogDialog.css'

interface CatalogItem {
  id: WidgetType
  label: string
  icon: string
  description: string
  /** If false, multiple instances are allowed and the Add button is never disabled. */
  singleton: boolean
}

export const WIDGET_LABELS: Record<WidgetType, string> = {
  favorites: 'Favorites',
  recentlyViewed: 'Recently Viewed',
  quickLinks: 'Quick Links',
  tasks: 'My Tasks',
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'quickLinks',
    label: 'Quick Links',
    icon: 'SAP-icons-v4/link',
    description: 'Shows useful links to third-party systems, with descriptions.',
    singleton: false,
  },
  // Favorites and Recently Viewed are pinned on the homepage and not addable via catalog
  // Task widget was postponed 2026-04-21 — kept in code but removed from catalog
  // {
  //   id: 'tasks',
  //   label: 'My Tasks',
  //   icon: 'task',
  //   description: 'Shows your tasks by due date, with a link to view details.',
  //   singleton: true,
  // },
]

interface WidgetCatalogDialogProps {
  open: boolean
  /** Types of widgets currently on the page. */
  activeWidgetTypes: Set<WidgetType>
  onAdd: (widgetType: WidgetType) => void
  onConfigure: () => void
  onClose: () => void
}

export function WidgetCatalogDialog({ open, activeWidgetTypes, onAdd, onConfigure, onClose }: WidgetCatalogDialogProps) {
  const [selectedId, setSelectedId] = useState<WidgetType>('quickLinks')
  const listRef = useRef<any>(null)

  const selectedItem = CATALOG_ITEMS.find(i => i.id === selectedId)!
  const isAdded = selectedItem.singleton && activeWidgetTypes.has(selectedId)
  const isQuickLinks = selectedId === 'quickLinks'

  function handleAdd() {
    if (isQuickLinks) {
      onConfigure()
    } else {
      onAdd(selectedId)
      requestAnimationFrame(() => {
        listRef.current?.querySelector('ui5-li-custom[selected]')?.focus()
      })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      headerText="Widget Catalog"
      className="widget-catalog-dialog no-padding-dialog"
      footer={
        <Bar design="Footer" endContent={
          <>
            <Button
                design="Emphasized"
                disabled={isAdded}
                tooltip={isAdded ? 'You cannot add more widgets of this type' : isQuickLinks ? 'Configure this widget before adding it to the page' : 'Add this widget to the page'}
                onClick={handleAdd}
              >
              {isQuickLinks ? 'Configure Widget' : 'Add Widget'}
            </Button>
            <Button design="Transparent" onClick={onClose}>
              Close
            </Button>
          </>
        } />
      }
    >
      <div className="wcd-body">
        {/* Left: widget list — List gives built-in arrow-key navigation */}
        <List
          ref={listRef}
          className="wcd-list"
          selectionMode="Single"
          separators="None"
          onItemClick={(e) => setSelectedId((e.detail.item as HTMLElement).dataset.id as WidgetType)}
        >
          {CATALOG_ITEMS.map(item => {
            const added = activeWidgetTypes.has(item.id)
            const selected = selectedId === item.id
            return (
              <ListItemCustom
                key={item.id}
                data-id={item.id}
                selected={selected}
                className="wcd-list-item"
              >
                <div className="wcd-list-item__inner">
                  <div className="wcd-list-item__icon-wrap">
                    <Icon name={item.icon} design="Default" className="wcd-list-item__icon" />
                  </div>
                  <div className="wcd-list-item__text">
                    <div className="wcd-list-item__title-row">
                      <span className="wcd-list-item__title">{item.label}</span>
                      {added && (
                        <SigChipV2 design="positive" condensed leadingIcon="status-positive" value="Added" />
                      )}
                    </div>
                    <span className="wcd-list-item__description">{item.description}</span>
                  </div>
                </div>
              </ListItemCustom>
            )
          })}
        </List>

        {/* Right: preview — inert keeps it out of the tab order entirely */}
        <div className="wcd-preview" inert>
          <Title level="H4" size="H4">Example</Title>
          {selectedId === 'tasks' && (
            <div className="wcd-preview__card-wrap">
              <MyTasksWidget taskGroups={buildMyTasksPreviewGroups()} />
            </div>
          )}
          {selectedId === 'quickLinks' && (
            <div className="wcd-preview__card-wrap">
              <QuickLinksWidget instanceLabel={1} items={buildQuickLinksPreviewItems()} />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
