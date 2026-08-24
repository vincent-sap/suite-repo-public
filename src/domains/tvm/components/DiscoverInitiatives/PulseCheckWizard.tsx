import { useState } from 'react'
import {
  Dialog, Bar, Button, FlexBox, FlexBoxDirection, FlexBoxAlignItems, FlexBoxJustifyContent,
  Title, Text, Carousel, MessageStrip,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import SelectInitiativesStep from './SelectInitiativesStep'
import PulseCheckCard from './PulseCheckCard'
import ViewInitiativesResults from './ViewInitiativesResults'
import { PULSECHECK_QUESTIONS, PULSECHECK_INITIATIVES, type SuggestedInitiative } from '@/data/discoveryMocks'

type Step = 'questionnaire' | 'select' | 'results'

type Props = { open: boolean; onClose: () => void }

// LikertScale — 5 clickable buttons
function LikertScale({ value, onChange, leftLabel, rightLabel }: {
  value: number | null; onChange: (v: number) => void; leftLabel: string; rightLabel: string
}) {
  return (
    <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.75rem' }}>
      <FlexBox alignItems={FlexBoxAlignItems.Center} justifyContent={FlexBoxJustifyContent.SpaceBetween} style={{ gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: '2.5rem',
              border: `2px solid ${value === n ? 'var(--sapButton_Emphasized_Background)' : 'var(--sapField_BorderColor)'}`,
              borderRadius: '0.375rem',
              background: value === n ? 'var(--sapButton_Emphasized_Background)' : 'var(--sapField_Background)',
              color: value === n ? 'var(--sapButton_Emphasized_TextColor)' : 'var(--sapTextColor)',
              cursor: 'pointer',
              fontFamily: 'var(--sapFontFamily)',
              fontSize: 'var(--sapFontSize)',
              fontWeight: value === n ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            {n}
          </button>
        ))}
      </FlexBox>
      <FlexBox justifyContent={FlexBoxJustifyContent.SpaceBetween}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{leftLabel}</Text>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{rightLabel}</Text>
      </FlexBox>
    </FlexBox>
  )
}

export default function PulseCheckWizard({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('questionnaire')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [activeDimension, setActiveDimension] = useState(PULSECHECK_QUESTIONS[0]?.dimension ?? '')

  const dimensions = Array.from(new Set(PULSECHECK_QUESTIONS.map(q => q.dimension)))
  const dimQuestions = PULSECHECK_QUESTIONS.filter(q => q.dimension === activeDimension)
  const allAnswered = PULSECHECK_QUESTIONS.every(q => answers[q.id] != null)

  const handleClose = () => { setStep('questionnaire'); setAnswers({}); onClose() }

  const footerContent = () => {
    if (step === 'questionnaire') return (
      <Bar endContent={
        <FlexBox style={{ gap: '0.5rem' }}>
          <Button design="Transparent" onClick={handleClose}>Cancel</Button>
          <Button design="Emphasized" disabled={!allAnswered} onClick={() => setStep('select')}>
            View Suggested Initiatives
          </Button>
        </FlexBox>
      } />
    )
    if (step === 'select') return (
      <Bar
        startContent={<Button design="Transparent" onClick={() => setStep('questionnaire')}>Back</Button>}
        endContent={
          <FlexBox style={{ gap: '0.5rem' }}>
            <Button design="Transparent" onClick={handleClose}>Cancel</Button>
            <Button design="Emphasized" onClick={() => setStep('results')}>Create Initiatives</Button>
          </FlexBox>
        }
      />
    )
    return <Bar endContent={<Button design="Emphasized" onClick={handleClose}>Close</Button>} />
  }

  return (
    <Dialog
      open={open}
      headerText="PulseCheck Initiatives"
      style={{ width: 'min(90vw, 80rem)', height: 'min(90vh, 56rem)' }}
      className="no-padding-dialog"
      onClose={handleClose}
      footer={footerContent()}
    >
      <div style={{ padding: step === 'questionnaire' ? '2rem' : '0', height: '100%', overflow: 'auto' }}>
        {step === 'questionnaire' && (
          <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
              <Title level="H3">How mature is your process transformation practice?</Title>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                Answer a few questions to help us suggest the right transformation initiatives for your organisation.
              </Text>
            </FlexBox>

            {/* Dimension tabs */}
            <FlexBox style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              {dimensions.map(dim => (
                <SigChipV2
                  key={dim}
                  value={dim}
                  design={activeDimension === dim ? 'indication6' : 'none'}
                  onClick={() => setActiveDimension(dim)}
                />
              ))}
            </FlexBox>

            {/* Questions carousel for active dimension */}
            <Carousel>
              {dimQuestions.map((q, idx) => (
                <div key={q.id} style={{ padding: '1rem' }}>
                  <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1.5rem' }}>
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      Question {idx + 1} of {dimQuestions.length}
                    </Text>
                    <Title level="H4">{q.text}</Title>
                    {answers[q.id] != null && (
                      <MessageStrip design="Information" hideCloseButton>
                        Your previous answer: {answers[q.id]}
                      </MessageStrip>
                    )}
                    <LikertScale
                      value={answers[q.id] ?? null}
                      onChange={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                      leftLabel={q.leftLabel}
                      rightLabel={q.rightLabel}
                    />
                  </FlexBox>
                </div>
              ))}
            </Carousel>

            {!allAnswered && (
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                Please answer all questions to continue ({Object.keys(answers).length}/{PULSECHECK_QUESTIONS.length} answered).
              </Text>
            )}
          </FlexBox>
        )}

        {step === 'select' && (
          <SelectInitiativesStep
            initiatives={PULSECHECK_INITIATIVES}
            messageContent="Based on your PulseCheck results, these initiatives are recommended to strengthen your process transformation practice."
            categoryChipLabel={(init: SuggestedInitiative) => init.subDimension ?? init.dimension ?? ''}
            cardComponent={(init: SuggestedInitiative) => <PulseCheckCard initiative={init} />}
            isAiUsed={false}
          />
        )}

        {step === 'results' && (
          <ViewInitiativesResults initiatives={PULSECHECK_INITIATIVES} onClose={handleClose} />
        )}
      </div>
    </Dialog>
  )
}
