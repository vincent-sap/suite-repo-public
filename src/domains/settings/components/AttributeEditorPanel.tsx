import React, { useState, useRef } from 'react'
import {
  Text, Icon, Button, CheckBox, Select, Option,
  Menu, MenuItem, MenuSeparator, Popover,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, TableSelectionMulti,
  FlexBox, ToolbarItem, Input, ToggleButton, MessageBox, Toast, Title,
  Dialog, Bar, List, ListItemStandard,
} from '@ui5/webcomponents-react'
import type { TableMoveEventDetail } from '@ui5/webcomponents/dist/Table.js'
import type { Ui5CustomEvent } from '@ui5/webcomponents-react-base'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, SingleSelect } from '@signavio/sap-signavio-uixtension'
import { AttributeGroupDialog } from './AttributeGroupDialog'
import { AttributeGroupVisibilityDialog } from './AttributeGroupVisibilityDialog'
import { SortPopover } from './SortPopover'
import { CreateAttributeDialog, type AttributeType } from './CreateAttributeDialog'

export const AUDIENCES = ['Everyone', 'Modeler', 'Viewer', 'Process Owner']
export type AttrVis = 'Visible' | 'Visible if set' | 'Invisible'
export type AttrClass = 'Standard' | 'Custom'

export type AttrRow = {
  id: string; name: string; type: string; description: string; attrClass: AttrClass
  required: boolean; enabled: boolean
  visibility: Record<string, AttrVis>
  lastEditedBy?: string; lastEditedAt?: string
}

export type AttrGroup = {
  id: string; name: string
  enabled: Record<string, boolean>
  expanded: boolean
  attrs: AttrRow[]
}

export function makeInitialGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Main Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',   name: 'Name',        type: 'Single-Line Text', description: 'The display name of the asset.',       attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',   name: 'Description', type: 'Multi-Line Text',  description: 'A free-text description of the asset.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
      ],
    },
    {
      id: 'custom1', name: 'New Attribute Group', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'status', name: 'Status',     type: 'Selection',        description: 'Current lifecycle status of the asset.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02'  },
        { id: 'owner',  name: 'Owner',      type: 'Single-Line Text', description: 'Responsible person or team for this asset.', attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02'  },
        { id: 'start',  name: 'Start Date', type: 'Date',             description: 'Planned start date for the initiative.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'due',    name: 'Due Date',   type: 'Date',             description: 'Deadline for completion.',                   attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis, Viewer: 'Invisible' }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
      ],
    },
  ]
}

export function makeModelingGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Standard Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',   name: 'Name',        type: 'Single-Line Text', description: 'The display name of the asset.',       attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',   name: 'Description', type: 'Multi-Line Text',  description: 'A free-text description of the asset.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'status', name: 'Status',      type: 'Selection',        description: 'Current lifecycle status of the asset.', attrClass: 'Standard',  required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Tom Becker', lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'owner',  name: 'Owner',       type: 'Single-Line Text', description: 'Responsible person or team.',            attrClass: 'Standard',  required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Tom Becker', lastEditedAt: 'Jun 1, 2025, 09:02' },
      ],
    },
    {
      id: 'custom1', name: 'New Attribute Group', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'start', name: 'Start Date', type: 'Date', description: 'Planned start date for the initiative.', attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'due',   name: 'Due Date',   type: 'Date', description: 'Deadline for completion.',               attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis, Viewer: 'Invisible' }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
      ],
    },
  ]
}

export function makeDictCategoryGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Standard Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',     name: 'Name',              type: 'Single-Line Text', description: 'The display name of the category.',    attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',     name: 'Description',       type: 'Multi-Line Text',  description: 'A free-text description.',              attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'rel-doc',  name: 'Relevant Document', type: 'Document/URL',     description: 'Reference document for this category.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
      ],
    },
    {
      id: 'custom1', name: 'Custom Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'status',     name: 'Status',          type: 'Selection',        description: 'Current lifecycle status.',              attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'owner',      name: 'Owner',           type: 'Single-Line Text', description: 'Responsible person or team.',            attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'approved',   name: 'Approved',        type: 'Checkbox',         description: 'Whether this category is approved.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'valid-from', name: 'Valid From',      type: 'Date',             description: 'Date from which this category is valid.',attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'priority',   name: 'Priority',        type: 'Selection',        description: 'Priority level of this category.',       attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
        { id: 'tags',       name: 'Tags',            type: 'Multi-Line Text',  description: 'Tags for classification.',               attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
      ],
    },
  ]
}

type Props = {
  attrGroups: AttrGroup[]
  setAttrGroups: React.Dispatch<React.SetStateAction<AttrGroup[]>>
  markDirty: () => void
  hideAudience?: boolean
  hideRequiredColumn?: boolean
  hideCreateGroup?: boolean
  dictCategoryMode?: boolean
  title?: string
  titleNode?: React.ReactNode
  hideAssignSection?: boolean
  defaultAssignedTo?: string[]
  assignableAssetTypes?: { id: string; name: string }[]
  modelingSubElements?: { id: string; name: string }[]
  dictMode?: boolean
  dictCategories?: { id: string; name: string; parentId?: string }[]
  modelingMode?: boolean
  modelLevelMode?: boolean
  hideGrouping?: boolean
  hideVisibilityColumns?: boolean
  viewingMode?: boolean
  modelOrigins?: Set<string>
  elementOrigins?: Set<string>
  viewingAudience?: string
  singleAudienceMode?: boolean
  inlinePadding?: string
}

export default function AttributeEditorPanel({ attrGroups, setAttrGroups, markDirty, hideAudience = false, hideRequiredColumn = false, hideCreateGroup = false, dictCategoryMode = false, title: panelTitle, titleNode, hideAssignSection, defaultAssignedTo, assignableAssetTypes, modelingSubElements, dictMode, dictCategories, modelingMode, modelLevelMode = false, hideGrouping = false, hideVisibilityColumns = false, viewingMode = false, modelOrigins, elementOrigins, viewingAudience = '', singleAudienceMode = false, inlinePadding }: Props) {
  const [groupSearch, setGroupSearch] = useState<Record<string, string>>({})
  const [groupSortBy, setGroupSortBy] = useState<Record<string, string>>({})
  const [groupSortDir, setGroupSortDir] = useState<Record<string, 'asc' | 'desc'>>({})
  const [groupFilters, setGroupFilters] = useState<Record<string, Record<string, unknown>>>({})
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [createAttrDialogGroupId, setCreateAttrDialogGroupId] = useState<string | null>(null)
  const [deleteAttrPending, setDeleteAttrPending] = useState<{ groupId: string; attrId: string; attrName: string } | null>(null)
  const [deleteGroupPending, setDeleteGroupPending] = useState<{ groupId: string; groupName: string } | null>(null)
  const [editAttrPending, setEditAttrPending] = useState<{ groupId: string; attrId: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => setToast(msg)
  const [editAttrDialogOpen, setEditAttrDialogOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [visibilityGroupId, setVisibilityGroupId] = useState<string | null>(null)
  const [ungroupedInfoOpen, setUngroupedInfoOpen] = useState(false)
  const [visibilityInfoOpen, setVisibilityInfoOpen] = useState(false)
  const [viewingSelectedRows, setViewingSelectedRows] = useState<Record<string, Set<string>>>({})
  const selectionFeatureRefs = useRef<Record<string, any>>({})
  const moveToMenuRefs = useRef<Record<string, any>>({})
  const [assignDialogGroupId, setAssignDialogGroupId] = useState<string | null>(null)
  const [assignSearch, setAssignSearch] = useState('')
  const [assignPendingIds, setAssignPendingIds] = useState<Set<string>>(new Set())
  const groupDragRef = useRef<number | null>(null)
  const [groupDragOverIdx, setGroupDragOverIdx] = useState<number | null>(null)
  const hideRequiredEnabled = !!(modelingMode || dictMode || hideRequiredColumn)

  const toggleGroup = (groupId: string) =>
    setAttrGroups(prev => prev.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g))

  const openAddGroupDialog = () => {
    setEditingGroupId(null)
    setGroupDialogOpen(true)
  }

  const openEditGroupDialog = (groupId: string) => {
    setEditingGroupId(groupId)
    setGroupDialogOpen(true)
  }

  const handleGroupDialogConfirm = (name: string) => {
    if (editingGroupId) {
      setAttrGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, name } : g))
      showToast('Attribute group updated')
    } else {
      const newId = `group-${Date.now()}`
      const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
      const newGroup = { id: newId, name, enabled: grpEnabled, expanded: true, attrs: [] }
      setAttrGroups(prev => {
        if (viewingMode) {
          const mainIdx = prev.findIndex(g => g.id === 'main')
          if (mainIdx !== -1) {
            const next = [...prev]
            next.splice(mainIdx, 0, newGroup)
            return next
          }
        }
        return [...prev, newGroup]
      })
      showToast('Attribute group added')
    }
    setGroupDialogOpen(false)
  }

  const deleteGroup = (groupId: string) => {
    setAttrGroups(prev => prev.filter(g => g.id !== groupId))
    showToast('Attribute group deleted')
  }

  const moveGroup = (groupId: string, dir: -1 | 1) => {
    setAttrGroups(prev => {
      const idx = prev.findIndex(g => g.id === groupId)
      if (idx === -1) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      if (viewingMode && (prev[target]?.id === 'main' || groupId === 'main')) return prev
      const groups = [...prev];
      [groups[idx], groups[target]] = [groups[target], groups[idx]]
      return groups
    })
    markDirty()
  }

  const updateAttr = (groupId: string, attrId: string, patch: Partial<AttrRow>) => {
    setAttrGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, attrs: g.attrs.map(a => a.id === attrId ? { ...a, ...patch } : a) } : g
    ))
    markDirty()
  }

  const removeAttr = (groupId: string, attrId: string) => {
    setAttrGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, attrs: g.attrs.filter(a => a.id !== attrId) } : g
    ))
  }

  const moveAttr = (groupId: string, attrIdx: number, dir: -1 | 1) => {
    setAttrGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const attrs = [...g.attrs]
      const target = attrIdx + dir
      if (target < 0 || target >= attrs.length) return g;
      [attrs[attrIdx], attrs[target]] = [attrs[target], attrs[attrIdx]]
      return { ...g, attrs }
    }))
    setGroupSortBy(prev => ({ ...prev, [groupId]: 'Custom Order' }))
    markDirty()
  }

  const moveAttrToGroup = (fromGroupId: string, attrId: string, toGroupId: string) => {
    setAttrGroups(prev => {
      const fromGroup = prev.find(g => g.id === fromGroupId)
      const attr = fromGroup?.attrs.find(a => a.id === attrId)
      if (!attr) return prev
      return prev.map(g => {
        if (g.id === fromGroupId) return { ...g, attrs: g.attrs.filter(a => a.id !== attrId) }
        if (g.id === toGroupId) return { ...g, attrs: [...g.attrs, attr] }
        return g
      })
    })
    markDirty()
  }

  const sortGroup = (groupId: string, sortKey: string, dir: 'asc' | 'desc' = 'asc') => {
    setAttrGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const attrs = [...g.attrs]
      const mult = dir === 'asc' ? 1 : -1
      if (sortKey === 'Name') attrs.sort((a, b) => mult * a.name.localeCompare(b.name))
      else if (sortKey === 'Date Changed') attrs.sort((a, b) => mult * ((a.lastEditedAt ?? '').localeCompare(b.lastEditedAt ?? '')))
      return { ...g, attrs }
    }))
    markDirty()
  }

  const handleAttrMove = (groupId: string, e: Ui5CustomEvent<HTMLElement, TableMoveEventDetail>) => {
    const srcRow = e.detail.source.element as HTMLElement
    const destRow = e.detail.destination.element as HTMLElement
    const placement = e.detail.destination.placement

    setAttrGroups(prev => {
      const group = prev.find(g => g.id === groupId)
      if (!group) return prev

      const srcIdx = group.attrs.findIndex(a => a.id === srcRow.dataset.attrId)
      const destIdx = group.attrs.findIndex(a => a.id === destRow.dataset.attrId)
      if (srcIdx === -1 || destIdx === -1 || srcIdx === destIdx) return prev

      const attrs = [...group.attrs]
      const [moved] = attrs.splice(srcIdx, 1)
      const insertAt = placement === 'Before' ? destIdx : destIdx + 1
      attrs.splice(srcIdx < destIdx ? insertAt - 1 : insertAt, 0, moved)
      return prev.map(g => g.id === groupId ? { ...g, attrs } : g)
    })
    setGroupSortBy(prev => ({ ...prev, [groupId]: 'Custom Order' }))
    markDirty()
  }

  const handleAttrMoveOver = (e: Ui5CustomEvent<HTMLElement, TableMoveEventDetail>) => {
    e.preventDefault()
  }

  const handleGroupDrop = (targetIdx: number) => {
    const srcIdx = groupDragRef.current
    if (srcIdx === null || srcIdx === targetIdx) {
      groupDragRef.current = null
      setGroupDragOverIdx(null)
      return
    }
    setAttrGroups(prev => {
      const groups = [...prev]
      const [moved] = groups.splice(srcIdx, 1)
      groups.splice(targetIdx, 0, moved)
      return groups
    })
    groupDragRef.current = null
    setGroupDragOverIdx(null)
    markDirty()
  }

  const hasTitleRow = !!(titleNode || panelTitle || !hideCreateGroup)

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {hasTitleRow && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.25rem',
          background: 'var(--sapList_Background)',
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          padding: '0.5rem 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          ...(inlinePadding ? { marginInline: inlinePadding } : {}),
        }}>
          {titleNode
            ? titleNode
            : panelTitle
              ? <Title level="H3" style={{ fontSize: 'var(--sapFontHeader4Size)' }}>{panelTitle}</Title>
              : <span />
          }
          {!hideCreateGroup && !hideGrouping && <Button design="Emphasized" onClick={openAddGroupDialog}>Create Attribute Group</Button>}
        </div>
      )}
      {attrGroups.map((group, groupIdx) => {
        const searchQuery = (groupSearch[group.id] ?? '').toLowerCase().trim()
        const activeFilters = groupFilters[group.id] ?? {}
        const activeTypes = (activeFilters['type'] as string[] | undefined) ?? []
        const activeClasses = (activeFilters['attrClass'] as string[] | undefined) ?? []
        const activeRequired = activeFilters['required'] as string | undefined
        const activeEnabled = activeFilters['enabled'] as string | undefined
        const activeChangedBy = (activeFilters['changedBy'] as string[] | undefined) ?? []
        const activeVisibility = (activeFilters['visibility'] as string[] | undefined) ?? []
        const filteredAttrs = group.attrs.filter(a => {
          if (searchQuery && !a.name.toLowerCase().includes(searchQuery) && !a.description.toLowerCase().includes(searchQuery) && !a.id.toLowerCase().includes(searchQuery)) return false
          if (activeTypes.length > 0 && !activeTypes.includes(a.type)) return false
          if (activeClasses.length > 0 && !activeClasses.includes(a.attrClass)) return false
          if (activeRequired && String(a.required) !== activeRequired) return false
          if (activeEnabled && String(a.enabled) !== activeEnabled) return false
          if (activeChangedBy.length > 0 && !activeChangedBy.includes(a.lastEditedBy ?? '')) return false
          if (activeVisibility.length > 0 && !Object.values(a.visibility).some(v => activeVisibility.includes(v))) return false
          return true
        }).slice().sort((a, b) => {
          if ((dictCategoryMode || modelingMode) && group.id === 'main') return 0
          const sortKey = groupSortBy[group.id] ?? 'Name'
          const dir = groupSortDir[group.id] ?? 'asc'
          const mult = dir === 'asc' ? 1 : -1
          if (sortKey === 'Name') return mult * a.name.localeCompare(b.name)
          if (sortKey === 'Description') return mult * (a.description ?? '').localeCompare(b.description ?? '')
          if (sortKey === 'Technical ID') return mult * a.id.localeCompare(b.id)
          if (sortKey === 'Date Changed') return mult * ((a.lastEditedAt ?? '').localeCompare(b.lastEditedAt ?? ''))
          if (sortKey === 'Changed By') return mult * ((a.lastEditedBy ?? '').localeCompare(b.lastEditedBy ?? ''))
          return 0
        })
        const isGroupDragTarget = groupDragOverIdx === groupIdx

        return (
          <div
            key={group.id}
            style={{
              marginBottom: '1.25rem',
              outline: isGroupDragTarget ? '2px dashed var(--sapInformationBorderColor)' : '2px dashed transparent',
              outlineOffset: '2px',
              borderRadius: '4px',
              transition: 'outline 0.1s',
            }}
            onDragOver={e => { if (!dictCategoryMode && groupDragRef.current !== null && groupDragRef.current !== groupIdx && !(viewingMode && group.id === 'main') && !(viewingMode && attrGroups[groupDragRef.current ?? -1]?.id !== 'main' && groupIdx === attrGroups.length - 1)) { e.preventDefault(); setGroupDragOverIdx(groupIdx) } }}
            onDrop={e => { e.preventDefault(); handleGroupDrop(groupIdx) }}
            onDragLeave={() => setGroupDragOverIdx(null)}
          >
          {(() => {
            const hasGroupSelection = viewingMode && (viewingSelectedRows[group.id]?.size ?? 0) > 0
            const selectedIds = viewingSelectedRows[group.id] ?? new Set<string>()
            const moveSelectedUp = () => {
              setAttrGroups(prev => prev.map(g => {
                if (g.id !== group.id) return g
                const attrs = [...g.attrs]
                const indices = attrs.map((a, i) => selectedIds.has(a.id) ? i : -1).filter(i => i >= 0).sort((a, b) => a - b)
                if (indices[0] === 0) return g
                indices.forEach(i => { const tmp = attrs[i - 1]; attrs[i - 1] = attrs[i]; attrs[i] = tmp })
                return { ...g, attrs }
              })); markDirty()
            }
            const moveSelectedDown = () => {
              setAttrGroups(prev => prev.map(g => {
                if (g.id !== group.id) return g
                const attrs = [...g.attrs]
                const indices = attrs.map((a, i) => selectedIds.has(a.id) ? i : -1).filter(i => i >= 0).sort((a, b) => b - a)
                if (indices[0] === attrs.length - 1) return g
                indices.forEach(i => { const tmp = attrs[i + 1]; attrs[i + 1] = attrs[i]; attrs[i] = tmp })
                return { ...g, attrs }
              })); markDirty()
            }
            const moveSelectedToGroup = (targetGroupId: string) => {
              selectedIds.forEach(id => moveAttrToGroup(group.id, id, targetGroupId))
              setViewingSelectedRows(prev => ({ ...prev, [group.id]: new Set() }))
            }
            const otherGroupsForMove = attrGroups.filter(g => g.id !== group.id)
            return (
            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  {viewingMode && (viewingSelectedRows[group.id]?.size ?? 0) > 0 ? (
                    <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>
                        Selected ({viewingSelectedRows[group.id].size} of {group.attrs.length})
                      </Text>
                      <Button design="Transparent" onClick={() => {
                        setViewingSelectedRows(prev => ({ ...prev, [group.id]: new Set() }))
                        const selFeature = selectionFeatureRefs.current[group.id]
                        if (selFeature?.clearSelection) selFeature.clearSelection()
                        else if (selFeature?.selected !== undefined) selFeature.selected = ''
                      }}>Clear Selection</Button>
                    </FlexBox>
                  ) : (
                  <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                    {!dictCategoryMode && !hideGrouping && !(viewingMode && group.id === 'main') && (
                    <div
                      draggable
                      onDragStart={() => { groupDragRef.current = groupIdx }}
                      onDragEnd={() => { groupDragRef.current = null; setGroupDragOverIdx(null) }}
                      style={{ display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0 }}
                    >
                      <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                    </div>
                    )}
                    <Button
                      icon={group.expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
                      design="Transparent"
                      aria-expanded={group.expanded}
                      aria-label={`${group.expanded ? 'Collapse' : 'Expand'} ${group.name}`}
                      onClick={() => toggleGroup(group.id)}
                    />                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>
                      {hideGrouping && group.id !== 'main' ? 'Custom Attributes' : group.name} ({group.attrs.length})
                    </Text>
                    {viewingMode && group.id === 'main' && (
                      <>
                        <Button
                          id={`ungrouped-info-btn-${group.id}`}
                          icon="message-information"
                          design="Transparent"
                          onClick={() => setUngroupedInfoOpen(v => !v)}
                        />
                        <Popover
                          opener={`ungrouped-info-btn-${group.id}`}
                          open={ungroupedInfoOpen}
                          placement="Bottom"
                          onClose={() => setUngroupedInfoOpen(false)}
                          style={{ maxWidth: '320px' }}
                        >
                          <div style={{ padding: '0' }}>
                            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                              Once you create your own groups, the attributes listed in "Ungrouped Attributes" are no longer shown in SAP Signavio Process Collaboration Hub.
                            </Text>
                          </div>
                        </Popover>
                      </>
                    )}
                    {viewingMode && group.enabled[viewingAudience] === false && (
                      <Icon name="hide" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', width: '16px', height: '16px' }} />
                    )}
                  </FlexBox>
                  )}
                </ToolbarItem>
              }
              searchSlot={
                (dictCategoryMode && group.id === 'main') || hasGroupSelection ? undefined :
                <ToolbarItem>
                  <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                    <Input
                      placeholder="Search attributes"
                      type={'Search' as any}
                      value={groupSearch[group.id] ?? ''}
                      onInput={(e: any) => setGroupSearch(prev => ({ ...prev, [group.id]: e.target?.value ?? '' }))}
                      style={{ width: '200px' }}
                    />
                  </FlexBox>
                </ToolbarItem>
              }
              sortSlot={
                (hideGrouping || viewingMode || dictCategoryMode) && group.id === 'main' ? undefined : (hideGrouping || viewingMode || dictCategoryMode) ? undefined :
                <ToolbarItem>
                  <SortPopover
                    anchorId={`sort-chip-${group.id}`}
                    sortBy={groupSortBy[group.id] ?? 'Name'}
                    sortDir={groupSortDir[group.id] ?? 'asc'}
                    options={[
                      { key: 'Custom Order', type: 'none' as const, label: 'Custom' },                      { key: 'Name', type: 'text' as const },
                      { key: 'Description', type: 'text' as const },
                      { key: 'Technical ID', type: 'text' as const },
                      { key: 'Date Changed', type: 'date' as const },
                      { key: 'Changed By', type: 'text' as const },
                    ]}
                    onSortByChange={key => { setGroupSortBy(prev => ({ ...prev, [group.id]: key })); sortGroup(group.id, key, groupSortDir[group.id] ?? 'asc') }}
                    onSortDirChange={dir => { setGroupSortDir(prev => ({ ...prev, [group.id]: dir })); sortGroup(group.id, groupSortBy[group.id] ?? 'Name', dir) }}
                  />
                </ToolbarItem>
              }
              filterBarToggleButton={
                (hideGrouping || viewingMode || dictCategoryMode) && group.id === 'main' ? undefined : (hideGrouping || viewingMode || dictCategoryMode) ? undefined :
                <ToolbarItem>
                  <ToggleButton icon="filter" design="Transparent">
                    {(() => {
                      const count = Object.values(groupFilters[group.id] ?? {}).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length
                      return count > 0 ? String(count) : ''
                    })()}
                  </ToggleButton>
                </ToolbarItem>
              }
              filterBarSlot={
                (hideGrouping || viewingMode || dictCategoryMode) && group.id === 'main' ? undefined : (hideGrouping || viewingMode || dictCategoryMode) ? undefined : (
                <SigFilterBar
                  filters={groupFilters[group.id] ?? {}}
                  onFiltersChange={f => setGroupFilters(prev => ({ ...prev, [group.id]: f }))}
                  defaultFilters={{}}
                >
                  <SigFilter filterKey="type" label="Type">
                    <MultiSelect options={[
                      { value: 'Single-line Text', label: 'Single-line Text' },
                      { value: 'Multi-line Text', label: 'Multi-line Text' },
                      { value: 'Selection', label: 'Selection' },
                      { value: 'User', label: 'User' },
                      { value: 'Date', label: 'Date' },
                      { value: 'Number', label: 'Number' },
                      { value: 'Asset Link', label: 'Asset Link' },
                    ]} />
                  </SigFilter>
                  {!hideRequiredColumn && (
                  <SigFilter filterKey="attrClass" label="Class">
                    <MultiSelect options={[
                      { value: 'Standard', label: 'Standard' },
                      { value: 'Custom', label: 'Custom' },
                    ]} />
                  </SigFilter>
                  )}
                  {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && (
                  <SigFilter filterKey="required" label="Required">
                    <SingleSelect options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]} />
                  </SigFilter>
                  )}
                  {!dictCategoryMode && !modelingMode && (
                  <SigFilter filterKey="enabled" label="Enabled">
                    <SingleSelect options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]} />
                  </SigFilter>
                  )}
                  <SigFilter filterKey="changedBy" label="Changed By">
                    <MultiSelect options={
                      [...new Set(group.attrs.map(a => a.lastEditedBy).filter(Boolean) as string[])]
                        .map(v => ({ value: v, label: v }))
                    } />
                  </SigFilter>
                  {(dictCategoryMode || modelingMode) && !(hideAudience || hideVisibilityColumns) && (
                  <SigFilter filterKey="visibility" label="Visibility">
                    <MultiSelect options={[
                      { value: 'Visible', label: 'Visible' },
                      { value: 'Visible if set', label: 'Visible If Set' },
                      { value: 'Invisible', label: 'Invisible' },
                    ]} />
                  </SigFilter>
                  )}
                </SigFilterBar>
                )
              }
              businessActionsSlot={
                hasGroupSelection ? (
                  <>
                    {group.id !== 'main' && (
                      <>
                        <ToolbarItem>
                          <Button design="Transparent" onClick={moveSelectedUp}>Move Up</Button>
                        </ToolbarItem>
                        <ToolbarItem>
                          <Button design="Transparent" onClick={moveSelectedDown}>Move Down</Button>
                        </ToolbarItem>
                      </>
                    )}
                    {(otherGroupsForMove.length > 0 || viewingMode) && (
                      <ToolbarItem>
                        <Button
                          id={`move-to-btn-${group.id}`}
                          design="Transparent"
                          endIcon="slim-arrow-down"
                          disabled={otherGroupsForMove.length === 0}
                          onClick={() => { if (otherGroupsForMove.length === 0) return; const m = moveToMenuRefs.current[group.id]; if (m) { m.opener = `move-to-btn-${group.id}`; m.open = true } }}
                        >Move to</Button>
                        <Menu ref={(el: any) => { if (el) moveToMenuRefs.current[group.id] = el }} onItemClick={(e: any) => {
                          const name = e.detail?.item?.text ?? e.detail?.item?.textContent
                          const target = otherGroupsForMove.find(g => g.name === name)
                          if (target) moveSelectedToGroup(target.id)
                        }}>
                          {otherGroupsForMove.map(g => <MenuItem key={g.id} text={g.name} />)}
                        </Menu>
                      </ToolbarItem>
                    )}
                  </>
                ) :
                viewingMode && group.id !== 'main' ? (
                <ToolbarItem>
                  <Button
                    design="Emphasized"
                    onClick={() => { setAssignSearch(''); setAssignDialogGroupId(group.id) }}
                  >
                    Assign Attribute
                  </Button>
                </ToolbarItem>
                ) :
                viewingMode ? undefined :
                (dictCategoryMode || (hideGrouping && group.id === 'main')) && group.id === 'main' ? undefined : (
                <ToolbarItem>
                  <Button
                    design="Emphasized"
                    onClick={() => setCreateAttrDialogGroupId(group.id)}
                  >
                    Add Attribute
                  </Button>
                </ToolbarItem>
                )
              }
              exportActionsSlot={
                (dictCategoryMode || hideGrouping || (viewingMode && group.id === 'main') || hasGroupSelection) ? undefined : (
                <>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="edit" design="Transparent" onClick={() => openEditGroupDialog(group.id)}>Edit Group</Button>
                  </ToolbarItem>
                  {modelingMode && !viewingMode && (
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="show" design="Transparent" onClick={() => setVisibilityGroupId(group.id)}>Set Visibility</Button>
                  </ToolbarItem>
                  )}
                  {viewingMode && (
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button
                      icon={group.enabled[viewingAudience] === false ? 'show' : 'hide'}
                      design="Transparent"
                      onClick={() => {
                        const isDisabled = group.enabled[viewingAudience] === false
                        setAttrGroups(prev => prev.map(g =>
                          g.id === group.id
                            ? { ...g, enabled: { ...g.enabled, [viewingAudience]: isDisabled } }
                            : g
                        ))
                        markDirty()
                      }}
                    >{group.enabled[viewingAudience] === false ? 'Enable' : 'Disable'}</Button>
                  </ToolbarItem>
                  )}
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="navigation-up-arrow" design="Transparent" disabled={groupIdx === 0} onClick={() => moveGroup(group.id, -1)}>Move Up</Button>
                  </ToolbarItem>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="navigation-down-arrow" design="Transparent" disabled={viewingMode ? groupIdx >= attrGroups.length - 2 : groupIdx === attrGroups.length - 1} onClick={() => moveGroup(group.id, 1)}>Move Down</Button>
                  </ToolbarItem>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="delete" design="Transparent" disabled={group.id === 'main' || group.attrs.length > 0} onClick={() => setDeleteGroupPending({ groupId: group.id, groupName: group.name })}>Delete</Button>
                  </ToolbarItem>
                </>
                )
              }
            >
              {group.expanded && (
                  <Table
                    className="attr-table"
                    style={{}}
                    onMoveOver={handleAttrMoveOver as any}
                    onMove={(e: any) => { if (viewingMode && group.id === 'main') return; handleAttrMove(group.id, e) }}
                    headerRow={
                      <TableHeaderRow>
                        <TableHeaderCell width="minmax(380px, 1fr)">
                          <span style={{ paddingInlineStart: group.attrs.length === 0 ? 'calc(1rem + 0.75rem + 16px + 0.75rem)' : 'calc(1rem + 0.75rem)' }}>Attribute Name</span>
                        </TableHeaderCell>
                        <TableHeaderCell width="96px">Class</TableHeaderCell>
                        <TableHeaderCell width="160px">Technical ID</TableHeaderCell>
                        {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Required</TableHeaderCell>}
                        {!dictCategoryMode && !modelingMode && (hideRequiredColumn || hideRequiredEnabled) && group.id === 'main' && <TableHeaderCell width="96px" />}
                        {!dictCategoryMode && !modelingMode && <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Enabled</TableHeaderCell>}
                        {singleAudienceMode && !(dictCategoryMode && group.id === 'main') && (
                          <TableHeaderCell width="140px">
                            <FlexBox alignItems="Center" style={{ gap: '4px' }}>
                              <span>Visibility</span>
                              <Button
                                id="visibility-info-btn"
                                icon="message-information"
                                design="Transparent"
                                onClick={() => setVisibilityInfoOpen(v => !v)}
                              />
                              <Popover
                                opener="visibility-info-btn"
                                open={visibilityInfoOpen}
                                placement="Bottom"
                                hideArrow={false}
                                className="no-padding-popover"
                                onClose={() => setVisibilityInfoOpen(false)}
                                style={{ maxWidth: '280px' }}
                              >
                                <div style={{ padding: '12px' }}>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                                    Visibility settings only apply to users with SAP Signavio Process Collaboration Hub license only.
                                  </Text>
                                </div>
                              </Popover>
                            </FlexBox>
                          </TableHeaderCell>
                        )}
                        {singleAudienceMode && dictCategoryMode && group.id === 'main' && (
                          <TableHeaderCell width="140px" />
                        )}
                        {!singleAudienceMode && viewingMode && modelOrigins && elementOrigins && (
                          <>
                            <TableHeaderCell width="160px">Visibility (Model)</TableHeaderCell>
                            <TableHeaderCell width="160px">Visibility (Element)</TableHeaderCell>
                          </>
                        )}
                        {!singleAudienceMode && !viewingMode && !(hideAudience || hideVisibilityColumns) && !(dictCategoryMode && group.id === 'main') && AUDIENCES.map(audience => (
                          <TableHeaderCell key={audience} width="120px">Visibility ({audience})</TableHeaderCell>
                        ))}
                        {!singleAudienceMode && !viewingMode && !(hideAudience || hideVisibilityColumns) && dictCategoryMode && group.id === 'main' && AUDIENCES.map(audience => (
                          <TableHeaderCell key={audience} width="120px" />
                        ))}
                        <TableHeaderCell width="44px" />
                      </TableHeaderRow>
                    }
                  >
                    {group.attrs.length === 0 && (
                      <TableRow className="empty-row">
                        <TableCell {...{ colSpan:
                          3
                          + (!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') ? 1 : 0)
                          + (!dictCategoryMode && !modelingMode ? 1 : 0)
                          + (singleAudienceMode ? 1 : viewingMode && modelOrigins && elementOrigins ? 2 : !(hideAudience || hideVisibilityColumns) ? AUDIENCES.length : 0)
                          + 1
                        } as any}>
                          <div style={{ padding: '1.25rem 1.25rem 1.25rem calc(1rem + 0.75rem + 16px + 0.75rem)', textAlign: 'left' }}>
                            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>{group.id !== 'main' ? 'No attributes yet' : 'No attributes. Choose Add to create one.'}</Text>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAttrs.map((attr) => {
                      const realIdx = group.attrs.findIndex(a => a.id === attr.id)
                      const otherGroups = attrGroups.filter(g => g.id !== group.id)
                      const isAttrDisabled = !modelingMode && !hideRequiredColumn && !attr.enabled
                      const isUngroupedDisabled = viewingMode && group.id === 'main' && attrGroups.length > 1
                      const isInvisible = (viewingMode && modelOrigins && elementOrigins && (
                        (modelOrigins.has(attr.id) ? attr.visibility[`Model_${viewingAudience}`] === 'Invisible' : true) &&
                        (elementOrigins.has(attr.id) ? attr.visibility[`Element_${viewingAudience}`] === 'Invisible' : true) &&
                        (modelOrigins.has(attr.id) || elementOrigins.has(attr.id))
                      )) || (singleAudienceMode && attr.visibility[viewingAudience] === 'Invisible')
                      const isDisabled = isAttrDisabled || isUngroupedDisabled || isInvisible

                      return (
                        <TableRow
                          key={attr.id}
                          {...((dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') ? {} : { movable: true })}
                          rowKey={attr.id}
                          data-attr-id={attr.id}
                        >
                          <TableCell>
                            <FlexBox alignItems="Center" style={{ gap: '0.75rem' }}>
                              {!(dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') && !(hideGrouping && group.id === 'main') && !(viewingMode && group.id === 'main') && (
                                <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0 }} />
                              )}
                              {((dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') || (hideGrouping && group.id === 'main') || (viewingMode && group.id === 'main')) && (
                                <div style={{ width: '1rem', flexShrink: 0 }} />
                              )}
                              <FlexBox direction="Column" style={{ gap: '0.125rem', opacity: isDisabled ? 0.45 : 1 }}>
                                <FlexBox alignItems="Center" style={{ gap: '0.375rem' }}>
                                  <Text style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{attr.name}</Text>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>·</Text>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr.type}</Text>
                                </FlexBox>
                                {attr.description && (
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr.description}</Text>
                                )}
                                {attr.lastEditedBy && attr.attrClass !== 'Standard' && (
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                                    Last edited by {attr.lastEditedBy}{attr.lastEditedAt ? ` on ${attr.lastEditedAt}` : ''}
                                  </Text>
                                )}
                              </FlexBox>
                            </FlexBox>
                          </TableCell>
                          <TableCell>
                            <Text style={{ fontSize: 'var(--sapFontSize)', opacity: isDisabled ? 0.45 : 1 }}>{attr.attrClass}</Text>
                          </TableCell>
                          <TableCell>
                            <Text style={{ fontSize: 'var(--sapFontSize)', opacity: isDisabled ? 0.45 : 1 }}>{attr.id}</Text>
                          </TableCell>
                          {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && (
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <CheckBox
                                accessibleName={`Required: ${attr.name}`}
                                checked={attr.required}
                                onChange={e => updateAttr(group.id, attr.id, { required: (e.target as unknown as HTMLInputElement).checked })}
                              />
                            </FlexBox>
                          </TableCell>
                          )}
                          {!dictCategoryMode && !modelingMode && (hideRequiredColumn || hideRequiredEnabled) && group.id === 'main' && (
                          <TableCell />
                          )}
                          {!dictCategoryMode && !modelingMode && (
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <CheckBox
                                accessibleName={`Enabled: ${attr.name}`}
                                checked={attr.enabled}
                                onChange={e => updateAttr(group.id, attr.id, { enabled: (e.target as unknown as HTMLInputElement).checked })}
                              />
                            </FlexBox>
                          </TableCell>
                          )}
                          {singleAudienceMode && !(dictCategoryMode && group.id === 'main') && (
                          <TableCell>
                            <Select
                              accessibleName={`Visibility for ${attr.name}`}
                              style={{ width: '100%' }}
                              disabled={group.enabled[viewingAudience] === false}
                              onChange={(e: any) => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [viewingAudience]: e.detail.selectedOption?.textContent as AttrVis } })}
                            >
                              {group.enabled[viewingAudience] === false
                                ? <Option selected>Invisible</Option>
                                : (['Visible', 'Visible if set', 'Invisible'] as AttrVis[]).map(v => (
                                  <Option key={v} selected={(attr.visibility[viewingAudience] ?? 'Visible') === v}>{v}</Option>
                                ))
                              }
                            </Select>
                          </TableCell>
                          )}
                          {singleAudienceMode && dictCategoryMode && group.id === 'main' && <TableCell />}
                          {!singleAudienceMode && viewingMode && modelOrigins && elementOrigins && (
                          <>
                            <TableCell>
                              {modelOrigins.has(attr.id) ? (
                                <Select
                                  accessibleName={`Model visibility for ${attr.name}`}
                                  style={{ width: '100%' }}
                                  disabled={group.enabled[viewingAudience] === false || (viewingMode && group.id === 'main' && attrGroups.length > 1)}
                                  onChange={(e: any) => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [`Model_${viewingAudience}`]: e.detail.selectedOption?.textContent as AttrVis } })}
                                >
                                  {(['Visible', 'Visible if set', 'Invisible'] as AttrVis[]).map(v => (
                                    <Option key={v} selected={(attr.visibility[`Model_${viewingAudience}`] ?? 'Visible') === v}>{v}</Option>
                                  ))}
                                </Select>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {elementOrigins.has(attr.id) ? (
                                <Select
                                  accessibleName={`Element visibility for ${attr.name}`}
                                  style={{ width: '100%' }}
                                  disabled={group.enabled[viewingAudience] === false || (viewingMode && group.id === 'main' && attrGroups.length > 1)}
                                  onChange={(e: any) => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [`Element_${viewingAudience}`]: e.detail.selectedOption?.textContent as AttrVis } })}
                                >
                                  {(['Visible', 'Visible if set', 'Invisible'] as AttrVis[]).map(v => (
                                    <Option key={v} selected={(attr.visibility[`Element_${viewingAudience}`] ?? 'Visible') === v}>{v}</Option>
                                  ))}
                                </Select>
                              ) : null}
                            </TableCell>
                          </>
                          )}
                          {!singleAudienceMode && !viewingMode && !(hideAudience || hideVisibilityColumns) && !(dictCategoryMode && group.id === 'main') && AUDIENCES.map(audience => (
                          <TableCell key={audience}>
                            <Select
                              accessibleName={`Visibility for ${attr.name} – ${audience}`}
                              style={{ width: '100%' }}
                              disabled={group.enabled[audience] === false}
                              onChange={(e: any) => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [audience]: e.detail.selectedOption?.textContent as AttrVis } })}
                            >
                              {group.enabled[audience] === false
                                ? <Option selected>Invisible</Option>
                                : (['Visible', 'Visible if set', 'Invisible'] as AttrVis[]).map(v => (
                                  <Option key={v} selected={attr.visibility[audience] === v}>{v}</Option>
                                ))
                              }
                            </Select>
                          </TableCell>
                          ))}
                          {!singleAudienceMode && !viewingMode && !(hideAudience || hideVisibilityColumns) && dictCategoryMode && group.id === 'main' && AUDIENCES.map(audience => (
                          <TableCell key={audience} />
                          ))}
                          <TableCell className="attr-overflow-cell" style={{ position: 'sticky', right: 0 } as any}>
                            {!(dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') && !(hideGrouping && group.id === 'main') && (
                            <FlexBox justifyContent="End">
                              <Button
                                id={`overflow-btn-${attr.id}`}
                                icon="overflow"
                                design="Transparent"
                                tooltip={`More options for ${attr.name}`}
                                onClick={() => setOpenMenuId(openMenuId === attr.id ? null : attr.id)}
                              />
                              <Menu
                                opener={`overflow-btn-${attr.id}`}
                                open={openMenuId === attr.id}
                                onClose={() => setOpenMenuId(null)}
                                onItemClick={(e: any) => {
                                  const text = e.detail?.item?.text ?? e.detail?.item?.textContent
                                  const selectedIds = viewingMode ? (viewingSelectedRows[group.id] ?? new Set()) : new Set<string>()
                                  const isMultiOp = viewingMode && selectedIds.size > 1 && selectedIds.has(attr.id)
                                  if (text === 'Edit') { setEditAttrPending({ groupId: group.id, attrId: attr.id }); setEditAttrDialogOpen(true) }
                                  else if (text === 'Move Up') {
                                    if (isMultiOp) {
                                      setAttrGroups(prev => prev.map(g => {
                                        if (g.id !== group.id) return g
                                        const attrs = [...g.attrs]
                                        const indices = attrs.map((a, i) => selectedIds.has(a.id) ? i : -1).filter(i => i >= 0).sort((a, b) => a - b)
                                        if (indices[0] === 0) return g
                                        indices.forEach(i => { const tmp = attrs[i - 1]; attrs[i - 1] = attrs[i]; attrs[i] = tmp })
                                        return { ...g, attrs }
                                      })); markDirty()
                                    } else moveAttr(group.id, realIdx, -1)
                                  }
                                  else if (text === 'Move Down') {
                                    if (isMultiOp) {
                                      setAttrGroups(prev => prev.map(g => {
                                        if (g.id !== group.id) return g
                                        const attrs = [...g.attrs]
                                        const indices = attrs.map((a, i) => selectedIds.has(a.id) ? i : -1).filter(i => i >= 0).sort((a, b) => b - a)
                                        if (indices[0] === attrs.length - 1) return g
                                        indices.forEach(i => { const tmp = attrs[i + 1]; attrs[i + 1] = attrs[i]; attrs[i] = tmp })
                                        return { ...g, attrs }
                                      })); markDirty()
                                    } else moveAttr(group.id, realIdx, 1)
                                  }
                                  else if (text === 'Remove') setDeleteAttrPending({ groupId: group.id, attrId: attr.id, attrName: attr.name })
                                  else {
                                    const targetGroup = otherGroups.find(g => g.name === text)
                                    if (targetGroup) {
                                      if (isMultiOp) {
                                        selectedIds.forEach(id => moveAttrToGroup(group.id, id, targetGroup.id))
                                        setViewingSelectedRows(prev => ({ ...prev, [group.id]: new Set() }))
                                      } else {
                                        moveAttrToGroup(group.id, attr.id, targetGroup.id)
                                      }
                                    }
                                  }
                                  setOpenMenuId(null)
                                }}
                              >
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && !viewingMode && <MenuItem text="Edit" icon="edit" />}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && !viewingMode && <MenuSeparator />}
                                {!(viewingMode && group.id === 'main') && <MenuItem text="Move Up" icon="navigation-up-arrow" {...{ disabled: realIdx === 0 } as any} />}
                                {!(viewingMode && group.id === 'main') && <MenuItem text="Move Down" icon="navigation-down-arrow" {...{ disabled: realIdx === group.attrs.length - 1 } as any} />}
                                {!(dictCategoryMode && group.id === 'main') && !hideGrouping && !dictCategoryMode && (
                                  <MenuItem text="Move to" icon="move" {...{ disabled: otherGroups.length === 0 } as any}>
                                    {otherGroups.map(targetGroup => (
                                      <MenuItem key={targetGroup.id} text={targetGroup.name} />
                                    ))}
                                  </MenuItem>
                                )}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && !viewingMode && <MenuSeparator />}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && !viewingMode && <MenuItem text="Remove" icon="delete" />}
                              </Menu>
                            </FlexBox>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {viewingMode && group.attrs.length > 0 && <TableSelectionMulti slot="features" ref={(el: any) => { if (el) selectionFeatureRefs.current[group.id] = el }} onChange={(e: any) => {
                      const selFeature = e.target as any
                      const selected = selFeature?.getSelectedRows?.() as HTMLElement[] | undefined
                      const newSet = new Set((selected ?? []).map(r => r.getAttribute('row-key') ?? '').filter(Boolean))
                      // Clear other groups' selections when this group gets a selection
                      if (newSet.size > 0) {
                        Object.entries(selectionFeatureRefs.current).forEach(([gId, el]) => {
                          if (gId !== group.id && el?.selected !== undefined) el.selected = ''
                        })
                      }
                      setViewingSelectedRows(() => {
                        const next: Record<string, Set<string>> = {}
                        if (newSet.size > 0) next[group.id] = newSet
                        else next[group.id] = new Set()
                        return next
                      })
                    }} />}
                  </Table>
              )}
            </SigTableWrapper>
          )})()}
          </div>
        )
      })}

      <AttributeGroupDialog
        open={groupDialogOpen}
        editName={editingGroupId ? (attrGroups.find(g => g.id === editingGroupId)?.name) : undefined}
        onClose={() => setGroupDialogOpen(false)}
        onConfirm={handleGroupDialogConfirm}
      />
      {modelingMode && (
        <AttributeGroupVisibilityDialog
          open={visibilityGroupId !== null}
          groupName={attrGroups.find(g => g.id === visibilityGroupId)?.name ?? ''}
          initialVisibility={attrGroups.find(g => g.id === visibilityGroupId)?.enabled ?? Object.fromEntries(AUDIENCES.map(a => [a, true]))}
          onClose={() => setVisibilityGroupId(null)}
          onSave={visibility => {
            setAttrGroups(prev => prev.map(g => g.id === visibilityGroupId ? { ...g, enabled: visibility } : g))
            markDirty()
            showToast('Attribute group visibility updated')
            setVisibilityGroupId(null)
          }}
        />
      )}
      {assignDialogGroupId && (() => {
        const targetGroup = attrGroups.find(g => g.id === assignDialogGroupId)
        const targetIds = new Set(targetGroup?.attrs.map(a => a.id) ?? [])
        const availableAttrs = attrGroups.flatMap(g => g.id !== assignDialogGroupId ? g.attrs : []).filter(a => !targetIds.has(a.id))
        const filteredAttrs = assignSearch ? availableAttrs.filter(a => a.name.toLowerCase().includes(assignSearch.toLowerCase())) : availableAttrs
        return (
          <Dialog
            open
            onClose={() => { setAssignDialogGroupId(null); setAssignPendingIds(new Set()) }}
            headerText={`Assign Attributes to ${targetGroup?.name ?? ''}`}
            style={{ width: '560px' }}
            className="no-padding-dialog"
          >
            <div style={{ padding: '12px', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <Input
                placeholder="Search attributes"
                value={assignSearch}
                showClearIcon
                style={{ width: '100%' }}
                onInput={(e: any) => setAssignSearch(e.target?.value ?? '')}
                icon={<Icon slot="icon" name="search" />}
              />
            </div>
            <List selectionMode="Multiple" separators="Inner" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {filteredAttrs.map(attr => (
                <ListItemStandard
                  key={attr.id}
                  type="Active"
                  selected={assignPendingIds.has(attr.id)}
                  onClick={() => setAssignPendingIds(prev => { const next = new Set(prev); next.has(attr.id) ? next.delete(attr.id) : next.add(attr.id); return next })}
                >{attr.name}</ListItemStandard>
              ))}
            </List>
            <Bar slot="footer" design="Footer">
              <Button slot="endContent" design="Emphasized" disabled={assignPendingIds.size === 0} onClick={() => {
                assignPendingIds.forEach(id => moveAttrToGroup(attrGroups.find(g => g.attrs.some(a => a.id === id))!.id, id, assignDialogGroupId!))
                setAssignDialogGroupId(null)
                setAssignPendingIds(new Set())
              }}>Assign</Button>
              <Button slot="endContent" design="Transparent" onClick={() => { setAssignDialogGroupId(null); setAssignPendingIds(new Set()) }}>Cancel</Button>
            </Bar>
          </Dialog>
        )
      })()}
      <CreateAttributeDialog
        open={createAttrDialogGroupId !== null}
        dialogTitle="Add Attribute"
        showReuseSection
        onClose={() => setCreateAttrDialogGroupId(null)}
        hideAssignSection={hideAssignSection}
        defaultAssignedTo={defaultAssignedTo}
        assignableAssetTypes={assignableAssetTypes}
        modelingSubElements={modelingSubElements}
        dictMode={dictMode}
        dictCategories={dictCategories}
        modelingMode={modelingMode}
        hideAudience={hideAudience}
        onCreate={(type: AttributeType, name: string) => {
          if (createAttrDialogGroupId) {
            const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
            const newAttr: AttrRow = {
              id: `attr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: name || 'New Attribute',
              type,
              description: '',
              attrClass: 'Custom',
              required: false,
              enabled: true,
              visibility: vis,
            }
            setAttrGroups(prev => prev.map(g => g.id === createAttrDialogGroupId ? { ...g, attrs: [...g.attrs, newAttr] } : g))
            showToast('Attribute added')
          }
          setCreateAttrDialogGroupId(null)
        }}
        onReuseAdd={() => {
        }}
      />
      {editAttrDialogOpen && editAttrPending && (() => {
        const grp = attrGroups.find(g => g.id === editAttrPending.groupId)
        const attr = grp?.attrs.find(a => a.id === editAttrPending.attrId)
        if (!attr) return null
        return (
          <CreateAttributeDialog
            open
            editMode
            initialType={attr.type as AttributeType}
            initialName={attr.name}
            initialDescription={attr.description}
            hideAssignSection={hideAssignSection}
            defaultAssignedTo={defaultAssignedTo}
            assignableAssetTypes={assignableAssetTypes}
            modelingSubElements={modelingSubElements}
            dictMode={dictMode}
            dictCategories={dictCategories}
            modelingMode={modelingMode}
            hideAudience={hideAudience}
            onClose={() => { setEditAttrDialogOpen(false); setEditAttrPending(null) }}
            onCreate={(type: AttributeType, name: string) => {
              setAttrGroups(prev => prev.map(g => g.id === editAttrPending.groupId
                ? { ...g, attrs: g.attrs.map(a => a.id === editAttrPending.attrId ? { ...a, name, type } : a) }
                : g
              ))
              setEditAttrDialogOpen(false)
              setEditAttrPending(null)
              showToast('Attribute updated')
            }}
          />
        )
      })()}
      <MessageBox
        open={deleteAttrPending !== null}
        type="Warning"
        titleText={`Remove Attribute ${deleteAttrPending?.attrName ?? ''}`}
        actions={(dictCategoryMode || modelingMode) ? ['Remove', 'Delete Completely', 'Cancel'] : ['Remove', 'Cancel']}
        emphasizedAction="Remove"
        style={{ width: '500px' }}
        onClose={(action) => {
          if ((action === 'Remove' || action === 'Delete Completely') && deleteAttrPending) {
            removeAttr(deleteAttrPending.groupId, deleteAttrPending.attrId)
            showToast(action === 'Remove' ? 'Attribute removed' : 'Attribute deleted')
          }
          setDeleteAttrPending(null)
        }}
      >
        <div style={{ padding: '16px' }}>
          {dictCategoryMode
            ? 'Do you want to remove the attribute from this dictionary category only or delete it completely?'
            : modelingMode
            ? modelLevelMode
              ? 'Do you want to remove the attribute from the model level only or delete it completely?'
              : 'Do you want to remove the attribute from the selected element only or delete it completely?'
            : 'Removing this attribute will also delete all associated data from the asset. This action cannot be undone.'
          }
        </div>
      </MessageBox>
      <MessageBox
        open={deleteGroupPending !== null}
        type="Warning"
        titleText={`Delete Attribute Group ${deleteGroupPending?.groupName ?? ''}`}
        actions={['Delete', 'Cancel']}
        emphasizedAction="Delete"
        onClose={(action) => {
          if (action === 'Delete' && deleteGroupPending) {
            deleteGroup(deleteGroupPending.groupId)
          }
          setDeleteGroupPending(null)
        }}
      >
        <div style={{ padding: '16px' }}>Delete attribute group?</div>
      </MessageBox>
      <Toast open={!!toast} placement="BottomCenter" onClose={() => setToast(null)}>
        {toast}
      </Toast>
    </div>
  )
}
