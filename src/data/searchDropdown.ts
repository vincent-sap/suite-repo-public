// Mock data for the ShellBar search dropdown (SearchDropdown.tsx).

export interface SearchDropdownItem {
  id: string
  name: string
  type: string
  folder: string
}

export const RECENT_ITEMS: SearchDropdownItem[] = [
  { id: '1', name: 'Order to Cash - End-to-End', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Core Processes' },
  { id: '2', name: "Bagi's test journey", type: 'Customer Journey', folder: 'My Documents' },
  { id: '3', name: 'Invoice Processing', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
  { id: '4', name: 'Procurement to Pay Value Chain', type: 'Value Chain', folder: 'Procurement' },
  { id: '5', name: 'Employee Offboarding', type: 'Business Process Diagram (BPMN 2.0)', folder: 'HR Processes' },
]

export const SEARCH_POOL: SearchDropdownItem[] = [
  { id: 'r1', name: 'Order to Cash - End-to-End', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Core Processes' },
  { id: 'r2', name: 'Invoice Processing', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
  { id: 'r3', name: 'Invoice Verification', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
  { id: 'r4', name: 'Customer Invoice Management Dashboard', type: 'Dashboard', folder: 'Finance Analytics' },
  { id: 'r5', name: 'Invoicing Terms', type: 'Dictionary Item', folder: 'Shared Documents' },
  { id: 'r6', name: 'Invoice to Cash Process', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
  { id: 'r7', name: 'Customer Onboarding', type: 'Customer Journey', folder: 'Sales' },
  { id: 'r8', name: 'Procurement to Pay Value Chain', type: 'Value Chain', folder: 'Procurement' },
  { id: 'r9', name: 'Employee Offboarding', type: 'Business Process Diagram (BPMN 2.0)', folder: 'HR Processes' },
  { id: 'r10', name: 'Revenue Recognition Process', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
  { id: 'r11', name: 'Order Management Dashboard', type: 'Dashboard', folder: 'Sales' },
  { id: 'r12', name: 'Accounts Payable Process', type: 'Business Process Diagram (BPMN 2.0)', folder: 'Finance' },
]

export const TYPE_FILTERS = [
  { value: 'all', label: 'All Types', count: 25 },
  { value: 'model', label: 'Models', count: 12 },
  { value: 'dashboard', label: 'Dashboards', count: 6 },
  { value: 'folder', label: 'Folders', count: 4 },
  { value: 'insight', label: 'Insights', count: 3 },
]

export const TYPE_OPTIONS = [
  { value: 'bpmn', label: 'BPMN 2.0 Process' },
  { value: 'journey', label: 'Customer Journey' },
  { value: 'value-chain', label: 'Value Chain' },
  { value: 'dmn', label: 'DMN Decision' },
  { value: 'navigation', label: 'Navigation Map' },
  { value: 'folder', label: 'Folder' },
  { value: 'file', label: 'File' },
]

export const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
]

export const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 90 days' },
]

export const VERSION_OPTIONS = [
  { value: 'latest', label: 'Latest only' },
  { value: 'all', label: 'All versions' },
]
