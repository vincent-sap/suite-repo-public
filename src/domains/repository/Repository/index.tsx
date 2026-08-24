import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Toolbar, ToolbarSpacer, ToolbarItem, ToolbarSeparator, Button, ToggleButton, Icon, Text, Input,
  SplitterLayout, SplitterElement, CheckBox, RadioButton,
  Menu, MenuItem, MenuSeparator,
  Popover, List, ListItemStandard, ListItemCustom,
  AnalyticalTable, Toast, MessageBox, Dialog, Bar, BusyIndicator, IllustratedMessage,
  VariantManagement, VariantItem,
  Breadcrumbs, BreadcrumbsItem,
  SegmentedButton, SegmentedButtonItem,
  type AnalyticalTableColumnDefinition,
  type PopoverDomRef,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { useWorkspace, type SmartFolder, type DictCategoryType } from '../../../contexts/WorkspaceContext'
import AllResources, { type SelectedAssetInfo } from '../AllResources'
import DateRangePicker from '../components/DateRangePicker'
import ProcessAtoms, { INITIAL_PROCESS_ATOMS } from '../ProcessAtoms'
import SmartFolderPage from '../SmartFolder'
import TrashPage from '../TrashPage'
import VariantManagementPage from '../../settings/VariantManagement'
import ModelDetailPage from '../../modeler/ModelDetailPage'

import {
  FILES, FOLDER_FILES, MY_MODELING_FILES, DEFAULT_COLUMNS, FOLDER_TREE,
  TYPE_OPTIONS, STATUS_OPTIONS,
  INITIAL_VARIANTS, ACCESS_USERS,
  findFolderPath,
  type FileItem, type ColumnDef, type ViewType, type ViewVariant, type AccessRole,
} from './data'
import { DICT_ENTRIES, catBg, entryBg, entryIconColor, catIconColor, CAT_TYPE_ICON, type DictEntry } from './dictionaryData'
import { AssetListItem } from '../components/AssetListItem'
import MagicZoom, { type ViewportHint } from './MagicZoom'
import NavTree from './NavTree'
import EmbedDialog from './dialogs/EmbedDialog'
import ExportSGXDialog from './dialogs/ExportSGXDialog'
import { ExportTranslationsDialog, ImportTranslationsDialog } from './dialogs/TranslationsDialogs'
import ApprovalWorkflowsDialog from './dialogs/ApprovalWorkflowsDialog'
import CustomizeColumnsDialog from './dialogs/CustomizeColumnsDialog'
import { ShareDialog, ManageAccessDialog } from './dialogs/ShareDialogs'
import EditFolderDialog from './dialogs/EditFolderDialog'
import UploadFileDialog from './dialogs/UploadFileDialog'
import MergeDictionaryEntriesDialog from './dialogs/MergeDictionaryEntriesDialog'
import ImportExcelDialog from './dialogs/ImportExcelDialog'
import { useRepositoryDialogs } from './useRepositoryDialogs'
import AssetInfoPanel from './AssetInfoPanel'

const FILE_TYPE_LABEL: Record<string, string> = {
  'Customer Journey': 'Journey Model',
  'Process Model': 'BPMN',
}
const fileTypeLabel = (type: string) => FILE_TYPE_LABEL[type] ?? type

const SORT_OPTIONS = [
  { key: 'Changed By', type: 'text' as const },
  { key: 'Created By', type: 'text' as const },
  { key: 'Date Changed', type: 'date' as const },
  { key: 'Date Created', type: 'date' as const },
  { key: 'Latest Version', type: 'version' as const },
  { key: 'Name', type: 'text' as const },
  { key: 'Status', type: 'text' as const },
  { key: 'Type', type: 'text' as const },
]

function sortDirLabel(type: 'text' | 'date' | 'version', dir: 'asc' | 'desc'): string {
  if (type === 'date') return dir === 'asc' ? 'Oldest First' : 'Newest First'
  if (type === 'version') return dir === 'asc' ? 'Lowest First' : 'Highest First'
  return dir === 'asc' ? 'A–Z' : 'Z–A'
}

export default function Repository() {
  const { smartFolders, dictCategories, contentLanguages } = useWorkspace()
  const contentFilterMenuRef = useRef<PopoverDomRef>(null)

  // ── Navigation state ──────────────────────────────────────────────────────
  const [showAllResources, setShowAllResources] = useState(true)
  const [showTrash, setShowTrash] = useState(false)
  const [showVariantManagement, setShowVariantManagement] = useState(false)
  const [showProcessAtoms, setShowProcessAtoms] = useState(false)
  const [showModelDetail, setShowModelDetail] = useState(false)
  const [rootExpanded, setRootExpanded] = useState(false)
  const [myModelingExpanded, setMyModelingExpanded] = useState(false)
  const [dataModelingExpanded, setDataModelingExpanded] = useState(false)
  const [dictionaryExpanded, setDictionaryExpanded] = useState(false)
  const [selectedRoot, setSelectedRoot] = useState<'modeling' | 'my-modeling' | 'data-modeling' | 'dictionary' | 'process-atoms'>('modeling')
  const [selectedFolderPath, setSelectedFolderPath] = useState<{ id: string; name: string }[] | null>(null)
  const [selectedSmartFolder, setSelectedSmartFolder] = useState<SmartFolder | null>(null)

  // ── File selection & drag/drop ────────────────────────────────────────────
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [selectedDictEntry, setSelectedDictEntry] = useState<DictEntry | null>(null)
  const [selectedDictCategory, setSelectedDictCategory] = useState<import('../../../contexts/WorkspaceContext').DictCategory | null>(null)
  // Dictionary folder navigation: path of { id, name } category segments
  const [selectedDictCategoryPath, setSelectedDictCategoryPath] = useState<{ id: string; name: string }[]>([])
  // Multi-select ids for dict entries (for selection toolbar)
  const [selectedDictIds, setSelectedDictIds] = useState<Set<string>>(new Set())
  const [selectedDictCatIds, setSelectedDictCatIds] = useState<Set<string>>(new Set())

  // ── Viewport width for responsive nav hiding ──────────────────────────────
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const isSmallViewport = viewportWidth < 1200
  const hideNavTree = (isSmallViewport && infoPanelOpen) || showModelDetail
  const [selectedAsset, setSelectedAsset] = useState<FileItem | null>(null)
  const [externalSelectedAsset, setExternalSelectedAsset] = useState<SelectedAssetInfo | null>(null)
  const [externalSelectionCount, setExternalSelectionCount] = useState(0)
  const handleExternalAssetClick = (asset: SelectedAssetInfo) => {
    setSelectedAsset(null)
    setExternalSelectedAsset(asset)
    if (!showAllResources) setInfoPanelOpen(true)
  }
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null)

  const toggleFileFavorite = (fileId: string) => {
    const key = `file:${fileId}`
    setFavoriteIds(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
  }
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [hoveredGridId, setHoveredGridId] = useState<string | null>(null)
  const [moveToast, setMoveToast] = useState<string | null>(null)
  const [copyLinkToast, setCopyLinkToast] = useState(false)
  const [dictEntryCreatedToast, setDictEntryCreatedToast] = useState(false)
  const [dictEntryEditedToast, setDictEntryEditedToast] = useState(false)
  const [dictEntryDeletedToast, setDictEntryDeletedToast] = useState(false)
  const [inviteToast, setInviteToast] = useState<string | null>(null)
  const [renameToast, setRenameToast] = useState(false)
  const [notifPref, setNotifPref] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Off'>('Off')
  const [notifToast, setNotifToast] = useState<string | null>(null)

  // ── Table / view state ────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<ViewType>('table')
  const [contentFilter, setContentFilter] = useState<'all' | 'published'>('all')
  const [fileSearch, setFileSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [variants, setVariants] = useState<ViewVariant[]>(INITIAL_VARIANTS)
  const [selectedVariant, setSelectedVariant] = useState('Standard')
  const [sortBy, setSortBy] = useState('Name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [savedViewState, setSavedViewState] = useState({ sortBy: 'Name', sortDir: 'asc' as 'asc' | 'desc', groupBy: 'none' as typeof groupBy, filters: {} as Record<string, unknown>, columns: DEFAULT_COLUMNS })
  const [variantStates, setVariantStates] = useState<Record<string, { sortBy: string; sortDir: 'asc' | 'desc'; groupBy: typeof groupBy; filters: Record<string, unknown>; columns: typeof DEFAULT_COLUMNS }>>({ Standard: { sortBy: 'Name', sortDir: 'asc', groupBy: 'none', filters: {}, columns: DEFAULT_COLUMNS } })
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const dictSortPopoverRef = useRef<PopoverDomRef>(null)
  const [groupBy, setGroupBy] = useState<'none' | 'changedBy' | 'createdBy' | 'dateChanged' | 'dateCreated' | 'location' | 'status' | 'type'>('none')
  const groupByPopoverRef = useRef<PopoverDomRef>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS)
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [dictCatOverflowId, setDictCatOverflowId] = useState<string | null>(null)
  const [hoveredDictCatId, setHoveredDictCatId] = useState<string | null>(null)
  const [dictEntryOverflowId, setDictEntryOverflowId] = useState<string | null>(null)
  const [deleteDictEntryId, setDeleteDictEntryId] = useState<string | null>(null)
  const [hoveredDictEntryId, setHoveredDictEntryId] = useState<string | null>(null)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [importExcelOpen, setImportExcelOpen] = useState(false)
  const [filterBarOpen, setFilterBarOpen] = useState(false)
  const [selReportingOpen, setSelReportingOpen] = useState(false)
  const [selVariantMenuOpen, setSelVariantMenuOpen] = useState(false)
  const [selExportOpen, setSelExportOpen] = useState(false)
  const [selActionOpen, setSelActionOpen] = useState(false)
  const [selOpenOpen, setSelOpenOpen] = useState(false)

  // ── Dialog open flags ─────────────────────────────────────────────────────
  const {
    customizeColumnsOpen, setCustomizeColumnsOpen,
    exportDialogOpen, setExportDialogOpen,
    exportTranslationsOpen, setExportTranslationsOpen,
    importTranslationsOpen, setImportTranslationsOpen,
    approvalWorkflowsOpen, setApprovalWorkflowsOpen,
    embedFile, setEmbedFile,
    shareFile, setShareFile,
    shareView, setShareView,
    manageFromShare, setManageFromShare,
  } = useRepositoryDialogs()

  const [createDictCategoryId, setCreateDictCategoryId] = useState<string | null>(null)
  const [createProcessAtom, setCreateProcessAtom] = useState(false)
  const [processAtoms, setProcessAtoms] = useState(INITIAL_PROCESS_ATOMS)
  const [dictEntries, setDictEntries] = useState<DictEntry[]>(DICT_ENTRIES)
  const [dictSortDir, setDictSortDir] = useState<'asc' | 'desc'>('asc')
  const [folderOverflowOpen, setFolderOverflowOpen] = useState(false)
  const [dictNotifMenuOpen, setDictNotifMenuOpen] = useState(false)
  const [folderNotifMenuOpen, setFolderNotifMenuOpen] = useState(false)
  const [dictExportMenuOpen, setDictExportMenuOpen] = useState(false)
  const [dictExcelDialogOpen, setDictExcelDialogOpen] = useState(false)
  const [dictExportProgressOpen, setDictExportProgressOpen] = useState(false)
  const [dictExportSuccessToast, setDictExportSuccessToast] = useState(false)
  const [dictExcelScope, setDictExcelScope] = useState<'category' | 'selected' | 'all'>('category')
  const [dictExcelIncludeModels, setDictExcelIncludeModels] = useState(false)
  const dictExportProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [editFolderOpen, setEditFolderOpen] = useState(false)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)
  const [dictMergeOpen, setDictMergeOpen] = useState(false)
  const [dictMergeConfirmOpen, setDictMergeConfirmOpen] = useState(false)
  const [dictMergeProgressOpen, setDictMergeProgressOpen] = useState(false)
  const [dictMergeSuccessToast, setDictMergeSuccessToast] = useState(false)
  const [dictMergePendingKeepId, setDictMergePendingKeepId] = useState<string | null>(null)
  const [dictMergePendingMergeIds, setDictMergePendingMergeIds] = useState<string[]>([])
  const dictMergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null)
  const [editedFolderNames, setEditedFolderNames] = useState<Record<string, { name: string; description?: string }>>({})

  const getFolderDisplayName = (id: string, fallback: string) => editedFolderNames[id]?.name ?? fallback
  void getFolderDisplayName

  // ── Magic zoom ────────────────────────────────────────────────────────────
  const [zoomScrimRect, setZoomScrimRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const zoomFocusRef = useRef<{ nx: number; ny: number }>({ nx: 0.5, ny: 0.5 })
  const [zoomViewport, setZoomViewport] = useState<ViewportHint | null>(null)
  // const _zoomDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const zoomOpenRef = useRef(false)
  const contentAreaRef = useRef<HTMLDivElement>(null)
  const splitterLayoutRef = useRef<HTMLDivElement>(null)

  const closeZoom = useCallback(() => {
    zoomOpenRef.current = false
    setZoomScrimRect(null)
    setZoomViewport(null)
  }, [])

  const handleThumbnailEnter = useCallback(() => {
    // no-op — zoom now opens on click, not hover
  }, [])

  const handleThumbnailMove = useCallback((nx: number, ny: number) => {
    zoomFocusRef.current = { nx, ny }
  }, [])

  const handleThumbnailLeave = useCallback(() => {
    // no-op — zoom now opens on click, not hover
  }, [closeZoom])

  const handleThumbnailClick = useCallback(() => {
    if (zoomOpenRef.current) { closeZoom(); return }
    if (autoCloseRef.current) { clearTimeout(autoCloseRef.current); autoCloseRef.current = null }
    const contentRect = contentAreaRef.current?.getBoundingClientRect()
    const layoutRect = splitterLayoutRef.current?.getBoundingClientRect()
    if (contentRect && layoutRect) {
      zoomOpenRef.current = true
      setZoomScrimRect({
        left: layoutRect.left,
        top: layoutRect.top,
        width: contentRect.right - layoutRect.left,
        height: layoutRect.height,
      })
    }
  }, [closeZoom])

  // Called by MagicZoom when the cursor enters the scrim overlay
  const handleScrimEnter = useCallback(() => {
    if (autoCloseRef.current) { clearTimeout(autoCloseRef.current); autoCloseRef.current = null }
  }, [])

  const handleZoomClose = closeZoom
  const [accessLevels, setAccessLevels] = useState<Record<string, AccessRole>>(
    () => Object.fromEntries(ACCESS_USERS.map(u => [u.id, u.defaultRole]))
  )
  const [subscriptions, setSubscriptions] = useState<Record<string, 'off' | 'daily' | 'weekly' | 'monthly'>>({})

  const getSubscription = (id: string) => subscriptions[id] ?? 'off'
  void getSubscription
  const setSubscription = (id: string, value: 'off' | 'daily' | 'weekly' | 'monthly') =>
    setSubscriptions(prev => ({ ...prev, [id]: value }))

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string, mode: 'row' | 'checkbox') => {
    setSelectedIds(prev => {
      if (mode === 'row') return new Set([id])
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleRowSelect = (file: FileItem) => {
    toggleSelect(file.id, 'row')
    if (infoPanelOpen) setSelectedAsset(file)
  }

  const handleDrop = (targetFolderId: string) => {
    const targetFolder = FILES.find(f => f.id === targetFolderId)
    if (!targetFolder) return
    const dropping = draggedId && selectedIds.has(draggedId) ? [...selectedIds] : draggedId ? [draggedId] : []
    if (!dropping.length) return
    const names = dropping.map(id => FILES.find(f => f.id === id)?.name).filter(Boolean)
    setMoveToast(dropping.length === 1 ? `"${names[0]}" moved to "${targetFolder.name}"` : `${dropping.length} items moved to "${targetFolder.name}"`)
    setDraggedId(null)
    setDropTargetId(null)
  }

  const clearSelection = () => {
    setShowAllResources(false); setShowTrash(false); setShowVariantManagement(false); setShowProcessAtoms(false)
    setSelectedFolderPath(null); setSelectedSmartFolder(null)
    setExternalSelectedAsset(null); setSelectedDictEntry(null)
    setSelectedDictCategoryPath([]); setSelectedDictIds(new Set()); setSelectedDictCatIds(new Set()); setSelectedIds(new Set())
    setInfoPanelOpen(false)
  }
  const selectFolderWithPath = (path: { id: string; name: string }[]) => { clearSelection(); setSelectedFolderPath(path) }

  const navigateIntoFolder = (file: FileItem) => {
    if (file.type !== 'Folder') return
    const base = selectedFolderPath ?? []
    const newPath = [...base, { id: file.id, name: file.name }]
    selectFolderWithPath(newPath)
  }

  const isModelingFiles = !showAllResources && !showTrash && !showVariantManagement && !showProcessAtoms && !selectedSmartFolder
  const selectedFolderLeaf = selectedFolderPath?.[selectedFolderPath.length - 1]
  const selectedDictCategoryLeaf = selectedDictCategoryPath[selectedDictCategoryPath.length - 1]
  const pageTitle = selectedFolderLeaf
    ? selectedFolderLeaf.name
    : showAllResources ? 'All Resources'
    : selectedRoot === 'my-modeling' ? 'Private Modeling Files'
    : selectedRoot === 'data-modeling' ? 'Data Management Files'
    : selectedRoot === 'dictionary'
      ? (selectedDictCategoryLeaf ? selectedDictCategoryLeaf.name : 'Dictionary')
    : selectedRoot === 'process-atoms' ? 'Process Atoms'
    : 'Modeling Files'

  const visibleColumns = columns.filter(c => c.visible && !(selectedRoot === 'my-modeling' && (c.id === 'status' || c.id === 'version')))
  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length

  const rootFiles = selectedRoot === 'my-modeling' ? MY_MODELING_FILES : FILES
  const folderFiles = selectedFolderLeaf
    ? (FOLDER_FILES[selectedFolderLeaf.id] ?? rootFiles)
    : rootFiles

  const displayFiles = (() => {
    let result = contentFilter === 'published'
      ? folderFiles.filter(f => f.type === 'Folder' || f.status === 'Published')
      : folderFiles

    // Type filter — map filter values to FileItem type strings
    const typeFilter = filters.type as string[] | undefined
    if (typeFilter?.length) {
      const typeMap: Record<string, string> = {
        'folder': 'Folder', 'journey': 'Customer Journey', 'process': 'Process Model',
        'navmap': 'Navigation Map', 'value-chain': 'Value Chain', 'dmn': 'DMN', 'dashboard': 'Dashboard',
      }
      const allowed = new Set(typeFilter.map(v => typeMap[v]).filter(Boolean))
      result = result.filter(f => allowed.has(f.type))
    }

    // Status filter
    const statusFilter = filters.status as string[] | undefined
    if (statusFilter?.length) {
      const allowed = new Set(statusFilter.map(v => v.charAt(0).toUpperCase() + v.slice(1)))
      result = result.filter(f => f.type === 'Folder' || (f.status && allowed.has(f.status)))
    }

    // Date created filter
    const dateCreatedFilter = filters.dateCreated as { mode: string; startDate?: string; endDate?: string } | undefined
    if (dateCreatedFilter?.startDate) {
      const start = dateCreatedFilter.startDate
      const end = dateCreatedFilter.endDate ?? start
      result = result.filter(f => {
        const d = new Date(f.created)
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return iso >= start && iso <= end
      })
    }

    // Date changed filter
    const dateChangedFilter = filters.dateChanged as { mode: string; startDate?: string; endDate?: string } | undefined
    if (dateChangedFilter?.startDate) {
      const start = dateChangedFilter.startDate
      const end = dateChangedFilter.endDate ?? start
      result = result.filter(f => {
        const d = new Date(f.changed)
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return iso >= start && iso <= end
      })
    }

    return result
  })()

  const s = savedViewState
  const isViewDirty = sortBy !== s.sortBy || sortDir !== s.sortDir || groupBy !== s.groupBy
    || JSON.stringify(filters) !== JSON.stringify(s.filters)
    || JSON.stringify(columns.map(c => ({ id: c.id, visible: c.visible }))) !== JSON.stringify(s.columns.map(c => ({ id: c.id, visible: c.visible })))

  // ── Multi-select categorisation ───────────────────────────────────────────
  const selectedFilesList = displayFiles.filter(f => selectedIds.has(f.id))
  const selAllFolders = selectedFilesList.length > 0 && selectedFilesList.every(f => f.type === 'Folder')
  const selAllNonFolders = selectedFilesList.length > 0 && selectedFilesList.every(f => f.type !== 'Folder')

  const REPORTING_ITEMS = (
    <MenuItem text="Reporting" icon="SAP-icons-v4/report">
      <MenuItem text="Process documentation (PDF)" />
      <MenuItem text="Process documentation (Word)" />
      <MenuItem text="Governance report" />
      <MenuItem text="Process cost analysis" />
      <MenuItem text="Resource consumption analysis" />
      <MenuItem text="Modeling conventions" />
      <MenuItem text="Responsibility assignment matrix / RACI" />
      <MenuItem text="Responsibility handovers matrix" />
      <MenuItem text="Documents usage matrix" />
      <MenuItem text="IT system usage matrix (by diagrams)" />
      <MenuItem text="IT system usage matrix (by roles)" />
      <MenuItem text="Process characteristics with element details" />
      <MenuItem text="Process model metrics" />
      <MenuItem text="Risks and Controls Report" />
      <MenuItem text="User/Group assignment" />
    </MenuItem>
  )

  const renderMultiSelectMenu = () => {
    if (selAllFolders) return (
      <>
        <MenuItem text="Add to Favorites" icon="unfavorite" />
        {REPORTING_ITEMS}
        <MenuItem text="Export as" icon="SAP-icons-v4/export">
          <MenuItem text="SAP Signavio Archive (SGX)" />
          <MenuItem text="PDF" />
          <MenuItem text="Drools" />
          <MenuSeparator />
          <MenuItem text="Export Diagram Translations" />
        </MenuItem>
        <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
        <MenuItem text="Move To" icon="SAP-icons-v4/file-move" />
        <MenuItem text="Move to Trash" icon="delete" />
      </>
    )
    if (selAllNonFolders) return (
      <>
        <MenuItem text="Add to Favorites" icon="unfavorite" />
        <MenuItem text="Compare Revisions" icon="compare" />
        {REPORTING_ITEMS}
        <MenuItem text="Publish Revision" icon="SAP-icons-v4/published" />
        <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" disabled />
        <MenuItem text="Export as" icon="SAP-icons-v4/export">
          <MenuItem text="SAP Signavio Archive (SGX)" />
          <MenuItem text="BPMN 2.0 XML" />
          <MenuItem text="XML" />
          <MenuItem text="PNG" />
          <MenuItem text="DMN 1.2 XML" />
          <MenuItem text="SVG" />
          <MenuItem text="PDF" />
          <MenuItem text="Drools" />
          <MenuSeparator />
          <MenuItem text="Export Diagram Translations" />
        </MenuItem>
        <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
        <MenuItem text="Move To" icon="SAP-icons-v4/file-move" />
        <MenuItem text="Copy to" icon="copy" />
        <MenuItem text="Move to Trash" icon="delete" />
      </>
    )
    // mixed
    return (
      <>
        <MenuItem text="Add to Favorites" icon="unfavorite" />
        {REPORTING_ITEMS}
        <MenuItem text="Export as" icon="SAP-icons-v4/export">
          <MenuItem text="SAP Signavio Archive (SGX)" />
          <MenuItem text="PDF" />
          <MenuSeparator />
          <MenuItem text="Export Diagram Translations" />
        </MenuItem>
        <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
        <MenuItem text="Move To" icon="SAP-icons-v4/file-move" />
        <MenuItem text="Move to Trash" icon="delete" />
      </>
    )
  }

  // ── View renderers ────────────────────────────────────────────────────────
  const renderListView = () => {
    const allSelected = displayFiles.length > 0 && displayFiles.every(f => selectedIds.has(f.id))
    const someSelected = !allSelected && displayFiles.some(f => selectedIds.has(f.id))
    const handleSelectAll = () => {
      if (allSelected) setSelectedIds(new Set())
      else setSelectedIds(new Set(displayFiles.map(f => f.id)))
    }
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'var(--sapList_Background)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
          <CheckBox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} accessibleName="Select all" />
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>Select All</Text>
        </div>
        <List separators="Inner">
          {displayFiles.map((file, idx) => {
            const isSelected = selectedIds.has(file.id)
            const isDropTarget = file.type === 'Folder' && dropTargetId === file.id
            const baseChips = (file.status && selectedRoot !== 'my-modeling') ? [{ value: file.status, design: (file.status === 'Published' ? 'positive' : file.status === 'Draft' ? 'none' : 'information') as 'none' | 'positive' | 'information' }] : []
            const chips: any[] = [
              ...baseChips.map(c => ({ ...c, label: 'Status:' })),
              ...((file.type === 'Process Model' || file.type === 'Value Chain' || file.type === 'Navigation Map') && file.version && selectedRoot !== 'my-modeling' ? [
                { value: file.version, design: 'none' as const, label: 'Latest Revision:', useExplicitDesign: true },
                { value: `P-${file.id.slice(0, 6).toUpperCase()}`, design: 'none' as const, label: 'Process ID:', useExplicitDesign: true },
              ] : []),
            ]
            return (
              <AssetListItem
                key={file.id}
                id={file.id}
                name={file.name}
                objectType={file.type}
                typeName={fileTypeLabel(file.type)}
                description={file.description}
                created={file.created}
                changed={file.changed}
                chips={chips}
                isSelected={isSelected}
                isDragging={draggedId === file.id}
                isDropTarget={isDropTarget}
                draggable={file.type !== 'Folder'}
                onSelect={() => toggleSelect(file.id, 'checkbox')}
                onClick={() => handleRowSelect(file)}
                onDoubleClick={() => { if (file.type === 'Folder') navigateIntoFolder(file); else setShowModelDetail(true) }}
                onMouseEnter={() => setHoveredFileId(file.id)}
                onMouseLeave={() => setHoveredFileId(null)}
                onTitleClick={file.type !== 'Folder' ? (e) => { e.stopPropagation(); setShowModelDetail(true) } : (e) => { e.stopPropagation(); navigateIntoFolder(file) }}
                onDragStart={() => setDraggedId(file.id)}
                onDragEnd={() => { setDraggedId(null); setDropTargetId(null) }}
                onDragOver={file.type === 'Folder' ? (e) => { e.preventDefault(); setDropTargetId(file.id) } : undefined}
                onDragLeave={file.type === 'Folder' ? () => setDropTargetId(null) : undefined}
                onDrop={file.type === 'Folder' ? (e) => { e.preventDefault(); handleDrop(file.id) } : undefined}
                overflowId={`overflow-${file.id}`}
                onOverflow={() => { if (!selectedIds.has(file.id)) toggleSelect(file.id, 'row'); setOpenOverflowId(file.id) }}
                isLast={idx === displayFiles.length - 1}
                actionsSlot={hoveredFileId === file.id || favoriteIds.has(`file:${file.id}`) ? (
                  <Button
                    icon={favoriteIds.has(`file:${file.id}`) ? 'favorite' : 'unfavorite'}
                    design="Transparent"
                    tooltip={favoriteIds.has(`file:${file.id}`) ? 'Remove from Favorites' : 'Add to Favorites'}
                    onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(file.id) }}
                  />
                ) : undefined}
              />
            )
          })}
        </List>
      </div>
    )
  }

  const renderTableView = () => {
    const allSelected = displayFiles.length > 0 && displayFiles.every(f => selectedIds.has(f.id))
    const someSelected = !allSelected && displayFiles.some(f => selectedIds.has(f.id))
    const handleSelectAll = () => {
      if (allSelected) setSelectedIds(new Set())
      else setSelectedIds(new Set(displayFiles.map(f => f.id)))
    }

    const checkboxCol: AnalyticalTableColumnDefinition = {
      id: '__select',
      Header: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckBox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} accessibleName="Select all" />
        </div>
      ),
      accessor: 'id',
      disableSortBy: true,
      disableFilters: true,
      disableGroupBy: true,
      minWidth: 44,
      width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => {
        const file = row.original as FileItem
        const isSelected = selectedIds.has(file.id)
        return (
          <div onClick={(e) => { e.stopPropagation(); toggleSelect(file.id, 'checkbox') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckBox checked={isSelected} accessibleName={`Select ${file.name}`} />
          </div>
        )
      },
    }

    const atColumns: AnalyticalTableColumnDefinition[] = visibleColumns.map(col => ({
      accessor: col.id,
      Header: (col.id === 'created' || col.id === 'changed')
        ? () => <div style={{ width: '100%', textAlign: 'right' }}>{col.label}</div>
        : col.label,
      id: col.id,
      ...(col.id === 'name' ? { minWidth: 300, width: 300 } : col.id === 'description' ? { minWidth: 120 } : { minWidth: 80 }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => {
        const file = row.original as FileItem
        if (col.id === 'name') {
          const isDropTarget = file.type === 'Folder' && dropTargetId === file.id
          return (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 6px', borderRadius: '4px', background: isDropTarget ? 'var(--sapList_Active_Background)' : 'transparent', outline: isDropTarget ? '2px solid var(--sapSelectedColor)' : 'none', outlineOffset: '-1px', opacity: draggedId === file.id ? 0.5 : 1, cursor: file.type !== 'Folder' ? 'grab' : 'default' }}
              draggable={file.type !== 'Folder'}
              onDragStart={(e) => { e.stopPropagation(); setDraggedId(file.id) }}
              onDragEnd={() => { setDraggedId(null); setDropTargetId(null) }}
              onDragOver={file.type === 'Folder' ? (e) => { e.preventDefault(); e.stopPropagation(); setDropTargetId(file.id) } : undefined}
              onDragLeave={file.type === 'Folder' ? () => setDropTargetId(null) : undefined}
              onDrop={file.type === 'Folder' ? (e) => { e.preventDefault(); e.stopPropagation(); handleDrop(file.id) } : undefined}
            >
              <SigDomainObject size="XXS" object={file.type} />
              {file.type !== 'Folder' ? (
                <Text
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowModelDetail(true) }}
                  className="table-asset-name"
                  style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', color: 'var(--sapTextColor)' }}
                >
                  {file.name}
                </Text>
              ) : (
                <Text
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateIntoFolder(file) }}
                  className="table-asset-name"
                  style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', color: 'var(--sapTextColor)' }}
                >
                  {file.name}
                </Text>
              )}
              {(hoveredFileId === file.id || favoriteIds.has(`file:${file.id}`)) && (
                <Button
                  icon={favoriteIds.has(`file:${file.id}`) ? 'favorite' : 'unfavorite'}
                  design="Transparent"
                  tooltip={favoriteIds.has(`file:${file.id}`) ? 'Remove from Favorites' : 'Add to Favorites'}
                  style={{ flexShrink: 0, height: '24px', minWidth: '24px' }}
                  onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(file.id) }}
                />
              )}
            </div>
          )
        }
        if (col.id === 'type') return <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileTypeLabel(file.type)}</Text>
        if (col.id === 'description') return <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{file.description ?? ''}</Text></div>
        if (col.id === 'created') return <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{file.created}</Text></div>
        if (col.id === 'changed') return <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{file.changed}</Text></div>
        if (col.id === 'version') return (file.version && selectedRoot !== 'my-modeling') ? <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{file.version}</Text> : null
        if (col.id === 'status' && file.status && selectedRoot !== 'my-modeling') return <SigChipV2
          value={file.status}
          leadingIcon={file.status === 'Published' ? 'SAP-icons-v4/published' : file.status === 'Draft' ? 'write-new-document' : 'SAP-icons-v4/published-changed'}
          design={file.status === 'Published' ? 'indication5' : file.status === 'Draft' ? 'indication10' : 'indication7'}
          condensed
        />
        return null
      },
    }))

    atColumns.push({
      id: '__actions', Header: '', accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => (
        <div style={{ overflow: 'visible' }}>
          <Button id={`overflow-${(row.original as FileItem).id}`} icon="overflow" design="Transparent" tooltip="More Options" onClick={(e) => { e.stopPropagation(); const fid = (row.original as FileItem).id; if (!selectedIds.has(fid)) toggleSelect(fid, 'row'); setOpenOverflowId(fid) }} />
        </div>
      ),
    })

    return (
      <div onDoubleClick={(e) => {
        const row = (e.target as HTMLElement).closest('[data-row-key]') as HTMLElement | null
        if (!row) return
        const rowKey = row.getAttribute('data-row-key')
        const file = displayFiles.find(f => f.id === rowKey)
        if (!file) return
        if (file.type === 'Folder') navigateIntoFolder(file); else setShowModelDetail(true)
      }}>
      <AnalyticalTable
        data={displayFiles}
        columns={[checkboxCol, ...atColumns]}
        selectionMode="None"
        tableHooks={[
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (hooks: any) => {
            hooks.getRowProps.push((_props: any, { row }: any) => {
              const file = row.original as FileItem
              const isSelected = selectedIds.has(file.id)
              return [_props, isSelected ? { 'data-is-selected': '' } : {}, {
                'data-row-key': file.id,
                onMouseEnter: () => { if (!openOverflowId) setHoveredFileId(file.id) },
                onMouseLeave: () => { if (!openOverflowId) setHoveredFileId(null) },
              }]
            })
          }
        ]}
        onRowClick={(e) => {
          if (openOverflowId) return
          // @ts-ignore
          const file = e?.detail?.row?.original as FileItem | undefined
          if (!file) return
          handleRowSelect(file)
        }}
        visibleRows={displayFiles.length}
        minRows={displayFiles.length}
        style={{ width: '100%' }}
        className="ui5-content-density-compact"
      />
      </div>
    )
  }

  const renderGridTile = (file: FileItem) => {
    const isSelected = selectedIds.has(file.id)
    const isHovered = hoveredGridId === file.id || hoveredGridId === `title-${file.id}`
    const isTitleHovered = hoveredGridId === `title-${file.id}`
    const isDropTarget = file.type === 'Folder' && dropTargetId === file.id
    const showHoverControls = isHovered && !isSelected

    let bg = 'transparent'
    if (isDropTarget) bg = 'var(--sapList_Active_Background)'
    else if (isSelected) bg = '#EBF8FF'
    else if (isHovered) bg = '#EAECEE'

    let border = '1px solid transparent'
    if (isSelected) border = '1px solid #0070F2'
    else if (isDropTarget) border = '2px solid var(--sapSelectedColor)'

    return (
      <div
        key={file.id}
        draggable={file.type !== 'Folder'}
        onMouseEnter={() => setHoveredGridId(file.id)}
        onMouseLeave={() => setHoveredGridId(null)}
        onDragStart={() => setDraggedId(file.id)}
        onDragEnd={() => { setDraggedId(null); setDropTargetId(null) }}
        onDragOver={file.type === 'Folder' ? (e) => { e.preventDefault(); setDropTargetId(file.id) } : undefined}
        onDragLeave={file.type === 'Folder' ? () => setDropTargetId(null) : undefined}
        onDrop={file.type === 'Folder' ? (e) => { e.preventDefault(); handleDrop(file.id) } : undefined}
        style={{
          width: '146px', height: '108px', position: 'relative', borderRadius: '6px',
          border, background: bg, boxSizing: 'border-box', cursor: 'pointer',
          opacity: draggedId === file.id ? 0.5 : 1,
        } as React.CSSProperties}
      >
        {/* icon area */}
        <div style={{
          position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)',
          width: '134px', display: 'flex', justifyContent: 'center',
          zIndex: 1, pointerEvents: 'none',
        }}>
          <div style={{ position: 'relative' }}>
            <SigDomainObject size="S" object={(file.type === 'Folder' ? 'Folder' : file.type) as never} />
            {selectedRoot !== 'my-modeling' && (file.hasPublished || file.status === 'Published') && (
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', transform: 'translate(50%, 50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--sapIndicationColor_5b)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Icon name="world" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapIndicationColor_5)' }} />
              </div>
            )}
            {selectedRoot !== 'my-modeling' && file.status === 'Draft' && (
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', transform: 'translate(50%, 50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--sapIndicationColor_10b)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Icon name="write-new-document" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapIndicationColor_10)' }} />
              </div>
            )}
            {favoriteIds.has(`file:${file.id}`) && (
              <div style={{ position: 'absolute', bottom: '4px', right: '-20px', transform: 'translate(50%, 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                <Icon name="favorite" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapHighlightColor)' }} />
              </div>
            )}
          </div>
        </div>

        {/* overlay */}
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 2 }}
          onClick={() => handleRowSelect(file)}
          onDoubleClick={() => { if (file.type === 'Folder') navigateIntoFolder(file); else setShowModelDetail(true) }}
        />

        {/* title */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (file.type === 'Folder') navigateIntoFolder(file)
            else setShowModelDetail(true)
          }}
          onMouseEnter={() => setHoveredGridId(`title-${file.id}`)}
          onMouseLeave={() => setHoveredGridId(null)}
          style={{
            position: 'absolute', top: '62px', left: '6px', right: '6px',
            zIndex: 3, textAlign: 'center',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
            fontWeight: '600', color: 'var(--sapTextColor)',
            textDecoration: isTitleHovered ? 'underline' : 'none',
            cursor: 'pointer', overflow: 'hidden', lineHeight: 'normal', wordBreak: 'break-word',
          } as React.CSSProperties}
        >
          {file.name}
        </div>

        {/* type label */}
        <div style={{
          position: 'absolute', top: '97px', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
          color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', lineHeight: 'normal', zIndex: 3, pointerEvents: 'none',
        }}>
          {fileTypeLabel(file.type)}
        </div>
        {/* checkbox */}
        {(isSelected || showHoverControls) && (
          <div
            style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 4 }}
            onClick={(e) => { e.stopPropagation(); toggleSelect(file.id, 'checkbox') }}
          >
            <CheckBox
              checked={isSelected}
              accessibleName={`Select ${file.name}`}
            />
          </div>
        )}

        {/* overflow button */}
        {(showHoverControls || isSelected || openOverflowId === file.id) && (
          <Button
            id={`overflow-${file.id}`}
            design="Transparent"
            icon="overflow"
            style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 4, width: '24px', height: '24px', padding: 0, '--ui5-button-border-radius': '4px' } as React.CSSProperties}
            onClick={(e) => { e.stopPropagation(); if (!selectedIds.has(file.id)) toggleSelect(file.id, 'row'); setOpenOverflowId(file.id) }}
          />
        )}
      </div>
    )
  }

  // ITEMS_PER_ROW estimate: grid uses auto-fill with 146px tiles + 3px gap.
  // We use a fixed value of 8 as the "one row" threshold for the "Show more" button.
  const GRID_ROW_SIZE = 8

  const renderGridView = () => {
    const allSelected = displayFiles.length > 0 && displayFiles.every(f => selectedIds.has(f.id))
    const someSelected = !allSelected && displayFiles.some(f => selectedIds.has(f.id))

    const handleSelectAll = () => {
      if (allSelected) {
        setSelectedIds(new Set())
      } else {
        setSelectedIds(new Set(displayFiles.map(f => f.id)))
      }
    }

    const selectAllRow = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0', height: '2rem' }}>
        <CheckBox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={handleSelectAll}
          accessibleName="Select all"
        />
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', cursor: 'default' }}>
          Select All
        </Text>
      </div>
    )

    if (groupBy === 'none') {
      return (
        <div>
          {selectAllRow}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 146px)', columnGap: '3px', rowGap: '8px', padding: '0.25rem 0 1rem' }}>
            {displayFiles.map(file => renderGridTile(file))}
          </div>
        </div>
      )
    }

    // Group by changedBy
    const groups = new Map<string, FileItem[]>()
    for (const file of displayFiles) {
      const key = file.changedBy ?? 'Ungrouped'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(file)
    }
    // Sort groups: named groups alphabetically, "Ungrouped" last
    const sortedKeys = [...groups.keys()].sort((a, b) => {
      if (a === 'Ungrouped') return 1
      if (b === 'Ungrouped') return -1
      return a.localeCompare(b)
    })

    return (
      <div>
        {selectAllRow}
        <div style={{ padding: '0 0 1rem' }}>
        {sortedKeys.map(groupKey => {
          const items = groups.get(groupKey)!
          const isExpanded = expandedGroups.has(groupKey)
          const visibleItems = isExpanded ? items : items.slice(0, GRID_ROW_SIZE)
          const hasMore = items.length > GRID_ROW_SIZE

          return (
            <div key={groupKey} style={{ marginTop: '1rem' }}>
              <div style={{
                borderTop: '1px solid var(--sapList_GroupHeaderBorderColor)',
                paddingTop: '12px', paddingBottom: '0',
                fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                fontSize: 'var(--sapFontSize)', fontWeight: '700',
                color: 'var(--sapList_GroupHeaderTextColor)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {groupKey} ({items.length})
              </div>

              {/* Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 146px)', columnGap: '3px', rowGap: '8px', paddingTop: '8px' }}>
                {visibleItems.map(file => renderGridTile(file))}
              </div>

              {/* Show more / Show less */}
              {hasMore && (
                <div style={{ marginTop: '8px' }}>
                  <Button
                    design="Transparent"
                    onClick={() => setExpandedGroups(prev => {
                      const next = new Set(prev)
                      isExpanded ? next.delete(groupKey) : next.add(groupKey)
                      return next
                    })}
                  >
                    {isExpanded ? 'Show Less' : `Show ${items.length - GRID_ROW_SIZE} More`}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>
    )
  }

  // ── Dictionary view ───────────────────────────────────────────────────────
  // Current category id (null = root of Dictionary)
  const currentDictCatId = selectedDictCategoryLeaf?.id ?? null

  // Sub-categories at current level
  const dictSubCategories = dictCategories.filter(c =>
    currentDictCatId ? c.parentId === currentDictCatId : !c.parentId
  ).slice().sort((a, b) => (dictSortDir === 'asc' ? 1 : -1) * a.name.localeCompare(b.name))

  // Entries directly owned by the current category (or none at root)
  const dictCurrentEntries = currentDictCatId
    ? dictEntries.filter(e => e.categoryId === currentDictCatId)
    : []

  const dictFilteredEntries = (contentFilter === 'published'
    ? dictCurrentEntries.filter(e => e.status === 'Published')
    : dictCurrentEntries
  ).filter(e => !fileSearch || e.name.toLowerCase().includes(fileSearch.toLowerCase()) || (e.description ?? '').toLowerCase().includes(fileSearch.toLowerCase()))
   .slice().sort((a, b) => (dictSortDir === 'asc' ? 1 : -1) * a.name.localeCompare(b.name))

  // Total items count at current level (sub-cats + direct entries)
  const dictTotalAtLevel = dictSubCategories.length + dictFilteredEntries.length

  const isDictView = selectedRoot === 'dictionary' && !selectedFolderPath
  const hasSelection = isDictView ? (selectedDictIds.size > 0 || selectedDictCatIds.size > 0) : selectedIds.size > 0
  const selectionCount = isDictView ? (selectedDictIds.size + selectedDictCatIds.size) : selectedIds.size
  const totalCount = isDictView ? dictTotalAtLevel : displayFiles.length
  const clearAllSelection = () => {
    setSelectedDictIds(new Set())
    setSelectedIds(new Set())
  }

  // Descendant entry count for a category (for the count badge on folders)
  function dictDescendantCount(catId: string): number {
    const ids = new Set<string>([catId])
    const queue = [catId]
    while (queue.length) {
      const cur = queue.shift()!
      dictCategories.filter(c => c.parentId === cur).forEach(child => {
        ids.add(child.id); queue.push(child.id)
      })
    }
    return dictEntries.filter(e => ids.has(e.categoryId)).length
  }

  const navigateIntoDictCategory = (cat: { id: string; name: string }) => {
    setSelectedDictCategoryPath(prev => [...prev, cat])
    setSelectedDictEntry(null); setInfoPanelOpen(false)
    setSelectedDictCategory(null)
    setSelectedDictIds(new Set())
    setSelectedDictCatIds(new Set())
  }

  const toggleDictCatSelect = (id: string) => {
    setSelectedDictCatIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const toggleDictEntrySelect = (id: string, mode: 'row' | 'checkbox' = 'checkbox') => {
    setSelectedDictIds(prev => {
      let next: Set<string>
      if (mode === 'row') {
        next = new Set([id])
      } else {
        next = new Set(prev)
        next.has(id) ? next.delete(id) : next.add(id)
      }
      if (next.size === 0) setSelectedDictEntry(null)
      return next
    })
  }

  const renderDictListView = () => (
    <>
      {/* Select All row */}
      {(dictSubCategories.length > 0 || dictFilteredEntries.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'var(--sapList_Background)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
          <CheckBox
            checked={(dictSubCategories.length > 0 || dictFilteredEntries.length > 0) && dictSubCategories.every(c => selectedDictCatIds.has(c.id)) && dictFilteredEntries.every(e => selectedDictIds.has(e.id))}
            indeterminate={
              (dictSubCategories.some(c => selectedDictCatIds.has(c.id)) || dictFilteredEntries.some(e => selectedDictIds.has(e.id))) &&
              !(dictSubCategories.every(c => selectedDictCatIds.has(c.id)) && dictFilteredEntries.every(e => selectedDictIds.has(e.id)))
            }
            onChange={() => {
              const allSelected = dictSubCategories.every(c => selectedDictCatIds.has(c.id)) && dictFilteredEntries.every(e => selectedDictIds.has(e.id))
              if (allSelected) { setSelectedDictCatIds(new Set()); setSelectedDictIds(new Set()) }
              else { setSelectedDictCatIds(new Set(dictSubCategories.map(c => c.id))); setSelectedDictIds(new Set(dictFilteredEntries.map(e => e.id))) }
            }}
            accessibleName="Select all"
          />
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>Select All</Text>
        </div>
      )}

      {/* Category rows — non-selectable, click navigates into category */}
      {dictSubCategories.length > 0 && (
        <List
          separators="Inner"
          selectionMode="None"
          onItemClick={(e) => {
            const catId = (e.detail.item as HTMLElement).dataset.catId
            const cat = dictSubCategories.find(c => c.id === catId)
            if (cat) navigateIntoDictCategory({ id: cat.id, name: cat.name })
          }}
        >
          {dictSubCategories.map(cat => {
            const count = dictDescendantCount(cat.id)
            return (
              <ListItemCustom key={cat.id} type="Active" data-cat-id={cat.id} accessibleName={cat.name}
                onMouseEnter={() => setHoveredDictCatId(cat.id) as any}
                onMouseLeave={() => setHoveredDictCatId(null) as any}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', width: '100%' }}>
                  {/* Checkbox */}
                  <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleDictCatSelect(cat.id); setSelectedDictCategory(null); setSelectedDictEntry(null); setSelectedAsset(null); setExternalSelectedAsset(null); setInfoPanelOpen(true) }}>
                    <CheckBox checked={selectedDictCatIds.has(cat.id)} onChange={() => {}} accessibleName={`Select ${cat.name}`} />
                  </div>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: catBg(cat.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                    <Icon name={CAT_TYPE_ICON[cat.type] ?? 'SAP-icons-v4/process-manager'} style={{ width: '12px', height: '12px', color: catIconColor(cat.type) }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                        <Text
                          className="dict-cat-name"
                          style={{ fontSize: 'var(--sapFontLargeSize)', fontWeight: '600', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pointerEvents: 'auto' }}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateIntoDictCategory({ id: cat.id, name: cat.name }) }}
                        >
                          <span title={!currentDictCatId ? "Count includes entries from all subcategories" : undefined}>{cat.name} ({count})</span>
                        </Text>
                        {cat.hasVariants && <Icon name="SAP-icons-v4/variant" style={{ width: '16px', height: '16px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />}
                        {(hoveredDictCatId === cat.id || favoriteIds.has(`file:${cat.id}`)) && (
                          <div style={{ pointerEvents: 'auto', flexShrink: 0 }}>
                            <Button
                              icon={favoriteIds.has(`file:${cat.id}`) ? 'favorite' : 'unfavorite'}
                              design="Transparent"
                              tooltip={favoriteIds.has(`file:${cat.id}`) ? 'Remove from Favorites' : 'Add to Favorites'}
                              onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(cat.id) }}
                            />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0', pointerEvents: 'auto' }}>
                        <Button id={`dict-cat-overflow-${cat.id}`} icon="overflow" design="Transparent" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); setDictCatOverflowId(cat.id) }} />
                      </div>
                    </div>
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.description ?? cat.type}
                    </Text>
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentDictCatId ? `${dictCategories.find(c => c.id === currentDictCatId)?.name ?? ''} · ` : ''}Created {cat.createdAt} · Changed {cat.changedAt}
                    </Text>
                  </div>
                </div>
              </ListItemCustom>
            )
          })}
        </List>
      )}

      {/* Entry rows */}
      {dictFilteredEntries.length > 0 && (
        <>
          <List
            separators="Inner"
            selectionMode="None"
          >
          {dictFilteredEntries.map(entry => {
            const cat = dictCategories.find(c => c.id === entry.categoryId)

            const isSelected = selectedDictIds.has(entry.id)
            const handleEntryRowClick = () => {
              toggleDictEntrySelect(entry.id, 'row')
              setSelectedDictEntry(entry)
              setSelectedDictCategory(null)
              setSelectedAsset(null)
              setExternalSelectedAsset(null)
              setCreateDictCategoryId(null)
              setInfoPanelOpen(true)
            }
            const handleEntryCheckboxClick = () => {
              toggleDictEntrySelect(entry.id, 'checkbox')
              setSelectedDictEntry(entry)
              setSelectedDictCategory(null)
              setSelectedAsset(null)
              setExternalSelectedAsset(null)
              setCreateDictCategoryId(null)
              setInfoPanelOpen(true)
            }
            return (
              <ListItemCustom
                key={entry.id}
                type="Active"
                selected={isSelected}
                data-entry-id={entry.id}
                accessibleName={entry.name}
                onClick={(e: any) => {
                  if ((e.target as HTMLElement)?.closest?.('ui5-checkbox, [ui5-checkbox]')) return
                  e.stopPropagation?.(); handleEntryRowClick()
                }}
                onMouseEnter={() => setHoveredDictEntryId(entry.id) as any}
                onMouseLeave={() => setHoveredDictEntryId(null) as any}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', width: '100%', pointerEvents: 'none' }}>
                  <div style={{ width: '32px', height: '26px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
                    <div onClick={(e) => { e.stopPropagation(); handleEntryCheckboxClick() }} style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckBox checked={isSelected} onChange={() => {}} />
                    </div>
                  </div>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: cat ? entryBg(cat.type) : 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={cat ? (CAT_TYPE_ICON[cat.type] ?? 'document') : 'document'} style={{ width: '12px', height: '12px', color: cat ? entryIconColor(cat.type) : 'var(--sapAvatar_6_TextColor)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                        <Text className="table-asset-name" style={{ fontSize: 'var(--sapFontLargeSize)', fontWeight: '600', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, pointerEvents: 'auto' }}>
                          {entry.name}
                        </Text>
                        <SigChipV2
                          value={entry.status}
                          leadingIcon={entry.status === 'Published' ? 'SAP-icons-v4/published' : 'write-new-document'}
                          design={entry.status === 'Published' ? 'indication5' : 'indication10'}
                          condensed
                        />
                        {(hoveredDictEntryId === entry.id || favoriteIds.has(`file:${entry.id}`)) && (
                          <div style={{ pointerEvents: 'auto' }}>
                            <Button
                              icon={favoriteIds.has(`file:${entry.id}`) ? 'favorite' : 'unfavorite'}
                              design="Transparent"
                              tooltip={favoriteIds.has(`file:${entry.id}`) ? 'Remove from Favorites' : 'Add to Favorites'}
                              onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(entry.id) }}
                            />
                          </div>
                        )}
                      </div>
                      <div style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <Button id={`dict-entry-overflow-${entry.id}`} icon="overflow" design="Transparent" style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); if (!selectedDictIds.has(entry.id)) toggleDictEntrySelect(entry.id, 'row'); setDictEntryOverflowId(entry.id) }} />
                      </div>
                    </div>
                    {entry.description && (
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.description}
                      </Text>
                    )}
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat?.name ? `${cat.name} · ` : ''}Created {entry.created} · Changed {entry.changed}
                    </Text>
                  </div>
                </div>
              </ListItemCustom>
            )
          })}
        </List>
        </>
      )}
      {currentDictCatId && dictSubCategories.length === 0 && dictFilteredEntries.length === 0 && (
        <div style={{ background: 'white', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px', width: '100%' }}>
          {fileSearch
            ? <IllustratedMessage name="NoFilterResults" titleText="No matching results" subtitleText="Try adjusting the search criteria" />
            : <IllustratedMessage name="NoData" titleText="No Dictionary entries yet" subtitleText=" " />
          }
        </div>
      )}
    </>
  )

  const renderDictTableView = () => {
    // Merge sub-categories and entries into one flat list for AnalyticalTable
    type DictRow = { _kind: 'cat'; id: string; name: string; color: string; type: string; createdAt: string; changedAt: string; count: number } | { _kind: 'entry' } & DictEntry
    const rows: DictRow[] = [
      ...dictSubCategories.map(cat => ({ _kind: 'cat' as const, id: cat.id, name: cat.name, color: cat.color, type: cat.type, createdAt: cat.createdAt, changedAt: cat.changedAt, count: dictDescendantCount(cat.id) })),
      ...dictFilteredEntries.map(e => ({ _kind: 'entry' as const, ...e })),
    ]
    const allCatsSelected = dictSubCategories.length > 0 && dictSubCategories.every(c => selectedDictCatIds.has(c.id))
    const allEntriesSelected = dictFilteredEntries.length > 0 && dictFilteredEntries.every(e => selectedDictIds.has(e.id))
    const allSelected = allCatsSelected && allEntriesSelected && (dictSubCategories.length > 0 || dictFilteredEntries.length > 0)
    const someSelected = !allSelected && (dictSubCategories.some(c => selectedDictCatIds.has(c.id)) || dictFilteredEntries.some(e => selectedDictIds.has(e.id)))
    const handleSelectAllEntries = () => {
      if (allSelected) { setSelectedDictCatIds(new Set()); setSelectedDictIds(new Set()) }
      else { setSelectedDictCatIds(new Set(dictSubCategories.map(c => c.id))); setSelectedDictIds(new Set(dictFilteredEntries.map(e => e.id))) }
    }

    const checkboxCol: AnalyticalTableColumnDefinition = {
      id: '__select',
      Header: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {<CheckBox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAllEntries} accessibleName="Select all" />}
        </div>
      ),
      accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => {
        const r = row.original as DictRow
        if (r._kind === 'cat') {
          const isChecked = selectedDictCatIds.has(r.id)
          return (
            <div onClick={e => { e.stopPropagation(); toggleDictCatSelect(r.id); setSelectedDictCategory(null); setSelectedDictEntry(null); setSelectedAsset(null); setExternalSelectedAsset(null); setInfoPanelOpen(true) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckBox checked={isChecked} onChange={() => {}} accessibleName={`Select ${r.name}`} />
            </div>
          )
        }
        const isChecked = selectedDictIds.has(r.id)
        return (
          <div onClick={e => { e.stopPropagation(); toggleDictEntrySelect(r.id, 'checkbox'); setSelectedDictEntry(r); setSelectedDictCategory(null); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setInfoPanelOpen(true) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckBox checked={isChecked} onChange={() => {}} accessibleName={`Select ${r.name}`} />
          </div>
        )
      },
    }
    const cols: AnalyticalTableColumnDefinition[] = [
      {
        id: 'name', Header: 'Name', accessor: 'name', minWidth: 280,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          if (r._kind === 'cat') {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: catBg(r.type as DictCategoryType), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <Icon name={CAT_TYPE_ICON[r.type as DictCategoryType] ?? 'SAP-icons-v4/process-manager'} style={{ width: '12px', height: '12px', color: catIconColor(r.type as DictCategoryType) }} />
                </div>
                <Text
                  className="dict-cat-name"
                  style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', minWidth: 0 }}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigateIntoDictCategory({ id: r.id, name: r.name }) }}
                ><span title={!currentDictCatId ? "Count includes entries from all subcategories" : undefined}>{r.name} ({r.count})</span></Text>
                {dictCategories.find(c => c.id === r.id)?.hasVariants && <Icon name="SAP-icons-v4/variant" style={{ width: '16px', height: '16px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />}
                {(hoveredDictCatId === r.id || favoriteIds.has(`file:${r.id}`)) && (
                  <Button icon={favoriteIds.has(`file:${r.id}`) ? 'favorite' : 'unfavorite'} design="Transparent" style={{ height: '24px', minWidth: '24px' }}
                    onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(r.id) }} />
                )}
              </div>
            )
          }
          const cat = dictCategories.find(c => c.id === r.categoryId)
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', overflow: 'hidden' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: cat ? entryBg(cat.type) : 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={cat ? (CAT_TYPE_ICON[cat.type] ?? 'document') : 'document'} style={{ width: '12px', height: '12px', color: cat ? entryIconColor(cat.type) : 'var(--sapAvatar_6_TextColor)' }} />
              </div>
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', minWidth: 0 }}>{r.name}</Text>
              {(hoveredDictEntryId === r.id || favoriteIds.has(`file:${r.id}`)) && (
                <Button icon={favoriteIds.has(`file:${r.id}`) ? 'favorite' : 'unfavorite'} design="Transparent" style={{ height: '24px', minWidth: '24px' }}
                  onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(r.id) }} />
              )}
            </div>
          )
        },
      },
      {
        id: 'type', Header: 'Category', accessor: 'type', minWidth: 140,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          const typeLabel = r._kind === 'cat'
            ? (dictCategories.find(c => c.id === currentDictCatId)?.name ?? '')
            : (dictCategories.find(c => c.id === r.categoryId)?.name ?? r.categoryId)
          return <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{typeLabel}</Text>
        },
      },
      {
        id: 'description', Header: 'Description', accessor: 'description', minWidth: 200,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          return <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{r._kind === 'entry' ? (r.description ?? '') : ''}</Text></div>
        },
      },
      {
        id: 'created', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Created</div>, accessor: 'created', minWidth: 110,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          return <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{r._kind === 'cat' ? r.createdAt : r.created}</Text></div>
        },
      },
      {
        id: 'changed', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Changed</div>, accessor: 'changed', minWidth: 110,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          return <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{r._kind === 'cat' ? r.changedAt : r.changed}</Text></div>
        },
      },
      {
        id: 'status', Header: 'Status', accessor: 'status', minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          if (r._kind === 'cat') return null
          return <SigChipV2
            value={r.status}
            leadingIcon={r.status === 'Published' ? 'SAP-icons-v4/published' : r.status === 'Draft' ? 'write-new-document' : 'SAP-icons-v4/published-changed'}
            design={r.status === 'Published' ? 'indication5' : r.status === 'Draft' ? 'indication10' : 'indication7'}
            condensed
          />
        },
      },
      {
        id: '__actions', Header: '', accessor: 'id',
        disableSortBy: true, disableFilters: true, disableGroupBy: true,
        minWidth: 44, width: 44,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const r = row.original as DictRow
          const btnId = r._kind === 'cat' ? `dict-cat-overflow-${r.id}` : `dict-entry-overflow-${r.id}`
          const handler = r._kind === 'cat'
            ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); setDictCatOverflowId(r.id) }
            : (e: { stopPropagation: () => void }) => { e.stopPropagation(); if (!selectedDictIds.has(r.id)) toggleDictEntrySelect(r.id, 'row'); setDictEntryOverflowId(r.id) }
          return <Button id={btnId} icon="overflow" design="Transparent" tooltip="More Options" onClick={handler} />
        },
      },
    ]
    if (currentDictCatId && rows.length === 0) {
      return (
        <div style={{ background: 'white', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px', width: '100%' }}>
          {fileSearch
            ? <IllustratedMessage name="NoFilterResults" titleText="No matching results" subtitleText="Try adjusting the search criteria" />
            : <IllustratedMessage name="NoData" titleText="No Dictionary entries yet" subtitleText=" " />
          }
        </div>
      )
    }
    return (
      <AnalyticalTable
        data={rows}
        columns={[checkboxCol, ...cols]}
        selectionMode="None"
        tableHooks={[
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (hooks: any) => {
            hooks.getRowProps.push((_props: any, { row }: any) => {
              const r = row.original as DictRow
              const isSelected = r._kind === 'entry' && selectedDictIds.has(r.id)
              return [_props, isSelected ? { 'data-is-selected': '' } : {}, {
                onMouseEnter: () => { if (!dictEntryOverflowId && !dictCatOverflowId) { r._kind === 'cat' ? setHoveredDictCatId(r.id) : setHoveredDictEntryId(r.id) } },
                onMouseLeave: () => { if (!dictEntryOverflowId && !dictCatOverflowId) { r._kind === 'cat' ? setHoveredDictCatId(null) : setHoveredDictEntryId(null) } },
              }]
            })
          }
        ]}
        onRowClick={(e) => {
          if (dictEntryOverflowId || dictCatOverflowId) return
          // @ts-ignore
          const r = e?.detail?.row?.original as DictRow | undefined
          if (!r) return
          if (r._kind === 'cat') { navigateIntoDictCategory({ id: r.id, name: r.name }); return }
          toggleDictEntrySelect(r.id, 'row')
          setSelectedDictEntry(r); setSelectedDictCategory(null); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setInfoPanelOpen(true)
        }}
        visibleRows={rows.length}
        minRows={rows.length}
        style={{ width: '100%' }}
        className="ui5-content-density-compact"
      />
    )
  }

  const renderDictGridView = () => {
    const allCatsSelectedGrid = dictSubCategories.length > 0 && dictSubCategories.every(c => selectedDictCatIds.has(c.id))
    const allEntriesSelected = dictFilteredEntries.length > 0 && dictFilteredEntries.every(e => selectedDictIds.has(e.id))
    const allSelectedGrid = allCatsSelectedGrid && allEntriesSelected && (dictSubCategories.length > 0 || dictFilteredEntries.length > 0)
    const someSelectedGrid = !allSelectedGrid && (dictSubCategories.some(c => selectedDictCatIds.has(c.id)) || dictFilteredEntries.some(e => selectedDictIds.has(e.id)))

    const handleSelectAllEntries = () => {
      if (allSelectedGrid) { setSelectedDictCatIds(new Set()); setSelectedDictIds(new Set()) }
      else { setSelectedDictCatIds(new Set(dictSubCategories.map(c => c.id))); setSelectedDictIds(new Set(dictFilteredEntries.map(e => e.id))) }
    }

    const selectAllRow = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0', height: '2rem' }}>
        <CheckBox
          checked={allSelectedGrid}
          indeterminate={someSelectedGrid}
          onChange={handleSelectAllEntries}
          accessibleName="Select all entries"
        />
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', cursor: 'default' }}>
          Select All
        </Text>
      </div>
    )

    const catTiles = dictSubCategories.map(cat => {
      const hoverKey = `cat-${cat.id}`
      const isHovered = hoveredGridId === hoverKey
      const showHoverControls = isHovered

      return (
        <div
          key={cat.id}
          onMouseEnter={() => setHoveredGridId(hoverKey)}
          onMouseLeave={() => setHoveredGridId(null)}
          style={{
            width: '146px', height: '108px', position: 'relative', borderRadius: '6px',
            border: '1px solid transparent',
            background: isHovered ? '#EAECEE' : 'transparent',
            boxSizing: 'border-box', cursor: 'pointer',
          } as React.CSSProperties}
        >
          {/* icon area — same layout as renderGridTile */}
          <div style={{
            position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)',
            width: '134px', display: 'flex', justifyContent: 'center',
            zIndex: 1, pointerEvents: 'none',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: catBg(cat.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={CAT_TYPE_ICON[cat.type] ?? 'SAP-icons-v4/process-manager'} style={{ width: '1.5rem', height: '1.5rem', color: catIconColor(cat.type) }} />
            </div>
          </div>

          {/* overlay — click navigates, same as folder double-click in modeling files */}
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}
            onClick={() => navigateIntoDictCategory({ id: cat.id, name: cat.name })}
          />

          {/* checkbox */}
          <div
            style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 4 }}
            onClick={(e) => { e.stopPropagation(); toggleDictCatSelect(cat.id); setSelectedDictCategory(null); setSelectedDictEntry(null); setSelectedAsset(null); setExternalSelectedAsset(null); setInfoPanelOpen(true) }}
          >
            <CheckBox checked={selectedDictCatIds.has(cat.id)} onChange={() => {}} accessibleName={`Select ${cat.name}`} />
          </div>

          {/* title */}
          <div
            onClick={(e) => { e.stopPropagation(); navigateIntoDictCategory({ id: cat.id, name: cat.name }) }}
            style={{
              position: 'absolute', top: '62px', left: '6px', right: '6px',
              zIndex: 3, textAlign: 'center',
              fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
              fontWeight: '600', color: 'var(--sapTextColor)',
              textDecoration: isHovered ? 'underline' : 'none',
              cursor: 'pointer', overflow: 'hidden', lineHeight: 'normal', wordBreak: 'break-word',
            } as React.CSSProperties}
          >
            <span title={!currentDictCatId ? "Count includes entries from all subcategories" : undefined}>{cat.name} ({dictDescendantCount(cat.id)})</span>
          </div>

          {/* type label */}
          <div style={{
            position: 'absolute', top: '97px', left: '50%', transform: 'translate(-50%, -50%)',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
            color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', lineHeight: 'normal', zIndex: 3, pointerEvents: 'none',
          }}>
            {cat.type}
          </div>

          {/* overflow button */}
          {(showHoverControls || dictCatOverflowId === cat.id) && (
            <Button
              id={`dict-cat-overflow-${cat.id}`}
              design="Transparent"
              icon="overflow"
              style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 4, width: '24px', height: '24px', padding: 0, '--ui5-button-border-radius': '4px' } as React.CSSProperties}
              onClick={(e) => { e.stopPropagation(); setDictCatOverflowId(cat.id) }}
            />
          )}
        </div>
      )
    })

    const entryTiles = dictFilteredEntries.map(entry => {
      const cat = dictCategories.find(c => c.id === entry.categoryId)
      const isSelected = selectedDictIds.has(entry.id)

      const hoverKey = `entry-${entry.id}`
      const isHovered = hoveredGridId === hoverKey
      const showHoverControls = isHovered && !isSelected

      let bg = 'transparent'
      if (isSelected) bg = '#EBF8FF'
      else if (isHovered) bg = '#EAECEE'

      let border = '1px solid transparent'
      if (isSelected) border = '1px solid #0070F2'

      return (
        <div
          key={entry.id}
          onMouseEnter={() => setHoveredGridId(hoverKey)}
          onMouseLeave={() => setHoveredGridId(null)}
          style={{
            width: '146px', height: '108px', position: 'relative', borderRadius: '6px',
            border, background: bg, boxSizing: 'border-box', cursor: 'pointer',
            opacity: 1,
          } as React.CSSProperties}
        >
          {/* icon area — same layout as renderGridTile */}
          <div style={{
            position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)',
            width: '134px', display: 'flex', justifyContent: 'center',
            zIndex: 1, pointerEvents: 'none',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: cat ? entryBg(cat.type) : 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={cat ? (CAT_TYPE_ICON[cat.type] ?? 'document') : 'document'} style={{ width: '1.5rem', height: '1.5rem', color: cat ? entryIconColor(cat.type) : 'var(--sapAvatar_6_TextColor)' }} />
              </div>
              {entry.status === 'Published' && (
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', transform: 'translate(50%, 50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--sapIndicationColor_5b)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Icon name="world" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapIndicationColor_5)' }} />
                </div>
              )}
            </div>
          </div>

          {/* overlay */}
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}
            onClick={() => { setSelectedDictEntry(entry); setSelectedDictCategory(null); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setInfoPanelOpen(true) }}
          />

          {/* title */}
          <div
            onClick={(e) => { e.stopPropagation(); setSelectedDictEntry(entry); setSelectedDictCategory(null); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setInfoPanelOpen(true) }}
            style={{
              position: 'absolute', top: '62px', left: '6px', right: '6px',
              zIndex: 3, textAlign: 'center',
              fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
              fontWeight: '600', color: 'var(--sapTextColor)',
              textDecoration: isHovered ? 'underline' : 'none',
              cursor: 'pointer', overflow: 'hidden', lineHeight: 'normal', wordBreak: 'break-word',
            } as React.CSSProperties}
          >
            {entry.name}
          </div>

          {/* type label */}
          <div style={{
            position: 'absolute', top: '97px', left: '50%', transform: 'translate(-50%, -50%)',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
            color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', lineHeight: 'normal', zIndex: 3, pointerEvents: 'none',
          }}>
            {cat?.name ?? entry.categoryId}
          </div>

          {/* checkbox */}
          {(isSelected || showHoverControls) && (
            <div
              style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CheckBox
                checked={isSelected}
                onChange={() => toggleDictEntrySelect(entry.id, 'checkbox')}
                accessibleName={`Select ${entry.name}`}
              />
            </div>
          )}

          {/* overflow button */}
          {(showHoverControls || dictEntryOverflowId === entry.id) && (
            <Button
              id={`dict-entry-overflow-${entry.id}`}
              design="Transparent"
              icon="overflow"
              style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 4, width: '24px', height: '24px', padding: 0, '--ui5-button-border-radius': '4px' } as React.CSSProperties}
              onClick={(e) => { e.stopPropagation(); if (!selectedDictIds.has(entry.id)) toggleDictEntrySelect(entry.id, 'row'); setDictEntryOverflowId(entry.id) }}
            />
          )}
        </div>
      )
    })

    return (
      <div>
        {dictFilteredEntries.length > 0 && selectAllRow}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 146px)', columnGap: '3px', rowGap: '8px', padding: '0.25rem 0 1rem' }}>
          {catTiles}
          {entryTiles}
        </div>
      </div>
    )
  }

  // ── Overflow menu for file items ──────────────────────────────────────────
  const renderOverflowMenu = () => {
    if (openOverflowId === null) return null
    const file = folderFiles.find(f => f.id === openOverflowId)
    if (!file) return null
    return (
      <Menu
        opener={`overflow-${openOverflowId}`}
        open
        onClose={() => setOpenOverflowId(null)}
        onItemClick={(e) => {
          const text = (e.detail as { text?: string }).text
          if (text === 'Embed') { setEmbedFile(file) }
          if (text === 'Share') { setShareFile(file); setShareView('share') }
          if (text === 'Manage Access') { setShareFile(file); setManageFromShare(false); setShareView('manage') }
          if (text === 'Rename') { setRenamingFile(file); setEditFolderOpen(true) }
          if (text === 'Details') { setSelectedAsset(file); setInfoPanelOpen(true) }
          if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }
          if (text === 'Open Latest Revision' && file.type !== 'Folder') { setShowModelDetail(true) }
          if (text === 'Open Published Revision' && file.type !== 'Folder') { setShowModelDetail(true) }
          if (text === 'Open' && file.type !== 'Folder') { setShowModelDetail(true) }
          if (text === 'Open' && file.type === 'Folder') { navigateIntoFolder(file) }
          if (text === 'Add to Favorites' || text === 'Remove from Favorites') { toggleFileFavorite(file.id) }
          if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') { setNotifPref(text as typeof notifPref); setNotifToast(`Notifications set to ${text}`); return }
          setOpenOverflowId(null)
        }}
      >
        {selectedIds.size > 1 && selectedIds.has(file.id) ? renderMultiSelectMenu() : file.type === 'Folder' ? (
          <>
            <MenuItem text="Open" icon="open-folder" />
            <MenuItem text="Details" icon="SAP-icons-v4/panel-right" />
            <MenuSeparator />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Share" icon="share-2" />}
            <MenuItem text="Copy Link" icon="chain-link" />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Manage Access" icon="user-settings" />}
            <MenuSeparator />
            <MenuItem text={favoriteIds.has(`file:${file.id}`) ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(`file:${file.id}`) ? 'favorite' : 'unfavorite'} />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>}
            <MenuSeparator />
            <MenuItem text="Reporting" icon="SAP-icons-v4/report">
              <MenuItem text="Process documentation (PDF)" />
              <MenuItem text="Process documentation (Word)" />
              <MenuItem text="Governance report" />
              <MenuItem text="Process cost analysis" />
              <MenuItem text="Resource consumption analysis" />
              <MenuItem text="Modeling conventions" />
              <MenuItem text="Responsibility assignment matrix / RACI" />
              <MenuItem text="Responsibility handovers matrix" />
              <MenuItem text="Documents usage matrix" />
              <MenuItem text="IT system usage matrix (by diagrams)" />
              <MenuItem text="IT system usage matrix (by roles)" />
              <MenuItem text="Process characteristics with element details" />
              <MenuItem text="Process model metrics" />
              <MenuItem text="Risks and Controls Report" />
              <MenuItem text="User/Group assignment" />
            </MenuItem>
            <MenuSeparator />
            <MenuItem text="Export as" icon="SAP-icons-v4/export">
              <MenuItem text="SAP Signavio Archive (SGX)" />
              <MenuItem text="PDF" /><MenuItem text="Drools" />
              <MenuSeparator />
              <MenuItem text="Export Diagram Translations" />
            </MenuItem>
            <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
            <MenuSeparator />
            <MenuItem text="Rename" icon="edit" />
            <MenuItem text="Move To" icon="SAP-icons-v4/file-move" />
            <MenuItem text="Move to Trash" icon="delete" />
          </>
        ) : file.type === 'File' ? (
          <>
            <MenuItem text="Download" />
            <MenuSeparator />
            <MenuItem text="Share" /><MenuItem text="Add to Favorites" /><MenuItem text="Copy To" />
            <MenuSeparator />
            <MenuItem text="Rename" /><MenuItem text="Move" /><MenuItem text="Move to Trash" />
          </>
        ) : (
          <>
            <MenuItem text="Open" icon="full-screen">
              <MenuItem text="Open Latest Revision" />
              <MenuItem text="Open Published Revision" />
            </MenuItem>
            <MenuItem text="Details" icon="SAP-icons-v4/panel-right" />
            <MenuSeparator />
            <MenuItem text="Edit in Editor" icon="write-new" />
            <MenuItem text="Edit in Modeler" icon="write-new" {...{ disabled: true } as any} />
            <MenuItem text="Edit in QuickModel" icon="SAP-icons-v4/quickmodel" />
            <MenuSeparator />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Share" icon="share-2" />}
            <MenuItem text="Copy Link" icon="chain-link" />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Manage Access" icon="user-settings" />}
            <MenuSeparator />
            <MenuItem text={favoriteIds.has(`file:${file.id}`) ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(`file:${file.id}`) ? 'favorite' : 'unfavorite'} />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>}
            <MenuSeparator />
            <MenuItem text="Compare Revisions" icon="compare" />
            <MenuItem text="Variant Management" icon="SAP-icons-v4/variant">
              <MenuItem text="Clone to Create Variant" />
              <MenuItem text="Attach to Template" />
              <MenuItem text="Set as Template" />
            </MenuItem>
            <MenuItem text="Simulate" icon="SAP-icons-v4/simulation" />
            <MenuItem text="Reporting" icon="SAP-icons-v4/report">
              <MenuItem text="Process documentation (PDF)" />
              <MenuItem text="Process documentation (Word)" />
              <MenuItem text="Governance report" />
              <MenuItem text="Process cost analysis" />
              <MenuItem text="Resource consumption analysis" />
              <MenuItem text="Modeling conventions" />
              <MenuItem text="Responsibility assignment matrix / RACI" />
              <MenuItem text="Responsibility handovers matrix" />
              <MenuItem text="Documents usage matrix" />
              <MenuItem text="IT system usage matrix (by diagrams)" />
              <MenuItem text="IT system usage matrix (by roles)" />
              <MenuItem text="Process characteristics with element details" />
              <MenuItem text="Process model metrics" />
              <MenuItem text="Risks and Controls Report" />
              <MenuItem text="User/Group assignment" />
            </MenuItem>
            <MenuSeparator />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Governance" icon="workflow-tasks">
              <MenuItem text={file.canExecute ? 'Execute Governance Workflow' : 'Create Governance Workflow'} />
              <MenuItem text="Submit for Approval" />
              <MenuItem text="Show Started Approval Workflows" />
              <MenuItem text="Set Expiration Date" />
            </MenuItem>}
            {selectedRoot !== 'my-modeling' && <MenuItem text="Read Confirmation" icon="SAP-icons-v4/visible-confirmed" />}
            {selectedRoot !== 'my-modeling' && <MenuItem text="Rate Process" icon="feedback" />}
            {selectedRoot !== 'my-modeling' && <MenuItem text="Publish Revision" icon="SAP-icons-v4/published" />}
            {selectedRoot !== 'my-modeling' && <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" disabled />}
            {selectedRoot !== 'my-modeling' && <MenuSeparator />}
            {selectedRoot !== 'my-modeling' && <MenuItem text="Embed" icon="source-code" />}
            <MenuItem text="Export as" icon="SAP-icons-v4/export">
              <MenuItem text="SAP Signavio Archive (SGX)" />
              <MenuItem text="BPMN 2.0 XML" />
              <MenuItem text="XML" />
              <MenuItem text="PNG" />
              <MenuItem text="DMN 1.2 XML" />
              <MenuItem text="SVG" />
              <MenuItem text="PDF" />
              <MenuItem text="Drools" />
              <MenuSeparator />
              <MenuItem text="Export Diagram Translations" />
            </MenuItem>
            <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
            {selectedRoot !== 'my-modeling' && <MenuItem text="Sync with SAP Cloud ALM" icon="synchronize" />}
            <MenuSeparator />
            <MenuItem text="Rename" icon="edit" /><MenuItem text="Move To" icon="SAP-icons-v4/file-move" /><MenuItem text="Copy to" icon="copy" /><MenuItem text="Move to Trash" icon="delete" />
          </>
        )}
      </Menu>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <SplitterLayout options={{ resetOnSizeChange: true, resetOnChildrenChange: true }} style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }} ref={splitterLayoutRef as any}>
        {!hideNavTree && (
          <SplitterElement size="272px" minSize={272} style={{ height: '100%' }}>
            <NavTree
              rootExpanded={rootExpanded} setRootExpanded={setRootExpanded}
              myModelingExpanded={myModelingExpanded} setMyModelingExpanded={setMyModelingExpanded}
              dataModelingExpanded={dataModelingExpanded} setDataModelingExpanded={setDataModelingExpanded}
              dictionaryExpanded={dictionaryExpanded} setDictionaryExpanded={setDictionaryExpanded}
              selectedRoot={selectedRoot}
              selectedFolderLeafId={selectedFolderLeaf?.id}
              selectedFolderPath={selectedFolderPath}
              showAllResources={showAllResources} showTrash={showTrash} showVariantManagement={showVariantManagement}
              isModelingFiles={isModelingFiles}
              selectedSmartFolderId={selectedSmartFolder?.id ?? null}
              smartFolders={smartFolders}
              dictCategories={dictCategories}
              selectedDictCategoryPath={selectedDictCategoryPath}
              onSelectAllResources={() => { clearSelection(); setShowAllResources(true) }}
              onSelectTrash={() => { clearSelection(); setShowTrash(true) }}
              onSelectVariantManagement={() => { clearSelection(); setShowVariantManagement(true) }}
              onSelectRoot={() => { setRootExpanded(v => !v); setSelectedRoot('modeling'); clearSelection() }}
              onSelectMyModeling={() => { setMyModelingExpanded(v => !v); setSelectedRoot('my-modeling'); clearSelection() }}
              onSelectDataModeling={() => { setDataModelingExpanded(v => !v); setSelectedRoot('data-modeling'); clearSelection() }}
              onSelectProcessAtoms={() => { clearSelection(); setShowProcessAtoms(true); setSelectedRoot('process-atoms') }}
              onSelectDictionary={() => { setDictionaryExpanded(v => !v); setSelectedRoot('dictionary'); clearSelection() }}
              onSelectDictCategory={(path) => {
                setSelectedRoot('dictionary')
                setDictionaryExpanded(true)
                setSelectedDictCategoryPath(path)
                setSelectedDictEntry(null); setSelectedDictIds(new Set()); setInfoPanelOpen(false)
                setShowAllResources(false); setShowTrash(false); setShowVariantManagement(false); setShowProcessAtoms(false)
                setSelectedFolderPath(null); setSelectedSmartFolder(null); setExternalSelectedAsset(null)
              }}
              onSelectFolderPath={selectFolderWithPath}
              onSelectSmartFolder={(sf) => { clearSelection(); setSelectedSmartFolder(sf) }}
            />
          </SplitterElement>
        )}

        <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} ref={contentAreaRef as any}>
          {showTrash ? (
            <TrashPage onAssetClick={handleExternalAssetClick} />
          ) : showVariantManagement ? (
            <VariantManagementPage />
          ) : showModelDetail ? (
            <ModelDetailPage
              onBack={() => setShowModelDetail(false)}
              asset={selectedAsset}
              folderPath={selectedFolderPath}
              onNavigateToFolder={(path) => { setShowModelDetail(false); if (!path || path.length === 0) { clearSelection() } else { selectFolderWithPath(path) } }}
            />
          ) : selectedSmartFolder ? (
            <SmartFolderPage
              folder={selectedSmartFolder}
              onDeleted={() => setSelectedSmartFolder(null)}
              onUpdated={sf => setSelectedSmartFolder(sf)}
              onAssetClick={handleExternalAssetClick}
            />
          ) : (
            <>
              <DynamicPage className="repo-dynamic-page" style={{ height: '100%', flex: 1, minWidth: 0 }} hidePinButton titleArea={
                <DynamicPageTitle>
                  <Breadcrumbs
                      slot="breadcrumbs"
                      design="Standard"
                      onItemClick={(e) => {
                        const targetId = (e.detail.item as HTMLElement).dataset.id
                        if (targetId === 'root-back') { setSelectedFolderPath(null); setSelectedDictCategoryPath([]) }
                        else if (targetId === 'data-modeling') { clearSelection(); setSelectedRoot('data-modeling') }
                        else if (targetId === 'dictionary') { clearSelection(); setSelectedRoot('dictionary') }
                        else if (targetId?.startsWith('dict-cat:')) {
                          const catId = targetId.slice('dict-cat:'.length)
                          const idx = selectedDictCategoryPath.findIndex(s => s.id === catId)
                          if (idx >= 0) { setSelectedDictCategoryPath(selectedDictCategoryPath.slice(0, idx + 1)); setSelectedDictIds(new Set()) }
                        } else {
                          const path = findFolderPath(FOLDER_TREE, targetId ?? '')
                          if (path) selectFolderWithPath(path)
                        }
                      }}
                    >
                      {selectedRoot === 'dictionary' && selectedDictCategoryPath.length > 0 && (
                        <>
                          <BreadcrumbsItem data-id="root-back">Dictionary</BreadcrumbsItem>
                          {selectedDictCategoryPath.slice(0, -1).map(seg => (
                            <BreadcrumbsItem key={seg.id} data-id={`dict-cat:${seg.id}`}>{seg.name}</BreadcrumbsItem>
                          ))}
                          <BreadcrumbsItem>{selectedDictCategoryLeaf!.name}</BreadcrumbsItem>
                        </>
                      )}
                      {selectedRoot !== 'dictionary' && selectedFolderPath && selectedFolderPath.length > 0 && (
                        <>
                          <BreadcrumbsItem data-id="root-back">
                            {selectedRoot === 'data-modeling' ? 'Data Modeling Files' : selectedRoot === 'my-modeling' ? 'My Modeling Files' : 'Modeling Files'}
                          </BreadcrumbsItem>
                          {selectedFolderPath.slice(0, -1).map(seg => (
                            <BreadcrumbsItem key={seg.id} data-id={seg.id}>{seg.name}</BreadcrumbsItem>
                          ))}
                          <BreadcrumbsItem>{selectedFolderPath[selectedFolderPath.length - 1].name}</BreadcrumbsItem>
                        </>
                      )}
                  </Breadcrumbs>
                  <Title slot="heading" level="H3">{pageTitle}</Title>
                  <Toolbar slot="actionsBar" design="Transparent">
                    <ToolbarSpacer />
                    {!showAllResources && !showProcessAtoms && !isDictView && (
                    <Button
                      icon="chain-link"
                      design="Transparent"
                      tooltip="Copy Link"
                      onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}
                    />
                    )}
                    {isDictView && selectedDictCategoryPath.length > 0 && (
                      <Button
                        design="Transparent"
                        icon="chain-link"
                        tooltip="Copy Link"
                        onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}
                      />
                    )}
                    {!showAllResources && !showProcessAtoms && !(isDictView && selectedDictCategoryPath.length === 0) && (
                    <Button
                      icon={favoriteIds.has(`folder:${selectedFolderLeaf?.id ?? selectedRoot}`) ? 'favorite' : 'unfavorite'}
                      design="Transparent"
                      tooltip={favoriteIds.has(`folder:${selectedFolderLeaf?.id ?? selectedRoot}`) ? 'Remove from Favorites' : 'Add to Favorites'}
                      onClick={() => {
                        const key = `folder:${selectedFolderLeaf?.id ?? selectedRoot}`
                        setFavoriteIds(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next })
                      }}
                    />
                    )}
                    {isDictView && selectedDictCategoryPath.length > 0 && (() => {
                      const dictNotifBtnId = 'dict-notif-btn'
                      return (<>
                        <Button
                          id={dictNotifBtnId}
                          icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}
                          design="Transparent"
                          tooltip="Subscribe to Updates"
                          onClick={() => setDictNotifMenuOpen(true)}
                        />
                        <Menu
                          opener={dictNotifBtnId}
                          open={dictNotifMenuOpen}
                          onClose={() => setDictNotifMenuOpen(false)}
                          onItemClick={(e: any) => {
                            const text = e?.detail?.text as string | undefined
                            if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') {
                              setNotifPref(text as typeof notifPref)
                              setNotifToast(`Notifications set to ${text}`)
                            }
                            setDictNotifMenuOpen(false)
                          }}
                        >
                          <MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuSeparator />
                          <MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                        </Menu>
                      </>)
                    })()}
                    {(selectedFolderLeaf || isModelingFiles) && !isDictView && selectedRoot !== 'my-modeling' && (() => {
                      const folderNotifBtnId = 'folder-notif-btn'
                      return (<>
                        <Button
                          id={folderNotifBtnId}
                          icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}
                          design="Transparent"
                          tooltip="Subscribe to Updates"
                          onClick={() => setFolderNotifMenuOpen(true)}
                        />
                        <Menu
                          opener={folderNotifBtnId}
                          open={folderNotifMenuOpen}
                          onClose={() => setFolderNotifMenuOpen(false)}
                          onItemClick={(e: any) => {
                            const text = e?.detail?.text as string | undefined
                            if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') {
                              setNotifPref(text as typeof notifPref)
                              setNotifToast(`Notifications set to ${text}`)
                            }
                            setFolderNotifMenuOpen(false)
                          }}
                        >
                          <MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                          <MenuSeparator />
                          <MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem>
                        </Menu>
                      </>)
                    })()}
                    {(selectedFolderLeaf || isModelingFiles) && !isDictView && (
                      <Button
                        id="folder-overflow-btn"
                        icon="overflow"
                        design="Transparent"
                        tooltip="More Options"
                        onClick={() => setFolderOverflowOpen(true)}
                      />
                    )}
                    {(selectedRoot === 'modeling' || selectedRoot === 'process-atoms' || showAllResources) && (
                      <ToolbarSeparator />
                    )}
                    {(selectedRoot === 'modeling' || selectedRoot === 'process-atoms' || showAllResources) && (
                    <ToolbarItem>
                      <Button
                        id="content-filter-btn"
                        design="Transparent"
                        endIcon="slim-arrow-down"
                        onClick={(e) => {
                          if (contentFilterMenuRef.current) {
                            contentFilterMenuRef.current.opener = e.currentTarget as HTMLElement
                            contentFilterMenuRef.current.open = true
                          }
                        }}
                      >
                        {contentFilter === 'published' ? 'Published Only' : 'All Content'}
                      </Button>
                      <Popover
                        ref={contentFilterMenuRef}
                        placement="Bottom"
                        horizontalAlign="End"
                        hideArrow
                        className="no-padding-popover"
                        onClose={() => { if (contentFilterMenuRef.current) contentFilterMenuRef.current.open = false }}
                      >
                        <List
                          separators="None"
                          selectionMode="Single"
                          onItemClick={(e) => {
                            const val = (e.detail.item as HTMLElement).dataset.value
                            setContentFilter(val === 'published' ? 'published' : 'all')
                            if (contentFilterMenuRef.current) contentFilterMenuRef.current.open = false
                          }}
                        >
                          <ListItemStandard description="Show draft and published content" type="Active" data-value="all" selected={contentFilter === 'all'}>All Content</ListItemStandard>
                          <ListItemStandard description="Only show published versions" type="Active" data-value="published" selected={contentFilter === 'published'}>Published Only</ListItemStandard>
                        </List>
                      </Popover>
                    </ToolbarItem>
                    )}
                    {!(isDictView && !currentDictCatId) && <ToolbarSeparator />}
                    <ToggleButton
                      icon="SAP-icons-v4/panel-right"
                      design="Transparent"
                      pressed={infoPanelOpen}
                      tooltip={infoPanelOpen ? 'Close Info Panel' : 'Open Info Panel'}
                      onClick={() => {
                        if (!infoPanelOpen && isDictView && currentDictCatId) {
                          const cat = dictCategories.find(c => c.id === currentDictCatId)
                          if (cat) { setSelectedDictCategory(cat); setSelectedDictEntry(null); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null) }
                        }
                        setInfoPanelOpen(v => !v)
                      }}
                    >Details</ToggleButton>
                  </Toolbar>
                </DynamicPageTitle>
              }>

                {/* File table/list/grid */}
                <>
                  {showProcessAtoms ? (
                    <ProcessAtoms
                      onAssetClick={handleExternalAssetClick}
                      contentOnly
                      publishedOnly={contentFilter === 'published'}
                      onShareSelected={(item) => { setShareFile({ id: item.id, name: item.name, type: 'File', created: '', changed: '' }); setShareView('share') }}
                      onCreateClick={() => { setCreateProcessAtom(true); setSelectedAsset(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setInfoPanelOpen(true) }}
                      items={processAtoms}
                    />
                  ) : showAllResources ? (
                    <AllResources onAssetClick={handleExternalAssetClick} onSelectionCountChange={setExternalSelectionCount} contentOnly publishedOnly={contentFilter === 'published'} onInfoPanelToggle={() => setInfoPanelOpen(v => !v)} />
                  ) : (
                  <SigTableWrapper
                    viewSwitcher={hasSelection ? undefined : (isDictView ? ['table', 'list'] : ['table', 'list', 'grid'])}
                    activeView={activeView}
                    onActiveViewChange={v => setActiveView(v)}
                    titleSlot={
                      <ToolbarItem overflowPriority="NeverOverflow">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {hasSelection ? (
                            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Selected ({selectionCount} of {totalCount})</Title>
                          ) : (
                            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>{!isDictView && totalCount < folderFiles.length ? `Filtered (${totalCount} of ${folderFiles.length})` : `All (${totalCount})`}</Title>
                          )}
                          {hasSelection && (
                            <Button design="Transparent" onClick={clearAllSelection}>Clear Selection</Button>
                          )}
                        </div>
                      </ToolbarItem>
                    }
                    variantManagementSlot={(!hasSelection && !isDictView) ? (
                      <ToolbarItem>
                        <VariantManagement
                          titleText="My Views" closeOnItemSelect size="H5" level="H5" hideApplyAutomatically
                          dirtyState={isViewDirty}
                          onSave={() => { const snap = { sortBy, sortDir, groupBy, filters, columns }; setSavedViewState(snap); setVariantStates(prev => ({ ...prev, [selectedVariant]: snap })) }}
                          onSelect={(e) => { const name = (e as any)?.detail?.children as string | undefined; if (name) { setSelectedVariant(name); const saved = variantStates[name] ?? { sortBy: 'Name', sortDir: 'asc' as const, groupBy: 'none' as typeof groupBy, filters: {}, columns: DEFAULT_COLUMNS }; setSortBy(saved.sortBy); setSortDir(saved.sortDir); setGroupBy(saved.groupBy); setFilters(saved.filters); setColumns(saved.columns); setSavedViewState(saved) } }}
                          onSaveAs={(e) => { const v = (e as any)?.detail; if (v?.children) { const snap = { sortBy, sortDir, groupBy, filters, columns }; setVariants(prev => [...prev, { name: v.children, author: 'Sebastian Kaim', global: !!v.global }]); setSavedViewState(snap); setVariantStates(prev => ({ ...prev, [v.children]: snap })) } }}
                          onSaveManageViews={(e) => { const updated = (e as any)?.detail?.variants as Array<{ children: string; isDefault?: boolean; global?: boolean; author?: string; labelReadOnly?: boolean; hideDelete?: boolean }> | undefined; if (updated) setVariants(updated.map(v => ({ name: v.children, isDefault: v.isDefault, global: v.global, author: v.author, labelReadOnly: v.labelReadOnly, hideDelete: v.hideDelete }))) }}
                        >
                          {variants.map(v => (
                            <VariantItem key={v.name} selected={selectedVariant === v.name} isDefault={v.isDefault} global={v.global} author={v.author} labelReadOnly={v.labelReadOnly} hideDelete={v.hideDelete}>{v.name}</VariantItem>
                          ))}
                        </VariantManagement>
                      </ToolbarItem>
                    ) : undefined}
                    searchSlot={hasSelection ? undefined : (
                      <ToolbarItem>
                        <Input
                          accessibleName="Search"
                          placeholder="Search for name or description"
                          value={fileSearch}
                          showClearIcon
                          style={{ width: '240px' }}
                          onInput={e => setFileSearch((e.target as unknown as HTMLInputElement).value)}
                          icon={<Icon slot="icon" name="search" />}
                        />
                      </ToolbarItem>
                    )}
                    businessActionsSlot={hasSelection ? (
                      <>
                        {isDictView ? (
                          selectionCount === 1 ? (
                            <>
                              <ToolbarItem><Button design="Transparent" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}>Copy Link</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Add to Favorites</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Subscribe to Updates</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Print</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent" onClick={() => setDictMergeOpen(true)}>Merge</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent" onClick={() => { const id = [...selectedDictIds][0]; if (id) setDeleteDictEntryId(id) }}>Delete</Button></ToolbarItem>
                            </>
                          ) : (
                            <>
                              <ToolbarItem><Button design="Transparent" onClick={() => setDictMergeOpen(true)}>Merge</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent" onClick={() => { [...selectedDictIds].forEach(id => setDeleteDictEntryId(id)) }}>Delete</Button></ToolbarItem>
                            </>
                          )
                        ) : selectionCount === 1 ? (
                          // Single item selected — show all its overflow actions
                          selectedFilesList[0]?.type === 'Folder' ? (
                            <>
                              <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) navigateIntoFolder(f) }}>Open</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setShareFile(f); setShareView('share') } }}>Share</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}>Copy Link</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setShareFile(f); setManageFromShare(false); setShareView('manage') } }}>Manage Access</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent">Add to Favorites</Button></ToolbarItem>
                              <ToolbarItem><Button id="sel-reporting-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
                              <ToolbarItem><Button id="sel-export-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Import Diagram Translations</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setRenamingFile(f); setEditFolderOpen(true) } }}>Rename</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Move To</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Move to Trash</Button></ToolbarItem>
                            </>
                          ) : (
                            <>
                              <ToolbarItem><Button id="sel-open-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelOpenOpen(v => !v)}>Open</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Edit in Editor</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Edit in QuickModel</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setShareFile(f); setShareView('share') } }}>Share</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}>Copy Link</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setShareFile(f); setManageFromShare(false); setShareView('manage') } }}>Manage Access</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent">Add to Favorites</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent">Notifications</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent">Compare Revisions</Button></ToolbarItem>
                              <ToolbarItem><Button id="sel-variant-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelVariantMenuOpen(v => !v)}>Variant Management</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Simulate</Button></ToolbarItem>
                              <ToolbarItem><Button id="sel-reporting-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Governance</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent">Read Confirmation</Button></ToolbarItem>}
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent">Rate Process</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent">Publish Revision</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent">Embed</Button></ToolbarItem>}
                              <ToolbarItem><Button id="sel-export-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Import Diagram Translations</Button></ToolbarItem>
                              {selectedRoot !== 'my-modeling' && <ToolbarItem><Button design="Transparent">Sync with SAP Cloud ALM</Button></ToolbarItem>}
                              <ToolbarItem><Button design="Transparent" onClick={() => { const f = selectedFilesList[0]; if (f) { setRenamingFile(f); setEditFolderOpen(true) } }}>Rename</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Move To</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Copy to</Button></ToolbarItem>
                              <ToolbarItem><Button design="Transparent">Move to Trash</Button></ToolbarItem>
                            </>
                          )
                        ) : (
                          <>
                            {selAllNonFolders ? (
                              <>
                                <ToolbarItem><Button design="Transparent">Add to Favorites</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Compare Revisions</Button></ToolbarItem>
                                <ToolbarItem><Button id="sel-reporting-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Publish Revision</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Unpublish</Button></ToolbarItem>
                                <ToolbarItem><Button id="sel-export-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Import Diagram Translations</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Move To</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Copy to</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Move to Trash</Button></ToolbarItem>
                              </>
                            ) : (
                              <>
                                <ToolbarItem><Button design="Transparent">Add to Favorites</Button></ToolbarItem>
                                <ToolbarItem><Button id="sel-reporting-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
                                <ToolbarItem><Button id="sel-export-btn" design="Transparent" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Import Diagram Translations</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Move To</Button></ToolbarItem>
                                <ToolbarItem><Button design="Transparent">Move to Trash</Button></ToolbarItem>
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <ToolbarItem>
                        <Button id="create-btn" design="Emphasized" endIcon="slim-arrow-down" onClick={() => setCreateMenuOpen(v => !v)}>Create</Button>
                      </ToolbarItem>
                    )}
                    sortSlot={hasSelection ? undefined : (
                      <ToolbarItem>
                        <Button
                          id="sort-chip-anchor"
                          design="Transparent"
                          icon="sort"
                          tooltip={isDictView ? `Sort: Name (${dictSortDir === 'asc' ? 'Asc' : 'Desc'})` : `Sort by: ${sortBy}`}
                          onClick={() => {
                            if (isDictView) {
                              if (dictSortPopoverRef.current) {
                                dictSortPopoverRef.current.opener = 'sort-chip-anchor'
                                dictSortPopoverRef.current.open = true
                              }
                              return
                            }
                            if (sortPopoverRef.current) {
                              sortPopoverRef.current.opener = 'sort-chip-anchor'
                              sortPopoverRef.current.open = true
                            }
                          }}
                        />
                        {isDictView && (
                        <Popover
                          ref={dictSortPopoverRef}
                          placement="Bottom"
                          horizontalAlign="Start"
                          hideArrow
                          className="no-padding-popover"
                          style={{ width: '180px' }}
                          onClose={() => { if (dictSortPopoverRef.current) dictSortPopoverRef.current.open = false }}
                        >
                          <List selectionMode="Single" separators="None">
                            <ListItemStandard
                              type="Active"
                              selected={dictSortDir === 'asc'}
                              additionalText="A–Z"
                              onClick={() => { setDictSortDir('asc'); if (dictSortPopoverRef.current) dictSortPopoverRef.current.open = false }}
                            >Name (Asc)</ListItemStandard>
                            <ListItemStandard
                              type="Active"
                              selected={dictSortDir === 'desc'}
                              additionalText="Z–A"
                              onClick={() => { setDictSortDir('desc'); if (dictSortPopoverRef.current) dictSortPopoverRef.current.open = false }}
                            >Name (Desc)</ListItemStandard>
                          </List>
                        </Popover>
                        )}
                        <Popover
                          ref={sortPopoverRef}
                          placement="Bottom"
                          horizontalAlign="Start"
                          hideArrow
                          className="no-padding-popover"
                          style={{ width: 'fit-content', minWidth: 'unset' }}
                          onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 1rem' }}>
                              <SegmentedButton itemsFitContent={false} style={{ width: '100%' }}>
                                <SegmentedButtonItem
                                  icon="sort-ascending"
                                  accessibleName="Ascending"
                                  selected={sortDir === 'asc'}
                                  onClick={() => setSortDir('asc')}
                                >Ascending</SegmentedButtonItem>
                                <SegmentedButtonItem
                                  icon="sort-descending"
                                  accessibleName="Descending"
                                  selected={sortDir === 'desc'}
                                  onClick={() => setSortDir('desc')}
                                >Descending</SegmentedButtonItem>
                              </SegmentedButton>
                            </div>
                            <List
                              separators="None"
                              selectionMode="Single"
                              onItemClick={(e) => {
                                const key = (e.detail.item as HTMLElement).dataset.sortKey
                                if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                              }}
                            >
                              {SORT_OPTIONS.map(opt => (
                                <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.key}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 6px 0 3px', height: '32px' }}>
                                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{opt.key}</Text>
                                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{sortDirLabel(opt.type, sortDir)}</Text>
                                  </div>
                                </ListItemCustom>
                              ))}
                            </List>
                          </div>
                        </Popover>
                      </ToolbarItem>
                    )}
                    groupSlot={(!hasSelection && !isDictView) ? (
                      <ToolbarItem>
                        <Button
                          id="group-chip-anchor"
                          design="Transparent"
                          icon="group-2"
                          tooltip={`Group by: ${groupBy === 'none' ? 'None' : ({ changedBy: 'Changed By', createdBy: 'Created By', dateChanged: 'Date Changed', dateCreated: 'Date Created', location: 'Location', status: 'Status', type: 'Type' }[groupBy] ?? 'None')}`}
                          onClick={() => {
                            if (groupByPopoverRef.current) {
                              groupByPopoverRef.current.opener = 'group-chip-anchor'
                              groupByPopoverRef.current.open = true
                            }
                          }}
                        />
                        <Popover
                          ref={groupByPopoverRef}
                          placement="Bottom"
                          horizontalAlign="Start"
                          hideArrow
                          className="no-padding-popover"
                          style={{ width: '200px' }}
                          onClose={() => { if (groupByPopoverRef.current) groupByPopoverRef.current.open = false }}
                        >
                          <List
                            separators="None"
                            selectionMode="Single"
                            onItemClick={(e) => {
                              if (activeView !== 'grid') {
                                const val = (e.detail.item as HTMLElement).dataset.groupKey
                                setGroupBy((val as typeof groupBy) ?? 'none')
                                setExpandedGroups(new Set())
                              }
                              if (groupByPopoverRef.current) groupByPopoverRef.current.open = false
                            }}
                          >
                            <ListItemCustom type="Active" data-group-key="none" selected={groupBy === 'none'} accessibleName="None">
                              <div style={{ padding: '0 6px 0 3px', height: '32px', display: 'flex', alignItems: 'center' }}>
                                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>None</Text>
                              </div>
                            </ListItemCustom>
                            {[
                              { key: 'changedBy', label: 'Changed By' },
                              { key: 'createdBy', label: 'Created By' },
                              { key: 'dateChanged', label: 'Date Changed' },
                              { key: 'dateCreated', label: 'Date Created' },
                              { key: 'location', label: 'Location' },
                              { key: 'status', label: 'Status' },
                              { key: 'type', label: 'Type' },
                            ].map(opt => (
                              <ListItemCustom key={opt.key} type="Active" data-group-key={opt.key} selected={groupBy === opt.key} accessibleName={opt.label}>
                                <div style={{ padding: '0 6px 0 3px', height: '32px', display: 'flex', alignItems: 'center' }}>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{opt.label}</Text>
                                </div>
                              </ListItemCustom>
                            ))}
                          </List>
                        </Popover>
                      </ToolbarItem>
                    ) : undefined}
                    settingsSlot={(!hasSelection && !isDictView && activeView === 'table') ? (
                      <ToolbarItem>
                        <Button design="Transparent" icon="action-settings" onClick={() => setCustomizeColumnsOpen(true)}>Columns</Button>
                      </ToolbarItem>
                    ) : undefined}
                    exportActionsSlot={!isDictView ? undefined : (
                      <ToolbarItem overflowPriority="Default">
                        <Button id="dict-export-btn" design="Transparent" icon="SAP-icons-v4/export" onClick={() => setDictExportMenuOpen(v => !v)}>Export</Button>
                      </ToolbarItem>
                    )}
                    filterBarToggleButton={(!isDictView && !hasSelection) ? (
                      <ToolbarItem>
                        <ToggleButton design="Transparent" icon="filter" pressed={filterBarOpen} onClick={() => setFilterBarOpen(v => !v)}>
                          {activeFilterCount > 0 ? String(activeFilterCount) : ''}
                        </ToggleButton>
                      </ToolbarItem>
                    ) : undefined}
                    filterBarSlot={(!isDictView && filterBarOpen) ? (
                      <SigFilterBar key={selectedVariant} filters={filters} onFiltersChange={setFilters} defaultFilters={{}} showManageFilters defaultVisibleFilterKeys={['type', 'dateCreated', 'dateChanged', ...(selectedRoot !== 'my-modeling' ? ['status'] : [])]}>
                        <SigFilter filterKey="type" label="Type"><MultiSelect options={TYPE_OPTIONS} /></SigFilter>
                        <SigFilter filterKey="dateCreated" label="Date Created"><DateRangePicker /></SigFilter>
                        <SigFilter filterKey="dateChanged" label="Date Changed"><DateRangePicker /></SigFilter>
                        {selectedRoot !== 'my-modeling' && <SigFilter filterKey="status" label="Status"><MultiSelect options={STATUS_OPTIONS} /></SigFilter>}
                        <SigFilter filterKey="attr1" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
                        <SigFilter filterKey="attr2" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
                        <SigFilter filterKey="attr3" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
                        <SigFilter filterKey="attr4" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
                        <SigFilter filterKey="attr5" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
                      </SigFilterBar>
                    ) : undefined}
                  >
                    {activeView === 'list' && (selectedRoot === 'dictionary' && !selectedFolderPath ? renderDictListView() : renderListView())}
                    {activeView === 'table' && (selectedRoot === 'dictionary' && !selectedFolderPath ? renderDictTableView() : renderTableView())}
                    {activeView === 'grid' && (selectedRoot === 'dictionary' && !selectedFolderPath ? renderDictGridView() : renderGridView())}
                  </SigTableWrapper>
                  )}

                  <Menu opener="sel-open-btn" open={selOpenOpen} onClose={() => setSelOpenOpen(false)} onItemClick={(e) => { if ((e.detail as any)?.text !== undefined) setShowModelDetail(true); setSelOpenOpen(false) }}>
                    <MenuItem text="Open Latest Revision" />
                    <MenuItem text="Open Published Revision" />
                  </Menu>

                  <Menu opener="sel-reporting-btn" open={selReportingOpen} onClose={() => setSelReportingOpen(false)} onItemClick={() => setSelReportingOpen(false)}>
                    <MenuItem text="Process documentation (PDF)" />
                    <MenuItem text="Process documentation (Word)" />
                    <MenuItem text="Governance report" />
                    <MenuItem text="Process cost analysis" />
                    <MenuItem text="Resource consumption analysis" />
                    <MenuItem text="Modeling conventions" />
                    <MenuItem text="Responsibility assignment matrix / RACI" />
                    <MenuItem text="Responsibility handovers matrix" />
                    <MenuItem text="Documents usage matrix" />
                    <MenuItem text="IT system usage matrix (by diagrams)" />
                    <MenuItem text="IT system usage matrix (by roles)" />
                    <MenuItem text="Process characteristics with element details" />
                    <MenuItem text="Process model metrics" />
                    <MenuItem text="Risks and Controls Report" />
                    <MenuItem text="User/Group assignment" />
                  </Menu>

                  <Menu opener="sel-variant-btn" open={selVariantMenuOpen} onClose={() => setSelVariantMenuOpen(false)} onItemClick={() => setSelVariantMenuOpen(false)}>
                    <MenuItem text="Clone to Create Variant" />
                    <MenuItem text="Attach to Template" />
                    <MenuItem text="Set as Template" />
                  </Menu>

                  <Menu opener="sel-export-btn" open={selExportOpen} onClose={() => setSelExportOpen(false)} onItemClick={() => setSelExportOpen(false)}>
                    {selAllNonFolders ? (
                      <>
                        <MenuItem text="SAP Signavio Archive (SGX)" />
                        <MenuItem text="BPMN 2.0 XML" />
                        <MenuItem text="XML" />
                        <MenuItem text="PNG" />
                        <MenuItem text="DMN 1.2 XML" />
                        <MenuItem text="SVG" />
                        <MenuItem text="PDF" />
                        <MenuItem text="Drools" />
                        <MenuSeparator />
                        <MenuItem text="Export Diagram Translations" />
                      </>
                    ) : selAllFolders ? (
                      <>
                        <MenuItem text="SAP Signavio Archive (SGX)" />
                        <MenuItem text="PDF" />
                        <MenuItem text="Drools" />
                        <MenuSeparator />
                        <MenuItem text="Export Diagram Translations" />
                      </>
                    ) : (
                      <>
                        <MenuItem text="SAP Signavio Archive (SGX)" />
                        <MenuItem text="PDF" />
                        <MenuSeparator />
                        <MenuItem text="Export Diagram Translations" />
                      </>
                    )}
                  </Menu>

                  <Menu opener="sel-action-btn" open={selActionOpen} onClose={() => setSelActionOpen(false)} onItemClick={() => setSelActionOpen(false)}>
                    <MenuItem text="Edit in Modeler" icon="write-new" />
                    <MenuItem text="Edit in QuickModel" icon="SAP-icons-v4/quickmodel" />
                    <MenuSeparator />
                    <MenuItem text="Copy Link" icon="chain-link" />
                    <MenuItem text="Manage Access" icon="user-settings" />
                    <MenuSeparator />
                    <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
                    <MenuSeparator />
                    <MenuItem text="Compare Revisions" icon="compare" />
                    <MenuItem text="Variant Management" icon="SAP-icons-v4/variant">
                      <MenuItem text="Clone to Create Variant" />
                      <MenuItem text="Attach to Template" />
                      <MenuItem text="Set as Template" />
                    </MenuItem>
                    <MenuItem text="Simulate" icon="SAP-icons-v4/simulation" />
                    <MenuSeparator />
                    <MenuItem text="Governance" icon="workflow-tasks">
                      <MenuItem text="Create Governance Workflow" />
                      <MenuItem text="Submit for Approval" />
                      <MenuItem text="Show Started Approval Workflows" />
                      <MenuItem text="Set Expiration Date" />
                    </MenuItem>
                    <MenuItem text="Read Confirmation" icon="SAP-icons-v4/visible-confirmed" />
                    <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" />
                    <MenuSeparator />
                    <MenuItem text="Embed" icon="source-code" />
                    <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
                    <MenuSeparator />
                    <MenuItem text="Sync with SAP Cloud ALM" icon="synchronize" />
                    <MenuSeparator />
                    <MenuItem text="Rename" icon="edit" />
                    <MenuItem text="Copy to" icon="copy" />
                  </Menu>

                  <Menu
                    opener="create-btn"
                    open={createMenuOpen}
                    onClose={() => setCreateMenuOpen(false)}
                    onItemClick={(e) => {
                      setCreateMenuOpen(false)
                      const text = (e.detail as any)?.text as string | undefined
                      if (text === 'Upload File') { setUploadFileOpen(true); return }
                      if (text === 'Import Excel') { setImportExcelOpen(true); return }
                      if (selectedRoot === 'dictionary') {
                        const catId = (e.detail.item as HTMLElement).dataset.catId
                        if (catId) {
                          setCreateDictCategoryId(catId)
                          setSelectedDictEntry(null)
                          setSelectedAsset(null)
                          setExternalSelectedAsset(null)
                          setInfoPanelOpen(true)
                        }
                      }
                    }}
                  >
                    {selectedRoot === 'dictionary' ? (
                      <>
                        <MenuItem text="Import Excel" icon="excel-attachment" />
                        {currentDictCatId && (() => {
                          const currentCat = dictCategories.find(c => c.id === currentDictCatId)
                          return currentCat ? (
                            <>
                              <MenuSeparator />
                              <MenuItem text={currentCat.name} icon={CAT_TYPE_ICON[currentCat.type as DictCategoryType] ?? 'document'} data-cat-id={currentCat.id} />
                            </>
                          ) : null
                        })()}
                        <MenuSeparator />
                        {dictCategories.filter(c => !c.parentId).map(root => {
                          const children = dictCategories.filter(c => c.parentId === root.id)
                          if (children.length > 0) {
                            return (
                              <MenuItem key={root.id} text={root.name} icon={CAT_TYPE_ICON[root.type as DictCategoryType] ?? 'document'}>
                                {children.map(child => {
                                  const grandchildren = dictCategories.filter(c => c.parentId === child.id)
                                  if (grandchildren.length > 0) {
                                    return (
                                      <MenuItem key={child.id} text={child.name} icon={CAT_TYPE_ICON[child.type as DictCategoryType] ?? 'document'}>
                                        {grandchildren.map(gc => (
                                          <MenuItem key={gc.id} text={gc.name} icon={CAT_TYPE_ICON[gc.type as DictCategoryType] ?? 'document'} data-cat-id={gc.id} />
                                        ))}
                                      </MenuItem>
                                    )
                                  }
                                  return <MenuItem key={child.id} text={child.name} icon={CAT_TYPE_ICON[child.type as DictCategoryType] ?? 'document'} data-cat-id={child.id} />
                                })}
                              </MenuItem>
                            )
                          }
                          return <MenuItem key={root.id} text={root.name} icon={CAT_TYPE_ICON[root.type as DictCategoryType] ?? 'document'} data-cat-id={root.id} />
                        })}
                      </>
                    ) : (
                      <>
                        <MenuItem text="Folder" icon="folder-blank" />
                        <MenuSeparator />
                        <MenuItem text="Generate with AI" icon="ai" />
                        <MenuItem text="Import" icon="SAP-icons-v4/import">
                          <MenuItem text="SAP Signavio Archive (SGX)" />
                          <MenuItem text="Import BPMN 2.0 XML" />
                          <MenuItem text="Import DMN 1.2 XML" />
                          <MenuItem text="Import ARIS® Markup Language" />
                        </MenuItem>
                        <MenuItem text="Upload File" icon="upload" />
                        <MenuSeparator />
                        <MenuItem text="BPMN" icon="SAP-icons-v4/process-manager" />
                        <MenuItem text="QuickModel" icon="SAP-icons-v4/process-manager" />
                        <MenuItem text="Value Chain" icon="SAP-icons-v4/process-map" />
                        <MenuItem text="Navigation Map" icon="SAP-icons-v4/navigation-map" />
                        <MenuItem text="Business Decision Diagram (DMN 1.2)" icon="SAP-icons-v4/diagram-dmn" />
                        <MenuItem text="Journey Model" icon="SAP-icons-v4/customer-journey" />
                      </>
                    )}
                  </Menu>

                  {renderOverflowMenu()}

                  {/* Dict category overflow menu */}
                  {dictCatOverflowId && (
                    <Menu
                      opener={`dict-cat-overflow-${dictCatOverflowId}`}
                      open
                      onClose={() => setDictCatOverflowId(null)}
                      onItemClick={(e: any) => {
                        const text = e?.detail?.text as string | undefined
                        if (text === 'Open') {
                          const cat = dictCategories.find(c => c.id === dictCatOverflowId)
                          if (cat) navigateIntoDictCategory({ id: cat.id, name: cat.name })
                        }
                        if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') { setNotifPref(text as typeof notifPref); setNotifToast(`Notifications set to ${text}`); return }
                        if (text === 'Add to Favorites' || text === 'Remove from Favorites') { toggleFileFavorite(dictCatOverflowId!) }
                        setDictCatOverflowId(null)
                      }}
                    >
                      <MenuItem text="Open" icon="open-folder" />
                      <MenuSeparator />
                      <MenuItem text="Copy Link" icon="chain-link" />
                      <MenuItem text={favoriteIds.has(`file:${dictCatOverflowId}`) ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(`file:${dictCatOverflowId}`) ? 'favorite' : 'unfavorite'} />
                      <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
                    </Menu>
                  )}

                  {/* Dict entry overflow menu */}
                  {dictEntryOverflowId && (
                    <Menu
                      opener={`dict-entry-overflow-${dictEntryOverflowId}`}
                      open
                      onClose={() => setDictEntryOverflowId(null)}
                      onItemClick={(e: any) => {
                        const text = e?.detail?.text as string | undefined
                        if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }
                        if (text === 'Add to Favorites' || text === 'Remove from Favorites') { toggleFileFavorite(dictEntryOverflowId!) }
                        if (text === 'Delete') { setDeleteDictEntryId(dictEntryOverflowId!); setDictEntryOverflowId(null); return }
                        if (text === 'Merge') { if (dictEntryOverflowId && !selectedDictIds.has(dictEntryOverflowId)) toggleDictEntrySelect(dictEntryOverflowId, 'row'); setDictMergeOpen(true); setDictEntryOverflowId(null); return }
                        if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') { setNotifPref(text as typeof notifPref); setNotifToast(`Notifications set to ${text}`); return }
                        setDictEntryOverflowId(null)
                      }}
                    >
                      <MenuItem text="Details" icon="SAP-icons-v4/panel-right" />
                      <MenuSeparator />
                      <MenuItem text="Copy Link" icon="chain-link" />
                      <MenuItem text={favoriteIds.has(`file:${dictEntryOverflowId}`) ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(`file:${dictEntryOverflowId}`) ? 'favorite' : 'unfavorite'} />
                      <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
                      <MenuSeparator />
                      <MenuItem text="Print" icon="print" />
                      <MenuItem text="Merge" icon="combine" />
                      <MenuSeparator />
                      <MenuItem text="Delete" icon="delete" />
                    </Menu>
                  )}

                  {/* Folder page-title overflow menu */}
                  {folderOverflowOpen && (selectedFolderLeaf || isModelingFiles) && (
                    <Menu
                      opener="folder-overflow-btn"
                      open
                      onClose={() => setFolderOverflowOpen(false)}
                      onItemClick={(e) => {
                        const text = (e.detail as { text?: string }).text
                        const folderTarget = selectedFolderLeaf ?? { id: selectedRoot, name: pageTitle, type: 'Folder', created: '', changed: '' }
                        if (text === 'Manage Access') { setShareFile(folderTarget as any); setManageFromShare(false); setShareView('manage') }
                        if (text === 'Share') { setShareFile(folderTarget as any); setShareView('share') }
                        if (text === 'Rename') { setEditFolderOpen(true) }
                        if (text === 'Details') { setInfoPanelOpen(v => !v) }
                        if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }
                        if (text === 'Open' && selectedFolderLeaf) { navigateIntoFolder({ ...selectedFolderLeaf, type: 'Folder', created: '', changed: '' }) }
                        setFolderOverflowOpen(false)
                      }}
                    >
                      <MenuItem text="Open" icon="open-folder" />
                      <MenuItem text="Details" icon="SAP-icons-v4/panel-right" />
                      {selectedRoot !== 'my-modeling' && <MenuSeparator />}
                      {selectedRoot !== 'my-modeling' && <MenuItem text="Share" icon="share-2" />}
                      {selectedRoot !== 'my-modeling' && <MenuItem text="Manage Access" icon="user-settings" />}
                      {!['modeling', 'my-modeling', 'data-modeling'].includes(selectedRoot) && <MenuItem text="Add to Favorites" icon="unfavorite" />}
                      <MenuSeparator />
                      <MenuItem text="Reporting" icon="SAP-icons-v4/report">
                        <MenuItem text="Process documentation (PDF)" />
                        <MenuItem text="Process documentation (Word)" />
                        <MenuItem text="Governance report" />
                        <MenuItem text="Process cost analysis" />
                        <MenuItem text="Resource consumption analysis" />
                        <MenuItem text="Modeling conventions" />
                        <MenuItem text="Responsibility assignment matrix / RACI" />
                        <MenuItem text="Responsibility handovers matrix" />
                        <MenuItem text="Documents usage matrix" />
                        <MenuItem text="IT system usage matrix (by diagrams)" />
                        <MenuItem text="IT system usage matrix (by roles)" />
                        <MenuItem text="Process characteristics with element details" />
                        <MenuItem text="Process model metrics" />
                        <MenuItem text="Risks and Controls Report" />
                        <MenuItem text="User/Group assignment" />
                      </MenuItem>
                      <MenuSeparator />
                      {isModelingFiles && !selectedFolderLeaf ? (
                        <>
                          <MenuItem text="Export Diagram Translations" icon="SAP-icons-v4/export" />
                          <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
                        </>
                      ) : (
                        <>
                          <MenuItem text="Export as" icon="SAP-icons-v4/export">
                            <MenuItem text="SAP Signavio Archive (SGX)" />
                            <MenuItem text="PDF" /><MenuItem text="Drools" />
                            <MenuSeparator />
                            <MenuItem text="Export Diagram Translations" />
                          </MenuItem>
                          <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
                          <MenuSeparator />
                          <MenuItem text="Rename" icon="edit" />
                          <MenuItem text="Move To" icon="SAP-icons-v4/file-move" />
                          <MenuItem text="Move to Trash" icon="delete" />
                        </>
                      )}
                    </Menu>
                  )}
                </>
              </DynamicPage>

            </>
          )}
        </SplitterElement>

        {/* Right panel */}
        {infoPanelOpen && (() => {
          const currentSelectionCount = showAllResources ? externalSelectionCount : isDictView ? selectedDictIds.size : selectedIds.size
          const _panelAssetBase = selectedAsset ?? (
            !isDictView && selectedIds.size === 1
              ? displayFiles.find(f => selectedIds.has(f.id)) ?? null
              : null
          )
          const panelAsset = _panelAssetBase ?? ((!isDictView && selectedFolderLeaf && currentSelectionCount === 0)
              ? { id: selectedFolderLeaf.id, name: selectedFolderLeaf.name, type: 'Folder' as const, created: '', changed: '', hasPublished: false, canExecute: false } as typeof selectedAsset
              : null)
          const panelDictEntry = (isDictView && selectedDictIds.size === 0)
            ? null
            : selectedDictEntry ?? (
              isDictView && selectedDictIds.size === 1
                ? dictEntries.find(e => selectedDictIds.has(e.id)) ?? null
                : null
            )
          const resolvedExternalAsset = showAllResources && externalSelectionCount !== 1 ? null : externalSelectedAsset
          // When on a dict category page with no entry selected, auto-use the current category
          // Also: when exactly 1 category is checkbox-selected, show that category's panel
          const catFromCheckbox = isDictView && selectedDictCatIds.size === 1 && selectedDictIds.size === 0
            ? dictCategories.find(c => selectedDictCatIds.has(c.id)) ?? null
            : null
          const resolvedDictCategory = currentSelectionCount >= 2 ? null : (catFromCheckbox ?? selectedDictCategory ?? (
            isDictView && currentDictCatId && !panelDictEntry
              ? dictCategories.find(c => c.id === currentDictCatId) ?? null
              : null
          ))
          return (
          <SplitterElement size="400px" minSize={400} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AssetInfoPanel
              selectedAsset={panelAsset}
              selectedDictEntry={panelDictEntry}
              selectedDictCategory={resolvedDictCategory}
              dictCategories={dictCategories}
              externalSelectedAsset={resolvedExternalAsset}
              pageTitle={pageTitle}
              selectionCount={currentSelectionCount}
              zoomViewport={zoomViewport}
              subscriptions={subscriptions}
              onSubscriptionChange={setSubscription}
              onThumbnailEnter={handleThumbnailEnter}
              onThumbnailLeave={handleThumbnailLeave}
              onThumbnailMove={handleThumbnailMove}
              onThumbnailClick={handleThumbnailClick}
              onClose={() => { setSelectedAsset(null); setSelectedDictEntry(null); setSelectedDictCategory(null); setExternalSelectedAsset(null); setCreateDictCategoryId(null); setCreateProcessAtom(false); setInfoPanelOpen(false) }}
              onOpenModelDetail={() => setShowModelDetail(true)}
              onShare={() => { const f = selectedAsset ?? displayFiles.find(f => selectedIds.has(f.id)) ?? null; if (f) { setShareFile(f); setShareView('share') } }}
              onManageAccess={() => { const f = selectedAsset ?? displayFiles.find(f => selectedIds.has(f.id)) ?? null; if (f) { setShareFile(f); setManageFromShare(false); setShareView('manage') } }}
              onCopyLink={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}
              onRename={() => { const f = selectedAsset ?? displayFiles.find(f => selectedIds.has(f.id)) ?? null; if (f) { setRenamingFile(f); setEditFolderOpen(true) } }}
              onEmbed={() => { const f = selectedAsset ?? displayFiles.find(f => selectedIds.has(f.id)) ?? null; if (f) setEmbedFile(f) }}
              createDictCategoryId={createDictCategoryId}
              onDiscardCreate={() => { setCreateDictCategoryId(null); setCreateProcessAtom(false); setInfoPanelOpen(false) }}
              onCreateCategoryChange={(categoryId) => setCreateDictCategoryId(categoryId)}
              createProcessAtom={createProcessAtom}
              hideRevisionInfo={selectedRoot === 'my-modeling'}
              isFavorite={!!(selectedAsset && favoriteIds.has(`file:${selectedAsset.id}`))}
              onToggleFavorite={() => { if (selectedAsset) toggleFileFavorite(selectedAsset.id) }}
              isDictView={isDictView}
              isModelingFolder={isModelingFiles && !isDictView && !showAllResources}
              onProcessAtomSaved={(name, description) => {
                const newId = `pa-new-${Date.now()}`
                setProcessAtoms(prev => [{
                  id: newId,
                  name,
                  objectType: 'Process Atoms',
                  typeName: 'Process Atom',
                  description,
                  lastUpdateBy: 'Sebastian Kaim',
                  lastUpdateDate: 'Jun 15, 2025',
                  version: '1.0',
                  folder: '',
                  chips: [{ value: 'Draft', design: 'none' as const }],
                }, ...prev])
                setCreateProcessAtom(false)
                setInfoPanelOpen(false)
              }}
              onDictEntrySaved={(entry) => {
                setDictEntries(prev => [entry, ...prev])
                setCreateDictCategoryId(null)
                setDictEntryCreatedToast(true)
                const newCat = dictCategories.find(c => c.id === entry.categoryId)
                if (newCat) {
                  const parentPath: { id: string; name: string }[] = []
                  let cur: typeof newCat | undefined = newCat
                  while (cur?.parentId) {
                    const parent = dictCategories.find(c => c.id === cur!.parentId)
                    if (parent) parentPath.unshift({ id: parent.id, name: parent.name })
                    cur = parent
                  }
                  setSelectedDictCategoryPath([...parentPath, { id: newCat.id, name: newCat.name }])
                }
                setSelectedDictEntry(null)
                setInfoPanelOpen(false)
              }}
              onDictEntryEdited={() => setDictEntryEditedToast(true)}
              onDictEntryMoved={(entryId, newCategoryId) => {
                setDictEntries(prev => prev.map(e => e.id === entryId ? { ...e, categoryId: newCategoryId } : e))
                setSelectedDictEntry(prev => prev?.id === entryId ? { ...prev, categoryId: newCategoryId } : prev)
                const newCat = dictCategories.find(c => c.id === newCategoryId)
                if (newCat) {
                  const parentPath: { id: string; name: string }[] = []
                  let cur: typeof newCat | undefined = newCat
                  while (cur?.parentId) {
                    const parent = dictCategories.find(c => c.id === cur!.parentId)
                    if (parent) parentPath.unshift({ id: parent.id, name: parent.name })
                    cur = parent
                  }
                  setSelectedDictCategoryPath([...parentPath, { id: newCat.id, name: newCat.name }])
                }
              }}
            />
          </SplitterElement>
          )
        })()}
      </SplitterLayout>

      {/* Dialogs */}
      {embedFile && <EmbedDialog file={embedFile} onClose={() => setEmbedFile(null)} />}

      <ImportExcelDialog open={importExcelOpen} onClose={() => setImportExcelOpen(false)} />

      <ExportSGXDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} smartFolders={smartFolders} />
      <ExportTranslationsDialog open={exportTranslationsOpen} onClose={() => setExportTranslationsOpen(false)} smartFolders={smartFolders} />
      <ImportTranslationsDialog open={importTranslationsOpen} onClose={() => setImportTranslationsOpen(false)} />
      <ApprovalWorkflowsDialog open={approvalWorkflowsOpen} onClose={() => setApprovalWorkflowsOpen(false)} />

      <CustomizeColumnsDialog
        open={customizeColumnsOpen}
        columns={selectedRoot === 'my-modeling' ? columns.filter(c => c.id !== 'version' && c.id !== 'status') : columns}
        onSave={(cols) => { setColumns(cols); setCustomizeColumnsOpen(false) }}
        onClose={() => setCustomizeColumnsOpen(false)}
      />

      {shareFile && shareView === 'share' && (
        <ShareDialog file={shareFile} onClose={() => setShareFile(null)} onManageAccess={() => { setManageFromShare(true); setShareView('manage') }} onInvite={(count) => setInviteToast(`${count} ${count === 1 ? 'user' : 'users'} invited`)} />
      )}
      {shareFile && shareView === 'manage' && (
        <ManageAccessDialog
          file={shareFile}
          accessLevels={accessLevels}
          onAccessLevelChange={(id, role) => setAccessLevels(prev => ({ ...prev, [id]: role }))}
          onClose={() => setShareFile(null)}
          onBack={() => setShareView('share')}
          showBackButton={manageFromShare}
        />
      )}


      {editFolderOpen && (renamingFile ?? selectedFolderLeaf) && (() => {
        const target = renamingFile ?? selectedFolderLeaf!
        return (
          <EditFolderDialog
            open
            folderName={editedFolderNames[target.id]?.name ?? target.name}
            folderDescription={editedFolderNames[target.id]?.description}
            isFolder={renamingFile ? renamingFile.type === 'Folder' : true}
            onSave={(name, description) => {
              setEditedFolderNames(prev => ({ ...prev, [target.id]: { name, description } }))
              if (selectedFolderLeaf?.id === target.id) {
                setSelectedFolderPath(prev => prev ? prev.map(seg => seg.id === target.id ? { ...seg, name } : seg) : prev)
              }
              setEditFolderOpen(false)
              setRenamingFile(null)
              setRenameToast(true)
            }}
            onClose={() => { setEditFolderOpen(false); setRenamingFile(null) }}
          />
        )
      })()}

      <Toast open={!!moveToast} placement="BottomCenter" onClose={() => setMoveToast(null)}>
        {moveToast ?? ''}
      </Toast>
      <Toast open={copyLinkToast} placement="BottomCenter" onClose={() => setCopyLinkToast(false)}>
        Link copied to clipboard. Users with existing access can use the link.
      </Toast>

      <UploadFileDialog
        open={uploadFileOpen}
        defaultFolderName={selectedFolderLeaf?.name ?? pageTitle}
        onClose={() => setUploadFileOpen(false)}
        onSave={() => setUploadFileOpen(false)}
      />
      <Toast open={!!inviteToast} placement="BottomCenter" onClose={() => setInviteToast(null)}>
        {inviteToast}
      </Toast>
      <Toast open={renameToast} placement="BottomCenter" onClose={() => setRenameToast(false)}>
        Item renamed
      </Toast>
      <Toast open={dictEntryCreatedToast} placement="BottomCenter" onClose={() => setDictEntryCreatedToast(false)}>
        Dictionary entry created
      </Toast>
      <Toast open={dictEntryEditedToast} placement="BottomCenter" onClose={() => setDictEntryEditedToast(false)}>
        Dictionary entry edited
      </Toast>
      <Toast open={dictEntryDeletedToast} placement="BottomCenter" onClose={() => setDictEntryDeletedToast(false)}>
        Dictionary entry deleted
      </Toast>
      {deleteDictEntryId && (
        <MessageBox
          open
          type="Warning"
          titleText="Delete Entry"
          actions={['Delete', 'Cancel']}
          emphasizedAction="Delete"
          style={{ width: '450px' }}
          onClose={(action) => {
            if (action === 'Delete') {
              setDictEntries(prev => prev.filter(e => e.id !== deleteDictEntryId))
              setSelectedDictIds(prev => { const next = new Set(prev); next.delete(deleteDictEntryId); return next })
              if (selectedDictEntry?.id === deleteDictEntryId) { setSelectedDictEntry(null); setInfoPanelOpen(false) }
              setDictEntryCreatedToast(false)
              setDictEntryDeletedToast(true)
            }
            setDeleteDictEntryId(null)
          }}
        >
          <div style={{ padding: '16px' }}>
            [Take over current texts which are depending on the use cases (e.g. variant mgmt, referenced diagrams, single or multi deletion etc.)]
          </div>
        </MessageBox>
      )}
      <Toast open={!!notifToast} placement="BottomCenter" onClose={() => setNotifToast(null)}>
        {notifToast}
      </Toast>

      {/* Dict export menu */}
      <Menu
        opener="dict-export-btn"
        open={dictExportMenuOpen}
        onClose={() => setDictExportMenuOpen(false)}
        onItemClick={(e) => {
          const text = (e.detail as any)?.text
          setDictExportMenuOpen(false)
          if (text === 'Excel') {
            setDictExcelScope(currentDictCatId ? 'category' : 'all')
            setDictExcelDialogOpen(true)
          }
        }}
      >
        <MenuItem text="Excel" icon="excel-attachment" />
        {dictCategories.find(c => c.id === currentDictCatId)?.type === 'Organization' && (
          <MenuItem text="Job Profile Report" icon="SAP-icons-v4/report" />
        )}
      </Menu>

      {/* Excel Export dialog */}
      {dictExcelDialogOpen && (() => {
        const isRootPage = !currentDictCatId
        const nothingSelected = selectedDictIds.size === 0
        const catName = dictCategories.find(c => c.id === currentDictCatId)?.name ?? 'Category'
        return (
          <Dialog
            open
            headerText="Export Excel"
            footer={
              <Bar design="Footer"
                endContent={
                  <>
                    <Button design="Emphasized" onClick={() => {
                      setDictExcelDialogOpen(false)
                      setDictExportProgressOpen(true)
                      dictExportProgressTimerRef.current = setTimeout(() => {
                        setDictExportProgressOpen(false)
                        setDictExportSuccessToast(true)
                      }, 2500)
                    }}>Export</Button>
                    <Button design="Transparent" onClick={() => setDictExcelDialogOpen(false)}>Cancel</Button>
                  </>
                }
              />
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '420px', maxWidth: '540px' }}>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
                Select the dictionary entries you want to export to a spreadsheet. If you choose to export dictionary entries of more than one category, the entries for each category will be exported to different sheets.
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '-0.5rem' }}>
                <RadioButton
                  name="dictExcelScope"
                  text={`Export dictionary entries of current category (${catName})`}
                  checked={dictExcelScope === 'category'}
                  disabled={isRootPage}
                  onChange={() => setDictExcelScope('category')}
                />
                <RadioButton
                  name="dictExcelScope"
                  text="Export selected dictionary entries only"
                  checked={dictExcelScope === 'selected'}
                  disabled={isRootPage || nothingSelected}
                  onChange={() => setDictExcelScope('selected')}
                />
                <RadioButton
                  name="dictExcelScope"
                  text="Export entire dictionary"
                  checked={dictExcelScope === 'all'}
                  onChange={() => setDictExcelScope('all')}
                />
              </div>
              <CheckBox
                text="Include linking models"
                checked={dictExcelIncludeModels}
                onChange={(e: any) => setDictExcelIncludeModels(e.target.checked)}
                style={{ marginLeft: '-0.5rem' }}
              />
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', marginTop: '4px' }}>
                Select the language you want to export:
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '-0.5rem' }}>
                {contentLanguages.map((lang, idx) => (
                  <CheckBox
                    key={lang.code}
                    text={lang.label}
                    checked={idx === 0}
                  />
                ))}
              </div>
            </div>
          </Dialog>
        )
      })()}

      {/* Export progress dialog */}
      {dictExportProgressOpen && (
        <Dialog
          open
          headerText="Export Excel"
          footer={
            <Bar design="Footer"
              endContent={
                <Button design="Transparent" onClick={() => {
                  setDictExportProgressOpen(false)
                  if (dictExportProgressTimerRef.current) clearTimeout(dictExportProgressTimerRef.current)
                }}>Cancel</Button>
              }
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', minWidth: '300px' }}>
            <BusyIndicator active size="M" delay={0} />
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Exporting...</Text>
          </div>
        </Dialog>
      )}

      <Toast open={dictExportSuccessToast} placement="BottomCenter" onClose={() => setDictExportSuccessToast(false)}>
        Excel exported
      </Toast>

      {/* Merge Dictionary Entries flow */}
      {dictMergeOpen && (() => {
        const selectedEntries = dictEntries.filter(e => selectedDictIds.has(e.id))
        const categoryEntries = currentDictCatId
          ? dictEntries.filter(e => e.categoryId === currentDictCatId)
          : dictEntries
        return (
          <MergeDictionaryEntriesDialog
            open
            entries={selectedEntries.length >= 1 ? selectedEntries : dictEntries.slice(0, 2)}
            allEntries={categoryEntries}
            categories={dictCategories}
            onClose={() => setDictMergeOpen(false)}
            onMerge={(keepId, mergeIds) => {
              setDictMergeOpen(false)
              setDictMergePendingKeepId(keepId)
              setDictMergePendingMergeIds(mergeIds)
              setDictMergeConfirmOpen(true)
            }}
          />
        )
      })()}

      {dictMergeConfirmOpen && (
        <MessageBox
          open
          type="Confirm"
          titleText="Merge Dictionary Entries"
          actions={['Merge', 'Cancel']}
          style={{ width: '450px' }}
          emphasizedAction="Merge"
          onClose={(action) => {
            setDictMergeConfirmOpen(false)
            if (action === 'Merge') {
              setDictMergeProgressOpen(true)
              dictMergeTimerRef.current = setTimeout(() => {
                setDictMergeProgressOpen(false)
                if (dictMergePendingKeepId) {
                  setDictEntries(prev => prev.filter(e => !dictMergePendingMergeIds.includes(e.id)))
                  setSelectedDictIds(new Set())
                  setSelectedDictEntry(null)
                  setInfoPanelOpen(false)
                }
                setDictMergeSuccessToast(true)
                setDictMergePendingKeepId(null)
                setDictMergePendingMergeIds([])
              }, 2500)
            }
          }}
        >
          <div style={{ padding: '16px' }}>
            The following two records are merged into a single record according to the selected values. This action cannot be undone. Do you want to proceed merging the records?
          </div>
        </MessageBox>
      )}

      {dictMergeProgressOpen && (
        <Dialog
          open
          style={{ width: '450px' }}
          headerText="Merge Dictionaries Entries"
          footer={
            <Bar design="Footer"
              endContent={
                <Button design="Transparent" onClick={() => {
                  setDictMergeProgressOpen(false)
                  if (dictMergeTimerRef.current) clearTimeout(dictMergeTimerRef.current)
                }}>Cancel</Button>
              }
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', minWidth: '300px' }}>
            <BusyIndicator active size="M" delay={0} />
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Merging...</Text>
          </div>
        </Dialog>
      )}

      <Toast open={dictMergeSuccessToast} placement="BottomCenter" onClose={() => setDictMergeSuccessToast(false)}>
        Dictionary entries merged
      </Toast>

      {zoomScrimRect && (
        <MagicZoom scrimRect={zoomScrimRect} focusRef={zoomFocusRef} onClose={handleZoomClose} onScrimEnter={handleScrimEnter} onViewportChange={setZoomViewport} />
      )}
    </>
  )
}
