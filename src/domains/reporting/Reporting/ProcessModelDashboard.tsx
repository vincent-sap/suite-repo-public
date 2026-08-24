import {
  DynamicPage, DynamicPageTitle, Title, Text,
  Breadcrumbs, BreadcrumbsItem,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Link,
} from '@ui5/webcomponents-react'
import { MetricCard, ChartCard, SparkLine, BarRow } from '../../../shared/components/dashboard'

const PM_RECENT_PUBLISHED = [
  { name: 'Test SK Subprocess', date: 'Mar 25, 2026' },
  { name: 'Test SK 1', date: 'Mar 25, 2026' },
]

const PM_TOP_VIEWED = [
  { name: '1 - Design Thinking Process', views: 16 },
  { name: 'Test SK 1', views: 12 },
  { name: 'Test SK Subprocess', views: 9 },
  { name: 'Welcome to OurOrg Processes', views: 7 },
  { name: 'Test File for Activity Log', views: 6 },
]

const PM_TOP_COMMENTS = [
  { name: '1 - Design Thinking Process', comments: 30 },
  { name: 'Discovery workshop', comments: 14 },
  { name: 'Testfile2', comments: 11 },
  { name: 'Order to cash (Copy)', comments: 8 },
  { name: 'Receipt of Goods (Copy)', comments: 7 },
]

const PM_TOP_VISITORS = [
  { name: 'Welcome to OurOrg Processes', visitors: 5 },
  { name: 'Test SK 1', visitors: 5 },
  { name: '1 - Design Thinking Process', visitors: 4 },
  { name: 'Level 2 - Process Area: Procurement', visitors: 3 },
  { name: 'Test SK Subprocess', visitors: 2 },
]

const PM_PUBLISHING_TREND = [0, 0, 0, 450, 900, 900, 1350, 1350, 1800, 1800]
const PM_CREATED_TREND = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2]
const PM_VIEWS_TREND = [0, 2, 4, 6, 8, 10, 12, 14, 16, 16]

export default function ProcessModelDashboard({ onBack }: { onBack: () => void }) {
  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Breadcrumbs slot="breadcrumbs">
          <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>
          <BreadcrumbsItem>Process Model Dashboards</BreadcrumbsItem>
        </Breadcrumbs>
        <Title slot="heading" level="H3">Process Model Dashboards</Title>
        <div slot="actions">
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Data last updated Fri, 5/29/2026, 6:01 AM
          </Text>
        </div>
      </DynamicPageTitle>
    }>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <MetricCard label="Total Published Models" value={2} />
          <MetricCard label="New Models Published" value={2} subLabel="Last 90 days" />
          <MetricCard label="Total Models" value={13} />
          <MetricCard label="Unique Visitors (30 days)" value={4} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <ChartCard title="Publishing States over Time">
            <SparkLine data={PM_PUBLISHING_TREND} color="var(--sapChart_OrderedColor_1)" />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {['Unpublished', 'Published (older revision)', 'Published (latest)'].map((l, i) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--sapChart_OrderedColor_${i + 1})`, flexShrink: 0 }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{l}</Text>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Models Created over Time">
            <SparkLine data={PM_CREATED_TREND} color="var(--sapChart_OrderedColor_2)" />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Models</Text>
          </ChartCard>

          <ChartCard title="Views over Time">
            <SparkLine data={PM_VIEWS_TREND} color="var(--sapChart_OrderedColor_3)" />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Number of views</Text>
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <ChartCard title="Most Recent Models Published">
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Published Date</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {PM_RECENT_PUBLISHED.map((m, i) => (
                <TableRow key={i}>
                  <TableCell><Link>{m.name}</Link></TableCell>
                  <TableCell><Text style={{ color: 'var(--sapContent_LabelColor)' }}>{m.date}</Text></TableCell>
                </TableRow>
              ))}
            </Table>
          </ChartCard>

          <ChartCard title="Top Viewed Models">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PM_TOP_VIEWED.map((m) => (
                <BarRow key={m.name} label={m.name} value={m.views} max={PM_TOP_VIEWED[0].views} />
              ))}
            </div>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Number of views</Text>
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <ChartCard title="Top 10 Models with Open Comments">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PM_TOP_COMMENTS.map((m) => (
                <BarRow key={m.name} label={m.name} value={m.comments} max={PM_TOP_COMMENTS[0].comments} color="var(--sapChart_OrderedColor_4)" />
              ))}
            </div>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Number of open comments</Text>
          </ChartCard>

          <ChartCard title="Top 10 Models by Unique Visitors">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PM_TOP_VISITORS.map((m) => (
                <BarRow key={m.name} label={m.name} value={m.visitors} max={PM_TOP_VISITORS[0].visitors} color="var(--sapChart_OrderedColor_5)" />
              ))}
            </div>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.5rem', display: 'block' }}>Number of unique visitors</Text>
          </ChartCard>
        </div>

      </div>
    </DynamicPage>
  )
}
