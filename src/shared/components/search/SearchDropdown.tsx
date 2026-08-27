import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Text, Button } from '@ui5/webcomponents-react'
import { SigFilterBar, SigFilter, MultiSelect, SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { FilterValues } from '@signavio/sap-signavio-uixtension'
import type { SmartFolder } from '../../../contexts/WorkspaceContext'
import {
  RECENT_ITEMS, SEARCH_POOL, TYPE_FILTERS, TYPE_OPTIONS, STATUS_OPTIONS,
  DATE_OPTIONS, VERSION_OPTIONS, type SearchDropdownItem,
} from '../../../data/searchDropdown'

type View = 'suggest' | 'advanced' | 'saved'

interface Props {
  open: boolean
  rect: { left: number; width: number; top: number } | null
  query: string
  history: string[]
  savedSearches: SmartFolder[]
  onAddHistory: (term: string) => void
  onRemoveHistory: (term: string) => void
  onClose: () => void
}

const panelBase: React.CSSProperties = {
  position: 'fixed',
  background: 'var(--sapBaseColor)',
  border: '1px solid var(--sapList_BorderColor)',
  borderRadius: '0.5rem',
  boxShadow: 'var(--sapContent_Shadow1)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '0.625rem 1rem 0.5rem',
      borderBottom: '1px solid var(--sapList_BorderColor)',
    }}>
      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
        {children}
      </Text>
    </div>
  )
}

function PopoverFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.375rem 0.5rem',
      borderTop: '1px solid var(--sapList_BorderColor)',
    }}>
      {children}
    </div>
  )
}

function PopoverHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.375rem 0.5rem 0.375rem 0.25rem',
      borderBottom: '1px solid var(--sapList_BorderColor)',
    }}>
      <Button design="Transparent" icon="slim-arrow-left" onClick={onBack} />
      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{title}</Text>
    </div>
  )
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: 'var(--sapContent_SearchHighlightColor, #dafdf5)' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

// Shared row for search result / recently-viewed items (icon + name + type · folder)
function SearchResultRow({ item, rowStyle, onClick, iconSize = 'XS', query }: {
  item: SearchDropdownItem
  rowStyle: React.CSSProperties
  onClick: () => void
  iconSize?: 'XS' | 'XXS'
  query?: string
}) {
  return (
    <div
      style={rowStyle}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
      onClick={onClick}
    >
      <div style={{ flexShrink: 0 }}>
        <SigDomainObject object={item.type as never} size={iconSize} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--sapFontFamily)', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)' }}>
          {query ? <HighlightedText text={item.name} query={query} /> : item.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
            {item.type}
          </Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>·</Text>
          <Icon name="folder" style={{ flexShrink: 0, width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)' }} />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
            {item.folder}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default function SearchDropdown({ open, rect, query, history, savedSearches, onAddHistory, onRemoveHistory, onClose }: Props) {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('suggest')
  const [advFilters, setAdvFilters] = useState<FilterValues>({})
  const [activeTypeFilter, setActiveTypeFilter] = useState('all')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setView('suggest')
      setActiveTypeFilter('all')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const runSearch = (q: string, filters?: FilterValues) => {
    const term = q.trim()
    if (term) onAddHistory(term)
    const params = new URLSearchParams()
    if (term) params.set('q', term)
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v) && v.length) params.set(k, v.join(','))
      })
    }
    navigate(`/search?${params.toString()}`)
    onClose()
  }

  const panelStyle: React.CSSProperties = {
    ...panelBase,
    top: (rect?.top ?? 52) + 4,
    left: rect?.left ?? 0,
    width: rect?.width ?? 400,
  }

  const rowStyle = (last = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 1rem',
    borderBottom: last ? 'none' : '1px solid var(--sapList_BorderColor)',
    cursor: 'pointer',
    transition: 'background 0.1s',
  })

  const hasQuery = query.trim().length > 0
  const searchResults = hasQuery
    ? SEARCH_POOL.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  if (view === 'suggest') {
    return (
      <div ref={ref} style={panelStyle}>
        {hasQuery ? (
          <>
            {/* Filter chips */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--sapList_BorderColor)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center',
            }}>
              {TYPE_FILTERS.map(f => (
                <SigChipV2
                  key={f.value}
                  value={`${f.label} (${f.count})`}
                  selected={activeTypeFilter === f.value}
                  onClick={() => setActiveTypeFilter(f.value)}
                />
              ))}
              <Button design="Transparent" style={{ padding: '0 0.25rem' }}>Show More</Button>
            </div>

            {/* Search results */}
            {searchResults.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="search" style={{ fontSize: '2rem', color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No results found for "{query}"</Text>
              </div>
            ) : searchResults.map((item, i) => (
              <SearchResultRow
                key={item.id}
                item={item}
                rowStyle={rowStyle(i === searchResults.length - 1)}
                onClick={() => runSearch(item.name)}
                iconSize="XS"
                query={query}
              />
            ))}
          </>
        ) : (
          <>
            {/* Search History */}
            <SectionHeader>Search History</SectionHeader>
            {history.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No recent searches</Text>
              </div>
            ) : history.map((term, i) => (
              <div
                key={term}
                style={rowStyle(i === history.length - 1)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => runSearch(term)}
              >
                <Icon name="history" style={{ flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)', width: '1rem', height: '1rem' }} />
                <Text style={{ flex: 1, fontSize: 'var(--sapFontSize)' }}>{term}</Text>
                <Button
                  design="Transparent"
                  icon="decline"
                  onClick={e => { e.stopPropagation(); onRemoveHistory(term) }}
                  aria-label="Remove"
                  style={{ padding: '0.125rem', '--ui5-button-base-min-width': 'unset' } as React.CSSProperties}
                />
              </div>
            ))}

            {/* Recently Viewed */}
            <SectionHeader>Recently Viewed</SectionHeader>
            {RECENT_ITEMS.map((item, i) => (
              <SearchResultRow
                key={item.id}
                item={item}
                rowStyle={rowStyle(i === RECENT_ITEMS.length - 1)}
                onClick={() => runSearch(item.name)}
                iconSize="XXS"
              />
            ))}
          </>
        )}

        <PopoverFooter>
          <Button design="Transparent" onClick={() => setView('advanced')}>Advanced Search</Button>
          <Button design="Transparent" onClick={() => setView('saved')}>Saved Searches</Button>
        </PopoverFooter>
      </div>
    )
  }

  if (view === 'advanced') {
    return (
      <div ref={ref} style={panelStyle}>
        <PopoverHeader title="Advanced Search" onBack={() => setView('suggest')} />
        <div style={{ padding: '0.75rem 1rem 0.5rem', overflowY: 'auto' }}>
          <SigFilterBar filters={advFilters} onFiltersChange={setAdvFilters} defaultFilters={{}} showManageFilters>
            <SigFilter filterKey="type" label="Type">
              <MultiSelect options={TYPE_OPTIONS} />
            </SigFilter>
            <SigFilter filterKey="status" label="Status">
              <MultiSelect options={STATUS_OPTIONS} />
            </SigFilter>
            <SigFilter filterKey="modified" label="Modified">
              <MultiSelect options={DATE_OPTIONS} />
            </SigFilter>
            <SigFilter filterKey="version" label="Version">
              <MultiSelect options={VERSION_OPTIONS} />
            </SigFilter>
          </SigFilterBar>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderTop: '1px solid var(--sapList_BorderColor)',
        }}>
          <Button design="Transparent" onClick={() => setAdvFilters({})}>Reset</Button>
          <Button design="Emphasized" onClick={() => runSearch(query, advFilters)}>Search</Button>
        </div>
      </div>
    )
  }

  // Saved Searches view
  return (
    <div ref={ref} style={panelStyle}>
      <PopoverHeader title="Saved Searches" onBack={() => setView('suggest')} />
      {savedSearches.length === 0 ? (
        <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="search" style={{ fontSize: '2rem', color: 'var(--sapContent_NonInteractiveIconColor)' }} />
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontWeight: '600' }}>No saved searches yet</Text>
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', textAlign: 'center' }}>
            Use "Save Search" on the search results page to save a search as a Smart Folder.
          </Text>
        </div>
      ) : savedSearches.map((sf, i) => (
        <div
          key={sf.id}
          style={rowStyle(i === savedSearches.length - 1)}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
          onClick={() => runSearch(sf.query)}
        >
          <Icon name="search" style={{ flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)', width: '1rem', height: '1rem' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sf.name}
            </Text>
            {sf.description && (
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sf.description}
              </Text>
            )}
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontFamily: 'monospace' }}>
              {sf.query}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}
