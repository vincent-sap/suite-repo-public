import { useMemo, useState, memo, useRef, useCallback, useEffect, useId } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ObjectPage,
  ObjectPageHeader,
  ObjectPageSection,
  ObjectPageTitle,
  Avatar,
  FlexBox,
  FlexBoxDirection,
  FlexBoxWrap,
  FlexBoxAlignItems,
  FlexBoxJustifyContent,
  Text,
  Label,
  Title,
  Button,
  Icon,
  Breadcrumbs,
  BreadcrumbsItem,
  AnalyticalTable,
  Tab,
  Select,
  Option,
  ToolbarItem,
  Toast,
  MessageBox,
  Menu,
  MenuItem,
  Dialog,
  SegmentedButton,
  SegmentedButtonItem,
  AnalyticalTableSelectionMode,
  ResponsivePopover,
  Popover,
  Bar,
  List,
  ListItemCustom,
  ListItemStandard,
  Link,
  Input,
  TextArea,
  MessageStrip,
  SelectDialog,
  SplitterLayout,
  SplitterElement,
  Tag,
  Card,
  Panel,
  AnalyticalCardHeader,
  NumericSideIndicator,
  DeviationIndicator,
  ValueColor,
} from '@ui5/webcomponents-react'
import WrappingType from '@ui5/webcomponents/dist/types/WrappingType.js'
import PopoverPlacement from '@ui5/webcomponents/dist/types/PopoverPlacement.js'
import PopoverHorizontalAlign from '@ui5/webcomponents/dist/types/PopoverHorizontalAlign.js'
import ListSeparators from '@ui5/webcomponents/dist/types/ListSeparator.js'
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState.js'
import { SigChipV2, SigDomainObject, SigInlineEdit, SigRatingIndicator, SigRightSidePanel, SigTableWrapper, type IndicationColorDesigns } from '@signavio/sap-signavio-uixtension'
import { LineChart } from './components/LineChart'
import {
  INITIATIVES, VALUE_CASES, INSIGHTS, ASSETS,
  STATUS_DOT_COLOR,
  type Insight, type InsightStatus, type ValueCase, type ValueType, type Asset, type AssetType,
} from '../../data/ptm'
import { ObjectPageMode } from '@ui5/webcomponents-react'
import type { ObjectPageDomRef } from '@ui5/webcomponents-react'
import EnrichDialogAccordion from './components/initiative/EnrichDialogAccordion'
import AvatarColorScheme from '@ui5/webcomponents/dist/types/AvatarColorScheme.js'
import AvatarShape from '@ui5/webcomponents/dist/types/AvatarShape.js'
import AvatarSize from '@ui5/webcomponents/dist/types/AvatarSize.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_DESIGN: Record<ValueType, string> = {
  'Profit and Loss': 'indication6',
  'Working Capital': 'indication7',
}

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'SEK']

// Short representative option lists for the value-case side-panel chip editors.
// (Full production lists are longer; these keep the interaction fidelity while
// staying light — see the Figma "Interaction states" spec.)
const VALUE_DRIVER_OPTIONS = [
  'Annual Recurring Revenue',
  'Average Order Value',
  'Cash Flow from Operations',
  'Churn Rate',
  'Customer Acquisition Cost',
  'Operational Efficiency and Process Quality',
  'Return on Investment',
  'Workforce Productivity',
]
const IMPACT_AREA_OPTIONS: ValueType[] = ['Profit and Loss', 'Working Capital']
const UNIT_TYPE_OPTIONS = ['Count', 'Currency', 'Duration', 'None', 'Percentage'] as const
// Secondary dropdown options, keyed by primary unit type. None/Percentage have no secondary.
const UNIT_SUB_OPTIONS: Record<string, string[]> = {
  Currency: ['EUR', 'USD', 'GBP', 'INR'],
  Count: ['Cases', 'Documents', 'Items', 'Processes', 'Transactions'],
  Duration: ['Days', 'Months', 'Milliseconds'],
}
const SHORT_CURRENCIES = ['EUR', 'USD', 'GBP', 'INR']

// Split a stored metric value like "56%", "14 Days", "1,045 tC…", "25162.1K" into
// its numeric lead and trailing unit. Per the Figma "Interaction states" spec the
// value chips (Baseline/Current/Target/Potential Value) show the NUMBER ONLY — the
// unit/currency is a separate chip or the separate "Unit" field, never fused in.
function splitNumberUnit(v: string): { num: string; unit: string } {
  const m = /^\s*(-?[\d.,]+\s*[KMkm]?)(.*)$/.exec(v ?? '')
  if (!m) return { num: (v ?? '').trim(), unit: '' }
  return { num: m[1].trim(), unit: m[2].trim() }
}

// ─── Value Cases — grouped row expand/collapse renderer ──────────────────────

const ValueDriverGrouped = memo((props: any) => {
  const { cell, row } = props
  const { column: _col, onClick } = row.getToggleRowExpandedProps({ column: cell.column })
  const icon = row.isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', cursor: 'pointer', width: '100%' }}
      onClick={onClick}
    >
      <Icon
        name={icon}
        style={{ width: '1rem', height: '1rem', flexShrink: 0, color: 'var(--sapContent_IconColor)' }}
      />
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--sapFontBoldFamily)',
          fontWeight: 'bold',
        }}
        title={`${cell.value} (${row.subRows?.length ?? 0})`}
      >
        {cell.value}
        <span style={{ fontWeight: 'normal', color: 'var(--sapContent_LabelColor)', marginLeft: '0.25rem' }}>
          ({row.subRows?.length ?? 0})
        </span>
      </span>
    </div>
  )
})

// ─── Value Cases table cell renderers ─────────────────────────────────────────

// Shared renderer for the Potential / Realized Value columns. Per the Figma spec
// these use three fixed tracks so nothing drifts row-to-row:
//   [icon track] → [number, right-aligned to a divider] → [unit, left-aligned, fixed width]
// The number and unit are split (never fused/truncated together) so every number
// lines up on one vertical edge and every currency/unit lines up on the next.
const VALUE_UNIT_TRACK = 42 // px — fixed column for the trailing unit/currency
const VALUE_ICON_TRACK = 24 // px — fixed leading track that reserves space for the sync tag

const ValueNumberUnit = memo(({ value, icon, reserveIcon }: { value: string; icon?: React.ReactNode; reserveIcon?: boolean }) => {
  const { num, unit } = splitNumberUnit(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
      {reserveIcon && (
        <div style={{ width: VALUE_ICON_TRACK, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
      )}
      <strong style={{ flex: 1, minWidth: 0, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {num}
      </strong>
      {unit && (
        <span style={{ width: VALUE_UNIT_TRACK, flexShrink: 0, textAlign: 'left', paddingLeft: 4, color: 'var(--sapTextColor)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          {unit}
        </span>
      )}
    </div>
  )
})

const TruncatedCell = memo((props: any) => {
  const value = props.cell?.value ?? ''
  return (
    <span title={value} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
      {value}
    </span>
  )
})

const RightCell = memo((props: any) => {
  const value = props.cell?.value ?? ''
  return (
    <span style={{ display: 'block', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
      {value}
    </span>
  )
})

const PotentialValueCell = memo((props: any) => {
  if (props.row?.isGrouped) return null
  return <ValueNumberUnit value={props.cell?.value ?? ''} />
})

const PotentialValueAggregated = memo((props: any) => {
  const first: ValueCase | undefined = props.row?.subRows?.[0]?.original
  if (!first) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8, overflow: 'hidden' }}>
      <SigChipV2 value={first.groupType} design={TYPE_DESIGN[first.groupType] as never} condensed />
      <div style={{ flex: 1, minWidth: 0 }}>
        <ValueNumberUnit value={first.groupPotential} />
      </div>
    </div>
  )
})

const RealizedValueCell = memo((props: any) => {
  if (props.row?.isGrouped) return null
  const value = props.cell?.value ?? ''
  const row: ValueCase = props.row?.original
  const adjusted = row?.realizedValueManuallyAdjusted
  const needsReview = row?.realizedValueNeedsReview
  // Two-state sync tag:
  //  • Manually adjusted (default) → NEUTRAL GRAY tag (indication 10: #eaecee fill,
  //    #45484a icon). Just signals "this value was entered by hand".
  //  • Needs review → AMBER tag (indication 3b: #ffdfc3 fill, #b95100 icon). Only
  //    when the source Current/Target changed since the manual value was saved, so
  //    the user should re-check it. UI5 Set1/colorScheme=3 renders the SOLID
  //    indication_3 (#e76500); we override the 3 CSS vars (which inherit into the
  //    Tag's shadow DOM) to the light variant, with border = fill so there's no outline.
  const tagStyle: React.CSSProperties = needsReview
    ? ({
        flexShrink: 0,
        '--sapIndicationColor_3_Background': 'var(--sapIndicationColor_3b)',
        '--sapIndicationColor_3_BorderColor': 'var(--sapIndicationColor_3b)',
        '--sapIndicationColor_3_TextColor': 'var(--sapIndicationColor_3)',
      } as React.CSSProperties)
    : ({
        flexShrink: 0,
        '--sapIndicationColor_3_Background': 'var(--sapIndicationColor_10b)',
        '--sapIndicationColor_3_BorderColor': 'var(--sapIndicationColor_10b)',
        '--sapIndicationColor_3_TextColor': 'var(--sapIndicationColor_10)',
      } as React.CSSProperties)
  const tooltip = needsReview
    ? `The Current and Target values have changed since the Realized Value was last updated on ${row?.realizedValueChangedOn ?? ''}. Review the Realized Value to ensure it is still accurate.`
    : 'Realized Value was manually adjusted.'
  return (
    <ValueNumberUnit
      value={value}
      reserveIcon
      icon={adjusted ? (
        <Tag
          hideStateIcon
          design="Set1"
          colorScheme="3"
          title={tooltip}
          style={tagStyle}
        ><Icon slot="icon" name="synchronize" /></Tag>
      ) : undefined}
    />
  )
})

const RealizedValueAggregated = memo((props: any) => {
  const first: ValueCase | undefined = props.row?.subRows?.[0]?.original
  if (!first) return null
  return <ValueNumberUnit value={first.groupRealized} reserveIcon />
})

const SourceCell = memo((props: any) => {
  if (props.row?.isGrouped) return null
  const row: ValueCase = props.row?.original
  if (!row) return null
  return <SigChipV2 value={row.source} design="none" condensed />
})

const SourceActionCell = memo((props: any) => {
  if (props.row?.isGrouped) return null
  const row: ValueCase = props.row?.original
  if (!row) return null
  return (
    <Button
      icon={row.source === 'Manual' ? 'delete' : 'broken-link'}
      design="Transparent"
      onClick={(e: any) => e.stopPropagation()}
    />
  )
})

// ─── Value Case Side Panel ─────────────────────────────────────────────────────

function AttrRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Label showColon style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{label}</Label>
      {children}
    </div>
  )
}

// Group header for a panel section — matches staging: ui5-Title at 14px. The bold
// appearance comes from the 72-Bold font cut, not the weight.
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Title level="H6" style={{ fontSize: 'var(--sapFontSize)', fontWeight: '400' }}>{children}</Title>
  )
}

// Source field — matches staging: a rich link block (not a chip). A rounded 32×32
// avatar with the link icon, the source name, a URL subline, and a trailing
// external-link button.
function SourceField({ source }: { source: string }) {
  const sourceUrl = 'http://localhost:4003/p/hub/value-analysis/customizable-metric/value-case/2c7452'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar
        icon="SAP-icons-v4/link"
        size={AvatarSize.XS}
        shape={AvatarShape.Square}
        style={{
          flexShrink: 0,
          background: 'rgb(209, 239, 255)',
          color: 'var(--sapButton_Emphasized_Background)',
          borderRadius: '8px',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{source}</Text>
        <Text
          style={{
            fontSize: 'var(--sapFontSize)',
            color: 'var(--sapContent_LabelColor)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {sourceUrl}
        </Text>
      </div>
      <Link href={sourceUrl} target="_blank" style={{ flexShrink: 0 }}>
        <Icon name="SAP-icons-v4/link" style={{ width: '1rem', height: '1rem', color: 'var(--sapButton_Emphasized_Background)' }} />
      </Link>
    </div>
  )
}

// ─── Editable chip fields (value-case side panel) ──────────────────────────────
// Interaction spec: Figma "Interaction states for the value case side panel"
// (Manual value cases). Access mode = edit-access ("Default"). Each field:
//   • Filled  → chip with an end "×" (endActionIcon="decline") that clears it,
//               plus (for selects) a trailing chevron / (for text) a click-to-edit.
//   • Empty   → a Transparent "+" add button that opens the editor.
//   • Editing → a popover (number/text) or dropdown/SelectDialog (selection) with
//               confirm(✓)/cancel(×). Number & URL editors validate → Error state
//               (red border + red message + disabled confirm) on invalid input.

// "+" add affordance shown when a field is empty.
function AddChipButton({ id, onClick }: { id?: string; onClick: () => void }) {
  return (
    <Button id={id} icon="add" design="Transparent" onClick={onClick} accessibleName="Add value" style={{ alignSelf: 'flex-start' }} />
  )
}

// A removable, click-to-open chip: shows the value with a trailing chevron (for
// selections) and an end "×" that clears the field.
function EditableChip({
  id, value, design = 'none', leadingIcon, trailingIcon, onOpen, onClear,
}: {
  id?: string
  value: string
  design?: string
  leadingIcon?: string
  trailingIcon?: string
  onOpen: () => void
  onClear: () => void
}) {
  return (
    <SigChipV2
      id={id}
      value={value}
      design={design as never}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      endActionIcon="decline"
      onClick={onOpen}
      onEndActionClick={(e: any) => { e.stopPropagation(); onClear() }}
    />
  )
}

// Popover editor for a single number (Baseline/Current/Target/Potential Value).
// Validates numeric input → Error state per spec.
function NumberEditPopover({
  open, opener, initial, suffix, placeholder, onConfirm, onCancel,
}: {
  open: boolean
  opener: string
  initial: string
  suffix?: string
  placeholder?: string
  onConfirm: (v: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(initial)
  useEffect(() => { if (open) setDraft(initial) }, [open, initial])
  // Numeric check: allow digits, separators and a trailing K/M/% shorthand, but
  // flag clearly non-numeric text (e.g. "ad") like the spec's error example.
  const numeric = draft.trim() === '' || /^-?[\d.,]+\s*[KMkm%]?$/.test(draft.trim())
  const invalid = draft.trim() !== '' && !numeric
  return (
    <Popover
      open={open}
      opener={opener}
      placement={PopoverPlacement.Bottom}
      horizontalAlign={PopoverHorizontalAlign.Start}
      onClose={onCancel}
      hideArrow
      className="no-padding-popover"
      style={{ minWidth: '250px' }}
    >
      {/* Content region — matches Figma "Popover Add User": p-16px */}
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Input
          value={draft}
          placeholder={placeholder ?? 'Enter number'}
          valueState={invalid ? ValueState.Negative : ValueState.None}
          onInput={(e: any) => setDraft(e.target.value)}
          style={{ flex: 1 }}
        >
          <span slot="valueStateMessage">Value must be numeric</span>
        </Input>
        {suffix && <Text style={{ color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>{suffix}</Text>}
      </div>
      {/* Footer Bar — Figma "Footer Bar": Emphasized confirm + Transparent cancel */}
      <Bar
        design="Footer"
        endContent={
          <>
            <Button icon="accept" design="Emphasized" disabled={invalid} onClick={() => onConfirm(draft.trim())} accessibleName="Confirm" />
            <Button icon="decline" design="Transparent" onClick={onCancel} accessibleName="Cancel" />
          </>
        }
      />
    </Popover>
  )
}

// Baseline / Current / Target — number field. Empty → "+"; filled → chip; editing → number popover.
function NumberChipField({ value, onChange, leadingIcon, design }: { value: string; onChange: (v: string) => void; leadingIcon?: string; design?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const anchorId = `num-${id.replace(/:/g, '')}`
  const isEmpty = !value || value === '-'
  // The chip shows the NUMBER ONLY (Figma spec) — the trailing unit ("%", "Days",
  // "K", "tCO₂e"…) is stripped from the chip but preserved when editing/clearing so
  // the stored value round-trips unchanged.
  const { num, unit } = splitNumberUnit(value)
  return (
    <>
      {isEmpty
        ? <AddChipButton id={anchorId} onClick={() => setOpen(true)} />
        : <span id={anchorId}><EditableChip value={num} leadingIcon={leadingIcon} design={design} onOpen={() => setOpen(true)} onClear={() => onChange('-')} /></span>}
      <NumberEditPopover
        open={open}
        opener={anchorId}
        initial={isEmpty ? '' : num}
        placeholder="Enter number"
        onConfirm={(v) => {
          if (v === '') { onChange('-') }
          else if (!unit) { onChange(v) }
          else { onChange(unit === '%' ? `${v}%` : `${v} ${unit}`) }
          setOpen(false)
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

// Generic single-select dropdown backed by a Popover list (Impact Area, Unit type/sub).
function DropdownChipField({
  value, options, design, emptyPlaceholder = true, onChange, chipDesign,
}: {
  value: string
  options: readonly string[]
  design?: (v: string) => string
  emptyPlaceholder?: boolean
  onChange: (v: string) => void
  chipDesign?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const anchorId = `dd-${id.replace(/:/g, '')}`
  const isEmpty = !value
  return (
    <>
      {isEmpty && emptyPlaceholder
        ? <AddChipButton id={anchorId} onClick={() => setOpen(true)} />
        : (
          <span id={anchorId}>
            <EditableChip
              value={value}
              design={chipDesign ?? (design ? design(value) : 'none')}
              trailingIcon="slim-arrow-down"
              onOpen={() => setOpen(true)}
              onClear={() => onChange('')}
            />
          </span>
        )}
      <Popover
        open={open}
        opener={anchorId}
        hideArrow
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setOpen(false)}
        className="no-padding-popover"
        style={{ minWidth: '250px' }}
      >
        {/* Figma "Popover SingleSelect": native StandardListItem rows — 32px tall,
            16px inline padding, sapFontSize, native selection background + separators. */}
        <List
          selectionMode="Single"
          onSelectionChange={(e: any) => {
            const sel = e.detail?.selectedItems?.[0]?.textContent?.trim()
            if (sel) onChange(sel)
            setOpen(false)
          }}
        >
          {options.map(opt => (
            <ListItemStandard key={opt} selected={opt === value}>{opt}</ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}

// Value Driver — opens a searchable Select Dialog (single select).
function ValueDriverField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const anchorId = `vd-${id.replace(/:/g, '')}`
  const isEmpty = !value
  return (
    <>
      {isEmpty
        ? <AddChipButton id={anchorId} onClick={() => setOpen(true)} />
        : <span id={anchorId}><EditableChip value={value} onOpen={() => setOpen(true)} onClear={() => onChange('')} /></span>}
      <SelectDialog
        open={open}
        headerText="Select Value Driver"
        onConfirm={(e: any) => {
          const sel = e.detail?.selectedItems?.[0]?.text ?? e.detail?.selectedItems?.[0]?.textContent?.trim()
          if (sel) onChange(sel)
          setOpen(false)
        }}
        onCancel={() => setOpen(false)}
      >
        {VALUE_DRIVER_OPTIONS.map(opt => (
          <ListItemStandard key={opt} selected={opt === value}>{opt}</ListItemStandard>
        ))}
      </SelectDialog>
    </>
  )
}

// Unit — primary type dropdown; when type is Currency/Count/Duration a secondary
// dropdown appears. None/Percentage have no secondary (spec).
function UnitField({
  unit, unitSub, onChange,
}: {
  unit: string
  unitSub?: string
  onChange: (unit: string, unitSub?: string) => void
}) {
  const hasSub = !!UNIT_SUB_OPTIONS[unit]
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <DropdownChipField
        value={unit}
        options={UNIT_TYPE_OPTIONS}
        onChange={(v) => onChange(v, UNIT_SUB_OPTIONS[v] ? (UNIT_SUB_OPTIONS[v][0]) : undefined)}
      />
      {hasSub && (
        <DropdownChipField
          value={unitSub ?? UNIT_SUB_OPTIONS[unit][0]}
          options={UNIT_SUB_OPTIONS[unit]}
          onChange={(v) => onChange(unit, v)}
        />
      )}
    </div>
  )
}

// Potential Value — number chip + currency dropdown chip (spec: "15K ×" "EUR ▾"). Not yet wired up.
export function PotentialValueField({
  value, currency, onChangeValue, onChangeCurrency,
}: {
  value: string
  currency: string
  onChangeValue: (v: string) => void
  onChangeCurrency: (c: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <NumberChipField value={value} onChange={onChangeValue} />
      <DropdownChipField value={currency} options={SHORT_CURRENCIES} onChange={onChangeCurrency} emptyPlaceholder={false} />
    </div>
  )
}

// Source — URL editor. Empty → "+"; editing → popover with "http://" input +
// info/error state; filled → the rich SourceField link block with a clear "×".
function SourceEditableField({ source, onClear }: { source: string; onClear: () => void }) {
  // Filled state: reuse SourceField's rich block and add a clear affordance.
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SourceField source={source} />
      </div>
      <Button icon="decline" design="Transparent" onClick={onClear} accessibleName="Remove source" style={{ flexShrink: 0 }} />
    </div>
  )
}
function SourceField_Empty({ onConfirm }: { onConfirm: (url: string) => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('http://')
  const id = useId()
  const anchorId = `src-${id.replace(/:/g, '')}`
  useEffect(() => { if (open) setDraft('http://') }, [open])
  let valid = true
  try { if (draft.trim() && draft.trim() !== 'http://') new URL(draft.trim()); else valid = draft.trim() !== 'http://' && draft.trim() !== '' } catch { valid = false }
  const showError = draft.trim() !== '' && draft.trim() !== 'http://' && !valid
  return (
    <>
      <AddChipButton id={anchorId} onClick={() => setOpen(true)} />
      <Popover
        open={open}
        opener={anchorId}
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setOpen(false)}
        hideArrow
        className="no-padding-popover"
        style={{ minWidth: '320px' }}
      >
        {/* Content region — Figma "Popover Add User": p-16px, single MultiInput */}
        <div style={{ padding: '1rem' }}>
          <Input
            value={draft}
            valueState={showError ? ValueState.Negative : ValueState.None}
            onInput={(e: any) => setDraft(e.target.value)}
            style={{ width: '100%' }}
          >
            <span slot="valueStateMessage">Enter a valid URL</span>
          </Input>
        </div>
        {/* Footer Bar — Emphasized confirm + Transparent cancel */}
        <Bar
          design="Footer"
          endContent={
            <>
              <Button icon="accept" design="Emphasized" disabled={!valid || showError} onClick={() => { onConfirm(draft.trim()); setOpen(false) }} accessibleName="Confirm" />
              <Button icon="decline" design="Transparent" onClick={() => setOpen(false)} accessibleName="Cancel" />
            </>
          }
        />
      </Popover>
    </>
  )
}

// Description — multi-line. Empty → pencil; filled → text + pencil; editing → textarea + confirm/cancel.
function DescriptionField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  useEffect(() => { if (editing) setDraft(value) }, [editing, value])
  const isEmpty = !value
  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <TextArea
          value={draft}
          placeholder="Describe your value case"
          rows={3}
          onInput={(e: any) => setDraft(e.target.value)}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
          <Button icon="accept" design="Emphasized" onClick={() => { onChange(draft.trim()); setEditing(false) }} accessibleName="Confirm" />
          <Button icon="decline" design="Transparent" onClick={() => setEditing(false)} accessibleName="Cancel" />
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {isEmpty
        ? <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
        : <Text style={{ fontSize: 'var(--sapFontSmallSize)', lineHeight: '1.5', color: 'var(--sapTextColor)' }}>{value}</Text>}
      <Button icon="edit" design="Transparent" onClick={() => setEditing(true)} accessibleName="Edit description" style={{ alignSelf: 'flex-start' }} />
    </div>
  )
}


// Header action components for the value-case side panel. Matches staging: the
// "Saved Automatically" indicator sits on the far left of the actions row
// (navigationSlot), and the delete action sits to the right just before the
// built-in close button (contentActionsSlot).
function SavedAutomaticallyIndicator() {
  return (
    <Icon
      name="cloud-check"
      accessibleName="Saved Automatically"
      style={{ color: 'rgb(48, 145, 76)', width: '1rem', height: '1rem' }}
    />
  )
}
function DeleteValueCaseAction() {
  return <Button icon="delete" design="Transparent" accessibleName="Delete value case" />
}

function ValueCaseSidePanel({ item, onClose, onRename }: { item: ValueCase; onClose: () => void; onRename?: (name: string) => void }) {
  // Local draft state — edits persist in the prototype and re-render the chips.
  // Seeded from the value case and reset whenever a different case is opened.
  const [draft, setDraft] = useState({
    source: item.source as string,
    valueDriver: item.valueDriver,
    type: item.type as ValueType,
    unit: item.unit,
    unitSub: item.unitSub,
    baseline: item.baseline,
    current: item.current,
    target: item.target,
    monetaryCurrency: item.currency ?? 'EUR',
    potentialValueRaw: item.potentialValueRaw,
    realizedValueRaw: item.realizedValueRaw,
    description: item.description,
  })
  useEffect(() => {
    setDraft({
      source: item.source as string,
      valueDriver: item.valueDriver,
      type: item.type as ValueType,
      unit: item.unit,
      unitSub: item.unitSub,
      baseline: item.baseline,
      current: item.current,
      target: item.target,
      monetaryCurrency: item.currency ?? 'EUR',
      potentialValueRaw: item.potentialValueRaw,
      realizedValueRaw: item.realizedValueRaw,
      description: item.description,
    })
  }, [item.id])
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft(d => ({ ...d, [k]: v }))

  // PAM value cases (Process Insights / Process Intelligence) carry read-only data
  // synced from the source; only Realized Value is editable here. Show the info
  // strip explaining this. Manual value cases don't get the strip.
  const isPam = item.source === 'Process Insights' || item.source === 'Process Intelligence'
  const [infoStripDismissed, setInfoStripDismissed] = useState(false)
  useEffect(() => { setInfoStripDismissed(false) }, [item.id])
  // "Show Details" popover anchored on the Realized Value info icon.
  const [detailsOpen, setDetailsOpen] = useState(false)
  const detailsBtnId = `rv-details-${useId().replace(/:/g, '')}`

  return (
    <SigRightSidePanel
      titleSlot={
        <SigInlineEdit
          text={item.name}
          size="H4"
          wrappingType="Wrap"
          onFinalValueChange={(v: string) => {
            const next = v.trim()
            if (next) onRename?.(next)
          }}
        />
      }
      navigationSlot={[SavedAutomaticallyIndicator]}
      contentActionsSlot={[DeleteValueCaseAction]}
      subHeaderSlot={
        item.realizedValueNeedsReview ? (
          <SigChipV2 value="Review Values" design="indication3" leadingIcon="unsynchronize" condensed />
        ) : undefined
      }
      isOpen
      toggleRightSidePanel={onClose}
      useBoldText={false}
      wrappingType="Wrap"
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden auto', background: 'var(--sapList_Background)' }}
      tabSlot={[
        <Tab key="Attributes" text="Attributes" selected>
          <div style={{ padding: '1rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isPam && !infoStripDismissed && (
              <MessageStrip
                design="Information"
                onClose={() => setInfoStripDismissed(true)}
              >
                This is a value case with data from <Link href="#" onClick={(e: any) => e.preventDefault()}>{item.source}</Link>. You can edit this value case there.
                {' '}Only <Link href="#" onClick={(e: any) => e.preventDefault()}>Realized Value</Link> is editable.
              </MessageStrip>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Button icon="slim-arrow-down" design="Transparent" />
              <SectionHeader>Main Attributes (10)</SectionHeader>
            </div>
            <AttrRow label="Source">
              {draft.source
                ? <SourceEditableField source={draft.source} onClear={() => set('source', '')} />
                : <SourceField_Empty onConfirm={(url) => set('source', url)} />}
            </AttrRow>
            <AttrRow label="Value Driver">
              <ValueDriverField value={draft.valueDriver} onChange={(v) => set('valueDriver', v)} />
            </AttrRow>
            <AttrRow label="Impact Area">
              <DropdownChipField
                value={draft.type}
                options={IMPACT_AREA_OPTIONS}
                chipDesign={TYPE_DESIGN[draft.type]}
                onChange={(v) => set('type', v as ValueType)}
              />
            </AttrRow>
            <AttrRow label="Unit">
              <UnitField
                unit={draft.unit}
                unitSub={draft.unitSub}
                onChange={(u, s) => setDraft(d => ({ ...d, unit: u, unitSub: s }))}
              />
            </AttrRow>
            <AttrRow label="Baseline">
              <NumberChipField value={draft.baseline} onChange={(v) => set('baseline', v)} />
            </AttrRow>
            <AttrRow label="Current">
              <NumberChipField value={draft.current} onChange={(v) => set('current', v)} />
            </AttrRow>
            <AttrRow label="Target">
              <NumberChipField value={draft.target} onChange={(v) => set('target', v)} />
            </AttrRow>
            <div style={{ height: 1, background: 'var(--sapList_BorderColor)', marginTop: '0.25rem' }} />
            <SectionHeader>Monetary Impact</SectionHeader>
            <AttrRow label="Unit">
              <SigChipV2 value={item.currency ?? 'EUR'} design="none" />
            </AttrRow>
            <AttrRow label="Potential Value">
              <SigChipV2 value={item.potentialValue} design="none" />
            </AttrRow>
            <AttrRow label="Realized Value">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.realizedValueNeedsReview && (
                  <MessageStrip design="Critical" hideIcon>
                    The Current and Target values have changed since the Realized Value was last updated on {item.realizedValueChangedOn}. Review the Realized Value to ensure it is still accurate.{' '}
                    <Link href="#" onClick={(e: any) => e.preventDefault()}>Mark as reviewed.</Link>
                  </MessageStrip>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <NumberChipField
                    value={draft.realizedValueRaw}
                    onChange={(v) => set('realizedValueRaw', v)}
                    leadingIcon={item.realizedValueManuallyAdjusted ? 'synchronize' : undefined}
                    design={item.realizedValueManuallyAdjusted ? 'indication10' : undefined}
                  />
                  {item.realizedValueManuallyAdjusted && (
                    <>
                      <Button
                        id={detailsBtnId}
                        icon="hint"
                        design="Transparent"
                        tooltip="Show Details"
                        accessibleName="Show details"
                        onClick={() => setDetailsOpen((o) => !o)}
                        style={{ '--sapButton_IconColor': 'var(--sapContent_LabelColor)' } as React.CSSProperties}
                      />
                      <Popover
                        open={detailsOpen}
                        opener={detailsBtnId}
                        placement={PopoverPlacement.End}
                        onClose={() => setDetailsOpen(false)}
                        className="no-padding-popover"
                        style={{ maxWidth: '300px' }}
                      >
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', boxSizing: 'border-box' }}>
                          <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 'var(--sapContent_LineHeight_MediumText, 21px)' }}>
                            You can manually adjust the value when:
                            <ul style={{ margin: 0, paddingInlineStart: '21px', listStyleType: 'disc' }}>
                              <li>The value isn't available in the source system.</li>
                              <li>The system value doesn't match your actual results.</li>
                            </ul>
                          </div>
                          <MessageStrip design="Information" hideCloseButton>
                            Your manual adjustments are reflected across all shared initiatives. The source value case remains unchanged.
                          </MessageStrip>
                        </div>
                      </Popover>
                    </>
                  )}
                </div>
                {item.realizedValueManuallyAdjusted && item.realizedValueChangedOn && (
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                    Realized Value Changed on: {item.realizedValueChangedOn} by {item.realizedValueChangedBy}
                  </Text>
                )}
              </div>
            </AttrRow>
            <div style={{ height: 1, background: 'var(--sapList_BorderColor)', marginTop: '0.25rem' }} />
            <AttrRow label="Baseline Date Range">
              <SigChipV2 value={item.baselineDateRangeFormatted} design="none" leadingIcon="calendar" />
            </AttrRow>
            <AttrRow label="Description">
              <DescriptionField value={draft.description} onChange={(v) => set('description', v)} />
            </AttrRow>
          </div>
        </Tab>,
        <Tab key="Details" text="Details">
          <div style={{ padding: '1rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SectionHeader>Details</SectionHeader>
            <AttrRow label="Created">
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Jan 12, 2025 by Adrian Webster</Text>
            </AttrRow>
            <AttrRow label="Changed">
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Jul 23, 2025 by Adrian Webster</Text>
            </AttrRow>
          </div>
        </Tab>,
      ]}
    >{null}</SigRightSidePanel>
  )
}

// ─── Value Case Card ──────────────────────────────────────────────────────────

// Parse a metric string ("56%", "61,0%", "1,045 tCO₂e", "14 Days") to a number.
// Handles both European decimal commas ("61,0" → 61) and thousands separators
// ("1,045" → 1045): a comma followed by exactly 3 trailing digits is treated as
// a thousands separator, otherwise as a decimal point.
function parseMetricNum(s: string): number {
  if (!s) return 0
  let t = s.replace(/[^0-9.,\-]/g, '')
  if (t.includes('.') && t.includes(',')) {
    t = t.replace(/,/g, '')                       // comma = thousands separator
  } else if (t.includes(',')) {
    t = /,\d{3}$/.test(t) ? t.replace(/,/g, '') : t.replace(',', '.')
  }
  const n = parseFloat(t)
  return isNaN(n) ? 0 : n
}

// True when a metric string carries an actual numeric value (not empty and not a "-"
// placeholder). Used to distinguish a real 0 from missing data so the KPI header does
// not color a data gap as a regression.
function hasMetricValue(s: string | null | undefined): boolean {
  if (s == null) return false
  const t = s.trim()
  return t !== '' && t !== '-' && /\d/.test(t)
}

// The trailing unit of a metric: "%", "Days", "Changes", "tCO₂e", …
function metricUnit(vc: ValueCase): string {
  const s = vc.current || vc.target || vc.baseline || ''
  if (s.includes('%')) return '%'
  return s.replace(/^[\s\d.,\-]+/, '').trim()
}

// Format a numeric metric value back to a display string with its unit.
function fmtMetric(n: number, unit: string): string {
  const num = Number.isInteger(n) ? String(n) : n.toFixed(1)
  return unit === '%' ? `${num}%` : unit ? `${num} ${unit}` : num
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Build the x-axis month list and "now" index from initiative start/end dates.
// Returns an array of { label: "Mar", year: 2025 } entries spanning start..end,
// and nowIndex = the index of today (clamped to [0, length-1]).
function buildChartTimeline(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end   = new Date(endDate)
  const today = new Date(2026, 7, 14) // Aug 14 2026 — matches session date
  const months: Array<{ label: string; year: number }> = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
  while (cur <= endMonth) {
    months.push({ label: MONTH_ABBR[cur.getMonth()], year: cur.getFullYear() })
    cur.setMonth(cur.getMonth() + 1)
  }
  if (months.length === 0) {
    // Fallback: 12-month window from today
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - 6 + i, 1)
      months.push({ label: MONTH_ABBR[d.getMonth()], year: d.getFullYear() })
    }
  }
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
  const diffMonths = (todayMonth.getFullYear() - startMonth.getFullYear()) * 12
    + todayMonth.getMonth() - startMonth.getMonth()
  const nowIndex = Math.max(0, Math.min(months.length - 1, diffMonths))
  return { months, nowIndex }
}

// Horizontal x-axis tick renderer for the monthly time axis (SAP Chart – Time Axis).
// The year is shown on the first tick and whenever the year changes — never repeated
// on every tick (SAP "first date / last date" small-space pattern).
function MonthAxisTick(props: {
  x?: number
  y?: number
  payload?: { value?: string; index?: number }
  index?: number
  months?: Array<{ label: string; year: number }>
}) {
  const i = props.payload?.index ?? props.index ?? 0
  const months = props.months ?? []
  const entry = months[i]
  const month = entry?.label ?? props.payload?.value ?? ''
  // Show year on first tick and whenever year changes
  const showYear = i === 0 || (i > 0 && months[i]?.year !== months[i - 1]?.year)
  const year = entry?.year ?? ''
  return (
    <g transform={`translate(${props.x ?? 0},${(props.y ?? 0) + 10})`} style={{ direction: 'ltr' }}>
      <text
        textAnchor="middle"
        fill="var(--sapShell_TextColor)"
        style={{ fontSize: 'var(--sapFontSmallSize)', fontFamily: 'var(--sapFontFamily)' }}
      >
        {showYear ? `${month} ${year}` : month}
      </text>
    </g>
  )
}

// Monthly dataset spanning the initiative's start–end window, with "now" derived
// from today's date. Actual data runs baseline→current up to now; forecast runs
// current→target from now to end. Both reference lines (baseline, target) are flat.
function buildMonthlyDataset(vc: ValueCase, startDate: string, endDate: string) {
  const baseline = parseMetricNum(vc.baseline)
  const current  = parseMetricNum(vc.current)
  const target   = parseMetricNum(vc.target)
  const { months, nowIndex } = buildChartTimeline(startDate, endDate)
  const smooth = (a: number, b: number, tt: number) =>
    +(a + (b - a) * tt * tt * (3 - 2 * tt)).toFixed(2)
  const last = months.length - 1
  return {
    dataset: months.map(({ label }, i) => ({
      month: label,
      actual:   i <= nowIndex ? smooth(baseline, current, nowIndex > 0 ? i / nowIndex : 1) : null,
      forecast: i >= nowIndex ? smooth(current, target, last > nowIndex ? (i - nowIndex) / (last - nowIndex) : 1) : null,
      target,
      baseline,
    })),
    months,
    nowIndex,
  }
}

// Native SVG label for the reference lines (baseline / target). Renders as a plain
// <text> element — no HTML-in-SVG, no chip component. Remove by deleting the
// DataLabel prop from the measure config.
function makeReferenceLabel(text: string, side: 'start' | 'end', totalMonths: number, color: string) {
  const targetIndex = side === 'start' ? 0 : totalMonths - 1
  return function ReferenceLabel(props: { x?: number; y?: number; index?: number }) {
    if (props.index !== targetIndex) return null
    const px = props.x ?? 0
    const py = props.y ?? 0
    const ty = side === 'start' ? py + 16 : py - 8
    return (
      <text
        x={px}
        y={ty}
        textAnchor={side === 'start' ? 'start' : 'end'}
        style={{ fill: color, fillOpacity: 1, fontSize: 'var(--sapFontSmallSize)', fontFamily: 'var(--sapFontFamily)', opacity: 1 }}
      >
        {text}
      </text>
    )
  }
}

// Custom per-point dot renderer for the ACTUAL line, marking "now" (the current
// value). Per the SAP Semantic Patterns guideline, the solid→dashed transition IS
// the sanctioned way to mark the actual→projected boundary; SAP does NOT document a
// vertical "now" line or a "Now" text label. So we emphasize the dot sitting on the
// last actual value (at CHART_NOW_INDEX, where the solid line meets the dashed
// forecast): a larger SOLID dot in the series color with a white ring. Every other
// recorded month keeps a standard hollow dot. Recharts calls this for each x
// position; null (forecast) months are skipped. Wired via lineConfig.dot, which the
// LineChart library spreads onto <Line> after its own `dot` prop, so this wins.
function makeNowDot(color: string, nowIndex: number) {
  return function NowDot(props: { cx?: number; cy?: number; index?: number; value?: number | null }) {
    const { cx, cy, index, value } = props
    if (cx == null || cy == null || value == null) return <g key={`nd-${index ?? 'x'}`} />
    if (index === nowIndex) {
      return (
        <circle
          key={`nd-${index}`}
          cx={cx}
          cy={cy}
          r={7.5}
          fill={color}
          stroke="var(--sapBackgroundColor)"
          strokeWidth={2}
        />
      )
    }
    return (
      <circle
        key={`nd-${index}`}
        cx={cx}
        cy={cy}
        r={4.5}
        fill="var(--sapBackgroundColor)"
        stroke={color}
        strokeWidth={1}
      />
    )
  }
}

function makeForecastDot(color: string) {
  return function ForecastDot(props: { cx?: number; cy?: number; index?: number; value?: number | null }) {
    const { cx, cy, index, value } = props
    if (cx == null || cy == null || value == null) return <g key={`fd-${index ?? 'x'}`} />
    return (
      <circle
        key={`fd-${index}`}
        cx={cx}
        cy={cy}
        r={4.5}
        fill="var(--sapBackgroundColor)"
        stroke={color}
        strokeWidth={1}
      />
    )
  }
}

function ValueCaseCard({ vc, onClick, selected, layout = 'panel', initiativeStartDate, initiativeEndDate }: { vc: ValueCase; onClick: () => void; selected?: boolean; layout?: 'panel' | 'open3'; initiativeStartDate: string; initiativeEndDate: string }) {
  const popoverId = useId()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [popoverData, setPopoverData] = useState<{ month: string; rows: Array<{ name: string; value: string; color: string }> } | null>(null)

  const unit = metricUnit(vc)
  const fmt = (v: number | string | null | undefined) =>
    v == null || v === '' ? '' : fmtMetric(Number(v), unit)

  // onClick fires as enrichEventWithDetails(mouseEvent, { payload, activePayloads })
  // where payload is the data row at the clicked x, activePayloads is all series at that x.
  const handleChartClick = useCallback((event: any) => {
    const activePayloads: Array<{ name: string; value: number | null; color: string }> =
      event?.detail?.activePayloads ?? []
    const month = event?.detail?.payload?.month as string | undefined
    if (!month || !activePayloads.length) return
    const allRows = activePayloads.filter(p => p.value != null)
    const hasActual = allRows.some(p => p.name === 'Current')
    const rows = allRows
      .filter(p => !(p.name === 'Forecast' && hasActual))
      .map(p => ({ name: p.name, value: fmt(p.value), color: p.color }))
    if (!rows.length) return
    // Reposition the anchor before React re-renders so the Popover opens at the click point
    if (anchorRef.current) {
      anchorRef.current.style.left = `${event.clientX ?? 0}px`
      anchorRef.current.style.top = `${event.clientY ?? 0}px`
    }
    setPopoverData({ month, rows })
  }, [fmt])

  const currentNum  = parseMetricNum(vc.current)
  const targetNum   = parseMetricNum(vc.target)
  const baselineNum = parseMetricNum(vc.baseline)

  const { dataset: chartDataset, months: chartMonths, nowIndex: chartNowIndex } =
    buildMonthlyDataset(vc, initiativeStartDate, initiativeEndDate)

  // ── KPI header status (SAP AnalyticalCardHeader semantics) ──────────────────
  // COLOR = movement sentiment: has the metric moved the BENEFICIAL way from its
  // baseline, judged against the explicit `higherIsBetter` polarity?
  //   • higher-is-better metric → UP is good, DOWN is bad
  //   • lower-is-better metric  → DOWN is good, UP is bad
  //     (e.g. "Automation rate potential" reads higher-is-better by name, but its
  //      target sits below baseline → it is lower-is-better; hence the flag is
  //      explicit, never inferred from the numbers alone.)
  // SAP couples the value number and the DeviationIndicator arrow to a single
  // `state`, so BOTH carry this sentiment color:
  //   Good    → moved in the beneficial direction (improving)
  //   Error   → moved in the detrimental direction (regressing)
  //   Neutral → no change from baseline, or missing data
  const hasValues = hasMetricValue(vc.current) && hasMetricValue(vc.baseline) && hasMetricValue(vc.target)
  const higherIsBetter = vc.higherIsBetter ?? (targetNum >= baselineNum)

  const movedUp   = hasValues && currentNum > baselineNum
  const movedDown = hasValues && currentNum < baselineNum
  const movementGood = (higherIsBetter && movedUp) || (!higherIsBetter && movedDown)
  const movementBad  = (higherIsBetter && movedDown) || (!higherIsBetter && movedUp)
  const deviationColor = movementGood
    ? ValueColor.Good
    : movementBad
      ? ValueColor.Error
      : ValueColor.Neutral

  // Trend arrow = FACTUAL direction of current vs baseline (Up if increased, Down if
  // decreased, None at equality/missing). It shares `state` with the value, so it
  // takes the same sentiment color — an up arrow on a lower-is-better metric that
  // regressed shows red; a down arrow on a lower-is-better metric that improved
  // shows green.
  const trend = !hasValues || currentNum === baselineNum
    ? DeviationIndicator.None
    : currentNum > baselineNum
      ? DeviationIndicator.Up
      : DeviationIndicator.Down

  // Description reports progress from baseline toward target (a separate axis from the
  // sentiment color — the two never contradict). Driven by the explicit polarity.
  const hasRange = targetNum !== baselineNum
  const reachedTarget = hasValues && hasRange && (higherIsBetter ? currentNum >= targetNum : currentNum <= targetNum)
  const range = targetNum - baselineNum
  const progressPct = hasRange ? Math.round(((currentNum - baselineNum) / range) * 100) : 0
  const deviationDescription = !hasValues
    ? 'No current data'
    : !hasRange
      ? 'No target range defined'
      : reachedTarget
        ? 'Target reached'
        : movementBad
          ? 'Regressed from baseline'
          : `${progressPct}% toward target`

  // Signed deviation (current − baseline) for the "vs Baseline" side indicator. Now that
  // Baseline is no longer a standalone side indicator (SAP max = 2), the sign makes the
  // direction explicit; the shared `state` color still carries the movement sentiment.
  const deviationRaw = Math.round((currentNum - baselineNum) * 10) / 10
  const deviationSideNumber = !hasValues
    ? '–'
    : deviationRaw > 0
      ? `+${deviationRaw}`
      : String(deviationRaw)

  return (
    <Card
      id={`value-case-card-${vc.id}`}
      style={{ width: '100%' }}
      className={`elevated-card value-case-card${selected ? ' value-case-card--selected' : ''}`}
      header={
        <AnalyticalCardHeader
          titleText={vc.name}
          subtitleText={`${chartMonths[chartNowIndex]?.label ?? ''} ${chartMonths[chartNowIndex]?.year ?? ''}`}
          value={String(currentNum)}
          trend={trend}
          state={deviationColor}
          description={deviationDescription}
          onClick={onClick}
          style={{ cursor: 'pointer' }}
        >
          {/* The two design options diverge on the side-indicator set:
              • Option 1 (layout 'panel'): SAP-pure pair — "vs Baseline" (deviation,
                colored) + "Target" (neutral). Current is the main value; Baseline is
                derivable (Current − Deviation). Matches SAP's max-of-two + its canonical
                "Deviation"/"Target" example.
              • Option 2 (layout 'open3'): the fuller set — Baseline · Current · Deviation
                — showing both endpoints and the delta between them explicitly. */}
          {layout === 'panel' ? (
            <>
              <NumericSideIndicator
                titleText="vs Baseline"
                number={deviationSideNumber}
                unit={unit === '%' ? '%' : unit || undefined}
                state={deviationColor}
              />
              <NumericSideIndicator
                titleText="Target"
                number={Math.round(targetNum * 10) / 10}
                unit={unit === '%' ? '%' : unit || undefined}
              />
            </>
          ) : (
            <>
              <NumericSideIndicator
                titleText="Baseline"
                number={Math.round(baselineNum * 10) / 10}
                unit={unit === '%' ? '%' : unit || undefined}
              />
              <NumericSideIndicator
                titleText="Current"
                number={Math.round(currentNum * 10) / 10}
                unit={unit === '%' ? '%' : unit || undefined}
              />
              <NumericSideIndicator
                titleText="Deviation"
                number={Math.round(Math.abs(currentNum - baselineNum) * 10) / 10}
                unit={unit === '%' ? '%' : unit || undefined}
                state={deviationColor}
              />
            </>
          )}
        </AnalyticalCardHeader>
      }
    >
      {/* Invisible anchor for the popover — positioned at click coordinates */}
      <div ref={anchorRef} id={popoverId} style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }} />

      <Popover
        opener={popoverId}
        open={popoverData != null}
        placement={PopoverPlacement.Bottom}
        onClose={() => setPopoverData(null)}
        className="ui5-content-density-compact no-padding-popover"
      >
        <div style={{ padding: '0.375rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.25rem' }}>
            <span style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 700, color: 'var(--sapContent_LabelColor)' }}>{popoverData?.month ?? ''}</span>
            <Button icon="decline" design="Transparent" accessibleName="Close" onClick={() => setPopoverData(null)}
              style={{ width: '1.5rem', height: '1.5rem', minWidth: 0, padding: 0, marginLeft: '0.5rem' }} />
          </div>
          {popoverData?.rows.map(row => (
            <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', lineHeight: '1.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '2px', background: row.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{row.name}</span>
              </div>
              <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Popover>

      <div style={{ padding: '0 1rem 1rem' }}>
        <>
        <LineChart
          style={{ height: '260px' }}
          noAnimation
          dataset={chartDataset}
          dimensions={[{ accessor: 'month' }]}
          measures={[
            {
              accessor: 'actual',
              label: 'Current',
              color: 'var(--sapChart_OrderedColor_1)',
              width: 2.5,
              showDot: true,
              hideDataLabel: true,
              formatter: fmt,
              lineConfig: { dot: makeNowDot('var(--sapChart_OrderedColor_1)', chartNowIndex) },
            },
            {
              accessor: 'forecast',
              label: 'Forecast',
              color: 'var(--sapChart_OrderedColor_1)',
              width: 2,
              showDot: true,
              hideDataLabel: true,
              formatter: fmt,
              lineConfig: { strokeDasharray: '8 4', strokeOpacity: 0.6, dot: makeForecastDot('var(--sapChart_OrderedColor_1)') },
            },
            {
              accessor: 'target',
              label: 'Target',
              color: 'var(--sapChart_OrderedColor_2)',
              width: 1.5,
              hideDataLabel: false,
              formatter: fmt,
              DataLabel: makeReferenceLabel(fmtMetric(parseMetricNum(vc.target), unit), 'end', chartMonths.length, 'var(--sapCriticalTextColor)'),
              lineConfig: { strokeDasharray: '2 3', dot: false, activeDot: false },
            },
            {
              accessor: 'baseline',
              label: 'Baseline',
              color: 'var(--sapChart_Sequence_Neutral_Minus2)',
              width: 1.5,
              showDot: false,
              hideDataLabel: false,
              formatter: fmt,
              DataLabel: makeReferenceLabel(fmtMetric(parseMetricNum(vc.baseline), unit), 'start', chartMonths.length, 'var(--sapChart_Sequence_Neutral_Minus2)'),
              lineConfig: { strokeDasharray: '2 3', dot: false, activeDot: false },
            },
          ]}
          chartConfig={{
            yAxisVisible: true,
            xAxisVisible: true,
            yAxisLabelsVisible: true,
            gridHorizontal: true,
            gridVertical: false,
            legendConfig: { content: () => null },
            margin: { top: 8, right: 16, bottom: 4, left: 0 },
            xAxisConfig: { tick: <MonthAxisTick months={chartMonths} />, interval: 0, tickLine: false },
            yAxisConfig: { tick: { fill: 'var(--sapShell_TextColor)' } },
          }}
          tooltipConfig={{ content: () => null }}
          onClick={handleChartClick as never}
        />
        {/* Custom legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'center', marginTop: '2rem' }}>
          {[
            { label: 'Current',  color: 'var(--sapChart_OrderedColor_1)',          dash: '',      width: 2.5, opacity: 1,   dot: true,  hollow: false },
            { label: 'Forecast', color: 'var(--sapChart_OrderedColor_1)',          dash: '8 4',   width: 2,   opacity: 0.6, dot: true,  hollow: true  },
            { label: 'Target',   color: 'var(--sapChart_OrderedColor_2)',          dash: '2 3',   width: 1.5, opacity: 1,   dot: false, hollow: false },
            { label: 'Baseline', color: 'var(--sapChart_Sequence_Neutral_Minus2)', dash: '2 3',   width: 1.5, opacity: 1,   dot: false, hollow: false },
          ].map(({ label, color, dash, width, opacity, dot, hollow }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="28" height="12" style={{ flexShrink: 0, overflow: 'visible' }}>
                <line x1="0" y1="6" x2="28" y2="6"
                  stroke={color} strokeWidth={width}
                  strokeDasharray={dash} strokeOpacity={opacity}
                  strokeLinecap="round"
                />
                {dot && (
                  <circle cx="14" cy="6" r="4.5"
                    fill={hollow ? 'var(--sapBackgroundColor)' : color}
                    stroke={color} strokeWidth={1}
                    opacity={opacity}
                  />
                )}
              </svg>
              <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        </>
      </div>
    </Card>
  )
}

// ─── Value Driver Group (card view) ───────────────────────────────────────────

function ValueDriverGroup({
  valueDriver,
  valueCases,
  onCardClick,
  collapsed,
  onToggle,
  selectedId,
  layout = 'panel',
  initiativeStartDate,
  initiativeEndDate,
}: {
  valueDriver: string
  valueCases: ValueCase[]
  onCardClick: (vc: ValueCase) => void
  collapsed?: boolean
  onToggle?: (vd: string, next: boolean) => void
  selectedId?: string | null
  layout?: 'panel' | 'open3'
  initiativeStartDate: string
  initiativeEndDate: string
}) {
  const groupType = valueCases[0]?.groupType
  const isCollapsed = collapsed ?? false

  if (layout === 'open3') {
    return (
      <div style={{ containerType: 'inline-size' }}>
        <ValueDriverGroupHeader
          valueDriver={valueDriver}
          valueCases={valueCases}
          groupType={groupType}
          isCollapsed={isCollapsed}
          onToggle={() => onToggle?.(valueDriver, !isCollapsed)}
        />
        {!isCollapsed && (
          <div className="value-driver-card-grid value-driver-card-grid--transparent">
            {valueCases.map(vc => (
              <ValueCaseCard key={vc.id} vc={vc} onClick={() => onCardClick(vc)} selected={vc.id === selectedId} layout="open3"
                initiativeStartDate={initiativeStartDate} initiativeEndDate={initiativeEndDate} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Panel
      className="value-driver-panel"
      collapsed={collapsed}
      onToggle={(e: any) => onToggle?.(valueDriver, e.detail?.collapsed ?? false)}
      headerText={valueDriver}
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <Text style={{ fontSize: 'var(--sapGroup_TitleFontSize)', color: 'var(--sapGroup_TitleTextColor)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {valueDriver} ({valueCases.length})
          </Text>
          {groupType && (
            <SigChipV2 value={groupType} design={(TYPE_DESIGN as Record<string, string>)[groupType] as never} condensed />
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {valueCases.map(vc => (
          <ValueCaseCard key={vc.id} vc={vc} onClick={() => onCardClick(vc)} selected={vc.id === selectedId}
            initiativeStartDate={initiativeStartDate} initiativeEndDate={initiativeEndDate} />
        ))}
      </div>
    </Panel>
  )
}

// Shared header row used by both 'open' and 'open3' layouts — same structure,
// caller controls background/border via the container style.
function ValueDriverGroupHeader({
  valueDriver,
  valueCases,
  groupType,
  isCollapsed,
  onToggle,
}: {
  valueDriver: string
  valueCases: ValueCase[]
  groupType: string | undefined
  isCollapsed: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',   /* 8px: Button → content frame */
        padding: '0.5rem', /* 8px all sides → total height ≈ 52px */
      }}
    >
      {/* 36×36px transparent icon button — Figma Cozy icon button */}
      <Button
        design="Transparent"
        icon={isCollapsed ? 'slim-arrow-right' : 'slim-arrow-down'}
        onClick={onToggle}
        style={{ flexShrink: 0, width: '2rem', height: '2rem' }}
      />
      {/* Content frame: SigDomainObject (XS, 32px) + title+chip column, gap 12px */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, flex: 1 }}>
        <SigDomainObject object={'Value Case' as never} size="XS" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
          <Text
            style={{
              fontWeight: 700,
              fontSize: 'var(--sapGroup_TitleFontSize, 1rem)',
              lineHeight: '1.375rem',
              color: 'var(--sapShell_GroupTitleTextColor, #1d2d3e)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {valueDriver} ({valueCases.length})
          </Text>
          {groupType && (
            <SigChipV2 value={groupType} design={(TYPE_DESIGN as Record<string, string>)[groupType] as never} condensed />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Value Cases Section ───────────────────────────────────────────────────────

function ValueCasesSection({
  valueCases,
  onRowClick,
  selectedId,
  initiativeStartDate,
  initiativeEndDate,
  objectPageRef: _objectPageRef,
}: {
  valueCases: ValueCase[]
  onRowClick: (item: ValueCase) => void
  selectedId?: string | null
  initiativeStartDate: string
  initiativeEndDate: string
  objectPageRef?: React.RefObject<ObjectPageDomRef | null>
}) {
  const tableRef = useRef<any>(null)
  const [currency, setCurrency] = useState('EUR')
  const [viewType, setViewType] = useState<'table' | 'card'>('table')
  const [cardSubView, setCardSubView] = useState<'metric-progression' | 'value-realized'>('metric-progression')
  const [cardLayout, setCardLayout] = useState<'panel' | 'open3'>('panel')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('' )

  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  const allDrivers = useMemo(() => [...new Set(valueCases.map(vc => vc.valueDriver))], [valueCases])

  const handleExpandAll = useCallback(() => {
    tableRef.current?.toggleAllRowsExpanded(true)
    setCollapsedGroups(new Set())
  }, [])
  const handleCollapseAll = useCallback(() => {
    tableRef.current?.toggleAllRowsExpanded(false)
    setCollapsedGroups(new Set(allDrivers))
  }, [allDrivers])
  const handleGroupToggle = useCallback((vd: string, next: boolean) => {
    setCollapsedGroups(prev => {
      const s = new Set(prev)
      if (next) s.add(vd); else s.delete(vd)
      return s
    })
  }, [])

  const plCases = valueCases.filter(vc => vc.type === 'Profit and Loss')
  const wcCases = valueCases.filter(vc => vc.type === 'Working Capital')
  const plPotential = plCases[0]?.groupPotential ?? '-'
  const plRealized = plCases[0]?.groupRealized ?? '-'
  const wcPotential = wcCases[0]?.groupPotential ?? '-'
  const wcRealized = wcCases[0]?.groupRealized ?? '-'

  const columns = useMemo(() => [
    { Header: 'Value Driver', accessor: 'valueDriver', width: 240, minWidth: 180, Grouped: ValueDriverGrouped },
    { Header: 'Name', accessor: 'name', minWidth: 200, Cell: TruncatedCell },
    { Header: 'Baseline Date Range', accessor: 'baselineDateRange', hAlign: 'End' as const, width: 150, minWidth: 140, Cell: RightCell },
    { Header: 'Baseline', accessor: 'baseline', hAlign: 'End' as const, width: 90, minWidth: 80, Cell: RightCell },
    { Header: 'Current', accessor: 'current', hAlign: 'End' as const, width: 90, minWidth: 80, Cell: RightCell },
    { Header: 'Target', accessor: 'target', hAlign: 'End' as const, width: 85, minWidth: 80, Cell: RightCell },
    {
      Header: 'Potential Value',
      accessor: 'potentialValue',
      hAlign: 'End' as const,
      width: 200,
      minWidth: 180,
      Cell: PotentialValueCell,
      Aggregated: PotentialValueAggregated,
    },
    {
      Header: 'Realized Value',
      accessor: 'realizedValue',
      hAlign: 'End' as const,
      width: 190,
      minWidth: 180,
      Cell: RealizedValueCell,
      Aggregated: RealizedValueAggregated,
    },
    { Header: 'Source', accessor: 'source', width: 130, minWidth: 120, Cell: SourceCell },
    {
      id: 'actions',
      Header: '',
      accessor: 'id',
      width: 48,
      minWidth: 48,
      disableSortBy: true,
      disableResizing: true,
      Cell: SourceActionCell,
    },
  ], [])

  const handleRowClick = (e: any) => {
    e.stopPropagation()
    const original = e?.detail?.row?.original as ValueCase | undefined
    if (!original?.id) return
    onRowClick(original)
  }

  const cardMenuId = useId()
  const [cardMenuOpen, setCardMenuOpen] = useState(false)

  // When a card is selected in the open layout, scroll it into view after the
  // side panel opens and triggers a reflow (two rAF frames to let layout settle).
  useEffect(() => {
    if (cardLayout !== 'open3' || !selectedId) return
    const scrollToCard = () => {
      const card = document.getElementById(`value-case-card-${selectedId}`)
      if (!card) return
      card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    requestAnimationFrame(() => requestAnimationFrame(scrollToCard))
  }, [selectedId, cardLayout])

  return (
    <>

      {/* Totals bar */}
      <FlexBox
        alignItems={FlexBoxAlignItems.Center}
        justifyContent={FlexBoxJustifyContent.SpaceBetween}
        style={{ padding: '0.75rem 1rem 0.5rem', flexWrap: 'wrap', gap: 8 }}
      >
        <FlexBox alignItems={FlexBoxAlignItems.Center} wrap={FlexBoxWrap.Wrap} style={{ gap: 8 }}>
          {plCases.length > 0 && (
            /*
              Source: SAP Signavio – UIXtension Element
              Component: SigChipV2
              Variant: indication6 (Profit & Loss)
            */
            <SigChipV2
              value={`Profit & Loss - Total Potential / Realized: ${plPotential} / ${plRealized}`}
              design="indication6"
              condensed
            />
          )}
          {wcCases.length > 0 && (
            <SigChipV2
              value={`Working Capital - Total Potential / Realized: ${wcPotential} / ${wcRealized}`}
              design="indication7"
              condensed
            />
          )}
        </FlexBox>
        <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: 8, flexShrink: 0 }}>
          <Icon name="information" style={{ color: 'var(--sapContent_LabelColor)', cursor: 'pointer' }} />
          {/*
            Source: SAP Fiori / UI5 Web Components
            Component: ui5-select
            Variant: default
          */}
          <Select
            style={{ width: 110 }}
            onChange={(e: any) => setCurrency((e.detail.selectedOption as HTMLElement).textContent?.trim() ?? 'EUR')}
          >
            {CURRENCIES.map(c => (
              <Option key={c} selected={c === currency}>{c}</Option>
            ))}
          </Select>
        </FlexBox>
      </FlexBox>

      <SigTableWrapper
        viewSwitcher={['table', 'card']}
        activeView={viewType}
        onActiveViewChange={(v: any) => setViewType(v as 'table' | 'card')}
        titleSlot={
          viewType === 'card' ? (
            <ToolbarItem>
              <SegmentedButton>
                <SegmentedButtonItem
                  selected={cardSubView === 'metric-progression'}
                  onClick={() => setCardSubView('metric-progression')}
                >
                  Metric Progression
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  selected={cardSubView === 'value-realized'}
                  onClick={() => setCardSubView('value-realized')}
                >
                  Value Realized
                </SegmentedButtonItem>
              </SegmentedButton>
            </ToolbarItem>
          ) : undefined
        }
        businessActionsSlot={
          <>
            <ToolbarItem>
              <Button design="Emphasized" onClick={() => showToast('Create Value Case coming soon')}>Create Manual Value Case</Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button design="Transparent" icon="expand-all" tooltip="Expand All" onClick={handleExpandAll} />
            </ToolbarItem>
            <ToolbarItem>
              <Button design="Transparent" icon="collapse-all" tooltip="Collapse All" onClick={handleCollapseAll} />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                id={cardMenuId}
                design="Transparent"
                icon="palette"
                endIcon="slim-arrow-down"
                tooltip="Card layout options"
                onClick={() => {
                  if (viewType !== 'card') setViewType('card')
                  setCardMenuOpen(true)
                }}
              />
              <Menu
                opener={cardMenuId}
                open={cardMenuOpen}
                onClose={() => setCardMenuOpen(false)}
                onItemClick={(e: any) => {
                  const text: string = e.detail.item.text ?? ''
                  if (text.includes('Option 1')) setCardLayout('panel')
                  else if (text.includes('Option 2')) setCardLayout('open3')
                  setCardMenuOpen(false)
                }}
              >
                <MenuItem
                  text="Design Option 1 — Panel"
                  icon={cardLayout === 'panel' ? 'accept' : ''}
                />
                <MenuItem
                  text="Design Option 2 — Open"
                  icon={cardLayout === 'open3' ? 'accept' : ''}
                />
              </Menu>
            </ToolbarItem>
          </>
        }
      >
        {viewType === 'table' ? (
          valueCases.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No value cases yet.</Text>
            </div>
          ) : (
            <AnalyticalTable
              tableInstance={tableRef}
              columns={columns}
              data={valueCases}
              groupBy={['valueDriver']}
              visibleRows={valueCases.length + 4}
              minRows={3}
              rowHeight={32}
              headerRowHeight={32}
              selectionMode="Single"
              scaleWidthMode="Grow"
              style={{ width: '100%' }}
              onRowClick={handleRowClick}
              reactTableOptions={{
                initialState: {
                  expanded: Object.fromEntries(
                    [...new Set(valueCases.map(vc => vc.valueDriver))].map(vd => [`valueDriver:${vd}`, true])
                  ),
                },
                autoResetExpanded: false,
                autoResetSelectedRows: false,
                state: {
                  selectedRowIds: selectedId
                    ? { [String(valueCases.findIndex(vc => vc.id === selectedId))]: true }
                    : {},
                },
              }}
            />
          )
        ) : (
          valueCases.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No value cases yet.</Text>
            </div>
          ) : (
            <div style={{ minHeight: '60vh' }}>
              {cardSubView === 'value-realized' ? (
                <div style={{ padding: '2rem' }}>
                  <MessageStrip design="Information" hideCloseButton>
                    The Value Realized visualization is coming soon. This feature is currently in development and will be available in a future release.
                  </MessageStrip>
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: cardLayout === 'panel' ? '1rem' : 0,
                  paddingBlock: '1rem',
                }}>
                  {allDrivers.map((vd, i) => (
                    <div key={vd} style={cardLayout !== 'panel' && i > 0 ? { marginTop: '1.5rem' } : undefined}>
                      <ValueDriverGroup
                        valueDriver={vd}
                        valueCases={valueCases.filter(vc => vc.valueDriver === vd)}
                        onCardClick={onRowClick}
                        collapsed={collapsedGroups.has(vd)}
                        onToggle={handleGroupToggle}
                        selectedId={selectedId}
                        layout={cardLayout}
                        initiativeStartDate={initiativeStartDate}
                        initiativeEndDate={initiativeEndDate}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </SigTableWrapper>

      <MessageBox
        open={deleteOpen}
        type="Warning"
        titleText="Remove Value Case"
        onClose={(e: any) => {
          if (e.detail?.action === 'OK' && deletingId) {
            showToast('Value case removed')
          }
          setDeleteOpen(false)
          setDeletingId(null)
        }}
      >
        Are you sure you want to remove this value case from this initiative?
      </MessageBox>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}

// ─── Assets Section ────────────────────────────────────────────────────────────

const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  Dashboard:               'Dashboard',
  Document:                'Document',
  Investigation:           'Investigation',
  Metrics:                 'Metrics',
  ProcessModel:            'Process Model',
  ProcessFlow:             'Process Flow',
  Jira:                    'Jira',
  Objective:               'Objective',
  File:                    'File',
  Other:                   'Other',
}

const ASSET_TYPE_OPTIONS: AssetType[] = [
  'Dashboard', 'Document', 'Investigation', 'Metrics',
  'ProcessModel', 'ProcessFlow', 'Jira', 'Objective', 'File', 'Other',
]

const AssetNameCell = memo((props: any) => {
  const row: Asset = props.row?.original
  if (!row) return null
  return (
    <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: 4, minWidth: 0 }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
      {row.url && (
        <Button
          icon="SAP-icons-v4/link"
          design="Transparent"
          style={{ flexShrink: 0, minWidth: 0 }}
          onClick={(e: any) => { e.stopPropagation(); window.open(row.url, '_blank', 'noopener') }}
          title={row.url}
        />
      )}
    </FlexBox>
  )
})

const AssetTypeCell = memo((props: any) => {
  const value: AssetType = props.cell?.value
  if (!value) return null
  return <span>{ASSET_TYPE_LABEL[value] ?? value}</span>
})

const AssetDescCell = memo((props: any) => {
  const value: string = props.cell?.value ?? ''
  return (
    <span title={value} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value || '—'}
    </span>
  )
})

const AssetDateCell = memo((props: any) => (
  <span>{props.cell?.value ?? ''}</span>
))

const AssetCreatedByCell = memo((props: any) => {
  const row: Asset = props.row?.original
  if (!row) return null
  return <span>{row.createdBy.name}</span>
})

function AssetActionCell({ row, onEdit, onDelete }: { row: Asset; onEdit: (a: Asset) => void; onDelete: (a: Asset) => void }) {
  const [open, setOpen] = useState(false)
  const btnId = `asset-more-${row.id}`
  return (
    <>
      <Button
        id={btnId}
        icon="overflow"
        design="Transparent"
        title="More actions"
        onClick={(e: any) => { e.stopPropagation(); setOpen(v => !v) }}
      />
      <Menu opener={btnId} open={open} onClose={() => setOpen(false)}
        onItemClick={(e: any) => {
          const text = (e.detail?.item as any)?.text
          setOpen(false)
          if (text === 'Edit') onEdit(row)
          if (text === 'Remove') onDelete(row)
        }}
      >
        <MenuItem text="Edit" />
        <MenuItem text="Remove" />
      </Menu>
    </>
  )
}

// Add/Edit asset dialog
type AssetFormData = { name: string; url: string; description: string; type: AssetType }

function AssetDialog({
  open, mode, initial, onSave, onClose,
}: {
  open: boolean; mode: 'add' | 'edit'; initial: AssetFormData; onSave: (d: AssetFormData) => void; onClose: () => void
}) {
  const [form, setForm] = useState<AssetFormData>(initial)
  useEffect(() => { if (open) setForm(initial) }, [open])
  const set = (k: keyof AssetFormData) => (e: any) => setForm(f => ({ ...f, [k]: (e.target as any).value ?? '' }))

  return (
    <Dialog
      open={open}
      headerText={mode === 'add' ? 'Add Asset' : 'Edit Asset'}
      style={{ width: '28rem' }}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <Label required showColon>URL</Label>
          <Input
            value={form.url}
            onInput={set('url')}
            placeholder="https://"
            valueState={!form.url.trim() ? ValueState.None : ValueState.None}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <Label required showColon>Name</Label>
          <Input value={form.name} onInput={set('name')} style={{ width: '100%' }} />
        </div>
        <div>
          <Label showColon>Description</Label>
          <TextArea value={form.description} onInput={set('description')} rows={3} style={{ width: '100%' }} />
        </div>
        <div>
          <Label required showColon>Type</Label>
          <Select onChange={(e: any) => setForm(f => ({ ...f, type: (e.detail.selectedOption as HTMLElement).dataset.value as AssetType }))} style={{ width: '100%' }}>
            {ASSET_TYPE_OPTIONS.map(t => (
              <Option key={t} data-value={t} selected={form.type === t}>{ASSET_TYPE_LABEL[t]}</Option>
            ))}
          </Select>
        </div>
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Emphasized" disabled={!form.name.trim() || !form.url.trim()} onClick={() => onSave(form)}>
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}

function AssetsSection({ initiativeId }: { initiativeId: string }) {
  const [assets, setAssets] = useState<Asset[]>(() => ASSETS.filter(a => a.initiativeId === initiativeId))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  const EMPTY_FORM: AssetFormData = { name: '', url: '', description: '', type: 'Other' }

  const handleAdd = () => { setEditingAsset(null); setDialogMode('add'); setDialogOpen(true) }
  const handleEdit = (a: Asset) => { setEditingAsset(a); setDialogMode('edit'); setDialogOpen(true) }
  const handleDelete = (a: Asset) => { setDeletingAsset(a); setDeleteOpen(true) }

  const handleSave = (data: AssetFormData) => {
    if (dialogMode === 'add') {
      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        initiativeId,
        name: data.name,
        url: data.url,
        description: data.description,
        type: data.type,
        dateUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdBy: { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' },
      }
      setAssets(prev => [newAsset, ...prev])
      showToast('Asset added')
    } else if (editingAsset) {
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...data } : a))
      showToast('Asset updated')
    }
    setDialogOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deletingAsset) setAssets(prev => prev.filter(a => a.id !== deletingAsset.id))
    setDeleteOpen(false)
    setDeletingAsset(null)
    showToast('Asset removed')
  }

  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name',
      minWidth: 180,
      Cell: AssetNameCell,
    },
    {
      Header: 'Description',
      accessor: 'description',
      minWidth: 160,
      Cell: AssetDescCell,
    },
    {
      Header: 'Type',
      accessor: 'type',
      width: 130,
      minWidth: 110,
      Cell: AssetTypeCell,
    },
    {
      Header: 'Changed On',
      accessor: 'dateUpdated',
      width: 120,
      minWidth: 100,
      Cell: AssetDateCell,
    },
    {
      Header: 'Created By',
      accessor: 'createdBy',
      width: 140,
      minWidth: 120,
      disableSortBy: true,
      Cell: AssetCreatedByCell,
    },
    {
      id: '__actions',
      Header: '',
      accessor: 'id',
      width: 44,
      disableResizing: true,
      disableSortBy: true,
      Cell: (props: any) => (
        <AssetActionCell
          row={props.row.original}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ], [])

  return (
    <>
      <SigTableWrapper
        businessActionsSlot={
          <ToolbarItem>
            <Button design="Emphasized" icon="add" onClick={handleAdd}>Add Asset</Button>
          </ToolbarItem>
        }
      >
        {assets.length === 0 ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No assets linked yet.</Text>
            <Button design="Default" icon="add" onClick={handleAdd}>Add Asset</Button>
          </div>
        ) : (
          <AnalyticalTable
            columns={columns}
            data={assets}
            visibleRows={assets.length}
            minRows={3}
            rowHeight={32}
            headerRowHeight={32}
            selectionMode={AnalyticalTableSelectionMode.None}
            scaleWidthMode="Grow"
            style={{ width: '100%' }}
          />
        )}
      </SigTableWrapper>

      <AssetDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={editingAsset ? { name: editingAsset.name, url: editingAsset.url, description: editingAsset.description, type: editingAsset.type } : EMPTY_FORM}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      <MessageBox
        open={deleteOpen}
        type="Warning"
        titleText="Remove Asset"
        onClose={(e: any) => {
          if (e.detail?.action === 'OK') handleDeleteConfirm()
          else { setDeleteOpen(false); setDeletingAsset(null) }
        }}
      >
        Are you sure you want to remove "{deletingAsset?.name}"?
      </MessageBox>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}

// ─── Insights Section ─────────────────────────────────────────────────────────

// Matches production Status.tsx — white chip, grey border, coloured dot icon
const INSIGHT_STATUS_ICON_COLOR: Record<string, string> = {
  'Open':        'indication3',
  'In Progress': 'indication5',
  'Resolved':    'indication4',
  'Rejected':    'indication1',
}

/*
  Source: SAP Signavio – UIXtension Element
  Component: SigChipV2
  Variant: design="none" (white + grey border) + leadingIcon="circle-task-2" + leadingIconColor per status
  Pattern: matches production Status.tsx — getStatusIconColor() returns the indication token,
           chip background stays white, only the dot icon is coloured
*/
const InsightStatusCell = memo((props: any) => {
  const value: string = props.cell?.value ?? ''
  if (!value) return null
  return (
    <SigChipV2
      value={value}
      design="none"
      leadingIcon="circle-task-2"
      leadingIconColor={INSIGHT_STATUS_ICON_COLOR[value] as never}
      condensed
    />
  )
})

const InsightTitleCell = memo((props: any) => {
  const value: string = props.cell?.value ?? ''
  return (
    <span title={value} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value}
    </span>
  )
})

/*
  Source: SAP Fiori / UI5 Web Components
  Initiative column — an insight can be associated with one OR many initiatives
  (matches insights-central: Insight.allInitiativeIds: [String]! + initiatives relation).
  Matches staging: a SINGLE initiative renders as an inline navigable reference
  (icon + name); MULTIPLE renders as a "Show N Initiatives" button that opens a
  popover menu of navigable initiative rows (icon + name + navigation chevron).
  Clicking any initiative navigates to that initiative's detail page.
*/
function InsightInitiativeCell(props: any) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const btnId = useId().replace(/:/g, '')
  const row: Insight = props.row?.original
  const ids: string[] = row?.linkedInitiativeIds?.length
    ? row.linkedInitiativeIds
    : (row?.linkedInitiativeId ? [row.linkedInitiativeId] : [])
  const linked = ids.map(id => INITIATIVES.find(i => i.id === id)).filter(Boolean) as typeof INITIATIVES

  if (linked.length === 0) {
    return <span>—</span>
  }

  if (linked.length === 1) {
    const only = linked[0]
    return (
      <div
        role="link"
        title={only.title}
        onClick={(e) => { e.stopPropagation(); navigate('/initiatives/' + only.id) }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0, cursor: 'pointer' }}
      >
        <Icon name="overview-chart" style={{ fontSize: '0.875rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {only.title}
        </span>
      </div>
    )
  }

  return (
    <>
      <Button
        id={`init-menu-${btnId}`}
        design="Default"
        onClick={(e: any) => { e.stopPropagation(); setMenuOpen(true) }}
      >
        {`Show ${linked.length} Initiatives`}
      </Button>
      <Popover
        open={menuOpen}
        opener={`init-menu-${btnId}`}
        hideArrow
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setMenuOpen(false)}
        className="no-padding-popover"
        onClick={(e: any) => e.stopPropagation()}
      >
        <List
          separators="None"
          onItemClick={(e: any) => {
            const target = (e.detail.item as HTMLElement)?.dataset?.initId
            if (target) navigate('/initiatives/' + target)
            setMenuOpen(false)
          }}
        >
          {linked.map(i => (
            <ListItemStandard key={i.id} icon="overview-chart" type="Navigation" data-init-id={i.id}>
              {i.title}
            </ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}

// Business Impact: 5-star scale matching InsightAssessment in production
const BUSINESS_IMPACT_VALUE: Record<string, number> = { 'High': 5, 'Medium': 3, 'Low': 1 }

/*
  Source: SAP Signavio – UIXtension Element
  Component: SigRatingIndicator (readOnly, max=5)
  Pattern: matches InsightAssessment.tsx — stars only, no text label beside them
*/
const BusinessImpactCell = memo((props: any) => {
  const value: string = props.cell?.value ?? ''
  if (!value) return <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
  return (
    <div style={{ zoom: 0.75, lineHeight: 0 }}>
      <SigRatingIndicator filled={BUSINESS_IMPACT_VALUE[value] ?? 0} max={5} readOnly />
    </div>
  )
})

// Urgency: 5-star scale matching InsightAssessment in production
const URGENCY_VALUE: Record<string, number> = { 'Critical': 5, 'High': 4, 'Medium': 3, 'Low': 1 }

/*
  Source: SAP Signavio – UIXtension Element
  Component: SigRatingIndicator (readOnly, max=5)
  Pattern: matches InsightAssessment.tsx — stars only, no text label beside them
*/
const UrgencyCell = memo((props: any) => {
  const value: string = props.cell?.value ?? ''
  if (!value) return <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
  return (
    <div style={{ zoom: 0.75, lineHeight: 0 }}>
      <SigRatingIndicator filled={URGENCY_VALUE[value] ?? 0} max={5} readOnly />
    </div>
  )
})

/*
  Source: SAP Fiori / UI5 Web Components
  Assignee — text only, matching the Initiatives table MembersCell pattern
  (no avatar).
*/
const AssigneeCell = memo((props: any) => {
  const row: Insight = props.row?.original
  if (!row) return null
  const assignee = row.assignees?.[0] ?? row.owner
  if (!assignee) return <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
  return (
    <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
      {assignee.name}
    </Text>
  )
})

const InsightCommentCell = memo((props: any) => {
  const row: Insight = props.row?.original
  if (!row) return null
  return (
    <SigChipV2
      value={String(row.commentCount)}
      leadingIcon="comment"
      condensed
      onClick={(e: any) => e.stopPropagation()}
    />
  )
})

type InsightFilter = 'all' | 'assignedToMe' | 'createdByMe'

const INSIGHT_STATUS_OPTIONS: InsightStatus[] = ['Open', 'In Progress', 'Resolved', 'Rejected']

const INSIGHT_STATUS_COLOR: Record<InsightStatus, string> = {
  'Open':        'indication3',
  'In Progress': 'indication5',
  'Resolved':    'indication4',
  'Rejected':    'indication10',
}

// ─── Insight Side Panel ────────────────────────────────────────────────────────

function InsightStatusChip({ status, onStatusChange }: { status: InsightStatus; onStatusChange: (s: InsightStatus) => void }) {
  const [open, setOpen] = useState(false)
  const chipId = useId()
  return (
    <>
      <SigChipV2
        id={chipId}
        value={status}
        leadingIcon="circle-task-2"
        leadingIconColor={INSIGHT_STATUS_COLOR[status] as any}
        trailingIcon="slim-arrow-down"
        condensed
        onClick={() => setOpen(o => !o)}
      />
      <Popover
        opener={chipId}
        open={open}
        hideArrow
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setOpen(false)}
        className="no-padding-popover"
      >
        <List separators={ListSeparators.None}>
          {INSIGHT_STATUS_OPTIONS.map(s => (
            <ListItemStandard
              key={s}
              selected={s === status}
              onClick={() => { onStatusChange(s); setOpen(false) }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="circle-task-2" style={{ color: `var(--sapIndicationColor_${INSIGHT_STATUS_COLOR[s].replace('indication', '')}_TextColor, var(--sapContent_IconColor))`, fontSize: '0.875rem' }} />
                <span>{s}</span>
              </div>
            </ListItemStandard>
          ))}
        </List>
      </Popover>
    </>
  )
}

function InsightSidePanel({
  insight,
  onClose,
  onStatusChange,
}: {
  insight: Insight
  onClose: () => void
  onStatusChange: (id: string, status: InsightStatus) => void
}) {
  const navigate = useNavigate()
  const [initMenuOpen, setInitMenuOpen] = useState(false)
  const [description, setDescription] = useState(insight.description)
  const [businessImpactVal, setBusinessImpactVal] = useState<number>(
    insight.businessImpact === 'High' ? 5 : insight.businessImpact === 'Medium' ? 3 : insight.businessImpact === 'Low' ? 1 : 0
  )
  const [urgencyVal, setUrgencyVal] = useState<number>(
    insight.urgency === 'Critical' ? 5 : insight.urgency === 'High' ? 4 : insight.urgency === 'Medium' ? 3 : insight.urgency === 'Low' ? 1 : 0
  )

  const linkedIds = insight.linkedInitiativeIds?.length
    ? insight.linkedInitiativeIds
    : insight.linkedInitiativeId ? [insight.linkedInitiativeId] : []
  const linkedInits = linkedIds.map(iid => INITIATIVES.find(i => i.id === iid)).filter(Boolean) as typeof INITIATIVES

  // Sub-header: Status | Initiative | Assignee — row layout matching InsightDetailHeader (isSidePanel=true)
  const subHeader = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.5rem' }}>
      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Status</Label>
        <InsightStatusChip
          status={insight.status}
          onStatusChange={(s) => onStatusChange(insight.id, s)}
        />
      </div>
      {/* Initiative row — matches staging: a dropdown-style reference control
          (bordered box: initiative glyph + "Initiative" prefix + primary name + ▼)
          that opens a menu of the linked initiatives; each is navigable. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Initiative</Label>
        {linkedInits.length === 0 ? (
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>None</Text>
        ) : (
          <>
            <div
              id="insight-initiative-select"
              role="button"
              onClick={() => setInitMenuOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                minWidth: 0, maxWidth: '100%', cursor: 'pointer',
                height: '2.25rem', padding: '0 0.5rem',
                border: '1px solid var(--sapField_BorderColor)',
                borderRadius: 'var(--sapField_BorderCornerRadius, 0.375rem)',
                background: 'var(--sapField_Background)',
              }}
            >
              <Icon name="overview-chart" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
              <Text style={{ color: 'var(--sapLinkColor)', flexShrink: 0 }}>Initiative</Text>
              <Text style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {linkedInits[0].title}
              </Text>
              <Icon name="slim-arrow-down" style={{ fontSize: '0.75rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, marginLeft: '0.25rem' }} />
            </div>
            <Menu
              opener="insight-initiative-select"
              open={initMenuOpen}
              onClose={() => setInitMenuOpen(false)}
              onItemClick={(e: any) => {
                const target = e.detail?.item?.dataset?.initId
                if (target) navigate('/initiatives/' + target)
                setInitMenuOpen(false)
              }}
            >
              {linkedInits.map(init => (
                <MenuItem key={init.id} text={init.title} icon="overview-chart" data-init-id={init.id} />
              ))}
            </Menu>
          </>
        )}
      </div>
      {/* Assignee row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Label wrappingType="None" style={{ flex: '0 0 calc(var(--sapContent_Space_XL) * 2)', overflow: 'hidden', whiteSpace: 'nowrap', alignSelf: 'center' }}>Assignee</Label>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {insight.assignees.length === 0
            ? <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>None</Text>
            : insight.assignees.map(a => (
              <Avatar key={a.id} initials={a.initials} colorScheme={a.colorScheme as never}
                size={AvatarSize.XS} accessibleName={a.name} title={a.name} />
            ))
          }
        </div>
      </div>
    </div>
  )

  return (
    <SigRightSidePanel
      headerTitle={insight.title}
      maxTitleLines={2}
      isOpen
      toggleRightSidePanel={onClose}
      useBoldText
      wrappingType="Wrap"
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden auto', background: 'var(--sapList_Background)' }}
      subHeaderSlot={subHeader}
      tabSlot={[
        <Tab key="details" text="Details" selected>
          {/* Body: Description + Business Impact + Urgency + Action log */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
            <div style={{ maxWidth: '100%', width: '599px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label>Description</Label>
                <TextArea
                  value={description}
                  rows={4}
                  maxlength={1024}
                  style={{ width: '100%' }}
                  onInput={(e: any) => setDescription(e.target.value ?? '')}
                />
              </div>
              {/* Assessments row */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label wrappingType="None">Business Impact</Label>
                  <SigRatingIndicator
                    max={5}
                    filled={businessImpactVal}
                    onInputchange={(v: number) => setBusinessImpactVal(v)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label wrappingType="None">Urgency</Label>
                  <SigRatingIndicator
                    max={5}
                    filled={urgencyVal}
                    onInputchange={(v: number) => setUrgencyVal(v)}
                  />
                </div>
              </div>
              {/* Action log */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                  Created {insight.createdDate}
                </Text>
              </div>
              {/* Collaboration helper — shown when the insight spans multiple initiatives */}
              {linkedInits.length > 1 && (
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: '1.4' }}>
                  Insights are collaborative. When linked across multiple initiatives, updates are automatically reflected everywhere.
                </Text>
              )}
            </div>
          </div>
        </Tab>,
      ]}
    >{null}</SigRightSidePanel>
  )
}

function InsightsSection({
  insights,
  selectedInsightId: _selectedInsightId,
  onRowClick,
}: {
  insights: Insight[]
  selectedInsightId: string | null
  onRowClick: (id: string) => void
}) {
  const [toastOpen, setToastOpen] = useState(false)
  const [filter, setFilter] = useState<InsightFilter>('all')

  const filteredInsights = useMemo(() => {
    if (filter === 'all') return insights
    return insights
  }, [insights, filter])

  /*
    Source: SAP Fiori / UI5 Web Components
    Component: AnalyticalTable (8 columns matching live system)
    Columns: Title | Status | Initiative | Business Impact | Urgency | Assignee | Changed On | Comments
  */
  const columns = useMemo(() => [
    {
      Header: 'Title',
      accessor: 'title',
      minWidth: 200,
      Cell: InsightTitleCell,
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: 130,
      minWidth: 110,
      Cell: InsightStatusCell,
    },
    {
      Header: 'Initiative',
      accessor: 'linkedInitiativeId',
      width: 200,
      minWidth: 150,
      Cell: InsightInitiativeCell,
    },
    {
      Header: 'Business Impact',
      accessor: 'businessImpact',
      width: 140,
      minWidth: 120,
      Cell: BusinessImpactCell,
    },
    {
      Header: 'Urgency',
      accessor: 'urgency',
      width: 120,
      minWidth: 100,
      Cell: UrgencyCell,
    },
    {
      Header: 'Assignee',
      accessor: 'owner',
      width: 160,
      minWidth: 140,
      Cell: AssigneeCell,
    },
    {
      Header: 'Changed On',
      accessor: 'createdDate',
      width: 110,
      minWidth: 100,
      Cell: memo((props: any) => (
        <span>{props.cell?.value ?? ''}</span>
      )),
    },
    {
      id: 'comments',
      Header: '',
      accessor: 'commentCount',
      width: 70,
      minWidth: 60,
      disableSortBy: true,
      disableResizing: true,
      Cell: InsightCommentCell,
    },
  ], [])

  return (
    <>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <SegmentedButton onSelectionChange={(e: any) => setFilter(e.detail?.selectedItems?.[0]?.dataset?.filter ?? 'all')}>
              <SegmentedButtonItem selected={filter === 'all'} data-filter="all">
                {`All (${insights.length})`}
              </SegmentedButtonItem>
              <SegmentedButtonItem selected={filter === 'assignedToMe'} data-filter="assignedToMe">
                Assigned to Me (0)
              </SegmentedButtonItem>
              <SegmentedButtonItem selected={filter === 'createdByMe'} data-filter="createdByMe">
                Created by Me (0)
              </SegmentedButtonItem>
            </SegmentedButton>
          </ToolbarItem>
        }
        businessActionsSlot={
          <ToolbarItem>
            <Button design="Emphasized" onClick={() => setToastOpen(true)}>Create Insight</Button>
          </ToolbarItem>
        }
        sortSlot={
          <ToolbarItem>
            <Button design="Transparent" endIcon="slim-arrow-down" onClick={() => setToastOpen(true)}>
              Sort by Changed On
            </Button>
          </ToolbarItem>
        }
      >
        {filteredInsights.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No Data</Text>
          </div>
        ) : (
          <AnalyticalTable
            columns={columns}
            data={filteredInsights}
            visibleRows={filteredInsights.length}
            minRows={3}
            rowHeight={32}
            headerRowHeight={32}
            selectionMode={AnalyticalTableSelectionMode.None}
            scaleWidthMode="Grow"
            style={{ width: '100%' }}
            onRowClick={(e: any) => {
              const row = e.detail?.row?.original as Insight | undefined
              if (row) onRowClick(row.id)
            }}
          />
        )}
      </SigTableWrapper>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">Coming soon</Toast>
    </>
  )
}

// ─── Initiative Header sub-components ─────────────────────────────────────────

const STATUS_OPTIONS = ['To Do', 'Planning', 'In Progress', 'At Risk', 'Completed', 'Archived'] as const
type InitiativeStatus = typeof STATUS_OPTIONS[number]

const STATUS_ICON_COLOR: Record<InitiativeStatus, IndicationColorDesigns> = {
  'To Do':      'indication3',
  'Planning':   'indication6',
  'In Progress':'indication5',
  'At Risk':    'indication1',
  'Completed':  'indication4',
  'Archived':   'indication10',
}

/*
  Source: SAP Signavio – UIXtension Element
  Component: SigChipV2 (interactive) + ui5-popover list
  Pattern: matches Status.tsx in insights-central-frontend — circle-task-2 leading icon,
  slim-arrow-down trailing icon, popover with list of options on click
*/
function StatusChip({ status }: { status: string }) {
  const [current, setCurrent] = useState<string>(status)
  const [open, setOpen] = useState(false)
  const chipId = useId()
  const [fixedWidth, setFixedWidth] = useState<number | undefined>(undefined)
  const measureRef = useRef<HTMLDivElement>(null)

  // Render all options as hidden chips, measure their actual rendered widths,
  // then lock the wrapper to the widest one — no canvas, no estimated chrome.
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    let raf: number
    const measure = () => {
      const chips = Array.from(el.children) as HTMLElement[]
      const widths = chips.map(c => c.getBoundingClientRect().width)
      if (widths.length > 0 && widths.every(w => w > 0)) {
        setFixedWidth(Math.ceil(Math.max(...widths)))
      } else {
        // Web components not yet painted — retry next frame
        raf = requestAnimationFrame(measure)
      }
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      {/* Off-screen measurement: one chip per option, removed once widths are known */}
      {fixedWidth === undefined && (
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', top: '-9999px', left: '-9999px', display: 'flex', flexDirection: 'column' }}
        >
          {STATUS_OPTIONS.map(s => (
            <SigChipV2
              key={s}
              value={s}
              leadingIcon="circle-task-2"
              leadingIconColor={STATUS_ICON_COLOR[s as InitiativeStatus] ?? 'indication3'}
              trailingIcon="slim-arrow-down"
            />
          ))}
        </div>
      )}
      <div style={{ minWidth: fixedWidth, display: 'inline-block' }}>
        <SigChipV2
          id={chipId}
          value={current}
          leadingIcon="circle-task-2"
          leadingIconColor={STATUS_ICON_COLOR[current as InitiativeStatus] ?? 'indication3'}
          trailingIcon="slim-arrow-down"
          onClick={() => setOpen(v => !v)}
        />
      </div>
      <Popover
        open={open}
        opener={chipId}
        hideArrow
        placement={PopoverPlacement.Bottom}
        horizontalAlign={PopoverHorizontalAlign.Start}
        onClose={() => setOpen(false)}
        className="no-padding-popover"
        style={{ minWidth: fixedWidth ? `${fixedWidth}px` : '160px' }}
      >
        <List separators={ListSeparators.None}>
          {STATUS_OPTIONS.map(s => (
            <ListItemCustom
              key={s}
              type="Active"
              selected={s === current}
              accessibleName={s}
              onClick={() => { setCurrent(s); setOpen(false) }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 6px 0 3px', height: '32px', width: '100%', boxSizing: 'border-box' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_DOT_COLOR[s] ?? 'var(--sapContent_LabelColor)', flexShrink: 0 }} />
                <Text style={{ fontSize: 'var(--sapFontSize)' }}>{s}</Text>
              </div>
            </ListItemCustom>
          ))}
        </List>
      </Popover>
    </>
  )
}
function HeaderFormFacet({ fields }: {
  fields: { label: string; value: string }[]
}) {
  return (
    <FlexBox direction={FlexBoxDirection.Column} style={{ gap: 'var(--sapContent_IconHeight, 0.25rem)', rowGap: '0.25rem' }}>
      {fields.map(f => (
        <FlexBox
          key={f.label}
          direction={FlexBoxDirection.Row}
          alignItems={FlexBoxAlignItems.Center}
        >
          {/*
            Source: SAP Fiori / UI5 Web Components
            Component: ui5-label
            Variant: showColon, wrappingType=None — renders label color + colon automatically
          */}
          <Label showColon wrappingType={WrappingType.None}>{f.label}</Label>
          &nbsp;
          <Text>{f.value}</Text>
        </FlexBox>
      ))}
    </FlexBox>
  )
}

const DESCRIPTION_PREVIEW_LENGTH = 100

/*
  Source: SAP Fiori / UI5 Web Components
  Component: ui5-responsive-popover
  Pattern: matches DescriptionWithPopover in insights-central-frontend — truncates at
  DESCRIPTION_PREVIEW_LENGTH and shows full text in a popover on "Show more"
*/
function DescriptionFacet({ description }: { description: string }) {
  const [open, setOpen] = useState(false)
  const btnId = useId()
  const isTruncated = description.length > DESCRIPTION_PREVIEW_LENGTH
  const preview = isTruncated
    ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`
    : description
  return (
    <FlexBox direction={FlexBoxDirection.Column}>
      <Text>{preview}</Text>
      {isTruncated && (
        <>
          <Button
            id={btnId}
            design="Transparent"
            onClick={() => setOpen(v => !v)}
            style={{ alignSelf: 'flex-start', padding: 0 }}
          >
            Show more
          </Button>
          <ResponsivePopover
            open={open}
            opener={btnId}
            placement={PopoverPlacement.Bottom}
            onClose={() => setOpen(false)}
            style={{ maxWidth: '24rem' }}
          >
            <div style={{ padding: '0.75rem 1rem' }}>
              <Text>{description}</Text>
            </div>
          </ResponsivePopover>
        </>
      )}
    </FlexBox>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  useLocation() // keep for future use; currently reads via window.location.hash
  const [selectedItem, setSelectedItem] = useState<ValueCase | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [localInsights, setLocalInsights] = useState<Insight[]>(INSIGHTS)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [enrichDialogOpen, setEnrichDialogOpen] = useState(false)
  const objectPageRef = useRef<ObjectPageDomRef>(null)
  const panelSize = '540px'

  // React Router HashRouter: location.search and location.hash are both empty —
  // the full route (#/initiatives/id?section=valueCases&insightId=...) lives in window.location.hash.
  const rawHash = window.location.hash
  const hashSearch = rawHash.includes('?') ? rawHash.slice(rawHash.indexOf('?')) : ''
  const searchParams = new URLSearchParams(hashSearch)
  const sectionParam = searchParams.get('section')
  const insightIdParam = searchParams.get('insightId')
  const selectedSection = sectionParam === 'valueCases' ? 'valueCases'
    : sectionParam === 'assets' ? 'assets'
    : sectionParam === 'tasks' ? 'tasks'
    : 'insights'

  const selectedInsight = insightIdParam ? localInsights.find(i => i.id === insightIdParam) ?? null : null

  const handleInsightRowClick = (insightId: string) => {
    const current = new URLSearchParams(hashSearch)
    if (current.get('insightId') === insightId) {
      current.delete('insightId')
    } else {
      current.set('insightId', insightId)
    }
    const qs = current.toString()
    navigate(`/initiatives/${id}${qs ? '?' + qs : ''}`)
  }

  const handleInsightStatusChange = (insightId: string, status: InsightStatus) => {
    setLocalInsights(prev => prev.map(i => i.id === insightId ? { ...i, status } : i))
  }

  const init = INITIATIVES.find(i => i.id === id)

  useEffect(() => {
    if (init) document.title = `${init.title} – SAP Signavio`
  }, [init?.title])

  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  if (!init) {
    return <div style={{ padding: '2rem' }}><Text>Initiative not found.</Text></div>
  }

  const valueCases = VALUE_CASES.filter(vc => vc.initiativeId === id)
  const insights = localInsights.filter(i =>
    (i.linkedInitiativeIds?.length ? i.linkedInitiativeIds : (i.linkedInitiativeId ? [i.linkedInitiativeId] : [])).includes(id!)
  )
  const insightCount = insights.length
  const pageAssets = ASSETS.filter(a => a.initiativeId === id)
  const plCases = valueCases.filter(vc => vc.type === 'Profit and Loss')
  const wcCases = valueCases.filter(vc => vc.type === 'Working Capital')
  const plPotential = plCases[0]?.groupPotential ?? '-'
  const plRealized = plCases[0]?.groupRealized ?? '-'
  const wcPotential = wcCases[0]?.groupPotential ?? '-'
  const wcRealized = wcCases[0]?.groupRealized ?? '-'

  const sections = [
    { id: 'insights', text: `Insights (${insightCount})` },
    { id: 'valueCases', text: `Value Cases (${valueCases.length})` },
    { id: 'assets', text: `Assets (${pageAssets.length})` },
    { id: 'tasks', text: 'Tasks' },
  ]

  return (
    <>
    <SplitterLayout
      options={{ resetOnSizeChange: true, resetOnChildrenChange: true }}
      style={{ height: '100%', width: '100%', overflow: 'hidden' }}
    >
      {/* ── Main ObjectPage ── */}
      <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
        {/*
          Source: SAP Fiori / UI5 Web Components
          Component: ObjectPage with mode=IconTabBar
          Pattern: Object Page floorplan (Fiori standard)
        */}
        <ObjectPage
          ref={objectPageRef}
          mode={ObjectPageMode.IconTabBar}
          selectedSectionId={selectedSection}
          onSelectedSectionChange={(e: any) => {
            const sec = e.detail?.sectionId ?? 'insights'
            // Close both panels when switching tabs
            setPanelOpen(false)
            setSelectedItem(null)
            const current = new URLSearchParams(hashSearch)
            if (sec === 'insights') current.delete('section')
            else current.set('section', sec)
            current.delete('insightId')
            const qs = current.toString()
            navigate(`/initiatives/${id}${qs ? '?' + qs : ''}`)
          }}
          style={{ height: '100%', '--sapObjectHeader_Hover_Background': 'var(--sapObjectHeader_Background)' } as any}
          hidePinButton={false}
          image={
            /*
              Source: SAP Fiori / UI5 Web Components
              Component: ui5-avatar
              Variant: Square, Accent6, L
            */
            <Avatar
              colorScheme={AvatarColorScheme.Accent6}
              icon="overview-chart"
              shape={AvatarShape.Square}
              size={AvatarSize.L}
            />
          }
          titleArea={
            /*
              Source: SAP Fiori / UI5 Web Components
              Component: ObjectPageTitle
              Pattern: Object Page Title with breadcrumbs + actions
            */
            <ObjectPageTitle
              breadcrumbs={
                <Breadcrumbs
                  design="NoCurrentPage"
                  onItemClick={(e: any) => { e.preventDefault(); navigate('/initiatives') }}
                >
                  <BreadcrumbsItem>Initiatives</BreadcrumbsItem>
                </Breadcrumbs>
              }
              header={<>{init.title}</>}
              actionsBar={
                <FlexBox style={{ gap: 8 }}>
                  <Button design="Emphasized" onClick={() => setEnrichDialogOpen(true)}>Enrich Initiative</Button>
                  <Button design="Transparent" onClick={() => showToast('Edit coming soon')}>Edit</Button>
                  <Button design="Transparent" icon="share-2" onClick={() => showToast('Share coming soon')} />
                  <Button design="Transparent" icon="delete" onClick={() => showToast('Delete coming soon')} />
                </FlexBox>
              }
            />
          }
          headerArea={
            /*
              Source: SAP Fiori / UI5 Web Components
              Component: ObjectPageHeader
              Pattern: Attribute facets matching Header.tsx in insights-central-frontend
              Sub-components: HeaderFormFacet (Label+Text rows), DescriptionFacet (truncated + popover)
            */
            <ObjectPageHeader>
              <FlexBox
                alignItems={FlexBoxAlignItems.Start}
                wrap={FlexBoxWrap.Wrap}
                style={{ gap: '2rem' }}
              >
                {/* Status facet */}
                <FlexBox direction={FlexBoxDirection.Column}>
                  <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>Status</Text>
                  <StatusChip status={init.status} />
                </FlexBox>

                {/* Members facet */}
                <FlexBox direction={FlexBoxDirection.Column} style={{ width: '7rem' }}>
                  <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>Members</Text>
                  <FlexBox style={{ gap: 2 }}>
                    {init.members.slice(0, 4).map(m => (
                      /*
                        Source: SAP Fiori / UI5 Web Components
                        Component: ui5-avatar
                        Variant: XS with initials
                      */
                      <Avatar
                        key={m.id}
                        initials={m.initials}
                        colorScheme={m.colorScheme as never}
                        size={AvatarSize.XS}
                        accessibleName={m.name}
                        title={m.name}
                      />
                    ))}
                  </FlexBox>
                </FlexBox>

                {/* About facet — uses HeaderFormFacet (Label showColon + Text rows) */}
                <FlexBox direction={FlexBoxDirection.Column}>
                  <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>About</Text>
                  <HeaderFormFacet fields={[
                    { label: 'Owner', value: init.owner.name },
                    {
                      label: 'Start / End',
                      value: init.startDate
                        ? `${init.startDate}${init.endDate ? ` / ${init.endDate}` : ''}`
                        : '—',
                    },
                    { label: 'Changed On', value: init.changedOn },
                  ]} />
                </FlexBox>

                {/* Description facet — truncated with Show more popover */}
                {init.description && (
                  <FlexBox direction={FlexBoxDirection.Column} style={{ maxWidth: '20rem' }}>
                    <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>Description</Text>
                    <DescriptionFacet description={init.description} />
                  </FlexBox>
                )}

                {/* Total Value P&L facet */}
                {plCases.length > 0 && (
                  <FlexBox direction={FlexBoxDirection.Column}>
                    <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>Total Value Profit &amp; Loss</Text>
                    <HeaderFormFacet fields={[
                      { label: 'Potential Value', value: plPotential },
                      { label: 'Realized Value', value: plRealized },
                    ]} />
                  </FlexBox>
                )}

                {/* Total Value Working Capital facet */}
                {wcCases.length > 0 && (
                  <FlexBox direction={FlexBoxDirection.Column}>
                    <Text style={{ marginBottom: 'var(--sapContent_IconHeight, 0.25rem)' }}>Total Value Working Capital</Text>
                    <HeaderFormFacet fields={[
                      { label: 'Potential Value', value: wcPotential },
                      { label: 'Realized Value', value: wcRealized },
                    ]} />
                  </FlexBox>
                )}
              </FlexBox>
            </ObjectPageHeader>
          }
        >
          {/* Insights section */}
          <ObjectPageSection
            id="insights"
            aria-label={sections[0].text}
            titleText={sections[0].text}
          >
            <InsightsSection
                insights={insights}
                selectedInsightId={insightIdParam}
                onRowClick={handleInsightRowClick}
              />
          </ObjectPageSection>

          {/* Value Cases section */}
          <ObjectPageSection
            id="valueCases"
            aria-label={sections[1].text}
            titleText={sections[1].text}
          >
            <ValueCasesSection
              valueCases={valueCases}
              onRowClick={(item) => {                setSelectedItem(item)
                setPanelOpen(true)
                objectPageRef.current?.toggleHeaderArea(true)
                // After panel animation settles, scroll selected card to top of viewport
                setTimeout(() => {
                  const card = document.getElementById(`value-case-card-${item.id}`)
                  if (!card) return
                  // Measure the sticky ObjectPage title bar height to avoid it covering the card
                  const stickyBar = objectPageRef.current?.shadowRoot?.querySelector('.ui5-dynamic-page-title-bar') as HTMLElement | null
                  const stickyHeight = stickyBar ? stickyBar.getBoundingClientRect().height : 0
                  let scrollEl: HTMLElement | null = card.parentElement
                  while (scrollEl) {
                    const overflow = window.getComputedStyle(scrollEl).overflowY
                    if (overflow === 'auto' || overflow === 'scroll') break
                    scrollEl = scrollEl.parentElement
                  }
                  if (scrollEl) {
                    const cardTop = card.getBoundingClientRect().top
                    const containerTop = scrollEl.getBoundingClientRect().top
                    scrollEl.scrollTo({ top: scrollEl.scrollTop + cardTop - containerTop - stickyHeight - 8, behavior: 'smooth' })
                  }
                }, 300)
              }}
              selectedId={selectedItem?.id ?? null}
              initiativeStartDate={init.startDate}
              initiativeEndDate={init.endDate}
              objectPageRef={objectPageRef}
            />
          </ObjectPageSection>

          {/* Assets section */}
          <ObjectPageSection
            id="assets"
            aria-label={sections[2].text}
            titleText={sections[2].text}
          >
            <AssetsSection initiativeId={id!} />
          </ObjectPageSection>

          {/* Tasks section */}
          <ObjectPageSection
            id="tasks"
            aria-label={sections[3].text}
            titleText={sections[3].text}
          >
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No tasks yet.</Text>
            </div>
          </ObjectPageSection>
        </ObjectPage>
      </SplitterElement>

      {/* ── Right side panel (resizable) ── */}
      {panelOpen && selectedItem && (
        <SplitterElement
          size={panelSize}
          minSize={400}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid var(--sapList_BorderColor)' }}
        >
          <ValueCaseSidePanel
            item={selectedItem}
            onClose={() => { setPanelOpen(false); setSelectedItem(null); objectPageRef.current?.toggleHeaderArea(false) }}
            onRename={(name) => { selectedItem.name = name; setSelectedItem({ ...selectedItem }) }}
          />
        </SplitterElement>
      )}

      {/* ── Insight detail panel (resizable, URL-driven) ── */}
      {selectedInsight && (
        <SplitterElement
          size={panelSize}
          minSize={400}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid var(--sapList_BorderColor)' }}
        >
          <InsightSidePanel
            insight={selectedInsight}
            onClose={() => {
              const current = new URLSearchParams(hashSearch)
              current.delete('insightId')
              const qs = current.toString()
              navigate(`/initiatives/${id}${qs ? '?' + qs : ''}`)
            }}
            onStatusChange={handleInsightStatusChange}
          />
        </SplitterElement>
      )}
    </SplitterLayout>
      <EnrichDialogAccordion
        open={enrichDialogOpen}
        onClose={() => setEnrichDialogOpen(false)}
        initiative={init}
        onApply={(enrichedData) => {
          setEnrichDialogOpen(false)
          showToast(`Added ${enrichedData.insights.length} insights, ${enrichedData.assets.length} assets, ${enrichedData.tasks.length} tasks`)
        }}
      />
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}
