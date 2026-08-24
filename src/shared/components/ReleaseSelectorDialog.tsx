import { useState, useEffect } from 'react'
import { Dialog, Button, Bar, RadioButton, Text } from '@ui5/webcomponents-react'
import { RELEASES } from '../../releases'
import type { Release } from '../../releases'
import { useRelease } from '../../contexts/ReleaseContext'

type Props = {
  open: boolean
  onClose: () => void
}

export default function ReleaseSelectorDialog({ open, onClose }: Props) {
  const { currentRelease, setCurrentRelease } = useRelease()
  const [selected, setSelected] = useState<Release>(currentRelease)

  // Sync local selection when dialog opens
  useEffect(() => {
    if (open) setSelected(currentRelease)
  }, [open, currentRelease])

  function handleApply() {
    setCurrentRelease(selected)
    onClose()
  }

  return (
    <Dialog
      open={open}
      headerText="Release Scope"
      onClose={onClose}
      style={{ width: '22rem' }}
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
          Select the release scope to preview features available up to and including that release.
        </Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.25rem' }}>
          {RELEASES.map(r => (
            <div key={r.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <RadioButton
                name="releaseScope"
                text={r.label}
                checked={selected === r.id}
                onChange={() => setSelected(r.id)}
              />
              <div>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                  {r.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Bar slot="footer">
        <Button slot="endContent" design="Emphasized" onClick={handleApply}>
          Apply
        </Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>
          Cancel
        </Button>
      </Bar>
    </Dialog>
  )
}
