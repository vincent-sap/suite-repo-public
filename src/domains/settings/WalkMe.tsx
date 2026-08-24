import { useState, useRef } from 'react'
import { Text, RadioButton, Input, Label } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

export default function WalkMe() {
  const [walkmeMode, setWalkmeMode] = useState<'sap' | 'customer'>('sap')
  const [systemUrl, setSystemUrl] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const savedState = useRef({ walkmeMode: 'sap' as 'sap' | 'customer', systemUrl: '' })

  function handleWalkemeModeChange(value: 'sap' | 'customer') {
    setWalkmeMode(value)
    setIsDirty(true)
  }

  function handleSave() {
    savedState.current = { walkmeMode, systemUrl }
    setIsDirty(false)
  }

  function handleReset() {
    setWalkmeMode(savedState.current.walkmeMode)
    setSystemUrl(savedState.current.systemUrl)
    setIsDirty(false)
  }

  return (
    <PageHeader title="WalkMe Digital Adoption Platform" subtitle="Enable and configure WalkMe in-app guidance for your workspace users." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout>
        <SettingsSection
          title="WalkMe Digital Adoption Platform"
          subtitle="WalkMe is a digital adoption platform that guides users through processes in real time, helping them quickly adopt and efficiently use SAP Signavio. Choose between prebuilt guided tours for common workflows or a fully customizable experience you build and manage yourself."
        >
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>Select how you want to use WalkMe:</Text>
            <div className={s.radioOption}>
              <RadioButton
                name="walkme-mode"
                checked={walkmeMode === 'sap'}
                onChange={() => handleWalkemeModeChange('sap')}
                text="SAP Signavio managed"
              />
              <div className={s.checkboxIndent}>
                <Text className={s.fieldDesc}>
                  Access prebuilt WalkMe content, maintained by SAP Signavio. No additional fee or license required.
                </Text>
              </div>
            </div>
            <div className={s.radioOption}>
              <RadioButton
                name="walkme-mode"
                checked={walkmeMode === 'customer'}
                onChange={() => handleWalkemeModeChange('customer')}
                text="Customer managed"
              />
              <div className={s.checkboxIndent}>
                <Text className={s.fieldDesc}>
                  Create and fully customize your own digital adoption experience. Requires a WalkMe Premium license.
                </Text>
              </div>
              {walkmeMode === 'customer' && (
                <div className={s.checkboxIndent} style={{ paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Text className={s.fieldDesc}>
                    Purchase WalkMe for SAP Signavio to create customized, WalkMe guidance across your SAP Signavio environment.
                    When you purchase a license, you can build custom WalkMe content, you can download prebuilt content from the
                    Solution Gallery, and you have access to advanced usage analytics.
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Label for="walkme-system-url" required showColon>System URL</Label>
                    <Input
                      id="walkme-system-url"
                      placeholder="Paste or type a URL"
                      value={systemUrl}
                      onInput={(e) => {
                        setSystemUrl((e.target as unknown as HTMLInputElement).value)
                        setIsDirty(true)
                      }}
                      className={s.fieldFull}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
