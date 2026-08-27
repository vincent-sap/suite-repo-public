import { useEffect, useRef, useState } from 'react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

export type SaveState = 'empty' | 'saving' | 'saved' | 'discarded' | 'error'

// Design tokens confirmed from Figma variable inspection:
// saved     → sapIndicationColor_4  (green)  → indication4
// saving    → sapIndicationColor_5  (blue)   → indication5
// discarded → sapIndicationColor_8  (purple) → indication8
// error     → sapButton_Reject_*    (red)    → negative
const STATE_CONFIG: Record<Exclude<SaveState, 'empty'>, { text: string; bold: boolean; icon: string; design: string }> = {
  saving:    { text: 'Saving...',         bold: false, icon: 'upload-to-cloud', design: 'indication5' },
  saved:     { text: 'Saved',             bold: false, icon: 'cloud-check',     design: 'indication4' },
  discarded: { text: 'Changes discarded', bold: false, icon: 'reset',           design: 'indication8' },
  error:     { text: 'Error',             bold: true,  icon: 'error',           design: 'negative'    },
}

interface SaveStateIndicatorProps {
  state: SaveState
}

export function SaveStateIndicator({ state }: SaveStateIndicatorProps) {
  const [fading, setFading] = useState(false)
  const prevStateRef = useRef(state)

  useEffect(() => {
    prevStateRef.current = state
    if (state !== 'saved') {
      setFading(false)
      return
    }
    // Start CSS fade after 3 s; the transition duration is 2 s (see App.css)
    const t = setTimeout(() => setFading(true), 3000)
    return () => clearTimeout(t)
  }, [state])

  if (state === 'empty') return null

  const config = STATE_CONFIG[state]
  return (
    <SigChipV2
      value={config.text}
      leadingIcon={config.icon}
      design={config.design as any}
      condensed
      className={`save-state-chip${fading ? ' save-state-chip--fading' : ''}`}
    />
  )
}
