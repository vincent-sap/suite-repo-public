import {
  FlexibleColumnLayout, FlexBox,
  DynamicPage, DynamicPageTitle,
  ObjectPage, ObjectPageTitle, ObjectPageSection,
  Title, Text, Button, Bar, Toast, ToolbarItem, Input, Label,
} from '@ui5/webcomponents-react'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { SettingsSection, SettingsSectionRow } from './components/SettingsSection'
import p from './pages.module.css'
import { useDirty, useSearch, useFilteredItems, useTwoColumnLayout, TWO_COLUMN_DETAIL_LAYOUTS } from './hooks'

export default function TemplateTwoColumnPage() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()
  const { search, setSearch } = useSearch()
  const { selected, layout, handleSelect, handleClose } = useTwoColumnLayout()
  const filtered = useFilteredItems(search)

  return (
    <>
      <FlexibleColumnLayout
        className={p.page}
        layout={layout}
        layoutsConfiguration={TWO_COLUMN_DETAIL_LAYOUTS}
        startColumn={
          <DynamicPage hidePinButton className={p.page} titleArea={
            <DynamicPageTitle>
              <Title slot="heading" level="H3">Two-Column — Detail Page</Title>
              <Text slot="subheading">Use when the detail view is a full edit page with save/cancel footer.</Text>
            </DynamicPageTitle>
          }>
            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  <Title level="H4" wrappingType="None">Groups ({filtered.length})</Title>
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
                    <TableHeaderCell width="80px">Members</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {filtered.map(item => (
                  <TableRow
                    key={item.id}
                    rowKey={item.id}
                    onClick={() => handleSelect(item)}
                    className={p.tableRowClickable}
                    style={{ background: selected?.id === item.id ? 'var(--sapList_SelectionBackgroundColor)' : undefined }}
                  >
                    <TableCell><Text className={p.cellName}>{item.name}</Text></TableCell>
                    <TableCell><Text>{item.members}</Text></TableCell>
                  </TableRow>
                ))}
              </Table>
            </SigTableWrapper>
          </DynamicPage>
        }
        midColumn={
          selected
            ? (
              <ObjectPage
                hidePinButton
                className={p.page}
                titleArea={
                  <ObjectPageTitle
                    header={<Title level="H4">{selected.name}</Title>}
                    navigationBar={<Button design="Transparent" icon="decline" onClick={handleClose} />}
                  />
                }
                footerArea={isDirty ? (
                  <Bar design="FloatingFooter">
                    <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
                    <Button slot="endContent" onClick={handleDiscard}>Cancel</Button>
                  </Bar>
                ) : undefined}
              >
                <ObjectPageSection id="details" titleText="Details" hideTitleText>
                  <FlexBox direction="Column" className={p.stack}>
                    <SettingsSection title="Details" subtitle="Basic information about this group.">
                      <SettingsSectionRow>
                        <Label>Name</Label>
                        <Text>{selected.name}</Text>
                      </SettingsSectionRow>
                      <SettingsSectionRow>
                        <Label>Description</Label>
                        <Text>{selected.description}</Text>
                      </SettingsSectionRow>
                      <SettingsSectionRow>
                        <Label>Members</Label>
                        <Text>{selected.members} members</Text>
                      </SettingsSectionRow>
                    </SettingsSection>

                    <SettingsSection title="Permissions">
                      <SettingsSectionRow>
                        <Button onClick={mark}>Configure Permissions</Button>
                        <Text className={p.fieldDesc}>Manage what this group can see and do in the workspace.</Text>
                      </SettingsSectionRow>
                    </SettingsSection>
                  </FlexBox>
                </ObjectPageSection>
              </ObjectPage>
            )
            : <div />
        }
      />
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
