import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog, Button, Bar, Icon, Input, List, ListItemCustom, Text, MessageBox, Title,
  Popover, ListItemStandard,
} from '@ui5/webcomponents-react'
import type { InputDomRef } from '@ui5/webcomponents-react'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import {
  buildTree, flattenTree, renumberTree, cloneTree, findNode, removeNode,
  countDescendants, filterTree, moveNode, indentNode, outdentNode, createElement,
  reorderNode,
} from './treeUtils'
import type { TreeNode } from './treeUtils'
import type { ProcessHierarchy } from './types'
import s from './ManageHierarchyModal.module.css'

const MAX_UNDO = 30

export interface ManageHierarchyModalProps {
  open: boolean
  hierarchy: ProcessHierarchy | undefined
  onClose: () => void
}

interface FlatRow {
  node: TreeNode
  depth: number
  hasChildren: boolean
}

function toRows(roots: TreeNode[], expanded: Set<string>): FlatRow[] {
  const rows: FlatRow[] = []
  const walk = (nodes: TreeNode[], depth: number) => {
    nodes.forEach(node => {
      const hasChildren = node.children.length > 0
      rows.push({ node, depth, hasChildren })
      if (hasChildren && expanded.has(node.id)) walk(node.children, depth + 1)
    })
  }
  walk(roots, 0)
  return rows
}

function collectIds(roots: TreeNode[]): string[] {
  const ids: string[] = []
  const walk = (nodes: TreeNode[]) => nodes.forEach(n => { ids.push(n.id); walk(n.children) })
  walk(roots)
  return ids
}

export default function ManageHierarchyModal({ open, hierarchy, onClose }: ManageHierarchyModalProps) {
  const { getElements, saveStructure } = useProcessLandscape()
  const hierarchyId = hierarchy?.id ?? ''
  const renameRef = useRef<InputDomRef>(null)
  const AnyListItem = ListItemStandard as React.FC<any>

  const [tree, setTree] = useState<TreeNode[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [search, setSearch] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [undoStack, setUndoStack] = useState<TreeNode[][]>([])
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const [overflowRowId, setOverflowRowId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' } | null>(null)

  useEffect(() => {
    if (open && hierarchyId) {
      const initial = renumberTree(buildTree(getElements(hierarchyId)))
      setTree(initial)
      setSelectedId(initial[0]?.id ?? null)
      setExpandedIds(new Set(initial.map(n => n.id)))
      setRenamingId(null)
      setRenameValue('')
      setSearch('')
      setIsDirty(false)
      setUndoStack([])
      setOverflowRowId(null)
    }
  }, [open, hierarchyId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (renamingId) {
      const id = setTimeout(() => {
        const el = renameRef.current
        el?.focus()
        el?.shadowRoot?.querySelector('input')?.select()
      }, 60)
      return () => clearTimeout(id)
    }
  }, [renamingId])

  const displayTree = useMemo(() => (search.trim() ? filterTree(tree, search) : tree), [tree, search])
  const rows = useMemo(() => {
    const exp = search.trim() ? new Set(collectIds(displayTree)) : expandedIds
    return toRows(displayTree, exp)
  }, [displayTree, expandedIds, search])

  const selected = selectedId ? findNode(tree, selectedId) : null

  // Overflow menu capabilities — computed for whichever row has the overflow open
  const overflowNode = overflowRowId ? findNode(tree, overflowRowId) : null
  const overflowCanMoveUp = !!overflowNode && overflowNode.index > 0
  const overflowCanMoveDown = !!overflowNode && overflowNode.index < overflowNode.siblings.length - 1
  const overflowCanIndent = !!overflowNode && overflowNode.index > 0
  const overflowCanOutdent = !!overflowNode && overflowNode.node.level > 1

  function pushUndo() {
    setUndoStack(prev => {
      const next = [...prev, cloneTree(tree)]
      return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next
    })
  }

  function commit(next: TreeNode[]) {
    setTree(renumberTree(next))
    setIsDirty(true)
  }

  function mutate(fn: () => TreeNode[]) {
    pushUndo()
    commit(fn())
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddChild(nodeId: string) {
    const found = findNode(tree, nodeId)
    if (!found) return
    mutate(() => {
      const next = cloneTree(tree)
      const target = findNode(next, nodeId)!
      const el = createElement('New Process', target.node.id, target.node.level + 1)
      target.node.children.push({ ...el, children: [] })
      return next
    })
    setExpandedIds(prev => new Set(prev).add(nodeId))
    setSelectedId(nodeId)
  }

  function handleAddRoot() {
    mutate(() => {
      const next = cloneTree(tree)
      const el = createElement('New Category', null, 1)
      next.push({ ...el, children: [] })
      return next
    })
  }

  function handleDelete() {
    if (!selectedId) return
    mutate(() => {
      const next = cloneTree(tree)
      removeNode(next, selectedId)
      return next
    })
    setSelectedId(null)
  }

  function handleMove(nodeId: string, dir: 'up' | 'down') {
    mutate(() => moveNode(tree, nodeId, dir))
  }

  function handleIndent(nodeId: string) {
    mutate(() => indentNode(tree, nodeId))
    setExpandedIds(prev => {
      const found = findNode(tree, nodeId)
      if (found && found.index > 0) {
        const newParentId = found.siblings[found.index - 1].id
        return new Set(prev).add(newParentId)
      }
      return prev
    })
  }

  function handleOutdent(nodeId: string) {
    mutate(() => outdentNode(tree, nodeId))
  }

  function handleUndo() {
    setUndoStack(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setTree(last)
      setIsDirty(true)
      return prev.slice(0, -1)
    })
  }

  function commitRename() {
    if (!renamingId) return
    const value = renameValue.trim()
    if (value) {
      mutate(() => {
        const next = cloneTree(tree)
        const target = findNode(next, renamingId)
        if (target) target.node.name = value
        return next
      })
    }
    setRenamingId(null)
  }

  function handleExpandCollapseAll() {
    const allIds = collectIds(tree)
    setExpandedIds(prev => (prev.size >= allIds.length ? new Set() : new Set(allIds)))
  }

  function requestClose() {
    if (isDirty) setShowDiscardWarning(true)
    else onClose()
  }

  function handleSave() {
    saveStructure(hierarchyId, flattenTree(renumberTree(tree)))
    setIsDirty(false)
    onClose()
  }

  const canUndo = undoStack.length > 0
  const allExpanded = expandedIds.size >= collectIds(tree).length
  const deleteCount = selected ? countDescendants(selected.node) : 0

  return (
    <>
      <MessageBox
        open={showDiscardWarning}
        type="Warning"
        onClose={(action) => {
          setShowDiscardWarning(false)
          if (action === 'Discard Changes') { setIsDirty(false); onClose() }
        }}
        actions={['Discard Changes', 'Cancel']}
        emphasizedAction="Discard Changes"
      >
        Do you want to discard your changes?{'\n'}All structural edits will be lost.
      </MessageBox>

      <MessageBox
        open={showDeleteWarning}
        type="Warning"
        titleText="Delete"
        onClose={(action) => {
          setShowDeleteWarning(false)
          if (action === 'Delete') handleDelete()
        }}
        actions={['Delete', 'Cancel']}
        emphasizedAction="Delete"
      >
        {deleteCount > 0
          ? `Delete "${selected?.node.name}"? This will also delete ${deleteCount} sub-process${deleteCount === 1 ? '' : 'es'}.`
          : `Delete "${selected?.node.name}"?`}
      </MessageBox>

      <Popover
        open={overflowRowId !== null}
        opener={overflowRowId ? `mhm-more-${overflowRowId}` : undefined}
        onClose={() => setOverflowRowId(null)}
        placement="Bottom"
        className="no-padding-popover"
      >
        <List
          onItemClick={(e) => {
            const action = (e.detail.item as HTMLElement).dataset.action
            if (!overflowRowId) return
            if (action === 'up') handleMove(overflowRowId, 'up')
            else if (action === 'down') handleMove(overflowRowId, 'down')
            else if (action === 'indent') handleIndent(overflowRowId)
            else if (action === 'outdent') handleOutdent(overflowRowId)
            setOverflowRowId(null)
          }}
        >
          <AnyListItem data-action="up" icon="slim-arrow-up" disabled={!overflowCanMoveUp}>Move Up</AnyListItem>
          <AnyListItem data-action="down" icon="slim-arrow-down" disabled={!overflowCanMoveDown}>Move Down</AnyListItem>
          <AnyListItem data-action="indent" icon="navigation-right-arrow" disabled={!overflowCanIndent}>Indent</AnyListItem>
          <AnyListItem data-action="outdent" icon="navigation-left-arrow" disabled={!overflowCanOutdent}>Outdent</AnyListItem>
        </List>
      </Popover>

      <Dialog
        open={open}
        headerText={hierarchy ? `Manage: ${hierarchy.name}` : 'Manage Hierarchy'}
        className="dialog-padding-s manage-hierarchy-dialog"
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Emphasized" disabled={!isDirty} onClick={handleSave}>Save</Button>
                <Button design="Transparent" onClick={requestClose}>Cancel</Button>
              </>
            }
          />
        }
      >
        <div className={s['mhm-body']}>
          {/* Toolbar — global actions only; per-row actions appear on hover */}
          <div className={s['mhm-toolbar']}>
            <Button design="Transparent" icon="duplicate" tooltip="Add root category" onClick={handleAddRoot} />
            <div className={s['mhm-toolbar__separator']} />
            <Button design="Transparent" icon="undo" tooltip="Undo" disabled={!canUndo} onClick={handleUndo} />
            <Button
              design="Transparent"
              icon={allExpanded ? 'collapse-all' : 'expand-all'}
              tooltip={allExpanded ? 'Collapse all' : 'Expand all'}
              onClick={handleExpandCollapseAll}
            />
            <div style={{ flex: 1 }} />
            <Input
              placeholder="Search..."
              icon={<Icon name="search" />}
              showClearIcon
              value={search}
              onInput={(e) => setSearch((e.target as unknown as InputDomRef).value ?? '')}
              style={{ width: '14rem' }}
            />
          </div>

          {/* Tree */}
          <div className={s['mhm-tree']}>
            {rows.length === 0 ? (
              <div className={s['mhm-empty']}>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                  {search.trim() ? 'No processes match your search.' : 'No processes yet. Add a root category to begin.'}
                </Text>
              </div>
            ) : (
              <List
                selectionMode="Single"
                onSelectionChange={(e) => {
                  const item = (e.detail as unknown as { selectedItems: HTMLElement[] }).selectedItems?.[0]
                  const id = item?.dataset?.id
                  if (id) { setSelectedId(id); setRenamingId(null) }
                }}
              >
                {rows.map(({ node, depth, hasChildren }) => {
                  const isExpanded = search.trim() ? true : expandedIds.has(node.id)
                  const isRenaming = renamingId === node.id
                  const isDraggingThis = draggingId === node.id
                  const dropPos = dropTarget?.id === node.id ? dropTarget.position : null

                  return (
                    <ListItemCustom
                      key={node.id}
                      data-id={node.id}
                      selected={node.id === selectedId}
                    >
                      <div
                        className={[
                          s['mhm-row'],
                          isDraggingThis ? s['mhm-row--dragging'] : '',
                          dropPos ? s[`mhm-row--drop-${dropPos}`] : '',
                        ].filter(Boolean).join(' ')}
                        style={{ paddingLeft: `${depth * 1.25}rem` }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (!draggingId || draggingId === node.id) return
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
                          setDropTarget({ id: node.id, position })
                        }}
                        onDragLeave={() => { if (dropTarget?.id === node.id) setDropTarget(null) }}
                        onDrop={(e) => {
                          e.preventDefault()
                          if (!draggingId || dropTarget?.id !== node.id) return
                          mutate(() => reorderNode(tree, draggingId, node.id, dropTarget.position))
                          setDraggingId(null)
                          setDropTarget(null)
                        }}
                      >
                        {/* Drag handle */}
                        <div
                          className={s['mhm-row__drag-handle']}
                          draggable={!isRenaming}
                          onDragStart={(e) => {
                            setDraggingId(node.id)
                            setSelectedId(node.id)
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', node.id)
                          }}
                          onDragEnd={() => { setDraggingId(null); setDropTarget(null) }}
                        >
                          <Icon name="horizontal-grip" />
                        </div>

                        {/* Expand toggle or spacer */}
                        {hasChildren ? (
                          <Button
                            design="Transparent"
                            icon={isExpanded ? 'slim-arrow-down' : 'slim-arrow-right'}
                            onClick={(e) => { (e as unknown as MouseEvent).stopPropagation(); toggleExpand(node.id) }}
                            style={{ width: '1.75rem', height: '1.75rem', minWidth: 'unset', padding: 0 }}
                          />
                        ) : (
                          <span className={s['mhm-row__spacer']} />
                        )}

                        <Text className={s['mhm-row__code']}>{node.hierarchyId}</Text>

                        {isRenaming ? (
                          <Input
                            ref={renameRef}
                            value={renameValue}
                            className={s['mhm-row__rename']}
                            onInput={(e) => setRenameValue((e.target as unknown as InputDomRef).value ?? '')}
                            onChange={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename()
                              else if (e.key === 'Escape') setRenamingId(null)
                            }}
                          />
                        ) : (
                          <Text
                            className={s['mhm-row__name']}
                            style={{ fontWeight: node.level === 1 ? '600' : undefined }}
                            onDoubleClick={() => {
                              setSelectedId(node.id)
                              setRenameValue(node.name)
                              setRenamingId(node.id)
                            }}
                          >
                            {node.name}
                          </Text>
                        )}

                        {/* Per-row hover actions */}
                        {!isRenaming && (
                          <div className={[s['mhm-row__actions'], overflowRowId === node.id ? s['mhm-row__actions--visible'] : ''].filter(Boolean).join(' ')}>
                            <Button
                              design="Transparent"
                              icon="edit"
                              tooltip="Rename"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(node.id)
                                setRenameValue(node.name)
                                setRenamingId(node.id)
                              }}
                              style={{ width: '2rem', height: '2rem', minWidth: 'unset', padding: 0 }}
                            />
                            <Button
                              design="Transparent"
                              icon="add"
                              tooltip="Add child process"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddChild(node.id)
                              }}
                              style={{ width: '2rem', height: '2rem', minWidth: 'unset', padding: 0 }}
                            />
                            <Button
                              design="Transparent"
                              icon="delete"
                              tooltip="Delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(node.id)
                                setShowDeleteWarning(true)
                              }}
                              style={{ width: '2rem', height: '2rem', minWidth: 'unset', padding: 0 }}
                            />
                            <Button
                              id={`mhm-more-${node.id}`}
                              design="Transparent"
                              icon="overflow"
                              tooltip="Move / reorder"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(node.id)
                                setOverflowRowId(prev => (prev === node.id ? null : node.id))
                              }}
                              style={{ width: '2rem', height: '2rem', minWidth: 'unset', padding: 0 }}
                            />
                          </div>
                        )}
                      </div>
                    </ListItemCustom>
                  )
                })}
              </List>
            )}
          </div>

          <div className={s['mhm-hint']}>
            <Title level="H6" style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: 'normal' }}>
              Double-click to rename · Drag to reorder · Hover a row for actions · Codes recompute automatically.
            </Title>
          </div>
        </div>
      </Dialog>
    </>
  )
}
