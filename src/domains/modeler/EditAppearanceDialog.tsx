import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bar, Button, CheckBox, ColorPaletteItem, ColorPalettePopover, Dialog, Input, SegmentedButton, SegmentedButtonItem, StepInput, Text, ToggleButton } from '@ui5/webcomponents-react'
// @ts-ignore
import dragFilesIllustration from '@ui5/webcomponents-fiori/dist/illustrations/sapIllus-Spot-DragFilesToUpload.js'

type AppearanceValues = {
  fontSize: number
  bold: boolean
  italic: boolean
  fontColor: string
  bgColor: string
  plainBackground: boolean
  borderColor: string
}

type Props = {
  open: boolean
  itemId: string
  itemLabel: string
  initialValues?: Partial<AppearanceValues>
  initialTab?: string
  showCustomGraphics?: boolean
  onClose: () => void
  onApply: (values: AppearanceValues) => void
  onRestoreDefault: () => void
}

const DEFAULT: AppearanceValues = {
  fontSize: 12,
  bold: false,
  italic: false,
  fontColor: '#000000',
  bgColor: '#FFFFFF',
  plainBackground: false,
  borderColor: '#000000',
}

const toHex = (color: string): string => {
  if (!color) return '#000000'
  if (color.startsWith('#')) return color
  // rgba/rgb to hex
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    return '#' + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
  }
  return color
}

const PALETTE_COLORS = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff6600','#9900ff','#006600','#003399','#996633','#666666','#cccccc']

const ACCEPTED = ['image/svg+xml']
const MAX_KB = 20

type UploadedFile = { id: string; file: File; previewUrl: string }

type CustomGraphicsUploadProps = {
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  previewFile: UploadedFile | null
  setPreviewFile: React.Dispatch<React.SetStateAction<UploadedFile | null>>
}

function CustomGraphicsUpload({ files, setFiles, error, setError, previewFile, setPreviewFile }: CustomGraphicsUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return 'Only SVG files are supported.'
    if (file.size > MAX_KB * 1024) return `File must be under ${MAX_KB} KB.`
    return null
  }

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    setError(null)
    const newFiles: UploadedFile[] = []
    for (const file of Array.from(incoming)) {
      const err = validate(file)
      if (err) { setError(err); continue }
      const previewUrl = URL.createObjectURL(file)
      newFiles.push({ id: `${file.name}-${Date.now()}`, file, previewUrl })
    }
    setFiles(prev => {
      const updated = [...prev, ...newFiles]
      if (!previewFile && updated.length > 0) setPreviewFile(updated[0])
      return updated
    })
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      if (previewFile?.id === id) setPreviewFile(updated[0] ?? null)
      return updated
    })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  if (files.length === 0) {
    return (
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        style={{
          background: isDragOver ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapButton_Selected_Background, #edf6ff)',
          borderRadius: '8px',
          border: isDragOver ? '2px dashed var(--sapSelectedColor)' : '2px dashed transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 16px', transition: 'background 0.15s, border 0.15s',
        }}
      >
        <input ref={inputRef} type="file" accept=".svg,image/svg+xml" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <div dangerouslySetInnerHTML={{ __html: dragFilesIllustration }} style={{ width: '120px', height: '120px' }} />
          <span style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader4Size)', color: 'var(--sapGroup_TitleTextColor)' }}>Upload custom graphics</span>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Drag and drop SVG files here, or choose Upload to add them.</Text>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>SVG only · Max 20 KB · No embedded scripts or images</Text>
          {error && <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapNegativeElementColor)' }}>{error}</Text>}
          <Button style={{ marginTop: '4px' }} onClick={() => inputRef.current?.click()}>Upload</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '12px', height: '100%' }}
      onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" accept=".svg,image/svg+xml" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />

      {/* Left: file list */}
      <div style={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: '8px', overflow: 'hidden' }}>
          {files.map((f, i) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              className="element-row"
              onClick={() => setPreviewFile(f)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setPreviewFile(f) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px',
                borderBottom: i < files.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                background: previewFile?.id === f.id ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                cursor: 'pointer',
                userSelect: 'none',
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
            >
              <img src={f.previewUrl} alt={f.file.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--sapList_BorderColor)', background: '#fff', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, pointerEvents: 'none' }}>
                <Text style={{ display: 'block', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--sapFontSize)', userSelect: 'none' }}>{f.file.name}</Text>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', userSelect: 'none' }}>{(f.file.size / 1024).toFixed(1)} KB</Text>
              </div>
              <Button
                icon="decline"
                design="Transparent"
                accessibleName="Remove"
                onClick={e => { e.stopPropagation(); removeFile(f.id) }}
              />
            </div>
          ))}
        </div>
        {error && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapNegativeElementColor)' }}>{error}</Text>}
        <Button icon="add" design="Transparent" onClick={() => inputRef.current?.click()}>
          Add More Files
        </Button>
      </div>

      {/* Right: preview — full height */}
      <div style={{
        flex: 1,
        border: '1px solid var(--sapList_BorderColor)',
        borderRadius: '8px',
        background: 'var(--sapBackgroundColor)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {previewFile
          ? <img src={previewFile.previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }} />
          : <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', textAlign: 'center', padding: '16px' }}>Select a file to preview</Text>
        }
      </div>
    </div>
  )
}

const ColorSwatchField = ({ id, label, value, onChange, onPaletteOpen }: { id: string; label: string; value: string; onChange: (color: string) => void; onPaletteOpen: (open: boolean) => void }) => {
  const [open, setOpen] = useState(false)
  const openPalette = () => { setOpen(true); onPaletteOpen(true) }
  const closePalette = () => { setOpen(false); onPaletteOpen(false) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <L>{label}</L>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          id={id}
          onClick={openPalette}
          style={{ width: '26px', height: '26px', flexShrink: 0, background: value, border: '1px solid var(--sapContent_ForegroundBorderColor)', borderRadius: '4px', cursor: 'pointer' }}
        />
        {createPortal(
          <ColorPalettePopover
            opener={id}
            open={open}
            onClose={closePalette}
            showDefaultColor
            showMoreColors
            defaultColor={value}
            onItemClick={(e: any) => {
              const color = toHex(e.detail?.color)
              if (color) onChange(color)
              closePalette()
            }}
          >
            {PALETTE_COLORS.map(c => <ColorPaletteItem key={c} value={c} />)}
          </ColorPalettePopover>,
          document.body
        )}
        <Input value={value} onInput={(e: any) => { const v = e.target.value; if (v) onChange(toHex(v)) }} style={{ flex: 1 }} />
      </div>
    </div>
  )
}

const L = ({ children }: { children: React.ReactNode }) => (
  <span style={{ margin: 0, padding: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{children}</span>
)

export default function EditAppearanceDialog({ open, itemId, itemLabel, initialValues, initialTab, showCustomGraphics = false, onClose, onApply, onRestoreDefault }: Props) {
  const [tab, setTab] = useState<'appearance' | 'custom-graphics'>('appearance')
  const [values, setValues] = useState<AppearanceValues>(() => ({ ...DEFAULT, ...initialValues }))
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const paletteOpenRef = useRef(false)

  useEffect(() => {
    if (open) {
      setValues({ ...DEFAULT, ...initialValues })
      setTab((initialTab as any) ?? 'appearance')
    }
  }, [open, itemId])

  const set = (patch: Partial<AppearanceValues>) => setValues(v => ({ ...v, ...patch }))
  const isDefault = JSON.stringify(values) === JSON.stringify(DEFAULT)
  const handleApply = () => { onApply(values); onClose() }
  const handleRestore = () => { setValues(DEFAULT); onRestoreDefault() }

  return (
    <Dialog open={open} onClose={() => { if (!paletteOpenRef.current) onClose() }} headerText="Edit Style" preventFocusRestore className="no-padding-dialog">
      {showCustomGraphics && (
        <div style={{ padding: '12px 32px 0' }}>
          <SegmentedButton key={`seg-${tab}-${itemId}`} onSelectionChange={(e: any) => setTab(e.detail.selectedItems[0]?.getAttribute('data-key'))}>
            <SegmentedButtonItem data-key="appearance" selected={tab === 'appearance'}>Style</SegmentedButtonItem>
            <SegmentedButtonItem data-key="custom-graphics" selected={tab === 'custom-graphics'}>Custom Graphics</SegmentedButtonItem>
          </SegmentedButton>
        </div>
      )}

      {tab === 'appearance' && (
        <div style={{ padding: '16px 32px', minWidth: '500px', width: '760px', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', gap: '24px', alignItems: 'stretch', height: '320px', overflow: 'auto' }}>

          {/* Col 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <L>Font Size</L>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StepInput value={values.fontSize} min={8} max={72} step={1} onChange={(e: any) => set({ fontSize: e.target.value })} style={{ width: '110px' }} />
                <ToggleButton pressed={values.bold} onClick={() => set({ bold: !values.bold })} style={{ minWidth: '52px' }}>Bold</ToggleButton>
                <ToggleButton pressed={values.italic} onClick={() => set({ italic: !values.italic })} style={{ minWidth: '52px' }}><i>Italic</i></ToggleButton>
              </div>
            </div>
            <ColorSwatchField id="ea-fontColor" label="Font Color" value={values.fontColor} onChange={v => set({ fontColor: v })} onPaletteOpen={o => { paletteOpenRef.current = o }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <ColorSwatchField id="ea-bgColor" label="Background Color" value={values.bgColor} onChange={v => set({ bgColor: v })} onPaletteOpen={o => { paletteOpenRef.current = o }} />
              <CheckBox
                text="Use plain background color without gradient"
                checked={values.plainBackground}
                onChange={() => set({ plainBackground: !values.plainBackground })}
                style={{ marginLeft: '-0.5rem' }}
              />
            </div>
            <ColorSwatchField id="ea-borderColor" label="Border Color" value={values.borderColor} onChange={v => set({ borderColor: v })} onPaletteOpen={o => { paletteOpenRef.current = o }} />
          </div>

          {/* Col 2: Preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <L>Preview</L>
              <span onClick={isDefault ? undefined : handleRestore} style={{ margin: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapLinkColor)', cursor: isDefault ? 'default' : 'pointer', opacity: isDefault ? 0.4 : 1 }}>Restore to Default</span>
            </div>
            <div style={{ flex: 1, background: 'var(--sapBackgroundColor)', border: '1px solid var(--sapIndicationColor_10b_BorderColor, #eaecee)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100px', height: '80px' }}>
                <div style={{ position: 'absolute', inset: 0, background: values.bgColor, border: `2px solid ${values.borderColor}`, borderRadius: '12px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <Text style={{ fontSize: `${values.fontSize}px`, color: values.fontColor, fontWeight: values.bold ? '700' : '400', fontStyle: values.italic ? 'italic' : 'normal', textAlign: 'center', lineHeight: '1.3' }}>
                    {itemLabel}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'custom-graphics' && (
        <div style={{ padding: '16px 32px', minWidth: '500px', width: '760px', maxWidth: '100%', boxSizing: 'border-box', height: '320px', overflow: 'auto' }}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomGraphicsUpload
            files={uploadedFiles}
            setFiles={setUploadedFiles}
            error={uploadError}
            setError={setUploadError}
            previewFile={previewFile}
            setPreviewFile={setPreviewFile}
          />
        </div>
        </div>
      )}

      <Bar slot="footer" design="Footer" endContent={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button design="Emphasized" onClick={handleApply}>Apply</Button>
          <Button design="Transparent" onClick={onClose}>Cancel</Button>
        </div>
      } />
    </Dialog>
  )
}
