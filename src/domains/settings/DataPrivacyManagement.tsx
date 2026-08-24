import { useState } from 'react'
import { Select, Option, Input, Button, Label } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

const DATA_TYPES = [
  'Performance Indicator Data',
  'Process Model Data',
  'User Activity Data',
  'Workspace Configuration Data',
]

const SYSTEMS = ['QE4:006', 'QE6:002', 'QE8:004', 'QIA:001', 'QIA:002', 'QNA:007', 'QND:005', 'QLS:002']

const IDENTIFIER_TYPES = [
  'Bill-to Party in SAP Ariba',
  'Employee ID',
  'User Email Address',
  'Customer Account Number',
  'Vendor ID',
]

export default function DataPrivacyManagement() {
  const [dataType, setDataType] = useState(DATA_TYPES[0])
  const [system, setSystem] = useState(SYSTEMS[0])
  const [identifierType, setIdentifierType] = useState(IDENTIFIER_TYPES[0])
  const [identifier, setIdentifier] = useState('')

  return (
    <PageHeader title="Data Privacy Management" subtitle="Review and manage privacy-relevant data stored in your workspace.">
      <SettingsPageLayout>
        <SettingsSection
          title="Manage Personal Data"
          subtitle="Use the features provided here to search for, download, or delete personal data."
        >
          <div className={s.rowWide} style={{ gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="data-type-select">Type of Data:</Label>
                <Select
                  id="data-type-select"
                  className={s.fieldFull}
                  onChange={e => setDataType((e.detail.selectedOption as HTMLElement).textContent ?? dataType)}
                >
                  {DATA_TYPES.map(t => <Option key={t} selected={t === dataType}>{t}</Option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="system-select">System:</Label>
                <Select
                  id="system-select"
                  className={s.fieldFull}
                  onChange={e => setSystem((e.detail.selectedOption as HTMLElement).textContent ?? system)}
                >
                  {SYSTEMS.map(sys => <Option key={sys} selected={sys === system}>{sys}</Option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="identifier-type-select">Type of Identifier:</Label>
                <Select
                  id="identifier-type-select"
                  className={s.fieldFull}
                  onChange={e => setIdentifierType((e.detail.selectedOption as HTMLElement).textContent ?? identifierType)}
                >
                  {IDENTIFIER_TYPES.map(t => <Option key={t} selected={t === identifierType}>{t}</Option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="identifier-input">Identifier:</Label>
                <Input
                  id="identifier-input"
                  placeholder="Enter an identifier from your source system"
                  value={identifier}
                  className={s.fieldFull}
                  onInput={e => setIdentifier((e.target as unknown as HTMLInputElement).value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button design="Emphasized" disabled={!identifier}>Find Data</Button>
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
