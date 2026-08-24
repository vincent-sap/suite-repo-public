import { useState, useMemo, useRef } from 'react'
import {
  Dialog, Bar, Button, Text, RadioButton, Input, List, ListItemCustom, Icon,
  AnalyticalTable, Popover, type PopoverDomRef, type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { DictEntry } from '../dictionaryData'
import { entryBg, entryIconColor, CAT_TYPE_ICON } from '../dictionaryData'
import type { DictCategory, DictCategoryType } from '../../../../contexts/WorkspaceContext'

interface Props {
  open: boolean
  entries: DictEntry[]
  allEntries: DictEntry[]
  categories: DictCategory[]
  onClose: () => void
  onMerge: (keepId: string, mergeIds: string[]) => void
}

type AttrRow = { label: string; values: (string | null)[] }

function buildAttrRows(entries: DictEntry[]): AttrRow[] {
  const rows: AttrRow[] = [
    { label: 'Name', values: entries.map(e => e.name) },
    { label: 'Description', values: entries.map(e => e.description ?? null) },
    { label: 'Status', values: entries.map(e => e.status) },
    { label: 'Created', values: entries.map(e => e.created) },
    { label: 'Changed', values: entries.map(e => e.changed) },
  ]
  const withGroups = entries.find(e => e.attributeGroups?.length)
  if (withGroups?.attributeGroups) {
    for (const group of withGroups.attributeGroups) {
      for (const attr of group.attrs) {
        if (rows.find(r => r.label === attr.label)) continue
        rows.push({
          label: attr.label,
          values: entries.map(e => {
            const a = e.attributeGroups?.flatMap(g => g.attrs).find(a2 => a2.label === attr.label)
            return a?.value ?? (a?.values ? a.values.join(', ') : null)
          }),
        })
      }
    }
  }
  return rows
}

export default function MergeDictionaryEntriesDialog({ open, entries: initialEntries, allEntries, categories, onClose, onMerge }: Props) {
  const [entries, setEntries] = useState<DictEntry[]>(initialEntries)
  const [targetIdx, setTargetIdx] = useState(0)
  // selectedValues[rowIdx] = which entry column (0..n) is selected for that attr row
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const popoverRef = useRef<PopoverDomRef>(null)

  const attrRows = useMemo(() => buildAttrRows(entries), [entries])
  const availableToAdd = allEntries.filter(e => !entries.find(ex => ex.id === e.id))
  const filteredAvailable = pickerQuery.trim()
    ? availableToAdd.filter(e => e.name.toLowerCase().includes(pickerQuery.toLowerCase()))
    : availableToAdd

  const getSelectedCol = (rowIdx: number) => selectedValues[rowIdx] ?? 0

  const addEntry = (entry: DictEntry) => {
    setEntries(prev => [...prev, entry])
    setPickerOpen(false)
    setPickerQuery('')
    if (popoverRef.current) popoverRef.current.open = false
  }

  const removeEntry = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx))
    if (targetIdx >= idx && targetIdx > 0) setTargetIdx(t => t - 1)
    // Reset row selections that pointed to removed col
    setSelectedValues(prev => {
      const next: Record<number, number> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const col = Number(v)
        next[Number(k)] = col > idx ? col - 1 : col === idx ? 0 : col
      })
      return next
    })
  }

  const handleMerge = () => {
    const target = entries[targetIdx]
    const others = entries.filter((_, i) => i !== targetIdx)
    onMerge(target.id, others.map(e => e.id))
    onClose()
  }

  // Build columns dynamically based on current entries
  const columns: AnalyticalTableColumnDefinition[] = useMemo(() => {
    const DIALOG_WIDTH = 900
    const LABEL_WIDTH = 180
    const MIN_COL_WIDTH = 300
    const entryCols = entries.length + 1 // entries + add column
    const colWidth = Math.max(MIN_COL_WIDTH, Math.floor((DIALOG_WIDTH - LABEL_WIDTH) / entryCols))

    const cols: AnalyticalTableColumnDefinition[] = [
      // Attribute label column
      {
        id: 'label',
        Header: '',
        accessor: 'label',
        width: LABEL_WIDTH,
        disableSortBy: true,
        Cell: ({ row }: any) => {
          const LANG_CHIPS = ['EN', 'DE', 'FR', 'EN', 'DE']
          const lang = LANG_CHIPS[row.index % LANG_CHIPS.length]
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)', whiteSpace: 'nowrap' }}>
                [Attribute]
              </Text>
              <SigChipV2 value={lang} design="none" condensed />
            </div>
          )
        },
      },
      // One column per entry
      ...entries.map((entry, colIdx) => ({
        id: `entry-${entry.id}`,
        accessor: (row: AttrRow) => row.values[colIdx] ?? '—',
        width: colWidth,
        disableSortBy: true,
        Header: () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
            <RadioButton
              name="merge-target"
              checked={targetIdx === colIdx}
              onChange={() => setTargetIdx(colIdx)}
              style={{ marginLeft: '-0.5rem', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0, display: 'block' }}>
                {entry.name}
              </Text>
              {targetIdx === colIdx && (
                <div style={{ flexShrink: 0 }}>
                  <SigChipV2 value="Target" design="indication5" condensed />
                </div>
              )}
            </div>
            {entries.length > 1 && (
              <Button
                icon="decline"
                design="Transparent"
                onClick={() => removeEntry(colIdx)}
                style={{ flexShrink: 0, marginLeft: 'auto' }}
              />
            )}
          </div>
        ),
        Cell: ({ row }: any) => {
          const rowIdx: number = row.index
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RadioButton
                name={`attr-row-${rowIdx}`}
                checked={getSelectedCol(rowIdx) === colIdx}
                onChange={() => setSelectedValues(prev => ({ ...prev, [rowIdx]: colIdx }))}
                style={{ marginLeft: '-0.5rem', flexShrink: 0 }}
              />
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                [Attribute Value]
              </Text>
            </div>
          )
        },
      } as unknown as AnalyticalTableColumnDefinition)),
      // "+" add column — always shown
      {
        id: 'add',
        Header: () => (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              id="merge-add-btn"
              icon="add"
              design="Transparent"
              onClick={() => {
                setPickerOpen(true)
                if (popoverRef.current) {
                  popoverRef.current.opener = 'merge-add-btn'
                  popoverRef.current.open = true
                }
              }}
            />
          </div>
        ),
        accessor: () => null,
        width: colWidth,
        disableSortBy: true,
        Cell: () => null,
      },
    ]
    return cols
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, targetIdx, selectedValues, availableToAdd.length])

  return (
    <>
      <Dialog
        open={open}
        headerText="Merge Dictionary Entries"
        style={{ width: '900px', maxWidth: '98vw' }}
        footer={
          <Bar design="Footer"
            endContent={
              <>
                <Button design="Emphasized" disabled={entries.length < 2} onClick={handleMerge}>Merge</Button>
                <Button design="Transparent" onClick={onClose}>Cancel</Button>
              </>
            }
          />
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
            Multiple dictionary entries are merged to one entry. Relevant documents, linked dictionary items and links are added to the target entry.
          </Text>
          <AnalyticalTable
            data={attrRows}
            columns={columns}
            selectionMode="None"
            minRows={0}
            visibleRows={attrRows.length}
            scaleWidthMode="Smart"
            style={{ width: '100%' }}
            headerRowHeight={36}
            rowHeight={36}
          />
        </div>
      </Dialog>

      {/* Add entry popover */}
      <Popover
        ref={popoverRef}
        opener="merge-add-btn"
        open={pickerOpen}
        placement="Bottom"
        horizontalAlign="End"
        hideArrow
        className="no-padding-popover"
        onClose={() => { setPickerOpen(false); setPickerQuery('') }}
        style={{ width: '320px' } as any}
        header={
          <div style={{ padding: '8px 0', width: '100%', boxSizing: 'border-box' }}>
            <Input
              placeholder="Search dictionary entries"
              type={'Search' as any}
              value={pickerQuery}
              onInput={(e: any) => setPickerQuery(e.target?.value ?? '')}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        }
      >
        <List separators="Inner" style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {filteredAvailable.length === 0 ? (
              <ListItemCustom>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', padding: '8px' }}>No entries found</Text>
              </ListItemCustom>
            ) : filteredAvailable.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId)
              const parentCat = cat?.parentId ? categories.find(c => c.id === cat.parentId) : null
              const descText = [parentCat?.name, cat?.name].filter(Boolean).join(' / ')
              const catType = (cat?.type ?? 'Others') as DictCategoryType
              const bg = entryBg(catType)
              const iconColor = entryIconColor(catType)
              return (
                <ListItemCustom key={entry.id} type="Active" onClick={() => addEntry(entry)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', width: '100%' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={(CAT_TYPE_ICON as Record<string, string>)[catType] ?? 'document'} style={{ width: '16px', height: '16px', color: iconColor }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '4px' }}>
                      <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{descText}</Text>
                    </div>
                  </div>
                </ListItemCustom>
              )
            })}
          </List>
      </Popover>
    </>
  )
}
