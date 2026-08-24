import React, { useRef, useState } from 'react'
import {
  Dialog,
  Button,
  Title,
  Text,
  BusyIndicator,
  MessageStrip,
  Label,
  Input,
  Bar,
} from '@ui5/webcomponents-react'
import SampleProcess1 from '../../../models/SampleProcess1.svg'

type Phase = 'select' | 'preview' | 'loading' | 'error'
type FileType = 'bpmn' | 'visio'

const ACCEPTED = ['.xml', '.bpmn', '.vsdx']
const DEFAULT_DESTINATION = 'Shared documents/01 - Exploratory testing/Group2'

const FOLDERS = [
  'Shared documents/01',
  'admin test',
  'john',
  'folder jannet',
  'andy test',
  'christina',
  'admin2',
  'folder',
]

function detectFileType(filename: string): FileType {
  return filename.toLowerCase().endsWith('.vsdx') ? 'visio' : 'bpmn'
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (filename: string) => void
}

function FolderPopover({ selected, onSelect, onClose }: { selected: string; onSelect: (f: string) => void; onClose: () => void }) {
  const [highlighted, setHighlighted] = useState(selected)
  return (
    <div style={{
      position: 'absolute', top: '36px', right: '0',
      width: '340px', background: 'white',
      borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      zIndex: 9999, overflow: 'hidden',
    }}>
      <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--sapTextColor)' }}>
        Select folder
      </div>
      <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {FOLDERS.map(folder => (
          <div
            key={folder}
            onClick={() => setHighlighted(folder)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              cursor: 'pointer',
              background: highlighted === folder ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent',
              borderLeft: highlighted === folder ? '3px solid var(--sapSelectedColor)' : '3px solid transparent',
            }}
          >
            <span style={{ color: 'var(--sapSelectedColor)', fontSize: '0.7rem' }}>›</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1 3.5A1.5 1.5 0 012.5 2h3.172a1.5 1.5 0 011.06.44l.829.828A.5.5 0 007.914 3.5H13.5A1.5 1.5 0 0115 5v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12V3.5z" stroke="#6a7d8f" strokeWidth="1.2" fill="#e8eef3"/>
            </svg>
            <span style={{ fontSize: '0.8rem', fontWeight: highlighted === folder ? 600 : 400, color: 'var(--sapTextColor)' }}>{folder}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '0.4rem 0.75rem', borderTop: '1px solid var(--sapList_BorderColor)' }}>
        <Button design="Default" onClick={() => { onSelect(highlighted); onClose() }}>Select</Button>
        <Button design="Transparent" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

function FileRow({ filename, destination, onClear, onChangeFolder, folderPickerOpen, onSelect, onClosePicker }: {
  filename: string
  destination: string
  onClear: () => void
  onChangeFolder: () => void
  folderPickerOpen: boolean
  onSelect: (f: string) => void
  onClosePicker: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', position: 'relative' }}>
      <Label style={{ whiteSpace: 'nowrap' }}>Uploaded file:</Label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        border: '1px solid var(--sapField_BorderColor)',
        borderRadius: '4px', padding: '2px 8px',
        background: 'var(--sapField_BackgroundColor)',
        fontSize: '0.8rem',
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{filename}</span>
        <Button design="Transparent" icon="decline" style={{ height: '18px', minWidth: '18px', padding: 0 }} onClick={onClear} />
      </div>
      <Button design="Default" style={{ height: '28px' }} onClick={onClear}>Select</Button>
      <Label style={{ whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>To:</Label>
      <Input readonly value={destination} style={{ flex: 1, minWidth: '160px', fontSize: '0.8rem' }} />
      <div style={{ position: 'relative' }}>
        <Button design="Default" style={{ height: '28px' }} onClick={onChangeFolder}>Change</Button>
        {folderPickerOpen && (
          <FolderPopover selected={destination} onSelect={onSelect} onClose={onClosePicker} />
        )}
      </div>
    </div>
  )
}

function BpmnPreview() {
  return (
    <div style={{
      border: '1px solid var(--sapField_BorderColor)',
      borderRadius: '6px',
      background: 'var(--sapShell_Background, #eef3f8)',
      overflow: 'hidden',
      height: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img src={SampleProcess1} alt="BPMN diagram preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }} />
    </div>
  )
}

const VISIO_ROWS = [
  { id: 'Shape.1', label: 'Start', shapeType: 'Oval', mapsTo: 'Start Event', page: 'Page-1' },
  { id: 'Shape.2', label: 'Review Purchase Request', shapeType: 'Rectangle', mapsTo: 'Task', page: 'Page-1' },
  { id: 'Shape.3', label: 'Approval needed?', shapeType: 'Diamond', mapsTo: 'Exclusive Gateway', page: 'Page-1' },
  { id: 'Shape.4', label: 'Send for Manager Approval', shapeType: 'Rectangle', mapsTo: 'Task', page: 'Page-1' },
  { id: 'Shape.5', label: 'Approve Request', shapeType: 'Rectangle', mapsTo: 'Task', page: 'Page-1' },
  { id: 'Shape.6', label: 'Reject & Notify Requester', shapeType: 'Rectangle', mapsTo: 'Task', page: 'Page-1' },
  { id: 'Shape.7', label: 'End', shapeType: 'Oval', mapsTo: 'End Event', page: 'Page-1' },
  { id: 'Shape.8', label: 'Process Complete', shapeType: 'Terminator', mapsTo: 'End Event', page: 'Page-1' },
]

function VisioPreview() {
  return (
    <div>
      <Text style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
        Visio Shapes ({VISIO_ROWS.length})
      </Text>
      <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '4px', overflow: 'hidden', maxHeight: '260px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: '"72", Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'var(--sapList_HeaderBackground)', position: 'sticky', top: 0 }}>
              {['Shape ID', 'Label', 'Shape Type (Visio)', 'Maps to (Signavio)', 'Page'].map(h => (
                <th key={h} style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--sapList_HeaderTextColor)', fontWeight: 600, borderBottom: '1px solid var(--sapList_BorderColor)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VISIO_ROWS.map((row, i) => (
              <tr key={row.id} style={{ background: i % 2 === 0 ? 'var(--sapList_Background)' : 'var(--sapList_AlternatingBackground)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
                <td style={{ padding: '6px 12px', color: 'var(--sapLinkColor)' }}>{row.id}</td>
                <td style={{ padding: '6px 12px', color: 'var(--sapTextColor)' }}>{row.label}</td>
                <td style={{ padding: '6px 12px', color: 'var(--sapTextColor)' }}>{row.shapeType}</td>
                <td style={{ padding: '6px 12px', color: 'var(--sapTextColor)', fontWeight: 600 }}>{row.mapsTo}</td>
                <td style={{ padding: '6px 12px', color: 'var(--sapTextColor)' }}>{row.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ImportFileDialog({ open, onClose, onSuccess }: Props) {
  const [phase, setPhase] = useState<Phase>('select')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [destination, setDestination] = useState(DEFAULT_DESTINATION)
  const [folderPickerOpen, setFolderPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fileType = file ? detectFileType(file.name) : null

  function reset() {
    setPhase('select')
    setFile(null)
    setDragOver(false)
    setFolderPickerOpen(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setPhase('preview') }
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setFile(f); setPhase('preview') }
  }

  function handleImport() {
    if (!file) return
    setPhase('loading')
    setTimeout(() => {
      const name = file.name
      reset()
      onClose()
      onSuccess(name)
    }, 2500)
  }

  const dialogTitle = phase === 'preview'
    ? (fileType === 'visio' ? 'Import Visio File' : 'Import Diagrams')
    : 'Import File'

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      style={{ width: '680px' }}
      header={
        <Title level="H4" style={{ padding: '0.75rem 1.5rem 0' }}>{dialogTitle}</Title>
      }
      footer={
        phase !== 'loading' ? (
          <Bar design="Footer" endContent={
            <>
              {phase === 'error' ? (
                <>
                  <Button design="Default" onClick={handleClose}>Cancel</Button>
                  <Button design="Emphasized" onClick={() => setPhase('select')}>Retry</Button>
                </>
              ) : phase === 'preview' ? (
                <>
                  <Button design="Emphasized" onClick={handleImport}>Import</Button>
                  <Button design="Default" onClick={handleClose}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button design="Default" onClick={handleClose}>Cancel</Button>
                  <Button design="Emphasized" disabled={!file} onClick={() => file && setPhase('preview')}>Next</Button>
                </>
              )}
            </>
          } />
        ) : undefined
      }
    >
      <div style={{ padding: '1rem 1.5rem' }}>
        {phase === 'select' && (
          <>
            <Text>Select a BPMN XML or Visio file to import. The file is added to your workspace repository.</Text>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                marginTop: '1rem',
                border: `2px dashed ${dragOver ? 'var(--sapSelectedColor)' : 'var(--sapField_BorderColor)'}`,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapField_BackgroundColor)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
              <Text>Drag and drop a file here, or click to browse</Text>
              <div style={{ marginTop: '0.25rem' }}>
                <Text style={{ color: 'var(--sapContent_NonInteractiveIconColor)', fontSize: '0.75rem' }}>
                  Supported: .xml, .bpmn, .vsdx
                </Text>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}

        {phase === 'preview' && file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FileRow
              filename={file.name}
              destination={destination}
              onClear={() => { setFile(null); setPhase('select') }}
              onChangeFolder={() => setFolderPickerOpen(v => !v)}
              folderPickerOpen={folderPickerOpen}
              onSelect={(f) => setDestination(f)}
              onClosePicker={() => setFolderPickerOpen(false)}
            />
            {fileType === 'bpmn' ? <BpmnPreview /> : <VisioPreview />}
            <Text style={{ fontSize: '0.75rem', color: 'var(--sapContent_NonInteractiveIconColor)' }}>
              {fileType === 'bpmn'
                ? 'BPMN XML diagrams will be imported to your shared workspace.'
                : 'Visio shapes will be mapped to Signavio elements. Some manual adjustments may be needed after import.'}
            </Text>
          </div>
        )}

        {phase === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0' }}>
            <BusyIndicator active size="M" />
            <Text>Importing {file?.name}…</Text>
            <Text style={{ color: 'var(--sapContent_NonInteractiveIconColor)', fontSize: '0.75rem' }}>
              This may take a moment.
            </Text>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <MessageStrip design="Negative" hideCloseButton>
              The import failed. Please check your file and try again.
            </MessageStrip>
            <Text>If the problem persists, contact your workspace administrator.</Text>
          </div>
        )}
      </div>
    </Dialog>
  )
}
