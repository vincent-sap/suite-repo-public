import {
  DynamicPage, DynamicPageTitle, FlexBox,
  Title, Text, Button, Bar, Toast,
  List, ListItemStandard, Input, Select, Option, Label,
  VariantManagement, VariantItem,
} from '@ui5/webcomponents-react'
import { SettingsSection, SettingsSectionRow } from './components/SettingsSection'
import p from './pages.module.css'
import { NAV_ITEMS } from './mockData'
import { useDirty, useSideNavLayout } from './hooks'

export default function TemplateSideNavPageWide() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()
  const { active, setActive, isNarrow, layoutRef, activeLabel } = useSideNavLayout()

  return (
    <>
      <DynamicPage
        hidePinButton
        className={p.page}
        showFooter={isDirty}
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Side Nav + Content — Wide</Title>
            <Text slot="subheading">Full-width content panel with left navigation.</Text>
          </DynamicPageTitle>
        }
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleDiscard}>Cancel</Button>
          </Bar>
        }
      >
        <div ref={layoutRef} className={p.sidenavLayout}>

          {!isNarrow && (
            <div className={p.sidenavRail}>
              <div className={p.sidenavRailLabel}>Settings</div>
              <List onItemClick={e => setActive((e.detail.item as HTMLElement).id)}>
                {NAV_ITEMS.map(item => (
                  <ListItemStandard key={item.id} id={item.id} icon={item.icon} selected={active === item.id}>
                    {item.label}
                  </ListItemStandard>
                ))}
              </List>
            </div>
          )}

          <div className={p.sidenavContent}>
            <FlexBox direction="Column" className={`${p.stack} ${p.stackWide}`}>
              <SettingsSection>
                <div className={p.sidenavNavTitle}>
                  {isNarrow
                    ? (
                      <VariantManagement
                        closeOnItemSelect
                        hideSaveAs
                        hideManageVariants
                        titleText="Settings"
                        onSelect={e => setActive((e.detail.selectedVariant as any).children as string)}
                      >
                        {NAV_ITEMS.map(item => (
                          <VariantItem key={item.id} selected={active === item.id} labelReadOnly hideDelete readOnly>
                            {item.label}
                          </VariantItem>
                        ))}
                      </VariantManagement>
                    )
                    : <Title level="H4" size="H4">{activeLabel}</Title>
                  }
                </div>
              </SettingsSection>
              <SettingsSection subtitle={`Configuration for the ${activeLabel.toLowerCase()} section.`}>
                <SettingsSectionRow>
                  <Label>Name</Label>
                  <Input className={p.fieldFull} value="Example value" onInput={mark} />
                </SettingsSectionRow>
                <SettingsSectionRow>
                  <Label>Mode</Label>
                  <Select onChange={mark}>
                    <Option selected>Option A</Option>
                    <Option>Option B</Option>
                    <Option>Option C</Option>
                  </Select>
                </SettingsSectionRow>
              </SettingsSection>
              <SettingsSection title="Options">
                <SettingsSectionRow>
                  <Text className={p.fieldDesc}>Description of what enabling this option does.</Text>
                </SettingsSectionRow>
              </SettingsSection>
            </FlexBox>
          </div>

        </div>
      </DynamicPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
