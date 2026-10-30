import {
  ObjectPage, ObjectPageSection, ObjectPageTitle,
  Title, Text, Button, CheckBox, Input, Select, Option, Toast, FlexBox, Label,
} from '@ui5/webcomponents-react'
import { SettingsSection, SettingsSectionRow } from '../../templates/pages/components/SettingsSection'
import p from '../../templates/pages/pages.module.css'
import { useDirty } from '../../templates/pages/hooks'

export default function RiskDashboard() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()

  return (
    <>
      <ObjectPage
      mode="IconTabBar"
      hidePinButton
      className={p.page}
      titleArea={
        <ObjectPageTitle
          header={<Title level="H3">Risk Dashboard</Title>}
          breadcrumbs={<Text>Overview of risks across your workspace.</Text>}
          actionsBar={
            isDirty ? (
              <>
                <Button design="Emphasized" onClick={handleSave}>Save</Button>
                <Button onClick={handleDiscard}>Cancel</Button>
              </>
            ) : undefined
          }
        />
      }
    >
      <ObjectPageSection id="overview" titleText="Overview">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Risk Summary" subtitle="High-level view of current risks.">
            <SettingsSectionRow>
              <Label>Risk Owner</Label>
              <Input className={p.fieldFull} value="Example Owner" onInput={mark} />
            </SettingsSectionRow>
            <SettingsSectionRow>
              <Label>Description</Label>
              <Input className={p.fieldFull} value="A short description." onInput={mark} />
            </SettingsSectionRow>
          </SettingsSection>
        </FlexBox>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="controls" titleText="Controls">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Mitigating Controls" subtitle="Controls in place to reduce risk exposure.">
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Automated Monitoring" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Continuously monitor for risk indicators.</Text>
                </div>
              </div>
            </SettingsSectionRow>
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Manual Reviews" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Schedule periodic manual risk reviews.</Text>
                </div>
              </div>
            </SettingsSectionRow>
          </SettingsSection>
        </FlexBox>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="settings" titleText="Settings">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Risk Visibility" subtitle="Control who can view this dashboard.">
            <SettingsSectionRow>
              <Label>Visible To</Label>
              <Select onChange={mark}>
                <Option selected>Everyone</Option>
                <Option>Risk Managers only</Option>
                <Option>Admins only</Option>
              </Select>
            </SettingsSectionRow>
          </SettingsSection>
        </FlexBox>
        </div>
      </ObjectPageSection>
    </ObjectPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
