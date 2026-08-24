import { useState } from 'react'
import {
  Dialog, Bar, Button, FlexBox, FlexBoxDirection,
  Title, Text, SegmentedButton, SegmentedButtonItem, TextArea,
  Label,
} from '@ui5/webcomponents-react'
import SelectInitiativesStep from './SelectInitiativesStep'
import BusinessChallengeCard from './BusinessChallengeCard'
import ViewInitiativesResults from './ViewInitiativesResults'
import { SUGGESTED_INITIATIVES, type SuggestedInitiative } from '@/data/discoveryMocks'

type Step = 'input' | 'select' | 'results'
type InputMode = 'text' | 'file'

type Props = {
  open: boolean
  onClose: () => void
}

export default function BusinessChallengesWizard({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')

  const bcInitiatives = SUGGESTED_INITIATIVES.filter(i => i.type === 'BUSINESS_CHALLENGE')

  const handleClose = () => {
    setStep('input'); setInputText('')
    onClose()
  }

  const footerContent = () => {
    if (step === 'input') return (
      <Bar endContent={
        <FlexBox style={{ gap: '0.5rem' }}>
          <Button design="Transparent" onClick={handleClose}>Cancel</Button>
          <Button design="Emphasized" disabled={!inputText.trim()} onClick={() => setStep('select')}>
            Analyze &amp; Discover
          </Button>
        </FlexBox>
      } />
    )
    if (step === 'select') return (
      <Bar
        startContent={<Button design="Transparent" onClick={() => setStep('input')}>Back</Button>}
        endContent={
          <FlexBox style={{ gap: '0.5rem' }}>
            <Button design="Transparent" onClick={handleClose}>Cancel</Button>
            <Button design="Emphasized" onClick={() => setStep('results')}>Create Initiatives</Button>
          </FlexBox>
        }
      />
    )
    return (
      <Bar endContent={<Button design="Emphasized" onClick={handleClose}>Close</Button>} />
    )
  }

  return (
    <Dialog
      open={open}
      headerText="AI-Assisted Initiatives"
      style={{ width: 'min(90vw, 80rem)', height: 'min(90vh, 56rem)' }}
      onClose={handleClose}
      footer={footerContent()}
    >
      <div style={{ padding: step === 'input' ? '2rem' : '0', height: '100%', overflow: 'auto' }}>
        {step === 'input' && (
          <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '1.5rem', maxWidth: '640px', margin: '0 auto' }}>
            <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
              <Title level="H3">Describe your business challenges</Title>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                Provide context about the challenges your organisation is facing. Our AI will suggest relevant transformation initiatives.
              </Text>
            </FlexBox>

            <SegmentedButton onSelectionChange={(e: any) => setInputMode(e.detail?.selectedItems?.[0]?.dataset?.mode ?? 'text')}>
              <SegmentedButtonItem data-mode="text" selected={inputMode === 'text'}>Text input</SegmentedButtonItem>
              <SegmentedButtonItem data-mode="file" selected={inputMode === 'file'}>File upload</SegmentedButtonItem>
            </SegmentedButton>

            {inputMode === 'text' ? (
              <FlexBox direction={FlexBoxDirection.Column} style={{ gap: '0.5rem' }}>
                <Label required>Describe your challenges</Label>
                <TextArea
                  value={inputText}
                  onInput={e => setInputText((e.target as unknown as HTMLTextAreaElement).value)}
                  placeholder="e.g. We are struggling with high manual effort in our invoice processing. Our OTIF rate is below benchmark and we have compliance gaps in our procure-to-pay process..."
                  rows={8}
                  style={{ width: '100%' }}
                  maxlength={2000}
                  showExceededText
                />
              </FlexBox>
            ) : (
              <FlexBox direction={FlexBoxDirection.Column} alignItems="Center" style={{ gap: '1rem', padding: '2rem', border: '2px dashed var(--sapField_BorderColor)', borderRadius: '0.5rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Drag and drop a file here, or</Text>
                <Button design="Default" onClick={() => setInputText('file-upload-simulated')}>Browse files</Button>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                  Supported formats: .pdf, .docx, .txt (max 10MB)
                </Text>
              </FlexBox>
            )}
          </FlexBox>
        )}

        {step === 'select' && (
          <SelectInitiativesStep
            initiatives={bcInitiatives}
            messageContent="Based on your input, we identified these transformation initiatives. Select the ones you want to create."
            categoryChipLabel={(init: SuggestedInitiative) => init.e2eProcess?.name ?? 'E2E Process'}
            cardComponent={(init: SuggestedInitiative) => <BusinessChallengeCard initiative={init} />}
            isAiUsed
          />
        )}

        {step === 'results' && (
          <ViewInitiativesResults initiatives={bcInitiatives} onClose={handleClose} />
        )}
      </div>
    </Dialog>
  )
}
