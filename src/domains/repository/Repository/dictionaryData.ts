import type { InfoPanelAttrGroup, } from './data'
import type { DictCategoryType } from '../../../contexts/WorkspaceContext'

export type DictEntryStatus = 'Published' | 'Draft'

// SAP accent color slots per category type (1–10 are the SAP avatar palette numbers)
const TYPE_ACCENT: Record<DictCategoryType, number> = {
  'Processes':     2,  // teal
  'Organization':  6,  // blue-grey
  'Document':      3,  // green
  'Activity':      8,  // cyan
  'Event':         5,  // orange-ish
  'IT System':     9,  // violet
  'Goal':          4,  // blue
  'Requirement':   7,  // pink
  'Risk':          1,  // red
  'Control':       10, // purple-red
  'Others':        6,
}

// Dark (vivid) background for category avatars — light icon
export function catBg(type: DictCategoryType): string {
  const n = TYPE_ACCENT[type] ?? 6
  return `var(--sapAvatar_${n}_TextColor)`
}
// Light background for entry avatars — dark icon
export function entryBg(type: DictCategoryType): string {
  const n = TYPE_ACCENT[type] ?? 6
  return `var(--sapAvatar_${n}_Background)`
}
// Icon color on dark bg (categories) — use the matching light avatar background
export function catIconColor(type: DictCategoryType): string {
  const n = TYPE_ACCENT[type] ?? 6
  return `var(--sapAvatar_${n}_Background)`
}
// Icon color on light bg (entries)
export function entryIconColor(type: DictCategoryType): string {
  const n = TYPE_ACCENT[type] ?? 6
  return `var(--sapAvatar_${n}_TextColor)`
}

// Icon per category type — single source of truth used by nav tree, list, table, and grid views
export const CAT_TYPE_ICON: Record<DictCategoryType, string> = {
  'Processes':    'SAP-icons-v4/process-manager',
  'Organization': 'SAP-icons-v4/organization',
  'Document':     'document',
  'Activity':     'SAP-icons-v4/activity',
  'Event':        'SAP-icons-v4/start-event',
  'IT System':    'SAP-icons-v4/computer',
  'Goal':         'goal',
  'Requirement':  'checklist',
  'Risk':         'SAP-icons-v4/risk',
  'Control':      'SAP-icons-v4/overlay-risk-control',
  'Others':       'SAP-icons-v4/process-manager',
}

export type DictEntry = {
  id: string
  name: string
  categoryId: string
  description?: string
  status: DictEntryStatus
  created: string
  changed: string
  attributeGroups?: InfoPanelAttrGroup[]
}

// Entries keyed by category id
export const DICT_ENTRIES: DictEntry[] = [
  // ── Order-to-Cash (c8) ───────────────────────────────────────────────────
  { id: 'de-001', categoryId: 'c8', name: 'Customer Order', status: 'Published', description: 'A confirmed request from a customer to purchase goods or services.', created: 'Feb 12, 2024', changed: 'Mar 5, 2025',
    attributeGroups: [
      { id: 'main', name: 'Main Attributes', attrs: [
        { id: 'name',  label: 'Name:',        type: 'text',      value: 'Customer Order' },
        { id: 'desc',  label: 'Description:', type: 'multiline', value: 'A confirmed request from a customer to purchase goods or services. It triggers order fulfillment, invoicing, and cash collection.' },
        { id: 'owner', label: 'Owner:',       type: 'chips',     values: ['Lina Davis'] },
        { id: 'status',label: 'Status:',      type: 'chips',     values: ['Published'] },
      ]},
      { id: 'details', name: 'Details', attrs: [
        { id: 'sap-obj',  label: 'SAP Object:',      type: 'chips', values: ['Sales Order (SD)'] },
        { id: 'systems',  label: 'Related Systems:',  type: 'chips', values: ['SAP S/4HANA', 'SAP Order Management'] },
        { id: 'category', label: 'Category:',         type: 'chips', values: ['Order-to-Cash'] },
      ]},
    ],
  },
  { id: 'de-002', categoryId: 'c8', name: 'Invoice', status: 'Published', description: 'A document issued to a customer requesting payment for delivered goods or services.', created: 'Feb 12, 2024', changed: 'Mar 5, 2025',
    attributeGroups: [
      { id: 'main', name: 'Main Attributes', attrs: [
        { id: 'name',  label: 'Name:',        type: 'text',      value: 'Invoice' },
        { id: 'desc',  label: 'Description:', type: 'multiline', value: 'A document issued to a customer requesting payment for delivered goods or services rendered. It initiates the accounts receivable process.' },
        { id: 'owner', label: 'Owner:',       type: 'chips',     values: ['Lina Davis'] },
        { id: 'status',label: 'Status:',      type: 'chips',     values: ['Published'] },
      ]},
    ],
  },
  { id: 'de-003', categoryId: 'c8', name: 'Credit Memo', status: 'Published', description: 'A document that reduces the amount owed by a customer, typically due to returns or billing errors.', created: 'Mar 1, 2024', changed: 'Apr 2, 2025' },
  { id: 'de-004', categoryId: 'c8', name: 'Goods Delivery Note', status: 'Draft', description: 'Document accompanying a shipment that lists the contents and confirms delivery.', created: 'Apr 10, 2024', changed: 'Apr 10, 2024' },

  // ── Procure-to-Pay (c9) ──────────────────────────────────────────────────
  { id: 'de-010', categoryId: 'c9', name: 'Purchase Requisition', status: 'Published', description: 'An internal document requesting the procurement of goods or services.', created: 'Feb 12, 2024', changed: 'Mar 5, 2025',
    attributeGroups: [
      { id: 'main', name: 'Main Attributes', attrs: [
        { id: 'name',  label: 'Name:',        type: 'text',      value: 'Purchase Requisition' },
        { id: 'desc',  label: 'Description:', type: 'multiline', value: 'An internal document requesting the procurement of goods or services. It is the first step in the Procure-to-Pay process.' },
        { id: 'owner', label: 'Owner:',       type: 'chips',     values: ['Paul Gray'] },
        { id: 'status',label: 'Status:',      type: 'chips',     values: ['Published'] },
      ]},
      { id: 'details', name: 'Details', attrs: [
        { id: 'sap-obj', label: 'SAP Object:',    type: 'chips', values: ['Purchase Requisition (MM)'] },
        { id: 'systems', label: 'Related Systems:', type: 'chips', values: ['SAP S/4HANA MM', 'SAP Ariba'] },
        { id: 'category',label: 'Category:',      type: 'chips', values: ['Procure-to-Pay'] },
      ]},
    ],
  },
  { id: 'de-011', categoryId: 'c9', name: 'Purchase Order', status: 'Published', description: 'A formal order issued to a supplier specifying the goods/services, quantities, and agreed prices.', created: 'Feb 12, 2024', changed: 'Mar 5, 2025' },
  { id: 'de-012', categoryId: 'c9', name: 'Goods Receipt', status: 'Published', description: 'Confirmation that ordered goods have been received and accepted.', created: 'Feb 14, 2024', changed: 'Jan 20, 2025' },
  { id: 'de-013', categoryId: 'c9', name: 'Vendor Invoice', status: 'Draft', description: 'An invoice received from a vendor requesting payment for delivered goods or services.', created: 'May 20, 2024', changed: 'May 28, 2026' },

  // ── Hire-to-Retire (c10) ─────────────────────────────────────────────────
  { id: 'de-020', categoryId: 'c10', name: 'Job Requisition', status: 'Published', description: 'A request to fill an open position, initiating the talent acquisition process.', created: 'Mar 1, 2024', changed: 'Dec 1, 2024' },
  { id: 'de-021', categoryId: 'c10', name: 'Employment Contract', status: 'Published', description: 'Legal agreement between employer and employee outlining terms of employment.', created: 'Mar 1, 2024', changed: 'Dec 1, 2024' },
  { id: 'de-022', categoryId: 'c10', name: 'Payslip', status: 'Published', description: 'Monthly document detailing gross pay, deductions, and net salary paid to an employee.', created: 'Mar 10, 2024', changed: 'Feb 5, 2025' },
  { id: 'de-023', categoryId: 'c10', name: 'Termination Notice', status: 'Draft', description: 'Formal notice ending the employment relationship.', created: 'Jun 5, 2024', changed: 'Jun 5, 2024' },

  // ── IT Operations (c11) ──────────────────────────────────────────────────
  { id: 'de-030', categoryId: 'c11', name: 'Incident Ticket', status: 'Published', description: 'A logged record of an IT service disruption or failure requiring resolution.', created: 'Apr 1, 2024', changed: 'Apr 1, 2025' },
  { id: 'de-031', categoryId: 'c11', name: 'Change Request', status: 'Published', description: 'A formal proposal to alter an IT system or infrastructure component.', created: 'Apr 1, 2024', changed: 'Apr 1, 2025' },
  { id: 'de-032', categoryId: 'c11', name: 'Service Level Agreement', status: 'Published', description: 'A contract defining the expected level of service between IT and business units.', created: 'Apr 5, 2024', changed: 'Mar 10, 2025' },

  // ── Operational Risk (c13) ───────────────────────────────────────────────
  { id: 'de-040', categoryId: 'c13', name: 'Risk Assessment', status: 'Published', description: 'A systematic evaluation of potential risks and their likelihood and impact.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-041', categoryId: 'c13', name: 'Risk Register', status: 'Published', description: 'A structured log of identified risks with their owners, ratings, and mitigation actions.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-042', categoryId: 'c13', name: 'Risk Treatment Plan', status: 'Draft', description: 'A documented plan describing actions to reduce identified risks to acceptable levels.', created: 'Jul 8, 2024', changed: 'May 30, 2026' },

  // ── Regulatory Compliance (c17) ──────────────────────────────────────────
  { id: 'de-050', categoryId: 'c17', name: 'Compliance Obligation', status: 'Published', description: 'A legal or regulatory requirement that the organization must adhere to.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-051', categoryId: 'c17', name: 'Audit Finding', status: 'Published', description: 'A documented observation or gap identified during an internal or external audit.', created: 'Mar 20, 2024', changed: 'Feb 14, 2025' },

  // ── Data Privacy (c18) ───────────────────────────────────────────────────
  { id: 'de-060', categoryId: 'c18', name: 'Personal Data', status: 'Published', description: 'Any information relating to an identified or identifiable natural person (GDPR definition).', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-061', categoryId: 'c18', name: 'Data Retention Policy', status: 'Published', description: 'Policy defining how long different categories of data must be stored before deletion.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-062', categoryId: 'c18', name: 'Data Processing Agreement', status: 'Draft', description: 'A contract with a third-party processor outlining how personal data will be handled.', created: 'Aug 15, 2024', changed: 'Aug 15, 2024' },

  // ── Accounts Payable org (c20) ───────────────────────────────────────────
  { id: 'de-070', categoryId: 'c20', name: 'AP Clerk', status: 'Published', description: 'Role responsible for processing and verifying incoming vendor invoices.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-071', categoryId: 'c20', name: 'AP Manager', status: 'Published', description: 'Supervises accounts payable operations and approves payments above defined thresholds.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Accounts Receivable org (c21) ────────────────────────────────────────
  { id: 'de-080', categoryId: 'c21', name: 'Collections Agent', status: 'Published', description: 'Role responsible for following up on overdue customer payments.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-081', categoryId: 'c21', name: 'Credit Analyst', status: 'Published', description: 'Evaluates customer creditworthiness and sets credit limits.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Policy (c30) ─────────────────────────────────────────────────────────
  { id: 'de-090', categoryId: 'c30', name: 'Procurement Policy', status: 'Published', description: 'Company-wide rules governing purchasing activities and vendor engagement.', created: 'Feb 12, 2024', changed: 'Nov 14, 2024' },
  { id: 'de-091', categoryId: 'c30', name: 'Travel & Expense Policy', status: 'Published', description: 'Guidelines for employee travel bookings, expense limits, and reimbursement procedures.', created: 'Feb 12, 2024', changed: 'Nov 14, 2024' },
  { id: 'de-092', categoryId: 'c30', name: 'Data Protection Policy', status: 'Draft', description: 'Policy outlining obligations around handling, storing and sharing personal data.', created: 'Jun 10, 2024', changed: 'May 25, 2026' },

  // ── Process Guideline (c31) ──────────────────────────────────────────────
  { id: 'de-100', categoryId: 'c31', name: 'BPMN Modeling Guideline', status: 'Published', description: 'Best-practice rules for creating BPMN process diagrams in SAP Signavio.', created: 'Feb 12, 2024', changed: 'Nov 14, 2024' },
  { id: 'de-101', categoryId: 'c31', name: 'Naming Convention Guideline', status: 'Published', description: 'Standard for naming processes, activities, events and swimlanes consistently.', created: 'Feb 12, 2024', changed: 'Nov 14, 2024' },

  // ── SAP S/4HANA (c35) ────────────────────────────────────────────────────
  { id: 'de-110', categoryId: 'c35', name: 'SAP S/4HANA Finance', status: 'Published', description: 'Core financial accounting and controlling module within SAP S/4HANA.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },
  { id: 'de-111', categoryId: 'c35', name: 'SAP S/4HANA Procurement', status: 'Published', description: 'Materials management and procurement module within SAP S/4HANA.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },
  { id: 'de-112', categoryId: 'c35', name: 'SAP S/4HANA Sales', status: 'Published', description: 'Sales and distribution module for order management within SAP S/4HANA.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },

  // ── CRM (c37) ────────────────────────────────────────────────────────────
  { id: 'de-120', categoryId: 'c37', name: 'SAP Sales Cloud', status: 'Published', description: 'Cloud CRM solution for managing opportunities, leads, and customer interactions.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },
  { id: 'de-121', categoryId: 'c37', name: 'SAP Service Cloud', status: 'Draft', description: 'Cloud solution for customer service ticket management and field service.', created: 'May 1, 2024', changed: 'May 1, 2024' },

  // ── Enterprise Architecture (c27) ────────────────────────────────────────
  { id: 'de-130', categoryId: 'c27', name: 'Application Landscape', status: 'Published', description: 'A structured overview of all enterprise applications and their interdependencies.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-131', categoryId: 'c27', name: 'Integration Platform', status: 'Published', description: 'Middleware layer connecting disparate systems for data exchange.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Facilities Management (c12) ──────────────────────────────────────────
  { id: 'de-140', categoryId: 'c12', name: 'Space Allocation Request', status: 'Published', description: 'Request to assign or reassign office space to a department or team.', created: 'Feb 12, 2024', changed: 'Apr 1, 2025' },
  { id: 'de-141', categoryId: 'c12', name: 'Maintenance Work Order', status: 'Published', description: 'An authorization to perform scheduled or corrective maintenance on facility assets.', created: 'Feb 12, 2024', changed: 'Apr 1, 2025' },
  { id: 'de-142', categoryId: 'c12', name: 'Building Access Card', status: 'Draft', description: 'Physical or digital credential granting an employee access to facility zones.', created: 'May 10, 2024', changed: 'May 10, 2024' },

  // ── Process Risk (c14) ───────────────────────────────────────────────────
  { id: 'de-150', categoryId: 'c14', name: 'Process Risk Event', status: 'Published', description: 'A documented instance of a risk materializing within a business process.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-151', categoryId: 'c14', name: 'Control Effectiveness Assessment', status: 'Draft', description: 'Evaluation of whether existing process controls adequately mitigate identified risks.', created: 'Jun 1, 2024', changed: 'May 20, 2026' },

  // ── Technology Risk (c15) ────────────────────────────────────────────────
  { id: 'de-160', categoryId: 'c15', name: 'Cybersecurity Incident', status: 'Published', description: 'A security event that compromises the confidentiality, integrity, or availability of information.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-161', categoryId: 'c15', name: 'Disaster Recovery Plan', status: 'Published', description: 'A documented procedure to recover IT infrastructure and operations after a disruption.', created: 'Mar 5, 2024', changed: 'Feb 1, 2025' },
  { id: 'de-162', categoryId: 'c15', name: 'Vulnerability Assessment Report', status: 'Draft', description: 'A report identifying security weaknesses in systems, networks, or applications.', created: 'Jul 15, 2024', changed: 'May 28, 2026' },

  // ── Compliance Risk (c16) ────────────────────────────────────────────────
  { id: 'de-170', categoryId: 'c16', name: 'Compliance Breach', status: 'Published', description: 'A failure to meet a mandatory regulatory or policy requirement.', created: 'Feb 12, 2024', changed: 'Jan 10, 2025' },
  { id: 'de-171', categoryId: 'c16', name: 'Corrective Action Plan', status: 'Published', description: 'A structured plan to address and remediate a compliance deficiency or audit finding.', created: 'Mar 20, 2024', changed: 'Feb 10, 2025' },

  // ── Strategic Risk (c19) ─────────────────────────────────────────────────
  { id: 'de-180', categoryId: 'c19', name: 'Market Risk Assessment', status: 'Draft', description: 'Analysis of risks arising from changes in market conditions, competitors, or customer demand.', created: 'Aug 1, 2024', changed: 'Aug 1, 2024' },
  { id: 'de-181', categoryId: 'c19', name: 'Strategic Objective', status: 'Published', description: 'A high-level goal the organization aims to achieve as part of its long-term strategy.', created: 'Feb 12, 2024', changed: 'Nov 30, 2024' },

  // ── Controlling (c22) ────────────────────────────────────────────────────
  { id: 'de-190', categoryId: 'c22', name: 'Budget Controller', status: 'Published', description: 'Role responsible for monitoring cost centers and ensuring budgets are not exceeded.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-191', categoryId: 'c22', name: 'Profitability Analyst', status: 'Published', description: 'Analyses contribution margins and profitability across business segments.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Recruiting (c23) ─────────────────────────────────────────────────────
  { id: 'de-200', categoryId: 'c23', name: 'Recruiter', status: 'Published', description: 'HR role responsible for sourcing, screening, and presenting candidates for open positions.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-201', categoryId: 'c23', name: 'Hiring Manager', status: 'Published', description: 'Business manager accountable for defining the job requirements and making the final hiring decision.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Learning & Development (c24) ─────────────────────────────────────────
  { id: 'de-210', categoryId: 'c24', name: 'Training Coordinator', status: 'Published', description: 'Organizes and schedules training programs and manages learner enrollments.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-211', categoryId: 'c24', name: 'Learning Path', status: 'Published', description: 'A curated sequence of courses and activities designed to build a specific competency.', created: 'Apr 1, 2024', changed: 'Feb 20, 2025' },

  // ── Payroll (c25) ────────────────────────────────────────────────────────
  { id: 'de-220', categoryId: 'c25', name: 'Payroll Specialist', status: 'Draft', description: 'Role responsible for calculating and processing employee payroll each pay period.', created: 'Jun 1, 2024', changed: 'Jun 1, 2024' },
  { id: 'de-221', categoryId: 'c25', name: 'Payroll Run', status: 'Published', description: 'The periodic execution of payroll calculations for all active employees.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── Information Technology (c26) ─────────────────────────────────────────
  { id: 'de-230', categoryId: 'c26', name: 'IT Director', status: 'Published', description: 'Senior role overseeing the IT department strategy, budget, and service delivery.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-231', categoryId: 'c26', name: 'Systems Administrator', status: 'Published', description: 'Responsible for managing and maintaining IT servers, networks, and infrastructure.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },

  // ── IT Security (c28) ────────────────────────────────────────────────────
  { id: 'de-240', categoryId: 'c28', name: 'Security Operations Center (SOC)', status: 'Published', description: 'A centralized team monitoring and responding to cybersecurity threats in real time.', created: 'Feb 12, 2024', changed: 'Dec 3, 2024' },
  { id: 'de-241', categoryId: 'c28', name: 'Penetration Test Report', status: 'Published', description: 'Results of a simulated cyber attack used to identify exploitable vulnerabilities.', created: 'Mar 15, 2024', changed: 'Jan 25, 2025' },
  { id: 'de-242', categoryId: 'c28', name: 'Identity & Access Management Policy', status: 'Draft', description: 'Policy governing user provisioning, authentication, and authorization standards.', created: 'Jul 1, 2024', changed: 'May 30, 2026' },

  // ── Technical Specification (c32) ────────────────────────────────────────
  { id: 'de-250', categoryId: 'c32', name: 'System Design Document', status: 'Draft', description: 'Detailed technical specification describing architecture, components, and interfaces of a system.', created: 'Jun 5, 2024', changed: 'Jun 5, 2024' },
  { id: 'de-251', categoryId: 'c32', name: 'API Specification', status: 'Published', description: 'Formal description of the endpoints, request/response formats, and authentication of an API.', created: 'Feb 12, 2024', changed: 'Nov 14, 2024' },

  // ── ERP (c34) ────────────────────────────────────────────────────────────
  { id: 'de-260', categoryId: 'c34', name: 'SAP ECC', status: 'Published', description: 'Legacy SAP ERP Central Component, predecessor to SAP S/4HANA.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },
  { id: 'de-261', categoryId: 'c34', name: 'SAP BTP', status: 'Published', description: 'SAP Business Technology Platform providing integration, analytics, and extension capabilities.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },

  // ── Legacy ERP (c36) ─────────────────────────────────────────────────────
  { id: 'de-270', categoryId: 'c36', name: 'JD Edwards EnterpriseOne', status: 'Draft', description: 'Oracle legacy ERP system used prior to S/4HANA migration for finance and logistics.', created: 'May 1, 2024', changed: 'May 1, 2024' },

  // ── Middleware (c38) ─────────────────────────────────────────────────────
  { id: 'de-280', categoryId: 'c38', name: 'SAP Integration Suite', status: 'Published', description: 'Cloud integration platform for connecting SAP and non-SAP systems via APIs and events.', created: 'Feb 12, 2024', changed: 'Oct 22, 2024' },
  { id: 'de-281', categoryId: 'c38', name: 'MuleSoft Anypoint Platform', status: 'Published', description: 'Enterprise integration platform for building APIs and connecting applications across cloud and on-premise.', created: 'Mar 1, 2024', changed: 'Jan 15, 2025' },

  // ── Finance Operations (c41) ─────────────────────────────────────────────
  { id: 'de-290', categoryId: 'c41', name: 'Financial Close Checklist', status: 'Draft', description: 'Step-by-step checklist guiding the monthly or quarterly financial close process.', created: 'Jun 1, 2024', changed: 'Jun 1, 2024' },
  { id: 'de-291', categoryId: 'c41', name: 'General Ledger Accountant', status: 'Published', description: 'Role responsible for maintaining the general ledger and preparing financial statements.', created: 'Feb 12, 2024', changed: 'Apr 1, 2025' },
]

// Build a lookup by category id
export function getDictEntriesByCategoryId(categoryId: string): DictEntry[] {
  return DICT_ENTRIES.filter(e => e.categoryId === categoryId)
}

// Get all entries across given categoryIds (including children)
export function getDictEntriesForCategories(categoryIds: Set<string>): DictEntry[] {
  return DICT_ENTRIES.filter(e => categoryIds.has(e.categoryId))
}
