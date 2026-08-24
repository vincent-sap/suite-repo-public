import { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Tag, Icon, Select, Option,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  ToolbarItem,
} from '@ui5/webcomponents-react'
import {
  SigTableWrapper, SigBreadcrumbs, SigBreadcrumbItem,
  SigFilterBar, SigFilter, SingleSelect, type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/unfavorite.js'

interface Opportunity {
  id: string
  title: string
  description: string
  relatedCorrections: number
  lob: string
  valueLever: string
  valueDriver: string
  favorite: boolean
}

const OPPORTUNITIES: Opportunity[] = [
  { id: '1', title: 'Increase cash by collecting supplier credit memos or gaining discounts', description: 'Identify open and overdue supplier credit memos, down payments, and supplier discounts to increase cash.', relatedCorrections: 5, lob: 'Finance', valueLever: 'Effectiveness', valueDriver: 'Improve Days Payable Outstanding', favorite: false },
  { id: '2', title: 'Increase order management FTE productivity', description: 'Analyze the frequency of manual interventions in your order management processes and reduce manual effort.', relatedCorrections: 4, lob: 'Sales', valueLever: 'Efficiency', valueDriver: 'Reduce Sales Cost', favorite: false },
  { id: '3', title: 'Reduce obsolete or duplicate supplier payments', description: 'Learn how to avoid automatic payments for canceled invoices to prevent unnecessary cash outflows.', relatedCorrections: 4, lob: 'Finance', valueLever: 'Effectiveness', valueDriver: 'Improve Days Payable Outstanding', favorite: false },
  { id: '4', title: 'Improve operational procurement FTE productivity', description: 'Analyze the frequency of manual interventions in your operational procurement processes.', relatedCorrections: 2, lob: 'Sourcing & Procurement', valueLever: 'Efficiency', valueDriver: 'Improve Procurement FTE Productivity', favorite: false },
  { id: '5', title: 'Improve on-time delivery performance in make to order', description: 'Identify delays in manufacturing and delivery for your make-to-order scenario.', relatedCorrections: 2, lob: 'Sales', valueLever: 'Agility', valueDriver: 'Improve On-Time Delivery', favorite: false },
  { id: '6', title: 'Increase accounts payable FTE productivity', description: 'Analyze the frequency of manual interventions in your accounts payable processes.', relatedCorrections: 2, lob: 'Finance', valueLever: 'Efficiency', valueDriver: 'Reduce Finance Cost', favorite: false },
  { id: '7', title: 'Reduce maverick buying behavior', description: 'Identify non-compliant purchasing and analyze the underlying reasons.', relatedCorrections: 2, lob: 'Sourcing & Procurement', valueLever: 'Confidence', valueDriver: 'Improve User Compliance', favorite: false },
  { id: '8', title: 'Reduce old and obsolete transactional data in sales', description: 'Identify old and obsolete sales documents that should be closed and then analyze why they remain open.', relatedCorrections: 2, lob: 'Sales', valueLever: 'Efficiency', valueDriver: 'Reduce Data Management Cost', favorite: false },
  { id: '9', title: 'Reduce old and obsolete transactional data in supply chain', description: 'Identify old and obsolete delivery or transportation documents that should be closed.', relatedCorrections: 2, lob: 'Supply Chain', valueLever: 'Efficiency', valueDriver: 'Reduce Data Management Cost', favorite: false },
  { id: '10', title: 'Improve on-time delivery performance in third-party sales', description: 'Identify delays in manufacturing and delivery for your third-party order fulfillment and supplier-related bottlenecks.', relatedCorrections: 1, lob: 'Sales', valueLever: 'Agility', valueDriver: 'Improve On-Time Delivery', favorite: false },
  { id: '11', title: 'Increase usage of negotiated purchasing contracts', description: 'Improve your procurement FTE productivity by using purchasing contracts more effectively.', relatedCorrections: 1, lob: 'Sourcing & Procurement', valueLever: 'Efficiency', valueDriver: 'Improve Procurement FTE Productivity', favorite: false },
  { id: '12', title: 'Reduce early supplier payments', description: "Discover if you're paying your suppliers too early and learn how to reduce early payments.", relatedCorrections: 1, lob: 'Finance', valueLever: 'Effectiveness', valueDriver: 'Improve Days Payable Outstanding', favorite: false },
  { id: '13', title: 'Reduce old and obsolete transactional data in discrete manufacturing', description: 'Identify old and obsolete production orders and order reservations that should be closed.', relatedCorrections: 1, lob: 'Manufacturing', valueLever: 'Efficiency', valueDriver: 'Reduce Data Management Cost', favorite: false },
  { id: '14', title: 'Reduce old and obsolete transactional data in sourcing', description: 'Identify old and obsolete purchasing documents that should be closed and then analyze why they remain open.', relatedCorrections: 1, lob: 'Sourcing & Procurement', valueLever: 'Efficiency', valueDriver: 'Reduce Data Management Cost', favorite: false },
  { id: '15', title: 'Reduce slow moving special stock', description: "Find out where you have unnecessary reserved stocks for special purposes that can't be sold or used.", relatedCorrections: 1, lob: 'Supply Chain', valueLever: 'Effectiveness', valueDriver: 'Reduce Days in Inventory', favorite: false },
]

const LOB_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Sourcing & Procurement', label: 'Sourcing & Procurement' },
  { value: 'Supply Chain', label: 'Supply Chain' },
]
const LEVER_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Agility', label: 'Agility' },
  { value: 'Confidence', label: 'Confidence' },
  { value: 'Effectiveness', label: 'Effectiveness' },
  { value: 'Efficiency', label: 'Efficiency' },
]
const DRIVER_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Improve Days Payable Outstanding', label: 'Improve Days Payable Outstanding' },
  { value: 'Improve On-Time Delivery', label: 'Improve On-Time Delivery' },
  { value: 'Improve Procurement FTE Productivity', label: 'Improve Procurement FTE Productivity' },
  { value: 'Improve User Compliance', label: 'Improve User Compliance' },
  { value: 'Reduce Data Management Cost', label: 'Reduce Data Management Cost' },
  { value: 'Reduce Days in Inventory', label: 'Reduce Days in Inventory' },
  { value: 'Reduce Finance Cost', label: 'Reduce Finance Cost' },
  { value: 'Reduce Sales Cost', label: 'Reduce Sales Cost' },
]
const SOURCE_SYSTEMS = ['QE4:006', 'QE4:007', 'PRD:001']

const LOB_COLORS: Record<string, string> = {
  Finance: '1', Sales: '6', 'Supply Chain': '9', Manufacturing: '3', 'Sourcing & Procurement': '5',
}
const LEVER_COLORS: Record<string, string> = {
  Effectiveness: '2', Efficiency: '8', Agility: '4', Confidence: '7',
}

// Pure cell renderers (defined outside component)
function TitleCell({ row, navigate }: any) {
  const opp = row.original as Opportunity
  return (
    <Text
      style={{ color: 'var(--sapLinkColor)', cursor: 'pointer', fontWeight: '500' }}
      onClick={() => navigate(`/improvement-opportunities/${opp.id}`)}
    >
      {opp.title}
    </Text>
  )
}
function DescCell({ row }: any) {
  const { description } = row.original as Opportunity
  return <Text style={{ color: 'var(--sapTextColor)', fontSize: 'var(--sapFontSmallSize)' }}>{description.length > 90 ? description.slice(0, 90) + '…' : description}</Text>
}
function LobCell({ row }: any) {
  const { lob } = row.original as Opportunity
  return <Tag design="Set2" colorScheme={LOB_COLORS[lob] ?? '1'}>{lob}</Tag>
}
function LeverCell({ row }: any) {
  const { valueLever } = row.original as Opportunity
  return <Tag design="Set2" colorScheme={LEVER_COLORS[valueLever] ?? '2'}>{valueLever}</Tag>
}
function DriverCell({ value }: any) {
  return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
}
function RelatedCell({ value }: any) {
  return <Text style={{ display: 'block', textAlign: 'center' }}>{value}</Text>
}

export default function ImprovementOpportunities() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FilterValues>(() => {
    const result: FilterValues = {}
    const lobParam = searchParams.get('lob')
    const driverParam = searchParams.get('driver')
    if (lobParam && lobParam !== 'All') result.lob = lobParam
    if (driverParam && driverParam !== 'All') result.driver = driverParam
    return result
  })
  const [sourceSystem, setSourceSystem] = useState('QE4:006')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFav = useCallback((id: string) => setFavorites(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  }), [])

  const lobVal = (filters.lob as string | undefined) ?? 'All'
  const leverVal = (filters.lever as string | undefined) ?? 'All'
  const driverVal = (filters.driver as string | undefined) ?? 'All'

  const filtered = useMemo(() => OPPORTUNITIES.filter(o => {
    if (lobVal !== 'All' && o.lob !== lobVal) return false
    if (leverVal !== 'All' && o.valueLever !== leverVal) return false
    if (driverVal !== 'All' && o.valueDriver !== driverVal) return false
    return true
  }), [lobVal, leverVal, driverVal])

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      id: '__fav', Header: '', accessor: 'favorite', width: 44,
      disableResizing: true, disableSortBy: true,
      Cell: ({ row }: any) => {
        const { id } = row.original as Opportunity
        return (
          <Icon
            name={favorites.has(id) ? 'favorite' : 'unfavorite'}
            onClick={(e: any) => { e.stopPropagation(); toggleFav(id) }}
            style={{ cursor: 'pointer', color: favorites.has(id) ? 'var(--sapCriticalColor)' : 'var(--sapContent_LabelColor)', fontSize: '1rem' }}
          />
        )
      },
    },
    { Header: 'Improvement Opportunity', accessor: 'title', minWidth: 220, Cell: (props: any) => <TitleCell {...props} navigate={navigate} /> },
    { Header: 'Description', accessor: 'description', minWidth: 240, Cell: DescCell },
    { Header: 'Related Corrections', accessor: 'relatedCorrections', width: 120, disableResizing: true, Cell: RelatedCell },
    { Header: 'Line of Business', accessor: 'lob', width: 180, disableResizing: true, Cell: LobCell },
    { Header: 'Value Lever', accessor: 'valueLever', width: 130, disableResizing: true, Cell: LeverCell },
    { Header: 'Value Driver', accessor: 'valueDriver', minWidth: 180, Cell: DriverCell },
  ], [favorites, toggleFav, navigate])

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
              <SigBreadcrumbItem>Improvement Opportunities</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
        >
          <Title slot="heading" level="H3">Improvement Opportunities</Title>
          <Tag design="Set2" colorScheme="5">SAP-Defined</Tag>
        </DynamicPageTitle>
      }
      headerArea={
        <DynamicPageHeader>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <SigFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              defaultFilters={{}}
              defaultVisibleFilterKeys={['lob', 'lever', 'driver']}
            >
              <SigFilter filterKey="lob" label="Line of Business">
                <SingleSelect options={LOB_OPTIONS} />
              </SigFilter>
              <SigFilter filterKey="lever" label="Value Lever">
                <SingleSelect options={LEVER_OPTIONS} />
              </SigFilter>
              <SigFilter filterKey="driver" label="Value Driver">
                <SingleSelect options={DRIVER_OPTIONS} />
              </SigFilter>
            </SigFilterBar>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Source System:</Text>
              <Select style={{ minWidth: 130 }} onChange={e => setSourceSystem((e as any).detail?.selectedOption?.textContent?.trim() ?? sourceSystem)}>
                {SOURCE_SYSTEMS.map(s => <Option key={s} selected={sourceSystem === s}>{s}</Option>)}
              </Select>
            </div>
          </div>
        </DynamicPageHeader>
      }
    >
      <SigTableWrapper
          titleSlot={
            <ToolbarItem>
              <Text style={{ fontWeight: '600', fontSize: '1rem' }}>Improvement Opportunities ({filtered.length})</Text>
            </ToolbarItem>
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
            noDataText="No opportunities match the selected filters."
            scaleWidthMode="Smart"
          />
        </SigTableWrapper>
    </DynamicPage>
  )
}
