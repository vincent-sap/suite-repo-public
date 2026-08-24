import {
  List, ListItemStandard, ListItemCustom,
  FlexBox, FlexBoxDirection, FlexBoxAlignItems, FlexBoxJustifyContent,
  Text, Button, CheckBox,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import linkIcon from '@signavio/icons/dist/link.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js'
import s from './ListOfRecommendations.module.css'

export interface Recommendation {
  id: string
  title: string
  description: string
  url?: string
  tagType?: string
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  PROCESS_FLOW: 'Process Flow',
  BLOCKER: 'Blocker',
  IMPROVEMENT_OPPORTUNITY: 'Improvement Opp.',
  DOCUMENT: 'Document',
  CORRECTION_RECOMMENDATION: 'Correction Rec.',
}

type Props = {
  recommendations: Recommendation[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: (all: boolean) => void
}

export default function ListOfRecommendations({ recommendations, selectedIds, onToggle, onSelectAll }: Props) {
  const isAllSelected = recommendations.length > 0 && recommendations.every(r => selectedIds.has(r.id))

  return (
    <div className={s.listContainer}>
      <List selectionMode="None">
        <ListItemStandard
          className={s.listItemSelectAll}
          type="Active"
          onClick={() => onSelectAll(!isAllSelected)}
        >
          <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
            <CheckBox checked={isAllSelected} onChange={() => onSelectAll(!isAllSelected)} />
            <Text style={{ fontWeight: 700 }}>Select all</Text>
          </FlexBox>
        </ListItemStandard>

        {recommendations.map(rec => (
          <ListItemCustom
            key={rec.id}
            type="Active"
            className={s.listItem}
            onClick={() => onToggle(rec.id)}
          >
            <FlexBox
              alignItems={FlexBoxAlignItems.Center}
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              style={{ width: '100%' }}
            >
              <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem', flexShrink: 0 }}>
                <CheckBox checked={selectedIds.has(rec.id)} onChange={() => onToggle(rec.id)} />
              </FlexBox>
              <FlexBox
                direction={FlexBoxDirection.Column}
                className={s.listItemContentContainer}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Text className={s.listItemTitle}>{rec.title}</Text>
                {rec.description && (
                  <Text className={s.listItemDescription}>{rec.description}</Text>
                )}
                {rec.tagType && (
                  <FlexBox className={s.chipsContainer}>
                    <SigChipV2
                      value={ASSET_TYPE_LABEL[rec.tagType] ?? rec.tagType}
                      design="none"
                      condensed
                    />
                  </FlexBox>
                )}
              </FlexBox>
              {rec.url && (
                <Button
                  design="Transparent"
                  endIcon={linkIcon}
                  className={s.linkButton}
                  onClick={e => { e.stopPropagation(); window.open(rec.url, '_blank') }}
                >
                  Open
                </Button>
              )}
            </FlexBox>
          </ListItemCustom>
        ))}
      </List>
    </div>
  )
}
