import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader,
  Title, Text, Icon, Select, Option, Tag,
} from '@ui5/webcomponents-react'
import { SigBreadcrumbs, SigBreadcrumbItem } from '@signavio/sap-signavio-uixtension'
import '@ui5/webcomponents-icons/dist/share-2.js'
import '@ui5/webcomponents-icons/dist/play.js'
import '@ui5/webcomponents-icons/dist/activity-individual.js'

const SAP_DEFINED_TAG = (
  <Tag design="Set2" colorScheme="5">SAP-Defined</Tag>
)

interface StatRow {
  label: string
  count: number
}

interface CloudCard {
  icon: string
  title: string
  subtitle: string
  description: string
  stats: StatRow[]
}

const CARDS: CloudCard[] = [
  {
    icon: 'share-2',
    title: 'Processes to Analyze',
    subtitle: 'Process flows',
    description: 'View process flows with reference to best practices for SAP S/4HANA Cloud, public and private editions.',
    stats: [
      { label: 'Process flows with link to best practices for SAP S/4HANA Cloud Public Edition', count: 33 },
      { label: 'Process flows with link to best practices for SAP S/4HANA Cloud Private Edition', count: 28 },
    ],
  },
  {
    icon: 'play',
    title: 'Immediate Actions to Take',
    subtitle: 'Correction recommendations',
    description: 'Remove old and unused data in your source system before you transition to SAP S/4HANA Cloud.',
    stats: [
      { label: 'Correction recommendations for transactional data', count: 5 },
      { label: 'Correction recommendations for master data', count: 0 },
      { label: 'Correction recommendations for customizing configuration', count: 0 },
    ],
  },
  {
    icon: 'activity-individual',
    title: 'Individual Metrics to Analyze',
    subtitle: 'Performance indicators',
    description: 'Further analyze the performance indicators to identify old and obsolete data before you transition to SAP S/4HANA Cloud.',
    stats: [
      { label: 'Performance indicators that measure backlog', count: 4 },
      { label: 'Performance indicators that measure master data', count: 0 },
      { label: 'Performance indicators that measure customizing configuration', count: 0 },
    ],
  },
]

const E2E_PROCESSES = [
  'All End-to-End Processes...',
  'Acquire to Decommission',
  'Lead to Cash',
  'Plan to Fulfill',
  'Source to Pay',
  'Idea to Market',
  'Governance',
]

const MODULAR_PROCESSES = ['All', 'Accounts Payable', 'Accounts Receivable', 'Asset Accounting', 'Procurement']
const SOURCE_SYSTEMS = ['QE4:006', 'QE4:007', 'PRD:001']

export default function CloudTransformation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [entryPoint, setEntryPoint] = useState(searchParams.get('e2e') ?? 'All End-to-End Processes...')
  const [modularProcess, setModularProcess] = useState('All')
  const [sourceSystem, setSourceSystem] = useState('QE4:006')

  return (
    <DynamicPage
      style={{ height: '100%' }}
      titleArea={
        <DynamicPageTitle
          breadcrumbs={
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#/discover">Discover</SigBreadcrumbItem>
              <SigBreadcrumbItem>Cloud Transformation</SigBreadcrumbItem>
            </SigBreadcrumbs>
          }
        >
          <Title slot="heading" level="H3">Cloud Transformation</Title>
          {SAP_DEFINED_TAG}
        </DynamicPageTitle>
      }
      headerArea={
        <DynamicPageHeader>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Entry Point:</Text>
              <Select style={{ minWidth: 220 }} onChange={e => setEntryPoint((e as any).detail?.selectedOption?.textContent?.trim() ?? entryPoint)}>
                {E2E_PROCESSES.map(p => <Option key={p} selected={entryPoint === p}>{p}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Modular Process:</Text>
              <Select style={{ minWidth: 160 }} onChange={e => setModularProcess((e as any).detail?.selectedOption?.textContent?.trim() ?? modularProcess)}>
                {MODULAR_PROCESSES.map(p => <Option key={p} selected={modularProcess === p}>{p}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Source System:</Text>
              <Select style={{ minWidth: 140 }} onChange={e => setSourceSystem((e as any).detail?.selectedOption?.textContent?.trim() ?? sourceSystem)}>
                {SOURCE_SYSTEMS.map(s => <Option key={s} selected={sourceSystem === s}>{s}</Option>)}
              </Select>
            </div>
          </div>
        </DynamicPageHeader>
      }
    >
      <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            onClick={i === 0 ? () => navigate('/cloud-transformation/flows') : undefined}
            style={{
              background: 'var(--sapGroup_ContentBackground)',
              border: '1px solid var(--sapList_BorderColor)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              cursor: i === 0 ? 'pointer' : 'default',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={i === 0 ? e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)' : undefined}
            onMouseLeave={i === 0 ? e => (e.currentTarget as HTMLElement).style.boxShadow = '' : undefined}
          >
            {/* Icon + titles */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={card.icon} style={{ color: '#0070d2', fontSize: '1.25rem' }} />
              </div>
              <div>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', display: 'block' }}>{card.title}</Text>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{card.subtitle}</Text>
              </div>
            </div>

            {/* Description */}
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 1.5 }}>
              {card.description}
            </Text>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {card.stats.map(stat => (
                <div key={stat.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0070d2', lineHeight: 1, minWidth: 28, flexShrink: 0 }}>
                    {stat.count}
                  </span>
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: 1.4 }}>
                    {stat.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DynamicPage>
  )
}
