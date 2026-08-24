import { useState } from 'react'
import { Dialog, Button, Bar, CheckBox, Icon, Text } from '@ui5/webcomponents-react'
import type { SmartFolder } from '../../../../contexts/WorkspaceContext'
import { FOLDERS, FILES } from '../data'

interface ExportSGXDialogProps {
  open: boolean
  onClose: () => void
  smartFolders: SmartFolder[]
}

export default function ExportSGXDialog({ open, onClose, smartFolders }: ExportSGXDialogProps) {
  const [exportChecked, setExportChecked] = useState<Set<string>>(new Set())
  const [exportLatestOnly, setExportLatestOnly] = useState(true)
  const [exportSharedOpen, setExportSharedOpen] = useState(true)
  const [exportSmartOpen, setExportSmartOpen] = useState(false)

  if (!open) return null

  const sfIds = smartFolders.map(sf => `sf-${sf.id}`)
  const folderIds = FOLDERS.map(f => `folder-${f}`)
  const fileIds = FILES.map(f => `item-${f.id}`)
  const sharedIds = [...folderIds, ...fileIds]
  const allIds = [...sfIds, ...sharedIds]

  const allSharedChecked = sharedIds.every(id => exportChecked.has(id))
  const someSharedChecked = sharedIds.some(id => exportChecked.has(id))
  const allSmartChecked = sfIds.every(id => exportChecked.has(id))
  const someSmartChecked = sfIds.some(id => exportChecked.has(id))

  const toggle = (id: string) => setExportChecked(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleGroup = (ids: string[], currentlyAll: boolean) => setExportChecked(prev => {
    const next = new Set(prev)
    if (currentlyAll) ids.forEach(id => next.delete(id))
    else ids.forEach(id => next.add(id))
    return next
  })

  const totalSelected = allIds.filter(id => exportChecked.has(id)).length

  return (
    <Dialog
      open
      headerText="Export SAP Signavio Archive (SGX)"
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
          All selected diagrams and folders are exported to a single archive file.
          Please select the diagrams and folders, which should be exported:
        </Text>

        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', maxHeight: '280px', overflowY: 'auto', background: 'var(--sapList_Background)' }}>
          {smartFolders.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--sapList_BorderColor)', background: 'var(--sapList_Background)' }}>
                <Icon
                  name={exportSmartOpen ? 'slim-arrow-down' : 'slim-arrow-right'}
                  style={{ fontSize: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setExportSmartOpen(v => !v)}
                />
                <CheckBox checked={allSmartChecked} indeterminate={someSmartChecked && !allSmartChecked} onChange={() => toggleGroup(sfIds, allSmartChecked)} />
                <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '500' }}>Smart folders</Text>
              </div>
              {exportSmartOpen && smartFolders.map(sf => (
                <div key={sf.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: '1px solid var(--sapList_BorderColor)', background: exportChecked.has(`sf-${sf.id}`) ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent' }}>
                  <span style={{ width: '1rem', flexShrink: 0 }} />
                  <CheckBox checked={exportChecked.has(`sf-${sf.id}`)} onChange={() => toggle(`sf-${sf.id}`)} />
                  <Icon name="search" style={{ fontSize: '0.875rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0 }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{sf.name}</Text>
                </div>
              ))}
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', cursor: 'pointer', borderBottom: exportSharedOpen ? '1px solid var(--sapList_BorderColor)' : 'none', background: 'var(--sapList_Background)' }}>
            <Icon
              name={exportSharedOpen ? 'slim-arrow-down' : 'slim-arrow-right'}
              style={{ fontSize: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0, cursor: 'pointer' }}
              onClick={() => setExportSharedOpen(v => !v)}
            />
            <CheckBox checked={allSharedChecked} indeterminate={someSharedChecked && !allSharedChecked} onChange={() => toggleGroup(sharedIds, allSharedChecked)} />
            <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '500' }}>Modeling Files</Text>
          </div>

          {exportSharedOpen && (
            <>
              {FOLDERS.map((folder, idx) => (
                <div key={folder} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: '1px solid var(--sapList_BorderColor)', background: exportChecked.has(`folder-${folder}`) ? 'var(--sapList_SelectionBackgroundColor)' : idx % 2 === 0 ? 'var(--sapList_Background)' : 'var(--sapList_AlternatingBackground)' }}>
                  <span style={{ width: '1rem', flexShrink: 0 }} />
                  <CheckBox checked={exportChecked.has(`folder-${folder}`)} onChange={() => toggle(`folder-${folder}`)} />
                  <Icon name="folder-blank" style={{ fontSize: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{folder}</Text>
                </div>
              ))}
              {FILES.map((file, idx) => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem 0.3rem 2rem', borderBottom: idx < FILES.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none', background: exportChecked.has(`item-${file.id}`) ? 'var(--sapList_SelectionBackgroundColor)' : idx % 2 === 0 ? 'var(--sapList_Background)' : 'var(--sapList_AlternatingBackground)' }}>
                  <span style={{ width: '1rem', flexShrink: 0 }} />
                  <CheckBox checked={exportChecked.has(`item-${file.id}`)} onChange={() => toggle(`item-${file.id}`)} />
                  <Icon
                    name={file.type === 'Folder' ? 'folder-blank' : file.type === 'Customer Journey' ? 'chain-link' : file.type === 'Process Model' ? 'bpmn2' : 'document'}
                    style={{ fontSize: '1rem', color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0 }}
                  />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Text>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.5rem 0.75rem', background: 'var(--sapWarningBackground)', border: '1px solid var(--sapWarningBorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
          <Icon name="alert" style={{ fontSize: '1rem', color: 'var(--sapCriticalTextColor)', flexShrink: 0, marginTop: '1px' }} />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapCriticalTextColor)' }}>
            WARNING: The export has a file size limit. File size is evaluated before download.
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckBox checked={exportLatestOnly} onChange={() => setExportLatestOnly(v => !v)} text="Export only the latest revision of each diagram" />
        </div>
      </div>
    </Dialog>
  )
}
