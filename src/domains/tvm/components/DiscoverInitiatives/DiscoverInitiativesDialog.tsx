import { useEffect, useState } from 'react'
import {
  Dialog, Bar, Button, FlexBox, FlexBoxDirection, FlexBoxAlignItems,
  Title, Text, Card, CardHeader,
} from '@ui5/webcomponents-react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import BusinessChallengesWizard from './BusinessChallengesWizard'
import PulseCheckWizard from './PulseCheckWizard'

type Props = { open: boolean; onClose: () => void; initialSubFlow?: SubFlow }

type SubFlow = 'none' | 'business-challenges' | 'pulse-check'

export default function DiscoverInitiativesDialog({ open, onClose, initialSubFlow = 'none' }: Props) {
  const [subFlow, setSubFlow] = useState<SubFlow>(initialSubFlow)
  useEffect(() => { if (open) setSubFlow(initialSubFlow) }, [open])

  const handleClose = () => { setSubFlow('none'); onClose() }

  return (
    <>
      {/* Entry dialog — shown when no sub-flow is active */}
      {subFlow === 'none' && (
        <Dialog
          open={open}
          headerText="Discover Initiatives"
          style={{ width: '640px' }}
          onClose={handleClose}
          footer={<Bar endContent={<Button design="Transparent" onClick={handleClose}>Cancel</Button>} />}
        >
          <div style={{ padding: '1.5rem' }}>
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1.5rem' }}>
              <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
                <Title level="H3">Transformation Advisory</Title>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                  Choose how you want to discover transformation initiatives for your organisation.
                </Text>
              </FlexBox>

              <FlexBox style={{ gap: '1rem' }}>
                {/* AI-Assisted Initiatives */}
                <Card
                  style={{ flex: 1, cursor: 'pointer' }}
                  header={
                    <CardHeader
                      titleText="AI-Assisted Initiatives"
                      subtitleText="Discover initiatives based on business challenges"
                      interactive
                      avatar={
                        <FlexBox alignItems={FlexBoxAlignItems.Center}>
                          <SigDomainObject object="Initiative" size="S" />
                        </FlexBox>
                      }
                      onClick={() => setSubFlow('business-challenges')}
                    />
                  }
                >
                  <div style={{ padding: '0 1rem 1rem' }}>
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      Describe your business challenges and let AI suggest relevant transformation initiatives with pre-populated insights, assets, and tasks.
                    </Text>
                  </div>
                </Card>

                {/* PulseCheck Initiatives */}
                <Card
                  style={{ flex: 1, cursor: 'pointer' }}
                  header={
                    <CardHeader
                      titleText="PulseCheck Initiatives"
                      subtitleText="Discover initiatives based on a questionnaire"
                      interactive
                      avatar={
                        <FlexBox alignItems={FlexBoxAlignItems.Center}>
                          <SigDomainObject object="Action" size="S" />
                        </FlexBox>
                      }
                      onClick={() => setSubFlow('pulse-check')}
                    />
                  }
                >
                  <div style={{ padding: '0 1rem 1rem' }}>
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      Answer a short questionnaire about your process transformation maturity and receive tailored initiative recommendations.
                    </Text>
                  </div>
                </Card>
              </FlexBox>
            </FlexBox>
          </div>
        </Dialog>
      )}

      {/* Business Challenges Wizard */}
      <BusinessChallengesWizard
        open={subFlow === 'business-challenges'}
        onClose={handleClose}
      />

      {/* PulseCheck Wizard */}
      <PulseCheckWizard
        open={subFlow === 'pulse-check'}
        onClose={handleClose}
      />
    </>
  )
}
