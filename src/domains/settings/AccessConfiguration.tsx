import { useState, useRef } from 'react'
import {
  Text, Button, Link, Switch, Title, ToolbarItem,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'

const INITIAL_SYSTEMS = [
  { id: 'QE6:002', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QE8:004', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QIA:001', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QND:005', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QIA:002', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QNA:007', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QLS:002', type: 'SAP ECC', grantAll: true, policies: 0 },
  { id: 'QE4:006', type: 'SAP ECC', grantAll: true, policies: 0 },
]

export default function AccessConfiguration() {
  const [systems, setSystems] = useState(INITIAL_SYSTEMS)

  const [isDirty, setIsDirty] = useState(false)
  const savedSystems = useRef(INITIAL_SYSTEMS)

  const toggleGrant = (id: string) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, grantAll: !s.grantAll } : s))
    setIsDirty(true)
  }

  const handleSave = () => {
    savedSystems.current = systems.map(s => ({ ...s }))
    setIsDirty(false)
  }

  const handleReset = () => {
    setSystems(savedSystems.current.map(s => ({ ...s })))
    setIsDirty(false)
  }

  return (
    <PageHeader title="Access Configuration" subtitle="Control which users and groups can access SAP-defined business content." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Access Configurations</Title>
          </ToolbarItem>
        }
      >
        <Table
          headerRow={
            <TableHeaderRow>
              <TableHeaderCell>System</TableHeaderCell>
              <TableHeaderCell>System Type</TableHeaderCell>
              <TableHeaderCell>Grant Access to All Users</TableHeaderCell>
              <TableHeaderCell>Authorization Policies</TableHeaderCell>
              <TableHeaderCell>Authorized Users</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableHeaderRow>
          }
        >
          {systems.map(s => (
            <TableRow key={s.id}>
              <TableCell><Text>{s.id}</Text></TableCell>
              <TableCell><Text>{s.type}</Text></TableCell>
              <TableCell>
                <Switch checked={s.grantAll} accessibleName={`Grant access to all users for ${s.id}`} onChange={() => toggleGrant(s.id)} />
              </TableCell>
              <TableCell><Text>{s.policies}</Text></TableCell>
              <TableCell>
                <Button icon="group" design="Transparent">All Users</Button>
              </TableCell>
              <TableCell>
                <Link href="#">Create Policy</Link>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </SigTableWrapper>
    </PageHeader>
  )
}
