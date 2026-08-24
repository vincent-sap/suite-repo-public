import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Tag, Button, Select, Option, Input,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  SegmentedButton, SegmentedButtonItem, ToolbarItem,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/download.js'
import '@ui5/webcomponents-icons/dist/nav-back.js'

interface Flow {
  name: string
  objectCount: number
  unit: string
  dateRange: string
  e2eProcesses: string[]
  modularProcess: string
  lob: string
  solutionFlow: string
}

const FLOWS_PUBLIC: Flow[] = [
  { name: 'Purchase order item creation', objectCount: 141, unit: 'Items', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill', 'Source to Pay'], modularProcess: 'Procure to Receipt', lob: 'Sourcing & Procurement', solutionFlow: '18J-Requisitioning' },
  { name: 'Sales order item creation', objectCount: 106, unit: 'Items', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Order to Fulfill', lob: 'Sales', solutionFlow: 'BD9-Sell from Stock' },
  { name: 'Invoice document processing', objectCount: 98, unit: 'Documents', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Source to Pay'], modularProcess: 'Invoice Processing', lob: 'Finance', solutionFlow: 'J59-Accounts Payable' },
  { name: 'Asset acquisition and retirement', objectCount: 87, unit: 'Assets', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Acquire to Decommission'], modularProcess: 'Asset Lifecycle', lob: 'Finance', solutionFlow: 'J62-Asset Accounting' },
  { name: 'Production order processing', objectCount: 82, unit: 'Orders', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill'], modularProcess: 'Discrete Manufacturing', lob: 'Manufacturing', solutionFlow: 'MTO-Make to Order' },
  { name: 'Customer payment processing', objectCount: 75, unit: 'Payments', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Accounts Receivable', lob: 'Finance', solutionFlow: 'J56-Accounts Receivable' },
  { name: 'Goods receipt and inspection', objectCount: 69, unit: 'Documents', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Source to Pay', 'Plan to Fulfill'], modularProcess: 'Goods Receipt', lob: 'Sourcing & Procurement', solutionFlow: '18K-Purchase Order' },
  { name: 'Outbound delivery creation', objectCount: 64, unit: 'Deliveries', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Shipping', lob: 'Logistics', solutionFlow: 'BD9-Sell from Stock' },
  { name: 'Supplier invoice verification', objectCount: 61, unit: 'Invoices', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Source to Pay'], modularProcess: 'Invoice Verification', lob: 'Finance', solutionFlow: '18N-Accounts Payable' },
  { name: 'Material requirements planning', objectCount: 58, unit: 'Runs', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill'], modularProcess: 'MRP', lob: 'Supply Chain', solutionFlow: 'MRP-Planning Run' },
  { name: 'Intercompany stock transfer', objectCount: 53, unit: 'Transfers', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill', 'Source to Pay'], modularProcess: 'Stock Transfer', lob: 'Supply Chain', solutionFlow: 'STC-Stock Transfer' },
  { name: 'Credit management processing', objectCount: 48, unit: 'Cases', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Credit Management', lob: 'Finance', solutionFlow: 'J57-Credit Management' },
  { name: 'Maintenance order processing', objectCount: 45, unit: 'Orders', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Acquire to Decommission'], modularProcess: 'Plant Maintenance', lob: 'Asset Management', solutionFlow: 'EAM-Maintenance' },
  { name: 'Quality inspection processing', objectCount: 42, unit: 'Lots', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill', 'Source to Pay'], modularProcess: 'Quality Management', lob: 'Manufacturing', solutionFlow: 'QM1-Quality Inspection' },
  { name: 'Contract and scheduling agreement', objectCount: 39, unit: 'Contracts', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Source to Pay'], modularProcess: 'Scheduling Agreement', lob: 'Sourcing & Procurement', solutionFlow: '18M-Scheduling Agreement' },
  { name: 'Cost center allocation processing', objectCount: 36, unit: 'Postings', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance'], modularProcess: 'Controlling', lob: 'Finance', solutionFlow: 'CO1-Cost Center' },
  { name: 'Profit center accounting', objectCount: 33, unit: 'Entries', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance'], modularProcess: 'Profit Center', lob: 'Finance', solutionFlow: 'CO2-Profit Center' },
  { name: 'New product introduction flow', objectCount: 28, unit: 'Products', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Idea to Market'], modularProcess: 'Product Development', lob: 'R&D/Engineering', solutionFlow: 'NPI-New Product Intro' },
  { name: 'Warehouse management inbound', objectCount: 25, unit: 'Transfers', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill', 'Source to Pay'], modularProcess: 'Warehouse Management', lob: 'Logistics', solutionFlow: 'WM1-Warehouse Inbound' },
  { name: 'Returns and reverse logistics', objectCount: 22, unit: 'Returns', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash', 'Source to Pay'], modularProcess: 'Returns Management', lob: 'Sales', solutionFlow: 'BD4-Customer Returns' },
  { name: 'Project-based procurement', objectCount: 19, unit: 'Orders', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Source to Pay', 'Idea to Market'], modularProcess: 'Project Procurement', lob: 'Sourcing & Procurement', solutionFlow: 'PS1-Project Purchasing' },
  { name: 'Financial period close activities', objectCount: 17, unit: 'Postings', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance'], modularProcess: 'Period Close', lob: 'Finance', solutionFlow: 'FPC-Period Close' },
  { name: 'Travel and expense processing', objectCount: 14, unit: 'Claims', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance'], modularProcess: 'Travel Management', lob: 'HR', solutionFlow: 'TV1-Travel Expenses' },
  { name: 'Billing document processing', objectCount: 12, unit: 'Bills', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Billing', lob: 'Sales', solutionFlow: 'BD6-Billing' },
  { name: 'Tax reporting and compliance', objectCount: 10, unit: 'Reports', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance'], modularProcess: 'Tax Management', lob: 'Finance', solutionFlow: 'TAX-Tax Processing' },
  { name: 'Dunning and collections processing', objectCount: 9, unit: 'Letters', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Lead to Cash'], modularProcess: 'Dunning', lob: 'Finance', solutionFlow: 'J56-Accounts Receivable' },
  { name: 'Inventory count and reconciliation', objectCount: 7, unit: 'Counts', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Plan to Fulfill'], modularProcess: 'Inventory Management', lob: 'Supply Chain', solutionFlow: 'INV-Inventory Count' },
  { name: 'Internal order settlement', objectCount: 5, unit: 'Orders', dateRange: '2023-01 – 2025-12', e2eProcesses: ['Governance', 'Idea to Market'], modularProcess: 'Internal Orders', lob: 'Finance', solutionFlow: 'CO3-Internal Orders' },
]

const FLOWS_PRIVATE = FLOWS_PUBLIC.slice(0, 28)

const E2E_OPTIONS = ['All End-to-End Processes', 'Acquire to Decommission', 'Lead to Cash', 'Plan to Fulfill', 'Source to Pay', 'Idea to Market', 'Governance']
const MODULAR_OPTIONS = ['All', 'Accounts Payable', 'Asset Lifecycle', 'Billing', 'Credit Management', 'Discrete Manufacturing', 'Goods Receipt', 'Invoice Processing', 'MRP', 'Order to Fulfill', 'Plant Maintenance', 'Procure to Receipt', 'Quality Management', 'Shipping', 'Stock Transfer', 'Warehouse Management']
const SOURCE_SYSTEMS = ['QE4:006', 'QE4:007', 'PRD:001']

const E2E_COLORS: Record<string, string> = {
  'Plan to Fulfill': '6',
  'Lead to Cash': '1',
  'Source to Pay': '3',
  'Acquire to Decommission': '5',
  'Idea to Market': '8',
  'Governance': '2',
}

// Pure cell renderers
function FlowNameCell({ value }: any) {
  return <Text style={{ color: 'var(--sapLinkColor)', fontWeight: '500', cursor: 'pointer' }}>{value}</Text>
}
function FlowCountCell({ value }: any) {
  return <Text style={{ fontWeight: '600', display: 'block', textAlign: 'right' }}>{value}</Text>
}
function FlowUnitCell({ value }: any) {
  return <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
}
function FlowDateCell({ value }: any) {
  return <Text style={{ fontSize: 'var(--sapFontSmallSize)', whiteSpace: 'nowrap' }}>{value}</Text>
}
function FlowE2eCell({ value }: any) {
  const arr = value as string[]
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
      {arr.map((p: string) => <Tag key={p} design="Set2" colorScheme={E2E_COLORS[p] ?? '1'} style={{ fontSize: '0.6875rem' }}>{p}</Tag>)}
    </div>
  )
}
function FlowModularCell({ value }: any) {
  return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
}
function FlowLobCell({ value }: any) {
  return <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>
}
function FlowSolutionCell({ value }: any) {
  return <Text style={{ color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSmallSize)', cursor: 'pointer' }}>{value} ↗</Text>
}

export default function CloudTransformationFlows() {
  const navigate = useNavigate()
  const [edition, setEdition] = useState<'public' | 'private'>('public')
  const [e2e, setE2e] = useState('All End-to-End Processes')
  const [modular, setModular] = useState('All')
  const [sourceSystem, setSourceSystem] = useState('QE4:006')
  const [search, setSearch] = useState('')

  const flows = edition === 'public' ? FLOWS_PUBLIC : FLOWS_PRIVATE

  const filtered = useMemo(() => flows.filter(f => {
    if (e2e !== 'All End-to-End Processes' && !f.e2eProcesses.includes(e2e)) return false
    if (modular !== 'All' && f.modularProcess !== modular) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [flows, e2e, modular, search])

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    { Header: 'Process Flow', accessor: 'name', minWidth: 220, Cell: FlowNameCell },
    { Header: 'Object Count', accessor: 'objectCount', width: 100, disableResizing: true, Cell: FlowCountCell },
    { Header: 'Unit', accessor: 'unit', width: 90, disableResizing: true, Cell: FlowUnitCell },
    { Header: 'Date Range', accessor: 'dateRange', width: 150, disableResizing: true, Cell: FlowDateCell },
    { Header: 'End-to-End Process', accessor: 'e2eProcesses', minWidth: 220, disableSortBy: true, Cell: FlowE2eCell },
    { Header: 'Modular Process', accessor: 'modularProcess', minWidth: 140, Cell: FlowModularCell },
    { Header: 'Line of Business', accessor: 'lob', minWidth: 130, Cell: FlowLobCell },
    { Header: 'Solution Process Flow', accessor: 'solutionFlow', minWidth: 160, Cell: FlowSolutionCell },
  ], [])

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
              <SigBreadcrumbItem href="#/cloud-transformation">Cloud Transformation</SigBreadcrumbItem>
              <SigBreadcrumbItem>Process Flows</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
          actionsBar={
            <Button icon="nav-back" design="Transparent" onClick={() => navigate('/cloud-transformation')}>
              Back
            </Button>
          }
        >
          <Title slot="heading" level="H3">Process Flows</Title>
          <Tag design="Set2" colorScheme="5">SAP-Defined</Tag>
        </DynamicPageTitle>
      }
      headerArea={
        <DynamicPageHeader>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Entry Point:</Text>
              <Select style={{ minWidth: 220 }} onChange={e => setE2e((e as any).detail?.selectedOption?.textContent?.trim() ?? e2e)}>
                {E2E_OPTIONS.map(o => <Option key={o} selected={e2e === o}>{o}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Modular Process:</Text>
              <Select style={{ minWidth: 180 }} onChange={e => setModular((e as any).detail?.selectedOption?.textContent?.trim() ?? modular)}>
                {MODULAR_OPTIONS.map(o => <Option key={o} selected={modular === o}>{o}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Source System:</Text>
              <Select style={{ minWidth: 130 }} onChange={e => setSourceSystem((e as any).detail?.selectedOption?.textContent?.trim() ?? sourceSystem)}>
                {SOURCE_SYSTEMS.map(s => <Option key={s} selected={sourceSystem === s}>{s}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Company Code:</Text>
              <Input
                placeholder="Search company code..."
                style={{ minWidth: 180 }}
                value={search}
                onInput={e => setSearch((e.target as any).value)}
              />
            </div>
          </div>
        </DynamicPageHeader>
      }
    >
        <SigTableWrapper
          titleSlot={
            <ToolbarItem>
              <SegmentedButton
                onSelectionChange={(e: any) => {
                  const val = e.detail?.selectedItems?.[0]?.dataset?.edition
                  if (val) setEdition(val as 'public' | 'private')
                }}
              >
                <SegmentedButtonItem data-edition="public" selected={edition === 'public'}>
                  Public Edition ({FLOWS_PUBLIC.length})
                </SegmentedButtonItem>
                <SegmentedButtonItem data-edition="private" selected={edition === 'private'}>
                  Private Edition ({FLOWS_PRIVATE.length})
                </SegmentedButtonItem>
              </SegmentedButton>
            </ToolbarItem>
          }
          businessActionsSlot={
            <ToolbarItem>
              <Button icon="download" design="Transparent">Download</Button>
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
            noDataText="No process flows match the selected filters."
            scaleWidthMode="Smart"
          />
        </SigTableWrapper>
      
    </DynamicPage>
  )
}
