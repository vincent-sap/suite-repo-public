import { useState, useEffect } from 'react'
import {
  Dialog, Button, Bar, Label, Input, TextArea, Select, Option,
  CheckBox, Text, RadioButton, Icon, SegmentedButton, SegmentedButtonItem,
  MultiComboBox, MultiComboBoxItem, MultiComboBoxItemGroup, DatePicker,
  ColorPalettePopover, ColorPaletteItem, Avatar,
  List, ListItemCustom,
  ComboBox, ComboBoxItem,
} from '@ui5/webcomponents-react'
import { useWorkspace } from '../../../contexts/WorkspaceContext'
import { ASSET_TYPES } from '../../../data/assetTypes'
import { SUB_ELEMENTS } from '../../../data/assetTypes'

// ─── Types ──────────────────────────────────────────────────────────────────

export type AttributeType =
  | 'Multi-Line Text'
  | 'Single-Line Text'
  | 'Date'
  | 'Number'
  | 'Selection'
  | 'Checkbox'
  | 'User'
  | 'Asset Link'
  | 'Ratings'
  | 'Risk Management'
  | 'Dictionary Link'
  | 'Document/URL'
  | 'Model Link'
  | 'Table'

const ATTRIBUTE_TYPES: AttributeType[] = [
  'Single-Line Text',
  'Multi-Line Text',
  'Date',
  'Number',
  'Selection',
  'Checkbox',
  'Asset Link',
  'User',
  'Ratings',
]

const DICT_ATTRIBUTE_TYPES: AttributeType[] = [
  'Single-Line Text',
  'Multi-Line Text',
  'Date',
  'Number',
  'Selection',
  'Checkbox',
  'Dictionary Link',
  'Document/URL',
]

const MODELING_ATTRIBUTE_TYPES: AttributeType[] = [
  'Single-Line Text',
  'Multi-Line Text',
  'Date',
  'Number',
  'Selection',
  'Checkbox',
  'Model Link',
  'Dictionary Link',
  'Document/URL',
  'Risk Management',
  'Table',
]

const MODELING_DICT_ATTRIBUTE_TYPES: AttributeType[] = [
  ...new Set([...MODELING_ATTRIBUTE_TYPES, ...DICT_ATTRIBUTE_TYPES]),
]

const MAX_STARS_OPTIONS = ['3 Stars', '4 Stars', '5 Stars', '6 Stars', '7 Stars']
const RATING_DEFAULT_OPTIONS = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
const DATE_FORMATS = [
  '8/17/23 - (m/d/y)',
  '17/8/23 - (d/m/y)',
  '23/8/17 - (y/m/d)',
  '2023-08-17 - (ISO)',
]
const RISK_TYPES = ['Strategic', 'Operational', 'Financial', 'Compliance', 'Reputational']
const CONTROL_TYPES = ['Preventive', 'Detective', 'Corrective', 'Directive']
const INDICATION_COLORS = [
  '#fb9d9d','#fcc4c4','#ffdfc3','#bae8bc','#d9ebff',
  '#cdf5ec','#e2dbff','#f8d6ff','#ffffff','#eaecee',
]

type SelectionOption = { id: string; label: string; color: string; isDefault: boolean }

function makeOption(label: string, color = INDICATION_COLORS[0]): SelectionOption {
  return { id: `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`, label, color, isDefault: false }
}

// ─── Language Panel ──────────────────────────────────────────────────────────

type LangPanelProps = {
  isDefault: true
  langLabel: string
  children: React.ReactNode
}
type OtherLangPanelProps = {
  isDefault?: false
  langLabel?: string
  children: React.ReactNode
  languages: { code: string; label: string }[]
  selectedLang: string
  onSelectLang: (code: string) => void
}

function LanguagePanel(props: LangPanelProps | OtherLangPanelProps) {
  return (
    <div style={{
      flex: 1,
      border: '1px solid var(--sapSlider_BorderColor)',
      borderRadius: '0.75rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}>
      <div style={{ minHeight: '2rem', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      {props.isDefault ? (
        <div style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>
          {props.langLabel}
        </div>
      ) : (
        <SegmentedButton>
          {(props as OtherLangPanelProps).languages.map(lang => (
            <SegmentedButtonItem
              key={lang.code}
              selected={(props as OtherLangPanelProps).selectedLang === lang.code}
              onClick={() => (props as OtherLangPanelProps).onSelectLang(lang.code)}
            >
              {lang.label}
            </SegmentedButtonItem>
          ))}
        </SegmentedButton>
      )}
      </div>
      {props.children}
    </div>
  )
}

// ─── Field helpers ───────────────────────────────────────────────────────────

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Label required={required} showColon>{label}</Label>
      {children}
    </div>
  )
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  initialType?: AttributeType
  initialName?: string
  initialDescription?: string
  editMode?: boolean
  dialogTitle?: string
  hidePickerLabel?: boolean
  showReuseSection?: boolean
  hideAssignSection?: boolean
  defaultAssignedTo?: string[]
  assignableAssetTypes?: { id: string; name: string }[]
  modelingSubElements?: { id: string; name: string }[]
  dictMode?: boolean
  dictCategories?: { id: string; name: string; parentId?: string }[]
  modelingMode?: boolean
  hideAudience?: boolean
  modelingDictMode?: boolean
  onClose: () => void
  onCreate: (type: AttributeType, name: string) => void
  onReuseAdd?: () => void
}

export function CreateAttributeDialog({ open, initialType, initialName, initialDescription, editMode, dialogTitle, hidePickerLabel, showReuseSection, hideAssignSection, defaultAssignedTo, assignableAssetTypes, modelingSubElements, dictMode, dictCategories, modelingMode, hideAudience, modelingDictMode, onClose, onCreate, onReuseAdd }: Props) {
  const { contentLanguages } = useWorkspace()

  // attribute type
  const [page, setPage] = useState<'pick' | 'configure' | 'reuse'>('pick')
  const [attrType, setAttrType] = useState<AttributeType>(initialType ?? 'Multi-Line Text')

  // reuse existing attributes
  const [reuseSearch, setReuseSearch] = useState('')
  const [reuseSelected, setReuseSelected] = useState<string[]>([])  // confirmed list (shown below on page 2)
  const [reusePending, setReusePending] = useState<string[]>([])     // page 2 in-progress selection
  const [reuseComboResetKey, setReuseComboResetKey] = useState(0)

  const AVAILABLE_ATTRIBUTES_DEFAULT = [
    { name: 'Name', type: 'Single-line Text', usedIn: 'All Asset Types' },
    { name: 'Description', type: 'Multi-line Text', usedIn: 'All Asset Types' },
    { name: 'Status', type: 'Selection', usedIn: 'Initiative, Objective' },
    { name: 'Owner', type: 'User', usedIn: 'Initiative' },
    { name: 'Start Date', type: 'Date', usedIn: 'Initiative' },
    { name: 'Due Date', type: 'Date', usedIn: 'Initiative' },
    { name: 'Priority', type: 'Selection', usedIn: 'Objective' },
    { name: 'Progress', type: 'Number', usedIn: 'Initiative' },
    { name: 'Deputy', type: 'User', usedIn: 'Initiative' },
    { name: 'Reviewed By', type: 'User', usedIn: 'Objective' },
  ]

  const AVAILABLE_ATTRIBUTES_MODELING_DICT = [
    { name: 'Name', type: 'Single-Line Text', usedIn: 'BPMN 2.0, DMN 1.2, Value Chain, Navigation Map, All Categories' },
    { name: 'Description', type: 'Multi-Line Text', usedIn: 'BPMN 2.0, DMN 1.2, Value Chain, Navigation Map, All Categories' },
    { name: 'Status', type: 'Selection', usedIn: 'BPMN 2.0, DMN 1.2, All Categories' },
    { name: 'Owner', type: 'Single-Line Text', usedIn: 'BPMN 2.0, DMN 1.2, All Categories' },
    { name: 'Documentation', type: 'Multi-Line Text', usedIn: 'BPMN 2.0, DMN 1.2, Value Chain, Navigation Map' },
    { name: 'Start Date', type: 'Date', usedIn: 'BPMN 2.0' },
    { name: 'Due Date', type: 'Date', usedIn: 'BPMN 2.0' },
    { name: 'Relevant Document', type: 'Document/URL', usedIn: 'All Categories' },
    { name: 'Approved', type: 'Checkbox', usedIn: 'Organization, Document' },
    { name: 'Valid From', type: 'Date', usedIn: 'All Categories' },
    { name: 'Priority', type: 'Selection', usedIn: 'Risk, Control, Goal' },
    { name: 'Tags', type: 'Multi-Line Text', usedIn: 'All Categories' },
  ]

  const AVAILABLE_ATTRIBUTES_TM_AM = [
    { name: 'Name', type: 'Single-Line Text', usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View' },
    { name: 'Description', type: 'Multi-Line Text', usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View' },
    { name: 'Start Date', type: 'Date', usedIn: 'Objective, Initiative' },
    { name: 'Due Date', type: 'Date', usedIn: 'Objective, Initiative' },
    { name: 'Status', type: 'Selection', usedIn: 'Objective, Initiative, Insight, Dashboard, Process Semantic View' },
    { name: 'Owner', type: 'Single-Line Text', usedIn: 'Objective, Initiative, Insight' },
  ]

  const AVAILABLE_ATTRIBUTES = (modelingMode || dictMode || modelingDictMode)
    ? AVAILABLE_ATTRIBUTES_MODELING_DICT
    : hideAudience
    ? AVAILABLE_ATTRIBUTES_TM_AM
    : AVAILABLE_ATTRIBUTES_DEFAULT

  // Page 2 dropdown: only exclude already confirmed items
  const filteredAvailablePage2 = AVAILABLE_ATTRIBUTES.filter(a =>
    !reuseSelected.includes(a.name) &&
    (!reuseSearch || a.name.toLowerCase().includes(reuseSearch.toLowerCase()))
  )

  // shared state — per-language name & description
  const defaultLang = contentLanguages.find(l => l.isDefault) ?? contentLanguages[0]
  const otherLangs = contentLanguages.filter(l => !l.isDefault)

  const [defaultName, setDefaultName] = useState('')
  const [defaultNameTouched, setDefaultNameTouched] = useState(false)
  const [defaultDescription, setDefaultDescription] = useState('')

  const [otherSelectedLang, setOtherSelectedLang] = useState(otherLangs[0]?.code ?? '')
  // store per-language values: { [code]: { name, description, ... } }
  const [langValues, setLangValues] = useState<Record<string, { name: string; description: string; defaultValue?: string; unit?: string; dateFormat?: string }>>({})
  const [langOptions, setLangOptions] = useState<Record<string, Record<string, string>>>({})

  function getLangVal(code: string) {
    return langValues[code] ?? { name: '', description: '' }
  }
  function setLangVal(code: string, patch: Partial<{ name: string; description: string; defaultValue: string; unit: string; dateFormat: string }>) {
    setLangValues(prev => ({ ...prev, [code]: { ...getLangVal(code), ...patch } }))
  }

  // ── type-specific state ──────────────────────────────────────────────────

  // Multi-line / Single-line text
  const [defaultTextDefaultValue, setDefaultTextDefaultValue] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [allowMultiLang, setAllowMultiLang] = useState(false)
  const [allowMultipleTexts, setAllowMultipleTexts] = useState(false)

  // Date
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0])
  const [enableDateRange, setEnableDateRange] = useState(false)
  const [defaultDate, setDefaultDate] = useState('')
  const [allowMultipleDates, setAllowMultipleDates] = useState(false)

  // Number
  const [defaultUnit, setDefaultUnit] = useState('')
  const [minimum, setMinimum] = useState('')
  const [maximum, setMaximum] = useState('')
  const [numberDefault, setNumberDefault] = useState('')
  const [allowMultipleNumbers, setAllowMultipleNumbers] = useState(false)

  // Selection
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([])
  const [newOptionInput, setNewOptionInput] = useState('')
  const [allowMultipleSelections, setAllowMultipleSelections] = useState(false)

  // Checkbox
  const [checkedByDefault, setCheckedByDefault] = useState(false)

  // User
  const [userSelectionMode, setUserSelectionMode] = useState<'both' | 'individuals' | 'groups'>('individuals')
  const [limitGroups, setLimitGroups] = useState<string[]>([])
  const [allowMultipleUsers, setAllowMultipleUsers] = useState(false)

  // Asset Link
  const [limitSelectionTo, setLimitSelectionTo] = useState<string[]>([])
  const [allowMultipleAssets, setAllowMultipleAssets] = useState(false)
  const [allowUrlInsertion, setAllowUrlInsertion] = useState(false)
  const [allowFileUpload, setAllowFileUpload] = useState(false)
  const [_enableBidirectional, setEnableBidirectional] = useState(true)
  const [_bidirectionalAttr, setBidirectionalAttr] = useState('')

  // Ratings
  const [maxStars, setMaxStars] = useState('5 Stars')
  const [ratingDefault, setRatingDefault] = useState('')

  // Risk Management
  const [riskType, setRiskType] = useState('')
  const [controlType, setControlType] = useState('')

  // Table
  type TableColumnDataType = 'Single-Line Text' | 'Multi-Line Text' | 'Number' | 'Selection' | 'Checkbox'
  type TableColumn = {
    id: string
    dataType: TableColumnDataType
    name: string
    options: { id: string; label: string }[]
    newOptionInput: string
    checkedByDefault: boolean
    unit: string
    defaultValue: string
    minimum: string
    maximum: string
    allowMultiple: boolean
  }
  const makeColumn = (): TableColumn => ({ id: `col-${Date.now()}-${Math.random().toString(36).slice(2)}`, dataType: 'Single-Line Text', name: '', options: [], newOptionInput: '', checkedByDefault: false, unit: '', defaultValue: '', minimum: '', maximum: '', allowMultiple: false })
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([])
  const [tableAllowMultiLang, setTableAllowMultiLang] = useState(false)

  const addTableColumn = () => setTableColumns(prev => [...prev, makeColumn()])
  const removeTableColumn = (id: string) => setTableColumns(prev => prev.filter(c => c.id !== id))
  const moveTableColumn = (id: string, dir: -1 | 1) => setTableColumns(prev => {
    const idx = prev.findIndex(c => c.id === id)
    const t = idx + dir
    if (t < 0 || t >= prev.length) return prev
    const next = [...prev];[next[idx], next[t]] = [next[t], next[idx]]; return next
  })
  const updateTableColumn = (id: string, patch: Partial<TableColumn>) =>
    setTableColumns(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  const addTableColOption = (colId: string, label: string) => {
    if (!label.trim()) return
    setTableColumns(prev => prev.map(c => c.id === colId ? { ...c, options: [...c.options, { id: `opt-${Date.now()}`, label: label.trim() }], newOptionInput: '' } : c))
  }

  // Usage
  const [assignedTo, setAssignedTo] = useState<string[]>([])

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setPage(editMode ? 'configure' : 'pick')
    setReuseSearch('')
    setReuseSelected([])
    setAttrType(initialType ?? 'Multi-Line Text')
    setDefaultName(initialName ?? '')
    setDefaultNameTouched(false)
    setDefaultDescription(initialDescription ?? '')
    setLangValues({})
    setOtherSelectedLang(otherLangs[0]?.code ?? '')

    setDefaultTextDefaultValue('')
    setReadOnly(false)
    setAllowMultiLang(false)
    setAllowMultipleTexts(false)

    setDateFormat(DATE_FORMATS[0])
    setEnableDateRange(false)
    setDefaultDate('')
    setAllowMultipleDates(false)

    setDefaultUnit('')
    setMinimum('')
    setMaximum('')
    setNumberDefault('')
    setAllowMultipleNumbers(false)

    setSelectionOptions([makeOption('Option 1', INDICATION_COLORS[0])])
    setNewOptionInput('')
    setAllowMultipleSelections(false)

    setCheckedByDefault(false)
    setUserSelectionMode('individuals')
    setLimitGroups([])
    setAllowMultipleUsers(false)

    setLimitSelectionTo([])
    setAllowMultipleAssets(false)
    setAllowUrlInsertion(false)
    setAllowFileUpload(false)
    setEnableBidirectional(true)
    setBidirectionalAttr('')

    setMaxStars('5 Stars')
    setRatingDefault('')
    setRiskType('')
    setControlType('')
    setTableColumns([])
    setTableAllowMultiLang(false)
    setAssignedTo(defaultAssignedTo ?? [])
  }, [open])

  // ── Selection option helpers ─────────────────────────────────────────────
  const addSelectionOption = () => {
    const label = newOptionInput.trim()
    if (!label) return
    setSelectionOptions(prev => [...prev, makeOption(label, INDICATION_COLORS[prev.length % INDICATION_COLORS.length])])
    setNewOptionInput('')
  }

  const moveSelOpt = (id: string, dir: -1 | 1) =>
    setSelectionOptions(prev => {
      const idx = prev.findIndex(o => o.id === id)
      const t = idx + dir
      if (t < 0 || t >= prev.length) return prev
      const next = [...prev];
      [next[idx], next[t]] = [next[t], next[idx]]
      return next
    })

  const removeSelOpt = (id: string) => setSelectionOptions(prev => prev.filter(o => o.id !== id))
  const toggleDefault = (id: string) => setSelectionOptions(prev => prev.map(o => ({ ...o, isDefault: o.id === id ? !o.isDefault : o.isDefault })))
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [colorPickerOptId, setColorPickerOptId] = useState<string | null>(null)

  const openColorPicker = (id: string) => {
    setColorPickerOptId(id)
    setColorPickerOpen(true)
  }

  // ── Validation / submit ──────────────────────────────────────────────────
  const nameInvalid = defaultNameTouched && !defaultName.trim()

  const canCreate = defaultName.trim().length > 0 &&
    (attrType !== 'Risk Management' || (riskType !== '' && controlType !== '')) &&
    (attrType !== 'Table' || tableColumns.length > 0)

  const handleCreate = () => {
    if (!defaultName.trim()) { setDefaultNameTouched(true); return }
    onCreate(attrType, defaultName.trim())
  }

  // ── Language panel logic ─────────────────────────────────────────────────
  // Show segmented button for ≤4 other languages, select otherwise
  const useSelectForLangs = otherLangs.length > 4
  const selectedOtherLang = otherLangs.find(l => l.code === otherSelectedLang) ?? otherLangs[0]

  // Short labels for segmented button (take first word of language name)
  function shortLabel(label: string) {
    // e.g. "German (Germany)" → "German"
    return label.replace(/\s*\(.*\)/, '')
  }

  // ── Type-specific content: language panels ───────────────────────────────

  function renderDefaultLangPanel() {
    const hasUnit = !isAltMode && !modelingDictMode && attrType === 'Number'
    const hasDateFormat = !isAltMode && !modelingDictMode && attrType === 'Date'
    const hasDefaultValue = !isAltMode && !modelingDictMode && (attrType === 'Multi-Line Text' || attrType === 'Single-Line Text')
    const hasOptions = !isAltMode && !modelingDictMode && attrType === 'Selection'

    return (
      <>
        <FieldGroup label="Attribute Name" required>
          <Input
            value={defaultName}
            placeholder="Enter here"
            style={{ width: '100%' }}
            valueState={nameInvalid ? 'Negative' : 'None'}
            valueStateMessage={<span>Name must not be empty.</span>}
            onInput={e => setDefaultName((e.target as unknown as HTMLInputElement).value)}
            onBlur={() => setDefaultNameTouched(true)}
          />
        </FieldGroup>
        <FieldGroup label="Description">
          <TextArea value={defaultDescription} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setDefaultDescription((e.target as unknown as HTMLTextAreaElement).value)} />
        </FieldGroup>
        {hasUnit && (
          <FieldGroup label="Unit">
            <Input value={defaultUnit} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setDefaultUnit((e.target as unknown as HTMLInputElement).value)} />
          </FieldGroup>
        )}
        {hasDateFormat && (
          <>
            <FieldGroup label="Date Format" required>
              <Select style={{ width: '100%' }} onChange={e => setDateFormat((e.target as unknown as { value: string }).value)}>
                {DATE_FORMATS.map(f => <Option key={f} selected={dateFormat === f}>{f}</Option>)}
              </Select>
            </FieldGroup>
          </>
        )}
        {hasDefaultValue && (
          <FieldGroup label="Default Value">
            {attrType === 'Multi-Line Text'
              ? <TextArea value={defaultTextDefaultValue} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setDefaultTextDefaultValue((e.target as unknown as HTMLTextAreaElement).value)} />
              : <Input value={defaultTextDefaultValue} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setDefaultTextDefaultValue((e.target as unknown as HTMLInputElement).value)} />
            }
          </FieldGroup>
        )}
        {hasOptions && (
          <>
          <FieldGroup label="Options" required>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
              <Input
                value={newOptionInput}
                placeholder="Enter here"
                style={{ flex: 1 }}
                icon={<Icon slot="icon" name="add" style={{ cursor: 'pointer' }} onClick={addSelectionOption} />}
                onInput={e => setNewOptionInput((e.target as unknown as HTMLInputElement).value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') addSelectionOption() }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {selectionOptions.map((opt, idx) => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '2rem' }}>
                  <Input
                    value={opt.label}
                    style={{ flex: 1 }}
                    onInput={e => setSelectionOptions(prev => prev.map(o => o.id === opt.id ? { ...o, label: (e.target as unknown as HTMLInputElement).value } : o))}
                  />
                  <Button id={`color-btn-${opt.id}`} tooltip="Change color" design="Transparent" style={{ width: '1.25rem', height: '1.25rem', minWidth: 'unset', borderRadius: '50%', background: opt.color, border: '2px solid var(--sapField_BorderColor)', flexShrink: 0, padding: 0 }} onClick={() => openColorPicker(opt.id)} />
                  <Button icon={opt.isDefault ? 'favorite' : 'unfavorite'} tooltip={opt.isDefault ? 'Remove Default' : 'Set as Default'} design="Transparent" onClick={() => toggleDefault(opt.id)} style={{ color: opt.isDefault ? 'var(--sapIndicationColor_5)' : undefined }} />
                  <Button icon="arrow-top" tooltip="Move Up" design="Transparent" disabled={idx === 0} onClick={() => idx > 0 && moveSelOpt(opt.id, -1)} />
                  <Button icon="arrow-bottom" tooltip="Move Down" design="Transparent" disabled={idx === selectionOptions.length - 1} onClick={() => idx < selectionOptions.length - 1 && moveSelOpt(opt.id, 1)} />
                  <Button icon="delete" tooltip="Remove" design="Transparent" onClick={() => removeSelOpt(opt.id)} />
                </div>
              ))}
              {selectionOptions.length === 0 && (
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No options yet. Add an option and press Enter or select +.</Text>
                </div>
              )}
            </div>
          </FieldGroup>
          <ColorPalettePopover
            opener={colorPickerOptId ? `color-btn-${colorPickerOptId}` : undefined}
            open={colorPickerOpen}
            placement="Bottom"
            onItemClick={e => {
              const color = (e.detail as { color: string }).color
              if (colorPickerOptId) setSelectionOptions(prev => prev.map(o => o.id === colorPickerOptId ? { ...o, color } : o))
              setColorPickerOpen(false)
            }}
            onClose={() => setColorPickerOpen(false)}
          >
            {INDICATION_COLORS.map(c => <ColorPaletteItem key={c} value={c} />)}
          </ColorPalettePopover>
          </>
        )}
      </>
    )
  }

  function renderOtherLangPanel() {
    const code = selectedOtherLang?.code ?? ''
    const vals = getLangVal(code)
    const hasUnit = !isAltMode && !modelingDictMode && attrType === 'Number'
    const hasDateFormat = !isAltMode && !modelingDictMode && attrType === 'Date'
    const hasDefaultValue = !isAltMode && !modelingDictMode && (attrType === 'Multi-Line Text' || attrType === 'Single-Line Text')
    const hasOptions = !isAltMode && !modelingDictMode && attrType === 'Selection'

    return (
      <>
        <FieldGroup label="Attribute Name">
          <Input value={vals.name} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setLangVal(code, { name: (e.target as unknown as HTMLInputElement).value })} />
        </FieldGroup>
        <FieldGroup label="Description">
          <TextArea value={vals.description} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setLangVal(code, { description: (e.target as unknown as HTMLTextAreaElement).value })} />
        </FieldGroup>
        {hasUnit && (
          <FieldGroup label="Unit">
            <Input value={vals.unit ?? ''} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setLangVal(code, { unit: (e.target as unknown as HTMLInputElement).value })} />
          </FieldGroup>
        )}
        {hasDateFormat && (
          <FieldGroup label="Date Format">
            <Select style={{ width: '100%' }} onChange={e => setLangVal(code, { dateFormat: (e.target as unknown as { value: string }).value })}>
              {DATE_FORMATS.map(f => <Option key={f} selected={(vals.dateFormat ?? DATE_FORMATS[0]) === f}>{f}</Option>)}
            </Select>
          </FieldGroup>
        )}
        {hasDefaultValue && (
          <FieldGroup label="Default Value">
            {attrType === 'Multi-Line Text'
              ? <TextArea value={vals.defaultValue ?? ''} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setLangVal(code, { defaultValue: (e.target as unknown as HTMLTextAreaElement).value })} />
              : <Input value={vals.defaultValue ?? ''} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setLangVal(code, { defaultValue: (e.target as unknown as HTMLInputElement).value })} />
            }
          </FieldGroup>
        )}
        {hasOptions && (
          <FieldGroup label="Options">
            <Input disabled placeholder="Enter here" style={{ width: '100%' }} icon={<Icon slot="icon" name="add" />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
              {selectionOptions.map((opt, _idx) => (
                <Input
                  key={opt.id}
                  value={(langOptions[selectedOtherLang?.code ?? ''] ?? {})[opt.id] ?? ''}
                  placeholder="Enter here"
                  style={{ width: '100%' }}
                  onInput={e => {
                    const val = (e.target as unknown as HTMLInputElement).value
                    const code = selectedOtherLang?.code ?? ''
                    setLangOptions(prev => ({ ...prev, [code]: { ...(prev[code] ?? {}), [opt.id]: val } }))
                  }}
                />
              ))}
            </div>
          </FieldGroup>
        )}
      </>
    )
  }

  // Whether to show two-panel language layout
  const showLangPanels = true

  // Convenience flag — both dict and modeling share the same "simplified" layout rules
  const isAltMode = dictMode || modelingMode

  // ── Render ───────────────────────────────────────────────────────────────
  const TYPE_CARDS: { type: AttributeType; icon: string }[] = modelingDictMode ? [
    { type: 'Single-Line Text', icon: 'text' },
    { type: 'Multi-Line Text', icon: 'text' },
    { type: 'Date', icon: 'calendar' },
    { type: 'Number', icon: 'number-sign' },
    { type: 'Selection', icon: 'multiselect-none' },
    { type: 'Checkbox', icon: 'complete' },
    { type: 'Model Link', icon: 'SAP-icons-v4/process-manager' },
    { type: 'Dictionary Link', icon: 'course-book' },
    { type: 'Document/URL', icon: 'document' },
    { type: 'Risk Management', icon: 'SAP-icons-v4/overlay-risk-control' },
    { type: 'Table', icon: 'table-view' },
  ] : modelingMode ? [
    { type: 'Single-Line Text', icon: 'text' },
    { type: 'Multi-Line Text', icon: 'text' },
    { type: 'Date', icon: 'calendar' },
    { type: 'Number', icon: 'number-sign' },
    { type: 'Selection', icon: 'multiselect-none' },
    { type: 'Checkbox', icon: 'complete' },
    { type: 'Model Link', icon: 'SAP-icons-v4/process-manager' },
    { type: 'Dictionary Link', icon: 'course-book' },
    { type: 'Document/URL', icon: 'document' },
    { type: 'Risk Management', icon: 'SAP-icons-v4/overlay-risk-control' },
    { type: 'Table', icon: 'table-view' },
  ] : dictMode ? [
    { type: 'Single-Line Text', icon: 'text' },
    { type: 'Multi-Line Text', icon: 'text' },
    { type: 'Date', icon: 'calendar' },
    { type: 'Number', icon: 'number-sign' },
    { type: 'Selection', icon: 'multiselect-none' },
    { type: 'Checkbox', icon: 'complete' },
    { type: 'Dictionary Link', icon: 'course-book' },
    { type: 'Document/URL', icon: 'document' },
  ] : [
    { type: 'Single-Line Text', icon: 'text' },
    { type: 'Multi-Line Text', icon: 'text' },
    { type: 'Date', icon: 'calendar' },
    { type: 'Number', icon: 'number-sign' },
    { type: 'Selection', icon: 'multiselect-none' },
    { type: 'Checkbox', icon: 'complete' },
    { type: 'Asset Link', icon: 'chain-link' },
    { type: 'User', icon: 'family-care' },
    { type: 'Ratings', icon: 'unfavorite' },
  ]

  if (page === 'reuse') {

    return (
      <Dialog
        open={open}
        className="dialog-padding-s no-padding-dialog"
        style={{ width: '50rem' }}
        onClose={onClose}
        header={
          <Bar
            design="Header"
            style={{ width: '100%' }}
            startContent={
              <>
                <Button icon="slim-arrow-left" design="Transparent" tooltip="Back" onClick={() => { setPage('pick'); setReuseSearch('') }} />
                <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>Use Existing Attributes</Text>
              </>
            }
          />
        }
        footer={
          <Bar
            design="Footer"
            endContent={
              <>
                <Button design="Emphasized" disabled={reuseSelected.length === 0} onClick={() => {
                  reuseSelected.forEach(name => {
                    const attr = AVAILABLE_ATTRIBUTES.find(a => a.name === name)
                    onCreate(attr?.type as AttributeType ?? 'Single-Line Text', name)
                  })
                  setReuseSelected([])
                  setReuseSearch('')
                  onReuseAdd?.()
                  onClose()
                }}>Save</Button>
                <Button design="Transparent" onClick={() => { setReuseSelected([]); setPage('pick'); setReuseSearch('') }}>Cancel</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search row — MultiComboBox for adding MORE attributes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MultiComboBox
              key={`p2-${reuseComboResetKey}`}
              style={{ flex: 1 }}
              placeholder="Search for existing attributes"
              onSelectionChange={(e: any) => {
                const selected = ((e.detail.items as any[]) ?? []).map((el: any) => el.text).filter(Boolean) as string[]
                setReusePending(selected)
              }}
            >
              {filteredAvailablePage2.map(a => (
                <MultiComboBoxItem key={a.name} text={a.name} selected={reusePending.includes(a.name)} />
              ))}
            </MultiComboBox>
            <Button
              design="Default"
              disabled={reusePending.length === 0}
              onClick={() => {
                setReuseSelected(prev => [...prev, ...reusePending.filter(n => !prev.includes(n))])
                setReusePending([])
                setReuseComboResetKey(k => k + 1)
              }}
            >Add</Button>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', marginBottom: '-1rem' }} />

          {/* Selected attributes list using StandardListItem */}
          {reuseSelected.length === 0 ? (
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              No attributes selected
            </Text>
          ) : (
            <List separators="Inner">
              {reuseSelected.map(name => {
                const attr = AVAILABLE_ATTRIBUTES.find(a => a.name === name)
                return (
                  <ListItemCustom key={name} type="Inactive" className="reuse-list-item" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.75rem', padding: '8px 0', boxSizing: 'border-box', cursor: 'default' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{name}</span>
                        <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr?.type ?? '–'}</span>
                      </div>
                      <Button
                        icon="decline"
                        design="Transparent"
                        tooltip={`Remove ${name}`}
                        onClick={() => setReuseSelected(prev => prev.filter(n => n !== name))}
                      />
                    </div>
                  </ListItemCustom>
                )
              })}
            </List>
          )}
        </div>
      </Dialog>
    )
  }

  if (page === 'pick') {
    return (
      <Dialog
        open={open}
        preventInitialFocus
        className="dialog-padding-s no-padding-dialog"
        style={{ width: '52rem' }}
        onClose={onClose}
        header={
          <Bar design="Header" style={{ width: '100%' }}>
            <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
              {dialogTitle ?? 'Add Custom Attribute'}
            </Text>
          </Bar>
        }
        footer={
          <Bar
            design="Footer"
            endContent={
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            }
          />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {showReuseSection && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Use Existing Attributes</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MultiComboBox
                    style={{ flex: 1 }}
                    placeholder="Search for existing attributes"
                    onSelectionChange={(e: any) => {
                      const selected = ((e.detail.items as any[]) ?? []).map((el: any) => el.text).filter(Boolean) as string[]
                      setReuseSelected(selected)
                    }}
                  >
                    {AVAILABLE_ATTRIBUTES.map(a => (
                      <MultiComboBoxItem key={a.name} text={a.name} selected={reuseSelected.includes(a.name)} />
                    ))}
                  </MultiComboBox>
                  <Button design="Default" disabled={reuseSelected.length === 0} onClick={() => { setReusePending([]); setPage('reuse') }}>
                    Add
                  </Button>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0.25rem 0' }} />
            </>
          )}
          {!hidePickerLabel && <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Create New Attribute</Text>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {TYPE_CARDS.map(({ type, icon }) => (
              <div
                key={type}
                role="button"
                tabIndex={0}
                onClick={() => { setAttrType(type); setPage('configure') }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAttrType(type); setPage('configure') } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem',
                  border: '1px solid var(--sapSlider_BorderColor)',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  background: 'var(--sapList_Background)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--sapList_Background)')}
              >
                <Avatar
                  size="S"
                  shape="Square"
                  colorScheme="Accent6"
                  icon={icon}
                  style={{ flexShrink: 0 }}
                />
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTile_TitleTextColor)' }}>{type}</Text>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      className="dialog-padding-s no-padding-dialog"
      style={{ width: '52rem' }}
      onClose={onClose}
      header={
        <Bar
          design="Header"
          style={{ width: '100%' }}
          startContent={
            <>
              {!editMode && (
                <Button
                  icon="slim-arrow-left"
                  design="Transparent"
                  tooltip="Back"
                  onClick={() => setPage('pick')}
                />
              )}
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
                {editMode ? 'Edit Attribute' : (dialogTitle ?? 'Create New Attribute')}
              </Text>
            </>
          }
        />
      }
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!canCreate} onClick={handleCreate}>{editMode ? 'Save' : 'Create Attribute'}</Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Attribute Details ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>Attribute Details</Text>

          {/* Attribute Type selector */}
          <FieldGroup label="Attribute Type" required>
            <Select
              style={{ width: '100%' }}
              onChange={e => setAttrType((e.target as unknown as { value: string }).value as AttributeType)}
            >
              {(modelingDictMode ? MODELING_DICT_ATTRIBUTE_TYPES : modelingMode ? MODELING_ATTRIBUTE_TYPES : dictMode ? DICT_ATTRIBUTE_TYPES : ATTRIBUTE_TYPES).map(t => <Option key={t} selected={attrType === t}>{t}</Option>)}
            </Select>
          </FieldGroup>

          {/* Language panels */}
          {showLangPanels && otherLangs.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
              {/* Default language panel */}
              <LanguagePanel isDefault langLabel={hideAudience ? shortLabel(defaultLang?.label ?? 'English') : `${shortLabel(defaultLang?.label ?? 'English')} (Default)`}>
                {renderDefaultLangPanel()}
              </LanguagePanel>

              {/* Other languages panel */}
              {!hideAudience && <div style={{
                flex: 1,
                border: '1px solid var(--sapSlider_BorderColor)',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}>
                {/* Language selector header — same height as default panel header */}
                <div style={{ minHeight: '2rem', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                {/* Language selector: segmented button or select */}
                {useSelectForLangs ? (
                  <Select
                    style={{ width: '100%' }}
                    onChange={e => setOtherSelectedLang((e.target as unknown as { value: string }).value)}
                  >
                    {otherLangs.map(l => (
                      <Option key={l.code} selected={otherSelectedLang === l.code} value={l.code}>
                        {shortLabel(l.label)}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <SegmentedButton>
                    {otherLangs.map(l => (
                      <SegmentedButtonItem
                        key={l.code}
                        selected={otherSelectedLang === l.code}
                        onClick={() => setOtherSelectedLang(l.code)}
                      >
                        {shortLabel(l.label)}
                      </SegmentedButtonItem>
                    ))}
                  </SegmentedButton>
                )}
                </div>
                {renderOtherLangPanel()}
              </div>}
            </div>
          )}

          {/* No other languages: single panel */}
          {showLangPanels && otherLangs.length === 0 && (
            <div style={{
              border: '1px solid var(--sapSlider_BorderColor)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>
                {hideAudience ? shortLabel(defaultLang?.label ?? 'English') : `${shortLabel(defaultLang?.label ?? 'English')} (Default)`}
              </div>
              {renderDefaultLangPanel()}
            </div>
          )}

          {/* Default Value outside language panels — for modelingDictMode only */}
          {modelingDictMode && !isAltMode && (attrType === 'Single-Line Text' || attrType === 'Multi-Line Text') && (
            <FieldGroup label="Default Value">
              {attrType === 'Multi-Line Text'
                ? <TextArea value={getLangVal(defaultLang?.code ?? 'en').defaultValue ?? ''} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setLangVal(defaultLang?.code ?? 'en', { defaultValue: (e.target as unknown as HTMLTextAreaElement).value })} />
                : <Input value={getLangVal(defaultLang?.code ?? 'en').defaultValue ?? ''} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setLangVal(defaultLang?.code ?? 'en', { defaultValue: (e.target as unknown as HTMLInputElement).value })} />
              }
            </FieldGroup>
          )}

          {/* Date Format outside language panels — for modelingDictMode only */}
          {modelingDictMode && !isAltMode && attrType === 'Date' && (
            <FieldGroup label="Date Format" required>
              <Select style={{ width: '100%' }} onChange={e => setLangVal(defaultLang?.code ?? 'en', { dateFormat: (e.target as unknown as { value: string }).value })}>
                {DATE_FORMATS.map(f => <Option key={f} selected={(getLangVal(defaultLang?.code ?? 'en').dateFormat ?? DATE_FORMATS[0]) === f}>{f}</Option>)}
              </Select>
            </FieldGroup>
          )}

          {/* Options outside language panels — for modelingDictMode only */}
          {modelingDictMode && !isAltMode && attrType === 'Selection' && (
            <>
              <FieldGroup label="Options" required>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <Input
                    value={newOptionInput}
                    placeholder="Enter here"
                    style={{ flex: 1 }}
                    icon={<Icon slot="icon" name="add" style={{ cursor: 'pointer' }} onClick={addSelectionOption} />}
                    onInput={e => setNewOptionInput((e.target as unknown as HTMLInputElement).value)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') addSelectionOption() }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectionOptions.map((opt, idx) => (
                    <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '2rem' }}>
                      <Input value={opt.label} style={{ flex: 1 }} onInput={e => setSelectionOptions(prev => prev.map(o => o.id === opt.id ? { ...o, label: (e.target as unknown as HTMLInputElement).value } : o))} />
                      <Button icon={opt.isDefault ? 'favorite' : 'unfavorite'} tooltip={opt.isDefault ? 'Remove Default' : 'Set as Default'} design="Transparent" onClick={() => toggleDefault(opt.id)} style={{ color: opt.isDefault ? 'var(--sapIndicationColor_5)' : undefined }} />
                      <Button icon="arrow-top" tooltip="Move Up" design="Transparent" disabled={idx === 0} onClick={() => idx > 0 && moveSelOpt(opt.id, -1)} />
                      <Button icon="arrow-bottom" tooltip="Move Down" design="Transparent" disabled={idx === selectionOptions.length - 1} onClick={() => idx < selectionOptions.length - 1 && moveSelOpt(opt.id, 1)} />
                      <Button icon="delete" tooltip="Remove" design="Transparent" onClick={() => removeSelOpt(opt.id)} />
                    </div>
                  ))}
                  {selectionOptions.length === 0 && (
                    <div style={{ padding: '0.5rem 0.75rem' }}>
                      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No options yet. Add an option and press Enter or select +.</Text>
                    </div>
                  )}
                </div>
              </FieldGroup>
            </>
          )}

          {/* Checkbox: no language panels, just single name/description */}
          {!showLangPanels && (
            <div style={{
              border: '1px solid var(--sapSlider_BorderColor)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>
                {shortLabel(defaultLang?.label ?? 'English')}
              </div>
              <FieldGroup label="Attribute Name" required>
                <Input
                  value={defaultName}
                  placeholder="Enter here"
                  style={{ width: '100%' }}
                  valueState={nameInvalid ? 'Negative' : 'None'}
                  valueStateMessage={<span>Name must not be empty.</span>}
                  onInput={e => setDefaultName((e.target as unknown as HTMLInputElement).value)}
                  onBlur={() => setDefaultNameTouched(true)}
                />
              </FieldGroup>
              <FieldGroup label="Description">
                <TextArea value={defaultDescription} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setDefaultDescription((e.target as unknown as HTMLTextAreaElement).value)} />
              </FieldGroup>
            </div>
          )}

          {/* Type-specific below-panel fields */}
          {attrType === 'Number' && !isAltMode && (
            <>
              <FieldGroup label="Minimum:">
                <Input value={minimum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setMinimum((e.target as unknown as HTMLInputElement).value)} />
              </FieldGroup>
              <FieldGroup label="Maximum:">
                <Input value={maximum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setMaximum((e.target as unknown as HTMLInputElement).value)} />
              </FieldGroup>
              {!modelingDictMode && <FieldGroup label="Default Value">
                <Input value={numberDefault} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setNumberDefault((e.target as unknown as HTMLInputElement).value)} />
              </FieldGroup>}
            </>
          )}

          {attrType === 'Number' && isAltMode && (
            <>
              <FieldGroup label="Minimum:">
                <Input value={minimum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setMinimum((e.target as unknown as HTMLInputElement).value)} />
              </FieldGroup>
              <FieldGroup label="Maximum:">
                <Input value={maximum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setMaximum((e.target as unknown as HTMLInputElement).value)} />
              </FieldGroup>
            </>
          )}

          {attrType === 'Asset Link' && (
            <FieldGroup label="Limit Selection To:">
              <MultiComboBox
                style={{ width: '100%' }}
                placeholder="Select asset types"
                onSelectionChange={e => {
                  const items = (e.detail as { items: Array<{ text: string }> }).items
                  setLimitSelectionTo(items.map(i => i.text))
                }}
              >
                {ASSET_TYPES.map(t => (
                  <MultiComboBoxItem key={t.id} text={t.name} selected={limitSelectionTo.includes(t.name)} />
                ))}
              </MultiComboBox>
            </FieldGroup>
          )}

          {attrType === 'Dictionary Link' && (
            <FieldGroup label="Limit Selection To:">
              <MultiComboBox
                style={{ width: '100%' }}
                placeholder="Select a dictionary category"
                onSelectionChange={e => {
                  const items = (e.detail as { items: Array<{ text: string }> }).items
                  setLimitSelectionTo(items.map(i => i.text))
                }}
              >
                {(dictCategories ?? []).map(c => (
                  <MultiComboBoxItem key={c.id} text={c.name} selected={limitSelectionTo.includes(c.name)} />
                ))}
              </MultiComboBox>
            </FieldGroup>
          )}

          {attrType === 'Ratings' && (
            <>
              <FieldGroup label="Maximum Stars Allowed:">
                <Select style={{ width: '100%' }} onChange={e => setMaxStars((e.target as unknown as { value: string }).value)}>
                  {MAX_STARS_OPTIONS.map(o => <Option key={o} selected={maxStars === o}>{o}</Option>)}
                </Select>
              </FieldGroup>
              <FieldGroup label="Default Value">
                <Select style={{ width: '100%' }} onChange={e => setRatingDefault((e.target as unknown as { value: string }).value)}>
                  <Option value="">0 Stars</Option>
                  {RATING_DEFAULT_OPTIONS.map(o => <Option key={o} selected={ratingDefault === o}>{o}</Option>)}
                </Select>
              </FieldGroup>
            </>
          )}

          {attrType === 'Risk Management' && (
            <>
              <FieldGroup label="Risk Type:" required>
                <ComboBox
                  style={{ width: '100%' }}
                  placeholder="Select risk type"
                  value={riskType}
                  onInput={e => setRiskType((e.target as unknown as HTMLInputElement).value)}
                  onChange={e => setRiskType((e.target as unknown as { value: string }).value)}
                >
                  {RISK_TYPES.map(t => <ComboBoxItem key={t} text={t} />)}
                </ComboBox>
              </FieldGroup>
              <FieldGroup label="Control Type:" required>
                <ComboBox
                  style={{ width: '100%' }}
                  placeholder="Select control type"
                  value={controlType}
                  onInput={e => setControlType((e.target as unknown as HTMLInputElement).value)}
                  onChange={e => setControlType((e.target as unknown as { value: string }).value)}
                >
                  {CONTROL_TYPES.map(t => <ComboBoxItem key={t} text={t} />)}
                </ComboBox>
              </FieldGroup>
            </>
          )}

          {/* Alt mode (dict or modeling): shared below-panel fields */}
          {isAltMode && (attrType === 'Single-Line Text' || attrType === 'Multi-Line Text') && (
            <FieldGroup label="Default Value">
              {attrType === 'Multi-Line Text'
                ? <TextArea value={defaultTextDefaultValue} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => setDefaultTextDefaultValue((e.target as unknown as HTMLTextAreaElement).value)} />
                : <Input value={defaultTextDefaultValue} placeholder="Enter here" style={{ width: '100%' }} onInput={e => setDefaultTextDefaultValue((e.target as unknown as HTMLInputElement).value)} />
              }
            </FieldGroup>
          )}

          {isAltMode && attrType === 'Date' && (
            <FieldGroup label="Date Format" required>
              <Select style={{ width: '100%' }} onChange={e => setDateFormat((e.target as unknown as { value: string }).value)}>
                {DATE_FORMATS.map(f => <Option key={f} selected={dateFormat === f}>{f}</Option>)}
              </Select>
            </FieldGroup>
          )}

          {isAltMode && attrType === 'Selection' && (
            <FieldGroup label="Options" required>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <Input
                  value={newOptionInput}
                  placeholder="Enter here"
                  style={{ flex: 1 }}
                  icon={<Icon slot="icon" name="add" style={{ cursor: 'pointer' }} onClick={addSelectionOption} />}
                  onInput={e => setNewOptionInput((e.target as unknown as HTMLInputElement).value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') addSelectionOption() }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {selectionOptions.map((opt, idx) => (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '2rem' }}>
                    <Input
                      value={opt.label}
                      style={{ flex: 1 }}
                      onInput={e => setSelectionOptions(prev => prev.map(o => o.id === opt.id ? { ...o, label: (e.target as unknown as HTMLInputElement).value } : o))}
                    />
                    <Button icon={opt.isDefault ? 'favorite' : 'unfavorite'} tooltip={opt.isDefault ? 'Remove Default' : 'Set as Default'} design="Transparent" onClick={() => toggleDefault(opt.id)} style={{ color: opt.isDefault ? 'var(--sapIndicationColor_5)' : undefined }} />
                    <Button icon="arrow-top" tooltip="Move Up" design="Transparent" disabled={idx === 0} onClick={() => idx > 0 && moveSelOpt(opt.id, -1)} />
                    <Button icon="arrow-bottom" tooltip="Move Down" design="Transparent" disabled={idx === selectionOptions.length - 1} onClick={() => idx < selectionOptions.length - 1 && moveSelOpt(opt.id, 1)} />
                    <Button icon="delete" tooltip="Remove" design="Transparent" onClick={() => removeSelOpt(opt.id)} />
                  </div>
                ))}
                {selectionOptions.length === 0 && (
                  <div style={{ padding: '0.5rem 0.75rem' }}>
                    <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No options yet. Add an option and press Enter or select +.</Text>
                  </div>
                )}
              </div>
            </FieldGroup>
          )}

          {/* Table: Columns section */}
          {attrType === 'Table' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Label required>Columns:</Label>
                <Button design="Default" icon="add" onClick={addTableColumn}>Add Column</Button>
              </div>
              {tableColumns.length === 0 && (
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', fontStyle: 'italic' }}>
                  No columns yet. Select "Add Column" to start.
                </Text>
              )}
              {tableColumns.map((col, idx) => (
                <div key={col.id} style={{
                  border: '1px solid var(--sapGroup_ContentBorderColor)',
                  borderRadius: '0.25rem',
                  padding: '0.75rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Data Type + Column Name row */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label>Data Type:</Label>
                        <Select style={{ width: '100%' }} onChange={e => updateTableColumn(col.id, { dataType: (e.target as unknown as { value: string }).value as any })}>
                          {(['Single-Line Text', 'Multi-Line Text', 'Number', 'Selection', 'Checkbox'] as const).map(t => (
                            <Option key={t} selected={col.dataType === t}>{t}</Option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label showColon>Column Name</Label>
                        <Input value={col.name} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { name: (e.target as unknown as HTMLInputElement).value })} />
                      </div>
                    </div>

                    {/* Type-specific sub-fields */}
                    {col.dataType === 'Selection' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label>Options:</Label>
                        <Input
                          value={col.newOptionInput}
                          placeholder="Enter here"
                          style={{ width: '100%' }}
                          icon={<Icon slot="icon" name="add" style={{ cursor: 'pointer' }} onClick={() => addTableColOption(col.id, col.newOptionInput)} />}
                          onInput={e => updateTableColumn(col.id, { newOptionInput: (e.target as unknown as HTMLInputElement).value })}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') addTableColOption(col.id, col.newOptionInput) }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          {col.options.map((opt, oidx) => (
                            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '2rem' }}>
                              <Input value={opt.label} style={{ flex: 1 }} onInput={e => updateTableColumn(col.id, { options: col.options.map(o => o.id === opt.id ? { ...o, label: (e.target as unknown as HTMLInputElement).value } : o) })} />
                              <Button icon="arrow-top" tooltip="Move Up" design="Transparent" disabled={oidx === 0} onClick={() => { const opts = [...col.options]; if (oidx > 0) { [opts[oidx-1], opts[oidx]] = [opts[oidx], opts[oidx-1]]; updateTableColumn(col.id, { options: opts }) } }} />
                              <Button icon="arrow-bottom" tooltip="Move Down" design="Transparent" disabled={oidx === col.options.length - 1} onClick={() => { const opts = [...col.options]; if (oidx < opts.length - 1) { [opts[oidx], opts[oidx+1]] = [opts[oidx+1], opts[oidx]]; updateTableColumn(col.id, { options: opts }) } }} />
                              <Button icon="delete" tooltip="Remove" design="Transparent" onClick={() => updateTableColumn(col.id, { options: col.options.filter(o => o.id !== opt.id) })} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {col.dataType === 'Checkbox' && (
                      <CheckBox text="Checked by default" checked={col.checkedByDefault} onChange={e => updateTableColumn(col.id, { checkedByDefault: (e.target as unknown as { checked: boolean }).checked })} />
                    )}

                    {col.dataType === 'Number' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <Label>Unit:</Label>
                            <Input value={col.unit} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { unit: (e.target as unknown as HTMLInputElement).value })} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <Label>Default Value:</Label>
                            <Input value={col.defaultValue} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { defaultValue: (e.target as unknown as HTMLInputElement).value })} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <Label>Minimum:</Label>
                            <Input value={col.minimum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { minimum: (e.target as unknown as HTMLInputElement).value })} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <Label>Maximum:</Label>
                            <Input value={col.maximum} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { maximum: (e.target as unknown as HTMLInputElement).value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {(col.dataType === 'Single-Line Text' || col.dataType === 'Multi-Line Text') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label>Default Value:</Label>
                        {col.dataType === 'Multi-Line Text'
                          ? <TextArea value={col.defaultValue} placeholder="Enter here" rows={3} style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { defaultValue: (e.target as unknown as HTMLTextAreaElement).value })} />
                          : <Input value={col.defaultValue} placeholder="Enter here" style={{ width: '100%' }} onInput={e => updateTableColumn(col.id, { defaultValue: (e.target as unknown as HTMLInputElement).value })} />
                        }
                        {col.dataType === 'Single-Line Text' && (
                          <CheckBox text="Allow multiple texts" checked={col.allowMultiple} onChange={e => updateTableColumn(col.id, { allowMultiple: (e.target as unknown as { checked: boolean }).checked })} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column row actions */}
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', flexShrink: 0 }}>
                    <Button icon="arrow-top" tooltip="Move Up" design="Transparent" disabled={idx === 0} onClick={() => moveTableColumn(col.id, -1)} />
                    <Button icon="arrow-bottom" tooltip="Move Down" design="Transparent" disabled={idx === tableColumns.length - 1} onClick={() => moveTableColumn(col.id, 1)} />
                    <Button icon="delete" tooltip="Remove column" design="Transparent" onClick={() => removeTableColumn(col.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Settings ── */}
        {(!modelingDictMode || (attrType !== 'Date' && attrType !== 'Number' && attrType !== 'Checkbox' && attrType !== 'Risk Management')) && (!isAltMode || (attrType !== 'Date' && attrType !== 'Number' && attrType !== 'Checkbox' && attrType !== 'Risk Management')) && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>Settings</Text>

          {/* Date settings */}
          {attrType === 'Date' && !isAltMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Enable Date Range" checked={enableDateRange} onChange={e => setEnableDateRange((e.target as unknown as { checked: boolean }).checked)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label>Default Date:</Label>
                <DatePicker
                  value={defaultDate}
                  onChange={e => setDefaultDate((e.target as unknown as { value: string }).value)}
                  style={{ width: '14rem' }}
                />
              </div>
              <CheckBox text="Allow multiple dates" checked={allowMultipleDates} onChange={e => setAllowMultipleDates((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read-only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Multi-line / Single-line text settings */}
          {attrType === 'Single-Line Text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Allow multiple texts" checked={allowMultipleTexts} onChange={e => setAllowMultipleTexts((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read-only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Allow users to enter text in all configured languages" checked={allowMultiLang} onChange={e => setAllowMultiLang((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}
          {attrType === 'Multi-Line Text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Set as read-only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Allow users to enter text in all configured languages" checked={allowMultiLang} onChange={e => setAllowMultiLang((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Number settings */}
          {attrType === 'Number' && !isAltMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Allow multiple numbers" checked={allowMultipleNumbers} onChange={e => setAllowMultipleNumbers((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read-only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Selection settings */}
          {attrType === 'Selection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Allow multiple selections" checked={allowMultipleSelections} onChange={e => setAllowMultipleSelections((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Checkbox settings */}
          {attrType === 'Checkbox' && !isAltMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Checked by default" checked={checkedByDefault} onChange={e => setCheckedByDefault((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* User settings */}
          {attrType === 'User' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <RadioButton
                  name="user-mode"
                  text="Allow selection of individual users and user groups"
                  checked={userSelectionMode === 'both'}
                  onChange={() => setUserSelectionMode('both')}
                />
                <div>
                  <RadioButton
                    name="user-mode"
                    text="Allow selection of individual users only"
                    checked={userSelectionMode === 'individuals'}
                    onChange={() => setUserSelectionMode('individuals')}
                  />
                  <div style={{ marginTop: '0.375rem' }}>
                    <FieldGroup label="Limit to users belonging to these groups:">
                      <MultiComboBox
                        style={{ width: '100%' }}
                        disabled={userSelectionMode !== 'individuals'}
                        onSelectionChange={e => {
                          const items = (e.detail as { items: Array<{ text: string }> }).items
                          setLimitGroups(items.map(i => i.text))
                        }}
                      >
                        {['Admins', 'Editors', 'Viewers', 'Process Owners'].map(g => (
                          <MultiComboBoxItem key={g} text={g} selected={limitGroups.includes(g)} />
                        ))}
                      </MultiComboBox>
                    </FieldGroup>
                  </div>
                </div>
                <RadioButton
                  name="user-mode"
                  text="Allow selection of user groups only"
                  checked={userSelectionMode === 'groups'}
                  onChange={() => setUserSelectionMode('groups')}
                />
              </div>
              <CheckBox text="Allow selection of multiple users or groups" checked={allowMultipleUsers} onChange={e => setAllowMultipleUsers((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Asset Link settings — full 4 checkboxes */}
          {attrType === 'Asset Link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckBox text="Allow multiple assets linking" checked={allowMultipleAssets} onChange={e => setAllowMultipleAssets((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Set as read-only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Allow URL insertion" checked={allowUrlInsertion} onChange={e => setAllowUrlInsertion((e.target as unknown as { checked: boolean }).checked)} />
              <CheckBox text="Allow file upload (like PDF, XLSX)" checked={allowFileUpload} onChange={e => setAllowFileUpload((e.target as unknown as { checked: boolean }).checked)} />
            </div>
          )}

          {/* Model Link settings — first checkbox only, no limit section */}
          {attrType === 'Model Link' && (
            <CheckBox text="Allow multiple assets linking" checked={allowMultipleAssets} onChange={e => setAllowMultipleAssets((e.target as unknown as { checked: boolean }).checked)} />
          )}

          {/* Dictionary Link settings (first checkbox only) */}
          {attrType === 'Dictionary Link' && (
            <CheckBox text="Allow multiple assets linking" checked={allowMultipleAssets} onChange={e => setAllowMultipleAssets((e.target as unknown as { checked: boolean }).checked)} />
          )}

          {/* Document/URL settings (first checkbox only) */}
          {attrType === 'Document/URL' && (
            <CheckBox text="Allow multiple assets linking" checked={allowMultipleAssets} onChange={e => setAllowMultipleAssets((e.target as unknown as { checked: boolean }).checked)} />
          )}

          {/* Ratings settings */}
          {attrType === 'Ratings' && (
            <CheckBox text="Set as read only" checked={readOnly} onChange={e => setReadOnly((e.target as unknown as { checked: boolean }).checked)} />
          )}

          {/* Table settings */}
          {attrType === 'Table' && (
            <CheckBox text="Allow user to enter text in all configured content languages" checked={tableAllowMultiLang} onChange={e => setTableAllowMultiLang((e.target as unknown as { checked: boolean }).checked)} />
          )}
        </section>
        )}

        {/* ── Usage ── */}
        {!hideAssignSection && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>Usage</Text>
          <FieldGroup label="Assign Attribute to:" required={!!(modelingMode || modelingDictMode || dictMode)}>
            <MultiComboBox
              style={{ width: '100%' }}
              onSelectionChange={e => {
                const items = (e.detail as { items: Array<{ text: string }> }).items
                setAssignedTo(items.map(i => i.text))
              }}
            >
              {(() => {
                const all = (assignableAssetTypes ?? ASSET_TYPES).filter(t => {
                  if (attrType === 'Risk Management') return t.name === 'BPMN 2.0'
                  const isDictCat = dictCategories?.some(c => c.id === t.id)
                  const noDictTypes: AttributeType[] = ['Table', 'Model Link']
                  if (isDictCat && noDictTypes.includes(attrType)) return false
                  return true
                })
                const modelingItems = all.filter(t => !dictCategories?.some(c => c.id === t.id))
                const dictItems = all.filter(t => dictCategories?.some(c => c.id === t.id))

                // Sub-elements to show under "Modeling Elements" group
                const subElems: { id: string; name: string }[] = modelingDictMode
                  ? Object.values(SUB_ELEMENTS).flat().filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)
                  : (modelingSubElements ?? [])

                // Build map: subElementId -> asset type names
                const subElemAssetTypes: Record<string, string> = {}
                Object.entries(SUB_ELEMENTS).forEach(([assetTypeId, elements]) => {
                  const assetTypeName = ASSET_TYPES.find(t => t.id === assetTypeId)?.name ?? assetTypeId
                  elements.forEach(el => {
                    subElemAssetTypes[el.id] = subElemAssetTypes[el.id]
                      ? `${subElemAssetTypes[el.id]}, ${assetTypeName}`
                      : assetTypeName
                  })
                })

                if (modelingItems.length > 0 && dictItems.length > 0) {
                  return (<>
                    <MultiComboBoxItemGroup headerText="Modeling Asset Types">
                      {modelingItems.map(t => <MultiComboBoxItem key={t.id} text={t.name} selected={assignedTo.includes(t.name)} />)}
                    </MultiComboBoxItemGroup>
                    {subElems.length > 0 && (
                      <MultiComboBoxItemGroup headerText="Modeling Elements">
                        {subElems.map(e => <MultiComboBoxItem key={e.id} text={e.name} additionalText={subElemAssetTypes[e.id]} selected={assignedTo.includes(e.name)} />)}
                      </MultiComboBoxItemGroup>
                    )}
                    <MultiComboBoxItemGroup headerText="Dictionary Categories">
                      {dictItems.map(t => <MultiComboBoxItem key={t.id} text={t.name} selected={assignedTo.includes(t.name)} />)}
                    </MultiComboBoxItemGroup>
                  </>)
                }
                if (subElems.length > 0) {
                  return (<>
                    {all.length > 0 && (
                      <MultiComboBoxItemGroup headerText="Modeling Asset Types">
                        {all.map(t => <MultiComboBoxItem key={t.id} text={t.name} selected={assignedTo.includes(t.name)} />)}
                      </MultiComboBoxItemGroup>
                    )}
                    <MultiComboBoxItemGroup headerText="Modeling Elements">
                      {subElems.map(e => <MultiComboBoxItem key={e.id} text={e.name} additionalText={subElemAssetTypes[e.id]} selected={assignedTo.includes(e.name)} />)}
                    </MultiComboBoxItemGroup>
                  </>)
                }
                return all.map(t => <MultiComboBoxItem key={t.id} text={t.name} selected={assignedTo.includes(t.name)} />)
              })()}
            </MultiComboBox>
          </FieldGroup>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            If nothing is selected, the attribute will be created unassigned. You can assign it later.
          </Text>
        </section>
        )}

      </div>
    </Dialog>
  )
}
