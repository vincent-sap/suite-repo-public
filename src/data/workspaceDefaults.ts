// Seed/default data for WorkspaceContext. Kept separate from the context logic
// so the provider file stays focused on state. Types live in WorkspaceContext.tsx.
import { LEVEL_NAMES, type ProcessLevelNames } from '../domains/process-landscape/types'
import type {
  AdminUser, ContextDimension, DictCategory,
  Audience, HelpLink, SmartFolder, ExplorerColumn,
} from '../contexts/WorkspaceContext'

export const ADMIN_USERS: AdminUser[] = [
  { id: '1',  name: 'Anna Smidth',  email: 'anna.smidth@acme.com',   initials: 'AS', colorScheme: 'Accent1', ownerSince: '2021-03-15', userId: 'S2019847231', license: 'Process Modeler' },
  { id: '4',  name: 'James Park',   email: 'james.park@acme.com',    initials: 'JP', colorScheme: 'Accent4', ownerSince: '2020-11-20', userId: 'S2021563847', license: 'Process Modeler' },
  { id: '7',  name: 'Elena Müller', email: 'elena.mueller@acme.com', initials: 'EM', colorScheme: 'Accent7', ownerSince: '2019-06-01', userId: 'S2023193209', license: 'Process Modeler' },
  { id: '12', name: 'Carlos Vega',  email: 'carlos.vega@acme.com',   initials: 'CV', colorScheme: 'Accent2', ownerSince: '2020-03-08', userId: 'S2020741582', license: 'Collaboration Hub' },
]

export const DEFAULT_ADDITIONAL_INFO = `This workspace is managed by the Business Process Excellence team at Acme Inc.

For access requests, contact the workspace owner or visit the intranet at intranet.globalcorp.com/signavio.

Support hours: Mon–Fri, 8:00–17:00 CET`

export const INITIAL_DICT_CATEGORIES: DictCategory[] = [
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

export const INITIAL_AUDIENCES: Audience[] = [
  { id: '1', name: 'General audience', showGeneral: false },
  { id: '2', name: 'Administrators', showGeneral: true },
  { id: '3', name: 'Acme Italy', showGeneral: true },
  { id: '4', name: 'Acme France', showGeneral: true },
]

export const INITIAL_SMART_FOLDERS: SmartFolder[] = [
  { id: 'sf-1', name: 'Recently Modified', query: 'modified:last-7-days', description: 'Files changed in the last 7 days' },
  { id: 'sf-2', name: 'My Diagrams', query: 'owner:me type:diagram', description: 'All diagrams owned by me' },
  { id: 'sf-3', name: 'Published Processes', query: 'status:published type:bpmn', description: 'All published BPMN processes' },
  { id: 'sf-4', name: 'Pending Review', query: 'status:review', description: 'Items waiting for approval' },
]

export const INITIAL_HELP_LINKS: HelpLink[] = [
  { id: '1', label: 'Workspace Administrators', url: 'www.intranet.globalcorp.com/signavio/docs/ws-admins.htm' },
  { id: '2', label: 'Process Modeling Course', url: 'www.intranet.globalcorp.com/signavio/tutorials/modeler-course.htm' },
  { id: '3', label: 'Modeling Conventions (PDF)', url: 'www.intranet.globalcorp.com/signavio/docs/modeling_conventions.pdf' },
  { id: '4', label: 'Our Process Optimization Initiative', url: 'www.intranet.globalcorp.com/signavio/process-optimization.htm' },
]

export const INITIAL_EXPLORER_COLUMNS: ExplorerColumn[] = [
  { id: 'col-name',        attribute: 'Name',                 width: 200, fixed: true },
  { id: 'col-desc',        attribute: 'Description',          width: 200 },
  { id: 'col-revision',    attribute: 'Revision',             width: 60 },
  { id: 'col-last-change', attribute: 'Last change',          width: 100 },
  { id: 'col-support-doc', attribute: 'Supporting Documents', width: 100 },
]

export const INITIAL_CONTEXT_DIMENSIONS: ContextDimension[] = [
  { id: 'ctx-1', name: 'Business Division', type: 'Selection', options: ['Coffee', 'Tea', 'Dairy', 'Snacks', 'Beverages', 'Health & Beauty'] },
  { id: 'ctx-2', name: 'Market',            type: 'Selection', options: ['Brasil', 'Germany', 'United States', 'Japan', 'United Kingdom', 'France', 'China', 'India'] },
]

export const USER_CONTEXT_DEFAULTS: Record<string, string> = {
  'ctx-1': '',
  'ctx-2': '',
}

export const INITIAL_LEVEL_NAMES: ProcessLevelNames = {
  1: LEVEL_NAMES[1],
  2: LEVEL_NAMES[2],
  3: LEVEL_NAMES[3],
  4: LEVEL_NAMES[4],
  5: LEVEL_NAMES[5],
}
