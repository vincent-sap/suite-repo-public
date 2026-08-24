export const FOLDERS = ['Finance & Accounting', 'Human Resources', 'Procurement', 'Sales & Customer Service', 'IT & Operations']

export type FolderNode = { id: string; name: string; children?: FolderNode[] }

export const FOLDER_TREE: FolderNode[] = [
  { id: 'finance', name: 'Finance & Accounting', children: [
    { id: 'accounts-payable', name: 'Accounts Payable', children: [
      { id: 'invoice-processing', name: 'Invoice Processing' },
      { id: 'vendor-payments', name: 'Vendor Payments' },
    ]},
    { id: 'accounts-receivable', name: 'Accounts Receivable', children: [
      { id: 'credit-collections', name: 'Credit & Collections' },
      { id: 'cash-application', name: 'Cash Application' },
    ]},
    { id: 'financial-close', name: 'Financial Close & Reporting' },
  ]},
  { id: 'hr', name: 'Human Resources', children: [
    { id: 'talent-acquisition', name: 'Talent Acquisition', children: [
      { id: 'recruitment', name: 'Recruitment & Hiring' },
      { id: 'employee-onboarding', name: 'Employee Onboarding' },
    ]},
    { id: 'performance-mgmt', name: 'Performance Management' },
    { id: 'learning-dev', name: 'Learning & Development' },
  ]},
  { id: 'procurement', name: 'Procurement', children: [
    { id: 'source-to-pay', name: 'Source-to-Pay', children: [
      { id: 'supplier-qualification', name: 'Supplier Qualification' },
      { id: 'purchase-order-mgmt', name: 'Purchase Order Management' },
      { id: 'invoice-verification', name: 'Invoice Verification' },
    ]},
    { id: 'contract-mgmt', name: 'Contract Management' },
    { id: 'supplier-mgmt', name: 'Supplier Management' },
  ]},
  { id: 'sales', name: 'Sales & Customer Service', children: [
    { id: 'lead-to-order', name: 'Lead-to-Order', children: [
      { id: 'opportunity-mgmt', name: 'Opportunity Management' },
      { id: 'quote-to-order', name: 'Quote-to-Order' },
    ]},
    { id: 'customer-onboarding-sales', name: 'Customer Onboarding' },
    { id: 'service-request-mgmt', name: 'Service Request Management' },
  ]},
  { id: 'it-ops', name: 'IT & Operations', children: [
    { id: 'it-service-mgmt', name: 'IT Service Management', children: [
      { id: 'incident-mgmt', name: 'Incident Management' },
      { id: 'change-mgmt-it', name: 'Change Management' },
      { id: 'problem-mgmt', name: 'Problem Management' },
    ]},
    { id: 'infra-ops', name: 'Infrastructure Operations' },
  ]},
]

export const MY_MODELING_TREE: FolderNode[] = [
  { id: 'my-processes', name: 'My Processes', children: [
    { id: 'my-onboarding', name: 'Onboarding Drafts' },
    { id: 'my-approvals', name: 'Approval Workflows' },
  ]},
  { id: 'my-sandbox', name: 'Sandbox', children: [
    { id: 'my-experiments', name: 'Experiments' },
  ]},
]

export function findFolderPath(tree: FolderNode[], id: string, ancestors: { id: string; name: string }[] = []): { id: string; name: string }[] | null {
  for (const node of tree) {
    const path = [...ancestors, { id: node.id, name: node.name }]
    if (node.id === id) return path
    if (node.children) {
      const found = findFolderPath(node.children, id, path)
      if (found) return found
    }
  }
  return null
}

export type OngoingApproval = { name: string; revision: number; date: string }

export type InfoPanelAttrType = 'text' | 'multiline' | 'chips' | 'boolean'

export type InfoPanelAttr = {
  id: string
  label: string
  type: InfoPanelAttrType
  value?: string
  values?: string[]
  boolValue?: boolean
}

export type InfoPanelAttrGroup = {
  id: string
  name: string
  attrs: InfoPanelAttr[]
}

export type AssetDetail = {
  level?: string
  variants?: { count: number } | 'template'
  revision?: number
  lastPublished?: string
  lastAuthor?: string
  lastEditedBy?: string
  lastEditedAt?: string
  ongoingApproval?: OngoingApproval
  attributes: { label: string; value: string }[]
  attributeGroups?: InfoPanelAttrGroup[]
}

export const ASSET_DETAILS: Record<string, AssetDetail> = {
  // ── Folders ─────────────────────────────────────────────────────────────────
  'finance': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',    label: 'Description:', type: 'multiline', value: 'All Finance & Accounting process models, value chains and navigation maps. Covers accounts payable, receivable, financial close and reporting.' },
      { id: 'owner',   label: 'Folder Owner:', type: 'chips', values: ['Lina Davis'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'dept',    label: 'Department:', type: 'chips', values: ['Finance & Accounting'] },
      { id: 'items',   label: 'Contents:',   type: 'text',  value: '3 sub-folders, 3 diagrams' },
      { id: 'access',  label: 'Access:',     type: 'chips', values: ['Finance Team', 'Audit Team'] },
      { id: 'conf',    label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'hr': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Human Resources process models covering talent acquisition, performance management and learning & development.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Sarah Kim'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'dept',   label: 'Department:', type: 'chips', values: ['Human Resources'] },
      { id: 'items',  label: 'Contents:',   type: 'text',  value: '3 sub-folders, 2 diagrams' },
      { id: 'access', label: 'Access:',     type: 'chips', values: ['HR Team', 'People Managers'] },
      { id: 'conf',   label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'procurement': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Procurement process models covering source-to-pay, contract management and supplier lifecycle management.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Paul Gray'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'dept',   label: 'Department:', type: 'chips', values: ['Procurement'] },
      { id: 'items',  label: 'Contents:',   type: 'text',  value: '3 sub-folders, 2 diagrams' },
      { id: 'access', label: 'Access:',     type: 'chips', values: ['Procurement Team', 'Finance Team'] },
      { id: 'conf',   label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'sales': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Sales & Customer Service process models covering lead-to-order, customer onboarding and service request management.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Ludwig Grohe'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'dept',   label: 'Department:', type: 'chips', values: ['Sales & Customer Service'] },
      { id: 'items',  label: 'Contents:',   type: 'text',  value: '3 sub-folders, 2 diagrams' },
      { id: 'access', label: 'Access:',     type: 'chips', values: ['Sales Team', 'Customer Success'] },
      { id: 'conf',   label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'it-ops': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'IT & Operations process models covering IT service management (ITIL), infrastructure operations and security processes.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Tim Green'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'dept',   label: 'Department:', type: 'chips', values: ['IT & Operations'] },
      { id: 'items',  label: 'Contents:',   type: 'text',  value: '2 sub-folders, 2 diagrams' },
      { id: 'access', label: 'Access:',     type: 'chips', values: ['IT Team', 'Security Team'] },
      { id: 'conf',   label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'incident-mgmt': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Incident management diagrams — covers the full lifecycle from detection through resolution and post-incident review.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Tim Green'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'framework', label: 'Framework:', type: 'chips', values: ['ITIL v4'] },
      { id: 'items',     label: 'Contents:',  type: 'text',  value: '3 process models' },
      { id: 'access',    label: 'Access:',    type: 'chips', values: ['IT Service Management', 'Operations'] },
      { id: 'conf',      label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
    ]},
  ]},
  'my-documents': { attributes: [], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Personal workspace for drafts, personal projects and template files. Only visible to you.' },
      { id: 'owner',  label: 'Folder Owner:', type: 'chips', values: ['Sebastian Kaim'] },
    ]},
    { id: 'details', name: 'Details', attrs: [
      { id: 'items',  label: 'Contents:',   type: 'text',  value: '4 sub-folders' },
      { id: 'access', label: 'Access:',     type: 'chips', values: ['Private'] },
      { id: 'conf',   label: 'Confidentiality:', type: 'chips', values: ['Private'] },
    ]},
  ]},

  // ── Value Chains ─────────────────────────────────────────────────────────────
  'o2c-value-chain': { level: 'Level 1', variants: 'template', revision: 5, lastPublished: 'May 2, 2026', lastAuthor: 'Lina Davis', lastEditedBy: 'Lina Davis', lastEditedAt: '2 hours ago', attributes: [
    { label: 'Description', value: 'End-to-end value chain covering the complete Order-to-Cash cycle, from initial customer inquiry through cash collection and reconciliation. Includes all sub-processes and system touchpoints.' },
    { label: 'Process Owner', value: 'Lina Davis' },
    { label: 'Department', value: 'Finance & Accounting' },
    { label: 'Process Scope', value: 'Cross-functional — covers Order Management, Fulfillment, Invoicing, Accounts Receivable' },
    { label: 'SAP Solution', value: 'SAP S/4HANA, SAP Order Management' },
    { label: 'System Landscape', value: 'Production: S4P — Quality: S4Q — Dev: S4D' },
    { label: 'Regulatory Relevance', value: 'SOX Section 302/404, IFRS 15 revenue recognition' },
    { label: 'Review Frequency', value: 'Annually, triggered by major system changes' },
    { label: 'Related Policies', value: 'Revenue Recognition Policy (FIN-007), Credit Risk Policy (FIN-012)' },
    { label: 'KPIs', value: 'Days Sales Outstanding (DSO), Invoice Accuracy Rate, Order-to-Cash Cycle Time' },
    { label: 'Approved By', value: 'CFO — Elena Marchetti, Apr 28, 2026' },
    { label: 'Confidentiality', value: 'Internal' },
    { label: 'Language', value: 'English (US)' },
  ], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'name',   label: 'Name:',        type: 'text',      value: 'Order-to-Cash Value Chain' },
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'End-to-end value chain covering the complete Order-to-Cash cycle, from initial customer inquiry through cash collection and reconciliation.' },
      { id: 'status', label: 'Status:',      type: 'chips',     values: ['Published'] },
      { id: 'owner',  label: 'Owner:',       type: 'chips',     values: ['Lina Davis'] },
    ]},
    { id: 'details', name: 'Value Chain Details', attrs: [
      { id: 'dept',     label: 'Department:',       type: 'chips', values: ['Finance & Accounting'] },
      { id: 'scope',    label: 'Process Scope:',    type: 'text',  value: 'Order Management → Fulfillment → Invoicing → Accounts Receivable' },
      { id: 'sap',      label: 'SAP Solution:',     type: 'chips', values: ['SAP S/4HANA', 'SAP Order Management'] },
      { id: 'kpis',     label: 'KPIs:',             type: 'text',  value: 'Days Sales Outstanding (DSO), Invoice Accuracy Rate, O2C Cycle Time' },
      { id: 'reg',      label: 'Regulatory:',       type: 'text',  value: 'SOX Section 302/404, IFRS 15 revenue recognition' },
      { id: 'conf',     label: 'Confidentiality:',  type: 'chips', values: ['Internal'] },
      { id: 'language', label: 'Language:',         type: 'chips', values: ['English (US)'] },
    ]},
  ]},

  // ── Customer Journeys ────────────────────────────────────────────────────────
  'lead-to-order-journey': { level: 'Level 2', revision: 2, lastPublished: 'May 8, 2026', lastAuthor: 'Ludwig Grohe', lastEditedBy: 'Ludwig Grohe', lastEditedAt: 'yesterday', attributes: [
    { label: 'Description', value: 'CX journey mapping the customer experience from first marketing contact through signed order. Highlights pain points in the qualification and quoting stages.' },
    { label: 'Process Owner', value: 'Ludwig Grohe' },
    { label: 'Department', value: 'Sales & Customer Service' },
    { label: 'Parent Process', value: 'Lead-to-Order (L2O) End-to-End Value Chain' },
    { label: 'Persona', value: 'B2B Buyer — Enterprise Segment' },
    { label: 'Journey Phases', value: 'Awareness → Evaluation → Engagement → Proposal → Signature' },
    { label: 'Pain Points', value: 'Long quote turnaround time; lack of pricing transparency in configurator; manual CPQ hand-off to legal' },
    { label: 'SAP Solution', value: 'SAP Sales Cloud (CRM), SAP CPQ' },
    { label: 'NPS Impact', value: 'High — quote phase scores 34 NPS vs. 61 post-signature' },
    { label: 'Improvement Initiative', value: 'CPQ Automation Project (Q3 2026)' },
    { label: 'Approved By', value: 'VP Sales — Tom Richter, May 5, 2026' },
    { label: 'Confidentiality', value: 'Internal' },
    { label: 'Language', value: 'English (US)' },
  ], attributeGroups: [
    { id: 'main', name: 'Main Attributes', attrs: [
      { id: 'name',   label: 'Name:',        type: 'text',      value: 'Lead-to-Order Customer Journey' },
      { id: 'desc',   label: 'Description:', type: 'multiline', value: 'CX journey mapping the customer experience from first marketing contact through signed order. Highlights pain points in the qualification and quoting stages.' },
      { id: 'status', label: 'Status:',      type: 'chips',     values: ['Published'] },
      { id: 'owner',  label: 'Owner:',       type: 'chips',     values: ['Ludwig Grohe'] },
    ]},
    { id: 'journey-details', name: 'Journey Details', attrs: [
      { id: 'dept',     label: 'Department:',     type: 'chips', values: ['Sales & Customer Service'] },
      { id: 'persona',  label: 'Persona:',        type: 'chips', values: ['B2B Buyer — Enterprise'] },
      { id: 'phases',   label: 'Journey Phases:', type: 'text',  value: 'Awareness → Evaluation → Engagement → Proposal → Signature' },
      { id: 'pain',     label: 'Pain Points:',    type: 'multiline', value: 'Long quote turnaround time; lack of pricing transparency in configurator; manual CPQ hand-off to legal' },
      { id: 'sap',      label: 'SAP Solution:',   type: 'chips', values: ['SAP Sales Cloud', 'SAP CPQ'] },
      { id: 'nps',      label: 'NPS Impact:',     type: 'text',  value: 'Quote phase: 34 NPS vs. 61 post-signature' },
      { id: 'conf',     label: 'Confidentiality:', type: 'chips', values: ['Internal'] },
      { id: 'language', label: 'Language:',       type: 'chips', values: ['English (US)'] },
    ]},
  ]},
  'incident-mgmt-bpmn': {
    level: 'Level 2', revision: 1, lastPublished: '—', lastAuthor: 'Tim Green', lastEditedBy: 'Tim Green', lastEditedAt: '3 days ago',
    ongoingApproval: { name: 'Incident Management Process', revision: 1, date: '2026-05-14' },
    attributes: [
      { label: 'Description', value: 'ITIL-aligned incident management process covering detection, classification, escalation and resolution. Currently under review by the IT Service Management board.' },
      { label: 'Process Owner', value: 'Tim Green' },
      { label: 'Department', value: 'IT & Operations' },
      { label: 'Framework', value: 'ITIL v4' },
      { label: 'Priority Levels', value: 'P1 (Critical) — 1 hr SLA; P2 (High) — 4 hr SLA; P3 (Medium) — 8 hr SLA; P4 (Low) — 24 hr SLA' },
      { label: 'Tooling', value: 'ServiceNow ITSM (Production instance)' },
      { label: 'Escalation Path', value: 'L1 Service Desk → L2 Specialist → L3 Engineering → Major Incident Manager' },
      { label: 'Review Status', value: 'Under review by IT Service Management Board — expected sign-off Jun 15, 2026' },
      { label: 'Open Change Requests', value: '3 pending (auto-escalation rule, on-call rotation update, CMDB integration)' },
      { label: 'Related Documents', value: 'Major Incident Procedure (ITSM-003), On-Call Policy (OPS-011)' },
      { label: 'Confidentiality', value: 'Internal' },
      { label: 'Language', value: 'English (UK)' },
    ],
    attributeGroups: [
      {
        id: 'main', name: 'Main Attributes',
        attrs: [
          { id: 'name',        label: 'Name:',        type: 'text',      value: 'Incident Management Process' },
          { id: 'desc',        label: 'Description:', type: 'multiline', value: 'ITIL-aligned incident management process covering detection, classification, escalation and resolution. Currently under review by the IT Service Management board.' },
          { id: 'status',      label: 'Status:',      type: 'chips',     values: ['Draft'] },
          { id: 'owner',       label: 'Owner:',       type: 'chips',     values: ['Tim Green'] },
        ],
      },
      {
        id: 'process-details', name: 'Process Details',
        attrs: [
          { id: 'framework',   label: 'Framework:',       type: 'chips',  values: ['ITIL v4'] },
          { id: 'tooling',     label: 'Tooling:',         type: 'chips',  values: ['ServiceNow ITSM'] },
          { id: 'dept',        label: 'Department:',      type: 'chips',  values: ['IT & Operations'] },
          { id: 'priority',    label: 'Priority Levels:', type: 'text',   value: 'P1 — 1 hr SLA; P2 — 4 hr SLA; P3 — 8 hr SLA; P4 — 24 hr SLA' },
          { id: 'escalation',  label: 'Escalation Path:', type: 'text',   value: 'L1 Service Desk → L2 Specialist → L3 Engineering → Major Incident Manager' },
          { id: 'confidential',label: 'Confidentiality:', type: 'chips',  values: ['Internal'] },
          { id: 'language',    label: 'Language:',        type: 'chips',  values: ['English (UK)'] },
        ],
      },
    ],
  },
  'p2p-process': { level: 'Level 1', variants: { count: 3 }, revision: 4, lastPublished: 'Apr 30, 2026', lastAuthor: 'Paul Gray', lastEditedBy: 'Sarah Kim', lastEditedAt: '5 minutes ago', attributes: [
    { label: 'Description', value: 'Full Procure-to-Pay process from purchase requisition through supplier payment, including three-way match and exception handling.' },
    { label: 'Process Owner', value: 'Paul Gray' },
    { label: 'Department', value: 'Procurement' },
    { label: 'Process Scope', value: 'Requisitioning → Sourcing → Purchase Order → Goods Receipt → Invoice Verification → Payment' },
    { label: 'SAP Solution', value: 'SAP S/4HANA MM, SAP Ariba Buying' },
    { label: 'Approval Thresholds', value: '< €5,000: Manager; €5,000–50,000: Director; > €50,000: VP + Finance' },
    { label: 'Payment Terms', value: 'Net 30 standard; early-payment discount available via dynamic discounting' },
    { label: 'Regulatory Relevance', value: 'EU Directive 2011/7/EU (Late Payments), SOX controls SC-P01 to SC-P08' },
    { label: 'KPIs', value: 'PO Cycle Time, Invoice Exception Rate, Supplier On-Time Delivery' },
    { label: 'Pending Change', value: 'Rev. 4.1 draft — adds Ariba guided buying touchpoint (ETA: Jun 2026)' },
    { label: 'Approved By', value: 'CPO — Diane Lehmann, Apr 28, 2026' },
    { label: 'Confidentiality', value: 'Internal' },
    { label: 'Language', value: 'English (US)' },
  ],
  attributeGroups: [
    {
      id: 'main', name: 'Main Attributes',
      attrs: [
        { id: 'name',   label: 'Name:',        type: 'text',      value: 'Procure-to-Pay Process' },
        { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Full Procure-to-Pay process from purchase requisition through supplier payment, including three-way match and exception handling.' },
        { id: 'status', label: 'Status:',      type: 'chips',     values: ['Published'] },
        { id: 'owner',  label: 'Owner:',        type: 'chips',     values: ['Paul Gray'] },
      ],
    },
    {
      id: 'process-details', name: 'Process Details',
      attrs: [
        { id: 'dept',         label: 'Department:',         type: 'chips',  values: ['Procurement'] },
        { id: 'sap-solution', label: 'SAP Solution:',       type: 'chips',  values: ['SAP S/4HANA MM', 'SAP Ariba Buying'] },
        { id: 'scope',        label: 'Process Scope:',      type: 'text',   value: 'Requisitioning → Sourcing → PO → Goods Receipt → Invoice Verification → Payment' },
        { id: 'reg',          label: 'Regulatory:',         type: 'text',   value: 'EU Directive 2011/7/EU (Late Payments), SOX SC-P01 to SC-P08' },
        { id: 'kpis',         label: 'KPIs:',               type: 'text',   value: 'PO Cycle Time, Invoice Exception Rate, Supplier On-Time Delivery' },
        { id: 'confidential', label: 'Confidentiality:',    type: 'chips',  values: ['Internal'] },
        { id: 'language',     label: 'Language:',           type: 'chips',  values: ['English (US)'] },
      ],
    },
  ]},
  'budget-approval': { level: 'Level 2', revision: 3, lastPublished: 'Mar 18, 2026', lastAuthor: 'Marie Carlsen', lastEditedBy: 'Marie Carlsen', lastEditedAt: 'May 22, 2026', ongoingApproval: { name: 'Budget Approval Workflow', revision: 3, date: '2025-09-24' }, attributes: [
    { label: 'Description', value: 'Annual and ad-hoc budget request process with delegation-of-authority matrix and multi-level sign-off routing.' },
    { label: 'Process Owner', value: 'Marie Carlsen' },
    { label: 'Department', value: 'Finance & Accounting' },
    { label: 'Process Type', value: 'Governance / Control' },
    { label: 'Trigger Events', value: 'Annual planning cycle (Oct–Nov); ad-hoc capex > €25,000; headcount additions' },
    { label: 'Delegation of Authority', value: 'Cost Centre Manager → VP (> €50k) → CFO (> €500k) → Board (> €2M)' },
    { label: 'SAP Solution', value: 'SAP S/4HANA CO, SAP BPC (Budget Planning)' },
    { label: 'SLA', value: 'Standard requests: 5 business days; urgent: 2 business days with escalation flag' },
    { label: 'Audit Trail', value: 'All approvals logged in SAP workflow engine with digital signature' },
    { label: 'Related Policies', value: 'Corporate Authority Matrix (FIN-001), CAPEX Policy (FIN-009)' },
    { label: 'Approved By', value: 'CFO — Elena Marchetti, Mar 15, 2026' },
    { label: 'Confidentiality', value: 'Restricted — Finance & Controlling only' },
    { label: 'Language', value: 'English (US)' },
  ],
  attributeGroups: [
    {
      id: 'main', name: 'Main Attributes',
      attrs: [
        { id: 'name',   label: 'Name:',        type: 'text',      value: 'Budget Approval Workflow' },
        { id: 'desc',   label: 'Description:', type: 'multiline', value: 'Annual and ad-hoc budget request process with delegation-of-authority matrix and multi-level sign-off routing.' },
        { id: 'status', label: 'Status:',      type: 'chips',     values: ['Draft'] },
        { id: 'owner',  label: 'Owner:',        type: 'chips',     values: ['Marie Carlsen'] },
      ],
    },
    {
      id: 'governance', name: 'Governance',
      attrs: [
        { id: 'dept',      label: 'Department:',            type: 'chips',  values: ['Finance & Accounting'] },
        { id: 'type',      label: 'Process Type:',          type: 'chips',  values: ['Governance / Control'] },
        { id: 'triggers',  label: 'Trigger Events:',        type: 'text',   value: 'Annual planning cycle (Oct–Nov); ad-hoc capex > €25,000; headcount additions' },
        { id: 'doa',       label: 'Delegation of Authority:', type: 'text', value: 'Manager → VP (> €50k) → CFO (> €500k) → Board (> €2M)' },
        { id: 'sla',       label: 'SLA:',                   type: 'text',   value: 'Standard: 5 business days; urgent: 2 business days' },
        { id: 'confidential', label: 'Confidentiality:',   type: 'chips',  values: ['Restricted'] },
        { id: 'language',  label: 'Language:',              type: 'chips',  values: ['English (US)'] },
      ],
    },
  ]},
}

export type ViewType = 'table' | 'list' | 'card' | 'grid'

export type ColumnDef = {
  id: string
  label: string
  required: boolean
  visible: boolean
}

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'name',        label: 'Name',              required: true,  visible: true  },
  { id: 'type',        label: 'Type',              required: true,  visible: true  },
  { id: 'description', label: 'Description',       required: false, visible: true  },
  { id: 'created',     label: 'Created',           required: false, visible: true  },
  { id: 'changed',     label: 'Changed',           required: false, visible: true  },
  { id: 'version',     label: 'Latest Version',    required: false, visible: false },
  { id: 'status',      label: 'Status',            required: false, visible: true  },
  { id: 'attr1',       label: '[Attribute Name]',  required: false, visible: false },
  { id: 'attr2',       label: '[Attribute Name]',  required: false, visible: false },
  { id: 'attr3',       label: '[Attribute Name]',  required: false, visible: false },
  { id: 'attr4',       label: '[Attribute Name]',  required: false, visible: false },
  { id: 'attr5',       label: '[Attribute Name]',  required: false, visible: false },
]

export const TYPE_OPTIONS = [
  { value: 'folder',       label: 'Folder' },
  { value: 'journey',      label: 'Journey Model' },
  { value: 'process',      label: 'BPMN' },
  { value: 'navmap',       label: 'Navigation Map' },
  { value: 'value-chain',  label: 'Value Chain' },
  { value: 'dmn',          label: 'DMN' },
]

export const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export const LOCATION_OPTIONS = [
  { value: 'modeling',      label: 'Modeling Files' },
  { value: 'data-modeling', label: 'Data Management Files' },
  { value: 'my-docs',       label: 'My Documents' },
]

export const VERSION_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'any',    label: 'Any' },
]

export const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft',     label: 'Draft' },
]

export type FileItem = {
  id: string
  name: string
  type: 'Folder' | 'Customer Journey' | 'Process Model' | 'Navigation Map' | 'Value Chain' | 'Dashboard' | 'File'
  description?: string
  created: string
  changed: string
  changedBy?: string
  version?: string
  status?: string
  canExecute?: boolean
  hasPublished?: boolean
}

// Root "Modeling Files" view — top-level folders only
export const FILES: FileItem[] = [
  { id: 'finance',    name: 'Finance & Accounting',    type: 'Folder', created: 'Jan 12, 2022', changed: 'May 10, 2026' },
  { id: 'hr',         name: 'Human Resources',         type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 28, 2026' },
  { id: 'procurement',name: 'Procurement',             type: 'Folder', created: 'Feb 3, 2022',  changed: 'May 1, 2026'  },
  { id: 'sales',      name: 'Sales & Customer Service',type: 'Folder', created: 'Feb 3, 2022',  changed: 'May 12, 2026' },
  { id: 'it-ops',     name: 'IT & Operations',         type: 'Folder', created: 'Mar 15, 2022', changed: 'Apr 30, 2026' },
]

export const MY_MODELING_FILES: FileItem[] = [
  { id: 'my-processes', name: 'My Processes', type: 'Folder', created: 'Mar 5, 2025', changed: 'Jun 18, 2026' },
  { id: 'my-sandbox',   name: 'Sandbox',      type: 'Folder', created: 'Jan 10, 2025', changed: 'May 30, 2026' },
  { id: 'my-draft-order-process', name: 'Draft – Order Process', type: 'Process Model', description: 'Work-in-progress draft of the new order fulfilment process.', created: 'Jun 1, 2026', changed: 'Jun 20, 2026', changedBy: 'Hannah Schwan', version: '0.3', status: 'In Review' },
]

// Per-folder content keyed by folder id
export const FOLDER_FILES: Record<string, FileItem[]> = {
  // ── My Documents ────────────────────────────────────────────────────────────
  'my-documents': [
    { id: 'my-drafts',            name: 'Drafts',           type: 'Folder', created: 'Jan 12, 2022', changed: 'May 20, 2026' },
    { id: 'my-personal-projects', name: 'Personal Projects',type: 'Folder', created: 'Jan 12, 2022', changed: 'May 10, 2026' },
    { id: 'my-templates',         name: 'Templates',        type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 15, 2026' },
    { id: 'my-archive',           name: 'Archive',          type: 'Folder', created: 'Jan 12, 2022', changed: 'Mar 1, 2026'  },
  ],

  // ── Private Modeling Files ──────────────────────────────────────────────────
  'my-processes': [
    { id: 'my-onboarding', name: 'Onboarding Drafts', type: 'Folder', created: 'Mar 10, 2025', changed: 'Jun 15, 2026' },
    { id: 'my-approvals',  name: 'Approval Workflows', type: 'Folder', created: 'Apr 5, 2025', changed: 'Jun 10, 2026' },
    { id: 'my-proc-1', name: 'Employee Offboarding Draft', type: 'Process Model', description: 'Draft process for employee offboarding steps.', created: 'May 20, 2026', changed: 'Jun 18, 2026', changedBy: 'Hannah Schwan', version: '0.2', status: 'In Review' },
  ],
  'my-onboarding': [
    { id: 'my-onb-1', name: 'New Hire Day 1 Checklist', type: 'Process Model', description: 'Step-by-step process for first-day onboarding tasks.', created: 'Mar 12, 2025', changed: 'Jun 14, 2026', changedBy: 'Hannah Schwan', version: '1.1', status: 'In Review' },
    { id: 'my-onb-2', name: 'IT Access Provisioning', type: 'Process Model', description: 'Workflow for provisioning system access for new hires.', created: 'Apr 2, 2025', changed: 'Jun 5, 2026', changedBy: 'Hannah Schwan', version: '0.4', status: 'Draft' },
  ],
  'my-approvals': [
    { id: 'my-appr-1', name: 'Budget Approval Flow', type: 'Process Model', description: 'Approval chain for budget requests above threshold.', created: 'Apr 8, 2025', changed: 'Jun 9, 2026', changedBy: 'Hannah Schwan', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'my-appr-2', name: 'Exception Handling', type: 'Process Model', description: 'Process for handling approval exceptions and escalations.', created: 'May 1, 2025', changed: 'Jun 3, 2026', changedBy: 'Hannah Schwan', version: '0.8', status: 'In Review' },
  ],
  'my-sandbox': [
    { id: 'my-experiments', name: 'Experiments', type: 'Folder', created: 'Jan 15, 2025', changed: 'May 28, 2026' },
    { id: 'my-sandbox-1', name: 'Value Chain Prototype', type: 'Value Chain', description: 'Experimental value chain layout for customer journey.', created: 'Feb 20, 2025', changed: 'May 25, 2026', changedBy: 'Hannah Schwan', version: '0.1', status: 'Draft' },
  ],
  'my-experiments': [
    { id: 'my-exp-1', name: 'DMN Test Decision', type: 'Process Model', description: 'Test decision table for routing logic experiment.', created: 'Mar 3, 2025', changed: 'May 20, 2026', changedBy: 'Hannah Schwan', version: '0.1', status: 'Draft' },
  ],
  finance: [
    { id: 'accounts-payable', name: 'Accounts Payable', type: 'Folder', created: 'Jan 12, 2022', changed: 'May 3, 2026' },
    { id: 'accounts-receivable', name: 'Accounts Receivable', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 29, 2026' },
    { id: 'financial-close', name: 'Financial Close & Reporting', type: 'Folder', created: 'Feb 1, 2022', changed: 'May 10, 2026' },
    { id: 'o2c-value-chain', name: 'Order-to-Cash Value Chain', type: 'Value Chain', description: 'End-to-end O2C process covering all revenue-cycle touchpoints', created: 'Mar 4, 2023', changed: 'May 2, 2026', changedBy: 'Lina Davis', version: '5.0', status: 'Published', hasPublished: true },
    { id: 'budget-approval', name: 'Budget Approval Workflow', type: 'Process Model', description: 'Annual and ad-hoc budget requests with delegation-of-authority', created: 'Jan 15, 2023', changed: 'May 22, 2026', changedBy: 'Ludwig Grohe', version: '3.0', status: 'Draft', canExecute: true },
    { id: 'finance-navmap', name: 'Finance Process Landscape', type: 'Navigation Map', description: 'High-level navigation map of all Finance & Accounting processes', created: 'Apr 10, 2023', changed: 'May 5, 2026', changedBy: 'Lina Davis', version: '2.0', status: 'Published', hasPublished: true },
  ],
  'accounts-payable': [
    { id: 'invoice-processing', name: 'Invoice Processing', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 15, 2026' },
    { id: 'vendor-payments', name: 'Vendor Payments', type: 'Folder', created: 'Jan 12, 2022', changed: 'Mar 30, 2026' },
    { id: 'ap-3way-match', name: '3-Way Match Process', type: 'Process Model', description: 'PO, GR and invoice reconciliation before payment release', created: 'Jun 5, 2023', changed: 'Apr 12, 2026', changedBy: 'Lina Davis', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'ap-exception-handling', name: 'AP Exception Handling', type: 'Process Model', description: 'Handling discrepancies, duplicate invoices and blocked items', created: 'Sep 14, 2023', changed: 'Mar 28, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'ap-early-payment', name: 'Early Payment Discount Process', type: 'Process Model', description: 'Dynamic discounting workflow for capturing early-pay discounts via Ariba', created: 'Feb 20, 2024', changed: 'May 1, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],
  'accounts-receivable': [
    { id: 'credit-collections', name: 'Credit & Collections', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 20, 2026' },
    { id: 'cash-application', name: 'Cash Application', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 18, 2026' },
    { id: 'ar-dispute-mgmt', name: 'Dispute Management Process', type: 'Process Model', description: 'Resolution flow for billing disputes raised by customers', created: 'Jul 8, 2023', changed: 'Apr 22, 2026', changedBy: 'Lina Davis', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'ar-dunning', name: 'Dunning & Collections Journey', type: 'Customer Journey', description: 'Customer experience across dunning levels from reminder to collections agency', created: 'Nov 3, 2023', changed: 'Apr 29, 2026', changedBy: 'Sarah Kim', version: '1.0', status: 'Published', hasPublished: true },
  ],
  'financial-close': [
    { id: 'period-end-close', name: 'Period-End Close Process', type: 'Process Model', description: 'Month-end and quarter-end accounting close with task checklist', created: 'Mar 1, 2023', changed: 'May 8, 2026', changedBy: 'Lina Davis', version: '4.0', status: 'Published', hasPublished: true },
    { id: 'consolidation', name: 'Group Consolidation Process', type: 'Process Model', description: 'Inter-company eliminations and group financial consolidation', created: 'May 15, 2023', changed: 'May 10, 2026', changedBy: 'Lina Davis', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'audit-prep', name: 'External Audit Preparation', type: 'Process Model', description: 'Audit readiness checklist and evidence-gathering workflow', created: 'Jan 20, 2024', changed: 'Apr 30, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],

  // ── Human Resources ─────────────────────────────────────────────────────────
  hr: [
    { id: 'talent-acquisition', name: 'Talent Acquisition', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 25, 2026' },
    { id: 'performance-mgmt', name: 'Performance Management', type: 'Folder', created: 'Jan 15, 2022', changed: 'Apr 28, 2026' },
    { id: 'learning-dev', name: 'Learning & Development', type: 'Folder', created: 'Feb 1, 2022', changed: 'Apr 10, 2026' },
    { id: 'hr-landscape', name: 'HR Process Landscape', type: 'Navigation Map', description: 'Overview navigation map of all HR processes and their owners', created: 'May 2, 2023', changed: 'Apr 28, 2026', changedBy: 'Sarah Kim', version: '3.0', status: 'Published', hasPublished: true },
    { id: 'employee-offboarding', name: 'Employee Offboarding', type: 'Process Model', description: 'Structured process for employee exits covering IT, payroll and access revocation', created: 'Aug 18, 2023', changed: 'Apr 22, 2026', changedBy: 'Sarah Kim', version: '2.0', status: 'Published', hasPublished: true },
  ],
  'talent-acquisition': [
    { id: 'recruitment', name: 'Recruitment & Hiring', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 20, 2026' },
    { id: 'employee-onboarding', name: 'Employee Onboarding', type: 'Folder', created: 'Jan 12, 2022', changed: 'Apr 25, 2026' },
    { id: 'talent-sourcing', name: 'Talent Sourcing Strategy', type: 'Process Model', description: 'Sourcing channels, LinkedIn Recruiter workflow and agency engagement', created: 'Oct 10, 2023', changed: 'Apr 18, 2026', changedBy: 'Sarah Kim', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'headcount-approval', name: 'Headcount Approval Process', type: 'Process Model', description: 'Requisition-to-approval workflow for new headcount and backfill positions', created: 'Feb 14, 2024', changed: 'Apr 25, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],
  'performance-mgmt': [
    { id: 'annual-review', name: 'Annual Performance Review', type: 'Process Model', description: 'Year-end review cycle including self-assessment, manager calibration and rating distribution', created: 'Mar 5, 2023', changed: 'Apr 28, 2026', changedBy: 'Sarah Kim', version: '3.0', status: 'Published', hasPublished: true },
    { id: 'pip-process', name: 'Performance Improvement Plan (PIP)', type: 'Process Model', description: 'Structured PIP flow from trigger through closure with HR Business Partner involvement', created: 'Jun 20, 2023', changed: 'Apr 15, 2026', changedBy: 'Sarah Kim', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'continuous-feedback', name: 'Continuous Feedback Journey', type: 'Customer Journey', description: 'Employee experience of giving and receiving feedback via SAP SuccessFactors Continuous Performance', created: 'Nov 5, 2023', changed: 'Apr 28, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],
  'learning-dev': [
    { id: 'learning-needs', name: 'Learning Needs Analysis', type: 'Process Model', description: 'Identification and prioritization of L&D needs from performance data and manager input', created: 'Apr 1, 2023', changed: 'Apr 10, 2026', changedBy: 'Sarah Kim', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'mandatory-training', name: 'Mandatory Training Compliance', type: 'Process Model', description: 'Annual compliance training assignment, tracking and escalation workflow', created: 'Jan 10, 2024', changed: 'Apr 8, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Published', hasPublished: true },
  ],

  // ── Procurement ─────────────────────────────────────────────────────────────
  procurement: [
    { id: 'source-to-pay', name: 'Source-to-Pay', type: 'Folder', created: 'Feb 3, 2022', changed: 'May 1, 2026' },
    { id: 'contract-mgmt', name: 'Contract Management', type: 'Folder', created: 'Feb 5, 2022', changed: 'Apr 28, 2026' },
    { id: 'supplier-mgmt', name: 'Supplier Management', type: 'Folder', created: 'Feb 5, 2022', changed: 'Apr 22, 2026' },
    { id: 'p2p-process', name: 'Procure-to-Pay Process', type: 'Process Model', description: 'Full P2P from requisition to payment with 3-way match', created: 'Nov 22, 2022', changed: 'May 30, 2026', changedBy: 'Paul Gray', version: '4.0', status: 'Published', hasPublished: true },
    { id: 'procurement-navmap', name: 'Procurement Process Landscape', type: 'Navigation Map', description: 'Navigation map covering S2P, contracting and supplier lifecycle', created: 'Jun 12, 2023', changed: 'Apr 20, 2026', changedBy: 'Paul Gray', version: '2.0', status: 'Published', hasPublished: true },
  ],
  'source-to-pay': [
    { id: 'supplier-qualification', name: 'Supplier Qualification', type: 'Folder', created: 'Feb 3, 2022', changed: 'Apr 18, 2026' },
    { id: 'purchase-order-mgmt', name: 'Purchase Order Management', type: 'Folder', created: 'Feb 3, 2022', changed: 'Apr 30, 2026' },
    { id: 'invoice-verification', name: 'Invoice Verification', type: 'Folder', created: 'Feb 3, 2022', changed: 'May 1, 2026' },
    { id: 'catalog-buying', name: 'Catalog-Based Buying', type: 'Process Model', description: 'Guided buying via Ariba catalog with punch-out and approval routing', created: 'May 18, 2023', changed: 'Apr 25, 2026', changedBy: 'Paul Gray', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'spot-buy', name: 'Spot Buy / Maverick Purchase', type: 'Process Model', description: 'Exception process for non-catalog urgent purchases below €5,000', created: 'Sep 10, 2023', changed: 'Apr 15, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],
  'contract-mgmt': [
    { id: 'contract-creation', name: 'Contract Creation & Negotiation', type: 'Process Model', description: 'End-to-end contract drafting, redlining and legal review with CLM integration', created: 'Mar 20, 2023', changed: 'Apr 28, 2026', changedBy: 'Paul Gray', version: '3.0', status: 'Published', hasPublished: true },
    { id: 'contract-renewal', name: 'Contract Renewal & Expiry Management', type: 'Process Model', description: 'Automated renewal triggers, renegotiation workflow and expiry notifications', created: 'Jul 15, 2023', changed: 'Apr 22, 2026', changedBy: 'Paul Gray', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'contract-compliance', name: 'Contract Compliance Monitoring', type: 'Process Model', description: 'Periodic compliance checks against contract terms and SLA tracking', created: 'Jan 5, 2024', changed: 'Apr 10, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft', canExecute: true },
  ],
  'supplier-mgmt': [
    { id: 'supplier-onboarding', name: 'Supplier Onboarding', type: 'Process Model', description: 'New supplier registration, risk assessment and master data setup in SAP Ariba', created: 'Apr 8, 2023', changed: 'Apr 22, 2026', changedBy: 'Paul Gray', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'supplier-performance', name: 'Supplier Performance Review', type: 'Process Model', description: 'Quarterly scorecard review with KPI data from S/4HANA and stakeholder input', created: 'Oct 1, 2023', changed: 'Apr 15, 2026', changedBy: 'Paul Gray', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'supplier-offboarding', name: 'Supplier Offboarding', type: 'Process Model', description: 'Controlled deactivation of suppliers including open PO resolution and system cleanup', created: 'Feb 10, 2024', changed: 'Apr 5, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft' },
  ],

  // ── Sales & Customer Service ────────────────────────────────────────────────
  sales: [
    { id: 'lead-to-order', name: 'Lead-to-Order', type: 'Folder', created: 'Feb 3, 2022', changed: 'May 12, 2026' },
    { id: 'customer-onboarding-sales', name: 'Customer Onboarding', type: 'Folder', created: 'Feb 5, 2022', changed: 'Apr 30, 2026' },
    { id: 'service-request-mgmt', name: 'Service Request Management', type: 'Folder', created: 'Mar 1, 2022', changed: 'Apr 25, 2026' },
    { id: 'lead-to-order-journey', name: 'Lead-to-Order Customer Journey', type: 'Customer Journey', description: 'CX journey from first contact to signed order', created: 'Jun 10, 2023', changed: 'May 8, 2026', changedBy: 'Ludwig Grohe', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'sales-navmap', name: 'Sales Process Landscape', type: 'Navigation Map', description: 'Overview of Sales & CX processes from lead generation to after-sales', created: 'Aug 20, 2023', changed: 'May 12, 2026', changedBy: 'Ludwig Grohe', version: '2.0', status: 'Published', hasPublished: true },
  ],
  'lead-to-order': [
    { id: 'opportunity-mgmt', name: 'Opportunity Management', type: 'Folder', created: 'Feb 3, 2022', changed: 'May 10, 2026' },
    { id: 'quote-to-order', name: 'Quote-to-Order', type: 'Folder', created: 'Feb 3, 2022', changed: 'May 8, 2026' },
    { id: 'lead-qualification', name: 'Lead Qualification Process', type: 'Process Model', description: 'BANT-based qualification from inbound lead to sales-accepted opportunity', created: 'Apr 4, 2023', changed: 'May 6, 2026', changedBy: 'Ludwig Grohe', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'deal-desk', name: 'Deal Desk Approval', type: 'Process Model', description: 'Non-standard deal approval routing for discount exceptions and custom terms', created: 'Nov 8, 2023', changed: 'May 12, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft', canExecute: true },
  ],
  'customer-onboarding-sales': [
    { id: 'customer-onboarding-process', name: 'Customer Onboarding Process', type: 'Process Model', description: 'Post-signature onboarding steps covering contracting, configuration and training', created: 'May 25, 2023', changed: 'Apr 30, 2026', changedBy: 'Ludwig Grohe', version: '3.0', status: 'Published', hasPublished: true },
    { id: 'onboarding-journey', name: 'New Customer Experience Journey', type: 'Customer Journey', description: 'Customer-facing journey map from signature through go-live and 90-day check-in', created: 'Sep 15, 2023', changed: 'Apr 28, 2026', changedBy: 'Sarah Kim', version: '1.0', status: 'Published', hasPublished: true },
  ],
  'service-request-mgmt': [
    { id: 'ticket-to-resolve', name: 'Ticket-to-Resolve Process', type: 'Process Model', description: 'Customer service ticket lifecycle from creation to closure via SAP Service Cloud', created: 'Mar 12, 2023', changed: 'Apr 25, 2026', changedBy: 'Ludwig Grohe', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'escalation-process', name: 'Service Escalation Process', type: 'Process Model', description: 'L1 to L3 escalation paths for complex customer issues with SLA breach alerts', created: 'Aug 5, 2023', changed: 'Apr 20, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'cs-journey', name: 'Customer Support Experience Journey', type: 'Customer Journey', description: 'Customer journey through self-service, chat and phone channels for issue resolution', created: 'Jan 18, 2024', changed: 'Apr 18, 2026', changedBy: 'Sarah Kim', version: '1.0', status: 'Draft' },
  ],

  // ── IT & Operations ─────────────────────────────────────────────────────────
  'it-ops': [
    { id: 'it-service-mgmt', name: 'IT Service Management', type: 'Folder', created: 'Mar 15, 2022', changed: 'Apr 30, 2026' },
    { id: 'infra-ops', name: 'Infrastructure Operations', type: 'Folder', created: 'Mar 20, 2022', changed: 'Apr 22, 2026' },
    { id: 'it-navmap', name: 'IT & Operations Process Landscape', type: 'Navigation Map', description: 'ITIL-structured navigation map covering ITSM, security and infrastructure', created: 'Jul 5, 2023', changed: 'Apr 30, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'it-security-process', name: 'IT Security Incident Response', type: 'Process Model', description: 'Cyber-incident response procedure aligned with ISO 27001 and NIST CSF', created: 'Oct 20, 2023', changed: 'Apr 28, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Published', hasPublished: true },
  ],
  'it-service-mgmt': [
    { id: 'incident-mgmt', name: 'Incident Management', type: 'Folder', created: 'Mar 15, 2022', changed: 'Apr 25, 2026' },
    { id: 'change-mgmt-it', name: 'Change Management', type: 'Folder', created: 'Mar 15, 2022', changed: 'Apr 18, 2026' },
    { id: 'problem-mgmt', name: 'Problem Management', type: 'Folder', created: 'Mar 15, 2022', changed: 'Apr 15, 2026' },
    { id: 'service-catalogue', name: 'Service Catalogue Management', type: 'Process Model', description: 'Process for maintaining and publishing the IT service catalogue in ServiceNow', created: 'Jun 30, 2023', changed: 'Apr 20, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'service-level-mgmt', name: 'SLA Management & Reporting', type: 'Process Model', description: 'Monthly SLA review, breach analysis and improvement actions', created: 'Nov 12, 2023', changed: 'Apr 30, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Published', hasPublished: true },
  ],
  'incident-mgmt': [
    { id: 'incident-mgmt-bpmn', name: 'Incident Management Process', type: 'Process Model', description: 'ITIL-aligned incident lifecycle — detect, classify, resolve', created: 'Sep 1, 2024', changed: 'May 27, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Draft' },
    { id: 'major-incident', name: 'Major Incident (P1) Response', type: 'Process Model', description: 'War-room procedure for P1 incidents including bridge calls and executive updates', created: 'Mar 8, 2023', changed: 'Apr 25, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'incident-closure', name: 'Incident Closure & Post-Incident Review', type: 'Process Model', description: 'Root cause documentation and lessons-learned workflow for resolved P1/P2 incidents', created: 'Jul 22, 2023', changed: 'Apr 22, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Published', hasPublished: true },
  ],
  'change-mgmt-it': [
    { id: 'standard-change', name: 'Standard Change Process', type: 'Process Model', description: 'Pre-approved low-risk changes with automated approval and CAB bypass', created: 'Apr 15, 2023', changed: 'Apr 18, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'emergency-change', name: 'Emergency Change Process', type: 'Process Model', description: 'Fast-track change approval for production incidents requiring immediate fix', created: 'Sep 20, 2023', changed: 'Apr 15, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'normal-change', name: 'Normal Change Process', type: 'Process Model', description: 'Full CAB review and approval cycle for high-impact infrastructure changes', created: 'Jan 8, 2024', changed: 'Apr 10, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft', canExecute: true },
  ],
  'problem-mgmt': [
    { id: 'reactive-problem', name: 'Reactive Problem Investigation', type: 'Process Model', description: 'Post-incident analysis leading to root cause identification and known error logging', created: 'May 10, 2023', changed: 'Apr 15, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'proactive-problem', name: 'Proactive Problem Management', type: 'Process Model', description: 'Trend analysis from incident data to identify and eliminate recurring failures', created: 'Oct 5, 2023', changed: 'Apr 12, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Draft' },
  ],
  'infra-ops': [
    { id: 'capacity-mgmt', name: 'Capacity Management Process', type: 'Process Model', description: 'Cloud and on-prem capacity planning, right-sizing and budget forecasting', created: 'Jun 25, 2023', changed: 'Apr 22, 2026', changedBy: 'Tim Green', version: '2.0', status: 'Published', hasPublished: true },
    { id: 'patch-mgmt', name: 'Patch & Vulnerability Management', type: 'Process Model', description: 'Monthly patching cycle for OS, middleware and database components across all environments', created: 'Sep 28, 2023', changed: 'Apr 20, 2026', changedBy: 'Tim Green', version: '1.0', status: 'Published', hasPublished: true },
    { id: 'disaster-recovery', name: 'Disaster Recovery Runbook', type: 'Process Model', description: 'DR failover and failback procedures for Tier-1 production systems with RTO/RPO targets', created: 'Feb 2, 2024', changed: 'Apr 18, 2026', changedBy: 'Ludwig Grohe', version: '1.0', status: 'Draft', canExecute: true },
  ],
}

export type ViewVariant = {
  name: string
  isDefault?: boolean
  global?: boolean
  author?: string
  labelReadOnly?: boolean
  hideDelete?: boolean
}

export const INITIAL_VARIANTS: ViewVariant[] = [
  { name: 'Standard', isDefault: true, global: true, author: 'SAP', labelReadOnly: true, hideDelete: true },
  { name: 'Published Only', global: false, author: 'Sebastian Kaim' },
]

export type AccessRole = 'Viewer' | 'Organizer' | 'Editor' | 'Manager' | 'Publisher' | 'Owner'

export type AccessUser = {
  id: string
  name: string
  email: string
  avatarInitials: string
  defaultRole: AccessRole
  isGroup?: boolean
  initials?: string
  colorScheme?: string
  subtitle?: string
}

export const ACCESS_USERS: AccessUser[] = [
  { id: 'u1', name: 'Lina Davis',     email: 'lina.davis@acme.com',     avatarInitials: 'LD', defaultRole: 'Owner'     },
  { id: 'u2', name: 'Ludwig Grohe',   email: 'l.grohe@acme.com',        avatarInitials: 'LG', defaultRole: 'Editor'    },
  { id: 'u3', name: 'Tim Green',      email: 'tim.green@acme.com',      avatarInitials: 'TG', defaultRole: 'Viewer'    },
  { id: 'u4', name: 'Sarah Kim',      email: 'sarah.kim@acme.com',      avatarInitials: 'SK', defaultRole: 'Editor'    },
  { id: 'u5', name: 'Marie Carlsen',  email: 'marie.carlsen@acme.com',  avatarInitials: 'MC', defaultRole: 'Organizer' },
  { id: 'u6', name: 'Paul Gray',      email: 'paul.gray@acme.com',      avatarInitials: 'PG', defaultRole: 'Manager'   },
]

export const SELECTABLE_ROLES: { value: AccessRole; icon: string; description: string }[] = [
  { value: 'Viewer',    icon: 'SAP-icons-v4/published',         description: 'Can only view published content' },
  { value: 'Organizer', icon: 'show',                           description: 'Can also view unpublished content' },
  { value: 'Editor',    icon: 'edit',                           description: 'Can also create and edit content' },
  { value: 'Manager',   icon: 'SAP-icons-v4/file-move',         description: 'Can also move and delete unpublished content' },
  { value: 'Publisher', icon: 'world',                          description: 'Can also publish content and delete it' },
]

export const APPROVAL_WORKFLOWS: { id: string; name: string; revision: number; date: string; startedAgo: string; startedBy: string }[] = [
  { id: 'aw1', name: 'Order-to-Cash Value Chain', revision: 5, date: 'May 2026',  startedAgo: '3 days ago',   startedBy: 'Lina Davis'    },
  { id: 'aw2', name: 'Procure-to-Pay Process',    revision: 4, date: 'Apr 2026',  startedAgo: '1 week ago',   startedBy: 'Sarah Kim'     },
  { id: 'aw3', name: 'Budget Approval Workflow',  revision: 3, date: 'Mar 2026',  startedAgo: '2 weeks ago',  startedBy: 'Marie Carlsen' },
]
