import { useRef, useState } from 'react'
import { Popover, Button, Title } from '@ui5/webcomponents-react'
import type { ReactNode } from 'react'

interface InfoPopoverProps {
  id: string
  header: string
  children: ReactNode
}

// Ignore close attempts within 300ms of opening so double-clicks don't flash the popover open/closed.
const DOUBLE_CLICK_MS = 300

export default function InfoPopover({ id, header, children }: InfoPopoverProps) {
  const [open, setOpenState] = useState(false)
  const openRef = useRef(false)
  const openedAt = useRef(0)
  const justClosed = useRef(false)

  const setOpen = (val: boolean) => {
    openRef.current = val
    setOpenState(val)
  }

  const withinWindow = () => Date.now() - openedAt.current < DOUBLE_CLICK_MS

  const handleButtonClick = () => {
    if (justClosed.current) {
      justClosed.current = false
      return
    }
    if (openRef.current) {
      if (withinWindow()) return   // double-click: ignore, stay open
      setOpen(false)
      return
    }
    openedAt.current = Date.now()
    setOpen(true)
  }

  const handleClose = () => {
    if (!openRef.current) return
    if (withinWindow()) return     // UI5 onClose echo within window: ignore
    justClosed.current = true
    setTimeout(() => { justClosed.current = false }, 0)
    setOpen(false)
  }

  return (
    <>
      <Button
        id={id}
        icon="message-information"
        design="Transparent"
        accessibleName={header}
        onClick={handleButtonClick}
      />
      <Popover
        opener={id}
        open={open}
        onClose={handleClose}
        placement="Top"
        horizontalAlign="Center"
        className="no-padding-popover"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem 0.375rem 0.75rem', borderBottom: '1px solid var(--sapPopover_BorderColor)', gap: '1rem' }}>
          <Title level="H6" style={{ fontSize: 'var(--sapFontSize)', fontWeight: 600, whiteSpace: 'nowrap' }}>{header}</Title>
          <Button icon="decline" design="Transparent" accessibleName="Close" onClick={handleClose} style={{ flexShrink: 0 }} />
        </div>
        <div style={{ padding: '0 0.75rem 0.5rem', maxWidth: '22rem' }}>
          {children}
        </div>
      </Popover>
    </>
  )
}
