import React from 'react'
import { Icon, Title, Text, Toast } from '@ui5/webcomponents-react'

interface MapCard {
  id: string
  title: string
  description: string
  icon: string
  category: string
}

const MAP_CARDS: MapCard[] = [
  {
    id: 'value-chain',
    title: 'Value Chain',
    icon: 'SAP-icons-v4/value-any',
    category: 'Strategic',
    description: "Porter's Value Chain showing primary activities (Inbound Logistics, Operations, Outbound Logistics, Marketing and Sales, Service) and support activities.",
  },
  {
    id: 'swimlane',
    title: 'Swimlane',
    icon: 'SAP-icons-v4/pool-lane',
    category: 'Operational',
    description: 'Horizontal swimlane view grouping process elements by responsible organizational unit, showing handovers between departments.',
  },
  {
    id: 'process-house',
    title: 'Process House',
    icon: 'home',
    category: 'Strategic',
    description: '"Prozesshaus" house-shaped diagram with strategic management processes on top, operating processes in the center, and support processes at the base.',
  },
  {
    id: 'custom',
    title: 'Custom Visualization',
    icon: 'write-new',
    category: 'Custom',
    description: 'Free-form canvas to create custom process landscape maps. Arrange process elements, add connections, and annotate with business context.',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Strategic: 'var(--sapIndicationColor_5)',
  Operational: 'var(--sapIndicationColor_3)',
  Custom: 'var(--sapIndicationColor_2)',
}

export default function MapsView() {
  const [activeCard, setActiveCard] = React.useState<string | null>(null)
  const [toastOpen, setToastOpen] = React.useState(false)

  const handleCardClick = (id: string) => {
    setActiveCard(id)
    setToastOpen(true)
  }

  return (
    <div style={{ padding: '1.5rem', overflow: 'auto', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level="H5" style={{ marginBottom: '0.25rem' }}>Landscape Maps</Title>
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Pre-defined and custom visual representations of your process landscape.
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: '1rem' }}>
        {MAP_CARDS.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              border: '1px solid var(--sapList_BorderColor)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              background: 'var(--sapGroup_ContentBackground)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--sapContent_Shadow1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: '0.5rem', flexShrink: 0,
                background: 'var(--sapButton_Lite_Hover_Background)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={card.icon} style={{ fontSize: '1.5rem', color: 'var(--sapContent_IconColor)' }} />
              </div>
              <span style={{
                padding: '0.125rem 0.5rem',
                background: CATEGORY_COLORS[card.category] ?? 'var(--sapNeutralBackground)',
                borderRadius: '0.75rem',
                fontSize: 'var(--sapFontSmallSize)',
                color: 'var(--sapTextColor)',
                whiteSpace: 'nowrap',
              }}>
                {card.category}
              </span>
            </div>
            <div>
              <Title level="H5" style={{ marginBottom: '0.375rem' }}>{card.title}</Title>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', lineHeight: '1.5' }}>
                {card.description}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              <Icon name="open-command-field" style={{ fontSize: '0.875rem' }} />
              <Text style={{ color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSmallSize)' }}>Open in Process Landscape</Text>
            </div>
          </div>
        ))}
      </div>

      <Toast open={toastOpen} duration={2000} onClose={() => setToastOpen(false)}>
        {MAP_CARDS.find(c => c.id === activeCard)?.title} opens in the full Process Landscape application.
      </Toast>
    </div>
  )
}
