export type ProcessLevelName = 'Category' | 'Process Group' | 'Process' | 'Activity' | 'Task'

export type ProcessStatus = 'Active' | 'In Review' | 'Draft' | 'Deprecated'

// Deviation of an element relative to the Global Process Standard, for a given active scope.
export type VariantDeviation = 'standard' | 'inherited' | 'added' | 'removed' | 'changed'

// A variant scope maps context-dimension ids to values, keyed by WorkspaceContext.contextDimensions
// (e.g. { 'ctx-2': 'Germany' }). Dimensions not listed act as wildcards.
export type VariantScope = Record<string, string>

// A scoped override of an element. Base element fields = the Global Process Standard;
// a matching variant overrides scalar fields and/or marks the element as added/removed for that scope.
export interface ProcessVariant {
  scope: VariantScope
  deviation: 'inherited' | 'added' | 'removed' | 'changed'
  // Overrides — omit a field to inherit the Global Standard value.
  name?: string
  description?: string
  processStatus?: ProcessStatus
  ownerId?: string
}

export interface ProcessElement {
  id: string
  hierarchyId: string
  name: string
  description: string
  level: 1 | 2 | 3 | 4 | 5
  parentId: string | null
  processType: 'Operating' | 'Management' | 'Support'
  status: ProcessStatus
  ownerId: string
  assetCount: number
  childCount: number
  variants?: ProcessVariant[]
  /** Additional parent IDs (same hierarchy) under which this element also appears as a stop. */
  referencedParentIds?: string[]
  /** All hierarchy IDs for this element across all contexts (primary first). Used to render multiple chips. */
  allHierarchyIds?: string[]
  /** Same-level element IDs that precede this one in a flow sequence. */
  predecessorIds?: string[]
  /** Same-level element IDs that follow this one in a flow sequence. */
  successorIds?: string[]
  /** Business function this element primarily belongs to (e.g. 'fn-proc', 'fn-sales'). */
  functionId?: string
}

// Configurable, admin-editable labels for the five hierarchy levels.
// Defaults to LEVEL_NAMES; levels 4–5 are BPMN-only (not rendered in landscape views).
export type ProcessLevelNames = Record<1 | 2 | 3 | 4 | 5, string>

export type ViewMode = 'explorer' | 'list'

export type DisplayLevel = 'l1' | 'l2' | 'l3'

export interface ViewVariant {
  id: string
  name: string
  hierarchyId: string
  displayLevel: DisplayLevel
  byFunction: boolean
  selectedL1Ids: string[]
}

export const LEVEL_NAMES: Record<number, ProcessLevelName> = {
  1: 'Category',
  2: 'Process Group',
  3: 'Process',
  4: 'Activity',
  5: 'Task',
}

export const LEVEL_COLORS: Record<number, string> = {
  1: 'var(--sapIndicationColor_6)',
  2: 'var(--sapIndicationColor_5)',
  3: 'var(--sapIndicationColor_3)',
  4: 'var(--sapIndicationColor_1)',
  5: 'var(--sapIndicationColor_2)',
}

export interface ProcessHierarchy {
  id: string
  name: string
  description: string
}
