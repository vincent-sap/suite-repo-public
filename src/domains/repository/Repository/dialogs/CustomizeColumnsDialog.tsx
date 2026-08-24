import React, { useState } from 'react'
import { Dialog, Button, Bar, CheckBox, List, ListItemStandard, Input, Icon, Label, Switch } from '@ui5/webcomponents-react'
import type { ColumnDef } from '../data'
import { DEFAULT_COLUMNS } from '../data'

interface CustomizeColumnsDialogProps {
  open: boolean
  columns: ColumnDef[]
  onSave: (cols: ColumnDef[]) => void
  onClose: () => void
  defaultColumns?: ColumnDef[]
}

export default function CustomizeColumnsDialog({ open, columns, onSave, onClose, defaultColumns }: CustomizeColumnsDialogProps) {
  const [draftColumns, setDraftColumns] = useState(() => columns.map(c => ({ ...c })))
  const [columnSearch, setColumnSearch] = useState('')
  const [hideUnselected, setHideUnselected] = useState(false)
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setDraftColumns(columns.map(c => ({ ...c })))
      setColumnSearch('')
      setHideUnselected(false)
      setHoveredColumnId(null)
    }
  }, [open])

  const toggleDraftColumn = (id: string) =>
    setDraftColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c))

  const moveDraftColumn = (id: string, dir: -1 | 1) => {
    setDraftColumns(prev => {
      const arr = [...prev]
      const idx = arr.findIndex(c => c.id === id)
      const target = idx + dir
      if (target < 0 || target >= arr.length) return arr
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }

  const moveToTop = (id: string) => {
    setDraftColumns(prev => {
      const arr = [...prev]
      const idx = arr.findIndex(c => c.id === id)
      if (idx <= 0) return arr
      const [item] = arr.splice(idx, 1)
      arr.unshift(item)
      return arr
    })
  }

  const moveToBottom = (id: string) => {
    setDraftColumns(prev => {
      const arr = [...prev]
      const idx = arr.findIndex(c => c.id === id)
      if (idx === arr.length - 1) return arr
      const [item] = arr.splice(idx, 1)
      arr.push(item)
      return arr
    })
  }

  const filtered = draftColumns.filter(c => {
    const matchesSearch = c.label.toLowerCase().includes(columnSearch.toLowerCase())
    const matchesHide = !hideUnselected || c.visible
    return matchesSearch && matchesHide
  })

  const selectableColumns = draftColumns.filter(c => !c.required)
  const selectedCount = draftColumns.filter(c => c.visible).length
  const totalCount = draftColumns.length
  const allSelectableVisible = selectableColumns.every(c => c.visible)
  const someSelectableVisible = selectableColumns.some(c => c.visible)
  const selectAllIndeterminate = someSelectableVisible && !allSelectableVisible

  const toggleSelectAll = () => {
    const shouldSelectAll = !allSelectableVisible
    setDraftColumns(prev => prev.map(c => c.required ? c : { ...c, visible: shouldSelectAll }))
  }

  return (
    <Dialog
      open={open}
      headerText="Customize Columns"
      onClose={onClose}
    >
      <div style={{ width: '460px', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Input
            placeholder="Search"
            value={columnSearch}
            showClearIcon
            style={{ flex: 1 }}
            icon={<Icon slot="icon" name="search" />}
            onInput={e => setColumnSearch((e.target as unknown as HTMLInputElement).value)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <Label style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>Hide Unselected</Label>
            <Switch checked={hideUnselected} onChange={() => setHideUnselected(v => !v)} />
          </div>
        </div>
      </div>

      <div style={{ width: '460px', display: 'flex', flexDirection: 'column' }}>
        {/* Select-all header row */}
        <div
          style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', height: '44px', borderBottom: '1px solid var(--sapList_BorderColor)', background: 'var(--sapList_HeaderBackground)', cursor: 'pointer' }}
          onClick={toggleSelectAll}
        >
          <CheckBox
            checked={selectAllIndeterminate ? false : allSelectableVisible}
            indeterminate={selectAllIndeterminate}
            onChange={toggleSelectAll}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
          <span style={{ fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSize)', fontWeight: 700, marginLeft: '0.5rem' }}>
            Columns ({selectedCount}/{totalCount})
          </span>
        </div>

        {/* Column list */}
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <List separators="Inner" selectionMode="None">
            {filtered.map(col => {
              const realIdx = draftColumns.findIndex(c => c.id === col.id)
              const isHovered = hoveredColumnId === col.id
              return (
                <ListItemStandard
                  key={col.id}
                  selected={col.visible}
                  type="Active"
                  onClick={() => { if (!col.required) toggleDraftColumn(col.id) }}
                  onMouseEnter={() => setHoveredColumnId(col.id)}
                  onMouseLeave={() => setHoveredColumnId(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <CheckBox
                      checked={col.visible}
                      disabled={col.required}
                      onChange={() => toggleDraftColumn(col.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <span style={{ flex: 1, fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSize)', color: col.required ? 'var(--sapContent_LabelColor)' : 'inherit' }}>
                      {col.label}
                    </span>
                    {isHovered && !col.required && (
                      <div style={{ display: 'flex' }}>
                        <Button icon="collapse-group" design="Transparent" tooltip="Move to top" disabled={realIdx === 0} onClick={(e: any) => { e.stopPropagation?.(); moveToTop(col.id) }} />
                        <Button icon="slim-arrow-up" design="Transparent" tooltip="Move up" disabled={realIdx === 0} onClick={(e: any) => { e.stopPropagation?.(); moveDraftColumn(col.id, -1) }} />
                        <Button icon="slim-arrow-down" design="Transparent" tooltip="Move down" disabled={realIdx === draftColumns.length - 1} onClick={(e: any) => { e.stopPropagation?.(); moveDraftColumn(col.id, 1) }} />
                        <Button icon="expand-group" design="Transparent" tooltip="Move to bottom" disabled={realIdx === draftColumns.length - 1} onClick={(e: any) => { e.stopPropagation?.(); moveToBottom(col.id) }} />
                      </div>
                    )}
                  </div>
                </ListItemStandard>
              )
            })}
            {filtered.length === 0 && (
              <ListItemStandard type="Inactive">
                <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No columns match your search</span>
              </ListItemStandard>
            )}
          </List>
        </div>
      </div>

      <Bar slot="footer" design="Footer">
        <Button slot="startContent" design="Transparent" onClick={() => setDraftColumns((defaultColumns ?? DEFAULT_COLUMNS).map(c => ({ ...c })))}>Reset to Default</Button>
        <Button slot="endContent" design="Emphasized" onClick={() => onSave(draftColumns)}>Save</Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}
