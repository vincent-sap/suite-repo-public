import { useEffect, useRef, useState } from 'react'
import { Dialog, Button, Bar, Label, Input, TextArea } from '@ui5/webcomponents-react'
import type { InputDomRef, TextAreaDomRef } from '@ui5/webcomponents-react'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'

export interface CreateHierarchyDialogProps {
  open: boolean
  onCreated: (id: string) => void
  onCancel: () => void
}

export default function CreateHierarchyDialog({ open, onCreated, onCancel }: CreateHierarchyDialogProps) {
  const { createHierarchy } = useProcessLandscape()
  const nameRef = useRef<InputDomRef>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setTouched(false)
      const id = setTimeout(() => {
        const el = nameRef.current
        el?.focus()
        el?.shadowRoot?.querySelector('input')?.select()
      }, 80)
      return () => clearTimeout(id)
    }
  }, [open])

  const nameValid = name.trim() !== ''

  function handleCreate() {
    if (!nameValid) {
      setTouched(true)
      nameRef.current?.focus()
      return
    }
    const id = createHierarchy(name.trim(), description.trim())
    onCreated(id)
  }

  return (
    <Dialog
      open={open}
      headerText="Create Process Hierarchy"
      className="dialog-padding-s"
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!nameValid} onClick={handleCreate}>Create</Button>
              <Button design="Transparent" onClick={onCancel}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '24rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required>Name:</Label>
          <Input
            ref={nameRef}
            value={name}
            maxlength={120}
            placeholder="Provide hierarchy name"
            valueState={touched && !nameValid ? 'Negative' : 'None'}
            valueStateMessage={<span>Name must not be empty.</span>}
            onInput={(e) => setName((e.target as unknown as InputDomRef).value ?? '')}
            onBlur={() => setTouched(true)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label>Description:</Label>
          <TextArea
            value={description}
            maxlength={256}
            rows={3}
            placeholder="Describe this hierarchy (optional)"
            onInput={(e) => setDescription((e.target as unknown as TextAreaDomRef).value ?? '')}
          />
        </div>
      </div>
    </Dialog>
  )
}
