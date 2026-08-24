import { useMemo, useState } from 'react'
import {
  AnalyticalTable, Icon, Text, Avatar, Input, Title, ToolbarItem,
  type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect } from '@signavio/sap-signavio-uixtension'
import { isAddedOnly, applyOverrides } from './variantUtils'
import type { ProcessElement, ProcessStatus, VariantDeviation, VariantScope } from './types'
import { USERS } from '../../data/users'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'

interface CatalogViewProps {
  hierarchyId: string
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
}

interface CatalogRow {
  rowId: string
  elementId: string
  kind: 'standard' | 'variant'
  hierarchyId: string
  name: string
  level: 1 | 2 | 3 | 4 | 5
  processType: ProcessElement['processType']
  status: ProcessStatus
  ownerId: string
  assetCount: number
  scopeLabel?: string
  scope?: VariantScope
  deviation?: VariantDeviation
  subRows?: CatalogRow[]
}

const STATUS_STATE: Record<string, string> = {
  Active: 'var(--sapPositiveColor)',
  'In Review': 'var(--sapCriticalColor)',
  Draft: 'var(--sapNeutralColor)',
  Deprecated: 'var(--sapNegativeColor)',
}

const PROCESS_TYPE_COLOR: Record<string, string> = {
  Operating: 'var(--sapIndicationColor_3)',
  Management: 'var(--sapIndicationColor_5)',
  Support: 'var(--sapIndicationColor_2)',
}

function LevelBadge({ level, label }: { level: number; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.0625rem 0.375rem',
      borderRadius: '0.625rem',
      fontSize: 'var(--sapFontSmallSize)',
      background: 'var(--sapNeutralBackground)',
      color: 'var(--sapTextColor)',
      whiteSpace: 'nowrap',
    }}>
      L{level} · {label}
    </span>
  )
}

const DEVIATION_LABEL: Record<VariantDeviation, string> = {
  standard: 'Standard',
  inherited: 'Inherited',
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
}

const DEVIATION_COLOR: Record<VariantDeviation, string> = {
  standard: 'var(--sapNeutralColor)',
  inherited: 'var(--sapInformativeColor)',
  added: 'var(--sapPositiveColor)',
  removed: 'var(--sapNegativeColor)',
  changed: 'var(--sapCriticalColor)',
}

function DeviationBadge({ deviation }: { deviation: VariantDeviation }) {
  if (deviation === 'standard') return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.0625rem 0.375rem',
      borderRadius: '0.625rem',
      fontSize: 'var(--sapFontSmallSize)',
      border: `1px solid ${DEVIATION_COLOR[deviation]}`,
      color: DEVIATION_COLOR[deviation],
      whiteSpace: 'nowrap',
    }}>
      {DEVIATION_LABEL[deviation]}
    </span>
  )
}

function ScopePill({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.0625rem 0.375rem',
      borderRadius: '0.25rem',
      fontSize: 'var(--sapFontSmallSize)',
      background: 'var(--sapButton_Lite_Background)',
      color: 'var(--sapContent_LabelColor)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function StatusDot({ status }: { status: ProcessStatus }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: STATUS_STATE[status], flexShrink: 0 }} />
      <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{status}</Text>
    </div>
  )
}

function scopeToLabel(scope: VariantScope): string {
  return Object.values(scope).join(' · ')
}

/** Build the Global-Standard tree with each scoped variant as a sub-row. */
function buildTree(elements: ProcessElement[]): CatalogRow[] {
  const rowById = new Map<string, CatalogRow>()
  const roots: CatalogRow[] = []

  // 1. Standard rows (added-only elements have no standard existence).
  const standardEls = elements.filter(e => !isAddedOnly(e))
  standardEls.forEach(e => {
    rowById.set(e.id, {
      rowId: e.id, elementId: e.id, kind: 'standard',
      hierarchyId: e.hierarchyId, name: e.name, level: e.level,
      processType: e.processType, status: e.status, ownerId: e.ownerId, assetCount: e.assetCount,
      subRows: [],
    })
  })

  // 2. Nest standard rows by parentId.
  standardEls.forEach(e => {
    const row = rowById.get(e.id)!
    if (e.parentId && rowById.has(e.parentId)) rowById.get(e.parentId)!.subRows!.push(row)
    else roots.push(row)
  })

  // 3. Variant sub-rows.
  elements.forEach(e => {
    (e.variants ?? []).forEach(v => {
      const eff = applyOverrides(e, v)
      const vrow: CatalogRow = {
        rowId: `${e.id}__var__${scopeToLabel(v.scope)}`,
        elementId: e.id, kind: 'variant',
        hierarchyId: e.hierarchyId, name: eff.name, level: e.level,
        processType: eff.processType, status: eff.status, ownerId: eff.ownerId, assetCount: eff.assetCount,
        scopeLabel: scopeToLabel(v.scope), scope: v.scope, deviation: v.deviation,
      }
      if (v.deviation === 'added') {
        // Added-only element: attach under its parent's standard row.
        const parent = e.parentId ? rowById.get(e.parentId) : null
        if (parent) parent.subRows!.push(vrow)
        else roots.push(vrow)
      } else {
        const host = rowById.get(e.id)
        if (host) host.subRows!.push(vrow)
      }
    })
  })

  // 4. Drop empty subRows so leaves show no expander.
  const clean = (rows: CatalogRow[]) => {
    rows.forEach(r => {
      if (r.subRows && r.subRows.length === 0) r.subRows = undefined
      else if (r.subRows) clean(r.subRows)
    })
  }
  clean(roots)
  return roots
}

/** Prune the tree to branches containing a match; keep full subtree when a row itself matches. */
function pruneTree(rows: CatalogRow[], q: string): CatalogRow[] {
  const result: CatalogRow[] = []
  for (const r of rows) {
    const selfMatch =
      r.name.toLowerCase().includes(q) ||
      r.hierarchyId.includes(q) ||
      (r.scopeLabel?.toLowerCase().includes(q) ?? false)
    const kids = r.subRows ? pruneTree(r.subRows, q) : []
    if (selfMatch) result.push(r)
    else if (kids.length) result.push({ ...r, subRows: kids })
  }
  return result
}

function collectIds(rows: CatalogRow[]): string[] {
  return rows.flatMap(r => [r.rowId, ...(r.subRows ? collectIds(r.subRows) : [])])
}

function variantVisible(scope: VariantScope | undefined, activeFilters: Record<string, string | string[]>): boolean {
  if (!scope) return true
  for (const [dimId, value] of Object.entries(scope)) {
    const filterVal = activeFilters[dimId]
    if (!filterVal) continue
    if (Array.isArray(filterVal)) {
      if (filterVal.length > 0 && !filterVal.includes(value)) return false
    } else {
      if (filterVal !== '' && filterVal !== value) return false
    }
  }
  return true
}

function applyFilters(rows: CatalogRow[], activeFilters: Record<string, string | string[]>): CatalogRow[] {
  const hasFilter = Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v !== '')
  if (!hasFilter) return rows
  return rows.map(r => {
    if (!r.subRows || r.subRows.length === 0) return r
    const subs = r.subRows
      .filter(sub => sub.kind !== 'variant' || variantVisible(sub.scope, activeFilters))
      .map(sub => applyFilters([sub], activeFilters)[0])
    return { ...r, subRows: subs.length ? subs : undefined }
  })
}

function countExpandedRows(rows: CatalogRow[], expMap: Record<string, boolean>): number {
  return rows.reduce((n, r) => {
    const childCount = expMap[r.rowId] && r.subRows ? countExpandedRows(r.subRows, expMap) : 0
    return n + 1 + childCount
  }, 0)
}

function countStandardRows(rows: CatalogRow[]): number {
  return rows.reduce((n, r) => {
    const childCount = r.subRows ? countStandardRows(r.subRows) : 0
    return n + (r.kind === 'standard' ? 1 : 0) + childCount
  }, 0)
}

export default function CatalogView({ hierarchyId, selectedElementId, onSelectElement }: CatalogViewProps) {
  const { getElements } = useProcessLandscape()
  const { levelNames, contextDimensions } = useWorkspace()
  const rawElements = getElements(hierarchyId)
  const [search, setSearch] = useState('')
  const [catalogFilters, setCatalogFilters] = useState<Record<string, string | string[]>>({})

  function asArr(val: string | string[] | undefined): string[] {
    if (!val) return []
    return Array.isArray(val) ? val : [val]
  }

  const catalogFiltersDisplay = useMemo<Record<string, string | string[]>>(() => {
    const result: Record<string, string | string[]> = {}
    for (const dim of contextDimensions) {
      const arr = asArr(catalogFilters[dim.id] as string | string[] | undefined)
      result[dim.id] = arr.length === 0 ? ['__all__'] : arr
    }
    return result
  }, [catalogFilters, contextDimensions])

  function handleCatalogFiltersChange(newFilters: Record<string, string | string[]>) {
    const next: Record<string, string | string[]> = {}
    for (const dim of contextDimensions) {
      const prevArr = asArr(catalogFilters[dim.id] as string | string[] | undefined)
      const prevHadAll = prevArr.length === 0
      const newArr = asArr(newFilters[dim.id] as string | string[] | undefined)
      const hasAll = newArr.includes('__all__')
      if (hasAll && prevHadAll && newArr.length > 1) {
        next[dim.id] = newArr.filter(v => v !== '__all__')
      } else if (hasAll && !prevHadAll) {
        next[dim.id] = []
      } else {
        next[dim.id] = hasAll ? [] : newArr
      }
    }
    setCatalogFilters(next)
  }

  const tree = useMemo(() => buildTree(rawElements), [rawElements])

  const displayTree = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? pruneTree(tree, q) : tree
  }, [tree, search])

  const filteredTree = useMemo(
    () => applyFilters(displayTree, catalogFilters),
    [displayTree, catalogFilters],
  )

  // Expand level-1 categories by default; expand all matches while searching.
  const expanded = useMemo(() => {
    const ids = search.trim()
      ? collectIds(filteredTree)
      : filteredTree.filter(r => r.level === 1).map(r => r.rowId)
    return Object.fromEntries(ids.map(id => [id, true]))
  }, [filteredTree, search])

  const visibleRowCount = useMemo(
    () => Math.max(1, countExpandedRows(filteredTree, expanded)),
    [filteredTree, expanded],
  )

  const processCount = useMemo(() => countStandardRows(filteredTree), [filteredTree])

  const columns: AnalyticalTableColumnDefinition[] = useMemo(() => [
    {
      id: 'name', accessor: 'name', Header: 'Name', minWidth: 300,
      Cell: ({ row, value }: any) => {
        const r = row.original as CatalogRow
        if (r.kind === 'variant') {
        const muted = r.deviation === 'removed'
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            {r.scopeLabel && <ScopePill label={r.scopeLabel} />}
            <Text style={{
              fontSize: 'var(--sapFontSmallSize)',
              color: muted ? 'var(--sapContent_LabelColor)' : 'var(--sapTextColor)',
              fontStyle: r.deviation === 'inherited' || r.deviation === 'removed' ? 'italic' : undefined,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
            }}>
              {r.deviation === 'removed' ? '(not applicable)' : r.deviation === 'inherited' ? '(inherits standard)' : value}
            </Text>
            <DeviationBadge deviation={r.deviation ?? 'standard'} />
          </div>
        )
        }
        return (
        <Text style={{
          fontWeight: r.level === 1 ? '600' : undefined,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
        }}>
          {value}
        </Text>
        )
      },
    },
    {
      id: 'hierarchyId', accessor: 'hierarchyId', Header: 'ID', width: 90,
      Cell: ({ row, value }: any) => {
        const r = row.original as CatalogRow
        if (r.kind === 'variant') return null
        return (
        <Text style={{ fontFamily: 'var(--sapFontMonospaceFamily)', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          {value}
        </Text>
        )
      },
    },
    {
      id: 'level', accessor: 'level', Header: 'Level', width: 150, disableSortBy: true,
      Cell: ({ row, value }: any) => {
        const r = row.original as CatalogRow
        if (r.kind === 'variant') return null
        return <LevelBadge level={value} label={levelNames[value as 1 | 2 | 3 | 4 | 5]} />
      },
    },
    {
      id: 'processType', accessor: 'processType', Header: 'Process Type', width: 120,
      Cell: ({ value }: any) => (
        <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '0.0625rem 0.375rem',
        borderRadius: '0.625rem',
        fontSize: 'var(--sapFontSmallSize)',
        background: PROCESS_TYPE_COLOR[value] ?? 'var(--sapNeutralBackground)',
        color: 'var(--sapTextColor)',
        }}>
        {value}
        </span>
      ),
    },
    {
      id: 'ownerId', accessor: 'ownerId', Header: 'Owner', minWidth: 160,
      Cell: ({ value }: any) => {
        const owner = USERS.find(u => u.id === value)
        if (!owner) return <Text>—</Text>
        return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <Avatar initials={owner.initials} colorScheme={owner.colorScheme as 'Accent1'} size="XS" />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{owner.name}</Text>
        </div>
        )
      },
    },
    {
      id: 'status', accessor: 'status', Header: 'Status', width: 120,
      Cell: ({ value }: any) => <StatusDot status={value} />,
    },
    {
      id: 'assetCount', accessor: 'assetCount', Header: 'Assets', width: 80,
      Cell: ({ row, value }: any) => {
        const r = row.original as CatalogRow
        if (r.kind === 'variant') return null
        return (
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          {value}
        </Text>
        )
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [levelNames])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '1rem' }}>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
              {processCount} Processes
            </Title>
          </ToolbarItem>
        }
        searchSlot={
          <ToolbarItem>
            <Input
              placeholder="Search processes..."
              icon={<Icon name="search" />}
              showClearIcon
              value={search}
              onInput={(e) => setSearch((e.target as unknown as { value?: string }).value ?? '')}
              style={{ width: '16rem' }}
            />
          </ToolbarItem>
        }
        filterBarSlot={
          <SigFilterBar
            filters={catalogFiltersDisplay}
            onFiltersChange={(f) => handleCatalogFiltersChange(f as Record<string, string | string[]>)}
            defaultFilters={{}}
          >
            {contextDimensions.filter(d => d.type === 'Selection').map(dim => (
              <SigFilter key={dim.id} filterKey={dim.id} label={dim.name}>
                <MultiSelect
                  options={[
                    { value: '__all__', label: `All ${dim.name}s` },
                    ...(dim.options ?? []).map(opt => ({ value: opt, label: opt })),
                  ]}
                />
              </SigFilter>
            ))}
          </SigFilterBar>
        }
        >
        <AnalyticalTable
          key={`q:${search.trim()}:f:${JSON.stringify(catalogFilters)}`}
          data={filteredTree}
          columns={columns}
          subRowsKey="subRows"
          isTreeTable
          scaleWidthMode="Grow"
          visibleRows={visibleRowCount}
          minRows={0}
          selectionMode="Single"
          selectedRowIds={selectedElementId ? { [selectedElementId]: true } : {}}
          onRowSelect={(e: any) => {
            const ids = e.detail?.selectedRowIds ?? {}
            const rowId = Object.keys(ids).find(id => ids[id])
            if (!rowId) { onSelectElement(null); return }
            const elementId = rowId.includes('__var__') ? rowId.split('__var__')[0] : rowId
            onSelectElement(elementId === selectedElementId ? null : elementId)
          }}
          reactTableOptions={{
            getRowId: (row: any) => row.rowId,
            autoResetExpanded: false,
            autoResetSelectedRows: false,
            initialState: { expanded },
          }}
        />
      </SigTableWrapper>
    </div>
  )
}
