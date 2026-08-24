// Mock data for Process Transformation Manager (PTM) pages

export type ItemStatus =
  | 'On Track'
  | 'At Risk'
  | 'Behind'
  | 'Planned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export type EntityType = 'objective' | 'initiative' | 'valueCase'

export type InsightStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
export type InsightSource = 'Process Insights' | 'Benchmarking' | 'Manual' | 'Process Intelligence'
export type InsightType = 'Issue' | 'Improvement' | 'Risk' | 'Opportunity'
export type InitiativeVisibility = 'available' | 'private' | 'archived'

export interface PTMOwner {
  id: string
  name: string
  initials: string
  colorScheme: string
}

export type ObjectiveStatus = ItemStatus
export type Owner = PTMOwner

export interface Objective {
  id: string
  title: string
  description: string
  owner: PTMOwner
  status: ItemStatus
  dueDate: string
  parentObjectiveId: string | null
  linkedInitiativeIds: string[]
  createdOn: string
  changedOn: string
  commentCount: number
  progress: number
  startDate: string
  endDate: string
  children?: Objective[]
  entityType?: EntityType
  name?: string  // Alias for title for compatibility
}

export interface Initiative {
  id: string
  title: string
  description: string
  owner: PTMOwner
  members: PTMOwner[]
  status: ItemStatus
  type: 'Shared' | 'Private'
  insightCount: number
  valueCaseCount: number
  changedOn: string
  startDate: string
  endDate: string
  about: string
  commentCount: number
  visibility: InitiativeVisibility
  linkedObjectiveIds: string[]
  linkedInsightIds: string[]
}

export interface Insight {
  id: string
  title: string
  description: string
  source: InsightSource
  type: InsightType
  status: InsightStatus
  owner: PTMOwner
  assignees: PTMOwner[]
  createdDate: string
  linkedInitiativeId: string | null
  commentCount: number
}

export interface BenchmarkMetricCell {
  bestInClass: number | null
  yourCompany: number | null
}

export interface BenchmarkRow {
  id: string
  processName: string
  ppiCount: number
  automationRate: BenchmarkMetricCell
  exceptionRate: BenchmarkMetricCell
  changesRate: BenchmarkMetricCell
  leadTime: BenchmarkMetricCell
}

export type ValueType = 'Profit and Loss' | 'Working Capital'
export type SourceType = 'Process Intelligence' | 'Process Insights' | 'Manual'

export interface ValueCase {
  id: string
  initiativeId: string
  valueDriver: string
  groupType: ValueType
  groupPotential: string
  groupRealized: string
  name: string
  baselineDateRange: string
  baseline: string
  current: string
  target: string
  potentialValue: string
  realizedValue: string
  source: SourceType
  type: ValueType
  unit: string
  unitSub?: string
  potentialValueRaw: string
  realizedValueRaw: string
  baselineDateRangeFormatted: string
  description: string
}

// ─── Owners ────────────────────────────────────────────────────────────────────

const JH: PTMOwner = { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' }
const SC: PTMOwner = { id: 'sc', name: 'Sarah Chen',      initials: 'SC', colorScheme: 'Accent1' }
const WP: PTMOwner = { id: 'wp', name: 'William Park',    initials: 'WP', colorScheme: 'Accent8' }
const IC: PTMOwner = { id: 'ic', name: 'Isabel Cruz',     initials: 'IC', colorScheme: 'Accent3' }
const DH: PTMOwner = { id: 'dh', name: 'David Hughes',    initials: 'DH', colorScheme: 'Accent2' }
const OI: PTMOwner = { id: 'oi', name: 'Omar Ibrahim',    initials: 'OI', colorScheme: 'Accent5' }

// ─── Objectives ────────────────────────────────────────────────────────────────

export const OBJECTIVES: Objective[] = [
  {
    id: 'obj-1',
    title: 'Improve DIFOT from 76% to 98% within 8 months',
    description: 'Increase Delivered In Full On Time rate by focusing on supplier reliability and logistics coordination.',
    owner: JH,
    status: 'On Track',
    dueDate: '2024-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: ['init-1', 'init-2'],
    createdOn: 'Jan 13, 2026',
    changedOn: '04/08/24',
    commentCount: 0,
    progress: 0,
    startDate: '',
    endDate: '',
  },
  {
    id: 'obj-2',
    title: 'Decrease cost by 25%',
    description: 'Reduce operational costs through process automation and supplier renegotiation.',
    owner: JH,
    status: 'On Track',
    dueDate: '2024-10-31',
    parentObjectiveId: null,
    linkedInitiativeIds: ['init-3'],
    createdOn: 'Jan 13, 2026',
    changedOn: '04/08/24',
    commentCount: 0,
    progress: 0,
    startDate: '',
    endDate: '',
  },
  {
    id: 'obj-3',
    title: 'Improve Customer Satisfaction from 60% to 70%',
    description: 'Drive NPS improvement by reducing order errors and delivery delays.',
    owner: JH,
    status: 'On Track',
    dueDate: '2024-11-30',
    parentObjectiveId: null,
    linkedInitiativeIds: ['init-4', 'init-5'],
    createdOn: 'Feb 18, 2026',
    changedOn: '04/08/24',
    commentCount: 0,
    progress: 0,
    startDate: '',
    endDate: '',
  },
  {
    id: 'obj-4',
    title: 'Improve Stock Management',
    description: 'Reduce out-of-stock incidents by 40% through better demand forecasting and replenishment triggers.',
    owner: JH,
    status: 'Behind',
    dueDate: '2024-09-30',
    parentObjectiveId: null,
    linkedInitiativeIds: ['init-2'],
    createdOn: 'Feb 18, 2026',
    changedOn: '04/08/24',
    commentCount: 0,
    progress: 0,
    startDate: '',
    endDate: '',
  },
  {
    id: 'obj-5',
    title: 'Supplier Diversification to Reduce Delays by 22%',
    description: 'Onboard alternative suppliers for critical components to reduce single-source dependency risk.',
    owner: JH,
    status: 'At Risk',
    dueDate: '2025-03-31',
    parentObjectiveId: null,
    linkedInitiativeIds: ['init-1', 'init-6'],
    createdOn: 'Feb 18, 2026',
    changedOn: '04/08/24',
    commentCount: 0,
    progress: 0,
    startDate: '',
    endDate: '',
  },
]

// ─── Initiatives ───────────────────────────────────────────────────────────────

export const INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    title: 'Working Capital Boost 2023',
    description: 'Accelerate cash conversion cycle by reducing days payable outstanding and streamlining invoice processing.',
    owner: WP,
    members: [WP],
    status: 'In Progress',
    type: 'Shared',
    insightCount: 13,
    valueCaseCount: 7,
    changedOn: 'Sep 12, 2023',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    visibility: 'available',
    linkedObjectiveIds: ['obj-1', 'obj-5'],
    linkedInsightIds: ['ins-1', 'ins-2', 'ins-3'],
  },
  {
    id: 'init-2',
    title: 'Changes in Order to Cash',
    description: 'Streamline the order-to-cash process to reduce cycle time and improve customer payment experience.',
    owner: IC,
    members: [IC, DH],
    status: 'In Progress',
    type: 'Shared',
    insightCount: 12,
    valueCaseCount: 1,
    changedOn: 'Aug 5, 2021',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    visibility: 'available',
    linkedObjectiveIds: ['obj-1', 'obj-4'],
    linkedInsightIds: ['ins-4', 'ins-5'],
  },
  {
    id: 'init-3',
    title: 'Early Payments Investigation',
    description: 'Analyse early payment discount opportunities across the supplier base to reduce net financing costs.',
    owner: SC,
    members: [SC, WP],
    status: 'In Progress',
    insightCount: 12,
    valueCaseCount: 0,
    changedOn: 'Aug 5, 2021',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    type: 'Shared',
    visibility: 'available',
    linkedObjectiveIds: ['obj-2'],
    linkedInsightIds: ['ins-6'],
  },
  {
    id: 'init-4',
    title: 'Set up Performance Incentives & Penalties',
    description: 'Define SLA-based incentive and penalty structures for top 20 suppliers to drive on-time delivery.',
    owner: SC,
    members: [SC, WP],
    status: 'In Progress',
    insightCount: 12,
    valueCaseCount: 0,
    changedOn: 'Aug 5, 2021',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    type: 'Shared',
    visibility: 'available',
    linkedObjectiveIds: ['obj-3'],
    linkedInsightIds: ['ins-7'],
  },
  {
    id: 'init-5',
    title: 'Payment Blocks in Accounts',
    description: 'Investigate and resolve recurring payment blocks in accounts payable to reduce processing delays.',
    owner: WP,
    members: [WP],
    status: 'In Progress',
    insightCount: 12,
    valueCaseCount: 0,
    changedOn: 'Aug 5, 2021',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    type: 'Shared',
    visibility: 'available',
    linkedObjectiveIds: ['obj-3'],
    linkedInsightIds: ['ins-8'],
  },
  {
    id: 'init-6',
    title: 'Supplier Onboarding Automation',
    description: 'Automate the supplier onboarding workflow to reduce time-to-active from 30 days to 5 days.',
    owner: DH,
    members: [DH, OI],
    status: 'In Progress',
    insightCount: 8,
    valueCaseCount: 1,
    changedOn: 'Aug 5, 2021',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 0,
    type: 'Private',
    visibility: 'private',
    linkedObjectiveIds: ['obj-5'],
    linkedInsightIds: ['ins-9'],
  },
  {
    id: 'init-7',
    title: 'Private Insights Review Q4',
    description: 'Internal review of flagged process anomalies identified in Q4 mining run.',
    owner: OI,
    members: [OI],
    status: 'Planned',
    insightCount: 5,
    valueCaseCount: 0,
    changedOn: 'Jan 15, 2023',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 0,
    type: 'Private',
    visibility: 'private',
    linkedObjectiveIds: [],
    linkedInsightIds: [],
  },
  {
    id: 'init-8',
    title: 'Legacy AP Process Retirement',
    description: 'Decommission the legacy accounts payable process and migrate to the new automated flow.',
    owner: IC,
    members: [IC],
    status: 'Completed',
    insightCount: 4,
    valueCaseCount: 2,
    changedOn: 'Nov 1, 2022',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 2,
    type: 'Shared',
    visibility: 'archived',
    linkedObjectiveIds: ['obj-2'],
    linkedInsightIds: [],
  },
  {
    id: 'init-9',
    title: 'Invoice Matching Improvement',
    description: 'Increase 3-way match rate from 68% to 92% through master data cleansing and tolerance adjustments.',
    owner: WP,
    members: [WP, SC],
    status: 'Completed',
    insightCount: 7,
    valueCaseCount: 1,
    changedOn: 'Aug 20, 2022',
    startDate: 'Jan 1, 2024',
    endDate: 'Dec 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    type: 'Shared',
    visibility: 'archived',
    linkedObjectiveIds: ['obj-2'],
    linkedInsightIds: [],
  },
]

// ─── Insights ──────────────────────────────────────────────────────────────────

export const INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    title: 'Goods issue posted after planned goods issue date',
    description: 'Systematic delay in goods issue posting observed in warehouse operations — median delay is 2.3 days past planned date.',
    source: 'Process Insights',
    type: 'Issue',
    status: 'Open',
    owner: SC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Feb 25, 2023',
    linkedInitiativeId: 'init-1',
    commentCount: 1,
  },
  {
    id: 'ins-2',
    title: 'Incomplete sales order items blocking our deliveries across the locations',
    description: 'Incomplete line items in sales orders are causing delivery blocks at 4 distribution centres.',
    source: 'Process Insights',
    type: 'Issue',
    status: 'In Progress',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Jan 06, 2023',
    linkedInitiativeId: 'init-1',
    commentCount: 0,
  },
  {
    id: 'ins-3',
    title: 'Sales order items incomplete for delivery',
    description: 'High volume of sales order items with missing delivery-relevant data fields, causing manual intervention.',
    source: 'Manual',
    type: 'Improvement',
    status: 'Resolved',
    owner: IC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Dec 16, 2022',
    linkedInitiativeId: 'init-1',
    commentCount: 0,
  },
  {
    id: 'ins-4',
    title: 'Anomaly in price change rate for plant',
    description: 'Price change rate for Plant DE01 is 340% above peer average — root cause linked to manual price corrections.',
    source: 'Process Intelligence',
    type: 'Risk',
    status: 'Open',
    owner: DH,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Sep 03, 2022',
    linkedInitiativeId: 'init-2',
    commentCount: 0,
  },
  {
    id: 'ins-5',
    title: 'Metric "NPS" is 208.16% lower than mean where "Variant" is "Escalated"',
    description: 'NPS score for escalated order variants shows significant underperformance versus the process mean.',
    source: 'Process Intelligence',
    type: 'Issue',
    status: 'Open',
    owner: SC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Aug 15, 2022',
    linkedInitiativeId: 'init-2',
    commentCount: 0,
  },
  {
    id: 'ins-6',
    title: 'Some EKGRP (e.g. 888, 712 and 715) have not been assigned yet!',
    description: 'Purchasing groups 888, 712, and 715 are unassigned in the system — creating routing failures for POs.',
    source: 'Manual',
    type: 'Issue',
    status: 'Open',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'May 27, 2022',
    linkedInitiativeId: 'init-3',
    commentCount: 0,
  },
  {
    id: 'ins-7',
    title: '29% (3.8K) sales billing documents canceled',
    description: '3,800 billing documents were cancelled in the review period — disproportionately high versus industry benchmark of 4%.',
    source: 'Benchmarking',
    type: 'Opportunity',
    status: 'Open',
    owner: IC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Apr 14, 2022',
    linkedInitiativeId: 'init-4',
    commentCount: 0,
  },
  {
    id: 'ins-8',
    title: 'Significant delay in order fulfilment due to materials shortage',
    description: 'Stock-out events causing average 6-day delay in order fulfilment for 18% of SKUs.',
    source: 'Manual',
    type: 'Risk',
    status: 'Resolved',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Feb 03, 2022',
    linkedInitiativeId: 'init-2',
    commentCount: 0,
  },
  {
    id: 'ins-9',
    title: 'Overdue purchase orders have risen by 12% in Q2 2023 compared to Q1',
    description: 'Overdue PO rate has increased quarter-on-quarter, concentrated in electronics category.',
    source: 'Benchmarking',
    type: 'Risk',
    status: 'Rejected',
    owner: DH,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Dec 28, 2021',
    linkedInitiativeId: 'init-6',
    commentCount: 0,
  },
]

// ─── Benchmarking ──────────────────────────────────────────────────────────────

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  {
    id: 'bench-1',
    processName: 'Acquire to Decommission',
    ppiCount: 15,
    automationRate: { bestInClass: 89, yourCompany: 71 },
    exceptionRate:  { bestInClass: 11, yourCompany: 17 },
    changesRate:    { bestInClass: null, yourCompany: null },
    leadTime:       { bestInClass: 61, yourCompany: 79 },
  },
  {
    id: 'bench-2',
    processName: 'Source to Pay',
    ppiCount: 57,
    automationRate: { bestInClass: 77, yourCompany: 21 },
    exceptionRate:  { bestInClass: 8, yourCompany: null },
    changesRate:    { bestInClass: 14, yourCompany: 21 },
    leadTime:       { bestInClass: 55, yourCompany: 62 },
  },
  {
    id: 'bench-3',
    processName: 'Governance',
    ppiCount: 15,
    automationRate: { bestInClass: 79, yourCompany: 65 },
    exceptionRate:  { bestInClass: 13, yourCompany: 22 },
    changesRate:    { bestInClass: 7, yourCompany: 22 },
    leadTime:       { bestInClass: 72, yourCompany: 136 },
  },
  {
    id: 'bench-4',
    processName: 'Idea to Market',
    ppiCount: 5,
    automationRate: { bestInClass: null, yourCompany: null },
    exceptionRate:  { bestInClass: 9, yourCompany: null },
    changesRate:    { bestInClass: 8, yourCompany: null },
    leadTime:       { bestInClass: 55, yourCompany: 123 },
  },
  {
    id: 'bench-5',
    processName: 'Lead to Cash',
    ppiCount: 47,
    automationRate: { bestInClass: 81, yourCompany: 79 },
    exceptionRate:  { bestInClass: 12, yourCompany: null },
    changesRate:    { bestInClass: 9, yourCompany: null },
    leadTime:       { bestInClass: 53, yourCompany: null },
  },
  {
    id: 'bench-6',
    processName: 'Plan to Fulfill',
    ppiCount: 76,
    automationRate: { bestInClass: 87, yourCompany: null },
    exceptionRate:  { bestInClass: 9, yourCompany: 14 },
    changesRate:    { bestInClass: 10, yourCompany: null },
    leadTime:       { bestInClass: 75, yourCompany: null },
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const STATUS_CHIP_DESIGN: Record<string, string> = {
  'On Track':    'indication4',
  'At Risk':     'indication2',
  'Behind':      'indication3',
  'Planned':     'indication10',
  'In Progress': 'indication7',
  'Completed':   'indication5',
  'Cancelled':   'indication1',
}

export const INSIGHT_STATUS_COLOR: Record<InsightStatus, string> = {
  'Open':        'var(--sapInformativeColor)',
  'In Progress': 'var(--sapCriticalColor)',
  'Resolved':    'var(--sapPositiveColor)',
  'Rejected':    'var(--sapNegativeColor)',
}

export function getPTMSummary() {
  return {
    objectivesTotal: OBJECTIVES.length,
    objectivesOnTrack: OBJECTIVES.filter(o => o.status === 'On Track').length,
    initiativesTotal: INITIATIVES.length,
    initiativesInProgress: INITIATIVES.filter(i => i.status === 'In Progress').length,
    insightsTotal: INSIGHTS.length,
    insightsOpen: INSIGHTS.filter(i => i.status === 'Open').length,
  }
}

// ─── Value Cases ───────────────────────────────────────────────────────────────

export const VALUE_CASES: ValueCase[] = [
  { id: 'vc-1', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Maintenance orders created', baselineDateRange: '01.04.2019 - 01.04.2022', baseline: '56%', current: '61,0%', target: '75,0%', potentialValue: '25,162.1K EUR', realizedValue: '8,234.6K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '25162.1K', realizedValueRaw: '8234.6K', baselineDateRangeFormatted: 'Apr 1, 2019 - Apr 1, 2022', description: 'Track and optimize the rate of maintenance orders created across procurement workflows.' },
  { id: 'vc-2', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Manual change rate on purchase orders', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '5,1%', current: '4,2%', target: '2,5%', potentialValue: '59.5K EUR', realizedValue: '21.4K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '59.5K', realizedValueRaw: '21.4K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Reduce the rate of manual changes applied to purchase orders.' },
  { id: 'vc-3', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Changes in purchase requisitions', baselineDateRange: '01.08.2021 - 31.12.2022', baseline: '196 Changes', current: '142 Changes', target: '78 Changes', potentialValue: '59.5K EUR', realizedValue: '31.8K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Count', potentialValueRaw: '59.5K', realizedValueRaw: '31.8K', baselineDateRangeFormatted: 'Aug 1, 2021 - Dec 31, 2022', description: 'Monitor and reduce changes made to purchase requisitions.' },
  { id: 'vc-4', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Automation rate potential', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '12,5%', current: '10,2%', target: '4,0%', potentialValue: '48.1K EUR', realizedValue: '18.3K EUR', source: 'Process Insights', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '48.1K', realizedValueRaw: '18.3K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Measure the potential for process automation.' },
  { id: 'vc-5', initiativeId: 'init-1', valueDriver: 'Workforce Productivity', groupType: 'Profit and Loss', groupPotential: '658.1K EUR', groupRealized: '183.4K EUR', name: 'Enhancing Employee Experience', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '12,5%', current: '16,3%', target: '25,0%', potentialValue: '658.1K EUR', realizedValue: '183.4K EUR', source: 'Manual', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '658.1K', realizedValueRaw: '183.4K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Improve employee satisfaction and productivity through targeted initiatives.' },
  { id: 'vc-6', initiativeId: 'init-1', valueDriver: 'Operational Efficiency and Process Quality', groupType: 'Profit and Loss', groupPotential: '6.2K EUR', groupRealized: '-', name: 'Operational Cycle Time', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '14 Days', current: '11 Days', target: '7 Days', potentialValue: '6.2K EUR', realizedValue: '-', source: 'Manual', type: 'Profit and Loss', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '6.2K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Apr 1, 2023 - May 1, 2024', description: 'Description of the value case' },
  { id: 'vc-7', initiativeId: 'init-1', valueDriver: 'Unknown Value Driver', groupType: 'Working Capital', groupPotential: '48.1K EUR', groupRealized: '-', name: 'Carbon Emissions and Energy Usage', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '1200 tCO₂e', current: '1,045 tCO₂e', target: '600 tCO₂e', potentialValue: '48.1K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Count', potentialValueRaw: '48.1K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Track and reduce carbon emissions and energy consumption.' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Objectives Prototype Data (3-Level Hierarchy)
// ═══════════════════════════════════════════════════════════════════════════════

// Additional types from objectives-prototype
export interface ProgressBreakdown {
  businessKPIs: number
  valueChainItems: number
  initiatives: number
}

// Extended objective type for prototype
export interface ObjectiveExtended extends Objective {
  entityType?: EntityType
  children?: ObjectiveExtended[]
  breakdown?: ProgressBreakdown
  name?: string
  lastUpdate?: string
}

// Owners from objectives-prototype
export const PTM_OWNERS = [
  { id: 'owner-1', name: 'Sarah Johnson', initials: 'SJ', avatarColor: '#FFF3B8', colorScheme: 'Accent1' as const },
  { id: 'owner-2', name: 'Michael Chen', initials: 'MC', avatarColor: '#D1EFFF', colorScheme: 'Accent2' as const },
  { id: 'owner-3', name: 'Emma Williams', initials: 'EW', avatarColor: '#FFE5CC', colorScheme: 'Accent3' as const },
  { id: 'owner-4', name: 'David Martinez', initials: 'DM', avatarColor: '#E5F1E3', colorScheme: 'Accent4' as const },
]

// Value Metrics from objectives-prototype
export interface ValueMetric {
  id: string
  label: string
  value: number
  currency: string
  unit: string
  date: string
}

export const PROFIT_LOSS_METRICS: ValueMetric[] = [
  { id: 'pl-1', label: 'Identified', value: 19, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'pl-2', label: 'Qualified', value: 9.5, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'pl-3', label: 'Realized', value: 7.8, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'pl-4', label: 'Tracked', value: 14.8, currency: '€', unit: 'M', date: 'Q1, 2021' },
]

export const WORKING_CAPITAL_METRICS: ValueMetric[] = [
  { id: 'wc-1', label: 'Identified', value: 8.4, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'wc-2', label: 'Qualified', value: 4.2, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'wc-3', label: 'Realized', value: 3.1, currency: '€', unit: 'M', date: 'Q1, 2021' },
  { id: 'wc-4', label: 'Tracked', value: 6.7, currency: '€', unit: 'M', date: 'Q1, 2021' },
]
