import { useState, useMemo, useRef } from 'react'
import {
  FlexibleColumnLayout,
  DynamicPage, DynamicPageTitle, Title,
  Button, Input, Icon, Avatar, Text,
  Dialog, Bar, Select, Option,
  AnalyticalTable,
  List, ListItemCustom, Popover,
  Toolbar, ToolbarItem, ToolbarSpacer,
  MessageStrip,
  MultiInput, Token,
  IllustratedMessage,
  MultiComboBox, MultiComboBoxItem,
  Toast, MessageBox,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { ACCESS_USERS } from '../repository/Repository/data'
import { catBg, catIconColor } from '../repository/Repository/dictionaryData'
import { useWorkspace } from '../../contexts/WorkspaceContext'

const SUGGESTION_USERS = [
  { id: 's1', name: 'Lin Adams',   email: 'l.adams@globalcorp.com',   initials: 'LA', colorScheme: 'Accent7' },
  { id: 's2', name: 'Linda Jones', email: 'l.jones@globalcorp.com',   initials: 'LJ', colorScheme: 'Accent1' },
  { id: 's3', name: 'Lisa Taylor', email: 'l.taylor@globalcorp.com',  initials: 'LT', colorScheme: 'Accent4' },
  { id: 's4', name: 'Lena Müller', email: 'l.mueller@globalcorp.com', initials: 'LM', colorScheme: 'Accent6' },
  ...ACCESS_USERS.filter(u => !u.isGroup).map(u => ({
    id: u.id, name: u.name, email: u.email ?? '', initials: u.avatarInitials, colorScheme: u.colorScheme ?? 'Accent1',
  })),
]

type Role = 'Viewer' | 'Organizer' | 'Editor' | 'Manager' | 'Publisher'
type AccessEntry = { id: string; isGroup: boolean; name: string; email?: string; initials: string; colorScheme: string; role: Role }

const ROLES_LIST: { value: Role; icon: string; description: string }[] = [
  { value: 'Viewer',    icon: 'SAP-icons-v4/published',  description: 'Can only view published content' },
  { value: 'Organizer', icon: 'show',                    description: 'Can also view unpublished content' },
  { value: 'Editor',    icon: 'edit',                    description: 'Can also create and edit content' },
  { value: 'Manager',   icon: 'SAP-icons-v4/file-move',  description: 'Can also move and delete unpublished content' },
  { value: 'Publisher', icon: 'world',                   description: 'Can also publish content and delete it' },
]

const OBJECTIVES_ROLES_LIST: { value: Role; icon: string; description: string }[] = [
  { value: 'Editor',  icon: 'edit',    description: 'Can also create and edit content' },
  { value: 'Manager', icon: 'key-user-settings', description: 'Can also delete content, and manage access' },
]

const DATA_MGMT_ROLES_LIST: { value: Role; icon: string; description: string }[] = [
  { value: 'Viewer',  icon: 'show',    description: 'Can only view content' },
  { value: 'Editor',  icon: 'edit',    description: 'Can also create and edit content' },
  { value: 'Manager', icon: 'key-user-settings', description: 'Can also move and delete content, and manage access' },
]

const DICT_ROLES_LIST: { value: Role; icon: string; description: string }[] = [
  { value: 'Viewer',    icon: 'show',    description: 'Can view content' },
  { value: 'Editor',    icon: 'edit',    description: 'Can also create and edit content' },
  { value: 'Manager',   icon: 'key-user-settings', description: 'Can also move and delete content' },
  { value: 'Publisher', icon: 'world',   description: 'Can also publish content' },
]

const TEMPLATES_ROLES_LIST: { value: Role; icon: string; description: string }[] = [
  { value: 'Viewer',  icon: 'show',                   description: 'Can view content' },
  { value: 'Editor',  icon: 'edit',                   description: 'Can also create and edit content' },
  { value: 'Manager', icon: 'SAP-icons-v4/file-move', description: 'Can also move and delete content' },
]

// Dict category avatar helpers
const DICT_REMOVE_WARNING = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>When you remove access, users can still see dictionary entries when they are used in diagrams.</Text>
    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>They won't see any dictionary categories listed anywhere and dictionary entries won't be included in search results.</Text>
    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Modelers won't be able to use any dictionary entries when creating diagrams.</Text>
  </div>
)

const DICT_TYPE_ICON_MAP: Record<string, string> = {
  'Organization': 'SAP-icons-v4/organization', 'Document': 'document',
  'Activity': 'SAP-icons-v4/activity', 'Event': 'SAP-icons-v4/start-event',
  'IT System': 'SAP-icons-v4/computer', 'Goal': 'goal', 'Requirement': 'checklist',
  'Risk': 'SAP-icons-v4/risk', 'Control': 'SAP-icons-v4/overlay-risk-control',
  'Others': 'SAP-icons-v4/process-manager', 'Processes': 'SAP-icons-v4/process-manager',
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type ResourceNode = {
  id: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectType: any
  typeName: string
  subRows?: ResourceNode[]
}

const sortSubRows = (rows: ResourceNode[]): ResourceNode[] => {
  const folders = rows.filter(r => r.typeName === 'Folder').sort((a, b) => a.name.localeCompare(b.name))
  const assets  = rows.filter(r => r.typeName !== 'Folder').sort((a, b) => a.name.localeCompare(b.name))
  return [...folders, ...assets]
}

const TREE_DATA: ResourceNode[] = [
  {
    id: 'repo', name: 'Data Management Files', objectType: 'Folder' as never, typeName: 'Folder',
    subRows: sortSubRows([
      {
        id: 'connections', name: 'Connections', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'conn-s4', name: 'SAP S/4HANA Cloud', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'conn-ariba', name: 'SAP Ariba', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'conn-jdbc1', name: 'JDBC Connection Finance', objectType: 'Connection' as never, typeName: 'Connection' },
          { id: 'conn-jdbc2', name: 'JDBC Connection HR', objectType: 'Connection' as never, typeName: 'Connection' },
          { id: 'conn-odata', name: 'OData Service Procurement', objectType: 'Connection' as never, typeName: 'Connection' },
        ]),
      },
      {
        id: 'extractors', name: 'On-Prem Extractors', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'ext-test', name: 'Test', objectType: 'Extractor' as never, typeName: 'On-Premises Extractor' },
          { id: 'ext-test1', name: 'Test 1', objectType: 'Extractor' as never, typeName: 'On-Premises Extractor' },
          { id: 'ext-prod', name: 'Production', objectType: 'Extractor' as never, typeName: 'On-Premises Extractor' },
        ]),
      },
      {
        id: 'pipelines', name: 'Process Data Pipelines', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'pip-sub-fin', name: 'Finance', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'pip-sub-proc', name: 'Procurement', objectType: 'Folder' as never, typeName: 'Folder' },
        ]),
      },
      {
        id: 'sourcedata', name: 'Source Data', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'src-s4h', name: 'source-to-pay_procure-to-pay_s4h', objectType: 'Source Data' as never, typeName: 'Source Data' },
          { id: 'src-val', name: '[val][2024.05.18] Invoice-to-Pay VIM+ECC', objectType: 'Source Data' as never, typeName: 'Source Data' },
          { id: 'src-mfg', name: 'plan-to-fulfill_operate-manufacturing_dm', objectType: 'Source Data' as never, typeName: 'Source Data' },
        ]),
      },
      { id: 'repo-invoice', name: 'Invoice-to-Pay (Cross Mining)', objectType: 'Process Data Pipeline' as never, typeName: 'Process Data Pipeline' },
      { id: 'repo-proc2pay', name: 'Procure-to-Pay (SAP S/4HANA)', objectType: 'Process Data Pipeline' as never, typeName: 'Process Data Pipeline' },
      { id: 'repo-operate-mfg', name: 'Operate Manufacturing', objectType: 'Process Data Pipeline' as never, typeName: 'Process Data Pipeline' },
      { id: 'repo-plan-fulfill', name: 'Plan-to-Fulfill', objectType: 'Process Data Pipeline' as never, typeName: 'Process Data Pipeline' },
      { id: 'repo-ext-billing', name: 'External Billing', objectType: 'Process Data Pipeline' as never, typeName: 'Process Data Pipeline' },
      { id: 'repo-test', name: 'Test', objectType: 'Folder' as never, typeName: 'Folder' },
      { id: 'repo-untitled', name: 'Untitled Folder', objectType: 'Folder' as never, typeName: 'Folder' },
    ]),
  },
  {
    id: 'shared', name: 'Modeling Files', objectType: 'Folder' as never, typeName: 'Folder',
    subRows: sortSubRows([
      {
        id: 'shared-processes', name: 'Process Models', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'sp-sub-finance', name: 'Finance & Accounting', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'sp-sub-hr', name: 'Human Resources', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'sp-sub-procurement', name: 'Procurement', objectType: 'Folder' as never, typeName: 'Folder' },
          { id: 'sp-accts-payable', name: '[Before Automation] Accounts Payable', objectType: 'Process Model' as never, typeName: 'Process Model' },
          { id: 'sp-credit-mgmt', name: '[As-Is: Current State] Credit Management', objectType: 'Process Model' as never, typeName: 'Process Model' },
          { id: 'sp-hiring', name: 'Hiring Process [As-Is Analysis]', objectType: 'Process Model' as never, typeName: 'Process Model' },
        ]),
      },
      {
        id: 'shared-valuechains', name: 'Value Chains', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'vc-order-mgmt', name: 'Order Management', objectType: 'Value Chain' as never, typeName: 'Value Chain' },
          { id: 'vc-supply', name: 'Supply Chain Excellence', objectType: 'Value Chain' as never, typeName: 'Value Chain' },
        ]),
      },
      {
        id: 'shared-journeys', name: 'Journey Models', objectType: 'Folder' as never, typeName: 'Folder',
        subRows: sortSubRows([
          { id: 'jm-employee', name: 'Employee Onboarding Journey', objectType: 'Customer Journey' as never, typeName: 'Customer Journey Map' },
          { id: 'jm-supplier', name: 'Supplier Onboarding Journey', objectType: 'Customer Journey' as never, typeName: 'Customer Journey Map' },
        ]),
      },
      { id: 'shared-proc2pay', name: 'Procure-to-Pay', objectType: 'Process Model' as never, typeName: 'Process Model' },
      { id: 'shared-order2cash', name: 'Order-to-Cash', objectType: 'Process Model' as never, typeName: 'Process Model' },
      { id: 'shared-lead2cash', name: 'Lead-to-Cash End-to-End Journey', objectType: 'Process Model' as never, typeName: 'Process Model' },
      { id: 'shared-hire2retire', name: 'Hire-to-Retire', objectType: 'Process Model' as never, typeName: 'Process Model' },
      { id: 'shared-source2pay', name: 'Source-to-Pay Value Chain', objectType: 'Value Chain' as never, typeName: 'Value Chain' },
      { id: 'shared-custjourney', name: 'Customer Onboarding Journey', objectType: 'Customer Journey' as never, typeName: 'Customer Journey Map' },
      { id: 'shared-accounts-recv', name: 'Accounts Receivables', objectType: 'Folder' as never, typeName: 'Folder' },
      { id: 'shared-cash-coll', name: 'Cash Collection', objectType: 'Folder' as never, typeName: 'Folder' },
    ]),
  },
  {
    id: 'objectives', name: 'Objectives', objectType: 'Business Goal' as never, typeName: '',
    subRows: sortSubRows([
      { id: 'obj-reduce-cost', name: 'Reduce Operational Cost', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-increase-rev', name: 'Increase Revenue by 15%', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-customer-sat', name: 'Improve Customer Satisfaction', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-compliance', name: 'Ensure Regulatory Compliance', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-digital-transform', name: 'Accelerate Digital Transformation', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-sustainability', name: 'Achieve Sustainability Targets', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-talent', name: 'Strengthen Talent Acquisition', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-supply-chain', name: 'Optimize Supply Chain Resilience', objectType: 'Business Goal' as never, typeName: 'Objective' },
      { id: 'obj-ttm', name: 'Reduce Time-to-Market by 30%', objectType: 'Business Goal' as never, typeName: 'Objective' },
    ]),
  },
  {
    id: 'proc-doc-templates', name: 'Process Documentation Templates', objectType: 'Print Template' as never, typeName: '',
    subRows: sortSubRows([
      { id: 'pdt-standard-bpmn', name: 'Standard BPMN Template', objectType: 'Print Template' as never, typeName: 'Process Documentation Template' },
      { id: 'pdt-approval-flow', name: 'Approval Process Template', objectType: 'Print Template' as never, typeName: 'Process Documentation Template' },
      { id: 'pdt-incident-mgmt', name: 'Incident Management Template', objectType: 'Print Template' as never, typeName: 'Process Documentation Template' },
      { id: 'pdt-onboarding', name: 'Employee Onboarding Template', objectType: 'Print Template' as never, typeName: 'Process Documentation Template' },
      { id: 'pdt-value-chain', name: 'Value Chain Template', objectType: 'Print Template' as never, typeName: 'Process Documentation Template' },
    ]),
  },
  {
    id: 'proc-semantic-views', name: 'Process Semantic Views', objectType: 'Process Model' as never, typeName: '',
    subRows: sortSubRows([
      { id: 'psv-order-cash', name: 'Order-to-Cash Semantic View', objectType: 'Process Model' as never, typeName: 'Process Semantic View' },
      { id: 'psv-hire-retire', name: 'Hire-to-Retire Semantic View', objectType: 'Process Model' as never, typeName: 'Process Semantic View' },
      { id: 'psv-source-pay', name: 'Source-to-Pay Semantic View', objectType: 'Process Model' as never, typeName: 'Process Semantic View' },
      { id: 'psv-record-report', name: 'Record-to-Report Semantic View', objectType: 'Process Model' as never, typeName: 'Process Semantic View' },
    ]),
  },
]



const SHARED_ENTRIES: AccessEntry[] = [
  { id: 'g1', isGroup: true,  name: 'Administrators',    initials: 'AD', colorScheme: 'Accent1', role: 'Publisher' },
  { id: 'g2', isGroup: true,  name: 'Content Managers',  initials: 'CM', colorScheme: 'Accent7', role: 'Manager' },
  { id: 'u1', isGroup: false, name: 'Claire Westfield',  email: 's.kaim.1@example.com',                      initials: 'CW', colorScheme: 'Accent2', role: 'Editor' },
  { id: 'u2', isGroup: false, name: 'Hannah Schwan',     email: 'hannah.schwan@example.com',                  initials: 'HS', colorScheme: 'Accent3', role: 'Viewer' },
  { id: 'u3', isGroup: false, name: 'Sebastian Kaim',    email: 's.kaim.2@example.com',                       initials: 'SK', colorScheme: 'Accent4', role: 'Viewer' },
  { id: 'u4', isGroup: false, name: 'Davi Batista',      email: 'davi.batista@example.com',               initials: 'DB', colorScheme: 'Accent5', role: 'Publisher' },
  { id: 'u5', isGroup: false, name: 'Charne Pearson',    email: 'charne.elizabeth.pearson@example.com',        initials: 'CP', colorScheme: 'Accent6', role: 'Manager' },
]

const TEMPLATES_ENTRIES: AccessEntry[] = [
  { id: 'g1', isGroup: true,  name: 'Administrators',    initials: 'AD', colorScheme: 'Accent1', role: 'Manager' },
  { id: 'g2', isGroup: true,  name: 'Content Managers',  initials: 'CM', colorScheme: 'Accent7', role: 'Manager' },
  { id: 'u1', isGroup: false, name: 'Claire Westfield',  email: 's.kaim.1@example.com',                      initials: 'CW', colorScheme: 'Accent2', role: 'Editor' },
  { id: 'u2', isGroup: false, name: 'Hannah Schwan',     email: 'hannah.schwan@example.com',                  initials: 'HS', colorScheme: 'Accent3', role: 'Viewer' },
  { id: 'u3', isGroup: false, name: 'Sebastian Kaim',    email: 's.kaim.2@example.com',                       initials: 'SK', colorScheme: 'Accent4', role: 'Viewer' },
  { id: 'u4', isGroup: false, name: 'Davi Batista',      email: 'davi.batista@example.com',               initials: 'DB', colorScheme: 'Accent5', role: 'Manager' },
  { id: 'u5', isGroup: false, name: 'Charne Pearson',    email: 'charne.elizabeth.pearson@example.com',        initials: 'CP', colorScheme: 'Accent6', role: 'Manager' },
]

const REPO_ENTRIES: AccessEntry[] = [
  { id: 'g1', isGroup: true,  name: 'Administrators',         initials: 'AD', colorScheme: 'Accent1', role: 'Manager' },
  { id: 'g2', isGroup: true,  name: 'Content Administrators', initials: 'CA', colorScheme: 'Accent7', role: 'Editor' },
  { id: 'u6', isGroup: false, name: 'Lars Kreuzmann',         email: 'lars.kreuzmann@example.com',       initials: 'LK', colorScheme: 'Accent3', role: 'Editor' },
  { id: 'u7', isGroup: false, name: 'Philip Miseldine',       email: 'philip.miseldine@example.com',     initials: 'PM', colorScheme: 'Accent5', role: 'Viewer' },
]

const OBJ_ENTRIES: AccessEntry[] = [
  { id: 'g1', isGroup: true,  name: 'Administrators',    initials: 'AD', colorScheme: 'Accent1', role: 'Manager' },
  { id: 'g3', isGroup: true,  name: 'Process Owners',    initials: 'PO', colorScheme: 'Accent3', role: 'Editor' },
  { id: 'u1', isGroup: false, name: 'Claire Westfield',  email: 's.kaim.1@example.com',                      initials: 'CW', colorScheme: 'Accent2', role: 'Manager' },
  { id: 'u2', isGroup: false, name: 'Hannah Schwan',     email: 'hannah.schwan@example.com',                  initials: 'HS', colorScheme: 'Accent3', role: 'Editor' },
  { id: 'u3', isGroup: false, name: 'Sebastian Kaim',    email: 's.kaim.2@example.com',                       initials: 'SK', colorScheme: 'Accent4', role: 'Viewer' },
  { id: 'u5', isGroup: false, name: 'Charne Pearson',    email: 'charne.elizabeth.pearson@example.com',        initials: 'CP', colorScheme: 'Accent6', role: 'Editor' },
  { id: 'u8', isGroup: false, name: 'Joerg Goeppert',    email: 'joerg.goeppert@example.com',                 initials: 'JG', colorScheme: 'Accent7', role: 'Editor' },
]

const DICT_ENTRIES: AccessEntry[] = [
  { id: 'g1', isGroup: true,  name: 'Administrators',   initials: 'AD', colorScheme: 'Accent1', role: 'Publisher' },
  { id: 'g3', isGroup: true,  name: 'Process Owners',   initials: 'PO', colorScheme: 'Accent3', role: 'Editor' },
  { id: 'u1', isGroup: false, name: 'Claire Westfield', email: 's.kaim.1@example.com',          initials: 'CW', colorScheme: 'Accent2', role: 'Publisher' },
  { id: 'u2', isGroup: false, name: 'Hannah Schwan',    email: 'hannah.schwan@example.com',      initials: 'HS', colorScheme: 'Accent3', role: 'Editor' },
  { id: 'u5', isGroup: false, name: 'Charne Pearson',   email: 'charne.elizabeth.pearson@example.com', initials: 'CP', colorScheme: 'Accent6', role: 'Viewer' },
]

const DEFAULT_ENTRIES: Record<string, AccessEntry[]> = {
  // Root nodes
  repo: REPO_ENTRIES,
  shared: SHARED_ENTRIES,
  objectives: OBJ_ENTRIES,
  'obj-reduce-cost': OBJ_ENTRIES, 'obj-increase-rev': OBJ_ENTRIES, 'obj-customer-sat': OBJ_ENTRIES,
  'obj-compliance': OBJ_ENTRIES, 'obj-digital-transform': OBJ_ENTRIES, 'obj-sustainability': OBJ_ENTRIES,
  'obj-talent': OBJ_ENTRIES, 'obj-supply-chain': OBJ_ENTRIES, 'obj-ttm': OBJ_ENTRIES,
  // Modeling Files children (level 2)
  connections: REPO_ENTRIES, extractors: REPO_ENTRIES, pipelines: REPO_ENTRIES, sourcedata: REPO_ENTRIES,
  'repo-invoice': REPO_ENTRIES, 'repo-proc2pay': REPO_ENTRIES, 'repo-operate-mfg': REPO_ENTRIES,
  'repo-plan-fulfill': REPO_ENTRIES, 'repo-ext-billing': REPO_ENTRIES, 'repo-test': REPO_ENTRIES, 'repo-untitled': REPO_ENTRIES,
  // Data Management children (level 3)
  'conn-s4': REPO_ENTRIES, 'conn-ariba': REPO_ENTRIES, 'conn-jdbc1': REPO_ENTRIES, 'conn-jdbc2': REPO_ENTRIES, 'conn-odata': REPO_ENTRIES,
  'ext-test': REPO_ENTRIES, 'ext-test1': REPO_ENTRIES, 'ext-prod': REPO_ENTRIES,
  'pip-sub-fin': REPO_ENTRIES, 'pip-sub-proc': REPO_ENTRIES,
  'src-s4h': REPO_ENTRIES, 'src-val': REPO_ENTRIES, 'src-mfg': REPO_ENTRIES,
  // Modeling Files children (level 2)
  'shared-processes': SHARED_ENTRIES, 'shared-valuechains': SHARED_ENTRIES, 'shared-journeys': SHARED_ENTRIES,
  'shared-proc2pay': SHARED_ENTRIES, 'shared-order2cash': SHARED_ENTRIES, 'shared-lead2cash': SHARED_ENTRIES,
  'shared-hire2retire': SHARED_ENTRIES, 'shared-source2pay': SHARED_ENTRIES, 'shared-custjourney': SHARED_ENTRIES,
  'shared-accounts-recv': SHARED_ENTRIES, 'shared-cash-coll': SHARED_ENTRIES,
  // Process Documentation Templates
  'proc-doc-templates': TEMPLATES_ENTRIES,
  'pdt-standard-bpmn': TEMPLATES_ENTRIES, 'pdt-approval-flow': TEMPLATES_ENTRIES, 'pdt-incident-mgmt': TEMPLATES_ENTRIES,
  'pdt-onboarding': TEMPLATES_ENTRIES, 'pdt-value-chain': TEMPLATES_ENTRIES,
  // Process Semantic Views
  'proc-semantic-views': OBJ_ENTRIES,
  'psv-order-cash': OBJ_ENTRIES, 'psv-hire-retire': OBJ_ENTRIES, 'psv-source-pay': OBJ_ENTRIES, 'psv-record-report': OBJ_ENTRIES,
}

// ─── Role Dropdown (same style as ShareDialog) ────────────────────────────────
function RoleDropdown({ entryId, role, onChangeRole, onRemove, onLimitAccess, objectivesMode, dataManagementMode, dictionaryMode, templatesMode }: {
  entryId: string; role: Role; objectivesMode?: boolean; dataManagementMode?: boolean; dictionaryMode?: boolean; templatesMode?: boolean
  onChangeRole: (id: string, role: Role) => void
  onRemove: (id: string) => void
  onLimitAccess?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const btnId = `role-btn-${entryId}`
  const visibleRoles = dictionaryMode ? DICT_ROLES_LIST : dataManagementMode ? DATA_MGMT_ROLES_LIST : templatesMode ? TEMPLATES_ROLES_LIST : objectivesMode ? OBJECTIVES_ROLES_LIST : ROLES_LIST
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button id={btnId} design="Transparent" endIcon="slim-arrow-down" onClick={() => setOpen(v => !v)}>
          {role}
        </Button>
      </div>
      <Popover opener={btnId} open={open} onClose={() => setOpen(false)} placement="Bottom" horizontalAlign="End" hideArrow className="no-padding-popover">
        <List separators="None" style={{ minWidth: '300px' }}>
          {visibleRoles.map(r => (
            <ListItemCustom key={r.value} type="Active" selected={role === r.value} onClick={() => { onChangeRole(entryId, r.value); setOpen(false) }} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                <Icon name={r.icon} style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                <div>
                  <Text style={{ fontWeight: '600', display: 'block' }}>{r.value}</Text>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{r.description}</Text>
                </div>
              </div>
            </ListItemCustom>
          ))}
          {onLimitAccess && (
            <>
              <div style={{ height: '1px', background: 'var(--sapList_BorderColor)' }} />
              <ListItemCustom type="Active" onClick={() => { onLimitAccess(entryId); setOpen(false) }} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  <Icon name="permission" style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                  <Text style={{ fontWeight: '600', display: 'block' }}>Limit Access</Text>
                </div>
              </ListItemCustom>
            </>
          )}
          <ListItemCustom type="Active" onClick={() => { onRemove(entryId); setOpen(false) }} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
              <Icon name="delete" style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapNegativeTextColor)' }} />
              <Text style={{ color: 'var(--sapNegativeTextColor)', display: 'block' }}>Remove Access</Text>
            </div>
          </ListItemCustom>
        </List>
      </Popover>
    </>
  )
}

// ─── Limit Access Dialog ──────────────────────────────────────────────────────

type LimitItem = { id: string; name: string; typeName: string; objectType: string; _dictCat?: any }

function LimitAccessDialog({ open, folderName, items, preSelected, onLimit, onClose, isDictionary, isFolder, entryName, entryIsGroup }: {
  open: boolean
  folderName: string
  items: LimitItem[]
  preSelected: Set<string>
  onLimit: (selected: Set<string>) => void
  onClose: () => void
  isDictionary?: boolean
  isFolder?: boolean
  entryName?: string
  entryIsGroup?: boolean
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(preSelected))
  const [search, setSearch] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Reset when opened
  useState(() => { if (open) { setSelected(new Set(preSelected)); setSearch('') } })

  const allTypes = useMemo(() => [...new Set(items.map(i => i.typeName))].filter(Boolean).sort(), [items])

  const filtered = useMemo(() => items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  ), [items, search])

  const selectedRowIds = useMemo(() => {
    const ids: Record<string, boolean> = {}
    items.forEach(i => { if (selected.has(i.id)) ids[i.id] = true })
    return ids
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selected])

  const limitColumns = useMemo(() => [
    {
      Header: 'Name', accessor: 'name', minWidth: 200,
      Cell: ({ row }: any) => {
        const item = row.original as LimitItem
        const dictCat = item._dictCat
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {dictCat ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: catBg(dictCat.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={DICT_TYPE_ICON_MAP[dictCat.type] ?? 'SAP-icons-v4/process-manager'} style={{ width: '12px', height: '12px', color: catIconColor(dictCat.type), fontSize: '12px' }} />
              </div>
            ) : (item.id === 'proc-doc-templates' || item.id.startsWith('pdt-')) ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="document-text" style={{ width: '14px', height: '14px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '14px' }} />
              </div>
            ) : (item.id === 'proc-semantic-views' || item.id.startsWith('psv-')) ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="SAP-icons-v4/process-data-view" style={{ width: '14px', height: '14px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '14px' }} />
              </div>
            ) : (
              <SigDomainObject object={item.objectType as never} size="XXS" />
            )}
            <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>{item.name}</div>
          </div>
        )
      },
    },
    ...(isDictionary ? [] : [{
      Header: 'Type', accessor: 'typeName', width: 200, minWidth: 120,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{value}</Text>,
      Filter: ({ column }: any) => (
        <MultiComboBox
          placeholder="Filter by Type"
          onSelectionChange={(e: any) => {
            const sel = (e.detail?.items as any[]) ?? []
            const vals = sel.map((i: any) => i.text).filter(Boolean)
            column.setFilter(vals.length > 0 ? vals : undefined)
          }}
        >
          {allTypes.map(t => (
            <MultiComboBoxItem key={t} text={t} selected={(column.filterValue ?? []).includes(t)} />
          ))}
        </MultiComboBox>
      ),
      filter: 'multiSelect',
    }]),
  ], [allTypes, isDictionary])

  return (
    <Dialog open={open} onClose={onClose} style={{ width: '800px' }} headerText={`Limit Access Rights for ${isFolder ? 'Folder ' : ''}${folderName}`} className="no-padding-dialog">
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <MessageStrip design="Information" hideCloseButton>
          Limiting allows you to remove the access right from {isFolder ? <>the folder <strong>{folderName}</strong></> : <strong>{folderName}</strong>} and limit access to the items selected below for the {entryIsGroup ? 'user group' : 'user'} <strong>{entryName}</strong>.
        </MessageStrip>
      </div>
      <div style={{ marginTop: '16px' }}>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>{folderName} ({items.length})</Title>
          </ToolbarItem>
        }
        searchSlot={
          <ToolbarItem>
            <Input
              placeholder="Search"
              value={search}
              showClearIcon
              style={{ width: '220px' }}
              onInput={e => setSearch((e.target as any).value)}
            />
          </ToolbarItem>
        }
      >
        <AnalyticalTable
          data={filtered}
          columns={limitColumns}
          minRows={0}
          visibleRows={8}
          scaleWidthMode="Grow"
          selectionMode="Multiple"
          reactTableOptions={{
            getRowId: (row: any) => row.id,
            autoResetSelectedRows: false,
            autoResetFilters: false,
            autoResetSortBy: false,
            filterTypes: {
              multiSelect: (rows: any[], _id: string, filterValue: string[]) =>
                rows.filter(r => !filterValue?.length || filterValue.includes(r.values.typeName)),
            },
          }}
          selectedRowIds={selectedRowIds}
          onRowSelect={(e: any) => {
            const ids = e.detail?.selectedRowIds ?? {}
            setSelected(new Set(Object.keys(ids).filter(id => ids[id])))
          }}
        />
      </SigTableWrapper>
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Emphasized" disabled={selected.size === 0} onClick={() => setConfirmOpen(true)}>Limit</Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
      </Bar>

      <MessageBox
        open={confirmOpen}
        type="Warning"
        titleText="Limit Access"
        actions={['Limit', 'Cancel']}
        emphasizedAction="Limit"
        style={{ width: isDictionary ? '560px' : '520px' }}
        onClose={(action) => {
          if (action === 'Limit') { onLimit(selected); onClose() }
          setConfirmOpen(false)
        }}
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Text>
            {isFolder
              ? <>Do you want to remove the access from the folder <strong>{folderName}</strong> and limit it to the selected items for {entryIsGroup ? 'user group' : 'user'} <strong>{entryName}</strong>?</>
              : <>Do you want to remove the access from <strong>{folderName}</strong> and limit it to the selected items for {entryIsGroup ? 'user group' : 'user'} <strong>{entryName}</strong>?</>
            }
          </Text>
          {isDictionary && DICT_REMOVE_WARNING}
        </div>
      </MessageBox>
    </Dialog>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContentAccess() {
  const { dictCategories } = useWorkspace()

  // Build dictionary tree from context
  const dictTree = useMemo((): ResourceNode => {
    const roots = dictCategories.filter(c => !c.parentId)
    const children = (parentId: string): ResourceNode[] =>
      dictCategories
        .filter(c => c.parentId === parentId)
        .map(c => ({
          id: `dict-${c.id}`,
          name: c.name,
          objectType: 'dict' as never,
          typeName: c.type,
          _dictCat: c,
          subRows: children(c.id),
        } as ResourceNode & { _dictCat: typeof c }))
    return {
      id: 'dictionary',
      name: 'Dictionary',
      objectType: 'Folder' as never,
      typeName: 'Folder',
      subRows: roots.map(c => ({
        id: `dict-${c.id}`,
        name: c.name,
        objectType: 'dict' as never,
        typeName: c.type,
        _dictCat: c,
        subRows: children(c.id),
      } as ResourceNode & { _dictCat: typeof c })),
    }
  }, [dictCategories])

  // Extend DEFAULT_ENTRIES with dict category entries
  const allDefaultEntries = useMemo(() => {
    const dictIds: Record<string, AccessEntry[]> = {}
    const addEntries = (cats: typeof dictCategories) => {
      cats.forEach(c => { dictIds[`dict-${c.id}`] = DICT_ENTRIES })
    }
    addEntries(dictCategories)
    dictIds['dictionary'] = DICT_ENTRIES
    return { ...DEFAULT_ENTRIES, ...dictIds }
  }, [dictCategories])

  const fullTreeData = useMemo(() => {
    const all = [...TREE_DATA, dictTree]
    // Explicit order: Data Management, Modeling Files, Dictionary, then non-folders (Objectives etc.)
    const folders = all.filter(n => n.typeName === 'Folder' && n.id !== 'dictionary').sort((a, b) => a.name.localeCompare(b.name))
    const dictionary = all.filter(n => n.id === 'dictionary')
    const nonFolders = all.filter(n => n.typeName !== 'Folder').sort((a, b) => a.name.localeCompare(b.name))
    return [...folders, ...dictionary, ...nonFolders]
  }, [dictTree])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [accessData, setAccessData] = useState<Record<string, AccessEntry[]>>(allDefaultEntries)
  const [search, setSearch] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSelectedUsers, setAddSelectedUsers] = useState<string[]>([])
  const [addInputValue, setAddInputValue] = useState('')
  const [addShowSuggestions, setAddShowSuggestions] = useState(false)
  const [addRole, setAddRole] = useState<Role>('Viewer')
  const [addRolePopoverOpen, setAddRolePopoverOpen] = useState(false)
  const addRoleSelectRef = useRef<any>(null)

  const addFilteredSuggestions = SUGGESTION_USERS.filter(u =>
    !addSelectedUsers.includes(u.id) &&
    (u.name.toLowerCase().includes(addInputValue.toLowerCase()) || u.email.toLowerCase().includes(addInputValue.toLowerCase()))
  )
  // limitState: { [nodeId]: { [entryId]: Set<itemId> } }
  const [limitState, setLimitState] = useState<Record<string, Record<string, Set<string>>>>({})
  const [limitDialogEntry, setLimitDialogEntry] = useState<{ entryId: string; nodeId: string } | null>(null)
  const [actionToast, setActionToast] = useState<string | null>(null)
  const [limitError, setLimitError] = useState(false)

  const layout = selectedId ? 'TwoColumnsMidExpanded' : 'OneColumn'

  const findNode = (nodes: ResourceNode[], id: string): ResourceNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.subRows) { const found = findNode(n.subRows, id); if (found) return found }
    }
    return undefined
  }

  const findParentNode = (nodes: ResourceNode[], id: string, parent?: ResourceNode): ResourceNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return parent
      if (n.subRows) { const found = findParentNode(n.subRows, id, n); if (found !== undefined) return found }
    }
    return undefined
  }

  const selectedNode = selectedId ? findNode(fullTreeData, selectedId) : null
  const parentNode = selectedId ? findParentNode(fullTreeData, selectedId) : null

  const entries = selectedId ? (accessData[selectedId] ?? []) : []

  const changeRole = (entryId: string, role: Role) => {
    setAccessData(prev => ({ ...prev, [selectedId!]: prev[selectedId!].map(e => e.id === entryId ? { ...e, role } : e) }))
  }

  const [removeConfirm, setRemoveConfirm] = useState<{ entryId: string; name: string; isGroup: boolean } | null>(null)

  const removeEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId)
    if (entry) setRemoveConfirm({ entryId, name: entry.name, isGroup: entry.isGroup })
  }

  const confirmRemove = () => {
    if (!removeConfirm) return
    setAccessData(prev => ({ ...prev, [selectedId!]: prev[selectedId!].filter(e => e.id !== removeConfirm.entryId) }))
    setRemoveConfirm(null)
  }

  const openLimitDialog = (entryId: string) => {
    if (selectedId) setLimitDialogEntry({ entryId, nodeId: selectedId })
  }

  const applyLimit = (selected: Set<string>) => {
    if (!limitDialogEntry) return
    // Simulate backend error ~20% of the time
    if (Math.random() < 0.2) { setLimitError(true); return }
    setLimitError(false)
    const { nodeId, entryId } = limitDialogEntry
    // Store the limit state
    setLimitState(prev => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), [entryId]: selected }
    }))
    // Remove the entry from the parent folder's access list
    setAccessData(prev => ({
      ...prev,
      [nodeId]: (prev[nodeId] ?? []).filter(e => e.id !== entryId)
    }))
    // Add the entry to each selected sub-item
    selected.forEach(itemId => {
      setAccessData(prev => {
        const existingEntries = prev[itemId] ?? []
        const alreadyExists = existingEntries.some(e => e.id === entryId)
        if (alreadyExists) return prev
        const parentEntries = prev[nodeId] ?? []
        const sourceEntry = parentEntries.find(e => e.id === entryId) ??
          (accessData[nodeId] ?? []).find(e => e.id === entryId)
        if (!sourceEntry) return prev
        return { ...prev, [itemId]: [...existingEntries, sourceEntry] }
      })
    })
    setActionToast('Access limited')
  }

  const getLimitedItems = (entryId: string): Set<string> | undefined =>
    selectedId ? limitState[selectedId]?.[entryId] : undefined

  // Items available for limiting = children of the selected node
  const limitableItems: LimitItem[] = selectedNode?.subRows?.map(n => ({
    id: n.id, name: n.name, typeName: n.typeName, objectType: n.objectType,
    _dictCat: (n as any)._dictCat,
  })) ?? []

  const isObjectivesNode = selectedId
    ? (selectedId === 'objectives' || selectedId === 'proc-semantic-views' ||
       (findNode(fullTreeData.find(n => n.id === 'objectives')?.subRows ?? [], selectedId) !== undefined) ||
       (findNode(fullTreeData.find(n => n.id === 'proc-semantic-views')?.subRows ?? [], selectedId) !== undefined))
    : false

  const isDataManagementNode = selectedId
    ? (selectedId === 'repo' || (findNode(fullTreeData.find(n => n.id === 'repo')?.subRows ?? [], selectedId) !== undefined))
    : false

  const isDictionaryNode = selectedId
    ? (selectedId === 'dictionary' || selectedId.startsWith('dict-'))
    : false

  const isPrivateModelingNode = false

  const isTemplatesNode = selectedId
    ? (selectedId === 'proc-doc-templates' ||
       (findNode(fullTreeData.find(n => n.id === 'proc-doc-templates')?.subRows ?? [], selectedId) !== undefined))
    : false

  const currentRolesList = isDictionaryNode ? DICT_ROLES_LIST : isDataManagementNode ? DATA_MGMT_ROLES_LIST : isTemplatesNode ? TEMPLATES_ROLES_LIST : isObjectivesNode ? OBJECTIVES_ROLES_LIST : ROLES_LIST

  const filteredGroups = entries.filter(e => e.isGroup).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUsers = entries.filter(e => !e.isGroup).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Flat rows: header sentinel + actual entries interleaved
  type AccessRow = (AccessEntry & { _header?: false; _allUsers?: false }) | { id: string; _header: true; _label: string; name: string; email: undefined; role: undefined; isGroup: boolean; initials: string; colorScheme: string } | { id: string; _allUsers: true; _header?: false; name: string; email: undefined; role: Role; isGroup: boolean; initials: string; colorScheme: string }
  const accessTableData: AccessRow[] = [
    ...(isObjectivesNode ? [{ id: '__all_users', _allUsers: true as const, name: 'All Users of this Workspace', email: undefined, role: 'Viewer' as Role, isGroup: true, initials: '', colorScheme: '' }] : []),
    ...(filteredGroups.length > 0 ? [{ id: '__h_groups', _header: true as const, _label: 'User Groups', name: '', email: undefined, role: undefined, isGroup: true, initials: '', colorScheme: '' }, ...filteredGroups] : []),
    ...(filteredUsers.length > 0 ? [{ id: '__h_users', _header: true as const, _label: 'Individual Users', name: '', email: undefined, role: undefined, isGroup: false, initials: '', colorScheme: '' }, ...filteredUsers] : []),
  ]

  const accessColumns = [
    {
      Header: 'Name', accessor: 'name', minWidth: 160,
      Cell: ({ row }: any) => {
        const r = row.original as AccessRow
        if (r._header) return (
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_GroupHeaderTextColor, var(--sapList_HeaderTextColor))' }}>{r._label}</Text>
        )
        const r2 = r as any
        if (r2._allUsers) return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar icon="group" colorScheme="Accent10" size="XS" shape="Circle" style={{ flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600' }}>{r2.name}</Text>
          </div>
        )
        const e = r as AccessEntry
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {e.isGroup
              ? <Avatar icon="group" colorScheme="Accent10" size="XS" shape="Circle" style={{ flexShrink: 0 }} />
              : <Avatar initials={e.initials} colorScheme={e.colorScheme as never} size="XS" shape="Circle" style={{ flexShrink: 0 }} />
            }
            <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</Text>
          </div>
        )
      },
    },
    {
      Header: 'Mail', accessor: 'email', minWidth: 140,
      Cell: ({ row }: any) => {
        const r = row.original as AccessRow
        if (r._header) return null
        return <Text style={{ fontSize: 'var(--sapFontSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{(r as AccessEntry).email ?? ''}</Text>
      },
    },
    {
      Header: 'Access Right', accessor: 'role', width: 160, minWidth: 120,
      Cell: ({ row }: any) => {
        const r = row.original as AccessRow
        if (r._header) return null
        const r2 = r as any
        if (r2._allUsers) return <Text style={{ fontSize: 'var(--sapFontSize)' }}>{r2.role}</Text>
        const e = r as AccessEntry
        const isRootNode = fullTreeData.some(n => n.id === selectedId)
        const hasChildren = (selectedNode?.subRows?.length ?? 0) > 0
        const isInherited = !isRootNode && getLimitedItems(e.id) === undefined
        const canLimit = (selectedNode?.typeName === 'Folder' || selectedId === 'proc-doc-templates') && hasChildren && !isInherited && !isDataManagementNode && !isPrivateModelingNode
        return <RoleDropdown
          entryId={e.id} role={e.role}
          onChangeRole={changeRole} onRemove={removeEntry}
          onLimitAccess={canLimit ? openLimitDialog : undefined}
          objectivesMode={isObjectivesNode}
          dataManagementMode={isDataManagementNode}
          dictionaryMode={isDictionaryNode}
          templatesMode={isTemplatesNode}
        />
      },
    },
    ...(isObjectivesNode ? [] : [{
      Header: 'Inheritance', accessor: 'id', id: 'inheritance', minWidth: 160,
      Cell: ({ row }: any) => {
        const r = row.original as AccessRow
        if (r._header) return null
        const isRootNode = fullTreeData.some(n => n.id === selectedId)
        if (isRootNode) return null
        return <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapLinkColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>Inherited from {parentNode?.name ?? selectedNode?.name ?? '—'}</Text>
      },
    }]),
  ]

  const handleAdd = () => {
    if (addSelectedUsers.length === 0 || !selectedId) return
    addSelectedUsers.forEach(uid => {
      const u = SUGGESTION_USERS.find(s => s.id === uid)
      if (!u) return
      setAccessData(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), { id: `u-${Date.now()}-${uid}`, isGroup: false, name: u.name, email: u.email, initials: u.initials, colorScheme: u.colorScheme, role: addRole }] }))
    })
    setAddSelectedUsers([]); setAddInputValue(''); setAddRole('Viewer'); setAddDialogOpen(false)
  }

  const treeColumns = [
    {
      Header: 'Name', accessor: 'name', minWidth: 160,
      Cell: ({ row }: any) => {
        const node = row.original as (ResourceNode & { _dictCat?: any }) | undefined
        if (!node) return null
        const dictCat = node._dictCat
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {dictCat ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: catBg(dictCat.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={DICT_TYPE_ICON_MAP[dictCat.type] ?? 'SAP-icons-v4/process-manager'} style={{ width: '12px', height: '12px', color: catIconColor(dictCat.type), fontSize: '12px' }} />
              </div>
            ) : node.id === 'dictionary' ? (
              <SigDomainObject object={'Dictionary Category' as never} size="XXS" />
            ) : (node.id === 'proc-doc-templates' || node.id.startsWith('pdt-')) ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="document-text" style={{ width: '14px', height: '14px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '14px' }} />
              </div>
            ) : (node.id === 'proc-semantic-views' || node.id.startsWith('psv-')) ? (
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="SAP-icons-v4/process-data-view" style={{ width: '14px', height: '14px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '14px' }} />
              </div>
            ) : (
              <SigDomainObject object={node.objectType} size="XXS" />
            )}
            <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>{node.name}</div>
          </div>
        )
      },
    },
    {
      Header: 'Type', accessor: 'typeName', width: 120, minWidth: 80,
      Cell: ({ row, value }: any) => {
        if (!row.original) return null
        if (row.original?.id === 'dictionary') return null
        const displayValue = (row.original as any)._dictCat ? 'Dictionary Category' : value
        return <Text style={{ fontSize: 'var(--sapFontSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{displayValue}</Text>
      },
    },
  ]

  return (
    <>
      <FlexibleColumnLayout
        layout={layout}
        layoutsConfiguration={{ desktop: { TwoColumnsMidExpanded: { layout: ['40%', '60%', '0'] } }, tablet: { TwoColumnsMidExpanded: { layout: ['40%', '60%', '0'] } } }}
        style={{ height: '100%', '--_ui5_fcl_separator_btn_display': 'none' } as React.CSSProperties}
        startColumn={
          <DynamicPage hidePinButton style={{ height: '100%' }} titleArea={
            <DynamicPageTitle>
              <Title slot="heading" level="H3">Resource Access</Title>
            </DynamicPageTitle>
          }>
            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>All Items</Title>
                </ToolbarItem>
              }
            >
              <AnalyticalTable
                data={fullTreeData}
                columns={treeColumns}
                isTreeTable
                minRows={0}
                visibleRows={50}
                style={{ height: '100%' }}
                scaleWidthMode="Grow"
                selectionMode="None"
                reactTableOptions={{ getRowId: (row: any) => row.id }}
                tableHooks={[
                  (hooks: any) => {
                    hooks.getRowProps.push((props: any, { row }: any) => {
                      const isSelected = row.original?.id === selectedId
                      return [props, {
                        style: {
                          ...props.style,
                          background: isSelected ? 'var(--sapList_SelectionBackgroundColor)' : undefined,
                          borderBottom: isSelected ? '1px solid var(--sapList_SelectionBorderColor)' : undefined,
                        }
                      }]
                    })
                  }
                ]}
                onRowClick={(e: any) => {
                  const id = e?.detail?.row?.original?.id
                  if (id) { setSelectedId(prev => prev === id ? null : id); setSearch('') }
                }}
                selectedRowIds={selectedId ? { [selectedId]: true } : {}}
              />
            </SigTableWrapper>
          </DynamicPage>
        }
        midColumn={
          selectedNode ? (
            <DynamicPage hidePinButton style={{ height: '100%' }} titleArea={
              <DynamicPageTitle>
                <Title slot="heading" level="H3">{selectedNode.name}</Title>
                <Toolbar slot="actionsBar" design="Transparent">
                  <ToolbarSpacer />
                  <ToolbarItem>
                    <Button icon="decline" design="Transparent" onClick={() => { setSelectedId(null); setSearch('') }} />
                  </ToolbarItem>
                </Toolbar>
              </DynamicPageTitle>
            }>
              {selectedNode.typeName === '' && selectedId !== 'proc-doc-templates' ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '24px' }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <IllustratedMessage
                      name="NoEntries"
                      titleText={`Select ${selectedNode.name.toLowerCase()} to manage access`}
                      subtitleText=" "
                    />
                  </div>
                </div>
              ) : (
              <>
              {limitError && (
                <div style={{ padding: '16px 0 32px' }}>
                  <MessageStrip design="Negative" onClose={() => setLimitError(false)} style={{ width: '100%' }}>
                    Access limitation failed
                  </MessageStrip>
                </div>
              )}
              <SigTableWrapper
                titleSlot={
                  <ToolbarItem>
                    <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Users with Access ({entries.length})</Title>
                  </ToolbarItem>
                }
                searchSlot={
                  <ToolbarItem>
                    <Input placeholder="Search for users with access" value={search} showClearIcon style={{ width: '220px' }} onInput={e => setSearch((e.target as any).value)} />
                  </ToolbarItem>
                }
                businessActionsSlot={
                  <ToolbarItem>
                    <Button design="Emphasized" icon="add" onClick={() => { setAddRole(currentRolesList[0].value); setAddDialogOpen(true) }}>Add Users</Button>
                  </ToolbarItem>
                }
              >
              <AnalyticalTable
                data={accessTableData}
                columns={accessColumns}
                minRows={0}
                visibleRows={20}
                scaleWidthMode="Grow"
                selectionMode="None"
              />
              </SigTableWrapper>
              </>
              )}
            </DynamicPage>
          ) : <div />
        }
      />

      <Dialog open={addDialogOpen} headerText="Add Users" onClose={() => setAddDialogOpen(false)} style={{ width: '480px' }} className="no-padding-dialog">
        <div style={{ padding: '1rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MultiInput
              placeholder={addSelectedUsers.length === 0 ? 'Search for name or email' : ''}
              value={addInputValue}
              onInput={(e: any) => { setAddInputValue(e.target.value ?? ''); setAddShowSuggestions(true) }}
              onFocus={() => setAddShowSuggestions(true)}
              onBlur={() => setTimeout(() => setAddShowSuggestions(false), 200)}
              style={{ width: '100%' }}
            >
              {addSelectedUsers.map(uid => {
                const u = SUGGESTION_USERS.find(s => s.id === uid)
                return u ? <Token key={uid} slot="tokens" text={u.name} {...{ onDelete: () => setAddSelectedUsers(prev => prev.filter(id => id !== uid)) } as any} /> : null
              })}
            </MultiInput>
            {addShowSuggestions && addInputValue && addFilteredSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--sapGroup_ContentBackground)', borderRadius: '8px', boxShadow: '0 0 0 1px rgba(34,54,73,0.48), 0 2px 8px rgba(34,54,73,0.3)', overflow: 'hidden', marginTop: '4px' }}>
                {addFilteredSuggestions.slice(0, 5).map(u => (
                  <div key={u.id} onMouseDown={() => { setAddSelectedUsers(prev => [...prev, u.id]); setAddInputValue(''); setAddShowSuggestions(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'white' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" shape="Circle" />
                    <div>
                      <Text style={{ fontWeight: '600', display: 'block', fontSize: 'var(--sapFontLargeSize)' }}>{u.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{u.email}</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Select
            id="add-role-select"
            ref={addRoleSelectRef}
            onOpen={(e: any) => { e.preventDefault(); e.stopPropagation(); if (addRoleSelectRef.current) addRoleSelectRef.current.open = false; setAddRolePopoverOpen(v => !v) }}
            style={{ minWidth: '120px', maxWidth: '120px' }}
          >
            <Option selected>{addRole}</Option>
          </Select>
          <Popover opener="add-role-select" open={addRolePopoverOpen} onClose={() => setAddRolePopoverOpen(false)} placement="Bottom" horizontalAlign="End" hideArrow className="no-padding-popover">
            <List separators="None" style={{ minWidth: '300px' }}>
              {currentRolesList.map(r => (
                <ListItemCustom key={r.value} type="Active" selected={addRole === r.value} onClick={() => { setAddRole(r.value); setAddRolePopoverOpen(false) }} style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                    <Icon name={r.icon} style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                    <div>
                      <Text style={{ fontWeight: '600', display: 'block' }}>{r.value}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{r.description}</Text>
                    </div>
                  </div>
                </ListItemCustom>
              ))}
            </List>
          </Popover>
        </div>        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={addSelectedUsers.length === 0} onClick={handleAdd}>Add</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {limitDialogEntry && (() => {
        const limitEntry = (accessData[limitDialogEntry.nodeId] ?? []).find(e => e.id === limitDialogEntry.entryId)
        return (
          <LimitAccessDialog
            open={!!limitDialogEntry}
            folderName={selectedNode?.name ?? ''}
            items={limitableItems}
            preSelected={limitState[limitDialogEntry.nodeId]?.[limitDialogEntry.entryId] ?? new Set()}
            onLimit={applyLimit}
            onClose={() => setLimitDialogEntry(null)}
            isDictionary={isDictionaryNode}
            isFolder={isDataManagementNode || (selectedNode?.typeName === 'Folder' && !isDictionaryNode)}
            entryName={limitEntry?.name}
            entryIsGroup={limitEntry?.isGroup}
          />
        )
      })()}
      <Toast open={!!actionToast} placement="BottomCenter" onClose={() => setActionToast(null)}>
        {actionToast}
      </Toast>

      <MessageBox
        open={!!removeConfirm}
        type="Warning"
        titleText="Remove Access"
        actions={['Remove', 'Cancel']}
        emphasizedAction="Remove"
        style={{ width: isDictionaryNode ? '560px' : '480px' }}
        onClose={(action) => {
          if (action === 'Remove') confirmRemove()
          else setRemoveConfirm(null)
        }}
      >
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Text>
            {removeConfirm?.isGroup
              ? `Do you want to remove the access from the user group "${removeConfirm?.name}"?`
              : `Do you want to remove the access from the user "${removeConfirm?.name}"?`
            }
          </Text>
          {isDictionaryNode && DICT_REMOVE_WARNING}
        </div>
      </MessageBox>
    </>
  )
}
