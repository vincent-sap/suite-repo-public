import React, { useRef, useEffect, useState } from 'react'
import { ListItemCustom, Text } from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { AssetChip } from './AssetListItem'

type SearchAssetListItemProps = {
  id: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectType: any
  typeName: string
  description?: string
  folder?: string
  chips?: AssetChip[]
  isNavigated?: boolean
  isLast?: boolean
  onClick?: (e: React.MouseEvent) => void
}

const dot = (
  <span style={{ margin: '0 3px', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>·</span>
)

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

export function SearchAssetListItem({
  id,
  name,
  objectType,
  typeName,
  description,
  folder,
  chips = [],
  isNavigated: _isNavigated = false,
  onClick,
}: SearchAssetListItemProps) {
  const [titleHovered, setTitleHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleEnter = () => setTitleHovered(true)
    const handleLeave = () => setTitleHovered(false)
    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ListItemCustom
      ref={ref as any}
      data-id={id}
      type="Active"
      onClick={(e: any) => onClick?.(e as unknown as React.MouseEvent)}
    >
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
        {/* Left: domain icon */}
        <div style={{ display: 'flex', alignItems: 'center', height: '26px', flexShrink: 0 }}>
          <SigDomainObject object={objectType} size="XXS" />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* Row 1: name + chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
            <span
              style={{
                fontWeight: '600',
                fontSize: 'var(--sapFontLargeSize)',
                color: 'var(--sapList_TextColor,#1d2d3e)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                cursor: onClick ? 'pointer' : undefined,
                pointerEvents: onClick ? 'auto' : 'none',
                display: 'block',
                textDecoration: titleHovered && onClick ? 'underline' : undefined,
              }}
            >
              {name}
            </span>
            {chips.length > 0 && (
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
              </div>
            )}
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

          {/* Row 3: type · folder */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {typeName}
            </Text>
            {folder && (
              <>{dot}<Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                {folder.split('/').map(s => s.trim()).join(' › ')}
              </Text></>
            )}
          </div>
        </div>
      </div>
    </ListItemCustom>
  )
}
