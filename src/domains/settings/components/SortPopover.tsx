import { useRef } from 'react'
import { Popover, SegmentedButton, SegmentedButtonItem, List, ListItemCustom, Text } from '@ui5/webcomponents-react'
import type { PopoverDomRef } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

export type SortOption = { key: string; type: 'text' | 'date' | 'none'; label?: string }

function sortDirLabel(type: 'text' | 'date' | 'none', dir: 'asc' | 'desc'): string {
  if (type === 'none') return ''
  if (type === 'date') return dir === 'asc' ? 'Oldest First' : 'Newest First'
  return dir === 'asc' ? 'A–Z' : 'Z–A'
}

type Props = {
  anchorId: string
  sortBy: string
  sortDir: 'asc' | 'desc'
  options: SortOption[]
  onSortByChange: (key: string) => void
  onSortDirChange: (dir: 'asc' | 'desc') => void
}

export function SortPopover({ anchorId, sortBy, sortDir, options, onSortByChange, onSortDirChange }: Props) {
  const popoverRef = useRef<PopoverDomRef>(null)

  return (
    <>
      <span id={anchorId}>
        <SigChipV2
          label="Sort by"
          value={options.find(o => o.key === sortBy)?.label ?? sortBy}
          trailingIcon="slim-arrow-down"
          onClick={() => {
            if (popoverRef.current) {
              popoverRef.current.opener = anchorId
              popoverRef.current.open = true
            }
          }}
        />
      </span>
      <Popover
        ref={popoverRef}
        placement="Bottom"
        horizontalAlign="Start"
        hideArrow
        className="no-padding-popover"
        style={{ width: '260px' }}
        onClose={() => { if (popoverRef.current) popoverRef.current.open = false }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.5rem 1rem' }}>
            <SegmentedButton itemsFitContent={false} style={{ width: '100%' }}>
              <SegmentedButtonItem icon="sort-ascending" accessibleName="Ascending" selected={sortDir === 'asc'} onClick={() => onSortDirChange('asc')}>Ascending</SegmentedButtonItem>
              <SegmentedButtonItem icon="sort-descending" accessibleName="Descending" selected={sortDir === 'desc'} onClick={() => onSortDirChange('desc')}>Descending</SegmentedButtonItem>
            </SegmentedButton>
          </div>
          <List
            separators="None"
            selectionMode="Single"
            onItemClick={(e: any) => {
              const key = (e.detail.item as HTMLElement).dataset.sortKey
              if (key) { onSortByChange(key); if (popoverRef.current) popoverRef.current.open = false }
            }}
          >
            {options.map(opt => (
              <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.label ?? opt.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 6px 0 3px', height: '32px' }}>
                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{opt.label ?? opt.key}</Text>
                  {opt.type !== 'none' && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{sortDirLabel(opt.type, sortDir)}</Text>}
                </div>
              </ListItemCustom>
            ))}
          </List>
        </div>
      </Popover>
    </>
  )
}
