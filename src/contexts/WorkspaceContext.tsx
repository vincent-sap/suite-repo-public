import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'
import { type ProcessLevelNames } from '../domains/process-landscape/types'
import {
  DEFAULT_ADDITIONAL_INFO, INITIAL_DICT_CATEGORIES, INITIAL_AUDIENCES,
  INITIAL_SMART_FOLDERS, INITIAL_HELP_LINKS, INITIAL_EXPLORER_COLUMNS,
  INITIAL_CONTEXT_DIMENSIONS, USER_CONTEXT_DEFAULTS, INITIAL_LEVEL_NAMES,
} from '../data/workspaceDefaults'

// Seed data lives in src/data/workspaceDefaults.ts. Re-exported here so existing
// imports (ADMIN_USERS, USER_CONTEXT_DEFAULTS) keep working.
export { ADMIN_USERS, USER_CONTEXT_DEFAULTS } from '../data/workspaceDefaults'

export type ContentLanguage = { code: string; label: string; isDefault: boolean }
export type ContextDimension = { id: string; name: string; type: string; options?: string[] }
export type AdminUser = { id: string; name: string; email: string; initials: string; colorScheme: string; ownerSince?: string; userId: string; license: 'Process Modeler' | 'Collaboration Hub' }
export type HelpLink = { id: string; label: string; url: string }
export type SmartFolder = { id: string; name: string; description?: string; query: string }
export type ExplorerColumn = { id: string; attribute: string; width: number; fixed?: boolean }
export type Audience = { id: string; name: string; showGeneral: boolean }
export type DictCategoryType = 'Organization' | 'Document' | 'Activity' | 'Event' | 'IT System' | 'Goal' | 'Requirement' | 'Risk' | 'Control' | 'Others' | 'Processes'
export type DictCategory = { id: string; name: string; description?: string; color: string; parentId?: string; enabled: boolean; type: DictCategoryType; createdAt: string; changedAt: string; hasVariants?: boolean }


type WorkspaceContextType = {
  workspaceName: string
  setWorkspaceName: (v: string) => void
  contentLanguages: ContentLanguage[]
  addContentLanguage: (lang: ContentLanguage) => void
  removeContentLanguage: (code: string) => void
  moveContentLanguage: (code: string, direction: 'up' | 'down') => void
  reorderContentLanguage: (draggedCode: string, targetCode: string, placement: 'Before' | 'After') => void
  setDefaultLanguage: (code: string) => void
  setContentLanguages: Dispatch<SetStateAction<ContentLanguage[]>>
  ownerId: string
  setOwnerId: (v: string) => void
  additionalInfo: string
  setAdditionalInfo: (v: string) => void
  helpLinks: HelpLink[]
  setHelpLinks: Dispatch<SetStateAction<HelpLink[]>>
  smartFolders: SmartFolder[]
  addSmartFolder: (sf: Omit<SmartFolder, 'id'>) => void
  updateSmartFolder: (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) => void
  deleteSmartFolder: (id: string) => void
  privateFolder: boolean
  setPrivateFolder: (v: boolean) => void
  homeTitle: string
  setHomeTitle: (v: string) => void
  homeWelcomeMessage: string
  setHomeWelcomeMessage: (v: string) => void
  audiences: Audience[]
  setAudiences: Dispatch<SetStateAction<Audience[]>>
  dictCategories: DictCategory[]
  addDictCategory: (cat: Omit<DictCategory, 'id'>) => string
  updateDictCategory: (id: string, patch: Partial<Omit<DictCategory, 'id'>>) => void
  moveDictCategory: (id: string, direction: 'up' | 'down') => void
  reorderDictCategory: (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') => void
  deleteDictCategory: (id: string) => void
  deleteDictCategoryMoveChildren: (id: string) => void
  explorerColumns: ExplorerColumn[]
  setExplorerColumns: Dispatch<SetStateAction<ExplorerColumn[]>>
  contextDimensions: ContextDimension[]
  addContextDimension: (dim: ContextDimension) => void
  removeContextDimension: (id: string) => void
  moveContextDimension: (id: string, direction: 'up' | 'down') => void
  reorderContextDimension: (draggedId: string, targetId: string, placement: 'Before' | 'After') => void
  setContextDimensions: Dispatch<SetStateAction<ContextDimension[]>>
  userContextValues: Record<string, string | string[]>
  setUserContextValues: Dispatch<SetStateAction<Record<string, string | string[]>>>
  levelNames: ProcessLevelNames
  setLevelNames: Dispatch<SetStateAction<ProcessLevelNames>>
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceName: 'Acme Process World',
  setWorkspaceName: () => {},
  contentLanguages: [],
  addContentLanguage: () => {},
  removeContentLanguage: () => {},
  moveContentLanguage: () => {},
  reorderContentLanguage: () => {},
  setDefaultLanguage: () => {},
  setContentLanguages: () => {},
  ownerId: '1',
  setOwnerId: () => {},
  additionalInfo: DEFAULT_ADDITIONAL_INFO,
  setAdditionalInfo: () => {},
  helpLinks: INITIAL_HELP_LINKS,
  setHelpLinks: () => {},
  smartFolders: [],
  addSmartFolder: () => {},
  updateSmartFolder: () => {},
  deleteSmartFolder: () => {},
  privateFolder: true,
  setPrivateFolder: () => {},
  homeTitle: '',
  setHomeTitle: () => {},
  homeWelcomeMessage: '',
  setHomeWelcomeMessage: () => {},
  audiences: INITIAL_AUDIENCES,
  setAudiences: () => {},
  dictCategories: INITIAL_DICT_CATEGORIES,
  addDictCategory: () => '',
  updateDictCategory: () => {},
  moveDictCategory: () => {},
  reorderDictCategory: () => {},
  deleteDictCategory: () => {},
  deleteDictCategoryMoveChildren: () => {},
  explorerColumns: INITIAL_EXPLORER_COLUMNS,
  setExplorerColumns: () => {},
  contextDimensions: INITIAL_CONTEXT_DIMENSIONS,
  addContextDimension: () => {},
  removeContextDimension: () => {},
  moveContextDimension: () => {},
  reorderContextDimension: () => {},
  setContextDimensions: () => {},
  userContextValues: USER_CONTEXT_DEFAULTS,
  setUserContextValues: () => {},
  levelNames: INITIAL_LEVEL_NAMES,
  setLevelNames: () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceName, setWorkspaceName] = useState('Acme Process World')
  const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([
    { code: 'en-US', label: 'English (United States)', isDefault: true },
    { code: 'de-DE', label: 'German (Germany)', isDefault: false },
    { code: 'fr-FR', label: 'French (France)', isDefault: false },
  ])
  const [ownerId, setOwnerId] = useState('1')
  const [additionalInfo, setAdditionalInfo] = useState(DEFAULT_ADDITIONAL_INFO)
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>(INITIAL_HELP_LINKS)
  const [smartFolders, setSmartFolders] = useState<SmartFolder[]>(INITIAL_SMART_FOLDERS)
  const [privateFolder, setPrivateFolder] = useState(true)
  const [homeTitle, setHomeTitle] = useState('')
  const [homeWelcomeMessage, setHomeWelcomeMessage] = useState('Your starting point for everything process')
  const [audiences, setAudiences] = useState<Audience[]>(INITIAL_AUDIENCES)
  const [dictCategories, setDictCategories] = useState<DictCategory[]>(INITIAL_DICT_CATEGORIES)
  const [explorerColumns, setExplorerColumns] = useState<ExplorerColumn[]>(INITIAL_EXPLORER_COLUMNS)
  const [contextDimensions, setContextDimensions] = useState<ContextDimension[]>(INITIAL_CONTEXT_DIMENSIONS)
  const [userContextValues, setUserContextValues] = useState<Record<string, string | string[]>>(USER_CONTEXT_DEFAULTS)
  const [levelNames, setLevelNames] = useState<ProcessLevelNames>(INITIAL_LEVEL_NAMES)

  const addContentLanguage = (lang: ContentLanguage) =>
    setContentLanguages(prev => prev.some(l => l.code === lang.code) ? prev : [...prev, lang])

  const removeContentLanguage = (code: string) =>
    setContentLanguages(prev => {
      const removed = prev.find(l => l.code === code)
      const remaining = prev.filter(l => l.code !== code)
      if (removed?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true }
      }
      return remaining
    })

  const moveContentLanguage = (code: string, direction: 'up' | 'down') =>
    setContentLanguages(prev => {
      const idx = prev.findIndex(l => l.code === code)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })

  const setDefaultLanguage = (code: string) =>
    setContentLanguages(prev => prev.map(l => ({ ...l, isDefault: l.code === code })))

  const reorderContentLanguage = (draggedCode: string, targetCode: string, placement: 'Before' | 'After') =>
    setContentLanguages(prev => {
      if (draggedCode === targetCode) return prev
      const dragged = prev.find(l => l.code === draggedCode)
      if (!dragged) return prev
      const without = prev.filter(l => l.code !== draggedCode)
      const targetIdx = without.findIndex(l => l.code === targetCode)
      const insertAt = placement === 'Before' ? targetIdx : targetIdx + 1
      const result = [...without]
      result.splice(insertAt, 0, dragged)
      return result
    })

  const addSmartFolder = (sf: Omit<SmartFolder, 'id'>) =>
    setSmartFolders(prev => [...prev, { ...sf, id: String(Date.now()) }])

  const updateSmartFolder = (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) =>
    setSmartFolders(prev => prev.map(sf => sf.id === id ? { ...sf, ...patch } : sf))

  const deleteSmartFolder = (id: string) =>
    setSmartFolders(prev => prev.filter(sf => sf.id !== id))

  const addDictCategory = (cat: Omit<DictCategory, 'id'>): string => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const id = `c${Date.now()}`
    setDictCategories(prev => [...prev, {
      ...cat,
      type: cat.type ?? ('Others' as const),
      createdAt: cat.createdAt ?? now,
      changedAt: cat.changedAt ?? now,
      id,
    }])
    return id
  }

  const updateDictCategory = (id: string, patch: Partial<Omit<DictCategory, 'id'>>) =>
    setDictCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const moveDictCategory = (id: string, direction: 'up' | 'down') =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      // Only swap within siblings (same parentId level)
      const siblings = prev.filter(c => c.parentId === cat.parentId)
      const sibIdx = siblings.findIndex(c => c.id === id)
      const swapSibIdx = direction === 'up' ? sibIdx - 1 : sibIdx + 1
      if (swapSibIdx < 0 || swapSibIdx >= siblings.length) return prev
      const swapId = siblings[swapSibIdx].id
      const flatIdx = prev.findIndex(c => c.id === id)
      const swapFlatIdx = prev.findIndex(c => c.id === swapId)
      const next = [...prev]
      ;[next[flatIdx], next[swapFlatIdx]] = [next[swapFlatIdx], next[flatIdx]]
      return next
    })

  const reorderDictCategory = (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') =>
    setDictCategories(prev => {
      const dragged = prev.find(c => c.id === draggedId)
      if (!dragged) return prev
      const target = targetId ? prev.find(c => c.id === targetId) : null
      // Reparent when dropped onto a node
      const newParentId = placement === 'On' ? targetId ?? undefined : target?.parentId
      const withoutDragged = prev.filter(c => c.id !== draggedId)
      const updated = { ...dragged, parentId: newParentId }
      if (placement === 'On' || !target) {
        return [...withoutDragged, updated]
      }
      const targetFlatIdx = withoutDragged.findIndex(c => c.id === targetId)
      const insertAt = placement === 'Before' ? targetFlatIdx : targetFlatIdx + 1
      const result = [...withoutDragged]
      result.splice(insertAt, 0, updated)
      return result
    })

  const deleteDictCategory = (id: string) =>
    setDictCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id))

  // Re-parents direct children to the deleted category's parent, then removes it
  const deleteDictCategoryMoveChildren = (id: string) =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      return prev
        .map(c => c.parentId === id ? { ...c, parentId: cat.parentId } : c)
        .filter(c => c.id !== id)
    })

  const addContextDimension = (dim: ContextDimension) =>
    setContextDimensions(prev => prev.some(d => d.id === dim.id) ? prev : [...prev, dim])

  const removeContextDimension = (id: string) =>
    setContextDimensions(prev => prev.filter(d => d.id !== id))

  const moveContextDimension = (id: string, direction: 'up' | 'down') =>
    setContextDimensions(prev => {
      const idx = prev.findIndex(d => d.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })

  const reorderContextDimension = (draggedId: string, targetId: string, placement: 'Before' | 'After') =>
    setContextDimensions(prev => {
      if (draggedId === targetId) return prev
      const dragged = prev.find(d => d.id === draggedId)
      if (!dragged) return prev
      const without = prev.filter(d => d.id !== draggedId)
      const targetIdx = without.findIndex(d => d.id === targetId)
      const insertAt = placement === 'Before' ? targetIdx : targetIdx + 1
      const result = [...without]
      result.splice(insertAt, 0, dragged)
      return result
    })

  return (
    <WorkspaceContext.Provider value={{
      workspaceName, setWorkspaceName,
      contentLanguages, addContentLanguage, removeContentLanguage, moveContentLanguage, reorderContentLanguage, setDefaultLanguage, setContentLanguages,
      ownerId, setOwnerId,
      additionalInfo, setAdditionalInfo,
      helpLinks, setHelpLinks,
      smartFolders, addSmartFolder, updateSmartFolder, deleteSmartFolder,
      privateFolder, setPrivateFolder,
      homeTitle, setHomeTitle,
      homeWelcomeMessage, setHomeWelcomeMessage,
      audiences, setAudiences,
      dictCategories, addDictCategory, updateDictCategory, moveDictCategory, reorderDictCategory, deleteDictCategory, deleteDictCategoryMoveChildren,
      explorerColumns, setExplorerColumns,
      contextDimensions, addContextDimension, removeContextDimension, moveContextDimension, reorderContextDimension, setContextDimensions,
      userContextValues, setUserContextValues,
      levelNames, setLevelNames,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
