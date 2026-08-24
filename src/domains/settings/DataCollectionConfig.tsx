import { useState, useRef } from 'react'
import {
  Text, Select, Option, Label, Button,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  ObjectStatus, StepInput, Slider, Dialog, Bar, MessageStrip,
  Switch, Title, ToolbarItem, CheckBox,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const SYSTEMS = [
  { id: 'QE6:002', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QE8:004', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QIA:001', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QND:005', type: 'SAP ECC', syncStatus: 'Sync Pending', systemStatus: 'Registered', activationStatus: 'Activated' },
]

const DEFAULT_ACTIVATION_SYSTEMS = [
  { id: 'QE4:006', type: 'SAP ECC' },
  { id: 'QM7:910', type: 'SAP S/4HANA' },
]

const PERFORMANCE_INDICATORS = [
  { id: 'KFFI000202', name: 'Overdue and open Accounts Payable...', type: 'Process Data', objects: 6000, runs: 2, lastRun: 'Dec 3, 2025', status: true },
  { id: 'PETST03N01', name: 'Aggregated transaction and report...', type: 'Usage Data', objects: 8102, runs: 1, lastRun: 'Dec 3, 2025', status: true },
  { id: 'KWPM000260', name: 'Plant maintenance order creation...', type: 'Process Data', objects: 12, runs: 1, lastRun: 'Dec 3, 2025', status: true },
  { id: 'KPSD000462', name: 'Credit memo request item creatio...', type: 'Process Data', objects: 19, runs: 1, lastRun: 'Dec 3, 2025', status: true },
  { id: 'KPSD000460', name: 'Debit memo request item creation...', type: 'Process Data', objects: 13, runs: 1, lastRun: 'Dec 3, 2025', status: true },
]

export default function DataCollectionConfig() {
  const [maxRuns, setMaxRuns] = useState(999999)
  const [selectedSystem, setSelectedSystem] = useState(SYSTEMS[0].id)
  const [isDirty, setIsDirty] = useState(false)
  const [activationDialogOpen, setActivationDialogOpen] = useState(false)
  const [dialogActivation, setDialogActivation] = useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_ACTIVATION_SYSTEMS.map(s => [s.id, true]))
  )
  const [piStatuses, setPiStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(PERFORMANCE_INDICATORS.map(pi => [pi.id, pi.status]))
  )
  const [editingPi, setEditingPi] = useState(false)

  type SavedConfig = { maxRuns: number; selectedSystem: string }
  const savedRef = useRef<SavedConfig>({ maxRuns: 999999, selectedSystem: SYSTEMS[0].id })

  const openActivationDialog = () => {
    setActivationDialogOpen(true)
  }

  const handleSave = () => {
    savedRef.current = { maxRuns, selectedSystem }
    setIsDirty(false)
  }

  const handleReset = () => {
    setMaxRuns(savedRef.current.maxRuns)
    setSelectedSystem(savedRef.current.selectedSystem)
    setIsDirty(false)
  }

  const system = SYSTEMS.find(s => s.id === selectedSystem) ?? SYSTEMS[0]

  const eccSystems = DEFAULT_ACTIVATION_SYSTEMS.filter(s => s.type === 'SAP ECC')
  const s4Systems = DEFAULT_ACTIVATION_SYSTEMS.filter(s => s.type === 'SAP S/4HANA')

  return (
    <PageHeader title="Data Collection Configuration" subtitle="Configure which usage data is collected to improve the workspace experience." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <SettingsSection title="Data Storage">
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Manage data growth by configuring how much data is stored by the solution.
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for="max-runs">Maximum Number of Collection Runs Stored</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Text>1</Text>
                <Slider
                  min={1}
                  max={999999}
                  value={maxRuns}
                  style={{ width: '14rem' }}
                  onChange={e => { setMaxRuns((e.target as unknown as { value: number }).value); setIsDirty(true) }}
                />
                <Text>Unlimited</Text>
                <StepInput
                  id="max-runs"
                  value={maxRuns}
                  min={1}
                  step={1}
                  style={{ width: '10rem' }}
                  onChange={e => { setMaxRuns((e.target as unknown as HTMLInputElement).valueAsNumber); setIsDirty(true) }}
                />
              </div>
            </div>
            <Text className={s.fieldDescSmall}>
              Records Consumed: <strong>134</strong>
            </Text>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Data Collection by System"
          subtitle="Monitor and manage the data collected for performance indicators from individual source systems."
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button design="Transparent" onClick={openActivationDialog}>Change Default Activation Status</Button>
              <Button design="Negative">Delete All Data</Button>
            </div>
          }
        >
          <div className={s.rowWide} style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="system-select">System:</Label>
                <Select
                  id="system-select"
                  style={{ minWidth: '10rem' }}
                  onChange={e => { setSelectedSystem((e.detail.selectedOption as HTMLElement).textContent ?? selectedSystem); setIsDirty(true) }}
                >
                  {SYSTEMS.map(s => <Option key={s.id} selected={s.id === selectedSystem}>{s.id}</Option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>System Type:</Text>
                  <Text>{system.type}</Text>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>Sync Status:</Text>
                  <ObjectStatus state={system.syncStatus === 'Settings Synced' ? 'Positive' : 'Critical'}>
                    {system.syncStatus}
                  </ObjectStatus>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>System Status:</Text>
                  <Text>{system.systemStatus}</Text>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>Default Activation Status:</Text>
                  <ObjectStatus state="Positive">{system.activationStatus}</ObjectStatus>
                </div>
              </div>
            </div>

            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                    Performance Indicator Data ({PERFORMANCE_INDICATORS.length} performance indicators)
                  </Title>
                </ToolbarItem>
              }
              businessActionsSlot={
                <ToolbarItem>
                  {editingPi
                    ? <Button design="Emphasized" onClick={() => setEditingPi(false)}>Done</Button>
                    : <Button design="Default" icon="edit" onClick={() => setEditingPi(true)}>Edit</Button>
                  }
                </ToolbarItem>
              }
            >
              <Table
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell>Performance Indicator ID</TableHeaderCell>
                    <TableHeaderCell>Performance Indicator Name</TableHeaderCell>
                    <TableHeaderCell>Data Type</TableHeaderCell>
                    <TableHeaderCell>Object Count</TableHeaderCell>
                    <TableHeaderCell>Collection Runs</TableHeaderCell>
                    <TableHeaderCell>Last Run</TableHeaderCell>
                    <TableHeaderCell>Activation Status</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {PERFORMANCE_INDICATORS.map(pi => (
                  <TableRow key={pi.id}>
                    <TableCell><Text>{pi.id}</Text></TableCell>
                    <TableCell><Text>{pi.name}</Text></TableCell>
                    <TableCell><Text>{pi.type}</Text></TableCell>
                    <TableCell><Text>{pi.objects.toLocaleString()}</Text></TableCell>
                    <TableCell><Text>{pi.runs}</Text></TableCell>
                    <TableCell><Text>{pi.lastRun}</Text></TableCell>
                    <TableCell>
                      {editingPi
                        ? <CheckBox
                            checked={piStatuses[pi.id]}
                            onChange={e => setPiStatuses(prev => ({ ...prev, [pi.id]: (e.target as unknown as HTMLInputElement).checked }))}
                          />
                        : <ObjectStatus state={piStatuses[pi.id] ? 'Positive' : 'None'}>
                            {piStatuses[pi.id] ? 'Active' : 'Inactive'}
                          </ObjectStatus>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </SigTableWrapper>
          </div>
        </SettingsSection>

      </div>

      {/* ── Change Default Activation Status dialog ── */}
      <Dialog
        open={activationDialogOpen}
        headerText="Change Default Activation Status for New Performance Indicators"
        className="dialog-padding-s"
        onClose={() => setActivationDialogOpen(false)}
        style={{ width: '520px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text>
            Data collection is active for most performance indicators by default. If you don't want data for new performance indicators to be collected automatically, you can change the default activation status to deactivated.
          </Text>
          <MessageStrip design="Information" hideCloseButton>
            If you deactivate data collection for new performance indicators in a registered system, you need to manually activate it for each new performance indicator. Only then can business users see and analyze the performance indicator data in the application.
          </MessageStrip>

          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>System Name</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Default Activation Status</TableHeaderCell>
              </TableHeaderRow>
            }
          >
            {eccSystems.length > 0 && (
              <TableRow key="group-ecc">
                <TableCell><Text style={{ fontWeight: 'bold' }}>SAP ECC</Text></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
            {eccSystems.map(sys => (
              <TableRow key={sys.id}>
                <TableCell><Text>{sys.id}</Text></TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Switch
                    checked={dialogActivation[sys.id] ?? false}
                    onChange={e => setDialogActivation(prev => ({ ...prev, [sys.id]: (e.target as unknown as HTMLInputElement).checked }))}
                  />
                </TableCell>
              </TableRow>
            ))}
            {s4Systems.length > 0 && (
              <TableRow key="group-s4">
                <TableCell><Text style={{ fontWeight: 'bold' }}>SAP S/4HANA</Text></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
            {s4Systems.map(sys => (
              <TableRow key={sys.id}>
                <TableCell><Text>{sys.id}</Text></TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Switch
                    checked={dialogActivation[sys.id] ?? false}
                    onChange={e => setDialogActivation(prev => ({ ...prev, [sys.id]: (e.target as unknown as HTMLInputElement).checked }))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Transparent" onClick={() => setActivationDialogOpen(false)}>Close</Button>
        </Bar>
      </Dialog>

    </PageHeader>
  )
}
