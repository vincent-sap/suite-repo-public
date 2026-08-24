import {
  ObjectPage, ObjectPageSection, ObjectPageTitle,
  Title, Text, Button, CheckBox, Input, Select, Option, Toast, FlexBox, Label,
} from '@ui5/webcomponents-react'
import { SettingsSection, SettingsSectionRow } from './components/SettingsSection'
import p from './pages.module.css'
import { useDirty } from './hooks'

export default function TemplateTabbedPage() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()

  return (
    <>
      <ObjectPage
      mode="IconTabBar"
      hidePinButton
      className={p.page}
      titleArea={
        <ObjectPageTitle
          header={<Title level="H3">Tabbed Page</Title>}
          breadcrumbs={<Text>Use for complex detail views with multiple aspects or sections.</Text>}
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
      <ObjectPageSection id="general" titleText="General">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Basic Settings" subtitle="Core configuration for this item.">
            <SettingsSectionRow>
              <Label>Name</Label>
              <Input className={p.fieldFull} value="Example Item" onInput={mark} />
            </SettingsSectionRow>
            <SettingsSectionRow>
              <Label>Description</Label>
              <Input className={p.fieldFull} value="A short description." onInput={mark} />
            </SettingsSectionRow>
          </SettingsSection>
        </FlexBox>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="features" titleText="Features">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Feature Flags" subtitle="Enable or disable optional features for this item.">
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Enable Comments" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Allow users to comment on this item.</Text>
                </div>
              </div>
            </SettingsSectionRow>
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Enable Notifications" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Notify subscribers when this item is updated.</Text>
                </div>
              </div>
            </SettingsSectionRow>
          </SettingsSection>
        </FlexBox>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="access" titleText="Access">
        <div className={p.narrowContent}>
        <FlexBox direction="Column" className={p.stack}>
          <SettingsSection title="Visibility" subtitle="Control who can see this item.">
            <SettingsSectionRow>
              <Label>Default Audience</Label>
              <Select onChange={mark}>
                <Option selected>Everyone</Option>
                <Option>Modelers only</Option>
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
