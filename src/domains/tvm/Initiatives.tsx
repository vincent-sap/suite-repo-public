import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  FlexBox, FlexBoxDirection, FlexBoxWrap, FlexBoxAlignItems,
  Title, Text, Icon, Button, CheckBox,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Dialog, Bar, Label, Input, Select, Option,
  Toast, MessageBox, IllustratedMessage,
  Card, CardHeader,
  Menu, MenuItem,
  Popover, List, ListItemCustom,
  type PopoverDomRef,
  SegmentedButton, SegmentedButtonItem,
  Avatar,
} from '@ui5/webcomponents-react'
import { SigChipV2, SigDomainObject, SigFilterBar, SigFilter, SigPagination, SigTableWrapper, SingleSelect, MultiSelect, type FilterValues } from '@signavio/sap-signavio-uixtension'
import { ToolbarItem } from '@ui5/webcomponents-react'
import {
  INITIATIVES,
  STATUS_CHIP_DESIGN,
  type Initiative,
  type ItemStatus,
} from '../../data/ptm'
import AvatarSize from '@ui5/webcomponents/dist/types/AvatarSize.js'
import DiscoverInitiativesDialog from './components/DiscoverInitiatives/DiscoverInitiativesDialog'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50
const CARD_PAGE_SIZE = 10
const CARD_PREVIEW_SIZE = 6

type FilterType = 'ALL' | 'PRIVATE' | 'SHARED'

const STATUS_OPTIONS: ItemStatus[] = [
  'To Do', 'Planning', 'In Progress', 'At Risk', 'Completed', 'Archived',
]

const SORT_OPTIONS = [
  { key: 'DATE_UPDATED',         label: 'Updated Date' },
  { key: 'DATE_CREATED',         label: 'Created Date' },
  { key: 'LAST_ACTIVITY',        label: 'Last Activity' },
  { key: 'NAME',                 label: 'Name (A–Z)' },
  { key: 'NUMBER_OF_INSIGHTS',   label: 'Number of Insights' },
  { key: 'START_DATE',           label: 'Start Date' },
  { key: 'END_DATE',             label: 'End Date' },
]

// ─── Cell renderers ───────────────────────────────────────────────────────────

const NameCell = ({ row }: any) => {
  const init: Initiative = row.original
  return <Text maxLines={1}>{init.title}</Text>
}

const StatusCell = ({ row }: any) => {
  const design = (STATUS_CHIP_DESIGN[row.original.status] ?? 'indication10') as any
  return (
    <SigChipV2
      value={row.original.status}
      leadingIcon="circle-task-2"
      leadingIconColor={design}
      condensed
    />
  )
}

const TypeCell = ({ row }: any) => {
  const init: Initiative = row.original
  const tooltip = init.type === 'Private'
    ? 'Private initiatives are only visible to you'
    : 'Shared initiatives are visible to all members added to the initiative'
  return <Text title={tooltip} style={{ cursor: 'default' }}>{init.type}</Text>
}

const InsightsCell = ({ row }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <Icon name="lightbulb" title="Insights" style={{ fontSize: 14, color: 'var(--sapContent_LabelColor)' }} />
    <span style={{ fontSize: 14 }}>{row.original.insightCount}</span>
  </div>
)

const ValueCasesCell = ({ row }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <Icon name="lead" title="Value Cases" style={{ fontSize: 14, color: 'var(--sapContent_LabelColor)' }} />
    <span style={{ fontSize: 14 }}>{row.original.valueCaseCount}</span>
  </div>
)

// Members: text with "+N others" overflow following the system pattern
const MembersCell = ({ row }: any) => {
  const init: Initiative = row.original
  if (init.type === 'Private') {
    return <Text>{init.owner.name}</Text>
  }
  const names = init.members.map((m: any) => m.name)
  if (names.length === 0) return <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
  if (names.length === 1) return <Text>{names[0]}</Text>
  // Show first name + "+N others" to avoid wrapping
  return <Text>{names[0]}, +{names.length - 1} others</Text>
}

const ChangedOnCell = ({ row }: any) => (
  <Text style={{ fontSize: 14, color: 'var(--sapContent_LabelColor)' }}>{row.original.changedOn}</Text>
)

// Comments: SigChipV2 with comment icon — matches staging CommentsCell → CommentChip pattern
function CommentsCell({ row }: any) {
  const navigate = useNavigate()
  const init: Initiative = row.original
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <SigChipV2
        value={String(init.commentCount)}
        leadingIcon="comment"
        onClick={(e: any) => { e.stopPropagation(); navigate('/initiatives/' + init.id) }}
      />
    </div>
  )
}

function ActionsCell({ row, onDelete }: any) {
  const [open, setOpen] = useState(false)
  const btnId = `more-init-${row.original?.id}`
  return (
    <>
      <Button
        id={btnId}
        icon="overflow"
        design="Transparent"
        title="More actions"
        onClick={(e: any) => { e.stopPropagation(); setOpen(v => !v) }}
      />
      <Menu opener={btnId} open={open} onClose={() => setOpen(false)}
        onItemClick={(e: any) => {
          const text = (e.detail?.item as any)?.text
          setOpen(false)
          if (text === 'Delete') onDelete(row.original.id)
        }}
      >
        <MenuItem text="Manage Access" />
        <MenuItem text="Delete" />
      </Menu>
    </>
  )
}

// ─── Card view ────────────────────────────────────────────────────────────────

function InitiativeCard({
  init,
  onClick,
  selectionMode = false,
  selected = false,
  onSelect,
}: {
  init: Initiative
  onClick: () => void
  selectionMode?: boolean
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
}) {
  const subtitlePrefix = init.type === 'Private' ? 'Private • ' : ''
  const subtitleText = `${subtitlePrefix}${init.insightCount} Insight${init.insightCount !== 1 ? 's' : ''}`

  const handleClick = () => {
    if (selectionMode) {
      onSelect?.(init.id, !selected)
    } else {
      onClick()
    }
  }

  return (
    <div
      className={`initiative-card-wrap${selected ? ' initiative-card-wrap--selected' : ''}`}
      style={{ position: 'relative', width: '20rem', minWidth: '20rem' }}
    >
      <Card
        tabIndex={0}
        className={`elevated-card${selected ? ' elevated-card--selected' : ''}`}
        style={{ width: '100%', cursor: 'pointer' }}
        data-testid="initiative-card"
        onClick={handleClick}
        onKeyDown={(e: any) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      >
        {selectionMode && (
          <div
            style={{ padding: '0.5rem 1rem', paddingBottom: 0 }}
            onClick={(e) => { e.stopPropagation(); onSelect?.(init.id, !selected) }}
          >
            <CheckBox checked={selected} accessibleName={`Select ${init.title}`} style={{ marginLeft: '-0.5rem' }} />
          </div>
        )}
        <div style={{ padding: '0.5rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Title level="H6" wrappingType="None">{init.title}</Title>
            <Text style={{ color: 'var(--sapTile_TextColor)', fontSize: 'var(--sapFontSize)' }}>
              {subtitleText}
            </Text>
          </div>
          <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
            <SigChipV2
              value={init.status}
              leadingIcon="circle-task-2"
              leadingIconColor={(STATUS_CHIP_DESIGN[init.status] ?? 'indication10') as any}
            />
            {!selectionMode && (
              <SigChipV2
                value={String(init.commentCount)}
                leadingIcon="comment"
                onClick={(e: any) => { e.stopPropagation(); onClick() }}
              />
            )}
          </FlexBox>
          <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
            {init.type !== 'Private' && init.members.length > 0 && (
              <div style={{ display: 'flex', gap: 2, width: '50%' }}>
                {init.members.slice(0, 4).map(m => (
                  <Avatar
                    key={m.id}
                    initials={m.initials}
                    colorScheme={m.colorScheme as never}
                    size={AvatarSize.XS}
                    accessibleName={m.name}
                    title={m.name}
                  />
                ))}
              </div>
            )}
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', flexShrink: 0 }}>
              Changed On {init.changedOn}
            </Text>
          </FlexBox>
        </div>
      </Card>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function InitiativeSectionHeader({ title, isPrivate, subtitle }: { title: string; isPrivate: boolean; subtitle: string }) {
  return (
    <FlexBox
      direction={FlexBoxDirection.Row}
      alignItems={FlexBoxAlignItems.Center}
      style={{ gap: '0.5rem', marginBottom: '1rem' }}
    >
      <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      <Text style={{ color: 'var(--sapContent_LabelColor)' }}>•</Text>
      {isPrivate && (
        <Icon
          name="locked"
          style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)', marginRight: '-5px' }}
        />
      )}
      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>{subtitle}</Text>
    </FlexBox>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Initiatives() {
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const sortPopoverRef = useRef<PopoverDomRef>(null)

  const [initiatives, setInitiatives] = useState<Initiative[]>(() => [...INITIATIVES])
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [filters, setFilters] = useState<FilterValues>({})
  const [viewType, setViewType] = useState<'table' | 'card'>('table')
  const [sortBy, setSortBy] = useState('DATE_UPDATED')
  const [currentPage, setCurrentPage] = useState(0)
  const [cardPagePrivate, setCardPagePrivate] = useState(0)
  const [cardPageShared, setCardPageShared] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<ItemStatus>('In Progress')
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [discoverInitialSubFlow, setDiscoverInitialSubFlow] = useState<'none' | 'pulse-check' | 'business-challenges'>('none')
  useEffect(() => {
    const param = new URLSearchParams(routerLocation.search).get('openDiscover')
    if (param === 'pulse-check') { setDiscoverInitialSubFlow('pulse-check'); setDiscoverOpen(true) }
    else if (param === 'ai') { setDiscoverInitialSubFlow('business-challenges'); setDiscoverOpen(true) }
  }, [routerLocation.search])

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Multi-selection state ──────────────────────────────────────────────────
  const [cardSelectionMode, setCardSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const bulkStatusPopoverRef = useRef<PopoverDomRef>(null)

  const handleSelectCard = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = visibleCardsForSelection.map(i => i.id)
      setSelectedIds(new Set(ids))
    } else {
      setSelectedIds(new Set())
    }
  }

  const exitSelectionMode = () => {
    setCardSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      const idx = INITIATIVES.findIndex(i => i.id === id)
      if (idx !== -1) INITIATIVES.splice(idx, 1)
    })
    setInitiatives(prev => prev.filter(i => !selectedIds.has(i.id)))
    setBulkDeleteOpen(false)
    exitSelectionMode()
    showToast(`${selectedIds.size} initiative${selectedIds.size !== 1 ? 's' : ''} deleted`)
  }

  const handleBulkChangeStatus = (status: ItemStatus) => {
    selectedIds.forEach(id => {
      const item = INITIATIVES.find(i => i.id === id)
      if (item) item.status = status
    })
    setInitiatives(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, status } : i))
    exitSelectionMode()
    showToast(`Status updated to "${status}" for ${selectedIds.size} initiative${selectedIds.size !== 1 ? 's' : ''}`)
  }


  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  useEffect(() => { document.title = 'Initiatives – SAP Signavio' }, [])
  useEffect(() => { setInitiatives([...INITIATIVES]) }, [routerLocation.key])

  // UI5 renders the segmented button as a CSS grid on the inner
  // <ul>.ui5-segmented-button-root-equal-sized-items in its shadow root, with
  // grid-template-columns set to N equal fixed pixel tracks — that's what forces
  // every item to the widest item's width. Staging hugs each item to its own
  // content, so we override the grid to auto-sized tracks (max-content columns).
  useEffect(() => {
    const getUl = () =>
      document.querySelector('.initiatives-seg ui5-segmented-button')
        ?.shadowRoot?.querySelector<HTMLElement>('.ui5-segmented-button-root') ?? null
    const hug = (ul: HTMLElement) => {
      if (ul.style.getPropertyValue('grid-template-columns') === 'none' &&
          ul.style.getPropertyPriority('grid-template-columns') === 'important') return
      // Clear the equal fixed tracks; let auto-flow lay out max-content columns.
      ul.style.setProperty('grid-template-columns', 'none', 'important')
      ul.style.setProperty('grid-auto-columns', 'max-content', 'important')
      ul.style.setProperty('grid-auto-flow', 'column', 'important')
      ul.style.setProperty('width', 'max-content', 'important')
    }
    let observer: MutationObserver | null = null
    let tid: ReturnType<typeof setTimeout>
    const init = () => {
      const ul = getUl()
      if (!ul) { tid = setTimeout(init, 50); return }
      hug(ul)
      observer = new MutationObserver(() => hug(ul))
      observer.observe(ul, { attributes: true, attributeFilter: ['style'] })
    }
    init()
    return () => { clearTimeout(tid); observer?.disconnect() }
  }, [filterType])

  // ── Group ─────────────────────────────────────────────────────────────────

  const personalInitiatives = useMemo(
    () => initiatives.filter(i => i.type === 'Private'),
    [initiatives],
  )
  const sharedInitiatives = useMemo(
    () => initiatives.filter(i => i.type === 'Shared'),
    [initiatives],
  )

  const searchTerm = (filters.search as string) ?? ''
  const statusFilter = (filters.status as string) ?? 'ALL'
  const memberFilter = (filters.members as string[]) ?? []

  const filterByName = (list: Initiative[], term: string) =>
    term ? list.filter(i => i.title.toLowerCase().includes(term.toLowerCase())) : list

  const filteredPersonal = useMemo(() => filterByName(personalInitiatives, searchTerm), [personalInitiatives, searchTerm])
  const filteredShared = useMemo(() => filterByName(sharedInitiatives, searchTerm), [sharedInitiatives, searchTerm])

  const filteredInitiatives = useMemo(() => {
    let list: Initiative[]
    if (filterType === 'PRIVATE') list = filteredPersonal
    else if (filterType === 'SHARED') list = filteredShared
    else list = filterByName(initiatives, searchTerm)
    if (statusFilter === 'ALL') list = list.filter(i => i.status !== 'Archived')
    else if (statusFilter !== 'ALL_ALL') list = list.filter(i => i.status === statusFilter)
    if (memberFilter.length > 0) {
      list = list.filter(i => memberFilter.some(mid => i.members.some((m: any) => m.id === mid) || i.owner.id === mid))
    }
    return list
  }, [filterType, initiatives, searchTerm, filteredPersonal, filteredShared, statusFilter, memberFilter])

  const elementCount = filteredPersonal.length + filteredShared.length

  const sortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Updated Date'

  const sorted = useMemo(() => [...filteredInitiatives].sort((a, b) => {
    if (sortBy === 'NAME')               return a.title.localeCompare(b.title)
    if (sortBy === 'START_DATE')         return a.startDate.localeCompare(b.startDate)
    if (sortBy === 'END_DATE')           return a.endDate.localeCompare(b.endDate)
    if (sortBy === 'NUMBER_OF_INSIGHTS') return b.insightCount - a.insightCount
    return b.changedOn.localeCompare(a.changedOn)
  }), [filteredInitiatives, sortBy])

  const total = sorted.length
  const paged = sorted.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  // Cards currently visible in card view (for "select all" scope)
  const visibleCardsForSelection = useMemo(() => {
    if (filterType === 'ALL') return [...filteredPersonal.slice(0, CARD_PREVIEW_SIZE), ...filteredShared.slice(0, CARD_PREVIEW_SIZE)]
    if (filterType === 'PRIVATE') return filteredPersonal.slice(cardPagePrivate * CARD_PAGE_SIZE, (cardPagePrivate + 1) * CARD_PAGE_SIZE)
    return filteredShared.slice(cardPageShared * CARD_PAGE_SIZE, (cardPageShared + 1) * CARD_PAGE_SIZE)
  }, [filterType, filteredPersonal, filteredShared, cardPagePrivate, cardPageShared])

  const allVisibleSelected = visibleCardsForSelection.length > 0 && visibleCardsForSelection.every(i => selectedIds.has(i.id))
  const someVisibleSelected = visibleCardsForSelection.some(i => selectedIds.has(i.id))

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const newInit: Initiative = {
      id: `init-${Date.now()}`,
      title: newTitle,
      description: '',
      owner: { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' },
      members: [{ id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' }],
      status: newStatus,
      type: 'Private',
      insightCount: 0,
      valueCaseCount: 0,
      changedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startDate: '', endDate: '', about: '', commentCount: 0,
      visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [],
    }
    INITIATIVES.unshift(newInit)
    setCreateOpen(false); setNewTitle(''); setNewStatus('In Progress')
    navigate('/initiatives/' + newInit.id)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      const idx = INITIATIVES.findIndex(i => i.id === deletingId)
      if (idx !== -1) INITIATIVES.splice(idx, 1)
      setInitiatives(prev => prev.filter(i => i.id !== deletingId))
      setDeletingId(null)
    }
    setDeleteOpen(false)
    showToast('Initiative deleted')
  }

  const handleResetFilters = () => { setFilters({}); setFilterType('ALL'); setCardPagePrivate(0); setCardPageShared(0) }

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    { Header: 'Name',        accessor: 'title',          minWidth: 200, Cell: NameCell },
    { Header: 'Status',      accessor: 'status',         width: 150, disableResizing: true, Cell: StatusCell },
    ...(filterType === 'ALL' ? [{ Header: 'Type', accessor: 'type', width: 100, disableResizing: true, Cell: TypeCell } as AnalyticalTableColumnDefinition] : []),
    { Header: 'Insights',    accessor: 'insightCount',   width: 90,  disableResizing: true, disableSortBy: true, Cell: InsightsCell },
    { Header: 'Value Cases', accessor: 'valueCaseCount', width: 110, disableResizing: true, disableSortBy: true, Cell: ValueCasesCell },
    { Header: 'Members',     accessor: 'members',        width: 180, disableResizing: true, disableSortBy: true, Cell: MembersCell },
    { Header: 'Changed On',  accessor: 'changedOn',      width: 130, disableResizing: true, Cell: ChangedOnCell },
    {
      id: '__comments', Header: '', accessor: 'commentCount', width: 80, maxWidth: 80,
      disableResizing: true, disableSortBy: true, Cell: CommentsCell,
    },
    {
      id: '__actions', Header: '', accessor: 'id', width: 44,
      disableResizing: true, disableSortBy: true,
      Cell: (props: any) => <ActionsCell {...props} onDelete={(id: string) => { setDeletingId(id); setDeleteOpen(true) }} />,
    },
  ], [filterType])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <DynamicPage
        headerPinned
        hidePinButton
        style={{ height: '100%' }}
        titleArea={
          <DynamicPageTitle
            heading={<Title>Initiatives</Title>}
            snappedHeading={<Title>Initiatives</Title>}
            subheading={
              <FlexBox direction={FlexBoxDirection.Column}>
                {/* CTA launcher cards — use default UI5 Card styling, no custom border/shadow */}
                <FlexBox
                  wrap={FlexBoxWrap.Wrap}
                  direction={FlexBoxDirection.Row}
                  style={{ gap: 16, marginBlock: '0.75rem' }}
                >
                  <Card
                    accessibleName="Create Initiative"
                    className="cta-card"
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="Create Initiative"
                        subtitleText="Start with a blank initiative"
                        interactive
                        avatar={<SigDomainObject object="Initiative" size="S" aria-label="Create Initiative" />}
                        onClick={() => setCreateOpen(true)}
                      />
                    }
                  />
                  <Card
                    accessibleName="Discover Initiatives"
                    className="cta-card"
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="Discover Initiatives"
                        subtitleText="Explore Transformation Advisory"
                        interactive
                        avatar={<SigDomainObject object="Action" size="S" aria-label="Discover Initiatives" />}
                        onClick={() => setDiscoverOpen(true)}
                      />
                    }
                  />
                </FlexBox>
              </FlexBox>
            }
          />
        }
      >
        <SigTableWrapper
          viewSwitcher={['table', 'card']}
          activeView={viewType}
          onActiveViewChange={(v: any) => setViewType(v as 'table' | 'card')}
          searchSlot={
            <ToolbarItem>
              <Input
                placeholder="Search for Initiative Names"
                value={searchTerm}
                onInput={(e: any) => { setFilters(f => ({ ...f, search: (e.target as any).value ?? '' })); setCurrentPage(0) }}
                showClearIcon
                icon={<Icon name="search" slot="icon" />}
                style={{ width: 210 }}
              />
            </ToolbarItem>
          }
          filterBarSlot={
            <SigFilterBar
              filters={filters}
              onFiltersChange={(f) => { setFilters(f); setCurrentPage(0) }}
              defaultFilters={{}}
              defaultVisibleFilterKeys={['status', 'members']}
            >
              <SigFilter filterKey="status" label="Status">
                <SingleSelect
                  options={[
                    { value: 'ALL_ALL', label: 'All' },
                    { value: 'ALL', label: 'All (excluding Archived)' },
                    ...STATUS_OPTIONS.map(s => ({ value: s, label: s })),
                  ]}
                />
              </SigFilter>
              <SigFilter filterKey="members" label="Members">
                <MultiSelect
                  options={[
                    { value: 'jh', label: 'Josephine Holt' },
                    { value: 'sc', label: 'Sarah Chen' },
                    { value: 'wp', label: 'William Park' },
                    { value: 'ic', label: 'Isabel Cruz' },
                    { value: 'dh', label: 'David Hughes' },
                    { value: 'oi', label: 'Omar Ibrahim' },
                  ]}
                />
              </SigFilter>
            </SigFilterBar>
          }
          titleSlot={
            <ToolbarItem>
              <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
                <div className="initiatives-seg">
                  <SegmentedButton
                    onSelectionChange={(e: any) => {
                      const filter = e.detail?.selectedItems?.[0]?.dataset?.filter as FilterType
                      if (filter) { setFilterType(filter); setCurrentPage(0); setCardPagePrivate(0); setCardPageShared(0) }
                    }}
                  >
                    <SegmentedButtonItem
                      data-filter="ALL"
                      selected={filterType === 'ALL'}
                      title="Show all initiatives"
                    >
                      All ({elementCount})
                    </SegmentedButtonItem>
                    <SegmentedButtonItem
                      data-filter="PRIVATE"
                      selected={filterType === 'PRIVATE'}
                      tooltip="Only you can see and edit"
                    >
                      My Private Initiatives ({filteredPersonal.length})
                    </SegmentedButtonItem>
                    <SegmentedButtonItem
                      data-filter="SHARED"
                      selected={filterType === 'SHARED'}
                      tooltip="People added to shared initiatives can view and/or edit"
                    >
                      My Shared Initiatives ({filteredShared.length})
                    </SegmentedButtonItem>
                  </SegmentedButton>
                </div>
                {viewType === 'card' && !cardSelectionMode && (
                  <Button
                    design="Default"
                    icon="multiselect-all"
                    onClick={() => setCardSelectionMode(true)}
                    title="Select multiple initiatives"
                  >
                    Select
                  </Button>
                )}
                {viewType === 'card' && cardSelectionMode && (
                  <Button
                    design="Transparent"
                    onClick={exitSelectionMode}
                  >
                    Cancel
                  </Button>
                )}
              </FlexBox>
            </ToolbarItem>
          }
          sortSlot={
            <ToolbarItem>
              <Button
                id="init-sort-btn"
                design="Transparent"
                endIcon="slim-arrow-down"
                onClick={() => {
                  if (sortPopoverRef.current) {
                    sortPopoverRef.current.opener = 'init-sort-btn'
                    sortPopoverRef.current.open = true
                  }
                }}
              >
                Sort by {sortLabel}
              </Button>
              <Popover
                ref={sortPopoverRef}
                placement="Bottom"
                horizontalAlign="Start"
                hideArrow
                className="no-padding-popover"
                style={{ minWidth: '200px' }}
                onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
              >
                <List
                  separators="None"
                  selectionMode="Single"
                  onItemClick={(e: any) => {
                    const key = (e.detail.item as HTMLElement).dataset.sortKey
                    if (key) { setSortBy(key); setCurrentPage(0); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.key}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 3px', height: '32px' }}>
                        <Text style={{ fontSize: 'var(--sapFontSize)' }}>{opt.label}</Text>
                      </div>
                    </ListItemCustom>
                  ))}
                </List>
              </Popover>
            </ToolbarItem>
          }
          paginationSlot={viewType === 'table' ? (
            <SigPagination
              totalItems={total}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onPageChange={(p: number) => setCurrentPage(p)}
              showTotal
            />
          ) : undefined}
        >
          {/* ── Card view ── */}
          {viewType === 'card' ? (
            <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* ── Selection mode action bar ── */}
              {cardSelectionMode && (
                <div className="initiative-selection-bar">
                  {/* Left: checkbox + "Select All" label + count chip — matches Figma spec */}
                  <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.75rem' }}>
                    <CheckBox
                      checked={allVisibleSelected}
                      indeterminate={!allVisibleSelected && someVisibleSelected}
                      onChange={(e: any) => handleSelectAll((e.target as any).checked)}
                      style={{ marginLeft: '-0.5rem' }}
                    />
                    <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>
                      Select All
                    </Text>
                    <SigChipV2
                      value={`Selected: ${selectedIds.size} of ${visibleCardsForSelection.length}`}
                    />
                  </FlexBox>
                  {/* Right: bulk actions — only enabled when something is selected */}
                  <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
                    <Button
                      design="Default"
                      disabled={selectedIds.size === 0}
                      id="bulk-status-btn"
                      endIcon="slim-arrow-down"
                      onClick={() => {
                        if (bulkStatusPopoverRef.current) {
                          bulkStatusPopoverRef.current.opener = 'bulk-status-btn'
                          bulkStatusPopoverRef.current.open = true
                        }
                      }}
                    >
                      Change Status
                    </Button>
                    <Button
                      design="Negative"
                      icon="delete"
                      disabled={selectedIds.size === 0}
                      onClick={() => setBulkDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                    <Popover
                      ref={bulkStatusPopoverRef}
                      placement="Bottom"
                      horizontalAlign="Start"
                      hideArrow
                      className="no-padding-popover"
                      style={{ minWidth: '180px' }}
                      onClose={() => { if (bulkStatusPopoverRef.current) bulkStatusPopoverRef.current.open = false }}
                    >
                      <List
                        separators="None"
                        selectionMode="Single"
                        onItemClick={(e: any) => {
                          const status = (e.detail.item as HTMLElement).dataset.status as ItemStatus
                          if (status) {
                            if (bulkStatusPopoverRef.current) bulkStatusPopoverRef.current.open = false
                            handleBulkChangeStatus(status)
                          }
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <ListItemCustom key={s} type="Active" data-status={s} accessibleName={s}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 3px', height: '32px' }}>
                              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{s}</Text>
                            </div>
                          </ListItemCustom>
                        ))}
                      </List>
                    </Popover>
                  </FlexBox>
                </div>
              )}

              {/* ── ALL mode: preview both sections, 6 cards each ── */}
              {filterType === 'ALL' && (
                <>
                  {/* Private preview */}
                  <div>
                    <InitiativeSectionHeader
                      title={`My Private Initiatives (${filteredPersonal.length})`}
                      isPrivate
                      subtitle="Only you can see and edit"
                    />
                    <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: '1rem', marginBottom: '0.75rem' }}>
                      {filteredPersonal.slice(0, CARD_PREVIEW_SIZE).map(init => (
                        <InitiativeCard
                          key={init.id}
                          init={init}
                          onClick={() => navigate('/initiatives/' + init.id)}
                          selectionMode={cardSelectionMode}
                          selected={selectedIds.has(init.id)}
                          onSelect={handleSelectCard}
                        />
                      ))}
                      {filteredPersonal.length === 0 && (
                        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No private initiatives yet.</Text>
                      )}
                    </FlexBox>
                    {filteredPersonal.length > CARD_PREVIEW_SIZE && (
                      <Button
                        design="Transparent"
                        endIcon="slim-arrow-right"
                        onClick={() => { setFilterType('PRIVATE'); setCardPagePrivate(0) }}
                      >
                        View all {filteredPersonal.length} private initiatives
                      </Button>
                    )}
                  </div>

                  {/* Shared preview */}
                  <div>
                    <InitiativeSectionHeader
                      title={`My Shared Initiatives (${filteredShared.length})`}
                      isPrivate={false}
                      subtitle="People added to the initiative can view and/or edit"
                    />
                    <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: '1rem', marginBottom: '0.75rem' }}>
                      {filteredShared.slice(0, CARD_PREVIEW_SIZE).map(init => (
                        <InitiativeCard
                          key={init.id}
                          init={init}
                          onClick={() => navigate('/initiatives/' + init.id)}
                          selectionMode={cardSelectionMode}
                          selected={selectedIds.has(init.id)}
                          onSelect={handleSelectCard}
                        />
                      ))}
                      {filteredShared.length === 0 && (
                        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No shared initiatives available.</Text>
                      )}
                    </FlexBox>
                    {filteredShared.length > CARD_PREVIEW_SIZE && (
                      <Button
                        design="Transparent"
                        endIcon="slim-arrow-right"
                        onClick={() => { setFilterType('SHARED'); setCardPageShared(0) }}
                      >
                        View all {filteredShared.length} shared initiatives
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* ── PRIVATE mode: full paginated list ── */}
              {filterType === 'PRIVATE' && (() => {
                const pagedPrivate = filteredPersonal.slice(cardPagePrivate * CARD_PAGE_SIZE, (cardPagePrivate + 1) * CARD_PAGE_SIZE)
                return (
                  <div>
                    <InitiativeSectionHeader
                      title={`My Private Initiatives (${filteredPersonal.length})`}
                      isPrivate
                      subtitle="Only you can see and edit"
                    />
                    <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: '1rem', marginBottom: '1rem' }}>
                      {pagedPrivate.map(init => (
                        <InitiativeCard
                          key={init.id}
                          init={init}
                          onClick={() => navigate('/initiatives/' + init.id)}
                          selectionMode={cardSelectionMode}
                          selected={selectedIds.has(init.id)}
                          onSelect={handleSelectCard}
                        />
                      ))}
                      {filteredPersonal.length === 0 && (
                        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No private initiatives yet.</Text>
                      )}
                    </FlexBox>
                    {filteredPersonal.length > CARD_PAGE_SIZE && (
                      <SigPagination
                        totalItems={filteredPersonal.length}
                        currentPage={cardPagePrivate}
                        pageSize={CARD_PAGE_SIZE}
                        onPageChange={(p: number) => setCardPagePrivate(p)}
                        showTotal
                      />
                    )}
                  </div>
                )
              })()}

              {/* ── SHARED mode: full paginated list ── */}
              {filterType === 'SHARED' && (() => {
                const pagedShared = filteredShared.slice(cardPageShared * CARD_PAGE_SIZE, (cardPageShared + 1) * CARD_PAGE_SIZE)
                return (
                  <div>
                    <InitiativeSectionHeader
                      title={`My Shared Initiatives (${filteredShared.length})`}
                      isPrivate={false}
                      subtitle="People added to the initiative can view and/or edit"
                    />
                    <FlexBox wrap={FlexBoxWrap.Wrap} style={{ gap: '1rem', marginBottom: '1rem' }}>
                      {pagedShared.map(init => (
                        <InitiativeCard
                          key={init.id}
                          init={init}
                          onClick={() => navigate('/initiatives/' + init.id)}
                          selectionMode={cardSelectionMode}
                          selected={selectedIds.has(init.id)}
                          onSelect={handleSelectCard}
                        />
                      ))}
                      {filteredShared.length === 0 && (
                        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No shared initiatives available.</Text>
                      )}
                    </FlexBox>
                    {filteredShared.length > CARD_PAGE_SIZE && (
                      <SigPagination
                        totalItems={filteredShared.length}
                        currentPage={cardPageShared}
                        pageSize={CARD_PAGE_SIZE}
                        onPageChange={(p: number) => setCardPageShared(p)}
                        showTotal
                      />
                    )}
                  </div>
                )
              })()}

            </div>

          /* ── Table view ── */
          ) : paged.length === 0 ? (() => {
            const hasActiveFilters = searchTerm || statusFilter !== 'ALL'
            if (hasActiveFilters) return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IllustratedMessage name="NoFilterResults" titleText="No initiatives found"
                  subtitleText="Try adjusting your search or filters." />
                <Button design="Default" onClick={handleResetFilters}>Reset to default</Button>
              </div>
            )
            if (filterType === 'PRIVATE') return (
              <IllustratedMessage name="NoData" titleText="No private initiatives"
                subtitleText="You have no private initiatives yet." />
            )
            if (filterType === 'SHARED') return (
              <IllustratedMessage name="NoData" titleText="No shared initiatives available"
                subtitleText="No initiatives have been shared with you." />
            )
            return (
              <IllustratedMessage name="NoData" titleText="No initiatives created"
                subtitleText="Create your first initiative to get started." />
            )
          })() : (
            <AnalyticalTable
              data={paged}
              columns={columns}
              rowHeight={44}
              headerRowHeight={32}
              visibleRows={paged.length}
              minRows={1}
              scaleWidthMode="Grow"
              selectionMode="None"
              style={{ width: '100%' }}
              noDataText=""
              onRowClick={(e: any) => {
                const row = (e.detail as any)?.row?.original as Initiative | undefined
                if (row) navigate('/initiatives/' + row.id)
              }}
            />
          )}
        </SigTableWrapper>
      </DynamicPage>

      {/* ── Create dialog ── */}
      <Dialog open={createOpen} headerText="Create Initiative" style={{ width: '480px' }} onClose={() => setCreateOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Label required showColon>Title</Label>
            <Input value={newTitle} onInput={(e: any) => setNewTitle((e.target as any).value ?? '')}
              placeholder="Initiative title" style={{ width: '100%' }} />
          </div>
          <div>
            <Label showColon>Status</Label>
            <Select onChange={(e: any) => setNewStatus((e.detail.selectedOption as HTMLElement).textContent as ItemStatus)} style={{ width: '100%' }}>
              {STATUS_OPTIONS.map(s => <Option key={s} selected={s === newStatus}>{s}</Option>)}
            </Select>
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
          <Button slot="endContent" design="Transparent" onClick={() => { setCreateOpen(false); setNewTitle('') }}>Cancel</Button>
        </Bar>
      </Dialog>

      <MessageBox
        open={deleteOpen} type="Warning" titleText="Delete Initiative"
        onClose={(e: any) => {
          if (e.detail?.action === 'OK') handleDeleteConfirm()
          else { setDeleteOpen(false); setDeletingId(null) }
        }}
      >
        Are you sure you want to delete this initiative? This action cannot be undone.
      </MessageBox>

      <MessageBox
        open={bulkDeleteOpen} type="Warning" titleText={`Delete ${selectedIds.size} Initiative${selectedIds.size !== 1 ? 's' : ''}`}
        onClose={(e: any) => {
          if (e.detail?.action === 'OK') handleBulkDelete()
          else setBulkDeleteOpen(false)
        }}
      >
        Are you sure you want to delete {selectedIds.size} initiative{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.
      </MessageBox>

      <DiscoverInitiativesDialog open={discoverOpen} onClose={() => { setDiscoverOpen(false); setDiscoverInitialSubFlow('none') }} initialSubFlow={discoverInitialSubFlow} />
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}
