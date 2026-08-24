import { useState } from 'react'
import { Dialog, Button, Bar, CheckBox, Icon, Text } from '@ui5/webcomponents-react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import type { SmartFolder } from '../../../../contexts/WorkspaceContext'
import { FOLDERS, FILES } from '../data'

// ─── Export Translations ─────────────────────────────────────────────────────

interface ExportTranslationsDialogProps {
  open: boolean
  onClose: () => void
  smartFolders: SmartFolder[]
}

export function ExportTranslationsDialog({ open, onClose, smartFolders: _smartFolders }: ExportTranslationsDialogProps) {
  const [sharedOpen, setSharedOpen] = useState(true)
  const [myDocsOpen, setMyDocsOpen] = useState(false)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [includeDict, setIncludeDict] = useState(false)

  if (!open) return null

  const folderIds = FOLDERS.map(f => `etf-${f}`)
  const fileIds = FILES.filter(f => f.type !== 'Folder' && f.type !== 'File').map(f => `eti-${f.id}`)
  const myDocIds = ['etmd-drafts', 'etmd-personal', 'etmd-templates']
  const allSharedIds = [...folderIds, ...fileIds]

  const toggle = (id: string) => setChecked(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })
  const toggleGroup = (ids: string[], allChecked: boolean) => setChecked(prev => {
    const next = new Set(prev)
    if (allChecked) ids.forEach(id => next.delete(id)); else ids.forEach(id => next.add(id))
    return next
  })

  const allSharedChecked = allSharedIds.every(id => checked.has(id))
  const someSharedChecked = allSharedIds.some(id => checked.has(id))
  const allMyDocsChecked = myDocIds.every(id => checked.has(id))
  const someMyDocsChecked = myDocIds.some(id => checked.has(id))
  const totalSelected = [...allSharedIds, ...myDocIds].filter(id => checked.has(id)).length

  return (
    <Dialog
      open
      headerText="Export Diagram Translations"
      onClose={onClose}
      className="no-padding-dialog"
      footer={
        <Bar design="Footer" endContent={
          <>
            <Button design="Emphasized" disabled={totalSelected === 0}>Export</Button>
            <Button design="Transparent" onClick={onClose}>Cancel</Button>
          </>
        } />
      }
    >
      <div style={{ width: '460px', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
        <Text>
          Select the diagrams and folders whose translations you want to export.
          The translations will be exported as PO files in a ZIP archive.
        </Text>
        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', maxHeight: '280px', overflowY: 'auto', background: 'var(--sapList_Background)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', borderBottom: sharedOpen ? '1px solid var(--sapList_BorderColor)' : 'none' }}>
            <Icon name={sharedOpen ? 'slim-arrow-down' : 'slim-arrow-right'} style={{ fontSize: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0, cursor: 'pointer' }} onClick={() => setSharedOpen(v => !v)} />
            <CheckBox checked={allSharedChecked} indeterminate={someSharedChecked && !allSharedChecked} onChange={() => toggleGroup(allSharedIds, allSharedChecked)} />
            <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '500' }}>Shared documents</Text>
          </div>
          {sharedOpen && (
            <>
              {FOLDERS.map(folder => (
                <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: '1px solid var(--sapList_BorderColor)', background: checked.has(`etf-${folder}`) ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent' }}>
                  <span style={{ width: '1rem', flexShrink: 0 }} />
                  <CheckBox checked={checked.has(`etf-${folder}`)} onChange={() => toggle(`etf-${folder}`)} />
                  <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{folder}</Text>
                </div>
              ))}
              {FILES.filter(f => f.type !== 'Folder' && f.type !== 'File').map((file, idx, arr) => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: idx < arr.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none', background: checked.has(`eti-${file.id}`) ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent' }}>
                  <span style={{ width: '1rem', flexShrink: 0 }} />
                  <CheckBox checked={checked.has(`eti-${file.id}`)} onChange={() => toggle(`eti-${file.id}`)} />
                  <SigDomainObject size="XXS" object={file.type as never} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Text>
                </div>
              ))}
            </>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', borderTop: '1px solid var(--sapList_BorderColor)', borderBottom: myDocsOpen ? '1px solid var(--sapList_BorderColor)' : 'none' }}>
            <Icon name={myDocsOpen ? 'slim-arrow-down' : 'slim-arrow-right'} style={{ fontSize: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0, cursor: 'pointer' }} onClick={() => setMyDocsOpen(v => !v)} />
            <CheckBox checked={allMyDocsChecked} indeterminate={someMyDocsChecked && !allMyDocsChecked} onChange={() => toggleGroup(myDocIds, allMyDocsChecked)} />
            <Icon name="locked" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '500' }}>My documents</Text>
          </div>
          {myDocsOpen && (
            ['Drafts', 'Personal Projects', 'Templates'].map((folder, idx, arr) => (
              <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: idx < arr.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none', background: checked.has(`etmd-${folder.toLowerCase().replace(' ', '')}`) ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent' }}>
                <span style={{ width: '1rem', flexShrink: 0 }} />
                <CheckBox checked={checked.has(`etmd-${folder.toLowerCase().replace(' ', '')}`)} onChange={() => toggle(`etmd-${folder.toLowerCase().replace(' ', '')}`)} />
                <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{folder}</Text>
              </div>
            ))
          )}
        </div>
        <CheckBox checked={includeDict} onChange={() => setIncludeDict(v => !v)} text="Include directly linked Dictionary items" />
      </div>
    </Dialog>
  )
}

// ─── Import Translations ──────────────────────────────────────────────────────

interface ImportTranslationsDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportTranslationsDialog({ open, onClose }: ImportTranslationsDialogProps) {
  if (!open) return null
  return (
    <Dialog
      open
      headerText="Import Diagram Translations"
      onClose={onClose}
      footer={
        <Bar design="Footer" endContent={
          <>
            <Button design="Emphasized">Import</Button>
            <Button design="Transparent" onClick={onClose}>Cancel</Button>
          </>
        } />
      }
    >
      <div style={{ width: '440px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Text>Select the PO files you want to import. You can import a maximum of 100 diagrams.</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="globe" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
          <Text style={{ fontWeight: '600' }}>Default language:</Text>
          <Text>🇦🇺 Australia</Text>
        </div>
        <div style={{ border: '2px dashed var(--sapField_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'var(--sapField_Background)', cursor: 'pointer' }}>
          <Icon name="upload" style={{ fontSize: '2rem', color: 'var(--sapContent_NonInteractiveIconColor)' }} />
          <Text style={{ fontWeight: '600', color: 'var(--sapTextColor)' }}>Drop PO files here</Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'center' }}>
            or click to browse. Accepts .po and .zip files.
          </Text>
          <Button design="Default">Browse Files</Button>
        </div>
      </div>
    </Dialog>
  )
}
