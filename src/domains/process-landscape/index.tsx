import React, { useState, useMemo, useCallback, useId, useRef } from 'react'
import {
  Bar,
  SegmentedButton,
  SegmentedButtonItem,
  Button,
  Popover,
  List,
  ListItemStandard,
  Menu,
  MenuItem,
  VariantManagement,
  VariantItem,
  SplitterLayout,
  SplitterElement,
} from '@ui5/webcomponents-react'
import CanvasView from './CanvasView'
import CatalogView from './CatalogView'
import ProcessLandscapeDetailPanel from './ProcessLandscapeDetailPanel'
import CreateHierarchyDialog from './CreateHierarchyDialog'
import ManageHierarchyModal from './ManageHierarchyModal'
import { ProcessLandscapeProvider, useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import type { ViewMode, DisplayLevel, ViewVariant } from './types'

const DEFAULT_HIERARCHY_IDS = new Set(['e2e'])

function loadSavedVariants(): ViewVariant[] {
  try { return JSON.parse(localStorage.getItem('plViewVariants') ?? '[]') } catch { return [] }
}

function persistVariants(variants: ViewVariant[]) {
  localStorage.setItem('plViewVariants', JSON.stringify(variants))
}

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function ProcessLandscapeInner() {
  const { hierarchies } = useProcessLandscape()
  const [viewMode, setViewMode] = useState<ViewMode>('explorer')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [createElementOpen, setCreateElementOpen] = useState(false)
  const [mode, setMode] = useState<'Edit' | 'View'>('Edit')
  const [createBetween, setCreateBetween] = useState<{
    predecessorIds: string[]
    successorIds: string[]
    parentId: string
  } | null>(null)

  const handleCreateBetween = useCallback((predId: string | null, succId: string | null, parentId: string | null) => {
    setCreateBetween({
      predecessorIds: predId ? [predId] : [],
      successorIds: succId ? [succId] : [],
      parentId: parentId ?? '',
    })
    setSelectedElementId(null)
    setCreateElementOpen(true)
  }, [])
  const modeMenuRef = useRef<any>(null)
  const createBtnId = `pl-create-${useId().replace(/:/g, '')}`

  function openModeMenu() {
    if (modeMenuRef.current) {
      modeMenuRef.current.opener = 'pl-mode-btn'
      modeMenuRef.current.open = true
    }
  }

  // ── Lifted canvas settings ───────────────────────────────────────────────────
  const [displayLevel, setDisplayLevel] = useState<DisplayLevel>('l2')
  const [byFunction, setByFunction] = useState(false)
  const [selectedL1Ids, setHiddenL1Ids] = useState<string[]>([])

  // ── Saved view variants (user-created, persisted to localStorage) ────────────
  const [savedVariants, setSavedVariants] = useState<ViewVariant[]>(loadSavedVariants)
  const [activeVariantId, setActiveVariantId] = useState<string>(
    () => localStorage.getItem('plActiveVariantId') ?? 'default-e2e'
  )

  const orderedHierarchies = useMemo(() => [
    ...hierarchies.filter(h => DEFAULT_HIERARCHY_IDS.has(h.id)),
    ...hierarchies.filter(h => !DEFAULT_HIERARCHY_IDS.has(h.id)),
  ], [hierarchies])

  const defaultVariants: ViewVariant[] = useMemo(() =>
    orderedHierarchies.map(h => ({
      id: `default-${h.id}`,
      name: h.name,
      hierarchyId: h.id,
      displayLevel: 'l2',
      byFunction: false,
      selectedL1Ids: [],
    })),
    [orderedHierarchies]
  )

  const allVariants = useMemo(() =>
    [...defaultVariants, ...savedVariants.filter(v => hierarchies.some(h => h.id === v.hierarchyId))],
    [defaultVariants, savedVariants, hierarchies]
  )

  const activeVariant = useMemo(() =>
    allVariants.find(v => v.id === activeVariantId) ?? defaultVariants[0],
    [allVariants, activeVariantId, defaultVariants]
  )

  const selectedHierarchyId = activeVariant?.hierarchyId ?? 'apqc'
  const selectedHierarchy = hierarchies.find(h => h.id === selectedHierarchyId) ?? hierarchies[0]

  const applyVariant = useCallback((v: ViewVariant) => {
    setActiveVariantId(v.id)
    setDisplayLevel(v.displayLevel)
    setByFunction(v.byFunction)
    setHiddenL1Ids(v.selectedL1Ids)
    localStorage.setItem('plActiveVariantId', v.id)
  }, [])

  return (
    <>
      <SplitterLayout
        options={{ resetOnSizeChange: true, resetOnChildrenChange: true }}
        style={{ flex: 1, minHeight: 0, height: '100%', width: '100%' } as React.CSSProperties}
      >
        <SplitterElement style={{ height: '100%', overflow: 'hidden', minWidth: 0 } as React.CSSProperties}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <Bar design="Header" style={{ '--_ui5_bar_base_height': '2.75rem' } as React.CSSProperties}>
              <VariantManagement
                slot="startContent"
                closeOnItemSelect
                size="H4"
                level="H4"
                hideApplyAutomatically
                onSelect={(e) => {
                  const name = e.detail.selectedVariant?.children as string | undefined
                  if (!name) return
                  const v = allVariants.find(v => v.name === name)
                  if (v) applyVariant(v)
                }}
                onSaveAs={(e) => {
                  const detail = (e as any)?.detail
                  const name = detail?.children as string | undefined
                  if (!name) return
                  const newVariant: ViewVariant = {
                    id: nanoid(),
                    name,
                    hierarchyId: selectedHierarchyId,
                    displayLevel,
                    byFunction,
                    selectedL1Ids,
                  }
                  const next = [...savedVariants, newVariant]
                  setSavedVariants(next)
                  persistVariants(next)
                  setActiveVariantId(newVariant.id)
                  localStorage.setItem('plActiveVariantId', newVariant.id)
                }}
                onSaveManageViews={(e) => {
                  const updated = (e as any)?.detail?.variants as Array<{ children: string }> | undefined
                  if (!updated) return
                  const updatedNames = new Set(updated.map((v: any) => v.children as string))
                  const next = savedVariants.filter(v => updatedNames.has(v.name))
                  setSavedVariants(next)
                  persistVariants(next)
                  if (!next.find(v => v.id === activeVariantId)) {
                    applyVariant(defaultVariants.find(d => d.hierarchyId === selectedHierarchyId) ?? defaultVariants[0])
                  }
                }}
              >
                {allVariants.map(v => {
                  const isDefault = v.id.startsWith('default-')
                  const hierarchyName = hierarchies.find(h => h.id === v.hierarchyId)?.name
                  return (
                    <VariantItem
                      key={v.id}
                      selected={v.id === activeVariant?.id}
                      isDefault={v.id === defaultVariants[0]?.id}
                      labelReadOnly={isDefault}
                      hideDelete={isDefault}
                      author={!isDefault ? hierarchyName : undefined}
                    >
                      {v.name}
                    </VariantItem>
                  )
                })}
              </VariantManagement>
              <div slot="endContent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {mode === 'Edit' && (
                  <Button
                    design="Transparent"
                    icon="action-settings"
                    tooltip="Manage hierarchy structure"
                    onClick={() => setManageOpen(true)}
                  >
                    Manage
                  </Button>
                )}
                {mode === 'Edit' && (
                  <>
                    <Button
                      id={createBtnId}
                      design="Emphasized"
                      endIcon="navigation-down-arrow"
                      onClick={() => setCreateMenuOpen(true)}
                    >
                      Create
                    </Button>
                    <Popover
                      opener={createBtnId}
                      open={createMenuOpen}
                      onClose={() => setCreateMenuOpen(false)}
                      placement="Bottom"
                      horizontalAlign="Start"
                      hideArrow
                      className="no-padding-popover"
                    >
                      <List
                        separators="None"
                        onItemClick={(e: any) => {
                          setCreateMenuOpen(false)
                          const action = (e.detail.item as HTMLElement).dataset.action
                          if (action === 'element') {
                            setSelectedElementId(null)
                            setCreateElementOpen(true)
                          } else if (action === 'hierarchy') {
                            setCreateOpen(true)
                          }
                        }}
                      >
                        <ListItemStandard icon="add-document" type="Active" data-action="element">
                          Element
                        </ListItemStandard>
                        <ListItemStandard icon="org-chart" type="Active" data-action="hierarchy">
                          Process Hierarchy
                        </ListItemStandard>
                      </List>
                    </Popover>
                  </>
                )}
                <SegmentedButton>
                  <SegmentedButtonItem
                    icon="SAP-icons-v4/process-manager"
                    selected={viewMode === 'explorer'}
                    tooltip="Explorer view"
                    onClick={() => setViewMode('explorer')}
                  />
                  <SegmentedButtonItem
                    icon="list"
                    selected={viewMode === 'list'}
                    tooltip="List view"
                    onClick={() => setViewMode('list')}
                  />
                </SegmentedButton>
                <Button
                  id="pl-mode-btn"
                  design="Default"
                  endIcon="slim-arrow-down"
                  onClick={openModeMenu}
                >
                  {mode}
                </Button>
              </div>
            </Bar>

            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {viewMode === 'explorer' && (
                <CanvasView
                  hierarchyId={selectedHierarchyId}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  displayLevel={displayLevel}
                  onDisplayLevelChange={setDisplayLevel}
                  byFunction={byFunction}
                  onByFunctionChange={setByFunction}
                  selectedL1Ids={selectedL1Ids}
                  onSelectedL1IdsChange={setHiddenL1Ids}
                  isEditMode={mode === 'Edit'}
                  onCreateBetween={handleCreateBetween}
                />
              )}

              {viewMode === 'list' && (
                <CatalogView
                  hierarchyId={selectedHierarchyId}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                />
              )}

              <CreateHierarchyDialog
                open={createOpen}
                onCreated={(id) => {
                  setCreateOpen(false)
                  setSelectedElementId(null)
                  setViewMode('list')
                  const newDefault: ViewVariant = {
                    id: `default-${id}`,
                    name: hierarchies.find(h => h.id === id)?.name ?? id,
                    hierarchyId: id,
                    displayLevel: 'l2',
                    byFunction: false,
                    selectedL1Ids: [],
                  }
                  applyVariant(newDefault)
                }}
                onCancel={() => setCreateOpen(false)}
              />

              <ManageHierarchyModal
                open={manageOpen}
                hierarchy={selectedHierarchy}
                onClose={() => setManageOpen(false)}
              />
            </div>
          </div>
        </SplitterElement>

        {(selectedElementId || createElementOpen) ? (
          <SplitterElement size="380px" minSize={300}
            style={{ height: '100%', overflow: 'hidden', borderLeft: '1px solid var(--sapList_BorderColor)' } as React.CSSProperties}>
            <ProcessLandscapeDetailPanel
              hierarchyId={selectedHierarchyId}
              elementId={selectedElementId}
              mode={createElementOpen && !selectedElementId ? 'create' : 'view'}
              onClose={() => { setSelectedElementId(null); setCreateElementOpen(false); setCreateBetween(null) }}
              initialPredecessorIds={createBetween?.predecessorIds}
              initialSuccessorIds={createBetween?.successorIds}
              initialParentId={createBetween?.parentId}
            />
          </SplitterElement>
        ) : null}
      </SplitterLayout>
      <Menu ref={modeMenuRef} onItemClick={(e: any) => setMode(e.detail?.text ?? mode)}>
        <MenuItem text="Edit" />
        <MenuItem text="View" />
      </Menu>
    </>
  )
}

export default function ProcessLandscape() {
  return (
    <ProcessLandscapeProvider>
      <ProcessLandscapeInner />
    </ProcessLandscapeProvider>
  )
}
