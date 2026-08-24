import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle,
  Title, Text, Button, Bar, Toast, ToolbarItem, Input,
} from '@ui5/webcomponents-react'
import { Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell } from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import AudienceSectionBar from './components/AudienceSectionBar'
import { RESOURCE_ITEMS } from './mockData'
import p from './pages.module.css'
import { useDirty, useSearch } from './hooks'

export default function TemplateTableSettingsPageWide() {
  const { isDirty, toastOpen, setToastOpen, handleSave, handleDiscard, mark } = useDirty()
  const { search, setSearch } = useSearch()
  const [audience, setAudience] = useState('Everyone')

  const filtered = RESOURCE_ITEMS.filter(i =>
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
            <Title slot="heading" level="H3">Table Settings Page — Wide</Title>
            <Text slot="subheading">Full-width table with audience filter. Use for audience-scoped resource lists.</Text>
          </DynamicPageTitle>
        }
        footerArea={
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleDiscard}>Discard Changes</Button>
          </Bar>
        }
      >
        <AudienceSectionBar value={audience} onChange={setAudience} />

        <SigTableWrapper
          titleSlot={
            <ToolbarItem>
              <Title level="H4" wrappingType="None">Items ({filtered.length})</Title>
            </ToolbarItem>
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
      </DynamicPage>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Changes saved</Toast>
    </>
  )
}
