import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Title, Toolbar, ToolbarItem, ToolbarSeparator, ToolbarSpacer,
  Button, ToggleButton,
  AnalyticalTable, AnalyticalTableSelectionMode, AnalyticalTableSelectionBehavior,
  MessageStrip, Icon,
  Popover, List, ListItemStandard, type PopoverDomRef,
  SplitterLayout, SplitterElement,
  ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/favorite.js'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension/sig-table-wrapper'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { REPOSITORY_ITEMS, formatAccessed } from '../../data/DataBase'
import { USERS } from '../../data/users'
import { useWorkspaceFilter } from '../../hooks/useWorkspaceFilter'
import type { MockItem, DomainObjects } from '../../data/DataBase'
import type { SelectedAssetInfo } from './AllResources'
import AssetInfoPanel from './Repository/AssetInfoPanel'
import s from './NewsfeedPage.module.css'

const SECTION_IDS = ['all', 'favorites']

function toDays(v: string | number): number {
  if (typeof v === 'number') return v
  if (v.includes('hour') || v.includes('minute') || v.includes('second')) return 0
  if (v.includes('1 day')) return 1
  const m = v.match(/(\d+)\s*day/)
  if (m) return parseInt(m[1])
  return 0
}

function publishGroup(v: string | number): string {
  const days = toDays(v)
  const now = new Date()
  const d = new Date()
  d.setDate(d.getDate() - days)
  if (days <= 7) return 'This Week'
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'This Month'
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const m1 = (now.getMonth() - 1 + 12) % 12
  const m2 = (now.getMonth() - 2 + 12) % 12
  const itemMonth = d.getMonth()
  if (itemMonth === m1 || itemMonth === m2) return MONTHS[itemMonth]
  return 'Earlier'
}

function groupSortKey(label: string): number {
  if (label === 'This Week')  return 0
  if (label === 'This Month') return 1
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const idx = MONTHS.indexOf(label)
  if (idx !== -1) return 2 + (new Date().getMonth() - idx + 12) % 12
  return 99
}

type NewsfeedRow = MockItem & { publishGroup: string; publishedDisplay: string; publishedBy: string }

function buildRows(items: MockItem[]): NewsfeedRow[] {
  return [...items]
    .map(item => {
      const user = item.lastPublishedById ? USERS.find(u => u.id === item.lastPublishedById) : undefined
      return {
        ...item,
        publishGroup: publishGroup(item.lastPublished),
        publishedDisplay: formatAccessed(item.lastPublished),
        publishedBy: user ? `${user.firstName} ${user.lastName}` : '',
      }
    })
    .sort((a, b) => groupSortKey(a.publishGroup) - groupSortKey(b.publishGroup))
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

function makeColumns(onRowClick: (item: MockItem) => void) {
  return [
    {
      Header: 'Name',
      accessor: 'title',
      Cell: (props: any) => {
        const item = props.row.original as NewsfeedRow | undefined
        if (!item) return null
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, cursor: 'pointer' }}
            title={item.title}
            onClick={() => onRowClick(item)}
          >
            <SigDomainObject object={item.object as DomainObjects} size="XS" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 'bold', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
              {item.title}
            </span>
            {item.isFavorite && <Icon name="favorite" style={{ flexShrink: 0, color: 'var(--sapHighlightColor)' }} />}
          </div>
        )
      },
    },
    { Header: 'Type', accessor: 'type', width: 160 },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: (props: any) => {
        const desc = (props.value as string | undefined) ?? ''
        return desc
          ? <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={desc}>{desc}</span>
          : null
      },
    },
    {
      Header: 'Location',
      accessor: 'folderPath',
      width: 300,
      Cell: (props: any) => {
        const full = props.value as string | undefined
        if (!full) return null
        const label = full.split('/').at(-1) ?? full
        return <span style={{ color: 'var(--sapLinkColor)', cursor: 'pointer' }} title={full}>{label}</span>
      },
    },
    { Header: 'Last Published', accessor: 'publishedDisplay', width: 140, hAlign: 'End' as const },
    { Header: 'Published by', accessor: 'publishedBy', width: 180 },
    {
      Header: () => null,
      accessor: 'publishGroup',
      disableSortBy: true, disableFilters: true, disableResizing: true, disableGroupBy: true,
      width: 1, minWidth: 1, maxWidth: 1,
      Cell: (props: any) => props.row.isGrouped ? <span>{props.value as string}</span> : null,
    },
  ]
}

function NewsfeedTable({ items, onRowClick }: { items: MockItem[]; onRowClick: (item: MockItem) => void }) {
  const columns = useMemo(() => makeColumns(onRowClick), [onRowClick])
  const rows = useMemo(() => buildRows(items), [items])
  const expandedState = useMemo(() => {
    const groups = new Set(rows.map(r => r.publishGroup))
    const expanded: Record<string, boolean> = {}
    groups.forEach(g => { expanded[`publishGroup:${g}`] = true })
    return expanded
  }, [rows])
  const groupCount = useMemo(() => new Set(rows.map(r => r.publishGroup)).size, [rows])

  return (
    <div className={`assets-table ${s['newsfeed-table']}`}>
      <AnalyticalTable
        key={rows.map(r => r.publishGroup).join(',')}
        data={rows}
        columns={columns}
        visibleRows={rows.length + groupCount}
        minRows={0}
        scaleWidthMode="Default"
        sortable
        rowHeight={40}
        selectionMode={AnalyticalTableSelectionMode.Single}
        selectionBehavior={AnalyticalTableSelectionBehavior.RowOnly}
        groupable
        groupBy={['publishGroup']}
        reactTableOptions={{ initialState: { expanded: expandedState }, autoResetGroupBy: false }}
      />
    </div>
  )
}

let newsfeedWasVisited = false

export default function Newsfeed() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [msgVisible, setMsgVisible] = useState(() => newsfeedWasVisited)
  const [contentFilter, setContentFilter] = useState<'all' | 'published'>('all')
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null)
  const contentFilterMenuRef = useRef<PopoverDomRef>(null)

  const allItems = useWorkspaceFilter(REPOSITORY_ITEMS)

  const filteredAll = useMemo(() =>
    contentFilter === 'published' ? allItems.filter(i => i.state !== 'Draft') : allItems,
    [allItems, contentFilter]
  )
  const filteredFavorites = useMemo(() =>
    filteredAll.filter(i => i.isFavorite),
    [filteredAll]
  )

  useEffect(() => { return () => { newsfeedWasVisited = true } }, [])

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[class*="_objectPage_"]')
    if (!el) return
    if (el.scrollTop > 0) el.scrollTop = 0
    const handler = () => { el.scrollTop = 0 }
    el.addEventListener('scroll', handler, { once: true })
    return () => el.removeEventListener('scroll', handler)
  }, [selectedTab])

  const handleRowClick = (item: MockItem) => {
    setSelectedItem(item)
    setInfoPanelOpen(true)
  }

  const panelAsset = selectedItem ? mockItemToExternalAsset(selectedItem) : null

  const tableSection = (items: MockItem[], title?: string) => (
    <>
      {msgVisible && (
        <MessageStrip design="Information" onClose={() => setMsgVisible(false)} style={{ marginBottom: '1rem' }}>
          You are up to date. Since your last visit, there has been no new content published in this workspace.
        </MessageStrip>
      )}
      <SigTableWrapper titleSlot={
        <ToolbarItem><Title level="H5">{title ?? 'All Items'} ({items.length})</Title></ToolbarItem>
      }>
        <NewsfeedTable items={items} onRowClick={handleRowClick} />
      </SigTableWrapper>
    </>
  )

  return (
    <>
    <SplitterLayout options={{ resetOnSizeChange: true, resetOnChildrenChange: true }} style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }}>
      <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <ObjectPage
          style={{ height: '100%' }}
          mode={ObjectPageMode.IconTabBar}
          hidePinButton
          selectedSectionId={SECTION_IDS[selectedTab]}
          onSelectedSectionChange={(e) => setSelectedTab(e.detail.selectedSectionIndex)}
          titleArea={
            <ObjectPageTitle
              header={<Title level="H3">Newsfeed</Title>}
              actionsBar={
                <Toolbar design="Transparent">
                  <ToolbarSpacer />
                  <ToolbarItem>
                    <Button
                      id="newsfeed-content-filter-btn"
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
              }
            />
          }
        >
          <ObjectPageSection id="all" titleText="All" hideTitleText>
            {tableSection(filteredAll)}
          </ObjectPageSection>
          <ObjectPageSection id="favorites" titleText="Favorites" hideTitleText>
            {tableSection(filteredFavorites, 'Favorite Items')}
          </ObjectPageSection>
        </ObjectPage>
      </SplitterElement>

      {infoPanelOpen && (
        <SplitterElement size="400px" minSize={400} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AssetInfoPanel
            key={panelAsset?.id ?? '__none__'}
            selectedAsset={null}
            selectedDictEntry={null}
            dictCategories={[]}
            externalSelectedAsset={panelAsset}
            pageTitle="Newsfeed"
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
