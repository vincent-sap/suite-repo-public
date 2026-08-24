// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DomainObjects = any
type ColorDesigns = 'none' | 'error' | 'information' | 'positive' | 'success' | 'warning' | 'negative'
type Chip = { value: string; design: ColorDesigns }

import type { ProcessAtomExtension, ProcessAtomOwner } from '../domains/repository/Repository/ProcessAtomInfoPanel'

export type ResultItem = {
  id: string
  name: string
  objectType: DomainObjects
  typeName: string
  description?: string
  richTextDescription?: string
  lastUpdateBy: string
  lastUpdateDate: string
  createdDate?: string
  lastPublished?: string
  version?: string
  folder?: string
  comments?: number
  insights?: number
  value?: string
  isFavorite?: boolean
  canEdit?: boolean
  progress?: string
  endDate?: string
  owner?: ProcessAtomOwner
  tags?: string[]
  extensions?: ProcessAtomExtension[]
  chips: Chip[]
}

export function enrichChips(item: ResultItem) {
  const base = item.chips.map(c => ({ ...c, label: 'Status:' }))
  const extra: { value: string; design: 'none'; label: string; useExplicitDesign: true }[] = []
  if (item.typeName === 'BPMN' || item.typeName === 'Value Chain') {
    extra.push({ value: item.version ?? '1.0', design: 'none', label: 'Latest Revision:', useExplicitDesign: true })
    extra.push({ value: `P-${item.id.padStart(4, '0')}`, design: 'none', label: 'Process ID:', useExplicitDesign: true })
  }
  if (item.typeName === 'Objective' && item.progress) {
    extra.push({ value: item.progress, design: 'none', label: 'Progress:', useExplicitDesign: true })
  }
  if (item.typeName === 'Initiative' && item.endDate) {
    extra.push({ value: item.endDate, design: 'none', label: 'End Date:', useExplicitDesign: true })
  }
  return [...base, ...extra]
}

export const TYPE_OPTIONS = [
  { value: 'bpmn', label: 'BPMN' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'journey', label: 'Journey Model' },
  { value: 'value-chain', label: 'Value Chain' },
  { value: 'objective', label: 'Objective' },
]

export const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'on-track', label: 'On Track' },
  { value: 'modified', label: 'Modified' },
  { value: 'at-risk', label: 'At Risk' },
]

export const RESULTS: ResultItem[] = [
  {
    id: '1',
    name: 'Procure parts',
    objectType: 'Process Model',
    typeName: 'BPMN',
    description: 'This process concerns the purchase of production parts and is held regularly during the execution of the order as well as production development instead. This process can occur at various points within...',
    lastUpdateBy: 'Claire Westfield',
    lastUpdateDate: 'Apr 17, 2025',
    createdDate: 'Apr 17, 2025',
    version: '8.4',
    folder: 'Name of Parent Folder',
    comments: 7,
    isFavorite: true,
    chips: [{ value: 'Published', design: 'positive' }],
  },
  {
    id: '3',
    name: 'Finance Process Dashboard',
    objectType: 'Dashboard',
    typeName: 'Dashboard',
    description: 'Real-time overview of key finance KPIs including cycle time, approval rate, and cost per transaction across all finance processes.',
    lastUpdateBy: 'Claire Westfield',
    lastUpdateDate: 'Feb 17, 2025',
    createdDate: 'Feb 17, 2025',
    version: '1',
    folder: 'Finance & Accounting',
    chips: [],
  },
  {
    id: '4',
    name: 'EMEA Procurement Optimization 2025',
    objectType: 'Initiative',
    typeName: 'Initiative',
    description: 'A strategic project aimed at enhancing procurement efficiency across Europe, the Middle East, and Africa. This initiative focuses on leveraging efficiencies through advanced data analytics, supplier col...',
    lastUpdateBy: 'Claire Westfield',
    lastUpdateDate: 'Mar 21, 2025',
    createdDate: 'Mar 21, 2025',
    comments: 2,
    insights: 17,
    value: '172k EUR',
    endDate: 'Dec 31, 2025',
    chips: [{ value: 'On Track', design: 'information' }],
  },
  {
    id: '5',
    name: 'Procurement Experience Analysis',
    objectType: 'Customer Journey',
    typeName: 'Journey Model',
    description: 'Evaluating and enhancing the customer journey through procurement touchpoints.',
    lastUpdateBy: 'Johan Weinstein',
    lastUpdateDate: 'Apr 2, 2025',
    createdDate: 'Apr 2, 2025',
    version: '1.1',
    folder: 'Lines of Business',
    chips: [{ value: 'Draft', design: 'none' }],
  },
  {
    id: '6',
    name: 'Order-to-Cash Value Chain',
    objectType: 'Value Chain',
    typeName: 'Value Chain',
    description: 'The hiring process starts with the creation of a job description and posting the job opening on various platforms.',
    lastUpdateBy: 'Claire Westfield',
    lastUpdateDate: 'Sep 8, 2025',
    createdDate: 'Apr 22, 2025',
    folder: 'Order to Cash',
    chips: [{ value: 'Modified', design: 'indication7' as any }],
  },
  {
    id: '7',
    name: 'Reduce Finance Operating Cost by 20%',
    objectType: 'Business Goal',
    typeName: 'Objective',
    description: 'Lower the expenses associated with running the business by optimizing processes, improving efficiency, and eliminating waste.',
    lastUpdateBy: 'Johan Weinstein',
    lastUpdateDate: 'Mar 4, 2026',
    createdDate: 'Oct 23, 2025',
    progress: '30%',
    chips: [{ value: 'At Risk', design: 'indication2' as any }],
  },
  {
    id: '8',
    name: 'Vendor Payment Processing',
    objectType: 'Process Model',
    typeName: 'BPMN',
    description: 'Handles the end-to-end processing of vendor invoices from receipt through payment execution, including three-way matching and approval workflows.',
    lastUpdateBy: 'Paul Gray',
    lastUpdateDate: 'Jan 15, 2026',
    createdDate: 'Jun 10, 2024',
    version: '3.2',
    folder: 'Finance & Accounting',
    chips: [{ value: 'Published', design: 'positive' }],
  },
  {
    id: '9',
    name: 'HR Process Landscape',
    objectType: 'Value Chain',
    typeName: 'Value Chain',
    description: 'Overview of all human resources processes from talent acquisition through offboarding, covering the full employee lifecycle.',
    lastUpdateBy: 'Sarah Kim',
    lastUpdateDate: 'Apr 28, 2026',
    createdDate: 'May 2, 2023',
    version: '3.0',
    folder: 'Human Resources',
    chips: [{ value: 'Published', design: 'positive' }],
  },
  {
    id: '10',
    name: 'Improve Customer Satisfaction Score by 15%',
    objectType: 'Business Goal',
    typeName: 'Objective',
    description: 'Increase the net promoter score across all customer-facing touchpoints by streamlining support processes and reducing average resolution time.',
    lastUpdateBy: 'Lina Davis',
    lastUpdateDate: 'May 10, 2026',
    createdDate: 'Jan 7, 2026',
    progress: '65%',
    chips: [{ value: 'On Track', design: 'information' as any }],
  },
  {
    id: '11',
    name: 'Digital Transformation Initiative 2026',
    objectType: 'Initiative',
    typeName: 'Initiative',
    description: 'Cross-functional program to modernize legacy systems and automate manual processes across Finance, HR, and Operations departments.',
    lastUpdateBy: 'Marcus Holloway',
    lastUpdateDate: 'Jun 1, 2026',
    createdDate: 'Nov 15, 2025',
    comments: 5,
    insights: 23,
    value: '2.4M EUR',
    endDate: 'Jun 30, 2026',
    chips: [{ value: 'On Track', design: 'information' }],
  },
  {
    id: '12',
    name: 'Employee Onboarding Journey',
    objectType: 'Customer Journey',
    typeName: 'Journey Model',
    description: 'Maps the complete onboarding experience for new hires from offer acceptance through their first 90 days, identifying key pain points and improvement opportunities.',
    lastUpdateBy: 'Amara Nwosu',
    lastUpdateDate: 'Mar 12, 2026',
    createdDate: 'Sep 5, 2025',
    version: '2.0',
    folder: 'Human Resources',
    chips: [{ value: 'Published', design: 'positive' }],
  },
  {
    id: '13',
    name: 'Operations KPI Dashboard',
    objectType: 'Dashboard',
    typeName: 'Dashboard',
    description: 'Consolidated view of operational metrics including throughput, defect rate, on-time delivery, and resource utilization across all production units.',
    lastUpdateBy: 'Ian Webster',
    lastUpdateDate: 'May 22, 2026',
    createdDate: 'Aug 1, 2025',
    version: '4.1',
    folder: 'Operations',
    chips: [],
  },
  {
    id: '14',
    name: 'Incident Management Process',
    objectType: 'Process Model',
    typeName: 'BPMN',
    description: 'ITIL-aligned process for detecting, classifying, escalating, and resolving IT service disruptions to restore normal operations as quickly as possible.',
    lastUpdateBy: 'Raj Patel',
    lastUpdateDate: 'Feb 28, 2026',
    createdDate: 'Mar 14, 2024',
    version: '2.1',
    folder: 'IT Operations',
    chips: [{ value: 'Draft', design: 'none' }],
  },
  {
    id: '15',
    name: 'Source-to-Pay Value Chain',
    objectType: 'Value Chain',
    typeName: 'Value Chain',
    description: 'End-to-end view of the procurement value chain from supplier identification and sourcing through purchase order execution and payment settlement.',
    lastUpdateBy: 'Florence Meierbeer',
    lastUpdateDate: 'Apr 5, 2026',
    createdDate: 'Oct 12, 2023',
    version: '6.0',
    folder: 'Procurement',
    chips: [{ value: 'Published', design: 'positive' }],
  },
  {
    id: '16',
    name: 'Accelerate Time-to-Market by 30%',
    objectType: 'Business Goal',
    typeName: 'Objective',
    description: 'Reduce product development cycle time through agile methodologies, improved cross-team collaboration, and elimination of approval bottlenecks.',
    lastUpdateBy: 'Marcus Holloway',
    lastUpdateDate: 'Jun 10, 2026',
    createdDate: 'Feb 1, 2026',
    progress: '45%',
    chips: [{ value: 'On Track', design: 'information' as any }],
  },
  {
    id: '17',
    name: 'Supplier Onboarding Journey',
    objectType: 'Customer Journey',
    typeName: 'Journey Model',
    description: 'Documents the supplier experience from initial registration through qualification, contract signing, and first purchase order, highlighting friction points.',
    lastUpdateBy: 'Johan Weinstein',
    lastUpdateDate: 'Jan 30, 2026',
    createdDate: 'Jul 20, 2025',
    version: '1.3',
    folder: 'Procurement',
    chips: [{ value: 'Draft', design: 'none' }],
  },
  {
    id: '18',
    name: 'Sustainability & ESG Initiative',
    objectType: 'Initiative',
    typeName: 'Initiative',
    description: 'Company-wide program to reduce carbon footprint, improve supply chain transparency, and meet ESG reporting requirements by end of fiscal year.',
    lastUpdateBy: 'Petra Lindqvist',
    lastUpdateDate: 'May 15, 2026',
    createdDate: 'Jan 10, 2026',
    comments: 8,
    value: '800k EUR',
    endDate: 'Dec 31, 2026',
    chips: [{ value: 'At Risk', design: 'indication2' as any }],
  },
  {
    id: '19',
    name: 'Sales Performance Dashboard',
    objectType: 'Dashboard',
    typeName: 'Dashboard',
    description: 'Live tracking of sales pipeline, quota attainment, win rates, and revenue forecast across all regions and product lines.',
    lastUpdateBy: 'Lina Davis',
    lastUpdateDate: 'Jun 5, 2026',
    createdDate: 'Mar 1, 2025',
    version: '2.3',
    folder: 'Sales & Customer Service',
    chips: [],
  },
  {
    id: '20',
    name: 'Employee Offboarding Process',
    objectType: 'Process Model',
    typeName: 'BPMN',
    description: 'Structured process for managing employee departures including knowledge transfer, access revocation, equipment return, and final payroll processing.',
    lastUpdateBy: 'Amara Nwosu',
    lastUpdateDate: 'Mar 20, 2026',
    createdDate: 'Nov 5, 2024',
    version: '1.5',
    folder: 'Human Resources',
    chips: [{ value: 'Published', design: 'positive' }],
  },
]
