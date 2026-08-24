import React, { createContext, useContext, useRef, useCallback } from 'react'

interface DirtyStateRegistration {
  isDirty: () => boolean
  onSave: () => void
  onReset: () => void
}

interface DirtyStateContextValue {
  register: (reg: DirtyStateRegistration) => void
  unregister: () => void
  isDirty: () => boolean
  save: () => void
  reset: () => void
}

const DirtyStateContext = createContext<DirtyStateContextValue | null>(null)

export function DirtyStateProvider({ children }: { children: React.ReactNode }) {
  const regRef = useRef<DirtyStateRegistration | null>(null)

  const register = useCallback((reg: DirtyStateRegistration) => {
    regRef.current = reg
  }, [])

  const unregister = useCallback(() => {
    regRef.current = null
  }, [])

  const isDirty = useCallback(() => regRef.current?.isDirty() ?? false, [])
  const save = useCallback(() => regRef.current?.onSave(), [])
  const reset = useCallback(() => regRef.current?.onReset(), [])

  return (
    <DirtyStateContext.Provider value={{ register, unregister, isDirty, save, reset }}>
      {children}
    </DirtyStateContext.Provider>
  )
}

export function useDirtyState() {
  const ctx = useContext(DirtyStateContext)
  if (!ctx) throw new Error('useDirtyState must be used inside DirtyStateProvider')
  return ctx
}
