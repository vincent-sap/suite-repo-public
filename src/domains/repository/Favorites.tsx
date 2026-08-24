import { useState, useMemo, useRef } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Toolbar, ToolbarButton, ToolbarItem, ToolbarSeparator, ToolbarSpacer,
  Button, ToggleButton,
  AnalyticalTable, AnalyticalTableSelectionMode, AnalyticalTableSelectionBehavior,
  Icon,
  Popover, List, ListItemStandard, type PopoverDomRef,
  SplitterLayout, SplitterElement,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/write-new-document.js'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension/sig-table-wrapper'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import '@signavio/icons/dist/published.js'
import '@signavio/icons/dist/published-changed.js'
import { CardGridFlexWidth } from './components/CardGridFlexWidth'
import { PreviewCard } from './components/PreviewCard'
import { allItemsTitle } from '../../utils/tableWrapperTitle'
import { REPOSITORY_ITEMS, formatAccessed } from '../../data/DataBase'
import { useWorkspaceFilter, useWorkspaceMode } from '../../hooks/useWorkspaceFilter'
import { useFutureState } from '../../hooks/useFutureState'
import type { MockItem, DomainObjects } from '../../data/DataBase'
import type { SelectedAssetInfo } from './AllResources'
import AssetInfoPanel from './Repository/AssetInfoPanel'
import SampleProcess1 from '../../models/SampleProcess1.svg'
import SampleProcess2 from '../../models/SampleProcess2.svg'
import SampleProcess3 from '../../models/SampleProcess3.svg'
import SampleProcess4 from '../../models/SampleProcess4.svg'
import EntryDiagram from '../../models/EntryDiagram.svg'

const MODEL_SRCS: Record<string, string> = {
  SampleProcess1, SampleProcess2, SampleProcess3, SampleProcess4, EntryDiagram,
}

function mockItemToExternalAsset(item: MockItem): SelectedAssetInfo {
  const chips: SelectedAssetInfo['chips'] = item.state === 'Published'
    ? [{ value: 'Published', design: 'positive' }]
    : item.state === 'Draft'
    ? [{ value: 'Draft', design: 'none' }]
    : item.state === 'Modified'
    ? [{ value: 'Modified', design: 'warning' }]
    : []
  return {
    id: item.title,
    name: item.title,
    objectType: item.object as string,
    typeName: item.type,
    description: item.description,
    folder: item.folderPath?.split('/').at(-1),
    lastUpdateDate: formatAccessed(item.lastAccessed),
    lastPublished: formatAccessed(item.lastPublished),
    chips,
  }
}

function makeTableColumns(mode: 'preview' | 'published') {
  return [
    {
      Header: 'Name',
      accessor: 'title',
      Cell: (props: any) => {
        const item = props.row.original as MockItem
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }} title={item.title}>
            <SigDomainObject object={item.object as DomainObjects} size="XS" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 'bold', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
              {item.title}
            </span>
            {mode === 'preview' && item.state === 'Draft' && (
              <SigChipV2 value="Draft" design="indication10" leadingIcon="write-new-document" condensed />
            )}
            {mode === 'preview' && item.state === 'Modified' && (
              <SigChipV2 value="Modified" design="indication7" leadingIcon="SAP-icons-v4/published-changed" condensed />
            )}
            {mode === 'preview' && item.state === 'Published' && (
              <SigChipV2 value="Published" design="indication5" leadingIcon="SAP-icons-v4/published" condensed />
            )}
            {item.isFavorite && (
              <Icon name="favorite" style={{ flexShrink: 0, color: 'var(--sapHighlightColor)' }} />
            )}
          </div>
        )
      },
    },
    { Header: 'Type', accessor: 'type', width: 140 },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: (props: any) => {
        const description = (props.value as string | undefined) ?? ''
        return description ? (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', minWidth: 0 }} title={description}>{description}</span>
        ) : ''
      },
    },
    {
      Header: 'Last Published',
      accessor: 'lastPublished',
      width: 140,
      hAlign: 'End' as const,
      Cell: (props: any) => formatAccessed(props.value as string | number),
    },
  ]
}

export default function Favorites() {
  const [activeView, setActiveView] = useState<'card' | 'table'>('table')
  const [contentFilter, setContentFilter] = useState<'all' | 'published'>('all')
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null)
  const [futureState] = useFutureState()
  const effectiveView = futureState ? activeView : 'table'
  const mode = useWorkspaceMode()
  const tableColumns = useMemo(() => makeTableColumns(mode), [mode])
  const contentFilterMenuRef = useRef<PopoverDomRef>(null)

  const allFavorites = REPOSITORY_ITEMS.filter(i => i.isFavorite)
  const baseItems = useWorkspaceFilter(allFavorites)
  const favorites = useMemo(() =>
    contentFilter === 'published' ? baseItems.filter(i => i.state !== 'Draft') : baseItems,
    [baseItems, contentFilter]
  )

  const getModelSrc = (item: MockItem) => item.preview ? MODEL_SRCS[item.preview] : undefined

  const handleItemClick = (item: MockItem) => {
    setSelectedItem(item)
    setInfoPanelOpen(true)
  }

  const handlePreviewClick = (item: MockItem) => {
    handleItemClick(item)
  }

  const panelAsset = selectedItem ? mockItemToExternalAsset(selectedItem) : null

  return (
    <>
    <SplitterLayout options={{ resetOnSizeChange: true, resetOnChildrenChange: true }} style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }}>
      <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <DynamicPage style={{ height: '100%', flex: 1 }} hidePinButton titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Favorites</Title>
            <Toolbar slot="actionsBar" design="Transparent">
              <ToolbarSpacer />
              <ToolbarButton icon="action-settings" design="Transparent" tooltip="Settings" />
              <ToolbarSeparator />
              <ToolbarItem>
                <Button
                  id="favorites-content-filter-btn"
                  design="Transparent"
                  endIcon="slim-arrow-down"
                  onClick={(e) => {
                    if (contentFilterMenuRef.current) {
                      contentFilterMenuRef.current.opener = e.currentTarget as HTMLElement
                      contentFilterMenuRef.current.open = true
                    }
                  }}
                >
                  {contentFilter === 'published' ? 'Published Only' : 'All Content'}
                </Button>
                <Popover
                  ref={contentFilterMenuRef}
                  placement="Bottom"
                  horizontalAlign="End"
                  hideArrow
                  className="no-padding-popover"
                  onClose={() => { if (contentFilterMenuRef.current) contentFilterMenuRef.current.open = false }}
                >
                  <List separators="None" selectionMode="Single" onItemClick={(e) => {
                    const val = (e.detail.item as HTMLElement).dataset.value
                    setContentFilter(val === 'published' ? 'published' : 'all')
                    if (contentFilterMenuRef.current) contentFilterMenuRef.current.open = false
                  }}>
                    <ListItemStandard description="Show draft and published content" type="Active" data-value="all" selected={contentFilter === 'all'}>All Content</ListItemStandard>
                    <ListItemStandard description="Only show published versions" type="Active" data-value="published" selected={contentFilter === 'published'}>Published Only</ListItemStandard>
                  </List>
                </Popover>
              </ToolbarItem>
              <ToolbarSeparator />
              <ToggleButton
                icon="SAP-icons-v4/panel-right"
                design="Transparent"
                pressed={infoPanelOpen}
                tooltip={infoPanelOpen ? 'Close Info Panel' : 'Open Info Panel'}
                onClick={() => setInfoPanelOpen(v => !v)}
              >Details</ToggleButton>
            </Toolbar>
          </DynamicPageTitle>
        }>
            <SigTableWrapper
              titleSlot={allItemsTitle(favorites.length)}
              {...(futureState ? { viewSwitcher: ['table', 'card'] } : {})}
              activeView={effectiveView}
              onActiveViewChange={view => setActiveView(view as 'card' | 'table')}
            >
              {effectiveView === 'card' && (
                <div style={{ width: '100%' }}>
                  <CardGridFlexWidth stretch minCardWidth="240px">
                    {favorites.map(item => (
                      <PreviewCard
                        key={item.title}
                        title={item.title}
                        object={item.object}
                        modelSrc={getModelSrc(item)}
                        type={item.type}
                        date={formatAccessed(item.lastAccessed)}
                        isFavorite={item.isFavorite}
                        onClick={() => handlePreviewClick(item)}
                      />
                    ))}
                  </CardGridFlexWidth>
                </div>
              )}
              {effectiveView === 'table' && (
                <div className="assets-table">
                  <AnalyticalTable
                    data={favorites}
                    columns={tableColumns}
                    visibleRows={favorites.length}
                    minRows={0}
                    scaleWidthMode="Default"
                    sortable
                    rowHeight={40}
                    selectionMode={AnalyticalTableSelectionMode.Single}
                    selectionBehavior={AnalyticalTableSelectionBehavior.RowOnly}
                    onRowClick={(e) => handleItemClick(e.detail.row.original as MockItem)}
                  />
                </div>
              )}
            </SigTableWrapper>
          
        </DynamicPage>
      </SplitterElement>

      {infoPanelOpen && (
        <SplitterElement size="400px" minSize={400} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AssetInfoPanel
            key={panelAsset?.id ?? '__none__'}
            selectedAsset={null}
            selectedDictEntry={null}
            dictCategories={[]}
            externalSelectedAsset={panelAsset}
            pageTitle="Favorites"
            selectionCount={panelAsset ? 1 : 0}
            zoomViewport={null}
            subscriptions={{}}
            onSubscriptionChange={() => {}}
            onThumbnailEnter={() => {}}
            onThumbnailLeave={() => {}}
            onThumbnailMove={() => {}}
            onClose={() => setInfoPanelOpen(false)}
            onOpenModelDetail={() => {}}
            isFavorite={!!(selectedItem?.isFavorite)}
            onToggleFavorite={() => {}}
          />
        </SplitterElement>
      )}
    </SplitterLayout>
    </>
  )
}
