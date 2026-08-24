import type { ComponentProps } from 'react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { formatDate, addDays, lastWeekday } from '../utils/dates'

export type DomainObjects = ComponentProps<typeof SigDomainObject>['object']

export interface MockItem {
  object: DomainObjects
  title: string
  /** Readable type label, e.g. "BPMN", "Customer Journey Map" */
  type: string
  /** Dates: display as-is if string ("2 hours ago"); or calculate a date based on number */
  created: string | number
  lastSaved: string | number
  lastAccessed: string | number
  lastPublished: string | number
  isFavorite: boolean
  description?: string
  /** Filename stem of the preview asset, e.g. "SampleProcess1" (SVG files stay in src/models/) */
  preview?: string
  /** Full folder path within the repository, e.g. 'Modeling Files' or 'Modeling Files/Contract templates' */
  folderPath: string
  state?: 'Published' | 'Modified' | 'Draft'
  /** IDs of DICTIONARY_ITEMS roles relevant to this item */
  roles?: number[]
  /** User id of the last person to save this item */
  lastSavedById?: string
  /** User id of the last person to publish this item (same as lastSavedById in 80% of cases) */
  lastPublishedById?: string
}

export function formatAccessed(v: string | number): string {
  if (typeof v === 'string') return v
  return formatDate(lastWeekday(addDays(new Date(), -v)))
}

// 8 active Administrators/Modelers from users.ts, assigned round-robin as lastSavedById and lastPublishedById
const EDITOR_IDS = ['1', '2', '4', '6', '7', '9', '12', '13']

export const REPOSITORY_ITEMS: MockItem[] = [
  { title: 'Company Overview', isFavorite: true,
    description: '',
    object: 'Value Chain', type: 'Value Chain',
    created: 35,  lastSaved: 35,  state: 'Published',
    lastAccessed: '1 hour ago',  lastPublished: 3,
    preview: 'EntryDiagram',
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[0], lastPublishedById: EDITOR_IDS[1] },

  { title: '[To-Be: Post Transformation] Credit Management', isFavorite: false,
    description: '',
    object: 'Process Model', type: 'BPMN',
    created: 99,  lastSaved: 84,  state: 'Modified',
    lastAccessed: '2 hours ago', lastPublished: 84,
    preview: 'SampleProcess1',
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[1], lastPublishedById: EDITOR_IDS[1] },

  { title: 'Procurement of Work Equipment', isFavorite: true,
    description: '',
    object: 'Process Model', type: 'BPMN',
    created: 57,  lastSaved: 57,  state: 'Published',
    lastAccessed: '1 day ago',   lastPublished: 57,
    preview: 'SampleProcess2',
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[2], lastPublishedById: EDITOR_IDS[2] },

  { title: 'Contract templates', isFavorite: false,
    description: '',
    object: 'Folder', type: 'Folder',
    created: 156, lastSaved: 141,  state: 'Published',
    lastAccessed: '1 day ago',   lastPublished: 141,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[3], lastPublishedById: EDITOR_IDS[3] },

  { title: 'Procure2Pay 2026', isFavorite: true,
    description: '',
    object: 'Initiative', type: 'Initiative',
    created: 100, lastSaved: 100,  state: 'Published',
    lastAccessed: 2,             lastPublished: 100,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[4], lastPublishedById: EDITOR_IDS[5] },

  { title: 'Hiring Process', isFavorite: false,
    description: '',
    object: 'Process Model', type: 'BPMN',
    created: 64,  lastSaved: 49,  state: 'Published',
    lastAccessed: 7,             lastPublished: 49,
    preview: 'SampleProcess4',
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[5], lastPublishedById: EDITOR_IDS[5] },

  { title: 'Shipping', isFavorite: false,
    description: '',
    object: 'Folder', type: 'Folder',
    created: 224, lastSaved: 224,  state: 'Published',
    lastAccessed: 7,             lastPublished: 224,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[6], lastPublishedById: EDITOR_IDS[6] },

  { title: 'Lead-to-Cash', isFavorite: true,
    description: '',
    object: 'Process Model', type: 'BPMN',
    created: 134, lastSaved: 119,  state: 'Published',
    lastAccessed: 16,            lastPublished: 128,
    preview: 'SampleProcess3',
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[7], lastPublishedById: EDITOR_IDS[0] },

  { title: 'New Supplier Contract', isFavorite: true,
    description: '',
    object: 'PDF', type: 'PDF Document',
    created: 327, lastSaved: 327,  state: 'Published',
    lastAccessed: 24,            lastPublished: 339,
    preview: undefined,
    folderPath: 'Modeling Files/Contract templates',
    lastSavedById: EDITOR_IDS[0], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-60-10 Recruiting Management', isFavorite: false,
    description: '',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: '22 hours ago',  lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-60 Recruiting',
    lastSavedById: EDITOR_IDS[1], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-60 Recruiting', isFavorite: false,
    description: '',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: '22 hours ago',  lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-60 Recruiting',
    lastSavedById: EDITOR_IDS[2], lastPublishedById: EDITOR_IDS[2] },

  { title: 'MHR-20-30-70-20 Monitor Leave of Absence', isFavorite: false,
    description: 'This process refers to monitoring leave of absence after the absence has started. During monitoring process, existing leave of absence can be extended and employment information updated if needed.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 8,              lastPublished: 28,
    preview: 'SampleProcess1',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-20 HR Administration',
    lastSavedById: EDITOR_IDS[3], lastPublishedById: EDITOR_IDS[3] },

  { title: 'HTR_01 Manage Workforce', isFavorite: true,
    description: 'The leading practice process Manage Workforce consists of the following elements.',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Draft',
    lastAccessed: 10,             lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Hire to Retire for Human Resources',
    lastSavedById: EDITOR_IDS[4], lastPublishedById: EDITOR_IDS[5] },

  { title: 'Process Modellierer', isFavorite: false,
    description: '',
    object: 'Dictionary Entry', type: 'Dictionary entry',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 10,             lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[5], lastPublishedById: EDITOR_IDS[5] },

  { title: 'MHR-10-10-10 Create New Position', isFavorite: false,
    description: 'This process refers to the request, approval and creation of individual new positions outside of regular headcount planning cycles.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 10,             lastPublished: 28,
    preview: 'SampleProcess2',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-10 Organizational Management',
    lastSavedById: EDITOR_IDS[6], lastPublishedById: EDITOR_IDS[6] },

  { title: 'MHR-10-20-10 Create/Update Foundation Element', isFavorite: false,
    description: 'This process refers to the request from a Line Manager to update a foundation element.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 18,             lastPublished: 28,
    preview: 'SampleProcess3',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-10 Organizational Management',
    lastSavedById: EDITOR_IDS[7], lastPublishedById: EDITOR_IDS[0] },

  { title: 'MHR-30-10-50 Pay Out Time Accounts', isFavorite: false,
    description: 'This process refers to paying out remaining absence quotas to employees.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 24,             lastPublished: 28,
    preview: 'SampleProcess4',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-30 Time and Attendance Management',
    lastSavedById: EDITOR_IDS[0], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-70-10 Onboarding', isFavorite: false,
    description: '',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 28,             lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-70 Onboarding',
    lastSavedById: EDITOR_IDS[1], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-20-40-40 Manage Termination - Death of an Employee', isFavorite: false,
    description: 'This process refers to termination of employee who has passed away.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 28,             lastPublished: 28,
    preview: 'SampleProcess1',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-20 HR Administration',
    lastSavedById: EDITOR_IDS[2], lastPublishedById: EDITOR_IDS[2] },

  { title: 'HTR_04 Educate and Develop', isFavorite: false,
    description: 'The leading practice process Educate and Develop.',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 28,             lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Hire to Retire for Human Resources',
    lastSavedById: EDITOR_IDS[3], lastPublishedById: EDITOR_IDS[3] },

  { title: 'HTR_02 Attract and Acquire', isFavorite: false,
    description: 'The leading practice process Attract & Acquire.',
    object: 'Value Chain', type: 'Value Chain',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 28,             lastPublished: 28,
    preview: undefined,
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Hire to Retire for Human Resources',
    lastSavedById: EDITOR_IDS[4], lastPublishedById: EDITOR_IDS[5] },

  { title: 'MHR-60-10-10 Create Job Requisition', isFavorite: false,
    description: 'This process refers to creation of a Job requisition.',
    object: 'Process Model', type: 'BPMN',
    created: 28,  lastSaved: 28,  state: 'Published',
    lastAccessed: 28,             lastPublished: 28,
    preview: 'SampleProcess2',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-60 Recruiting',
    lastSavedById: EDITOR_IDS[5], lastPublishedById: EDITOR_IDS[5] },

  { title: 'MHR-20-10-30 Administer Internal Hire (New Employment)', isFavorite: false,
    description: 'This process refers to the transfer of an employee from one position to another within the company.',
    object: 'Process Model', type: 'BPMN',
    created: 131, lastSaved: 28,  state: 'Published',
    lastAccessed: 131,            lastPublished: 28,
    preview: 'SampleProcess3',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-20 HR Administration',
    lastSavedById: EDITOR_IDS[6], lastPublishedById: EDITOR_IDS[6] },

  { title: 'MHR-70-10-10-20 Perform Onboarding Tasks', isFavorite: false,
    description: 'This process is subprocess of "Execute Pre-Day 1 Onboarding" process.',
    object: 'Process Model', type: 'BPMN',
    created: 149, lastSaved: 28,  state: 'Published',
    lastAccessed: 131,            lastPublished: 28,
    preview: 'SampleProcess4',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-70 Onboarding',
    lastSavedById: EDITOR_IDS[7], lastPublishedById: EDITOR_IDS[0] },

  { title: 'MHR-60-10-10-10 Conduct Strategy Alignment Meeting with Hiring Manager', isFavorite: false,
    description: 'This process refers to alignment between dedicated recruiter and line manager.',
    object: 'Process Model', type: 'BPMN',
    created: 131, lastSaved: 28,  state: 'Published',
    lastAccessed: 131,            lastPublished: 28,
    preview: 'SampleProcess1',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-60 Recruiting',
    lastSavedById: EDITOR_IDS[0], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-130-20-10 Create Employee Inquiry', isFavorite: false,
    description: 'This process reviews the multi-channel options for resolving employee issues.',
    object: 'Process Model', type: 'BPMN',
    created: 135, lastSaved: 28,  state: 'Published',
    lastAccessed: 135,            lastPublished: 28,
    preview: 'SampleProcess2',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-130 Service Center',
    lastSavedById: EDITOR_IDS[1], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-130-10-10 Manage Knowledge Base', isFavorite: false,
    description: 'This process refers to the ongoing need to maintain knowledge base articles.',
    object: 'Process Model', type: 'BPMN',
    created: 162, lastSaved: 28,  state: 'Published',
    lastAccessed: 138,            lastPublished: 28,
    preview: 'SampleProcess3',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-130 Service Center',
    lastSavedById: EDITOR_IDS[2], lastPublishedById: EDITOR_IDS[2] },

  { title: 'MHR-60-10-70 Close Recruiting Process', isFavorite: false,
    description: 'This process refers to all the steps which are involved in formalizing offer/contract signature for a potential candidate.',
    object: 'Process Model', type: 'BPMN',
    created: 142, lastSaved: 28,  state: 'Published',
    lastAccessed: 142,            lastPublished: 28,
    preview: 'SampleProcess4',
    folderPath: 'Modeling Files/SAP SuccessFactors human resource processes/SAP SuccessFactors (HXM)/Manage Human Resources/MHR-60 Recruiting',
    lastSavedById: EDITOR_IDS[3], lastPublishedById: EDITOR_IDS[3] },

  { title: 'SAP SuccessFactors (HXM) processes', isFavorite: true,
    description: 'The leading practice process "Hire to Retire" (HTR) addresses all activities associated with managing the overall employee lifecycle.',
    object: 'Value Chain', type: 'Value Chain',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: '22 hours ago', lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[4], lastPublishedById: EDITOR_IDS[5] },

  { title: 'Organization Design Specialist', isFavorite: true,
    description: '',
    object: 'Dictionary Entry', type: 'Dictionary entry',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 18,             lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[5], lastPublishedById: EDITOR_IDS[5] },

  { title: 'HR Administrator', isFavorite: true,
    description: '',
    object: 'Dictionary Entry', type: 'Dictionary entry',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 18,             lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[6], lastPublishedById: EDITOR_IDS[6] },

  { title: 'Non-Compliance with Labor Laws', isFavorite: true,
    description: 'Failure to adhere to local, state, or federal employment regulations.',
    object: 'Dictionary Entry', type: 'Dictionary entry',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 18,             lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[7], lastPublishedById: EDITOR_IDS[0] },

  { title: 'MHR-10-20-20 Execute Mass Changes for Foundation Elements', isFavorite: true,
    description: 'This process refers to the mass update of a bigger number of foundation data elements through a centralized service.',
    object: 'Process Model', type: 'BPMN',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 29,             lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[0], lastPublishedById: EDITOR_IDS[1] },

  { title: 'Business Process Lifecycle Modeling', isFavorite: true,
    description: '',
    object: 'Process Model', type: 'BPMN',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 42,             lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[1], lastPublishedById: EDITOR_IDS[1] },

  { title: 'MHR-80-10 Goals', isFavorite: true,
    description: '',
    object: 'Value Chain', type: 'Value Chain',
    created: 30, lastSaved: 30, state: 'Draft',
    lastAccessed: 109,            lastPublished: 30,
    preview: undefined,
    folderPath: 'Modeling Files',
    lastSavedById: EDITOR_IDS[2], lastPublishedById: EDITOR_IDS[2] },
]

export const REPO_TREE_DATA = [
  { name: 'Modeling Files', subRows: [
    { name: 'Contract templates' },
    { name: 'Shipping' },
  ]},
]

export const MPO_ITEMS: MockItem[] = ([
  { title: '[To-Be: Post Transformation] Credit Management', roles: [26, 28] },
  { title: 'Procurement of Work Equipment', roles: [26, 27] },
  { title: 'Hiring Process', roles: [28, 35, 38] },
  { title: 'MHR-60-10 Recruiting Management', roles: [35, 38] },
  { title: 'MHR-60-10-10 Create Job Requisition', roles: [28, 35, 38] },
  { title: 'MHR-60-10-10-10 Conduct Strategy Alignment Meeting with Hiring Manager', roles: [28, 38] },
  { title: 'MHR-60-10-70 Close Recruiting Process', roles: [35, 38] },
  { title: 'MHR-70-10 Onboarding', roles: [26, 27, 28] },
  { title: 'MHR-70-10-10-20 Perform Onboarding Tasks', roles: [26, 28] },
  { title: 'MHR-20-30-70-20 Monitor Leave of Absence', roles: [26, 27] },
  { title: 'MHR-20-40-40 Manage Termination - Death of an Employee', roles: [26, 27, 28] },
  { title: 'MHR-20-10-30 Administer Internal Hire (New Employment)', roles: [26, 28] },
  { title: 'MHR-10-10-10 Create New Position', roles: [14, 28] },
  { title: 'MHR-10-20-10 Create/Update Foundation Element', roles: [14, 28] },
  { title: 'MHR-10-20-20 Execute Mass Changes for Foundation Elements', roles: [14, 28] },
  { title: 'MHR-30-10-50 Pay Out Time Accounts', roles: [19, 26] },
  { title: 'MHR-130-20-10 Create Employee Inquiry', roles: [26, 27] },
  { title: 'MHR-130-10-10 Manage Knowledge Base', roles: [26, 27] },
  { title: 'HTR_01 Manage Workforce', roles: [14, 28] },
  { title: 'HTR_02 Attract and Acquire', roles: [28, 35, 38] },
  { title: 'HTR_04 Educate and Develop', roles: [14, 27, 28] },
  { title: 'SAP SuccessFactors (HXM) processes', roles: [14] },
  { title: 'Lead-to-Cash', roles: [] },
  { title: 'Business Process Lifecycle Modeling', roles: [] },
] as Array<{ title: string; roles: number[] }>).map(({ title, roles }) => {
  const base = REPOSITORY_ITEMS.find(r => r.title === title)
  if (!base) return null
  return { ...base, roles }
}).filter(Boolean) as MockItem[]

export interface RoleItem {
  id: number
  title: string
  isSearchHit: boolean
  category: string
  description: string
}

export const DICTIONARY_ITEMS: RoleItem[] = [
  { title: 'Accounts Payable Accountant',    isSearchHit: false, description: '', id:  1, category: 'Departments' },
  { title: 'Accounts Receivable Accountant', isSearchHit: false, description: '', id:  2, category: 'Roles' },
  { title: 'Accounts Receivable Manager',    isSearchHit: false, description: '', id:  3, category: 'Roles' },
  { title: 'Accounts Receivable Team',       isSearchHit: false, description: '', id:  4, category: 'Departments' },
  { title: 'Approver',                       isSearchHit: false, description: '', id:  5, category: 'Roles' },
  { title: 'AR Accountant',                  isSearchHit: false, description: '', id:  6, category: 'Roles' },
  { title: 'Back Office',                    isSearchHit: false, description: '', id:  7, category: 'Roles' },
  { title: 'Business Stakeholder',           isSearchHit: false, description: '', id:  8, category: 'Roles' },
  { title: 'Business Strategy Consultant',   isSearchHit: false, description: '', id:  9, category: 'Roles' },
  { title: 'Cash Collection Manager',        isSearchHit: false, description: '', id: 10, category: 'Roles' },
  { title: 'Chief Customer Officer (CCO)',   isSearchHit: false, description: '', id: 11, category: 'Roles' },
  { title: 'Chief Executive Officer (CEO)',  isSearchHit: false, description: '', id: 12, category: 'Roles' },
  { title: 'Chief Financial Officer (CFO)',  isSearchHit: false, description: '', id: 13, category: 'Roles' },
  { title: 'Chief Human Resources Officer (CHRO)', isSearchHit: true,
    description: "The Chief Human Resources Officer (CHRO) is a top-level management executive in charge of an organization's employees.",
    id: 14, category: 'Roles' },
  { title: 'Chief Information Officer (CIO)',  isSearchHit: false, description: '', id: 15, category: 'Roles' },
  { title: 'Chief Marketing Officer (CMO)',    isSearchHit: false, description: '', id: 16, category: 'Roles' },
  { title: 'Chief Operating Officer (COO)',    isSearchHit: false, description: '', id: 17, category: 'Roles' },
  { title: 'Central Purchasing',               isSearchHit: false, description: '', id: 18, category: 'Departments' },
  { title: 'Compensation Specialist',          isSearchHit: true,  description: '', id: 19, category: 'Roles' },
  { title: 'Credit Management',                isSearchHit: false, description: '', id: 20, category: 'Roles' },
  { title: 'Department',                       isSearchHit: false, description: '', id: 21, category: 'Departments' },
  { title: 'Digitalization Service (dematerialization)', isSearchHit: false, description: '', id: 22, category: 'Roles' },
  { title: 'Engineering',                      isSearchHit: false, description: '', id: 23, category: 'Departments' },
  { title: 'Finance',                          isSearchHit: false, description: '', id: 24, category: 'Departments' },
  { title: 'Finance Department',               isSearchHit: false, description: '', id: 25, category: 'Departments' },
  { title: 'HR Administrator',                 isSearchHit: true,  description: '', id: 26, category: 'Roles' },
  { title: 'Human Resources Department', isSearchHit: true,
    description: 'The Human Resources (HR) Department is responsible for all administration in relation to the employees.',
    id: 27, category: 'Departments' },
  { title: 'Human Resources Manager', isSearchHit: true,
    description: 'Responsible for overseeing HR functions, including recruitment, policy implementation, employee relations, and compliance with labour laws.',
    id: 28, category: 'Roles' },
  { title: 'IT-Department',        isSearchHit: false, description: '', id: 29, category: 'Departments' },
  { title: 'Legal Department',     isSearchHit: false, description: '', id: 30, category: 'Departments' },
  { title: 'Management Board',     isSearchHit: false, description: '', id: 31, category: 'Roles' },
  { title: 'Marketing Department', isSearchHit: false, description: '', id: 32, category: 'Departments' },
  { title: 'Product Management',   isSearchHit: false, description: '', id: 33, category: 'Departments' },
  { title: 'Purchasing Department',isSearchHit: false, description: '', id: 34, category: 'Departments' },
  { title: 'Recruitment',          isSearchHit: true,  description: '', id: 35, category: 'Departments' },
  { title: 'Sales',                isSearchHit: false, description: '', id: 36, category: 'Departments' },
  { title: 'Support',              isSearchHit: false, description: '', id: 37, category: 'Departments' },
  { title: 'Talent Acquisition Coordinator', isSearchHit: true,
    description: 'Supports the recruitment process by coordinating interviews, communication with candidates, and onboarding processes.',
    id: 38, category: 'Roles' },
]
