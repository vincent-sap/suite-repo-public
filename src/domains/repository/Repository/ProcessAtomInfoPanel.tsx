import { useRef, useState } from 'react'
import {
  Text, Icon, Button, Label, Input, Avatar, MultiComboBox, MultiComboBoxItem,
  SegmentedButton, SegmentedButtonItem, TextArea, MessageStrip, Dialog, Bar,
  IllustratedMessage,
  type DialogDomRef,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { SigRichTextEditor } from '@signavio/sap-signavio-uixtension/sig-rich-text-editor'
import type { SelectedAssetInfo } from '../AllResources'

export type ProcessAtomOwner = { id: string; name: string; email: string; avatarInitials: string; avatarColorScheme: string }
export type ProcessAtomExtension =
  | { type: 'Execution'; tools?: string; content?: string }
  | { type: 'PINT'; signalQuery?: string; targetValue?: number; content?: string }
  | { type: 'BPMN'; referenceUri?: string; content?: string }

// ── Description field ─────────────────────────────────────────────────────────

function DescriptionField({
  richText,
  plainText,
  canEdit,
}: {
  richText?: string
  plainText?: string
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(richText ?? plainText ?? '')
  const [saved, setSaved] = useState(richText ?? plainText ?? '')

  const hasContent = saved.trim().length > 0

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
        <Label style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
        <div style={{ border: '1px solid var(--sapField_BorderColor)', borderRadius: '4px', overflow: 'hidden', minHeight: '120px' }}>
          <SigRichTextEditor
            value={draft}
            onChange={(html: string) => setDraft(html)}
            isEditable={true}
            growing={true}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <Button design="Emphasized" onClick={() => { setSaved(draft); setEditing(false) }}>Save</Button>
          <Button design="Default" onClick={() => { setDraft(saved); setEditing(false) }}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
      <Label style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
      {hasContent ? (
        <div
          className="sig-richtext-view"
          style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.6', wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: saved }}
        />
      ) : (
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontStyle: 'italic' }}>—</Text>
      )}
      {canEdit && <Button design="Default" icon="edit" tooltip="Edit" style={{ marginTop: '4px', alignSelf: 'flex-start' }} onClick={() => setEditing(true)} />}
    </div>
  )
}

// ── Owner field ───────────────────────────────────────────────────────────────

const SAMPLE_OWNERS: ProcessAtomOwner[] = [
  { id: 'u-claire', name: 'Claire Westfield', email: 'claire.westfield@example.com', avatarInitials: 'CW', avatarColorScheme: '6' },
  { id: 'u-johan', name: 'Johan Weinstein', email: 'johan.weinstein@example.com', avatarInitials: 'JW', avatarColorScheme: '2' },
  { id: 'u-raj', name: 'Raj Patel', email: 'raj.patel@example.com', avatarInitials: 'RP', avatarColorScheme: '3' },
  { id: 'u-florence', name: 'Florence Meierbeer', email: 'florence.meierbeer@example.com', avatarInitials: 'FM', avatarColorScheme: '8' },
  { id: 'u-marcus', name: 'Marcus Holloway', email: 'marcus.holloway@example.com', avatarInitials: 'MH', avatarColorScheme: '1' },
]

function OwnerField({ initial, canEdit }: { initial?: ProcessAtomOwner; canEdit: boolean }) {
  const [owner, setOwner] = useState<ProcessAtomOwner | undefined>(initial)
  const [picking, setPicking] = useState(false)
  const [search, setSearch] = useState('')

  if (!owner && !canEdit) return null

  const filtered = SAMPLE_OWNERS.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
      <Label style={{ color: 'var(--sapContent_LabelColor)' }}>Owner</Label>

      {owner ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            initials={owner.avatarInitials}
            colorScheme={(owner.avatarColorScheme ?? '6') as any}
            size="XS"
            style={{ flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', fontWeight: '600' }}>
              {owner.name}
            </Text>
            <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
              {owner.email}
            </Text>
          </div>
          {canEdit && (
            <Button icon="decline" design="Default" tooltip="Remove owner"
              style={{ flexShrink: 0 }} onClick={() => setOwner(undefined)} />
          )}
        </div>
      ) : canEdit ? (
        <Button icon="add" design="Default" style={{ alignSelf: 'flex-start' }}
          onClick={() => { setSearch(''); setPicking(true) }}>
          Add Owner
        </Button>
      ) : null}

      {picking && (
        <div style={{
          border: '1px solid var(--sapHighlightColor)', borderRadius: '6px',
          padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px',
          background: 'var(--sapList_Background)', marginTop: '4px',
        }}>
          <Input
            placeholder="Search users…"
            value={search}
            onInput={(e: any) => setSearch(e.target?.value ?? '')}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(o => (
              <div
                key={o.id}
                onClick={() => { setOwner(o); setPicking(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 4px', cursor: 'pointer', borderRadius: '4px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_HoverBackground)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar initials={o.avatarInitials} colorScheme={o.avatarColorScheme as any} size="XS" />
                <div>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', fontWeight: '600', color: 'var(--sapTextColor)' }}>{o.name}</Text>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{o.email}</Text>
                </div>
              </div>
            ))}
          </div>
          <Button design="Transparent" onClick={() => setPicking(false)} style={{ alignSelf: 'flex-end' }}>Cancel</Button>
        </div>
      )}
    </div>
  )
}

// ── Tags field ────────────────────────────────────────────────────────────────

const ALL_TAG_OPTIONS = [
  'Finance', 'Accounts Payable', 'SAP S/4HANA', 'Procurement', 'Approval',
  'Logistics', 'Notifications', 'Customer Facing', 'Warehouse', 'Inventory',
  'SAP WM', 'Dispute Management', 'Sales', 'Human Resources', 'IT Operations',
]

function TagsField({ initial, canEdit }: { initial?: string[]; canEdit: boolean }) {
  const [tags, setTags] = useState<string[]>(initial ?? [])
  const [adding, setAdding] = useState(false)

  if (!canEdit && tags.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
      <Label style={{ color: 'var(--sapContent_LabelColor)' }}>Tags</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {tags.map(t => (
          canEdit ? (
            <SigChipV2
              key={t}
              value={t}
              endActionIcon="decline"
              onEndActionClick={() => setTags(prev => prev.filter(x => x !== t))}
            />
          ) : (
            <SigChipV2 key={t} value={t} />
          )
        ))}
        {canEdit && !adding && (
          <Button icon="add" design="Default" tooltip="Add tag" onClick={() => setAdding(true)} />
        )}
      </div>
      {adding && (
        <div style={{ marginTop: '4px' }}>
          <MultiComboBox
            style={{ width: '100%' }}
            onSelectionChange={(e: any) => {
              const items = (e.detail?.items ?? []) as Array<{ text?: string }>
              const selected = items.map((i: any) => i.text ?? '').filter(Boolean)
              setTags(selected)
            }}
          >
            {ALL_TAG_OPTIONS.map(opt => (
              <MultiComboBoxItem key={opt} text={opt} selected={tags.includes(opt)} />
            ))}
          </MultiComboBox>
          <Button design="Emphasized" style={{ marginTop: '6px' }} onClick={() => setAdding(false)}>Done</Button>
        </div>
      )}
    </div>
  )
}

// ── Extension helpers ─────────────────────────────────────────────────────────

type ExtType = 'Execution' | 'PINT' | 'BPMN'

function extensionStatus(ext: ProcessAtomExtension): 'positive' | 'error' | 'none' {
  if (ext.type === 'Execution') {
    return ext.tools?.trim() ? 'positive' : 'none'
  }
  if (ext.type === 'PINT') {
    const hasQuery = !!ext.signalQuery?.trim()
    const hasTarget = ext.targetValue !== undefined
    if (hasQuery && hasTarget) return 'positive'
    if (hasQuery || hasTarget) return 'error'
    return 'none'
  }
  return ext.referenceUri?.trim() ? 'positive' : 'none'
}

function contentLabel(type: ExtType): string {
  if (type === 'Execution') return 'Agent Instructions'
  if (type === 'PINT') return 'Notes'
  return 'Notes'
}

function contentPlaceholder(type: ExtType): string {
  if (type === 'Execution') return 'Describe the agent behavior, escalation paths, or special handling rules…'
  if (type === 'PINT') return 'Add any notes about this conformance check…'
  return 'Add any notes about this process model mapping…'
}

// ── Extension edit form ───────────────────────────────────────────────────────

function ExtensionEditForm({
  initial,
  existingTypes,
  onSave,
  onCancel,
}: {
  initial?: ProcessAtomExtension
  existingTypes: ExtType[]
  onSave: (ext: ProcessAtomExtension) => void
  onCancel: () => void
}) {
  const availableTypes: ExtType[] = (['Execution', 'PINT', 'BPMN'] as ExtType[]).filter(
    t => t === initial?.type || !existingTypes.includes(t)
  )
  const [type, setType] = useState<ExtType>(initial?.type ?? availableTypes[0])
  const [tools, setTools] = useState(initial?.type === 'Execution' ? (initial.tools ?? '') : '')
  const [signalQuery, setSignalQuery] = useState(initial?.type === 'PINT' ? (initial.signalQuery ?? '') : '')
  const [targetValue, setTargetValue] = useState(initial?.type === 'PINT' ? String(initial.targetValue ?? '0.95') : '0.95')
  const [referenceUri, setReferenceUri] = useState(initial?.type === 'BPMN' ? (initial.referenceUri ?? '') : '')
  const [content, setContent] = useState(initial?.content ?? '')

  const handleSave = () => {
    if (type === 'Execution') {
      onSave({ type: 'Execution', tools: tools.trim() || undefined, content: content.trim() || undefined })
    } else if (type === 'PINT') {
      const tv = parseFloat(targetValue)
      onSave({ type: 'PINT', signalQuery: signalQuery.trim() || undefined, targetValue: isNaN(tv) ? undefined : tv, content: content.trim() || undefined })
    } else {
      onSave({ type: 'BPMN', referenceUri: referenceUri.trim() || undefined, content: content.trim() || undefined })
    }
  }

  return (
    <div style={{
      border: '1px solid var(--sapGroup_ContentBorderColor)',
      borderRadius: 'var(--sapElement_BorderCornerRadius)',
      padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px',
      background: 'var(--sapList_Background)',
    }}>
      {!initial && (
        <div>
          <Label style={{ display: 'block', marginBottom: '6px', color: 'var(--sapContent_LabelColor)' }}>Extension Type</Label>
          <SegmentedButton
            onSelectionChange={(e: any) => {
              const selected = e.detail?.selectedItems?.[0]
              if (selected) setType(selected.textContent?.trim() as ExtType)
            }}
          >
            {availableTypes.map(t => (
              <SegmentedButtonItem key={t} selected={type === t}>{t}</SegmentedButtonItem>
            ))}
          </SegmentedButton>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '6px', display: 'block' }}>
            {type === 'Execution' ? 'Agent instructions and tool configuration' :
             type === 'PINT' ? 'Conformance checking with SIGNAL queries' :
             'Process model mapping'}
          </Text>
        </div>
      )}

      {type === 'Execution' && (
        <div>
          <Label showColon style={{ display: 'block', marginBottom: '4px', color: 'var(--sapContent_LabelColor)' }}>
            Tools <span style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 'normal', marginLeft: '4px' }}>(comma-separated)</span>
          </Label>
          <Input value={tools} placeholder="mcp:sap-ariba/purchase-orders, mcp:identity-service"
            onInput={(e: any) => setTools(e.target?.value ?? '')} style={{ width: '100%' }} />
        </div>
      )}
      {type === 'PINT' && (
        <>
          <div>
            <Label showColon style={{ display: 'block', marginBottom: '4px', color: 'var(--sapContent_LabelColor)' }}>SIGNAL Query</Label>
            <TextArea
              value={signalQuery}
              placeholder="SIGNAL MATCH ..."
              rows={4}
              growing
              style={{ width: '100%', fontFamily: 'monospace' }}
              onInput={(e: any) => setSignalQuery(e.target?.value ?? '')}
            />
          </div>
          <div>
            <Label showColon style={{ display: 'block', marginBottom: '4px', color: 'var(--sapContent_LabelColor)' }}>Target Value (0–1)</Label>
            <Input value={targetValue} placeholder="0.95"
              onInput={(e: any) => setTargetValue(e.target?.value ?? '')} style={{ width: '120px' }} />
          </div>
        </>
      )}
      {type === 'BPMN' && (
        <div>
          <Label showColon style={{ display: 'block', marginBottom: '4px', color: 'var(--sapContent_LabelColor)' }}>
            Reference URI <span style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 'normal', marginLeft: '4px' }}>(optional)</span>
          </Label>
          <Input value={referenceUri} placeholder="e.g., sig://model/abc123"
            onInput={(e: any) => setReferenceUri(e.target?.value ?? '')} style={{ width: '100%' }} />
        </div>
      )}

      <div>
        <Label showColon style={{ display: 'block', marginBottom: '4px', color: 'var(--sapContent_LabelColor)' }}>{contentLabel(type)}</Label>
        <TextArea
          value={content}
          placeholder={contentPlaceholder(type)}
          rows={3}
          growing
          style={{ width: '100%' }}
          onInput={(e: any) => setContent(e.target?.value ?? '')}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button design="Emphasized" onClick={handleSave}>Save</Button>
        <Button design="Default" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ── Delete confirmation dialog ────────────────────────────────────────────────

function DeleteExtensionDialog({
  extType,
  dialogRef,
  onConfirm,
  onCancel,
}: {
  extType: string
  dialogRef: React.RefObject<DialogDomRef | null>
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog
      ref={dialogRef}
      headerText="Remove Extension"
      state="Critical"
      className="dialog-padding-s"
    >
      <div style={{ padding: '1rem' }}>
        <Text>
          Remove the <strong>{extType}</strong> extension? This will delete its configuration and cannot be undone.
        </Text>
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Emphasized" onClick={onConfirm}>Remove</Button>
        <Button slot="endContent" design="Default" onClick={onCancel}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}

// ── Extension card view ───────────────────────────────────────────────────────

function ExtensionCardView({
  ext, canEdit, isEditing, onEdit, onDelete,
}: {
  ext: ProcessAtomExtension
  canEdit: boolean
  isEditing: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const deleteDialogRef = useRef<DialogDomRef>(null)
  const status = extensionStatus(ext)
  const label = ext.type

  const isPartialPint = ext.type === 'PINT' && status === 'error'

  if (isEditing) {
    return null
  }

  return (
    <div style={{
      border: '1px solid var(--sapGroup_ContentBorderColor)',
      borderRadius: 'var(--sapElement_BorderCornerRadius)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', cursor: 'pointer', background: 'var(--sapList_Background)' }}
        onClick={() => setExpanded(v => !v)}
      >
        <Icon name={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
          style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }} />
        <SigChipV2 value={label} design={status} condensed />
        {canEdit && (
          <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
            <Button icon="edit" design="Transparent" tooltip="Edit" onClick={onEdit}
              style={{ width: '2rem', height: '2rem', minWidth: '2rem', padding: 0 }} />
            <Button
              icon="delete"
              design="Transparent"
              tooltip="Remove"
              onClick={() => { if (deleteDialogRef.current) deleteDialogRef.current.open = true }}
              style={{ width: '2rem', height: '2rem', minWidth: '2rem', padding: 0 }}
            />
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--sapGroup_ContentBorderColor)' }}>
          {isPartialPint && (
            <MessageStrip
              design="Critical"
              hideCloseButton
              style={{ marginTop: '8px' }}
            >
              Incomplete configuration — both a SIGNAL query and a target value are required.
            </MessageStrip>
          )}
          {ext.type === 'Execution' && (
            <>
              {ext.tools && <LabeledValue label="Tools" mono>{ext.tools}</LabeledValue>}
              {ext.content && <LabeledValue label="Agent Instructions">{ext.content}</LabeledValue>}
            </>
          )}
          {ext.type === 'PINT' && (
            <>
              {ext.signalQuery && (
                <div style={{ marginTop: '8px' }}>
                  <Label style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '2px' }}>SIGNAL Query</Label>
                  <div style={{ background: 'var(--sapNeutralBackground)', border: '1px solid var(--sapGroup_ContentBorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', padding: '6px 8px', fontFamily: 'monospace', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {ext.signalQuery}
                  </div>
                </div>
              )}
              {ext.targetValue !== undefined && <LabeledValue label="Target Value">{String(ext.targetValue)}</LabeledValue>}
              {ext.content && <LabeledValue label="Notes">{ext.content}</LabeledValue>}
            </>
          )}
          {ext.type === 'BPMN' && (
            <>
              {ext.referenceUri && <LabeledValue label="Reference URI" mono>{ext.referenceUri}</LabeledValue>}
              {ext.content && <LabeledValue label="Notes">{ext.content}</LabeledValue>}
            </>
          )}
        </div>
      )}

      <DeleteExtensionDialog
        extType={ext.type}
        dialogRef={deleteDialogRef}
        onConfirm={() => {
          if (deleteDialogRef.current) deleteDialogRef.current.open = false
          onDelete?.()
        }}
        onCancel={() => {
          if (deleteDialogRef.current) deleteDialogRef.current.open = false
        }}
      />
    </div>
  )
}

function LabeledValue({ label, children, mono }: { label: string; children: string; mono?: boolean }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <Label style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '6px' }}>{label}</Label>
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : undefined }}>
        {children}
      </Text>
    </div>
  )
}

// ── Extensions section ────────────────────────────────────────────────────────

function ExtensionsSection({ initial, canEdit }: { initial?: ProcessAtomExtension[]; canEdit: boolean }) {
  const [extensions, setExtensions] = useState<ProcessAtomExtension[]>(initial ?? [])
  // editingIndex: number = editing existing at that index; 'new' = adding; null = none
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null)

  const existingTypes = extensions.map(e => e.type) as ExtType[]
  const allTypesAdded = existingTypes.length === 3

  if (!canEdit && extensions.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '4px' }}>
        <Text style={{ flex: 1, fontSize: 'var(--sapFontSmallSize)', fontWeight: '700', color: 'var(--sapContent_LabelColor)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Extensions
        </Text>
        {canEdit && !allTypesAdded && editingIndex !== 'new' && (
          <Button icon="add" design="Default" tooltip="Add extension" onClick={() => setEditingIndex('new')} />
        )}
      </div>

      {extensions.length === 0 && editingIndex !== 'new' && (
        <IllustratedMessage
          name="NoData"
          design="Spot"
          titleText="No extensions"
          subtitleText="Extensions let you use this atom for specific use cases, such as BPMN modeling or conformance checking in process analysis."
          style={{ padding: '0.5rem 0' }}
        >
          <Button design="Emphasized" onClick={() => setEditingIndex('new')}>Add Extension</Button>
        </IllustratedMessage>
      )}

      {extensions.map((ext, i) => (
        <div key={i}>
          <ExtensionCardView
            ext={ext}
            canEdit={canEdit}
            isEditing={editingIndex === i}
            onEdit={() => setEditingIndex(i)}
            onDelete={() => {
              setExtensions(prev => prev.filter((_, j) => j !== i))
              if (editingIndex === i) setEditingIndex(null)
            }}
          />
          {editingIndex === i && (
            <ExtensionEditForm
              initial={ext}
              existingTypes={existingTypes.filter((_, j) => j !== i)}
              onSave={(updated) => {
                setExtensions(prev => prev.map((e, j) => j === i ? updated : e))
                setEditingIndex(null)
              }}
              onCancel={() => setEditingIndex(null)}
            />
          )}
        </div>
      ))}

      {editingIndex === 'new' && (
        <ExtensionEditForm
          existingTypes={existingTypes}
          onSave={(newExt) => { setExtensions(prev => [...prev, newExt]); setEditingIndex(null) }}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  asset: SelectedAssetInfo
}

export default function ProcessAtomInfoPanel({ asset }: Props) {
  const canEdit = asset.canEdit ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <DescriptionField
        richText={asset.richTextDescription}
        plainText={asset.description}
        canEdit={canEdit}
      />
      <OwnerField initial={asset.owner} canEdit={canEdit} />
      <TagsField initial={asset.tags} canEdit={canEdit} />
      <ExtensionsSection initial={asset.extensions} canEdit={canEdit} />
    </div>
  )
}
