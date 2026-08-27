import React from 'react'
import s from './StickyNote.module.css'

type Position =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'

interface StickyNoteProps {
  position?: Position
  /** Header text — defaults to "Designers Note:". Pass empty string to hide. */
  header?: string
  /** HTML text string */
  text?: string
  /** UI5 controls or custom layout — rendered without any text styling. */
  content?: React.ReactNode
  /** Show the Close (×) button. Default: true. */
  closable?: boolean
}

export function StickyNote({ header = 'Designers Note:', text, content, position = 'top-right', closable = true }: StickyNoteProps) {
  const uid = React.useId().replace(/:/g, '')
  const gradient    = `${uid}-linearGradient`
  const cornerShadow = `${uid}-corner-shadow`
  const bgShadow    = `${uid}-bg-shadow`
  const sticky      = `${uid}-sticky`

  const [dismissed, setDismissed] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const dragOffset = React.useRef<{ x: number; y: number } | null>(null)
  const hasDragged = React.useRef(false)

  // CSS transform centering lands on fractional pixels → gaps in the 9-slice grid.
  // Snap to integer px on mount and on resize (unless the user has dragged the note).
  const snapPosition = React.useCallback(() => {
    const el = anchorRef.current
    if (!el || hasDragged.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = el.offsetWidth
    const h = el.offsetHeight
    switch (position) {
      case 'top':
        el.style.left = `${Math.round(vw / 2 - w / 2)}px`
        el.style.right = 'auto'
        el.style.transform = 'none'
        break
      case 'bottom':
        el.style.left = `${Math.round(vw / 2 - w / 2)}px`
        el.style.right = 'auto'
        el.style.transform = 'none'
        break
      case 'left':
        el.style.top = `${Math.round(vh / 2 - h / 2)}px`
        el.style.transform = 'none'
        break
      case 'right':
        el.style.top = `${Math.round(vh / 2 - h / 2)}px`
        el.style.transform = 'none'
        break
      case 'center':
        el.style.top = `${Math.round(vh / 2 - h / 2)}px`
        el.style.left = `${Math.round(vw / 2 - w / 2)}px`
        el.style.right = 'auto'
        el.style.bottom = 'auto'
        el.style.transform = 'none'
        break
    }
  }, [position])

  React.useLayoutEffect(() => {
    snapPosition()
    window.addEventListener('resize', snapPosition)
    return () => window.removeEventListener('resize', snapPosition)
  }, [snapPosition])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.dragging = ''
    const rect = e.currentTarget.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current || !anchorRef.current) return
    hasDragged.current = true
    const el = anchorRef.current
    el.style.top = `${e.clientY - dragOffset.current.y}px`
    el.style.left = `${e.clientX - dragOffset.current.x}px`
    el.style.right = 'auto'
    el.style.bottom = 'auto'
    el.style.transform = 'none'
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragOffset.current = null
    delete e.currentTarget.dataset.dragging
  }

  if (dismissed) return null

  return (
    <div
      ref={anchorRef}
      className={s.anchor}
      data-position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Hidden SVG defs — the sticky note design, filters and gradient */}
      <svg aria-hidden="true" className={s.defs}>
        <defs>
          <linearGradient
            id={gradient}
            x1="128" x2="130" y1="141" y2="168"
            gradientTransform="translate(-20,-60)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffe599" offset="0" />
            <stop stopColor="#ffe599" stopOpacity={0.4} offset="1" />
          </linearGradient>
          <filter id={cornerShadow} x="-.11" y="-.28" height="1.6">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={bgShadow} x="-.11" y="-.16" height="1.3">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <g id={sticky} transform="scale(0.5)">
            <path
              d="m20 20h140v77s1.2 4.1-18 11c-22 7.5-64 12-91 12h-31z"
              filter={`url(#${bgShadow})`}
              opacity=".3"
              stroke="#000"
              strokeLinejoin="round"
              strokeWidth="8"
            />
            <path d="m20 20h140v77s-47 23-109 23h-31z" fill="#ffe6b3" />
            <path
              d="m133 77c8 5.4 19 14 27 20 0 0-47 23-109 23 42-7.4 50-13 81-43z"
              filter={`url(#${cornerShadow})`}
              opacity=".25"
            />
            <path
              d="m134 81c8 5.4 17 10 26 16 0 0-14 6.6-36 13-19 5.3-45 10-73 10 42-7.4 52-9.7 83-39z"
              fill={`url(#${gradient})`}
            />
          </g>
        </defs>
      </svg>

      <div className={s.note}>
        {/* 9-slice grid background — tracks snapped to integer px by ResizeObserver */}
        <div className={s.grid}>
          <svg viewBox="0 0 14 14"       overflow="hidden"><use href={`#${sticky}`} /></svg>
          <svg viewBox="14 0 14 14"      overflow="hidden" preserveAspectRatio="none"><use href={`#${sticky}`} /></svg>
          <svg viewBox="28 0 62 14"      overflow="hidden"><use href={`#${sticky}`} /></svg>

          <svg viewBox="0 14 14 6"       overflow="hidden" preserveAspectRatio="none"><use href={`#${sticky}`} /></svg>
          <div className={s.fill} />
          <svg viewBox="28 14 62 6"      overflow="hidden" preserveAspectRatio="none"><use href={`#${sticky}`} /></svg>

          <svg viewBox="0 36 14 34"      overflow="hidden"><use href={`#${sticky}`} /></svg>
          <svg viewBox="14 36 14 34"     overflow="hidden" preserveAspectRatio="none"><use href={`#${sticky}`} /></svg>
          <svg viewBox="28 36 62 34"     overflow="hidden"><use href={`#${sticky}`} /></svg>
        </div>

        {closable && <button
          type="button"
          className={s.close}
          title="Close"
          onClick={() => setDismissed(true)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>}

        {header && <div className={s.title}>{header}</div>}

        <div className={[s.content, text ? s.textMode : ''].join(' ')} onPointerDown={e => e.stopPropagation()}>{text ? <span dangerouslySetInnerHTML={{ __html: text }} /> : content}</div>
      </div>
    </div>
  )
}
