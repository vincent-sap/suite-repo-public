import {
  FlexBox, FlexBoxAlignItems, FlexBoxJustifyContent,
  List, ListItemCustom, ListItemGroup,
  CheckBox, Icon, Text, MessageStrip,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { SuggestedInitiative } from '@/data/discoveryMocks'
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js'
import s from './SuggestedInitiativesList.module.css'

function groupInitiatives(initiatives: SuggestedInitiative[]) {
  const groups = new Map<string, { label: string; items: SuggestedInitiative[] }>()
  for (const init of initiatives) {
    const key = init.businessChallenge?.id ?? init.dimension ?? 'other'
    const label = init.businessChallenge?.name ?? init.dimension ?? 'Other'
    if (!groups.has(key)) groups.set(key, { label, items: [] })
    groups.get(key)!.items.push(init)
  }
  return Array.from(groups.values())
}

type Props = {
  initiatives: SuggestedInitiative[]
  selectedIds: Set<string>
  activeId: string | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onSelectAll: (all: boolean) => void
  messageContent: string
  categoryChipLabel: (init: SuggestedInitiative) => string
}

export default function SuggestedInitiativesList({
  initiatives, selectedIds, activeId, onSelect, onToggle, onSelectAll, messageContent, categoryChipLabel,
}: Props) {
  const isAllSelected = initiatives.length > 0 && initiatives.every(i => selectedIds.has(i.id))
  const groups = groupInitiatives(initiatives)

  return (
    <div className={s.container}>
      <div className={s.header}>
        <Text style={{ fontSize: 'var(--sapFontLargeSize)', fontWeight: 700 }}>
          Suggested Initiatives
        </Text>
        <MessageStrip design="Information" hideCloseButton>
          {messageContent}
        </MessageStrip>
        <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween}>
          <CheckBox
            text="Select all"
            checked={isAllSelected}
            onChange={() => onSelectAll(!isAllSelected)}
          />
          <SigChipV2
            value={`${selectedIds.size}/${initiatives.length} selected`}
            design="none"
            condensed
          />
        </FlexBox>
      </div>

      <List selectionMode="None" style={{ flex: 1 }}>
        {groups.map(group => (
          <ListItemGroup key={group.label} headerText={group.label}>
            {group.items.map(init => (
              <ListItemCustom
                key={init.id}
                type="Active"
                className={s.listItem}
                onClick={() => onSelect(init.id)}
              >
                <FlexBox
                  alignItems={FlexBoxAlignItems.Center}
                  justifyContent={FlexBoxJustifyContent.SpaceBetween}
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  <CheckBox
                    checked={selectedIds.has(init.id)}
                    onChange={e => { e.stopPropagation?.(); onToggle(init.id) }}
                  />
                  <FlexBox direction="Column" style={{ flex: 1, gap: '0.25rem', minWidth: 0 }}>
                    <Text className={s.initiativeName}>{init.title}</Text>
                    <FlexBox className={s.chips} style={{ gap: '0.25rem', flexWrap: 'wrap' }}>
                      <SigChipV2 value={categoryChipLabel(init)} design="indication7" condensed />
                      <SigChipV2
                        value={`${init.insights.length + init.assets.length + init.tasks.length} recommendations`}
                        design="none"
                        condensed
                      />
                    </FlexBox>
                  </FlexBox>
                  {activeId === init.id && (
                    <Icon name="slim-arrow-right" style={{ color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
                  )}
                </FlexBox>
              </ListItemCustom>
            ))}
          </ListItemGroup>
        ))}
      </List>
    </div>
  )
}
