import {
  DynamicPage, DynamicPageTitle, FlexBox,
  Title, Text, Button, Bar, Toast, ToolbarItem, Input, CheckBox, Select, Option, Label,
} from '@ui5/webcomponents-react'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { SettingsSection, SettingsSectionRow } from './components/SettingsSection'
import { TableSort } from './components/TableSort'
import p from './pages.module.css'
import { useDirty, useSearch, useFilteredResources } from './hooks'

export default function TemplateSettingsPageWide() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()
  const { search, setSearch } = useSearch()
  const filtered = useFilteredResources(search)

  return (
    <>
      <DynamicPage
        hidePinButton
        className={p.page}
        showFooter={isDirty}
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Settings Page — Wide</Title>
            <Text slot="subheading">Full-width layout. Same sections as narrow, table reaches page edges.</Text>
          </DynamicPageTitle>
        }
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleDiscard}>Discard Changes</Button>
          </Bar>
        }
      >
        <FlexBox direction="Column" className={`${p.stack} ${p.stackWide}`}>

          <SettingsSection title="General" subtitle="Basic configuration for this workspace.">
            <SettingsSectionRow>
              <Label>Workspace Name</Label>
              <Input className={p.fieldFull} value="Acme Corp" onInput={mark} />
            </SettingsSectionRow>
            <SettingsSectionRow>
              <Label>Default Language</Label>
              <Select onChange={mark}>
                <Option selected>English</Option>
                <Option>German</Option>
                <Option>French</Option>
              </Select>
            </SettingsSectionRow>
          </SettingsSection>

          <SettingsSection title="Features" subtitle="Enable or disable optional workspace features.">
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Enable Comments" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Allow users to leave comments on diagrams and assets.</Text>
                </div>
              </div>
            </SettingsSectionRow>
            <SettingsSectionRow>
              <div className={p.checkboxRow}>
                <CheckBox className={p.checkboxNegativeMargin} text="Enable Notifications" onChange={mark} />
                <div className={p.checkboxDesc}>
                  <Text className={p.fieldDesc}>Send email notifications for approvals and mentions.</Text>
                </div>
              </div>
            </SettingsSectionRow>
          </SettingsSection>

          <SettingsSection title="Visibility Defaults">
            <SettingsSectionRow>
              <Label>Default Visibility</Label>
              <Select onChange={mark}>
                <Option selected>Visible</Option>
                <Option>Visible if set</Option>
                <Option>Invisible</Option>
              </Select>
            </SettingsSectionRow>
          </SettingsSection>

          <SettingsSection title="Danger Zone" action={<Button design="Negative">Delete Workspace</Button>}>
            <SettingsSectionRow>
              <Text className={p.fieldDesc}>Permanently delete this workspace and all its data. This action cannot be undone.</Text>
            </SettingsSectionRow>
          </SettingsSection>

        </FlexBox>

        <FlexBox direction="Column" className={`${p.stack} ${p.stackWide} ${p.stackFlush}`}>

          <SettingsSection title="Resources" subtitle="All resources available in this workspace.">
            <div>
              <SigTableWrapper
                titleSlot={
                  <ToolbarItem>
                    <Title level="H5" size="H6" wrappingType="None">Items ({filtered.length})</Title>
                  </ToolbarItem>
                }
                sortSlot={
                  <TableSort sortOptions={['Name', 'Type', 'Owner']} />
                }
                businessActionsSlot={
                  <ToolbarItem>
                    <Button icon="add" design="Emphasized">Add Item</Button>
                  </ToolbarItem>
                }
                searchSlot={
                  <ToolbarItem>
                    <Input
                      placeholder="Search"
                      type={'Search' as any}
                      value={search}
                      onInput={e => setSearch((e.target as any).value)}
                    />
                  </ToolbarItem>
                }
              >
                <Table
                  headerRow={
                    <TableHeaderRow>
                      <TableHeaderCell width="auto">Name</TableHeaderCell>
                      <TableHeaderCell width="120px">Type</TableHeaderCell>
                      <TableHeaderCell width="120px">Status</TableHeaderCell>
                      <TableHeaderCell width="160px">Owner</TableHeaderCell>
                      <TableHeaderCell width="60px" />
                    </TableHeaderRow>
                  }
                >
                  {filtered.map(item => (
                    <TableRow key={item.id} rowKey={item.id}>
                      <TableCell><Text className={p.cellName}>{item.name}</Text></TableCell>
                      <TableCell><Text>{item.type}</Text></TableCell>
                      <TableCell><Text>{item.status}</Text></TableCell>
                      <TableCell><Text>{item.owner}</Text></TableCell>
                      <TableCell>
                        <Button icon="edit" design="Transparent" tooltip="Edit" onClick={mark} />
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </SigTableWrapper>
            </div>
          </SettingsSection>

        </FlexBox>

      </DynamicPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
