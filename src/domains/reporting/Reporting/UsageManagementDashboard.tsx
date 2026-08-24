import {
  DynamicPage, DynamicPageTitle, Title, Text,
  Breadcrumbs, BreadcrumbsItem,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  ObjectStatus, ProgressIndicator,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { ChartCard, SparkLine } from '../../../shared/components/dashboard'

const UM_LICENSES = [
  { name: 'Enterprise Plus Edition', assigned: 78, unassigned: 22, total: 100 },
  { name: 'Process Transformation Manager', assigned: 72, unassigned: 28, total: 100 },
  { name: 'Journey Modeling Advanced', assigned: 51, unassigned: 49, total: 100 },
  { name: 'Collaboration Hub', assigned: 34, unassigned: 66, total: 100 },
]

const UM_VISITORS_TREND = [0, 1, 1, 2, 2, 3, 3, 2, 2, 3]

export default function UsageManagementDashboard({ onBack }: { onBack: () => void }) {
  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Breadcrumbs slot="breadcrumbs">
          <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>
          <BreadcrumbsItem>Usage Management Dashboards</BreadcrumbsItem>
        </Breadcrumbs>
        <Title slot="heading" level="H3">Usage Management Dashboards</Title>
        <div slot="actions">
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Data last updated Fri, 5/29/2026, 6:01 AM &mdash; next update in 0 hrs
          </Text>
        </div>
      </DynamicPageTitle>
    }>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <ChartCard title="Number of Assigned Licenses">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {UM_LICENSES.map((l) => (
              <div key={l.name} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 60px 60px', alignItems: 'center', gap: '0.75rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.name}>{l.name}</Text>
                <ProgressIndicator value={Math.round((l.assigned / l.total) * 100)} />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{l.assigned} / {l.total}</Text>
                <ObjectStatus state={l.assigned / l.total > 0.9 ? 'Critical' : 'Positive'} style={{ justifySelf: 'end' }}>
                  {Math.round((l.assigned / l.total) * 100)}%
                </ObjectStatus>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {['Assigned Licenses', 'Unassigned Licenses', 'Total Licenses'].map((l, i) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--sapChart_OrderedColor_${i + 1})`, flexShrink: 0 }} />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{l}</Text>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Unique Visitors over Time">
          <SparkLine data={UM_VISITORS_TREND} color="var(--sapChart_OrderedColor_2)" />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Number of unique visitors</Text>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {['Mar 6', 'Mar 15', 'Mar 24', 'Apr 2', 'Apr 11', 'Apr 20', 'Apr 29', 'May 8', 'May 17', 'May 26'].map((d) => (
              <Text key={d} style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{d}</Text>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="License Summary">
          <SigTableWrapper>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>License Type</TableHeaderCell>
                  <TableHeaderCell>Assigned</TableHeaderCell>
                  <TableHeaderCell>Unassigned</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Usage</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {UM_LICENSES.map((l) => (
                <TableRow key={l.name}>
                  <TableCell><Text style={{ fontWeight: '500' }}>{l.name}</Text></TableCell>
                  <TableCell><Text>{l.assigned}</Text></TableCell>
                  <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{l.unassigned}</Text></TableCell>
                  <TableCell><Text>{l.total}</Text></TableCell>
                  <TableCell>
                    <ObjectStatus state={l.assigned / l.total > 0.9 ? 'Critical' : 'Positive'}>
                      {Math.round((l.assigned / l.total) * 100)}%
                    </ObjectStatus>
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
