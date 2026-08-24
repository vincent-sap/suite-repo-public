import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Text, Icon, Button,
  Breadcrumbs, BreadcrumbsItem,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  ProgressIndicator, Select, Option, Label, Tag, Link,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { ChartCard } from '../../../shared/components/dashboard'

const LU_LICENSES = [
  { name: 'Enterprise Plus Edition', unused: 22, used: 78, total: 100 },
  { name: 'Collaboration Hub', unused: 66, used: 34, total: 100 },
  { name: 'Process Transformation Manager', unused: 28, used: 72, total: 100 },
  { name: 'Journey Modeling Advanced', unused: 49, used: 51, total: 100 },
]

const LU_USERS = [
  { name: 'Abdiel Smid', email: 'abed.el-fatah.smid@example.com', licenses: ['Enterprise Plus Edition'] },
  { name: 'Ahmed Ashraf Mohamed', email: 'ahmed.ashraf.saleh.mohamed@example.com', licenses: ['Enterprise Plus Edition', 'Collaboration Hub', 'Journey Modeling Advanced', 'Process Transformation Manager'] },
  { name: 'Aleksandra Gogloza', email: 'aleksandra.gogloza@example.com', licenses: ['Enterprise Plus Edition', 'Process Transformation Manager'] },
  { name: 'Alexander Cramer', email: 'alexander.cramer@example.com', licenses: ['Enterprise Plus Edition', 'Process Transformation Manager'] },
  { name: 'Alvaro Laura Garcia', email: 'alvaro.laura.garcia@example.com', licenses: ['Enterprise Plus Edition', 'Collaboration Hub', 'Journey Modeling Advanced', 'Process Transformation Manager'] },
  { name: 'Amanda Tichenor', email: 'amanda.tichenor@example.com', licenses: ['Enterprise Plus Edition'] },
  { name: 'Angela Di Fiore', email: 'angela.di.fiore@example.com', licenses: ['Enterprise Plus Edition'] },
  { name: 'Anirban Lahiri', email: 'anirban.lahiri@example.com', licenses: ['Enterprise Plus Edition', 'Journey Modeling Advanced', 'Process Transformation Manager'] },
  { name: 'Anna Guseva', email: 'anna.guseva@example.com', licenses: ['Enterprise Plus Edition', 'Collaboration Hub', 'Journey Modeling Advanced', 'Process Transformation Manager'] },
  { name: 'Anna Reid', email: 'anna.reid@example.com', licenses: ['Enterprise Plus Edition', 'Process Transformation Manager'] },
  { name: 'Aziza Halder', email: 'aziza.halder@example.com', licenses: ['Enterprise Plus Edition', 'Journey Modeling Advanced', 'Process Transformation Manager'] },
  { name: 'Barbara Paul', email: 'barbara.paul@example.com', licenses: ['Enterprise Plus Edition', 'Process Transformation Manager'] },
  { name: 'Bassma Ahmed', email: 'bassma.ahmed@example.com', licenses: ['Enterprise Plus Edition', 'Process Transformation Manager'] },
]

export default function LicenseUsageDashboard({ onBack }: { onBack: () => void }) {
  const [licenseFilter, setLicenseFilter] = useState<string>('all')
  const licenseNames = LU_LICENSES.map(l => l.name)

  const filteredUsers = licenseFilter === 'all'
    ? LU_USERS
    : LU_USERS.filter(u => u.licenses.includes(licenseFilter))

  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Breadcrumbs slot="breadcrumbs">
          <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>
          <BreadcrumbsItem>License Usage Dashboard</BreadcrumbsItem>
        </Breadcrumbs>
        <Title slot="heading" level="H3">License Usage Dashboard</Title>
        <div slot="actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="locked" style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Admin Only</Text>
            <Button icon="download" design="Default" style={{ marginLeft: '0.5rem' }}>Export</Button>
          </div>
        </div>
      </DynamicPageTitle>
    }>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <ChartCard title={`Licenses (${LU_LICENSES.length})`} action={<Button icon="download" design="Transparent" tooltip="Export Licenses" />}>
          <SigTableWrapper>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Unused</TableHeaderCell>
                  <TableHeaderCell>Used</TableHeaderCell>
                  <TableHeaderCell>Total Purchased</TableHeaderCell>
                  <TableHeaderCell>Usage</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {LU_LICENSES.map((l) => (
                <TableRow key={l.name}>
                  <TableCell><Text style={{ fontWeight: '500' }}>{l.name}</Text></TableCell>
                  <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{l.unused}</Text></TableCell>
                  <TableCell>
                    <Text style={{ color: l.used / l.total > 0.9 ? 'var(--sapCriticalColor)' : 'var(--sapPositiveColor)', fontWeight: '600' }}>
                      {l.used}
                    </Text>
                  </TableCell>
                  <TableCell><Text>{l.total}</Text></TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ProgressIndicator value={Math.round((l.used / l.total) * 100)} style={{ flex: 1 }} />
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                        {Math.round((l.used / l.total) * 100)}%
                      </Text>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </SigTableWrapper>
        </ChartCard>

        <ChartCard
          title={`Users (${filteredUsers.length}${licenseFilter !== 'all' ? ` filtered` : ' of 89 total'})`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Label for="license-filter">Assigned Licenses:</Label>
              <Select
                id="license-filter"
                style={{ minWidth: '200px' }}
                onChange={e => setLicenseFilter((e.detail as any).selectedOption?.dataset?.val ?? 'all')}
              >
                <Option data-val="all" selected={licenseFilter === 'all'}>All</Option>
                {licenseNames.map(name => (
                  <Option key={name} data-val={name} selected={licenseFilter === name}>{name}</Option>
                ))}
              </Select>
              <Button icon="download" design="Transparent" tooltip="Export Users" />
            </div>
          }
        >
          <SigTableWrapper>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email Address</TableHeaderCell>
                  <TableHeaderCell>Assigned Licenses</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {filteredUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell><Text style={{ fontWeight: '500' }}>{u.name}</Text></TableCell>
                  <TableCell>
                    <Link href={`mailto:${u.email}`}>{u.email}</Link>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {u.licenses.slice(0, 2).map(lic => (
                        <Tag key={lic} design="Set1" colorScheme="6" style={{ fontSize: 'var(--sapFontSmallSize)' }}>{lic}</Tag>
                      ))}
                      {u.licenses.length > 2 && (
                        <Tag design="Set2" colorScheme="1">+{u.licenses.length - 2}</Tag>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </SigTableWrapper>
        </ChartCard>

      </div>
    </DynamicPage>
  )
}
