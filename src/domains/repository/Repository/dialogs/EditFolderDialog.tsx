import { useState, useEffect } from 'react'
import { Dialog, Button, Bar, Label, Input, TextArea, Link, Text, MessageStrip } from '@ui5/webcomponents-react'

interface EditFolderDialogProps {
  open: boolean
  folderName: string
  folderDescription?: string
  isFolder?: boolean
  onSave: (name: string, description: string) => void
  onClose: () => void
}

const OPTIONAL_LANGUAGES = [
  { code: 'en_US', label: 'English (EN)' },
  { code: 'fr_FR', label: 'French (FR)' },
]

export default function EditFolderDialog({ open, folderName, folderDescription, isFolder = true, onSave, onClose }: EditFolderDialogProps) {
  const [name, setName] = useState(folderName)
  const [description, setDescription] = useState(folderDescription ?? '')
  const [showOptional, setShowOptional] = useState(false)
  const [langNames, setLangNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setName(folderName)
      setDescription(folderDescription ?? '')
      setShowOptional(false)
      setLangNames({})
    }
  }, [open, folderName, folderDescription])

  const canSave = name.trim().length > 0

  return (
    <Dialog
      open={open}
      headerText="Rename"
      onClose={onClose}
      style={{ width: '512px' }}
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Name section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>
            Name
          </Text>
          {isFolder ? (
            /* Folder: single name input + optional languages */
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Label required>German (DE):</Label>
                <Input
                  value={name}
                  onInput={(e) => setName((e.target as unknown as HTMLInputElement).value)}
                  style={{ width: '100%' }}
                />
              </div>
              {showOptional && OPTIONAL_LANGUAGES.map(lang => (
                <div key={lang.code} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Label>{lang.label}:</Label>
                  <Input
                    value={langNames[lang.code] ?? ''}
                    onInput={(e) => setLangNames(prev => ({ ...prev, [lang.code]: (e.target as unknown as HTMLInputElement).value }))}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
              {!showOptional && (
                <Link onClick={() => setShowOptional(true)}>Optional Languages</Link>
              )}
            </>
          ) : (
            /* Non-folder: collapsed = German only + Optional Languages link; expanded = all three stacked */
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Label required>German (DE):</Label>
                <Input
                  value={name}
                  onInput={(e) => setName((e.target as unknown as HTMLInputElement).value)}
                  style={{ width: '100%' }}
                />
              </div>
              {showOptional && OPTIONAL_LANGUAGES.map(lang => (
                <div key={lang.code} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Label required>{lang.label}:</Label>
                  <Input
                    value={langNames[lang.code] ?? ''}
                    onInput={(e) => setLangNames(prev => ({ ...prev, [lang.code]: (e.target as unknown as HTMLInputElement).value }))}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
              {!showOptional && (
                <Link onClick={() => setShowOptional(true)}>Optional Languages</Link>
              )}
            </>
          )}
        </div>

        {/* Description section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>
            Description
          </Text>
          {isFolder ? (
            <TextArea
              value={description}
              onInput={(e) => setDescription((e.target as unknown as HTMLTextAreaElement).value)}
              rows={4}
              style={{ width: '100%' }}
            />
          ) : (
            <MessageStrip design="Information" hideCloseButton>
              You can change the description in the Editor via the attribute "Documentation".
            </MessageStrip>
          )}
        </div>
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Emphasized" disabled={!canSave} onClick={() => onSave(name.trim(), description.trim())}>Rename</Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}
