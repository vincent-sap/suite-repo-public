import { useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Button, Tag,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/add.js'

interface KpiData {
  bestInClass: number
  yours: number | null
  unit?: string
  isRed?: boolean
}

interface Process {
  name: string
  slug: string
  ppiCount: number
  automation: KpiData | null
  changeRate: KpiData | null
  exceptionRate: KpiData | null
  leadTime: KpiData | null
}

const PROCESSES: Process[] = [
  {
    name: 'Acquire to Decommission',
    slug: 'acquire-to-decommission',
    ppiCount: 16,
    automation: { bestInClass: 83.14, yours: null },
    changeRate: { bestInClass: 13.67, yours: null },
    exceptionRate: { bestInClass: 7.5, yours: null },
    leadTime: { bestInClass: 96.4, yours: 172.1, unit: 'd', isRed: true },
  },
  {
    name: 'Governance',
    slug: 'governance',
    ppiCount: 14,
    automation: { bestInClass: 69.92, yours: 0, isRed: true },
    changeRate: { bestInClass: 9.6, yours: null },
    exceptionRate: null,
    leadTime: { bestInClass: 96.6, yours: 226, unit: 'd', isRed: true },
  },
  {
    name: 'Idea to Market',
    slug: 'idea-to-market',
    ppiCount: 3,
    automation: null,
    changeRate: null,
    exceptionRate: { bestInClass: 91, yours: null },
    leadTime: { bestInClass: 56.4, yours: null, unit: 'd' },
  },
  {
    name: 'Lead to Cash',
    slug: 'lead-to-cash',
    ppiCount: 40,
    automation: { bestInClass: 77.99, yours: 12.5, isRed: true },
    changeRate: { bestInClass: 25.29, yours: 0.13 },
    exceptionRate: { bestInClass: 0, yours: null },
    leadTime: { bestInClass: 8.6, yours: 28.5, unit: 'd', isRed: true },
  },
  {
    name: 'Plan to Fulfill',
    slug: 'plan-to-fulfill',
    ppiCount: 61,
    automation: { bestInClass: 95.51, yours: 26.36, isRed: true },
    changeRate: { bestInClass: 25.07, yours: null },
    exceptionRate: { bestInClass: 4, yours: null },
    leadTime: { bestInClass: 8.7, yours: 8.7, unit: 'd' },
  },
  {
    name: 'Source to Pay',
    slug: 'source-to-pay',
    ppiCount: 38,
    automation: { bestInClass: 68.4, yours: null },
    changeRate: { bestInClass: 8.5, yours: null },
    exceptionRate: { bestInClass: 12.3, yours: null },
    leadTime: { bestInClass: 22.1, yours: null, unit: 'd' },
  },
]

function KpiCell({ data, unit = '%', isClickable, onClick }: {
  data: KpiData | null
  unit?: string
  isClickable?: boolean
  onClick?: () => void
}) {
  if (!data) {
    return (
      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
        Currently there are no metrics to display
      </Text>
    )
  }

  const cellUnit = data.unit ?? unit
  const yoursLabel = data.yours !== null && data.yours !== undefined
    ? `${data.yours}${cellUnit}`
    : `— ${cellUnit}`

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
    >
      <div style={{ textAlign: 'center' }}>
        <Text style={{ fontSize: '1rem', fontWeight: '600', display: 'block', color: 'var(--sapTextColor)' }}>
          {data.bestInClass}{cellUnit}
        </Text>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>best-in-class</Text>
      </div>
      <div style={{ width: 1, background: 'var(--sapList_BorderColor)', alignSelf: 'stretch' }} />
      <div style={{ textAlign: 'center' }}>
        <Text style={{ fontSize: '1rem', fontWeight: '600', display: 'block', color: data.isRed ? '#bb0000' : 'var(--sapContent_LabelColor)' }}>
          {yoursLabel}
        </Text>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>your company</Text>
      </div>
    </div>
  )
}

const COL_STYLE: React.CSSProperties = {
  padding: '1rem',
  borderLeft: '1px solid var(--sapList_BorderColor)',
  verticalAlign: 'top',
  minWidth: 200,
}

export default function BenchmarkingAnalytics() {
  const navigate = useNavigate()

  return (
    <DynamicPage
      style={{ height: '100%' }}
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem>Benchmarking Analytics</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
          actionsBar={
            <Button design="Emphasized" icon="add">Edit Company Values</Button>
          }
        >
          <Title slot="heading" level="H3">Benchmarking Analytics</Title>
          <Tag design="Set2" colorScheme="2">Manual Company Values</Tag>
        </DynamicPageTitle>
      }
      headerArea={
        <DynamicPageHeader>
          <Button icon="add">+ Add Peer Filter</Button>
        </DynamicPageHeader>
      }
    >
      <div style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level="H4">Process Performance Overview</Title>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              Benchmark Period: Apr 2024 – Mar 2026 · Click a row to see KPI details
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, background: '#ffe0e0', border: '1px solid #ffaaaa', borderRadius: 2 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Below median</Text>
          </div>
        </div>

        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.5rem', overflow: 'hidden', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'var(--sapList_HeaderBackground)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--sapList_BorderColor)', width: 240 }}>
                  <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                    End-to-End Process
                  </Text>
                </th>
                {['Automation Rate', 'Change Rate', 'Exception Rate', 'Lead Time'].map(col => (
                  <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--sapList_BorderColor)', borderLeft: '1px solid var(--sapList_BorderColor)' }}>
                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{col}</Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROCESSES.map((process, i) => {
                const rowRed = [process.automation, process.changeRate, process.exceptionRate, process.leadTime].some(k => k?.isRed)
                return (
                  <tr
                    key={process.name}
                    style={{
                      background: rowRed
                        ? 'rgba(255,220,220,0.25)'
                        : i % 2 === 0 ? 'var(--sapList_Background)' : 'var(--sapList_AlternatingRowBackground, var(--sapList_Background))',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/benchmarking-analytics/${process.slug}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = rowRed ? 'rgba(255,220,220,0.25)' : i % 2 === 0 ? 'var(--sapList_Background)' : 'var(--sapList_AlternatingRowBackground, var(--sapList_Background))'}
                  >
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--sapList_BorderColor)', verticalAlign: 'top' }}>
                      <Text style={{ fontWeight: '600', display: 'block', color: 'var(--sapLinkColor)' }}>{process.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                        {process.ppiCount} process performance indicators
                      </Text>
                    </td>
                    {([
                      { data: process.automation, unit: '%' },
                      { data: process.changeRate, unit: '%' },
                      { data: process.exceptionRate, unit: '%' },
                      { data: process.leadTime, unit: 'd' },
                    ] as { data: KpiData | null; unit: string }[]).map(({ data, unit }, ci) => (
                      <td
                        key={ci}
                        style={{
                          ...COL_STYLE,
                          borderBottom: '1px solid var(--sapList_BorderColor)',
                          background: data?.isRed ? 'rgba(255,200,200,0.35)' : 'transparent',
                        }}
                      >
                        <KpiCell data={data} unit={unit} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DynamicPage>
  )
}
