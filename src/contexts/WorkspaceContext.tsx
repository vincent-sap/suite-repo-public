import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { LEVEL_NAMES, type ProcessLevelNames } from '../domains/process-landscape/types'

export type ContentLanguage = { code: string; label: string; isDefault: boolean }
export type ContextDimension = { id: string; name: string; type: string; options?: string[] }

export type AdminUser = { id: string; name: string; email: string; initials: string; colorScheme: string; ownerSince?: string; userId: string; license: 'Process Modeler' | 'Collaboration Hub' }
export const ADMIN_USERS: AdminUser[] = [
  { id: '1',  name: 'Anna Smidth',  email: 'anna.smidth@acme.com',   initials: 'AS', colorScheme: 'Accent1', ownerSince: '2021-03-15', userId: 'S2019847231', license: 'Process Modeler' },
  { id: '4',  name: 'James Park',   email: 'james.park@acme.com',    initials: 'JP', colorScheme: 'Accent4', ownerSince: '2020-11-20', userId: 'S2021563847', license: 'Process Modeler' },
  { id: '7',  name: 'Elena Müller', email: 'elena.mueller@acme.com', initials: 'EM', colorScheme: 'Accent7', ownerSince: '2019-06-01', userId: 'S2023193209', license: 'Process Modeler' },
  { id: '12', name: 'Carlos Vega',  email: 'carlos.vega@acme.com',   initials: 'CV', colorScheme: 'Accent2', ownerSince: '2020-03-08', userId: 'S2020741582', license: 'Collaboration Hub' },
]

const DEFAULT_ADDITIONAL_INFO = `This workspace is managed by the Business Process Excellence team at Acme Inc.

For access requests, contact the workspace owner or visit the intranet at intranet.globalcorp.com/signavio.

Support hours: Mon–Fri, 8:00–17:00 CET`

export type HelpLink = { id: string; label: string; url: string }
export type SmartFolder = { id: string; name: string; description?: string; query: string }
export type ExplorerColumn = { id: string; attribute: string; width: number; fixed?: boolean }
export type Audience = { id: string; name: string; showGeneral: boolean }
export type DictCategoryType = 'Organization' | 'Document' | 'Activity' | 'Event' | 'IT System' | 'Goal' | 'Requirement' | 'Risk' | 'Control' | 'Others' | 'Processes'
export type DictCategory = { id: string; name: string; description?: string; color: string; parentId?: string; enabled: boolean; type: DictCategoryType; createdAt: string; changedAt: string; hasVariants?: boolean }

const INITIAL_DICT_CATEGORIES: DictCategory[] = [
  // Initiatives
  { id: 'c1',  name: 'Initiatives',                                                              description: 'Strategic initiatives tracked across the organization.',                                      color: '#256f3a', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  // Transformation Steps
  { id: 'c2',  name: 'Transformation Steps',                                                     description: 'Categories of transformation activities used in SAP-driven transformation programs.',        color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025', hasVariants: true },
  { id: 'c3',  name: 'Transformation Step - S/4HANA',           parentId: 'c2',                 description: 'Transformation activities specific to S/4HANA migration and adoption.',                      color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c4',  name: 'Transformation Step - Continuous BPT',    parentId: 'c2',                 description: 'Continuous business process transformation steps.',                                          color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c5',  name: 'Transformation Step - OPEX',              parentId: 'c2',                 description: 'Operational excellence transformation activities.',                                          color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c6',  name: 'Process Excellence - H2R',                parentId: 'c2',                 description: 'Process excellence activities for the Hire-to-Retire domain.',                              color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c7',  name: 'Plug and Gain approach',                  parentId: 'c2',                 description: 'Adoption approach leveraging pre-configured best practices.',                               color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c8',  name: 'Business Transformation Steps',           parentId: 'c2',                 description: 'General business transformation activities.',                                                color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c9',  name: '2024 SP - ERP Transformation [only SAP Signavio]', parentId: 'c2',        description: 'ERP transformation steps available exclusively in SAP Signavio (2024 Service Pack).',      color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c10', name: '2024 SP - ERP Transformation',            parentId: 'c2',                 description: 'ERP transformation activities introduced in the 2024 Service Pack.',                        color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c11', name: '2024 SP - Continuous Improvement [only SAP Signavio]', parentId: 'c2',    description: 'Continuous improvement steps exclusive to SAP Signavio (2024 Service Pack).',             color: '#556b82', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c12', name: '2024 SP - Continuous Improvement',        parentId: 'c2',                 description: 'Continuous improvement activities from the 2024 Service Pack.',                             color: '#556b82', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  // Organizational Units
  { id: 'c13', name: 'Organizational Units',                                                     description: 'Organizational entities including regions, departments, roles, and personas.',              color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c14', name: 'Region',                                  parentId: 'c13',                description: 'Geographic or organizational region.',                                                      color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024', hasVariants: true },
  { id: 'c15', name: 'Departments',                             parentId: 'c13',                description: 'Organizational departments across the enterprise.',                                         color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c16', name: 'Roles',                                   parentId: 'c13',                description: 'Job roles and functional responsibilities within the organization.',                        color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024', hasVariants: true },
  { id: 'c17', name: 'Department',                              parentId: 'c13',                description: 'Individual department entity with variant management support.',                            color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024', hasVariants: true },
  { id: 'c18', name: 'Personas',                                parentId: 'c13',                description: 'Representative user personas for process and product design.',                             color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c19', name: 'Staff Name List',                         parentId: 'c13',                description: 'Named individuals and staff assignments.',                                                  color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c20', name: 'Externals',                               parentId: 'c13',                description: 'External parties, contractors, and third-party stakeholders.',                             color: '#aa0808', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  // Value Drivers
  { id: 'c21', name: 'Value Drivers',                                                            description: 'Strategic value drivers that guide business priorities and investments.',                   color: '#a45d00', enabled: true,  type: 'Goal',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025', hasVariants: true },
  // PPI
  { id: 'c22', name: 'PPI Process Performance Indicators',                                       description: 'Key performance indicators used to measure and track process performance.',                 color: '#a45d00', enabled: true,  type: 'Goal',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  // SAP Reference Business Architecture - Business Capability Model
  { id: 'c23', name: 'SAP - Reference Business Architecture - Business Capability Model',        description: 'SAP reference model mapping business capabilities to organizational functions.',            color: '#0057d2', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  // Documents
  { id: 'c24', name: 'Documents',                                                                description: 'Formal documents governing and guiding business operations.',                               color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024', hasVariants: true },
  { id: 'c25', name: 'Data Objects',                            parentId: 'c24',                description: 'Structured data entities and master data objects used in processes.',                       color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c26', name: 'Law',                                     parentId: 'c24',                description: 'Legal regulations and statutory requirements affecting business processes.',                color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c27', name: 'Procedures',                              parentId: 'c24',                description: 'Step-by-step instructions for executing specific operational tasks.',                       color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c28', name: 'Policies',                                parentId: 'c24',                description: 'Company-wide rules and guidelines governing conduct in a specific domain.',                 color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c29', name: 'Certifications',                          parentId: 'c24',                description: 'Industry and regulatory certifications relevant to business processes.',                    color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c30', name: 'Sustainability Regulations',              parentId: 'c24',                description: 'Environmental and sustainability compliance requirements.',                                  color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c31', name: 'Regulatory Requirement',                  parentId: 'c24',                description: 'Mandatory regulatory obligations the organization must fulfill.',                           color: '#a45d00', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  // Objectives
  { id: 'c32', name: 'Objectives',                                                               description: 'Business objectives that processes and activities are designed to achieve.',                color: '#aa0808', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // SAP Reference Business Architecture - Business Process Model
  { id: 'c33', name: 'SAP - Reference Business Architecture - Business Process Model',           description: 'SAP reference model describing standard business process flows.',                           color: '#0057d2', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Activities
  { id: 'c34', name: 'Activities',                                                               description: 'Individual work activities performed within business processes.',                           color: '#a45d00', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Suppliers / Customers
  { id: 'c35', name: 'Suppliers',                                                                description: 'External suppliers and vendors providing goods or services.',                               color: '#a45d00', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c36', name: 'Customers',                                                                description: 'End customers and client organizations receiving products or services.',                    color: '#a45d00', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // SAP Reference Solution Architecture - Solution Capability Model
  { id: 'c37', name: 'SAP - Reference Solution Architecture - Solution Capability Model',        description: 'SAP reference model mapping solution capabilities to technology components.',              color: '#046c7a', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // End-to-End Processes
  { id: 'c38', name: 'End-to-End Processes',                                                     description: 'Cross-functional processes spanning multiple departments and systems.',                     color: '#256f3a', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Events
  { id: 'c39', name: 'Events',                                                                   description: 'Business events that trigger or result from process execution.',                           color: '#556b82', enabled: true,  type: 'Event',        createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // SAP Reference Solution Architecture - Solution Process Model
  { id: 'c40', name: 'SAP - Reference Solution Architecture - Solution Process Model',           description: 'SAP reference model describing solution-level process flows.',                             color: '#046c7a', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Business Capabilities
  { id: 'c41', name: 'Business Capabilities',                                                    description: 'High-level abilities the organization needs to deliver value.',                             color: '#046c7a', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // IT Systems
  { id: 'c42', name: 'IT Systems',                                                               description: 'Software applications and platforms supporting business processes.',                        color: '#556b82', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Business Architecture
  { id: 'c43', name: 'Business Architecture',                                                    description: 'Architectural artifacts describing how the business is structured and operates.',          color: '#6c32a9', enabled: true,  type: 'Activity',     createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Requirements (disabled)
  { id: 'c44', name: 'Requirements',                                                             description: 'Functional and non-functional requirements linked to process or system design.',           color: '#556b82', enabled: false, type: 'Requirement',  createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Processes (disabled)
  { id: 'c45', name: 'Processes',                                                                description: 'General process entries not covered by more specific categories.',                          color: '#556b82', enabled: false, type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Others
  { id: 'c46', name: 'Others',                                                                   description: 'Miscellaneous dictionary entries that do not fit a specific category.',                    color: '#556b82', enabled: true,  type: 'Others',       createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  // Risks
  { id: 'c47', name: 'Risks',                                                                    description: 'Risk entries identifying potential threats to business operations or objectives.',          color: '#aa0808', enabled: true,  type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
]

const INITIAL_AUDIENCES: Audience[] = [
  { id: '1', name: 'General audience', showGeneral: false },
  { id: '2', name: 'Administrators', showGeneral: true },
  { id: '3', name: 'Acme Italy', showGeneral: true },
  { id: '4', name: 'Acme France', showGeneral: true },
]

const INITIAL_SMART_FOLDERS: SmartFolder[] = [
  { id: 'sf-1', name: 'Recently Modified', query: 'modified:last-7-days', description: 'Files changed in the last 7 days' },
  { id: 'sf-2', name: 'My Diagrams', query: 'owner:me type:diagram', description: 'All diagrams owned by me' },
  { id: 'sf-3', name: 'Published Processes', query: 'status:published type:bpmn', description: 'All published BPMN processes' },
  { id: 'sf-4', name: 'Pending Review', query: 'status:review', description: 'Items waiting for approval' },
]

const INITIAL_HELP_LINKS: HelpLink[] = [
  { id: '1', label: 'Workspace Administrators', url: 'www.intranet.globalcorp.com/signavio/docs/ws-admins.htm' },
  { id: '2', label: 'Process Modeling Course', url: 'www.intranet.globalcorp.com/signavio/tutorials/modeler-course.htm' },
  { id: '3', label: 'Modeling Conventions (PDF)', url: 'www.intranet.globalcorp.com/signavio/docs/modeling_conventions.pdf' },
  { id: '4', label: 'Our Process Optimization Initiative', url: 'www.intranet.globalcorp.com/signavio/process-optimization.htm' },
]

const INITIAL_EXPLORER_COLUMNS: ExplorerColumn[] = [
  { id: 'col-name',        attribute: 'Name',                 width: 200, fixed: true },
  { id: 'col-desc',        attribute: 'Description',          width: 200 },
  { id: 'col-revision',    attribute: 'Revision',             width: 60 },
  { id: 'col-last-change', attribute: 'Last change',          width: 100 },
  { id: 'col-support-doc', attribute: 'Supporting Documents', width: 100 },
]

const INITIAL_CONTEXT_DIMENSIONS: ContextDimension[] = [
  { id: 'ctx-1', name: 'Business Division', type: 'Selection', options: ['Coffee', 'Tea', 'Dairy', 'Snacks', 'Beverages', 'Health & Beauty'] },
  { id: 'ctx-2', name: 'Market',            type: 'Selection', options: ['Brasil', 'Germany', 'United States', 'Japan', 'United Kingdom', 'France', 'China', 'India'] },
]

export const USER_CONTEXT_DEFAULTS: Record<string, string> = {
  'ctx-1': '',
  'ctx-2': '',
}

const INITIAL_LEVEL_NAMES: ProcessLevelNames = {
  1: LEVEL_NAMES[1],
  2: LEVEL_NAMES[2],
  3: LEVEL_NAMES[3],
  4: LEVEL_NAMES[4],
  5: LEVEL_NAMES[5],
}

type WorkspaceContextType = {
  workspaceName: string
  setWorkspaceName: (v: string) => void
  contentLanguages: ContentLanguage[]
  addContentLanguage: (lang: ContentLanguage) => void
  removeContentLanguage: (code: string) => void
  moveContentLanguage: (code: string, direction: 'up' | 'down') => void
  reorderContentLanguage: (draggedCode: string, targetCode: string, placement: 'Before' | 'After') => void
  setDefaultLanguage: (code: string) => void
  setContentLanguages: Dispatch<SetStateAction<ContentLanguage[]>>
  ownerId: string
  setOwnerId: (v: string) => void
  additionalInfo: string
  setAdditionalInfo: (v: string) => void
  helpLinks: HelpLink[]
  setHelpLinks: Dispatch<SetStateAction<HelpLink[]>>
  smartFolders: SmartFolder[]
  addSmartFolder: (sf: Omit<SmartFolder, 'id'>) => void
  updateSmartFolder: (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) => void
  deleteSmartFolder: (id: string) => void
  privateFolder: boolean
  setPrivateFolder: (v: boolean) => void
  homeTitle: string
  setHomeTitle: (v: string) => void
  homeWelcomeMessage: string
  setHomeWelcomeMessage: (v: string) => void
  audiences: Audience[]
  setAudiences: Dispatch<SetStateAction<Audience[]>>
  dictCategories: DictCategory[]
  addDictCategory: (cat: Omit<DictCategory, 'id'>) => string
  updateDictCategory: (id: string, patch: Partial<Omit<DictCategory, 'id'>>) => void
  moveDictCategory: (id: string, direction: 'up' | 'down') => void
  reorderDictCategory: (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') => void
  deleteDictCategory: (id: string) => void
  deleteDictCategoryMoveChildren: (id: string) => void
  explorerColumns: ExplorerColumn[]
  setExplorerColumns: Dispatch<SetStateAction<ExplorerColumn[]>>
  contextDimensions: ContextDimension[]
  addContextDimension: (dim: ContextDimension) => void
  removeContextDimension: (id: string) => void
  moveContextDimension: (id: string, direction: 'up' | 'down') => void
  reorderContextDimension: (draggedId: string, targetId: string, placement: 'Before' | 'After') => void
  setContextDimensions: Dispatch<SetStateAction<ContextDimension[]>>
  userContextValues: Record<string, string | string[]>
  setUserContextValues: Dispatch<SetStateAction<Record<string, string | string[]>>>
  levelNames: ProcessLevelNames
  setLevelNames: Dispatch<SetStateAction<ProcessLevelNames>>
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceName: 'Acme Process World',
  setWorkspaceName: () => {},
  contentLanguages: [],
  addContentLanguage: () => {},
  removeContentLanguage: () => {},
  moveContentLanguage: () => {},
  reorderContentLanguage: () => {},
  setDefaultLanguage: () => {},
  setContentLanguages: () => {},
  ownerId: '1',
  setOwnerId: () => {},
  additionalInfo: DEFAULT_ADDITIONAL_INFO,
  setAdditionalInfo: () => {},
  helpLinks: INITIAL_HELP_LINKS,
  setHelpLinks: () => {},
  smartFolders: [],
  addSmartFolder: () => {},
  updateSmartFolder: () => {},
  deleteSmartFolder: () => {},
  privateFolder: true,
  setPrivateFolder: () => {},
  homeTitle: '',
  setHomeTitle: () => {},
  homeWelcomeMessage: '',
  setHomeWelcomeMessage: () => {},
  audiences: INITIAL_AUDIENCES,
  setAudiences: () => {},
  dictCategories: INITIAL_DICT_CATEGORIES,
  addDictCategory: () => '',
  updateDictCategory: () => {},
  moveDictCategory: () => {},
  reorderDictCategory: () => {},
  deleteDictCategory: () => {},
  deleteDictCategoryMoveChildren: () => {},
  explorerColumns: INITIAL_EXPLORER_COLUMNS,
  setExplorerColumns: () => {},
  contextDimensions: INITIAL_CONTEXT_DIMENSIONS,
  addContextDimension: () => {},
  removeContextDimension: () => {},
  moveContextDimension: () => {},
  reorderContextDimension: () => {},
  setContextDimensions: () => {},
  userContextValues: USER_CONTEXT_DEFAULTS,
  setUserContextValues: () => {},
  levelNames: INITIAL_LEVEL_NAMES,
  setLevelNames: () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceName, setWorkspaceName] = useState('Acme Process World')
  const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([
    { code: 'en-US', label: 'English (United States)', isDefault: true },
    { code: 'de-DE', label: 'German (Germany)', isDefault: false },
    { code: 'fr-FR', label: 'French (France)', isDefault: false },
  ])
  const [ownerId, setOwnerId] = useState('1')
  const [additionalInfo, setAdditionalInfo] = useState(DEFAULT_ADDITIONAL_INFO)
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>(INITIAL_HELP_LINKS)
  const [smartFolders, setSmartFolders] = useState<SmartFolder[]>(INITIAL_SMART_FOLDERS)
  const [privateFolder, setPrivateFolder] = useState(true)
  const [homeTitle, setHomeTitle] = useState('')
  const [homeWelcomeMessage, setHomeWelcomeMessage] = useState('Your starting point for everything process')
  const [audiences, setAudiences] = useState<Audience[]>(INITIAL_AUDIENCES)
  const [dictCategories, setDictCategories] = useState<DictCategory[]>(INITIAL_DICT_CATEGORIES)
  const [explorerColumns, setExplorerColumns] = useState<ExplorerColumn[]>(INITIAL_EXPLORER_COLUMNS)
  const [contextDimensions, setContextDimensions] = useState<ContextDimension[]>(INITIAL_CONTEXT_DIMENSIONS)
  const [userContextValues, setUserContextValues] = useState<Record<string, string | string[]>>(USER_CONTEXT_DEFAULTS)
  const [levelNames, setLevelNames] = useState<ProcessLevelNames>(INITIAL_LEVEL_NAMES)

  const addContentLanguage = (lang: ContentLanguage) =>
    setContentLanguages(prev => prev.some(l => l.code === lang.code) ? prev : [...prev, lang])

  const removeContentLanguage = (code: string) =>
    setContentLanguages(prev => {
      const removed = prev.find(l => l.code === code)
      const remaining = prev.filter(l => l.code !== code)
      if (removed?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true }
      }
      return remaining
    })

  const moveContentLanguage = (code: string, direction: 'up' | 'down') =>
    setContentLanguages(prev => {
      const idx = prev.findIndex(l => l.code === code)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })

  const setDefaultLanguage = (code: string) =>
    setContentLanguages(prev => prev.map(l => ({ ...l, isDefault: l.code === code })))

  const reorderContentLanguage = (draggedCode: string, targetCode: string, placement: 'Before' | 'After') =>
    setContentLanguages(prev => {
      if (draggedCode === targetCode) return prev
      const dragged = prev.find(l => l.code === draggedCode)
      if (!dragged) return prev
      const without = prev.filter(l => l.code !== draggedCode)
      const targetIdx = without.findIndex(l => l.code === targetCode)
      const insertAt = placement === 'Before' ? targetIdx : targetIdx + 1
      const result = [...without]
      result.splice(insertAt, 0, dragged)
      return result
    })

  const addSmartFolder = (sf: Omit<SmartFolder, 'id'>) =>
    setSmartFolders(prev => [...prev, { ...sf, id: String(Date.now()) }])

  const updateSmartFolder = (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) =>
    setSmartFolders(prev => prev.map(sf => sf.id === id ? { ...sf, ...patch } : sf))

  const deleteSmartFolder = (id: string) =>
    setSmartFolders(prev => prev.filter(sf => sf.id !== id))

  const addDictCategory = (cat: Omit<DictCategory, 'id'>): string => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const id = `c${Date.now()}`
    setDictCategories(prev => [...prev, {
      ...cat,
      type: cat.type ?? ('Others' as const),
      createdAt: cat.createdAt ?? now,
      changedAt: cat.changedAt ?? now,
      id,
    }])
    return id
  }

  const updateDictCategory = (id: string, patch: Partial<Omit<DictCategory, 'id'>>) =>
    setDictCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const moveDictCategory = (id: string, direction: 'up' | 'down') =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      // Only swap within siblings (same parentId level)
      const siblings = prev.filter(c => c.parentId === cat.parentId)
      const sibIdx = siblings.findIndex(c => c.id === id)
      const swapSibIdx = direction === 'up' ? sibIdx - 1 : sibIdx + 1
      if (swapSibIdx < 0 || swapSibIdx >= siblings.length) return prev
      const swapId = siblings[swapSibIdx].id
      const flatIdx = prev.findIndex(c => c.id === id)
      const swapFlatIdx = prev.findIndex(c => c.id === swapId)
      const next = [...prev]
      ;[next[flatIdx], next[swapFlatIdx]] = [next[swapFlatIdx], next[flatIdx]]
      return next
    })

  const reorderDictCategory = (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') =>
    setDictCategories(prev => {
      const dragged = prev.find(c => c.id === draggedId)
      if (!dragged) return prev
      const target = targetId ? prev.find(c => c.id === targetId) : null
      // Reparent when dropped onto a node
      const newParentId = placement === 'On' ? targetId ?? undefined : target?.parentId
      const withoutDragged = prev.filter(c => c.id !== draggedId)
      const updated = { ...dragged, parentId: newParentId }
      if (placement === 'On' || !target) {
        return [...withoutDragged, updated]
      }
      const targetFlatIdx = withoutDragged.findIndex(c => c.id === targetId)
      const insertAt = placement === 'Before' ? targetFlatIdx : targetFlatIdx + 1
      const result = [...withoutDragged]
      result.splice(insertAt, 0, updated)
      return result
    })

  const deleteDictCategory = (id: string) =>
    setDictCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id))

  // Re-parents direct children to the deleted category's parent, then removes it
  const deleteDictCategoryMoveChildren = (id: string) =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      return prev
        .map(c => c.parentId === id ? { ...c, parentId: cat.parentId } : c)
        .filter(c => c.id !== id)
    })

  const addContextDimension = (dim: ContextDimension) =>
    setContextDimensions(prev => prev.some(d => d.id === dim.id) ? prev : [...prev, dim])

  const removeContextDimension = (id: string) =>
    setContextDimensions(prev => prev.filter(d => d.id !== id))

  const moveContextDimension = (id: string, direction: 'up' | 'down') =>
    setContextDimensions(prev => {
      const idx = prev.findIndex(d => d.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })

  const reorderContextDimension = (draggedId: string, targetId: string, placement: 'Before' | 'After') =>
    setContextDimensions(prev => {
      if (draggedId === targetId) return prev
      const dragged = prev.find(d => d.id === draggedId)
      if (!dragged) return prev
      const without = prev.filter(d => d.id !== draggedId)
      const targetIdx = without.findIndex(d => d.id === targetId)
      const insertAt = placement === 'Before' ? targetIdx : targetIdx + 1
      const result = [...without]
      result.splice(insertAt, 0, dragged)
      return result
    })

  return (
    <WorkspaceContext.Provider value={{
      workspaceName, setWorkspaceName,
      contentLanguages, addContentLanguage, removeContentLanguage, moveContentLanguage, reorderContentLanguage, setDefaultLanguage, setContentLanguages,
      ownerId, setOwnerId,
      additionalInfo, setAdditionalInfo,
      helpLinks, setHelpLinks,
      smartFolders, addSmartFolder, updateSmartFolder, deleteSmartFolder,
      privateFolder, setPrivateFolder,
      homeTitle, setHomeTitle,
      homeWelcomeMessage, setHomeWelcomeMessage,
      audiences, setAudiences,
      dictCategories, addDictCategory, updateDictCategory, moveDictCategory, reorderDictCategory, deleteDictCategory, deleteDictCategoryMoveChildren,
      explorerColumns, setExplorerColumns,
      contextDimensions, addContextDimension, removeContextDimension, moveContextDimension, reorderContextDimension, setContextDimensions,
      userContextValues, setUserContextValues,
      levelNames, setLevelNames,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
