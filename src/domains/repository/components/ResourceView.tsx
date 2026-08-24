import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DynamicPage, DynamicPageTitle, Title, Toolbar, ToolbarButton, ToolbarItem, ToolbarSpacer,
  Button, ToggleButton, Menu, MenuItem, MenuSeparator,
  AnalyticalTable, CheckBox, Text, VariantManagement, VariantItem, Input, Icon, List,
  SegmentedButton, SegmentedButtonItem,
  type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, SigDomainObject, SigChipV2, DatePicker } from '@signavio/sap-signavio-uixtension'
import { type ResultItem, TYPE_OPTIONS, STATUS_OPTIONS, enrichChips } from '../../../data/allResourcesMockData'
import { AssetListItem } from './AssetListItem'
import type { SelectedAssetInfo } from '../AllResources'
import CustomizeColumnsDialog from '../Repository/dialogs/CustomizeColumnsDialog'

type ViewType = 'table' | 'list' | 'grid'
type ViewVariant = { name: string; isDefault?: boolean; global?: boolean; author?: string; labelReadOnly?: boolean; hideDelete?: boolean }

type ColumnDef = { id: string; label: string; required: boolean; visible: boolean }

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'name',           label: 'Name',           required: true,  visible: true  },
  { id: 'typeName',       label: 'Type',           required: false, visible: true  },
  { id: 'createdDate',    label: 'Created',        required: false, visible: true  },
  { id: 'lastUpdateDate', label: 'Changed',        required: false, visible: true  },
  { id: 'chips',          label: 'Status',         required: false, visible: true  },
]

const INITIAL_VARIANTS: ViewVariant[] = [
  { name: 'Standard', isDefault: true, labelReadOnly: true, hideDelete: true },
]

export type ResourceViewProps = {
  title: string
  items: ResultItem[]
  showFolder?: boolean
  onAssetClick?: (asset: SelectedAssetInfo) => void
  /** Skip the DynamicPage wrapper; render only the table/list content. Used when embedded inside another page shell. */
  contentOnly?: boolean
  /** When true, only show items whose status chip is Published. */
  publishedOnly?: boolean
  /** Called when user clicks Share in the selection toolbar. Receives the first selected item. */
  onShareSelected?: (item: ResultItem) => void
  /** Replaces the default Create button in the toolbar. */
  createButtonOverride?: React.ReactNode
  /** Called when the default Create button is clicked (no-op when createButtonOverride is set). */
  onCreateClick?: () => void
  /** Replaces the default selection action buttons (Move to, Copy to, Delete, Share). Cancel is always appended. */
  selectionActionsOverride?: React.ReactNode
  /** Filter keys to hide from the filter bar (e.g. ['type', 'location']). */
  hideFilters?: string[]
  /** Override the status filter options. Defaults to STATUS_OPTIONS from SearchResultsPanel. */
  statusOptions?: { value: string; label: string }[]
  /** Optional avatar/icon rendered next to the page title in the DynamicPageTitle header. */
  headerAvatar?: React.ReactNode
}

export default function ResourceView({ title, items, showFolder = true, onAssetClick, contentOnly = false, publishedOnly = false, onShareSelected: _onShareSelected, createButtonOverride, onCreateClick, selectionActionsOverride, hideFilters = [], statusOptions = STATUS_OPTIONS, headerAvatar }: ResourceViewProps) {
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [filterBarOpen, setFilterBarOpen] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('list')
  const [sortBy, _setSortBy] = useState('Name')
  // sortPopoverRef removed
  // groupByPopoverRef removed
  const [variants, setVariants] = useState<ViewVariant[]>(INITIAL_VARIANTS)
  const [selectedVariant, setSelectedVariant] = useState('Standard')
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  // navigatedId removed
  const [, setNavigatedId] = useState<string | null>(null)
  const [hoveredGridId, setHoveredGridId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS)
  const [customizeColumnsOpen, setCustomizeColumnsOpen] = useState(false)

  const visibleItems = publishedOnly
    ? items.filter(item => item.chips.some(c => c.value === 'Published'))
    : items

  const selectedStatuses = (filters['status'] as string[] | undefined) ?? []

  const filteredItems = (() => {
    let result = visibleItems
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.typeName?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.folder?.toLowerCase().includes(q)
      )
    }
    if (selectedStatuses.length > 0) {
      result = result.filter(item =>
        item.chips.some(c => selectedStatuses.includes(c.value.toLowerCase().replace(/\s+/g, '-')))
      )
    }
    return result
  })()

  const activeFilterCount = Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length
  const hasSelection = selectedIds.size > 0
  const selectionCount = selectedIds.size

  const toggleSelect = (id: string, mode: 'row' | 'checkbox') => {
    setSelectedIds(prev => {
      if (mode === 'row') return new Set([id])
      if (prev.size === 0) return new Set([id])
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const renderListView = () => {
    const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id))
    const someSelected = !allSelected && filteredItems.some(item => selectedIds.has(item.id))
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: 'var(--sapList_Background)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
          <CheckBox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={() => { if (allSelected) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredItems.map(i => i.id))) }}
            accessibleName="Select all"
          />
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>Select All</Text>
        </div>
        <List separators="Inner">
          {filteredItems.map((item, i) => (
            <AssetListItem
              key={item.id}
              id={item.id}
              name={item.name}
              objectType={item.objectType}
              typeName={item.typeName}
              description={item.description}
              created={item.lastUpdateDate}
              changed={item.lastUpdateDate}
              folder={showFolder ? item.folder : undefined}
              chips={enrichChips(item) as any}
              ownerName={(item.typeName === 'Objective' || item.typeName === 'Initiative' || item.typeName === 'Dashboard') ? item.lastUpdateBy : undefined}
              isSelected={selectedIds.has(item.id)}
              onSelect={() => toggleSelect(item.id, 'checkbox')}
              overflowId={`rv-overflow-${item.id}`}
              onOverflow={() => { if (!selectedIds.has(item.id)) toggleSelect(item.id, 'row'); setOpenOverflowId(item.id) }}
              onClick={() => {
                toggleSelect(item.id, 'row')
                setNavigatedId(item.id)
                onAssetClick?.({ id: item.id, name: item.name, objectType: item.objectType, typeName: item.typeName, description: item.description, richTextDescription: item.richTextDescription, folder: item.folder, version: item.version, lastUpdateBy: item.lastUpdateBy, lastUpdateDate: item.lastUpdateDate, lastPublished: item.lastPublished, tags: item.tags, chips: item.chips, owner: item.owner, canEdit: item.canEdit, extensions: item.extensions })
              }}
              isLast={i === filteredItems.length - 1}
            />
          ))}
        </List>
      </div>
    )
  }

  const renderTableView = () => {
    const visibleCols = columns.filter(c => c.visible)
    const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id))
    const someSelected = !allSelected && filteredItems.some(item => selectedIds.has(item.id))

    const checkboxCol: AnalyticalTableColumnDefinition = {
      id: '__select',
      Header: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckBox checked={allSelected} indeterminate={someSelected} onChange={() => { if (allSelected) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredItems.map(i => i.id))) }} accessibleName="Select all" />
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

    const allDataCols: Record<string, AnalyticalTableColumnDefinition> = {
      name: {
        id: 'name', accessor: 'name', Header: 'Name', minWidth: 300, width: 300,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const item = row.original as ResultItem
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 6px' }}>
              <SigDomainObject size="XXS" object={item.objectType as never} />
              <Text className="table-asset-name" style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', pointerEvents: 'auto' }}>{item.name}</Text>
            </div>
          )
        },
      },
      typeName: {
        id: 'typeName', accessor: 'typeName', Header: 'Type', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).typeName}</Text>,
      },
      folder: {
        id: 'folder', accessor: 'folder', Header: 'Location', minWidth: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(row.original as ResultItem).folder ?? ''}</Text>,
      },
      createdDate: {
        id: 'createdDate', accessor: 'createdDate', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Created</div>, minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as ResultItem).createdDate ?? ''}</Text></div>,
      },
      lastUpdateDate: {
        id: 'lastUpdateDate', accessor: 'lastUpdateDate', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Changed</div>, minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as ResultItem).lastUpdateDate}</Text></div>,
      },
      chips: {
        id: 'chips', accessor: 'chips', Header: 'Status', minWidth: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: ({ row }: any) => {
          const chips = (row.original as ResultItem).chips
          return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {chips.map((chip, i) => {
                const v = chip.value
                const icon = v === 'Published' ? 'SAP-icons-v4/published' : v === 'Draft' ? 'write-new-document' : v === 'On Track' ? 'trend-up' : v === 'Modified' ? 'SAP-icons-v4/published-changed' : v === 'At Risk' ? 'message-warning' : v === 'Deprecated' ? 'cancel' : 'SAP-icons-v4/published-changed'
                const design = v === 'Published' ? 'indication5' : v === 'Draft' ? 'indication10' : v === 'On Track' ? 'indication4' : v === 'Modified' ? 'indication7' : v === 'At Risk' ? 'indication2' : v === 'Deprecated' ? 'indication2' : 'indication7'
                return <SigChipV2 key={i} value={v} leadingIcon={icon} design={design as any} condensed />
              })}
            </div>
          )
        },
      },
    }

    const actionsCol: AnalyticalTableColumnDefinition = {
      id: '__actions', Header: '', accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Cell: ({ row }: any) => (
        <Button
          id={`rv-overflow-${(row.original as ResultItem).id}`}
          icon="overflow" design="Transparent"
          tooltip="More options"
          onClick={(e) => { e.stopPropagation(); const id = (row.original as ResultItem).id; if (!selectedIds.has(id)) toggleSelect(id, 'row'); setOpenOverflowId(id) }}
        />
      ),
    }

    const cols: AnalyticalTableColumnDefinition[] = [
      checkboxCol,
      ...visibleCols.map(c => allDataCols[c.id]).filter(Boolean),
      actionsCol,
    ]

    return (
      <AnalyticalTable
        data={filteredItems}
        columns={cols}
        selectionMode="None"
        tableHooks={[
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (hooks: any) => {
            hooks.getRowProps.push((_props: any, { row }: any) => {
              const isSelected = selectedIds.has((row.original as ResultItem).id)
              return [_props, isSelected ? { 'data-is-selected': '' } : {}]
            })
          }
        ]}
        onRowClick={(e) => {
          // @ts-ignore
          const item = e?.detail?.row?.original as ResultItem | undefined
          if (!item) return
          toggleSelect(item.id, 'row')
          setNavigatedId(item.id)
          onAssetClick?.({ id: item.id, name: item.name, objectType: item.objectType, typeName: item.typeName, description: item.description, richTextDescription: item.richTextDescription, folder: item.folder, version: item.version, lastUpdateBy: item.lastUpdateBy, lastUpdateDate: item.lastUpdateDate, chips: item.chips, owner: item.owner, canEdit: item.canEdit, extensions: item.extensions })
        }}
        visibleRows={filteredItems.length}
        minRows={filteredItems.length}
        style={{ width: '100%' }}
        className="ui5-content-density-compact"
      />
    )
  }

  const renderGridView = () => {
    const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id))
    const someSelected = !allSelected && filteredItems.some(item => selectedIds.has(item.id))

    const handleSelectAll = () => {
      if (allSelected) {
        setSelectedIds(new Set())
      } else {
        setSelectedIds(new Set(filteredItems.map(item => item.id)))
      }
    }

    return (
      <div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 146px)', columnGap: '3px', rowGap: '8px', padding: '0.25rem 0 1rem' }}>
          {filteredItems.map(item => {
            const isSelected = selectedIds.has(item.id)
            const isHovered = hoveredGridId === item.id
            const showHoverControls = isHovered && !isSelected

            let bg = 'transparent'
            if (isSelected) bg = '#EBF8FF'
            else if (isHovered) bg = '#EAECEE'

            const border = isSelected ? '1px solid #0070F2' : '1px solid transparent'

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredGridId(item.id)}
                onMouseLeave={() => setHoveredGridId(null)}
                style={{
                  width: '146px', height: '108px', position: 'relative', borderRadius: '6px',
                  border, background: bg, boxSizing: 'border-box', cursor: 'pointer',
                } as React.CSSProperties}
              >
                <div style={{
                  position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)',
                  width: '134px', display: 'flex', justifyContent: 'center',
                  zIndex: 1, pointerEvents: 'none',
                }}>
                  <SigDomainObject size="S" object={item.objectType as never} />
                </div>
                <div
                  style={{ position: 'absolute', inset: 0, zIndex: 2 }}
                  onClick={() => {
                    toggleSelect(item.id, 'row')
                    setNavigatedId(item.id)
                    onAssetClick?.({ id: item.id, name: item.name, objectType: item.objectType, typeName: item.typeName, description: item.description, richTextDescription: item.richTextDescription, folder: item.folder, version: item.version, lastUpdateBy: item.lastUpdateBy, lastUpdateDate: item.lastUpdateDate, lastPublished: item.lastPublished, tags: item.tags, chips: item.chips, owner: item.owner, canEdit: item.canEdit, extensions: item.extensions })
                  }}
                />
                <div style={{
                  position: 'absolute', top: '62px', left: '6px', right: '6px',
                  zIndex: 3, textAlign: 'center',
                  fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
                  fontWeight: '600', color: 'var(--sapTextColor)',
                  textDecoration: isHovered ? 'underline' : 'none',
                  cursor: 'pointer', overflow: 'hidden', lineHeight: 'normal', wordBreak: 'break-word',
                } as React.CSSProperties}>
                  {item.name}
                </div>
                <div style={{
                  position: 'absolute', top: '97px', left: '50%', transform: 'translate(-50%, -50%)',
                  fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSmallSize)',
                  color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', lineHeight: 'normal', zIndex: 3, pointerEvents: 'none',
                }}>
                  {item.typeName}
                </div>
                {(isSelected || showHoverControls) && (
                  <div
                    style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CheckBox
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id, 'checkbox')}
                      accessibleName={`Select ${item.name}`}
                    />
                  </div>
                )}
                {(showHoverControls || isSelected || openOverflowId === item.id) && (
                  <Button
                    id={`rv-overflow-${item.id}`}
                    design="Transparent"
                    icon="overflow"
                    style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 4, width: '24px', height: '24px', padding: 0, '--ui5-button-border-radius': '4px' } as React.CSSProperties}
                    onClick={(e) => { e.stopPropagation(); if (!selectedIds.has(item.id)) toggleSelect(item.id, 'row'); setOpenOverflowId(item.id) }}
                    tooltip="More options"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const content = (
    <SigTableWrapper
          titleSlot={
            <ToolbarItem overflowPriority="NeverOverflow">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {hasSelection ? (
                  <>
                    <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Selected ({selectionCount} of {items.length})</Title>
                    <Button design="Transparent" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
                  </>
                ) : (
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                    All ({filteredItems.length}{searchQuery.trim() ? ` of ${visibleItems.length}` : ''})
                  </Title>
                )}
              </div>
            </ToolbarItem>
          }
          variantManagementSlot={hasSelection ? undefined : (
            <ToolbarItem>
              <VariantManagement
                titleText="My Views" closeOnItemSelect size="H5" level="H5"
                onSelect={(e) => { const name = (e as any)?.detail?.selectedVariant?.children as string | undefined; if (name) setSelectedVariant(name) }}
                onSaveAs={(e) => { const v = (e as any)?.detail?.selectedVariant; if (v) setVariants(prev => [...prev, { name: v.children, author: 'Sebastian Kaim', global: !!v.global }]) }}
                onSaveManageViews={(e) => { const updated = (e as any)?.detail?.variants as Array<{ children: string; isDefault?: boolean; global?: boolean; author?: string; labelReadOnly?: boolean; hideDelete?: boolean }> | undefined; if (updated) setVariants(updated.map(v => ({ name: v.children, isDefault: v.isDefault, global: v.global, author: v.author, labelReadOnly: v.labelReadOnly, hideDelete: v.hideDelete }))) }}
              >
                {variants.map(v => (
                  <VariantItem key={v.name} selected={selectedVariant === v.name} isDefault={v.isDefault} global={v.global} author={v.author} labelReadOnly={v.labelReadOnly} hideDelete={v.hideDelete}>{v.name}</VariantItem>
                ))}
              </VariantManagement>
            </ToolbarItem>
          )}
          searchSlot={hasSelection ? undefined : (
            <ToolbarItem>
              <Input
                placeholder="Search"
                icon={<Icon name="search" slot="icon" />}
                style={{ width: '200px' }}
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as unknown as HTMLInputElement).value)}
              />
            </ToolbarItem>
          )}
          businessActionsSlot={hasSelection ? (
            <>
              {selectionActionsOverride ?? (
                selectionCount === 1 ? (
                  <>
                    <ToolbarItem><Button design="Transparent" icon="unfavorite">Add to Favorites</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/published">Publish Revision</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/file-move">Move to</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="copy">Copy to</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="delete">Move to Trash</Button></ToolbarItem>
                  </>
                ) : (
                  <>
                    <ToolbarItem><Button design="Transparent" icon="unfavorite">Add to Favorites</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="SAP-icons-v4/file-move">Move to</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="copy">Copy to</Button></ToolbarItem>
                    <ToolbarItem><Button design="Transparent" icon="delete">Move to Trash</Button></ToolbarItem>
                  </>
                )
              )}
              {!selectionActionsOverride && (
                <ToolbarItem>
                  <Button design="Transparent" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
                </ToolbarItem>
              )}
            </>
          ) : (
            <ToolbarItem>
              {createButtonOverride ?? <Button design="Emphasized" onClick={onCreateClick}>Create</Button>}
            </ToolbarItem>
          )}
          sortSlot={hasSelection ? undefined : (
            <ToolbarItem>
              <Button design="Transparent" icon="sort" tooltip={`Sort by ${sortBy}`} />
            </ToolbarItem>
          )}
          groupSlot={hasSelection ? undefined : (
            <ToolbarItem>
              <Button design="Transparent" icon="group-2" tooltip="Group By" />
            </ToolbarItem>
          )}
          settingsSlot={(!hasSelection && activeView === 'table') ? (
            <ToolbarItem>
              <Button design="Transparent" icon="action-settings" onClick={() => setCustomizeColumnsOpen(true)}>Columns</Button>
            </ToolbarItem>
          ) : undefined}
          exportActionsSlot={hasSelection ? undefined : (
            <>
              <ToolbarItem overflowPriority="NeverOverflow">
                <SegmentedButton>
                  <SegmentedButtonItem icon="table-view" accessibleName="Table" selected={activeView === 'table'} onClick={() => setActiveView('table')} />
                  <SegmentedButtonItem icon="list" accessibleName="List" selected={activeView === 'list'} onClick={() => setActiveView('list')} />
                  <SegmentedButtonItem icon="grid" accessibleName="Grid" selected={activeView === 'grid'} onClick={() => setActiveView('grid')} />
                </SegmentedButton>
              </ToolbarItem>
            </>
          )}
          filterBarToggleButton={hasSelection ? undefined : (
            <ToolbarItem>
              <ToggleButton design="Transparent" icon="filter" pressed={filterBarOpen} onClick={() => setFilterBarOpen(v => !v)}>
                {activeFilterCount > 0 ? String(activeFilterCount) : ''}
              </ToggleButton>
            </ToolbarItem>
          )}
          filterBarSlot={(!hasSelection && filterBarOpen) ? (
            <SigFilterBar key={selectedVariant} filters={filters} onFiltersChange={setFilters} defaultFilters={{}} showManageFilters>
              {!hideFilters.includes('type') && (
                <SigFilter filterKey="type" label="Type">
                  <MultiSelect options={TYPE_OPTIONS} />
                </SigFilter>
              )}
              <SigFilter filterKey="dateCreated" label="Date Created"><DatePicker /></SigFilter>
              <SigFilter filterKey="dateChanged" label="Date Changed"><DatePicker /></SigFilter>
              <SigFilter filterKey="status" label="Status">
                <MultiSelect options={statusOptions} />
              </SigFilter>
            </SigFilterBar>
          ) : undefined}
        >
          {activeView === 'list' && renderListView()}
          {activeView === 'table' && renderTableView()}
          {activeView === 'grid' && renderGridView()}
        </SigTableWrapper>
  )

  const dialogs = (
    <>
      {openOverflowId && (() => {
        const item = filteredItems.find(r => r.id === openOverflowId)
        if (!item) return null
        return createPortal(
          <Menu opener={`rv-overflow-${openOverflowId}`} open onClose={() => setOpenOverflowId(null)}>
            <MenuItem text="Open Latest Draft" />
            <MenuSeparator />
            <MenuItem text="Open in QuickModel" />
            <MenuSeparator />
            <MenuItem text="Share" />
            <MenuItem text="Add to Favorites" />
            <MenuItem text="Copy To" />
            <MenuSeparator />
            <MenuItem text="Rename" />
            <MenuItem text="Move" />
            <MenuItem text="Delete" />
          </Menu>,
          document.body
        )
      })()}
      <CustomizeColumnsDialog
        open={customizeColumnsOpen}
        columns={columns}
        onSave={(cols) => { setColumns(cols); setCustomizeColumnsOpen(false) }}
        onClose={() => setCustomizeColumnsOpen(false)}
        defaultColumns={DEFAULT_COLUMNS}
      />
    </>
  )

  if (contentOnly) {
    return <>{content}{dialogs}</>
  }

  return (
    <DynamicPage style={{ height: '100%', flex: 1 }} hidePinButton>
      <DynamicPageTitle slot="titleArea">
        <Title slot="heading" level="H3">{title}</Title>
        <Toolbar slot="actionsBar" design="Transparent">
          {headerAvatar && <ToolbarItem style={{ marginRight: '4px' }}>{headerAvatar}</ToolbarItem>}
          <ToolbarSpacer />
          <ToolbarButton icon="action-settings" design="Transparent" tooltip="Settings" />
        </Toolbar>
      </DynamicPageTitle>

      {content}
      {dialogs}
    </DynamicPage>
  )
}
