import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DynamicPage,
  Button, Bar, Dialog, Input, Label, Toast,
  FlexBox, List, ListItemStandard, VariantManagement, VariantItem,
} from '@ui5/webcomponents-react'
import SearchResultsPanel, { type SavedSearch } from './components/SearchResultsPanel'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import type { SelectedAssetInfo } from './AllResources'
import s from './SearchResults.module.css'

const SEARCH_TYPE_GROUPS = [
  {
    id: 'spm',
    label: 'Process Management',
    items: [
      { id: 'models',            label: 'Diagrams',             icon: 'SAP-icons-v4/process-manager' },
      { id: 'dictionaryentries', label: 'Dictionary Entries',   icon: 'course-program' },
      { id: 'files',             label: 'Files',                icon: 'document' },
      { id: 'folders',           label: 'Folders',              icon: 'folder-blank' },
      { id: 'journeymodel',      label: 'Journey Models',       icon: 'SAP-icons-v4/customer-journey' },
      { id: 'dashboards',        label: 'Dashboards',           icon: 'business-objects-mobile' },
      { id: 'initiatives',       label: 'Initiatives',          icon: 'SAP-icons-v4/rocket' },
      { id: 'objectives',        label: 'Objectives',           icon: 'kpi-corporate-performance' },
    ],
  },
  {
    id: 'swa',
    label: 'Workflow Automation',
    items: [
      { id: 'workflows', label: 'Workflows', icon: 'workflow-tasks' },
      { id: 'cases',     label: 'Cases',     icon: 'checklist-item' },
      { id: 'tasks',     label: 'Tasks',     icon: 'task' },
      { id: 'reports',   label: 'Reports',   icon: 'SAP-icons-v4/report' },
    ],
  },
  {
    id: 'spi',
    label: 'Process Intelligence',
    items: [
      { id: 'investigations', label: 'Investigations',          icon: 'business-objects-experience' },
      { id: 'piprocesses',    label: 'Analysis Configurations', icon: 'SAP-icons-v4/process-intelligence' },
      { id: 'pidashboards',   label: 'Customizable Dashboards', icon: 'business-objects-mobile' },
    ],
  },
  {
    id: 'val',
    label: 'Value Accelerators',
    items: [
      { id: 'accelerators', label: 'Accelerators', icon: 'SAP-icons-v4/rocket' },
    ],
  },
  {
    id: 'pam',
    label: 'Process Advisor',
    items: [
      { id: 'correction_recommendations', label: 'Correction Recommendations', icon: 'media-forward' },
      { id: 'improvement_opportunities',  label: 'Improvement Opportunities',  icon: 'bbyd-dashboard' },
      { id: 'innovation_recommendations', label: 'Innovation Recommendations', icon: 'opportunity' },
      { id: 'performance_indicators',     label: 'Performance Indicators',     icon: 'kpi-corporate-performance' },
      { id: 'process_flows',              label: 'Process Flows',              icon: 'share-2' },
    ],
  },
]

const ALL_NAV_ITEMS = [
  { id: 'all', label: 'All Results', icon: 'grid' },
  ...SEARCH_TYPE_GROUPS.flatMap(g => g.items),
]

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { addSmartFolder } = useWorkspace()

  const [active, setActive] = useState('all')
  const [isNarrow, setIsNarrow] = useState(false)
  const roRef = useRef<ResizeObserver | null>(null)
  const layoutRef = useCallback((el: HTMLDivElement | null) => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setIsNarrow(prev => prev ? w < 740 : w < 700)
    })
    ro.observe(el)
    roRef.current = ro
  }, [])
  const activeLabel = ALL_NAV_ITEMS.find(i => i.id === active)?.label ?? 'All Results'
  const [selectedAsset, setSelectedAsset] = useState<SelectedAssetInfo | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')

  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [authorSearch, setAuthorSearch] = useState('')

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [activeSearchId, setActiveSearchId] = useState<string | undefined>()

  useEffect(() => {
    setActiveSearchId(undefined)
  }, [active, filters])

  const handleSaveSearch = () => {
    openDialog()
  }

  const handleRemoveSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id))
    if (id === activeSearchId) setActiveSearchId(undefined)
  }

  const handleSelectSavedSearch = (s: SavedSearch) => {
    setActiveSearchId(s.id)
  }

  const handleTypeSelect = (id: string) => {
    setActive(id)
    setSelectedAsset(null)
  }

  const handleShowAll = (navLabel: string) => {
    const navItem = ALL_NAV_ITEMS.find(i => i.label === navLabel)
    if (navItem) handleTypeSelect(navItem.id)
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).length
    const typeName = active !== 'all' ? activeLabel : undefined
    const newSearch: SavedSearch = { id: `ss-${Date.now()}`, name: saveName.trim(), filterCount: activeFilterCount || undefined, typeName }
    addSmartFolder({ name: saveName.trim(), description: saveDesc.trim() || undefined, query })
    setSavedSearches(prev => [...prev, newSearch])
    setActiveSearchId(newSearch.id)
    setDialogOpen(false)
    setSaveName('')
    setSaveDesc('')
    setToastOpen(true)
  }

  const openDialog = () => {
    setSaveName(query || '')
    setSaveDesc('')
    setDialogOpen(true)
  }

  return (
    <>
      <DynamicPage hidePinButton className={s.page}>
        <div ref={layoutRef} className={s.sidenavLayout}>

          {!isNarrow && (
            <div className={s.sidenavRail}>
              <List onItemClick={e => handleTypeSelect((e.detail.item as HTMLElement).id)}>
                {ALL_NAV_ITEMS.map(item => (
                  <ListItemStandard key={item.id} id={item.id} icon={item.icon} selected={active === item.id}>
                    {item.label}
                  </ListItemStandard>
                ))}
              </List>
            </div>
          )}

          <div className={s.sidenavContent}>
            <FlexBox direction="Column" className={`${s.stack} ${s.stackWide}`}>
              <SearchResultsPanel
                query={query}
                title={activeLabel}
                variantSlot={isNarrow ? (
                  <VariantManagement
                    closeOnItemSelect
                    hideSaveAs
                    hideManageVariants
                    titleText={activeLabel}
                    size="H5"
                    level="H5"
                    onSelect={e => {
                      const label = (e.detail.selectedVariant as any).children as string
                      const item = ALL_NAV_ITEMS.find(i => i.label === label)
                      if (item) handleTypeSelect(item.id)
                    }}
                  >
                    {ALL_NAV_ITEMS.map(item => (
                      <VariantItem key={item.id} selected={active === item.id} labelReadOnly hideDelete readOnly>
                        {item.label}
                      </VariantItem>
                    ))}
                  </VariantManagement>
                ) : undefined}
                selectedId={selectedAsset?.id}
                onAssetClick={setSelectedAsset}
              onShowAll={handleShowAll}
              filters={filters}
              onFiltersChange={setFilters}
              authorSearch={authorSearch}
              onAuthorSearchChange={setAuthorSearch}
              savedSearches={savedSearches}
              activeSearchName={savedSearches.find(s => s.id === activeSearchId)?.name}
              onSaveSearch={handleSaveSearch}
              onRemoveSavedSearch={handleRemoveSavedSearch}
              onSelectSavedSearch={handleSelectSavedSearch}
              />
            </FlexBox>
          </div>

        </div>
      </DynamicPage>

      <Dialog
        open={dialogOpen}
        headerText="Save this Search"
        onClose={() => setDialogOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '360px', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label for="sf-name" required>Name</Label>
            <Input
              id="sf-name"
              value={saveName}
              style={{ width: '100%' }}
              onInput={e => setSaveName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={!saveName.trim()} onClick={handleSave}>Save</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>
        Search saved as view. Find it under Pinned Views in the Repository.
      </Toast>
    </>
  )
}
