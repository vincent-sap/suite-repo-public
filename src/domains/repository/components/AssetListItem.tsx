import React, { useRef, useEffect, useState } from 'react'
import { ListItemCustom, Button, CheckBox, Text } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

type ColorDesign = 'none' | 'error' | 'information' | 'positive' | 'success' | 'warning' | 'negative'
export type AssetChip = { value: string; design: ColorDesign; label?: string; leadingIcon?: string; useExplicitDesign?: boolean }

function chipLeadingIcon(value: string): string | undefined {
  if (value === 'Published') return 'SAP-icons-v4/published'
  if (value === 'Draft') return 'write-new-document'
  if (value === 'On Track') return 'trend-up'
  if (value === 'At Risk') return 'message-warning'
  if (value === 'Modified') return 'SAP-icons-v4/published-changed'
  if (value === 'Deprecated') return 'cancel'
  return undefined
}

function chipIndicationDesign(value: string): string {
  if (value === 'Published') return 'indication5'
  if (value === 'Draft') return 'indication10'
  if (value === 'On Track') return 'indication4'
  if (value === 'At Risk') return 'indication2'
  if (value === 'Modified') return 'indication7'
  if (value === 'Deprecated') return 'indication2'
  return 'indication7'
}

export type AssetListItemProps = {
  id: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectType: any
  typeName: string
  description?: string
  created?: string
  changed?: string
  deleted?: string
  folder?: string
  chips?: AssetChip[]
  topChip?: React.ReactNode
  titleTrailingChip?: React.ReactNode
  titleLeadingSlot?: React.ReactNode
  ownerName?: string
  isSelected?: boolean
  isNavigated?: boolean
  isDragging?: boolean
  isDropTarget?: boolean
  draggable?: boolean
  onSelect?: () => void
  onClick?: (e: React.MouseEvent) => void
  onDoubleClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  overflowId?: string
  onOverflow?: (e: React.MouseEvent | CustomEvent) => void
  onTitleClick?: (e: React.MouseEvent) => void
  /** Extra buttons/actions rendered before the overflow button */
  actionsSlot?: React.ReactNode
  /** When set, highlights matching substrings in name and description */
  highlightQuery?: string
  isLast?: boolean
}

const dot = (
  <span style={{ margin: '0 3px', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>·</span>
)

export function AssetListItem({
  id,
  name,
  objectType: _objectType,
  typeName,
  description,
  created: _created,
  changed: _changed,
  deleted: _deleted,
  folder,
  chips = [],
  topChip,
  titleLeadingSlot,
  titleTrailingChip,
  ownerName,
  isSelected = false,
  isNavigated: _isNavigated = false,
  isDragging = false,
  isDropTarget = false,
  draggable = false,
  onSelect,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  overflowId,
  onOverflow,
  onTitleClick,
  actionsSlot,
}: AssetListItemProps) {
  const [titleHovered, setTitleHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLSpanElement>(null)
  const titleClickedRef = useRef(false)
  const onTitleClickRef = useRef(onTitleClick)
  onTitleClickRef.current = onTitleClick
  const onMouseEnterRef = useRef(onMouseEnter)
  onMouseEnterRef.current = onMouseEnter
  const onMouseLeaveRef = useRef(onMouseLeave)
  onMouseLeaveRef.current = onMouseLeave

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleEnter = () => onMouseEnterRef.current?.()
    const handleLeave = () => onMouseLeaveRef.current?.()
    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const handler = (e: MouseEvent) => {
      titleClickedRef.current = true
      onTitleClickRef.current?.(e as unknown as React.MouseEvent)
      requestAnimationFrame(() => { titleClickedRef.current = false })
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ListItemCustom
      ref={ref as any}
      data-id={id}
      selected={isSelected}
      navigated={false}
      type="Active"
      style={{ opacity: isDragging ? 0.5 : 1, outline: isDropTarget ? '2px solid var(--sapSelectedColor)' : undefined, outlineOffset: '-2px' }}
      draggable={draggable}
      onClick={(e: any) => {
        if (titleClickedRef.current) return
        const target = e.target as HTMLElement
        if (target.closest('ui5-checkbox, [ui5-checkbox]')) return
        onClick?.(e as unknown as React.MouseEvent)
      }}
      onDragStart={onDragStart as any}      onDragEnd={onDragEnd as any}
      onDragOver={onDragOver as any}
      onDragLeave={onDragLeave as any}
      onDrop={onDrop as any}
    >
      {onDoubleClick && (
        <div
          onDoubleClick={onDoubleClick}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
      )}
      {/* pointer-events: none on outer div so drag events reach the shadow <li> */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '8px 0',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* Left: checkbox */}
        {onSelect && (
          <div style={{ display: 'flex', alignItems: 'center', height: '26px', flexShrink: 0, pointerEvents: 'auto' }}>
            <div onClick={(e) => { e.stopPropagation(); onSelect() }} style={{ display: 'flex', alignItems: 'center' }}>
              <CheckBox checked={isSelected} onChange={() => {}} />
            </div>
          </div>
        )}

        {/* Left: domain object icon */}
        {titleLeadingSlot && (
          <div style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0, pointerEvents: 'none' }}>
            {titleLeadingSlot}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* Top chip (e.g. SAP offering) */}
          {topChip && <div style={{ pointerEvents: 'auto' }}>{topChip}</div>}

          {/* Row 1: name + trailing chip + chips + overflow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
              <span
                ref={titleRef}
                data-title="true"
                className={(onTitleClick || onClick) ? 'table-asset-name' : undefined}
                style={{
                  fontWeight: '600',
                  fontSize: 'var(--sapFontLargeSize)',
                  color: 'var(--sapList_TextColor,#1d2d3e)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                  cursor: (onTitleClick || onClick) ? 'pointer' : undefined,
                  pointerEvents: (onTitleClick || onClick) ? 'auto' : 'none',
                  display: 'block',
                  textDecoration: titleHovered && (onTitleClick || onClick) ? 'underline' : undefined,
                }}
                onMouseEnter={onTitleClick ? () => setTitleHovered(true) : undefined}
                onMouseLeave={onTitleClick ? () => setTitleHovered(false) : undefined}
              >
                {name}
              </span>
              {titleTrailingChip && <div style={{ pointerEvents: 'auto', flexShrink: 0 }}>{titleTrailingChip}</div>}
              {(ownerName || chips.length > 0 || actionsSlot) && (
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', pointerEvents: 'auto' }}>
                  {chips.map((chip, i) => {
                    const icon = chip.leadingIcon ?? chipLeadingIcon(chip.value)
                    const design = chip.useExplicitDesign ? chip.design : chipIndicationDesign(chip.value)
                    return (
                      <SigChipV2
                        key={i}
                        value={chip.value}
                        {...(chip.label ? { label: chip.label } : {})}
                        {...(icon ? { leadingIcon: icon } : {})}
                        design={design as any}
                        condensed
                      />
                    )
                  })}
                  {ownerName && (() => {
                    const initials = ownerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <SigChipV2
                        label="Owner:"
                        value={ownerName}
                        avatarInitial={initials}
                        design="none"
                        condensed
                      />
                    )
                  })()}
                  {actionsSlot && <div style={{ display: 'flex', pointerEvents: 'auto' }}>{actionsSlot}</div>}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0, pointerEvents: 'auto' }}>
              {onOverflow && (
                <Button
                  id={overflowId}
                  icon="overflow"
                  design="Transparent"
                  onClick={(e: CustomEvent) => { (e as any).stopPropagation?.(); onOverflow(e) }}
                />
              )}
            </div>
          </div>

          {/* Row 2: description */}
          {description && (
            <Text style={{
              fontSize: 'var(--sapFontSize)',
              color: 'var(--sapList_TextColor,#1d2d3e)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "var(--sapFontFamily,'72',sans-serif)",
            }}>
              {description}
            </Text>
          )}

          {/* Row 3: folder */}
          {folder && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden', marginTop: '4px' }}>
              {typeName && <><Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{typeName}</Text>{dot}</>}
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                {folder.replace(/\//g, '›')}
              </Text>
            </div>
          )}
        </div>
      </div>
    </ListItemCustom>
  )
}
