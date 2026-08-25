import { useNavigate } from 'react-router-dom'
import { Button } from '@ui5/webcomponents-react'

interface HotspotTooltipProps {
  onDismiss: () => void
}

// Measured: Workspace Settings nav item centerY = 831px from top, viewport = 858px
// → 27px from viewport bottom. Icon center x = 32px.
const NAV_ICON_CENTER_FROM_BOTTOM = 27 // px
const NAV_ICON_CENTER_X = 32           // px from left

// Caret is on the left side of the card, positioned near the bottom of the left edge.
// Caret height = 16px (8+8). We want caret center at NAV_ICON_CENTER_FROM_BOTTOM from viewport bottom.
// card bottom (from viewport) + caret bottom offset (from card) + half caret height = NAV_ICON_CENTER_FROM_BOTTOM
// → caret bottom offset = NAV_ICON_CENTER_FROM_BOTTOM - CARD_BOTTOM_OFFSET - 8
const CARD_BOTTOM_OFFSET = 8  // px clearance from viewport bottom
const CARET_BOTTOM = NAV_ICON_CENTER_FROM_BOTTOM - CARD_BOTTOM_OFFSET - 8 // = 11px

export default function HotspotTooltip({ onDismiss }: HotspotTooltipProps) {
  const navigate = useNavigate()

  const handleShowMe = () => {
    navigate('/settings/users')
    onDismiss()
  }

  return (
    <>
      {/* Pulsating dot — centered on the Workspace Settings icon */}
      <div
        style={{
          position: 'fixed',
          bottom: NAV_ICON_CENTER_FROM_BOTTOM,
          left: NAV_ICON_CENTER_X,
          transform: 'translate(-50%, 50%)',
          zIndex: 1001,
          width: 48,
          height: 48,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 32, height: 32, borderRadius: '50%', background: '#1b90ff', opacity: 0.2, animation: 'hotspot-pulse-outer 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, borderRadius: '50%', background: 'rgba(27,144,255,0.5)', opacity: 0.5, animation: 'hotspot-pulse-mid 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: '50%', background: '#1b90ff' }} />
      </div>

      {/* Tooltip card — left-pointing caret at bottom-left aligns with the nav icon */}
      <div
        style={{
          position: 'fixed',
          bottom: CARD_BOTTOM_OFFSET,
          left: NAV_ICON_CENTER_X + 20, // clear of the dot
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: '#1d2d3e',
            borderRadius: 8,
            padding: 16,
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0px 1px 0px rgba(34,53,72,0.48), 0px 2px 16px rgba(34,53,72,0.35)',
          }}
        >
          {/* Left-pointing caret at the bottom of the left edge */}
          <div
            style={{
              position: 'absolute',
              bottom: CARET_BOTTOM,
              left: -8,
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid #1d2d3e',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <p style={{ margin: 0, color: '#ffffff', fontFamily: "'72', '72full', Arial, Helvetica, sans-serif", fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>
                Workspace Settings
              </p>
              <p style={{ margin: 0, color: '#ffffff', fontFamily: "'72', '72full', Arial, Helvetica, sans-serif", fontSize: 14, fontWeight: 400, lineHeight: '21px' }}>
                We consolidated all configurations and settings in one place: easy to find and easy to manage.
              </p>
            </div>
            <Button
              design="Transparent"
              icon="decline"
              onClick={onDismiss}
              tooltip="Dismiss"
              className="hotspot-dismiss-btn"
              style={{
                flexShrink: 0,
                '--ui5-button-text-color': '#ffffff',
                '--ui5-button-icon-color': '#ffffff',
                '--ui5-button-base-background': 'transparent',
                '--ui5-button-base-border-color': 'transparent',
                '--ui5-button-hover-background': 'rgba(255,255,255,0.1)',
                '--ui5-button-hover-border-color': 'transparent',
                width: '28px', height: '28px', minWidth: 'unset', padding: 0,
              } as React.CSSProperties}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button design="Emphasized" onClick={handleShowMe}>
              Show Me
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
