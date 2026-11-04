import React, { useState, useMemo, useEffect } from 'react'
import '@xyflow/react/dist/style.css'
import {
  ReactFlow, Background, useNodesState, useEdgesState, useReactFlow, useStore,
  Handle, Position, EdgeLabelRenderer, BaseEdge, getSmoothStepPath,
  type Node, type Edge, type NodeProps, type EdgeProps,
} from '@xyflow/react'
import { Button, Icon, Input, Switch, RadioButton, Text, Link } from '@ui5/webcomponents-react'
import s from './SemanticViews.module.css'

// ── Colors per object type ───────────────────────────────────────────────────
const C = {
  ct:   '#5E7A00',  // Change Task   (olive green)
  cr:   '#C0006B',  // Change Request (hot pink)
  inc:  '#1473E6',  // Incident       (blue)
  prob: '#9E6500',  // Problem        (amber)
} as const

const OWNER_COLOR: Record<string, string> = {
  incident: C.inc, problem: C.prob, changeRequest: C.cr, changeTask: C.ct,
}

// ── Category pill node ───────────────────────────────────────────────────────
function CategoryNode({ data }: NodeProps) {
  const isSelected = data.isSelected as boolean | undefined
  const highlighted = data.highlighted as boolean | undefined
  const zoom = useStore((st: any) => st.transform[2])
  const compact = zoom < 0.4
  const metric = data.metric as string | undefined
  const total = metric === 'cycle' ? data.cycleTime as string :
                metric === 'object' ? data.objectCount as number :
                data.count as number

  return (
    <div style={{
      background: data.color as string,
      color: 'white',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      outline: isSelected ? `2.5px solid ${data.color as string}` : '2.5px solid transparent',
      outlineOffset: '2px',
      transition: 'outline 0.1s, box-shadow 0.15s',
      boxShadow: highlighted ? '0 0 0 3px white, 0 4px 20px rgba(0,0,0,0.35)' : undefined,
    }}>
      <span style={{ visibility: compact ? 'hidden' : 'visible' }}>{data.label as string} <span style={{ fontWeight: 400 }}>({total})</span></span>
      <Handle type="source" position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
    </div>
  )
}

// ── Event node ───────────────────────────────────────────────────────────────
type Dot = { color: string; count: number; cycleTime?: string; objectCount?: number }

function EventNode({ data }: NodeProps) {
  const dots = data.dots as Dot[] | undefined
  const zoom = useStore((st: any) => st.transform[2])
  const compact = zoom < 0.4
  const color = OWNER_COLOR[data.owner as string] ?? '#888'
  const metric = data.metric as string | undefined
  const highlighted = data.highlighted as boolean | undefined
  const CIR = 10

  const dotValue = (d: Dot) =>
    metric === 'cycle' ? (d.cycleTime ?? '') :
    metric === 'object' ? (d.objectCount ?? d.count) :
    d.count

  return (
    // Bounding box = circle only; card floats outside as overflow
    <div style={{ width: CIR, height: CIR, position: 'relative', overflow: 'visible' }}>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
      <Handle type="target" position={Position.Left}   id="tl" style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
      <Handle type="source" position={Position.Left}   id="sl" style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
      <Handle type="target" position={Position.Right}  id="tr" style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />
      <Handle type="source" position={Position.Right}  id="sr" style={{ opacity: 0, width: 1, height: 1, minWidth: 1, minHeight: 1 }} />

      {/* Circle */}
      <div style={{
        width: CIR, height: CIR, borderRadius: '50%',
        border: `1.5px solid ${color}`, background: 'white',
      }} />

      {/* Card floats to the right, vertically centered on circle */}
      <div style={{
        position: 'absolute', left: CIR + 5, top: '50%', transform: 'translateY(-50%)',
        background: 'white', border: '1px solid #d9d9d9',
        borderRadius: 8, padding: '8px 12px',
        minWidth: 130, whiteSpace: 'nowrap',
        boxShadow: highlighted ? '0 0 0 2px white, 0 4px 20px rgba(0,0,0,0.35)' : undefined,
        transition: 'box-shadow 0.15s',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sapTextColor)', marginBottom: dots?.length ? 4 : 0, visibility: compact ? 'hidden' : 'visible' }}>
          {data.label as string}
        </div>
        {dots && dots.length > 0 && !compact && (
          <div style={{ display: 'flex', gap: dots.length > 1 ? 8 : 3, flexWrap: 'wrap' }}>
            {dots.map((d, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                {dots.length > 1 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />}
                <span style={{ color: 'var(--sapContent_LabelColor)', fontWeight: 500 }}>{dotValue(d)}</span>
              </span>
            ))}
          </div>
        )}
        {dots && dots.length > 1 && compact && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 12, gap: 6 }}>
            {dots.map((d, i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Terminal node (circle with square inside at column end) ──────────────────
function TerminalNode({ data }: NodeProps) {
  const color = data.color as string
  return (
    <div style={{
      width: 20, height: 20,
      borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 10, height: 10,
        borderRadius: 2,
        background: 'white',
      }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  )
}

// ── Colored step edge with arrow / circle markers ────────────────────────────
function CountEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style: outerStyle }: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 10,
  })
  const color     = (data?.color ?? '#999') as string
  const count       = data?.count as number | undefined
  const cycleTime   = data?.cycleTime as string | undefined
  const objectCount = data?.objectCount as number | undefined
  const metric      = data?.metric as string | undefined
  const label       = metric === 'cycle' ? cycleTime : metric === 'object' ? objectCount : count
  const dotted    = (data?.dotted ?? false) as boolean
  const edgeHighlighted = (data?.highlighted ?? false) as boolean
  const sw        = dotted ? 2 : 3.5
  const opacity   = (outerStyle as React.CSSProperties | undefined)?.opacity

  const cid   = color.replace('#', '')
  const arrId = `arr-${cid}`
  const cirId = `cir-${cid}`

  return (
    <>
      <defs>
        <marker id={arrId} markerWidth="8" markerHeight="7" refX="8" refY="3.5"
          orient="auto" markerUnits="userSpaceOnUse">
          <polygon points="0 0, 8 3.5, 0 7" fill={color} />
        </marker>
        <marker id={cirId} markerWidth="8" markerHeight="8" refX="4" refY="4"
          markerUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="3.5" fill={color} />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={`url(#${arrId})`}
        markerStart={dotted ? undefined : `url(#${cirId})`}
        style={{ stroke: color, strokeWidth: sw, strokeDasharray: dotted ? '5,5' : undefined, fill: 'none', opacity, filter: edgeHighlighted ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' : undefined }}
      />
      {label != null && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 11, color: 'var(--sapContent_LabelColor)',
              background: '#f4f4f4',
              padding: '1px 5px', borderRadius: 3, fontWeight: 500, pointerEvents: 'none',
              opacity,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { category: CategoryNode, event: EventNode, terminal: TerminalNode }
const edgeTypes = { count: CountEdge }

// ── Event ordering: each object type's events in frequency order (most → least) ─
const EVENT_SEQUENCE: Record<string, string[]> = {
  incident:      ['incident-created', 'incident-closed', 'incident-under-investigation', 'incident-resolved', 'incident-reopened'],
  problem:       ['problem-created', 'problem-closed', 'problem-root-cause', 'problem-resolved'],
  changeRequest: ['cr-created', 'cr-field-changed', 'cr-closed', 'cr-assessment', 'cr-impl-started'],
  changeTask:    ['ct-created', 'ct-finished', 'ct-assigned', 'ct-status-changed', 'ct-approved'],
}
// Map: event node id → 1-based position in its owner's sequence
const EVENT_SEQ_MAP: Record<string, number> = {}
Object.values(EVENT_SEQUENCE).forEach(events => {
  events.forEach((id, idx) => { EVENT_SEQ_MAP[id] = idx + 1 })
})
const TERMINAL_IDS: Record<string, string> = {
  incident: 'term-inc', problem: 'term-prob', changeRequest: 'term-cr', changeTask: 'term-ct',
}

// ── Cross-object path pool: extra connections revealed by the path slider ─────
// Paths are ordered most-frequent first within each owner's list.
// Adjacency rule: INC↔PROB, PROB↔CR, CR↔CT (left-to-right or right-to-left only).
interface CrossPath {
  id: string; source: string; sourceHandle: string
  target: string; targetHandle: string
  color: string; count: number; cycleTime?: string; objectCount?: number
}
const PATH_POOL: Record<string, CrossPath[]> = {
  incident: [
    // Within INC column — alternative routes and rework loops
    { id: 'path-inc-1', source: 'incident-created',              sourceHandle: 'sl', target: 'incident-resolved',            targetHandle: 'tl', color: C.inc, count: 18, cycleTime: '2h',  objectCount: 15 },
    { id: 'path-inc-2', source: 'incident-closed',               sourceHandle: 'sl', target: 'incident-created',             targetHandle: 'tl', color: C.inc, count: 12, cycleTime: '1h',  objectCount: 10 },
    { id: 'path-inc-3', source: 'incident-under-investigation',  sourceHandle: 'sl', target: 'incident-closed',              targetHandle: 'tl', color: C.inc, count: 8,  cycleTime: '3d',  objectCount: 7  },
    { id: 'path-inc-4', source: 'incident-reopened',             sourceHandle: 'sl', target: 'incident-resolved',            targetHandle: 'tl', color: C.inc, count: 5,  cycleTime: '4d',  objectCount: 4  },
  ],
  problem: [
    // Within PROB column
    { id: 'path-prob-1', source: 'problem-created',    sourceHandle: 'sl', target: 'problem-root-cause', targetHandle: 'tl', color: C.prob, count: 22, cycleTime: '3d', objectCount: 19 },
    { id: 'path-prob-2', source: 'problem-root-cause', sourceHandle: 'sl', target: 'problem-closed',     targetHandle: 'tl', color: C.prob, count: 14, cycleTime: '2d', objectCount: 12 },
    { id: 'path-prob-3', source: 'problem-resolved',   sourceHandle: 'sl', target: 'problem-created',    targetHandle: 'tl', color: C.prob, count: 9,  cycleTime: '1h', objectCount: 7  },
  ],
  changeRequest: [
    // Within CR column
    { id: 'path-cr-1', source: 'cr-created',      sourceHandle: 'sl', target: 'cr-closed',       targetHandle: 'tl', color: C.cr, count: 31, cycleTime: '4h', objectCount: 28 },
    { id: 'path-cr-2', source: 'cr-field-changed', sourceHandle: 'sl', target: 'cr-closed',       targetHandle: 'tl', color: C.cr, count: 19, cycleTime: '2h', objectCount: 17 },
    { id: 'path-cr-3', source: 'cr-closed',        sourceHandle: 'sl', target: 'cr-field-changed', targetHandle: 'tl', color: C.cr, count: 11, cycleTime: '1d', objectCount: 9  },
    { id: 'path-cr-4', source: 'cr-assessment',    sourceHandle: 'sl', target: 'cr-closed',       targetHandle: 'tl', color: C.cr, count: 7,  cycleTime: '6h', objectCount: 6  },
  ],
  changeTask: [
    // Within CT column
    { id: 'path-ct-1', source: 'ct-created',       sourceHandle: 'sl', target: 'ct-assigned',      targetHandle: 'tl', color: C.ct, count: 45, cycleTime: '2h', objectCount: 41 },
    { id: 'path-ct-2', source: 'ct-finished',       sourceHandle: 'sl', target: 'ct-created',       targetHandle: 'tl', color: C.ct, count: 28, cycleTime: '1h', objectCount: 24 },
    { id: 'path-ct-3', source: 'ct-assigned',       sourceHandle: 'sl', target: 'ct-approved',      targetHandle: 'tl', color: C.ct, count: 16, cycleTime: '3d', objectCount: 14 },
    { id: 'path-ct-4', source: 'ct-status-changed', sourceHandle: 'sl', target: 'ct-finished',      targetHandle: 'tl', color: C.ct, count: 9,  cycleTime: '2d', objectCount: 8  },
  ],
}

// ── Graph data ────────────────────────────────────────────────────────────────
//
// 4 columns left-to-right:  INC(x≈100) | PROB(x≈335) | CR(x≈570) | CT(x≈840)
//
// Row structure:
//   y=50   — category pills (object types)
//   y=220  — first lifecycle events for INC and PROB
//   y=320  — first lifecycle events for CR and CT
//            (slightly lower because CR/CT creation is triggered by INC/PROB)
//   y=500  — second lifecycle events
//   y=680  — third lifecycle event (CR Closed only)
//   y=840  — column terminals (small squares)
//
// Dotted edges : pill → first event (object column trace)
// Solid edges  : event → event within the same object's lifecycle
// Cross-column : inter-object connections where shared events have multiple dots
//
const INITIAL_NODES: Node[] = [
  // ── Object pills ──────────────────────────────────────────────────────────
  { id: 'cat-inc',  type: 'category', position: { x: 82,  y: 50 }, data: { label: 'Incident',       color: C.inc,  owner: 'incident',      count: 32,  objectCount: 28,  cycleTime: '2d'  }, draggable: false },
  { id: 'cat-prob', type: 'category', position: { x: 318, y: 50 }, data: { label: 'Problem',        color: C.prob, owner: 'problem',       count: 63,  objectCount: 59,  cycleTime: '3d'  }, draggable: false },
  { id: 'cat-cr',   type: 'category', position: { x: 556, y: 50 }, data: { label: 'Change Request', color: C.cr,   owner: 'changeRequest', count: 94,  objectCount: 88,  cycleTime: '5d'  }, draggable: false },
  { id: 'cat-ct',   type: 'category', position: { x: 832, y: 50 }, data: { label: 'Change Task',    color: C.ct,   owner: 'changeTask',    count: 127, objectCount: 120, cycleTime: '6d'  }, draggable: false },

  // ── Row 1: INC and PROB first events (y=220) ──────────────────────────────
  { id: 'incident-created', type: 'event', position: { x: 60,  y: 220 },
    data: { label: 'Incident Created', owner: 'incident',
      dots: [{ color: C.inc, count: 32, objectCount: 28, cycleTime: '0h' }] } },
  { id: 'problem-created',  type: 'event', position: { x: 298, y: 220 },
    data: { label: 'Problem Created', owner: 'problem',
      dots: [{ color: C.prob, count: 63, objectCount: 59, cycleTime: '0h' }, { color: C.ct, count: 80, objectCount: 75, cycleTime: '2h' }] } },

  // ── Row 2: CR and CT first events (y=320) ─────────────────────────────────
  // CR Created has dots for CR, INC and CT — it's a convergence point
  { id: 'cr-created',   type: 'event', position: { x: 530, y: 320 },
    data: { label: 'Change Request Created', owner: 'changeRequest',
      dots: [{ color: C.cr, count: 94, objectCount: 88, cycleTime: '0h' }, { color: C.inc, count: 93, objectCount: 28, cycleTime: '2h' }, { color: C.ct, count: 54, objectCount: 51, cycleTime: '4h' }] } },
  // CT Created also involves CR objects — triggered by the change request
  { id: 'ct-created',   type: 'event', position: { x: 818, y: 320 },
    data: { label: 'Change task created', owner: 'changeTask',
      dots: [{ color: C.ct, count: 127, objectCount: 120, cycleTime: '0h' }, { color: C.cr, count: 100, objectCount: 88, cycleTime: '1h' }] } },

  // ── Row 3: second events in each column (y=500) ───────────────────────────
  { id: 'incident-closed',   type: 'event', position: { x: 60,  y: 500 },
    data: { label: 'Incident Closed', owner: 'incident',
      dots: [{ color: C.inc, count: 64, objectCount: 28, cycleTime: '4d 2h' }] } },
  { id: 'problem-closed',    type: 'event', position: { x: 298, y: 500 },
    data: { label: 'Problem Closed', owner: 'problem',
      dots: [{ color: C.prob, count: 84, objectCount: 59, cycleTime: '7d 14h' }] } },
  { id: 'cr-field-changed',  type: 'event', position: { x: 500, y: 500 },
    data: { label: 'Change Request Field Changed', owner: 'changeRequest',
      dots: [{ color: C.cr, count: 35, objectCount: 41, cycleTime: '2d 6h' }] } },
  { id: 'ct-finished',       type: 'event', position: { x: 806, y: 500 },
    data: { label: 'Change task finished', owner: 'changeTask',
      dots: [{ color: C.ct, count: 127, objectCount: 120, cycleTime: '3d' }] } },

  // ── Row 4: CR final closure (y=680) ───────────────────────────────────────
  { id: 'cr-closed', type: 'event', position: { x: 500, y: 680 },
    data: { label: 'Change Request Closed', owner: 'changeRequest',
      dots: [{ color: C.cr, count: 24, objectCount: 38, cycleTime: '18h' }] } },

  // ── Extended events: revealed as the slider is increased ──────────────────
  // INC extras (seq 3–5)
  { id: 'incident-under-investigation', type: 'event', position: { x: 60, y: 620 },
    data: { label: 'Under Investigation', owner: 'incident',
      dots: [{ color: C.inc, count: 21, objectCount: 18, cycleTime: '5d' }] } },
  { id: 'incident-resolved', type: 'event', position: { x: 60, y: 740 },
    data: { label: 'Incident Resolved', owner: 'incident',
      dots: [{ color: C.inc, count: 14, objectCount: 12, cycleTime: '8d' }] } },
  { id: 'incident-reopened', type: 'event', position: { x: 60, y: 860 },
    data: { label: 'Incident Reopened', owner: 'incident',
      dots: [{ color: C.inc, count: 7, objectCount: 6, cycleTime: '10d' }] } },
  // PROB extras (seq 3–4)
  { id: 'problem-root-cause', type: 'event', position: { x: 298, y: 620 },
    data: { label: 'Root Cause Found', owner: 'problem',
      dots: [{ color: C.prob, count: 31, objectCount: 28, cycleTime: '9d' }] } },
  { id: 'problem-resolved', type: 'event', position: { x: 298, y: 740 },
    data: { label: 'Problem Resolved', owner: 'problem',
      dots: [{ color: C.prob, count: 22, objectCount: 18, cycleTime: '12d' }] } },
  // CR extras (seq 4–5)
  { id: 'cr-assessment', type: 'event', position: { x: 500, y: 810 },
    data: { label: 'CR Assessment Done', owner: 'changeRequest',
      dots: [{ color: C.cr, count: 19, objectCount: 21, cycleTime: '1d 3h' }] } },
  { id: 'cr-impl-started', type: 'event', position: { x: 500, y: 940 },
    data: { label: 'Implementation Started', owner: 'changeRequest',
      dots: [{ color: C.cr, count: 12, objectCount: 15, cycleTime: '2d' }] } },
  // CT extras (seq 3–5)
  { id: 'ct-assigned', type: 'event', position: { x: 806, y: 620 },
    data: { label: 'Change Task Assigned', owner: 'changeTask',
      dots: [{ color: C.ct, count: 84, objectCount: 78, cycleTime: '4d' }] } },
  { id: 'ct-status-changed', type: 'event', position: { x: 806, y: 740 },
    data: { label: 'Task Status Changed', owner: 'changeTask',
      dots: [{ color: C.ct, count: 62, objectCount: 55, cycleTime: '5d' }] } },
  { id: 'ct-approved', type: 'event', position: { x: 806, y: 860 },
    data: { label: 'Change Task Approved', owner: 'changeTask',
      dots: [{ color: C.ct, count: 43, objectCount: 38, cycleTime: '7d' }] } },

  // ── Column terminals (y=1060, shifted down to accommodate extended events) ─
  { id: 'term-inc',  type: 'terminal', position: { x: 130, y: 1060 }, data: { color: C.inc,  owner: 'incident'      }, draggable: false },
  { id: 'term-prob', type: 'terminal', position: { x: 365, y: 1060 }, data: { color: C.prob, owner: 'problem'       }, draggable: false },
  { id: 'term-cr',   type: 'terminal', position: { x: 576, y: 1060 }, data: { color: C.cr,   owner: 'changeRequest' }, draggable: false },
  { id: 'term-ct',   type: 'terminal', position: { x: 882, y: 1060 }, data: { color: C.ct,   owner: 'changeTask'    }, draggable: false },
]

const INITIAL_EDGES: Edge[] = [
  // ── Dotted column traces: pill → first event ──────────────────────────────
  { id: 'trace-inc',  source: 'cat-inc',  target: 'incident-created',
    type: 'count', data: { color: C.inc,  dotted: true, count: 32,  cycleTime: '2d',    objectCount: 28  } },
  { id: 'trace-prob', source: 'cat-prob', target: 'problem-created',
    type: 'count', data: { color: C.prob, dotted: true, count: 63,  cycleTime: '3d',    objectCount: 59  } },
  { id: 'trace-cr',   source: 'cat-cr',   target: 'cr-created',
    type: 'count', data: { color: C.cr,   dotted: true, count: 94,  cycleTime: '5d',    objectCount: 88  } },
  { id: 'trace-ct',   source: 'cat-ct',   target: 'ct-created',
    type: 'count', data: { color: C.ct,   dotted: true, count: 127, cycleTime: '6d',    objectCount: 120 } },

  // ── Solid within-object lifecycle edges ───────────────────────────────────
  // INC: Incident Created → Incident Closed
  { id: 'inc-1', source: 'incident-created', target: 'incident-closed',
    type: 'count', data: { color: C.inc, count: 64, cycleTime: '4d 2h',  objectCount: 28 } },
  // PROB: Problem Created → Problem Closed
  { id: 'prob-1', source: 'problem-created', target: 'problem-closed',
    type: 'count', data: { color: C.prob, count: 84, cycleTime: '7d 14h', objectCount: 59 } },
  // CR: Change Request Created → Field Changed → Closed
  { id: 'cr-1', source: 'cr-created',      target: 'cr-field-changed',
    type: 'count', data: { color: C.cr, count: 35, cycleTime: '2d 6h',  objectCount: 41 } },
  { id: 'cr-2', source: 'cr-field-changed', target: 'cr-closed',
    type: 'count', data: { color: C.cr, count: 24, cycleTime: '18h',    objectCount: 38 } },
  // CT: Change task created → Change task finished
  { id: 'ct-1', source: 'ct-created', target: 'ct-finished',
    type: 'count', data: { color: C.ct, count: 127, cycleTime: '3d',    objectCount: 120 } },

  // ── Cross-object connections (inter-object event relationships) ────────────
  // Incidents lead to CR creation (INC count in cr-created = 93)
  { id: 'cross-inc-cr', source: 'incident-created', sourceHandle: 'sr',
    target: 'cr-created', targetHandle: 'tl',
    type: 'count', data: { color: C.inc, count: 93, cycleTime: '2h', objectCount: 28 } },
  // Problems lead to CR creation (logical OCPM connection)
  { id: 'cross-prob-cr', source: 'problem-created', sourceHandle: 'sr',
    target: 'cr-created', targetHandle: 'tl',
    type: 'count', data: { color: C.prob, count: 63, cycleTime: '4h', objectCount: 59 } },
  // Change Request leads to Change Task creation (CR count in ct-created = 100)
  { id: 'cross-cr-ct', source: 'cr-created', sourceHandle: 'sr',
    target: 'ct-created', targetHandle: 'tl',
    type: 'count', data: { color: C.cr, count: 100, cycleTime: '1h', objectCount: 88 } },

  // ── Extended lifecycle edges (connect extra event nodes in each column) ────
  { id: 'inc-2', source: 'incident-closed',              target: 'incident-under-investigation',
    type: 'count', data: { color: C.inc, count: 21, cycleTime: '1d',     objectCount: 18 } },
  { id: 'inc-3', source: 'incident-under-investigation', target: 'incident-resolved',
    type: 'count', data: { color: C.inc, count: 14, cycleTime: '3d',     objectCount: 12 } },
  { id: 'inc-4', source: 'incident-resolved',            target: 'incident-reopened',
    type: 'count', data: { color: C.inc, count: 7,  cycleTime: '2d',     objectCount: 6  } },
  { id: 'prob-2', source: 'problem-closed',     target: 'problem-root-cause',
    type: 'count', data: { color: C.prob, count: 31, cycleTime: '2d',    objectCount: 28 } },
  { id: 'prob-3', source: 'problem-root-cause', target: 'problem-resolved',
    type: 'count', data: { color: C.prob, count: 22, cycleTime: '3d',    objectCount: 18 } },
  { id: 'cr-3', source: 'cr-closed',     target: 'cr-assessment',
    type: 'count', data: { color: C.cr, count: 19, cycleTime: '1d',      objectCount: 21 } },
  { id: 'cr-4', source: 'cr-assessment', target: 'cr-impl-started',
    type: 'count', data: { color: C.cr, count: 12, cycleTime: '1d 3h',   objectCount: 15 } },
  { id: 'ct-2', source: 'ct-finished',       target: 'ct-assigned',
    type: 'count', data: { color: C.ct, count: 84, cycleTime: '1d',      objectCount: 78 } },
  { id: 'ct-3', source: 'ct-assigned',       target: 'ct-status-changed',
    type: 'count', data: { color: C.ct, count: 62, cycleTime: '2d',      objectCount: 55 } },
  { id: 'ct-4', source: 'ct-status-changed', target: 'ct-approved',
    type: 'count', data: { color: C.ct, count: 43, cycleTime: '3d',      objectCount: 38 } },
]

// ── Auto fit-view when visible objects change ─────────────────────────────────
type ObjKey = 'changeTask' | 'changeRequest' | 'incident' | 'problem'

interface SliderHighlight {
  nodeIds: ReadonlySet<string>
  edgeIds: ReadonlySet<string>
}

const OBJECT_DEFS: { key: ObjKey; label: string; color: string; x: number }[] = [
  { key: 'incident',      label: 'Incident',       color: C.inc,  x: 82  },
  { key: 'problem',       label: 'Problem',        color: C.prob, x: 318 },
  { key: 'changeRequest', label: 'Change Request', color: C.cr,   x: 556 },
  { key: 'changeTask',    label: 'Change Task',    color: C.ct,   x: 832 },
]

function FitViewOnChange({ trigger }: { trigger: unknown }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 60)
    return () => clearTimeout(t)
  }, [trigger, fitView])
  return null
}

// ── Custom zoom toolbar (bottom-center card) ──────────────────────────────────
function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useStore((s: any) => s.transform[2])
  const pct = Math.round((zoom ?? 1) * 100)

  const card: React.CSSProperties = {
    position: 'absolute', bottom: 16, right: 16,
    display: 'flex', alignItems: 'center',
    background: 'var(--sapList_Background, #fff)',
    border: '1px solid var(--sapGroup_ContentBorderColor)',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 10, overflow: 'hidden',
  }
  const btn: React.CSSProperties = { width: 32, height: 32, padding: 0 }
  const divider: React.CSSProperties = {
    width: 1, height: 20, background: 'var(--sapGroup_ContentBorderColor)', flexShrink: 0,
  }
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: 2 }}>
        <Button design="Transparent" icon="map-2" tooltip="Toggle minimap" style={btn} />
        <Button design="Transparent" icon="full-screen" tooltip="Fit view"
          style={btn} onClick={() => fitView({ duration: 300, padding: 0.15 })} />
        <Button design="Transparent" icon="search" tooltip="Fit to view"
          style={btn} onClick={() => fitView({ duration: 300, padding: 0.15 })} />
      </div>
      <div style={divider} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: 2 }}>
        <Button design="Transparent" icon="less" tooltip="Zoom out"
          style={btn} onClick={() => zoomOut({ duration: 200 })} />
        <span style={{
          minWidth: 44, textAlign: 'center',
          fontSize: 'var(--sapFontSize)', fontWeight: 500, color: 'var(--sapTextColor)',
        }}>
          {pct}%
        </span>
        <Button design="Transparent" icon="add" tooltip="Zoom in"
          style={btn} onClick={() => zoomIn({ duration: 200 })} />
      </div>
    </div>
  )
}

// ── Sticky object bar (appears when pills scroll above viewport) ──────────────
function StickyBarVisibility({ onChange }: { onChange: (v: boolean) => void }) {
  const [, ty, zoom] = useStore((st: any) => st.transform as [number, number, number])
  const visible = 50 * zoom + ty <= 0
  useEffect(() => { onChange(visible) }, [visible])
  return null
}

function StickyObjectBar({ objects, selectedObj, onSelect }: {
  objects: Record<ObjKey, boolean>
  selectedObj: ObjKey | null
  onSelect: (key: ObjKey) => void
}) {
  const [tx, ty, zoom] = useStore((st: any) => st.transform as [number, number, number])
  // Category pills are at y=50 in graph space; screen Y ≈ 50*zoom + ty
  if (50 * zoom + ty > 0) return null
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 40, zIndex: 10,
      overflow: 'hidden',
      background: 'rgba(244,244,244,0.92)',
      backdropFilter: 'blur(6px)',
      borderBottom: '1px solid var(--sapGroup_ContentBorderColor)',
    }}>
      {OBJECT_DEFS.filter(o => objects[o.key]).map(obj => (
        <div key={obj.key} onClick={() => onSelect(obj.key)} style={{
          position: 'absolute',
          left: obj.x * zoom + tx,
          top: '50%',
          transform: 'translateY(-50%)',
          background: obj.color, color: 'white',
          padding: '4px 12px', borderRadius: '14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          outline: selectedObj === obj.key ? `2.5px solid ${obj.color}` : '2.5px solid transparent',
          outlineOffset: '2px',
        }}>
          {obj.label}
        </div>
      ))}
    </div>
  )
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({
  title, badge, defaultOpen = true, children,
}: {
  title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={s.section}>
      <div className={s.sectionHeader} onClick={() => setOpen(o => !o)}>
        <Icon name={open ? 'navigation-down-arrow' : 'navigation-right-arrow'}
          style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }} />
        <span className={s.sectionTitle}>{title}</span>
        {badge && <span className={s.sectionBadge}>{badge}</span>}
      </div>
      {open && <div className={s.sectionBody}>{children}</div>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SemanticViews() {
  const [activeTab, setActiveTab] = useState<'objects' | 'casescopes' | 'discovery'>('discovery')
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES)
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES)

  const [objects, setObjects] = useState<Record<ObjKey, boolean>>({
    changeTask:    true,
    changeRequest: true,
    incident:      true,
    problem:       true,
  })
  const [metric, setMetric] = useState<'count' | 'cycle' | 'object'>('count')
  const [filterText, setFilterText] = useState('')
  const [stickyBarVisible, setStickyBarVisible] = useState(false)
  const [activePanel, setActivePanel] = useState<'controls' | 'filter' | 'settings' | null>('controls')
  const togglePanel = (panel: 'controls' | 'filter' | 'settings') =>
    setActivePanel(p => p === panel ? null : panel)
  const [selectedObj, setSelectedObj] = useState<ObjKey | null>(null)
  const [eventSliders, setEventSliders] = useState<Record<ObjKey, number>>({ changeTask: 2, changeRequest: 4, incident: 4, problem: 3 })
  const [pathSliders,  setPathSliders]  = useState<Record<ObjKey, number>>({ changeTask: 0, changeRequest: 5, incident: 0, problem: 0 })
  const [sliderHighlight, setSliderHighlight] = useState<SliderHighlight | null>(null)

  const toggleObj = (key: ObjKey) =>
    setObjects(prev => ({ ...prev, [key]: !prev[key] }))

  const handleEventSlider = (key: ObjKey, newVal: number) => {
    const prevVal = eventSliders[key]
    setEventSliders(prev => ({ ...prev, [key]: newVal }))
    if (newVal > prevVal) {
      const seq = EVENT_SEQUENCE[key]
      const newNodeIds = new Set(seq.slice(prevVal, newVal))
      const newEdgeIds = new Set([
        ...INITIAL_EDGES.filter(e => newNodeIds.has(e.target)).map(e => e.id),
        `tail-${key}`,
      ])
      setSliderHighlight({ nodeIds: newNodeIds, edgeIds: newEdgeIds })
    } else {
      setSliderHighlight(null)
    }
  }

  const handlePathSlider = (key: ObjKey, newVal: number) => {
    const prevVal = pathSliders[key]
    setPathSliders(prev => ({ ...prev, [key]: newVal }))
    if (newVal > prevVal) {
      const newPaths = PATH_POOL[key].slice(prevVal, newVal)
      const newEdgeIds = new Set(newPaths.map(p => p.id))
      const newNodeIds = new Set(newPaths.flatMap(p => [p.source, p.target]))
      setSliderHighlight({ nodeIds: newNodeIds, edgeIds: newEdgeIds })
    } else {
      setSliderHighlight(null)
    }
  }

  const colorToObj: Record<string, ObjKey> = {
    [C.inc]: 'incident', [C.prob]: 'problem',
    [C.cr]: 'changeRequest', [C.ct]: 'changeTask',
  }

  const displayNodes = useMemo(() => nodes.map(node => {
    const owner = node.data.owner as ObjKey | undefined
    const hiddenByObject = owner ? !objects[owner] : false
    const seq = EVENT_SEQ_MAP[node.id]
    const hiddenBySlider = owner !== undefined && seq !== undefined ? seq > eventSliders[owner] : false
    const hidden = hiddenByObject || hiddenBySlider
    const isSelected = selectedObj !== null && owner === selectedObj

    let opacity: number | undefined
    let highlighted = false

    if (sliderHighlight !== null) {
      if (sliderHighlight.nodeIds.has(node.id)) {
        highlighted = true
        opacity = 1
      } else {
        opacity = 0.3
      }
    } else if (selectedObj !== null && owner) {
      opacity = owner === selectedObj ? 1 : 0.3
    }

    return {
      ...node,
      hidden: hidden !== !!node.hidden ? hidden : node.hidden,
      data: { ...node.data, isSelected, metric, highlighted },
      style: opacity !== undefined ? { opacity } : {},
    }
  }), [nodes, objects, selectedObj, metric, eventSliders, sliderHighlight])

  const displayEdges = useMemo(() => {
    const hiddenIds = new Set(displayNodes.filter(n => n.hidden).map(n => n.id))

    // Dynamic tail: connects the last visible event in each active column to its terminal
    const dynamicTailEdges: Edge[] = Object.entries(EVENT_SEQUENCE)
      .filter(([key]) => objects[key as ObjKey])
      .flatMap(([key, ids]) => {
        const lastVisible = [...ids].reverse().find(id => !hiddenIds.has(id))
        if (!lastVisible) return []
        const color = OWNER_COLOR[key]
        let opacity: number | undefined
        let highlighted = false
        if (sliderHighlight !== null) {
          if (sliderHighlight.edgeIds.has(`tail-${key}`)) { highlighted = true; opacity = 1 }
          else { opacity = 0.3 }
        } else if (selectedObj !== null) {
          opacity = key === selectedObj ? 1 : 0.3
        }
        return [{
          id: `tail-${key}`,
          source: lastVisible,
          target: TERMINAL_IDS[key],
          type: 'count' as const,
          data: { color, dotted: true, metric, highlighted },
          style: opacity !== undefined ? { opacity } : {},
        }]
      })

    // Dynamic cross-object paths: revealed by each object's path slider
    const dynamicPathEdges: Edge[] = Object.entries(PATH_POOL)
      .flatMap(([owner, paths]) => {
        const sliderVal = pathSliders[owner as ObjKey] ?? 0
        return paths
          .slice(0, sliderVal)
          .filter(p => !hiddenIds.has(p.source) && !hiddenIds.has(p.target))
          .map(p => {
            let opacity: number | undefined
            let highlighted = false
            if (sliderHighlight !== null) {
              if (sliderHighlight.edgeIds.has(p.id)) { highlighted = true; opacity = 1 }
              else { opacity = 0.3 }
            } else if (selectedObj !== null) {
              opacity = owner === selectedObj ? 1 : 0.3
            }
            return {
              id: p.id,
              source: p.source,
              sourceHandle: p.sourceHandle,
              target: p.target,
              targetHandle: p.targetHandle,
              type: 'count' as const,
              data: { color: p.color, count: p.count, cycleTime: p.cycleTime, objectCount: p.objectCount, metric, highlighted },
              style: opacity !== undefined ? { opacity } : {},
            }
          })
      })

    return [
      ...edges.map(edge => {
        const hidden = hiddenIds.has(edge.source) || hiddenIds.has(edge.target)
        const edgeOwner = colorToObj[edge.data?.color as string]
        let opacity: number | undefined
        let highlighted = false
        if (sliderHighlight !== null) {
          if (sliderHighlight.edgeIds.has(edge.id)) { highlighted = true; opacity = 1 }
          else { opacity = 0.3 }
        } else if (selectedObj !== null && edgeOwner) {
          opacity = edgeOwner === selectedObj ? 1 : 0.3
        }
        return {
          ...edge,
          hidden: hidden !== !!edge.hidden ? hidden : edge.hidden,
          data: { ...edge.data, metric, highlighted },
          style: opacity !== undefined ? { opacity } : {},
        }
      }),
      ...dynamicTailEdges,
      ...dynamicPathEdges,
    ]
  }, [edges, displayNodes, selectedObj, metric, objects, pathSliders, sliderHighlight])

  const activeCount = Object.values(objects).filter(Boolean).length

  const tabs = [
    { id: 'objects',    label: 'Objects' },
    { id: 'casescopes', label: 'Case Scopes' },
    { id: 'discovery',  label: 'Process Networks Discovery' },
  ] as const

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.breadcrumbRow}>
          <div className={s.breadcrumb}>
            <span>Process Semantic Views</span>
            <span className={s.breadcrumbSep}>/</span>
            <span className={s.breadcrumbCurrent}>Vinc</span>
          </div>
          <div className={s.headerActions}>
            <Button design="Default">Load Data</Button>
            <Button design="Transparent" icon="sys-help" tooltip="Help" />
            <Button design="Transparent" icon="overflow" tooltip="More options" />
          </div>
        </div>
        <div className={s.titleRow}>
          <Text style={{ fontSize: 'var(--sapFontHeader2Size)', fontWeight: 700, color: 'var(--sapTextColor)' }}>Vinc</Text>
        </div>
        <div className={s.tabBar}>
          {tabs.map(t => (
            <button key={t.id}
              className={`${s.tab} ${activeTab === t.id ? s.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.content}>
        {activeTab !== 'discovery' && (
          <div className={s.tabPlaceholder}>
            <Text>{tabs.find(t => t.id === activeTab)?.label} — content coming soon</Text>
          </div>
        )}

        {activeTab === 'discovery' && (
          <>
            {/* Action panel — icon buttons that toggle panels */}
            <div className={s.actionPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
              <Button
                design="Transparent"
                icon="customize"
                tooltip="Map Controls"
                style={{ width: 32, height: 32, padding: 0, background: activePanel === 'controls' ? 'var(--sapButton_Selected_Background, #e8f0fe)' : undefined, color: activePanel === 'controls' ? 'var(--sapButton_Selected_TextColor)' : undefined }}
                onClick={() => togglePanel('controls')}
              />
              <Button
                design="Transparent"
                icon="filter"
                tooltip="Filter"
                style={{ width: 32, height: 32, padding: 0, background: activePanel === 'filter' ? 'var(--sapButton_Selected_Background, #e8f0fe)' : undefined, color: activePanel === 'filter' ? 'var(--sapButton_Selected_TextColor)' : undefined }}
                onClick={() => togglePanel('filter')}
              />
              <Button
                design="Transparent"
                icon="action-settings"
                tooltip="Settings"
                style={{ width: 32, height: 32, padding: 0, background: activePanel === 'settings' ? 'var(--sapButton_Selected_Background, #e8f0fe)' : undefined, color: activePanel === 'settings' ? 'var(--sapButton_Selected_TextColor)' : undefined }}
                onClick={() => togglePanel('settings')}
              />
            </div>

            {/* Map controls panel */}
            {activePanel === 'controls' && (
              <div className={s.mapPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
                <div className={s.mapPanelHeader}>Map Controls</div>
                <div className={s.mapPanelSearch}>
                  <Input
                    placeholder="Search objects and events…"
                    value={filterText}
                    showClearIcon
                    onInput={(e: any) => setFilterText((e.target as any).value ?? '')}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className={s.mapPanelBody}>
                  <Section title="Objects" badge={`${activeCount}/4`}>
                    <p className={s.sectionDesc}>
                      Sorted by number of creation events. Toggle objects on or off to customize your view.
                    </p>
                    {([
                      { key: 'changeTask',    label: 'Change Task',    color: C.ct   },
                      { key: 'changeRequest', label: 'Change Request', color: C.cr   },
                      { key: 'incident',      label: 'Incident',       color: C.inc  },
                      { key: 'problem',       label: 'Problem',        color: C.prob },
                    ] as { key: ObjKey; label: string; color: string }[])
                      .filter(obj => obj.label.toLowerCase().includes(filterText.toLowerCase()))
                      .map(obj => (
                      <div key={obj.key} className={s.objectRow}>
                        <span className={s.objectLabel}>
                          <span className={s.objectDot} style={{ background: obj.color }} />
                          {obj.label}
                        </span>
                        <Switch checked={objects[obj.key]} onChange={() => toggleObj(obj.key)} accessibleName={obj.label} />
                      </div>
                    ))}
                  </Section>
                  <Section title="Events" badge={`${Math.round(Object.values(eventSliders).reduce((a, b) => a + b, 0) / (4 * 10) * 100)}%`}>
                    <p className={s.sectionDesc}>Add or remove events and paths. Most frequent items appear first.</p>
                    {([
                      { key: 'changeTask'    as ObjKey, label: 'Change Task',    color: C.ct   },
                      { key: 'changeRequest' as ObjKey, label: 'Change Request', color: C.cr   },
                      { key: 'incident'      as ObjKey, label: 'Incident',       color: C.inc  },
                      { key: 'problem'       as ObjKey, label: 'Problem',        color: C.prob },
                    ]).filter(obj => objects[obj.key]).map(obj => (
                      <div key={obj.key} className={s.eventSliderBlock}>
                        <div className={s.eventSliderRow}>
                          <span className={s.eventSliderLabel}>Events for <strong>{obj.label}</strong></span>
                          <span className={s.eventBadge} style={{ background: obj.color }}>{eventSliders[obj.key]}</span>
                        </div>
                        <input type="range" className={s.eventSlider} min={0} max={10} value={eventSliders[obj.key]}
                          onChange={e => handleEventSlider(obj.key, Number(e.target.value))} />
                        <div className={s.pathsBlock}>
                          <span className={s.pathsLabel}>Paths</span>
                          <input type="range" className={s.eventSlider} min={0} max={10} value={pathSliders[obj.key]}
                            onChange={e => handlePathSlider(obj.key, Number(e.target.value))} />
                        </div>
                      </div>
                    ))}
                  </Section>
                  <Section title="Metrics">
                    <p className={s.sectionDesc}>View how often events occur or how long they take.</p>
                    <div className={s.radioRow}>
                      <RadioButton name="metric" text="Event Occurrences" checked={metric === 'count'} onChange={() => setMetric('count')} />
                    </div>
                    <div className={s.radioRow}>
                      <RadioButton name="metric" text="Object Occurrences" checked={metric === 'object'} onChange={() => setMetric('object')} />
                    </div>
                    <div className={s.radioRow}>
                      <RadioButton name="metric" text="Cycle Time (Average)" checked={metric === 'cycle'} onChange={() => setMetric('cycle')} />
                    </div>
                  </Section>
                </div>
                <div className={s.learnMore}><Link href="#">Learn More</Link></div>
              </div>
            )}

            {/* Filter panel */}
            {activePanel === 'filter' && (
              <div className={s.mapPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
                <div className={s.mapPanelHeader}>Filter</div>
                <div className={s.filterEmpty}>
                  <div className={s.filterEmptyIllustration}>
                    <Icon name="filter" style={{ fontSize: 40, color: '#fff' }} />
                  </div>
                  <div className={s.filterEmptyTitle}>No Filters Applied Yet</div>
                  <Button design="Emphasized" onClick={() => {}}>Create New Filter</Button>
                </div>
              </div>
            )}

            {/* Settings panel */}
            {activePanel === 'settings' && (
              <div className={s.mapPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
                <div className={s.mapPanelHeader}>Settings</div>
                <div className={s.mapPanelBody}>
                  <Section title="Usage & Billing">
                    <p className={s.sectionDesc} style={{ marginBottom: '0.5rem' }}>
                      Records used: <strong>2.469</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Button design="Default" onClick={() => {}}>Opt Out</Button>
                      <Link href="#">Manage All</Link>
                    </div>
                  </Section>
                  <Section title="Data Information">
                    <span className={s.settingsTag}>Last Update: <strong>8:17 March 31, 2026</strong></span>
                  </Section>
                </div>
                <div className={s.learnMore}><Link href="#">Learn More</Link></div>
              </div>
            )}

            <div className={s.canvasArea} style={{ fontFamily: 'var(--sapFontFamily)' }}>
              <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                onNodeClick={(_, node) => {
                  setSliderHighlight(null)
                  if (node.type === 'category') {
                    const owner = (node.data as unknown as { owner: ObjKey }).owner
                    setSelectedObj(prev => prev === owner ? null : owner)
                  }
                }}
                onEdgeClick={(_, edge) => {
                  setSliderHighlight(null)
                  const owner = colorToObj[(edge.data as unknown as { color: string } | undefined)?.color ?? '']
                  if (owner) setSelectedObj(prev => prev === owner ? null : owner)
                }}
                onPaneClick={() => { setSelectedObj(null); setSliderHighlight(null) }}
              >
                <Background color="#ccc" gap={20} size={1} style={{ background: '#f4f4f4' }} />
                <ZoomControls />
                <FitViewOnChange trigger={objects} />
                <StickyBarVisibility onChange={setStickyBarVisible} />
                <StickyObjectBar
                  objects={objects}
                  selectedObj={selectedObj}
                  onSelect={(key) => setSelectedObj(prev => prev === key ? null : key)}
                />
              </ReactFlow>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
