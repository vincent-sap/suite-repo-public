import { useMemo, useRef, useState } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Text,
  Toolbar, ToolbarItem,
  Button, ToggleButton, Menu, MenuItem, MenuSeparator,
  AnalyticalTable, Input, Icon, List,
  SegmentedButton, SegmentedButtonItem,
  Card, CardHeader,
  type AnalyticalTableColumnDefinition,
  type MenuDomRef,
} from '@ui5/webcomponents-react'
import {
  SigTableWrapper, SigFilterBar, SigFilter, MultiSelect,
  SigDomainObject, SigChipV2,
} from '@signavio/sap-signavio-uixtension'
import { useNavigate } from 'react-router-dom'
import { RESULTS, type ResultItem, STATUS_OPTIONS, enrichChips } from '../../data/allResourcesMockData'
import { AssetListItem } from '../repository/components/AssetListItem'
import { HighlightedText } from '../repository/components/SearchResultsPanel'

type ViewType = 'list' | 'table'
type SortOption = 'recent' | 'name'

// ── Filter options ────────────────────────────────────────────────────────────
const MODELER_TYPE_OPTIONS = [
  { value: 'BPMN Model',       label: 'BPMN Model' },
  { value: 'DMN Model',        label: 'DMN Model' },
  { value: 'Customer Journey', label: 'Journey Model' },
  { value: 'Workflow',         label: 'Workflow' },
  { value: 'Value Chain',      label: 'Value Chain' },
]
const STATUS_FILTER_OPTIONS = STATUS_OPTIONS
const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This week' },
  { value: 'month', label: 'This month' },
]

const MODELER_OBJECT_TYPES = new Set(['Process Model', 'Customer Journey', 'Workflow'])

const SORT_LABEL: Record<SortOption, string> = {
  recent: 'Recently Used',
  name:   'Name',
}

// Simulate a "recently used" order by reversing the mock data order
// (in a real app this would come from user interaction history)
const RECENTLY_USED_ORDER = ['5', '1', '8', '3', '6', '2', '4', '7', '9', '10', '11', '12', '13', '14', '15']

export default function ModelerLobby() {
  const navigate    = useNavigate()
  const overflowRef = useRef<MenuDomRef>(null)

  const [activeView, setActiveView]         = useState<ViewType>('list')
  const [sortBy, setSortBy]                 = useState<SortOption>('recent')
  const [searchQuery, setSearchQuery]       = useState('')
  const [filters, setFilters]               = useState<Record<string, unknown>>({})
  const [_navigatedId, _setNavigatedId] = useState<string | null>(null)
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)

  // ── Data ──────────────────────────────────────────────────────────────────
  const baseItems = useMemo(
    () => RESULTS.filter(r => MODELER_OBJECT_TYPES.has(r.objectType)),
    []
  )

  const displayItems = useMemo(() => {
    let items = baseItems

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      items = items.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.typeName?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.folder?.toLowerCase().includes(q)
      )
    }

    const typeFilter = filters.type as string[] | undefined
    if (typeFilter?.length) {
      items = items.filter(r => typeFilter.includes(r.typeName ?? r.objectType))
    }

    const statusFilter = filters.status as string[] | undefined
    if (statusFilter?.length) {
      items = items.filter(r => r.chips.some(c => statusFilter.includes(c.value)))
    }

    // Sort
    if (sortBy === 'recent') {
      items = [...items].sort((a, b) => {
        const ai = RECENTLY_USED_ORDER.indexOf(a.id)
        const bi = RECENTLY_USED_ORDER.indexOf(b.id)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
    } else {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name))
    }

    return items
  }, [baseItems, searchQuery, filters, sortBy])

  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length

  const openAsset = (item: ResultItem) => {
    _setNavigatedId(item.id)
    navigate(`/modeler/${item.id}`)
  }

  // ── List view ─────────────────────────────────────────────────────────────
  const renderListView = () => (
    <List separators="Inner">
      {displayItems.map((item, i) => (
        <AssetListItem
          key={item.id}
          id={item.id}
          name={item.name}
          objectType={item.objectType}
          typeName={item.typeName}
          description={item.description}
          created={item.lastUpdateDate}
          changed={item.lastUpdateDate}
          folder={item.folder}
          chips={enrichChips(item) as any}
          ownerName={(item.typeName === 'Objective' || item.typeName === 'Initiative' || item.typeName === 'Dashboard') ? item.lastUpdateBy : undefined}
          isNavigated={false}
          overflowId={`mod-overflow-${item.id}`}
          onOverflow={() => setOpenOverflowId(item.id)}
          highlightQuery={searchQuery}
          onClick={() => openAsset(item)}
          isLast={i === displayItems.length - 1}
        />
      ))}
    </List>
  )

  // ── Table view ────────────────────────────────────────────────────────────
  const chipLeadingIcon = (value: string) => {
    if (value === 'Published') return 'SAP-icons-v4/published'
    if (value === 'Draft') return 'write-new-document'
    if (value === 'Deprecated') return 'cancel'
    if (value === 'Modified') return 'SAP-icons-v4/published-changed'
    return 'SAP-icons-v4/published-changed'
  }
  const chipIndicationDesign = (value: string) => {
    if (value === 'Published') return 'indication5'
    if (value === 'Draft') return 'indication10'
    if (value === 'Deprecated') return 'indication2'
    if (value === 'Modified') return 'indication7'
    return 'indication7'
  }

  const renderTableView = () => {
    const cols: AnalyticalTableColumnDefinition[] = [
      {
        id: 'name', accessor: 'name', Header: 'Name', minWidth: 300, width: 300,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const item = row.original as ResultItem
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 6px' }}>
              <SigDomainObject size="XXS" object={item.objectType} />
              <Text className="table-asset-name" style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'auto' }}>
                <HighlightedText text={item.name} query={searchQuery} />
              </Text>
            </div>
          )
        },
      },
      {
        id: 'typeName', accessor: 'typeName', Header: 'Type', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).typeName}</Text>,
      },
      {
        id: 'folder', accessor: 'folder', Header: 'Location', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).folder ?? ''}</Text>,
      },
      {
        id: 'createdDate', accessor: 'createdDate', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Created</div>, minWidth: 110,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ fontSize: 'var(--sapFontSize)', textAlign: 'right', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).createdDate ?? ''}</div>,
      },
      {
        id: 'lastUpdateDate', accessor: 'lastUpdateDate', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Changed</div>, minWidth: 110,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ fontSize: 'var(--sapFontSize)', textAlign: 'right', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).lastUpdateDate}</div>,
      },
      {
        id: 'chips', accessor: 'chips', Header: 'Status', minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(row.original as ResultItem).chips.map((c, i) => (
              <SigChipV2 key={i} value={c.value} leadingIcon={chipLeadingIcon(c.value)} design={chipIndicationDesign(c.value) as any} condensed />
            ))}
          </div>
        ),
      },
      {
        id: '__actions', Header: '', accessor: 'id',
        disableSortBy: true, disableFilters: true, disableGroupBy: true,
        minWidth: 44, width: 44,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => (
          <Button
            id={`mod-overflow-${(row.original as ResultItem).id}`}
            icon="overflow" design="Transparent" tooltip="More Options"
            onClick={e => { e.stopPropagation(); setOpenOverflowId((row.original as ResultItem).id) }}
          />
        ),
      },
    ]

    return (
      <AnalyticalTable
        data={displayItems}
        columns={cols}
        selectionMode="None"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRowClick={(e: any) => { const item = e?.detail?.row?.original as ResultItem | undefined; if (item) openAsset(item) }}
        visibleRows={displayItems.length}
        minRows={displayItems.length}
        style={{ width: '100%' }}
        className="ui5-content-density-compact"
      />
    )
  }

  // ── Overflow menu for row items ───────────────────────────────────────────
  const overflowMenu = openOverflowId && (
    <Menu opener={`mod-overflow-${openOverflowId}`} open onClose={() => setOpenOverflowId(null)}>
      <MenuItem text="Open" />
      <MenuSeparator />
      <MenuItem text="Add to Favorites" />
      <MenuItem text="Share" />
      <MenuSeparator />
      <MenuItem text="Rename" />
      <MenuItem text="Move" />
      <MenuItem text="Delete" />
    </Menu>
  )

  // ── SigTableWrapper ───────────────────────────────────────────────────────
  const tableWrapper = (
    <SigTableWrapper
      titleSlot={
        <ToolbarItem>
          <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
            Process Models ({displayItems.length}{searchQuery.trim() ? ` of ${baseItems.length}` : ''})
          </Title>
        </ToolbarItem>
      }
      searchSlot={
        <ToolbarItem>
          <Input
            placeholder="Search"
            icon={<Icon name="search" slot="icon" />}
            style={{ width: '200px' }}
            value={searchQuery}
            onInput={e => setSearchQuery((e.target as unknown as HTMLInputElement).value)}
          />
        </ToolbarItem>
      }
      sortSlot={
        <ToolbarItem>
          <SigChipV2
            label="Sort By"
            value={SORT_LABEL[sortBy]}
            trailingIcon="slim-arrow-down"
            onClick={() => setSortBy(s => s === 'recent' ? 'name' : 'recent')}
          />
        </ToolbarItem>
      }
      exportActionsSlot={
        <>
          <ToolbarItem overflowPriority="NeverOverflow">
            <SegmentedButton>
              <SegmentedButtonItem icon="table-view" accessibleName="Table" selected={activeView === 'table'} onClick={() => setActiveView('table')} />
              <SegmentedButtonItem icon="list" accessibleName="List" selected={activeView === 'list'} onClick={() => setActiveView('list')} />
            </SegmentedButton>
          </ToolbarItem>
        </>
      }
      filterBarToggleButton={
        <ToolbarItem>
          <ToggleButton design="Transparent" icon="filter">
            {activeFilterCount > 0 ? `${activeFilterCount}` : ''}
          </ToggleButton>
        </ToolbarItem>
      }
      filterBarSlot={
        <SigFilterBar filters={filters} onFiltersChange={setFilters} defaultFilters={{}} showManageFilters>
          <SigFilter filterKey="type" label="Type">
            <MultiSelect options={MODELER_TYPE_OPTIONS} />
          </SigFilter>
          <SigFilter filterKey="status" label="Status">
            <MultiSelect options={STATUS_FILTER_OPTIONS} />
          </SigFilter>
          <SigFilter filterKey="dateChanged" label="Date Changed">
            <MultiSelect options={DATE_OPTIONS} />
          </SigFilter>
        </SigFilterBar>
      }
    >
      {activeView === 'list'  && renderListView()}
      {activeView === 'table' && renderTableView()}
    </SigTableWrapper>
  )

  return (
    <DynamicPage
      style={{ height: '100%', flex: 1 }}
      hidePinButton
      titleArea={
        <DynamicPageTitle>
          <Title slot="heading" level="H3">Modeler</Title>
          <Toolbar slot="actionsBar">
            {/* Overflow button — replaces the old cogwheel */}
            <Button
              id="modeler-lobby-overflow"
              icon="overflow"
              design="Transparent"
              tooltip="More options"
              onClick={() => {
                if (overflowRef.current) {
                  overflowRef.current.opener = 'modeler-lobby-overflow'
                  overflowRef.current.open = true
                }
              }}
            />
            <Menu ref={overflowRef}>
              <MenuItem
                text="Modeling Settings"
                icon="action-settings"
                onClick={() => navigate('/settings/modeling-preferences')}
              />
            </Menu>
          </Toolbar>
        </DynamicPageTitle>
      }
    >
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Create new model cards ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Title level="H5" style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTitleColor)' }}>New</Title>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <Card
              className="new-model-card"
              style={{ width: '280px', cursor: 'pointer' }}
              header={
                <CardHeader
                  interactive
                  titleText="BPMN Model"
                  subtitleText="Create a process model"
                  avatar={<SigDomainObject size="S" object="Process Model" />}
                />
              }
              onClick={() => navigate('/modeler/new')}
            />
            <Card
              className="new-model-card"
              style={{ width: '280px', cursor: 'pointer' }}
              header={
                <CardHeader
                  interactive
                  titleText="Journey Model"
                  subtitleText="Map a customer journey"
                  avatar={<SigDomainObject size="S" object="Customer Journey" />}
                />
              }
              onClick={() => navigate('/modeler/new-journey')}
            />
            <Card
              className="new-model-card"
              style={{ width: '280px', cursor: 'pointer' }}
              header={
                <CardHeader
                  interactive
                  titleText="DMN Model"
                  subtitleText="Define a decision table"
                  avatar={<SigDomainObject size="S" object="DMN" />}
                />
              }
              onClick={() => navigate('/modeler/new-dmn')}
            />
          </div>
        </div>

        {/* ── Table / list ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Title level="H5" style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTitleColor)' }}>All Models</Title>
          {tableWrapper}
        </div>
      </div>

      {overflowMenu}
    </DynamicPage>
  )
}
