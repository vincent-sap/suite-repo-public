import React, { useState, useRef, useEffect } from 'react'
import { Icon, Text, TreeItem, Button } from '@ui5/webcomponents-react'
import type { FolderNode, AccessRole } from './data'
import { SELECTABLE_ROLES } from './data'

export function BpmnDiagramSvg({ width = 900, height = 340 }: { width?: number | string; height?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 340"
      width={width}
      height={height}
      style={{ display: 'block', background: 'white', pointerEvents: 'none' }}
    >
      {/* Pool outline */}
      <rect x="10" y="10" width="880" height="320" rx="3" fill="white" stroke="#b0c4d8" strokeWidth="1.5" />
      {/* Pool label */}
      <rect x="10" y="10" width="28" height="320" rx="3" fill="#dce9f5" stroke="#b0c4d8" strokeWidth="1.5" />
      <text transform="rotate(-90,24,170)" x="24" y="174" textAnchor="middle" fontSize="9" fill="#3d5a7a" fontFamily="Arial,sans-serif" fontWeight="600">Accounts Receivable</text>

      {/* Lane: Customer (top) */}
      <rect x="38" y="10" width="852" height="110" fill="#f7fbff" stroke="#b0c4d8" strokeWidth="1" />
      <rect x="38" y="10" width="28" height="110" fill="#e8f1fb" stroke="#b0c4d8" strokeWidth="1" />
      <text transform="rotate(-90,52,65)" x="52" y="69" textAnchor="middle" fontSize="8" fill="#3d5a7a" fontFamily="Arial,sans-serif">Customer</text>

      {/* Lane: Company (bottom) */}
      <rect x="38" y="120" width="852" height="210" fill="white" stroke="#b0c4d8" strokeWidth="1" />
      <rect x="38" y="120" width="28" height="210" fill="#e8f1fb" stroke="#b0c4d8" strokeWidth="1" />
      <text transform="rotate(-90,52,225)" x="52" y="229" textAnchor="middle" fontSize="8" fill="#3d5a7a" fontFamily="Arial,sans-serif">Company</text>

      {/* Sub-lane: AR Accountant */}
      <rect x="66" y="120" width="824" height="100" fill="#f9f9f9" stroke="#d0d8e4" strokeWidth="0.75" strokeDasharray="4,3" />
      <text x="75" y="133" fontSize="7" fill="#888" fontFamily="Arial,sans-serif" fontStyle="italic">Accounts Receivable Accountant</text>

      {/* ── Start event ── */}
      <circle cx="100" cy="225" r="14" fill="white" stroke="#1a7a3a" strokeWidth="2" />
      <text x="100" y="252" textAnchor="middle" fontSize="7" fill="#555" fontFamily="Arial,sans-serif">Daily</text>

      {/* ── Task 1: Complete Customer Master Data ── */}
      <rect x="130" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="175" y="217" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Complete</text>
      <text x="175" y="228" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Customer</text>
      <text x="175" y="239" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Master Data</text>

      {/* ── Task 2: Run Distribution of Data ── */}
      <rect x="242" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="287" y="217" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Run Distribution</text>
      <text x="287" y="228" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">of Data</text>

      {/* ── Task 3: Create Worklist ── */}
      <rect x="354" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="399" y="221" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Create</text>
      <text x="399" y="232" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Worklist</text>

      {/* ── Task 4: Calling Worklist ── */}
      <rect x="466" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="511" y="221" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Calling</text>
      <text x="511" y="232" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Worklist</text>

      {/* ── Task 5: Preparing Customer Contact ── */}
      <rect x="578" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="623" y="217" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Preparing</text>
      <text x="623" y="228" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Customer</text>
      <text x="623" y="239" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Contact</text>

      {/* ── XOR gateway after Preparing Contact ── */}
      <polygon points="700,210 714,225 700,240 686,225" fill="#ffe082" stroke="#c8b400" strokeWidth="1.5" />
      <line x1="692" y1="217" x2="708" y2="233" stroke="#c8b400" strokeWidth="1.5" />
      <line x1="708" y1="217" x2="692" y2="233" stroke="#c8b400" strokeWidth="1.5" />

      {/* Branch label: Customer commits to pay */}
      <text x="703" y="176" fontSize="7" fill="#555" fontFamily="Arial,sans-serif" textAnchor="middle">Customer</text>
      <text x="703" y="186" fontSize="7" fill="#555" fontFamily="Arial,sans-serif" textAnchor="middle">commits to pay</text>
      {/* Branch label: Customer asks for resubmission */}
      <text x="738" y="220" fontSize="7" fill="#555" fontFamily="Arial,sans-serif">Customer asks</text>
      <text x="738" y="230" fontSize="7" fill="#555" fontFamily="Arial,sans-serif">for resubmission</text>
      {/* Branch label: Customer indicates incorrect invoice */}
      <text x="703" y="270" fontSize="7" fill="#555" fontFamily="Arial,sans-serif" textAnchor="middle">Customer indicates</text>
      <text x="703" y="280" fontSize="7" fill="#555" fontFamily="Arial,sans-serif" textAnchor="middle">incorrect invoice</text>

      {/* ── Task: Create Promise to Pay (Customer lane) ── */}
      <rect x="730" y="30" width="90" height="55" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="775" y="52" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Create Promise</text>
      <text x="775" y="63" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">to Pay</text>

      {/* ── Task: Create Resubmission ── */}
      <rect x="730" y="195" width="90" height="60" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="775" y="221" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Create</text>
      <text x="775" y="232" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Resubmission</text>

      {/* ── Task: Create Dispute Case ── */}
      <rect x="730" y="275" width="90" height="50" rx="5" fill="#fffde8" stroke="#c8b400" strokeWidth="1.5" />
      <text x="775" y="297" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Create Dispute</text>
      <text x="775" y="308" textAnchor="middle" fontSize="7.5" fill="#4a3c00" fontFamily="Arial,sans-serif" fontWeight="600">Case</text>

      {/* ── Closing XOR gateway ── */}
      <polygon points="840,40 854,57 840,73 826,57" fill="#ffe082" stroke="#c8b400" strokeWidth="1.5" />
      <line x1="832" y1="48" x2="848" y2="64" stroke="#c8b400" strokeWidth="1.5" />
      <line x1="848" y1="48" x2="832" y2="64" stroke="#c8b400" strokeWidth="1.5" />

      {/* ── End event ── */}
      <circle cx="868" cy="225" r="14" fill="white" stroke="#c0392b" strokeWidth="3.5" />

      {/* ── SAP FICO system annotation ── */}
      <rect x="354" y="262" width="202" height="36" rx="3" fill="#dde9f7" stroke="#6a9fd8" strokeWidth="1" strokeDasharray="5,3" />
      <text x="455" y="279" textAnchor="middle" fontSize="7.5" fill="#3d6a9a" fontFamily="Arial,sans-serif">SAP FICO</text>
      <line x1="399" y1="255" x2="399" y2="262" stroke="#6a9fd8" strokeWidth="1" strokeDasharray="3,3" />
      <line x1="511" y1="255" x2="511" y2="262" stroke="#6a9fd8" strokeWidth="1" strokeDasharray="3,3" />

      {/* ── Sequence flows ── */}
      {/* Start → T1 */}
      <line x1="114" y1="225" x2="130" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* T1 → T2 */}
      <line x1="220" y1="225" x2="242" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* T2 → T3 */}
      <line x1="332" y1="225" x2="354" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* T3 → T4 */}
      <line x1="444" y1="225" x2="466" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* T4 → T5 */}
      <line x1="556" y1="225" x2="578" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* T5 → XOR */}
      <line x1="668" y1="225" x2="686" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* XOR → Promise to Pay (up, crosses lane) */}
      <polyline points="700,210 700,57 730,57" fill="none" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* XOR → Resubmission (right) */}
      <line x1="714" y1="225" x2="730" y2="225" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* XOR → Dispute Case (down) */}
      <polyline points="700,240 700,300 730,300" fill="none" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* Promise to Pay → closing XOR */}
      <line x1="820" y1="57" x2="826" y2="57" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* Resubmission → closing XOR (up) */}
      <polyline points="820,225 854,225 854,73" fill="none" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* Closing XOR → End */}
      <polyline points="854,57 868,57 868,211" fill="none" stroke="#333" strokeWidth="1.5" markerEnd="url(#arr)" />

      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#333" />
        </marker>
      </defs>
    </svg>
  )
}

import type { ViewportHint } from './MagicZoom'
import { BpmnViewer } from '../components/BpmnViewer'

export function DiagramThumbnail({ onMouseEnter, onMouseLeave, onMouseMove, viewport, onClick, style, bpmnXml }: {
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onMouseMove?: (nx: number, ny: number) => void
  viewport?: ViewportHint | null
  onClick?: () => void
  style?: React.CSSProperties
  bpmnXml?: string
}) {
  const [overlayVisible, setOverlayVisible] = useState(false)

  // Fade the overlay in one frame after it mounts; clear immediately on unmount
  useEffect(() => {
    if (!viewport) { setOverlayVisible(false); return }
    const id = requestAnimationFrame(() => setOverlayVisible(true))
    return () => cancelAnimationFrame(id)
  }, [!viewport])  // eslint-disable-line react-hooks/exhaustive-deps

  const vp = viewport ? {
    x: Math.max(0, viewport.nx) * 100,
    y: Math.max(0, viewport.ny) * 100,
    w: Math.min(1, viewport.nx + viewport.nw) * 100 - Math.max(0, viewport.nx) * 100,
    h: Math.min(1, viewport.ny + viewport.nh) * 100 - Math.max(0, viewport.ny) * 100,
  } : null

  const moveTr = viewport?.animated ? '80ms linear' : '0ms'

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove ? (e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
        onMouseMove(
          Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
          Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
        )
      } : undefined}
      style={{ width: '100%', aspectRatio: '16 / 9', background: 'white', overflow: 'hidden', cursor: 'zoom-in', position: 'relative', ...style }}
    >
      {bpmnXml
        ? <BpmnViewer xml={bpmnXml} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
        : <BpmnDiagramSvg width="100%" height="100%" />
      }
      {onClick && <div style={{ position: 'absolute', inset: 0, cursor: 'zoom-in' }} onClick={onClick} />}
      {vp && (
        <div style={{ position: 'absolute', inset: 0, opacity: overlayVisible ? 1 : 0, transition: 'opacity 200ms ease', pointerEvents: 'none' }}>
          {/* Top */}
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: `${vp.y}%`, background: 'rgba(0,0,0,0.38)', transition: `height ${moveTr}, top ${moveTr}` }} />
          {/* Bottom */}
          <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, top: `${vp.y + vp.h}%`, background: 'rgba(0,0,0,0.38)', transition: `top ${moveTr}` }} />
          {/* Left */}
          <div style={{ position: 'absolute', left: 0, top: `${vp.y}%`, width: `${vp.x}%`, height: `${vp.h}%`, background: 'rgba(0,0,0,0.38)', transition: `top ${moveTr}, width ${moveTr}, height ${moveTr}` }} />
          {/* Right */}
          <div style={{ position: 'absolute', left: `${vp.x + vp.w}%`, top: `${vp.y}%`, right: 0, height: `${vp.h}%`, background: 'rgba(0,0,0,0.38)', transition: `left ${moveTr}, top ${moveTr}, height ${moveTr}` }} />
          {/* Viewport border */}
          <div style={{
            position: 'absolute',
            left: `${vp.x}%`, top: `${vp.y}%`,
            width: `${vp.w}%`, height: `${vp.h}%`,
            border: '1.5px solid rgba(255,255,255,0.85)',
            borderRadius: '2px',
            transition: `left ${moveTr}, top ${moveTr}, width ${moveTr}, height ${moveTr}`,
          }} />
        </div>
      )}
    </div>
  )
}

export const statusChipStyle = (status?: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '1px 8px',
  borderRadius: '10px',
  fontSize: 'var(--sapFontSmallSize)',
  background: status === 'Published' ? '#e8f4e8' : status === 'Draft' ? '#f0f0f0' : '#fff3e0',
  color: status === 'Published' ? '#1a7a1a' : status === 'Draft' ? '#6a6a6a' : '#b35900',
  fontFamily: "var(--sapFontFamily, '72', sans-serif)",
  whiteSpace: 'nowrap',
})

export const dot = <span style={{ margin: '0 4px', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>·</span>

export function InfoPanelSection({ title, body }: { title: string; body?: string }) {
  const [expanded, setExpanded] = useState(true)
  if (!body) return null
  return (
    <>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer', borderTop: '1px solid var(--sapList_BorderColor)' }}
        onClick={() => setExpanded(v => !v)}
      >
        <Icon name={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} style={{ fontSize: '0.75rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>{title}</Text>
      </div>
      {expanded && (
        <div style={{ padding: '0.5rem 0 0.75rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', lineHeight: '1.4', whiteSpace: 'pre-wrap', borderBottom: '1px solid var(--sapList_BorderColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          {body}
        </div>
      )}
    </>
  )
}

export function AccessLevelSelect({ value, onChange, readonly = false }: {
  value: AccessRole
  onChange: (v: AccessRole) => void
  readonly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [dropRect, setDropRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const canEdit = !readonly && ['Viewer', 'Organizer', 'Editor'].includes(value)

  const handleTrigger = () => {
    if (!canEdit) return
    if (!open && triggerRef.current) setDropRect(triggerRef.current.getBoundingClientRect())
    setOpen(v => !v)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        ref={triggerRef as React.Ref<any>}
        design="Transparent"
        icon={canEdit ? 'slim-arrow-down' : undefined}
        endIcon={canEdit ? 'slim-arrow-down' : undefined}
        onClick={handleTrigger}
        disabled={!canEdit}
        style={{
          padding: '0 8px', height: '36px', minWidth: '94px',
          background: 'var(--sapField_Background)',
          border: open ? '2px solid var(--sapField_Active_BorderColor)' : '1px solid var(--sapField_BorderColor)',
          borderRadius: '4px',
          color: canEdit ? 'var(--sapLink_Color)' : 'var(--sapContent_LabelColor)',
          fontSize: 'var(--sapFontSize)',
          '--ui5-button-text-color': canEdit ? 'var(--sapLink_Color)' : 'var(--sapContent_LabelColor)',
        } as React.CSSProperties}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{value}</span>
      </Button>
      {open && dropRect && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: dropRect.bottom + 2,
            left: dropRect.left,
            zIndex: 9999,
            background: 'var(--sapList_Background)',
            borderRadius: '8px',
            boxShadow: '0 0 0 1px rgba(34,54,73,0.48), 0 2px 8px 0 rgba(34,54,73,0.3)',
            width: '340px',
            overflow: 'hidden',
          }}
        >
          {SELECTABLE_ROLES.map((role, i) => (
            <Button
              key={role.value}
              design="Transparent"
              onClick={() => { onChange(role.value); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '13px 16px',
                background: value === role.value ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                borderBottom: i < SELECTABLE_ROLES.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                borderRadius: 0,
                textAlign: 'left' as const,
                height: 'auto',
                justifyContent: 'flex-start',
              } as React.CSSProperties}
            >
              <Icon name={role.icon} style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--sapTextColor)' }}>{role.value}</div>
                <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '2px' }}>{role.description}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export const renderFolderNodes = (nodes: FolderNode[], selectedId?: string, expandedIds?: Set<string>): React.ReactNode =>
  nodes.map(node => (
    <TreeItem key={node.id} text={node.name} icon="folder-blank" data-id={node.id} selected={selectedId === node.id} hasChildren={!!(node.children?.length)} expanded={expandedIds?.has(node.id) || undefined}>
      {node.children && renderFolderNodes(node.children, selectedId, expandedIds)}
    </TreeItem>
  ))
