import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DynamicPage,
  DynamicPageTitle,
  Title,
  Text,
  Button,
  AnalyticalTable,
  type AnalyticalTableColumnDefinition,
  SegmentedButton,
  SegmentedButtonItem,
  ToolbarItem,
  Card,
  CardHeader,
  Dialog,
  Bar,
  Input,
  Label,
  Icon,
  FlexBox,
  FlexBoxWrap,
  FlexBoxDirection,
  FlexBoxAlignItems,
  ProgressIndicator,
  Avatar,
  Popover,
  List,
  ListItemCustom,
} from '@ui5/webcomponents-react'
import {
  SigChipV2,
  SigDomainObject,
  SigTableWrapper,
  SigFilterBar,
  SigFilter,
  SingleSelect,
  type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import {
  INITIATIVES,
  VALUE_CASES,
  STATUS_CHIP_DESIGN,
  OBJECTIVES as PTM_OBJECTIVES,
  type Objective,
  type Initiative,
} from '../../data/ptm'
// Map old initiativesCentral obj IDs → ptm.ts objective IDs (for initiative linking)
const OLD_TO_NEW_OBJ_ID: Record<string, string> = {
  'obj-1': 'obj-reduce-cost',
  'obj-2': 'obj-talent-development',
  'obj-3': 'obj-digital-transformation',
  'obj-4': 'obj-expand-market',
  'obj-5': 'obj-sustainability',
}
import BusinessChallengesWizard from './components/DiscoverInitiatives/BusinessChallengesWizard'
import PulseCheckWizard from './components/DiscoverInitiatives/PulseCheckWizard'

// ─── Types ────────────────────────────────────────────────────────────────────

type EntityFilter = 'all' | 'objectives' | 'initiatives' | 'valueCases' | 'assignedToMe'

interface TreeRow {
  _type: 'objective' | 'initiative' | 'valueCase' | 'group'
  _id: string
  _name: string
  _status: string
  _ownerName: string
  _ownerInitials: string
  _changedOn: string
  _progress: number | undefined
  subRows?: TreeRow[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseRaw(raw: string): number {
  if (!raw || raw === '-') return 0
  const n = parseFloat(raw.replace(/[KkMmBb].*/, ''))
  if (/K/i.test(raw)) return n * 1_000
  if (/M/i.test(raw)) return n * 1_000_000
  return n
}

function parseMetric(s: string): number {
  const normalized = s
    .replace(/,(\d{3})\b/g, '$1')   // thousands separator: 1,045 → 1045
    .replace(/,(\d{1,2})\b/g, '.$1') // decimal comma: 61,0 → 61.0
  const match = normalized.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

function vcProgress(vc: { baseline: string; current: string; target: string }): number {
  const b = parseMetric(vc.baseline)
  const c = parseMetric(vc.current)
  const t = parseMetric(vc.target)
  if (b === t) return 0
  return Math.min(100, Math.max(0, Math.round(((c - b) / (t - b)) * 100)))
}

function vcChangedOn(vc: { realizedValueChangedOn?: string; baselineDateRangeFormatted: string }): string {
  if (vc.realizedValueChangedOn) return vc.realizedValueChangedOn
  const parts = vc.baselineDateRangeFormatted.split(' - ')
  return parts[parts.length - 1] ?? ''
}

function fmtEur(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`
  return `€${Math.round(n)}`
}

const OBJ_STATUS_DESIGN: Record<string, string> = {
  Active: 'indication6',
  Achieved: 'positive',
  'At Risk': 'negative',
  Draft: 'indication10',
}

// ─── KPI computation ──────────────────────────────────────────────────────────

function computeKpi(vcType: 'Profit and Loss' | 'Working Capital') {
  const vcs = VALUE_CASES.filter(vc => vc.type === vcType)
  const qualifiedInitIds = new Set(
    INITIATIVES
      .filter(i => i.status === 'In Progress' || i.status === 'At Risk')
      .map(i => i.id),
  )
  return {
    identified: vcs.reduce((sum, vc) => sum + parseRaw(vc.potentialValueRaw), 0),
    qualified: vcs
      .filter(vc => qualifiedInitIds.has(vc.initiativeId))
      .reduce((sum, vc) => sum + parseRaw(vc.potentialValueRaw), 0),
    realized: vcs.reduce((sum, vc) => sum + parseRaw(vc.realizedValueRaw), 0),
  }
}

// ─── KPI bar sub-component ────────────────────────────────────────────────────

function KpiBar({ label, identified, qualified, realized }: {
  label: string; identified: number; qualified: number; realized: number
}) {
  const items = [
    { key: 'identified', label: 'Identified', value: fmtEur(identified), hint: 'Uncovered raw opportunity' },
    { key: 'qualified',  label: 'Qualified',  value: fmtEur(qualified),  hint: 'Validated with business owners' },
    { key: 'realized',   label: 'Realized',   value: fmtEur(realized),   hint: 'Verified gains achieved' },
  ]
  return (
    <div style={{ flex: 1, border: '1px solid var(--sapGroup_ContentBorderColor)', borderRadius: 8, padding: '12px 20px', background: 'var(--sapBaseColor)', minWidth: 0 }}>
      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
        {label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {items.map((kpi, i) => (
          <React.Fragment key={kpi.key}>
            {i > 0 && <div style={{ width: 1, background: 'var(--sapGroup_ContentBorderColor)', margin: '0 20px', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: '700', color: 'var(--sapTextColor)', lineHeight: 1.2 }}>{kpi.value}</div>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginTop: 2 }}>{kpi.label}</Text>
              <Text style={{ fontSize: 11, color: 'var(--sapContent_NonInteractiveIconColor)', display: 'block', marginTop: 1 }}>{kpi.hint}</Text>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Recommendations ──────────────────────────────────────────────────────────

const RECOMMENDATIONS = [
  { type: 'initiative' as const, id: 'init-1',  reason: 'No value case qualified yet' },
  { type: 'objective'  as const, id: 'obj-4',   reason: 'Progress stalled for 30+ days' },
  { type: 'initiative' as const, id: 'init-s5', reason: '2 insights pending review' },
  { type: 'objective'  as const, id: 'obj-1',   reason: 'Owner not assigned' },
]

// ─── Build tree data ──────────────────────────────────────────────────────────

function buildInitiativeRow(init: typeof INITIATIVES[number]): TreeRow {
  const vcs = VALUE_CASES.filter(vc => vc.initiativeId === init.id)
  const potentialSum = vcs.reduce((sum, vc) => sum + parseRaw(vc.potentialValueRaw), 0)
  const realizedSum  = vcs.reduce((sum, vc) => sum + parseRaw(vc.realizedValueRaw), 0)
  const progress = potentialSum > 0 ? Math.round((realizedSum / potentialSum) * 100) : 0
  return {
    _type: 'initiative',
    _id: init.id,
    _name: init.title,
    _status: init.status,
    _ownerName: init.owner.name,
    _ownerInitials: init.owner.initials,
    _changedOn: init.changedOn,
    _progress: progress,
    subRows: vcs.map(vc => ({
      _type: 'valueCase',
      _id: vc.id,
      _name: vc.name,
      _status: '',
      _ownerName: '',
      _ownerInitials: '',
      _changedOn: vcChangedOn(vc),
      _progress: vcProgress(vc),
      subRows: [],
    })),
  }
}

function buildFullTree(): TreeRow[] {
  const objectiveRows: TreeRow[] = PTM_OBJECTIVES.map(obj => ({
    _type: 'objective',
    _id: obj.id,
    _name: obj.name ?? obj.title ?? '',
    _status: obj.status,
    _ownerName: obj.owner.name,
    _ownerInitials: obj.owner.initials,
    _changedOn: obj.dueDate,
    _progress: obj.progress ?? 0,
    subRows: INITIATIVES
      .filter(i => i.linkedObjectiveIds.some(oldId => OLD_TO_NEW_OBJ_ID[oldId] === obj.id))
      .map(buildInitiativeRow),
  }))

  const unlinkedInits = INITIATIVES.filter(i => i.linkedObjectiveIds.length === 0)
  return [
    {
      _type: 'group',
      _id: 'objectives-group',
      _name: 'Objectives',
      _status: '',
      _ownerName: '',
      _ownerInitials: '',
      _changedOn: '',
      _progress: undefined,
      subRows: objectiveRows,
    },
    {
      _type: 'group',
      _id: 'unlinked',
      _name: 'Unlinked Initiatives',
      _status: '',
      _ownerName: '',
      _ownerInitials: '',
      _changedOn: '',
      _progress: undefined,
      subRows: unlinkedInits.map(buildInitiativeRow),
    },
  ]
}

const SORT_OPTIONS = [
  { key: 'name-asc',  label: 'Name (A–Z)' },
  { key: 'name-desc', label: 'Name (Z–A)' },
  { key: 'status',    label: 'Status' },
  { key: 'owner',     label: 'Owner' },
  { key: 'date',      label: 'Last Update' },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StrategyExecution() {
  const navigate = useNavigate()
  const sortPopoverRef = useRef<any>(null)

  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')
  const [search, setSearch] = useState('')
  const [tableFilters, setTableFilters] = useState<FilterValues>({})
  const [sortBy, setSortBy] = useState('name-asc')

  const [createInitOpen, setCreateInitOpen] = useState(false)
  const [newInitTitle, setNewInitTitle] = useState('')

  const [aiWizardOpen, setAiWizardOpen] = useState(false)
  const [pulseCheckOpen, setPulseCheckOpen] = useState(false)

  const statusFilter   = (tableFilters['status']   as string) || 'ALL'
  const ownerFilter    = (tableFilters['owner']    as string) || 'all'
  const progressFilter = (tableFilters['progress'] as string) || 'all'

  const pnlKpi   = useMemo(() => computeKpi('Profit and Loss'), [])
  const wcKpi    = useMemo(() => computeKpi('Working Capital'), [])
  const fullTree = useMemo(() => buildFullTree(), [])

  const initialExpanded = useMemo(() => {
    const result: Record<string, boolean> = {}
    fullTree.forEach((row, i) => {
      result[String(i)] = true
      ;(row.subRows ?? []).forEach((_, j) => {
        result[`${i}.${j}`] = true
      })
    })
    return result
  }, [fullTree])

  const ownerOptions = useMemo(() => {
    const owners = new Map<string, string>()
    INITIATIVES.forEach(i => owners.set(i.owner.name, i.owner.name))
    PTM_OBJECTIVES.forEach(obj => owners.set(obj.owner.name, obj.owner.name))
    return [
      { value: 'all', label: 'All' },
      ...Array.from(owners.keys()).map(name => ({ value: name, label: name })),
    ]
  }, [])

  const displayData = useMemo<TreeRow[]>(() => {
    const q = search.toLowerCase()
    const matchesSearch   = (name: string) => !q || name.toLowerCase().includes(q)
    const matchesStatus   = (status: string) => statusFilter === 'ALL' || statusFilter === 'ALL_ALL' || status === statusFilter
    const matchesOwner    = (ownerName: string) => ownerFilter === 'all' || ownerName === ownerFilter
    const matchesProgress = (progress: number | undefined) => {
      if (progressFilter === 'all' || progress === undefined) return true
      if (progressFilter === '0')     return progress === 0
      if (progressFilter === '1-25')  return progress >= 1   && progress <= 25
      if (progressFilter === '26-50') return progress >= 26  && progress <= 50
      if (progressFilter === '51-75') return progress >= 51  && progress <= 75
      if (progressFilter === '76-99') return progress >= 76  && progress <= 99
      if (progressFilter === '100')   return progress === 100
      return true
    }

    if (entityFilter === 'assignedToMe') {
      return INITIATIVES
        .filter(i => i.owner.id === 'jh' && matchesSearch(i.title) && matchesStatus(i.status))
        .map(buildInitiativeRow)
    }

    if (entityFilter === 'objectives') {
      const objGroup = fullTree.find(r => r._id === 'objectives-group')
      return (objGroup?.subRows ?? [])
        .filter(row => matchesSearch(row._name) && matchesStatus(row._status) && matchesOwner(row._ownerName) && matchesProgress(row._progress))
        .map(row => ({ ...row, subRows: [] }))
    }

    if (entityFilter === 'initiatives') {
      return INITIATIVES
        .filter(i => matchesSearch(i.title) && matchesStatus(i.status))
        .map(buildInitiativeRow)
        .filter(row => matchesOwner(row._ownerName) && matchesProgress(row._progress))
    }

    if (!q && (statusFilter === 'ALL' || statusFilter === 'ALL_ALL') && ownerFilter === 'all' && progressFilter === 'all') return fullTree

    return fullTree
      .map(group => ({
        ...group,
        subRows: (group.subRows ?? [])
          .filter(row =>
            matchesSearch(row._name) ||
            (row.subRows ?? []).some(child =>
              matchesSearch(child._name) ||
              (child.subRows ?? []).some(gc => matchesSearch(gc._name)),
            ),
          )
          .map(row => ({
            ...row,
            subRows: (row.subRows ?? [])
              .filter(child =>
                (matchesSearch(child._name) && matchesStatus(child._status) && matchesOwner(child._ownerName) && matchesProgress(child._progress)) ||
                (child.subRows ?? []).some(gc => matchesSearch(gc._name)),
              )
              .map(child => ({
                ...child,
                subRows: (child.subRows ?? []).filter(gc => matchesSearch(gc._name) || matchesSearch(child._name)),
              })),
          }))
          .filter(row => matchesStatus(row._status) && matchesOwner(row._ownerName) && matchesProgress(row._progress)),
      }))
      .filter(group => (group.subRows ?? []).length > 0)
  }, [entityFilter, search, statusFilter, ownerFilter, progressFilter, fullTree])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateObjective = () => {
    const id = `obj-${Date.now()}`
    const newObj: Objective = {
      id,
      title: 'New Objective',
      description: '',
      owner: { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' },
      status: 'To Do',
      dueDate: '',
      parentObjectiveId: null,
      linkedInitiativeIds: [],
      createdOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      changedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      commentCount: 0,
      progress: 0,
      startDate: '',
      endDate: '',
    }
    PTM_OBJECTIVES.unshift(newObj)
    navigate(`/objectives/${id}`)
  }

  const handleCreateInitiative = () => {
    const title = newInitTitle.trim() || 'New Initiative'
    const newInit: Initiative = {
      id: `init-${Date.now()}`,
      title,
      description: '',
      owner: { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' },
      members: [{ id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' }],
      status: 'To Do',
      type: 'Private',
      insightCount: 0,
      valueCaseCount: 0,
      changedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startDate: '',
      endDate: '',
      about: '',
      commentCount: 0,
      visibility: 'private',
      linkedObjectiveIds: [],
      linkedInsightIds: [],
    }
    INITIATIVES.unshift(newInit)
    setCreateInitOpen(false)
    setNewInitTitle('')
    navigate('/initiatives/' + newInit.id)
  }

  // ─── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      Header: 'Name',
      accessor: '_name',
      Cell: ({ row }: any) => {
        const { _type, _name } = row.original
        const objectMap: Record<string, string> = { objective: 'Target Group', initiative: 'Initiative', valueCase: 'Value Case' }
        const isLink = _type === 'objective' || _type === 'initiative'

        if (_type === 'group') {
          return (
            <Text
              maxLines={1}
              style={{
                fontWeight: '600',
                color: 'var(--sapContent_LabelColor)',
                fontSize: 'var(--sapFontSmallSize)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {_name}
            </Text>
          )
        }

        return (
          <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: 8, paddingLeft: _type === 'valueCase' ? 32 : 0 }}>
            <SigDomainObject object={objectMap[_type] as any} size="XS" />
            <Text
              maxLines={1}
              style={{
                fontWeight: _type === 'objective' ? '600' : 'normal',
                color: isLink ? 'var(--sapLinkColor)' : undefined,
                cursor: isLink ? 'pointer' : 'default',
              }}
            >
              {_name}
            </Text>
          </FlexBox>
        )
      },
    },
    {
      Header: 'Progress',
      accessor: '_progress',
      width: 200,
      Cell: ({ row }: any) => {
        const { _progress } = row.original
        if (_progress === undefined) return null
        return (
          <div style={{ padding: '0 16px', width: '100%' }}>
            <ProgressIndicator value={_progress} displayValue={`${_progress}%`} style={{ width: '100%' }} />
          </div>
        )
      },
    },
    {
      Header: 'Status',
      accessor: '_status',
      width: 170,
      Cell: ({ row }: any) => {
        const { _type, _status } = row.original
        if (!_status || _type === 'valueCase') return null
        const design = _type === 'objective'
          ? (OBJ_STATUS_DESIGN[_status] ?? 'indication10')
          : (STATUS_CHIP_DESIGN[_status] ?? 'indication10')
        return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
            <SigChipV2 value={_status} condensed design={design as any} />
          </div>
        )
      },
    },
    {
      Header: 'Owner',
      accessor: '_ownerName',
      width: 160,
      Cell: ({ row }: any) => {
        const { _type, _ownerInitials } = row.original
        if (!_ownerInitials || _type === 'valueCase') return null
        return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
            <Avatar size="XS" initials={_ownerInitials} />
          </div>
        )
      },
    },
    {
      Header: 'Changed On',
      accessor: '_changedOn',
      width: 180,
      Cell: ({ row }: any) => {
        const { _changedOn } = row.original
        if (!_changedOn) return null
        return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{_changedOn}</Text>
      },
    },
  ], [])

  return (
    <>
      <DynamicPage
        style={{ height: '100%' }}
        hidePinButton
        headerPinned
        titleArea={
          <DynamicPageTitle
            heading={<Title level="H3">Strategy Execution</Title>}
            snappedHeading={<Title level="H3">Strategy Execution</Title>}
            subheading={
              <FlexBox direction={FlexBoxDirection.Column}>
                <FlexBox wrap={FlexBoxWrap.Wrap} direction={FlexBoxDirection.Row} style={{ gap: 16, marginBlock: '0.75rem' }}>
                  <Card
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="Create Objective"
                        subtitleText="Start with a blank objective"
                        interactive
                        avatar={<SigDomainObject object="Target Group" size="S" aria-label="Create Objective" />}
                        onClick={handleCreateObjective}
                      />
                    }
                  />
                  <Card
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="Create Initiative"
                        subtitleText="Start with a blank initiative"
                        interactive
                        avatar={<SigDomainObject object="Initiative" size="S" aria-label="Create Initiative" />}
                        onClick={() => { setNewInitTitle(''); setCreateInitOpen(true) }}
                      />
                    }
                  />
                  <Card
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="AI-Assisted Initiatives"
                        subtitleText="Start with an input"
                        interactive
                        avatar={<Icon name="ai" style={{ fontSize: '1.5rem', color: 'var(--sapAccentColor6)' }} />}
                        onClick={() => setAiWizardOpen(true)}
                      />
                    }
                  />
                  <Card
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText="Pre-Defined Initiatives"
                        subtitleText="Start from a survey or catalog"
                        interactive
                        avatar={<Icon name="org-chart" style={{ fontSize: '1.5rem', color: 'var(--sapAccentColor6)' }} />}
                        onClick={() => setPulseCheckOpen(true)}
                      />
                    }
                  />
                </FlexBox>
              </FlexBox>
            }
          />
        }
      >
        <>

          {/* ── Section A: Value Portfolio ─────────────────────────────────── */}
          <section>
            <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent="SpaceBetween" style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Value Portfolio</Text>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                Values shown based on your access
              </Text>
            </FlexBox>
            <FlexBox direction={FlexBoxDirection.Row} style={{ gap: 8 }}>
              <KpiBar label="Profit & Loss"   identified={pnlKpi.identified} qualified={pnlKpi.qualified} realized={pnlKpi.realized} />
              <KpiBar label="Working Capital" identified={wcKpi.identified}  qualified={wcKpi.qualified}  realized={wcKpi.realized} />
            </FlexBox>
          </section>

          {/* ── Section B: Recommended ─────────────────────────────────────── */}
          <section>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: 10 }}>
              Recommended
            </Text>
            <FlexBox wrap={FlexBoxWrap.Wrap} direction={FlexBoxDirection.Row} style={{ gap: 16 }}>
              {RECOMMENDATIONS.map(rec => {
                const name = rec.type === 'objective'
                  ? (PTM_OBJECTIVES.find(o => o.id === rec.id)?.title ?? rec.id)
                  : (INITIATIVES.find(i => i.id === rec.id)?.title ?? rec.id)
                return (
                  <Card
                    key={rec.id}
                    style={{ flex: '0 0 auto', width: 300, cursor: 'pointer' }}
                    header={
                      <CardHeader
                        titleText={name}
                        subtitleText={rec.reason}
                        interactive
                        avatar={<SigDomainObject object={rec.type === 'objective' ? 'Target Group' : 'Initiative'} size="S" />}
                        onClick={() => navigate(rec.type === 'objective' ? `/objectives/${rec.id}` : `/initiatives/${rec.id}`)}
                      />
                    }
                  />
                )
              })}
            </FlexBox>
          </section>

          {/* ── Section D: Tree table ──────────────────────────────────────── */}
          <section>
            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.75rem' }}>
                    <SegmentedButton
                      onSelectionChange={(e: any) => {
                        const item = e.detail?.selectedItem
                        if (item) setEntityFilter(item.dataset.key as EntityFilter)
                      }}
                    >
                      <SegmentedButtonItem data-key="all"          selected={entityFilter === 'all'}>All</SegmentedButtonItem>
                      <SegmentedButtonItem data-key="objectives"   selected={entityFilter === 'objectives'}>Objectives</SegmentedButtonItem>
                      <SegmentedButtonItem data-key="initiatives"  selected={entityFilter === 'initiatives'}>Initiatives</SegmentedButtonItem>
                      <SegmentedButtonItem data-key="valueCases"   selected={entityFilter === 'valueCases'}>Value Cases</SegmentedButtonItem>
                      <SegmentedButtonItem data-key="assignedToMe" selected={entityFilter === 'assignedToMe'}>Assigned to me</SegmentedButtonItem>
                    </SegmentedButton>
                  </FlexBox>
                </ToolbarItem>
              }
              searchSlot={
                <Input
                  placeholder="Search..."
                  style={{ width: '207px' }}
                  value={search}
                  onInput={(e: any) => setSearch(e.target.value)}
                />
              }
              filterBarSlot={
                <SigFilterBar
                  filters={tableFilters}
                  onFiltersChange={setTableFilters}
                  defaultFilters={{}}
                  defaultVisibleFilterKeys={['status']}
                >
                  <SigFilter filterKey="status" label="Status">
                    <SingleSelect
                      options={[
                        { value: 'ALL_ALL',     label: 'All' },
                        { value: 'Active',      label: 'Active' },
                        { value: 'Achieved',    label: 'Achieved' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'On Track',    label: 'On Track' },
                        { value: 'At Risk',     label: 'At Risk' },
                        { value: 'Completed',   label: 'Completed' },
                        { value: 'To Do',       label: 'To Do' },
                      ]}
                    />
                  </SigFilter>
                  <SigFilter filterKey="owner" label="Owner">
                    <SingleSelect options={ownerOptions} />
                  </SigFilter>
                  <SigFilter filterKey="progress" label="Progress">
                    <SingleSelect
                      options={[
                        { value: 'all',   label: 'All' },
                        { value: '0',     label: '0%' },
                        { value: '1-25',  label: '1–25%' },
                        { value: '26-50', label: '26–50%' },
                        { value: '51-75', label: '51–75%' },
                        { value: '76-99', label: '76–99%' },
                        { value: '100',   label: '100%' },
                      ]}
                    />
                  </SigFilter>
                </SigFilterBar>
              }
              sortSlot={
                <ToolbarItem>
                  <Button
                    id="se-sort-btn"
                    design="Transparent"
                    endIcon="slim-arrow-down"
                    onClick={() => {
                      if (sortPopoverRef.current) {
                        sortPopoverRef.current.opener = 'se-sort-btn'
                        sortPopoverRef.current.open = true
                      }
                    }}
                  >
                    Sort by {SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Name'}
                  </Button>
                  <Popover
                    ref={sortPopoverRef}
                    placement="Bottom"
                    horizontalAlign="Start"
                    hideArrow
                    className="no-padding-popover"
                    style={{ minWidth: '180px' }}
                    onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
                  >
                    <List
                      separators="None"
                      selectionMode="Single"
                      onItemClick={(e: any) => {
                        const key = (e.detail.item as HTMLElement).dataset.sortKey
                        if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                      }}
                    >
                      {SORT_OPTIONS.map(opt => (
                        <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.label}>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 3px', height: '32px' }}>
                            <Text style={{ fontSize: 'var(--sapFontSize)' }}>{opt.label}</Text>
                          </div>
                        </ListItemCustom>
                      ))}
                    </List>
                  </Popover>
                </ToolbarItem>
              }
            >
              <AnalyticalTable
                data={displayData}
                columns={columns}
                isTreeTable
                rowHeight={44}
                visibleRows={50}
                noDataText={search ? 'No results match your search' : 'No items to display'}
                selectionMode="None"
                infiniteScroll
                style={{ width: '100%' }}
                reactTableOptions={{ autoResetExpanded: false, initialState: { expanded: initialExpanded } }}
                onRowClick={(e: any) => {
                  const row = e.detail?.row?.original
                  if (!row) return
                  if (row._type === 'objective')  navigate(`/objectives/${row._id}`,  { state: { from: 'strategy-execution' } })
                  if (row._type === 'initiative') navigate(`/initiatives/${row._id}`, { state: { from: 'strategy-execution' } })
                }}
              />
            </SigTableWrapper>
          </section>

        </>
      </DynamicPage>

      {/* ── Create Initiative dialog ──────────────────────────────────────── */}
      <Dialog
        open={createInitOpen}
        headerText="Create Initiative"
        style={{ width: '480px' }}
        onClose={() => setCreateInitOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Label for="se-init-title" required>Title</Label>
          <Input
            id="se-init-title"
            placeholder="Initiative title"
            value={newInitTitle}
            onInput={(e: any) => setNewInitTitle(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleCreateInitiative} disabled={!newInitTitle.trim()}>
            Create
          </Button>
          <Button slot="endContent" design="Transparent" onClick={() => setCreateInitOpen(false)}>
            Cancel
          </Button>
        </Bar>
      </Dialog>

      <BusinessChallengesWizard open={aiWizardOpen} onClose={() => setAiWizardOpen(false)} />
      <PulseCheckWizard open={pulseCheckOpen} onClose={() => setPulseCheckOpen(false)} />
    </>
  )
}
