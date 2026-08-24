import { Card, FlexBox, FlexBoxDirection, Text } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { SuggestedInitiative } from '@/data/discoveryMocks'

export default function BusinessChallengeCard({ initiative }: { initiative: SuggestedInitiative }) {
  return (
    <Card style={{ width: '100%' }}>
      <FlexBox direction={FlexBoxDirection.Column} style={{ margin: '1rem', gap: '1rem' }}>
        <FlexBox style={{ gap: '1rem', alignItems: 'flex-start' }}>
          <FlexBox direction={FlexBoxDirection.Column} style={{ flex: '1 1 auto', gap: '0.5rem' }}>
            <Text style={{ fontSize: 'var(--sapFontLargeSize, 1.25rem)', fontWeight: 700 }}>
              {initiative.businessChallenge?.name ?? 'Business Challenge'}
            </Text>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
              {initiative.description}
            </Text>
          </FlexBox>
          <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1rem', flex: '0 0 auto' }}>
            {initiative.lineOfBusiness && (
              <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Line of Business</Text>
                <SigChipV2 value={initiative.lineOfBusiness.name} design="indication6" condensed />
              </FlexBox>
            )}
            {initiative.valueDriver && (
              <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Value Driver</Text>
                <SigChipV2 value={initiative.valueDriver.name} design="indication8" condensed />
              </FlexBox>
            )}
            {initiative.e2eProcess && (
              <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>E2E Process</Text>
                <SigChipV2 value={initiative.e2eProcess.name} design="indication7" condensed />
              </FlexBox>
            )}
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </Card>
  )
}
