import { useEffect, useRef, useState } from 'react'
import type { SaveState } from '../shared/components/feedback/SaveStateIndicator'

/**
 * Mock save handler — simulates a backend save operation.
 *
 * Call `triggerSave()` whenever a user action should be persisted.
 * It drives the SaveStateIndicator through the full lifecycle:
 *   saving → (0.2–0.8 s random delay) → saved → (3 s visible, 2 s fade) → empty
 *
 * Any in-flight save is cancelled and restarted if triggerSave() is called again.
 */
export function useMockSave() {
  const [saveState, setSaveState] = useState<SaveState>('empty')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPending = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const triggerSave = () => {
    clearPending()
    setSaveState('saving')

    const saveDelay = 200 + Math.random() * 600 // 0.2 – 0.8 s
    timerRef.current = setTimeout(() => {
      setSaveState('saved')
      // After 3 s visible the chip starts its 2 s CSS fade; reset to empty at 5 s total
      timerRef.current = setTimeout(() => setSaveState('empty'), 5000)
    }, saveDelay)
  }

  useEffect(() => clearPending, [])

  return { saveState, triggerSave }
}
