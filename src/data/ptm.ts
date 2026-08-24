// Mock data for Process Transformation Manager (PTM) pages

export type ItemStatus =
  | 'To Do'
  | 'Planning'
  | 'Planned'
  | 'In Progress'
  | 'On Track'
  | 'At Risk'
  | 'Behind'
  | 'Completed'
  | 'Cancelled'
  | 'Archived'

export type InsightStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
export type InsightSource = 'Process Insights' | 'Benchmarking' | 'Manual' | 'Process Intelligence'
export type InsightType = 'Issue' | 'Improvement' | 'Risk' | 'Opportunity'
export type InsightBusinessImpact = 'High' | 'Medium' | 'Low'
export type InsightUrgency = 'Critical' | 'High' | 'Medium' | 'Low'
export type EntityType = 'objective' | 'initiative' | 'valueCase'
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
  lastUpdate?: string
  children?: Objective[]
  entityType?: EntityType
  name?: string
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
  assets?: Asset[]
}

export type AssetType =
  | 'Dashboard'
  | 'Document'
  | 'Investigation'
  | 'Metrics'
  | 'ProcessModel'
  | 'ProcessFlow'
  | 'Jira'
  | 'Objective'
  | 'File'
  | 'Other'

export interface Asset {
  id: string
  initiativeId: string
  name: string
  url: string
  type: AssetType
  description: string
  dateUpdated: string
  createdBy: PTMOwner
}

export interface Insight {
  id: string
  title: string
  description: string
  source: InsightSource
  type: InsightType
  status: InsightStatus
  businessImpact: InsightBusinessImpact | null
  urgency: InsightUrgency | null
  owner: PTMOwner
  assignees: PTMOwner[]
  createdDate: string
  linkedInitiativeId: string | null
  // An insight can be associated with one OR many initiatives (matches the
  // insights-central model: Insight.allInitiativeIds: [String]! + initiatives relation).
  linkedInitiativeIds: string[]
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
  // Metric polarity: true when a higher value is the goal (e.g. productivity, automation
  // adoption), false when a lower value is the goal (e.g. manual-work rate, cycle time,
  // emissions). Drives the KPI header color/status. Do NOT infer from target-vs-baseline
  // alone — e.g. "Automation rate potential" has a target BELOW baseline (lower is better)
  // despite a name that reads higher-is-better.
  higherIsBetter?: boolean
  potentialValue: string
  realizedValue: string
  source: SourceType
  type: ValueType
  unit: string
  unitSub?: string
  currency?: string
  restricted?: boolean
  potentialValueRaw: string
  realizedValueRaw: string
  baselineDateRangeFormatted: string
  description: string
  realizedValueManuallyAdjusted?: boolean
  // Set when the source (PAM) Current/Target values have changed since the manual
  // Realized Value was last saved — the manual value may be stale and needs review.
  // Drives the amber (indication 3b) tag + "Review Values" header chip; a plain
  // manually-adjusted value (this false/undefined) shows a neutral gray tag.
  realizedValueNeedsReview?: boolean
  realizedValueChangedOn?: string
  realizedValueChangedBy?: string
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
    id: 'obj-reduce-cost',
    title: 'Reduce Customer Acquisition cost in the core product line',
    name: 'Reduce Customer Acquisition cost in the core product line',
    description: 'Reduce CAC by optimizing marketing spend and improving conversion rates.',
    owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
    status: 'On Track',
    dueDate: '2024-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Jan 13, 2026',
    changedOn: '04/08/24',
    lastUpdate: '4 Oct 2024',
    commentCount: 0,
    progress: 42,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    entityType: 'objective',
    children: [
      {
        id: 'init-increase-mrr',
        title: 'Increase MRR from accounts in the core product line',
        name: 'Increase MRR from accounts in the core product line',
        description: 'Focus on upselling and cross-selling to existing accounts.',
        owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
        status: 'On Track',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-reduce-cost',
        linkedInitiativeIds: [],
        createdOn: 'Feb 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '4 Oct 2024',
        commentCount: 0,
        progress: 54, // Average of children: (23+48+91)/3 = 54
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-mrr-1',
            title: 'Expand account coverage in healthcare segment',
            name: 'Expand account coverage in healthcare segment',
            description: 'Target healthcare accounts with specialized features.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 23,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-mrr-2',
            title: 'Upsell premium features to existing customers',
            name: 'Upsell premium features to existing customers',
            description: 'Promote advanced analytics and reporting capabilities.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'At Risk',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 48,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-mrr-3',
            title: 'Reduce churn in enterprise accounts',
            name: 'Reduce churn in enterprise accounts',
            description: 'Implement proactive customer success programs.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 91,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-optimize-pricing',
        title: 'Optimize Pricing Strategy for Core Product Portfolio',
        name: 'Optimize Pricing Strategy for Core Product Portfolio',
        description: 'Analyze and adjust pricing tiers to maximize revenue.',
        owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
        status: 'Behind',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-reduce-cost',
        linkedInitiativeIds: [],
        createdOn: 'Feb 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '1 Oct 2024',
        commentCount: 0,
        progress: 19, // Average of children: (29+8)/2 = 18.5 ≈ 19
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-pricing-1',
            title: 'Implement value-based pricing model',
            name: 'Implement value-based pricing model',
            description: 'Shift from feature-based to value-based pricing.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'Behind',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 15, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 29,
            startDate: '2024-03-15',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-pricing-2',
            title: 'Launch tiered pricing for SMB segment',
            name: 'Launch tiered pricing for SMB segment',
            description: 'Create accessible entry points for small businesses.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'Planned',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 15, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 8,
            startDate: '2024-03-15',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-process-automation',
        title: 'Improve invoice clearance automation',
        name: 'Improve invoice clearance automation',
        description: 'Automate invoice processing to reduce manual errors.',
        owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
        status: 'On Track',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-reduce-cost',
        linkedInitiativeIds: [],
        createdOn: 'Feb 15, 2026',
        changedOn: '04/08/24',
        lastUpdate: '1 Oct 2024',
        commentCount: 0,
        progress: 54, // Average of children: (71+38+45+62)/4 = 54
        startDate: '2024-02-15',
        endDate: '2024-12-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-invoice-1',
            title: 'Deploy OCR for invoice data extraction',
            name: 'Deploy OCR for invoice data extraction',
            description: 'Use optical character recognition to extract invoice data.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 71,
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-invoice-2',
            title: 'Integrate with ERP for automatic matching',
            name: 'Integrate with ERP for automatic matching',
            description: 'Connect invoice system with ERP for automated matching.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 38,
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-invoice-3',
            title: 'Reduce exception handling time',
            name: 'Reduce exception handling time',
            description: 'Streamline exception resolution workflows.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'At Risk',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 45,
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-invoice-4',
            title: 'Implement approval workflow automation',
            name: 'Implement approval workflow automation',
            description: 'Automate multi-level approval processes.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 62,
            startDate: '2024-04-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-time-attendance',
        title: 'Manage time and attendance',
        name: 'Manage time and attendance',
        description: 'Improve time tracking and attendance monitoring.',
        owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
        status: 'On Track',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-reduce-cost',
        linkedInitiativeIds: [],
        createdOn: 'Feb 20, 2026',
        changedOn: '04/08/24',
        lastUpdate: '1 Oct 2024',
        commentCount: 0,
        progress: 44, // Average of children: (86+71)/2 = 78.5, adjusted to 44 for variety
        startDate: '2024-02-20',
        endDate: '2024-12-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-time-1',
            title: 'Deploy mobile time-tracking app',
            name: 'Deploy mobile time-tracking app',
            description: 'Launch mobile app for employee time tracking.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'May 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 86,
            startDate: '2024-05-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-time-2',
            title: 'Automate overtime calculation and approvals',
            name: 'Automate overtime calculation and approvals',
            description: 'Streamline overtime tracking and approval workflows.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'May 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 71,
            startDate: '2024-05-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
        ],
      },
    ],
  },
  {
    id: 'obj-expand-market',
    title: 'Expand market share in the European region by 35%',
    name: 'Expand market share in the European region by 35%',
    description: 'Grow presence in key European markets through strategic partnerships.',
    owner: { id: 'michael-owen', name: 'Michael Owen', initials: 'MO', colorScheme: 'Accent3' },
    status: 'At Risk',
    dueDate: '2025-06-30',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Jan 20, 2026',
    changedOn: '04/08/24',
    lastUpdate: '1 Oct 2024',
    commentCount: 0,
    progress: 87,
    startDate: '2024-01-01',
    endDate: '2025-06-30',
    entityType: 'objective',
    children: [
      {
        id: 'init-product-features',
        title: 'Launch two new product features by Q2',
        name: 'Launch two new product features by Q2',
        description: 'Deliver new features to increase market competitiveness.',
        owner: { id: 'james-oliver', name: 'James Oliver', initials: 'JO', colorScheme: 'Accent4' },
        status: 'Completed',
        dueDate: '2024-06-30',
        parentObjectiveId: 'obj-expand-market',
        linkedInitiativeIds: [],
        createdOn: 'Mar 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '4 Oct 2024',
        commentCount: 0,
        progress: 100,
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-features-1',
            title: 'Advanced analytics dashboard',
            name: 'Advanced analytics dashboard',
            description: 'Build comprehensive analytics dashboard.',
            owner: { id: 'james-oliver', name: 'James Oliver', initials: 'JO', colorScheme: 'Accent4' },
            status: 'Completed',
            dueDate: '2024-06-30',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '4 Oct 2024',
            commentCount: 0,
            progress: 100,
            startDate: '2024-04-01',
            endDate: '2024-06-30',
            entityType: 'valueCase',
          },
          {
            id: 'vc-features-2',
            title: 'Real-time collaboration tools',
            name: 'Real-time collaboration tools',
            description: 'Enable real-time document collaboration.',
            owner: { id: 'james-oliver', name: 'James Oliver', initials: 'JO', colorScheme: 'Accent4' },
            status: 'Completed',
            dueDate: '2024-06-30',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Apr 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '4 Oct 2024',
            commentCount: 0,
            progress: 100,
            startDate: '2024-04-01',
            endDate: '2024-06-30',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-cost-savings',
        title: 'Cost Savings - Legacy CRM System Transformation',
        name: 'Cost Savings - Legacy CRM System Transformation',
        description: 'Migrate from legacy CRM to modern cloud solution.',
        owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
        status: 'Archived',
        dueDate: '2024-03-31',
        parentObjectiveId: 'obj-expand-market',
        linkedInitiativeIds: [],
        createdOn: 'Jan 15, 2026',
        changedOn: '04/08/24',
        lastUpdate: '1 Oct 2024',
        commentCount: 0,
        progress: 6,
        startDate: '2024-01-15',
        endDate: '2024-03-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-crm-1',
            title: 'Data migration and validation',
            name: 'Data migration and validation',
            description: 'Migrate historical data to new CRM system.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'Archived',
            dueDate: '2024-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Feb 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2024-02-01',
            endDate: '2024-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-crm-2',
            title: 'User training and change management',
            name: 'User training and change management',
            description: 'Train users on new CRM platform.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'Archived',
            dueDate: '2024-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Feb 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2024-02-01',
            endDate: '2024-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-crm-3',
            title: 'Integration with existing tools',
            name: 'Integration with existing tools',
            description: 'Connect CRM with email, calendar, and support systems.',
            owner: { id: 'john-brown', name: 'John Brown', initials: 'JB', colorScheme: 'Accent2' },
            status: 'Archived',
            dueDate: '2024-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Feb 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2024-02-01',
            endDate: '2024-03-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-procurement',
        title: 'Reduce Procurement Costs through Strategic Sourcing',
        name: 'Reduce Procurement Costs through Strategic Sourcing',
        description: 'Optimize supplier relationships and negotiate better terms.',
        owner: { id: 'maria-kim', name: 'Maria Kim', initials: 'MK', colorScheme: 'Accent5' },
        status: 'On Track',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-expand-market',
        linkedInitiativeIds: [],
        createdOn: 'Feb 10, 2026',
        changedOn: '04/08/24',
        lastUpdate: '29 Sep 2024',
        commentCount: 0,
        progress: 13, // Average matches all 3 children at 13%
        startDate: '2024-02-10',
        endDate: '2024-12-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-proc-1',
            title: 'Consolidate supplier base',
            name: 'Consolidate supplier base',
            description: 'Reduce number of suppliers for better volume discounts.',
            owner: { id: 'maria-kim', name: 'Maria Kim', initials: 'MK', colorScheme: 'Accent5' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '29 Sep 2024',
            commentCount: 0,
            progress: 13,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-proc-2',
            title: 'Implement supplier scorecards',
            name: 'Implement supplier scorecards',
            description: 'Track and evaluate supplier performance metrics.',
            owner: { id: 'maria-kim', name: 'Maria Kim', initials: 'MK', colorScheme: 'Accent5' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '29 Sep 2024',
            commentCount: 0,
            progress: 13,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-proc-3',
            title: 'Negotiate multi-year contracts',
            name: 'Negotiate multi-year contracts',
            description: 'Lock in favorable pricing with long-term agreements.',
            owner: { id: 'maria-kim', name: 'Maria Kim', initials: 'MK', colorScheme: 'Accent5' },
            status: 'On Track',
            dueDate: '2024-12-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '29 Sep 2024',
            commentCount: 0,
            progress: 13,
            startDate: '2024-03-01',
            endDate: '2024-12-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-efficiency',
        title: 'Improve Production Efficiency and Yield Optimization',
        name: 'Improve Production Efficiency and Yield Optimization',
        description: 'Increase manufacturing throughput and reduce waste.',
        owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
        status: 'Planned',
        dueDate: '2025-03-31',
        parentObjectiveId: 'obj-expand-market',
        linkedInitiativeIds: [],
        createdOn: 'Feb 15, 2026',
        changedOn: '04/08/24',
        lastUpdate: '1 Oct 2024',
        commentCount: 0,
        progress: 6,
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-prod-1',
            title: 'Install real-time monitoring sensors',
            name: 'Install real-time monitoring sensors',
            description: 'Deploy IoT sensors for production line monitoring.',
            owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
            status: 'Planned',
            dueDate: '2025-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-prod-2',
            title: 'Optimize batch sizing and scheduling',
            name: 'Optimize batch sizing and scheduling',
            description: 'Use predictive analytics for production planning.',
            owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
            status: 'Planned',
            dueDate: '2025-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-prod-3',
            title: 'Reduce defect rates through quality gates',
            name: 'Reduce defect rates through quality gates',
            description: 'Implement automated quality checkpoints.',
            owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
            status: 'Planned',
            dueDate: '2025-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-prod-4',
            title: 'Implement predictive maintenance',
            name: 'Implement predictive maintenance',
            description: 'Use AI to predict equipment failures before they occur.',
            owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
            status: 'Planned',
            dueDate: '2025-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            entityType: 'valueCase',
          },
          {
            id: 'vc-prod-5',
            title: 'Train workforce on lean manufacturing',
            name: 'Train workforce on lean manufacturing',
            description: 'Upskill employees in continuous improvement methodologies.',
            owner: { id: 'lisa-wang', name: 'Lisa Wang', initials: 'LW', colorScheme: 'Accent6' },
            status: 'Planned',
            dueDate: '2025-03-31',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 1, 2026',
            changedOn: '04/08/24',
            lastUpdate: '1 Oct 2024',
            commentCount: 0,
            progress: 6,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            entityType: 'valueCase',
          },
        ],
      },
      {
        id: 'init-transparency',
        title: 'Implement Cost-to-Serve Transparency and Reduction Program',
        name: 'Implement Cost-to-Serve Transparency and Reduction Program',
        description: 'Analyze and optimize cost-to-serve metrics across customer segments.',
        owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
        status: 'Behind',
        dueDate: '2024-09-30',
        parentObjectiveId: 'obj-expand-market',
        linkedInitiativeIds: [],
        createdOn: 'Feb 20, 2026',
        changedOn: '04/08/24',
        lastUpdate: '28 Sep 2024',
        commentCount: 0,
        progress: 34, // Average matches all 3 children at 34%
        startDate: '2024-02-20',
        endDate: '2024-09-30',
        entityType: 'initiative',
        children: [
          {
            id: 'vc-cost-1',
            title: 'Implement activity-based costing model',
            name: 'Implement activity-based costing model',
            description: 'Deploy ABC framework to track true cost-to-serve.',
            owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
            status: 'Behind',
            dueDate: '2024-09-30',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 15, 2026',
            changedOn: '04/08/24',
            lastUpdate: '28 Sep 2024',
            commentCount: 0,
            progress: 34,
            startDate: '2024-03-15',
            endDate: '2024-09-30',
            entityType: 'valueCase',
          },
          {
            id: 'vc-cost-2',
            title: 'Segment customers by profitability',
            name: 'Segment customers by profitability',
            description: 'Classify customer base using profitability metrics.',
            owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
            status: 'Behind',
            dueDate: '2024-09-30',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 15, 2026',
            changedOn: '04/08/24',
            lastUpdate: '28 Sep 2024',
            commentCount: 0,
            progress: 34,
            startDate: '2024-03-15',
            endDate: '2024-09-30',
            entityType: 'valueCase',
          },
          {
            id: 'vc-cost-3',
            title: 'Optimize fulfillment routes and logistics',
            name: 'Optimize fulfillment routes and logistics',
            description: 'Use route optimization algorithms to reduce delivery costs.',
            owner: { id: 'sarah-davis', name: 'Sarah Davis', initials: 'SD', colorScheme: 'Accent1' },
            status: 'Behind',
            dueDate: '2024-09-30',
            parentObjectiveId: null,
            linkedInitiativeIds: [],
            createdOn: 'Mar 15, 2026',
            changedOn: '04/08/24',
            lastUpdate: '28 Sep 2024',
            commentCount: 0,
            progress: 34,
            startDate: '2024-03-15',
            endDate: '2024-09-30',
            entityType: 'valueCase',
          },
        ],
      },
    ],
  },
  {
    id: 'obj-digital-transformation',
    title: 'Accelerate digital transformation across operations',
    name: 'Accelerate digital transformation across operations',
    description: 'Modernize legacy systems and adopt cloud-first architecture.',
    owner: { id: 'tech-lead', name: 'Alex Rivera', initials: 'AR', colorScheme: 'Accent4' },
    status: 'On Track',
    dueDate: '2025-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Jan 25, 2026',
    changedOn: '04/08/24',
    lastUpdate: '3 Oct 2024',
    commentCount: 0,
    progress: 55,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    entityType: 'objective',
    children: [
      {
        id: 'init-cloud-migration',
        title: 'Migrate core applications to cloud infrastructure',
        name: 'Migrate core applications to cloud infrastructure',
        description: 'Move critical workloads to AWS/Azure cloud platform.',
        owner: { id: 'tech-lead', name: 'Alex Rivera', initials: 'AR', colorScheme: 'Accent4' },
        status: 'On Track',
        dueDate: '2025-06-30',
        parentObjectiveId: 'obj-digital-transformation',
        linkedInitiativeIds: [],
        createdOn: 'Feb 5, 2026',
        changedOn: '04/08/24',
        lastUpdate: '3 Oct 2024',
        commentCount: 0,
        progress: 64,
        startDate: '2024-02-01',
        endDate: '2025-06-30',
        entityType: 'initiative',
      },
      {
        id: 'init-api-platform',
        title: 'Build unified API platform',
        name: 'Build unified API platform',
        description: 'Create consistent API gateway for all microservices.',
        owner: { id: 'tech-lead', name: 'Alex Rivera', initials: 'AR', colorScheme: 'Accent4' },
        status: 'Behind',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-digital-transformation',
        linkedInitiativeIds: [],
        createdOn: 'Mar 10, 2026',
        changedOn: '04/08/24',
        lastUpdate: '2 Oct 2024',
        commentCount: 0,
        progress: 31,
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        entityType: 'initiative',
      },
    ],
  },
  {
    id: 'obj-customer-experience',
    title: 'Enhance customer experience and satisfaction',
    name: 'Enhance customer experience and satisfaction',
    description: 'Improve NPS score by 20 points through service excellence.',
    owner: { id: 'cx-lead', name: 'Rachel Kim', initials: 'RK', colorScheme: 'Accent5' },
    status: 'At Risk',
    dueDate: '2024-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Feb 1, 2026',
    changedOn: '04/08/24',
    lastUpdate: '5 Oct 2024',
    commentCount: 0,
    progress: 28,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    entityType: 'objective',
    children: [
      {
        id: 'init-support-automation',
        title: 'Implement AI-powered customer support',
        name: 'Implement AI-powered customer support',
        description: 'Deploy chatbot and automated ticket routing.',
        owner: { id: 'cx-lead', name: 'Rachel Kim', initials: 'RK', colorScheme: 'Accent5' },
        status: 'At Risk',
        dueDate: '2024-09-30',
        parentObjectiveId: 'obj-customer-experience',
        linkedInitiativeIds: [],
        createdOn: 'Mar 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '5 Oct 2024',
        commentCount: 0,
        progress: 42,
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        entityType: 'initiative',
      },
      {
        id: 'init-feedback-loop',
        title: 'Establish customer feedback loop',
        name: 'Establish customer feedback loop',
        description: 'Create systematic process for collecting and acting on feedback.',
        owner: { id: 'cx-lead', name: 'Rachel Kim', initials: 'RK', colorScheme: 'Accent5' },
        status: 'Planned',
        dueDate: '2024-12-31',
        parentObjectiveId: 'obj-customer-experience',
        linkedInitiativeIds: [],
        createdOn: 'Apr 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '5 Oct 2024',
        commentCount: 0,
        progress: 15,
        startDate: '2024-06-01',
        endDate: '2024-12-31',
        entityType: 'initiative',
      },
    ],
  },
  {
    id: 'obj-sustainability',
    title: 'Achieve carbon neutrality by 2025',
    name: 'Achieve carbon neutrality by 2025',
    description: 'Reduce carbon footprint by 50% and offset remaining emissions.',
    owner: { id: 'sustainability', name: 'Jordan Lee', initials: 'JL', colorScheme: 'Accent6' },
    status: 'Behind',
    dueDate: '2025-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Jan 10, 2026',
    changedOn: '04/08/24',
    lastUpdate: '6 Oct 2024',
    commentCount: 0,
    progress: 19,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    entityType: 'objective',
    children: [
      {
        id: 'init-renewable-energy',
        title: 'Transition to 100% renewable energy',
        name: 'Transition to 100% renewable energy',
        description: 'Switch all facilities to renewable energy sources.',
        owner: { id: 'sustainability', name: 'Jordan Lee', initials: 'JL', colorScheme: 'Accent6' },
        status: 'Behind',
        dueDate: '2025-06-30',
        parentObjectiveId: 'obj-sustainability',
        linkedInitiativeIds: [],
        createdOn: 'Feb 1, 2026',
        changedOn: '04/08/24',
        lastUpdate: '6 Oct 2024',
        commentCount: 0,
        progress: 24,
        startDate: '2024-02-01',
        endDate: '2025-06-30',
        entityType: 'initiative',
      },
    ],
  },
  {
    id: 'obj-talent-development',
    title: 'Build world-class talent pipeline',
    name: 'Build world-class talent pipeline',
    description: 'Improve employee retention to 95% and reduce time-to-hire by 40%.',
    owner: { id: 'hr-lead', name: 'Sam Patel', initials: 'SP', colorScheme: 'Accent7' },
    status: 'On Track',
    dueDate: '2024-12-31',
    parentObjectiveId: null,
    linkedInitiativeIds: [],
    createdOn: 'Jan 15, 2026',
    changedOn: '04/08/24',
    lastUpdate: '7 Oct 2024',
    commentCount: 0,
    progress: 73,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    entityType: 'objective',
    children: [
      {
        id: 'init-learning-platform',
        title: 'Launch internal learning and development platform',
        name: 'Launch internal learning and development platform',
        description: 'Deploy comprehensive LMS with personalized learning paths.',
        owner: { id: 'hr-lead', name: 'Sam Patel', initials: 'SP', colorScheme: 'Accent7' },
        status: 'On Track',
        dueDate: '2024-08-31',
        parentObjectiveId: 'obj-talent-development',
        linkedInitiativeIds: [],
        createdOn: 'Feb 10, 2026',
        changedOn: '04/08/24',
        lastUpdate: '7 Oct 2024',
        commentCount: 0,
        progress: 86,
        startDate: '2024-02-01',
        endDate: '2024-08-31',
        entityType: 'initiative',
      },
      {
        id: 'init-recruitment-ai',
        title: 'Implement AI-assisted recruitment',
        name: 'Implement AI-assisted recruitment',
        description: 'Use AI to screen candidates and improve hiring efficiency.',
        owner: { id: 'hr-lead', name: 'Sam Patel', initials: 'SP', colorScheme: 'Accent7' },
        status: 'Completed',
        dueDate: '2024-06-30',
        parentObjectiveId: 'obj-talent-development',
        linkedInitiativeIds: [],
        createdOn: 'Jan 20, 2026',
        changedOn: '04/08/24',
        lastUpdate: '7 Oct 2024',
        commentCount: 0,
        progress: 100,
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        entityType: 'initiative',
      },
    ],
  },
]

// ─── Initiatives ───────────────────────────────────────────────────────────────


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
    startDate: 'Mar 1, 2026',
    endDate: 'Feb 28, 2027',
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
    startDate: 'May 1, 2025',
    endDate: 'Feb 28, 2026',
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
    startDate: 'Sep 1, 2025',
    endDate: 'Feb 28, 2026',
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
    startDate: 'Oct 1, 2025',
    endDate: 'Mar 31, 2026',
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
    startDate: 'Apr 1, 2025',
    endDate: 'Sep 30, 2025',
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
    startDate: 'Nov 1, 2024',
    endDate: 'Jun 30, 2025',
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
    status: 'Planning',
    insightCount: 5,
    valueCaseCount: 0,
    changedOn: 'Jan 15, 2023',
    startDate: 'Feb 1, 2026',
    endDate: 'Jul 31, 2026',
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
    startDate: 'Jun 1, 2024',
    endDate: 'Nov 30, 2024',
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
    startDate: 'Mar 1, 2024',
    endDate: 'Oct 31, 2024',
    about: 'Transformation initiative focused on process improvement.',
    commentCount: 1,
    type: 'Shared',
    visibility: 'archived',
    linkedObjectiveIds: ['obj-2'],
    linkedInsightIds: [],
  },

  // ── Additional shared initiatives ─────────────────────────────────────────
  { id: 'init-s1',  title: 'Reduce Purchase Order Cycle Time',       description: 'Cut average PO cycle time from 12 days to 4 days by eliminating manual approval bottlenecks.',          owner: SC, members: [SC, WP],     status: 'In Progress', type: 'Shared', insightCount: 9,  valueCaseCount: 2, changedOn: 'Mar 14, 2024', startDate: 'Feb 1, 2025',  endDate: 'Sep 30, 2025', about: '', commentCount: 3, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s2',  title: 'Automate Goods Receipt Process',          description: 'Introduce automated 3-way matching at goods receipt to reduce manual posting effort by 70%.',           owner: DH, members: [DH, IC],     status: 'Planning',    type: 'Shared', insightCount: 6,  valueCaseCount: 1, changedOn: 'Apr 2, 2024',  startDate: 'May 1, 2025',  endDate: 'Oct 31, 2025', about: '', commentCount: 1, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s3',  title: 'Implement E-Invoicing for Tier-1 Suppliers', description: 'Roll out electronic invoicing with top 50 suppliers to eliminate paper-based exceptions.',        owner: OI, members: [OI, SC, WP], status: 'In Progress', type: 'Shared', insightCount: 11, valueCaseCount: 3, changedOn: 'May 19, 2024', startDate: 'Aug 1, 2024',  endDate: 'Mar 31, 2026', about: '', commentCount: 5, visibility: 'available', linkedObjectiveIds: ['obj-1'], linkedInsightIds: [] },
  { id: 'init-s4',  title: 'Optimize Inventory Replenishment Policy',  description: 'Recalibrate reorder points and safety stock levels to reduce overstock by 30% while preventing stockouts.', owner: WP, members: [WP, DH],  status: 'At Risk',     type: 'Shared', insightCount: 8,  valueCaseCount: 2, changedOn: 'Jun 7, 2024',  startDate: 'Jun 1, 2025',  endDate: 'Nov 30, 2025', about: '', commentCount: 2, visibility: 'available', linkedObjectiveIds: ['obj-4'], linkedInsightIds: [] },
  { id: 'init-s5',  title: 'Streamline Customer Returns Process',      description: 'Redesign the returns workflow to reduce processing time from 14 days to 3 days.',                      owner: IC, members: [IC, OI],     status: 'In Progress', type: 'Shared', insightCount: 7,  valueCaseCount: 1, changedOn: 'Jul 23, 2024', startDate: 'Sep 1, 2025',  endDate: 'Feb 28, 2026', about: '', commentCount: 0, visibility: 'available', linkedObjectiveIds: ['obj-3'], linkedInsightIds: [] },
  { id: 'init-s6',  title: 'Digitize Manual Approval Workflows',       description: 'Replace paper-based approvals with digital workflow routing across finance and procurement.',            owner: SC, members: [SC, DH, WP], status: 'Planning',    type: 'Shared', insightCount: 5,  valueCaseCount: 0, changedOn: 'Aug 1, 2024',  startDate: 'Mar 1, 2026',  endDate: 'Sep 30, 2026', about: '', commentCount: 4, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s7',  title: 'Improve Forecast Accuracy in Planning',    description: 'Introduce statistical forecasting models to lift forecast accuracy from 61% to 85%.',                  owner: OI, members: [OI, IC],     status: 'In Progress', type: 'Shared', insightCount: 14, valueCaseCount: 4, changedOn: 'Sep 10, 2024', startDate: 'Oct 1, 2024',  endDate: 'May 31, 2026', about: '', commentCount: 2, visibility: 'available', linkedObjectiveIds: ['obj-4'], linkedInsightIds: [] },
  { id: 'init-s8',  title: 'Reduce Month-End Close Duration',          description: 'Shorten financial close from 8 days to 3 days by parallelising reconciliation tasks.',                  owner: DH, members: [DH, SC],     status: 'To Do',       type: 'Shared', insightCount: 4,  valueCaseCount: 1, changedOn: 'Oct 5, 2024',  startDate: 'Jan 1, 2025',  endDate: 'Jun 30, 2025', about: '', commentCount: 1, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s9',  title: 'Enhance Master Data Quality Program',      description: 'Establish ongoing data stewardship to reduce master data errors by 80% within two quarters.',           owner: WP, members: [WP, OI],     status: 'In Progress', type: 'Shared', insightCount: 6,  valueCaseCount: 0, changedOn: 'Nov 18, 2024', startDate: 'Sep 1, 2024',  endDate: 'Apr 30, 2025', about: '', commentCount: 3, visibility: 'available', linkedObjectiveIds: ['obj-1'], linkedInsightIds: [] },
  { id: 'init-s10', title: 'Deploy RPA for Invoice Processing',        description: 'Implement robotic process automation for high-volume, rules-based invoice handling.',                   owner: IC, members: [IC, DH, OI], status: 'Planning',    type: 'Shared', insightCount: 10, valueCaseCount: 3, changedOn: 'Dec 3, 2024',  startDate: 'Nov 1, 2024',  endDate: 'Jul 31, 2025', about: '', commentCount: 0, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s11', title: 'Consolidate Vendor Master Data',           description: 'Merge duplicate vendor records and enforce a single-source-of-truth for supplier identities.',           owner: SC, members: [SC, WP],     status: 'At Risk',     type: 'Shared', insightCount: 3,  valueCaseCount: 1, changedOn: 'Jan 9, 2025',  startDate: 'Dec 1, 2024',  endDate: 'May 31, 2025', about: '', commentCount: 2, visibility: 'available', linkedObjectiveIds: ['obj-5'], linkedInsightIds: [] },
  { id: 'init-s12', title: 'Improve Contract Compliance Rate',         description: 'Raise on-contract spend from 54% to 80% by improving catalogue coverage and maverick buying controls.',  owner: DH, members: [DH, SC, IC], status: 'In Progress', type: 'Shared', insightCount: 8,  valueCaseCount: 2, changedOn: 'Feb 14, 2025', startDate: 'Jan 1, 2025',  endDate: 'Sep 30, 2025', about: '', commentCount: 4, visibility: 'available', linkedObjectiveIds: ['obj-2'], linkedInsightIds: [] },
  { id: 'init-s13', title: 'Accelerate Credit Approval Process',       description: 'Reduce average credit approval time from 5 days to same-day using automated scoring rules.',           owner: OI, members: [OI, WP],     status: 'To Do',       type: 'Shared', insightCount: 5,  valueCaseCount: 0, changedOn: 'Mar 3, 2025',  startDate: 'Feb 1, 2025',  endDate: 'Aug 31, 2025', about: '', commentCount: 1, visibility: 'available', linkedObjectiveIds: ['obj-3'], linkedInsightIds: [] },

  // ── Additional private initiatives ────────────────────────────────────────
  { id: 'init-p1',  title: 'Cost-Benefit Analysis: Finance Automation',  description: 'Personal assessment of automation ROI across AP, AR and GL before proposing to steering committee.',    owner: JH, members: [JH], status: 'In Progress', type: 'Private', insightCount: 4,  valueCaseCount: 1, changedOn: 'Mar 22, 2024', startDate: 'Feb 1, 2024',  endDate: 'Jun 30, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p2',  title: 'Investigate Root Cause: High Invoice Exception Rate', description: 'Private analysis of invoice exception clusters before escalating to the P2P team.',             owner: JH, members: [JH], status: 'Planning',    type: 'Private', insightCount: 6,  valueCaseCount: 0, changedOn: 'Apr 11, 2024', startDate: 'Apr 1, 2024',  endDate: 'Jul 31, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p3',  title: 'Assess Vendor Risk Exposure for EMEA',        description: 'Map single-source dependencies in the EMEA supplier base ahead of the annual risk review.',             owner: JH, members: [JH], status: 'To Do',       type: 'Private', insightCount: 2,  valueCaseCount: 0, changedOn: 'May 5, 2024',  startDate: 'May 1, 2024',  endDate: 'Sep 30, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p4',  title: 'Draft Business Case: Shared Services Center', description: 'Personal scoping document for a proposed shared services centre covering finance and HR.',              owner: JH, members: [JH], status: 'Planning',    type: 'Private', insightCount: 3,  valueCaseCount: 2, changedOn: 'Jun 17, 2024', startDate: 'Jun 1, 2024',  endDate: 'Dec 31, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p5',  title: 'Analyse Cash Flow Bottlenecks in APAC',       description: 'Identify top 5 cash conversion bottlenecks specific to APAC operations before cross-functional scoping.', owner: JH, members: [JH], status: 'In Progress', type: 'Private', insightCount: 7,  valueCaseCount: 1, changedOn: 'Jul 30, 2024', startDate: 'Jul 1, 2024',  endDate: 'Oct 31, 2024', about: '', commentCount: 1, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p6',  title: 'Internal Audit: Duplicate Payment Review',    description: 'Confidential review of duplicate payment patterns identified in the AP aging report.',                  owner: JH, members: [JH], status: 'At Risk',     type: 'Private', insightCount: 5,  valueCaseCount: 0, changedOn: 'Aug 8, 2024',  startDate: 'Aug 1, 2024',  endDate: 'Nov 30, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p7',  title: 'Research: RPA Tool Evaluation',               description: 'Personal research comparing UiPath, Automation Anywhere and SAP Build for the upcoming RFP.',           owner: JH, members: [JH], status: 'Planning',    type: 'Private', insightCount: 1,  valueCaseCount: 0, changedOn: 'Sep 14, 2024', startDate: 'Sep 1, 2024',  endDate: 'Jan 31, 2025', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p8',  title: 'Investigate Order Fulfilment Delays DACH',    description: 'Root cause analysis of DACH-specific delivery delays observed in Q3 process mining data.',             owner: JH, members: [JH], status: 'In Progress', type: 'Private', insightCount: 8,  valueCaseCount: 1, changedOn: 'Oct 21, 2024', startDate: 'Oct 1, 2024',  endDate: 'Feb 28, 2025', about: '', commentCount: 2, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p9',  title: 'Preliminary Assessment: ERP Migration Impact', description: 'Private scoping of process impact areas prior to the S/4HANA migration project kick-off.',            owner: JH, members: [JH], status: 'To Do',       type: 'Private', insightCount: 3,  valueCaseCount: 0, changedOn: 'Nov 4, 2024',  startDate: 'Nov 1, 2024',  endDate: 'Mar 31, 2025', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p10', title: 'Process Compliance Gap Analysis Q1',           description: 'Internal review of Q1 compliance gaps against documented process standards and SOPs.',                  owner: JH, members: [JH], status: 'Completed',   type: 'Private', insightCount: 9,  valueCaseCount: 2, changedOn: 'Dec 12, 2024', startDate: 'Jan 1, 2024',  endDate: 'Mar 31, 2024', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p11', title: 'Explore AI-Driven Demand Forecasting',         description: 'Early-stage personal exploration of ML forecasting tools before proposing a pilot to the supply chain team.', owner: JH, members: [JH], status: 'Planning', type: 'Private', insightCount: 2, valueCaseCount: 0, changedOn: 'Jan 7, 2025',  startDate: 'Jan 1, 2025',  endDate: 'Jun 30, 2025', about: '', commentCount: 0, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
  { id: 'init-p12', title: 'Benchmark Analysis: DSO Reduction Opportunities', description: 'Private benchmarking of days sales outstanding against industry peers to identify improvement targets.', owner: JH, members: [JH], status: 'In Progress', type: 'Private', insightCount: 5, valueCaseCount: 1, changedOn: 'Feb 19, 2025', startDate: 'Feb 1, 2025', endDate: 'May 31, 2025', about: '', commentCount: 1, visibility: 'private', linkedObjectiveIds: [], linkedInsightIds: [] },
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
    businessImpact: 'High',
    urgency: 'Critical',
    owner: SC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Feb 25, 2023',
    linkedInitiativeId: 'init-1',
    linkedInitiativeIds: ['init-1', 'init-2'],
    commentCount: 1,
  },
  {
    id: 'ins-2',
    title: 'Incomplete sales order items blocking our deliveries across the locations',
    description: 'Incomplete line items in sales orders are causing delivery blocks at 4 distribution centres.',
    source: 'Process Insights',
    type: 'Issue',
    status: 'In Progress',
    businessImpact: 'High',
    urgency: 'High',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Jan 06, 2023',
    linkedInitiativeId: 'init-1',
    linkedInitiativeIds: ['init-1'],
    commentCount: 0,
  },
  {
    id: 'ins-3',
    title: 'Sales order items incomplete for delivery',
    description: 'High volume of sales order items with missing delivery-relevant data fields, causing manual intervention.',
    source: 'Manual',
    type: 'Improvement',
    status: 'Resolved',
    businessImpact: 'Medium',
    urgency: 'Medium',
    owner: IC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Dec 16, 2022',
    linkedInitiativeId: 'init-1',
    linkedInitiativeIds: ['init-1', 'init-3', 'init-4'],
    commentCount: 0,
  },
  {
    id: 'ins-4',
    title: 'Anomaly in price change rate for plant',
    description: 'Price change rate for Plant DE01 is 340% above peer average — root cause linked to manual price corrections.',
    source: 'Process Intelligence',
    type: 'Risk',
    status: 'Open',
    businessImpact: 'High',
    urgency: 'Critical',
    owner: DH,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Sep 03, 2022',
    linkedInitiativeId: 'init-2',
    linkedInitiativeIds: ['init-2'],
    commentCount: 0,
  },
  {
    id: 'ins-5',
    title: 'Metric "NPS" is 208.16% lower than mean where "Variant" is "Escalated"',
    description: 'NPS score for escalated order variants shows significant underperformance versus the process mean.',
    source: 'Process Intelligence',
    type: 'Issue',
    status: 'Open',
    businessImpact: 'Medium',
    urgency: 'High',
    owner: SC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Aug 15, 2022',
    linkedInitiativeId: 'init-2',
    linkedInitiativeIds: ['init-1', 'init-2'],
    commentCount: 0,
  },
  {
    id: 'ins-6',
    title: 'Some EKGRP (e.g. 888, 712 and 715) have not been assigned yet!',
    description: 'Purchasing groups 888, 712, and 715 are unassigned in the system — creating routing failures for POs.',
    source: 'Manual',
    type: 'Issue',
    status: 'Open',
    businessImpact: 'Low',
    urgency: 'Medium',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'May 27, 2022',
    linkedInitiativeId: 'init-3',
    linkedInitiativeIds: ['init-3'],
    commentCount: 0,
  },
  {
    id: 'ins-7',
    title: '29% (3.8K) sales billing documents canceled',
    description: '3,800 billing documents were cancelled in the review period — disproportionately high versus industry benchmark of 4%.',
    source: 'Benchmarking',
    type: 'Opportunity',
    status: 'Open',
    businessImpact: 'High',
    urgency: 'High',
    owner: IC,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Apr 14, 2022',
    linkedInitiativeId: 'init-4',
    linkedInitiativeIds: ['init-1', 'init-4', 'init-6'],
    commentCount: 0,
  },
  {
    id: 'ins-8',
    title: 'Significant delay in order fulfilment due to materials shortage',
    description: 'Stock-out events causing average 6-day delay in order fulfilment for 18% of SKUs.',
    source: 'Manual',
    type: 'Risk',
    status: 'Resolved',
    businessImpact: 'Medium',
    urgency: 'Low',
    owner: WP,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Feb 03, 2022',
    linkedInitiativeId: 'init-2',
    linkedInitiativeIds: ['init-2'],
    commentCount: 0,
  },
  {
    id: 'ins-9',
    title: 'Overdue purchase orders have risen by 12% in Q2 2023 compared to Q1',
    description: 'Overdue PO rate has increased quarter-on-quarter, concentrated in electronics category.',
    source: 'Benchmarking',
    type: 'Risk',
    status: 'Rejected',
    businessImpact: 'Low',
    urgency: 'Low',
    owner: DH,
    assignees: [SC, WP, IC, OI],
    createdDate: 'Dec 28, 2021',
    linkedInitiativeId: 'init-6',
    linkedInitiativeIds: ['init-1', 'init-6'],
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
  'To Do':       'indication3',
  'Planning':    'indication6',
  'In Progress': 'indication5',
  'At Risk':     'indication1',
  'Completed':   'indication4',
  'Archived':    'indication10',
}

export const STATUS_DOT_COLOR: Record<string, string> = {
  'To Do':       'rgb(185, 81, 0)',
  'Planning':    'rgb(4, 108, 122)',
  'In Progress': 'rgb(0, 112, 242)',
  'At Risk':     'rgb(132, 6, 6)',
  'Completed':   'rgb(37, 111, 58)',
  'Archived':    'rgb(69, 72, 74)',
}

export const INSIGHT_STATUS_COLOR: Record<InsightStatus, string> = {
  'Open':        'var(--sapCriticalColor)',
  'In Progress': 'var(--sapInformativeColor)',
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
  { id: 'vc-1', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Maintenance orders created', baselineDateRange: '01.04.2019 - 01.04.2022', baseline: '56%', current: '61,0%', target: '75,0%', higherIsBetter: true, potentialValue: '25,162.1K EUR', realizedValue: '8,234.6K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '25162.1K', realizedValueRaw: '8234.6K', baselineDateRangeFormatted: 'Apr 1, 2019 - Apr 1, 2022', description: 'Track and optimize the rate of maintenance orders created across procurement workflows.', realizedValueManuallyAdjusted: true, realizedValueNeedsReview: true, realizedValueChangedOn: 'Jul 23, 2025', realizedValueChangedBy: 'Adrian Webster' },
  { id: 'vc-2', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Manual change rate on purchase orders', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '5,1%', current: '4,2%', target: '2,5%', higherIsBetter: false, potentialValue: '59.5K EUR', realizedValue: '21.4K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '59.5K', realizedValueRaw: '21.4K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Reduce the rate of manual changes applied to purchase orders.' },
  { id: 'vc-3', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Changes in purchase requisitions', baselineDateRange: '01.08.2021 - 31.12.2022', baseline: '196 Changes', current: '142 Changes', target: '78 Changes', higherIsBetter: false, potentialValue: '59.5K EUR', realizedValue: '31.8K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Count', potentialValueRaw: '59.5K', realizedValueRaw: '31.8K', baselineDateRangeFormatted: 'Aug 1, 2021 - Dec 31, 2022', description: 'Monitor and reduce changes made to purchase requisitions.' },
  { id: 'vc-4', initiativeId: 'init-1', valueDriver: 'Improve procurement FTE productivity', groupType: 'Profit and Loss', groupPotential: '25,329.2K EUR', groupRealized: '8,306.1K EUR', name: 'Automation rate potential', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '12,5%', current: '10,2%', target: '4,0%', higherIsBetter: false, potentialValue: '48.1K USD', realizedValue: '18.3K USD', source: 'Process Insights', type: 'Profit and Loss', unit: 'Percentage', currency: 'USD', potentialValueRaw: '48.1K', realizedValueRaw: '18.3K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Measure the potential for process automation.', realizedValueManuallyAdjusted: true, realizedValueChangedOn: 'Jul 23, 2025', realizedValueChangedBy: 'Adrian Webster' },
  { id: 'vc-5', initiativeId: 'init-1', valueDriver: 'Workforce Productivity', groupType: 'Profit and Loss', groupPotential: '658.1K EUR', groupRealized: '183.4K EUR', name: 'Enhancing Employee Experience', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '12,5%', current: '16,3%', target: '25,0%', higherIsBetter: true, potentialValue: '658.1K EUR', realizedValue: '183.4K EUR', source: 'Manual', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '658.1K', realizedValueRaw: '183.4K', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Improve employee satisfaction and productivity through targeted initiatives.' },
  { id: 'vc-6', initiativeId: 'init-1', valueDriver: 'Operational Efficiency and Process Quality', groupType: 'Profit and Loss', groupPotential: '6.2K EUR', groupRealized: '-', name: 'Operational Cycle Time', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '14 Days', current: '11 Days', target: '7 Days', higherIsBetter: false, potentialValue: '6.2K EUR', realizedValue: '-', source: 'Manual', type: 'Profit and Loss', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '6.2K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Apr 1, 2023 - May 1, 2024', description: 'Description of the value case' },
  { id: 'vc-7', initiativeId: 'init-1', valueDriver: 'Unknown Value Driver', groupType: 'Working Capital', groupPotential: '48.1K EUR', groupRealized: '-', name: 'Carbon Emissions and Energy Usage', baselineDateRange: '01.10.2022 - 31.12.2022', baseline: '1200 tCO₂e', current: '1,045 tCO₂e', target: '600 tCO₂e', higherIsBetter: false, potentialValue: '48.1K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Count', restricted: true, potentialValueRaw: '48.1K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Oct 1, 2022 - Dec 31, 2022', description: 'Track and reduce carbon emissions and energy consumption.' },

  // init-2: Changes in Order to Cash (In Progress)
  { id: 'vc-8',  initiativeId: 'init-2', valueDriver: 'Reduce Order Cycle Time', groupType: 'Profit and Loss', groupPotential: '3,420.0K EUR', groupRealized: '890.0K EUR', name: 'Order processing time reduction', baselineDateRange: '01.01.2024 - 30.06.2024', baseline: '8.4 Days', current: '6.1 Days', target: '3.0 Days', higherIsBetter: false, potentialValue: '2,100.0K EUR', realizedValue: '580.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '2100K', realizedValueRaw: '580K', baselineDateRangeFormatted: 'Jan 1, 2024 - Jun 30, 2024', description: 'Reduce end-to-end order processing time to accelerate cash conversion.' },
  { id: 'vc-9',  initiativeId: 'init-2', valueDriver: 'Reduce Order Cycle Time', groupType: 'Profit and Loss', groupPotential: '3,420.0K EUR', groupRealized: '890.0K EUR', name: 'Manual order exceptions rate', baselineDateRange: '01.01.2024 - 30.06.2024', baseline: '18.2%', current: '13.5%', target: '5.0%', higherIsBetter: false, potentialValue: '1,320.0K EUR', realizedValue: '310.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '1320K', realizedValueRaw: '310K', baselineDateRangeFormatted: 'Jan 1, 2024 - Jun 30, 2024', description: 'Reduce rate of orders requiring manual exception handling.' },
  { id: 'vc-10', initiativeId: 'init-2', valueDriver: 'Working Capital Efficiency', groupType: 'Working Capital', groupPotential: '1,850.0K EUR', groupRealized: '-', name: 'Days Sales Outstanding improvement', baselineDateRange: '01.01.2024 - 30.06.2024', baseline: '42 Days', current: '38 Days', target: '30 Days', higherIsBetter: false, potentialValue: '1,850.0K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '1850K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jan 1, 2024 - Jun 30, 2024', description: 'Reduce average days sales outstanding through faster collections.' },

  // init-3: Early Payments Investigation (In Progress)
  { id: 'vc-11', initiativeId: 'init-3', valueDriver: 'Cash Flow Optimization', groupType: 'Working Capital', groupPotential: '2,240.0K EUR', groupRealized: '430.0K EUR', name: 'Early payment discount capture rate', baselineDateRange: '01.04.2024 - 30.09.2024', baseline: '22.0%', current: '34.5%', target: '65.0%', higherIsBetter: true, potentialValue: '2,240.0K EUR', realizedValue: '430.0K EUR', source: 'Process Intelligence', type: 'Working Capital', unit: 'Percentage', potentialValueRaw: '2240K', realizedValueRaw: '430K', baselineDateRangeFormatted: 'Apr 1, 2024 - Sep 30, 2024', description: 'Increase capture of early payment discounts offered by suppliers.' },
  { id: 'vc-12', initiativeId: 'init-3', valueDriver: 'Cash Flow Optimization', groupType: 'Working Capital', groupPotential: '2,240.0K EUR', groupRealized: '430.0K EUR', name: 'Supplier discount agreement coverage', baselineDateRange: '01.04.2024 - 30.09.2024', baseline: '38 Suppliers', current: '54 Suppliers', target: '100 Suppliers', higherIsBetter: true, potentialValue: '980.0K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Count', potentialValueRaw: '980K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Apr 1, 2024 - Sep 30, 2024', description: 'Expand number of suppliers covered by early payment discount agreements.' },

  // init-4: Set up Performance Incentives & Penalties (In Progress)
  { id: 'vc-13', initiativeId: 'init-4', valueDriver: 'Supplier Performance', groupType: 'Profit and Loss', groupPotential: '1,670.0K EUR', groupRealized: '210.0K EUR', name: 'On-time delivery rate improvement', baselineDateRange: '01.07.2024 - 31.12.2024', baseline: '71.0%', current: '77.4%', target: '92.0%', higherIsBetter: true, potentialValue: '1,670.0K EUR', realizedValue: '210.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '1670K', realizedValueRaw: '210K', baselineDateRangeFormatted: 'Jul 1, 2024 - Dec 31, 2024', description: 'Improve on-time delivery rate through SLA-based incentive structures.' },
  { id: 'vc-14', initiativeId: 'init-4', valueDriver: 'Supplier Performance', groupType: 'Profit and Loss', groupPotential: '1,670.0K EUR', groupRealized: '210.0K EUR', name: 'Penalty recovery from SLA breaches', baselineDateRange: '01.07.2024 - 31.12.2024', baseline: '12 Incidents', current: '8 Incidents', target: '2 Incidents', higherIsBetter: false, potentialValue: '340.0K EUR', realizedValue: '-', source: 'Manual', type: 'Profit and Loss', unit: 'Count', potentialValueRaw: '340K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jul 1, 2024 - Dec 31, 2024', description: 'Recover costs from suppliers breaching SLA thresholds.' },

  // init-s2: Automate Goods Receipt Process (Planning)
  { id: 'vc-15', initiativeId: 'init-s2', valueDriver: 'Process Automation', groupType: 'Profit and Loss', groupPotential: '1,200.0K EUR', groupRealized: '-', name: 'Goods receipt posting automation rate', baselineDateRange: '01.06.2024 - 30.11.2024', baseline: '14.0%', current: '14.0%', target: '80.0%', higherIsBetter: true, potentialValue: '1,200.0K EUR', realizedValue: '-', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '1200K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jun 1, 2024 - Nov 30, 2024', description: 'Automate goods receipt posting via 3-way matching to reduce manual effort.' },
  { id: 'vc-16', initiativeId: 'init-s2', valueDriver: 'Process Automation', groupType: 'Working Capital', groupPotential: '800.0K EUR', groupRealized: '-', name: 'Goods receipt-to-invoice matching time', baselineDateRange: '01.06.2024 - 30.11.2024', baseline: '3.2 Days', current: '3.2 Days', target: '0.5 Days', higherIsBetter: false, potentialValue: '800.0K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '800K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jun 1, 2024 - Nov 30, 2024', description: 'Reduce time from goods receipt to matching with corresponding invoice.' },

  // init-s3: Implement E-Invoicing for Tier-1 Suppliers (In Progress)
  { id: 'vc-17', initiativeId: 'init-s3', valueDriver: 'Invoice Process Efficiency', groupType: 'Profit and Loss', groupPotential: '2,760.0K EUR', groupRealized: '640.0K EUR', name: 'Paper invoice elimination rate', baselineDateRange: '01.08.2024 - 31.01.2025', baseline: '58.0%', current: '42.0%', target: '5.0%', higherIsBetter: false, potentialValue: '2,760.0K EUR', realizedValue: '640.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '2760K', realizedValueRaw: '640K', baselineDateRangeFormatted: 'Aug 1, 2024 - Jan 31, 2025', description: 'Eliminate paper-based invoicing through e-invoicing rollout with tier-1 suppliers.' },
  { id: 'vc-18', initiativeId: 'init-s3', valueDriver: 'Invoice Process Efficiency', groupType: 'Profit and Loss', groupPotential: '2,760.0K EUR', groupRealized: '640.0K EUR', name: 'Invoice exception rate reduction', baselineDateRange: '01.08.2024 - 31.01.2025', baseline: '21.0%', current: '17.3%', target: '8.0%', higherIsBetter: false, potentialValue: '920.0K EUR', realizedValue: '180.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '920K', realizedValueRaw: '180K', baselineDateRangeFormatted: 'Aug 1, 2024 - Jan 31, 2025', description: 'Reduce invoice exceptions caused by missing or incorrect data fields.' },

  // init-s5: Streamline Customer Returns Process (In Progress)
  { id: 'vc-19', initiativeId: 'init-s5', valueDriver: 'Customer Experience', groupType: 'Profit and Loss', groupPotential: '960.0K EUR', groupRealized: '-', name: 'Returns processing time reduction', baselineDateRange: '01.09.2024 - 28.02.2025', baseline: '14 Days', current: '11 Days', target: '3 Days', higherIsBetter: false, potentialValue: '960.0K EUR', realizedValue: '-', source: 'Manual', type: 'Profit and Loss', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '960K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Sep 1, 2024 - Feb 28, 2025', description: 'Reduce end-to-end customer returns processing time to improve satisfaction.' },
  { id: 'vc-20', initiativeId: 'init-s5', valueDriver: 'Customer Experience', groupType: 'Working Capital', groupPotential: '540.0K EUR', groupRealized: '-', name: 'Return-to-credit cycle time', baselineDateRange: '01.09.2024 - 28.02.2025', baseline: '18 Days', current: '15 Days', target: '5 Days', higherIsBetter: false, potentialValue: '540.0K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '540K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Sep 1, 2024 - Feb 28, 2025', description: 'Reduce time from return receipt to customer credit memo issuance.' },

  // init-s7: Improve Forecast Accuracy in Planning (In Progress)
  { id: 'vc-21', initiativeId: 'init-s7', valueDriver: 'Demand Planning Accuracy', groupType: 'Working Capital', groupPotential: '3,100.0K EUR', groupRealized: '920.0K EUR', name: 'Forecast accuracy rate improvement', baselineDateRange: '01.10.2024 - 31.03.2025', baseline: '61.0%', current: '70.2%', target: '85.0%', higherIsBetter: true, potentialValue: '3,100.0K EUR', realizedValue: '920.0K EUR', source: 'Process Intelligence', type: 'Working Capital', unit: 'Percentage', potentialValueRaw: '3100K', realizedValueRaw: '920K', baselineDateRangeFormatted: 'Oct 1, 2024 - Mar 31, 2025', description: 'Improve statistical forecast accuracy using ML-based forecasting models.' },
  { id: 'vc-22', initiativeId: 'init-s7', valueDriver: 'Demand Planning Accuracy', groupType: 'Working Capital', groupPotential: '3,100.0K EUR', groupRealized: '920.0K EUR', name: 'Excess inventory reduction', baselineDateRange: '01.10.2024 - 31.03.2025', baseline: '28.0%', current: '24.1%', target: '10.0%', higherIsBetter: false, potentialValue: '1,480.0K EUR', realizedValue: '390.0K EUR', source: 'Manual', type: 'Working Capital', unit: 'Percentage', potentialValueRaw: '1480K', realizedValueRaw: '390K', baselineDateRangeFormatted: 'Oct 1, 2024 - Mar 31, 2025', description: 'Reduce excess inventory caused by inaccurate demand forecasting.' },
  { id: 'vc-23', initiativeId: 'init-s7', valueDriver: 'Demand Planning Accuracy', groupType: 'Profit and Loss', groupPotential: '780.0K EUR', groupRealized: '140.0K EUR', name: 'Stockout-driven lost sales reduction', baselineDateRange: '01.10.2024 - 31.03.2025', baseline: '4.8%', current: '3.9%', target: '1.5%', higherIsBetter: false, potentialValue: '780.0K EUR', realizedValue: '140.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '780K', realizedValueRaw: '140K', baselineDateRangeFormatted: 'Oct 1, 2024 - Mar 31, 2025', description: 'Reduce lost sales attributable to stockouts from demand forecast errors.' },

  // init-s8: Reduce Month-End Close Duration (To Do)
  { id: 'vc-24', initiativeId: 'init-s8', valueDriver: 'Finance Close Efficiency', groupType: 'Profit and Loss', groupPotential: '1,560.0K EUR', groupRealized: '-', name: 'Month-end close duration reduction', baselineDateRange: '01.01.2025 - 30.06.2025', baseline: '8 Days', current: '8 Days', target: '3 Days', higherIsBetter: false, potentialValue: '1,560.0K EUR', realizedValue: '-', source: 'Manual', type: 'Profit and Loss', unit: 'Duration', unitSub: 'Days', potentialValueRaw: '1560K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jan 1, 2025 - Jun 30, 2025', description: 'Shorten the financial month-end close cycle by parallelising reconciliation tasks.' },
  { id: 'vc-25', initiativeId: 'init-s8', valueDriver: 'Finance Close Efficiency', groupType: 'Profit and Loss', groupPotential: '1,560.0K EUR', groupRealized: '-', name: 'Reconciliation error rate', baselineDateRange: '01.01.2025 - 30.06.2025', baseline: '7.2%', current: '7.2%', target: '2.0%', higherIsBetter: false, potentialValue: '620.0K EUR', realizedValue: '-', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '620K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jan 1, 2025 - Jun 30, 2025', description: 'Reduce reconciliation errors delaying the close process.' },

  // init-s12: Improve Contract Compliance Rate (In Progress)
  { id: 'vc-26', initiativeId: 'init-s12', valueDriver: 'Procurement Compliance', groupType: 'Profit and Loss', groupPotential: '2,380.0K EUR', groupRealized: '510.0K EUR', name: 'On-contract spend rate improvement', baselineDateRange: '01.01.2025 - 30.09.2025', baseline: '54.0%', current: '62.3%', target: '80.0%', higherIsBetter: true, potentialValue: '2,380.0K EUR', realizedValue: '510.0K EUR', source: 'Process Intelligence', type: 'Profit and Loss', unit: 'Percentage', potentialValueRaw: '2380K', realizedValueRaw: '510K', baselineDateRangeFormatted: 'Jan 1, 2025 - Sep 30, 2025', description: 'Increase proportion of spend covered by negotiated contracts to capture savings.' },
  { id: 'vc-27', initiativeId: 'init-s12', valueDriver: 'Procurement Compliance', groupType: 'Working Capital', groupPotential: '940.0K EUR', groupRealized: '-', name: 'Maverick buying reduction', baselineDateRange: '01.01.2025 - 30.09.2025', baseline: '31.0%', current: '26.4%', target: '12.0%', higherIsBetter: false, potentialValue: '940.0K EUR', realizedValue: '-', source: 'Manual', type: 'Working Capital', unit: 'Percentage', potentialValueRaw: '940K', realizedValueRaw: '-', baselineDateRangeFormatted: 'Jan 1, 2025 - Sep 30, 2025', description: 'Reduce off-contract purchases through improved catalogue coverage and controls.' },
]

// ─── Assets ───────────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  { id: 'ast-1', initiativeId: 'init-s1', name: 'PO Cycle Time Dashboard', url: 'https://analytics.example.com/dashboards/po-cycle-time', type: 'Dashboard', description: 'Live dashboard tracking average PO cycle time across all procurement regions.', dateUpdated: 'Mar 14, 2024', createdBy: SC },
  { id: 'ast-2', initiativeId: 'init-s1', name: 'Approval Bottleneck Investigation', url: 'https://signavio.example.com/investigations/approval-bottleneck', type: 'Investigation', description: 'Process mining investigation isolating manual approval steps causing cycle time delays.', dateUpdated: 'Feb 28, 2024', createdBy: WP },
  { id: 'ast-3', initiativeId: 'init-s1', name: 'Procurement Process Flow – Current State', url: 'https://signavio.example.com/processes/proc-current-v3', type: 'ProcessFlow', description: 'Current-state process model for the end-to-end PO workflow.', dateUpdated: 'Jan 10, 2024', createdBy: SC },
  { id: 'ast-4', initiativeId: 'init-s1', name: 'Initiative Brief – PO Optimisation', url: 'https://confluence.example.com/display/PROC/po-brief', type: 'Document', description: 'Executive brief outlining the scope, goals, and expected outcomes of the initiative.', dateUpdated: 'Feb 1, 2024', createdBy: JH },
  { id: 'ast-5', initiativeId: 'init-s1', name: 'JIRA Epic: PO Automation', url: 'https://jira.example.com/browse/PROC-421', type: 'Jira', description: 'Tracks all engineering tasks related to automating the PO approval routing.', dateUpdated: 'Mar 10, 2024', createdBy: WP },
  { id: 'ast-6', initiativeId: 'init-1', name: 'Finance Automation ROI Model', url: 'https://sharepoint.example.com/sites/finance/roi-model.xlsx', type: 'File', description: 'Spreadsheet model estimating return on investment for AP, AR and GL automation.', dateUpdated: 'Mar 20, 2024', createdBy: JH },
  { id: 'ast-7', initiativeId: 'init-1', name: 'AP Exception Rate Metrics', url: 'https://analytics.example.com/metrics/ap-exception-rate', type: 'Metrics', description: 'KPI set measuring accounts payable exception frequency and resolution time.', dateUpdated: 'Mar 18, 2024', createdBy: JH },
]

export const PTM_OWNERS = [
  { id: 'owner-1', name: 'Sarah Johnson', initials: 'SJ', avatarColor: '#FFF3B8', colorScheme: 'Accent1' as const },
  { id: 'owner-2', name: 'Michael Chen', initials: 'MC', avatarColor: '#D1EFFF', colorScheme: 'Accent2' as const },
  { id: 'owner-3', name: 'Emma Williams', initials: 'EW', avatarColor: '#FFE5CC', colorScheme: 'Accent3' as const },
  { id: 'owner-4', name: 'David Martinez', initials: 'DM', avatarColor: '#E5F1E3', colorScheme: 'Accent4' as const },
]

export type { ValueMetric } from "@/data/ptmData"
