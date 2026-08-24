export const ITEMS = [
  { id: '1', name: 'Administrators', members: 4,  description: 'Full workspace access' },
  { id: '2', name: 'Editors',        members: 12, description: 'Can create and edit assets' },
  { id: '3', name: 'Viewers',        members: 38, description: 'Read-only access' },
  { id: '4', name: 'Guests',         members: 7,  description: 'Limited external access' },
]

export const ATTRIBUTES = [
  { id: '1', name: 'Name',        type: 'Single-Line Text', required: true,  enabled: true },
  { id: '2', name: 'Description', type: 'Multi-Line Text',  required: false, enabled: true },
  { id: '3', name: 'Status',      type: 'Selection',        required: false, enabled: true },
  { id: '4', name: 'Owner',       type: 'Single-Line Text', required: false, enabled: false },
]

export const RESOURCE_ITEMS = [
  { id: '1', name: 'BPMN 2.0',    type: 'Notation', status: 'Active',   owner: 'Maria Chen' },
  { id: '2', name: 'DMN 1.2',     type: 'Notation', status: 'Active',   owner: 'Tom Becker' },
  { id: '3', name: 'Objective',   type: 'Asset',    status: 'Active',   owner: 'Maria Chen' },
  { id: '4', name: 'Initiative',  type: 'Asset',    status: 'Inactive', owner: 'Sophie Müller' },
  { id: '5', name: 'Value Chain', type: 'Notation', status: 'Active',   owner: 'Tom Becker' },
  { id: '6', name: 'Dashboard',   type: 'Asset',    status: 'Active',   owner: 'Maria Chen' },
]

export const NAV_ITEMS = [
  { id: 'general',    label: 'General',    icon: 'settings' },
  { id: 'access',     label: 'Access',     icon: 'locked' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'advanced',   label: 'Advanced',   icon: 'wrench' },
]

export const SORT_OPTIONS = [
  { key: 'Name',  type: 'text' as const },
  { key: 'Type',  type: 'text' as const },
  { key: 'Owner', type: 'text' as const },
]

export function sortDirLabel(type: 'text' | 'date', dir: 'asc' | 'desc'): string {
  if (type === 'date') return dir === 'asc' ? 'Oldest First' : 'Newest First'
  return dir === 'asc' ? 'A–Z' : 'Z–A'
}
