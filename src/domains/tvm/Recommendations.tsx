import { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Tag, Select, Option, Button, TabContainer, Tab, Icon,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  ToolbarItem,
} from '@ui5/webcomponents-react'
import {
  SigBreadcrumbs, SigBreadcrumbItem, SigTableWrapper,
  SigFilterBar, SigFilter, SingleSelect, type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/unfavorite.js'
import '@ui5/webcomponents-icons/dist/download.js'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface CorrectionRec {
  id: string
  finding: string
  recommendation: string
  count: number
  relevance: number
  impact: 1 | 2 | 3
  effort: 1 | 2 | 3
  valueDriver: string
  improvementOpp: string
  rootCause: string
}

interface InnovationRec {
  id: string
  recommendation: string
  sapOffering: string
  relevance: number
  industry: string
  type: string
  endToEnd: string[]
  linesOfBusiness: string[]
}

const CORRECTIONS: CorrectionRec[] = [
  { id: 'c1', finding: 'Less than 80% of purchase order items with a planning-relevant material have an item category of standard or third-party', recommendation: 'Train users to convert purchase requisition items into purchase orders using the standard processes', count: 1164, relevance: 4, impact: 3, effort: 2, valueDriver: 'Improve Procurement FTE Productivity', improvementOpp: 'Improve operational procurement FTE productivity', rootCause: 'Process Non-Compliance' },
  { id: 'c2', finding: '892 production orders were found where the scheduled end date is in the past and that are still open', recommendation: 'Set the production orders to technically completed', count: 892, relevance: 1, impact: 3, effort: 2, valueDriver: 'Reduce Overall Supply Chain Planning Cost', improvementOpp: '', rootCause: 'Obsolete Data' },
  { id: 'c3', finding: '199 open production orders were found where the basic end date is in the past', recommendation: 'Check if production orders should proceed or if sales order should be cancelled', count: 199, relevance: 1, impact: 3, effort: 2, valueDriver: 'Improve On-Time Delivery Performance', improvementOpp: 'Improve on-time delivery performance', rootCause: 'Obsolete Data' },
  { id: 'c4', finding: '153 open outbound deliveries were found where the planned goods issue date is in the past', recommendation: 'Close outbound deliveries for which goods issue posting is no longer possible', count: 153, relevance: 1, impact: 2, effort: 2, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data', rootCause: 'Obsolete Data' },
  { id: 'c5', finding: 'Less than 80% of stock transport order items with a planning-relevant material have an item category of standard', recommendation: 'Train users to convert stock transport requisition items into stock transport orders', count: 114, relevance: 3, impact: 3, effort: 2, valueDriver: 'Improve Procurement FTE Productivity', improvementOpp: 'Improve operational procurement FTE productivity', rootCause: 'Process Non-Compliance' },
  { id: 'c6', finding: '12 purchasing info records for single materials were found that have different net prices coming from different vendors', recommendation: 'Check why users are changing net prices coming from the info record or outline agreement', count: 100, relevance: 1, impact: 2, effort: 1, valueDriver: 'Improve User Compliance', improvementOpp: 'Reduce maverick buying behavior', rootCause: 'Master Data Issue' },
  { id: 'c7', finding: '70 open and overdue supplier credit memo items not related to returns are pending', recommendation: 'Check if money can be collected from the supplier or if the credit memo items should be closed', count: 70, relevance: 1, impact: 2, effort: 2, valueDriver: 'Improve Days Payable Outstanding', improvementOpp: 'Increase cash by collecting supplier credit memos', rootCause: 'Open Item' },
  { id: 'c8', finding: '42 error records were found from automatic goods movement postings', recommendation: 'Delete old and obsolete records', count: 42, relevance: 2, impact: 3, effort: 1, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data', rootCause: 'System Error' },
  { id: 'c9', finding: '38 open sales schedule lines in sales orders were found where the confirmed delivery date is in the past', recommendation: 'Reject sales order items where further delivery is not expected', count: 38, relevance: 1, impact: 2, effort: 2, valueDriver: 'Reduce Data Management Cost', improvementOpp: 'Reduce old and obsolete transactional data in sales', rootCause: 'Obsolete Data' },
]

const INNOVATIONS: InnovationRec[] = [
  { id: 'i1', recommendation: 'Inventory Management', sapOffering: 'SAP Taulia Inventory', relevance: 1, industry: '', type: 'Finance Optimization', endToEnd: ['Plan to Fulfill', 'Source to Pay'], linesOfBusiness: ['Finance', 'Supply Chain'] },
  { id: 'i2', recommendation: 'Access Governance', sapOffering: 'SAP Access Control for SAP S/4HANA', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: [], linesOfBusiness: ['Finance', 'Governance'] },
  { id: 'i3', recommendation: 'Advanced Product Quality Planning', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Plan to Fulfill', 'Source to Pay'], linesOfBusiness: ['Manufacturing'] },
  { id: 'i4', recommendation: 'Asset Fault and Incident Response Management', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Acquire to Decommission'], linesOfBusiness: ['Asset Management'] },
  { id: 'i5', recommendation: 'Computer Aided Design System Interoperability', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Idea to Market'], linesOfBusiness: ['R&D/Engineering'] },
  { id: 'i6', recommendation: 'Customer Claims Management', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Lead to Cash'], linesOfBusiness: ['Sales', 'Service'] },
  { id: 'i7', recommendation: 'Customer Service Analytics', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Plan to Fulfill', 'Source to Pay'], linesOfBusiness: ['Service'] },
  { id: 'i8', recommendation: 'Demand Driven MRP', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Plan to Fulfill', 'Source to Pay'], linesOfBusiness: ['Manufacturing', 'Supply Chain'] },
  { id: 'i9', recommendation: 'Dispute Management', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Lead to Cash'], linesOfBusiness: ['Finance'] },
  { id: 'i10', recommendation: 'Financial Lease Management', sapOffering: 'SAP S/4HANA Cloud Public Edition', relevance: 0, industry: '', type: 'Cloud ERP Capability', endToEnd: ['Acquire to Decommission', 'Governance'], linesOfBusiness: ['Finance'] },
]

const E2E_OPTIONS = ['All End-to-End Processes...', 'Acquire to Decommission', 'Lead to Cash', 'Plan to Fulfill', 'Source to Pay', 'Idea to Market', 'Governance']
const MODULAR_OPTIONS = ['All', 'Accounts Payable', 'Accounts Receivable', 'Asset Accounting', 'Procurement']
const SOURCE_SYSTEMS = ['QE4:006', 'QE4:007', 'PRD:001']
const ROOT_CAUSE_OPTIONS = [
  { value: 'All Root Causes', label: 'All Root Causes' },
  { value: 'Obsolete Data', label: 'Obsolete Data' },
  { value: 'Process Non-Compliance', label: 'Process Non-Compliance' },
  { value: 'Master Data Issue', label: 'Master Data Issue' },
  { value: 'Open Item', label: 'Open Item' },
  { value: 'System Error', label: 'System Error' },
]

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ScoreDots({ score, max = 3, color }: { score: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: i < score ? color : 'var(--sapList_BorderColor)' }} />
      ))}
    </div>
  )
}

// ─── Innovation cell renderers (pure, defined outside component) ──────────────

function InnRecCell({ value }: any) {
  return <Text style={{ color: 'var(--sapLinkColor)', cursor: 'pointer', fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
}
function InnOfferingCell({ value }: any) {
  return <Tag design="Set2" colorScheme="5" style={{ fontSize: '0.6875rem' }}>{value}</Tag>
}
function InnRelevanceCell({ value }: any) {
  return <ScoreDots score={value} max={3} color="#e9730c" />
}
function InnIndustryCell({ value }: any) {
  return <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{value || '—'}</Text>
}
function InnTypeCell({ value }: any) {
  return <Tag design="Set2" colorScheme="2" style={{ fontSize: '0.6875rem' }}>{value}</Tag>
}
function InnE2eCell({ value }: any) {
  const arr = value as string[]
  if (arr.length === 0) return <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>—</Text>
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      {arr.map((e: string) => <Tag key={e} design="Set2" colorScheme="6" style={{ fontSize: '0.6875rem' }}>{e}</Tag>)}
    </div>
  )
}
function InnLobCell({ value }: any) {
  const arr = value as string[]
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      {arr.map((l: string) => <Tag key={l} design="Set2" colorScheme="9" style={{ fontSize: '0.6875rem' }}>{l}</Tag>)}
    </div>
  )
}

// ─── Correction Recommendations table ────────────────────────────────────────

function CorrectionTable() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [corrFilters, setCorrFilters] = useState<FilterValues>({})

  const toggleFav = useCallback((id: string) => setFavorites(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  }), [])

  const rootCauseVal = (corrFilters.rootCause as string | undefined) ?? 'All Root Causes'
  const filtered = useMemo(
    () => CORRECTIONS.filter(r => !rootCauseVal || rootCauseVal === 'All Root Causes' || r.rootCause === rootCauseVal),
    [rootCauseVal],
  )

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      id: '__fav', Header: '', accessor: 'id', width: 44,
      disableResizing: true, disableSortBy: true,
      Cell: ({ row }: any) => {
        const { id } = row.original as CorrectionRec
        return (
          <Icon
            name={favorites.has(id) ? 'favorite' : 'unfavorite'}
            onClick={(e: any) => { e.stopPropagation(); toggleFav(id) }}
            style={{ cursor: 'pointer', color: favorites.has(id) ? 'var(--sapCriticalColor)' : 'var(--sapContent_LabelColor)', fontSize: '1rem' }}
          />
        )
      },
    },
    {
      Header: 'Finding', accessor: 'finding', minWidth: 180,
      Cell: ({ row }: any) => {
        const { finding } = row.original as CorrectionRec
        return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{finding.length > 80 ? finding.slice(0, 80) + '…' : finding}</Text>
      },
    },
    {
      Header: 'Recommendation', accessor: 'recommendation', minWidth: 200,
      Cell: ({ row }: any) => {
        const rec = row.original as CorrectionRec
        return (
          <Text
            style={{ color: 'var(--sapLinkColor)', cursor: 'pointer', fontSize: 'var(--sapFontSmallSize)' }}
            onClick={(e: any) => { e.stopPropagation(); navigate(`/recommendations/${rec.id}`) }}
          >
            {rec.recommendation.length > 70 ? rec.recommendation.slice(0, 70) + '…' : rec.recommendation}
          </Text>
        )
      },
    },
    {
      Header: 'N', accessor: 'count', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <Text style={{ display: 'block', textAlign: 'right' }}>{value.toLocaleString()}</Text>,
    },
    {
      Header: 'Relevance', accessor: 'relevance', width: 90, disableResizing: true,
      Cell: ({ value }: any) => value > 0 ? <Tag design="Set2" colorScheme="1">{value}</Tag> : <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>,
    },
    {
      Header: 'Impact', accessor: 'impact', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <ScoreDots score={value} color="#e9730c" />,
    },
    {
      Header: 'Effort', accessor: 'effort', width: 80, disableResizing: true,
      Cell: ({ value }: any) => <ScoreDots score={value} color="#bb8822" />,
    },
    {
      Header: 'Value Driver', accessor: 'valueDriver', minWidth: 150,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>,
    },
    {
      Header: 'Root Cause', accessor: 'rootCause', width: 160, disableResizing: true,
      Cell: ({ value }: any) => <Tag design="Set2" colorScheme="3" style={{ fontSize: '0.6875rem' }}>{value}</Tag>,
    },
    {
      Header: 'Improvement Opp.', accessor: 'improvementOpp', minWidth: 150,
      Cell: ({ value }: any) => (
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: value ? 'var(--sapLinkColor)' : 'var(--sapContent_LabelColor)' }}>
          {value || '—'}
        </Text>
      ),
    },
  ], [favorites, toggleFav, navigate])

  return (
    <SigTableWrapper
      titleSlot={
        <ToolbarItem>
          <Text style={{ fontWeight: '600', fontSize: '1rem' }}>Correction Recommendations ({filtered.length})</Text>
        </ToolbarItem>
      }
      filterBarSlot={
        <SigFilterBar
          filters={corrFilters}
          onFiltersChange={setCorrFilters}
          defaultFilters={{}}
          defaultVisibleFilterKeys={['rootCause']}
        >
          <SigFilter filterKey="rootCause" label="Root Cause">
            <SingleSelect options={ROOT_CAUSE_OPTIONS} />
          </SigFilter>
        </SigFilterBar>
      }
    >
      <AnalyticalTable
        data={filtered}
        columns={columns}
        rowHeight={44}
        headerRowHeight={32}
        selectionMode="None"
        visibleRowCountMode="Fixed"
        visibleRows={filtered.length || 5}
        noDataText="No corrections match the selected filters."
        scaleWidthMode="Smart"
      />
    </SigTableWrapper>
  )
}

// ─── Innovation Recommendations table ────────────────────────────────────────

function InnovationTable() {
  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    { Header: 'Recommendation', accessor: 'recommendation', minWidth: 200, Cell: InnRecCell },
    { Header: 'SAP Offering', accessor: 'sapOffering', minWidth: 160, Cell: InnOfferingCell },
    { Header: 'Relevance', accessor: 'relevance', width: 90, disableResizing: true, Cell: InnRelevanceCell },
    { Header: 'Industry', accessor: 'industry', width: 100, disableResizing: true, Cell: InnIndustryCell },
    { Header: 'Type', accessor: 'type', minWidth: 160, Cell: InnTypeCell },
    { Header: 'End-to-End Processes', accessor: 'endToEnd', minWidth: 200, disableSortBy: true, Cell: InnE2eCell },
    { Header: 'Lines of Business', accessor: 'linesOfBusiness', minWidth: 150, disableSortBy: true, Cell: InnLobCell },
  ], [])

  return (
    <SigTableWrapper
      titleSlot={
        <ToolbarItem>
          <Text style={{ fontWeight: '600', fontSize: '1rem' }}>Innovation Recommendations ({INNOVATIONS.length})</Text>
        </ToolbarItem>
      }
      businessActionsSlot={
        <ToolbarItem>
          <Button icon="download" design="Transparent">Download</Button>
        </ToolbarItem>
      }
    >
      <AnalyticalTable
        data={INNOVATIONS}
        columns={columns}
        rowHeight={44}
        headerRowHeight={32}
        selectionMode="None"
        visibleRowCountMode="Fixed"
        visibleRows={INNOVATIONS.length}
        scaleWidthMode="Smart"
      />
    </SigTableWrapper>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Recommendations() {
  const [searchParams] = useSearchParams()
  const [entryPoint, setEntryPoint] = useState(searchParams.get('e2e') ?? 'All End-to-End Processes...')
  const [modular, setModular] = useState('All')
  const [sourceSystem, setSourceSystem] = useState('QE4:006')

  return (
    <DynamicPage
      style={{ height: '100%' }}
      hidePinButton
      headerPinned
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem>Recommendations</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
        >
          <Title slot="heading" level="H3">Recommendations</Title>
          <Tag design="Set2" colorScheme="5">SAP-Defined</Tag>
        </DynamicPageTitle>
      }
      headerArea={
        <DynamicPageHeader>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {([
              ['Entry Point:', E2E_OPTIONS, entryPoint, setEntryPoint, 220],
              ['Modular Process:', MODULAR_OPTIONS, modular, setModular, 160],
              ['Source System:', SOURCE_SYSTEMS, sourceSystem, setSourceSystem, 130],
            ] as const).map(([label, opts, val, setter, w]) => (
              <div key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{label as string}</Text>
                <Select style={{ minWidth: w as number }} onChange={e => (setter as (v: string) => void)((e as any).detail?.selectedOption?.textContent?.trim() ?? (val as string))}>
                  {(opts as string[]).map(o => <Option key={o} selected={(val as string) === o}>{o}</Option>)}
                </Select>
              </div>
            ))}
          </div>
        </DynamicPageHeader>
      }
    >
      <TabContainer collapsed={false} style={{ padding: '0 1.5rem' }}>
        <Tab text={`Correction Recommendations (${CORRECTIONS.length})`} selected>
          <div style={{ paddingTop: '1rem' }}>
            <CorrectionTable />
          </div>
        </Tab>
        <Tab text={`Innovation Recommendations (${INNOVATIONS.length})`}>
          <div style={{ paddingTop: '1rem' }}>
            <InnovationTable />
          </div>
        </Tab>
      </TabContainer>
    </DynamicPage>
  )
}
