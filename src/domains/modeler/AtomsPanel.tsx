import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Button, Input, Icon, Title, ToolbarItem, SplitButton, ToggleButton,
  Menu, MenuItem, MenuSeparator, ToolbarSeparator,
} from '@ui5/webcomponents-react'
import { SigRightSidePanel, SigTableWrapper, SigFilterBar, SigFilter, MultiSelect } from '@signavio/sap-signavio-uixtension'
import { AssetListItem } from '../repository/components/AssetListItem'
import { INITIAL_PROCESS_ATOMS } from '../../data/processAtoms'

const PA_STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-review', label: 'In Review' },
  { value: 'deprecated', label: 'Deprecated' },
]

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

type Props = {
  onClose: () => void
}

export default function AtomsPanel({ onClose }: Props) {
  const splitBtnId = 'atoms-panel-create-btn'
  const menuRef = useRef<any>(null)
  const searchInputRef = useRef<any>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [navigatedId, setNavigatedId] = useState<string | null>(null)
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (searchOpen) {
      // slight delay so the input is mounted before focusing
      const t = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const items = INITIAL_PROCESS_ATOMS

  const selectedStatuses = (filters['status'] as string[] | undefined) ?? []
  const activeFilterCount = Object.values(filters).filter(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length

  const filteredItems = (() => {
    let result = items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      )
    }
    if (selectedStatuses.length > 0) {
      result = result.filter(item =>
        item.chips.some(c =>
          selectedStatuses.includes(c.value.toLowerCase().replace(/\s+/g, '-'))
        )
      )
    }
    return result
  })()

  const hasSelection = selectedIds.size > 0
  const selectionCount = selectedIds.size

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Search-active mode: replace toolbar row ────────────────────────────────
  // titleSlot stretches because SigTableWrapper gives it flex:1
  const searchActiveTitle = (
    <ToolbarItem style={{ flex: 1 } as React.CSSProperties}>
      <Input
        ref={searchInputRef}
        placeholder="Search atoms"
        icon={<Icon name="search" slot="icon" />}
        style={{ width: '100%' }}
        value={searchQuery}
        onInput={(e) => setSearchQuery((e.target as unknown as HTMLInputElement).value)}
      />
    </ToolbarItem>
  )

  const searchActiveActions = (
    <ToolbarItem>
      <Button design="Default" onClick={closeSearch}>Cancel</Button>
    </ToolbarItem>
  )

  // ── Normal mode slots ──────────────────────────────────────────────────────
  const normalTitle = (
    <ToolbarItem>
      <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
        {hasSelection
          ? `Selected (${selectionCount} of ${items.length})`
          : `All (${filteredItems.length}${(searchQuery.trim() || activeFilterCount > 0) ? ` of ${items.length}` : ''})`}
      </Title>
    </ToolbarItem>
  )

  const normalSearch = (hasSelection || searchOpen) ? undefined : (
    <ToolbarItem>
      <Button
        icon="search"
        design="Transparent"
        tooltip="Search"
        onClick={() => setSearchOpen(true)}
      />
    </ToolbarItem>
  )

  const normalActions = hasSelection ? (
    <>
      <ToolbarItem><Button design="Default">Delete</Button></ToolbarItem>
      <ToolbarItem><Button design="Default">Export</Button></ToolbarItem>
      <ToolbarItem><ToolbarSeparator /></ToolbarItem>
      <ToolbarItem>
        <Button design="Default" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
      </ToolbarItem>
    </>
  ) : (
    <ToolbarItem>
      <>
        <SplitButton
          id={splitBtnId}
          design="Emphasized"
          onArrowClick={() => {
            if (menuRef.current) {
              menuRef.current.opener = splitBtnId
              menuRef.current.open = true
            }
          }}
        >
          Create
        </SplitButton>
        {createPortal(
          <Menu
            ref={menuRef}
            onItemClick={(e: any) => console.log('Atoms panel menu:', e.detail?.text)}
          >
            <MenuItem text="Import" icon="upload" />
            <MenuItem text="Extract from Process" icon="process" />
          </Menu>,
          document.body
        )}
      </>
    </ToolbarItem>
  )

  const filterToggle = (hasSelection || searchOpen) ? undefined : (
    <ToolbarItem>
      <ToggleButton icon="filter" pressed={activeFilterCount > 0}>
        {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
      </ToggleButton>
    </ToolbarItem>
  )

  const filterBar = (hasSelection || searchOpen) ? undefined : (
    <SigFilterBar filters={filters} onFiltersChange={setFilters} defaultFilters={{}}>
      <SigFilter filterKey="status" label="Status">
        <MultiSelect options={PA_STATUS_OPTIONS} />
      </SigFilter>
      <SigFilter filterKey="dateChanged" label="Date Changed">
        <MultiSelect options={DATE_OPTIONS} />
      </SigFilter>
    </SigFilterBar>
  )

  return (
    <SigRightSidePanel
      headerTitle="Atoms"
      isOpen
      toggleRightSidePanel={onClose}
      contentActionsSlot={[]}
      style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0.75rem 0' }} className="atoms-table-wrapper">
      <SigTableWrapper
        titleSlot={searchOpen ? searchActiveTitle : normalTitle}
        searchSlot={normalSearch}
        businessActionsSlot={searchOpen ? searchActiveActions : normalActions}
        filterBarToggleButton={filterToggle}
        filterBarSlot={filterBar}
      >
        <div style={{ background: 'var(--sapList_Background)' }}>
          {filteredItems.map((item, i) => (
            <AssetListItem
              key={item.id}
              id={item.id}
              name={item.name}
              objectType={item.objectType}
              typeName={item.typeName}
              description={item.description}
              changed={item.lastUpdateDate}
              chips={item.chips}
              isSelected={selectedIds.has(item.id)}
              isNavigated={navigatedId === item.id}
              onSelect={() => toggleSelect(item.id)}
              overflowId={`atoms-panel-overflow-${item.id}`}
              onOverflow={() => setOpenOverflowId(item.id)}
              onClick={() => setNavigatedId(item.id)}
              isLast={i === filteredItems.length - 1}
            />
          ))}
        </div>
      </SigTableWrapper>
      </div>

      {openOverflowId && (() => {
        const item = filteredItems.find(r => r.id === openOverflowId)
        if (!item) return null
        return createPortal(
          <Menu
            opener={`atoms-panel-overflow-${openOverflowId}`}
            open
            onClose={() => setOpenOverflowId(null)}
          >
            <MenuItem text="Open Latest Draft" />
            <MenuSeparator />
            <MenuItem text="Open in QuickModel" />
            <MenuSeparator />
            <MenuItem text="Share" />
            <MenuItem text="Add to Favorites" />
            <MenuItem text="Export" />
            <MenuSeparator />
            <MenuItem text="Rename" />
            <MenuItem text="Delete" />
          </Menu>,
          document.body
        )
      })()}
    </SigRightSidePanel>
  )
}
