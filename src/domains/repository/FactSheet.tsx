import { useState, useRef } from 'react'
import {
  Select, Option, CheckBox, Text, Button, Icon, Label, Card,
  MultiComboBox, MultiComboBoxItem, Input, List, ListItemCustom,
} from '@ui5/webcomponents-react'
import PageHeader from '../settings/components/PageHeader'
import AudienceSectionBar from '../settings/components/AudienceSectionBar'
import SettingsPageLayout, { SettingsSection } from '../settings/components/SettingsPageLayout'
import s from '../settings/components/SettingsPage.module.css'

const LANGUAGES = ['German', 'English', 'French', 'Spanish', 'Italian']
const AVAILABLE_ATTRIBUTES = [
  'Business Area', 'Complexity', 'Department', 'Description',
  'IT System', 'Process Manager', 'Process Owner', 'Revision Date',
  'Status', 'Strategic Relevance',
]

type AttributeField = { id: string; description: string; selected: string[] }
type CardSection = { id: string; language: string; name: string; field: AttributeField }

type Section = {
  id: string
  title: string
  showOnPage: boolean
  expanded: boolean
  attributeFields?: AttributeField[]
  isCustomCard?: boolean
  cardLanguage?: string
  cardName?: string
  cardSections?: CardSection[]
}

const mkAttr = (id: string, forLabel: string): AttributeField => ({
  id,
  description: `Select one or multiple attributes as data source for "${forLabel}".`,
  selected: [],
})

const INITIAL_SECTIONS: Section[] = [
  {
    id: 'description', title: 'Process Description and Objective', showOnPage: true, expanded: false,
    attributeFields: [mkAttr('objective', 'Process Objective')],
  },
  { id: 'trigger', title: 'Process Trigger and Result', showOnPage: true, expanded: false },
  {
    id: 'supplier', title: 'Supplier and Customer', showOnPage: true, expanded: false,
    attributeFields: [mkAttr('supplier', 'Supplier'), mkAttr('customer', 'Customer')],
  },
  { id: 'activities', title: 'Activities', showOnPage: true, expanded: false },
  {
    id: 'people', title: 'People and Roles', showOnPage: true, expanded: false,
    attributeFields: [mkAttr('owner', 'Process Owner'), mkAttr('responsible', 'Other Responsible')],
  },
  { id: 'risks', title: 'Risks and Controls', showOnPage: true, expanded: false },
  {
    id: 'documents', title: 'Documents and IT Systems', showOnPage: true, expanded: false,
    attributeFields: [mkAttr('documents', 'Documents'), mkAttr('itsystems', 'IT Systems')],
  },
  { id: 'kpis', title: 'KPIs', showOnPage: false, expanded: false },
  { id: 'governance', title: 'Process Governance', showOnPage: false, expanded: false },
  {
    id: 'custom-1', title: 'Unnamed Card', showOnPage: false, expanded: false,
    isCustomCard: true,
    cardLanguage: 'German', cardName: 'Unnamed Card',
    cardSections: [{
      id: 'cs-1', language: 'German', name: 'Unnamed Section',
      field: { id: 'csf-1', description: 'Select one or multiple attributes as data source for section 1.', selected: [] },
    }],
  },
]

export default function FactSheet() {
  const [isDirty, setIsDirty] = useState(false)

  // Saved-state snapshots
  const savedFactSheetEnabled = useRef(true)
  const savedDefaultView = useRef(false)
  const savedSections = useRef<Section[]>(INITIAL_SECTIONS)

  const [audience, setAudience] = useState('General audience')
  const [factSheetEnabled, setFactSheetEnabled] = useState(true)
  const [defaultView, setDefaultView] = useState(false)
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)

  const handleSave = () => {
    savedFactSheetEnabled.current = factSheetEnabled
    savedDefaultView.current = defaultView
    savedSections.current = sections
    setIsDirty(false)
  }

  const handleReset = () => {
    setFactSheetEnabled(savedFactSheetEnabled.current)
    setDefaultView(savedDefaultView.current)
    setSections(savedSections.current)
    setIsDirty(false)
  }

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, showOnPage: !s.showOnPage } : s))
    setIsDirty(true)
  }

  const toggleExpand = (id: string) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s))

  const updateAttrField = (sectionId: string, fieldId: string, selected: string[]) => {
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, attributeFields: s.attributeFields?.map(f => f.id === fieldId ? { ...f, selected } : f) }
      : s))
    setIsDirty(true)
  }

  const updateCard = (sectionId: string, patch: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...patch } : s))
    setIsDirty(true)
  }

  const updateCardSection = (sectionId: string, csId: string, patch: Partial<CardSection>) => {
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, cardSections: s.cardSections?.map(cs => cs.id === csId ? { ...cs, ...patch } : cs) }
      : s))
    setIsDirty(true)
  }

  const updateCardSectionAttr = (sectionId: string, csId: string, selected: string[]) => {
    setSections(prev => prev.map(s => s.id === sectionId
      ? {
          ...s,
          cardSections: s.cardSections?.map(cs =>
            cs.id === csId ? { ...cs, field: { ...cs.field, selected } } : cs),
        }
      : s))
    setIsDirty(true)
  }

  const addCardSection = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const n = (s.cardSections?.length ?? 0) + 1
      return {
        ...s,
        cardSections: [
          ...(s.cardSections ?? []),
          {
            id: `cs-${Date.now()}`, language: 'German', name: 'Unnamed Section',
            field: { id: `csf-${Date.now()}`, description: `Select one or multiple attributes as data source for section ${n}.`, selected: [] },
          },
        ],
      }
    }))
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

  const isExpandable = (s: Section) => !!(s.attributeFields?.length || s.isCustomCard)

  const getSelected = (e: CustomEvent): string[] =>
    (e.detail.items as Array<{ text: string }>).map(i => i.text)

  return (
    <PageHeader title="Fact Sheet" subtitle="Customize which attributes and sections appear on the process fact sheet." isDirty={isDirty} onSave={handleSave} onReset={handleReset} onDuplicate={() => {}} duplicateSourceAudience={audience}>
      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />
      <SettingsPageLayout>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <CheckBox checked={factSheetEnabled} text="Enable fact sheet" onChange={() => { setFactSheetEnabled(v => !v); setIsDirty(true) }} style={{ marginLeft: '-0.5rem' }} />
            <div style={{ marginTop: '0.125rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                The fact sheet serves as a high-level view on a process model displaying essential key information about it at a glance. Users can navigate to it via the tab navigation in the header of the model page. The fact sheet is only available for Business Process Diagrams (BPMN 2.0).
              </Text>
            </div>
          </div>
          <div>
            <CheckBox checked={defaultView} disabled={!factSheetEnabled} text="Display fact sheet as default view" onChange={() => { setDefaultView(v => !v); setIsDirty(true) }} style={{ marginLeft: '-0.5rem' }} />
            <div style={{ marginTop: '0.125rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                The fact sheet is displayed as the initial page when a BPMN 2.0 model is opened.
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {factSheetEnabled && (
        <SettingsSection title="Fact Sheet Configuration" subtitle="Manage which content is displayed as part of the fact sheet and how it is sorted.">
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
                  {/* Section header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                    <Icon
                      name="horizontal-grip"
                      style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }}
                    />
                    <Text style={{ flex: 1 }}>{section.title}</Text>
                    <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckBox checked={section.showOnPage} text="Show on page" onChange={() => toggleSection(section.id)} />
                      <Button
                        icon={section.expanded ? 'slim-arrow-up' : 'slim-arrow-down'}
                        design="Transparent"
                        onClick={() => toggleExpand(section.id)}
                        style={{ flexShrink: 0, visibility: isExpandable(section) ? 'visible' : 'hidden' }}
                      />
                    </div>
                  </div>

                  {/* Named section: attribute multi-selects */}
                  {section.expanded && section.attributeFields && (
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', pointerEvents: 'auto' }}>
                      {section.attributeFields.map(field => (
                        <div key={field.id}>
                          <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--sapFontSmallSize)' }}>
                            {field.description}
                          </Text>
                          <MultiComboBox
                            placeholder="Attribute"
                            style={{ maxWidth: '28rem', width: '100%' }}
                            onSelectionChange={(e: CustomEvent) => updateAttrField(section.id, field.id, getSelected(e))}
                          >
                            {AVAILABLE_ATTRIBUTES.map(attr => (
                              <MultiComboBoxItem key={attr} text={attr} selected={field.selected.includes(attr)} />
                            ))}
                          </MultiComboBox>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom card editor */}
                  {section.isCustomCard && section.expanded && (
                    <div style={{ padding: '1rem 1.5rem', pointerEvents: 'auto' }}>
                      {/* Card title */}
                      <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.75rem', fontSize: 'var(--sapFontSmallSize)' }}>
                        Choose a title for the card.
                      </Text>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', maxWidth: '36rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <Label for={`card-lang-${section.id}`}>Language</Label>
                          <Select
                            id={`card-lang-${section.id}`}
                            onChange={e => updateCard(section.id, { cardLanguage: (e.detail.selectedOption as HTMLElement).textContent ?? '' })}
                          >
                            {LANGUAGES.map(l => <Option key={l} selected={l === section.cardLanguage}>{l}</Option>)}
                          </Select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <Label for={`card-name-${section.id}`}>Card Name</Label>
                          <Input
                            id={`card-name-${section.id}`}
                            value={section.cardName}
                            onInput={(e: CustomEvent) => updateCard(section.id, { cardName: (e.target as HTMLInputElement).value })}
                          />
                        </div>
                      </div>
                      <Button design="Transparent" icon="add" style={{ marginBottom: '1.5rem' }}>Add Translation</Button>

                      {/* Card sections */}
                      {section.cardSections?.map((cs, i) => (
                        <div key={cs.id} style={{ marginTop: i > 0 ? '1.5rem' : 0 }}>
                          <Text style={{ display: 'block', fontWeight: '700', marginBottom: '0.25rem' }}>Section {i + 1}</Text>
                          <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.75rem', fontSize: 'var(--sapFontSmallSize)' }}>
                            Choose a title for section {i + 1}.
                          </Text>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', maxWidth: '36rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <Label for={`cs-lang-${cs.id}`}>Language</Label>
                              <Select
                                id={`cs-lang-${cs.id}`}
                                onChange={e => updateCardSection(section.id, cs.id, { language: (e.detail.selectedOption as HTMLElement).textContent ?? '' })}
                              >
                                {LANGUAGES.map(l => <Option key={l} selected={l === cs.language}>{l}</Option>)}
                              </Select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <Label for={`cs-name-${cs.id}`}>Section Name</Label>
                              <Input
                                id={`cs-name-${cs.id}`}
                                value={cs.name}
                                onInput={(e: CustomEvent) => updateCardSection(section.id, cs.id, { name: (e.target as HTMLInputElement).value })}
                              />
                            </div>
                          </div>
                          <Button design="Transparent" icon="add" style={{ marginBottom: '1rem' }}>Add Translation</Button>
                          <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--sapFontSmallSize)' }}>
                            {cs.field.description}
                          </Text>
                          <MultiComboBox
                            placeholder="Attribute"
                            style={{ maxWidth: '28rem', width: '100%' }}
                            onSelectionChange={(e: CustomEvent) => updateCardSectionAttr(section.id, cs.id, getSelected(e))}
                          >
                            {AVAILABLE_ATTRIBUTES.map(attr => (
                              <MultiComboBoxItem key={attr} text={attr} selected={cs.field.selected.includes(attr)} />
                            ))}
                          </MultiComboBox>
                        </div>
                      ))}

                      <div style={{ marginTop: '1.5rem' }}>
                        <Button design="Transparent" icon="add" onClick={() => addCardSection(section.id)}>Add Section</Button>
                      </div>
                    </div>
                  )}
                </div>
              </ListItemCustom>
            ))}
          </List>
        </SettingsSection>
      )}
      </SettingsPageLayout>
    </PageHeader>
  )
}
