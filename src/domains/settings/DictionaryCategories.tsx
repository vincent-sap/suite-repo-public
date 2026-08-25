import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List, ListItemCustom,
  Button, Input, Icon, ToolbarItem, Toast,
  Menu, MenuItem, MenuSeparator, MessageBox,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import s from './components/SettingsPage.module.css'
import { useWorkspace, type DictCategory, type DictCategoryType } from '../../contexts/WorkspaceContext'
import { AddDictionaryCategoryDialog } from './components/AddDictionaryCategoryDialog'
import { DeleteCategoryDialog } from './components/DeleteCategoryDialog'

type TreeRow = DictCategory & { subRows?: TreeRow[] }
type FlatRow = TreeRow & { depth: number }

const INDENT_PX = 24
const BASE_PADDING_PX = 0

const TYPE_ICON_MAP: Record<string, string> = {
  'Organization':  'SAP-icons-v4/organization',
  'Document':      'document',
  'Activity':      'SAP-icons-v4/activity',
  'Event':         'SAP-icons-v4/start-event',
  'IT System':     'SAP-icons-v4/computer',
  'Goal':          'goal',
  'Requirement':   'checklist',
  'Risk':          'SAP-icons-v4/risk',
  'Control':       'SAP-icons-v4/overlay-risk-control',
  'Others':        'SAP-icons-v4/process-manager',
  'Processes':     'SAP-icons-v4/process-manager',
}

// Maps sapAvatar accent text colors → matching accent background colors
const ACCENT_TEXT_TO_BG: Record<string, string> = {
  '#a45d00': '#fff3b8',
  '#aa0808': '#ffd0e7',
  '#ba066c': '#ffdbe7',
  '#a100c2': '#ffdcf3',
  '#552cff': '#ded3ff',
  '#0057d2': '#d1efff',
  '#046c7a': '#c2fcee',
  '#256f3a': '#ebf5cb',
  '#6c32a9': '#ddccf0',
  '#556b82': '#eaecee',
}

function buildTree(categories: DictCategory[]): TreeRow[] {
  const map = new Map<string, TreeRow>()
  for (const cat of categories) map.set(cat.id, { ...cat })
  const roots: TreeRow[] = []
  for (const row of map.values()) {
    if (row.parentId) {
      const parent = map.get(row.parentId)
      if (parent) {
        parent.subRows = parent.subRows ?? []
        parent.subRows.push(row)
      } else {
        roots.push(row)
      }
    } else {
      roots.push(row)
    }
  }
  return roots
}

function flattenVisible(rows: TreeRow[], expandedIds: Set<string>, depth = 0): FlatRow[] {
  const result: FlatRow[] = []
  for (const row of rows) {
    result.push({ ...row, depth })
    if ((row.subRows?.length ?? 0) > 0 && expandedIds.has(row.id)) {
      result.push(...flattenVisible(row.subRows!, expandedIds, depth + 1))
    }
  }
  return result
}

function filterTree(rows: TreeRow[], query: string): TreeRow[] {
  return rows
    .map(row => {
      const childMatches = filterTree(row.subRows ?? [], query)
      if (row.name.toLowerCase().includes(query) || childMatches.length > 0) {
        return { ...row, subRows: childMatches.length > 0 ? childMatches : row.subRows }
      }
      return null
    })
    .filter((r): r is NonNullable<typeof r> => r !== null) as TreeRow[]
}

function collectAllIds(rows: TreeRow[]): string[] {
  return rows.flatMap(r => [r.id, ...collectAllIds(r.subRows ?? [])])
}

export default function DictionaryCategories() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dictCategories, addDictCategory, updateDictCategory, deleteDictCategory, deleteDictCategoryMoveChildren, reorderDictCategory, moveDictCategory } = useWorkspace()

  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const roots = dictCategories.filter(c => !c.parentId)
    return new Set(roots.map(c => c.id))
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DictCategory | undefined>(undefined)
  const [toastOpen, setToastOpen] = useState(false)
  const [actionToast, setActionToast] = useState<string | null>(null)
  // localCats only stages enable/disable and reorder changes
  const [localCats, setLocalCats] = useState<DictCategory[]>(dictCategories)
  const [dirty, setDirty] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [subCategoryParentId, setSubCategoryParentId] = useState<string | undefined>(undefined)
  const [cantDisableTarget, setCantDisableTarget] = useState<DictCategory | null>(null)
  const menuOpenerRefs = useRef<Record<string, HTMLElement | null>>({})
  const menuClosedAtRef = useRef<number>(0)

  // Keep localCats in sync when context changes (after auto-save add/edit/delete)
  const prevDictCategoriesRef = useRef(dictCategories)
  if (prevDictCategoriesRef.current !== dictCategories) {
    prevDictCategoriesRef.current = dictCategories
    // Merge: preserve staged enabled/order, but reflect adds/deletes from context
    setLocalCats(dictCategories.map(c => {
      const local = localCats.find(l => l.id === c.id)
      return local ? { ...c, enabled: local.enabled } : c
    }))
  }

  const query = search.trim().toLowerCase()
  const tree = buildTree(localCats)
  const treeData = query ? filterTree(tree, query) : tree
  const flatRows = query
    ? flattenVisible(treeData, new Set(collectAllIds(treeData)))
    : flattenVisible(treeData, expandedIds)

  const markDirty = () => { if (!dirty) setDirty(true) }

  useEffect(() => {
    const msg = (location.state as any)?.toast
    if (msg) { setActionToast(msg); window.history.replaceState({}, '') }
  }, [location.state])

  const handleSave = () => {
    // Flush only enable/disable and reorder changes
    localCats.forEach(c => {
      const orig = dictCategories.find(x => x.id === c.id)
      if (orig && orig.enabled !== c.enabled) {
        updateDictCategory(c.id, { enabled: c.enabled })
      }
    })
    // Reorder: apply moveDictCategory to match localCats order vs dictCategories order
    // (simplified: just save enabled state; reorder would need full sequence calls)
    setDirty(false)
    setToastOpen(true)
  }

  const handleReset = () => {
    setLocalCats(dictCategories)
    setDirty(false)
  }

  // Auto-save: add/edit/delete go directly to context
  const handleAdd = (name: string, parentId?: string, color?: string, type?: DictCategoryType) => {
    addDictCategory({ name, color: color ?? '#3B6CC7', parentId, enabled: true, type: type ?? 'Others', createdAt: '', changedAt: '' })
    setDialogOpen(false)
    setActionToast('Dictionary category added')
  }

  const handleEdit = (id: string, patch: Partial<Omit<DictCategory, 'id'>>) => {
    updateDictCategory(id, patch)
    setEditTarget(undefined)
    setDialogOpen(false)
    setActionToast('Dictionary category updated')
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isEnabled = (id: string) => localCats.find(c => c.id === id)?.enabled ?? true

  return (
    <PageHeader
      title="Dictionary Categories"
      subtitle="Configure attributes and settings for each dictionary category."
      isDirty={dirty}
      onSave={handleSave}
      onReset={handleReset}
    >
      <div className={s.narrowContent}>
      <SigTableWrapper
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName="Search categories"
              placeholder="Search categories"
              value={search}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
              icon={<Icon slot="icon" name="search" />}
              style={{ width: '240px' }}
            />
          </ToolbarItem>
        }
        businessActionsSlot={
          <>
            <ToolbarItem>
              <Button design="Emphasized" onClick={() => { setEditTarget(undefined); setDialogOpen(true) }}>
                Create
              </Button>
            </ToolbarItem>
          </>
        }
      >


        <List
          style={{ width: '100%' }}
          onItemClick={(e: any) => {
            if (menuOpenId || Date.now() - menuClosedAtRef.current < 300) return
            const id: string | undefined = e.detail.item.dataset.id
            if (id) navigate(`/settings/dictionary-categories/${id}`)
          }}
          onMoveOver={(e: any) => e.preventDefault()}
          onMove={(e: any) => {
            const draggedId: string = e.detail.source.element.dataset.id
            const targetEl = e.detail.destination?.element
            const targetId: string | null = targetEl?.dataset.id ?? null
            const placement: 'Before' | 'After' | 'On' = e.detail.destination?.placement ?? 'After'
            reorderDictCategory(draggedId, targetId, placement)
            setLocalCats(prev => {
              const arr = [...prev]
              const fromIdx = arr.findIndex(c => c.id === draggedId)
              if (fromIdx === -1) return prev
              const [moved] = arr.splice(fromIdx, 1)
              const toIdx = targetId ? arr.findIndex(c => c.id === targetId) : arr.length
              arr.splice(placement === 'Before' ? toIdx : toIdx + 1, 0, moved)
              return arr
            })
            markDirty()
          }}
        >
          {flatRows.map(row => {
            const siblings = localCats.filter(c => c.parentId === row.parentId)
            const sibIdx = siblings.findIndex(c => c.id === row.id)
            const enabled = isEnabled(row.id)
            const hasChildren = (row.subRows?.length ?? 0) > 0
            const isExpanded = expandedIds.has(row.id)
            const indentLeft = BASE_PADDING_PX + row.depth * INDENT_PX

            return (
              <ListItemCustom
                key={row.id}
                data-id={row.id}
                movable
                style={{ padding: 0, cursor: 'pointer' }}
              >
                {/*
                  pointer-events: none on the outer div lets drag events reach the
                  shadow <li> (which is draggable when movable is set). Without this,
                  e.target in ListItem._ondragstart is our div, not the shadow <li>,
                  so the drag guard `e.target === this._listItem` fails and DnD breaks.
                  Interactive zones override to pointer-events: auto.
                */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: `${indentLeft}px`,
                    paddingRight: '0',
                    gap: '8px',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Expand toggle */}
                  <div style={{ width: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', opacity: enabled ? 1 : 0.4 }}>
                    {hasChildren && (
                      <Button
                        icon={isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                        design="Transparent"
                        tooltip={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={(e: any) => { e.stopPropagation(); toggleExpand(row.id) }}
                        style={{ width: '24px', height: '24px', minWidth: '24px', padding: 0 }}
                      />
                    )}
                  </div>

                  {/* Colored avatar */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: row.color,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: enabled ? 1 : 0.4,
                    }}
                  >
                    <Icon
                      name={TYPE_ICON_MAP[row.type] ?? 'SAP-icons-v4/activity'}
                      style={{ color: ACCENT_TEXT_TO_BG[row.color] ?? '#fff', width: '12px', height: '12px', fontSize: '12px' }}
                    />
                  </div>

                  {/* Name + byline */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden' }}>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        fontSize: 'var(--sapFontLargeSize)',
                        color: 'var(--sapList_TextColor)',
                        lineHeight: '1.4',
                        opacity: enabled ? 1 : 0.4,
                      }}>
                        {row.name}
                      </span>
                      {!enabled && (
                        <Icon name="hide" style={{ width: '14px', height: '14px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 'var(--sapFontSize)',
                      color: 'var(--sapContent_LabelColor)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.4',
                      opacity: enabled ? 1 : 0.4,
                    }}>
                      {row.type}
                      {(row.createdAt || row.changedAt) && ' · '}
                      {row.createdAt && `Created ${row.createdAt}`}
                      {row.createdAt && row.changedAt && ' · '}
                      {row.changedAt && `Changed ${row.changedAt}`}
                    </span>
                  </div>

                  {/* Trailing controls — pointer-events: auto so interactions work */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, pointerEvents: 'auto' }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <Button
                      icon="overflow"
                      design="Transparent"
                      tooltip="More actions"
                      ref={(el: HTMLElement | null) => { menuOpenerRefs.current[row.id] = el }}
                      onClick={(e: any) => {
                        e.stopPropagation()
                        setMenuOpenId(prev => prev === row.id ? null : row.id)
                      }}
                    />
                    <Menu
                      open={menuOpenId === row.id}
                      opener={menuOpenerRefs.current[row.id] ?? undefined}
                      onClose={() => { menuClosedAtRef.current = Date.now(); setMenuOpenId(null) }}
                      onItemClick={(e: any) => {
                        const id: string = e.detail.item.dataset.action
                        if (id === 'up') {
                          moveDictCategory(row.id, 'up')
                          setLocalCats(prev => {
                            const arr = [...prev]; const idx = arr.findIndex(c => c.id === row.id)
                            if (idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]] }; return arr
                          }); markDirty()
                        } else if (id === 'down') {
                          moveDictCategory(row.id, 'down')
                          setLocalCats(prev => {
                            const arr = [...prev]; const idx = arr.findIndex(c => c.id === row.id)
                            if (idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]] }; return arr
                          }); markDirty()
                        }
                        else if (id === 'edit') { setEditTarget(row); setDialogOpen(true) }
                        else if (id === 'sub-category') { setSubCategoryParentId(row.id); setEditTarget(undefined); setDialogOpen(true) }
                        else if (id === 'disable') {
                          const hasChildren = localCats.some(c => c.parentId === row.id)
                          if (isEnabled(row.id) && hasChildren) {
                            setCantDisableTarget(row)
                          } else {
                            setLocalCats(prev => prev.map(c => c.id === row.id ? { ...c, enabled: !isEnabled(row.id) } : c))
                            markDirty()
                          }
                        }
                        else if (id === 'delete') { setDeleteTargetId(row.id) }
                        setMenuOpenId(null)
                      }}
                    >
                      <MenuItem data-action="edit" icon="edit" text="Edit" />
                      <MenuItem data-action="sub-category" icon="add" text="Create Sub Category" />
                      <MenuSeparator />
                      <MenuItem data-action="up" icon="slim-arrow-up" text="Move Up" disabled={sibIdx <= 0} />
                      <MenuItem data-action="down" icon="slim-arrow-down" text="Move Down" disabled={sibIdx >= siblings.length - 1} />
                      <MenuSeparator />
                      <MenuItem data-action="disable" icon={isEnabled(row.id) ? 'SAP-icons-v4/invisible' : 'show'} text={isEnabled(row.id) ? 'Disable' : 'Enable'} />
                      <MenuItem data-action="delete" icon="delete" text="Delete" />
                    </Menu>
                  </div>
                </div>
              </ListItemCustom>
            )
          })}
        </List>
      </SigTableWrapper>
      </div>

      <AddDictionaryCategoryDialog
        open={dialogOpen}
        categories={localCats}
        editCategory={editTarget}
        initialParentId={subCategoryParentId}
        onClose={() => { setDialogOpen(false); setEditTarget(undefined); setSubCategoryParentId(undefined) }}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      <DeleteCategoryDialog
        category={deleteTargetId ? dictCategories.find(c => c.id === deleteTargetId) : undefined}
        parent={deleteTargetId ? dictCategories.find(c => c.id === dictCategories.find(x => x.id === deleteTargetId)?.parentId) : undefined}
        onDelete={() => {
          if (deleteTargetId) deleteDictCategory(deleteTargetId)
          setDeleteTargetId(null)
          setActionToast('Dictionary category deleted')
        }}
        onMove={() => {
          if (deleteTargetId) deleteDictCategoryMoveChildren(deleteTargetId)
          setDeleteTargetId(null)
          setActionToast('Dictionary category deleted')
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      <MessageBox
        open={!!cantDisableTarget}
        type="Warning"
        titleText="Disable Dictionary Category"
        actions={['Disable', 'Cancel']}
        emphasizedAction="Disable"
        style={{ width: '500px' }}
        onClose={() => setCantDisableTarget(null)}
      >
        <div style={{ padding: '16px' }}>
          The dictionary category can't be disabled. Remove the following custom attributes (defined for category, subcategory or diagram) that link to this category first:
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
            {localCats.filter(c => c.parentId === cantDisableTarget?.id).map(c => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        </div>
      </MessageBox>

      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>
        Changes saved
      </Toast>
      <Toast open={!!actionToast} placement="BottomCenter" onClose={() => setActionToast(null)}>
        {actionToast}
      </Toast>
    </PageHeader>
  )
}
