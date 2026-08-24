import { useRef } from 'react'
import {
  Popover, List, ListItemStandard, SegmentedButton, SegmentedButtonItem,
  ToolbarItem, FlexBox, type PopoverDomRef,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import s from '../../../domains/settings/components/SettingsPage.module.css'

interface TableSortProps {
  sortOptions: string[]
  selectedOption?: string
  direction?: 'asc' | 'desc'
}

export function TableSort({ sortOptions, selectedOption, direction = 'asc' }: TableSortProps) {
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const chipId = 'tpl-sort-chip'

  return (
    <ToolbarItem>
      <SigChipV2
        id={chipId}
        label="Sort by"
        value={selectedOption ?? sortOptions[0]}
        leadingIcon={direction === 'asc' ? 'sort-ascending' : 'sort-descending'}
        trailingIcon="slim-arrow-down"
        onClick={() => {
          if (sortPopoverRef.current) {
            sortPopoverRef.current.opener = chipId
            sortPopoverRef.current.open = true
          }
        }}
      />
      <Popover
        ref={sortPopoverRef}
        placement="Bottom"
        horizontalAlign="Start"
        hideArrow
        className="no-padding-popover"
        onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
      >
        <FlexBox direction="Column">
          <div className={s.sortPopoverHeader}>
            <SegmentedButton>
              <SegmentedButtonItem icon="sort-ascending" accessibleName="Ascending" selected={direction === 'asc'}>Ascending</SegmentedButtonItem>
              <SegmentedButtonItem icon="sort-descending" accessibleName="Descending" selected={direction === 'desc'}>Descending</SegmentedButtonItem>
            </SegmentedButton>
          </div>
          <List separators="None">
            {sortOptions.map(opt => (
              <ListItemStandard key={opt} selected={opt === (selectedOption ?? sortOptions[0])}>{opt}</ListItemStandard>
            ))}
          </List>
        </FlexBox>
      </Popover>
    </ToolbarItem>
  )
}
