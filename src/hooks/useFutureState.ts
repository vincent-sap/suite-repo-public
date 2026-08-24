import { useState, useEffect } from 'react'
import { getCookie, setCookie, deleteCookie } from '../utils/cookies'

const COOKIE_NAME = 'FutureState'

// Module-level subscribers so all hook instances stay in sync.
const listeners = new Set<(value: boolean) => void>()

function readCookie(): boolean {
  return getCookie(COOKIE_NAME) === 'true'
}

function notify(value: boolean) {
  listeners.forEach(fn => fn(value))
}

export function setFutureState(value: boolean): void {
  if (value) {
    setCookie(COOKIE_NAME, 'true')
  } else {
    deleteCookie(COOKIE_NAME)
  }
  notify(value)
}

export function useFutureState(): [boolean, (value: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(readCookie)

  useEffect(() => {
    const handler = (value: boolean) => setEnabled(value)
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  return [enabled, setFutureState]
}
