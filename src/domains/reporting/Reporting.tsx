import { useSearchParams } from 'react-router-dom'
import {
  ObjectPage, ObjectPageTitle, ObjectPageSection,
  Title, Text, Icon, Button,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Label, Select, Option,
  Switch, Link,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { AccessBadge, StatusBadge } from '../../shared/components/dashboard'
import ProcessModelDashboard from './Reporting/ProcessModelDashboard'
import UsageManagementDashboard from './Reporting/UsageManagementDashboard'
import LicenseUsageDashboard from './Reporting/LicenseUsageDashboard'
import ProcessGovernanceDashboard from './Reporting/ProcessGovernanceDashboard'
import { useState } from 'react'

type Dashboard = { id: string; name: string; adminOnly: boolean }

const DASHBOARDS: Dashboard[] = [
  { id: 'process-model', name: 'Process Model', adminOnly: true },
  { id: 'usage-mgmt', name: 'Usage Management', adminOnly: false },
  { id: 'license-usage', name: 'License Usage', adminOnly: true },
  { id: 'governance', name: 'Process Governance Dashboard', adminOnly: false },
]

const REPORT_TYPES = [
  { id: 'process-doc', name: 'Process Documentation', description: 'Export full documentation for selected processes including attributes, descriptions, and linked elements.' },
  { id: 'dictionary', name: 'Dictionary Entries Report', description: 'Generate a report of dictionary entries with their categories, attributes, and linked processes.' },
  { id: 'governance', name: 'Governance Workflow Report', description: 'Overview of all governance workflows including status, participants, and completion dates.' },
  { id: 'comparison', name: 'Version Comparison Report', description: 'Compare two revisions of a process and highlight changes.' },
]

const REPORT_HISTORY = [
  { id: 'r1', name: 'Process Documentation - Q1 2026', type: 'Process Documentation', format: 'PDF', status: 'Ready', size: '2.4 MB', createdAt: 'Apr 3, 2026', createdBy: 'Sebastian Kaim' },
  { id: 'r2', name: 'Dictionary Report - March 2026', type: 'Dictionary Entries Report', format: 'Word', status: 'Ready', size: '1.1 MB', createdAt: 'Mar 31, 2026', createdBy: 'Maria Schmidt' },
  { id: 'r3', name: 'Governance Workflow Overview', type: 'Governance Workflow Report', format: 'PDF', status: 'Ready', size: '0.8 MB', createdAt: 'Mar 15, 2026', createdBy: 'Sebastian Kaim' },
  { id: 'r4', name: 'Process Documentation - Q4 2025', type: 'Process Documentation', format: 'PDF', status: 'Ready', size: '3.1 MB', createdAt: 'Dec 20, 2025', createdBy: 'John Carter' },
]

const TEMPLATES = [
  { id: 't1', name: 'SAP Standard Process Documentation', type: 'All Notations', scope: 'Standard', lastModified: '—', modifiedBy: '—', builtin: true },
  { id: 't2', name: 'BPMN Process Description Template', type: 'BPMN 2.0', scope: 'Standard', lastModified: '—', modifiedBy: '—', builtin: true },
  { id: 't3', name: 'Value Chain Summary', type: 'Value Chain', scope: 'Standard', lastModified: '—', modifiedBy: '—', builtin: true },
  { id: 't4', name: 'Acme Custom Process Report', type: 'All Notations', scope: 'Custom', lastModified: 'Apr 10, 2026', modifiedBy: 'Sebastian Kaim', builtin: false },
  { id: 't5', name: 'Risk & Compliance Template', type: 'BPMN 2.0', scope: 'Custom', lastModified: 'Feb 5, 2026', modifiedBy: 'Maria Schmidt', builtin: false },
]

const SYNC_CONFIGS = [
  { id: 's1', name: 'Order to Cash — Cloud ALM Scope', scope: 'Single Process', status: 'Active', lastSync: 'May 28, 2026, 09:14', nextSync: 'May 29, 2026, 09:00', enabled: true },
  { id: 's2', name: 'Procure to Pay Processes', scope: 'Folder', status: 'Active', lastSync: 'May 27, 2026, 22:00', nextSync: 'May 28, 2026, 22:00', enabled: true },
  { id: 's3', name: 'HR Onboarding Processes', scope: 'Folder', status: 'Error', lastSync: 'May 26, 2026, 12:30', nextSync: '—', enabled: false },
]

export default function Reporting() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedReportType, setSelectedReportType] = useState('process-doc')
  const [reportFormat, setReportFormat] = useState<'PDF' | 'Word'>('PDF')
  const [syncConfigs, setSyncConfigs] = useState(SYNC_CONFIGS)

  // ?dashboard= makes individual dashboard views directly linkable
  const activeDashboard = searchParams.get('dashboard')
  const setActiveDashboard = (id: string | null) => setSearchParams(prev => {
    if (id) prev.set('dashboard', id)
    else prev.delete('dashboard')
    return prev
  }, { replace: false })

  const toggleSync = (id: string) => {
    setSyncConfigs(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled, status: !s.enabled ? 'Active' : 'Inactive' } : s))
  }

  if (activeDashboard === 'process-model') return <ProcessModelDashboard onBack={() => setActiveDashboard(null)} />
  if (activeDashboard === 'usage-mgmt') return <UsageManagementDashboard onBack={() => setActiveDashboard(null)} />
  if (activeDashboard === 'license-usage') return <LicenseUsageDashboard onBack={() => setActiveDashboard(null)} />
  if (activeDashboard === 'governance') return <ProcessGovernanceDashboard onBack={() => setActiveDashboard(null)} />

  return (
    <ObjectPage mode="IconTabBar" style={{ height: '100%' }} hidePinButton
      titleArea={<ObjectPageTitle header={<Title level="H3">Reporting</Title>} />}
    >

      <ObjectPageSection id="dashboard" titleText="Dashboard">
        <SigTableWrapper>
          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Access</TableHeaderCell>
                <TableHeaderCell style={{ width: '3rem' }} />
              </TableHeaderRow>
            }
          >
            {DASHBOARDS.map(dash => (
              <TableRow
                key={dash.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveDashboard(dash.id)}
              >
                <TableCell><Text style={{ fontWeight: '500' }}>{dash.name}</Text></TableCell>
                <TableCell><AccessBadge adminOnly={dash.adminOnly} /></TableCell>
                <TableCell>
                  <Icon name="navigation-right-arrow" style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </SigTableWrapper>
      </ObjectPageSection>

      <ObjectPageSection id="reports" titleText="Reports and Documentation">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <Title level="H5" style={{ marginBottom: '1rem', display: 'block' }}>Generate Report</Title>
            <div style={{
              border: '1px solid var(--sapList_BorderColor)',
              borderRadius: 'var(--sapElement_BorderCornerRadius)',
              padding: '1.25rem',
              background: 'var(--sapGroup_ContentBackground)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label for="report-type-select" required>Report Type</Label>
                  <Select
                    id="report-type-select"
                    style={{ width: '100%' }}
                    onChange={e => setSelectedReportType((e.detail as any).selectedOption?.dataset?.id ?? selectedReportType)}
                  >
                    {REPORT_TYPES.map(rt => (
                      <Option key={rt.id} data-id={rt.id} selected={rt.id === selectedReportType}>{rt.name}</Option>
                    ))}
                  </Select>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>
                    {REPORT_TYPES.find(r => r.id === selectedReportType)?.description}
                  </Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Label for="report-format-select" required>Format</Label>
                  <Select
                    id="report-format-select"
                    style={{ width: '100%' }}
                    onChange={e => setReportFormat(((e.detail as any).selectedOption?.textContent?.trim() ?? 'PDF') as 'PDF' | 'Word')}
                  >
                    <Option selected={reportFormat === 'PDF'}>PDF</Option>
                    <Option selected={reportFormat === 'Word'}>Word (.docx)</Option>
                  </Select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button design="Emphasized" icon="generate-shortcut">Generate Report</Button>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Title level="H5" style={{ flex: 1 }}>Report History</Title>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Reports are stored for 30 days</Text>
            </div>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Format</TableHeaderCell>
                  <TableHeaderCell>Size</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Created By</TableHeaderCell>
                  <TableHeaderCell style={{ width: '5rem' }} />
                </TableHeaderRow>
              }
            >
              {REPORT_HISTORY.map(report => (
                <TableRow key={report.id}>
                  <TableCell><Link href="#">{report.name}</Link></TableCell>
                  <TableCell><Text>{report.type}</Text></TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Icon name={report.format === 'PDF' ? 'pdf-attachment' : 'doc-attachment'} style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                      <Text>{report.format}</Text>
                    </div>
                  </TableCell>
                  <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{report.size}</Text></TableCell>
                  <TableCell><Text>{report.createdAt}</Text></TableCell>
                  <TableCell><Text>{report.createdBy}</Text></TableCell>
                  <TableCell>
                    <Button icon="download" design="Transparent" accessibleName="Download" tooltip="Download" />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="templates" titleText="Documentation Templates">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', maxWidth: '48rem' }}>
              Documentation templates define the layout and content of generated reports. You can use SAP standard templates
              or upload custom Word templates (.docx) tailored to your organization's branding.
            </Text>
            <Button icon="upload" design="Default" style={{ flexShrink: 0 }}>Upload Template</Button>
          </div>
          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Notation Type</TableHeaderCell>
                <TableHeaderCell>Scope</TableHeaderCell>
                <TableHeaderCell>Last Modified</TableHeaderCell>
                <TableHeaderCell>Modified By</TableHeaderCell>
                <TableHeaderCell style={{ width: '5rem' }} />
              </TableHeaderRow>
            }
          >
            {TEMPLATES.map(t => (
              <TableRow key={t.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="document-text" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0 }} />
                    <Text style={{ fontWeight: '500' }}>{t.name}</Text>
                  </div>
                </TableCell>
                <TableCell><Text>{t.type}</Text></TableCell>
                <TableCell>
                  <Text style={{
                    fontSize: 'var(--sapFontSmallSize)',
                    color: t.builtin ? 'var(--sapInformativeColor)' : 'var(--sapPositiveColor)',
                    background: t.builtin ? 'var(--sapInformativeBackground)' : 'var(--sapPositiveBackground)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '0.25rem',
                  }}>
                    {t.scope}
                  </Text>
                </TableCell>
                <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{t.lastModified}</Text></TableCell>
                <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{t.modifiedBy}</Text></TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button icon="download" design="Transparent" accessibleName="Download" tooltip="Download" />
                    {!t.builtin && <Button icon="delete" design="Transparent" accessibleName="Delete" tooltip="Delete" />}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="cloud-alm" titleText="SAP Cloud ALM Synchronizations">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', maxWidth: '48rem' }}>
              Configure which process content is synchronized with SAP Cloud ALM. Synchronizations run automatically
              on a daily schedule. You can also trigger a manual sync at any time.{' '}
              <Link href="#">Learn more about SAP Cloud ALM integration</Link>
            </Text>
            <Button icon="add" design="Emphasized" style={{ flexShrink: 0 }}>Add Synchronization</Button>
          </div>
          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Scope</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Last Synchronized</TableHeaderCell>
                <TableHeaderCell>Next Synchronization</TableHeaderCell>
                <TableHeaderCell>Enabled</TableHeaderCell>
                <TableHeaderCell style={{ width: '5rem' }} />
              </TableHeaderRow>
            }
          >
            {syncConfigs.map(sync => (
              <TableRow key={sync.id}>
                <TableCell><Text style={{ fontWeight: '500' }}>{sync.name}</Text></TableCell>
                <TableCell><Text>{sync.scope}</Text></TableCell>
                <TableCell><StatusBadge status={sync.enabled ? sync.status : 'Inactive'} /></TableCell>
                <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{sync.lastSync}</Text></TableCell>
                <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{sync.enabled ? sync.nextSync : '—'}</Text></TableCell>
                <TableCell>
                  <Switch checked={sync.enabled} onChange={() => toggleSync(sync.id)} />
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button icon="synchronize" design="Transparent" accessibleName="Sync Now" tooltip="Sync Now" disabled={!sync.enabled} />
                    <Button icon="edit" design="Transparent" accessibleName="Edit" tooltip="Edit" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </ObjectPageSection>

    </ObjectPage>
  )
}
