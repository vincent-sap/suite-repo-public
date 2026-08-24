import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@ui5/webcomponents-react'
import { BpmnDiagramSvg } from './components'

interface ScrimRect { left: number; top: number; width: number; height: number }

export interface ViewportHint {
  /** Normalised rect of the visible area within the SVG (values may be outside 0–1 when panned) */
  nx: number; ny: number; nw: number; nh: number
  animated: boolean
}

interface MagicZoomProps {
  scrimRect: ScrimRect
  /** Ref to normalised cursor position on the thumbnail — written by parent on mousemove without causing re-renders */
  focusRef: React.RefObject<{ nx: number; ny: number }>
  onClose: () => void
  onScrimEnter: () => void
  onViewportChange?: (vp: ViewportHint | null) => void
}

const MARGIN = 32
const FOLLOW_SCALE = 2
const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.5
const ZOOM_MAX = 6
const SVG_W = 900
const SVG_H = 340
const HEADER_H = 41

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function fitTransform(areaW: number, areaH: number) {
  const scale = Math.min(areaW / SVG_W, areaH / SVG_H, 1)
  return { scale, x: (areaW - SVG_W * scale) / 2, y: (areaH - SVG_H * scale) / 2 }
}

function followTransform(nx: number, ny: number, areaW: number, areaH: number) {
  return { scale: FOLLOW_SCALE, x: areaW / 2 - nx * SVG_W * FOLLOW_SCALE, y: areaH / 2 - ny * SVG_H * FOLLOW_SCALE }
}

export default function MagicZoom({ scrimRect, focusRef, onClose, onScrimEnter, onViewportChange }: MagicZoomProps) {
  const [visible, setVisible] = useState(false)
  // "follow" = cursor on thumbnail drives the view; "free" = user controls
  const [mode, setMode] = useState<'follow' | 'free'>('follow')
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: FOLLOW_SCALE })
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgWrapRef = useRef<HTMLDivElement>(null)
  // last transform written by the rAF loop — read when transitioning to free mode
  const lastFollowTransform = useRef({ x: 0, y: 0, scale: FOLLOW_SCALE })
  const modeRef = useRef<'follow' | 'free'>('follow')

  const cardWidth = scrimRect.width - 2 * MARGIN
  const cardHeight = scrimRect.height - 2 * MARGIN
  const areaW = cardWidth - 16
  const areaH = cardHeight - HEADER_H - 16
  // keep stable refs so the rAF loop sees current values without re-subscribing
  const areaWRef = useRef(areaW)
  const areaHRef = useRef(areaH)
  areaWRef.current = areaW
  areaHRef.current = areaH

  // Fade in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // rAF loop — drives the SVG transform in follow mode with zero React re-renders.
  // Reads focusRef (written by parent mousemove handler) and writes directly to DOM.
  useEffect(() => {
    if (mode !== 'follow') return
    let rafId: number
    const tick = () => {
      if (modeRef.current !== 'follow') return
      const f = focusRef.current
      if (f && svgWrapRef.current) {
        const tr = followTransform(f.nx, f.ny, areaWRef.current, areaHRef.current)
        lastFollowTransform.current = tr
        svgWrapRef.current.style.transform = `translate(${tr.x}px,${tr.y}px) scale(${tr.scale})`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [mode, focusRef])

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Notify parent of viewport in free mode only (follow mode runs at 60fps — never update parent then)
  useEffect(() => {
    if (mode !== 'free' || !onViewportChange) return
    onViewportChange({
      nx: -transform.x / (transform.scale * SVG_W),
      ny: -transform.y / (transform.scale * SVG_H),
      nw: areaW / (transform.scale * SVG_W),
      nh: areaH / (transform.scale * SVG_H),
      animated: false,
    })
  }, [transform, areaW, areaH, mode, onViewportChange])

  useEffect(() => () => { onViewportChange?.(null) }, [onViewportChange])

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(onClose, 200)
  }
  const handleMouseEnter = () => {
    if (leaveTimerRef.current) { clearTimeout(leaveTimerRef.current); leaveTimerRef.current = null }
    if (mode === 'follow') {
      modeRef.current = 'free'
      // Seed React state from the last rAF-written position before handing off to React
      setTransform(lastFollowTransform.current)
      setMode('free')
      onScrimEnter()
    }
  }

  // ── Wheel zoom toward cursor ────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setTransform(prev => {
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      const next = clamp(prev.scale + delta, ZOOM_MIN, ZOOM_MAX)
      const ratio = next / prev.scale
      return { scale: next, x: mx - (mx - prev.x) * ratio, y: my - (my - prev.y) * ratio }
    })
  }, [])

  // ── Drag to pan ─────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    isDragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y }
    e.preventDefault()
  }, [transform])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    setTransform(prev => ({
      ...prev,
      x: dragStart.current.tx + e.clientX - dragStart.current.mx,
      y: dragStart.current.ty + e.clientY - dragStart.current.my,
    }))
  }, [])

  const stopDrag = useCallback(() => { isDragging.current = false }, [])

  // ── Button zoom toward centre ───────────────────────────────────────────────
  const zoomBy = useCallback((delta: number) => {
    const cx = areaW / 2, cy = areaH / 2
    setTransform(prev => {
      const next = clamp(prev.scale + delta, ZOOM_MIN, ZOOM_MAX)
      const ratio = next / prev.scale
      return { scale: next, x: cx - (cx - prev.x) * ratio, y: cy - (cy - prev.y) * ratio }
    })
  }, [areaW, areaH])

  const resetZoom = useCallback(() => {
    modeRef.current = 'free'
    setMode('free')
    setTransform(fitTransform(areaW, areaH))
  }, [areaW, areaH])

  return createPortal(
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ position: 'fixed', left: scrimRect.left, top: scrimRect.top, width: scrimRect.width, height: scrimRect.height, zIndex: 9998, pointerEvents: 'auto' }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', opacity: visible ? 1 : 0, transition: 'opacity 180ms ease' }}
      />

      {/* Preview card */}
      <div style={{
        position: 'absolute', left: MARGIN, top: MARGIN, width: cardWidth, height: cardHeight,
        zIndex: 1, background: 'white', borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.97)',
        transition: 'opacity 180ms ease, transform 180ms ease',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 12px 6px 16px', borderBottom: '1px solid var(--sapList_BorderColor)',
          background: 'var(--sapPageHeader_Background, #fff)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '600', color: 'var(--sapTextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            Procure-to-Pay Process — Quick Preview
          </span>
          <Button icon="decline" design="Transparent" onClick={onClose} tooltip="Close Preview" style={{ flexShrink: 0 }} />
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={mode === 'free' ? handleMouseDown : undefined}
          onMouseMove={mode === 'free' ? handleMouseMove : undefined}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          style={{
            flex: 1, overflow: 'hidden', position: 'relative',
            cursor: mode === 'follow' ? 'crosshair' : isDragging.current ? 'grabbing' : 'grab',
            padding: '8px', userSelect: 'none',
          }}
        >
          <div
            ref={svgWrapRef}
            style={{
              position: 'absolute', transformOrigin: '0 0',
              // follow mode: rAF loop writes style.transform directly — no value needed here
              // free mode: React state drives the transform
              ...(mode === 'free' ? {
                transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`,
                transition: 'none',
              } : {
                transition: 'transform 80ms linear',
              }),
            }}
          >
            <BpmnDiagramSvg width={SVG_W} height={SVG_H} />
          </div>

          {/* Zoom controls — bottom right */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            display: 'flex', flexDirection: 'column', gap: '2px',
            background: 'white', borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
            padding: '2px',
          }}
            onMouseDown={e => e.stopPropagation()}
          >
            <Button icon="add" design="Transparent" tooltip="Zoom In" onClick={() => { modeRef.current = 'free'; setMode('free'); zoomBy(ZOOM_STEP) }} style={{ width: '32px', height: '32px' }} />
            <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0 4px' }} />
            <Button icon="reset" design="Transparent" tooltip="Reset Zoom" onClick={resetZoom} style={{ width: '32px', height: '32px' }} />
            <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0 4px' }} />
            <Button icon="less" design="Transparent" tooltip="Zoom Out" onClick={() => { modeRef.current = 'free'; setMode('free'); zoomBy(-ZOOM_STEP) }} style={{ width: '32px', height: '32px' }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
