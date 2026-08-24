import { useState, useEffect, useRef } from 'react'
import {
  Dialog, Button, Bar, Input, Label,
  Select, Option, CheckBox, MessageStrip,
  ComboBox, ComboBoxItem, ColorPalettePopover, ColorPaletteItem,
} from '@ui5/webcomponents-react'
import type { DictCategory, DictCategoryType } from '../../../contexts/WorkspaceContext'

interface Props {
  open: boolean
  categories: DictCategory[]
  editCategory?: DictCategory
  initialParentId?: string
  onClose: () => void
  onAdd: (name: string, parentId?: string, color?: string, type?: DictCategoryType) => void
  onEdit?: (id: string, patch: Partial<Omit<DictCategory, 'id'>>) => void
}

const DEFAULT_COLOR = '#a45d00'

const CATEGORY_TYPE_OPTIONS: { value: DictCategoryType; icon: string }[] = [
  { value: 'Activity',      icon: 'SAP-icons-v4/activity' },
  { value: 'Control',       icon: 'SAP-icons-v4/overlay-risk-control' },
  { value: 'Document',      icon: 'document' },
  { value: 'Event',         icon: 'SAP-icons-v4/start-event' },
  { value: 'Goal',          icon: 'goal' },
  { value: 'IT System',     icon: 'SAP-icons-v4/computer' },
  { value: 'Organization',  icon: 'SAP-icons-v4/organization' },
  { value: 'Requirement',   icon: 'checklist' },
  { value: 'Risk',          icon: 'SAP-icons-v4/risk' },
  { value: 'Others',        icon: 'course-book' },
  { value: 'Processes',     icon: 'SAP-icons-v4/process-manager' },
]

interface FlatNode { id: string; name: string; depth: number }

function flattenTree(categories: DictCategory[], excludeId?: string): FlatNode[] {
  const childrenOf = new Map<string | undefined, DictCategory[]>()
  for (const c of categories) {
    if (c.id === excludeId) continue
    const key = c.parentId
    if (!childrenOf.has(key)) childrenOf.set(key, [])
    childrenOf.get(key)!.push(c)
  }
  const result: FlatNode[] = []
  function walk(parentId: string | undefined, depth: number) {
    for (const c of childrenOf.get(parentId) ?? []) {
      result.push({ id: c.id, name: c.name, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(undefined, 0)
  return result
}

export function AddDictionaryCategoryDialog({ open, categories, editCategory, initialParentId, onClose, onAdd, onEdit }: Props) {
  const isEditing = Boolean(editCategory)

  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [parentSearch, setParentSearch] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const colorBtnId = useRef(`color-btn-${Math.random().toString(36).slice(2)}`).current
  const [typeOfCategory, setTypeOfCategory] = useState<DictCategoryType>('Others')
  const [useForDataModelling, setUseForDataModelling] = useState(false)
  const [useForVariantManagement, setUseForVariantManagement] = useState(false)
  const [publishingMode, setPublishingMode] = useState('Automatically')
  const [linkingDiagrams, setLinkingDiagrams] = useState('Updated automatically')

  useEffect(() => {
    if (!open) return
    if (editCategory) {
      setName(editCategory.name)
      setParentId(editCategory.parentId)
      setParentSearch(editCategory.parentId ? (categories.find(c => c.id === editCategory.parentId)?.name ?? '') : '')
      setColor(editCategory.color)
    } else {
      setName('')
      setParentId(initialParentId)
      setParentSearch(initialParentId ? (categories.find(c => c.id === initialParentId)?.name ?? '') : '')
      setColor(DEFAULT_COLOR)
    }
    setNameTouched(false)
    setTypeOfCategory(editCategory?.type ?? 'Others')
    setUseForDataModelling(false)
    setUseForVariantManagement(false)
    setPublishingMode('Automatically')
    setLinkingDiagrams('Updated automatically')
  }, [open, editCategory, initialParentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const nodes = flattenTree(categories, editCategory?.id)

  const handleSubmit = () => {
    if (!name.trim()) { setNameTouched(true); return }
    if (isEditing && onEdit && editCategory) {
      onEdit(editCategory.id, { name: name.trim(), parentId, color, type: typeOfCategory })
    } else {
      onAdd(name.trim(), parentId, color, typeOfCategory)
    }
  }

  return (
    <Dialog
      open={open}
      headerText={isEditing ? 'Edit Dictionary Category' : 'Create Dictionary Category'}
      className="ui5-content-density-compact"
      style={{ width: '34rem' }}
      onClose={onClose}
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
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Info strip */}
        <MessageStrip design="Information" hideCloseButton>
          Once Variant Management is selected, publishing mode and linking diagrams are set to automatically.
        </MessageStrip>

        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label for="dict-cat-name" required showColon>Name</Label>
          <Input
            id="dict-cat-name"
            value={name}
            placeholder="Enter name"
            valueState={nameTouched && !name.trim() ? 'Negative' : 'None'}
            valueStateMessage={<span>Enter a name.</span>}
            onInput={e => setName((e.target as unknown as HTMLInputElement).value)}
            onBlur={() => setNameTouched(true)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Parent Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label showColon>Parent Category</Label>
          <ComboBox
            placeholder="Select"
            value={parentSearch}
            style={{ width: '100%' }}
            onInput={e => setParentSearch((e.target as unknown as HTMLInputElement).value)}
            onChange={e => {
              const val = (e.target as unknown as HTMLInputElement).value
              const found = nodes.find(n => n.name === val)
              setParentId(found?.id)
              setParentSearch(found?.name ?? '')
            }}
          >
            {nodes.map(node => (
              <ComboBoxItem key={node.id} text={node.name} />
            ))}
          </ComboBox>
        </div>

        {/* Type of Category + Color — side by side */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="dict-cat-type" required showColon>Type of Category</Label>
            <Select
              id="dict-cat-type"
              style={{ width: '100%' }}
              onChange={e => setTypeOfCategory((e.target as unknown as { value: string }).value as DictCategoryType)}
            >
              {CATEGORY_TYPE_OPTIONS.map(({ value: v, icon }) => (
                <Option key={v} icon={icon} selected={typeOfCategory === v}>{v}</Option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label required showColon>Color</Label>
            <div
              id={colorBtnId}
              role="button"
              tabIndex={0}
              aria-label="Change color"
              onClick={() => setColorPickerOpen(true)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setColorPickerOpen(true) } }}
              style={{
                width: 'var(--sapElement_Compact_Height)',
                height: 'var(--sapElement_Compact_Height)',
                borderRadius: '0.25rem',
                background: color,
                border: '1px solid var(--sapField_BorderColor)',
                cursor: 'pointer',
              }}
              title="Select a New Color"
            />
            <ColorPalettePopover
              open={colorPickerOpen}
              opener={colorBtnId}
              placement="Bottom"
              onItemClick={e => { e.stopPropagation(); setColor((e.detail as { color: string }).color); setColorPickerOpen(false) }}
              onClose={e => { e.stopPropagation(); setColorPickerOpen(false) }}
            >
              {['#a45d00','#aa0808','#ba066c','#a100c2','#552cff',
                '#0057d2','#046c7a','#256f3a','#6c32a9','#556b82'].map(c => (
                <ColorPaletteItem key={c} value={c} selected={c === color} />
              ))}
            </ColorPalettePopover>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <CheckBox
            text="Use for Data Modelling"
            checked={useForDataModelling}
            onChange={e => setUseForDataModelling((e.target as unknown as { checked: boolean }).checked)}
          />
          <CheckBox
            text="Use for Variant Management"
            checked={useForVariantManagement}
            onChange={e => {
              const checked = (e.target as unknown as { checked: boolean }).checked
              setUseForVariantManagement(checked)
              if (checked) {
                setPublishingMode('Automatically')
                setLinkingDiagrams('Updated automatically')
              }
            }}
          />
        </div>

        {/* Publishing Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label for="dict-cat-publishing" required showColon>Publishing Mode</Label>
          <Select
            id="dict-cat-publishing"
            style={{ width: '100%' }}
            disabled={useForVariantManagement}
            onChange={e => setPublishingMode((e.target as unknown as { value: string }).value)}
          >
            {['Automatically', 'Manually'].map(opt => (
              <Option key={opt} selected={publishingMode === opt}>{opt}</Option>
            ))}
          </Select>
        </div>

        {/* On change, linking diagrams are */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label for="dict-cat-linking" required showColon>On change, linking diagrams are</Label>
          <Select
            id="dict-cat-linking"
            style={{ width: '100%' }}
            disabled={useForVariantManagement}
            onChange={e => setLinkingDiagrams((e.target as unknown as { value: string }).value)}
          >
            {['Updated automatically', 'Revoked'].map(opt => (
              <Option key={opt} selected={linkingDiagrams === opt}>{opt}</Option>
            ))}
          </Select>
        </div>

      </div>
    </Dialog>
  )
}
