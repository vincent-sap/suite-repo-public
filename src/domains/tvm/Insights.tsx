import { useState, useEffect, useMemo, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader, Title, Text, Label,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Button, Dialog, Bar, Input, Select, Option, Avatar, Icon,
  Toast, MessageBox, IllustratedMessage,
  ToolbarItem, Popover, List, ListItemCustom, ListItemStandard,
  SegmentedButton, SegmentedButtonItem,
  SplitterLayout, SplitterElement,
  Tab, TextArea, Menu, MenuItem,
  type PopoverDomRef,
} from '@ui5/webcomponents-react'
import PopoverPlacement from '@ui5/webcomponents/dist/types/PopoverPlacement.js'
import PopoverHorizontalAlign from '@ui5/webcomponents/dist/types/PopoverHorizontalAlign.js'
import ListSeparators from '@ui5/webcomponents/dist/types/ListSeparator.js'
import AvatarSize from '@ui5/webcomponents/dist/types/AvatarSize.js'
import {
  SigTableWrapper, SigFilterBar, SigFilter, SingleSelect, MultiSelect,
  SigChipV2, SigRightSidePanel, SigRatingIndicator,
  type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import {
  INSIGHTS, INITIATIVES,
  INSIGHT_STATUS_COLOR,
  type Insight, type InsightStatus, type InsightSource,
} from '../../data/ptm'

const STATUS_OPTIONS: InsightStatus[] = ['Open', 'In Progress', 'Resolved', 'Rejected']
const SOURCE_OPTIONS: InsightSource[] = ['Process Insights', 'Benchmarking', 'Manual', 'Process Intelligence']

const STATUS_FILTER_OPTIONS = [
  { value: 'All', label: 'All' },
  ...STATUS_OPTIONS.map(s => ({ value: s, label: s })),
]
const ASSIGNEE_OPTIONS = [
  { value: 'sc', label: 'Sarah Chen' },
  { value: 'wp', label: 'William Park' },
  { value: 'ic', label: 'Isabel Cruz' },
  { value: 'dh', label: 'David Hughes' },
  { value: 'oi', label: 'Omar Ibrahim' },
]
const SORT_OPTIONS_INSIGHTS = [
  { key: 'Changed On' },
  { key: 'Newest' },
  { key: 'Title (A–Z)' },
  { key: 'Impact (high to low)' },
  { key: 'Urgency (high to low)' },
]

function StatusDot({ status }: { status: InsightStatus }) {
  return (
    <span style={{
      display: 'inline-block', width: '0.5rem', height: '0.5rem',
      borderRadius: '50%', background: INSIGHT_STATUS_COLOR[status],
      marginRight: '0.375rem', flexShrink: 0,
    }} aria-hidden="true" />
  )
}

type Tab = 'all' | 'assigned' | 'created'

function InsightStatusChip({ status, onStatusChange }: { status: InsightStatus; onStatusChange: (s: InsightStatus) => void }) {
  const [open, setOpen] = useState(false)
  const chipId = useId()
  return (
    <>
      <SigChipV2
        id={chipId}
        value={status}
        leadingIcon="circle-task-2"
        leadingIconColor={INSIGHT_STATUS_COLOR[status] as any}
        trailingIcon="slim-arrow-down"
        condensed
        onClick={() => setOpen(o => !o)}
      />
      <Popover
        opener={chipId}
        open={open}
        hideArrow
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setOpen(false)}
        className="no-padding-popover"
      >
        <List separators={ListSeparators.None}>
          {STATUS_OPTIONS.map(s => (
            <ListItemStandard
              key={s}
              selected={s === status}
              onClick={() => { onStatusChange(s); setOpen(false) }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="circle-task-2" style={{ color: INSIGHT_STATUS_COLOR[s], fontSize: '0.875rem' }} />
                <span>{s}</span>
              </div>
            </ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}

interface DetailPanelProps {
  insight: Insight
  onClose: () => void
  onStatusChange: (id: string, status: InsightStatus) => void
}

function InsightDetailPanel({ insight, onClose, onStatusChange }: DetailPanelProps) {
  const navigate = useNavigate()
  const [initMenuOpen, setInitMenuOpen] = useState(false)
  const [description, setDescription] = useState(insight.description)
  const [businessImpactVal, setBusinessImpactVal] = useState<number>(
    insight.businessImpact === 'High' ? 5 : insight.businessImpact === 'Medium' ? 3 : insight.businessImpact === 'Low' ? 1 : 0
  )
  const [urgencyVal, setUrgencyVal] = useState<number>(
    insight.urgency === 'Critical' ? 5 : insight.urgency === 'High' ? 4 : insight.urgency === 'Medium' ? 3 : insight.urgency === 'Low' ? 1 : 0
  )

  const linkedIds = insight.linkedInitiativeIds?.length
    ? insight.linkedInitiativeIds
    : insight.linkedInitiativeId ? [insight.linkedInitiativeId] : []
  const linkedInits = linkedIds.map(iid => INITIATIVES.find(i => i.id === iid)).filter(Boolean) as typeof INITIATIVES

  const subHeader = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Status</Label>
        <InsightStatusChip
          status={insight.status}
          onStatusChange={(s) => onStatusChange(insight.id, s)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Initiative</Label>
        {linkedInits.length === 0 ? (
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>None</Text>
        ) : (
          <>
            <div
              id="ins-page-initiative-select"
              role="button"
              onClick={() => setInitMenuOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                minWidth: 0, maxWidth: '100%', cursor: 'pointer',
                height: '2.25rem', padding: '0 0.5rem',
                border: '1px solid var(--sapField_BorderColor)',
                borderRadius: 'var(--sapField_BorderCornerRadius, 0.375rem)',
                background: 'var(--sapField_Background)',
              }}
            >
              <Icon name="overview-chart" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
              <Text style={{ color: 'var(--sapLinkColor)', flexShrink: 0 }}>Initiative</Text>
              <Text style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {linkedInits[0].title}
              </Text>
              <Icon name="slim-arrow-down" style={{ fontSize: '0.75rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, marginLeft: '0.25rem' }} />
            </div>
            <Menu
              opener="ins-page-initiative-select"
              open={initMenuOpen}
              onClose={() => setInitMenuOpen(false)}
              onItemClick={(e: any) => {
                const target = e.detail?.item?.dataset?.initId
                if (target) navigate('/initiatives/' + target)
                setInitMenuOpen(false)
              }}
            >
              {linkedInits.map(init => (
                <MenuItem key={init.id} text={init.title} icon="overview-chart" data-init-id={init.id} />
              ))}
            </Menu>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Assignee</Label>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {insight.assignees.length === 0
            ? <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>None</Text>
            : insight.assignees.map(a => (
              <Avatar key={a.id} initials={a.initials} colorScheme={a.colorScheme as never}
                size={AvatarSize.XS} accessibleName={a.name} title={a.name} />
            ))
          }
        </div>
      </div>
    </div>
  )

  return (
    <SigRightSidePanel
      headerTitle={insight.title}
      maxTitleLines={2}
      isOpen
      toggleRightSidePanel={onClose}
      useBoldText
      wrappingType="Wrap"
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden auto', background: 'var(--sapList_Background)' }}
      subHeaderSlot={subHeader}
      tabSlot={[
        <Tab key="details" text="Details" selected>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
            <div style={{ maxWidth: '100%', width: '599px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label>Description</Label>
                <TextArea
                  value={description}
                  rows={4}
                  maxlength={1024}
                  style={{ width: '100%' }}
                  onInput={(e: any) => setDescription(e.target.value ?? '')}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label wrappingType="None">Business Impact</Label>
                  <SigRatingIndicator
                    max={5}
                    filled={businessImpactVal}
                    onInputchange={(v: number) => setBusinessImpactVal(v)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label wrappingType="None">Urgency</Label>
                  <SigRatingIndicator
                    max={5}
                    filled={urgencyVal}
                    onInputchange={(v: number) => setUrgencyVal(v)}
                  />
                </div>
              </div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                Created {insight.createdDate}
              </Text>
              {linkedInits.length > 1 && (
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: '1.4' }}>
                  Insights are collaborative. When linked across multiple initiatives, updates are automatically reflected everywhere.
                </Text>
              )}
            </div>
          </div>
        </Tab>,
      ]}
    >{null}</SigRightSidePanel>
  )
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>(INSIGHTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [filters, setFilters] = useState<FilterValues>({})
  const [sortBy, setSortBy] = useState('Changed On')
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newStatus, setNewStatus] = useState<InsightStatus>('Open')
  const [newSource, setNewSource] = useState<InsightSource>('Manual')
  const [newInitiative, setNewInitiative] = useState('')

  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  useEffect(() => { document.title = 'Insights – SAP Signavio' }, [])

  const selectedInsight = selectedId ? insights.find(i => i.id === selectedId) ?? null : null

  const filtered = insights.filter(ins => {
    const statusVal = filters.status as string | undefined
    const assigneeVals = filters.assignees as string[] | undefined
    if (statusVal && statusVal !== 'All' && ins.status !== statusVal) return false
    if (assigneeVals && assigneeVals.length > 0 && !assigneeVals.some(av => ins.assignees.some(a => a.id === av))) return false
    return true
  })

  const tabFiltered = filtered.filter(ins => {
    if (activeTab === 'assigned') return ins.assignees.some(a => a.id === 'sc')
    if (activeTab === 'created') return ins.owner.id === 'sc'
    return true
  })

  const sortedFiltered = [...tabFiltered].sort((a, b) => {
    if (sortBy === 'Title (A–Z)') return a.title.localeCompare(b.title)
    if (sortBy === 'Newest') return b.createdDate.localeCompare(a.createdDate)
    return b.createdDate.localeCompare(a.createdDate)
  })

  const handleStatusChange = (id: string, status: InsightStatus) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    showToast('Status updated')
  }

  const handleCreate = () => {
    if (!newTitle.trim()) return
    const newInsight: Insight = {
      id: `ins-${Date.now()}`,
      title: newTitle,
      description: '',
      source: newSource,
      type: 'Issue',
      status: newStatus,
      owner: { id: 'sc', name: 'Sarah Chen', initials: 'SC', colorScheme: 'Accent1' },
      assignees: [],
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      linkedInitiativeId: newInitiative || null,
      commentCount: 0,
      businessImpact: null,
      urgency: null,
      linkedInitiativeIds: [],
    }
    setInsights(prev => [newInsight, ...prev])
    setCreateOpen(false)
    setNewTitle(''); setNewStatus('Open'); setNewSource('Manual'); setNewInitiative('')
    showToast('Insight created')
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      setInsights(prev => prev.filter(i => i.id !== deletingId))
      if (selectedId === deletingId) setSelectedId(null)
      setDeletingId(null)
    }
    setDeleteOpen(false)
    showToast('Deleted')
  }

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      Header: 'Title',
      accessor: 'title',
      minWidth: 200,
      Cell: ({ value }: any) => <Text style={{ fontWeight: '600' }}>{value}</Text>,
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: 130,
      Cell: ({ value }: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusDot status={value as InsightStatus} />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
        </div>
      ),
    },
    {
      Header: 'Initiative',
      accessor: 'linkedInitiativeId',
      minWidth: 150,
      Cell: ({ value }: any) => {
        const init = INITIATIVES.find(i => i.id === value)
        if (!init) return <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>—</Text>
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Icon name="overview-chart" style={{ fontSize: '0.875rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{init.title}</Text>
          </div>
        )
      },
    },
    {
      Header: 'Assignee',
      accessor: 'assignees',
      width: 120,
      disableSortBy: true,
      Cell: ({ value }: any) => (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {(value as Insight['assignees']).slice(0, 3).map((a: any) => (
            <Avatar key={a.id} initials={a.initials} colorScheme={a.colorScheme as never} size="XS" accessibleName={a.name} title={a.name} />
          ))}
          {value.length > 3 && (
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>+{value.length - 3}</Text>
          )}
        </div>
      ),
    },
    {
      Header: 'Changed On',
      accessor: 'createdDate',
      width: 120,
      Cell: ({ value }: any) => (
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{value}</Text>
      ),
    },
    {
      Header: 'Comments',
      accessor: 'commentCount',
      width: 100,
      Cell: ({ value }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Icon name="comment" style={{ fontSize: '0.875rem', color: 'var(--sapContent_IconColor)' }} />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
        </div>
      ),
    },
    {
      id: '__actions',
      Header: '',
      accessor: 'id',
      width: 60,
      disableResizing: true,
      disableSortBy: true,
      Cell: ({ value }: any) => (
        <Button design="Transparent" icon="overflow" tooltip="More options"
          onClick={e => { e.stopPropagation(); setDeletingId(value); setDeleteOpen(true) }} />
      ),
    },
  ], [])


  return (
    <>
      <SplitterLayout
        options={{ resetOnSizeChange: true, resetOnChildrenChange: true }}
        style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }}
      >
        <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <DynamicPage
            style={{ height: '100%', flex: 1 }}
            hidePinButton
            headerPinned
            titleArea={
              <DynamicPageTitle>
                <Title slot="heading" level="H3">Insights</Title>
                <Title slot="snappedHeading" level="H3">Insights</Title>
              </DynamicPageTitle>
            }
            headerArea={
              <DynamicPageHeader>
                <SigFilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  defaultFilters={{}}
                  defaultVisibleFilterKeys={['status', 'assignees']}
                >
                  <SigFilter filterKey="status" label="Status">
                    <SingleSelect options={STATUS_FILTER_OPTIONS} />
                  </SigFilter>
                  <SigFilter filterKey="assignees" label="Assignee">
                    <MultiSelect options={ASSIGNEE_OPTIONS} />
                  </SigFilter>
                </SigFilterBar>
              </DynamicPageHeader>
            }
          >
              <SigTableWrapper
                titleSlot={
                  <ToolbarItem>
                    <SegmentedButton>
                      <SegmentedButtonItem selected={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                        All ({filtered.length})
                      </SegmentedButtonItem>
                      <SegmentedButtonItem selected={activeTab === 'assigned'} onClick={() => setActiveTab('assigned')}>
                        Assigned to Me ({filtered.filter(i => i.assignees.some(a => a.id === 'sc')).length})
                      </SegmentedButtonItem>
                      <SegmentedButtonItem selected={activeTab === 'created'} onClick={() => setActiveTab('created')}>
                        Created by Me ({filtered.filter(i => i.owner.id === 'sc').length})
                      </SegmentedButtonItem>
                    </SegmentedButton>
                  </ToolbarItem>
                }
                businessActionsSlot={
                  <ToolbarItem>
                    <Button design="Emphasized" icon="add" onClick={() => setCreateOpen(true)}>Create Insight</Button>
                  </ToolbarItem>
                }
                sortSlot={
                  <ToolbarItem>
                    <Button
                      id="ins-sort-btn"
                      design="Transparent"
                      endIcon="slim-arrow-down"
                      onClick={() => {
                        if (sortPopoverRef.current) {
                          sortPopoverRef.current.opener = 'ins-sort-btn'
                          sortPopoverRef.current.open = true
                        }
                      }}
                    >
                      {`Sort by ${sortBy}`}
                    </Button>
                    <Popover
                      ref={sortPopoverRef}
                      placement="Bottom"
                      horizontalAlign="Start"
                      hideArrow
                      className="no-padding-popover"
                      style={{ width: 'fit-content', minWidth: '200px' }}
                      onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
                    >
                      <List separators="None" selectionMode="Single"
                        onItemClick={e => {
                          const key = (e.detail.item as HTMLElement).dataset.sortKey
                          if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                        }}
                      >
                        {SORT_OPTIONS_INSIGHTS.map(opt => (
                          <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.key}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 3px', height: '32px' }}>
                              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{opt.key}</Text>
                            </div>
                          </ListItemCustom>
                        ))}
                      </List>
                    </Popover>
                  </ToolbarItem>
                }
              >
                {sortedFiltered.length === 0 ? (
                  <IllustratedMessage
                    name="NoFilterResults"
                    titleText="No results found"
                    subtitleText="Try adjusting your filters or creating a new insight."
                  />
                ) : (
                  <AnalyticalTable
                    columns={columns}
                    data={sortedFiltered}
                    selectionMode="None"
                    visibleRowCountMode="Fixed"
                    visibleRows={sortedFiltered.length || 5}
                    noDataText="No insights found"
                    onRowClick={e => {
                      const row = (e.detail as any)?.row?.original as Insight | undefined
                      if (row) setSelectedId(row.id === selectedId ? null : row.id)
                    }}
                  />
                )}
              </SigTableWrapper>
            
          </DynamicPage>
        </SplitterElement>

        {selectedInsight && (
          <SplitterElement size="400px" minSize={400} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <InsightDetailPanel
              insight={selectedInsight}
              onClose={() => setSelectedId(null)}
              onStatusChange={handleStatusChange}
            />
          </SplitterElement>
        )}
      </SplitterLayout>

      <Dialog open={createOpen} headerText="Create Insight" style={{ width: '480px' }} onClose={() => setCreateOpen(false)}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Label required showColon>Title</Label>
            <Input value={newTitle} onInput={e => setNewTitle((e.target as unknown as HTMLInputElement).value)} placeholder="Insight title" style={{ width: '100%' }} />
          </div>
          <div>
            <Label showColon>Status</Label>
            <Select onChange={e => setNewStatus((e.target as unknown as { value: string }).value as InsightStatus)} style={{ width: '100%' }}>
              {STATUS_OPTIONS.map(s => <Option key={s} value={s} selected={newStatus === s}>{s}</Option>)}
            </Select>
          </div>
          <div>
            <Label showColon>Source</Label>
            <Select onChange={e => setNewSource((e.target as unknown as { value: string }).value as InsightSource)} style={{ width: '100%' }}>
              {SOURCE_OPTIONS.map(s => <Option key={s} value={s} selected={newSource === s}>{s}</Option>)}
            </Select>
          </div>
          <div>
            <Label showColon>Link to Initiative</Label>
            <Select onChange={e => setNewInitiative((e.target as unknown as { value: string }).value)} style={{ width: '100%' }}>
              <Option value="">None</Option>
              {INITIATIVES.map(i => <Option key={i.id} value={i.id} selected={newInitiative === i.id}>{i.title}</Option>)}
            </Select>
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setCreateOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <MessageBox
        open={deleteOpen}
        type="Warning"
        titleText="Delete Insight"
        onClose={(e: any) => {
          if (e.detail?.action === 'OK') handleDeleteConfirm()
          else { setDeleteOpen(false); setDeletingId(null) }
        }}
      >
        Are you sure you want to delete this insight? This action cannot be undone.
      </MessageBox>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}
