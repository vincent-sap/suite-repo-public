import type { ProcessElement, ProcessVariant, VariantScope, VariantDeviation } from './types'

/** Active scope from the user's filter selection — values may be a single string or an array. */
export type ActiveScope = Record<string, string | string[] | undefined>

/**
 * A variant applies when every dimension it lists matches the active scope.
 * Dimensions the variant does not list act as wildcards, so a variant scoped to
 * only { 'ctx-2': 'Germany' } applies for any Business Division as long as Market is Germany.
 */
export function scopeMatches(variantScope: VariantScope, activeScope: ActiveScope): boolean {
  return Object.entries(variantScope).every(([dimId, value]) => {
    const active = activeScope[dimId]
    if (active == null || active === '' || (Array.isArray(active) && active.length === 0)) return true
    if (Array.isArray(active)) return active.includes(value)
    return active === value
  })
}

/** True when the active scope specifies at least one dimension value. */
export function hasActiveScope(activeScope: ActiveScope): boolean {
  return Object.values(activeScope).some(v => {
    if (v == null || v === '') return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })
}

/** An element that exists only within one or more variant scopes (never in the Global Standard). */
export function isAddedOnly(el: ProcessElement): boolean {
  return (el.variants ?? []).some(v => v.deviation === 'added')
}

export interface ResolvedElement {
  element: ProcessElement // base fields with any scalar overrides applied
  deviation: VariantDeviation
}

/**
 * Resolve an element's effective representation for the active scope.
 * Returns null when the element should be hidden.
 */
export function resolveElement(el: ProcessElement, activeScope: ActiveScope): ResolvedElement | null {
  const addedOnly = isAddedOnly(el)

  // Global Standard view: no active scope selected.
  if (!hasActiveScope(activeScope)) {
    if (addedOnly) return null // scope-specific additions don't exist in the standard
    return { element: el, deviation: 'standard' }
  }

  const variant = (el.variants ?? []).find(v => scopeMatches(v.scope, activeScope))

  if (!variant) {
    // Added-only element whose scope doesn't match → hidden here.
    if (addedOnly) return null
    return { element: el, deviation: 'standard' }
  }

  if (variant.deviation === 'removed') return null

  if (variant.deviation === 'inherited') {
    return { element: el, deviation: 'inherited' }
  }

  // 'added' or 'changed' → apply scalar overrides on top of the base.
  return { element: applyOverrides(el, variant), deviation: variant.deviation }
}

export function applyOverrides(el: ProcessElement, variant: ProcessVariant): ProcessElement {
  return {
    ...el,
    name: variant.name ?? el.name,
    description: variant.description ?? el.description,
    status: variant.processStatus ?? el.status,
    ownerId: variant.ownerId ?? el.ownerId,
  }
}

/**
 * Resolve a flat list of elements for the active scope. Hidden elements (removed,
 * non-matching additions) are dropped, along with any descendants orphaned by a
 * removed ancestor.
 */
export function resolveElements(elements: ProcessElement[], activeScope: ActiveScope): ResolvedElement[] {
  const resolved = new Map<string, ResolvedElement>()
  for (const el of elements) {
    const r = resolveElement(el, activeScope)
    if (r) resolved.set(el.id, r)
  }

  // Drop elements whose parent chain was removed.
  const visible: ResolvedElement[] = []
  for (const r of resolved.values()) {
    let parentId = r.element.parentId
    let orphaned = false
    while (parentId) {
      if (!resolved.has(parentId)) {
        // Parent only counts as removed if it exists in the source data but resolved away.
        const parentExists = elements.some(e => e.id === parentId)
        if (parentExists) {
          orphaned = true
          break
        }
      }
      const parent = elements.find(e => e.id === parentId)
      parentId = parent ? parent.parentId : null
    }
    if (!orphaned) visible.push(r)
  }
  return visible
}
