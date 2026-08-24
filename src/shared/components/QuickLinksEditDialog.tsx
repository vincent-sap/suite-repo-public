import { useEffect, useId, useRef, useState } from 'react'
import { Dialog, Button, Bar, Label, Input, Select, OptionCustom, Icon, TextArea, MessageBox } from '@ui5/webcomponents-react'
import type { InputDomRef, TextAreaDomRef } from '@ui5/webcomponents-react'
import type { QuickLinkItem } from '../../domains/home/widgets/QuickLinksWidget'
import { QuickLinksWidget } from '../../domains/home/widgets/QuickLinksWidget'
import './QuickLinksEditDialog.css'

const MAX_QUICK_LINKS = 6

const ICON_OPTIONS: { icon: string; label: string; keywords: string }[] = [
  { icon: 'attachment',                    label: 'Attachment',    keywords: 'document, paper clip' },
  { icon: 'SAP-icons-v4/process-manager',  label: 'BPMN Diagram',  keywords: 'model, process' },
  { icon: 'date-time',                     label: 'Calendar',      keywords: 'date, time, clock, appointments' },
  { icon: 'chain-link',                    label: 'Chain',         keywords: 'link, hyperlink' },
  { icon: 'discussion-2',                  label: 'Chat',          keywords: 'comment, community' },
  { icon: 'cloud',                         label: 'Cloud',         keywords: 'database, online, server' },
  { icon: 'document-text',                 label: 'Document',      keywords: 'file, paper, page, text' },
  { icon: 'SAP-icons-v4/link',             label: 'External link', keywords: 'forward, options' },
  { icon: 'folder-blank',                  label: 'Folder',        keywords: 'content, directory, repository' },
  { icon: 'message-information',           label: 'Information',   keywords: 'info, message, notifications, status' },
  { icon: 'learning-assistant',            label: 'Manual',        keywords: 'book, course, instructions, tutorial' },
  { icon: 'SAP-icons-v4/news',             label: 'News',          keywords: 'headlines, latest, updates' },
  { icon: 'org-chart',                     label: 'Org Chart',     keywords: 'chart, organization, overview, tree' },
  { icon: 'SAP-icons-v4/organization',     label: 'Organization',  keywords: 'company, building, headquarter' },
  { icon: 'picture',                       label: 'Picture',       keywords: 'image, photograph' },
  { icon: 'play',                          label: 'Play',          keywords: 'start, media, video' },
  { icon: 'sys-monitor',                   label: 'Screen',        keywords: 'monitor, tv, computer' },
  { icon: 'search',                        label: 'Search',        keywords: 'magnifying glass, find' },
  { icon: 'action-settings',              label: 'Settings',      keywords: 'cogwheel, gear, configure, customize' },
  { icon: 'validate',                      label: 'Shield',        keywords: 'security, approve, validate' },
  { icon: 'task',                          label: 'Task',          keywords: 'checklist, clipboard, to-do list' },
  { icon: 'study-leave',                   label: 'Tutorial',      keywords: 'training, learning, study' },
  { icon: 'group',                         label: 'User group',    keywords: 'audience, customers, team, community' },
  { icon: 'person-placeholder',            label: 'User',          keywords: 'person, avatar, customer, profile' },
  { icon: 'world',                         label: 'World',         keywords: 'geographical, global, international, internet' },
]

function defaultItem(): QuickLinkItem {
  return { icon: 'SAP-icons-v4/link', title: 'New Link', description: '', url: '' }
}

function isValidUrl(url: string): boolean {
  const normalised = /^www\./i.test(url) ? 'https://' + url : url  // adds https:// to bare www. input
  const wwwHost  = /^https?:\/\/www\.[^\s.]+\.[^\s]+/i // valid URL with www. host
  const plainHost = /^https?:\/\/[^\s/.]+\.[^\s]+/i // valid URL without www. host
  // if URL starts with http(s)://www. → apply wwwHost check, otherwise plainHost check
  return /^https?:\/\/www\./i.test(normalised) ? wwwHost.test(normalised) : plainHost.test(normalised)
}

// Non-blocking soft warning: URL passed isValidUrl but fails a stricter structural check,
// or contains characters that are invalid in a URL per RFC 3986.
const SUSPICIOUS_URL_RE = /^https?:\/\/(-\.)?([^\s/?\.#-]+\.?)+([/?#][^\s]*)?$/i

// ASCII chars excluded by RFC 3986 that are never valid unencoded in a URL.
const INVALID_URL_CHARS_RE = /[{}|\\^`"<>\s]/

// Non-ASCII chars (Unicode letters, emoji…) are legitimate IDNA input but require
// Punycode conversion — flag as suspicious so the user is aware.
const NON_ASCII_RE = /[^\x00-\x7F]/

function isSuspiciousUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  if (INVALID_URL_CHARS_RE.test(url)) return true
  if (NON_ASCII_RE.test(url)) return true
  const normalised = url.startsWith('www.') ? 'https://' + url : url
  return !SUSPICIOUS_URL_RE.test(normalised)
}

function isListValid(items: QuickLinkItem[]): boolean {
  return items.length > 0 && items.every(i => i.title.trim() !== '' && isValidUrl(i.url))
}

function isDraftValid(item: QuickLinkItem): boolean {
  return item.title.trim() !== '' && isValidUrl(item.url)
}

export interface QuickLinksEditDialogProps {
  open: boolean
  mode: 'add' | 'edit'
  initialItems?: QuickLinkItem[]
  initialTitle?: string
  onAdd: (items: QuickLinkItem[]) => void
  onSave: (items: QuickLinkItem[]) => void
  onBack: () => void
  onCancel: () => void
}

export function QuickLinksEditDialog({ open, mode, initialItems, initialTitle, onAdd, onSave, onBack, onCancel }: QuickLinksEditDialogProps) {
  const dialogId = useId()
  const nameInputRef = useRef<InputDomRef>(null)
  const urlTextAreaRef = useRef<TextAreaDomRef>(null)

  const [items, setItems] = useState<QuickLinkItem[]>([defaultItem()])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [urlTouched, setUrlTouched] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const pendingAction = useRef<'cancel' | 'back' | null>(null)

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      const initial = initialItems && initialItems.length > 0 ? initialItems.map(i => ({ ...i })) : [defaultItem()]
      setItems(initial)
      setSelectedIndex(0)
      setIsDirty(false)
      setFormTouched(false)
      setNameTouched(false)
      setUrlTouched(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset per-field touched flags when switching to a different item
  useEffect(() => {
    setNameTouched(false)
    setUrlTouched(false)
  }, [selectedIndex])

  // Pre-select the Name input text when selectedIndex changes or dialog opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        const el = nameInputRef.current
        if (el) {
          el.focus()
          const inner = el.shadowRoot?.querySelector('input')
          inner?.select()
        }
      }, 80)
      return () => clearTimeout(id)
    }
  }, [open, selectedIndex])

  const draft = items[selectedIndex] ?? defaultItem()

  function updateDraft(patch: Partial<QuickLinkItem>) {
    setIsDirty(true)
    setItems(prev => prev.map((item, i) => i === selectedIndex ? { ...item, ...patch } : item))
  }

  function tryNavigate(action: () => void) {
    if (!isDraftValid(draft)) {
      setFormTouched(true)
      setNameTouched(true)
      setUrlTouched(true)
      if (draft.title.trim() === '') nameInputRef.current?.focus()
      else urlTextAreaRef.current?.focus()
      return
    }
    setFormTouched(false)
    setNameTouched(false)
    setUrlTouched(false)
    action()
  }

  function handleAdd() {
    setIsDirty(true)
    const newItem = defaultItem()
    setItems(prev => [...prev, newItem])
    setSelectedIndex(items.length)
  }

  function handleDuplicate() {
    setIsDirty(true)
    const copy = { ...draft }
    setItems(prev => [...prev, copy])
    setSelectedIndex(items.length)
  }

  function handleDelete() {
    if (items.length <= 1) return
    setIsDirty(true)
    setItems(prev => prev.filter((_, i) => i !== selectedIndex))
    setSelectedIndex(Math.max(0, selectedIndex - 1))
  }

  function handleMoveUp() {
    if (selectedIndex === 0) return
    setIsDirty(true)
    setItems(prev => {
      const next = [...prev]
      ;[next[selectedIndex - 1], next[selectedIndex]] = [next[selectedIndex], next[selectedIndex - 1]]
      return next
    })
    setSelectedIndex(selectedIndex - 1)
  }

  function handleMoveDown() {
    if (selectedIndex >= items.length - 1) return
    setIsDirty(true)
    setItems(prev => {
      const next = [...prev]
      ;[next[selectedIndex], next[selectedIndex + 1]] = [next[selectedIndex + 1], next[selectedIndex]]
      return next
    })
    setSelectedIndex(selectedIndex + 1)
  }

  function requestCancel() {
    if (isDirty) { pendingAction.current = 'cancel'; setShowDiscardWarning(true) }
    else onCancel()
  }

  function requestBack() {
    if (isDirty) { pendingAction.current = 'back'; setShowDiscardWarning(true) }
    else onBack()
  }

  function handleDiscardConfirm() {
    setShowDiscardWarning(false)
    setIsDirty(false)
    if (pendingAction.current === 'back') onBack()
    else onCancel()
    pendingAction.current = null
  }

  function handleDiscardCancel() {
    setShowDiscardWarning(false)
    pendingAction.current = null
  }

  const canDelete = items.length > 1
  const canAdd = items.length < MAX_QUICK_LINKS
  const canMoveUp = selectedIndex > 0
  const canMoveDown = selectedIndex < items.length - 1
  const canCommit = isListValid(items)

  const selectedIconOption = ICON_OPTIONS.find(o => o.icon === draft.icon) ?? ICON_OPTIONS[0]

  return (
    <>
      <MessageBox
        open={showDiscardWarning}
        type="Warning"
        onClose={(action) => {
          if (action === 'Discard Changes') handleDiscardConfirm()
          else handleDiscardCancel()
        }}
        actions={['Discard Changes', 'Cancel']}
        emphasizedAction="Discard Changes"
      >
        Do you want to discard your changes?{'\n'}All entered data will be lost.
      </MessageBox>

      <MessageBox
        open={showDeleteWarning}
        type="Warning"
        titleText="Delete"
        onClose={(action) => {
          setShowDeleteWarning(false)
          if (action === 'Delete') handleDelete()
        }}
        actions={['Delete', 'Cancel']}
        emphasizedAction="Delete"
      >
        Delete the selected link?
      </MessageBox>

      <Dialog
        id={dialogId}
        open={open}
        headerText="Edit Quick Links"
        className="widget-catalog-dialog qled-dialog no-padding-dialog"
        footer={
          <Bar
            design="Footer"
            startContent={
              mode === 'add' ? (
                <Button design="Transparent" onClick={requestBack}>Back</Button>
              ) : undefined
            }
            endContent={
              <>
                <Button
                  design="Emphasized"
                  disabled={!canCommit}
                  tooltip={!canCommit ? 'Every link needs a name and a valid URL' : undefined}
                  onClick={() => mode === 'add' ? onAdd(items) : onSave(items)}
                >
                  {mode === 'add' ? 'Add Widget' : 'Save'}
                </Button>
                <Button design="Transparent" onClick={requestCancel}>Cancel</Button>
              </>
            }
          />
        }
      >
      <div className="wcd-body">

        {/* ── Left: toolbar + preview ── */}
        <div className="qled-left">

          {/* Toolbar */}
          <div className="qled-toolbar">
            <Button design="Transparent" icon="add" tooltip={canAdd ? 'Add Link' : 'You cannot add more than 6 links on this card'} disabled={!canAdd} onClick={() => tryNavigate(handleAdd)} />
            <Button design="Transparent" icon="duplicate" tooltip={canAdd ? 'Duplicate link' : 'You cannot add more than 6 links on this card'} disabled={!canAdd || items.length === 0} onClick={() => tryNavigate(handleDuplicate)} />
            <Button design="Transparent" icon="delete" tooltip="Delete Link" disabled={!canDelete} onClick={() => setShowDeleteWarning(true)} />
            <div className="qled-toolbar__separator" />
            <Button design="Transparent" icon="slim-arrow-up" tooltip="Move Up" disabled={!canMoveUp} onClick={() => tryNavigate(handleMoveUp)} />
            <Button design="Transparent" icon="slim-arrow-down" tooltip="Move Down" disabled={!canMoveDown} onClick={() => tryNavigate(handleMoveDown)} />
          </div>

          {/* Live preview */}
          <div className="wcd-preview">
            <div className="qled-preview__card-wrap">
              <QuickLinksWidget
                instanceLabel={1}
                title={initialTitle}
                items={items}
                selectedIndex={selectedIndex}
                onItemSelect={(i) => tryNavigate(() => setSelectedIndex(i))}
              />
            </div>
          </div>
        </div>

        {/* ── Right: edit form ── */}
        <div className="qled-right">
          <div className="qled-right__title">Edit Details</div>
          <div className="qled-form">

            <div className="qled-field">
              <Label>Link Type Icon:</Label>
              <Select
                className="qled-icon-select"
                onChange={(e) => updateDraft({ icon: (e.detail.selectedOption as HTMLElement).dataset.value ?? 'chain-link' })}
                label={
                  <span className="qled-icon-select__label">
                    <Icon name={selectedIconOption.icon} className="qled-icon-select__icon" />
                    <span>{selectedIconOption.label}</span>
                  </span>
                }
              >
                {ICON_OPTIONS.map(opt => (
                  <OptionCustom
                    key={opt.icon}
                    data-value={opt.icon}
                    value={opt.icon}
                    selected={draft.icon === opt.icon}
                    displayText={opt.label}
                  >
                    <div className="qled-icon-option">
                      <Icon name={opt.icon} className="qled-icon-option__icon" />
                      <span className="qled-icon-option__label">{opt.label}</span>
                      <span className="qled-icon-option__keywords" title={opt.keywords}>{opt.keywords}</span>
                    </div>
                  </OptionCustom>
                ))}
              </Select>
            </div>

            <div className="qled-field">
              <Label required>Name:</Label>
              <Input
                ref={nameInputRef}
                value={draft.title}
                maxlength={100}
                placeholder="Provide link name"
                valueState={(formTouched || nameTouched) && draft.title.trim() === '' ? 'Negative' : 'None'}
                valueStateMessage={<span>Name must not be empty.</span>}
                onInput={(e) => updateDraft({ title: (e.target as unknown as InputDomRef).value ?? '' })}
                onBlur={() => setNameTouched(true)}
              />
            </div>

            <div className="qled-field">
              <Label>Description:</Label>
              <TextArea
                value={draft.description ?? ''}
                placeholder="Describe the link content here (optional)"
                maxlength={256}
                rows={3}
                onInput={(e) => updateDraft({ description: (e.target as unknown as TextAreaDomRef).value ?? '' })}
              />
              <span className="qled-char-count">{256 - (draft.description?.length ?? 0)} of 256 characters remaining</span>
            </div>

            <div className="qled-field">
              <Label required>Link Address (URL):</Label>
              <TextArea
                ref={urlTextAreaRef}
                value={draft.url}
                placeholder="Link must start with https:// or www."
                maxlength={2000}
                rows={3}
                valueState={
                  (formTouched || urlTouched) && !isValidUrl(draft.url) ? 'Negative' :
                  isSuspiciousUrl(draft.url) ? 'Critical' :
                  'None'
                }
                valueStateMessage={
                  (formTouched || urlTouched) && !isValidUrl(draft.url)
                    ? <span>The link URL is missing or is invalid. Enter a valid link that starts with https:// or www.</span>
                    : <span>The link URL is most likely invalid. Enter a valid link that starts with https:// or www.</span>
                }
                onInput={(e) => updateDraft({ url: (e.target as unknown as TextAreaDomRef).value ?? '' })}
                onBlur={() => setUrlTouched(true)}
              />
              <span className="qled-char-count">{2000 - (draft.url?.length ?? 0)} of 2000 characters remaining</span>
            </div>

          </div>
        </div>

      </div>
    </Dialog>
    </>
  )
}
