import { Card, FlexBox, FlexBoxDirection, Text } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { SuggestedInitiative } from '@/data/discoveryMocks'

export default function PulseCheckCard({ initiative }: { initiative: SuggestedInitiative }) {
  return (
    <Card style={{ width: '100%' }}>
      <FlexBox direction={FlexBoxDirection.Column} style={{ margin: '1rem', gap: '1rem' }}>
        <Text style={{ flex: '1 1 auto', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
          {initiative.description}
        </Text>
        <FlexBox style={{ gap: '1rem', flex: '0 0 auto' }}>
          {initiative.dimension && (
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Dimension</Text>
              <SigChipV2 value={initiative.dimension} design="indication6" condensed />
            </FlexBox>
          )}
          {initiative.subDimension && (
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Sub-Dimension</Text>
              <SigChipV2 value={initiative.subDimension} design="indication7" condensed />
            </FlexBox>
          )}
        </FlexBox>
      </FlexBox>
    </Card>
  )
}
