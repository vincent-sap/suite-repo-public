import {
  FlexibleColumnLayout, FlexBox, Bar,
  DynamicPage, DynamicPageTitle,
  Title, Text, Button, Toast, ToolbarItem, Input, Label, List, ListItemStandard,
} from '@ui5/webcomponents-react'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'
import { SigTableWrapper, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { SidePanelGrid, SidePanelList } from './components/SidePanelSection'
import p from './pages.module.css'
import { useDirty, useSearch, useFilteredItems, useTwoColumnPanelLayout, TWO_COLUMN_PANEL_LAYOUTS } from './hooks'

export default function TemplateTwoColumnPagePanel() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()
  const { search, setSearch } = useSearch()
  const { selected, layout, handleSelect, handleClose } = useTwoColumnPanelLayout()
  const filtered = useFilteredItems(search)

  return (
    <>
      <FlexibleColumnLayout
        className={p.page}
        layout={layout}
        layoutsConfiguration={TWO_COLUMN_PANEL_LAYOUTS}
        style={{ '--_ui5_fcl_separator_btn_display': 'none' } as React.CSSProperties}
        startColumn={
          <DynamicPage hidePinButton className={p.page} titleArea={
            <DynamicPageTitle>
              <Title slot="heading" level="H3">Two-Column — Side Panel</Title>
              <Text slot="subheading">Use when the detail panel is contextual or supplementary, not a full edit page.</Text>
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
              <div style={{ height: '100%', overflow: 'hidden' }}>
              <SigRightSidePanel
                headerTitle={selected.name}
                isOpen={true}
                useBoldText={false}
                toggleRightSidePanel={handleClose}
                footerArea={isDirty ? (
                  <Bar design="FloatingFooter">
                    <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
                    <Button slot="endContent" design="Transparent" onClick={handleDiscard}>Cancel</Button>
                  </Bar>
                ) : undefined}
              >
                <FlexBox direction="Column" gap="1.5rem">
                  <div className={p.panelSection}>
                    <Title level="H6" wrappingType="None">Details</Title>
                    <SidePanelGrid>
                      <Label showColon>Name</Label>
                      <Text>{selected.name}</Text>
                      <Label showColon>Members</Label>
                      <Text>{selected.members}</Text>
                      <Label showColon>Description</Label>
                      <Text>{selected.description}</Text>
                    </SidePanelGrid>
                  </div>

                  <div className={p.panelSection}>
                    <Title level="H6" wrappingType="None">Members</Title>
                    <SidePanelList>
                      <List separators="Inner">
                        <ListItemStandard type="Inactive" text="Alice Johnson" />
                        <ListItemStandard type="Inactive" text="Bob Martinez" />
                        <ListItemStandard type="Inactive" text="Carol Smith" />
                      </List>
                    </SidePanelList>
                  </div>

                  <div className={p.panelSection}>
                    <Title level="H6" wrappingType="None">Permissions</Title>
                    <Button onClick={mark}>Configure Permissions</Button>
                  </div>
                </FlexBox>
              </SigRightSidePanel>
              </div>
            )
            : <div />
        }
      />
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
