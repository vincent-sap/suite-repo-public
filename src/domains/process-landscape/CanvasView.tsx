import React, { useState, useEffect, useMemo, useCallback } from 'react'
import '@xyflow/react/dist/style.css'
import {
  ReactFlow, Background, MiniMap, Panel,
  useNodesState, useEdgesState, useReactFlow, useViewport,
  Handle, Position,
  type Node, type Edge, type NodeProps, type EdgeProps, type NodeChange,
} from '@xyflow/react'
import { Input, Icon, Text, SegmentedButton, SegmentedButtonItem, Button, CheckBox, Avatar } from '@ui5/webcomponents-react'
import { SigFilterBar, SigFilter, MultiSelect, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import type { FilterValues } from '@signavio/sap-signavio-uixtension'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import { resolveElements, hasActiveScope, type ResolvedElement } from './variantUtils'
import type { ProcessLevelNames, VariantDeviation } from './types'
import { USERS } from '../../data/users'

import {
  L1_LABEL_W, L1_LABEL_H, L1_ROW_H, L2_START_X, L2_SPACING, L3_SPACING,
  L2_DOT_SIZE, L3_SIZE, L2_NODE_W, L3_NODE_W,
  GROUP_PAD, GROUP_PAD_Y, GROUP_LABEL_H, CANVAS_PAD_TOP,
  VAR_LANE_FIRST_Y, VAR_LANE_H, VAR_STOP_SZ, BUNDLE_SPACING, IC_W, IC_H,
  LANE_PITCH_MAX, LANE_MARGIN, LANE_LABEL_BELOW,
  FN_COL_HEADER_H, FN_COL_MIN_W, FN_COL_INNER_PAD, FN_COL_GAP, FN_NODE_PITCH,
  FN_ORDERED_IDS, FN_ORDERED_NAMES, LINE_COLOR_INDICES, LINE_COLORS,
  roundedPath, octilinearPoints,
} from './canvas/layoutShared'
import type { DisplayLevel } from './canvas/layoutShared'

const LABEL_STYLE = {
  width: '100%',
  fontSize: 'var(--sapFontSmallSize)',
  color: 'var(--sapTextColor)',
  lineHeight: 1.2,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textAlign: 'center' as const,
  wordBreak: 'break-word' as const,
} as React.CSSProperties

const INVISIBLE_HANDLE: React.CSSProperties = {
  opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1,
}

// ── Edge path helpers ─────────────────────────────────────────────────────────
// Octilinear routing primitives (roundedPath, octilinearPoints) live in
// ./canvas/layoutShared and are imported above.

// Stub (32px horizontal) → 45° diagonal → straight → stub (32px horizontal),
// rounded corners. Handles both horizontal (Left/Right) and vertical (Top/Bottom)
// handle pairs; the result is always octilinear.
function getMetroLinePath(
  sx: number, sy: number, sp: Position,
  tx: number, ty: number, tp: Position,
  stub = 32, cr = 10,
): string {
  const horiz = sp === Position.Left || sp === Position.Right
  const sDir  = sp === Position.Right ? 1 : sp === Position.Left ? -1 : sp === Position.Bottom ? 1 : -1
  const tDir  = tp === Position.Left  ? 1 : tp === Position.Right ? -1 : tp === Position.Top    ? 1 : -1
  const pts = octilinearPoints(sx, sy, sDir, tx, ty, tDir, horiz ? 'h' : 'v', stub)
  return roundedPath(pts, cr)
}


// Stair-step path for detour lanes in the by-function view:
// stub right → vertical to laneY → horizontal at laneY → vertical back to ty → stub left.
function getLaneDetourPath(
  sx: number, sy: number,
  tx: number, ty: number,
  laneY: number,
  stub = 32, cr = 8,
): string {
  const p1x = sx + stub
  const p2x = tx - stub
  const vy1 = laneY < sy ? -1 : 1
  const vy2 = ty > laneY ? 1 : -1
  const hDir = p2x > p1x ? 1 : -1

  const clamp = (a: number, b: number) => Math.min(cr, Math.abs(a) / 2, Math.abs(b) / 2)
  const v1 = laneY - sy
  const v2 = ty - laneY
  const h  = p2x - p1x
  const r1 = clamp(stub, v1)
  const r2 = clamp(v1, h)
  const r3 = clamp(h, v2)
  const r4 = clamp(v2, stub)

  return [
    `M ${sx} ${sy}`,
    `L ${p1x - r1} ${sy}`,
    `Q ${p1x} ${sy} ${p1x} ${sy + vy1 * r1}`,
    `L ${p1x} ${laneY - vy1 * r2}`,
    `Q ${p1x} ${laneY} ${p1x + hDir * r2} ${laneY}`,
    `L ${p2x - hDir * r3} ${laneY}`,
    `Q ${p2x} ${laneY} ${p2x} ${laneY + vy2 * r3}`,
    `L ${p2x} ${ty - vy2 * r4}`,
    `Q ${p2x} ${ty} ${p2x + r4} ${ty}`,
    `L ${tx} ${ty}`,
  ].join(' ')
}

// ── Edge components ───────────────────────────────────────────────────────────
// Half-circle cap paths: flat side flush with band body endpoint, arc extending outward.
// sweep=0 → left-facing (arcs left); sweep=1 → right-facing (arcs right).
function halfCapLeft(x: number, y: number) {
  return `M ${x} ${y - 18} A 18 18 0 0 0 ${x} ${y + 18} Z`
}
function halfCapRight(x: number, y: number) {
  return `M ${x} ${y - 18} A 18 18 0 0 1 ${x} ${y + 18} Z`
}

function MetroLineEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const lineColor     = (data as any)?.lineColor     ?? '#888'
  const strokeWidth   = (data as any)?.strokeWidth   ?? 10
  const bgGroup       = (data as any)?.bgGroup       ?? false
  const bgGroupFirst  = (data as any)?.bgGroupFirst  ?? false
  const bgGroupLast   = (data as any)?.bgGroupLast   ?? false
  const dimmed        = (data as any)?.dimmed        ?? false
  const editMode      = (data as any)?.editMode      ?? false
  const onCB          = (data as any)?.onCreateBetween as ((s: string | null, t: string | null, p: string | null) => void) | undefined
  const srcElemId     = (data as any)?.sourceElementId as string | null ?? null
  const tgtElemId     = (data as any)?.targetElementId as string | null ?? null
  const parentId      = (data as any)?.sharedParentId as string | null ?? null

  const [hovered, setHovered] = useState(false)

  const capLX = sourceX - L3_SIZE / 2 - 1
  const capRX = targetX + L3_SIZE / 2 + 1
  const dBg = getMetroLinePath(capLX, sourceY, sourcePosition, capRX, targetY, targetPosition)
  const d   = getMetroLinePath(sourceX - 6, sourceY, sourcePosition, targetX + 6, targetY, targetPosition)
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2
  return (
    <g opacity={dimmed ? 0.25 : 1}>
      {bgGroup && (
        <g opacity={0.1}>
          <path d={dBg} stroke={lineColor} strokeWidth={36} fill="none" strokeLinecap="butt" />
          {bgGroupFirst && <path d={halfCapLeft(capLX, sourceY)} fill={lineColor} />}
          {bgGroupLast  && <path d={halfCapRight(capRX, targetY)} fill={lineColor} />}
        </g>
      )}
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <path d={d} strokeWidth={Math.max(strokeWidth, 20)} stroke="transparent" fill="none" />
        <path d={d} stroke={lineColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        {editMode && hovered && (
          <g transform={`translate(${midX}, ${midY})`}>
            <circle
              r={11} fill="white" stroke="var(--sapContent_ForegroundBorderColor)" strokeWidth={1.5}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => { e.stopPropagation(); onCB?.(srcElemId, tgtElemId, parentId) }}
            />
            <text textAnchor="middle" dominantBaseline="central" fontSize={16} fill="var(--sapTextColor)" style={{ userSelect: 'none', pointerEvents: 'none' }}>+</text>
          </g>
        )}
      </g>
    </g>
  )
}

function MetroLineFnEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const lineColor     = (data as any)?.lineColor     ?? '#888'
  const strokeWidth   = (data as any)?.strokeWidth   ?? 10
  const bgGroup       = (data as any)?.bgGroup       ?? false
  const bgGroupFirst  = (data as any)?.bgGroupFirst  ?? false
  const bgGroupLast   = (data as any)?.bgGroupLast   ?? false
  const editMode      = (data as any)?.editMode      ?? false
  const onCB          = (data as any)?.onCreateBetween as ((s: string | null, t: string | null, p: string | null) => void) | undefined
  const srcElemId     = (data as any)?.sourceElementId as string | null ?? null
  const tgtElemId     = (data as any)?.targetElementId as string | null ?? null
  const parentId      = (data as any)?.sharedParentId as string | null ?? null

  const [hovered, setHovered] = useState(false)

  const capLX = sourceX - L3_SIZE / 2 - 1
  const capRX = targetX + L3_SIZE / 2 + 1
  const dBg = getMetroLinePath(capLX, sourceY, sourcePosition, capRX, targetY, targetPosition)
  const d   = getMetroLinePath(sourceX - 6, sourceY, sourcePosition, targetX + 6, targetY, targetPosition)
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2
  return (
    <>
      {bgGroup && (
        <g opacity={0.1}>
          <path d={dBg} stroke={lineColor} strokeWidth={36} fill="none" strokeLinecap="butt" />
          {bgGroupFirst && <path d={halfCapLeft(capLX, sourceY)} fill={lineColor} />}
          {bgGroupLast  && <path d={halfCapRight(capRX, targetY)} fill={lineColor} />}
        </g>
      )}
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <path d={d} strokeWidth={Math.max(strokeWidth, 20)} stroke="transparent" fill="none" />
        <path d={d} stroke={lineColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        {editMode && hovered && (
          <g transform={`translate(${midX}, ${midY})`}>
            <circle
              r={11} fill="white" stroke="var(--sapContent_ForegroundBorderColor)" strokeWidth={1.5}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => { e.stopPropagation(); onCB?.(srcElemId, tgtElemId, parentId) }}
            />
            <text textAnchor="middle" dominantBaseline="central" fontSize={16} fill="var(--sapTextColor)" style={{ userSelect: 'none', pointerEvents: 'none' }}>+</text>
          </g>
        )}
      </g>
    </>
  )
}

function MetroLineLaneEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const lineColor     = (data as any)?.lineColor     ?? '#888'
  const strokeWidth   = (data as any)?.strokeWidth   ?? 10
  const laneY         = (data as any)?.laneY         ?? sourceY
  const bgGroup       = (data as any)?.bgGroup       ?? false
  const bgGroupFirst  = (data as any)?.bgGroupFirst  ?? false
  const bgGroupLast   = (data as any)?.bgGroupLast   ?? false
  const editMode      = (data as any)?.editMode      ?? false
  const onCB          = (data as any)?.onCreateBetween as ((s: string | null, t: string | null, p: string | null) => void) | undefined
  const srcElemId     = (data as any)?.sourceElementId as string | null ?? null
  const tgtElemId     = (data as any)?.targetElementId as string | null ?? null
  const parentId      = (data as any)?.sharedParentId as string | null ?? null

  const [hovered, setHovered] = useState(false)

  const capLX = sourceX - L3_SIZE / 2 - 1
  const capRX = targetX + L3_SIZE / 2 + 1
  const dBg = getLaneDetourPath(capLX, sourceY, capRX, targetY, laneY)
  const d   = getLaneDetourPath(sourceX - 6, sourceY, targetX + 6, targetY, laneY)
  const midX = (sourceX + targetX) / 2
  const midY = laneY
  return (
    <>
      {bgGroup && (
        <g opacity={0.1}>
          <path d={dBg} stroke={lineColor} strokeWidth={36} fill="none" strokeLinecap="butt" />
          {bgGroupFirst && <path d={halfCapLeft(capLX, sourceY)} fill={lineColor} />}
          {bgGroupLast  && <path d={halfCapRight(capRX, targetY)} fill={lineColor} />}
        </g>
      )}
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <path d={d} strokeWidth={Math.max(strokeWidth, 20)} stroke="transparent" fill="none" />
        <path d={d} stroke={lineColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        {editMode && hovered && (
          <g transform={`translate(${midX}, ${midY})`}>
            <circle
              r={11} fill="white" stroke="var(--sapContent_ForegroundBorderColor)" strokeWidth={1.5}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => { e.stopPropagation(); onCB?.(srcElemId, tgtElemId, parentId) }}
            />
            <text textAnchor="middle" dominantBaseline="central" fontSize={16} fill="var(--sapTextColor)" style={{ userSelect: 'none', pointerEvents: 'none' }}>+</text>
          </g>
        )}
      </g>
    </>
  )
}

function MetroBgEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const strokeWidth = (data as any)?.strokeWidth ?? 10
  const d = getMetroLinePath(sourceX - 6, sourceY, sourcePosition, targetX + 6, targetY, targetPosition)
  return <path d={d} stroke="var(--sapBaseColor)" strokeWidth={strokeWidth + 4} fill="none" strokeLinecap="round" />
}

function MetroBgLaneEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const strokeWidth = (data as any)?.strokeWidth ?? 10
  const laneY       = (data as any)?.laneY       ?? sourceY
  const d = getLaneDetourPath(sourceX - 6, sourceY, targetX + 6, targetY, laneY)
  return <path d={d} stroke="var(--sapBaseColor)" strokeWidth={strokeWidth + 4} fill="none" strokeLinecap="round" />
}

function MetroBandEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, data }: EdgeProps) {
  const lineColor    = (data as any)?.lineColor    ?? '#888'
  const bgGroupFirst = (data as any)?.bgGroupFirst ?? false
  const bgGroupLast  = (data as any)?.bgGroupLast  ?? false
  const capLX = sourceX - L3_SIZE / 2 - 1
  const capRX = targetX + L3_SIZE / 2 + 1
  const dBg = getMetroLinePath(capLX, sourceY, sourcePosition, capRX, targetY, targetPosition)
  return (
    <g opacity={0.1}>
      <path d={dBg} stroke={lineColor} strokeWidth={36} fill="none" strokeLinecap="butt" />
      {bgGroupFirst && <path d={halfCapLeft(capLX, sourceY)} fill={lineColor} />}
      {bgGroupLast  && <path d={halfCapRight(capRX, targetY)} fill={lineColor} />}
    </g>
  )
}

function MetroBandLaneEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const lineColor    = (data as any)?.lineColor    ?? '#888'
  const laneY        = (data as any)?.laneY        ?? sourceY
  const bgGroupFirst = (data as any)?.bgGroupFirst ?? false
  const bgGroupLast  = (data as any)?.bgGroupLast  ?? false
  const capLX = sourceX - L3_SIZE / 2 - 1
  const capRX = targetX + L3_SIZE / 2 + 1
  const dBg = getLaneDetourPath(capLX, sourceY, capRX, targetY, laneY)
  return (
    <g opacity={0.1}>
      <path d={dBg} stroke={lineColor} strokeWidth={36} fill="none" strokeLinecap="butt" />
      {bgGroupFirst && <path d={halfCapLeft(capLX, sourceY)} fill={lineColor} />}
      {bgGroupLast  && <path d={halfCapRight(capRX, targetY)} fill={lineColor} />}
    </g>
  )
}

// Parallel-track edge for L3 variants: octilinear, thinner than the main line,
// no translucent band (never sets bgGroup) so the group band stays untouched.
function VariantTrackEdge({ sourceX, sourceY, sourcePosition, targetX, targetY, data }: EdgeProps) {
  const lineColor = (data as any)?.lineColor ?? '#888'
  const dimmed    = (data as any)?.dimmed    ?? false
  // Single-elbow connector: a short vertical stub off the main line into the
  // variant (or back). Whichever endpoint is vertical (Top/Bottom) leads with
  // the vertical run, keeping the branch quiet and mostly vertical.
  const srcVertical = sourcePosition === Position.Top || sourcePosition === Position.Bottom
  const pts = srcVertical
    ? [{ x: sourceX, y: sourceY }, { x: sourceX, y: targetY }, { x: targetX, y: targetY }]
    : [{ x: sourceX, y: sourceY }, { x: targetX, y: sourceY }, { x: targetX, y: targetY }]
  const d = roundedPath(pts, 6)
  return <path d={d} stroke={lineColor} strokeWidth={4} fill="none" opacity={dimmed ? 0.25 : 0.6} strokeLinecap="round" />
}

// Invisible tap point on the main line where a variant branch joins/leaves.
// A 1px footprint (not zero) so React Flow measures its handle and renders the
// connected edges; exposes a single bottom handle whose role sets branch direction.
function VariantJunctionNode({ data }: NodeProps) {
  const role = (data as any)?.role
  return (
    <div style={{ width: 1, height: 1 }}>
      {role === 'source'
        ? <Handle type="source" position={Position.Bottom} id="bottom" style={INVISIBLE_HANDLE} />
        : <Handle type="target" position={Position.Bottom} id="bottom" style={INVISIBLE_HANDLE} />}
    </div>
  )
}

function InterchangeEdge({ sourceX, sourceY, targetX, targetY }: EdgeProps) {
  // Octilinear: pure vertical when x-aligned, otherwise 45° diagonal + straight.
  const d = Math.abs(sourceX - targetX) < 4
    ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    : roundedPath(octilinearPoints(sourceX, sourceY, 1, targetX, targetY, 1, 'v', 0), 6)
  return (
    <path
      d={d}
      stroke="var(--sapContent_LabelColor)"
      strokeWidth={1.5}
      strokeDasharray="4 3"
      fill="none"
      opacity={0.45}
      strokeLinecap="round"
    />
  )
}

// ── Node components ───────────────────────────────────────────────────────────
function L1LabelNode({ data }: NodeProps) {
  const d = data as { label: string; hierarchyId: string; lineColor: string; lineColorDesign: string; collapsed: boolean; dimmed?: boolean }
  return (
    <div style={{
      width: 'fit-content', height: L1_LABEL_H,
      background: d.lineColor,
      borderRadius: '9999px',
      padding: '0.125rem 0.5rem 0.125rem 0.75rem',
      display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.375rem',
      boxShadow: 'var(--sapContent_Shadow0)',
      cursor: 'pointer',
      boxSizing: 'border-box',
      opacity: d.dimmed ? 0.25 : 1,
    }}>
      <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.label}</div>
      <Icon
        name={d.collapsed ? 'slim-arrow-right' : 'slim-arrow-down'}
        style={{ color: 'white', fontSize: '0.625rem', flexShrink: 0, opacity: 0.8 }}
      />
      <Handle type="source" position={Position.Right} id="right" style={INVISIBLE_HANDLE} />
    </div>
  )
}

// Sticky L1 label overlay — rendered inside ReactFlow so it can read useViewport()
// Only shown when the canvas L1 nodes have scrolled off the left edge of the viewport.
function StickyL1Labels({ nodes, collapsedL1Ids: _collapsedL1Ids, onToggleCollapse, onSelect }: {
  nodes: Node[]
  collapsedL1Ids: Set<string>
  onToggleCollapse: (id: string) => void
  onSelect: (id: string) => void
}) {
  const { x: vpX, y: vpY, zoom } = useViewport()
  // Hide when the canvas pills are still on-screen (pill right edge = L2_START_X - 8)
  const pillRightEdge = (L2_START_X - 8) * zoom + vpX
  if (pillRightEdge >= 16) return null
  const l1Nodes = nodes.filter(n => n.type === 'l1-label')
  return (
    <Panel position="top-left" style={{ top: 0, left: 0, margin: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {l1Nodes.map(node => {
        const d = node.data as { label: string; hierarchyId: string; lineColor: string; lineColorDesign: string; elementId: string; collapsed: boolean; dimmed?: boolean }
        const centerY = (node.position.y + L1_LABEL_H / 2) * zoom + vpY
        return (
          <div key={node.id} style={{
            position: 'absolute',
            top: centerY - L1_LABEL_H / 2,
            left: 16,
            width: 'fit-content',
            pointerEvents: 'all',
            background: d.lineColor,
            borderRadius: '9999px',
            padding: '0.125rem 0.5rem 0.125rem 0.75rem',
            display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.375rem',
            boxShadow: 'var(--sapContent_Shadow0)',
            cursor: 'pointer',
            zIndex: 1000,
            boxSizing: 'border-box',
            opacity: d.dimmed ? 0.25 : 1,
          }}
            onClick={(e) => { e.stopPropagation(); onSelect(d.elementId) }}
          >
            <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.label}</div>
            <Icon
              name={d.collapsed ? 'slim-arrow-right' : 'slim-arrow-down'}
              style={{ color: 'white', fontSize: '0.625rem', flexShrink: 0, opacity: 0.8 }}
              onClick={(e: any) => { e.stopPropagation(); onToggleCollapse(d.elementId) }}
            />
          </div>
        )
      })}
    </Panel>
  )
}

function L2StopNode({ data }: NodeProps) {
  const d = data as {
    label: string; hierarchyId: string; allHierarchyIds: string[]; lineColor: string
    lineColorDesign: string; dimmed: boolean; expanded: boolean; isShared?: boolean
    l3Count?: number; hasEmbeddedVariants?: boolean
  }
  return (
    <div style={{ width: L2_DOT_SIZE, height: L2_DOT_SIZE, position: 'relative', opacity: d.dimmed ? 0.25 : 1, cursor: 'pointer' }}>
      <Handle type="target" position={Position.Left} id="left" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Right} id="right" style={INVISIBLE_HANDLE} />
      <Handle type="target" position={Position.Top} id="top" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Top} id="top-src" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={INVISIBLE_HANDLE} />
      {d.isShared && (
        <svg style={{ position: 'absolute', top: -5, left: -5, width: L2_DOT_SIZE + 10, height: L2_DOT_SIZE + 10, pointerEvents: 'none', overflow: 'visible' }}>
          <circle cx={(L2_DOT_SIZE + 10) / 2} cy={(L2_DOT_SIZE + 10) / 2} r={(L2_DOT_SIZE + 8) / 2}
            fill="none" stroke={d.lineColor} strokeWidth={1.5} strokeDasharray="3.5 3" opacity={0.65} />
        </svg>
      )}
      {d.hasEmbeddedVariants && !d.expanded && (
        <div style={{
          position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 6, borderRadius: '50%', background: d.lineColor,
          border: '1px solid var(--sapBaseColor)', boxSizing: 'content-box', pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: L2_DOT_SIZE, height: L2_DOT_SIZE, borderRadius: '50%',
        background: 'var(--sapBaseColor)',
        border: `3px solid ${d.lineColor}`,
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {(d.l3Count ?? 0) > 0 && !d.expanded && (
          <span style={{
            fontSize: '0.5rem', color: d.lineColor, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em',
          }}>{d.l3Count}</span>
        )}
        {d.expanded && (
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: d.lineColor }} />
        )}
      </div>
      <div style={{
        position: 'absolute',
        top: L2_DOT_SIZE + 4,
        left: d.expanded ? 0 : -(L2_NODE_W - L2_DOT_SIZE) / 2,
        width: L2_NODE_W,
        display: 'flex', flexDirection: 'column', alignItems: d.expanded ? 'flex-start' : 'center', gap: 2,
      }}>
        <div style={d.expanded ? { ...LABEL_STYLE, textAlign: 'left' } : LABEL_STYLE}>{d.label}</div>
      </div>
    </div>
  )
}

function L2GroupNode({ data, width = 160 }: NodeProps) {
  const d = data as {
    label: string; hierarchyId: string; lineColor: string; lineColorDesign: string; dimmed?: boolean
  }
  return (
    <div style={{ width, height: GROUP_LABEL_H, position: 'relative', overflow: 'visible', opacity: d.dimmed ? 0.25 : 1, pointerEvents: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4,
        height: '100%', paddingBottom: 2, paddingLeft: 24, cursor: 'pointer', pointerEvents: 'all',
      }}>
        <span style={{
          fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)', fontWeight: 600,
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{d.label}</span>
        <Icon name="slim-arrow-down" style={{ color: 'var(--sapContent_LabelColor)', fontSize: '0.5rem' }} />
      </div>
    </div>
  )
}

function L3StopNode({ data }: NodeProps) {
  const d = data as {
    label: string; hierarchyId: string; allHierarchyIds: string[]; lineColor: string
    lineColorDesign: string; dimmed: boolean; deviation?: string
  }
  const isVariant = d.deviation === 'changed' || d.deviation === 'added'
  return (
    <div style={{ width: L3_SIZE, height: L3_SIZE, position: 'relative', opacity: d.dimmed ? 0.25 : 1, animation: 'metroNodeEnter 0.18s ease-out' }}>
      <Handle type="target" position={Position.Left} id="left" style={INVISIBLE_HANDLE} />
      <Handle type="target" position={Position.Top} id="top" style={INVISIBLE_HANDLE} />
      <div style={{
        width: L3_SIZE, height: L3_SIZE, borderRadius: '50%',
        background: isVariant ? `${d.lineColor}22` : 'white',
        border: isVariant ? `1.5px dashed ${d.lineColor}` : `1.5px solid ${d.lineColor}`,
        boxSizing: 'border-box',
      }} />
      <div style={{
        position: 'absolute',
        top: L3_SIZE + 3,
        left: -(L3_NODE_W - L3_SIZE) / 2,
        width: L3_NODE_W,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <div style={LABEL_STYLE}>{d.label}</div>
      </div>
      <Handle type="source" position={Position.Right} id="right" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Top} id="top-src" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={INVISIBLE_HANDLE} />
    </div>
  )
}

function InterchangeStopNode({ data }: NodeProps) {
  const d = data as {
    elementId: string
    label: string
    allHierarchyIds: string[]
    lineColors: string[]
    lineColorDesigns: string[]
    dimmed: boolean
  }
  const w = IC_W
  const h = IC_H
  const n = d.lineColors.length
  // Micro-offset each participating row's handle within the 20px footprint so
  // lines bundle into the dot instead of piling on one pixel.
  const handleTop = (i: number) => {
    const raw = h / 2 + (i - (n - 1) / 2) * BUNDLE_SPACING
    return Math.max(2, Math.min(h - 2, raw))
  }
  return (
    <div style={{ width: w, height: h, position: 'relative', opacity: d.dimmed ? 0.25 : 1, cursor: 'pointer' }}>
      {d.lineColors.map((_, i) => (
        <React.Fragment key={i}>
          <Handle type="target" position={Position.Left} id={`left-${i}`}
            style={{ ...INVISIBLE_HANDLE, top: handleTop(i) }} />
          <Handle type="source" position={Position.Right} id={`right-${i}`}
            style={{ ...INVISIBLE_HANDLE, top: handleTop(i) }} />
        </React.Fragment>
      ))}
      {/* Top handles for lane detours that start/end at this interchange */}
      <Handle type="target" position={Position.Top} id="top" style={INVISIBLE_HANDLE} />
      <Handle type="source" position={Position.Top} id="top-src" style={INVISIBLE_HANDLE} />
      <div style={{
        width: w, height: h, borderRadius: '9999px',
        background: 'var(--sapBaseColor)', border: '3px solid #1a1a1a',
        boxSizing: 'border-box',
      }} />
      <div style={{
        position: 'absolute',
        top: h + 3,
        left: -(L3_NODE_W - w) / 2,
        width: L3_NODE_W,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <div style={LABEL_STYLE}>{d.label}</div>
      </div>
    </div>
  )
}

// A variant "stop" on a parallel track below its L3 template. Small dashed
// circle + a label block: a greyish rounded scope pill placed ahead of the
// variant name, both at the node label font size.
function VariantStopNode({ data }: NodeProps) {
  const d = data as {
    label: string; lineColor: string; scopeLabel: string; deviation: VariantDeviation
  }
  return (
    <div style={{ width: VAR_STOP_SZ, height: VAR_STOP_SZ, position: 'relative', animation: 'metroNodeEnter 0.18s ease-out' }}>
      <Handle type="target" position={Position.Left} id="left" style={INVISIBLE_HANDLE} />
      <div style={{
        width: VAR_STOP_SZ, height: VAR_STOP_SZ, borderRadius: '50%',
        background: d.lineColor,
        boxSizing: 'border-box',
      }} />
      <div style={{
        position: 'absolute',
        top: VAR_STOP_SZ + 3,
        left: -(L3_NODE_W - VAR_STOP_SZ) / 2,
        width: L3_NODE_W,
        display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
        gap: 3, flexWrap: 'nowrap',
      }}>
        <span style={{
          flex: '0 0 auto',
          fontSize: 'var(--sapFontSmallSize)', lineHeight: 1.2,
          color: 'var(--sapContent_LabelColor)',
          background: 'var(--sapButton_Lite_Hover_Background, var(--sapList_Background_Darken3, rgba(0,0,0,0.06)))',
          borderRadius: '0.5rem', padding: '0 0.375rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%',
        }}>{d.scopeLabel}</span>
        <span style={{
          flex: '1 1 auto',
          fontSize: 'var(--sapFontSmallSize)', lineHeight: 1.2, color: 'var(--sapTextColor)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{d.label}</span>
      </div>
      <Handle type="source" position={Position.Right} id="right" style={INVISIBLE_HANDLE} />
    </div>
  )
}

function LineTerminusNode({ data }: NodeProps) {
  const d = data as { lineColor: string }
  return (
    <div style={{ width: 16, height: 16, position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="left" style={INVISIBLE_HANDLE} />
      <Handle type="target" position={Position.Top} id="top" style={INVISIBLE_HANDLE} />
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: 'var(--sapBaseColor)',
        border: `3px solid ${d.lineColor}`,
        boxSizing: 'border-box',
      }} />
    </div>
  )
}

function FunctionColumnNode({ data }: NodeProps) {
  const d = data as { name: string; colIndex: number; colWidth: number; canvasH: number }
  return (
    <div style={{
      width: d.colWidth,
      height: d.canvasH,
      background: d.colIndex % 2 === 0 ? 'rgba(0,0,0,0.025)' : undefined,
      borderLeft: '1px solid var(--sapList_BorderColor)',
      position: 'relative',
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: FN_COL_HEADER_H,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        background: d.colIndex % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.01)',
      }}>
        <span style={{
          fontSize: 'var(--sapFontSmallSize)', fontWeight: '600',
          color: 'var(--sapContent_LabelColor)', letterSpacing: '0.02em',
          textTransform: 'uppercase', textAlign: 'center',
          padding: '0 8px', lineHeight: 1.2,
        }}>{d.name}</span>
      </div>
    </div>
  )
}

// Module-level registries
const nodeTypes = {
  'l1-label':         L1LabelNode,
  'l2-stop':          L2StopNode,
  'l2-group':         L2GroupNode,
  'l3-stop':          L3StopNode,
  'interchange-stop': InterchangeStopNode,
  'variant-stop':     VariantStopNode,
  'variant-junction': VariantJunctionNode,
  'line-terminus':    LineTerminusNode,
  'function-col':    FunctionColumnNode,
}

const edgeTypes = {
  'metro-band':      MetroBandEdge,
  'metro-band-lane': MetroBandLaneEdge,
  'metro-bg':        MetroBgEdge,
  'metro-bg-lane':   MetroBgLaneEdge,
  'metro-line':      MetroLineEdge,
  'metro-line-fn':   MetroLineFnEdge,
  'metro-line-lane': MetroLineLaneEdge,
  'variant-track':   VariantTrackEdge,
  'interchange':     InterchangeEdge,
}

// ── Graph builder ─────────────────────────────────────────────────────────────
function dominantFnId(l2Id: string, byParent: Map<string, { r: { element: any } }[]>): string | undefined {
  const counts = new Map<string, number>()
  for (const { r: { element: l3 } } of (byParent.get(l2Id) ?? [])) {
    if (l3.functionId) counts.set(l3.functionId, (counts.get(l3.functionId) ?? 0) + 1)
  }
  let best: string | undefined, bestN = 0
  for (const [fnId, n] of counts) { if (n > bestN) { bestN = n; best = fnId } }
  return best
}
function buildMetroGraph(
  resolved: ResolvedElement[],
  expandedIds: Set<string>,
  collapsedL1Ids: Set<string>,
  filterText: string,
  _levelNames: ProcessLevelNames,
  _displayLevel: DisplayLevel,
  scopeActive: boolean,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  // Variant stops whose outgoing track edge is wired after the build loop, once
  // every main-line edge exists (mirrors the parent stop's own outgoing edge).
  const pendingVariantTails: Array<{ variantId: string; stopId: string; lineColor: string; dimmed: boolean }> = []
  const filter = filterText.trim().toLowerCase()

  let l1s = resolved
    .filter(r => r.element.level === 1)
    .sort((a, b) => {
      const hcmp = a.element.hierarchyId.localeCompare(b.element.hierarchyId)
      return hcmp !== 0 ? hcmp : a.element.id.localeCompare(b.element.id)
    })

  type ByParentEntry = { r: ResolvedElement; isPrimary: boolean }
  const byParent = new Map<string, ByParentEntry[]>()
  for (const r of resolved) {
    const el = r.element
    if (el.parentId) {
      const arr = byParent.get(el.parentId) ?? []
      arr.push({ r, isPrimary: true })
      byParent.set(el.parentId, arr)
    }
    for (const refId of (el.referencedParentIds ?? [])) {
      const arr = byParent.get(refId) ?? []
      arr.push({ r, isPrimary: false })
      byParent.set(refId, arr)
    }
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      const hcmp = a.r.element.hierarchyId.localeCompare(b.r.element.hierarchyId, undefined, { numeric: true, sensitivity: 'base' })
      return hcmp !== 0 ? hcmp : a.r.element.id.localeCompare(b.r.element.id)
    })
  }

  // ── L1 row-order optimization ──────────────────────────────────────────────
  // Reorder the L1 "lines" so rows tied together by shared stops sit close,
  // minimizing total cross-row connector length (better legibility / density).
  // Seeded with the alphabetical order; only a strictly-cheaper permutation
  // replaces it, so with no shared stops the order is unchanged. Line color is
  // pinned to L1 identity (l1ColorIdx) so reordering never recolors a line.
  const l1ColorIdx = new Map(l1s.map(({ element }, i) => [element.id, i]))
  {
    const byId = new Map(resolved.map(r => [r.element.id, r.element]))
    const l1IdSet = new Set(l1s.map(({ element }) => element.id))
    const elementToL1 = (id: string): string | null => {
      let cur = byId.get(id)
      while (cur) {
        if (cur.level === 1) return cur.id
        cur = cur.parentId ? byId.get(cur.parentId) : undefined
      }
      return null
    }

    // Each link = the set of L1 rows a shared stop ties together, plus a weight.
    // L2 shared stops draw dashed interchange connectors (weight 1); L3
    // interchanges (only active when every parent L2 is expanded) draw solid
    // same-color approach edges that matter more visually (weight 2).
    const links: Array<{ l1Ids: string[]; weight: number }> = []
    for (const { element: el } of resolved) {
      if (el.level !== 2 && el.level !== 3) continue
      const refs = el.referencedParentIds ?? []
      if (!refs.length) continue
      if (el.level === 3) {
        const parents = [el.parentId, ...refs].filter(Boolean) as string[]
        if (!parents.every(p => expandedIds.has(p))) continue
      }
      const set = new Set<string>()
      for (const pid of [el.parentId, ...refs]) {
        if (!pid) continue
        const l1 = elementToL1(pid)
        if (l1 && l1IdSet.has(l1)) set.add(l1)
      }
      if (set.size >= 2) links.push({ l1Ids: [...set], weight: el.level === 3 ? 2 : 1 })
    }

    if (links.length && l1s.length >= 2) {
      // Row height is content-only (order-invariant) — same formula as rowMeta.
      const heightById = new Map<string, number>()
      for (const { element: l1 } of l1s) {
        const l2s = byParent.get(l1.id) ?? []
        const maxVarCount = Math.max(0, ...l2s.map(e => {
          if (!expandedIds.has(e.r.element.id)) return 0
          return Math.max(0, ...(byParent.get(e.r.element.id) ?? []).map(l3e =>
            (l3e.r.element.variants ?? []).filter(v => v.deviation !== 'removed').length))
        }))
        heightById.set(l1.id, maxVarCount === 0
          ? L1_ROW_H
          : Math.max(L1_ROW_H, GROUP_LABEL_H + GROUP_PAD_Y + L3_SIZE + VAR_LANE_FIRST_Y + maxVarCount * VAR_LANE_H + 24))
      }

      const centersOf = (order: string[]): Map<string, number> => {
        const c = new Map<string, number>()
        let y = CANVAS_PAD_TOP
        for (const id of order) {
          const h = heightById.get(id) ?? L1_ROW_H
          c.set(id, y + h / 2)
          y += h
        }
        return c
      }
      const costOf = (order: string[]): number => {
        const c = centersOf(order)
        let total = 0
        for (const { l1Ids, weight } of links) {
          let lo = Infinity, hi = -Infinity
          for (const id of l1Ids) { const y = c.get(id)!; if (y < lo) lo = y; if (y > hi) hi = y }
          total += weight * (hi - lo)
        }
        return total
      }

      const ids = l1s.map(({ element }) => element.id)
      let bestOrder = ids
      let bestCost = costOf(ids)

      if (ids.length <= 9) {
        // Exact: n! permutations (n=8 → 40,320), same scale as the fn-column optimizer.
        const arr = [...ids]
        const permute = (k: number) => {
          if (k === arr.length) {
            const c = costOf(arr)
            if (c < bestCost) { bestCost = c; bestOrder = [...arr] }
            return
          }
          for (let i = k; i < arr.length; i++) {
            ;[arr[k], arr[i]] = [arr[i], arr[k]]
            permute(k + 1)
            ;[arr[k], arr[i]] = [arr[i], arr[k]]
          }
        }
        permute(0)
      } else {
        // Heuristic fallback for larger n: barycentric median-of-linked-rows sweeps.
        const neigh = new Map<string, Array<{ l1Ids: string[]; weight: number }>>()
        for (const id of ids) neigh.set(id, [])
        for (const lnk of links) for (const id of lnk.l1Ids) neigh.get(id)!.push(lnk)
        let order = [...ids]
        for (let pass = 0; pass < 6; pass++) {
          const pos = new Map(order.map((id, i) => [id, i]))
          const key = new Map<string, number>()
          for (const id of order) {
            const vals: number[] = []
            for (const lnk of neigh.get(id)!) for (const other of lnk.l1Ids) if (other !== id) vals.push(pos.get(other)!)
            vals.sort((a, b) => a - b)
            key.set(id, vals.length ? vals[Math.floor(vals.length / 2)] : pos.get(id)!)
          }
          const next = [...order].sort((a, b) => (key.get(a)! - key.get(b)!) || (pos.get(a)! - pos.get(b)!))
          const cand = costOf(next)
          if (cand < bestCost) { bestCost = cand; bestOrder = next }
          order = next
        }
      }

      if (bestOrder !== ids) {
        const byL1Id = new Map(l1s.map(r => [r.element.id, r]))
        l1s = bestOrder.map(id => byL1Id.get(id)!).filter(Boolean)
      }
    }
  }

  // Pre-compute which L1 rows have any search match (L1, L2, or L3 name)
  const l1HasMatchMap = new Map<string, boolean>()
  if (filter) {
    for (const { element: l1 } of l1s) {
      if (l1.name.toLowerCase().includes(filter)) { l1HasMatchMap.set(l1.id, true); continue }
      let found = false
      for (const { r: { element: l2 } } of (byParent.get(l1.id) ?? [])) {
        if (l2.name.toLowerCase().includes(filter)) { found = true; break }
        if ((byParent.get(l2.id) ?? []).some(e => e.r.element.name.toLowerCase().includes(filter))) { found = true; break }
      }
      l1HasMatchMap.set(l1.id, found)
    }
  }

  // Pre-compute row heights. Only expanded L2s inflate a row — their L3 variant
  // tracks occupy vertical lanes below the group. Collapsed L2s show only a dot.
  const rowMeta = l1s.map(({ element: l1 }) => {
    const l2s = byParent.get(l1.id) ?? []
    const maxVarCount = Math.max(0, ...l2s.map(e => {
      if (!expandedIds.has(e.r.element.id)) return 0
      return Math.max(0, ...(byParent.get(e.r.element.id) ?? []).map(l3e =>
        (l3e.r.element.variants ?? []).filter(v => v.deviation !== 'removed').length
      ))
    }))
    const rowHeight = maxVarCount === 0
      ? L1_ROW_H
      : Math.max(L1_ROW_H, GROUP_LABEL_H + GROUP_PAD_Y + L3_SIZE + VAR_LANE_FIRST_Y + maxVarCount * VAR_LANE_H + 24)
    return { maxVarCount, rowHeight }
  })

  let accY = CANVAS_PAD_TOP
  const rowBaseYs: number[] = []
  for (const { rowHeight } of rowMeta) {
    rowBaseYs.push(accY)
    accY += rowHeight
  }

  // ── Shared-stop pre-passes ─────────────────────────────────────────────────

  // Map each L2 element to all row indices that include it
  const elementRowSet = new Map<string, number[]>()
  l1s.forEach(({ element: l1 }, rowIdx) => {
    for (const { r: { element: l2 } } of (byParent.get(l1.id) ?? [])) {
      const arr = elementRowSet.get(l2.id) ?? []
      if (!arr.includes(rowIdx)) arr.push(rowIdx)
      elementRowSet.set(l2.id, arr)
    }
  })

  // Map L2 ID to its primary row index (the row of its L1 parent)
  const l2ToRowIdx = new Map<string, number>()
  l1s.forEach(({ element: l1 }, rowIdx) => {
    for (const { r: { element: l2 }, isPrimary } of (byParent.get(l1.id) ?? [])) {
      if (isPrimary) l2ToRowIdx.set(l2.id, rowIdx)
    }
  })

  // 2-pass expansion-aware primary X
  const primaryX = new Map<string, number>()
  l1s.forEach(({ element: l1 }) => {
    let x = L2_START_X
    for (const { r: { element: l2 }, isPrimary } of (byParent.get(l1.id) ?? [])) {
      if (isPrimary) primaryX.set(l2.id, x)
      let advance = L2_SPACING
      if (isPrimary && expandedIds.has(l2.id)) {
        const l3s = byParent.get(l2.id) ?? []
        if (l3s.length > 0) {
          const lastL3X = x + (l3s.length - 1) * L3_SPACING
          advance = lastL3X - x + L2_SPACING
        }
      }
      x += advance
    }
  })

  // ── Phase A: Canonical X for shared L3 stops (iterative until stable) ──────
  // canonicalX = max natural X across all rows where the L3's parent is expanded.
  // Iterative because a shared stop in row A shifts A's subsequent L2 positions,
  // which in turn affects natural X of shared stops later in row A.
  const canonicalXMap = new Map<string, number>()

  for (let pass = 0; pass < 10; pass++) {
    const prevSnapshot = new Map(canonicalXMap)

    l1s.forEach(({ element: l1 }) => {
      let x = L2_START_X
      for (const { r: { element: l2 }, isPrimary } of (byParent.get(l1.id) ?? [])) {
        if (!isPrimary) continue
        const l2X = x
        let advance = L2_SPACING

        if (expandedIds.has(l2.id)) {
          const l3Entries = byParent.get(l2.id) ?? []
          if (l3Entries.length > 0) {
            let lastEffectiveX = l2X
            for (let k = 0; k < l3Entries.length; k++) {
              const l3 = l3Entries[k].r.element
              const naturalX = l2X + k * L3_SPACING
              if ((l3.referencedParentIds?.length ?? 0) > 0) {
                const canonical = Math.max(canonicalXMap.get(l3.id) ?? 0, naturalX)
                canonicalXMap.set(l3.id, canonical)
                lastEffectiveX = canonical
              } else {
                lastEffectiveX = naturalX
              }
            }
            advance = lastEffectiveX - l2X + L2_SPACING
          }
        }

        x += advance
      }
    })

    // Check convergence
    let stable = true
    for (const [id, val] of canonicalXMap) {
      if (prevSnapshot.get(id) !== val) { stable = false; break }
    }
    if (stable) break
  }

  // ── Phase B: Active interchange metadata ────────────────────────────────────
  // An interchange is active when ALL participating L2 parents are expanded.
  interface InterchangeMeta {
    canonicalX: number
    interchangeY: number
    rowIdxs: number[]
    lineColors: string[]
    lineColorDesigns: string[]
    hierarchyIds: string[]
  }
  const interchangeMeta = new Map<string, InterchangeMeta>()

  const resolvedById = new Map(resolved.map(r => [r.element.id, r]))

  for (const { element: l3 } of resolved) {
    if (!(l3.referencedParentIds?.length) || !l3.parentId) continue
    const allParentIds = [l3.parentId, ...l3.referencedParentIds]
    if (!allParentIds.every(pid => expandedIds.has(pid))) continue
    const canonX = canonicalXMap.get(l3.id)
    if (canonX === undefined) continue

    const rows: Array<{ rowIdx: number; rowY: number; lineColor: string; lineColorDesign: string; hierarchyId: string }> = []
    for (const pid of allParentIds) {
      const rowIdx = l2ToRowIdx.get(pid)
      if (rowIdx === undefined) continue
      const l2El = resolvedById.get(pid)?.element
      const l2HierarchyId = l2El?.hierarchyId ?? ''
      const siblings = byParent.get(pid) ?? []
      const posIdx = siblings.findIndex(e => e.r.element.id === l3.id)
      const computedHId = posIdx >= 0
        ? `${l2HierarchyId.replace(/\.0$/, '')}.${posIdx + 1}`
        : l3.hierarchyId
      rows.push({
        rowIdx,
        rowY: rowBaseYs[rowIdx],
        lineColor: LINE_COLORS[rowIdx % LINE_COLORS.length],
        lineColorDesign: `Indication${LINE_COLOR_INDICES[rowIdx % LINE_COLOR_INDICES.length]}`,
        hierarchyId: computedHId,
      })
    }
    rows.sort((a, b) => a.rowIdx - b.rowIdx)
    const interchangeY = rows.reduce((s, r) => s + r.rowY, 0) / rows.length

    interchangeMeta.set(l3.id, {
      canonicalX: canonX,
      interchangeY,
      rowIdxs: rows.map(r => r.rowIdx),
      lineColors: rows.map(r => r.lineColor),
      lineColorDesigns: rows.map(r => r.lineColorDesign),
      hierarchyIds: rows.map(r => r.hierarchyId),
    })
  }

  // Per-row interchange tracking for shared L2 stops
  const interchangeMap = new Map<string, string[]>()

  // Tracks which interchange-stop nodes have already been created (by l3.id)
  const createdInterchangeIds = new Set<string>()

  // ── Main row loop ──────────────────────────────────────────────────────────

  l1s.forEach(({ element: l1 }, rowIdx) => {
    const rowY            = rowBaseYs[rowIdx]
    const colorIdx        = l1ColorIdx.get(l1.id) ?? rowIdx
    const lineColor       = LINE_COLORS[colorIdx % LINE_COLORS.length]
    const lineColorDesign = `Indication${LINE_COLOR_INDICES[colorIdx % LINE_COLOR_INDICES.length]}`
    const l1NodeId        = `node-${l1.id}`
    const isL1Collapsed   = collapsedL1Ids.has(l1.id)
    const l1Dimmed        = !!filter && !(l1HasMatchMap.get(l1.id) ?? true)

    const l1Node: Node = {
      id: l1NodeId, type: 'l1-label',
      position: { x: L2_START_X - L1_LABEL_W - 24, y: rowY - L1_LABEL_H / 2 },
      data: { elementId: l1.id, label: l1.name, hierarchyId: l1.hierarchyId, lineColor, lineColorDesign, collapsed: isL1Collapsed, dimmed: l1Dimmed,
              widthAnchor: { mode: 'right', x: L2_START_X - 24 } },
      height: L1_LABEL_H,
    }
    nodes.push(l1Node)

    if (isL1Collapsed) {
      return
    }

    const l2Entries = byParent.get(l1.id) ?? []

    if (l2Entries.length === 0) {
      return
    }

    let currentX = L2_START_X
    let lastNodeId: string | null = null
    let lastHandle = 'right'
    let firstStopNodeId: string | null = null

    for (const { r: { element: l2 }, isPrimary } of l2Entries) {
      const isShared  = (elementRowSet.get(l2.id)?.length ?? 1) > 1
      const l2NodeId  = isShared ? `node-${l2.id}-r${rowIdx}` : `node-${l2.id}`
      if (firstStopNodeId === null) firstStopNodeId = l2NodeId
      const nodeY     = rowY
      const l2X       = isPrimary ? currentX : (primaryX.get(l2.id) ?? currentX)
      const isExpanded = isPrimary && expandedIds.has(l2.id)
      const l3s        = isExpanded ? (byParent.get(l2.id) ?? []) : []

      const l2NameMatch = !filter || l2.name.toLowerCase().includes(filter)
      const l3NameMatch = l3s.some(e => e.r.element.name.toLowerCase().includes(filter))
      const l2Dimmed    = l1Dimmed || (!!filter && !l2NameMatch && !l3NameMatch)

      const isExpandedWithChildren = isExpanded && l3s.length > 0

      if (isExpandedWithChildren) {
        // ── L2 group node (React Flow native parent-child) ────────────────────
        const groupW = (l3s.length - 1) * L3_SPACING + L3_SIZE + 2 * GROUP_PAD
        const groupH = GROUP_LABEL_H + GROUP_PAD_Y + L3_SIZE + GROUP_PAD_Y
        const groupX = l2X - L3_SIZE / 2 - GROUP_PAD
        const groupY = nodeY - GROUP_LABEL_H - GROUP_PAD_Y - L3_SIZE / 2
        nodes.push({
          id: l2NodeId, type: 'l2-group',
          position: { x: groupX, y: groupY },
          data: { elementId: l2.id, label: l2.name, hierarchyId: l2.hierarchyId, lineColor, lineColorDesign, dimmed: l2Dimmed },
          width: groupW, height: groupH,
          zIndex: 0,
          style: { pointerEvents: 'none' },
        })
        let lastL3NodeId: string = lastNodeId as string
        let lastL3Handle: string = lastHandle
        let enteredGroup = false
        let firstBgEdgeIdx = -1
        let lastBgEdgeIdx  = -1

        for (let k = 0; k < l3s.length; k++) {
          const { r: { element: l3 } } = l3s[k]
          const naturalX  = l2X + k * L3_SPACING
          const meta      = interchangeMeta.get(l3.id)
          const l3X       = meta
            ? meta.canonicalX
            : (canonicalXMap.get(l3.id) ?? naturalX)
          const l3Dimmed  = l1Dimmed || (!!filter && !l3.name.toLowerCase().includes(filter))

          if (meta) {
            // ── Active interchange stop ──────────────────────────────────────
            const interchangeNodeId = `interchange-${l3.id}`
            const rowOrderIdx = meta.rowIdxs.indexOf(rowIdx)

            if (!createdInterchangeIds.has(l3.id)) {
              const rowYs = meta.rowIdxs.map(ri => rowBaseYs[ri])
              const interchangeY = rowYs.reduce((a, b) => a + b, 0) / rowYs.length
              nodes.push({
                id: interchangeNodeId,
                type: 'interchange-stop',
                position: { x: l3X - IC_W / 2, y: interchangeY - IC_H / 2 },
                data: {
                  elementId: l3.id,
                  label: l3.name,
                  allHierarchyIds: meta.hierarchyIds,
                  lineColors: meta.lineColors,
                  lineColorDesigns: meta.lineColorDesigns,
                  dimmed: l3Dimmed,
                },
                                width: IC_W,
                height: IC_H,
                zIndex: 2,
              })
              createdInterchangeIds.add(l3.id)
            }

            if (lastL3NodeId !== null) {
              edges.push({
                id: `e-${lastL3NodeId}-${interchangeNodeId}-r${rowIdx}`,
                source: lastL3NodeId,
                target: interchangeNodeId,
                sourceHandle: lastL3Handle,
                targetHandle: `left-${rowOrderIdx}`,
                type: 'metro-line',
                data: { lineColor, bgGroup: enteredGroup, dimmed: l1Dimmed },
              })
              if (enteredGroup) {
                if (firstBgEdgeIdx === -1) firstBgEdgeIdx = edges.length - 1
                lastBgEdgeIdx = edges.length - 1
              }
            }
            enteredGroup = true

            lastL3NodeId = interchangeNodeId
            lastL3Handle = `right-${rowOrderIdx}`
          } else {
            // ── Normal L3 stop (child of l2-group) ───────────────────────────
            const l3NodeId = `node-${l3.id}-in-${l2NodeId}`
            // Preceding stop for this L3 — variant branches tap the segment
            // leading into it, so we only need to know whether one exists.
            const precedingId = lastL3NodeId

            nodes.push({
              id: l3NodeId, type: 'l3-stop',
              position: { x: k * L3_SPACING + GROUP_PAD, y: GROUP_LABEL_H + GROUP_PAD_Y },
              parentId: l2NodeId,
              data: { elementId: l3.id, label: l3.name, hierarchyId: l3.hierarchyId, allHierarchyIds: l3.allHierarchyIds ?? [l3.hierarchyId], lineColor, lineColorDesign, dimmed: l3Dimmed, functionId: l3.functionId, deviation: l3s[k].r.deviation },
              width: L3_SIZE, height: L3_SIZE,
              zIndex: 1,
            })

            if (lastL3NodeId !== null) {
              edges.push({
                id: `e-${lastL3NodeId}-${l3NodeId}`,
                source: lastL3NodeId, target: l3NodeId,
                sourceHandle: lastL3Handle, targetHandle: 'left',
                type: 'metro-line', data: { lineColor, bgGroup: enteredGroup },
              })
              if (enteredGroup) {
                if (firstBgEdgeIdx === -1) firstBgEdgeIdx = edges.length - 1
                lastBgEdgeIdx = edges.length - 1
              }
            }
            enteredGroup = true
            lastL3Handle = 'right'

            // Variants: parallel tracks below this L3 stop (the "template"). Each
            // is positionally bound to the group at the same k-based X and is not
            // draggable. Branches tap the main line at the midpoint of the
            // preceding segment (a vertical drop into the variant) and rejoin at
            // the midpoint of the succeeding segment (wired in a post-pass).
            // Variants render as parallel tracks only in the Global Standard view
            // (no active scope). When a scope filter is applied, resolveElement has
            // already promoted the matching variant onto the main-line stop above
            // (or kept the global standard when no variant matches), so no parallel
            // tracks are drawn.
            const l3Variants = scopeActive
              ? []
              : (l3.variants ?? []).filter(v => v.deviation !== 'removed')
            if (l3Variants.length) {
              // Variants and their tap junctions are children of the L3 stop node,
              // so all positions are relative to the stop's top-left. This binds
              // them to the stop: dragging the "global variant" moves the taps and
              // variant tracks with it, keeping them connected to the main line.
              // Tap point at the outer end of the 32px horizontal stub the main
              // line always runs into the stop's LEFT handle. The stub is enforced
              // horizontal, so this point sits on the line at any approach angle,
              // and — being a child of the stop — it moves with it when dragged.
              let inJunctionId: string | null = null
              if (precedingId !== null) {
                inJunctionId = `vjin-${l3NodeId}`
                nodes.push({
                  id: inJunctionId, type: 'variant-junction', parentId: l3NodeId,
                  position: { x: -32, y: L3_SIZE / 2 },
                  draggable: false, selectable: false,
                  data: { role: 'source' }, width: 1, height: 1, zIndex: 0,
                })
              }

              l3Variants.forEach((v, varIdx) => {
                const variantId = `var3-${l3.id}-in-${l2NodeId}-${varIdx}`
                nodes.push({
                  id: variantId, type: 'variant-stop',
                  parentId: l3NodeId,
                  position: {
                    x: 0,
                    y: VAR_LANE_FIRST_Y + varIdx * VAR_LANE_H,
                  },
                  draggable: false,
                  data: { label: v.name ?? l3.name, lineColor, lineColorDesign,
                    hierarchyId: l3.hierarchyId, ownerId: v.ownerId ?? l3.ownerId,
                    scopeLabel: Object.values(v.scope).join(' · '), deviation: v.deviation },
                  width: VAR_STOP_SZ, height: VAR_STOP_SZ, zIndex: 1,
                })
                if (inJunctionId !== null) {
                  edges.push({
                    id: `e-vin3-${l3.id}-${l2NodeId}-${varIdx}`,
                    source: inJunctionId, target: variantId,
                    sourceHandle: 'bottom', targetHandle: 'left',
                    type: 'variant-track', data: { lineColor, dimmed: l1Dimmed },
                  })
                }
                pendingVariantTails.push({
                  variantId, stopId: l3NodeId, lineColor, dimmed: l1Dimmed,
                })
              })
            }
            lastL3NodeId = l3NodeId
          }
        }

        // Mark first/last bgGroup edges for round caps
        if (firstBgEdgeIdx !== -1) (edges[firstBgEdgeIdx].data as any).bgGroupFirst = true
        if (lastBgEdgeIdx  !== -1) (edges[lastBgEdgeIdx].data  as any).bgGroupLast  = true

        // Advance X past the last L3. Variants sit vertically below and add no
        // horizontal span.
        const lastL3Elem = l3s[l3s.length - 1].r.element
        const lastL3Meta = interchangeMeta.get(lastL3Elem.id)
        const lastL3EffX = lastL3Meta
          ? lastL3Meta.canonicalX
          : (canonicalXMap.get(lastL3Elem.id) ?? l2X + (l3s.length - 1) * L3_SPACING)
        currentX = lastL3EffX + L2_SPACING
        lastNodeId = lastL3NodeId
        lastHandle = lastL3Handle
      } else {
        // ── L2 stop on the line ─────────────────────────────────────────────
        if (lastNodeId !== null) {
          edges.push({
            id: `e-${lastNodeId}-${l2NodeId}`,
            source: lastNodeId, target: l2NodeId,
            sourceHandle: lastHandle, targetHandle: 'left',
            type: 'metro-line', data: { lineColor, dimmed: l1Dimmed },
          })
        }

        if (isShared) {
          const arr = interchangeMap.get(l2.id) ?? []
          arr.push(l2NodeId)
          interchangeMap.set(l2.id, arr)
        }

        // Collapsed L2 with variant-bearing L3 children shows a small indicator
        // dot; the variants themselves only render when the group is expanded.
        const hasEmbeddedVariants = !scopeActive && isPrimary && (byParent.get(l2.id) ?? []).some(
          ({ r: { element: l3 } }) => (l3.variants ?? []).some(v => v.deviation !== 'removed')
        )

        nodes.push({
          id: l2NodeId, type: 'l2-stop',
          position: { x: l2X - L2_DOT_SIZE / 2, y: nodeY - L2_DOT_SIZE / 2 },
          data: { elementId: l2.id, label: l2.name, hierarchyId: l2.hierarchyId, allHierarchyIds: l2.allHierarchyIds ?? [l2.hierarchyId], lineColor, lineColorDesign, dimmed: l2Dimmed, expanded: isExpanded, isShared, l3Count: (byParent.get(l2.id) ?? []).length, functionId: l2.functionId ?? dominantFnId(l2.id, byParent), hasEmbeddedVariants },
          width: L2_DOT_SIZE, height: L2_DOT_SIZE,
          zIndex: 1,
        })

        currentX = l2X + L2_SPACING
        lastNodeId = l2NodeId
        lastHandle = 'right'
      }
    }

    ;(l1Node.data as any).firstStopId = firstStopNodeId
  })

  // Emit interchange edges connecting per-row shared L2 stop nodes top-to-bottom
  for (const [, rowNodeIds] of interchangeMap) {
    for (let i = 0; i < rowNodeIds.length - 1; i++) {
      edges.push({
        id: `e-interchange-${rowNodeIds[i]}-${rowNodeIds[i + 1]}`,
        source: rowNodeIds[i], target: rowNodeIds[i + 1],
        sourceHandle: 'bottom', targetHandle: 'top',
        type: 'interchange',
      })
    }
  }

  // Wire each variant's outgoing track: rejoin the main line at the midpoint of
  // the stop's succeeding segment via a vertical stub. A stop at the line end has
  // no outgoing main-line edge, so its variants have no outgoing track either.
  // One shared out-junction per stop keeps the rejoining stubs overlapping.
  const tailsByStop = new Map<string, typeof pendingVariantTails>()
  for (const t of pendingVariantTails) {
    const arr = tailsByStop.get(t.stopId) ?? []
    arr.push(t)
    tailsByStop.set(t.stopId, arr)
  }
  for (const [stopId, tails] of tailsByStop) {
    const out = edges.find(e => e.source === stopId && e.type === 'metro-line')
    if (!out) continue
    const outJunctionId = `vjout-${stopId}`
    nodes.push({
      id: outJunctionId, type: 'variant-junction', parentId: stopId,
      position: { x: L3_SIZE + 32, y: L3_SIZE / 2 },
      draggable: false, selectable: false,
      data: { role: 'target' }, width: 1, height: 1, zIndex: 0,
    })
    for (const { variantId, lineColor, dimmed } of tails) {
      edges.push({
        id: `e-vout-${variantId}`,
        source: variantId, target: outJunctionId,
        sourceHandle: 'right', targetHandle: 'bottom',
        type: 'variant-track', data: { lineColor, dimmed },
      })
    }
  }

  // bgGroup (translucent highlight bands) must render below the main line strokes
  for (const e of edges) {
    e.zIndex = (e.data as any)?.bgGroup ? 0 : 1
  }

  return { nodes, edges }
}

// ── Function column graph builder (vertical swimlanes) ────────────────────────
function buildFunctionColumnGraph(
  resolved: ResolvedElement[],
  expandedIds: Set<string>,
  collapsedL1Ids: Set<string>,
  filterText: string,
  _levelNames: ProcessLevelNames,
  displayLevel: DisplayLevel,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const colNodes: Node[] = []
  const edges: Edge[] = []
  const filter = filterText.trim().toLowerCase()

  const l1s = resolved
    .filter(r => r.element.level === 1)
    .sort((a, b) => {
      const hcmp = a.element.hierarchyId.localeCompare(b.element.hierarchyId)
      return hcmp !== 0 ? hcmp : a.element.id.localeCompare(b.element.id)
    })

  type BPEntry = { r: ResolvedElement; isPrimary: boolean }
  const byParent = new Map<string, BPEntry[]>()
  for (const r of resolved) {
    const el = r.element
    if (el.parentId) {
      const arr = byParent.get(el.parentId) ?? []
      arr.push({ r, isPrimary: true })
      byParent.set(el.parentId, arr)
    }
    for (const refId of (el.referencedParentIds ?? [])) {
      const arr = byParent.get(refId) ?? []
      arr.push({ r, isPrimary: false })
      byParent.set(refId, arr)
    }
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      const hcmp = a.r.element.hierarchyId.localeCompare(b.r.element.hierarchyId, undefined, { numeric: true, sensitivity: 'base' })
      return hcmp !== 0 ? hcmp : a.r.element.id.localeCompare(b.r.element.id)
    })
  }

  // Row heights (mirrors buildMetroGraph — only expanded L2s inflate a row).
  const rowMeta = l1s.map(({ element: l1 }) => {
    const l2s = byParent.get(l1.id) ?? []
    const maxVarCount = Math.max(0, ...l2s.map(e => {
      if (!expandedIds.has(e.r.element.id)) return 0
      return Math.max(0, ...(byParent.get(e.r.element.id) ?? []).map(l3e =>
        (l3e.r.element.variants ?? []).filter(v => v.deviation !== 'removed').length
      ))
    }))
    const rowHeight = maxVarCount === 0
      ? L1_ROW_H
      : Math.max(L1_ROW_H, GROUP_LABEL_H + GROUP_PAD_Y + L3_SIZE + VAR_LANE_FIRST_Y + maxVarCount * VAR_LANE_H + 24)
    return { rowHeight }
  })
  let accY = CANVAS_PAD_TOP
  const rowBaseYs: number[] = []
  for (const { rowHeight } of rowMeta) {
    rowBaseYs.push(accY)
    accY += rowHeight
  }

  // Sequence items for an L1 — includes shared (non-primary) children for interchange detection
  type SeqItem = {
    id: string; name: string; hierarchyId: string
    allHierarchyIds: string[]; functionId: string; l3Count?: number
    kind: 'l2' | 'l2-expanded' | 'l3-child'
    parentL2Id?: string
    isPrimaryInRow: boolean
    contextHierarchyId: string
  }
  function getSeqItems(l1Id: string): SeqItem[] {
    const result: SeqItem[] = []
    for (const { r: { element: l2 }, isPrimary: l2p } of (byParent.get(l1Id) ?? [])) {
      if (!l2p) continue
      if (displayLevel === 'l2') {
        const l3Entries = (byParent.get(l2.id) ?? []).filter(e => e.isPrimary)
        const isExp = expandedIds.has(l2.id) && l3Entries.length > 0
        result.push({
          id: l2.id, name: l2.name, hierarchyId: l2.hierarchyId,
          allHierarchyIds: l2.allHierarchyIds ?? [l2.hierarchyId],
          functionId: l2.functionId ?? 'fn-fin', l3Count: l3Entries.length,
          kind: isExp ? 'l2-expanded' : 'l2', isPrimaryInRow: true,
          contextHierarchyId: l2.hierarchyId,
        })
        if (isExp) {
          for (const { r: { element: l3 }, isPrimary: l3p } of (byParent.get(l2.id) ?? [])) {
            const siblings = byParent.get(l2.id) ?? []
            const posIdx = siblings.findIndex(e => e.r.element.id === l3.id)
            const contextHierarchyId = posIdx >= 0
              ? `${l2.hierarchyId.replace(/\.0$/, '')}.${posIdx + 1}`
              : l3.hierarchyId
            result.push({
              id: l3.id, name: l3.name, hierarchyId: l3.hierarchyId,
              allHierarchyIds: l3.allHierarchyIds ?? [l3.hierarchyId],
              functionId: l3.functionId ?? 'fn-fin',
              kind: 'l3-child', parentL2Id: l2.id, isPrimaryInRow: l3p,
              contextHierarchyId,
            })
          }
        }
      } else {
        for (const { r: { element: l3 }, isPrimary: l3p } of (byParent.get(l2.id) ?? [])) {
          const siblings = byParent.get(l2.id) ?? []
          const posIdx = siblings.findIndex(e => e.r.element.id === l3.id)
          const contextHierarchyId = posIdx >= 0
            ? `${l2.hierarchyId.replace(/\.0$/, '')}.${posIdx + 1}`
            : l3.hierarchyId
          result.push({
            id: l3.id, name: l3.name, hierarchyId: l3.hierarchyId,
            allHierarchyIds: l3.allHierarchyIds ?? [l3.hierarchyId],
            functionId: l3.functionId ?? 'fn-fin',
            kind: 'l3-child', isPrimaryInRow: l3p,
            contextHierarchyId,
          })
        }
      }
    }
    return result
  }

  // ── L1 view: fixed-width columns ──────────────────────────────────────────────
  const fnMaxCount = new Map<string, number>()
  for (const { element: l1 } of l1s) {
    const fnCnt = new Map<string, number>()
    for (const { r: { element: l2 }, isPrimary: l2p } of (byParent.get(l1.id) ?? [])) {
      if (!l2p) continue
      for (const { r: { element: l3 }, isPrimary: l3p } of (byParent.get(l2.id) ?? [])) {
        if (!l3p) continue
        const fnId = l3.functionId ?? 'fn-fin'
        fnCnt.set(fnId, (fnCnt.get(fnId) ?? 0) + 1)
      }
    }
    for (const [fnId, cnt] of fnCnt) {
      fnMaxCount.set(fnId, Math.max(fnMaxCount.get(fnId) ?? 0, cnt))
    }
  }
  const activeFnIdsL1 = FN_ORDERED_IDS.filter(fnId => (fnMaxCount.get(fnId) ?? 0) > 0)
  const colWidthMapL1  = new Map<string, number>()
  const colStartXMapL1 = new Map<string, number>()
  let curColX = L2_START_X
  for (const fnId of activeFnIdsL1) {
    colWidthMapL1.set(fnId, FN_COL_MIN_W)
    colStartXMapL1.set(fnId, curColX)
    curColX += FN_COL_MIN_W + FN_COL_GAP
  }
  const canvasH = accY + 60

  if (displayLevel === 'l1') {
    activeFnIdsL1.forEach((fnId, colIdx) => {
      colNodes.push({
        id: `fncol-bg-${fnId}`, type: 'function-col',
        position: { x: colStartXMapL1.get(fnId) ?? 0, y: 0 },
        data: { name: FN_ORDERED_NAMES[fnId] ?? fnId, colIndex: colIdx,
                colWidth: FN_COL_MIN_W, canvasH },
        draggable: false, zIndex: -2,
      })
    })
    for (let rowIdx = 0; rowIdx < l1s.length; rowIdx++) {
      const { element: l1 } = l1s[rowIdx]
      const lineColor       = LINE_COLORS[rowIdx % LINE_COLORS.length]
      const lineColorDesign = `Indication${LINE_COLOR_INDICES[rowIdx % LINE_COLOR_INDICES.length]}`
      const rowY            = rowBaseYs[rowIdx]
      const fnCnt = new Map<string, number>()
      for (const { r: { element: l2 }, isPrimary: l2p } of (byParent.get(l1.id) ?? [])) {
        if (!l2p) continue
        for (const { r: { element: l3 } } of (byParent.get(l2.id) ?? [])) {
          const fnId = l3.functionId ?? 'fn-fin'
          fnCnt.set(fnId, (fnCnt.get(fnId) ?? 0) + 1)
        }
      }
      let domFn  = activeFnIdsL1[0] ?? 'fn-fin'
      let domCnt = 0
      for (const [fnId, cnt] of fnCnt) {
        const ord = FN_ORDERED_IDS.indexOf(fnId), domOrd = FN_ORDERED_IDS.indexOf(domFn)
        if (cnt > domCnt || (cnt === domCnt && ord < domOrd)) { domFn = fnId; domCnt = cnt }
      }
      const cx = colStartXMapL1.get(domFn) ?? L2_START_X
      const cw = colWidthMapL1.get(domFn) ?? FN_COL_MIN_W
      nodes.push({
        id: `fncol-l1lbl-${l1.id}`, type: 'l1-label',
        position: { x: cx + (cw - L1_LABEL_W) / 2, y: rowY - L1_LABEL_H / 2 },
        data: { elementId: l1.id, label: l1.name, hierarchyId: l1.hierarchyId, lineColor, lineColorDesign, collapsed: false,
                widthAnchor: { mode: 'center', x: cx + cw / 2 } },
        height: L1_LABEL_H,
      })
    }
    for (const e of edges) { e.zIndex = (e.data as any)?.bgGroup ? 0 : 1 }
    return { nodes: [...colNodes, ...nodes], edges }
  }

  // ── L2 / L3 views: fixed non-overlapping columns, fnIdxMap positioning ────────

  // Column geometry: max visits per function across all rows drives column width
  const fnMaxCount2 = new Map<string, number>()
  for (const { element: l1 } of l1s) {
    const fnCnt = new Map<string, number>()
    for (const item of getSeqItems(l1.id)) {
      if (item.kind === 'l2-expanded') continue
      fnCnt.set(item.functionId, (fnCnt.get(item.functionId) ?? 0) + 1)
    }
    for (const [fnId, cnt] of fnCnt) {
      fnMaxCount2.set(fnId, Math.max(fnMaxCount2.get(fnId) ?? 0, cnt))
    }
  }
  // Active function IDs ordered to minimise cross-column edge cost.
  // Uses actual per-column visit indices (not column centres) so the optimizer
  // sees the true positional asymmetry and prefers orderings where flow goes
  // left→right. For ≤8 columns 8! = 40,320 permutations is fast enough.
  const activeFnIds = (() => {
    const candidates = FN_ORDERED_IDS.filter(fnId => (fnMaxCount2.get(fnId) ?? 0) > 0)
    if (candidates.length <= 1) return candidates

    // Column widths and first-node offsets (both independent of ordering).
    const candW         = new Map<string, number>()
    const candFirstNode = new Map<string, number>()
    for (const fnId of candidates) {
      const maxN   = fnMaxCount2.get(fnId) ?? 1
      const groupW = Math.max(0, maxN - 1) * FN_NODE_PITCH
      const cw     = Math.max(FN_COL_MIN_W, groupW + 2 * FN_COL_INNER_PAD)
      candW.set(fnId, cw)
      candFirstNode.set(fnId, (cw - groupW) / 2)
    }

    // Directed edge specs: (srcFn, srcK) → (tgtFn, tgtK).
    // k is the per-column visit counter so we know the actual node X for any
    // column ordering. Recording k (not just the column pair) is what lets the
    // optimizer distinguish e.g. "interchange at fn-rd k=4 → fn-mkt k=0" from
    // the reverse, even when both have the same column-centre distance.
    type EdgeSpec = { srcFn: string; srcK: number; tgtFn: string; tgtK: number }
    const edgeSpecs: EdgeSpec[] = []
    for (const { element: l1 } of l1s) {
      const items = getSeqItems(l1.id).filter(i => i.kind !== 'l2-expanded')
      const fnK = new Map<string, number>()
      let prevFn: string | null = null, prevK = 0
      for (const item of items) {
        const fn = item.functionId
        const k  = fnK.get(fn) ?? 0
        fnK.set(fn, k + 1)
        if (prevFn !== null && prevFn !== fn)
          edgeSpecs.push({ srcFn: prevFn, srcK: prevK, tgtFn: fn, tgtK: k })
        prevFn = fn; prevK = k
      }
    }

    if (edgeSpecs.length === 0) return candidates

    // Backward penalty: a backward edge (source right of target) costs this
    // multiple of its distance. Even P=1 often picks the right order because
    // actual node positions are already asymmetric; higher values add margin.
    const BACKWARD_PENALTY = 4

    const costOf = (perm: string[]): number => {
      let x = 0
      const colStart = new Map<string, number>()
      for (const id of perm) { colStart.set(id, x); x += candW.get(id)! + FN_COL_GAP }
      let cost = 0
      for (const { srcFn, srcK, tgtFn, tgtK } of edgeSpecs) {
        const cs = colStart.get(srcFn), ct = colStart.get(tgtFn)
        if (cs === undefined || ct === undefined) continue
        const srcX = cs + candFirstNode.get(srcFn)! + srcK * FN_NODE_PITCH
        const tgtX = ct + candFirstNode.get(tgtFn)! + tgtK * FN_NODE_PITCH
        const d = tgtX - srcX
        cost += d >= 0 ? d : -d * BACKWARD_PENALTY
      }
      return cost
    }

    let best = candidates, bestCost = Infinity
    const arr = [...candidates]
    const permute = (l: number) => {
      if (l === arr.length) {
        const c = costOf(arr)
        if (c < bestCost) { bestCost = c; best = [...arr] }
        return
      }
      for (let i = l; i < arr.length; i++) {
        ;[arr[l], arr[i]] = [arr[i], arr[l]]
        permute(l + 1)
        ;[arr[l], arr[i]] = [arr[i], arr[l]]
      }
    }
    permute(0)
    return best
  })()
  const colWidthMap   = new Map<string, number>()
  const colStartXMap  = new Map<string, number>()
  const colFirstNodeX = new Map<string, number>()
  let colX = L2_START_X
  for (const fnId of activeFnIds) {
    const maxN   = fnMaxCount2.get(fnId) ?? 1
    const groupW = Math.max(0, maxN - 1) * FN_NODE_PITCH
    const cw     = Math.max(FN_COL_MIN_W, groupW + 2 * FN_COL_INNER_PAD)
    colWidthMap.set(fnId, cw)
    colStartXMap.set(fnId, colX)
    colFirstNodeX.set(fnId, (cw - groupW) / 2)
    colX += cw + FN_COL_GAP
  }

  activeFnIds.forEach((fnId, colIdx) => {
    colNodes.push({
      id: `fncol-bg-${fnId}`, type: 'function-col',
      position: { x: colStartXMap.get(fnId) ?? 0, y: 0 },
      data: { name: FN_ORDERED_NAMES[fnId] ?? fnId, colIndex: colIdx,
              colWidth: colWidthMap.get(fnId) ?? FN_COL_MIN_W, canvasH },
      draggable: false, zIndex: -2,
    })
  })

  // Phase B: position each row's items using per-row fnIdxMap (nodes land in their function column)
  type RowEntry = {
    rowIdx: number; nodeId: string; cx: number; rowY: number
    lineColor: string; lineColorDesign: string; item: SeqItem
  }
  const allRowsPositioned: RowEntry[] = []

  for (let rowIdx = 0; rowIdx < l1s.length; rowIdx++) {
    const { element: l1 } = l1s[rowIdx]
    const lineColor       = LINE_COLORS[rowIdx % LINE_COLORS.length]
    const lineColorDesign = `Indication${LINE_COLOR_INDICES[rowIdx % LINE_COLOR_INDICES.length]}`
    const rowY            = rowBaseYs[rowIdx]
    if (collapsedL1Ids.has(l1.id)) continue

    const fnIdxMap = new Map<string, number>()
    for (const item of getSeqItems(l1.id)) {
      if (item.kind === 'l2-expanded') {
        allRowsPositioned.push({ rowIdx, nodeId: `fncol-n-${item.id}-r${rowIdx}`, cx: 0, rowY, lineColor, lineColorDesign, item })
        continue
      }
      const k  = fnIdxMap.get(item.functionId) ?? 0
      fnIdxMap.set(item.functionId, k + 1)
      const cx = (colStartXMap.get(item.functionId) ?? L2_START_X)
               + (colFirstNodeX.get(item.functionId) ?? FN_COL_INNER_PAD)
               + k * FN_NODE_PITCH
      allRowsPositioned.push({ rowIdx, nodeId: `fncol-n-${item.id}-r${rowIdx}`, cx, rowY, lineColor, lineColorDesign, item })
    }
  }

  // Phase C: identify interchange items (same item.id in 2+ rows)
  interface FnInterchangeMeta {
    canonicalCx: number; interchangeY: number
    rowIdxs: number[]; lineColors: string[]; lineColorDesigns: string[]
    label: string; allHierarchyIds: string[]
  }
  const fnInterchangeMap = new Map<string, FnInterchangeMeta>()
  {
    const itemRows = new Map<string, RowEntry[]>()
    for (const entry of allRowsPositioned) {
      if (entry.item.kind === 'l2-expanded') continue
      const arr = itemRows.get(entry.item.id) ?? []
      arr.push(entry)
      itemRows.set(entry.item.id, arr)
    }
    for (const [itemId, entries] of itemRows) {
      if (entries.length < 2) continue
      const primaryEntry = entries.find(e => e.item.isPrimaryInRow) ?? entries[0]
      const sorted       = [...entries].sort((a, b) => a.rowIdx - b.rowIdx)
      fnInterchangeMap.set(itemId, {
        canonicalCx:      primaryEntry.cx,
        interchangeY:     entries.reduce((s, e) => s + e.rowY, 0) / entries.length,
        rowIdxs:          sorted.map(e => e.rowIdx),
        lineColors:       sorted.map(e => e.lineColor),
        lineColorDesigns: sorted.map(e => e.lineColorDesign),
        label:            primaryEntry.item.name,
        allHierarchyIds:  sorted.map(e => e.item.contextHierarchyId),
      })
    }
  }

  // Phase E: emit nodes and edges per row
  const createdFnInterchangeIds = new Set<string>()

  // Bottom edge of the space usable for this row's detour lanes: the previous
  // non-collapsed row's spine plus room for its labels (or the column headers
  // for the first row). Detours rise from rowY toward — but never past — this.
  const prevBottom = (ri: number): number => {
    if (ri === 0) return FN_COL_HEADER_H
    let p = ri - 1
    while (p >= 0 && collapsedL1Ids.has(l1s[p].element.id)) p--
    if (p < 0) return FN_COL_HEADER_H
    return rowBaseYs[p] + LANE_LABEL_BELOW
  }

  for (let rowIdx = 0; rowIdx < l1s.length; rowIdx++) {
    const { element: l1 } = l1s[rowIdx]
    const lineColor       = LINE_COLORS[rowIdx % LINE_COLORS.length]
    const lineColorDesign = `Indication${LINE_COLOR_INDICES[rowIdx % LINE_COLOR_INDICES.length]}`
    const rowY            = rowBaseYs[rowIdx]
    const isL1Collapsed   = collapsedL1Ids.has(l1.id)
    const l1NodeId        = `fncol-l1lbl-${l1.id}`

    const l1Node: Node = {
      id: l1NodeId, type: 'l1-label',
      position: { x: L2_START_X - L1_LABEL_W - 24, y: rowY - L1_LABEL_H / 2 },
      data: { elementId: l1.id, label: l1.name, hierarchyId: l1.hierarchyId, lineColor, lineColorDesign, collapsed: isL1Collapsed,
              widthAnchor: { mode: 'right', x: L2_START_X - 24 } },
      height: L1_LABEL_H,
    }
    nodes.push(l1Node)

    const rowEntries = allRowsPositioned.filter(e => e.rowIdx === rowIdx)
    const realEntries = rowEntries.filter(e => e.item.kind !== 'l2-expanded')

    if (realEntries.length === 0) {
      continue
    }

    // ── Pass 1: emit nodes, collect ordered connection points ─────────────────
    type CPoint = { id: string; x: number; y: number; icRowOrderIdx?: number }
    const points: CPoint[] = []

    for (let i = 0; i < rowEntries.length; i++) {
      const entry     = rowEntries[i]
      const { nodeId, item } = entry
      const dimmed    = !!filter && !item.name.toLowerCase().includes(filter)
      const icMeta    = fnInterchangeMap.get(item.id)
      const effectCx  = icMeta ? icMeta.canonicalCx : entry.cx

      if (item.kind === 'l2-expanded') {
        continue
      }

      // ── Interchange stop — single small dot at the mean Y of its rows ───────
      if (icMeta) {
        const icNodeId     = `fncol-ic-${item.id}`
        const rowOrderIdx  = icMeta.rowIdxs.indexOf(rowIdx)
        const rowYs        = icMeta.rowIdxs.map(ri => rowBaseYs[ri])
        const interchangeY = rowYs.reduce((a, b) => a + b, 0) / rowYs.length
        if (!createdFnInterchangeIds.has(item.id)) {
          nodes.push({
            id: icNodeId, type: 'interchange-stop',
            position: { x: effectCx - IC_W / 2, y: interchangeY - IC_H / 2 },
            data: {
              elementId: item.id, label: icMeta.label,
              allHierarchyIds: icMeta.allHierarchyIds,
              lineColors: icMeta.lineColors, lineColorDesigns: icMeta.lineColorDesigns,
              dimmed,
            },
            width: IC_W, height: IC_H, zIndex: 2,
          })
          createdFnInterchangeIds.add(item.id)
        }
        points.push({ id: icNodeId, x: effectCx, y: interchangeY, icRowOrderIdx: rowOrderIdx })
        continue
      }

      // ── Normal l2-stop ─────────────────────────────────────────────────────
      if (item.kind === 'l2') {
        nodes.push({
          id: nodeId, type: 'l2-stop',
          position: { x: effectCx - L2_DOT_SIZE / 2, y: rowY - L2_DOT_SIZE / 2 },
          data: {
            elementId: item.id, label: item.name, hierarchyId: item.hierarchyId,
            allHierarchyIds: item.allHierarchyIds, lineColor, lineColorDesign,
            dimmed, expanded: false, isShared: false, l3Count: item.l3Count ?? 0, functionId: item.functionId,
          },
          width: L2_DOT_SIZE, height: L2_DOT_SIZE, zIndex: 1,
        })
      } else {
        nodes.push({
          id: nodeId, type: 'l3-stop',
          position: { x: effectCx - L3_SIZE / 2, y: rowY - L3_SIZE / 2 },
          data: {
            elementId: item.id, label: item.name, hierarchyId: item.hierarchyId,
            allHierarchyIds: item.allHierarchyIds, lineColor, lineColorDesign, dimmed, functionId: item.functionId,
          },
          width: L3_SIZE, height: L3_SIZE, zIndex: 1,
        })
      }

      points.push({ id: nodeId, x: effectCx, y: rowY })
    }

    // Anchor the L1 label just left of the first stop (which sits in its own
    // function column), 24px gap between the label's right edge and the stop
    // center — same rule as the metro view. Collapsed rows have no first stop
    // and keep their default far-left position.
    const firstPt = points[0]
    if (firstPt) {
      l1Node.position = { x: firstPt.x - 24 - L1_LABEL_W, y: rowY - L1_LABEL_H / 2 }
      ;(l1Node.data as any).widthAnchor = { mode: 'right', x: firstPt.x - 24 }
    }
    ;(l1Node.data as any).firstStopId = firstPt?.id

    // ── Pass 2: assign lanes to segments (spine-preferring interval coloring) ─
    // Forward/flat segments prefer lane 0 (the spine on rowY); a segment can
    // share a lane only if it starts at/after that lane's rightmost occupied X.
    // Backward runs skip lane 0 so detours always ride above the spine.
    const nSeg = points.length - 1
    const segLane: number[] = new Array(nSeg).fill(0)
    const laneEnd: number[] = []
    const EPS = 0.5
    for (let s = 0; s < nSeg; s++) {
      const a = points[s], b = points[s + 1]
      const xL = Math.min(a.x, b.x)
      const xR = Math.max(a.x, b.x)
      const backward = b.x < a.x - EPS
      let L = backward ? 1 : 0
      while (true) {
        const end = laneEnd[L]
        if (end === undefined || xL >= end - EPS) {
          segLane[s] = L
          laneEnd[L] = Math.max(end ?? -Infinity, xR)
          break
        }
        L++
      }
    }
    let maxLane = 0
    for (let s = 0; s < nSeg; s++) maxLane = Math.max(maxLane, segLane[s])

    // ── Pass 2b: vertical pitch between detour lanes, capped by row budget ────
    const budget = Math.max(FN_NODE_PITCH, rowY - prevBottom(rowIdx) - LANE_MARGIN)
    const pitch  = maxLane > 0
      ? Math.max(10, Math.min(LANE_PITCH_MAX, budget / maxLane))
      : LANE_PITCH_MAX
    const laneY  = (L: number) => (L === 0 ? rowY : rowY - L * pitch)

    // ── Pass 3: emit edges; lane>0 segments route over the top handles ────────
    for (let s = 0; s < nSeg; s++) {
      const a = points[s], b = points[s + 1]
      const L = segLane[s]
      const srcHandle = a.icRowOrderIdx !== undefined ? `right-${a.icRowOrderIdx}` : 'right'
      const tgtHandle = b.icRowOrderIdx !== undefined ? `left-${b.icRowOrderIdx}` : 'left'
      edges.push({
        id: `fncol-e-${a.id}-${b.id}-r${rowIdx}`,
        source: a.id, target: b.id,
        sourceHandle: srcHandle, targetHandle: tgtHandle,
        type: L === 0 ? 'metro-line-fn' : 'metro-line-lane',
        data: L === 0 ? { lineColor } : { lineColor, laneY: laneY(L) },
      })
    }
  }
  for (const e of edges) { e.zIndex = (e.data as any)?.bgGroup ? 0 : 1 }
  return { nodes: [...colNodes, ...nodes], edges }
}

// ── ZoomControls — must be inside ReactFlow to access useReactFlow ────────────
const zoomPanelStyle: React.CSSProperties = {
  background: 'var(--sapBaseColor)',
  borderRadius: '0.5rem',
  boxShadow: 'var(--sapContent_Shadow1)',
  display: 'flex',
  flexDirection: 'column',
  padding: '0.25rem',
  gap: '0.125rem',
}
function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  return (
    <Panel position="bottom-right" style={{ marginRight: '16px', marginBottom: '174px' }}>
      <div style={zoomPanelStyle}>
        <Button design="Transparent" icon="add" tooltip="Zoom in" onClick={() => zoomIn({ duration: 200 })} />
        <Button design="Transparent" icon="less" tooltip="Zoom out" onClick={() => zoomOut({ duration: 200 })} />
        <Button design="Transparent" icon="full-screen" tooltip="Fit view" onClick={() => fitView({ padding: 0.12, duration: 300 })} />
      </div>
    </Panel>
  )
}

// ── AutoFitView — must be inside ReactFlow to access useReactFlow ─────────────
function AutoFitView({ deps }: { deps: unknown[] }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.12, duration: 300 }), 80)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return null
}

// Iterative axis-aligned collision resolution.
// After each drag-stop, overlapping node pairs are pushed apart along the
// shortest separation axis until all gaps are at least `margin` px.
// function-column nodes (background strips) are excluded — they never move.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
function _resolveCollisions(
  nodes: Node[],
  { maxIterations = 200, margin = 12 }: { maxIterations?: number; margin?: number } = {},
): Node[] {
  const fixed   = nodes.filter(n => n.type === 'function-column')
  const movable = nodes.filter(n => n.type !== 'function-column')
  // shallow-copy positions so we don't mutate the original objects
  const result  = movable.map(n => ({ ...n, position: { ...n.position } }))

  for (let iter = 0; iter < maxIterations; iter++) {
    let anyOverlap = false

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];  const b = result[j]
        const aw = a.width ?? 0;  const ah = a.height ?? 0
        const bw = b.width ?? 0;  const bh = b.height ?? 0
        if (!aw || !bw) continue

        // A's bounding box expanded by margin
        const ax1 = a.position.x - margin;  const ax2 = a.position.x + aw + margin
        const ay1 = a.position.y - margin;  const ay2 = a.position.y + ah + margin
        // B's natural bounding box
        const bx1 = b.position.x;  const bx2 = b.position.x + bw
        const by1 = b.position.y;  const by2 = b.position.y + bh

        // No overlap?
        if (ax1 >= bx2 || bx1 >= ax2 || ay1 >= by2 || by1 >= ay2) continue

        anyOverlap = true

        // Overlap depth on each axis — push along the shallower one
        const ox = Math.min(ax2 - bx1, bx2 - ax1)
        const oy = Math.min(ay2 - by1, by2 - ay1)
        const half = 0.5

        if (ox <= oy) {
          const d = ox * half
          if (a.position.x <= b.position.x) {
            result[i].position = { x: a.position.x - d, y: a.position.y }
            result[j].position = { x: b.position.x + d, y: b.position.y }
          } else {
            result[i].position = { x: a.position.x + d, y: a.position.y }
            result[j].position = { x: b.position.x - d, y: b.position.y }
          }
        } else {
          const d = oy * half
          if (a.position.y <= b.position.y) {
            result[i].position = { x: a.position.x, y: a.position.y - d }
            result[j].position = { x: b.position.x, y: b.position.y + d }
          } else {
            result[i].position = { x: a.position.x, y: a.position.y + d }
            result[j].position = { x: b.position.x, y: b.position.y - d }
          }
        }
      }
    }

    if (!anyOverlap) break
  }

  return [...result, ...fixed]
}

const floatingPanel: React.CSSProperties = {
  background: 'var(--sapBaseColor)',
  borderRadius: '0.5rem',
  boxShadow: 'var(--sapContent_Shadow1)',
}

// ── CanvasView ────────────────────────────────────────────────────────────────
interface CanvasViewProps {
  hierarchyId: string
  selectedElementId?: string | null
  onSelectElement?: (id: string | null) => void
  displayLevel: DisplayLevel
  onDisplayLevelChange: (level: DisplayLevel) => void
  byFunction: boolean
  onByFunctionChange: (value: boolean) => void
  selectedL1Ids: string[]
  onSelectedL1IdsChange: (ids: string[]) => void
  isEditMode?: boolean
  onCreateBetween?: (predecessorId: string | null, successorId: string | null, parentId: string | null) => void
}

export default function CanvasView({
  hierarchyId, selectedElementId: _selectedElementId, onSelectElement,
  displayLevel, onDisplayLevelChange,
  byFunction, onByFunctionChange,
  selectedL1Ids, onSelectedL1IdsChange,
  isEditMode, onCreateBetween,
}: CanvasViewProps) {
  const { levelNames, userContextValues, setUserContextValues, contextDimensions } = useWorkspace()
  const { getElements } = useProcessLandscape()

  const [expandedIds,    setExpandedIds]    = useState<Set<string>>(new Set())
  const [collapsedL1Ids, setCollapsedL1Ids] = useState<Set<string>>(new Set())
  const [filterText,     setFilterText]     = useState('')
  const [hoveredNode,    setHoveredNode]    = useState<{ data: Record<string, any>; x: number; y: number } | null>(null)
  const [resetKey,       setResetKey]       = useState(0)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const elements = useMemo(() => getElements(hierarchyId), [getElements, hierarchyId])
  const resolved = useMemo(() => resolveElements(elements, userContextValues), [elements, userContextValues])

  const filteredResolved = useMemo(() => {
    if (selectedL1Ids.length === 0) return resolved  // empty = All = no filter
    const visibleSet = new Set(selectedL1Ids)
    // Build element id → L1 ancestor id map
    const l1AncestorOf = new Map<string, string>()
    for (const r of resolved) {
      if (r.element.level === 1) l1AncestorOf.set(r.element.id, r.element.id)
    }
    for (const r of resolved) {
      if (r.element.level === 2 && r.element.parentId) {
        l1AncestorOf.set(r.element.id, r.element.parentId)
      }
    }
    for (const r of resolved) {
      if (r.element.level === 3 && r.element.parentId) {
        const l1 = l1AncestorOf.get(r.element.parentId)
        if (l1) l1AncestorOf.set(r.element.id, l1)
      }
    }
    return resolved.filter(r => {
      const l1 = l1AncestorOf.get(r.element.id)
      return !l1 || visibleSet.has(l1)
    })
  }, [resolved, selectedL1Ids])

  const translateExtent = useMemo((): [[number, number], [number, number]] => {
    if (nodes.length === 0) return [[-2000, -2000], [6000, 6000]]
    const pad = 1200
    const xs = nodes.flatMap(n => [n.position.x, n.position.x + (n.width ?? 0)])
    const ys = nodes.flatMap(n => [n.position.y, n.position.y + (n.height ?? 0)])
    return [[Math.min(...xs) - pad, Math.min(...ys) - pad], [Math.max(...xs) + pad, Math.max(...ys) + pad]]
  }, [nodes])

  useEffect(() => {
    setExpandedIds(new Set())
    setCollapsedL1Ids(new Set())
    setFilterText('')
  }, [hierarchyId])

  const displayEdges = useMemo(() => {
    const result: Edge[] = []
    for (const e of edges) {
      const hasBand = (e.data as any)?.bgGroup
      const isLane  = e.type === 'metro-line-lane'
      const isFn    = e.type === 'metro-line-fn'
      const isLine  = e.type === 'metro-line'
      if (hasBand) {
        result.push({ ...e, id: `${e.id}-band`, type: isLane ? 'metro-band-lane' : 'metro-band', zIndex: 0 })
      }
      if (isLine || isFn) {
        result.push({ ...e, id: `${e.id}-bg`, type: 'metro-bg', zIndex: 1 })
      } else if (isLane) {
        result.push({ ...e, id: `${e.id}-bg`, type: 'metro-bg-lane', zIndex: 1 })
      }
      const isInteractive = isLine || isFn || isLane
      result.push({
        ...e,
        data: {
          ...(e.data as object),
          bgGroup: false,
          ...(isInteractive ? { editMode: isEditMode ?? false, onCreateBetween } : {}),
        },
        zIndex: 2,
      })
    }
    return result
  }, [edges, isEditMode, onCreateBetween])

  useEffect(() => {
    const { nodes: n, edges: e } = byFunction
      ? buildFunctionColumnGraph(filteredResolved, expandedIds, collapsedL1Ids, filterText, levelNames, displayLevel)
      : buildMetroGraph(filteredResolved, expandedIds, collapsedL1Ids, filterText, levelNames, displayLevel, hasActiveScope(userContextValues))
    // Stamp source/target element IDs onto interactive edges for the "+" button
    const nodeElemMap = new Map(n.map(nd => [nd.id, (nd.data as any)?.elementId as string | undefined]))
    const enriched = e.map(edge => {
      if (!['metro-line', 'metro-line-fn', 'metro-line-lane'].includes(edge.type ?? '')) return edge
      const srcElemId = nodeElemMap.get(edge.source) ?? null
      const tgtElemId = nodeElemMap.get(edge.target) ?? null
      const srcEl = srcElemId ? elements.find(el => el.id === srcElemId) : null
      return { ...edge, data: { ...(edge.data as object), sourceElementId: srcElemId, targetElementId: tgtElemId, sharedParentId: srcEl?.parentId ?? null } }
    })
    setNodes(n.map(node => node.type === 'function-col' ? node : { ...node, zIndex: Math.max((node.zIndex ?? 0) as number, 3) }))
    setEdges(enriched)
  }, [filteredResolved, expandedIds, collapsedL1Ids, filterText, levelNames, displayLevel, byFunction, resetKey, elements, setNodes, setEdges])

  // Bidirectional drag bundling: each L1 label is tied to its line's first stop
  // (an L2 stop, or the L2 group when the first L2 is expanded). Dragging either
  // node propagates the same delta to its partner so the 24px gap is preserved.
  const bundlePartner = useMemo(() => {
    const m = new Map<string, string>()
    for (const n of nodes) {
      if (n.type !== 'l1-label') continue
      const fs = (n.data as any).firstStopId as string | undefined
      if (fs) { m.set(n.id, fs); m.set(fs, n.id) }
    }
    return m
  }, [nodes])

  const onNodesChangeBundled = useCallback((changes: NodeChange[]) => {
    const extra: NodeChange[] = []
    for (const ch of changes) {
      // When React Flow measures an auto-width L1 pill, snap its left edge so the
      // pill's right edge (or center, in the by-function L1 view) lands on the
      // anchor recorded at build time — keeping the 24px gap regardless of label length.
      if (ch.type === 'dimensions') {
        const w = (ch as any).dimensions?.width as number | undefined
        const node = nodes.find(n => n.id === ch.id)
        const anchor = (node?.data as any)?.widthAnchor as { mode: 'right' | 'center'; x: number } | undefined
        if (node?.type === 'l1-label' && anchor && w) {
          const newX = anchor.mode === 'center' ? anchor.x - w / 2 : anchor.x - w
          if (Math.abs(newX - node.position.x) > 0.5) {
            extra.push({ id: ch.id, type: 'position', position: { x: newX, y: node.position.y } })
          }
        }
        continue
      }
      if (ch.type !== 'position' || !ch.position) continue
      const partnerId = bundlePartner.get(ch.id)
      if (!partnerId) continue
      const moving = nodes.find(n => n.id === ch.id)
      const partner = nodes.find(n => n.id === partnerId)
      if (!moving || !partner) continue
      const dx = ch.position.x - moving.position.x
      const dy = ch.position.y - moving.position.y
      if (dx === 0 && dy === 0) continue
      extra.push({
        id: partnerId, type: 'position',
        position: { x: partner.position.x + dx, y: partner.position.y + dy },
        dragging: ch.dragging,
      })
    }
    onNodesChange(extra.length ? [...changes, ...extra] : changes)
  }, [nodes, bundlePartner, onNodesChange])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const elId = (node.data as any).elementId as string
    if (!elId) return
    onSelectElement?.(elId)
  }, [onSelectElement])

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const elId = (node.data as any).elementId as string
    if (!elId) return
    if (node.type === 'l1-label') {
      setCollapsedL1Ids(prev => {
        const next = new Set(prev)
        if (next.has(elId)) next.delete(elId)
        else next.add(elId)
        return next
      })
    } else if (node.type === 'l2-stop' || node.type === 'l2-group') {
      setExpandedIds(prev => {
        const next = new Set(prev)
        if (next.has(elId)) next.delete(elId)
        else next.add(elId)
        return next
      })
    }
  }, [setCollapsedL1Ids, setExpandedIds])

  const onNodeMouseEnter = useCallback((e: React.MouseEvent, node: Node) => {
    const d = node.data as Record<string, any>
    if (!d.label) return
    setHoveredNode({ data: d, x: e.clientX, y: e.clientY })
  }, [])

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [])

  const onNodeDragStop = useCallback(() => {}, [setNodes])

  const l1Elements = useMemo(() => resolved.filter(r => r.element.level === 1), [resolved])
  const l1Count = filteredResolved.filter(r => r.element.level === 1).length

  const combinedFilters = useMemo<FilterValues>(() => {
    const result: FilterValues = {}
    for (const dim of contextDimensions) {
      const val = userContextValues[dim.id]
      const arr = Array.isArray(val) ? val : (val && val !== '') ? [val] : []
      result[dim.id] = arr.length === 0 ? ['__all__'] : arr
    }
    result['l1categories'] = selectedL1Ids.length === 0 ? ['__all__'] : selectedL1Ids
    return result
  }, [userContextValues, selectedL1Ids, contextDimensions])

  function asArr(val: string | string[] | undefined): string[] {
    if (!val) return []
    return Array.isArray(val) ? val : [val]
  }

  function handleFiltersChange(newFilters: FilterValues) {
    const contextOnly: Record<string, string | string[]> = {}
    for (const dim of contextDimensions) {
      const prevArr = asArr(userContextValues[dim.id] as string | string[] | undefined)
      const prevHadAll = prevArr.length === 0
      const newArr = asArr(newFilters[dim.id] as string | string[] | undefined)
      const hasAll = newArr.includes('__all__')
      if (hasAll && prevHadAll && newArr.length > 1) {
        contextOnly[dim.id] = newArr.filter(v => v !== '__all__')
      } else if (hasAll && !prevHadAll) {
        contextOnly[dim.id] = []
      } else {
        contextOnly[dim.id] = hasAll ? [] : newArr
      }
    }
    setUserContextValues(contextOnly)

    const prevL1HadAll = selectedL1Ids.length === 0
    const l1arr = asArr(newFilters['l1categories'] as string | string[] | undefined)
    const l1HasAll = l1arr.includes('__all__')
    if (l1HasAll && prevL1HadAll && l1arr.length > 1) {
      onSelectedL1IdsChange(l1arr.filter(v => v !== '__all__'))
    } else if (l1HasAll && !prevL1HadAll) {
      onSelectedL1IdsChange([])
    } else {
      onSelectedL1IdsChange(l1HasAll ? [] : l1arr)
    }
  }

  const handleSelectL3 = useCallback(() => {
    onDisplayLevelChange('l3')
    setCollapsedL1Ids(new Set())
    const allL2Ids = new Set(
      resolved.filter(r => r.element.level === 2).map(r => r.element.id)
    )
    setExpandedIds(allL2Ids)
  }, [resolved, onDisplayLevelChange])

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480 }}>
      <style>{`@keyframes metroNodeEnter { from { opacity: 0; transform: scale(0.75); } to { opacity: 1; transform: scale(1); } }`}</style>
      {hoveredNode && (() => {
        const elId = hoveredNode.data.elementId as string | undefined
        const el = elId ? resolved.find(r => r.element.id === elId)?.element : undefined
        const ownerId = (hoveredNode.data.ownerId as string | undefined) ?? el?.ownerId
        const owner = ownerId ? USERS.find(u => u.id === ownerId) : undefined
        const hierIds: string[] = (hoveredNode.data.allHierarchyIds as string[] | undefined)
          ?? (hoveredNode.data.hierarchyId ? [hoveredNode.data.hierarchyId as string] : [])
        return (
          <div style={{
            position: 'fixed',
            left: hoveredNode.x + 16,
            top: hoveredNode.y + 16,
            zIndex: 9999,
            background: 'var(--sapBaseColor)',
            border: '1px solid var(--sapList_BorderColor)',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.625rem',
            boxShadow: 'var(--sapContent_Shadow1)',
            minWidth: 160,
            maxWidth: 260,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: 600, color: 'var(--sapTextColor)', lineHeight: 1.3 }}>
              {hoveredNode.data.label}
            </div>
            {(hierIds.length > 0 || hoveredNode.data.scopeLabel || hoveredNode.data.functionId) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                {hierIds.map((hid: string, i: number) => {
                  const designs = hoveredNode.data.lineColorDesigns as string[] | undefined
                  const design = designs?.[i] ?? hoveredNode.data.lineColorDesign as any ?? designs?.[0] as any
                  return <SigChipV2 key={hid} condensed value={hid} design={design} />
                })}
                {(hoveredNode.data.scopeLabel as string | undefined) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    fontSize: 'var(--sapFontSmallSize)',
                    color: 'var(--sapContent_LabelColor)',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '0.5rem',
                    padding: '0.0625rem 0.375rem',
                    border: '1px solid var(--sapList_BorderColor)',
                    whiteSpace: 'nowrap',
                  }}>
                    {hoveredNode.data.scopeLabel as string}
                  </span>
                )}
                {(hoveredNode.data.functionId as string | undefined) && (
                  <SigChipV2 condensed value={FN_ORDERED_NAMES[hoveredNode.data.functionId as string] ?? hoveredNode.data.functionId as string} />
                )}
              </div>
            )}
            {owner && (
              <>
                <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', margin: '0.125rem -0.625rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingTop: '0.125rem' }}>
                  <Avatar initials={owner.initials} colorScheme={owner.colorScheme as 'Accent1'} size="XS" style={{ transform: 'scale(0.8)', margin: '-0.2rem' }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', lineHeight: 1.3 }}>{owner.name}</Text>
                </div>
              </>
            )}
          </div>
        )
      })()}
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodesChange={onNodesChangeBundled}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes as never}
        edgeTypes={edgeTypes as never}
        fitView
        fitViewOptions={{ padding: 0.12, duration: 0 }}
        translateExtent={translateExtent}
        minZoom={0.08}
        maxZoom={2.5}
        nodesConnectable={false}
        edgesFocusable={false}
        zIndexMode="manual"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--sapBackgroundColor)' }}
      >
        <AutoFitView deps={[l1Count, displayLevel, byFunction, hierarchyId, resetKey]} />
        <Background variant={"dots" as any} color="rgba(0,0,0,0.18)" gap={24} size={1.5} />
        <ZoomControls />

        {/* ── Left toolbar — vertically centred ── */}
        <Panel position="top-left" style={{ top: '50%', transform: 'translateY(-50%)', margin: '0 0 0 16px' }}>
          <div style={{ ...floatingPanel, display: 'flex', flexDirection: 'column', padding: '0.25rem', gap: '0.125rem' }}>
            <Button design="Transparent" icon="reset" tooltip="Reset layout to default positions" onClick={() => setResetKey(k => k + 1)} />
          </div>
        </Panel>
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => (n.data as any)?.lineColor ?? '#999'}
          style={{ background: 'var(--sapBaseColor)', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.5rem' }}
          maskColor="rgba(0,0,0,0.06)"
        />

        <StickyL1Labels
          nodes={nodes}
          collapsedL1Ids={collapsedL1Ids}
          onToggleCollapse={(id) => setCollapsedL1Ids(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
          })}
          onSelect={(id) => onSelectElement?.(id)}
        />

        <Panel position="top-left" style={{ margin: '16px' }}>
          <div style={{ ...floatingPanel, padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', height: 'calc(var(--sapElement_Compact_Height) + 0.5rem)', boxSizing: 'border-box' }}>
            <SigFilterBar
              filters={combinedFilters}
              onFiltersChange={handleFiltersChange}
            >
              {l1Elements.length > 0 && (
                <SigFilter filterKey="l1categories" label="Category">
                  <MultiSelect
                    options={[
                      { value: '__all__', label: 'All Categories' },
                      ...l1Elements.map(r => ({ value: r.element.id, label: r.element.name })),
                    ]}
                  />
                </SigFilter>
              )}
              {contextDimensions.filter(d => d.type === 'Selection').map(dim => (
                <SigFilter key={dim.id} filterKey={dim.id} label={dim.name}>
                  <MultiSelect
                    options={[
                      { value: '__all__', label: `All ${dim.name}s` },
                      ...(dim.options ?? []).map(opt => ({ value: opt, label: opt })),
                    ]}
                  />
                </SigFilter>
              ))}
            </SigFilterBar>
          </div>
        </Panel>

        <Panel position="top-right" style={{ margin: '16px' }}>
          <div style={{ ...floatingPanel, padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', height: 'calc(var(--sapElement_Compact_Height) + 0.5rem)', boxSizing: 'border-box' }}>
            <Input
              value={filterText}
              placeholder="Search landscape ..."
              style={{ width: '10rem' }}
              onInput={(e) => setFilterText((e.target as unknown as HTMLInputElement).value)}
            >
              <Icon slot="icon" name="search" />
            </Input>
            {filterText && (
              <Button design="Transparent" icon="decline" tooltip="Clear filter" onClick={() => setFilterText('')} />
            )}
            <div style={{ width: '1px', height: '1.5rem', background: 'var(--sapList_BorderColor)', flexShrink: 0 }} />
            <SegmentedButton itemsFitContent>
              <SegmentedButtonItem
                selected={displayLevel === 'l1'}
                onClick={() => {
                  onDisplayLevelChange('l1')
                  setExpandedIds(new Set())
                  setCollapsedL1Ids(new Set(resolved.filter(r => r.element.level === 1).map(r => r.element.id)))
                }}
              >{levelNames[1]}</SegmentedButtonItem>
              <SegmentedButtonItem
                selected={displayLevel === 'l2'}
                onClick={() => { onDisplayLevelChange('l2'); setExpandedIds(new Set()); setCollapsedL1Ids(new Set()) }}
              >{levelNames[2]}</SegmentedButtonItem>
              <SegmentedButtonItem
                selected={displayLevel === 'l3'}
                onClick={handleSelectL3}
              >{levelNames[3]}</SegmentedButtonItem>
            </SegmentedButton>
            <div style={{ width: '1px', height: '1.5rem', background: 'var(--sapList_BorderColor)', flexShrink: 0 }} />
            <CheckBox
              text="By function"
              checked={byFunction}
              onChange={(e) => onByFunctionChange((e.target as any).checked)}
            />
          </div>
        </Panel>

        {l1Count === 0 && (
          <Panel position="top-center">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem 2rem' }}>
              <Icon name="SAP-icons-v4/process-manager" style={{ fontSize: '3rem', color: 'var(--sapContent_IconColor)', opacity: 0.2 }} />
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                No processes in this hierarchy yet
              </Text>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
