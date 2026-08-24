import { Button, Text } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

export default function CloudALM() {
  return (
    <PageHeader title="SAP Cloud ALM Synchronization" subtitle="Set up synchronization between your workspace and SAP Cloud ALM." onSave={() => {}} onReset={() => {}}>
      <SettingsPageLayout>
        <SettingsSection title="SAP Cloud ALM Synchronization">
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Configure the synchronizations with SAP Cloud ALM to keep process content aligned between both systems.
            </Text>
            <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Text className={s.fieldLabel}>Settings Unavailable</Text>
              <Text style={{ color: 'var(--sapContent_LabelColor)', textAlign: 'center', maxWidth: '28rem', display: 'block' }}>
              It looks like your SAP Signavio Workspace is not connected to SAP Cloud ALM yet. To connect your workspace, follow the steps in the Workspace Admin Guide.
              </Text>
              <Button design="Emphasized">Open Workspace Admin Guide</Button>
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
