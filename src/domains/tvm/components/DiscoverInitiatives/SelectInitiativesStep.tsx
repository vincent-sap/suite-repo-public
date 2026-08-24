import { useState } from 'react'
import { SplitterLayout, SplitterElement } from '@ui5/webcomponents-react'
import SuggestedInitiativesList from './SuggestedInitiativesList'
import SuggestedInitiativeDetails from './SuggestedInitiativeDetails'
import type { SuggestedInitiative } from '@/data/discoveryMocks'

type Props = {
  initiatives: SuggestedInitiative[]
  messageContent: string
  categoryChipLabel: (init: SuggestedInitiative) => string
  cardComponent?: (init: SuggestedInitiative) => React.ReactNode
  isAiUsed?: boolean
}

export default function SelectInitiativesStep({
  initiatives, messageContent, categoryChipLabel, cardComponent, isAiUsed = true,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initiatives.map(i => i.id))
  )
  const [activeId, setActiveId] = useState<string | null>(initiatives[0]?.id ?? null)

  const activeInitiative = initiatives.find(i => i.id === activeId) ?? null

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAll = (all: boolean) => {
    setSelectedIds(all ? new Set(initiatives.map(i => i.id)) : new Set())
  }

  return (
    <SplitterLayout
      options={{ resetOnSizeChange: true, resetOnChildrenChange: true }}
      style={{ height: '70vh' }}
    >
      <SplitterElement size="30%" minSize={320} style={{ flexDirection: 'column' }}>
        <SuggestedInitiativesList
          initiatives={initiatives}
          selectedIds={selectedIds}
          activeId={activeId}
          onSelect={setActiveId}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
          messageContent={messageContent}
          categoryChipLabel={categoryChipLabel}
        />
      </SplitterElement>

      <SplitterElement size="70%">
        {activeInitiative ? (
          <SuggestedInitiativeDetails
            initiative={activeInitiative}
            isSelected={selectedIds.has(activeInitiative.id)}
            onToggleSelected={() => handleToggle(activeInitiative.id)}
            cardComponent={cardComponent?.(activeInitiative)}
            isAiUsed={isAiUsed}
          />
        ) : (
          <div style={{ padding: '2rem', color: 'var(--sapContent_LabelColor)' }}>
            Select an initiative to view details.
          </div>
        )}
      </SplitterElement>
    </SplitterLayout>
  )
}
