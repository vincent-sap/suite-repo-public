import { useState, useCallback, useRef } from 'react'
import { ITEMS, ATTRIBUTES, RESOURCE_ITEMS, NAV_ITEMS } from './mockData'
import type { PopoverDomRef } from '@ui5/webcomponents-react'

export function useDirty() {
  const [isDirty, setIsDirty] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const mark = () => setIsDirty(true)
  const handleSave = () => { setIsDirty(false); setToastOpen(true) }
  const handleDiscard = () => setIsDirty(false)
  return { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard }
}

export function useSearch() {
  const [search, setSearch] = useState('')
  return { search, setSearch }
}

export function useFilteredAttributes(search: string) {
  return ATTRIBUTES.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
}

export function useFilteredResources(search: string) {
  return RESOURCE_ITEMS.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
}

export function useFilteredItems(search: string) {
  return ITEMS.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
}

export function useSideNavLayout() {
  const [active, setActive] = useState('general')
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
  const activeLabel = NAV_ITEMS.find(i => i.id === active)?.label ?? ''
  return { active, setActive, isNarrow, layoutRef, activeLabel }
}

export function useTwoColumnLayout() {
  const [selected, setSelected] = useState<typeof ITEMS[0] | null>(null)
  const [layout, setLayout] = useState<'OneColumn' | 'TwoColumnsMidExpanded'>('OneColumn')
  const handleSelect = (item: typeof ITEMS[0]) => {
    setSelected(item)
    setLayout('TwoColumnsMidExpanded')
  }
  const handleClose = () => {
    setSelected(null)
    setLayout('OneColumn')
  }
  return { selected, layout, handleSelect, handleClose }
}

export const TWO_COLUMN_DETAIL_LAYOUTS = {
  desktop: { TwoColumnsMidExpanded: { layout: ['65%', '35%', '0'] } },
  tablet:  { TwoColumnsMidExpanded: { layout: ['65%', '35%', '0'] } },
}

export const TWO_COLUMN_PANEL_LAYOUTS = {
  desktop: { TwoColumnsStartExpanded: { layout: ['70%', '30%', '0'] } },
  tablet:  { TwoColumnsStartExpanded: { layout: ['70%', '30%', '0'] } },
}

export function useTwoColumnPanelLayout() {
  const [selected, setSelected] = useState<typeof ITEMS[0] | null>(null)
  const [layout, setLayout] = useState<'OneColumn' | 'TwoColumnsStartExpanded'>('OneColumn')
  const handleSelect = (item: typeof ITEMS[0]) => {
    setSelected(item)
    setLayout('TwoColumnsStartExpanded')
  }
  const handleClose = () => {
    setSelected(null)
    setLayout('OneColumn')
  }
  return { selected, layout, handleSelect, handleClose }
}

export function useSort() {
  const [sortBy, setSortBy] = useState('Name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const openSortPopover = (id: string) => {
    if (sortPopoverRef.current) {
      sortPopoverRef.current.opener = id
      sortPopoverRef.current.open = true
    }
  }
  const closeSortPopover = () => {
    if (sortPopoverRef.current) sortPopoverRef.current.open = false
  }
  return { sortBy, setSortBy, sortDir, setSortDir, sortPopoverRef, openSortPopover, closeSortPopover }
}
