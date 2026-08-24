import { useState, useRef } from 'react'
import {
  CheckBox, Text, RadioButton,
} from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import AudienceSectionBar from './components/AudienceSectionBar'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import InfoPopover from './components/InfoPopover'
import s from './components/SettingsPage.module.css'

type NavDefaultState = 'expanded' | 'collapsed' | 'offscreen'

function NavPreview({ type }: { type: NavDefaultState }) {
  const bars = [65, 80, 55, 75, 60, 70, 50, 68, 58, 72, 62, 45]

  return (
    <div style={{
      border: '1px solid var(--sapList_BorderColor)',
      borderRadius: '4px',
      overflow: 'hidden',
      height: '180px',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      marginTop: '0.5rem',
    }}>
      {/* Shellbar */}
      <div style={{
        height: '28px',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: '4px',
        flexShrink: 0,
        background: '#fff',
      }}>
        <div style={{ width: '10px', height: '8px', background: '#e5e5e5', borderRadius: '1px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <svg width="20" height="10" viewBox="0 0 400 200" style={{ display: 'block', flexShrink: 0 }}>
              <polygon points="400 0 0 0 0 200 200 200 400 0" fill="#0070f2" />
            </svg>
          <div style={{ width: '36px', height: '7px', background: '#e5e5e5', borderRadius: '2px' }} />
        </div>
      </div>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {type === 'expanded' && (
          <div style={{ width: '42%', borderRight: '1px solid var(--sapList_BorderColor)', padding: '4px 0', flexShrink: 0, overflow: 'hidden' }}>
            {bars.map((w, i) => (
              <div key={i} style={{ height: '7px', background: '#e5e5e5', borderRadius: '2px', margin: '3px 6px', width: `${w}%` }} />
            ))}
          </div>
        )}
        {type === 'collapsed' && (
          <div style={{ width: '14px', borderRight: '1px solid var(--sapList_BorderColor)', padding: '4px 0', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {bars.map((_, i) => (
              <div key={i} style={{ height: '7px', width: '7px', background: '#e5e5e5', borderRadius: '1px', margin: '3px 0' }} />
            ))}
          </div>
        )}
        <div style={{ flex: 1, background: '#f2f2f2' }} />
      </div>
    </div>
  )
}

const VIEW_SWITCH_ITEM = {
  id: 'view_switch',
  label: 'Enable view switch for Hub license users',
  desc: 'Allows SAP Signavio Process Collaboration Hub license users to switch between Preview, Published view, and SAP Signavio Process Manager/Modeler from the navigation panel. Users with a modeler license always have this option enabled.',
  checked: true,
}

type NavPanelGroup = {
  group: string
  items: { id: string; label: string; desc?: string; checked: boolean; alwaysOn?: boolean }[]
}

const NAV_PANEL_GROUPS: NavPanelGroup[] = [
  {
    group: '',
    items: [
      { id: 'home', label: 'Home', checked: true, alwaysOn: true },
      { id: 'newsfeed', label: 'Newsfeed', checked: true },
      { id: 'favorites', label: 'Favorites', checked: true },
      { id: 'recent', label: 'Recent', checked: true },
      { id: 'tasks', label: 'Tasks', checked: true },
    ],
  },
  {
    group: 'Browse and Manage',
    items: [
      { id: 'repository', label: 'Repository', desc: 'Removing access also hides breadcrumb navigation and the quick link to Modeling Files on the home page. Users can then navigate only via linked diagrams and the process hierarchy.', checked: true },
      { id: 'process_landscape', label: 'Process Landscape', checked: true },
      { id: 'company_memory', label: 'Company Memory', checked: true },
      { id: 'value_accelerator', label: 'Value Accelerator Library', checked: true },
    ],
  },
  {
    group: 'Transform and Realize Value',
    items: [
      { id: 'objectives', label: 'Objectives', checked: true },
      { id: 'initiatives', label: 'Initiatives', checked: true },
      { id: 'benchmarking_analytics', label: 'Benchmarking Analytics', checked: true },
      { id: 'insights', label: 'Insights', checked: true },
      { id: 'value_analysis', label: 'Value Analysis', checked: true },
    ],
  },
  {
    group: 'Mine and Analyze',
    items: [
      { id: 'data_management', label: 'Data Management', checked: true },
      { id: 'analysis_configuration', label: 'Analysis Configuration', checked: true },
      { id: 'process_analysis', label: 'Process Analysis', checked: true },
      { id: 'analysis_workflows', label: 'Analysis Workflows', checked: true },
    ],
  },
  {
    group: 'Model and Govern',
    items: [
      { id: 'process_manager', label: 'Process Manager', checked: true },
      { id: 'modeler', label: 'Modeler', checked: true },
      { id: 'journey_models', label: 'Journey Models', checked: true },
      { id: 'governance_workflows', label: 'Governance Workflows', checked: true },
    ],
  },
  {
    group: 'Footer',
    items: [
      { id: 'lab_space', label: 'Lab Space', checked: true },
      { id: 'reporting', label: 'Reporting', checked: true },
    ],
  },
]

const NAV_PANEL_ALL_ITEMS = NAV_PANEL_GROUPS.flatMap(g => g.items)

const NAV_STATE_OPTIONS: { value: NavDefaultState; label: string; info?: string }[] = [
  { value: 'expanded', label: 'Expanded' },
  { value: 'collapsed', label: 'Collapsed (Icons Only)' },
  { value: 'offscreen', label: 'Completely off-screen', info: 'The navigation panel will be hidden by default. Users can still open it manually.' },
]

export default function Navigation() {
  const [audience, setAudience] = useState('General audience')

  const initialItems = [VIEW_SWITCH_ITEM, ...NAV_PANEL_ALL_ITEMS].reduce<Record<string, boolean>>(
    (acc, item) => ({ ...acc, [item.id]: item.checked }), {}
  )
  const [items, setItems] = useState(initialItems)
  const [navDefaultState, setNavDefaultState] = useState<NavDefaultState>('expanded')

  const [isDirty, setIsDirty] = useState(false)
  const savedItems = useRef<Record<string, boolean>>(initialItems)
  const savedNavDefaultState = useRef<NavDefaultState>('expanded')

  const toggle = (id: string) => {
    setItems(prev => ({ ...prev, [id]: !prev[id] }))
    setIsDirty(true)
  }

  const handleSave = () => {
    savedItems.current = { ...items }
    savedNavDefaultState.current = navDefaultState
    setIsDirty(false)
  }

  const handleReset = () => {
    setItems({ ...savedItems.current })
    setNavDefaultState(savedNavDefaultState.current)
    setIsDirty(false)
  }

  return (
    <PageHeader title="Navigation" subtitle="Customize the navigation panel and configure which sections are visible for each audience." isDirty={isDirty} onSave={handleSave} onReset={handleReset} onDuplicate={() => {}} duplicateSourceAudience={audience}>
      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />

      <SettingsPageLayout>
        <SettingsSection title="View switch">
          <div className={s.rowWide}>
            <div className={s.checkboxRow}>
              <CheckBox
                checked={items[VIEW_SWITCH_ITEM.id]}
                text={VIEW_SWITCH_ITEM.label}
                onChange={() => toggle(VIEW_SWITCH_ITEM.id)}
                style={{ marginLeft: '-0.5rem' }}
              />
              {VIEW_SWITCH_ITEM.desc && (
                <div className={s.checkboxIndent}>
                  <Text className={s.fieldDescSmall}>{VIEW_SWITCH_ITEM.desc}</Text>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Default Navigation State" subtitle="Set the default state of the navigation panel">
          <div className={s.rowWide}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {NAV_STATE_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setNavDefaultState(opt.value); setIsDirty(true) }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNavDefaultState(opt.value); setIsDirty(true) } }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: `2px solid ${navDefaultState === opt.value ? 'var(--sapSelectedColor, #0070f2)' : 'var(--sapList_BorderColor)'}`,
                    borderRadius: 'var(--sapElement_BorderCornerRadius)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    background: 'var(--sapList_Background)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                    <RadioButton
                      name="nav-default-state"
                      checked={navDefaultState === opt.value}
                      text={opt.label}
                      onChange={() => { setNavDefaultState(opt.value); setIsDirty(true) }}
                    />
                    {opt.info && (
                      <div onClick={e => e.stopPropagation()} style={{ paddingTop: '0.25rem' }}>
                        <InfoPopover id={`nav-state-info-${opt.value}`} header={opt.label}>
                          <Text>{opt.info}</Text>
                        </InfoPopover>
                      </div>
                    )}
                  </div>
                  <NavPreview type={opt.value} />
                </div>
              ))}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Navigation Panel" subtitle="Control which items are visible in the navigation panel for this audience.">
          <div className={s.rowWide}>
            <div className={s.checkboxRow}>
              {NAV_PANEL_GROUPS.map((group, gi) => (
                <div key={gi}>
                  {group.group && (
                    <Text style={{ display: 'block', fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', marginTop: gi === 0 ? 0 : '0.75rem', marginBottom: '0.25rem' }}>
                      {group.group}
                    </Text>
                  )}
                  {group.items.map(item => (
                    <div key={item.id}>
                      <CheckBox
                        checked={items[item.id]}
                        text={item.label}
                        onChange={() => !item.alwaysOn && toggle(item.id)}
                        disabled={item.alwaysOn}
                        style={{ marginLeft: '-0.5rem' }}
                      />
                      {item.desc && (
                        <div className={s.checkboxIndent}>
                          <Text className={s.fieldDescSmall}>{item.desc}</Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
