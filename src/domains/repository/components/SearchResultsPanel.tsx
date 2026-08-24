import { useState } from 'react'
import type React from 'react'
import { Button, ToolbarItem, Title, Menu, MenuItem, List, ListItemStandard, FlexBox, Panel, Text, Popover, IllustratedMessage, Bar } from '@ui5/webcomponents-react'
import { SigFilterBar, SigFilter, MultiSelect, SingleSelect, StringSelect, DatePicker, SigTableWrapper, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { SearchAssetListItem } from './SearchAssetListItem'
import { USERS } from '../../../data/users'
import { type SelectedAssetInfo } from '../AllResources'
import type { ProcessAtomExtension, ProcessAtomOwner } from '../Repository/ProcessAtomInfoPanel'
import { ALL_MOCK_RESULTS } from '../../../data/search'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DomainObjects = any
type ColorDesigns = 'none' | 'error' | 'information' | 'positive' | 'success' | 'warning' | 'negative'
type Chip = { value: string; design: ColorDesigns }

export type ResultItem = {
  id: string
  name: string
  objectType: DomainObjects
  typeName: string
  description?: string
  richTextDescription?: string
  lastUpdateBy: string
  lastUpdateDate: string
  createdDate?: string
  lastPublished?: string
  version?: string
  folder?: string
  comments?: number
  insights?: number
  value?: string
  isFavorite?: boolean
  canEdit?: boolean
  progress?: string
  endDate?: string
  owner?: ProcessAtomOwner
  tags?: string[]
  extensions?: ProcessAtomExtension[]
  chips: Chip[]
}

export const RESULTS = ALL_MOCK_RESULTS

export function enrichChips(item: ResultItem) {
  return item.chips.map(c => ({ ...c, label: 'Status:' }))
}

const USER_OPTIONS = USERS.map(u => ({ value: u.id, label: u.name }))

export const TYPE_OPTIONS = [
  { value: 'bpmn', label: 'BPMN' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'journey', label: 'Journey Model' },
  { value: 'value-chain', label: 'Value Chain' },
  { value: 'objective', label: 'Objective' },
]

export const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'on-track', label: 'On Track' },
  { value: 'modified', label: 'Modified' },
  { value: 'at-risk', label: 'At Risk' },
]

export function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--sapContent_SearchHighlightColor, #dafdf5)', padding: 0, fontWeight: 'inherit', color: 'inherit' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// Keep ResultRow exported for any consumers that render it directly with a query prop
export function ResultRow({ item, isLast, isNavigated, onAssetClick }: { item: ResultItem; query: string; isLast: boolean; isNavigated?: boolean; onOverflow?: () => void; onAssetClick?: (asset: SelectedAssetInfo) => void }) {
  return (
    <SearchAssetListItem
      id={item.id}
      name={item.name}
      objectType={item.objectType}
      typeName={item.typeName}
      description={item.description}
      folder={item.folder}
      chips={item.chips}
      isNavigated={isNavigated}
      onClick={() => {
        onAssetClick?.({ id: item.id, name: item.name, objectType: item.objectType, typeName: item.typeName, description: item.description, folder: item.folder, version: item.version, lastUpdateBy: item.lastUpdateBy, lastUpdateDate: item.lastUpdateDate, chips: item.chips })
      }}
      isLast={isLast}
    />
  )
}

export type SavedSearch = { id: string; name: string; filterCount?: number; typeName?: string }

export function SavedSearchesChip({ savedSearches, activeSearchName, onSave, onRemove, onSelect }: {
  savedSearches: SavedSearch[]
  activeSearchName?: string
  onSave: () => void
  onRemove: (id: string) => void
  onSelect: (s: SavedSearch) => void
}) {
  const [open, setOpen] = useState(false)
  const chipId = 'saved-searches-chip'

  return (
    <>
      <SigChipV2
        id={chipId}
        value={activeSearchName ?? 'Saved Searches'}
        label={activeSearchName ? 'Saved Search:' : undefined}
        design="none"
        selected={!!activeSearchName}
        leadingIcon={activeSearchName ? 'bookmark' : 'bookmark-2'}
        trailingIcon="slim-arrow-down"
        onClick={() => setOpen(o => !o)}
      />
      <Popover
        opener={chipId}
        open={open}
        onClose={() => setOpen(false)}
        placement="Bottom"
        hideArrow
        horizontalAlign="End"
        style={{ width: '320px' }}
        className="no-padding-popover"
      >
        {savedSearches.length === 0
          ? (
            <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
              <IllustratedMessage
                name="NoFilterResults"
                titleText="No saved searches yet"
                subtitleText="Save your current search — including filters and view settings — to quickly pick up where you left off."
              />
              <Button design="Emphasized" style={{ marginTop: '1rem' }} onClick={() => { onSave(); setOpen(false) }}>
                Save this Search
              </Button>
            </div>
          )
          : (
            <>
              <List onItemClick={e => {
                const s = savedSearches.find(s => s.id === (e.detail.item as HTMLElement).id)
                if (s) { onSelect(s); setOpen(false) }
              }}>
                {savedSearches.map(s => (
                  <ListItemStandard
                    key={s.id}
                    id={s.id}
                    selected={s.name === activeSearchName}
                    description={[
                      s.typeName && s.typeName !== 'All Results' ? s.typeName : undefined,
                      s.filterCount ? `${s.filterCount} filter${s.filterCount === 1 ? '' : 's'} selected` : undefined,
                    ].filter(Boolean).join(' · ') || undefined}
                  >
                    <FlexBox alignItems="Center" justifyContent="SpaceBetween" style={{ width: '100%' }}>
                      <Text>{s.name}</Text>
                      <Button
                        icon="decline"
                        design="Transparent"
                        onClick={(e: any) => { e.stopPropagation(); onRemove(s.id) }}
                      />
                    </FlexBox>
                  </ListItemStandard>
                ))}
              </List>
              <Bar design="Footer">
                <Button slot="endContent" design="Transparent" onClick={() => { onSave(); setOpen(false) }}>
                  Save this Search
                </Button>
              </Bar>
            </>
          )
        }
      </Popover>
    </>
  )
}


const SOURCE_SYSTEMS = [
  { id: 's4hana-prod', label: 'S/4HANA Cloud Public Edition' },
  { id: 's4hana-dev', label: 'S/4HANA Cloud (Dev)' },
  { id: 'ariba', label: 'SAP Ariba' },
  { id: 'sf', label: 'SAP SuccessFactors' },
  { id: 'btp', label: 'SAP BTP' },
]

export function SourceSystemChip({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(SOURCE_SYSTEMS[0])
  const chipId = `source-system-chip-${id}`
  return (
    <>
      <SigChipV2
        label="Source System:"
        value={selected.label}
        design="none"
        leadingIcon="database"
        trailingIcon="slim-arrow-down"
        id={chipId}
        onClick={() => setOpen(o => !o)}
      />
      <Popover
        opener={chipId}
        placement="Bottom"
        open={open}
        hideArrow
        horizontalAlign='Start'
        onClose={() => setOpen(false)}
        className="no-padding-popover"
      >
        <List onItemClick={e => {
          const sys = SOURCE_SYSTEMS.find(s => s.id === (e.detail.item as HTMLElement).id)
          if (sys) { setSelected(sys); setOpen(false) }
        }}>
          {SOURCE_SYSTEMS.map(sys => (
            <ListItemStandard key={sys.id} id={sys.id} selected={selected.id === sys.id}>
              {sys.label}
            </ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}

export function SapDefinedChip({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const chipId = `sap-defined-chip-${id}`
  return (
    <>
      <SigChipV2
        value="SAP-Defined"
        design="information"
        leadingIcon="verified"
        trailingIcon="slim-arrow-down"
        id={chipId}
        onClick={() => setOpen(o => !o)}
      />
      <Popover
        opener={chipId}
        headerText="SAP-Defined Business Content"
        placement="Bottom"
        open={open}
        hideArrow
        onClose={() => setOpen(false)}
        style={{ width: '260px' }}
      >
        <Text>This feature is based on SAP-defined business content, which is the standardized, out-of-the-box content defined and delivered by SAP that's ready for immediate use.</Text>
      </Popover>
    </>
  )
}

const TYPE_GROUPS: { label: string; navLabel: string; objectType: string; typeNames: string[] }[] = [
  { label: 'Process Models',              navLabel: 'Diagrams',                  objectType: 'Process Model',             typeNames: ['BPMN', 'Value Chain'] },
  { label: 'Journey Models',              navLabel: 'Journey Models',            objectType: 'Customer Journey',          typeNames: ['Journey Model'] },
  { label: 'Dashboards',                  navLabel: 'Dashboards',                objectType: 'Dashboard',                 typeNames: ['Dashboard'] },
  { label: 'Initiatives',                 navLabel: 'Initiatives',               objectType: 'Initiative',                typeNames: ['Initiative'] },
  { label: 'Objectives',                  navLabel: 'Objectives',                objectType: 'Business Goal',             typeNames: ['Objective'] },
  { label: 'Dictionary Entries',          navLabel: 'Dictionary Entries',        objectType: 'Dictionary Entry',          typeNames: ['Dictionary Entry'] },
  { label: 'Files',                       navLabel: 'Files',                     objectType: 'File',                      typeNames: ['File'] },
  { label: 'Folders',                     navLabel: 'Folders',                   objectType: 'Folder',                    typeNames: ['Folder'] },
  { label: 'Workflows',                   navLabel: 'Workflows',                 objectType: 'Workflow',                  typeNames: ['Workflow'] },
  { label: 'Cases',                       navLabel: 'Cases',                     objectType: 'Case',                      typeNames: ['Case'] },
  { label: 'Tasks',                       navLabel: 'Tasks',                     objectType: 'Task',                      typeNames: ['Task'] },
  { label: 'Reports',                     navLabel: 'Reports',                   objectType: 'Report',                    typeNames: ['Report'] },
  { label: 'Investigations',              navLabel: 'Investigations',            objectType: 'Investigation',             typeNames: ['Investigation'] },
  { label: 'Analysis Configurations',     navLabel: 'Analysis Configurations',   objectType: 'Analysis Configuration',    typeNames: ['Analysis Configuration'] },
  { label: 'Customizable Dashboards',     navLabel: 'Customizable Dashboards',   objectType: 'Customizable Dashboard',    typeNames: ['Customizable Dashboard'] },
  { label: 'Accelerators',               navLabel: 'Accelerators',              objectType: 'Accelerator',               typeNames: ['Accelerator'] },
  { label: 'Correction Recommendations', navLabel: 'Correction Recommendations', objectType: 'Correction Recommendation', typeNames: ['Correction Recommendation'] },
  { label: 'Improvement Opportunities',  navLabel: 'Improvement Opportunities',  objectType: 'Improvement Opportunity',   typeNames: ['Improvement Opportunity'] },
  { label: 'Innovation Recommendations', navLabel: 'Innovation Recommendations', objectType: 'Innovation Recommendation', typeNames: ['Innovation Recommendation'] },
  { label: 'Performance Indicators',     navLabel: 'Performance Indicators',     objectType: 'Performance Indicator',     typeNames: ['Performance Indicator'] },
  { label: 'Process Flows',              navLabel: 'Process Flows',              objectType: 'Process Flow',              typeNames: ['Process Flow'] },
]

const SAP_DEFINED_GROUPS = new Set([
  'Correction Recommendations',
  'Improvement Opportunities',
  'Innovation Recommendations',
  'Performance Indicators',
  'Process Flows',
])

const PAGE_SIZE = 20

const REGULAR_GROUPS = TYPE_GROUPS.filter(g => !SAP_DEFINED_GROUPS.has(g.label))
const PAM_GROUPS = TYPE_GROUPS.filter(g => SAP_DEFINED_GROUPS.has(g.label))

function PanelGroup({ group, shown, setShown, selectedId, onAssetClick, onOverflow, onShowAll, showSapDefined }: {
  group: typeof TYPE_GROUPS[0]
  shown: Record<string, number>
  setShown: React.Dispatch<React.SetStateAction<Record<string, number>>>
  selectedId?: string
  onAssetClick?: (asset: SelectedAssetInfo) => void
  onOverflow?: (id: string) => void
  onShowAll?: (label: string) => void
  showSapDefined?: boolean
}) {
  const items = RESULTS.filter(r => group.typeNames.includes(r.typeName))
  if (items.length === 0) return null
  const visibleCount = shown[group.label] ?? PAGE_SIZE
  const visible = items.slice(0, visibleCount)
  const hasMore = items.length > visibleCount

  return (
    <Panel
      key={group.label}
      collapsed={false}
      fixed
      className="search-type-panel"
      header={
        <FlexBox alignItems="Center" justifyContent="SpaceBetween" style={{ width: '100%' }}>
          <Title level="H5" wrappingType="None">{group.label} ({items.length})</Title>
          {showSapDefined && <SapDefinedChip id={group.label} />}
        </FlexBox>
      }
    >
      <List separators="Inner">
        {visible.map((item, i) => (
          <ResultRow
            key={item.id}
            item={item}
            query=""
            isLast={i === visible.length - 1}
            isNavigated={selectedId === item.id}
            onOverflow={() => onOverflow?.(item.id)}
            onAssetClick={onAssetClick}
          />
        ))}
        {hasMore
          ? (
            <ListItemStandard type="Active" onClick={() => setShown(s => ({ ...s, [group.label]: visibleCount + PAGE_SIZE }))}>
              <span style={{ color: 'var(--sapLinkColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSize)' }}>
                Show more ({items.length - visibleCount} remaining)
              </span>
            </ListItemStandard>
          )
          : (
            <ListItemStandard type="Active" onClick={() => onShowAll?.(group.navLabel)}>
              <span style={{ color: 'var(--sapLinkColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", fontSize: 'var(--sapFontSize)' }}>
                Show All ({items.length})
              </span>
            </ListItemStandard>
          )
        }
      </List>
    </Panel>
  )
}

function GroupedResultsView({ selectedId, onAssetClick, onOverflow, onShowAll, titleSlot, variantSlot, businessActionsSlot, filterBarSlot }: {
  selectedId?: string
  onAssetClick?: (asset: SelectedAssetInfo) => void
  onOverflow?: (id: string) => void
  onShowAll?: (typeId: string) => void
  titleSlot?: React.ReactNode
  variantSlot?: React.ReactNode
  businessActionsSlot?: React.ReactNode
  filterBarSlot?: React.ReactNode
}) {
  const [shown, setShown] = useState<Record<string, number>>({})

  return (
    <FlexBox direction="Column" gap="1.5rem">
      {/* Regular groups */}
      <SigTableWrapper
        stickyHeaderTop="1rem"
        activeView="card"
        titleSlot={variantSlot ? undefined : titleSlot}
        variantManagementSlot={variantSlot}
        businessActionsSlot={businessActionsSlot}
        filterBarSlot={filterBarSlot}
      >
        <FlexBox direction="Column" gap={16}>          {REGULAR_GROUPS.map(group => (
            <PanelGroup
              key={group.label}
              group={group}
              shown={shown}
              setShown={setShown}
              selectedId={selectedId}
              onAssetClick={onAssetClick}
              onOverflow={onOverflow}
              onShowAll={onShowAll}
            />
          ))}
        </FlexBox>
      </SigTableWrapper>

      {/* SAP-Defined Business Content */}
      <SigTableWrapper
        stickyHeaderTop="1rem"
        activeView="card"
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>SAP-Defined Business Content</Title>
          </ToolbarItem>
        }
        filterBarSlot={
          <ToolbarItem>
            <SourceSystemChip id="sap-defined-section" />
          </ToolbarItem>
        }
      >
        <FlexBox direction="Column" gap={16}>
          {PAM_GROUPS.map(group => (
            <PanelGroup
              key={group.label}
              group={group}
              shown={shown}
              setShown={setShown}
              selectedId={selectedId}
              onAssetClick={onAssetClick}
              onOverflow={onOverflow}
              onShowAll={onShowAll}
              showSapDefined
            />
          ))}
        </FlexBox>
      </SigTableWrapper>
    </FlexBox>
  )
}

export default function SearchResultsPanel({ query, title, variantSlot, selectedId, onAssetClick, onShowAll, filters, onFiltersChange, authorSearch, onAuthorSearchChange, savedSearches, activeSearchName, onSaveSearch, onRemoveSavedSearch, onSelectSavedSearch }: { query: string; title?: string; variantSlot?: React.ReactNode; selectedId?: string; onAssetClick?: (asset: SelectedAssetInfo) => void; onShowAll?: (typeId: string) => void; filters: Record<string, unknown>; onFiltersChange: (f: Record<string, unknown>) => void; authorSearch: string; onAuthorSearchChange: (v: string) => void; savedSearches?: SavedSearch[]; activeSearchName?: string; onSaveSearch?: () => void; onRemoveSavedSearch?: (id: string) => void; onSelectSavedSearch?: (s: SavedSearch) => void }) {
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const isAllResults = !title || title === 'All Results'
  const SPM_TITLES = new Set(['Diagrams', 'Dictionary Entries', 'Files', 'Folders', 'Journey Models'])
  const SAP_TITLES = new Set(['Correction Recommendations', 'Improvement Opportunities', 'Innovation Recommendations', 'Performance Indicators', 'Process Flows'])
  const showFilterBar = isAllResults || SPM_TITLES.has(title ?? '')
  const showSourceSystem = SAP_TITLES.has(title ?? '')

  const activeGroup = !isAllResults ? TYPE_GROUPS.find(g => g.navLabel === title) : undefined

  const filteredResults = RESULTS.filter(item => {
    if (activeGroup && !activeGroup.typeNames.includes(item.typeName)) return false
    const authorFilter = filters.last_author as string[] | undefined
    if (authorFilter?.length) {
      const matched = USERS.find(u => u.name === item.lastUpdateBy)
      if (!matched || !authorFilter.includes(matched.id)) return false
    }
    const nameFilter = filters.name as string | undefined
    if (nameFilter?.trim()) {
      if (!item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false
    }
    return true
  })

  return (
    <div>
      {isAllResults
        ? (
          <GroupedResultsView
            selectedId={selectedId}
            onAssetClick={onAssetClick}
            onOverflow={setOpenOverflowId}
            onShowAll={onShowAll}
            titleSlot={
              <ToolbarItem>
                <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                  All Results ({RESULTS.length})
                </Title>
              </ToolbarItem>
            }
            variantSlot={variantSlot}
            businessActionsSlot={savedSearches !== undefined ? (
              <ToolbarItem>
                <SavedSearchesChip
                  savedSearches={savedSearches}
                  activeSearchName={activeSearchName}
                  onSave={onSaveSearch ?? (() => {})}
                  onRemove={onRemoveSavedSearch ?? (() => {})}
                  onSelect={onSelectSavedSearch ?? (() => {})}
                />
              </ToolbarItem>
            ) : undefined}
            filterBarSlot={
              <SigFilterBar filters={filters} onFiltersChange={onFiltersChange} defaultFilters={{}} showManageFilters defaultVisibleFilterKeys={[]}>
                <SigFilter filterKey="type" label="Asset Type">
                  <MultiSelect options={TYPE_OPTIONS} />
                </SigFilter>
                <SigFilter filterKey="status" label="Status">
                  <MultiSelect options={STATUS_OPTIONS} />
                </SigFilter>
                <SigFilter filterKey="last_author" label="Last Author" search={{ value: authorSearch, onChange: onAuthorSearchChange, placeholder: 'Search users...' }}>
                  <MultiSelect options={USER_OPTIONS.filter(u => !authorSearch || u.label.toLowerCase().includes(authorSearch.toLowerCase()))} />
                </SigFilter>
                <SigFilter filterKey="last_updated" label="Last Updated">
                  <DatePicker selectionMode="range" maxDate={new Date().toISOString().split('T')[0]} />
                </SigFilter>
                <SigFilter filterKey="is_published" label="Published">
                  <SingleSelect options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                </SigFilter>
                <SigFilter filterKey="name" label="Name">
                  <StringSelect />
                </SigFilter>
              </SigFilterBar>
            }
          />
        )
        : (
          <SigTableWrapper
            stickyHeaderTop="1rem"
            titleSlot={variantSlot ? undefined : (
              <ToolbarItem>
                <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                    {title ?? 'Results'} ({filteredResults.length})
                  </Title>
                  {showSourceSystem && <SapDefinedChip id={`title-${title}`} />}
                </FlexBox>
              </ToolbarItem>
            )}
            variantManagementSlot={variantSlot}
            businessActionsSlot={savedSearches !== undefined ? (
              <ToolbarItem>
                <SavedSearchesChip
                  savedSearches={savedSearches}
                  activeSearchName={activeSearchName}
                  onSave={onSaveSearch ?? (() => {})}
                  onRemove={onRemoveSavedSearch ?? (() => {})}
                  onSelect={onSelectSavedSearch ?? (() => {})}
                />
              </ToolbarItem>
            ) : undefined}
            filterBarSlot={showFilterBar ? (
              <SigFilterBar filters={filters} onFiltersChange={onFiltersChange} defaultFilters={{}} showManageFilters defaultVisibleFilterKeys={[]}>
                <SigFilter filterKey="type" label="Asset Type">
                  <MultiSelect options={TYPE_OPTIONS} />
                </SigFilter>
                <SigFilter filterKey="status" label="Status">
                  <MultiSelect options={STATUS_OPTIONS} />
                </SigFilter>
                <SigFilter
                  filterKey="last_author"
                  label="Last Author"
                  search={{ value: authorSearch, onChange: onAuthorSearchChange, placeholder: 'Search users...' }}
                >
                  <MultiSelect options={USER_OPTIONS.filter(u => !authorSearch || u.label.toLowerCase().includes(authorSearch.toLowerCase()))} />
                </SigFilter>
                <SigFilter filterKey="last_updated" label="Last Updated">
                  <DatePicker selectionMode="range" maxDate={new Date().toISOString().split('T')[0]} />
                </SigFilter>
                <SigFilter filterKey="is_published" label="Published">
                  <SingleSelect options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                </SigFilter>
                <SigFilter filterKey="name" label="Name">
                  <StringSelect />
                </SigFilter>
              </SigFilterBar>
            ) : showSourceSystem ? (
              <ToolbarItem>
                <SourceSystemChip id={title ?? 'page'} />
              </ToolbarItem>
            ) : undefined}
          >
            <List separators="Inner">
              {filteredResults.map((item, i) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  query={query}
                  isLast={i === filteredResults.length - 1}
                  isNavigated={selectedId === item.id}
                  onOverflow={() => setOpenOverflowId(item.id)}
                  onAssetClick={(asset) => { onAssetClick?.(asset) }}
                />
              ))}
            </List>
          </SigTableWrapper>
        )
      }

      {openOverflowId && (() => {
        const item = RESULTS.find(r => r.id === openOverflowId)
        if (!item) return null
        return (
          <Menu opener={`search-overflow-${openOverflowId}`} open onClose={() => setOpenOverflowId(null)}>
            <MenuItem text="Open Latest Draft" />
            <MenuItem text="Open in QuickModel" />
            <MenuItem text="Share" />
            <MenuItem text="Add to Favorites" />
            <MenuItem text="Copy To" />
            <MenuItem text="Rename" />
            <MenuItem text="Move" />
            <MenuItem text="Delete" />
          </Menu>
        )
      })()}
    </div>
  )
}
