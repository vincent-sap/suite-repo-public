import { useId, useRef, useState } from 'react'
import { Button, List, ListItemStandard, Popover } from '@ui5/webcomponents-react'
import type { ButtonDomRef, ListDomRef } from '@ui5/webcomponents-react'

interface CardMoreMenuProps {
  onRemove?: () => void
  onRename?: () => void
  onEdit?: () => void
}

export function CardMoreMenu({ onRemove, onRename, onEdit }: CardMoreMenuProps) {
  const btnId = `card-more-${useId().replace(/:/g, '')}`
  const [open, setOpen] = useState(false)
  const moreBtnRef = useRef<ButtonDomRef>(null)
  const listRef = useRef<ListDomRef>(null)

  function closeAndFocusMore() {
    setOpen(false)
    moreBtnRef.current?.focus()
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' || (e.key === 'Tab' && e.shiftKey) || e.key === 'ArrowUp') {
      e.preventDefault()
      closeAndFocusMore()
    }
  }

  function handleItemClick(e: CustomEvent) {
    const action = (e.detail.item as HTMLElement).dataset.action
    setOpen(false)
    if (action === 'remove') onRemove?.()
    else if (action === 'rename') onRename?.()
    else if (action === 'edit') onEdit?.()
  }

  return (
    <>
      <Button
        ref={moreBtnRef}
        id={btnId}
        icon="overflow"
        design="Transparent"
        tooltip="More Options"
        onClick={() => setOpen(true)}
      />
      <Popover
        opener={btnId}
        open={open}
        onClose={() => setOpen(false)}
        placement="Bottom"
        horizontalAlign="End"
        className="widget-more-popover"
        hideArrow
      >
        <List ref={listRef} separators="None" onKeyDown={handleListKeyDown} onItemClick={handleItemClick}>
          {onRemove && (
            <ListItemStandard icon="decline" type="Active" data-action="remove">
              Remove Widget
            </ListItemStandard>
          )}
          {onRename && (
            <ListItemStandard icon="SAP-icons-v4/string" type="Active" data-action="rename">
              Change Title
            </ListItemStandard>
          )}
          {onEdit && (
            <ListItemStandard icon="edit" type="Active" data-action="edit">
              Edit
            </ListItemStandard>
          )}
        </List>
      </Popover>
    </>
  )
}
