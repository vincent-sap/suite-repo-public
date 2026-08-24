import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle,
  Title, Text, Icon, Button,
  Breadcrumbs, BreadcrumbsItem,
} from '@ui5/webcomponents-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import UnpublishedModelsPage from './UnpublishedModelsPage'
import { GovSection, GovSubLabel, GovItemGrid, GovItemCard } from '../../../shared/components/dashboard'

const DIAGRAMS_PUBLISHING = [
  { label: 'Not published', value: 10 },
  { label: 'Published in older revision', value: 4 },
  { label: 'Published in latest revision', value: 17 },
]
const DIAGRAMS_TYPES = [
  { label: 'BPMN 1.2', value: 1, iconName: 'process', iconBg: '#0070f2' },
  { label: 'Business Decision Diagram (DMN 1.2)', value: 3, iconName: 'decision', iconBg: '#0070f2' },
  { label: 'Business Process Diagram (BPMN 2.0)', value: 15, iconName: 'business-objects-experience', iconBg: '#0070f2' },
  { label: 'Customer journey map', value: 1, iconName: 'journey-change', iconBg: '#0070f2' },
  { label: 'Enterprise Architecture Diagram (ArchiMate 3.0)', value: 1, iconName: 'building', iconBg: '#0070f2' },
  { label: 'Event-driven process chain (EPC)', value: 1, iconName: 'chain-link', iconBg: '#0070f2' },
  { label: 'Navigation map', value: 1, iconName: 'map-2', iconBg: '#0070f2' },
  { label: 'Organization Chart', value: 1, iconName: 'org-chart', iconBg: '#0070f2' },
  { label: 'Value Chain', value: 7, iconName: 'bar-chart', iconBg: '#0070f2' },
]
const COMMENTS_STATE = [
  { label: 'New', value: 1 },
  { label: 'Ignored', value: 0 },
  { label: 'Factored in', value: 0 },
]
const FILES_PUBLISHING = [
  { label: 'Not published', value: 48 },
  { label: 'Published in older revision', value: 0 },
  { label: 'Published in latest revision', value: 0 },
]
const FILES_TYPES = [
  { label: 'jpeg', value: 1 },
  { label: 'jpg', value: 1 },
  { label: 'pdf', value: 2 },
  { label: 'png', value: 15 },
  { label: 'xlsx', value: 29 },
]

const DICT_PUBLISHING_STATE = [
  { name: 'Latest Revision', value: 93, color: '#3b82f6' },
  { name: 'Not Published', value: 10, color: '#d97706' },
  { name: 'Older Revision', value: 2, color: '#65a30d' },
]
const DICT_CATEGORY = [
  { name: 'Others', value: 43 },
  { name: 'Org. Units', value: 32 },
  { name: 'IT Systems', value: 7 },
  { name: 'Activities', value: 4 },
  { name: 'Events', value: 2 },
  { name: 'Controls', value: 3 },
  { name: 'Documents', value: 6 },
  { name: 'Risks', value: 8 },
]
const DICT_CATEGORY_CARDS = [
  { label: 'Activities', value: 4 },
  { label: 'Controls', value: 3 },
  { label: 'Documents', value: 6 },
  { label: 'Events', value: 2 },
  { label: 'IT Systems', value: 7 },
  { label: 'Organizational Units', value: 32 },
  { label: 'Others', value: 43 },
  { label: 'Risks', value: 8 },
]
const HUB_PAGE_VISITS = [
  { name: 'Overall', value: 724 },
  { name: 'Last Year', value: 288 },
  { name: 'Curr. Year', value: 72 },
  { name: 'Last Month', value: 10 },
  { name: 'Curr. Month', value: 2 },
]

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--sapList_BorderColor)',
  borderRadius: '0.75rem',
  background: 'var(--sapGroup_ContentBackground)',
  padding: '1rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
}

function StatCard({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div style={cardStyle}>
      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{label}</Text>
      <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>
        {warn ? '—' : value}
      </Text>
      {sub && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{sub}</Text>}
    </div>
  )
}

function DictCategoryCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={cardStyle}>
      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{label}</Text>
      <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>{value}</Text>
    </div>
  )
}

function AnalysisReportsContent() {
  const [dictOpen, setDictOpen] = useState(true)
  const [hubOpen, setHubOpen] = useState(true)
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null)

  return (
    <>
      <GovSection title="Dictionary Items" count={105} expanded={dictOpen} onToggle={() => setDictOpen(!dictOpen)}>
        <GovSubLabel>Publishing state</GovSubLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Published in latest revision</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>93</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>89% of total</Text>
          </div>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Not published</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>10</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Needs publishing</Text>
          </div>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Published in older revision</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>2</Text>
          </div>
        </div>

        <GovSubLabel>Dictionary category type</GovSubLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {DICT_CATEGORY_CARDS.map(c => <DictCategoryCard key={c.label} {...c} />)}
        </div>

        <GovSubLabel>Charts</GovSubLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Publishing State Distribution</Text>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={DICT_PUBLISHING_STATE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; value: number }) => {
                    const RADIAN = Math.PI / 180
                    const r = innerRadius + (outerRadius - innerRadius) * 1.4
                    const x = cx + r * Math.cos(-midAngle * RADIAN)
                    const y = cy + r * Math.sin(-midAngle * RADIAN)
                    return <text x={x} y={y} fill="#666" textAnchor="middle" dominantBaseline="central" fontSize={13}>{value}</text>
                  }}
                  onMouseEnter={(_: unknown, index: number) => setActiveDonutIndex(index)}
                  onMouseLeave={() => setActiveDonutIndex(null)}
                >
                  {DICT_PUBLISHING_STATE.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={activeDonutIndex === null || activeDonutIndex === index ? 1 : 0.4}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Items']} />
                <Legend
                  formatter={(value: string) => <span style={{ fontSize: '12px', color: 'var(--sapTextColor)' }}>{value}</span>}
                  wrapperStyle={{ display: 'flex', justifyContent: 'space-around', width: '100%', paddingTop: '0.5rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Category Type Distribution</Text>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={DICT_CATEGORY} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Items" fill="#3b82f6" radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 11 }} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GovSection>

      <GovSection title="SAP Signavio Process Collaboration Hub" count={724} expanded={hubOpen} onToggle={() => setHubOpen(!hubOpen)}>
        <GovSubLabel>Model page visits (since May 15, 2023)</GovSubLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Overall</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>724</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Since May 15, 2023</Text>
          </div>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Last year</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>288</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Current year: 72</Text>
          </div>
          <div style={cardStyle}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Last month</Text>
            <Text style={{ fontSize: '2rem', fontWeight: '400', color: 'var(--sapTextColor)', lineHeight: 1.1 }}>10</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Current month: 2</Text>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: '0.75rem' }}>
          <Text style={{ fontWeight: '600' }}>Model Page Visit Trend</Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginBottom: '0.5rem' }}>Breakdown by period</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={HUB_PAGE_VISITS} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Page Visits" fill="#3b82f6" radius={[3, 3, 0, 0]}
                label={{ position: 'inside', fill: '#fff', fontSize: 13, fontWeight: 600 }} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <GovSubLabel>Unique users (since May 15, 2023)</GovSubLabel>
        <div style={{ ...cardStyle, gap: '0.75rem' }}>
          <Text style={{ fontWeight: '600' }}>Unique Users</Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Data requires additional permissions</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--sapWarningBackground)', borderRadius: '0.375rem' }}>
            <Icon name="alert" style={{ color: 'var(--sapWarningColor)', flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapWarningColor)' }}>
              Unique user data is unavailable without elevated access rights
            </Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {['Overall', 'Last year', 'Current year'].map(l => <StatCard key={l} label={l} value="—" warn />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {['Last month', 'Current month'].map(l => <StatCard key={l} label={l} value="—" warn />)}
          </div>
        </div>
      </GovSection>
    </>
  )
}

function GovernanceReportContent({ onNotPublishedClick }: { onNotPublishedClick?: () => void }) {
  const [diagramsOpen, setDiagramsOpen] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(true)
  const [filesOpen, setFilesOpen] = useState(true)

  return (
    <>
      <GovSection title="Diagrams" count={31} expanded={diagramsOpen} onToggle={() => setDiagramsOpen(!diagramsOpen)}>
        <GovSubLabel>Publishing state</GovSubLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {DIAGRAMS_PUBLISHING.map(item =>
            item.label === 'Not published'
              ? <GovItemCard key={item.label} label={item.label} value={item.value} onClick={onNotPublishedClick} />
              : <GovItemCard key={item.label} label={item.label} value={item.value} />
          )}
        </div>
        <GovSubLabel>Type</GovSubLabel>
        <GovItemGrid items={DIAGRAMS_TYPES} />
      </GovSection>
      <GovSection title="Comments" count={1} expanded={commentsOpen} onToggle={() => setCommentsOpen(!commentsOpen)}>
        <GovSubLabel>Commenting state</GovSubLabel>
        <GovItemGrid items={COMMENTS_STATE} />
      </GovSection>
      <GovSection title="Files" count={48} expanded={filesOpen} onToggle={() => setFilesOpen(!filesOpen)}>
        <GovSubLabel>Publishing state</GovSubLabel>
        <GovItemGrid items={FILES_PUBLISHING} />
        <GovSubLabel>Type</GovSubLabel>
        <GovItemGrid items={FILES_TYPES} />
      </GovSection>
    </>
  )
}

export default function ProcessGovernanceDashboard({ onBack }: { onBack: () => void }) {
  const [showUnpublished, setShowUnpublished] = useState(false)

  if (showUnpublished) return <UnpublishedModelsPage onBack={() => setShowUnpublished(false)} onBackToReporting={onBack} />

  return (
    <DynamicPage
      style={{ height: '100%' }}
      hidePinButton
      titleArea={
        <DynamicPageTitle>
          <Breadcrumbs slot="breadcrumbs">
            <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>
            <BreadcrumbsItem>Process Governance Dashboard</BreadcrumbsItem>
          </Breadcrumbs>
          <Title slot="heading" level="H3">Process Governance Dashboard</Title>
          <div slot="actions">
            <Button icon="search">Search for These Items</Button>
          </div>
        </DynamicPageTitle>
      }
    >
      <div style={{ padding: '0.5rem 1rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        <GovernanceReportContent onNotPublishedClick={() => setShowUnpublished(true)} />
        <AnalysisReportsContent />
        <div style={{
          border: '1px solid var(--sapList_BorderColor)',
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          background: 'var(--sapGroup_ContentBackground)',
          padding: '0.875rem 1rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="hint" style={{ color: 'var(--sapInformativeColor)', flexShrink: 0 }} />
            <Text style={{ fontWeight: '600' }}>Note</Text>
          </div>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Displayed amounts are counted without regard to access rights. The linked search depends on your current access rights.
          </Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            In addition, the contents of all "My Documents" folders are included in the displayed numbers.
          </Text>
        </div>
      </div>
    </DynamicPage>
  )
}
