import { useState, useCallback, useEffect } from 'react'
import { Dialog, Bar, Button, Text } from '@ui5/webcomponents-react'
import { BpmnDiagramSvg } from '../Repository/components'
import { BpmnViewer } from './BpmnViewer'

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.5
const ZOOM_MAX = 4

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  bpmnXml?: string
}

export function BpmnPreviewDialog({ open, onClose, title, bpmnXml }: Props) {
  const [scale, setScale] = useState(1)

  useEffect(() => { if (open) setScale(1) }, [open])

  const zoomIn = useCallback(() => setScale(s => Math.min(s + ZOOM_STEP, ZOOM_MAX)), [])
  const zoomOut = useCallback(() => setScale(s => Math.max(s - ZOOM_STEP, ZOOM_MIN)), [])
  const zoomReset = useCallback(() => setScale(1), [])

  return (
    <Dialog
      open={open}
      className="dialog-padding-s"
      style={{ width: '80vw', height: '70vh' }}
      onClose={onClose}
    >
      <Bar design="Header" slot="header">
        <Text slot="startContent" style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)' }}>
          {title ?? 'Diagram Preview'}
        </Text>
        <Button slot="endContent" icon="decline" design="Transparent" onClick={onClose} />
      </Bar>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', minHeight: '400px' }}>
        <div style={{
          width: '100%',
          height: '100%',
          transformOrigin: 'center center',
          transform: `scale(${scale})`,
          transition: 'transform 150ms ease',
        }}>
          {bpmnXml
            ? <BpmnViewer xml={bpmnXml} disableNavigation style={{ width: '100%', height: '100%' }} />
            : <BpmnDiagramSvg width="100%" height="100%" />
          }
        </div>

        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          display: 'flex', flexDirection: 'column', gap: '2px',
          background: 'white', borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
          padding: '2px',
        }}>
          <Button icon="add" design="Transparent" tooltip="Zoom in" onClick={zoomIn} style={{ width: '32px', height: '32px' }} />
          <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0 4px' }} />
          <Button icon="reset" design="Transparent" tooltip="Reset zoom" onClick={zoomReset} style={{ width: '32px', height: '32px' }} />
          <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0 4px' }} />
          <Button icon="less" design="Transparent" tooltip="Zoom out" onClick={zoomOut} style={{ width: '32px', height: '32px' }} />
        </div>
      </div>
    </Dialog>
  )
}
