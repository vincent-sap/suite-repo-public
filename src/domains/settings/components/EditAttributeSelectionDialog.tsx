import { useState, useEffect } from 'react'
import {
  Dialog, Button, Bar, Label, Input, TextArea, Select, Option,
  CheckBox, Icon, FlexBox, Text, MultiComboBox, MultiComboBoxItem,
} from '@ui5/webcomponents-react'

type SelectionOption = {
  id: string
  label: string
  color: string
  isDefault: boolean
}

const OPTION_COLORS = [
  '#4CAF50', // green
  '#FF9800', // orange
  '#F44336', // red
  '#2196F3', // blue
  '#9C27B0', // purple
  '#607D8B', // grey-blue
]

const ALL_ASSET_TYPES = ['Objective', 'KPI', 'Risk', 'Process', 'Initiative', 'Capability']

export type AttributeSelectionData = {
  name: string
  description: string
  options: SelectionOption[]
  allowMultiple: boolean
  readOnly: boolean
  assignedTo: string[]
}

interface Props {
  open: boolean
  initialData?: Partial<AttributeSelectionData>
  onClose: () => void
  onSave: (data: AttributeSelectionData) => void
}

function makeOption(label: string, color = OPTION_COLORS[0]): SelectionOption {
  return { id: `opt-${Date.now()}-${Math.random()}`, label, color, isDefault: false }
}

export function EditAttributeSelectionDialog({ open, initialData, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<SelectionOption[]>([])
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [assignedTo, setAssignedTo] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setName(initialData?.name ?? '')
    setDescription(initialData?.description ?? '')
    setOptions(initialData?.options ?? [
      makeOption('Low', OPTION_COLORS[0]),
      makeOption('Medium', OPTION_COLORS[1]),
      makeOption('High', OPTION_COLORS[2]),
    ])
    setAllowMultiple(initialData?.allowMultiple ?? false)
    setReadOnly(initialData?.readOnly ?? false)
    setAssignedTo(initialData?.assignedTo ?? ['Objective'])
    setNewOptionLabel('')
    setNameTouched(false)
  }, [open])

  const addOption = () => {
    const label = newOptionLabel.trim()
    if (!label) return
    setOptions(prev => [...prev, makeOption(label, OPTION_COLORS[prev.length % OPTION_COLORS.length])])
    setNewOptionLabel('')
  }

  const updateOptionLabel = (id: string, label: string) =>
    setOptions(prev => prev.map(o => o.id === id ? { ...o, label } : o))

  const cycleColor = (id: string) =>
    setOptions(prev => prev.map(o => {
      if (o.id !== id) return o
      const idx = OPTION_COLORS.indexOf(o.color)
      return { ...o, color: OPTION_COLORS[(idx + 1) % OPTION_COLORS.length] }
    }))

  const toggleDefault = (id: string) =>
    setOptions(prev => prev.map(o => ({ ...o, isDefault: o.id === id ? !o.isDefault : o.isDefault })))

  const moveOption = (id: string, dir: -1 | 1) =>
    setOptions(prev => {
      const idx = prev.findIndex(o => o.id === id)
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]]
      return next
    })

  const removeOption = (id: string) =>
    setOptions(prev => prev.filter(o => o.id !== id))

  const handleSave = () => {
    if (!name.trim()) { setNameTouched(true); return }
    onSave({ name: name.trim(), description, options, allowMultiple, readOnly, assignedTo })
  }

  const nameInvalid = nameTouched && !name.trim()

  return (
    <Dialog
      open={open}
      headerText="Edit Attribute"
      style={{ width: '32rem' }}
      onClose={onClose}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" onClick={handleSave}>Save Changes</Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem' }}>

        {/* Attribute Type */}
        <div>
          <Label required>Attribute Type</Label>
          <Select style={{ width: '100%', marginTop: '0.25rem' }}>
            <Option selected>Selection</Option>
            <Option>Single-line Text</Option>
            <Option>Multi-line Text</Option>
            <Option>Number</Option>
            <Option>Date</Option>
            <Option>User</Option>
            <Option>Asset Link</Option>
          </Select>
        </div>

        {/* Name + Description box */}
        <div style={{
          border: '1px solid var(--sapField_BorderColor)',
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          padding: '0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <div>
            <Label for="edit-attr-name" required style={{ display: 'block', marginBottom: '0.25rem' }}>Attribute Name:</Label>
            <Input
              id="edit-attr-name"
              value={name}
              placeholder="Enter here"
              valueState={nameInvalid ? 'Negative' : 'None'}
              valueStateMessage={<span>Name must not be empty.</span>}
              style={{ width: '100%' }}
              onInput={e => setName((e.target as unknown as HTMLInputElement).value)}
              onBlur={() => setNameTouched(true)}
            />
          </div>
          <div>
            <Label for="edit-attr-desc" style={{ display: 'block', marginBottom: '0.25rem' }}>Description:</Label>
            <TextArea
              id="edit-attr-desc"
              value={description}
              placeholder=""
              rows={3}
              style={{ width: '100%' }}
              onInput={e => setDescription((e.target as unknown as HTMLTextAreaElement).value)}
            />
          </div>

          {/* Options list */}
          <div>
            <Label required style={{ display: 'block', marginBottom: '0.25rem' }}>Options:</Label>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Input
                value={newOptionLabel}
                placeholder="Enter here"
                style={{ flex: 1 }}
                onInput={e => setNewOptionLabel((e.target as unknown as HTMLInputElement).value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') addOption() }}
              />
              <Button design="Transparent" icon="add" onClick={addOption} />
            </FlexBox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {options.map((opt, idx) => (
                <FlexBox key={opt.id} alignItems="Center" style={{ gap: '0.375rem' }}>
                  <Input
                    value={opt.label}
                    style={{ flex: 1 }}
                    onInput={e => updateOptionLabel(opt.id, (e.target as unknown as HTMLInputElement).value)}
                  />
                  {/* Color swatch */}
                  <Button
                    tooltip="Change color"
                    accessibleName="Change color"
                    design="Transparent"
                    onClick={() => cycleColor(opt.id)}
                    style={{
                      width: '1.25rem', height: '1.25rem', minWidth: 'unset', borderRadius: '50%',
                      background: opt.color, border: '2px solid var(--sapField_BorderColor)',
                      flexShrink: 0, padding: 0,
                    }}
                  />
                  {/* Default star */}
                  <Icon
                    name={opt.isDefault ? 'favorite' : 'unfavorite'}
                    accessibleName={opt.isDefault ? 'Remove as default' : 'Set as default'}
                    title={opt.isDefault ? 'Remove as default' : 'Set as default'}
                    style={{
                      color: opt.isDefault ? 'var(--sapIndicationColor_5)' : 'var(--sapContent_NonInteractiveIconColor)',
                      cursor: 'pointer', fontSize: '1rem', flexShrink: 0,
                    }}
                    onClick={() => toggleDefault(opt.id)}
                  />
                  <Icon
                    name="navigation-up-arrow"
                    accessibleName="Move up"
                    title="Move up"
                    style={{ color: idx === 0 ? 'var(--sapButton_Disabled_TextColor)' : 'var(--sapContent_IconColor)', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '1rem', flexShrink: 0 }}
                    onClick={() => idx > 0 && moveOption(opt.id, -1)}
                  />
                  <Icon
                    name="navigation-down-arrow"
                    accessibleName="Move down"
                    title="Move down"
                    style={{ color: idx === options.length - 1 ? 'var(--sapButton_Disabled_TextColor)' : 'var(--sapContent_IconColor)', cursor: idx === options.length - 1 ? 'default' : 'pointer', fontSize: '1rem', flexShrink: 0 }}
                    onClick={() => idx < options.length - 1 && moveOption(opt.id, 1)}
                  />
                  <Icon
                    name="delete"
                    accessibleName="Remove option"
                    title="Remove option"
                    style={{ color: 'var(--sapContent_IconColor)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
                    onClick={() => removeOption(opt.id)}
                  />
                </FlexBox>
              ))}
              {options.length === 0 && (
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                  No options yet. Add one above.
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' }}>Settings</Text>
          <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <CheckBox
                checked={allowMultiple}
                onChange={e => setAllowMultiple((e.target as unknown as HTMLInputElement).checked)}
                accessibleName="Allow multiple selections"
              />
              <Label>Allow multiple selections</Label>
              <Icon
                name="hint"
                title="Users can select more than one value for this attribute"
                style={{ color: 'var(--sapInformativeElementColor)', fontSize: '1rem', cursor: 'default' }}
              />
            </FlexBox>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <CheckBox
                checked={readOnly}
                onChange={e => setReadOnly((e.target as unknown as HTMLInputElement).checked)}
                accessibleName="Set as read only"
              />
              <Label>Set as read only</Label>
            </FlexBox>
          </FlexBox>
        </div>

        {/* Usage */}
        <div>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' }}>Usage</Text>
          <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Assign Attribute to:</Label>
          <MultiComboBox
            style={{ width: '100%' }}
            onSelectionChange={e => {
              const items = (e.detail as any).items as Array<{ text: string }>
              setAssignedTo(items.map(i => i.text))
            }}
          >
            {ALL_ASSET_TYPES.map(t => (
              <MultiComboBoxItem key={t} text={t} selected={assignedTo.includes(t)} />
            ))}
          </MultiComboBox>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.375rem', display: 'block' }}>
            If nothing is selected, the attribute will be created unassigned. You can assign it later.
          </Text>
        </div>

      </div>
    </Dialog>
  )
}
