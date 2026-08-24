import { Dialog, Text, Button, Bar, Link } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

type Severity = 'error' | 'warning' | 'hint'

const CHIP_DESIGN: Record<Severity, string> = {
  error: 'error',
  warning: 'warning',
  hint: 'information',
}

const SEVERITY_LABEL: Record<Severity, string> = {
  error: 'Mandatory',
  warning: 'Recommendation',
  hint: 'Information',
}

type ConventionEntry = {
  severity: Severity | null  // null = group header row (no chip)
  name: string
  description?: string
  desiredValue?: string
  children?: ConventionEntry[]
}

type ConventionSection = {
  name: string
  entries: ConventionEntry[]
}

const SECTIONS: ConventionSection[] = [
  {
    name: 'SAP Signavio Process Governance BPMN 2.0 conventions',
    entries: [
      { severity: 'warning', name: 'Absence of deadlocks', description: 'Checks if the diagram is free of deadlocks.' },
      { severity: 'warning', name: 'Absence of multi merges', description: 'Checks if the diagram is free of multi merges.' },
      { severity: 'error', name: 'Absence of split and join behavior on one element', description: 'Checks if all gateways are either splitting or merging.' },
      {
        severity: null,
        name: 'SAP Signavio Process Governance BPMN 2.0 conventions',
        description: 'Checks if the diagram follows the conventions required for interchange with SAP Signavio Process Governance.',
        children: [
          { severity: 'error', name: 'Usage of supported task types' },
        ],
      },
      {
        severity: null,
        name: 'Usage of a defined BPMN subset',
        description: 'Checks if the defined BPMN sub set is used in the diagram.',
        children: [
          { severity: 'warning', name: 'BPMN 2.0 for SAP Signavio Process Governance' },
        ],
      },
      { severity: 'error', name: 'Usage of correct syntax', description: 'Checks if all diagrams are modeled using correct syntax.' },
    ],
  },
  {
    name: 'BPMN Method and Style Conventions',
    entries: [
      { severity: 'warning', name: '"Method and Style"-conform labeling of events', description: 'Checks if all triggered start events, all intermediate events and all end events (in diagrams with several end states) are labeled.' },
      { severity: 'warning', name: 'Absence of deadlocks', description: 'Checks if the diagram is free of deadlocks.' },
      { severity: 'warning', name: 'Absence of multi merges', description: 'Checks if the diagram is free of multi merges.' },
      {
        severity: null,
        name: 'Consistency between super processes and sub processes',
        children: [
          { severity: 'warning', name: 'Boundary events', description: 'Checks if errors, escalations and messages are consistent between super- and subprocesses.' },
          { severity: 'warning', name: 'Pools' },
          { severity: 'warning', name: 'Message flows' },
        ],
      },
      { severity: 'warning', name: 'Consistent naming of subprocesses', description: 'Checks if collapsed subprocesses have the same name as the embedded diagrams.' },
      { severity: 'warning', name: 'Consistent usage of signals', description: 'Checks if throwing and catching signal events are used consistently.' },
      { severity: 'warning', name: 'Consistent usage of start and end events', description: 'Checks if start and end events are used in consistent combinations.', desiredValue: 'consistent usage' },
      { severity: 'warning', name: 'Correct usage of OR gateways', description: 'Checks that an OR gateway does not merge exclusive alternative paths.' },
      { severity: 'warning', name: 'Correct usage of conditional and default flows', description: 'Checks if conditional and default flows are only used if it is semantically correct.' },
      {
        severity: null,
        name: 'Definition of required element names',
        children: [
          { severity: 'warning', name: 'Activities', description: 'Checks if elements are named.' },
          { severity: 'warning', name: 'Message flows' },
        ],
      },
      { severity: 'warning', name: 'Distinct names for end events', description: 'Checks if all end events of the diagram have distinct names.' },
      { severity: 'warning', name: 'Test of subprocess end states', description: 'Subprocesses with more than one non-Error end state must be followed by a gateway that tests the end state.' },
    ],
  },
  {
    name: 'SAP Best Practices',
    entries: [
      { severity: 'error', name: 'A process must have exactly one start event', description: 'Ensures unambiguous process entry point.' },
      { severity: 'error', name: 'A process must have at least one end event', description: 'Ensures the process has a defined termination.' },
      { severity: 'warning', name: 'Lanes should represent roles, not departments', description: 'Improves clarity and reusability of the model.' },
      { severity: 'warning', name: 'Gateways must be labeled with a question', description: 'Makes decision logic explicit and readable.' },
      { severity: 'error', name: 'Tasks must be named using verb-object pattern', description: 'Establishes consistent activity naming across models.' },
      { severity: 'warning', name: 'Events must be named using noun phrase in past tense', description: 'Distinguishes events from activities by naming convention.' },
      { severity: 'warning', name: 'Process flow should go from left to right', description: 'Maintains consistent reading direction across diagrams.' },
      { severity: 'error', name: 'Sequence flows must not cross lane boundaries', description: 'Prevents visually ambiguous handovers between roles.' },
    ],
  },
  {
    name: 'eCH-0158 BPMN Conventions',
    entries: [
      { severity: 'error', name: 'A process must have at least one end event', description: 'Required by eCH-0158 standard.' },
      { severity: 'error', name: 'Only use standard BPMN 2.0 elements unless otherwise specified', description: 'Ensures interchange compatibility per eCH-0158.' },
      { severity: 'warning', name: 'Use the correct event type for the modeled context', description: 'Catches semantic misuse of BPMN event markers.' },
      {
        severity: null,
        name: 'Definition of required element names',
        children: [
          { severity: 'error', name: 'Activities', description: 'Checks if activities are named.' },
          { severity: 'warning', name: 'Events', description: 'Checks if events are named.' },
          { severity: 'error', name: 'Data objects', description: 'Checks if data objects are named.' },
        ],
      },
    ],
  },
]

const BORDER = '1px solid var(--sapList_BorderColor)'
const GRID = '9rem 1fr 2fr 8rem'

function EntryRow({ entry, isChild }: { entry: ConventionEntry; isChild?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: BORDER, background: 'var(--sapList_Background)', minHeight: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRight: BORDER }}>
        {entry.severity && (
          <SigChipV2
            value={SEVERITY_LABEL[entry.severity]}
            design={CHIP_DESIGN[entry.severity] as any}
            condensed
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRight: BORDER, paddingLeft: isChild ? '1.5rem' : '0.75rem' }}>
        {isChild && <Text style={{ color: 'var(--sapContent_LabelColor)', marginRight: '0.35rem', fontSize: 'var(--sapFontSmallSize)' }}>{'>'}</Text>}
        <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{entry.name}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRight: BORDER }}>
        {entry.description && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>{entry.description}</Text>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem' }}>
        {entry.desiredValue && <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{entry.desiredValue}</Text>}
      </div>
    </div>
  )
}

function GroupRow({ entry }: { entry: ConventionEntry }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: BORDER, background: 'var(--sapList_Background)', minHeight: 36 }}>
        <div style={{ borderRight: BORDER }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRight: BORDER }}>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>{entry.name}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRight: BORDER }}>
          {entry.description && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>{entry.description}</Text>}
        </div>
        <div />
      </div>
      {entry.children?.map((child, i) => (
        <EntryRow key={i} entry={child} isChild />
      ))}
    </>
  )
}

export function ConventionsBody() {
  return (
    <div>
      {SECTIONS.map(section => (
        <div key={section.name} style={{ marginBottom: '1.5rem' }}>
          {/* Section heading */}
          <div style={{ padding: '0.625rem 0.75rem', background: 'var(--sapList_Background)' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', fontFamily: 'var(--sapFontFamily)' }}>
              {section.name}
            </Text>
          </div>

          {/* Column header */}
          <div style={{ display: 'grid', gridTemplateColumns: GRID, background: 'var(--sapList_HeaderBackground)', borderTop: BORDER, borderBottom: BORDER }}>
            <div style={{ padding: '0.3rem 0.75rem', borderRight: BORDER }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>Level</Text>
            </div>
            <div style={{ padding: '0.3rem 0.75rem', borderRight: BORDER }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>Name</Text>
            </div>
            <div style={{ padding: '0.3rem 0.75rem', borderRight: BORDER }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>Description</Text>
            </div>
            <div style={{ padding: '0.3rem 0.75rem' }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>Desired values</Text>
            </div>
          </div>

          {/* Rows */}
          <div style={{ border: BORDER, borderTop: 'none' }}>
            {section.entries.map((entry, i) =>
              entry.severity === null
                ? <GroupRow key={i} entry={entry} />
                : <EntryRow key={i} entry={entry} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export default function ConventionsDialog({ open, onClose }: Props) {
  const openInNewWindow = () => {
    window.open(`${window.location.origin}${window.location.pathname}#/conventions-standalone`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog
      open={open}
      headerText="Modeling Conventions"
      onClose={onClose}
      className="dialog-padding-s no-padding-dialog"
      style={{ width: '72rem', maxWidth: '95vw' }}
    >
      <div style={{ padding: '1rem' }}>
        <ConventionsBody />
      </div>
      <Bar slot="footer">
        <Link slot="startContent" onClick={openInNewWindow} style={{ cursor: 'pointer' }}>
          Open Modeling Conventions in new window
        </Link>
        <Button slot="endContent" design="Emphasized" onClick={onClose}>Close</Button>
      </Bar>
    </Dialog>
  )
}
