import React, { useState, useRef } from 'react'
import { CheckBox, Label, Text, TextArea, Input, Select, Option, Button, Menu, MenuItem, MenuSeparator, List, ListItemCustom, ListItemStandard, Popover, Icon, Avatar, Dialog, Bar } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { ADMIN_USERS, type ContentLanguage, type ExplorerColumn, type ContextDimension } from '../../contexts/WorkspaceContext'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import { TransferOwnershipDialog } from './components/TransferOwnershipDialog'
import s from './components/SettingsPage.module.css'

const ALL_LANGUAGES = [
  { code: 'af',    label: 'Afrikaans' },
  { code: 'sq',    label: 'Albanian' },
  { code: 'ar',    label: 'Arabic' },
  { code: 'hy',    label: 'Armenian' },
  { code: 'az',    label: 'Azerbaijani' },
  { code: 'eu',    label: 'Basque' },
  { code: 'be',    label: 'Belarusian' },
  { code: 'bn',    label: 'Bengali' },
  { code: 'bs',    label: 'Bosnian' },
  { code: 'bg',    label: 'Bulgarian' },
  { code: 'ca',    label: 'Catalan' },
  { code: 'hr',    label: 'Croatian' },
  { code: 'cs',    label: 'Czech' },
  { code: 'da',    label: 'Danish' },
  { code: 'nl',    label: 'Dutch' },
  { code: 'en',    label: 'English' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'et',    label: 'Estonian' },
  { code: 'fi',    label: 'Finnish' },
  { code: 'fr',    label: 'French' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'fr-CA', label: 'French (Canada)' },
  { code: 'fr-BE', label: 'French (Belgium)' },
  { code: 'gl',    label: 'Galician' },
  { code: 'ka',    label: 'Georgian' },
  { code: 'de',    label: 'German' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'de-AT', label: 'German (Austria)' },
  { code: 'de-CH', label: 'German (Switzerland)' },
  { code: 'el',    label: 'Greek' },
  { code: 'gu',    label: 'Gujarati' },
  { code: 'he',    label: 'Hebrew' },
  { code: 'hi',    label: 'Hindi' },
  { code: 'hu',    label: 'Hungarian' },
  { code: 'is',    label: 'Icelandic' },
  { code: 'id',    label: 'Indonesian' },
  { code: 'ga',    label: 'Irish' },
  { code: 'it',    label: 'Italian' },
  { code: 'ja',    label: 'Japanese' },
  { code: 'kn',    label: 'Kannada' },
  { code: 'kk',    label: 'Kazakh' },
  { code: 'ko',    label: 'Korean' },
  { code: 'lv',    label: 'Latvian' },
  { code: 'lt',    label: 'Lithuanian' },
  { code: 'mk',    label: 'Macedonian' },
  { code: 'ms',    label: 'Malay' },
  { code: 'ml',    label: 'Malayalam' },
  { code: 'mt',    label: 'Maltese' },
  { code: 'mr',    label: 'Marathi' },
  { code: 'mn',    label: 'Mongolian' },
  { code: 'ne',    label: 'Nepali' },
  { code: 'nb',    label: 'Norwegian Bokmål' },
  { code: 'nn',    label: 'Norwegian Nynorsk' },
  { code: 'fa',    label: 'Persian' },
  { code: 'pl',    label: 'Polish' },
  { code: 'pt',    label: 'Portuguese' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pa',    label: 'Punjabi' },
  { code: 'ro',    label: 'Romanian' },
  { code: 'ru',    label: 'Russian' },
  { code: 'sr',    label: 'Serbian' },
  { code: 'sk',    label: 'Slovak' },
  { code: 'sl',    label: 'Slovenian' },
  { code: 'es',    label: 'Spanish' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'es-AR', label: 'Spanish (Argentina)' },
  { code: 'sw',    label: 'Swahili' },
  { code: 'sv',    label: 'Swedish' },
  { code: 'tl',    label: 'Tagalog' },
  { code: 'ta',    label: 'Tamil' },
  { code: 'te',    label: 'Telugu' },
  { code: 'th',    label: 'Thai' },
  { code: 'tr',    label: 'Turkish' },
  { code: 'uk',    label: 'Ukrainian' },
  { code: 'ur',    label: 'Urdu' },
  { code: 'uz',    label: 'Uzbek' },
  { code: 'vi',    label: 'Vietnamese' },
  { code: 'cy',    label: 'Welsh' },
  { code: 'yi',    label: 'Yiddish' },
  { code: 'zh',    label: 'Chinese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
]

const CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY']
const AUTO_SUBSCRIPTION_OPTIONS = [
  'After invitation to comment',
  'After submitted comment',
  'No automatic subscriptions',
]

const AVAILABLE_ATTRIBUTES = [
  'Description', 'Revision', 'Last change', 'Supporting Documents',
  'Status', 'Author', 'Created', 'Category', 'Process Owner',
  'Last modified by', 'Approval status', 'Custom attribute 1',
]

const ALL_ATTR_DEFS: ContextDimension[] = [
  { id: 'ca-1',  name: 'Business Division',    type: 'Selection', options: ['Coffee', 'Tea', 'Dairy', 'Snacks', 'Beverages', 'Health & Beauty'] },
  { id: 'ca-2',  name: 'Market',               type: 'Selection', options: ['Brasil', 'Germany', 'United States', 'Japan', 'United Kingdom', 'France', 'China', 'India'] },
  { id: 'ca-3',  name: 'Region',               type: 'Selection', options: ['EMEA', 'APAC', 'Americas', 'LATAM', 'MEE', 'ANZ'] },
  { id: 'ca-4',  name: 'Country',              type: 'Selection', options: ['Brazil', 'Germany', 'United States', 'Japan', 'United Kingdom', 'France', 'China', 'India', 'Australia'] },
  { id: 'ca-5',  name: 'Business Unit',        type: 'Selection', options: ['B2B', 'B2C', 'Enterprise', 'SMB', 'Public Sector'] },
  { id: 'ca-6',  name: 'Department',           type: 'Selection', options: ['Finance', 'Operations', 'HR', 'IT', 'Sales', 'Marketing', 'Legal'] },
  { id: 'ca-7',  name: 'Product Line',         type: 'Selection', options: ['Core Platform', 'Analytics', 'Integration', 'Mobile', 'AI & Automation'] },
  { id: 'ca-8',  name: 'Customer Segment',     type: 'Selection', options: ['Enterprise', 'Mid-Market', 'SMB', 'Public Sector', 'Startup'] },
  { id: 'ca-9',  name: 'ERP System',           type: 'Single-Line Text' },
  { id: 'ca-10', name: 'Fiscal Year',          type: 'Selection', options: ['FY2024', 'FY2025', 'FY2026'] },
  { id: 'ca-11', name: 'Regulatory Framework', type: 'Selection', options: ['GDPR', 'SOX', 'ISO 27001', 'HIPAA', 'PCI-DSS'] },
  { id: 'ca-12', name: 'Process Owner',        type: 'User' },
  { id: 'ca-13', name: 'Legal Entity',         type: 'Selection', options: ['Acme Inc.', 'Acme GmbH', 'Acme Brasil Ltda', 'Acme KK', 'Acme UK Ltd'] },
  { id: 'ca-14', name: 'Cost Center',          type: 'Single-Line Text' },
]

export default function WorkspaceDetails() {
  const [organization, setOrganization] = useState('Acme Inc.')
  const [currency, setCurrency] = useState('EUR')
  const [autoSubscription, setAutoSubscription] = useState('After invitation to comment')
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null)
  const [addLangOpen, setAddLangOpen] = useState(false)
  const [addLangSearch, setAddLangSearch] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const [disablePrivateFolderOpen, setDisablePrivateFolderOpen] = useState(false)
  const [defaultLangDialogOpen, setDefaultLangDialogOpen] = useState(false)
  const [pendingDefaultLang, setPendingDefaultLang] = useState<string | null>(null)
  const [defaultLangExecCode, setDefaultLangExecCode] = useState('')
  const addLangBtnId = useRef('add-lang-btn').current
  const [openCtxMenu, setOpenCtxMenu] = useState<string | null>(null)
  const [addCtxOpen, setAddCtxOpen] = useState(false)
  const [addCtxSearch, setAddCtxSearch] = useState('')
  const addCtxBtnId = useRef('add-ctx-btn').current

  const {
    workspaceName, setWorkspaceName,
    additionalInfo, setAdditionalInfo,
    privateFolder, setPrivateFolder,
    contentLanguages, setContentLanguages, addContentLanguage, removeContentLanguage,
    moveContentLanguage, reorderContentLanguage, setDefaultLanguage,
    ownerId, setOwnerId,
    explorerColumns, setExplorerColumns,
    contextDimensions, setContextDimensions, addContextDimension, removeContextDimension,
    moveContextDimension, reorderContextDimension,
  } = useWorkspace()

  const [draftWorkspaceName, setDraftWorkspaceName] = useState(workspaceName)

  const savedWorkspaceName = useRef(workspaceName)
  const savedOrganization = useRef(organization)
  const savedCurrency = useRef(currency)
  const savedAutoSubscription = useRef(autoSubscription)
  const savedUploadEnabled = useRef(uploadEnabled)
  const savedSubscriptionsEnabled = useRef(subscriptionsEnabled)
  const savedAdditionalInfo = useRef(additionalInfo)
  const savedPrivateFolder = useRef(privateFolder)
  const savedContentLanguages = useRef<ContentLanguage[]>(contentLanguages)

  const [colOpenMenu, setColOpenMenu] = useState<string | null>(null)
  const [addColOpen, setAddColOpen] = useState(false)
  const [addColSearch, setAddColSearch] = useState('')
  const addColBtnId = useRef('add-col-btn').current
  const savedExplorerColumns = useRef<ExplorerColumn[]>(explorerColumns)
  const savedContextDimensions = useRef<ContextDimension[]>(contextDimensions)

  const handleSave = () => {
    setWorkspaceName(draftWorkspaceName)
    savedWorkspaceName.current = draftWorkspaceName
    savedOrganization.current = organization
    savedCurrency.current = currency
    savedAutoSubscription.current = autoSubscription
    savedUploadEnabled.current = uploadEnabled
    savedSubscriptionsEnabled.current = subscriptionsEnabled
    savedAdditionalInfo.current = additionalInfo
    savedPrivateFolder.current = privateFolder
    savedContentLanguages.current = [...contentLanguages]
    savedExplorerColumns.current = [...explorerColumns]
    savedContextDimensions.current = [...contextDimensions]
    setIsDirty(false)
  }

  const handleReset = () => {
    setDraftWorkspaceName(savedWorkspaceName.current)
    setOrganization(savedOrganization.current)
    setCurrency(savedCurrency.current)
    setAutoSubscription(savedAutoSubscription.current)
    setUploadEnabled(savedUploadEnabled.current)
    setSubscriptionsEnabled(savedSubscriptionsEnabled.current)
    setAdditionalInfo(savedAdditionalInfo.current)
    setPrivateFolder(savedPrivateFolder.current)
    setContentLanguages([...savedContentLanguages.current])
    setExplorerColumns([...savedExplorerColumns.current])
    setContextDimensions([...savedContextDimensions.current])
    setIsDirty(false)
  }

  const activeCodes = new Set(contentLanguages.map(l => l.code))
  const query = addLangSearch.trim().toLowerCase()
  const availableLangs = ALL_LANGUAGES.filter(
    l => !activeCodes.has(l.code) && (!query || l.label.toLowerCase().includes(query))
  )

  // Build display labels: strip country suffix unless multiple variants of the same
  // base language are active (e.g. "Portuguese (Brazil)" only if "Portuguese (Portugal)" is also active).
  const baseLanguageCounts = new Map<string, number>()
  for (const lang of contentLanguages) {
    const base = lang.code.split('-')[0]
    baseLanguageCounts.set(base, (baseLanguageCounts.get(base) ?? 0) + 1)
  }
  const getDisplayLabel = (lang: ContentLanguage) => {
    const base = lang.code.split('-')[0]
    if (!lang.code.includes('-') || (baseLanguageCounts.get(base) ?? 0) <= 1) {
      // Single variant active: use base language name (strip country in parentheses)
      return lang.label.replace(/\s*\([^)]+\)$/, '')
    }
    return lang.label
  }

  const colQuery = addColSearch.trim().toLowerCase()
  const activeAttrs = new Set(explorerColumns.map(c => c.attribute))
  const availableAttrs = AVAILABLE_ATTRIBUTES.filter(
    a => !activeAttrs.has(a) && (!colQuery || a.toLowerCase().includes(colQuery))
  )

  const activeCtxIds = new Set(contextDimensions.map(d => d.id))
  const ctxQuery = addCtxSearch.trim().toLowerCase()
  const availableAttrDefs = ALL_ATTR_DEFS.filter(
    a => !activeCtxIds.has(a.id) && (!ctxQuery || a.name.toLowerCase().includes(ctxQuery))
  )

  const owner = ADMIN_USERS.find(u => u.id === ownerId)!

  return (
    <PageHeader title="Workspace Details" subtitle="Define general workspace information and configurations." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="2rem">

          <SettingsSection title="About this Workspace">
            <div className={s.rowWide}>
              <Label for="workspace-name" showColon className={s.fieldLabel}>Workspace Name</Label>
              <Text className={s.fieldDesc}>
                This name appears on the workspace selection page to help users with multiple workspaces find the one they want.
              </Text>
              <Input
                id="workspace-name"
                value={draftWorkspaceName}
                className={s.fieldFull}
                onInput={e => { setDraftWorkspaceName((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
              />
            </div>
            <div className={s.rowWide}>
              <Label for="organization" showColon className={s.fieldLabel}>Organization</Label>
              <Text className={s.fieldDesc}>
                This is mainly used to name the pool in QuickModel.
              </Text>
              <Input
                id="organization"
                value={organization}
                className={s.fieldFull}
                onInput={e => { setOrganization((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
              />
            </div>
            <div className={s.row}>
              <Label className={s.fieldLabel}>Workspace Owner</Label>
              <Text className={s.fieldDesc}>
                The workspace owner has full administrative control over this workspace.
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div className={s.userRow}>
                  <Avatar initials={owner.initials} colorScheme={owner.colorScheme as any} size="S" />
                  <div className={s.userMeta}>
                    <span className={s.userNameText}>{owner.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      <Icon name="email" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                      {owner.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      <Icon name="employee" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                      {owner.userId}
                    </span>
                    {owner.ownerSince && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                        <Icon name="history" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                        Owner since {new Date(owner.ownerSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <Button onClick={() => setTransferOpen(true)}>Transfer Ownership</Button>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Customer Portal SAP for Me</Label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Text className={s.fieldDesc} style={{ flex: 1 }}>
                  Access usage statistics, audit logs, license consumption, and other workspace insights in SAP for Me.
                </Text>
                <Button icon="action" style={{ flexShrink: 0 }} onClick={() => window.open('https://me.sap.com', '_blank')}>Open SAP for Me</Button>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Workspace Information</Label>
              <Text className={s.fieldDesc}>
                Technical details about this workspace, useful for support and troubleshooting.
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text style={{ minWidth: '7rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Workspace ID</Text>
                  <Text style={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', fontSize: 'var(--sapFontSmallSize)' }}>
                    a2f2b6be2c084ff99680a2afa8f7e2a8
                  </Text>
                  <Button icon="copy" design="Transparent" tooltip="Copy workspace ID" onClick={() => navigator.clipboard.writeText('a2f2b6be2c084ff99680a2afa8f7e2a8')} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text style={{ minWidth: '7rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Version</Text>
                  <Text style={{ flex: 1 }}>v4.14.17</Text>
                  <Button icon="copy" design="Transparent" tooltip="Copy version" onClick={() => navigator.clipboard.writeText('v4.14.17')} />
                </div>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label for="additional-info" showColon className={s.fieldLabel}>Additional Information</Label>
              <Text className={s.fieldDesc}>
                Any information you enter here is shown to all users in the About section, accessible from the user profile menu.
              </Text>
              <TextArea
                id="additional-info"
                value={additionalInfo}
                growing
                growingMaxRows={10}
                className={s.fieldFull}
                placeholder="Enter additional workspace information"
                onInput={e => { setAdditionalInfo((e.target as unknown as HTMLTextAreaElement).value); setIsDirty(true) }}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            title="Business Context"
            subtitle="Define the dimensions that users can set to scope their view of the workspace. These will appear in the shellbar for each user to personalize their context."
          >
            <div className={s.rowFlush}>
              <List
                onMoveOver={e => e.preventDefault()}
                onMove={e => {
                  const sourceId = (e.detail.source.element as HTMLElement).dataset.id ?? ''
                  const destId = (e.detail.destination.element as HTMLElement).dataset.id ?? ''
                  const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
                  if (sourceId && destId && placement !== 'On') {
                    reorderContextDimension(sourceId, destId, placement)
                    setIsDirty(true)
                  }
                }}
              >
                {contextDimensions.map((dim, idx) => (
                  <ListItemCustom
                    key={dim.id}
                    movable
                    data-id={dim.id}
                    type="Inactive"
                    style={{ padding: 0 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '2.75rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        gap: '0.5rem',
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                    >
                      <Icon
                        name="horizontal-grip"
                        style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }}
                      />
                      <span style={{ flex: 1 }}>{dim.name}</span>
                      <SigChipV2 value={dim.type} condensed />
                      <Button
                        id={`ctx-overflow-${dim.id}`}
                        design="Transparent"
                        icon="overflow"
                        accessibleName={`Options for ${dim.name}`}
                        style={{ pointerEvents: 'auto' }}
                        onClick={e => { e.stopPropagation(); setOpenCtxMenu(openCtxMenu === dim.id ? null : dim.id) }}
                      />
                    </div>
                    <Menu
                      opener={`ctx-overflow-${dim.id}`}
                      open={openCtxMenu === dim.id}
                      onClose={() => setOpenCtxMenu(null)}
                      onItemClick={e => {
                        const text = (e.detail.item as HTMLElement).getAttribute('text') ?? ''
                        if (text === 'Move Up') moveContextDimension(dim.id, 'up')
                        else if (text === 'Move Down') moveContextDimension(dim.id, 'down')
                        else if (text === 'Remove') removeContextDimension(dim.id)
                        setIsDirty(true)
                        setOpenCtxMenu(null)
                      }}
                    >
                      <MenuItem text="Move Up" icon="slim-arrow-up" disabled={idx === 0} />
                      <MenuItem text="Move Down" icon="slim-arrow-down" disabled={idx === contextDimensions.length - 1} />
                      <MenuSeparator />
                      <MenuItem text="Remove" icon="decline" />
                    </Menu>
                  </ListItemCustom>
                ))}
              </List>
              <div style={{ padding: '0.5rem 1rem' }}>
                <Button
                  id={addCtxBtnId}
                  icon="add"
                  design="Transparent"
                  onClick={() => { setAddCtxSearch(''); setAddCtxOpen(true) }}
                >
                  Add dimension
                </Button>
                <Popover
                  opener={addCtxBtnId}
                  open={addCtxOpen}
                  onClose={() => setAddCtxOpen(false)}
                  placement="Bottom"
                  horizontalAlign="Start"
                  className="no-padding-popover"
                  style={{ width: '22rem' } as React.CSSProperties}
                >
                  <div style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
                    <Input
                      placeholder="Search attribute definitions…"
                      accessibleName="Search attribute definitions"
                      value={addCtxSearch}
                      onInput={e => setAddCtxSearch((e.target as unknown as HTMLInputElement).value)}
                      className={s.fieldFull}
                    />
                  </div>
                  <List style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {availableAttrDefs.length === 0 && (
                      <ListItemStandard>
                        {ctxQuery ? 'No attribute definitions match your search.' : 'All attribute definitions are already added.'}
                      </ListItemStandard>
                    )}
                    {availableAttrDefs.map(attr => (
                      <ListItemCustom
                        key={attr.id}
                        type="Active"
                        style={{ padding: 0 }}
                        onClick={() => {
                          addContextDimension(attr)
                          setAddCtxOpen(false)
                          setAddCtxSearch('')
                          setIsDirty(true)
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          height: '2.75rem',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.5rem',
                          gap: '0.5rem',
                          boxSizing: 'border-box',
                        }}>
                          <span style={{ flex: 1 }}>{attr.name}</span>
                          <SigChipV2 value={attr.type} condensed />
                        </div>
                      </ListItemCustom>
                    ))}
                  </List>
                </Popover>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Localization">
            <div className={s.rowWide}>
              <Label for="currency" className={s.fieldLabel}>Currency</Label>
              <Text className={s.fieldDesc}>
                Define the default currency.
              </Text>
              <Select
                id="currency"
                className={s.fieldFull}
                onChange={e => { setCurrency((e.detail.selectedOption as HTMLElement).textContent ?? currency); setIsDirty(true) }}
              >
                {CURRENCIES.map(c => <Option key={c} selected={c === currency}>{c}</Option>)}
              </Select>
            </div>
            <div className={s.rowFlush}>
              <div style={{ padding: '0 1rem' }}>
                <Label className={s.fieldLabel}>Content Languages</Label>
              </div>
              <Text className={s.fieldDesc} style={{ padding: '0 1rem' }}>
                Define the languages in which content can be created.
              </Text>
              <List
                onMoveOver={e => e.preventDefault()}
                onMove={e => {
                  const sourceCode = (e.detail.source.element as HTMLElement).dataset.code ?? ''
                  const destCode = (e.detail.destination.element as HTMLElement).dataset.code ?? ''
                  const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
                  if (sourceCode && destCode && placement !== 'On') {
                    reorderContentLanguage(sourceCode, destCode, placement)
                    setIsDirty(true)
                  }
                }}
              >
                {contentLanguages.map((lang, idx) => (
                  <ListItemCustom
                    key={lang.code}
                    movable
                    data-code={lang.code}
                    type="Inactive"
                    style={{ padding: 0 }}
                  >
                    {/*
                      pointer-events: none on the outer div lets drag events reach the
                      shadow <li> (which is draggable when movable is set). Without this,
                      e.target in ListItem._ondragstart is our div, not the shadow <li>,
                      so the drag guard `e.target === this._listItem` fails and DnD breaks.
                      Interactive zones override to pointer-events: auto.
                    */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '2.75rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        gap: '0.5rem',
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                    >
                      <Icon
                        name="horizontal-grip"
                        style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }}
                      />
                      <span style={{ flex: 1 }}>{getDisplayLabel(lang)}</span>
                      {lang.isDefault && <SigChipV2 value="Default" design="positive" condensed />}
                      <Button
                        id={`lang-overflow-${lang.code}`}
                        design="Transparent"
                        icon="overflow"
                        accessibleName={`Options for ${lang.label}`}
                        style={{ pointerEvents: 'auto' }}
                        onClick={e => { e.stopPropagation(); setOpenMenuCode(openMenuCode === lang.code ? null : lang.code) }}
                      />
                    </div>
                    <Menu
                      opener={`lang-overflow-${lang.code}`}
                      open={openMenuCode === lang.code}
                      onClose={() => setOpenMenuCode(null)}
                      onItemClick={e => {
                        const text = (e.detail.item as HTMLElement).getAttribute('text') ?? ''
                        if (text === 'Move Up') moveContentLanguage(lang.code, 'up')
                        else if (text === 'Move Down') moveContentLanguage(lang.code, 'down')
                        else if (text === 'Set as Default') { setPendingDefaultLang(lang.code); setDefaultLangExecCode(''); setDefaultLangDialogOpen(true); return }
                        else if (text === 'Remove') removeContentLanguage(lang.code)
                        setIsDirty(true)
                        setOpenMenuCode(null)
                      }}
                    >
                      <MenuItem text="Move Up" icon="slim-arrow-up" disabled={idx === 0} />
                      <MenuItem text="Move Down" icon="slim-arrow-down" disabled={idx === contentLanguages.length - 1} />
                      {!lang.isDefault && <MenuItem text="Set as Default" icon="favorite" />}
                      {!lang.isDefault && <MenuSeparator />}
                      <MenuItem text="Remove" icon="decline" disabled={lang.isDefault || contentLanguages.length === 1} />
                    </Menu>
                  </ListItemCustom>
                ))}
              </List>
              <div style={{ padding: '0.5rem 1rem' }}>
                <Button
                  id={addLangBtnId}
                  icon="add"
                  design="Transparent"
                  onClick={() => { setAddLangSearch(''); setAddLangOpen(true) }}
                >
                  Add Language
                </Button>
                <Popover
                  opener={addLangBtnId}
                  open={addLangOpen}
                  onClose={() => setAddLangOpen(false)}
                  placement="Bottom"
                  horizontalAlign="Start"
                  className="no-padding-popover"
                  style={{ width: '22rem' } as React.CSSProperties}
                >
                  <div style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
                    <Input
                      placeholder="Search languages…"
                      accessibleName="Search languages"
                      value={addLangSearch}
                      onInput={e => setAddLangSearch((e.target as unknown as HTMLInputElement).value)}
                      className={s.fieldFull}
                    />
                  </div>
                  <List style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {availableLangs.length === 0 && (
                      <ListItemStandard>
                        {query ? 'No languages match your search.' : 'All languages are already active.'}
                      </ListItemStandard>
                    )}
                    {availableLangs.map(lang => (
                      <ListItemStandard
                        key={lang.code}
                        onClick={() => {
                          addContentLanguage({ code: lang.code, label: lang.label, isDefault: false })
                          setAddLangOpen(false)
                          setAddLangSearch('')
                          setIsDirty(true)
                        }}
                      >
                        {lang.label}
                      </ListItemStandard>
                    ))}
                  </List>
                </Popover>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Explorer View"
            subtitle="Select the diagram attributes to be shown as columns in the table view of the explorer."
          >
            <List
              onMoveOver={e => e.preventDefault()}
              onMove={e => {
                const sourceId = (e.detail.source.element as HTMLElement).dataset.id ?? ''
                const destId = (e.detail.destination.element as HTMLElement).dataset.id ?? ''
                const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
                if (!sourceId || !destId || placement === 'On') return
                setExplorerColumns(prev => {
                  const from = prev.findIndex(c => c.id === sourceId)
                  const to = prev.findIndex(c => c.id === destId)
                  if (from === -1 || to === -1) return prev
                  const next = [...prev]
                  const [item] = next.splice(from, 1)
                  const insertAt = placement === 'Before' ? (to > from ? to - 1 : to) : (to < from ? to + 1 : to)
                  next.splice(insertAt, 0, item)
                  return next
                })
                setIsDirty(true)
              }}
            >
              {explorerColumns.map((col, idx) => (
                <ListItemCustom
                  key={col.id}
                  movable
                  data-id={col.id}
                  type="Inactive"
                  style={{ padding: 0 }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    height: '3rem', paddingLeft: '0.5rem', paddingRight: '0.5rem',
                    gap: '0.5rem', boxSizing: 'border-box', pointerEvents: 'none',
                  }}>
                    <Icon
                      name="horizontal-grip"
                      style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.attribute}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', pointerEvents: 'auto', flexShrink: 0 }}>
                      <Input
                        type="Number"
                        value={String(col.width)}
                        style={{ width: '4rem' }}
                        onInput={e => {
                          const v = parseInt((e.target as unknown as HTMLInputElement).value, 10)
                          if (!isNaN(v) && v > 0) {
                            setExplorerColumns(prev => prev.map(c => c.id === col.id ? { ...c, width: v } : c))
                            setIsDirty(true)
                          }
                        }}
                      />
                      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', flexShrink: 0 }}>px</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto', flexShrink: 0 }}>
                      <Button
                        icon="delete"
                        design="Transparent"
                        accessibleName="Remove column"
                        tooltip="Remove"
                        disabled={col.fixed}
                        onClick={e => {
                          e.stopPropagation()
                          setExplorerColumns(prev => prev.filter(c => c.id !== col.id))
                          setIsDirty(true)
                        }}
                      />
                      <Button
                        id={`col-overflow-${col.id}`}
                        icon="overflow"
                        design="Transparent"
                        accessibleName="More options"
                        tooltip="More options"
                        onClick={e => { e.stopPropagation(); setColOpenMenu(colOpenMenu === col.id ? null : col.id) }}
                      />
                    </div>
                  </div>
                  <Menu
                    opener={`col-overflow-${col.id}`}
                    open={colOpenMenu === col.id}
                    onClose={() => setColOpenMenu(null)}
                    onItemClick={e => {
                      const text = (e.detail.item as HTMLElement).getAttribute('text') ?? ''
                      if (text === 'Move Up') {
                        setExplorerColumns(prev => {
                          const i = prev.findIndex(c => c.id === col.id)
                          const target = i - 1
                          if (target < 0) return prev
                          const next = [...prev]; [next[i], next[target]] = [next[target], next[i]]; return next
                        })
                        setIsDirty(true)
                      } else if (text === 'Move Down') {
                        setExplorerColumns(prev => {
                          const i = prev.findIndex(c => c.id === col.id)
                          const target = i + 1
                          if (target >= prev.length) return prev
                          const next = [...prev]; [next[i], next[target]] = [next[target], next[i]]; return next
                        })
                        setIsDirty(true)
                      }
                      setColOpenMenu(null)
                    }}
                  >
                    <MenuItem text="Move Up" icon="slim-arrow-up" disabled={idx === 0} />
                    <MenuItem text="Move Down" icon="slim-arrow-down" disabled={idx === explorerColumns.length - 1} />
                  </Menu>
                </ListItemCustom>
              ))}
            </List>
            <div style={{ padding: '0.5rem 1rem' }}>
              <Button
                id={addColBtnId}
                icon="add"
                design="Transparent"
                onClick={() => { setAddColSearch(''); setAddColOpen(true) }}
              >
                Add Attribute
              </Button>
              <Popover
                opener={addColBtnId}
                open={addColOpen}
                onClose={() => setAddColOpen(false)}
                placement="Bottom"
                horizontalAlign="Start"
                className="no-padding-popover"
                style={{ width: '22rem' } as React.CSSProperties}
              >
                <div style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
                  <Input
                    placeholder="Search attributes…"
                    accessibleName="Search attributes"
                    value={addColSearch}
                    onInput={e => setAddColSearch((e.target as unknown as HTMLInputElement).value)}
                    className={s.fieldFull}
                  />
                </div>
                <List style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {availableAttrs.length === 0 && (
                    <ListItemStandard>
                      {colQuery ? 'No attributes match your search.' : 'All attributes are already added.'}
                    </ListItemStandard>
                  )}
                  {availableAttrs.map(attr => (
                    <ListItemStandard
                      key={attr}
                      onClick={() => {
                        setExplorerColumns(prev => [...prev, { id: `col-${Date.now()}`, attribute: attr, width: 100 }])
                        setAddColOpen(false)
                        setAddColSearch('')
                        setIsDirty(true)
                      }}
                    >
                      {attr}
                    </ListItemStandard>
                  ))}
                </List>
              </Popover>
            </div>
          </SettingsSection>

          <SettingsSection title="Content and Storage">
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Private Folder</Label>
              <CheckBox
                checked={privateFolder}
                text="Enable private folder 'My documents' for every user"
                onChange={() => {
                  if (privateFolder) {
                    setDisablePrivateFolderOpen(true)
                  } else {
                    setPrivateFolder(true)
                    setIsDirty(true)
                  }
                }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If enabled, content in this folder (and its subfolders) is private. Other users, including admins, can't view or edit the content.
              </Text>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>File Upload</Label>
              <CheckBox
                checked={uploadEnabled}
                text="Enable uploading of documents and pictures"
                onChange={() => { setUploadEnabled(v => !v); setIsDirty(true) }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If enabled, users can upload files into your SAP Signavio file storage. Your file storage is limited to 10240 MB.
              </Text>
            </div>
          </SettingsSection>

          <SettingsSection title="Notifications and Subscriptions">
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Content Subscriptions</Label>
              <CheckBox
                checked={subscriptionsEnabled}
                text="Enable content subscriptions"
                onChange={() => { setSubscriptionsEnabled(v => !v); setIsDirty(true) }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If disabled, users are no longer able to subscribe to content changes in the workspace. Users also no longer receive notification emails for existing subscriptions. If enabled again, all previous subscriptions are restored.
              </Text>
            </div>
            <div className={s.rowWide}>
              <Label for="auto-subscription" showColon className={s.fieldLabel}>Automatic Subscriptions</Label>
              <Text className={s.fieldDesc}>
                Subscriptions can be created automatically when a user is invited to comment or when a user has submitted a comment on a model.
              </Text>
              <Select
                id="auto-subscription"
                className={s.fieldFull}
                onChange={e => { setAutoSubscription((e.detail.selectedOption as HTMLElement).textContent ?? autoSubscription); setIsDirty(true) }}
              >
                {AUTO_SUBSCRIPTION_OPTIONS.map(o => <Option key={o} selected={o === autoSubscription}>{o}</Option>)}
              </Select>
            </div>
          </SettingsSection>

      </SettingsPageLayout>
      <TransferOwnershipDialog
        open={transferOpen}
        currentOwnerId={ownerId}
        onClose={() => setTransferOpen(false)}
        onTransfer={newId => { setOwnerId(newId); setTransferOpen(false); setIsDirty(true) }}
      />
      <Dialog
        open={disablePrivateFolderOpen}
        headerText="Disable Private Folder 'My Documents' for Every User"
        className="dialog-padding-s"
        state="Critical"
        footer={
          <Bar design="Footer">
            <Button slot="endContent" design="Negative" onClick={() => {
              setPrivateFolder(false)
              setIsDirty(true)
              setDisablePrivateFolderOpen(false)
            }}>Disable</Button>
            <Button slot="endContent" onClick={() => setDisablePrivateFolderOpen(false)}>Cancel</Button>
          </Bar>
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Text>If you disable the private folder &apos;My Documents&apos;, its content will no longer be available.</Text>
          <Text>Do you want to proceed?</Text>
        </div>
      </Dialog>
      <Dialog
        open={defaultLangDialogOpen}
        headerText="Change Default Language"
        className="dialog-padding-s"
        state="Critical"
        footer={
          <Bar design="Footer">
            <Button slot="endContent" design="Emphasized" disabled={!defaultLangExecCode.trim()} onClick={() => {
              if (pendingDefaultLang) {
                setDefaultLanguage(pendingDefaultLang)
                setIsDirty(true)
              }
              setDefaultLangDialogOpen(false)
              setPendingDefaultLang(null)
              setDefaultLangExecCode('')
            }}>Continue</Button>
            <Button slot="endContent" onClick={() => {
              setDefaultLangDialogOpen(false)
              setPendingDefaultLang(null)
              setDefaultLangExecCode('')
            }}>Cancel</Button>
          </Bar>
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Text>
            Changing the default language has a significant impact on your workspace:
            all diagrams must be reopened and saved to update their previews, and
            all items will be re-indexed for search, which may take several hours.
          </Text>
          <Text>
            To get an execution code, contact SAP Signavio Support via the{' '}
            <a href="https://support.sap.com/en/index.html" target="_blank" rel="noreferrer">SAP ONE Support Launchpad</a>.
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="exec-code" showColon>Execution code</Label>
            <Input
              id="exec-code"
              value={defaultLangExecCode}
              style={{ width: '10rem' }}
              onInput={e => setDefaultLangExecCode((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
        </div>
      </Dialog>
    </PageHeader>
  )
}
