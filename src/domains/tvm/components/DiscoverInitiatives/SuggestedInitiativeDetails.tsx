import { useState } from 'react'
import {
  FlexBox, FlexBoxDirection, FlexBoxAlignItems, FlexBoxJustifyContent,
  Title, Text, Button, CheckBox,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import CollapsiblePanel from './CollapsiblePanel'
import ListOfRecommendations, { type Recommendation } from './ListOfRecommendations'
import type { SuggestedInitiative } from '@/data/discoveryMocks'
import s from './SuggestedInitiativeDetails.module.css'

type Props = {
  initiative: SuggestedInitiative
  isSelected: boolean
  onToggleSelected: () => void
  cardComponent?: React.ReactNode
  isAiUsed?: boolean
}

export default function SuggestedInitiativeDetails({
  initiative, isSelected, onToggleSelected, cardComponent, isAiUsed = true,
}: Props) {
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(
    new Set(initiative.insights.map(i => i.id))
  )
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(
    new Set(initiative.assets.map(a => a.id))
  )
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set(initiative.tasks.map(t => t.id))
  )

  const isAllSelected =
    selectedInsights.size === initiative.insights.length &&
    selectedAssets.size === initiative.assets.length &&
    selectedTasks.size === initiative.tasks.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedInsights(new Set()); setSelectedAssets(new Set()); setSelectedTasks(new Set())
    } else {
      setSelectedInsights(new Set(initiative.insights.map(i => i.id)))
      setSelectedAssets(new Set(initiative.assets.map(a => a.id)))
      setSelectedTasks(new Set(initiative.tasks.map(t => t.id)))
    }
  }

  const toggleItem = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    setter(next)
  }

  const insightRecs: Recommendation[] = initiative.insights.map(i => ({ id: i.id, title: i.name, description: i.description }))
  const assetRecs: Recommendation[] = initiative.assets.map(a => ({ id: a.id, title: a.name, description: a.description, url: a.url, tagType: a.assetType }))
  const taskRecs: Recommendation[] = initiative.tasks.map(t => ({ id: t.id, title: t.name, description: t.description }))

  return (
    <div className={s.container}>
      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1rem' }}>
        <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} style={{ gap: '1rem' }}>
          <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '1rem' }}>
            <SigDomainObject object="Initiative" size="M" />
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.25rem' }}>
              <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
                <Title style={{ fontSize: 'var(--sapFontLargeSize, 1.25rem)' }}>{initiative.title}</Title>
                {isSelected && <SigChipV2 value="Selected" design="positive" condensed />}
              </FlexBox>
              {isAiUsed && (
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapLinkColor)' }}>✦ AI-generated suggestion</Text>
              )}
            </FlexBox>
          </FlexBox>
          <Button
            design={isSelected ? 'Default' : 'Emphasized'}
            style={{ height: '1.625rem' }}
            onClick={onToggleSelected}
          >
            {isSelected ? 'Deselect' : 'Select'}
          </Button>
        </FlexBox>
        <div style={{ width: '100%', height: '1px', backgroundColor: '#ccc' }} />
      </FlexBox>

      {cardComponent}

      <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
        <Title style={{ fontSize: 'var(--sapFontLargeSize, 1.25rem)' }}>Recommendations</Title>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
          Select the insights, assets, and tasks to include when this initiative is created.
        </Text>
      </FlexBox>

      <CheckBox
        text="Select all"
        checked={isAllSelected}
        onChange={handleSelectAll}
        className={s.selectAll}
      />

      <CollapsiblePanel
        panelIcon={<SigDomainObject object="Insights" size="XXS" />}
        panelTitle={`${initiative.insights.length} suggested insight${initiative.insights.length !== 1 ? 's' : ''}`}
      >
        {insightRecs.length > 0 && (
          <ListOfRecommendations
            recommendations={insightRecs}
            selectedIds={selectedInsights}
            onToggle={id => toggleItem(selectedInsights, id, setSelectedInsights)}
            onSelectAll={all => setSelectedInsights(all ? new Set(insightRecs.map(r => r.id)) : new Set())}
          />
        )}
      </CollapsiblePanel>

      <CollapsiblePanel
        panelIcon={<SigDomainObject object="File" size="XXS" />}
        panelTitle={`${initiative.assets.length} suggested asset${initiative.assets.length !== 1 ? 's' : ''}`}
      >
        {assetRecs.length > 0 && (
          <ListOfRecommendations
            recommendations={assetRecs}
            selectedIds={selectedAssets}
            onToggle={id => toggleItem(selectedAssets, id, setSelectedAssets)}
            onSelectAll={all => setSelectedAssets(all ? new Set(assetRecs.map(r => r.id)) : new Set())}
          />
        )}
      </CollapsiblePanel>

      <CollapsiblePanel
        panelIcon={<SigDomainObject object="Task" size="XXS" />}
        panelTitle={`${initiative.tasks.length} suggested task${initiative.tasks.length !== 1 ? 's' : ''}`}
      >
        {taskRecs.length > 0 && (
          <ListOfRecommendations
            recommendations={taskRecs}
            selectedIds={selectedTasks}
            onToggle={id => toggleItem(selectedTasks, id, setSelectedTasks)}
            onSelectAll={all => setSelectedTasks(all ? new Set(taskRecs.map(r => r.id)) : new Set())}
          />
        )}
      </CollapsiblePanel>
    </div>
  )
}
