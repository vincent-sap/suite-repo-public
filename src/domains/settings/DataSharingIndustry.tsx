import { useState, useRef } from 'react'
import { Text, Select, Option, Button, Label, Dialog, Bar, Switch, MessageStrip } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const INDUSTRIES = [
  'Aerospace and Defense',
  'Automotive',
  'Banking',
  'Chemicals',
  'Consumer Products',
  'Engineering, Construction and Operations',
  'Healthcare',
  'High Tech',
  'Industrial Machinery and Components',
  'Insurance',
  'Life Sciences',
  'Media',
  'Mill Products',
  'Mining',
  'Oil, Gas, and Energy',
  'Professional Services',
  'Public Sector',
  'Retail',
  'Telecommunications',
  'Transportation and Logistics',
  'Utilities',
]

export default function DataSharingIndustry() {
  const [industry, setIndustry] = useState('Automotive')
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false)
  const [dialogSharingEnabled, setDialogSharingEnabled] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const savedIndustry = useRef('Automotive')

  function handleSave() {
    savedIndustry.current = industry
    setIsDirty(false)
  }

  function handleReset() {
    setIndustry(savedIndustry.current)
    setIsDirty(false)
  }

  function openEdit() {
    setDialogSharingEnabled(dataSharingEnabled)
    setEditOpen(true)
  }

  function handleDialogSave() {
    setDataSharingEnabled(dialogSharingEnabled)
    setEditOpen(false)
    setIsDirty(true)
  }

  return (
    <PageHeader
      title="Data Sharing and Industry"
      subtitle="Opt in to sharing anonymized process data with your selected industry."
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
    >
      <Dialog
        open={editOpen}
        headerText="Enable Data Sharing"
        onClose={() => setEditOpen(false)}
        style={{ maxWidth: '30rem' } as React.CSSProperties}
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text>
            By enabling this option, you allow the Digital Discovery Assessment to automatically preselect solution process flows (scope items) based on the solution process flows shown on your Cloud Transformation page.
          </Text>
          <Text>
            The Digital Discovery Assessment helps you to identify the right SAP Cloud ERP solution during your discussion with SAP and/or an SAP partner, by taking into consideration your current solution process usage mapping to solution process flows. Data for object counts is not moved to the Digital Discovery Assessment.
          </Text>
          <Text>
            Enabling this setting also allows you to automatically select these solution process flows (scope items) in SAP Cloud ALM.
          </Text>
          <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600' }}>Enable data sharing with the Digital Discovery Assessment</Text>
            <Switch checked={dialogSharingEnabled} onChange={() => setDialogSharingEnabled(v => !v)} />
          </div>
          {dialogSharingEnabled && (
            <MessageStrip design="Information" hideCloseButton>
              If your organization operates in an EU-only access region, by enabling this option, you agree that your data will be transferred to and processed in a region where access isn't restricted to EU only.
            </MessageStrip>
          )}
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleDialogSave}>Save</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setEditOpen(false)}>Close</Button>
        </Bar>
      </Dialog>

      <SettingsPageLayout gap="1.5rem">
        <SettingsSection
          title="Your Organization's Industry"
          subtitle="Select the industry most relevant to your organization to get meaningful innovation recommendations and compare your performance to others in your industry."
        >
          <div className={s.rowWide}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for="industry-select">Industry:</Label>
              <Select
                id="industry-select"
                style={{ minWidth: '16rem' }}
                onChange={e => { setIndustry((e.detail.selectedOption as HTMLElement).textContent ?? industry); setIsDirty(true) }}
              >
                {INDUSTRIES.map(ind => <Option key={ind} selected={ind === industry}>{ind}</Option>)}
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Data Sharing"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SigChipV2
                value={dataSharingEnabled ? 'Enabled' : 'Disabled'}
                leadingIcon={dataSharingEnabled ? 'sys-enter-2' : 'sys-cancel-2'}
                design={dataSharingEnabled ? 'positive' : 'negative'}
                condensed
              />
              <Button design="Default" onClick={openEdit}>Edit</Button>
            </div>
          }
        >
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Enable data sharing with the Digital Discovery Assessment. When data sharing is enabled, the Digital
              Discovery Assessment uses data from the cloud transformation feature to help you with your SAP Cloud ERP
              transformation strategy.
            </Text>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
