import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Button,
  Icon,
  Input,
  MessageStrip,
  Menu,
  MenuItem,
  Text,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import s from './DictionaryPanel.module.css'

// ── Mock dictionary data ──────────────────────────────────────────────────────

type DictCategory =
  | 'Activities'
  | 'IT System'
  | 'Documents'
  | 'Organizational Units'
  | 'Gateway'
  | 'Events'

type DictItem = {
  id: string
  name: string
  category: DictCategory
  subCategory?: string
  description: string
  lastUpdated: string
  usedInDiagram?: boolean
  isFavorite?: boolean
}

const DICT_ITEMS: DictItem[] = [
  {
    id: 'd27',
    name: 'Evaluate CV',
    category: 'Activities',
    description: 'Review and evaluate submitted curriculum vitae against job requirements',
    lastUpdated: '10.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd40',
    name: 'Plan interview',
    category: 'Activities',
    description: 'Schedule and organize interview logistics and panel members',
    lastUpdated: '14.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd28',
    name: 'Interview candidate',
    category: 'Activities',
    description: 'Conduct structured interview with candidate',
    lastUpdated: '15.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd30',
    name: 'Make offer',
    category: 'Activities',
    description: 'Prepare and send job offer letter to selected candidate',
    lastUpdated: '12.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd31',
    name: 'Onboard candidate',
    category: 'Activities',
    description: 'Complete onboarding process for newly hired employee',
    lastUpdated: '14.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd29',
    name: 'Send rejection',
    category: 'Activities',
    description: 'Send rejection notification to unsuccessful candidates',
    lastUpdated: '08.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd41',
    name: 'ATS System',
    category: 'IT System',
    subCategory: 'HR Technology',
    description: 'Applicant Tracking System for managing recruitment workflow',
    lastUpdated: '15.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd56',
    name: 'Workday',
    category: 'IT System',
    subCategory: 'HCM',
    description: 'Human capital management cloud platform',
    lastUpdated: '14.03.2026',
    isFavorite: true,
  },
  {
    id: 'd61',
    name: 'Application Form',
    category: 'Documents',
    subCategory: 'HR Information',
    description: 'Candidate application form with personal and professional details',
    lastUpdated: '11.03.2026',
  },
  {
    id: 'd63',
    name: 'Interview Scorecard',
    category: 'Documents',
    subCategory: 'HR Information',
    description: 'Structured evaluation form for candidate interviews',
    lastUpdated: '10.03.2026',
  },
  {
    id: 'd42',
    name: 'Recruitment Specialist',
    category: 'Organizational Units',
    subCategory: 'Human Resources',
    description: 'Handles end-to-end recruitment activities',
    lastUpdated: '15.03.2026',
  },
  {
    id: 'd33',
    name: 'Application received',
    category: 'Events',
    subCategory: 'Start Event',
    description: 'Start event triggered when a new application is submitted',
    lastUpdated: '11.03.2026',
    usedInDiagram: true,
  },
  {
    id: 'd35',
    name: 'Candidate hired',
    category: 'Events',
    subCategory: 'End Event',
    description: 'End event when candidate successfully completes hiring process',
    lastUpdated: '13.03.2026',
    usedInDiagram: true,
  },
]

// ── Category icon & dot color ─────────────────────────────────────────────────

const CAT_DOT: Record<DictCategory, string> = {
  'Activities':           '#6d7f00',
  'IT System':            '#0070F2',
  'Documents':            '#16a34a',
  'Organizational Units': '#9333ea',
  'Gateway':              '#6b7280',
  'Events':               '#6b7280',
}

function CategoryDot({ category }: { category: DictCategory }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: CAT_DOT[category] ?? '#aaa',
        flexShrink: 0,
      }}
    />
  )
}

// ── Single dictionary card ────────────────────────────────────────────────────

function DictCard({ item }: { item: DictItem }) {
  const sub = item.subCategory ? ` › ${item.subCategory}` : ''
  return (
    <div className={s.card} draggable onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}>
      <div className={s.cardTop}>
        <div className={s.cardCategory}>
          <CategoryDot category={item.category} />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>
            {item.category}{sub}
          </Text>
          {item.isFavorite && (
            <Icon
              name="favorite"
              style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapHighlightColor)', marginLeft: 'auto' }}
            />
          )}
        </div>
        <div className={s.cardName}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapPageHeader_TextColor)' }}>
            {item.name}
          </Text>
          <Button
            icon="action"
            design="Transparent"
            className={s.cardKebab}
            tooltip="More options"
            style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
            onClick={e => e.stopPropagation()}
          />
        </div>
        {item.description && (
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: '1.4' }}>
            {item.description.length > 90 ? item.description.slice(0, 90) + '…' : item.description}
          </Text>
        )}
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
          Last updated: {item.lastUpdated}
        </Text>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void
}

export default function DictionaryPanel({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [usedInOnly, setUsedInOnly] = useState(false)
  const [infoVisible, setInfoVisible] = useState(true)
  const [scopeLabel, setScopeLabel] = useState('All')
  const scopeMenuRef = useRef<any>(null)
  const scopeBtnId = 'dict-scope-btn'

  const filtered = DICT_ITEMS.filter(item => {
    if (usedInOnly && !item.usedInDiagram) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subCategory?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className={s.panel}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapPageHeader_TextColor)' }}>
            Dictionary
          </Text>
          <Button
            icon="open-command-field"
            design="Transparent"
            tooltip="Open Dictionary"
            style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
          />
        </div>
        <Button
          icon="decline"
          design="Transparent"
          tooltip="Close"
          style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
          onClick={onClose}
        />
      </div>

      {/* Info strip */}
      {infoVisible && (
        <div className={s.infoStrip}>
          <MessageStrip
            design="Information"
            hideCloseButton={false}
            onClose={() => setInfoVisible(false)}
          >
            Drag items onto the canvas to add them, or drop onto an existing element to link it.
          </MessageStrip>
        </div>
      )}

      {/* Search */}
      <div className={s.searchRow}>
        <div className={s.searchBar}>
          <button
            id={scopeBtnId}
            className={s.scopeBtn}
            onClick={() => {
              if (scopeMenuRef.current) {
                scopeMenuRef.current.opener = scopeBtnId
                scopeMenuRef.current.open = true
              }
            }}
          >
            <span>{scopeLabel}</span>
            <Icon name="slim-arrow-down" style={{ width: '0.625rem', height: '0.625rem', color: 'var(--sapContent_LabelColor)' }} />
          </button>
          <div className={s.searchSep} />
          <Input
            placeholder="Search name, description…"
            type={'Search' as any}
            value={query}
            onInput={(e: any) => setQuery(e.target?.value ?? '')}
            style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none' }}
          />
          {query && (
            <Button
              icon="decline"
              design="Transparent"
              style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
              onClick={() => setQuery('')}
            />
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className={s.chips}>
        <SigChipV2
          value="Used in Diagram"
          condensed
          selected={usedInOnly}
          onClick={() => setUsedInOnly(v => !v)}
        />
        {(usedInOnly) && (
          <Button
            design="Transparent"
            style={{ fontSize: 'var(--sapFontSmallSize)', padding: '0 4px', height: '1.5rem', color: 'var(--sapHighlightColor)' }}
            onClick={() => { setUsedInOnly(false); setQuery('') }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Result count */}
      <div className={s.resultBar}>
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>
          {query || usedInOnly ? 'Result' : 'All'} ({filtered.length})
        </Text>
      </div>

      {/* Item list */}
      <div className={s.list}>
        {filtered.length === 0 ? (
          <div className={s.empty}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
              No results found
            </Text>
          </div>
        ) : (
          filtered.map(item => <DictCard key={item.id} item={item} />)
        )}
      </div>

      {/* Scope dropdown (portalled) */}
      {createPortal(
        <Menu
          ref={scopeMenuRef}
          onItemClick={(e: any) => setScopeLabel(e.detail?.text ?? 'All')}
        >
          <MenuItem text="All" />
          <MenuItem text="Name" />
          <MenuItem text="Description" />
          <MenuItem text="Created By" />
        </Menu>,
        document.body
      )}
    </div>
  )
}
