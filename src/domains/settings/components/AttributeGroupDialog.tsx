import { useState, useEffect } from 'react'
import { Dialog, Button, Bar, Input, Label, Text } from '@ui5/webcomponents-react'

interface Props {
  open: boolean
  editName?: string
  onClose: () => void
  onConfirm: (name: string) => void
}

export function AttributeGroupDialog({ open, editName, onClose, onConfirm }: Props) {
  const isEditing = editName !== undefined
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(isEditing ? editName : '')
    setTouched(false)
  }, [open, editName, isEditing])

  const handleSubmit = () => {
    if (!name.trim()) { setTouched(true); return }
    onConfirm(name.trim())
  }

  return (
    <Dialog
      open={open}
      className="ui5-content-density-compact"
      style={{ width: '22rem' }}
      onClose={onClose}
      header={
        <Bar design="Header" style={{ width: '100%' }}>
          <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)' }}>
            {isEditing ? 'Edit Attribute Group' : 'Create Attribute Group'}
          </Text>
        </Bar>
      }
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" onClick={handleSubmit} disabled={!name.trim()}>
                {isEditing ? 'Save' : 'Create'}
              </Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem' }}>
        <Label for="attr-group-name" required>Group Name</Label>
        <Input
          id="attr-group-name"
          value={name}
          placeholder="Enter here"
          valueState={touched && !name.trim() ? 'Negative' : 'None'}
          valueStateMessage={<span>Name must not be empty.</span>}
          style={{ width: '100%', marginTop: '0.25rem' }}
          onInput={e => setName((e.target as unknown as HTMLInputElement).value)}
          onBlur={() => setTouched(true)}
        />
      </div>
    </Dialog>
  )
}
