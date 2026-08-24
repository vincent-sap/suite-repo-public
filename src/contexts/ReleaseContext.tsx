import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_RELEASE, isReleaseAvailable } from '../releases'
import type { Release } from '../releases'

const STORAGE_KEY = 'releaseScope'

function loadRelease(): Release {
  const stored = localStorage.getItem(STORAGE_KEY)
  return (stored as Release) ?? DEFAULT_RELEASE
}

interface ReleaseContextType {
  currentRelease: Release
  setCurrentRelease: (release: Release) => void
  isAvailable: (featureRelease: Release) => boolean
}

const ReleaseContext = createContext<ReleaseContextType>({
  currentRelease: DEFAULT_RELEASE,
  setCurrentRelease: () => {},
  isAvailable: () => true,
})

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [currentRelease, setCurrentReleaseState] = useState<Release>(loadRelease)

  const setCurrentRelease = useCallback((release: Release) => {
    localStorage.setItem(STORAGE_KEY, release)
    setCurrentReleaseState(release)
  }, [])

  const isAvailable = useCallback(
    (featureRelease: Release) => isReleaseAvailable(featureRelease, currentRelease),
    [currentRelease],
  )

  return (
    <ReleaseContext.Provider value={{ currentRelease, setCurrentRelease, isAvailable }}>
      {children}
    </ReleaseContext.Provider>
  )
}

export function useRelease() {
  return useContext(ReleaseContext)
}
