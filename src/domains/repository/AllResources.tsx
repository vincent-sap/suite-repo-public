import { useState, useRef, useEffect } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Toolbar, ToolbarButton, ToolbarItem, ToolbarSeparator, ToolbarSpacer,
  Button, ToggleButton, Menu, MenuItem, MenuSeparator, Toast,
  AnalyticalTable, CheckBox, Text, type AnalyticalTableColumnDefinition,
  Popover, List, ListItemCustom, type PopoverDomRef,
  Input, Icon,
  SplitterLayout, SplitterElement,
  SegmentedButton, SegmentedButtonItem,
  VariantManagement, VariantItem,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { RESULTS, type ResultItem, TYPE_OPTIONS, STATUS_OPTIONS, enrichChips } from '../../data/allResourcesMockData'
import { AssetListItem } from './components/AssetListItem'
import DateRangePicker from './components/DateRangePicker'
import CustomizeColumnsDialog from './Repository/dialogs/CustomizeColumnsDialog'
import EditFolderDialog from './Repository/dialogs/EditFolderDialog'
import { ShareDialog, ManageAccessDialog } from './Repository/dialogs/ShareDialogs'
import type { AccessRole } from './Repository/data'
import AssetInfoPanel from './Repository/AssetInfoPanel'
import type { ColumnDef } from './Repository/data'

const ALL_RESOURCES_DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'name',           label: 'Name',             required: true,  visible: true  },
  { id: 'typeName',       label: 'Type',             required: false, visible: true  },
  { id: 'folder',         label: 'Location',         required: false, visible: true  },
  { id: 'createdDate',    label: 'Created',          required: false, visible: true  },
  { id: 'lastUpdateDate', label: 'Changed',          required: false, visible: true  },
  { id: 'chips',          label: 'Status',           required: false, visible: true  },
  { id: 'attr1',          label: '[Attribute Name]', required: false, visible: false },
  { id: 'attr2',          label: '[Attribute Name]', required: false, visible: false },
  { id: 'attr3',          label: '[Attribute Name]', required: false, visible: false },
  { id: 'attr4',          label: '[Attribute Name]', required: false, visible: false },
  { id: 'attr5',          label: '[Attribute Name]', required: false, visible: false },
]

const SORT_OPTIONS = [
  { key: 'Changed By',   type: 'text' as const },
  { key: 'Created By',   type: 'text' as const },
  { key: 'Date Changed', type: 'date' as const },
  { key: 'Date Created', type: 'date' as const },
  { key: 'Name',         type: 'text' as const },
  { key: 'Status',       type: 'text' as const },
  { key: 'Type',         type: 'text' as const },
]

function sortDirLabel(type: 'text' | 'date', dir: 'asc' | 'desc'): string {
  if (type === 'date') return dir === 'asc' ? 'Oldest First' : 'Newest First'
  return dir === 'asc' ? 'A–Z' : 'Z–A'
}


type ViewType = 'table' | 'list'

import type { ProcessAtomExtension, ProcessAtomOwner } from './Repository/ProcessAtomInfoPanel'

export type SelectedAssetInfo = {
  id: string
  name: string
  objectType: string
  typeName: string
  description?: string
  folder?: string
  version?: string
  lastUpdateBy?: string
  lastUpdateDate?: string
  lastPublished?: string
  createdDate?: string
  richTextDescription?: string
  canEdit?: boolean
  owner?: ProcessAtomOwner
  tags?: string[]
  extensions?: ProcessAtomExtension[]
  chips: { value: string; design: 'none' | 'error' | 'information' | 'positive' | 'success' | 'warning' | 'negative' }[]
}

type Props = {
  onAssetClick?: (asset: SelectedAssetInfo) => void
  onSelectionCountChange?: (count: number) => void
  contentOnly?: boolean
  publishedOnly?: boolean
  onInfoPanelToggle?: () => void
}

export default function AllResources({ onAssetClick, onSelectionCountChange, contentOnly, publishedOnly, onInfoPanelToggle }: Props) {
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [filterBarOpen, setFilterBarOpen] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('list')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [savedViewState, setSavedViewState] = useState({ sortBy: 'Name', sortDir: 'asc' as 'asc' | 'desc', groupBy: 'none' as typeof groupBy, filters: {} as Record<string, unknown>, columns: ALL_RESOURCES_DEFAULT_COLUMNS })
  const [variantStates, setVariantStates] = useState<Record<string, { sortBy: string; sortDir: 'asc' | 'desc'; groupBy: typeof groupBy; filters: Record<string, unknown>; columns: typeof ALL_RESOURCES_DEFAULT_COLUMNS }>>({ Standard: { sortBy: 'Name', sortDir: 'asc', groupBy: 'none', filters: {}, columns: ALL_RESOURCES_DEFAULT_COLUMNS } })
  const [groupBy, setGroupBy] = useState<'none' | 'changedBy' | 'createdBy' | 'dateChanged' | 'dateCreated' | 'location' | 'status' | 'type'>('none')
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const groupPopoverRef = useRef<PopoverDomRef>(null)
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [renamingItem, setRenamingItem] = useState<ResultItem | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamedItems, setRenamedItems] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [shareItem, setShareItem] = useState<ResultItem | null>(null)
  const [shareView, setShareView] = useState<'share' | 'manage'>('share')
  const [manageFromShare, setManageFromShare] = useState(false)
  const [accessLevels, setAccessLevels] = useState<Record<string, AccessRole>>({})
  const [selReportingOpen, setSelReportingOpen] = useState(false)
  const [selExportOpen, setSelExportOpen] = useState(false)
  const [copyLinkToast, setCopyLinkToast] = useState(false)
  const [inviteToast, setInviteToast] = useState<string | null>(null)
  const [renameToast, setRenameToast] = useState(false)
  const [notifPref, setNotifPref] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Off'>('Off')
  const [notifToast, setNotifToast] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null)
  const toggleFileFavorite = (id: string) => setFavoriteIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  const [selActionOpen, setSelActionOpen] = useState(false)
  const [selOpenOpen, setSelOpenOpen] = useState(false)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [customizeColumnsOpen, setCustomizeColumnsOpen] = useState(false)
  const [columns, setColumns] = useState<ColumnDef[]>(ALL_RESOURCES_DEFAULT_COLUMNS)
  const [variants, setVariants] = useState([{ name: 'Standard', isDefault: true, labelReadOnly: true, hideDelete: true }])
  const [selectedVariant, setSelectedVariant] = useState('Standard')

  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length

  const displayResults = (() => {
    let result = publishedOnly
      ? RESULTS.filter(r => r.chips.some(c => c.value === 'Published'))
      : RESULTS

    // Type filter — map filter values to typeName strings
    const typeFilter = filters.type as string[] | undefined
    if (typeFilter?.length) {
      const typeMap: Record<string, string> = {
        'bpmn': 'BPMN', 'folder': 'Folder', 'dashboard': 'Dashboard',
        'initiative': 'Initiative', 'journey': 'Journey Model',
        'value-chain': 'Value Chain', 'objective': 'Objective',
      }
      const allowed = new Set(typeFilter.map(v => typeMap[v]).filter(Boolean))
      result = result.filter(r => allowed.has(r.typeName))
    }

    // Status filter — map filter values to chip values
    const statusFilter = filters.status as string[] | undefined
    if (statusFilter?.length) {
      const statusMap: Record<string, string> = {
        'published': 'Published', 'draft': 'Draft', 'on-track': 'On Track',
        'modified': 'Modified', 'at-risk': 'At Risk',
      }
      const allowed = new Set(statusFilter.map(v => statusMap[v]).filter(Boolean))
      result = result.filter(r => r.chips.some(c => allowed.has(c.value)))
    }

    // Date changed filter
    const dateChangedFilter = filters.dateChanged as { mode: string; startDate?: string; endDate?: string } | undefined
    if (dateChangedFilter?.startDate) {
      const start = dateChangedFilter.startDate
      const end = dateChangedFilter.endDate ?? start
      result = result.filter(r => {
        const d = new Date(r.lastUpdateDate)
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return iso >= start && iso <= end
      })
    }

    // Date created filter
    const dateCreatedFilter = filters.dateCreated as { mode: string; startDate?: string; endDate?: string } | undefined
    if (dateCreatedFilter?.startDate) {
      const start = dateCreatedFilter.startDate
      const end = dateCreatedFilter.endDate ?? start
      result = result.filter(r => {
        if (!r.createdDate) return true
        const d = new Date(r.createdDate)
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return iso >= start && iso <= end
      })
    }

    return result
  })()

  const isViewDirty = (() => {
    const s = savedViewState
    return sortBy !== s.sortBy || sortDir !== s.sortDir || groupBy !== s.groupBy
      || JSON.stringify(filters) !== JSON.stringify(s.filters)
      || JSON.stringify(columns.map(c => ({ id: c.id, visible: c.visible }))) !== JSON.stringify(s.columns.map(c => ({ id: c.id, visible: c.visible })))
  })()

  const hasSelection = selectedIds.size > 0
  const selectionCount = selectedIds.size
  const totalCount = displayResults.length

  const toggleSelect = (id: string, mode: 'row' | 'checkbox') => {
    setSelectedIds(prev => {
      if (mode === 'row') return new Set([id])
      if (prev.size === 0) return new Set([id])
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleRowSelect = (item: ResultItem) => {
    toggleSelect(item.id, 'row')
  }

  useEffect(() => {
    onSelectionCountChange?.(selectedIds.size)
    if (!onAssetClick) return
    if (selectedIds.size !== 1) return
    const item = displayResults.find(r => selectedIds.has(r.id))
    if (item) onAssetClick({ id: item.id, name: item.name, objectType: item.objectType, typeName: item.typeName, description: item.description, folder: item.folder, chips: item.chips, lastUpdateBy: item.lastUpdateBy, lastUpdateDate: item.lastUpdateDate, lastPublished: item.lastPublished, createdDate: item.createdDate, version: item.version, canEdit: item.canEdit, owner: item.owner, tags: item.tags, extensions: item.extensions })
  }, [selectedIds])

  // ── List view ─────────────────────────────────────────────────────────────
  const renderListView = () => {
    const allSelected = displayResults.length > 0 && displayResults.every(r => selectedIds.has(r.id))
    const someSelected = !allSelected && displayResults.some(r => selectedIds.has(r.id))
    const handleSelectAll = () => {
      if (allSelected) setSelectedIds(new Set())
      else setSelectedIds(new Set(displayResults.map(r => r.id)))
    }
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'var(--sapList_Background)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
          <CheckBox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} accessibleName="Select all" />
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>Select All</Text>
        </div>
        <List separators="Inner">
          {displayResults.map((item, i) => (
            <AssetListItem
              key={item.id}
              id={item.id}
              name={item.name}
              objectType={item.objectType}
              typeName={item.typeName}
              description={item.description}
              created={item.lastUpdateDate}
              changed={item.lastUpdateDate}
              folder={item.folder}
              chips={enrichChips(item) as any}
              ownerName={(item.typeName === 'Objective' || item.typeName === 'Initiative' || item.typeName === 'Dashboard') ? item.lastUpdateBy : undefined}
              isSelected={selectedIds.has(item.id)}
              onSelect={() => toggleSelect(item.id, 'checkbox')}
              overflowId={`all-overflow-${item.id}`}
              onOverflow={() => { if (!selectedIds.has(item.id)) toggleSelect(item.id, 'row'); setOpenOverflowId(item.id) }}
              onClick={() => handleRowSelect(item)}
              onMouseEnter={() => setHoveredFileId(item.id)}
              onMouseLeave={() => setHoveredFileId(null)}
              actionsSlot={(hoveredFileId === item.id || favoriteIds.has(item.id)) ? (
                <Button
                  icon={favoriteIds.has(item.id) ? 'favorite' : 'unfavorite'}
                  design="Transparent"
                  tooltip={favoriteIds.has(item.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(item.id) }}
                />
              ) : undefined}
              isLast={i === displayResults.length - 1}
            />
          ))}
        </List>
      </div>
    )
  }

  // ── Table view ────────────────────────────────────────────────────────────
  const renderTableView = () => {
    const allSelected = displayResults.length > 0 && displayResults.every(r => selectedIds.has(r.id))
    const someSelected = !allSelected && displayResults.some(r => selectedIds.has(r.id))
    const handleSelectAll = () => {
      if (allSelected) setSelectedIds(new Set())
      else setSelectedIds(new Set(displayResults.map(r => r.id)))
    }

    const checkboxCol: AnalyticalTableColumnDefinition = {
      id: '__select',
      Header: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckBox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} accessibleName="Select all" />
        </div>
      ),
      accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => {
        const item = row.original as ResultItem
        return (
          <div onClick={(e) => { e.stopPropagation(); toggleSelect(item.id, 'checkbox') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckBox checked={selectedIds.has(item.id)} accessibleName={`Select ${item.name}`} />
          </div>
        )
      },
    }

    const visibleCols = new Set(columns.filter(c => c.visible).map(c => c.id))

    const allCols: AnalyticalTableColumnDefinition[] = [
      checkboxCol,
      {
        id: 'name', accessor: 'name', Header: 'Name', minWidth: 300, width: 300,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const item = row.original as ResultItem
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 6px' }}
              onMouseEnter={() => setHoveredFileId(item.id)}
              onMouseLeave={() => setHoveredFileId(null)}
            >
              <SigDomainObject size="XXS" object={item.objectType} />
              <Text
                className="table-asset-name"
                style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', color: 'var(--sapTextColor)' }}
              >{item.name}</Text>
              {(hoveredFileId === item.id || favoriteIds.has(item.id)) && (
                <Button icon={favoriteIds.has(item.id) ? 'favorite' : 'unfavorite'} design="Transparent" style={{ height: '24px', minWidth: '24px', flexShrink: 0 }}
                  onClick={(e: any) => { e.stopPropagation?.(); toggleFileFavorite(item.id) }} />
              )}
            </div>
          )
        },
      },
      {
        id: 'typeName', accessor: 'typeName', Header: 'Type', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).typeName}</Text>,
      },
      {
        id: 'folder', accessor: 'folder', Header: 'Location', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).folder ?? ''}</Text>,
      },
      {
        id: 'createdDate', accessor: 'createdDate', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Created</div>, minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as ResultItem).createdDate ?? ''}</Text></div>,
      },
      {
        id: 'lastUpdateDate', accessor: 'lastUpdateDate', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Changed</div>, minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as ResultItem).lastUpdateDate}</Text></div>,
      },
      {
        id: 'chips', accessor: 'chips', Header: 'Status', minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const chips = (row.original as ResultItem).chips
          return (
            <div style={{ display: 'flex', gap: '4px' }}>
              {chips.map((chip, i) => (
                <SigChipV2
                  key={i}
                  value={chip.value}
                  leadingIcon={chip.value === 'Published' ? 'SAP-icons-v4/published' : chip.value === 'Draft' ? 'write-new-document' : chip.value === 'On Track' ? 'trend-up' : chip.value === 'Modified' ? 'SAP-icons-v4/published-changed' : chip.value === 'At Risk' ? 'message-warning' : 'SAP-icons-v4/published-changed'}
                  design={(chip.value === 'Published' ? 'indication5' : chip.value === 'Draft' ? 'indication10' : chip.value === 'On Track' ? 'indication4' : chip.value === 'Modified' ? 'indication7' : chip.value === 'At Risk' ? 'indication2' : 'indication7') as any}
                  condensed
                />
              ))}
            </div>
          )
        },
      },
      {
        id: '__actions', Header: '', accessor: 'id',
        disableSortBy: true, disableFilters: true, disableGroupBy: true,
        minWidth: 44, width: 44,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => (
          <Button
            id={`all-overflow-${(row.original as ResultItem).id}`}
            icon="overflow" design="Transparent"
            tooltip="More Options"
            onClick={(e) => { e.stopPropagation(); const rid = (row.original as ResultItem).id; if (!selectedIds.has(rid)) toggleSelect(rid, 'row'); setOpenOverflowId(rid) }}
          />
        ),
      },
    ]

    // Add [Attribute Name] columns for any visible attr1–attr5
    columns.filter(c => c.id.startsWith('attr') && c.visible).forEach(col => {
      allCols.splice(allCols.length - 1, 0, {
        id: col.id,
        accessor: col.id,
        Header: col.label,
        minWidth: 120,
        Cell: () => null,
      })
    })

    const cols = allCols.filter(c => !c.id || c.id === '__select' || c.id === '__actions' || visibleCols.has(c.id as string))

    return (
      <AnalyticalTable
        key={cols.map(c => c.id).join(',')}
        data={displayResults}
        columns={cols}
        selectionMode="None"
        tableHooks={[
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (hooks: any) => {
            hooks.getRowProps.push((_props: any, { row }: any) => {
              const item = row.original as ResultItem
              const isSelected = selectedIds.has(item.id)
              return [_props, isSelected ? { 'data-is-selected': '' } : {}, {
                onMouseEnter: () => { if (!openOverflowId) setHoveredFileId(item.id) },
                onMouseLeave: () => { if (!openOverflowId) setHoveredFileId(null) },
              }]
            })
          }
        ]}
        onRowClick={(e) => {
          if (openOverflowId) return
          // @ts-ignore
          const item = e?.detail?.row?.original as ResultItem | undefined
          if (!item) return
          handleRowSelect(item)
        }}
        visibleRows={displayResults.length}
        minRows={displayResults.length}
        style={{ width: '100%' }}
        className="ui5-content-density-compact"
      />
    )
  }

  // ── Overflow menu ─────────────────────────────────────────────────────────
  const overflowMenu = openOverflowId && (() => {
    const item = displayResults.find(r => r.id === openOverflowId)
    if (!item) return null
    void item.chips.some(c => c.value === 'Published') // hasPublished - kept for future use
    return (
      <Menu opener={`all-overflow-${openOverflowId}`} open onClose={() => setOpenOverflowId(null)} onItemClick={(e) => {
        const text = (e.detail as { text?: string }).text
        if (text === 'Rename' && item) { setRenamingItem(item); setRenameDialogOpen(true) }
        if (text === 'Details') { onInfoPanelToggle ? onInfoPanelToggle() : setInfoPanelOpen(v => !v) }
        if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }
        if (text === 'Share' && item) { setShareItem(item); setShareView('share'); }
        if (text === 'Manage Access' && item) { setShareItem(item); setManageFromShare(false); setShareView('manage') }
        if (text === 'Daily' || text === 'Weekly' || text === 'Monthly' || text === 'Off') { setNotifPref(text as typeof notifPref); setNotifToast(`Notifications set to ${text}`); return }
        if (text === 'Add to Favorites' || text === 'Remove from Favorites') { if (openOverflowId) toggleFileFavorite(openOverflowId) }
        setOpenOverflowId(null)
      }}>
        {selectedIds.size > 1 && selectedIds.has(item.id) ? (
          <>
            <MenuItem text={favoriteIds.has(openOverflowId ?? '') ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(openOverflowId ?? '') ? 'favorite' : 'unfavorite'} />
            <MenuItem text="Compare Revisions" icon="compare" />
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
            <MenuItem text="Publish Revision" icon="SAP-icons-v4/published" />
            <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" disabled />
            <MenuItem text="Export as" icon="SAP-icons-v4/export">
              <MenuItem text="SAP Signavio Archive (SGX)" />
              <MenuItem text="BPMN 2.0 XML" /><MenuItem text="XML" /><MenuItem text="PNG" />
              <MenuItem text="DMN 1.2 XML" /><MenuItem text="SVG" /><MenuItem text="PDF" /><MenuItem text="Drools" />
              <MenuSeparator />
              <MenuItem text="Export Diagram Translations" />
            </MenuItem>
            <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
            <MenuItem text="Move to" icon="SAP-icons-v4/file-move" />
            <MenuItem text="Copy to" icon="copy" />
            <MenuItem text="Move to Trash" icon="delete" />
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
            <MenuItem text="Share" icon="share-2" />
            <MenuItem text="Copy Link" icon="chain-link" />
            <MenuItem text="Manage Access" icon="user-settings" />
            <MenuSeparator />
            <MenuItem text={favoriteIds.has(openOverflowId ?? '') ? 'Remove from Favorites' : 'Add to Favorites'} icon={favoriteIds.has(openOverflowId ?? '') ? 'favorite' : 'unfavorite'} />
            <MenuItem text="Notifications" icon={notifPref === 'Off' ? 'SAP-icons-v4/notification-disabled' : 'bell'}><MenuItem text="Daily" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Daily' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Weekly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Weekly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuItem text="Monthly" icon="bell" style={{ minWidth: '160px' } as any}>{notifPref === 'Monthly' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem><MenuSeparator /><MenuItem text="Off" icon="SAP-icons-v4/notification-disabled" style={{ minWidth: '160px' } as any}>{notifPref === 'Off' && <Icon slot="endContent" name="accept" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' }} />}</MenuItem></MenuItem>
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
            <MenuItem text="Governance" icon="workflow-tasks">
              <MenuItem text="Create Governance Workflow" />
              <MenuItem text="Submit for Approval" />
              <MenuItem text="Show Started Approval Workflows" />
              <MenuItem text="Set Expiration Date" />
            </MenuItem>
            <MenuItem text="Read Confirmation" icon="SAP-icons-v4/visible-confirmed" /><MenuItem text="Rate Process" icon="feedback" />
            <MenuItem text="Publish Revision" icon="SAP-icons-v4/published" />
            <MenuItem text="Unpublish" icon="SAP-icons-v4/published-changed" disabled />
            <MenuSeparator />
            <MenuItem text="Embed" icon="source-code" />
            <MenuItem text="Export as" icon="SAP-icons-v4/export">
              <MenuItem text="SAP Signavio Archive (SGX)" />
              <MenuItem text="BPMN 2.0 XML" /><MenuItem text="XML" /><MenuItem text="PNG" />
              <MenuItem text="DMN 1.2 XML" /><MenuItem text="SVG" /><MenuItem text="PDF" /><MenuItem text="Drools" />
              <MenuSeparator />
              <MenuItem text="Export Diagram Translations" />
            </MenuItem>
            <MenuItem text="Import Diagram Translations" icon="SAP-icons-v4/import" />
            <MenuSeparator />
            <MenuItem text="Sync with SAP Cloud ALM" icon="synchronize" />
            <MenuSeparator />
            <MenuItem text="Rename" icon="edit" />
            <MenuItem text="Move to" icon="SAP-icons-v4/file-move" />
            <MenuItem text="Copy to" icon="copy" />
            <MenuItem text="Move to Trash" icon="delete" />
          </>
        )}
      </Menu>
    )
  })()

  // ── SigTableWrapper (shared between contentOnly and standalone) ───────────
  const tableWrapper = (
    <SigTableWrapper
      viewSwitcher={hasSelection ? undefined : ['table', 'list']}
      activeView={activeView}
      onActiveViewChange={v => setActiveView(v as ViewType)}
      titleSlot={
        <ToolbarItem>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            {hasSelection ? (
              <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Selected ({selectionCount} of {totalCount})</Title>
            ) : (
              <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>{totalCount < RESULTS.length ? `Filtered (${totalCount} of ${RESULTS.length})` : `All (${totalCount})`}</Title>
            )}
            {hasSelection && (
              <Button design="Transparent" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
            )}
          </div>
        </ToolbarItem>
      }
      variantManagementSlot={hasSelection ? undefined : (
        <ToolbarItem>
          <VariantManagement
            titleText="My Views" closeOnItemSelect size="H5" level="H5" hideApplyAutomatically
            dirtyState={isViewDirty}
            onSave={() => { const snap = { sortBy, sortDir, groupBy, filters, columns }; setSavedViewState(snap); setVariantStates(prev => ({ ...prev, [selectedVariant]: snap })) }}
            onSelect={(e) => { const name = (e as any)?.detail?.children as string | undefined; if (name) { setSelectedVariant(name); const saved = variantStates[name] ?? { sortBy: 'Name', sortDir: 'asc' as const, groupBy: 'none' as typeof groupBy, filters: {}, columns: ALL_RESOURCES_DEFAULT_COLUMNS }; setSortBy(saved.sortBy); setSortDir(saved.sortDir); setGroupBy(saved.groupBy); setFilters(saved.filters); setColumns(saved.columns); setSavedViewState(saved) } }}
            onSaveAs={(e) => { const v = (e as any)?.detail; if (v?.children) { const snap = { sortBy, sortDir, groupBy, filters, columns }; setVariants(prev => [...prev, { name: v.children, isDefault: false, labelReadOnly: false, hideDelete: false }]); setSavedViewState(snap); setVariantStates(prev => ({ ...prev, [v.children]: snap })) } }}
            onSaveManageViews={(e) => { const updated = (e as any)?.detail?.variants as Array<{ children: string; isDefault?: boolean; labelReadOnly?: boolean; hideDelete?: boolean }> | undefined; if (updated) setVariants(updated.map(v => ({ name: v.children, isDefault: v.isDefault ?? false, labelReadOnly: v.labelReadOnly ?? false, hideDelete: v.hideDelete ?? false }))) }}
          >
            {variants.map(v => (
              <VariantItem key={v.name} selected={selectedVariant === v.name} isDefault={v.isDefault} labelReadOnly={v.labelReadOnly} hideDelete={v.hideDelete}>{v.name}</VariantItem>
            ))}
          </VariantManagement>
        </ToolbarItem>
      ) }
      searchSlot={hasSelection ? undefined : (
        <ToolbarItem>
          <Input
            accessibleName="Search"
            placeholder="Search for name or description"
            value={search}
            showClearIcon
            style={{ width: '240px' }}
            onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
            icon={<Icon slot="icon" name="search" />}
          />
        </ToolbarItem>
      )}
      businessActionsSlot={hasSelection ? (
        selectionCount === 1 ? (
          <>
            <ToolbarItem><Button id="sel-open-btn-ar" design="Transparent" icon="full-screen" endIcon="slim-arrow-down" onClick={() => setSelOpenOpen(v => !v)}>Open</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="write-new">Edit in Editor</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/quickmodel">Edit in QuickModel</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="share-2" onClick={() => { const item = displayResults.find(r => selectedIds.has(r.id)); if (item) { setShareItem(item); setShareView('share') } }}>Share</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="chain-link" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setCopyLinkToast(true) }}>Copy Link</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="user-settings" onClick={() => { const item = displayResults.find(r => selectedIds.has(r.id)); if (item) { setShareItem(item); setManageFromShare(false); setShareView('manage') } }}>Manage Access</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="unfavorite">Add to Favorites</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="bell">Notifications</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="compare">Compare Revisions</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/variant">Variant Management</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/simulation">Simulate</Button></ToolbarItem>
            <ToolbarItem><Button id="sel-reporting-btn-ar" design="Transparent" icon="SAP-icons-v4/report" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="workflow-tasks">Governance</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/visible-confirmed">Read Confirmation</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/published">Publish Revision</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="source-code">Embed</Button></ToolbarItem>
            <ToolbarItem><Button id="sel-export-btn-ar" design="Transparent" icon="SAP-icons-v4/export" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/import">Import Diagram Translations</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="synchronize">Sync with SAP Cloud ALM</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="edit" onClick={() => { const item = displayResults.find(r => selectedIds.has(r.id)); if (item) { setRenamingItem(item); setRenameDialogOpen(true) } }}>Rename</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/file-move">Move to</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="copy">Copy to</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="delete">Move to Trash</Button></ToolbarItem>
          </>
        ) : (
          <>
            <ToolbarItem><Button design="Transparent" icon="unfavorite">Add to Favorites</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="compare">Compare Revisions</Button></ToolbarItem>
            <ToolbarItem><Button id="sel-reporting-btn-ar" design="Transparent" icon="SAP-icons-v4/report" endIcon="slim-arrow-down" onClick={() => setSelReportingOpen(v => !v)}>Reporting</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/published">Publish Revision</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/published-changed">Unpublish</Button></ToolbarItem>
            <ToolbarItem><Button id="sel-export-btn-ar" design="Transparent" icon="SAP-icons-v4/export" endIcon="slim-arrow-down" onClick={() => setSelExportOpen(v => !v)}>Export as</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/import">Import Diagram Translations</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/file-move">Move to</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="copy">Copy to</Button></ToolbarItem>
            <ToolbarItem><Button design="Transparent" icon="delete">Move to Trash</Button></ToolbarItem>
          </>
        )
      ) : (
        <ToolbarItem>
          <Button design="Emphasized" endIcon="slim-arrow-down">Create</Button>
        </ToolbarItem>
      )}
      sortSlot={hasSelection ? undefined : (
        <ToolbarItem>
          <Button
            id="all-resources-sort-chip"
            design="Transparent"
            icon="sort"
            tooltip={`Sort by: ${sortBy}`}
            onClick={() => {
              if (sortPopoverRef.current) {
                sortPopoverRef.current.opener = 'all-resources-sort-chip'
                sortPopoverRef.current.open = true
              }
            }}
          />
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
                  <SegmentedButtonItem icon="sort-ascending" accessibleName="Ascending" selected={sortDir === 'asc'} onClick={() => setSortDir('asc')}>Ascending</SegmentedButtonItem>
                  <SegmentedButtonItem icon="sort-descending" accessibleName="Descending" selected={sortDir === 'desc'} onClick={() => setSortDir('desc')}>Descending</SegmentedButtonItem>
                </SegmentedButton>
              </div>
              <List separators="None" selectionMode="Single" onItemClick={(e) => {
                const key = (e.detail.item as HTMLElement).dataset.sortKey
                if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
              }}>
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
      groupSlot={hasSelection ? undefined : (
        <ToolbarItem>
          <Button
            id="all-resources-group-chip"
            design="Transparent"
            icon="group-2"
            tooltip={`Group by: ${groupBy === 'none' ? 'None' : ({ changedBy: 'Changed By', createdBy: 'Created By', dateChanged: 'Date Changed', dateCreated: 'Date Created', location: 'Location', status: 'Status', type: 'Type' }[groupBy] ?? 'None')}`}
            onClick={() => {
              if (groupPopoverRef.current) {
                groupPopoverRef.current.opener = 'all-resources-group-chip'
                groupPopoverRef.current.open = true
              }
            }}
          />
          <Popover
            ref={groupPopoverRef}
            placement="Bottom"
            horizontalAlign="Start"
            hideArrow
            className="no-padding-popover"
            style={{ width: '200px' }}
            onClose={() => { if (groupPopoverRef.current) groupPopoverRef.current.open = false }}
          >
            <List separators="None" selectionMode="Single" onItemClick={(e: any) => {
              const val = (e.detail.item as HTMLElement).dataset.groupKey
              setGroupBy((val as typeof groupBy) ?? 'none')
              if (groupPopoverRef.current) groupPopoverRef.current.open = false
            }}>
              {[
                { key: 'none',        label: 'None' },
                { key: 'changedBy',   label: 'Changed By' },
                { key: 'createdBy',   label: 'Created By' },
                { key: 'dateChanged', label: 'Date Changed' },
                { key: 'dateCreated', label: 'Date Created' },
                { key: 'location',    label: 'Location' },
                { key: 'status',      label: 'Status' },
                { key: 'type',        label: 'Type' },
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
      )}
      settingsSlot={(!hasSelection && activeView === 'table') ? (
        <ToolbarItem>
          <Button design="Transparent" icon="action-settings" onClick={() => setCustomizeColumnsOpen(true)}>Columns</Button>
        </ToolbarItem>
      ) : undefined}
      filterBarToggleButton={!hasSelection ? (
        <ToolbarItem>
          <ToggleButton design="Transparent" icon="filter" pressed={filterBarOpen} onClick={() => setFilterBarOpen(v => !v)}>
            {activeFilterCount > 0 ? String(activeFilterCount) : ''}
          </ToggleButton>
        </ToolbarItem>
      ) : undefined}
      filterBarSlot={filterBarOpen ? (
        <SigFilterBar key={selectedVariant} filters={filters} onFiltersChange={setFilters} defaultFilters={{}} showManageFilters defaultVisibleFilterKeys={['type', 'dateCreated', 'dateChanged', 'status']}>
          <SigFilter filterKey="type" label="Type"><MultiSelect options={TYPE_OPTIONS} /></SigFilter>
          <SigFilter filterKey="dateCreated" label="Date Created"><DateRangePicker /></SigFilter>
          <SigFilter filterKey="dateChanged" label="Date Changed"><DateRangePicker /></SigFilter>
          <SigFilter filterKey="status" label="Status"><MultiSelect options={STATUS_OPTIONS} /></SigFilter>
          <SigFilter filterKey="attr1" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
          <SigFilter filterKey="attr2" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
          <SigFilter filterKey="attr3" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
          <SigFilter filterKey="attr4" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
          <SigFilter filterKey="attr5" label="[Attribute Name]"><MultiSelect options={[]} /></SigFilter>
        </SigFilterBar>
      ) : undefined}
    >
      {activeView === 'list' && renderListView()}
      {activeView === 'table' && renderTableView()}
    </SigTableWrapper>
  )

  if (contentOnly) {
    return (
      <>
        {tableWrapper}
        {overflowMenu}
        <Menu opener="sel-open-btn-ar" open={selOpenOpen} onClose={() => setSelOpenOpen(false)} onItemClick={() => setSelOpenOpen(false)}>
          <MenuItem text="Open Latest Revision" />
          <MenuItem text="Open Published Revision" />
        </Menu>
        <Menu opener="sel-reporting-btn-ar" open={selReportingOpen} onClose={() => setSelReportingOpen(false)} onItemClick={() => setSelReportingOpen(false)}>
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
        <Menu opener="sel-export-btn-ar" open={selExportOpen} onClose={() => setSelExportOpen(false)} onItemClick={() => setSelExportOpen(false)}>
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
        </Menu>
        <Menu opener="sel-action-btn-ar" open={selActionOpen} onClose={() => setSelActionOpen(false)} onItemClick={() => setSelActionOpen(false)}>
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
          <MenuItem text="Read Confirmation" icon="SAP-icons-v4/visible-confirmed" /><MenuItem text="Rate Process" icon="feedback" />
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
        <CustomizeColumnsDialog
          open={customizeColumnsOpen}
          columns={columns}
          onSave={(cols) => { setColumns(cols); setCustomizeColumnsOpen(false) }}
          onClose={() => setCustomizeColumnsOpen(false)}
        />
        {renameDialogOpen && renamingItem && (
          <EditFolderDialog
            open
            folderName={renamedItems[renamingItem.id] ?? renamingItem.name}
            onSave={(name) => { setRenamedItems(prev => ({ ...prev, [renamingItem.id]: name })); setRenameDialogOpen(false); setRenamingItem(null); setRenameToast(true) }}
            onClose={() => { setRenameDialogOpen(false); setRenamingItem(null) }}
          />
        )}
        {shareItem && shareView === 'share' && (
          <ShareDialog
            file={{ id: shareItem.id, name: shareItem.name, type: 'Process Model', created: shareItem.lastUpdateDate, changed: shareItem.lastUpdateDate }}
            onClose={() => setShareItem(null)}
            onManageAccess={() => { setManageFromShare(true); setShareView('manage') }}
            onInvite={(count) => setInviteToast(`${count} ${count === 1 ? 'user' : 'users'} invited`)}
          />
        )}
        {shareItem && shareView === 'manage' && (
          <ManageAccessDialog
            file={{ id: shareItem.id, name: shareItem.name, type: 'Process Model', created: shareItem.lastUpdateDate, changed: shareItem.lastUpdateDate }}
            accessLevels={accessLevels}
            onAccessLevelChange={(id, role) => setAccessLevels(prev => ({ ...prev, [id]: role }))}
            onClose={() => setShareItem(null)}
            onBack={() => setShareView('share')}
            showBackButton={manageFromShare}
          />
        )}
        <Toast open={copyLinkToast} placement="BottomCenter" onClose={() => setCopyLinkToast(false)}>
          Link copied to clipboard. Users with existing access can use the link.
        </Toast>
        <Toast open={!!inviteToast} placement="BottomCenter" onClose={() => setInviteToast(null)}>
          {inviteToast}
        </Toast>
        <Toast open={renameToast} placement="BottomCenter" onClose={() => setRenameToast(false)}>
          Item renamed
        </Toast>
        <Toast open={!!notifToast} placement="BottomCenter" onClose={() => setNotifToast(null)}>
          {notifToast}
        </Toast>
      </>
    )
  }

  const panelAsset = selectedIds.size === 1
    ? (displayResults.find(r => selectedIds.has(r.id)) ?? null)
    : null

  return (
    <>
    <SplitterLayout options={{ resetOnSizeChange: true, resetOnChildrenChange: true }} style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }}>
      <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <DynamicPage style={{ height: '100%', flex: 1 }} hidePinButton titleArea={
          <DynamicPageTitle className="all-resources-title">
            <Title slot="heading" level="H3">All Resources</Title>
            <Toolbar slot="actionsBar" design="Transparent">
              <ToolbarSpacer />
              <ToolbarButton icon="action-settings" design="Transparent" tooltip="Settings" />
              <ToolbarSeparator />
              <ToggleButton
                icon="SAP-icons-v4/panel-right"
                design="Transparent"
                pressed={infoPanelOpen}
                tooltip={infoPanelOpen ? 'Close Info Panel' : 'Open Info Panel'}
                onClick={() => setInfoPanelOpen(v => !v)}
              />
            </Toolbar>
          </DynamicPageTitle>
        }>
          <>
            {tableWrapper}

          {overflowMenu}
          <Menu opener="sel-reporting-btn-ar" open={selReportingOpen} onClose={() => setSelReportingOpen(false)} onItemClick={() => setSelReportingOpen(false)}>
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
          <Menu opener="sel-export-btn-ar" open={selExportOpen} onClose={() => setSelExportOpen(false)} onItemClick={() => setSelExportOpen(false)}>
            <MenuItem text="SAP Signavio Archive (SGX)" />
            <MenuItem text="BPMN 2.0 XML" />
            <MenuItem text="XML" /><MenuItem text="PNG" />
            <MenuItem text="DMN 1.2 XML" /><MenuItem text="SVG" /><MenuItem text="PDF" /><MenuItem text="Drools" />
            <MenuSeparator />
            <MenuItem text="Export Diagram Translations" />
          </Menu>
          <CustomizeColumnsDialog
            open={customizeColumnsOpen}
            columns={columns}
            onSave={(cols) => { setColumns(cols); setCustomizeColumnsOpen(false) }}
            onClose={() => setCustomizeColumnsOpen(false)}
          />
          {renameDialogOpen && renamingItem && (
            <EditFolderDialog
              open
              folderName={renamedItems[renamingItem.id] ?? renamingItem.name}
              onSave={(name) => { setRenamedItems(prev => ({ ...prev, [renamingItem.id]: name })); setRenameDialogOpen(false); setRenamingItem(null); setRenameToast(true) }}
              onClose={() => { setRenameDialogOpen(false); setRenamingItem(null) }}
            />
          )}
          {shareItem && shareView === 'share' && (
            <ShareDialog
              file={{ id: shareItem.id, name: shareItem.name, type: 'Process Model', created: shareItem.lastUpdateDate, changed: shareItem.lastUpdateDate }}
              onClose={() => setShareItem(null)}
              onManageAccess={() => { setManageFromShare(true); setShareView('manage') }}
              onInvite={(count) => setInviteToast(`${count} ${count === 1 ? 'user' : 'users'} invited`)}
            />
          )}
          {shareItem && shareView === 'manage' && (
            <ManageAccessDialog
              file={{ id: shareItem.id, name: shareItem.name, type: 'Process Model', created: shareItem.lastUpdateDate, changed: shareItem.lastUpdateDate }}
              accessLevels={accessLevels}
              onAccessLevelChange={(id, role) => setAccessLevels(prev => ({ ...prev, [id]: role }))}
              onClose={() => setShareItem(null)}
              onBack={() => setShareView('share')}
              showBackButton={manageFromShare}
            />
          )}
          </>
      </DynamicPage>
      </SplitterElement>

      {infoPanelOpen && (
        <SplitterElement size="400px" minSize={400} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AssetInfoPanel
            key={panelAsset?.id ?? '__none__'}
            selectedAsset={null}
            selectedDictEntry={null}
            dictCategories={[]}
            externalSelectedAsset={panelAsset ? {
              id: panelAsset.id,
              name: panelAsset.name,
              objectType: panelAsset.objectType,
              typeName: panelAsset.typeName,
              description: panelAsset.description,
              folder: panelAsset.folder,
              chips: panelAsset.chips,
              lastUpdateBy: panelAsset.lastUpdateBy,
              lastUpdateDate: panelAsset.lastUpdateDate,
              lastPublished: panelAsset.lastPublished,
              version: panelAsset.version,
              canEdit: panelAsset.canEdit,
              owner: panelAsset.owner,
              tags: panelAsset.tags,
              extensions: panelAsset.extensions,
            } : null}
            pageTitle="All Resources"
            selectionCount={selectedIds.size}
            zoomViewport={null}
            subscriptions={{}}
            onSubscriptionChange={() => {}}
            onThumbnailEnter={() => {}}
            onThumbnailLeave={() => {}}
            onThumbnailMove={() => {}}
            onClose={() => setInfoPanelOpen(false)}
            onOpenModelDetail={() => {}}
            isFavorite={!!(panelAsset && favoriteIds.has(panelAsset.id))}
            onToggleFavorite={() => { if (panelAsset) toggleFileFavorite(panelAsset.id) }}
          />
        </SplitterElement>
      )}
    </SplitterLayout>
    <Toast open={copyLinkToast} placement="BottomCenter" onClose={() => setCopyLinkToast(false)}>
      Link copied to clipboard. Users with existing access can use the link.
    </Toast>
    <Toast open={!!inviteToast} placement="BottomCenter" onClose={() => setInviteToast(null)}>
      {inviteToast}
    </Toast>
    <Toast open={renameToast} placement="BottomCenter" onClose={() => setRenameToast(false)}>
      Item renamed
    </Toast>
    <Toast open={!!notifToast} placement="BottomCenter" onClose={() => setNotifToast(null)}>
      {notifToast}
    </Toast>
    </>
  )
}
