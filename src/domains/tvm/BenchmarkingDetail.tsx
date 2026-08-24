import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Tag, Button, Icon,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/decline.js'
import '@ui5/webcomponents-icons/dist/information.js'
import '@ui5/webcomponents-icons/dist/nav-back.js'

interface KPI {
  id: string
  name: string
  unit: string
  higherIsBetter: boolean
  yours: number | null
  median: number
  q1: number
  q3: number
  bestInClass: number
  isRed: boolean
  description: string
}

interface ProcessData {
  name: string
  ppiCount: number
  kpis: KPI[]
}

const PROCESSES: Record<string, ProcessData> = {
  'acquire-to-decommission': {
    name: 'Acquire to Decommission',
    ppiCount: 16,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: null, median: 42.0, q1: 28.0, q3: 61.0, bestInClass: 83.14, isRed: false, description: 'Percentage of asset lifecycle process steps executed without manual intervention.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: null, median: 18.0, q1: 10.0, q3: 26.0, bestInClass: 13.67, isRed: false, description: 'Percentage of assets that required changes after initial posting.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: 12.0, q1: 5.0, q3: 18.0, bestInClass: 7.5, isRed: false, description: 'Percentage of asset transactions that required manual exception handling.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: 172.1, median: 130.0, q1: 96.4, q3: 155.0, bestInClass: 96.4, isRed: true, description: 'Average time from asset acquisition request to commissioning.' },
    ],
  },
  'governance': {
    name: 'Governance',
    ppiCount: 14,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: 0.0, median: 22.29, q1: 12.0, q3: 45.0, bestInClass: 69.92, isRed: true, description: 'Percentage of governance process steps executed without manual intervention.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: null, median: 14.0, q1: 8.0, q3: 20.0, bestInClass: 9.6, isRed: false, description: 'Percentage of governance records that required subsequent changes.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: null as unknown as number, q1: 0, q3: 0, bestInClass: 0, isRed: false, description: 'No data available for this metric.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: 226.0, median: 150.0, q1: 96.6, q3: 190.0, bestInClass: 96.6, isRed: true, description: 'Average time to complete governance review and approval cycles.' },
    ],
  },
  'idea-to-market': {
    name: 'Idea to Market',
    ppiCount: 3,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: null, median: null as unknown as number, q1: 0, q3: 0, bestInClass: 0, isRed: false, description: 'No automation data available for this process.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: null, median: null as unknown as number, q1: 0, q3: 0, bestInClass: 0, isRed: false, description: 'No change rate data available for this process.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: 65.0, q1: 45.0, q3: 78.0, bestInClass: 91.0, isRed: false, description: 'Percentage of product development tasks requiring exception handling.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: null, median: 80.0, q1: 56.4, q3: 110.0, bestInClass: 56.4, isRed: false, description: 'Average time from idea submission to market launch.' },
    ],
  },
  'lead-to-cash': {
    name: 'Lead to Cash',
    ppiCount: 40,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: 12.5, median: 45.2, q1: 28.0, q3: 62.5, bestInClass: 77.99, isRed: true, description: 'Percentage of order-to-cash steps executed without manual intervention.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: 0.13, median: 14.0, q1: 8.0, q3: 22.0, bestInClass: 25.29, isRed: false, description: 'Percentage of sales orders that required changes after initial entry.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: 4.0, q1: 1.0, q3: 8.0, bestInClass: 0.0, isRed: false, description: 'Percentage of sales transactions requiring manual exception handling.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: 28.5, median: 16.0, q1: 8.6, q3: 22.0, bestInClass: 8.6, isRed: true, description: 'Average time from sales order creation to cash receipt.' },
    ],
  },
  'plan-to-fulfill': {
    name: 'Plan to Fulfill',
    ppiCount: 61,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: 26.36, median: 62.0, q1: 42.0, q3: 80.0, bestInClass: 95.51, isRed: true, description: 'Percentage of supply chain planning steps executed without manual intervention.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: null, median: 16.0, q1: 9.0, q3: 24.0, bestInClass: 25.07, isRed: false, description: 'Percentage of planned orders that required changes.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: 6.0, q1: 2.0, q3: 10.0, bestInClass: 4.0, isRed: false, description: 'Percentage of fulfillment transactions requiring manual exception handling.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: 8.7, median: 10.0, q1: 8.7, q3: 14.0, bestInClass: 8.7, isRed: false, description: 'Average time from demand signal to order fulfillment.' },
    ],
  },
  'source-to-pay': {
    name: 'Source to Pay',
    ppiCount: 38,
    kpis: [
      { id: 'automation', name: 'Automation Rate', unit: '%', higherIsBetter: true, yours: null, median: 38.0, q1: 22.0, q3: 55.0, bestInClass: 68.4, isRed: false, description: 'Percentage of procurement steps executed without manual intervention.' },
      { id: 'change', name: 'Change Rate', unit: '%', higherIsBetter: false, yours: null, median: 12.0, q1: 6.0, q3: 18.0, bestInClass: 8.5, isRed: false, description: 'Percentage of purchase orders that required changes after creation.' },
      { id: 'exception', name: 'Exception Rate', unit: '%', higherIsBetter: false, yours: null, median: 16.0, q1: 8.0, q3: 22.0, bestInClass: 12.3, isRed: false, description: 'Percentage of procurement transactions requiring exception handling.' },
      { id: 'leadtime', name: 'Lead Time', unit: 'd', higherIsBetter: false, yours: null, median: 28.0, q1: 22.1, q3: 36.0, bestInClass: 22.1, isRed: false, description: 'Average time from purchase requisition to invoice payment.' },
    ],
  },
}

// Benchmark bar component
function BenchmarkBar({ kpi, compact = false }: { kpi: KPI; compact?: boolean }) {
  if (kpi.median === null) return <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No benchmark data</Text>

  const maxVal = kpi.higherIsBetter
    ? Math.max(kpi.bestInClass * 1.1, (kpi.yours ?? 0) * 1.1)
    : Math.max(kpi.bestInClass * 1.5, (kpi.yours ?? 0) * 1.3, kpi.median * 1.5)

  const toPos = (val: number) => {
    if (kpi.higherIsBetter) return Math.min(100, (val / maxVal) * 100)
    return Math.min(100, 100 - (val / maxVal) * 100)
  }

  const yourPos = kpi.yours !== null ? toPos(kpi.yours) : null
  const medianPos = toPos(kpi.median)
  const bestPos = toPos(kpi.bestInClass)
  const q1Pos = toPos(kpi.q1)
  const q3Pos = toPos(kpi.q3)

  const barHeight = compact ? 8 : 12

  return (
    <div style={{ width: '100%' }}>
      {/* Axis labels */}
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <Text style={{ fontSize: '0.625rem', color: 'var(--sapContent_LabelColor)' }}>
            {kpi.higherIsBetter ? 'Worst' : 'Best'}
          </Text>
          <Text style={{ fontSize: '0.625rem', color: 'var(--sapContent_LabelColor)' }}>
            {kpi.higherIsBetter ? 'Best' : 'Worst'}
          </Text>
        </div>
      )}

      {/* Bar */}
      <div style={{ position: 'relative', height: barHeight + 24, paddingTop: 8 }}>
        <div style={{
          height: barHeight,
          borderRadius: barHeight / 2,
          background: 'linear-gradient(to right, #bb0000, #e67e00, #f0c040, #66aa00)',
          position: 'relative',
        }}>
          {/* Q1–Q3 shaded region */}
          <div style={{
            position: 'absolute',
            left: `${q1Pos}%`,
            width: `${q3Pos - q1Pos}%`,
            top: 0, bottom: 0,
            background: 'rgba(255,255,255,0.25)',
            borderLeft: '1px solid rgba(255,255,255,0.6)',
            borderRight: '1px solid rgba(255,255,255,0.6)',
          }} />

          {/* Median marker */}
          <div style={{
            position: 'absolute',
            left: `${medianPos}%`,
            top: -4, height: barHeight + 8,
            width: 2,
            background: 'rgba(255,255,255,0.9)',
            transform: 'translateX(-50%)',
          }} />

          {/* Best in class marker */}
          <div style={{
            position: 'absolute',
            left: `${bestPos}%`,
            top: -6, height: barHeight + 12,
            width: 2,
            background: '#005a00',
            transform: 'translateX(-50%)',
          }} />

          {/* Your company marker */}
          {yourPos !== null && (
            <div style={{
              position: 'absolute',
              left: `${yourPos}%`,
              top: -8, height: barHeight + 16,
              width: 3,
              background: kpi.isRed ? '#bb0000' : '#0070d2',
              transform: 'translateX(-50%)',
              borderRadius: 2,
            }} />
          )}
        </div>

        {/* Labels below bar */}
        {!compact && (
          <>
            {yourPos !== null && (
              <div style={{ position: 'absolute', left: `${yourPos}%`, transform: 'translateX(-50%)', top: barHeight + 10, whiteSpace: 'nowrap' }}>
                <Text style={{ fontSize: '0.625rem', color: kpi.isRed ? '#bb0000' : '#0070d2', fontWeight: '600' }}>
                  {kpi.yours}{kpi.unit}
                </Text>
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      {!compact && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(255,255,255,0.8)', border: '1px solid #666', label: `Median: ${kpi.median}${kpi.unit}`, bg: 'transparent', lineColor: 'rgba(255,255,255,0.9)' },
            { lineColor: '#005a00', label: `Best-in-class: ${kpi.bestInClass}${kpi.unit}` },
            ...(yourPos !== null ? [{ lineColor: kpi.isRed ? '#bb0000' : '#0070d2', label: `Your company: ${kpi.yours}${kpi.unit}` }] : []),
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 12, height: 2, background: item.lineColor, borderRadius: 1 }} />
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{item.label}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// KPI card
function KpiCard({ kpi, onClick }: { kpi: KPI; onClick: () => void }) {
  const isRed = kpi.isRed
  return (
    <div
      onClick={onClick}
      style={{
        background: isRed ? '#fff5f5' : 'var(--sapGroup_ContentBackground)',
        border: `1px solid ${isRed ? '#ffaaaa' : 'var(--sapList_BorderColor)'}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{kpi.name}</Text>
        {isRed && <Tag design="Set2" colorScheme="1" style={{ flexShrink: 0 }}>Below Median</Tag>}
      </div>

      {kpi.yours !== null ? (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div>
            <Text style={{ fontSize: '1.75rem', fontWeight: '700', color: isRed ? '#bb0000' : 'var(--sapTextColor)', lineHeight: 1 }}>
              {kpi.yours}
            </Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>
              {kpi.unit} · Your company
            </Text>
          </div>
          <div style={{ paddingBottom: '0.25rem' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
              Median: {kpi.median}{kpi.unit}
            </Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: '#005a00', display: 'block' }}>
              Best-in-class: {kpi.bestInClass}{kpi.unit}
            </Text>
          </div>
        </div>
      ) : (
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          No company data · Median: {kpi.median !== null ? `${kpi.median}${kpi.unit}` : '—'} · Best-in-class: {kpi.bestInClass !== 0 ? `${kpi.bestInClass}${kpi.unit}` : '—'}
        </Text>
      )}

      {kpi.median !== null && <BenchmarkBar kpi={kpi} compact />}
    </div>
  )
}

// Side drawer panel
function KpiDrawer({ kpi, onClose }: { kpi: KPI; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 999,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: 0, top: 0, bottom: 0,
        width: 440,
        background: 'var(--sapGroup_ContentBackground)',
        borderLeft: '1px solid var(--sapList_BorderColor)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--sapList_BorderColor)',
          background: 'var(--sapList_HeaderBackground)',
        }}>
          <div>
            <Title level="H4">{kpi.name}</Title>
            {kpi.isRed && <Tag design="Set2" colorScheme="1" style={{ marginTop: '0.25rem' }}>Below Median</Tag>}
          </div>
          <Button icon="decline" design="Transparent" onClick={onClose} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div>
            <Text style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Description</Text>
            <Text style={{ color: 'var(--sapTextColor)', lineHeight: 1.6 }}>{kpi.description}</Text>
          </div>

          {/* Your value vs benchmark */}
          <div>
            <Text style={{ fontWeight: '600', display: 'block', marginBottom: '1rem' }}>Performance vs Benchmark</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Your Company', value: kpi.yours !== null ? `${kpi.yours}${kpi.unit}` : '—', color: kpi.isRed ? '#bb0000' : '#0070d2' },
                { label: 'Median (50th pctl)', value: kpi.median !== null ? `${kpi.median}${kpi.unit}` : '—', color: 'var(--sapTextColor)' },
                { label: 'Best-in-Class (top 25%)', value: `${kpi.bestInClass}${kpi.unit}`, color: '#005a00' },
                { label: '25th Percentile (Q1)', value: `${kpi.q1}${kpi.unit}`, color: 'var(--sapContent_LabelColor)' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '0.75rem', borderRadius: '0.5rem',
                  background: 'var(--sapList_Background)',
                  border: '1px solid var(--sapList_BorderColor)',
                }}>
                  <Text style={{ fontSize: '1.25rem', fontWeight: '700', color: item.color, display: 'block' }}>{item.value}</Text>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{item.label}</Text>
                </div>
              ))}
            </div>

            {kpi.median !== null && (
              <div style={{ background: 'var(--sapList_Background)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--sapList_BorderColor)' }}>
                <Text style={{ fontWeight: '600', display: 'block', marginBottom: '1rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Benchmark Visualization
                </Text>
                <BenchmarkBar kpi={kpi} compact={false} />
              </div>
            )}
          </div>

          {/* Improvement hint */}
          {kpi.isRed && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #ffaaaa',
              borderRadius: '0.5rem',
              padding: '1rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Icon name="information" style={{ color: '#bb0000', fontSize: '1rem', marginTop: 2 }} />
                <div>
                  <Text style={{ fontWeight: '600', color: '#bb0000', display: 'block', marginBottom: '0.25rem' }}>
                    Performance Gap Identified
                  </Text>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', lineHeight: 1.5 }}>
                    Your company's {kpi.name.toLowerCase()} ({kpi.yours}{kpi.unit}) is below the benchmark median ({kpi.median}{kpi.unit}).
                    Review improvement opportunities to close this gap.
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--sapList_BorderColor)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button design="Transparent" onClick={onClose}>Close</Button>
          <Button design="Emphasized" onClick={() => window.location.hash = '/improvement-opportunities'}>
            View Improvement Opportunities
          </Button>
        </div>
      </div>
    </>
  )
}

export default function BenchmarkingDetail() {
  const { process } = useParams<{ process: string }>()
  const navigate = useNavigate()
  const [activeKpi, setActiveKpi] = useState<KPI | null>(null)

  const data = process ? PROCESSES[process] : null

  if (!data) {
    return (
      <DynamicPage style={{ height: '100%' }} titleArea={
        <DynamicPageTitle>
          <Title slot="heading" level="H3">Process Not Found</Title>
        </DynamicPageTitle>
      }>
        <div style={{ padding: '2rem' }}>
          <Text>No data found for this process.</Text>
          <Button design="Transparent" onClick={() => navigate('/benchmarking-analytics')}>Back to Benchmarking Analytics</Button>
        </div>
      </DynamicPage>
    )
  }

  const redCount = data.kpis.filter(k => k.isRed).length

  return (
    <>
      <DynamicPage
        style={{ height: '100%' }}
        titleArea={
          <DynamicPageTitle
            breadcrumbs={
              <SigBreadcrumbs>
                <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
                <SigBreadcrumbItem href="#/benchmarking-analytics">Benchmarking Analytics</SigBreadcrumbItem>
                <SigBreadcrumbItem>{data.name}</SigBreadcrumbItem>
              </SigBreadcrumbs>
            }
            actionsBar={
              <Button icon="nav-back" design="Transparent" onClick={() => navigate('/benchmarking-analytics')}>
                Back
              </Button>
            }
          >
            <Title slot="heading" level="H3">{data.name}</Title>
            {redCount > 0 && (
              <Tag design="Set2" colorScheme="1">{redCount} KPI{redCount > 1 ? 's' : ''} Below Median</Tag>
            )}
          </DynamicPageTitle>
        }
        headerArea={
          <DynamicPageHeader>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>Process Performance Indicators</Text>
                <Text style={{ fontWeight: '600', fontSize: '1.25rem' }}>{data.ppiCount}</Text>
              </div>
              <div>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>Benchmark Period</Text>
                <Text style={{ fontWeight: '600' }}>Apr 2024 – Mar 2026</Text>
              </div>
              <div>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>Benchmark Peers</Text>
                <Text style={{ fontWeight: '600' }}>82 companies</Text>
              </div>
            </div>
          </DynamicPageHeader>
        }
      >
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Title level="H4">KPI Overview</Title>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              Click a KPI card to see the full benchmark visualization
            </Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {data.kpis.map(kpi => (
              <KpiCard key={kpi.id} kpi={kpi} onClick={() => setActiveKpi(kpi)} />
            ))}
          </div>
        </div>
      </DynamicPage>

      {activeKpi && <KpiDrawer kpi={activeKpi} onClose={() => setActiveKpi(null)} />}
    </>
  )
}
