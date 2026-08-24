import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { HIERARCHIES, PROCESS_ELEMENTS, E2E_ELEMENTS } from '../domains/process-landscape/data'
import type { ProcessElement, ProcessHierarchy } from '../domains/process-landscape/types'

const HIERARCHIES_KEY = 'processLandscape.hierarchies'
const ELEMENTS_KEY = 'processLandscape.elements'
const SEED_VERSION_KEY = 'processLandscape.seedVersion'
const SEED_VERSION = '4'

type ElementMap = Record<string, ProcessElement[]>

function loadHierarchies(): ProcessHierarchy[] {
  const stored = localStorage.getItem(HIERARCHIES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as ProcessHierarchy[]
    } catch {
      // fall through to seed
    }
  }
  return HIERARCHIES
}

function loadElements(): ElementMap {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)
  if (storedVersion === SEED_VERSION) {
    const stored = localStorage.getItem(ELEMENTS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as ElementMap
      } catch {
        // fall through to seed
      }
    }
  } else {
    localStorage.removeItem(ELEMENTS_KEY)
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  }
  return { apqc: PROCESS_ELEMENTS, e2e: E2E_ELEMENTS }
}

interface ProcessLandscapeContextType {
  hierarchies: ProcessHierarchy[]
  getElements: (hierarchyId: string) => ProcessElement[]
  saveStructure: (hierarchyId: string, elements: ProcessElement[]) => void
  updateElement: (hierarchyId: string, element: ProcessElement) => void
  createElement: (hierarchyId: string, data: Omit<ProcessElement, 'id'>) => string
  createHierarchy: (name: string, description: string) => string
  deleteHierarchy: (id: string) => void
}

const ProcessLandscapeContext = createContext<ProcessLandscapeContextType>({
  hierarchies: HIERARCHIES,
  getElements: () => [],
  saveStructure: () => {},
  updateElement: () => {},
  createElement: () => '',
  createHierarchy: () => '',
  deleteHierarchy: () => {},
})

export function ProcessLandscapeProvider({ children }: { children: ReactNode }) {
  const [hierarchies, setHierarchies] = useState<ProcessHierarchy[]>(loadHierarchies)
  const [elements, setElements] = useState<ElementMap>(loadElements)

  const persistHierarchies = useCallback((next: ProcessHierarchy[]) => {
    localStorage.setItem(HIERARCHIES_KEY, JSON.stringify(next))
    setHierarchies(next)
  }, [])

  const persistElements = useCallback((next: ElementMap) => {
    localStorage.setItem(ELEMENTS_KEY, JSON.stringify(next))
    setElements(next)
  }, [])

  const getElements = useCallback(
    (hierarchyId: string) => elements[hierarchyId] ?? [],
    [elements],
  )

  const saveStructure = useCallback(
    (hierarchyId: string, next: ProcessElement[]) => {
      persistElements({ ...elements, [hierarchyId]: next })
    },
    [elements, persistElements],
  )

  const updateElement = useCallback(
    (hierarchyId: string, element: ProcessElement) => {
      const current = elements[hierarchyId] ?? []
      const next = current.map(e => (e.id === element.id ? element : e))
      persistElements({ ...elements, [hierarchyId]: next })
    },
    [elements, persistElements],
  )

  const createHierarchy = useCallback(
    (name: string, description: string) => {
      const id = `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      persistHierarchies([...hierarchies, { id, name, description }])
      persistElements({ ...elements, [id]: [] })
      return id
    },
    [hierarchies, elements, persistHierarchies, persistElements],
  )

  const createElement = useCallback(
    (hierarchyId: string, data: Omit<ProcessElement, 'id'>) => {
      const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const el: ProcessElement = { ...data, id }
      const current = elements[hierarchyId] ?? []
      persistElements({ ...elements, [hierarchyId]: [...current, el] })
      return id
    },
    [elements, persistElements],
  )

  const deleteHierarchy = useCallback(
    (id: string) => {
      persistHierarchies(hierarchies.filter(h => h.id !== id))
      const next = { ...elements }
      delete next[id]
      persistElements(next)
    },
    [hierarchies, elements, persistHierarchies, persistElements],
  )

  return (
    <ProcessLandscapeContext.Provider
      value={{ hierarchies, getElements, saveStructure, updateElement, createElement, createHierarchy, deleteHierarchy }}
    >
      {children}
    </ProcessLandscapeContext.Provider>
  )
}

export function useProcessLandscape() {
  return useContext(ProcessLandscapeContext)
}
