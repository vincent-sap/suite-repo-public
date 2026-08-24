import { useNavigate } from 'react-router-dom'
import {
  FlexBox, FlexBoxDirection, FlexBoxAlignItems,
  Text, Button, MessageStrip, IllustratedMessage,
  List, ListItemCustom,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { SuggestedInitiative } from '@/data/discoveryMocks'
import '@ui5/webcomponents-icons/dist/lightbulb.js'
import '@ui5/webcomponents-icons/dist/task.js'
import '@ui5/webcomponents-icons/dist/chain-link.js'
import linkIcon from '@signavio/icons/dist/link.js'
import s from './ViewInitiativesResults.module.css'

function buildResults(initiatives: SuggestedInitiative[]) {
  const created = initiatives.slice(0, Math.ceil(initiatives.length * 0.6))
  const partial = initiatives.slice(Math.ceil(initiatives.length * 0.6), Math.ceil(initiatives.length * 0.8))
  const failed = initiatives.slice(Math.ceil(initiatives.length * 0.8))
  return { created, partial, failed }
}

type Props = {
  initiatives: SuggestedInitiative[]
  onClose: () => void
}

function InitiativeRow({ initiative }: { initiative: SuggestedInitiative }) {
  const navigate = useNavigate()
  return (
    <ListItemCustom type="Active" className={s.listItem}>
      <div className={s.listItemContainer}>
        <FlexBox alignItems={FlexBoxAlignItems.Center} style={{ gap: '0.5rem' }}>
          <SigDomainObject object="Initiative" size="XXS" />
          <Text className={s.listItemTitle}>{initiative.title}</Text>
        </FlexBox>
        <FlexBox className={s.listChipsContainer}>
          <SigChipV2 value={String(initiative.insights.length)} leadingIcon="lightbulb" design="none" condensed />
          <SigChipV2 value={String(initiative.tasks.length)} leadingIcon="task" design="none" condensed />
          <SigChipV2 value={String(initiative.assets.length)} leadingIcon="chain-link" design="none" condensed />
        </FlexBox>
      </div>
      <Button
        design="Transparent"
        endIcon={linkIcon}
        className={s.linkButton}
        onClick={() => navigate('/initiatives')}
      >
        Open Initiative
      </Button>
    </ListItemCustom>
  )
}

export default function ViewInitiativesResults({ initiatives, onClose }: Props) {
  const { created, partial, failed } = buildResults(initiatives)

  const allFailed = created.length === 0 && partial.length === 0
  const allSuccess = failed.length === 0 && partial.length === 0

  if (allFailed) {
    return (
      <FlexBox direction={FlexBoxDirection.Column} alignItems={FlexBoxAlignItems.Center} style={{ padding: '3rem 0' }}>
        <IllustratedMessage name="NoChartData" titleText="Creation failed" subtitleText="None of the initiatives could be created. Please try again." />
        <Button design="Emphasized" onClick={onClose} style={{ marginTop: '1rem' }}>Close</Button>
      </FlexBox>
    )
  }

  if (allSuccess) {
    return (
      <FlexBox direction={FlexBoxDirection.Column} alignItems={FlexBoxAlignItems.Center} style={{ padding: '3rem 0', gap: '1.5rem' }}>
        <IllustratedMessage name="ReceiveAppreciation" titleText="Initiatives created!" subtitleText="All selected initiatives were successfully created." />
        <List>
          {created.map(init => <InitiativeRow key={init.id} initiative={init} />)}
        </List>
        <Button design="Emphasized" onClick={onClose}>Go to Initiatives</Button>
      </FlexBox>
    )
  }

  return (
    <div className={s.mainContainer}>
      {failed.length > 0 && (
        <div className={s.sectionContainer}>
          <Text className={s.sectionTitle}>Failed ({failed.length})</Text>
          <MessageStrip design="Negative" hideCloseButton>
            {failed.length} initiative{failed.length !== 1 ? 's' : ''} could not be created.
          </MessageStrip>
          <List>{failed.map(i => <InitiativeRow key={i.id} initiative={i} />)}</List>
        </div>
      )}
      {partial.length > 0 && (
        <div className={s.sectionContainer}>
          <Text className={s.sectionTitle}>Partially Created ({partial.length})</Text>
          <MessageStrip design="Critical" hideCloseButton>
            {partial.length} initiative{partial.length !== 1 ? 's' : ''} were created but some items are missing.
          </MessageStrip>
          <List>{partial.map(i => <InitiativeRow key={i.id} initiative={i} />)}</List>
        </div>
      )}
      {created.length > 0 && (
        <div className={s.sectionContainer}>
          <Text className={s.sectionTitle}>Created ({created.length})</Text>
          <MessageStrip design="Positive" hideCloseButton>
            {created.length} initiative{created.length !== 1 ? 's' : ''} created successfully.
          </MessageStrip>
          <List>{created.map(i => <InitiativeRow key={i.id} initiative={i} />)}</List>
        </div>
      )}
      <FlexBox justifyContent="End" style={{ marginTop: '1rem' }}>
        <Button design="Emphasized" onClick={onClose}>Go to Initiatives</Button>
      </FlexBox>
    </div>
  )
}
