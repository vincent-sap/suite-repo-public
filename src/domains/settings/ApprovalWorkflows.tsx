import { useState, useRef } from 'react'
import {
  Text, Label, CheckBox, Select, Option,
  Button, Input, Icon, MessageStrip, Dialog, Bar, Popover, List, ListItemStandard,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Link, ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode,
} from '@ui5/webcomponents-react'
import type React from 'react'

import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import InfoPopover from './components/InfoPopover'
import { SigPagination, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import s from './components/SettingsPage.module.css'

const TIMESPAN_OPTIONS = ['Never', 'Fixed period', 'Defined in a custom attribute (type: number)']

type JMWorkflow = { id: string; name: string; participants: string }
const INITIAL_JM_WORKFLOWS: JMWorkflow[] = [
  { id: 'jm1', name: 'JM approval_Parte Deux', participants: 'Journey owner' },
  { id: 'jm2', name: 'JM Approval - Parte Troi', participants: 'Role_01, Role_02' },
  { id: 'jm3', name: 'Denise example process', participants: 'Journey Modeler, Journey Owner, John Doe' },
]

type Workflow = { id: string; name: string; owner: string; lastModified: string; lastModifiedMs: number }
const ALL_WORKFLOWS: Workflow[] = [
  { id: 'wf1',  name: 'Invoice approval V3.5',        owner: 'Charlotte Hojby',   lastModified: '2 days ago',    lastModifiedMs: 2 },
  { id: 'wf2',  name: 'Purchase Order Approval',      owner: 'Klaus Cole',        lastModified: '10 days ago',   lastModifiedMs: 10 },
  { id: 'wf3',  name: 'HR Onboarding Sign-off',       owner: 'John Miller',       lastModified: '2 weeks ago',   lastModifiedMs: 14 },
  { id: 'wf4',  name: 'Travel Expense Review',        owner: 'Will Shi',          lastModified: '2 months ago',  lastModifiedMs: 60 },
  { id: 'wf5',  name: 'Contract Approval Flow',       owner: 'Steve Gallion',     lastModified: '6 months ago',  lastModifiedMs: 180 },
  { id: 'wf6',  name: 'Ad-hoc Invoice approval V2',   owner: 'Karl Smith',        lastModified: '10 months ago', lastModifiedMs: 300 },
  { id: 'wf7',  name: 'Ad-hoc Purchase Order Ap…',   owner: 'João Dias Martim',  lastModified: '11 months ago', lastModifiedMs: 330 },
  { id: 'wf8',  name: 'Contract Approval Flow',       owner: 'Steve Gallion',     lastModified: '11 months ago', lastModifiedMs: 331 },
  { id: 'wf9',  name: 'Ad-hoc Invoice approval V2',   owner: 'Karl Smith',        lastModified: '1 year ago',    lastModifiedMs: 365 },
  { id: 'wf10', name: 'Ad-hoc Purchase Order Ap…',   owner: 'João Dias Martim',  lastModified: '1.5 years ago', lastModifiedMs: 548 },
  { id: 'wf11', name: 'Employee Offboarding Review',  owner: 'Anna Brown',        lastModified: '2 years ago',   lastModifiedMs: 730 },
  { id: 'wf12', name: 'Vendor Onboarding Approval',   owner: 'Tom Hansen',        lastModified: '2 years ago',   lastModifiedMs: 731 },
  { id: 'wf13', name: 'IT Access Request Flow',       owner: 'Sara Lim',          lastModified: '2.5 years ago', lastModifiedMs: 912 },
  { id: 'wf14', name: 'Budget Approval Process',      owner: 'Mark Novak',        lastModified: '2.5 years ago', lastModifiedMs: 913 },
  { id: 'wf15', name: 'Capital Expenditure Approval', owner: 'Priya Patel',       lastModified: '3 years ago',   lastModifiedMs: 1095 },
  { id: 'wf16', name: 'Supplier Contract Review',     owner: 'James Wu',          lastModified: '3 years ago',   lastModifiedMs: 1096 },
  { id: 'wf17', name: 'Marketing Campaign Sign-off',  owner: 'Lea Müller',        lastModified: '3 years ago',   lastModifiedMs: 1097 },
  { id: 'wf18', name: 'Product Launch Approval',      owner: 'Carlos Reyes',      lastModified: '3.5 years ago', lastModifiedMs: 1278 },
  { id: 'wf19', name: 'Legal Document Review',        owner: 'Nina Ivanova',      lastModified: '4 years ago',   lastModifiedMs: 1460 },
  { id: 'wf20', name: 'Compliance Check Workflow',    owner: 'David Osei',        lastModified: '4 years ago',   lastModifiedMs: 1461 },
  { id: 'wf21', name: 'Procurement Sign-off',         owner: 'Elena Costa',       lastModified: '4.5 years ago', lastModifiedMs: 1643 },
  { id: 'wf22', name: 'Annual Budget Review',         owner: 'Felix Wagner',      lastModified: '5 years ago',   lastModifiedMs: 1825 },
]

type DiagramState = { id: string; name: string; icon: string; publishInHub: boolean; resetExpiration: boolean }

const ICON_OPTIONS = [
  { name: 'accept', label: '✓' },
  { name: 'decline', label: '✕' },
  { name: 'flag', label: '⚑' },
  { name: 'sys-enter-2', label: '⚙' },
  { name: 'world', label: '🌐' },
  { name: 'document', label: '📄' },
  { name: 'task', label: '☑' },
  { name: 'edit-outside', label: '✎' },
  { name: 'complete', label: '☑' },
  { name: 'pending', label: '⏱' },
  { name: 'forward', label: '»' },
  { name: 'status-positive', label: '●' },
  { name: 'status-negative', label: '●' },
  { name: 'alert', label: '⚠' },
  { name: 'error', label: '⊗' },
  { name: 'history', label: '⏱' },
  { name: 'sys-help', label: '?' },
  { name: 'locked', label: '🔒' },
  { name: 'unlocked', label: '🔓' },
]

const INITIAL_STATES: DiagramState[] = [
  { id: '1', name: 'in progress',     icon: 'settings', publishInHub: false, resetExpiration: false },
  { id: '2', name: 'approved',        icon: 'accept',   publishInHub: false, resetExpiration: true  },
  { id: '3', name: 'reviewed by CoE', icon: 'flag',     publishInHub: false, resetExpiration: false },
  { id: '4', name: 'rejected',        icon: 'decline',  publishInHub: false, resetExpiration: false },
  { id: '5', name: 'published',       icon: 'world',    publishInHub: true,  resetExpiration: false },
]

type Participant = { id: string; role: string; attribute: string }
const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', role: 'Process Owner',        attribute: 'Process Owner TEST' },
  { id: '2', role: 'Process Participant 1', attribute: 'Process Name' },
  { id: '3', role: 'Process Participant 2', attribute: '-----' },
]
const ATTRIBUTE_OPTIONS = ['-----', 'Process Owner TEST', 'Process Name', 'Process Manager', 'Process Expert']
const WORKFLOW_OPTIONS = ['Select Workflow', 'Approval 1', 'Approval Parte Deux']
const CUSTOM_ATTRIBUTE_OPTIONS = ['Select attribute', 'Process Owner TEST', 'Process Name', 'Process Manager']
const PAGE_SIZE = 5
const SORT_OPTIONS = ['↑ Last modified', '↓ Last modified', 'A→Z Owner']

function IconChip({ icon, onClick, id }: { icon: string; onClick: () => void; id: string }) {
  return (
    <SigChipV2
      id={id}
      value=""
      leadingIcon={icon}
      trailingIcon="slim-arrow-down"
      onClick={onClick}
    />
  )
}

export default function ApprovalWorkflows() {
  const [isDirty, setIsDirty] = useState(false)
  const [jmWorkflows] = useState<JMWorkflow[]>(INITIAL_JM_WORKFLOWS)

  // Approval Workflows table state
  const [wfSearch, setWfSearch] = useState('')
  const [sortKey, setSortKey] = useState('↑ Last modified')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(0)

  // Access and Configuration
  const [useWorkflowPermissions, setUseWorkflowPermissions] = useState(false)

  // Diagram States
  const [diagramStates, setDiagramStates] = useState<DiagramState[]>(INITIAL_STATES)
  const [iconPickerId, setIconPickerId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const deleteTarget = diagramStates.find(s => s.id === deleteTargetId)

  // Participants
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS)

  // Approval Expiration
  const [timespan, setTimespan] = useState('Never')
  const [numberOfMonths, setNumberOfMonths] = useState('12')
  const [workflow, setWorkflow] = useState('Select Workflow')
  const [customAttribute, setCustomAttribute] = useState('Select attribute')
  const [fallbackMonths, setFallbackMonths] = useState('12')

  const saved = useRef({
    useWorkflowPermissions: false,
    diagramStates: INITIAL_STATES,
    participants: INITIAL_PARTICIPANTS,
    timespan: 'Never', numberOfMonths: '12',
    workflow: 'Select Workflow', customAttribute: 'Select attribute', fallbackMonths: '12',
  })

  const mark = () => setIsDirty(true)

  const handleSave = () => {
    saved.current = { useWorkflowPermissions, diagramStates, participants, timespan, numberOfMonths, workflow, customAttribute, fallbackMonths }
    setIsDirty(false)
  }

  const handleReset = () => {
    const s = saved.current
    setUseWorkflowPermissions(s.useWorkflowPermissions)
    setDiagramStates(s.diagramStates)
    setParticipants(s.participants)
    setTimespan(s.timespan); setNumberOfMonths(s.numberOfMonths)
    setWorkflow(s.workflow); setCustomAttribute(s.customAttribute)
    setFallbackMonths(s.fallbackMonths)
    setIsDirty(false)
  }

  // Workflow table logic
  const filtered = ALL_WORKFLOWS.filter(wf => wf.name.toLowerCase().includes(wfSearch.toLowerCase()))
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === '↑ Last modified') return a.lastModifiedMs - b.lastModifiedMs
    if (sortKey === '↓ Last modified') return b.lastModifiedMs - a.lastModifiedMs
    if (sortKey === 'A→Z Owner') return a.owner.localeCompare(b.owner)
    return 0
  })
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleStateField = (id: string, field: 'publishInHub' | 'resetExpiration') => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s))
    mark()
  }

  const updateStateName = (id: string, name: string) => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, name } : s))
    mark()
  }

  const updateStateIcon = (id: string, icon: string) => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, icon } : s))
    setIconPickerId(null)
    mark()
  }

  const addState = () => {
    setDiagramStates(prev => [...prev, { id: String(Date.now()), name: 'New State', icon: 'document', publishInHub: false, resetExpiration: false }])
    mark()
  }

  const updateParticipant = (id: string, attribute: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, attribute } : p))
    mark()
  }


  return (
    <>
    <ObjectPage
      style={{ height: '100%' } as React.CSSProperties}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      titleArea={
        <ObjectPageTitle
          header="Approval Workflows"
          subHeader="Define and manage approval steps for publishing process models."
        />
      }
      footerArea={isDirty ? (
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
          <Button slot="endContent" onClick={handleReset}>Discard Changes</Button>
        </Bar>
      ) : undefined}
    >
      <ObjectPageSection id="process-model" titleText="Process Model Approvals" hideTitleText>
        <SettingsPageLayout gap="2rem">

            {/* ── Approval Workflows table ── */}
        <SettingsSection
          title="Approval Workflows"
          subtitle={`${ALL_WORKFLOWS.length} approval workflows are configured in this workspace.`}
        >
            {/* Search + Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 1rem' }}>
              <Input
                placeholder="Search workflow name"
                value={wfSearch}
                showClearIcon
                onInput={e => { setWfSearch((e.target as unknown as HTMLInputElement).value); setPage(0) }}
                style={{ width: '260px' }}
              >
                <Icon slot="icon" name="search" />
              </Input>
              <div style={{ position: 'relative' }}>
                <SigChipV2
                  id="sort-btn"
                  value={sortKey.replace('↑ ', '').replace('↓ ', '')}
                  label="Sort by:"
                  leadingIcon={sortKey.startsWith('↑') ? 'sort-ascending' : sortKey.startsWith('↓') ? 'sort-descending' : 'sort'}
                  trailingIcon="slim-arrow-down"
                  onClick={() => setSortOpen(v => !v)}
                />
                <Popover
                  opener="sort-btn"
                  open={sortOpen}
                  onClose={() => setSortOpen(false)}
                  placement="Bottom"
                  horizontalAlign="End"
                  hideArrow
                  className="no-padding-popover"
                >
                  <List
                    onItemClick={e => {
                      setSortKey((e.detail.item as HTMLElement).dataset.key ?? sortKey)
                      setSortOpen(false)
                      setPage(0)
                    }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <ListItemStandard key={opt} data-key={opt} selected={opt === sortKey}>
                        {opt}
                      </ListItemStandard>
                    ))}
                  </List>
                </Popover>
              </div>
            </div>
            <Table
              overflowMode="Popin"
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell width="1fr">Workflow Name</TableHeaderCell>
                  <TableHeaderCell width="180px" importance={1} popinText="Owner">Owner</TableHeaderCell>
                  <TableHeaderCell width="140px" importance={0} popinText="Last Modified">Last Modified</TableHeaderCell>
                  <TableHeaderCell width="48px" />
                </TableHeaderRow>
              }
            >
              {paginated.map(wf => (
                <TableRow key={wf.id}>
                  <TableCell><Link href="#">{wf.name}</Link></TableCell>
                  <TableCell><Text>{wf.owner}</Text></TableCell>
                  <TableCell><Text>{wf.lastModified}</Text></TableCell>
                  <TableCell>
                    <Button icon="action" design="Transparent" accessibleName="Open Workflow" tooltip="Open" />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            <div style={{ padding: '0.5rem 1rem 1rem' }}>
              <SigPagination
                currentPage={page}
                totalItems={sorted.length}
                pageSize={PAGE_SIZE}
                showTotal
                showEntriesPerPage={false}
                onPageChange={setPage}
              />
            </div>
        </SettingsSection>

        {/* ── Access and Configuration ── */}
        <SettingsSection
          title="Access and Configuration"
          subtitle="Manage user access, synchronize configuration, and control workflow permissions."
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <div>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Synchronize Users</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                  Add existing workspace users to the approval workflow so they can participate in approval processes.
                </Text>
              </div>
              <Button design="Default" icon="synchronize" style={{ flexShrink: 0 }}>Synchronize</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <div>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Synchronize Configuration</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                  Push the workflow configuration from this workspace to SAP Signavio Process Governance.
                </Text>
              </div>
              <Button design="Default" icon="synchronize" style={{ flexShrink: 0 }}>Synchronize</Button>
            </div>
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '-0.5rem' }}>
                <CheckBox
                  checked={useWorkflowPermissions}
                  text="Use workflow access permissions"
                  accessibleName="Use workflow access permissions"
                  onChange={() => { setUseWorkflowPermissions(v => !v); mark() }}
                />
                <InfoPopover id="wf-permissions-info" header="Use workflow access permissions">
                  <Text style={{ fontSize: 'var(--sapFontSize)' }}>
                    When enabled, the system checks access permissions for the workflow.
                  </Text>
                </InfoPopover>
              </div>
              <div style={{ paddingLeft: '1.75rem' }}>
                <Text style={{ color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSize)' }}>
                  Apply or remove access restrictions to workflows. Prerequisite to access any workflow: An SAP Signavio Process Governance account.
                </Text>
              </div>
            </div>
        </SettingsSection>

        {/* ── Participants ── */}
        <SettingsSection
          title="Participants"
          subtitle="Map each role to a model attribute that contains the participant's email address."
        >
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.5rem 1rem', gap: '0.5rem 1rem' }}>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Role in Governance Workflows</Text>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Diagram Attribute</Text>
            </div>
            {participants.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  padding: '0.625rem 1rem', gap: '0.5rem 1rem', alignItems: 'center',
                  borderBottom: i < participants.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                }}
              >
                <Text style={{ color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSize)' }}>{p.role}</Text>
                <Select
                  style={{ width: '100%' }}
                  accessibleName={`Diagram attribute for ${p.role}`}
                  onChange={e => updateParticipant(p.id, (e.detail.selectedOption as HTMLElement).textContent ?? p.attribute)}
                >
                  {ATTRIBUTE_OPTIONS.map(opt => (
                    <Option key={opt} selected={opt === p.attribute}>{opt}</Option>
                  ))}
                </Select>
              </div>
            ))}
        </SettingsSection>

        {/* ── Approval Expiration ── */}
        <SettingsSection
          title="Approval Expiration"
          subtitle="Configure approvals to expire after a set period. When expired, a reapproval workflow is triggered."
        >
          <div className={s.rowWide} style={{ gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Time Period Calculation</Text>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                    Determine how the system calculates the approval expiry period.
                  </Text>
                </div>
                <Select
                  style={{ width: '220px', flexShrink: 0 }}
                  onChange={e => { setTimespan((e.detail.selectedOption as HTMLElement).textContent ?? timespan); mark() }}
                >
                  {TIMESPAN_OPTIONS.map(opt => (
                    <Option key={opt} selected={opt === timespan}>{opt}</Option>
                  ))}
                </Select>
              </div>

              {timespan === 'Fixed period' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <Label for="number-of-months-input">Number of Months</Label>
                  <Input id="number-of-months-input" value={numberOfMonths} style={{ width: '220px', flexShrink: 0 }}
                    onInput={e => { setNumberOfMonths((e.target as unknown as HTMLInputElement).value); mark() }} />
                </div>
              )}

              {timespan === 'Defined in a custom attribute (type: number)' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <Label>Custom Attribute</Label>
                    <Select style={{ width: '220px', flexShrink: 0 }}
                      onChange={e => { setCustomAttribute((e.detail.selectedOption as HTMLElement).textContent ?? customAttribute); mark() }}>
                      {CUSTOM_ATTRIBUTE_OPTIONS.map(opt => <Option key={opt} selected={opt === customAttribute}>{opt}</Option>)}
                    </Select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <Label for="fallback-input">Fallback value if no attribute is set</Label>
                    <Input id="fallback-input" value={fallbackMonths} style={{ width: '220px', flexShrink: 0 }}
                      onInput={e => { setFallbackMonths((e.target as unknown as HTMLInputElement).value); mark() }} />
                  </div>
                </div>
              )}

              {timespan !== 'Never' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <Label for="workflow-select">Workflow to run when model expires</Label>
                  <Select id="workflow-select" style={{ width: '320px', flexShrink: 0 }}
                    onChange={e => { setWorkflow((e.detail.selectedOption as HTMLElement).textContent ?? workflow); mark() }}>
                    {WORKFLOW_OPTIONS.map(opt => <Option key={opt} selected={opt === workflow}>{opt}</Option>)}
                  </Select>
                </div>
              )}

              <MessageStrip design="Information" hideCloseButton>
                The expiry period can automatically reset based on the configurations in the Model States section.{' '}
                <Link href="#">Learn More</Link>
              </MessageStrip>
          </div>
        </SettingsSection>

        {/* ── Diagram States ── */}
        <SettingsSection
          title="Model States"
          subtitle="Define states of progress and associated icons for model revisions."
        >
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell width="1fr">Name</TableHeaderCell>
                  <TableHeaderCell width="110px">Icon</TableHeaderCell>
                  <TableHeaderCell width="90px">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Publish
                      <InfoPopover id="publish-info-btn" header="Publish">
                        <Text style={{ fontSize: 'var(--sapFontSize)' }}>Select the Publish checkbox to automatically publish the model when it reaches this state.</Text>
                      </InfoPopover>
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell width="130px">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Reset Expiration
                      <InfoPopover id="reset-info-btn" header="Reset expiration">
                        <Text style={{ fontSize: 'var(--sapFontSize)' }}>Select the Reset expiration checkbox to recalculate the expiry date when the model reaches this state.</Text>
                      </InfoPopover>
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell width="48px" />
                </TableHeaderRow>
              }
            >
              {diagramStates.map(state => (
                <TableRow key={state.id}>
                  <TableCell>
                    <Input value={state.name} style={{ width: '100%' }} accessibleName="State name"
                      onInput={e => updateStateName(state.id, (e.target as unknown as HTMLInputElement).value)} />
                  </TableCell>
                  <TableCell>
                    <IconChip icon={state.icon} id={`icon-chip-${state.id}`} onClick={() => setIconPickerId(iconPickerId === state.id ? null : state.id)} />
                    <Popover
                      opener={`icon-chip-${state.id}`}
                      open={iconPickerId === state.id}
                      onClose={() => setIconPickerId(null)}
                      className="no-padding-popover"
                      placement="Bottom"
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 2rem)', gap: '0.25rem', padding: '0.5rem' }}>
                        {ICON_OPTIONS.map(ico => (
                          <Button
                            key={ico.name}
                            icon={ico.name}
                            design={state.icon === ico.name ? 'Emphasized' : 'Transparent'}
                            accessibleName={ico.name}
                            tooltip={ico.name}
                            onClick={() => updateStateIcon(state.id, ico.name)}
                            style={{ width: '2rem', height: '2rem', padding: 0 }}
                          />
                        ))}
                      </div>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CheckBox checked={state.publishInHub} accessibleName={`Publish for ${state.name}`}
                        onChange={() => toggleStateField(state.id, 'publishInHub')} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', justifyContent: 'center', opacity: timespan === 'Never' ? 0.4 : 1 }}>
                      <CheckBox checked={state.resetExpiration} disabled={timespan === 'Never'} accessibleName={`Reset expiration for ${state.name}`}
                        onChange={() => toggleStateField(state.id, 'resetExpiration')} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button icon="delete" design="Transparent" accessibleName={`Delete ${state.name}`}
                      onClick={() => setDeleteTargetId(state.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
            <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button icon="add" design="Default" onClick={addState}>Add State</Button>
              <MessageStrip design="Information" hideCloseButton>
                Changes aren't retroactively applied to existing expirations or model states. <Link href="#">Learn More</Link>
              </MessageStrip>
            </div>
        </SettingsSection>

          </SettingsPageLayout>
      </ObjectPageSection>

      <ObjectPageSection id="journey-model" titleText="Journey Model Approvals" hideTitleText>
        <SettingsPageLayout gap="2rem">

          <SettingsSection
            title="Journey Model Approvals"
            subtitle={`${jmWorkflows.length} published approval workflows for journey models.`}
          >
              <Table
                overflowMode="Popin"
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell width="1fr">Name</TableHeaderCell>
                    <TableHeaderCell width="240px" importance={1} popinText="Participants">Participants</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {jmWorkflows.map(wf => (
                  <TableRow key={wf.id}>
                    <TableCell><Link href="#">{wf.name}</Link></TableCell>
                    <TableCell><Text>{wf.participants}</Text></TableCell>
                  </TableRow>
                ))}
              </Table>
              <div style={{ padding: '0.75rem 1rem' }}>
                <Button icon="add" design="Default">New Approval Workflow</Button>
              </div>
          </SettingsSection>

        </SettingsPageLayout>
      </ObjectPageSection>

    </ObjectPage>

    {/* Delete dialog */}
    <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} headerText="Delete State" state="Critical">
      <div style={{ padding: '1rem', minWidth: 360 }}>
        <Text>Delete state <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</Text>
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Negative" onClick={() => {
          setDiagramStates(prev => prev.filter(s => s.id !== deleteTargetId))
          setDeleteTargetId(null); mark()
        }}>Delete</Button>
        <Button slot="endContent" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
      </Bar>
    </Dialog>
    </>
  )
}
