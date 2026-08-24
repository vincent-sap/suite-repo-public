import React from 'react'
import {
  Card,
  CardHeader,
  Icon,
  Text,
} from '@ui5/webcomponents-react'

type FactSheetCard = {
  id: string
  title: string
  iconName: string
  content?: React.ReactNode
}

const CARDS: FactSheetCard[] = [
  {
    id: 'description',
    title: 'Process Description and Objective',
    iconName: 'hint',
    content: undefined,
  },
  {
    id: 'trigger',
    title: 'Process Trigger',
    iconName: 'begin',
    content: <Text style={{ fontSize: 'var(--sapFontSize)' }}>Start Event</Text>,
  },
  {
    id: 'supplier',
    title: 'Supplier',
    iconName: 'supplier',
    content: undefined,
  },
  {
    id: 'result',
    title: 'Process Result',
    iconName: 'complete',
    content: <Text style={{ fontSize: 'var(--sapFontSize)' }}>End Event</Text>,
  },
  {
    id: 'customer',
    title: 'Customer',
    iconName: 'customer',
    content: undefined,
  },
  {
    id: 'activities',
    title: 'Activities',
    iconName: 'activities',
    content: undefined,
  },
  {
    id: 'people',
    title: 'People and Roles',
    iconName: 'group',
    content: undefined,
  },
  {
    id: 'risks',
    title: 'Risks and Controls',
    iconName: 'alert',
    content: undefined,
  },
  {
    id: 'documents',
    title: 'Documents and IT Systems',
    iconName: 'documents',
    content: undefined,
  },
]

function EmptyCardContent({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      gap: '0.5rem',
      textAlign: 'center',
    }}>
      <Text style={{ fontWeight: '600', display: 'block' }}>No data available</Text>
      <Text style={{
        color: 'var(--sapContent_LabelColor)',
        fontSize: 'var(--sapFontSmallSize)',
        display: 'block',
      }}>
        We could not find any data for {title}.
      </Text>
    </div>
  )
}

function FactSheetCardContent({ card }: { card: FactSheetCard }) {
  if (!card.content) {
    return <EmptyCardContent title={card.title} />
  }
  return (
    <div style={{ padding: '0.75rem 1rem' }}>
      {card.content}
    </div>
  )
}

export default function FactSheetTab() {
  return (
    <div style={{
      padding: '1rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      alignContent: 'start',
    }}>
      {CARDS.map(card => (
        <Card
          key={card.id}
          header={
            <CardHeader
              titleText={card.title}
              avatar={
                <Icon
                  name={card.iconName}
                  style={{ color: 'var(--sapContent_IconColor)', fontSize: '1.25rem' }}
                />
              }
            />
          }
          style={{ height: 'fit-content' }}
        >
          <FactSheetCardContent card={card} />
        </Card>
      ))}
    </div>
  )
}

