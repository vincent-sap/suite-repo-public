import React, { useState, useRef } from 'react'
import { Select, Option, Icon, Text, CheckBox, Button, RadioButton, MultiComboBox, List, ListItemCustom, Label } from '@ui5/webcomponents-react'
import InfoPopover from './components/InfoPopover'
import AudienceSectionBar from './components/AudienceSectionBar'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'
import { INITIAL_LANG_GROUPS } from '../../data/modelingLanguages'

const MODELING_LANGUAGES = INITIAL_LANG_GROUPS.map(g => g.label)

type PageSection = {
  id: string
  label: string
  showable: boolean
  shown?: boolean
  expandable?: boolean
}

const INITIAL_SECTIONS: PageSection[] = [
  { id: 'description', label: 'Description', showable: false },
  { id: 'diagram-view', label: 'Diagram View', showable: false },
  { id: 'activity-list', label: 'Activity List', showable: true, shown: true },
  { id: 'requirements', label: 'Requirements', showable: true, shown: true },
  { id: 'featured-attrs', label: 'Featured Attributes', showable: true, shown: false, expandable: true },
  { id: 'attributes', label: 'Attributes', showable: false },
  { id: 'variant-management', label: 'Variant Management', showable: true, shown: true },
]

type SavedState = {
  notationSet: string
  sections: PageSection[]
  headerAttrs: { level: boolean; revision: boolean; lastModified: boolean; lastAuthor: boolean }
  countLevel: '1' | '0'
  allowDownload: boolean
}

export default function DiagramPage() {
  const [notationSet, setNotationSet] = useState(MODELING_LANGUAGES[0])
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [headerAttrs, setHeaderAttrs] = useState({
    level: true, revision: true, lastModified: true, lastAuthor: true,
  })
  const [countLevel, setCountLevel] = useState<'1' | '0'>('1')
  const [audience, setAudience] = useState('General audience')
  const [allowDownload, setAllowDownload] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [featuredAttrsExpanded, setFeaturedAttrsExpanded] = useState(false)
  const savedState = useRef<SavedState>({
    notationSet: MODELING_LANGUAGES[0],
    sections: INITIAL_SECTIONS,
    headerAttrs: { level: true, revision: true, lastModified: true, lastAuthor: true },
    countLevel: '1',
    allowDownload: true,
  })

  const handleSave = () => {
    savedState.current = { notationSet, sections, headerAttrs, countLevel, allowDownload }
    setIsDirty(false)
  }

  const handleReset = () => {
    const saved = savedState.current
    setNotationSet(saved.notationSet)
    setSections(saved.sections)
    setHeaderAttrs(saved.headerAttrs)
    setCountLevel(saved.countLevel)
    setAllowDownload(saved.allowDownload)
    setIsDirty(false)
  }

  const toggleHeader = (key: keyof typeof headerAttrs) => {
    setHeaderAttrs(prev => ({ ...prev, [key]: !prev[key] }))
    setIsDirty(true)
  }

  const HEADER_ROWS: Array<{ key: keyof typeof headerAttrs; label: string; extra?: React.ReactNode }> = [
    {
      key: 'level', label: 'Level',
      extra: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Count levels from</Text>
          <RadioButton name="count-level" text="Level 1" checked={countLevel === '1'} onChange={() => { setCountLevel('1'); setIsDirty(true) }} />
          <RadioButton name="count-level" text="Level 0" checked={countLevel === '0'} onChange={() => { setCountLevel('0'); setIsDirty(true) }} />
        </div>
      ),
    },
    { key: 'revision', label: 'Revision' },
    { key: 'lastModified', label: 'Last Modified / Last Published' },
    { key: 'lastAuthor', label: 'Last author' },
  ]

  const toggleShown = (id: string) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, shown: !sec.shown } : sec))
    setIsDirty(true)
  }

  const handleMove = (e: CustomEvent) => {
    const sourceId = (e.detail.source.element as HTMLElement).dataset.id ?? ''
    const destId = (e.detail.destination.element as HTMLElement).dataset.id ?? ''
    const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
    if (!sourceId || !destId || placement === 'On') return
    setSections(prev => {
      const from = prev.findIndex(s => s.id === sourceId)
      const to = prev.findIndex(s => s.id === destId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      const insertAt = placement === 'Before' ? (to > from ? to - 1 : to) : (to < from ? to + 1 : to)
      next.splice(insertAt, 0, item)
      return next
    })
    setIsDirty(true)
  }

  return (
    <PageHeader title="Model Page" subtitle="Configure the layout and default content shown on the model detail page." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="1.5rem">
        <SettingsSection
          title="Page Sections"
          subtitle="Configure which sections appear on the model page and in which order. Applies to all audiences; settings are configured per modeling language."
          headerExtra={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <Label for="notation-select">Modeling Language</Label>
              <Select
                id="notation-select"
                style={{ minWidth: '24rem' }}
                onChange={e => { setNotationSet((e.detail.selectedOption as HTMLElement).textContent ?? notationSet); setIsDirty(true) }}
              >
                {MODELING_LANGUAGES.map(n => <Option key={n} selected={n === notationSet}>{n}</Option>)}
              </Select>
            </div>
          }
        >
          <List
            onMoveOver={e => e.preventDefault()}
            onMove={handleMove}
          >
            {sections.map((section) => (
              <ListItemCustom
                key={section.id}
                movable
                data-id={section.id}
                type="Inactive"
                style={{ padding: 0 }}
              >
                <div style={{ pointerEvents: 'none', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                    <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }} />
                    <Text style={{ flex: 1 }}>{section.label}</Text>
                    <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {section.showable
                        ? <CheckBox checked={section.shown} text="Show on page" onChange={() => toggleShown(section.id)} />
                        : <div style={{ visibility: 'hidden' }}><CheckBox text="Show on page" /></div>
                      }
                      {section.expandable
                        ? <Button
                            icon={section.id === 'featured-attrs' && featuredAttrsExpanded ? 'slim-arrow-up' : 'slim-arrow-down'}
                            design="Transparent"
                            tooltip="Configure section"
                            style={{ flexShrink: 0 }}
                            onClick={() => section.id === 'featured-attrs' && setFeaturedAttrsExpanded(v => !v)}
                          />
                        : <div style={{ visibility: 'hidden' }}><Button icon="slim-arrow-down" design="Transparent" /></div>
                      }
                    </div>
                  </div>
                  {section.id === 'featured-attrs' && featuredAttrsExpanded && (
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', pointerEvents: 'auto' }}>
                      <div>
                        <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--sapFontSmallSize)' }}>
                          Select an attribute group to be shown separately from the rest of the attributes.
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MultiComboBox
                            placeholder="Attribute"
                            style={{ maxWidth: '28rem', width: '100%' }}
                          />
                          <InfoPopover id="featured-attrs-info" header="Featured Attributes">
                            <Text>Create <a href="#/asset-types">attribute groups</a> in Asset Types &gt; Modeling to enable the usage of Featured Attributes.</Text>
                          </InfoPopover>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ListItemCustom>
            ))}
          </List>
        </SettingsSection>
      </SettingsPageLayout>

      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />

      <SettingsPageLayout gap="1.5rem">
        <SettingsSection
          title="Header Attributes"
          subtitle="Define attributes that are shown at the top of the diagram page."
        >
          <div className={s.rowNoPad}>
            {HEADER_ROWS.map((row) => (
              <div key={row.key} className={s.dragRow}>
                <CheckBox checked={headerAttrs[row.key]} text={row.label} onChange={() => toggleHeader(row.key)} />
                {row.extra}
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Download"
          subtitle="Configure whether users can download diagrams from the model page."
        >
          <div className={s.rowWide}>
            <CheckBox
              checked={allowDownload}
              text={`Allow ${audience} users to download diagrams`}
              onChange={() => { setAllowDownload(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
