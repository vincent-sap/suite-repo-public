import type { PTMOwner } from './ptm'

export interface ActivityEntry {
  id: string
  objectId: string
  author: PTMOwner
  attribute: string
  newValue: string
  timestamp: string
  iconType: 'edit' | 'add'
}

// In-memory store keyed by objectId
const log: ActivityEntry[] = []

export function getLog(objectId: string): ActivityEntry[] {
  return log.filter(e => e.objectId === objectId)
}

export function addEntry(
  objectId: string,
  author: PTMOwner,
  attribute: string,
  newValue: string,
  iconType: 'edit' | 'add' = 'edit'
): void {
  log.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    objectId,
    author,
    attribute,
    newValue,
    timestamp: new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    }),
    iconType,
  })
}
