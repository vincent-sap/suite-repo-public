import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_KEY = 'navLog'

export interface NavLogEntry {
  ts: number
  path: string
  search: string
}

export function useNavigationLog() {
  const location = useLocation()

  useEffect(() => {
    const entry: NavLogEntry = {
      ts: Date.now(),
      path: location.pathname,
      search: location.search,
    }
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      const log: NavLogEntry[] = raw ? JSON.parse(raw) : []
      log.push(entry)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(log))
    } catch {}
  }, [location.pathname, location.search])
}

export function getNavigationLog(): NavLogEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearNavigationLog() {
  sessionStorage.removeItem(SESSION_KEY)
}
