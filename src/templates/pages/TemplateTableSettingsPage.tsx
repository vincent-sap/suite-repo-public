import {
  DynamicPage, DynamicPageTitle, FlexBox,
  Title, Text, Button, Bar, Toast, ToolbarItem, Input, CheckBox,
} from '@ui5/webcomponents-react'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import AudienceSectionBar from './components/AudienceSectionBar'
import p from './pages.module.css'
import { ATTRIBUTES } from './mockData'
import { useDirty, useSearch } from './hooks'
import { useState } from 'react'

export default function TemplateTableSettingsPage() {
  const { isDirty, toastOpen, setToastOpen, mark, handleSave, handleDiscard } = useDirty()
  const { search, setSearch } = useSearch()
  const [audience, setAudience] = useState('Everyone')

  const filtered = ATTRIBUTES.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <DynamicPage
        hidePinButton
        className={p.page}
        showFooter={isDirty}
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Table Settings Page</Title>
            <Text slot="subheading">Audience filter + table. Use for audience-scoped attribute configuration.</Text>
          </DynamicPageTitle>
        }
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleDiscard}>Discard Changes</Button>
          </Bar>
        }
      >
        <div className={p.narrowContent}>

        <AudienceSectionBar value={audience} onChange={setAudience} />

        <FlexBox direction="Column" className={`${p.stack} ${p.stackFlush}`}>
          <SigTableWrapper
            titleSlot={
              <ToolbarItem>
                <Title level="H4" wrappingType="None">Attribute List ({filtered.length})</Title>
              </ToolbarItem>
            }
            businessActionsSlot={
              <ToolbarItem>
                <Button icon="add" design="Emphasized" onClick={mark}>Add</Button>
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
                  <TableHeaderCell width="160px">Type</TableHeaderCell>
                  <TableHeaderCell width="100px" className={p.cellCenter}>Required</TableHeaderCell>
                  <TableHeaderCell width="100px" className={p.cellCenter}>Enabled</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {filtered.map(item => (
                <TableRow key={item.id} rowKey={item.id}>
                  <TableCell><Text className={p.cellName}>{item.name}</Text></TableCell>
                  <TableCell><Text>{item.type}</Text></TableCell>
                  <TableCell className={p.cellCenter}>
                    <CheckBox checked={item.required} readonly />
                  </TableCell>
                  <TableCell className={p.cellCenter}>
                    <CheckBox checked={item.enabled} onChange={mark} />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </SigTableWrapper>
        </FlexBox>

        </div>
      </DynamicPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
