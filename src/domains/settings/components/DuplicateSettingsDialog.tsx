import { useState, useEffect } from 'react'
import {
  Dialog, Button, Bar, Label, CheckBox, MessageStrip,
  MultiComboBox, MultiComboBoxItem, Text,
} from '@ui5/webcomponents-react'
import { useWorkspace } from '../../../contexts/WorkspaceContext'

const SETTING_CATEGORIES = [
  'Theming',
  'Navigation',
  'Collaboration',
  'Home Page',
  'Fact Sheet',
  'Asset Types',
  'Attribute Overlays',
]

interface Props {
  open: boolean
  sourceAudience: string
  onClose: () => void
  onDuplicate: (targetAudiences: string[], categories: string[]) => void
}

export function DuplicateSettingsDialog({ open, sourceAudience, onClose, onDuplicate }: Props) {
  const { audiences } = useWorkspace()
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setSelectedAudiences([])
    setSelectedCategories([])
  }, [open])

  const targetAudiences = audiences.filter(a => a.name !== sourceAudience)

  const handleAudienceChange = (e: CustomEvent) => {
    const items = (e.target as HTMLElement).querySelectorAll('ui5-mcb-item[selected]')
    setSelectedAudiences(Array.from(items).map(el => el.getAttribute('text') ?? '').filter(Boolean))
  }

  const toggleCategory = (cat: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, cat] : prev.filter(c => c !== cat)
    )
  }

  const canSubmit = selectedAudiences.length > 0 && selectedCategories.length > 0

  return (
    <Dialog
      open={open}
      headerText={`Copy Audience Settings from "${sourceAudience}"`}
      style={{ width: '26rem' }}
      onClose={onClose}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!canSubmit} onClick={() => onDuplicate(selectedAudiences, selectedCategories)}>
                Duplicate
              </Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Text>
          Copying applies the audience settings from <strong>{sourceAudience}</strong> to other
          audiences. This is a one-time copy, later changes to {sourceAudience} won’t be applied.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required>Target Audiences:</Label>
          <MultiComboBox
            placeholder="Select audiences"
            style={{ width: '100%' }}
            onSelectionChange={handleAudienceChange}
          >
            {targetAudiences.map(a => (
              <MultiComboBoxItem key={a.id} text={a.name} selected={selectedAudiences.includes(a.name)} />
            ))}
          </MultiComboBox>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required>Setting Categories:</Label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SETTING_CATEGORIES.map(cat => (
              <CheckBox
                key={cat}
                text={cat}
                checked={selectedCategories.includes(cat)}
                onChange={e => toggleCategory(cat, (e.target as unknown as { checked: boolean }).checked)}
              />
            ))}
          </div>
        </div>

        <MessageStrip design="Critical" hideCloseButton>
          The existing settings of the checked categories will be overwritten for the selected target audiences.
        </MessageStrip>
      </div>
    </Dialog>
  )
}
