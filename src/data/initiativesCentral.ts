export type InitiativeStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Completed' | 'Draft'
export type InsightStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
export type ObjectiveStatus = 'Active' | 'Achieved' | 'At Risk' | 'Draft'

export interface Initiative {
  id: string
  name: string
  description: string
  status: InitiativeStatus
  owner: string
  ownerInitials: string
  targetProcesses: string[]
  startDate: string
  endDate: string
  createdAt: string
  changedAt: string
  insights: number
  valueAnalysisItems: number
}

export interface InitiativeValueCase {
  id: string
  name: string
  type: 'Cost Reduction' | 'Revenue Growth' | 'Risk Mitigation' | 'Compliance' | 'Efficiency'
  status: 'Planned' | 'In Progress' | 'Realized'
  estimatedValue: string
  actualValue?: string
  currency: 'EUR' | 'USD'
  owner: string
  ownerInitials: string
}

export interface Insight {
  id: string
  title: string
  description: string
  status: InsightStatus
  initiative?: string
  initiativeId?: string
  assignee?: string
  assigneeInitials?: string
  createdAt: string
  changedAt: string
  commentsCount: number
  type: 'Observation' | 'Recommendation' | 'Risk' | 'Opportunity'
  processName?: string
}

export interface Objective {
  id: string
  name: string
  description: string
  status: ObjectiveStatus
  owner: string
  ownerInitials: string
  targetDate: string
  createdAt: string
  initiatives: number
  insights: number
  progress: number
}

export const INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    name: 'Order to Cash Process Automation',
    description: 'Automate manual handoffs in the O2C process to reduce cycle time and error rates.',
    status: 'On Track',
    owner: 'Claire Westfield',
    ownerInitials: 'CW',
    targetProcesses: ['Order to Cash - End-to-End', 'Invoice Processing'],
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    createdAt: '2026-01-10',
    changedAt: '2026-07-18',
    insights: 5,
    valueAnalysisItems: 3,
  },
  {
    id: 'init-2',
    name: 'Procurement Cycle Time Reduction',
    description: 'Streamline supplier onboarding and approval steps to cut procurement lead time by 30%.',
    status: 'At Risk',
    owner: 'Mark Johansson',
    ownerInitials: 'MJ',
    targetProcesses: ['Procurement End-to-End', 'Vendor Management'],
    startDate: '2025-11-01',
    endDate: '2026-04-30',
    createdAt: '2025-10-20',
    changedAt: '2026-07-15',
    insights: 8,
    valueAnalysisItems: 2,
  },
  {
    id: 'init-3',
    name: 'Employee Onboarding Digitalization',
    description: 'Replace paper-based onboarding with a digital workflow that integrates HR, IT and Facilities.',
    status: 'On Track',
    owner: 'Sofia Bernal',
    ownerInitials: 'SB',
    targetProcesses: ['Employee Leave Request', 'Organisation Hierarchy'],
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    createdAt: '2026-01-25',
    changedAt: '2026-07-20',
    insights: 3,
    valueAnalysisItems: 1,
  },
  {
    id: 'init-4',
    name: 'Finance Close Acceleration',
    description: 'Reduce month-end close from 8 days to 4 days by eliminating reconciliation bottlenecks.',
    status: 'Completed',
    owner: 'Daniel Chen',
    ownerInitials: 'DC',
    targetProcesses: ['Receipt of Goods', 'Invoice Processing'],
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    createdAt: '2025-06-15',
    changedAt: '2026-01-03',
    insights: 12,
    valueAnalysisItems: 4,
  },
  {
    id: 'init-5',
    name: 'Quality Assurance Process Improvement',
    description: 'Establish automated QA checkpoints and traceability across manufacturing workflows.',
    status: 'Draft',
    owner: 'Claire Westfield',
    ownerInitials: 'CW',
    targetProcesses: ['Quality Assurance Testing'],
    startDate: '2026-08-01',
    endDate: '2027-01-31',
    createdAt: '2026-07-01',
    changedAt: '2026-07-22',
    insights: 0,
    valueAnalysisItems: 0,
  },
  {
    id: 'init-6',
    name: 'Sales Funnel Optimization',
    description: 'Remove hand-off delays between Marketing and Sales to increase conversion rates.',
    status: 'Off Track',
    owner: 'Mark Johansson',
    ownerInitials: 'MJ',
    targetProcesses: ['Sales Funnel Overview'],
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    createdAt: '2025-09-15',
    changedAt: '2026-07-01',
    insights: 6,
    valueAnalysisItems: 2,
  },
]

export const INITIATIVE_VALUE_CASES: Record<string, InitiativeValueCase[]> = {
  'init-1': [
    { id: 'vc-1-1', name: 'Reduce manual rework', type: 'Efficiency', status: 'In Progress', estimatedValue: '€ 120,000', actualValue: '€ 80,000', currency: 'EUR', owner: 'Claire Westfield', ownerInitials: 'CW' },
    { id: 'vc-1-2', name: 'Accelerate invoicing cycle', type: 'Revenue Growth', status: 'Planned', estimatedValue: '€ 200,000', currency: 'EUR', owner: 'Daniel Chen', ownerInitials: 'DC' },
    { id: 'vc-1-3', name: 'Reduce credit risk exposure', type: 'Risk Mitigation', status: 'Planned', estimatedValue: '€ 50,000', currency: 'EUR', owner: 'Sofia Bernal', ownerInitials: 'SB' },
  ],
  'init-2': [
    { id: 'vc-2-1', name: 'Reduce procurement lead time', type: 'Efficiency', status: 'In Progress', estimatedValue: '€ 180,000', currency: 'EUR', owner: 'Mark Johansson', ownerInitials: 'MJ' },
    { id: 'vc-2-2', name: 'Compliance with new supplier regulations', type: 'Compliance', status: 'Planned', estimatedValue: '€ 30,000', currency: 'EUR', owner: 'Claire Westfield', ownerInitials: 'CW' },
  ],
  'init-4': [
    { id: 'vc-4-1', name: 'Faster financial reporting', type: 'Efficiency', status: 'Realized', estimatedValue: '€ 90,000', actualValue: '€ 95,000', currency: 'EUR', owner: 'Daniel Chen', ownerInitials: 'DC' },
    { id: 'vc-4-2', name: 'Reduce audit preparation time', type: 'Cost Reduction', status: 'Realized', estimatedValue: '€ 40,000', actualValue: '€ 42,000', currency: 'EUR', owner: 'Daniel Chen', ownerInitials: 'DC' },
    { id: 'vc-4-3', name: 'Improve data accuracy', type: 'Risk Mitigation', status: 'Realized', estimatedValue: '€ 25,000', actualValue: '€ 28,000', currency: 'EUR', owner: 'Sofia Bernal', ownerInitials: 'SB' },
    { id: 'vc-4-4', name: 'Reduce overtime in finance team', type: 'Cost Reduction', status: 'Realized', estimatedValue: '€ 60,000', actualValue: '€ 55,000', currency: 'EUR', owner: 'Mark Johansson', ownerInitials: 'MJ' },
  ],
}

export const INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    title: 'Invoice approval step has 3-day average wait time',
    description: 'Analysis of the O2C process reveals that invoice approvals sit in the queue for an average of 3 business days before being acted on, primarily due to unclear ownership.',
    status: 'Open',
    initiative: 'Order to Cash Process Automation',
    initiativeId: 'init-1',
    assignee: 'Claire Westfield',
    assigneeInitials: 'CW',
    createdAt: '2026-06-15',
    changedAt: '2026-07-18',
    commentsCount: 4,
    type: 'Observation',
    processName: 'Order to Cash - End-to-End',
  },
  {
    id: 'ins-2',
    title: 'Recommend role-based routing for approvals',
    description: 'Implementing role-based routing would eliminate the manual assignment of approval tasks and reduce the average wait time to under 4 hours.',
    status: 'In Progress',
    initiative: 'Order to Cash Process Automation',
    initiativeId: 'init-1',
    assignee: 'Daniel Chen',
    assigneeInitials: 'DC',
    createdAt: '2026-06-20',
    changedAt: '2026-07-20',
    commentsCount: 2,
    type: 'Recommendation',
    processName: 'Order to Cash - End-to-End',
  },
  {
    id: 'ins-3',
    title: 'Vendor master data contains 18% duplicate entries',
    description: 'A data quality analysis across procurement revealed that nearly one in five vendor records are duplicates, causing split orders and delayed payments.',
    status: 'Open',
    initiative: 'Procurement Cycle Time Reduction',
    initiativeId: 'init-2',
    assignee: 'Mark Johansson',
    assigneeInitials: 'MJ',
    createdAt: '2026-05-10',
    changedAt: '2026-07-15',
    commentsCount: 7,
    type: 'Risk',
    processName: 'Procurement End-to-End',
  },
  {
    id: 'ins-4',
    title: 'Manual data entry in goods receipt creates bottleneck',
    description: 'The goods receipt process requires manual keying of delivery information from paper slips. Scanning or EDI integration would eliminate this step entirely.',
    status: 'Open',
    initiative: 'Procurement Cycle Time Reduction',
    initiativeId: 'init-2',
    assignee: 'Sofia Bernal',
    assigneeInitials: 'SB',
    createdAt: '2026-05-22',
    changedAt: '2026-07-12',
    commentsCount: 3,
    type: 'Opportunity',
    processName: 'Procurement End-to-End',
  },
  {
    id: 'ins-5',
    title: 'IT system access provisioning takes up to 5 days',
    description: 'New employees cannot access core systems for up to 5 days after their start date due to sequential approval chains and manual ticket creation.',
    status: 'In Progress',
    initiative: 'Employee Onboarding Digitalization',
    initiativeId: 'init-3',
    assignee: 'Sofia Bernal',
    assigneeInitials: 'SB',
    createdAt: '2026-03-01',
    changedAt: '2026-07-20',
    commentsCount: 5,
    type: 'Observation',
    processName: 'Employee Leave Request',
  },
  {
    id: 'ins-6',
    title: 'Parallel provisioning reduces onboarding time by 60%',
    description: 'Running IT, HR and Facilities onboarding tasks in parallel rather than in sequence would reduce total onboarding duration from 5 days to under 2 days.',
    status: 'Open',
    initiative: 'Employee Onboarding Digitalization',
    initiativeId: 'init-3',
    assignee: 'Claire Westfield',
    assigneeInitials: 'CW',
    createdAt: '2026-03-15',
    changedAt: '2026-07-19',
    commentsCount: 1,
    type: 'Recommendation',
    processName: 'Organisation Hierarchy',
  },
  {
    id: 'ins-7',
    title: 'Reconciliation bottleneck eliminated after workflow automation',
    description: 'Following the implementation of automated reconciliation in Q4 2025, the finance close time dropped from 8 days to 3.5 days — better than the 4-day target.',
    status: 'Resolved',
    initiative: 'Finance Close Acceleration',
    initiativeId: 'init-4',
    assignee: 'Daniel Chen',
    assigneeInitials: 'DC',
    createdAt: '2025-08-01',
    changedAt: '2026-01-05',
    commentsCount: 9,
    type: 'Observation',
    processName: 'Receipt of Goods',
  },
  {
    id: 'ins-8',
    title: 'Lead stage transition has no SLA enforcement',
    description: 'Leads in the "Qualified" stage can remain stale for weeks without any automated escalation or SLA breach notification.',
    status: 'Open',
    initiative: 'Sales Funnel Optimization',
    initiativeId: 'init-6',
    assignee: undefined,
    createdAt: '2026-04-10',
    changedAt: '2026-07-01',
    commentsCount: 0,
    type: 'Risk',
    processName: 'Sales Funnel Overview',
  },
  {
    id: 'ins-9',
    title: 'Shared dashboard reduces reporting effort',
    description: 'Consolidating sales reporting into a shared dashboard reduced manual export and formatting work by approximately 4 hours per week per rep.',
    status: 'Resolved',
    initiative: undefined,
    assignee: 'Mark Johansson',
    assigneeInitials: 'MJ',
    createdAt: '2026-05-05',
    changedAt: '2026-06-30',
    commentsCount: 2,
    type: 'Opportunity',
  },
  {
    id: 'ins-10',
    title: 'QA test coverage gap in critical process variants',
    description: 'Several high-risk process variants in manufacturing are not covered by the automated QA test suite, creating exposure to undetected defects.',
    status: 'Open',
    initiative: undefined,
    assignee: 'Sofia Bernal',
    assigneeInitials: 'SB',
    createdAt: '2026-07-05',
    changedAt: '2026-07-22',
    commentsCount: 0,
    type: 'Risk',
    processName: 'Quality Assurance Testing',
  },
]

export const OBJECTIVES: Objective[] = [
  {
    id: 'obj-1',
    name: 'Reduce Operational Costs by 15%',
    description: 'Drive down operational spend through process automation and elimination of manual rework across core business processes.',
    status: 'Active',
    owner: 'Claire Westfield',
    ownerInitials: 'CW',
    targetDate: '2026-12-31',
    createdAt: '2026-01-10',
    initiatives: 3,
    insights: 8,
    progress: 45,
  },
  {
    id: 'obj-2',
    name: 'Improve Employee Experience Score to 8.0',
    description: 'Streamline internal processes to reduce friction for employees and improve the overall workplace experience metric.',
    status: 'Active',
    owner: 'Sofia Bernal',
    ownerInitials: 'SB',
    targetDate: '2026-09-30',
    createdAt: '2026-02-01',
    initiatives: 1,
    insights: 3,
    progress: 62,
  },
  {
    id: 'obj-3',
    name: 'Achieve Full Finance Compliance by Q3',
    description: 'Ensure all finance processes are compliant with updated regulatory requirements before the Q3 audit cycle.',
    status: 'Achieved',
    owner: 'Daniel Chen',
    ownerInitials: 'DC',
    targetDate: '2026-07-01',
    createdAt: '2025-10-01',
    initiatives: 1,
    insights: 12,
    progress: 100,
  },
  {
    id: 'obj-4',
    name: 'Grow Revenue from Existing Accounts by 10%',
    description: 'Increase net revenue retention through improved sales processes, reduced churn, and faster lead conversion.',
    status: 'At Risk',
    owner: 'Mark Johansson',
    ownerInitials: 'MJ',
    targetDate: '2026-12-31',
    createdAt: '2026-01-20',
    initiatives: 1,
    insights: 6,
    progress: 28,
  },
  {
    id: 'obj-5',
    name: 'Launch Automated QA Framework',
    description: 'Establish a fully automated quality assurance framework covering all critical manufacturing process variants.',
    status: 'Draft',
    owner: 'Claire Westfield',
    ownerInitials: 'CW',
    targetDate: '2027-03-31',
    createdAt: '2026-07-01',
    initiatives: 1,
    insights: 0,
    progress: 0,
  },
]

export function getStatusDesign(status: InitiativeStatus | InsightStatus | ObjectiveStatus): 'indication4' | 'indication2' | 'indication1' | 'indication6' | 'indication10' | 'indication5' {
  switch (status) {
    case 'On Track':
    case 'Completed':
    case 'Achieved':
    case 'Resolved':
      return 'indication4'
    case 'At Risk':
      return 'indication2'
    case 'Off Track':
      return 'indication1'
    case 'In Progress':
      return 'indication5'
    case 'Draft':
      return 'indication10'
    case 'Open':
    case 'Active':
      return 'indication6'
    default:
      return 'indication10'
  }
}
