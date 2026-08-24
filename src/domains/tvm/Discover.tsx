import { useState, useRef, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button, Title, Text, Icon,
  Popover, List, ListItemStandard,
  TabContainer, Tab,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { usePCA } from '@/contexts/PCAContext'
import { PCAInputField } from '../modeler/pca/PCAInputField'
import LoginBackground from '../../LoginBackground.jpg'
import '@ui5/webcomponents-icons/dist/explorer.js'
import '@ui5/webcomponents-icons/dist/trend-up.js'
import '@ui5/webcomponents-icons/dist/arobase.js'
import '@ui5/webcomponents-icons/dist/share-2.js'
import '@ui5/webcomponents-icons/dist/play.js'
import '@ui5/webcomponents-icons/dist/activity-individual.js'
import '@ui5/webcomponents-icons/dist/add.js'
import '@ui5/webcomponents-icons/dist/arrow-right.js'
import '@ui5/webcomponents-icons/dist/lightbulb.js'

// ─── Static data ──────────────────────────────────────────────────────────────

const DISCOVER_PROMPTS = [
  'Where should I focus to improve?',
  'What quick wins are available?',
  'How do I benchmark my processes?',
]

const LOB_OPTIONS = ['All Lines of Business', 'Finance', 'Sales', 'Supply Chain', 'Manufacturing', 'Sourcing & Procurement']
const DRIVER_OPTIONS = ['All Value Drivers', 'Improve Days Payable Outstanding', 'Reduce Sales Cost', 'Improve On-Time Delivery', 'Reduce Data Management Cost']
const E2E_OPTIONS = ['All End-to-End Processes', 'Acquire to Decommission', 'Lead to Cash', 'Plan to Fulfill', 'Source to Pay', 'Idea to Market']

const QUICK_WINS = [
  { id: 'qw1', recId: 'c2', finding: '892 production orders are still open past their scheduled end date', recommendation: 'Set the production orders to technically completed', impact: 3, effort: 2, valueDriver: 'Reduce Supply Chain Planning Cost' },
  { id: 'qw2', recId: 'c7', finding: '70 open supplier credit memo items not related to returns are pending', recommendation: 'Collect from the supplier or close outstanding credit memos', impact: 2, effort: 2, valueDriver: 'Improve Days Payable Outstanding' },
  { id: 'qw3', recId: 'c8', finding: '42 error records from automatic goods movement postings remain unresolved', recommendation: 'Delete old and obsolete records to clean up backlog', impact: 3, effort: 1, valueDriver: 'Reduce Data Management Cost' },
]

const ASSESSMENT_DIMS = [
  { label: 'Maturity Assessment', score: 67, color: '#1473e6' },
  { label: 'Workspace Health Check', score: 72, color: '#107e3e' },
]

const FEATURED_OPP = {
  title: 'Increase cash by collecting supplier credit memos or gaining discounts',
  description: 'Identify open and overdue supplier credit memos, down payments, and supplier discounts to increase available cash. Prioritizing this could unlock significant working capital.',
  corrections: 5,
  lob: 'Finance',
  lever: 'Effectiveness',
}

const MORE_OPPS = [
  { id: '2', title: 'Increase order management FTE productivity', lob: 'Sales' },
  { id: '3', title: 'Reduce obsolete or duplicate supplier payments', lob: 'Finance' },
  { id: '5', title: 'Improve on-time delivery performance in make to order', lob: 'Sales' },
  { id: '7', title: 'Reduce maverick buying behavior', lob: 'Sourcing & Procurement' },
]

const RED_BENCHMARK_KPIS = [
  { process: 'Governance', kpi: 'Automation Rate', yours: '0%', median: '22.3%', slug: 'governance' },
  { process: 'Governance', kpi: 'Lead Time', yours: '226d', median: '150d', slug: 'governance' },
  { process: 'Acquire to Decommission', kpi: 'Lead Time', yours: '172.1d', median: '130d', slug: 'acquire-to-decommission' },
  { process: 'Lead to Cash', kpi: 'Automation Rate', yours: '12.5%', median: '45.2%', slug: 'lead-to-cash' },
  { process: 'Lead to Cash', kpi: 'Lead Time', yours: '28.5d', median: '16d', slug: 'lead-to-cash' },
  { process: 'Plan to Fulfill', kpi: 'Automation Rate', yours: '26.4%', median: '62%', slug: 'plan-to-fulfill' },
]

const ERP_CARDS = [
  {
    icon: 'share-2', title: 'Processes to Analyze', subtitle: 'Process flows',
    route: '/cloud-transformation/flows',
    stats: [{ count: 33, label: 'SAP S/4HANA Cloud Public Edition flows' }, { count: 28, label: 'SAP S/4HANA Cloud Private Edition flows' }],
  },
  {
    icon: 'play', title: 'Immediate Actions to Take', subtitle: 'Correction recommendations',
    route: '/cloud-transformation/corrections',
    stats: [{ count: 5, label: 'data readiness corrections identified' }, { count: 153, label: 'open outbound deliveries past goods issue date' }, { count: 38, label: 'overdue sales schedule lines to close' }],
  },
  {
    icon: 'activity-individual', title: 'Individual Metrics to Analyze', subtitle: 'Performance indicators',
    route: '/benchmarking-analytics',
    stats: [{ count: 4, label: 'KPIs flagged for data readiness' }, { count: 153, label: 'deliveries overdue for goods issue posting' }, { count: 49, label: 'overdue sales schedule line items' }],
  },
]

const INNOVATIONS = [
  { id: 'in1', title: 'Inventory Management', offering: 'SAP Taulia Inventory', type: 'Finance Optimization', e2e: ['Plan to Fulfill', 'Source to Pay'], lob: ['Finance', 'Supply Chain'] },
  { id: 'in2', title: 'Demand Driven MRP', offering: 'SAP S/4HANA Cloud', type: 'Cloud ERP Capability', e2e: ['Plan to Fulfill'], lob: ['Manufacturing', 'Supply Chain'] },
  { id: 'in3', title: 'Customer Claims Management', offering: 'SAP S/4HANA Cloud', type: 'Cloud ERP Capability', e2e: ['Lead to Cash'], lob: ['Sales', 'Service'] },
  { id: 'in4', title: 'Dispute Management', offering: 'SAP S/4HANA Cloud', type: 'Cloud ERP Capability', e2e: ['Lead to Cash'], lob: ['Finance'] },
  { id: 'in5', title: 'Advanced Product Quality Planning', offering: 'SAP S/4HANA Cloud', type: 'Cloud ERP Capability', e2e: ['Plan to Fulfill', 'Source to Pay'], lob: ['Manufacturing'] },
  { id: 'in6', title: 'Financial Lease Management', offering: 'SAP S/4HANA Cloud', type: 'Cloud ERP Capability', e2e: ['Acquire to Decommission', 'Governance'], lob: ['Finance'] },
]

const SECTION_IDS = ['quick-wins', 'benchmarking', 'opportunities', 'erp-transformation', 'innovations']
const SECTION_LABELS = ['Quick Wins', 'Check Where You Stand', 'Explore Opportunities', 'ERP Transformation', 'Innovations']

// ─── Sub-components ───────────────────────────────────────────────────────────

function PillButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 16, border: 'none', cursor: 'pointer', padding: '0.375rem 0.875rem',
        background: '#eae5ff', color: '#5d36ff', fontSize: 'var(--sapFontSmallSize)',
        fontWeight: 500, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function ImpactDots({ score, color = '#e9730c' }: { score: number; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: i <= score ? color : 'var(--sapList_BorderColor)' }} />
      ))}
    </div>
  )
}

function CircularScore({ score, color = '#1473e6' }: { score: number; color?: string }) {
  const r = 26
  const circumference = 2 * Math.PI * r
  const maturity = ASSESSMENT_DIMS[0].score
  const workspace = ASSESSMENT_DIMS[1].score
  const maturityDash = (maturity / 200) * circumference
  const workspaceDash = (workspace / 200) * circumference
  const workspaceDeg = -90 + (maturity / 200) * 360
  void color // split version uses fixed colors from ASSESSMENT_DIMS
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--sapList_BorderColor)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={ASSESSMENT_DIMS[0].color} strokeWidth="5"
        strokeDasharray={`${maturityDash} ${circumference - maturityDash}`}
        strokeLinecap="butt"
        transform="rotate(-90 36 36)"
      />
      <circle cx="36" cy="36" r={r} fill="none" stroke={ASSESSMENT_DIMS[1].color} strokeWidth="5"
        strokeDasharray={`${workspaceDash} ${circumference - workspaceDash}`}
        strokeLinecap="butt"
        transform={`rotate(${workspaceDeg} 36 36)`}
      />
      <text x="36" y="33" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--sapTextColor)">{score}</text>
      <text x="36" y="47" textAnchor="middle" fontSize="9" fill="var(--sapContent_LabelColor)">/100</text>
    </svg>
  )
}

function MiniProgressBar({ score, color = '#1473e6' }: { score: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: 5, background: 'var(--sapList_BorderColor)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  )
}

function SectionHeader({ id, label, route, count, hideShowMore }: { id: string; label: string; route: string; count?: number; hideShowMore?: boolean }) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title level="H4" id={id}>{label}{count !== undefined ? ` (${count})` : ''}</Title>
      </div>
      {!hideShowMore && (
        <Button design="Transparent" onClick={() => navigate(route)} style={{ color: 'var(--sapLinkColor)' }}>
          Show More <Icon name="arrow-right" style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }} />
        </Button>
      )}
    </div>
  )
}

// ─── Section 1: Quick Wins ────────────────────────────────────────────────────

function QuickWinsSection({ route }: { route: string }) {
  const navigate = useNavigate()
  return (
    <section id="quick-wins" style={{ padding: '2rem 2rem 1.5rem' }}>
      <SectionHeader id="quick-wins-title" label="Quick Wins" route={route} count={9} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {QUICK_WINS.map(w => (
          <div key={w.id} style={{
            background: 'var(--sapGroup_ContentBackground)', border: '1px solid var(--sapList_BorderColor)',
            borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: 1.4 }}>
              {w.finding}
            </Text>
            <Text style={{ color: 'var(--sapLinkColor)', fontWeight: 600, cursor: 'pointer', lineHeight: 1.4 }}
              onClick={() => navigate(`/recommendations/${w.recId}`)}>
              {w.recommendation}
            </Text>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: '0.6rem', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: 3 }}>IMPACT</Text>
                <ImpactDots score={w.impact} color="#e9730c" />
              </div>
              <div>
                <Text style={{ fontSize: '0.6rem', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: 3 }}>EFFORT</Text>
                <ImpactDots score={w.effort} color="#bb8822" />
              </div>
            </div>
            <div style={{ alignSelf: 'flex-start' }}><SigChipV2 value={w.valueDriver} design="indication6" /></div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section 2: Check Where You Stand ────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--sapGroup_ContentBackground)',
  border: '1px solid var(--sapList_BorderColor)',
  borderRadius: '0.75rem',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
}

const DIVIDER_STYLE: React.CSSProperties = {
  width: 1, height: 80, background: 'var(--sapList_BorderColor)', flexShrink: 0,
}

function BenchmarkingSection({ route }: { route: string }) {
  const navigate = useNavigate()
  const avgScore = Math.round((ASSESSMENT_DIMS[0].score + ASSESSMENT_DIMS[1].score) / 2)
  return (
    <section id="benchmarking" style={{ padding: '1.5rem 2rem' }}>
      <SectionHeader id="benchmarking-title" label="Check Where You Stand" route={route} hideShowMore />
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '0 0 280px' }}>
          <CircularScore score={avgScore} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text style={{ fontWeight: 700, display: 'block' }}>Transformation Readiness</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: 1.4, display: 'block' }}>
              Combined maturity and workspace health across your organisation
            </Text>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <SigChipV2 value="5 areas to improve" design="none" condensed />
            </div>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginTop: '0.25rem' }}>Last assessed 2 weeks ago</Text>
          </div>
        </div>
        <div style={DIVIDER_STYLE} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ASSESSMENT_DIMS.map(d => (
            <div key={d.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', width: 180, flexShrink: 0 }}>{d.label}</Text>
              <MiniProgressBar score={d.score} color={d.color} />
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 600, width: 24, textAlign: 'right', flexShrink: 0 }}>{d.score}</Text>
            </div>
          ))}
        </div>
        <div style={DIVIDER_STYLE} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', flexShrink: 0, width: 180 }}>
          <Button design="Emphasized" onClick={() => navigate('/initiatives?openDiscover=pulse-check')}>Start Maturity Assessment →</Button>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'center', lineHeight: 1.4 }}>
            ~10 min · Results mapped to initiatives
          </Text>
          <Button design="Default" onClick={() => navigate('/initiatives?openDiscover=ai')}>Transformation Advisory →</Button>
        </div>
      </div>
    </section>
  )
}

// ─── Section 3: Explore Opportunities ────────────────────────────────────────

function OpportunitiesSection({ route }: { route: string }) {
  const navigate = useNavigate()
  return (
    <section id="opportunities" style={{ padding: '1.5rem 2rem' }}>
      <SectionHeader id="opportunities-title" label="Explore Opportunities" route={route} count={15} />
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        <div style={{
          background: 'var(--sapGroup_ContentBackground)', border: '1px solid var(--sapList_BorderColor)',
          borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <SigChipV2 value={`${FEATURED_OPP.corrections} related corrections`} design="none" />
            <SigChipV2 value={FEATURED_OPP.lob} design="indication6" />
            <SigChipV2 value={FEATURED_OPP.lever} design="indication7" />
          </div>
          <Text style={{ color: 'var(--sapLinkColor)', fontWeight: 600, fontSize: 'var(--sapFontHeaderSize)', cursor: 'pointer', lineHeight: 1.4 }}
            onClick={() => navigate('/improvement-opportunities/1')}>
            {FEATURED_OPP.title}
          </Text>
          <Text style={{ color: 'var(--sapTextColor)', lineHeight: 1.6 }}>{FEATURED_OPP.description}</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { value: '70', unit: 'items', label: 'Open supplier credit memo items' },
              { value: '12', unit: 'items', label: 'Overdue down payment items' },
              { value: '68', unit: '%', label: 'Discount utilization rate' },
            ].map(tile => (
              <div key={tile.label}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sapTextColor)' }}>{tile.value}</span>
                  <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{tile.unit}</span>
                </div>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', lineHeight: 1.3 }}>{tile.label}</Text>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {MORE_OPPS.map(opp => (
            <div key={opp.title} style={{
              background: 'var(--sapGroup_ContentBackground)', border: '1px solid var(--sapList_BorderColor)',
              borderRadius: '0.5rem', padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flex: 1,
            }}>
              <Text style={{ color: 'var(--sapLinkColor)', fontWeight: 500, cursor: 'pointer', lineHeight: 1.3, flex: 1 }}
                onClick={() => navigate(`/improvement-opportunities/${opp.id}`)}>
                {opp.title}
              </Text>
              <div style={{ marginLeft: '0.5rem', flexShrink: 0 }}><SigChipV2 value={opp.lob} design="indication6" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmarking why */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Why these opportunities?</Text>
            <SigChipV2 value={`${RED_BENCHMARK_KPIS.length} benchmarks below median`} design="none" condensed />
          </div>
          <Button design="Transparent" onClick={() => navigate('/benchmarking-analytics')} style={{ color: 'var(--sapLinkColor)' }}>
            Show More <Icon name="arrow-right" style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }} />
          </Button>
        </div>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.75rem' }}>
          Your company's performance is below the industry median in these areas — click any to explore the KPI detail.
        </Text>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {RED_BENCHMARK_KPIS.map(kpi => (
            <div
              key={`${kpi.process}-${kpi.kpi}`}
              onClick={() => navigate(`/benchmarking-analytics/${kpi.slug}`)}
              style={{
                background: 'var(--sapGroup_ContentBackground)',
                border: '1px solid var(--sapList_BorderColor)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                minWidth: 180,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapGroup_ContentBackground)'}
            >
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>
                {kpi.process}
              </Text>
              <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', display: 'block' }}>
                {kpi.kpi}
              </Text>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                {kpi.yours} · median {kpi.median}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 4: ERP Transformation ───────────────────────────────────────────

function ERPTransformationSection({ route }: { route: string }) {
  const navigate = useNavigate()
  return (
    <section id="erp-transformation" style={{ padding: '1.5rem 2rem' }}>
      <SectionHeader id="erp-title" label="ERP Transformation — Get Started" route={route} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {ERP_CARDS.map(card => (
          <div key={card.title}
            onClick={() => navigate(card.route)}
            style={{
              background: 'var(--sapGroup_ContentBackground)', border: '1px solid var(--sapList_BorderColor)',
              borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapGroup_ContentBackground)'}
          >
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={card.icon} style={{ color: '#0070d2', fontSize: '1rem' }} />
              </div>
              <div>
                <Text style={{ fontWeight: 600, display: 'block' }}>{card.title}</Text>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{card.subtitle}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {card.stats.map(s => (
                <div key={s.label} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0070d2', lineHeight: 1, minWidth: 22, flexShrink: 0 }}>{s.count}</span>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: 1.4 }}>{s.label}</Text>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section 5: Innovations ───────────────────────────────────────────────────

function InnovationsSection({ route }: { route: string }) {
  return (
    <section id="innovations" style={{ padding: '1.5rem 2rem 3rem' }}>
      <SectionHeader id="innovations-title" label="Innovations by SAP to Transform Better" route={route} count={INNOVATIONS.length} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
        {INNOVATIONS.map(item => (
          <div key={item.id} style={{
            background: 'var(--sapGroup_ContentBackground)', border: '1px solid var(--sapList_BorderColor)',
            borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem',
            cursor: 'pointer',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--sapGroup_ContentBackground)'}
          >
            <Text style={{ color: 'var(--sapLinkColor)', fontWeight: 600, fontSize: 'var(--sapFontSize)', lineHeight: 1.3 }}>{item.title}</Text>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <SigChipV2 value={item.offering} design="indication6" />
              <SigChipV2 value={item.type} design="indication7" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Discover() {
  const navigate = useNavigate()
  const { sendMessage } = usePCA()
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const scrollingRef = useRef(false)
  const [activeTab, setActiveTab] = useState(0)
  const [lob, setLob] = useState(LOB_OPTIONS[0])
  const [driver, setDriver] = useState(DRIVER_OPTIONS[0])
  const [e2e, setE2e] = useState(E2E_OPTIONS[0])
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const observers: IntersectionObserver[] = []
    SECTION_IDS.forEach((id, idx) => {
      const el = root.querySelector(`#${id}`) as HTMLElement | null
      if (!el) return
      sectionRefs.current[idx] = el
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && !scrollingRef.current) setActiveTab(idx) },
        { root, rootMargin: '-5% 0px -80% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const scrollToSection = (idx: number) => {
    scrollingRef.current = true
    const el = sectionRefs.current[idx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { scrollingRef.current = false }, 900)
  }

  const buildRoute = (base: string) => {
    const params = new URLSearchParams()
    if (lob !== LOB_OPTIONS[0]) params.set('lob', lob)
    if (driver !== DRIVER_OPTIONS[0]) params.set('driver', driver)
    if (e2e !== E2E_OPTIONS[0]) params.set('e2e', e2e)
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  return (
    <div ref={scrollRef} style={{ height: '100%', overflow: 'auto' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="home-hero-banner pca-scope"
        style={{
          backgroundImage: `url(${LoginBackground})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          padding: '3rem 2rem 2rem',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          alignItems: 'center', textAlign: 'center',
        }}
      >
        <div>
          <Title level="H1" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Discover. Transform. Realize.
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--sapFontSize)', marginTop: '0.5rem', display: 'block' }}>
            Your jump-off point for process transformation — from quick wins to cloud readiness.
          </Text>
        </div>

        {/* AI input */}
        <div style={{ maxWidth: 640, width: '100%' }}>
          <PCAInputField
            onSend={text => { sendMessage(text); navigate('/process-consulting-agent') }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', justifyContent: 'center' }}>
            {DISCOVER_PROMPTS.map(p => (
              <PillButton key={p} onClick={() => { sendMessage(p); navigate('/process-consulting-agent') }}>
                {p}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Dashboard preview card */}
        <div style={{
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: '0.75rem', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          {[
            { value: '€5.2M', label: 'Value Identified', hint: 'Uncovered raw opportunity' },
            { value: '€2.1M', label: 'In Progress', hint: 'Initiatives actively running' },
            { value: '€690K', label: 'Delivered', hint: 'Verified value captured' },
          ].map((kpi, i) => (
            <Fragment key={kpi.label}>
              {i > 0 && <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sapGroup_ContentBorderColor)', margin: '0 1.25rem' }} />}
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sapTextColor)', lineHeight: 1.2 }}>{kpi.value}</div>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginTop: 2 }}>{kpi.label}</Text>
                <Text style={{ fontSize: 11, color: 'var(--sapContent_NonInteractiveIconColor)', display: 'block', marginTop: 1 }}>{kpi.hint}</Text>
              </div>
            </Fragment>
          ))}
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sapGroup_ContentBorderColor)', margin: '0 1.25rem' }} />
          <Button design="Transparent" onClick={() => navigate('/strategy-execution')}>View Portfolio →</Button>
        </div>
      </div>

      {/* ── Sticky filter row ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--sapGroup_ContentBackground)',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        padding: '0.75rem 2rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* LOB filter chip */}
        <SigChipV2
          id="lob-chip"
          value={lob}
          trailingIcon="slim-arrow-down"
          design="none"
          selected={lob !== LOB_OPTIONS[0]}
          onClick={() => setOpenFilter(p => p === 'lob' ? null : 'lob')}
        />
        <Popover
          opener="lob-chip"
          open={openFilter === 'lob'}
          onClose={() => setOpenFilter(null)}
          placement="Bottom"
          className="no-padding-popover"
        >
          <List onItemClick={e => { setLob((e.detail.item as HTMLElement).dataset.value ?? lob); setOpenFilter(null) }}>
            {LOB_OPTIONS.map(o => <ListItemStandard key={o} data-value={o} selected={lob === o}>{o}</ListItemStandard>)}
          </List>
        </Popover>

        {/* Value Driver filter chip */}
        <SigChipV2
          id="driver-chip"
          value={driver}
          trailingIcon="slim-arrow-down"
          design="none"
          selected={driver !== DRIVER_OPTIONS[0]}
          onClick={() => setOpenFilter(p => p === 'driver' ? null : 'driver')}
        />
        <Popover
          opener="driver-chip"
          open={openFilter === 'driver'}
          onClose={() => setOpenFilter(null)}
          placement="Bottom"
          className="no-padding-popover"
        >
          <List onItemClick={e => { setDriver((e.detail.item as HTMLElement).dataset.value ?? driver); setOpenFilter(null) }}>
            {DRIVER_OPTIONS.map(o => <ListItemStandard key={o} data-value={o} selected={driver === o}>{o}</ListItemStandard>)}
          </List>
        </Popover>

        {/* End-to-End filter chip */}
        <SigChipV2
          id="e2e-chip"
          value={e2e}
          trailingIcon="slim-arrow-down"
          design="none"
          selected={e2e !== E2E_OPTIONS[0]}
          onClick={() => setOpenFilter(p => p === 'e2e' ? null : 'e2e')}
        />
        <Popover
          opener="e2e-chip"
          open={openFilter === 'e2e'}
          onClose={() => setOpenFilter(null)}
          placement="Bottom"
          className="no-padding-popover"
        >
          <List onItemClick={e => { setE2e((e.detail.item as HTMLElement).dataset.value ?? e2e); setOpenFilter(null) }}>
            {E2E_OPTIONS.map(o => <ListItemStandard key={o} data-value={o} selected={e2e === o}>{o}</ListItemStandard>)}
          </List>
        </Popover>
      </div>

      {/* ── Sticky tab bar (TabContainer) ─────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 52, zIndex: 9 }}>
        <style>{`.discover-tabs::part(content) { display: none; }`}</style>
        <TabContainer
          className="discover-tabs"
          onTabSelect={e => {
            const tab = e.detail.tab as HTMLElement
            const text = (tab as any).text ?? tab.getAttribute('text') ?? ''
            const idx = SECTION_LABELS.indexOf(text)
            if (idx >= 0) {
              setActiveTab(idx)
              scrollToSection(idx)
            }
          }}
        >
          {SECTION_LABELS.map((label, idx) => (
            <Tab key={label} text={label} selected={activeTab === idx} data-idx={String(idx)} />
          ))}
        </TabContainer>
      </div>

      {/* ── Sections ──────────────────────────────────────────────────────── */}
      <QuickWinsSection route={buildRoute('/recommendations')} />
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }}><BenchmarkingSection route={buildRoute('/benchmarking-analytics')} /></div>
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }}><OpportunitiesSection route={buildRoute('/improvement-opportunities')} /></div>
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', background: 'var(--sapShell_Background)' }}><ERPTransformationSection route={buildRoute('/cloud-transformation')} /></div>
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }}><InnovationsSection route={buildRoute('/recommendations')} /></div>
    </div>
  )
}
