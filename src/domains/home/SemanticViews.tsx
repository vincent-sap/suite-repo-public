import React, { useState, useMemo, useEffect, useRef } from 'react'
import '@xyflow/react/dist/style.css'
import {
  ReactFlow, Background, useNodesState, useEdgesState, useReactFlow, useStore,
  Handle, Position, EdgeLabelRenderer, BaseEdge, getSmoothStepPath,
  type Node, type Edge, type NodeProps, type EdgeProps,
} from '@xyflow/react'
import { Button, Icon, Input, Switch, RadioButton, Text, Link } from '@ui5/webcomponents-react'
import s from './SemanticViews.module.css'

// ── Colors per object type — SAP chart palette, repeated after 11 ────────────
// sapChart_1…11: #5899DA #E8743B #19A979 #ED4A7B #945ECF #13A4B4 #525DF4 #BF399E #6C8893 #EE6868 #2F6497
const C = {
  inc:   'var(--sapChart_OrderedColor_1)',   // Incident
  prob:  'var(--sapChart_OrderedColor_2)',   // Problem
  cr:    'var(--sapChart_OrderedColor_3)',   // Change Request
  ct:    'var(--sapChart_OrderedColor_4)',   // Change Task
  cust:  'var(--sapChart_OrderedColor_5)',   // Customer
  quot:  'var(--sapChart_OrderedColor_6)',   // Quotation
  contr: 'var(--sapChart_OrderedColor_7)',   // Contract
  so:    'var(--sapChart_OrderedColor_8)',   // Sales Order
  soi:   'var(--sapChart_OrderedColor_9)',   // Sales Order Item
  pc:    'var(--sapChart_OrderedColor_10)',  // Pricing Condition
  po:    'var(--sapChart_OrderedColor_11)',  // Purchase Order
  mat:   'var(--sapChart_OrderedColor_1)',   // Material             (repeat)
  wt:    'var(--sapChart_OrderedColor_2)',   // Warehouse Task       (repeat)
  dlv:   'var(--sapChart_OrderedColor_3)',   // Delivery             (repeat)
  gi:    'var(--sapChart_OrderedColor_4)',   // Goods Issue          (repeat)
  bill:  'var(--sapChart_OrderedColor_5)',   // Billing Document     (repeat)
  inv:   'var(--sapChart_OrderedColor_6)',   // Invoice              (repeat)
  svo:   'var(--sapChart_OrderedColor_7)',   // Service Order        (repeat)
  cm:    'var(--sapChart_OrderedColor_8)',   // Credit Memo          (repeat)
  ret:   'var(--sapChart_OrderedColor_9)',   // Return Order         (repeat)
  ar:    'var(--sapChart_OrderedColor_10)',  // Accounts Receivable  (repeat)
  pay:   'var(--sapChart_OrderedColor_11)',  // Payment              (repeat)
  dun:   'var(--sapChart_OrderedColor_1)',   // Dunning Notice       (repeat)
  bank:  'var(--sapChart_OrderedColor_2)',   // Bank Statement       (repeat)
} as const

const OWNER_COLOR: Record<string, string> = {
  incident: C.inc, problem: C.prob, changeRequest: C.cr, changeTask: C.ct,
  customer: C.cust, quotation: C.quot, contract: C.contr, salesOrder: C.so,
  salesOrderItem: C.soi, pricingCondition: C.pc, purchaseOrder: C.po,
  material: C.mat, warehouseTask: C.wt, delivery: C.dlv, goodsIssue: C.gi,
  billingDoc: C.bill, invoice: C.inv, serviceOrder: C.svo, creditMemo: C.cm,
  returnOrder: C.ret, accountsReceivable: C.ar, payment: C.pay,
  dunningNotice: C.dun, bankStatement: C.bank,
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

function EventNode({ data, positionAbsoluteX, positionAbsoluteY }: NodeProps) {
  const dots = data.dots as Dot[] | undefined
  const [panX, panY, zoom] = useStore((st: any) => st.transform)
  const compact = zoom < 0.4
  const color = OWNER_COLOR[data.owner as string] ?? '#888'
  const metric = data.metric as string | undefined
  const highlighted = data.highlighted as boolean | undefined
  const isActive = data.isActiveEvent as boolean | undefined
  const CIR = 10

  const dotValue = (d: Dot) =>
    metric === 'cycle' ? (d.cycleTime ?? '') :
    metric === 'object' ? (d.objectCount ?? d.count) :
    d.count

  // Screen-space anchor for the zoom-invariant popover.
  // Card starts at canvas x=(CIR+5) from the node origin with minWidth≈155px;
  // add 8px fixed screen gap after the card's right edge.
  const popX = positionAbsoluteX * zoom + panX + (CIR + 5 + 155) * zoom + 8
  const popY = positionAbsoluteY * zoom + panY + (CIR / 2) * zoom

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
        border: `1.5px solid ${color}`,
        background: isActive ? color : 'white',
        transition: 'background 0.1s',
      }} />

      {/* Card — floats to the right of the circle, scales with zoom */}
      <div style={{ position: 'absolute', left: CIR + 5, top: '50%', transform: 'translateY(-50%)' }}>
        <div style={{
          background: 'white',
          border: isActive ? `1.5px solid ${color}` : '1px solid #d9d9d9',
          borderRadius: 8, padding: '8px 12px',
          minWidth: 130, whiteSpace: 'nowrap',
          boxShadow: highlighted ? '0 0 0 2px white, 0 4px 20px rgba(0,0,0,0.35)' : undefined,
          transition: 'box-shadow 0.15s, border-color 0.1s',
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

      {/* Popover rendered via EdgeLabelRenderer — outside the viewport transform,
          so it stays at constant screen size regardless of zoom level */}
      {isActive && dots && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(${popX}px,${popY}px) translateY(-50%)`,
              pointerEvents: 'none',
              background: 'white',
              border: `1.5px solid ${color}`,
              borderRadius: 10,
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              minWidth: 200,
              whiteSpace: 'nowrap',
              zIndex: 1000,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sapTextColor)', marginBottom: 12 }}>
              {data.label as string}
            </div>
            {dots.map((d, i) => (
              <div key={i} style={{ marginBottom: i < dots.length - 1 ? 14 : 0 }}>
                {dots.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>Object {i + 1}</span>
                  </div>
                )}
                <div style={{ paddingLeft: dots.length > 1 ? 13 : 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--sapContent_LabelColor)', marginBottom: 2 }}>
                    {metric === 'cycle' ? 'Cycle Time (Avg):' : metric === 'object' ? 'Object Occurrences:' : 'Total Event Occurrences:'}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--sapTextColor)' }}>
                    {dotValue(d)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EdgeLabelRenderer>
      )}
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
  incident:          ['incident-created', 'incident-closed', 'incident-under-investigation', 'incident-resolved', 'incident-reopened'],
  problem:           ['problem-created', 'problem-closed', 'problem-root-cause', 'problem-resolved'],
  changeRequest:     ['cr-created', 'cr-field-changed', 'cr-closed', 'cr-assessment', 'cr-impl-started'],
  changeTask:        ['ct-created', 'ct-finished', 'ct-assigned', 'ct-status-changed', 'ct-approved'],
  customer:          ['cust-onboarded', 'cust-credit-checked', 'cust-blocked', 'cust-unblocked'],
  quotation:         ['quot-created', 'quot-sent', 'quot-won', 'quot-lost'],
  contract:          ['contr-created', 'contr-activated', 'contr-expired', 'contr-renewed'],
  salesOrder:        ['so-created', 'so-confirmed', 'so-delivered', 'so-invoiced', 'so-completed'],
  salesOrderItem:    ['soi-created', 'soi-confirmed', 'soi-delivered'],
  pricingCondition:  ['pc-created', 'pc-activated', 'pc-updated', 'pc-expired'],
  purchaseOrder:     ['po-created', 'po-approved', 'po-received', 'po-invoiced'],
  material:          ['mat-reserved', 'mat-picked', 'mat-issued', 'mat-returned'],
  warehouseTask:     ['wt-created', 'wt-assigned', 'wt-confirmed', 'wt-cancelled'],
  delivery:          ['dlv-created', 'dlv-picked', 'dlv-shipped', 'dlv-delivered'],
  goodsIssue:        ['gi-posted', 'gi-partial', 'gi-reversed'],
  billingDoc:        ['bill-created', 'bill-released', 'bill-cancelled'],
  invoice:           ['inv-created', 'inv-sent', 'inv-paid', 'inv-overdue'],
  serviceOrder:      ['svo-created', 'svo-assigned', 'svo-completed', 'svo-billed'],
  creditMemo:        ['cm-created', 'cm-approved', 'cm-posted'],
  returnOrder:       ['ret-created', 'ret-received', 'ret-inspected', 'ret-credited'],
  accountsReceivable:['ar-open', 'ar-cleared', 'ar-dunned', 'ar-written-off'],
  payment:           ['pay-received', 'pay-cleared', 'pay-partial', 'pay-reversed'],
  dunningNotice:     ['dun-created', 'dun-sent', 'dun-escalated'],
  bankStatement:     ['bank-imported', 'bank-matched', 'bank-unmatched'],
}
// Map: event node id → 1-based position in its owner's sequence
const EVENT_SEQ_MAP: Record<string, number> = {}
Object.values(EVENT_SEQUENCE).forEach(events => {
  events.forEach((id, idx) => { EVENT_SEQ_MAP[id] = idx + 1 })
})
const TERMINAL_IDS: Record<string, string> = {
  incident: 'term-inc', problem: 'term-prob', changeRequest: 'term-cr', changeTask: 'term-ct',
  customer: 'term-cust', quotation: 'term-quot', contract: 'term-contr', salesOrder: 'term-so',
  salesOrderItem: 'term-soi', pricingCondition: 'term-pc', purchaseOrder: 'term-po',
  material: 'term-mat', warehouseTask: 'term-wt', delivery: 'term-dlv', goodsIssue: 'term-gi',
  billingDoc: 'term-bill', invoice: 'term-inv', serviceOrder: 'term-svo', creditMemo: 'term-cm',
  returnOrder: 'term-ret', accountsReceivable: 'term-ar', payment: 'term-pay',
  dunningNotice: 'term-dun', bankStatement: 'term-bank',
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
  customer: [
    { id: 'path-cust-1', source: 'cust-onboarded',      sourceHandle: 'sl', target: 'cust-credit-checked', targetHandle: 'tl', color: C.cust, count: 42, cycleTime: '2h',  objectCount: 39 },
    { id: 'path-cust-2', source: 'cust-blocked',         sourceHandle: 'sl', target: 'cust-onboarded',      targetHandle: 'tl', color: C.cust, count: 8,  cycleTime: '1d',  objectCount: 7  },
  ],
  quotation: [
    { id: 'path-quot-1', source: 'quot-created', sourceHandle: 'sl', target: 'quot-won',  targetHandle: 'tl', color: C.quot, count: 52, cycleTime: '3d', objectCount: 49 },
    { id: 'path-quot-2', source: 'quot-sent',    sourceHandle: 'sl', target: 'quot-lost', targetHandle: 'tl', color: C.quot, count: 19, cycleTime: '2d', objectCount: 17 },
  ],
  contract: [
    { id: 'path-contr-1', source: 'contr-created',  sourceHandle: 'sl', target: 'contr-expired', targetHandle: 'tl', color: C.contr, count: 12, cycleTime: '365d', objectCount: 11 },
    { id: 'path-contr-2', source: 'contr-activated', sourceHandle: 'sl', target: 'contr-renewed', targetHandle: 'tl', color: C.contr, count: 7,  cycleTime: '5d',   objectCount: 6  },
  ],
  salesOrder: [
    { id: 'path-so-1', source: 'so-created',   sourceHandle: 'sl', target: 'so-completed', targetHandle: 'tl', color: C.so, count: 14, cycleTime: '5d', objectCount: 13 },
    { id: 'path-so-2', source: 'so-confirmed', sourceHandle: 'sl', target: 'so-created',   targetHandle: 'tl', color: C.so, count: 9,  cycleTime: '1h', objectCount: 8  },
  ],
  salesOrderItem: [
    { id: 'path-soi-1', source: 'soi-created',   sourceHandle: 'sl', target: 'soi-delivered', targetHandle: 'tl', color: C.soi, count: 28, cycleTime: '3d', objectCount: 25 },
    { id: 'path-soi-2', source: 'soi-confirmed',  sourceHandle: 'sl', target: 'soi-created',   targetHandle: 'tl', color: C.soi, count: 11, cycleTime: '1h', objectCount: 10 },
  ],
  pricingCondition: [
    { id: 'path-pc-1', source: 'pc-created',   sourceHandle: 'sl', target: 'pc-expired',  targetHandle: 'tl', color: C.pc, count: 31, cycleTime: '365d', objectCount: 28 },
    { id: 'path-pc-2', source: 'pc-activated', sourceHandle: 'sl', target: 'pc-updated',  targetHandle: 'tl', color: C.pc, count: 67, cycleTime: '1d',   objectCount: 62 },
  ],
  purchaseOrder: [
    { id: 'path-po-1', source: 'po-created',  sourceHandle: 'sl', target: 'po-received', targetHandle: 'tl', color: C.po, count: 21, cycleTime: '4d', objectCount: 19 },
    { id: 'path-po-2', source: 'po-approved', sourceHandle: 'sl', target: 'po-created',  targetHandle: 'tl', color: C.po, count: 8,  cycleTime: '1h', objectCount: 7  },
  ],
  material: [
    { id: 'path-mat-1', source: 'mat-reserved', sourceHandle: 'sl', target: 'mat-issued',   targetHandle: 'tl', color: C.mat, count: 41, cycleTime: '4h', objectCount: 37 },
    { id: 'path-mat-2', source: 'mat-issued',   sourceHandle: 'sl', target: 'mat-returned', targetHandle: 'tl', color: C.mat, count: 23, cycleTime: '2d', objectCount: 19 },
  ],
  warehouseTask: [
    { id: 'path-wt-1', source: 'wt-created',  sourceHandle: 'sl', target: 'wt-confirmed', targetHandle: 'tl', color: C.wt, count: 34, cycleTime: '3h',  objectCount: 31 },
    { id: 'path-wt-2', source: 'wt-assigned', sourceHandle: 'sl', target: 'wt-cancelled', targetHandle: 'tl', color: C.wt, count: 14, cycleTime: '2d',  objectCount: 12 },
  ],
  delivery: [
    { id: 'path-dlv-1', source: 'dlv-created', sourceHandle: 'sl', target: 'dlv-shipped',    targetHandle: 'tl', color: C.dlv, count: 28, cycleTime: '1d', objectCount: 26 },
    { id: 'path-dlv-2', source: 'dlv-picked',  sourceHandle: 'sl', target: 'dlv-delivered',  targetHandle: 'tl', color: C.dlv, count: 17, cycleTime: '2d', objectCount: 15 },
  ],
  goodsIssue: [
    { id: 'path-gi-1', source: 'gi-posted',  sourceHandle: 'sl', target: 'gi-partial',  targetHandle: 'tl', color: C.gi, count: 21, cycleTime: '4h', objectCount: 18 },
    { id: 'path-gi-2', source: 'gi-partial', sourceHandle: 'sl', target: 'gi-reversed', targetHandle: 'tl', color: C.gi, count: 11, cycleTime: '1d', objectCount: 9  },
  ],
  billingDoc: [
    { id: 'path-bill-1', source: 'bill-created',  sourceHandle: 'sl', target: 'bill-cancelled', targetHandle: 'tl', color: C.bill, count: 9,  cycleTime: '1d', objectCount: 8  },
    { id: 'path-bill-2', source: 'bill-released', sourceHandle: 'sl', target: 'bill-created',   targetHandle: 'tl', color: C.bill, count: 14, cycleTime: '2h', objectCount: 12 },
  ],
  invoice: [
    { id: 'path-inv-1', source: 'inv-created', sourceHandle: 'sl', target: 'inv-paid',    targetHandle: 'tl', color: C.inv, count: 42, cycleTime: '28d', objectCount: 38 },
    { id: 'path-inv-2', source: 'inv-sent',    sourceHandle: 'sl', target: 'inv-overdue', targetHandle: 'tl', color: C.inv, count: 28, cycleTime: '35d', objectCount: 22 },
  ],
  serviceOrder: [
    { id: 'path-svo-1', source: 'svo-created',   sourceHandle: 'sl', target: 'svo-completed', targetHandle: 'tl', color: C.svo, count: 18, cycleTime: '2d', objectCount: 16 },
    { id: 'path-svo-2', source: 'svo-assigned',  sourceHandle: 'sl', target: 'svo-billed',    targetHandle: 'tl', color: C.svo, count: 12, cycleTime: '3d', objectCount: 11 },
  ],
  creditMemo: [
    { id: 'path-cm-1', source: 'cm-created',  sourceHandle: 'sl', target: 'cm-posted',   targetHandle: 'tl', color: C.cm, count: 14, cycleTime: '1d', objectCount: 12 },
    { id: 'path-cm-2', source: 'cm-approved', sourceHandle: 'sl', target: 'cm-created',  targetHandle: 'tl', color: C.cm, count: 7,  cycleTime: '3h', objectCount: 6  },
  ],
  returnOrder: [
    { id: 'path-ret-1', source: 'ret-created',   sourceHandle: 'sl', target: 'ret-credited',  targetHandle: 'tl', color: C.ret, count: 11, cycleTime: '6d', objectCount: 10 },
    { id: 'path-ret-2', source: 'ret-inspected', sourceHandle: 'sl', target: 'ret-created',   targetHandle: 'tl', color: C.ret, count: 6,  cycleTime: '1d', objectCount: 5  },
  ],
  accountsReceivable: [
    { id: 'path-ar-1', source: 'ar-open',    sourceHandle: 'sl', target: 'ar-cleared',    targetHandle: 'tl', color: C.ar, count: 131, cycleTime: '28d', objectCount: 96 },
    { id: 'path-ar-2', source: 'ar-dunned',  sourceHandle: 'sl', target: 'ar-written-off', targetHandle: 'tl', color: C.ar, count: 7,   cycleTime: '90d', objectCount: 5  },
  ],
  payment: [
    { id: 'path-pay-1', source: 'pay-received', sourceHandle: 'sl', target: 'pay-cleared',  targetHandle: 'tl', color: C.pay, count: 38, cycleTime: '2d', objectCount: 35 },
    { id: 'path-pay-2', source: 'pay-partial',  sourceHandle: 'sl', target: 'pay-reversed', targetHandle: 'tl', color: C.pay, count: 8,  cycleTime: '3d', objectCount: 6  },
  ],
  dunningNotice: [
    { id: 'path-dun-1', source: 'dun-created', sourceHandle: 'sl', target: 'dun-escalated', targetHandle: 'tl', color: C.dun, count: 11, cycleTime: '7d', objectCount: 9  },
    { id: 'path-dun-2', source: 'dun-sent',    sourceHandle: 'sl', target: 'dun-created',   targetHandle: 'tl', color: C.dun, count: 5,  cycleTime: '1h', objectCount: 4  },
  ],
  bankStatement: [
    { id: 'path-bank-1', source: 'bank-imported', sourceHandle: 'sl', target: 'bank-matched',   targetHandle: 'tl', color: C.bank, count: 128, cycleTime: '1d', objectCount: 94 },
    { id: 'path-bank-2', source: 'bank-imported', sourceHandle: 'sl', target: 'bank-unmatched', targetHandle: 'tl', color: C.bank, count: 14,  cycleTime: '2d', objectCount: 11 },
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

  // ── O2C: Customer (base x=1100) ──────────────────────────────────────────
  { id: 'cat-cust', type: 'category', position: { x: 1100, y: 50 }, data: { label: 'Customer', color: C.cust, owner: 'customer', count: 48, objectCount: 45, cycleTime: '5d' }, draggable: false },
  { id: 'cust-onboarded',      type: 'event', position: { x: 1080, y: 220 }, data: { label: 'Customer Onboarded',   owner: 'customer', dots: [{ color: C.cust, count: 48, objectCount: 45, cycleTime: '0h'  }] } },
  { id: 'cust-credit-checked', type: 'event', position: { x: 1080, y: 500 }, data: { label: 'Credit Check Passed',  owner: 'customer', dots: [{ color: C.cust, count: 42, objectCount: 39, cycleTime: '2h'  }] } },
  { id: 'cust-blocked',        type: 'event', position: { x: 1080, y: 620 }, data: { label: 'Customer Blocked',     owner: 'customer', dots: [{ color: C.cust, count: 8,  objectCount: 7,  cycleTime: '1d'  }] } },
  { id: 'cust-unblocked',      type: 'event', position: { x: 1080, y: 740 }, data: { label: 'Customer Unblocked',   owner: 'customer', dots: [{ color: C.cust, count: 5,  objectCount: 4,  cycleTime: '2d'  }] } },
  { id: 'term-cust', type: 'terminal', position: { x: 1145, y: 1060 }, data: { color: C.cust, owner: 'customer'  }, draggable: false },

  // ── O2C: Quotation (base x=1330) ─────────────────────────────────────────
  { id: 'cat-quot', type: 'category', position: { x: 1330, y: 50 }, data: { label: 'Quotation', color: C.quot, owner: 'quotation', count: 85, objectCount: 80, cycleTime: '4d' }, draggable: false },
  { id: 'quot-created', type: 'event', position: { x: 1310, y: 220 }, data: { label: 'Quotation Created', owner: 'quotation', dots: [{ color: C.quot, count: 85, objectCount: 80, cycleTime: '0h'  }] } },
  { id: 'quot-sent',    type: 'event', position: { x: 1310, y: 500 }, data: { label: 'Quotation Sent',    owner: 'quotation', dots: [{ color: C.quot, count: 71, objectCount: 66, cycleTime: '1d'  }] } },
  { id: 'quot-won',     type: 'event', position: { x: 1310, y: 620 }, data: { label: 'Quotation Won',     owner: 'quotation', dots: [{ color: C.quot, count: 52, objectCount: 49, cycleTime: '3d'  }] } },
  { id: 'quot-lost',    type: 'event', position: { x: 1310, y: 740 }, data: { label: 'Quotation Lost',    owner: 'quotation', dots: [{ color: C.quot, count: 19, objectCount: 17, cycleTime: '2d'  }] } },
  { id: 'term-quot', type: 'terminal', position: { x: 1375, y: 1060 }, data: { color: C.quot, owner: 'quotation' }, draggable: false },

  // ── O2C: Contract (base x=1560) ──────────────────────────────────────────
  { id: 'cat-contr', type: 'category', position: { x: 1560, y: 50 }, data: { label: 'Contract', color: C.contr, owner: 'contract', count: 34, objectCount: 32, cycleTime: '365d' }, draggable: false },
  { id: 'contr-created',   type: 'event', position: { x: 1540, y: 220 }, data: { label: 'Contract Created',   owner: 'contract', dots: [{ color: C.contr, count: 34, objectCount: 32, cycleTime: '0h'   }] } },
  { id: 'contr-activated', type: 'event', position: { x: 1540, y: 500 }, data: { label: 'Contract Activated', owner: 'contract', dots: [{ color: C.contr, count: 28, objectCount: 26, cycleTime: '2d'   }] } },
  { id: 'contr-expired',   type: 'event', position: { x: 1540, y: 620 }, data: { label: 'Contract Expired',   owner: 'contract', dots: [{ color: C.contr, count: 12, objectCount: 11, cycleTime: '365d' }] } },
  { id: 'contr-renewed',   type: 'event', position: { x: 1540, y: 740 }, data: { label: 'Contract Renewed',   owner: 'contract', dots: [{ color: C.contr, count: 7,  objectCount: 6,  cycleTime: '5d'   }] } },
  { id: 'term-contr', type: 'terminal', position: { x: 1605, y: 1060 }, data: { color: C.contr, owner: 'contract'  }, draggable: false },

  // ── O2C: Sales Order (base x=1790) ───────────────────────────────────────
  { id: 'cat-so', type: 'category', position: { x: 1790, y: 50 }, data: { label: 'Sales Order', color: C.so, owner: 'salesOrder', count: 156, objectCount: 148, cycleTime: '7d' }, draggable: false },
  { id: 'so-created',   type: 'event', position: { x: 1770, y: 220 }, data: { label: 'Sales Order Created',   owner: 'salesOrder', dots: [{ color: C.so, count: 156, objectCount: 148, cycleTime: '0h' }] } },
  { id: 'so-confirmed', type: 'event', position: { x: 1770, y: 500 }, data: { label: 'Sales Order Confirmed', owner: 'salesOrder', dots: [{ color: C.so, count: 141, objectCount: 134, cycleTime: '4h' }] } },
  { id: 'so-delivered', type: 'event', position: { x: 1770, y: 620 }, data: { label: 'Sales Order Delivered', owner: 'salesOrder', dots: [{ color: C.so, count: 128, objectCount: 121, cycleTime: '2d' }] } },
  { id: 'so-invoiced',  type: 'event', position: { x: 1770, y: 740 }, data: { label: 'Sales Order Invoiced',  owner: 'salesOrder', dots: [{ color: C.so, count: 112, objectCount: 106, cycleTime: '3d' }] } },
  { id: 'so-completed', type: 'event', position: { x: 1770, y: 860 }, data: { label: 'Sales Order Completed', owner: 'salesOrder', dots: [{ color: C.so, count: 98,  objectCount: 93,  cycleTime: '5d' }] } },
  { id: 'term-so', type: 'terminal', position: { x: 1835, y: 1060 }, data: { color: C.so, owner: 'salesOrder' }, draggable: false },

  // ── O2C: Sales Order Item (base x=2020) ──────────────────────────────────
  { id: 'cat-soi', type: 'category', position: { x: 2020, y: 50 }, data: { label: 'Sales Order Item', color: C.soi, owner: 'salesOrderItem', count: 312, objectCount: 148, cycleTime: '3d' }, draggable: false },
  { id: 'soi-created',   type: 'event', position: { x: 2000, y: 220 }, data: { label: 'Item Created',   owner: 'salesOrderItem', dots: [{ color: C.soi, count: 312, objectCount: 148, cycleTime: '0h' }] } },
  { id: 'soi-confirmed', type: 'event', position: { x: 2000, y: 500 }, data: { label: 'Item Confirmed', owner: 'salesOrderItem', dots: [{ color: C.soi, count: 287, objectCount: 134, cycleTime: '1h' }] } },
  { id: 'soi-delivered', type: 'event', position: { x: 2000, y: 620 }, data: { label: 'Item Delivered', owner: 'salesOrderItem', dots: [{ color: C.soi, count: 261, objectCount: 121, cycleTime: '3d' }] } },
  { id: 'term-soi', type: 'terminal', position: { x: 2065, y: 1060 }, data: { color: C.soi, owner: 'salesOrderItem' }, draggable: false },

  // ── O2C: Pricing Condition (base x=2250) ─────────────────────────────────
  { id: 'cat-pc', type: 'category', position: { x: 2250, y: 50 }, data: { label: 'Pricing Condition', color: C.pc, owner: 'pricingCondition', count: 420, objectCount: 148, cycleTime: '30d' }, draggable: false },
  { id: 'pc-created',   type: 'event', position: { x: 2230, y: 220 }, data: { label: 'Condition Created',   owner: 'pricingCondition', dots: [{ color: C.pc, count: 420, objectCount: 148, cycleTime: '0h'   }] } },
  { id: 'pc-activated', type: 'event', position: { x: 2230, y: 500 }, data: { label: 'Condition Activated', owner: 'pricingCondition', dots: [{ color: C.pc, count: 398, objectCount: 140, cycleTime: '30m'  }] } },
  { id: 'pc-updated',   type: 'event', position: { x: 2230, y: 620 }, data: { label: 'Condition Updated',   owner: 'pricingCondition', dots: [{ color: C.pc, count: 67,  objectCount: 62,  cycleTime: '1d'   }] } },
  { id: 'pc-expired',   type: 'event', position: { x: 2230, y: 740 }, data: { label: 'Condition Expired',   owner: 'pricingCondition', dots: [{ color: C.pc, count: 31,  objectCount: 28,  cycleTime: '365d' }] } },
  { id: 'term-pc', type: 'terminal', position: { x: 2295, y: 1060 }, data: { color: C.pc, owner: 'pricingCondition' }, draggable: false },

  // ── O2C: Purchase Order (base x=2480) ────────────────────────────────────
  { id: 'cat-po', type: 'category', position: { x: 2480, y: 50 }, data: { label: 'Purchase Order', color: C.po, owner: 'purchaseOrder', count: 73, objectCount: 70, cycleTime: '10d' }, draggable: false },
  { id: 'po-created',  type: 'event', position: { x: 2460, y: 220 }, data: { label: 'PO Created',  owner: 'purchaseOrder', dots: [{ color: C.po, count: 73, objectCount: 70, cycleTime: '0h' }] } },
  { id: 'po-approved', type: 'event', position: { x: 2460, y: 500 }, data: { label: 'PO Approved', owner: 'purchaseOrder', dots: [{ color: C.po, count: 61, objectCount: 58, cycleTime: '6h' }] } },
  { id: 'po-received', type: 'event', position: { x: 2460, y: 620 }, data: { label: 'PO Received', owner: 'purchaseOrder', dots: [{ color: C.po, count: 54, objectCount: 51, cycleTime: '4d' }] } },
  { id: 'po-invoiced', type: 'event', position: { x: 2460, y: 740 }, data: { label: 'PO Invoiced', owner: 'purchaseOrder', dots: [{ color: C.po, count: 48, objectCount: 45, cycleTime: '5d' }] } },
  { id: 'term-po', type: 'terminal', position: { x: 2525, y: 1060 }, data: { color: C.po, owner: 'purchaseOrder' }, draggable: false },

  // ── O2C: Material (base x=2710) ──────────────────────────────────────────
  { id: 'cat-mat', type: 'category', position: { x: 2710, y: 50 }, data: { label: 'Material', color: C.mat, owner: 'material', count: 198, objectCount: 89, cycleTime: '1d' }, draggable: false },
  { id: 'mat-reserved', type: 'event', position: { x: 2690, y: 220 }, data: { label: 'Material Reserved', owner: 'material', dots: [{ color: C.mat, count: 198, objectCount: 89, cycleTime: '0h' }] } },
  { id: 'mat-picked',   type: 'event', position: { x: 2690, y: 500 }, data: { label: 'Material Picked',   owner: 'material', dots: [{ color: C.mat, count: 184, objectCount: 82, cycleTime: '2h' }] } },
  { id: 'mat-issued',   type: 'event', position: { x: 2690, y: 620 }, data: { label: 'Material Issued',   owner: 'material', dots: [{ color: C.mat, count: 171, objectCount: 76, cycleTime: '4h' }] } },
  { id: 'mat-returned', type: 'event', position: { x: 2690, y: 740 }, data: { label: 'Material Returned', owner: 'material', dots: [{ color: C.mat, count: 23,  objectCount: 19, cycleTime: '2d' }] } },
  { id: 'term-mat', type: 'terminal', position: { x: 2755, y: 1060 }, data: { color: C.mat, owner: 'material' }, draggable: false },

  // ── O2C: Warehouse Task (base x=2940) ────────────────────────────────────
  { id: 'cat-wt', type: 'category', position: { x: 2940, y: 50 }, data: { label: 'Warehouse Task', color: C.wt, owner: 'warehouseTask', count: 214, objectCount: 98, cycleTime: '4h' }, draggable: false },
  { id: 'wt-created',   type: 'event', position: { x: 2920, y: 220 }, data: { label: 'Task Created',   owner: 'warehouseTask', dots: [{ color: C.wt, count: 214, objectCount: 98, cycleTime: '0h' }] } },
  { id: 'wt-assigned',  type: 'event', position: { x: 2920, y: 500 }, data: { label: 'Task Assigned',  owner: 'warehouseTask', dots: [{ color: C.wt, count: 201, objectCount: 92, cycleTime: '1h' }] } },
  { id: 'wt-confirmed', type: 'event', position: { x: 2920, y: 620 }, data: { label: 'Task Confirmed', owner: 'warehouseTask', dots: [{ color: C.wt, count: 189, objectCount: 86, cycleTime: '3h' }] } },
  { id: 'wt-cancelled', type: 'event', position: { x: 2920, y: 740 }, data: { label: 'Task Cancelled', owner: 'warehouseTask', dots: [{ color: C.wt, count: 14,  objectCount: 12, cycleTime: '2d' }] } },
  { id: 'term-wt', type: 'terminal', position: { x: 2985, y: 1060 }, data: { color: C.wt, owner: 'warehouseTask' }, draggable: false },

  // ── O2C: Delivery (base x=3170) ──────────────────────────────────────────
  { id: 'cat-dlv', type: 'category', position: { x: 3170, y: 50 }, data: { label: 'Delivery', color: C.dlv, owner: 'delivery', count: 128, objectCount: 121, cycleTime: '3d' }, draggable: false },
  { id: 'dlv-created',   type: 'event', position: { x: 3150, y: 220 }, data: { label: 'Delivery Created',   owner: 'delivery', dots: [{ color: C.dlv, count: 128, objectCount: 121, cycleTime: '0h' }] } },
  { id: 'dlv-picked',    type: 'event', position: { x: 3150, y: 500 }, data: { label: 'Delivery Picked',    owner: 'delivery', dots: [{ color: C.dlv, count: 121, objectCount: 115, cycleTime: '6h' }] } },
  { id: 'dlv-shipped',   type: 'event', position: { x: 3150, y: 620 }, data: { label: 'Goods Shipped',      owner: 'delivery', dots: [{ color: C.dlv, count: 118, objectCount: 112, cycleTime: '1d' }] } },
  { id: 'dlv-delivered', type: 'event', position: { x: 3150, y: 740 }, data: { label: 'Delivery Confirmed', owner: 'delivery', dots: [{ color: C.dlv, count: 112, objectCount: 106, cycleTime: '3d' }] } },
  { id: 'term-dlv', type: 'terminal', position: { x: 3215, y: 1060 }, data: { color: C.dlv, owner: 'delivery' }, draggable: false },

  // ── O2C: Goods Issue (base x=3400) ───────────────────────────────────────
  { id: 'cat-gi', type: 'category', position: { x: 3400, y: 50 }, data: { label: 'Goods Issue', color: C.gi, owner: 'goodsIssue', count: 118, objectCount: 112, cycleTime: '1h' }, draggable: false },
  { id: 'gi-posted',   type: 'event', position: { x: 3380, y: 220 }, data: { label: 'Goods Issue Posted',   owner: 'goodsIssue', dots: [{ color: C.gi, count: 118, objectCount: 112, cycleTime: '0h' }] } },
  { id: 'gi-partial',  type: 'event', position: { x: 3380, y: 500 }, data: { label: 'Partial Goods Issue',  owner: 'goodsIssue', dots: [{ color: C.gi, count: 21,  objectCount: 18,  cycleTime: '4h' }] } },
  { id: 'gi-reversed', type: 'event', position: { x: 3380, y: 620 }, data: { label: 'Goods Issue Reversed', owner: 'goodsIssue', dots: [{ color: C.gi, count: 11,  objectCount: 9,   cycleTime: '1d' }] } },
  { id: 'term-gi', type: 'terminal', position: { x: 3445, y: 1060 }, data: { color: C.gi, owner: 'goodsIssue' }, draggable: false },

  // ── O2C: Billing Document (base x=3630) ──────────────────────────────────
  { id: 'cat-bill', type: 'category', position: { x: 3630, y: 50 }, data: { label: 'Billing Document', color: C.bill, owner: 'billingDoc', count: 145, objectCount: 112, cycleTime: '2d' }, draggable: false },
  { id: 'bill-created',   type: 'event', position: { x: 3610, y: 220 }, data: { label: 'Billing Doc Created',   owner: 'billingDoc', dots: [{ color: C.bill, count: 145, objectCount: 112, cycleTime: '0h' }] } },
  { id: 'bill-released',  type: 'event', position: { x: 3610, y: 500 }, data: { label: 'Billing Doc Released',  owner: 'billingDoc', dots: [{ color: C.bill, count: 138, objectCount: 106, cycleTime: '2h' }] } },
  { id: 'bill-cancelled', type: 'event', position: { x: 3610, y: 620 }, data: { label: 'Billing Doc Cancelled', owner: 'billingDoc', dots: [{ color: C.bill, count: 9,   objectCount: 8,   cycleTime: '1d' }] } },
  { id: 'term-bill', type: 'terminal', position: { x: 3675, y: 1060 }, data: { color: C.bill, owner: 'billingDoc' }, draggable: false },

  // ── O2C: Invoice (base x=3860) ───────────────────────────────────────────
  { id: 'cat-inv', type: 'category', position: { x: 3860, y: 50 }, data: { label: 'Invoice', color: C.inv, owner: 'invoice', count: 152, objectCount: 112, cycleTime: '30d' }, draggable: false },
  { id: 'inv-created', type: 'event', position: { x: 3840, y: 220 }, data: { label: 'Invoice Created', owner: 'invoice', dots: [{ color: C.inv, count: 152, objectCount: 112, cycleTime: '0h'  }] } },
  { id: 'inv-sent',    type: 'event', position: { x: 3840, y: 500 }, data: { label: 'Invoice Sent',    owner: 'invoice', dots: [{ color: C.inv, count: 147, objectCount: 108, cycleTime: '1h'  }] } },
  { id: 'inv-paid',    type: 'event', position: { x: 3840, y: 620 }, data: { label: 'Invoice Paid',    owner: 'invoice', dots: [{ color: C.inv, count: 131, objectCount: 96,  cycleTime: '28d' }] } },
  { id: 'inv-overdue', type: 'event', position: { x: 3840, y: 740 }, data: { label: 'Invoice Overdue', owner: 'invoice', dots: [{ color: C.inv, count: 28,  objectCount: 22,  cycleTime: '35d' }] } },
  { id: 'term-inv', type: 'terminal', position: { x: 3905, y: 1060 }, data: { color: C.inv, owner: 'invoice' }, draggable: false },

  // ── O2C: Service Order (base x=4090) ─────────────────────────────────────
  { id: 'cat-svo', type: 'category', position: { x: 4090, y: 50 }, data: { label: 'Service Order', color: C.svo, owner: 'serviceOrder', count: 44, objectCount: 42, cycleTime: '5d' }, draggable: false },
  { id: 'svo-created',   type: 'event', position: { x: 4070, y: 220 }, data: { label: 'Service Order Created',   owner: 'serviceOrder', dots: [{ color: C.svo, count: 44, objectCount: 42, cycleTime: '0h' }] } },
  { id: 'svo-assigned',  type: 'event', position: { x: 4070, y: 500 }, data: { label: 'Service Order Assigned',  owner: 'serviceOrder', dots: [{ color: C.svo, count: 38, objectCount: 36, cycleTime: '4h' }] } },
  { id: 'svo-completed', type: 'event', position: { x: 4070, y: 620 }, data: { label: 'Service Order Completed', owner: 'serviceOrder', dots: [{ color: C.svo, count: 32, objectCount: 30, cycleTime: '2d' }] } },
  { id: 'svo-billed',    type: 'event', position: { x: 4070, y: 740 }, data: { label: 'Service Order Billed',    owner: 'serviceOrder', dots: [{ color: C.svo, count: 28, objectCount: 26, cycleTime: '3d' }] } },
  { id: 'term-svo', type: 'terminal', position: { x: 4135, y: 1060 }, data: { color: C.svo, owner: 'serviceOrder' }, draggable: false },

  // ── O2C: Credit Memo (base x=4320) ───────────────────────────────────────
  { id: 'cat-cm', type: 'category', position: { x: 4320, y: 50 }, data: { label: 'Credit Memo', color: C.cm, owner: 'creditMemo', count: 31, objectCount: 28, cycleTime: '2d' }, draggable: false },
  { id: 'cm-created',  type: 'event', position: { x: 4300, y: 220 }, data: { label: 'Credit Memo Created',  owner: 'creditMemo', dots: [{ color: C.cm, count: 31, objectCount: 28, cycleTime: '0h' }] } },
  { id: 'cm-approved', type: 'event', position: { x: 4300, y: 500 }, data: { label: 'Credit Memo Approved', owner: 'creditMemo', dots: [{ color: C.cm, count: 27, objectCount: 24, cycleTime: '6h' }] } },
  { id: 'cm-posted',   type: 'event', position: { x: 4300, y: 620 }, data: { label: 'Credit Memo Posted',   owner: 'creditMemo', dots: [{ color: C.cm, count: 24, objectCount: 21, cycleTime: '1d' }] } },
  { id: 'term-cm', type: 'terminal', position: { x: 4365, y: 1060 }, data: { color: C.cm, owner: 'creditMemo' }, draggable: false },

  // ── O2C: Return Order (base x=4550) ──────────────────────────────────────
  { id: 'cat-ret', type: 'category', position: { x: 4550, y: 50 }, data: { label: 'Return Order', color: C.ret, owner: 'returnOrder', count: 19, objectCount: 18, cycleTime: '8d' }, draggable: false },
  { id: 'ret-created',   type: 'event', position: { x: 4530, y: 220 }, data: { label: 'Return Created',   owner: 'returnOrder', dots: [{ color: C.ret, count: 19, objectCount: 18, cycleTime: '0h' }] } },
  { id: 'ret-received',  type: 'event', position: { x: 4530, y: 500 }, data: { label: 'Return Received',  owner: 'returnOrder', dots: [{ color: C.ret, count: 16, objectCount: 15, cycleTime: '3d' }] } },
  { id: 'ret-inspected', type: 'event', position: { x: 4530, y: 620 }, data: { label: 'Return Inspected', owner: 'returnOrder', dots: [{ color: C.ret, count: 14, objectCount: 13, cycleTime: '4d' }] } },
  { id: 'ret-credited',  type: 'event', position: { x: 4530, y: 740 }, data: { label: 'Return Credited',  owner: 'returnOrder', dots: [{ color: C.ret, count: 11, objectCount: 10, cycleTime: '6d' }] } },
  { id: 'term-ret', type: 'terminal', position: { x: 4595, y: 1060 }, data: { color: C.ret, owner: 'returnOrder' }, draggable: false },

  // ── O2C: Accounts Receivable (base x=4780) ───────────────────────────────
  { id: 'cat-ar', type: 'category', position: { x: 4780, y: 50 }, data: { label: 'Accounts Receivable', color: C.ar, owner: 'accountsReceivable', count: 147, objectCount: 108, cycleTime: '30d' }, draggable: false },
  { id: 'ar-open',       type: 'event', position: { x: 4760, y: 220 }, data: { label: 'AR Item Opened',     owner: 'accountsReceivable', dots: [{ color: C.ar, count: 147, objectCount: 108, cycleTime: '0h'  }] } },
  { id: 'ar-cleared',    type: 'event', position: { x: 4760, y: 500 }, data: { label: 'AR Item Cleared',    owner: 'accountsReceivable', dots: [{ color: C.ar, count: 131, objectCount: 96,  cycleTime: '28d' }] } },
  { id: 'ar-dunned',     type: 'event', position: { x: 4760, y: 620 }, data: { label: 'AR Item Dunned',     owner: 'accountsReceivable', dots: [{ color: C.ar, count: 28,  objectCount: 22,  cycleTime: '35d' }] } },
  { id: 'ar-written-off',type: 'event', position: { x: 4760, y: 740 }, data: { label: 'AR Written Off',     owner: 'accountsReceivable', dots: [{ color: C.ar, count: 7,   objectCount: 5,   cycleTime: '90d' }] } },
  { id: 'term-ar', type: 'terminal', position: { x: 4825, y: 1060 }, data: { color: C.ar, owner: 'accountsReceivable' }, draggable: false },

  // ── O2C: Payment (base x=5010) ───────────────────────────────────────────
  { id: 'cat-pay', type: 'category', position: { x: 5010, y: 50 }, data: { label: 'Payment', color: C.pay, owner: 'payment', count: 131, objectCount: 96, cycleTime: '3d' }, draggable: false },
  { id: 'pay-received', type: 'event', position: { x: 4990, y: 220 }, data: { label: 'Payment Received', owner: 'payment', dots: [{ color: C.pay, count: 131, objectCount: 96, cycleTime: '0h' }] } },
  { id: 'pay-cleared',  type: 'event', position: { x: 4990, y: 500 }, data: { label: 'Payment Cleared',  owner: 'payment', dots: [{ color: C.pay, count: 128, objectCount: 94, cycleTime: '2d' }] } },
  { id: 'pay-partial',  type: 'event', position: { x: 4990, y: 620 }, data: { label: 'Partial Payment',  owner: 'payment', dots: [{ color: C.pay, count: 22,  objectCount: 18, cycleTime: '14d'}] } },
  { id: 'pay-reversed', type: 'event', position: { x: 4990, y: 740 }, data: { label: 'Payment Reversed', owner: 'payment', dots: [{ color: C.pay, count: 8,   objectCount: 6,  cycleTime: '3d' }] } },
  { id: 'term-pay', type: 'terminal', position: { x: 5055, y: 1060 }, data: { color: C.pay, owner: 'payment' }, draggable: false },

  // ── O2C: Dunning Notice (base x=5240) ────────────────────────────────────
  { id: 'cat-dun', type: 'category', position: { x: 5240, y: 50 }, data: { label: 'Dunning Notice', color: C.dun, owner: 'dunningNotice', count: 28, objectCount: 22, cycleTime: '7d' }, draggable: false },
  { id: 'dun-created',   type: 'event', position: { x: 5220, y: 220 }, data: { label: 'Dunning Created',   owner: 'dunningNotice', dots: [{ color: C.dun, count: 28, objectCount: 22, cycleTime: '0h' }] } },
  { id: 'dun-sent',      type: 'event', position: { x: 5220, y: 500 }, data: { label: 'Dunning Sent',      owner: 'dunningNotice', dots: [{ color: C.dun, count: 25, objectCount: 20, cycleTime: '1d' }] } },
  { id: 'dun-escalated', type: 'event', position: { x: 5220, y: 620 }, data: { label: 'Dunning Escalated', owner: 'dunningNotice', dots: [{ color: C.dun, count: 11, objectCount: 9,  cycleTime: '7d' }] } },
  { id: 'term-dun', type: 'terminal', position: { x: 5285, y: 1060 }, data: { color: C.dun, owner: 'dunningNotice' }, draggable: false },

  // ── O2C: Bank Statement (base x=5470) ────────────────────────────────────
  { id: 'cat-bank', type: 'category', position: { x: 5470, y: 50 }, data: { label: 'Bank Statement', color: C.bank, owner: 'bankStatement', count: 42, objectCount: 38, cycleTime: '1d' }, draggable: false },
  { id: 'bank-imported',  type: 'event', position: { x: 5450, y: 220 }, data: { label: 'Statement Imported',  owner: 'bankStatement', dots: [{ color: C.bank, count: 42,  objectCount: 38, cycleTime: '0h' }] } },
  { id: 'bank-matched',   type: 'event', position: { x: 5450, y: 500 }, data: { label: 'Statement Matched',   owner: 'bankStatement', dots: [{ color: C.bank, count: 128, objectCount: 94, cycleTime: '1d' }] } },
  { id: 'bank-unmatched', type: 'event', position: { x: 5450, y: 620 }, data: { label: 'Statement Unmatched', owner: 'bankStatement', dots: [{ color: C.bank, count: 14,  objectCount: 11, cycleTime: '2d' }] } },
  { id: 'term-bank', type: 'terminal', position: { x: 5515, y: 1060 }, data: { color: C.bank, owner: 'bankStatement' }, draggable: false },
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

  // ── O2C trace edges (pill → first event) ──────────────────────────────────
  { id: 'trace-cust',  source: 'cat-cust',  target: 'cust-onboarded',  type: 'count', data: { color: C.cust,  dotted: true, count: 48,  cycleTime: '5d',   objectCount: 45  } },
  { id: 'trace-quot',  source: 'cat-quot',  target: 'quot-created',    type: 'count', data: { color: C.quot,  dotted: true, count: 85,  cycleTime: '4d',   objectCount: 80  } },
  { id: 'trace-contr', source: 'cat-contr', target: 'contr-created',   type: 'count', data: { color: C.contr, dotted: true, count: 34,  cycleTime: '365d', objectCount: 32  } },
  { id: 'trace-so',    source: 'cat-so',    target: 'so-created',      type: 'count', data: { color: C.so,    dotted: true, count: 156, cycleTime: '7d',   objectCount: 148 } },
  { id: 'trace-soi',   source: 'cat-soi',   target: 'soi-created',     type: 'count', data: { color: C.soi,   dotted: true, count: 312, cycleTime: '3d',   objectCount: 148 } },
  { id: 'trace-pc',    source: 'cat-pc',    target: 'pc-created',      type: 'count', data: { color: C.pc,    dotted: true, count: 420, cycleTime: '30d',  objectCount: 148 } },
  { id: 'trace-po',    source: 'cat-po',    target: 'po-created',      type: 'count', data: { color: C.po,    dotted: true, count: 73,  cycleTime: '10d',  objectCount: 70  } },
  { id: 'trace-mat',   source: 'cat-mat',   target: 'mat-reserved',    type: 'count', data: { color: C.mat,   dotted: true, count: 198, cycleTime: '1d',   objectCount: 89  } },
  { id: 'trace-wt',    source: 'cat-wt',    target: 'wt-created',      type: 'count', data: { color: C.wt,    dotted: true, count: 214, cycleTime: '4h',   objectCount: 98  } },
  { id: 'trace-dlv',   source: 'cat-dlv',   target: 'dlv-created',     type: 'count', data: { color: C.dlv,   dotted: true, count: 128, cycleTime: '3d',   objectCount: 121 } },
  { id: 'trace-gi',    source: 'cat-gi',    target: 'gi-posted',       type: 'count', data: { color: C.gi,    dotted: true, count: 118, cycleTime: '1h',   objectCount: 112 } },
  { id: 'trace-bill',  source: 'cat-bill',  target: 'bill-created',    type: 'count', data: { color: C.bill,  dotted: true, count: 145, cycleTime: '2d',   objectCount: 112 } },
  { id: 'trace-inv',   source: 'cat-inv',   target: 'inv-created',     type: 'count', data: { color: C.inv,   dotted: true, count: 152, cycleTime: '30d',  objectCount: 112 } },
  { id: 'trace-svo',   source: 'cat-svo',   target: 'svo-created',     type: 'count', data: { color: C.svo,   dotted: true, count: 44,  cycleTime: '5d',   objectCount: 42  } },
  { id: 'trace-cm',    source: 'cat-cm',    target: 'cm-created',      type: 'count', data: { color: C.cm,    dotted: true, count: 31,  cycleTime: '2d',   objectCount: 28  } },
  { id: 'trace-ret',   source: 'cat-ret',   target: 'ret-created',     type: 'count', data: { color: C.ret,   dotted: true, count: 19,  cycleTime: '8d',   objectCount: 18  } },
  { id: 'trace-ar',    source: 'cat-ar',    target: 'ar-open',         type: 'count', data: { color: C.ar,    dotted: true, count: 147, cycleTime: '30d',  objectCount: 108 } },
  { id: 'trace-pay',   source: 'cat-pay',   target: 'pay-received',    type: 'count', data: { color: C.pay,   dotted: true, count: 131, cycleTime: '3d',   objectCount: 96  } },
  { id: 'trace-dun',   source: 'cat-dun',   target: 'dun-created',     type: 'count', data: { color: C.dun,   dotted: true, count: 28,  cycleTime: '7d',   objectCount: 22  } },
  { id: 'trace-bank',  source: 'cat-bank',  target: 'bank-imported',   type: 'count', data: { color: C.bank,  dotted: true, count: 42,  cycleTime: '1d',   objectCount: 38  } },

  // ── O2C lifecycle edges ────────────────────────────────────────────────────
  { id: 'cust-1',  source: 'cust-onboarded',      target: 'cust-credit-checked', type: 'count', data: { color: C.cust,  count: 42,  cycleTime: '2h',   objectCount: 39  } },
  { id: 'cust-2',  source: 'cust-credit-checked', target: 'cust-blocked',        type: 'count', data: { color: C.cust,  count: 8,   cycleTime: '1d',   objectCount: 7   } },
  { id: 'cust-3',  source: 'cust-blocked',        target: 'cust-unblocked',      type: 'count', data: { color: C.cust,  count: 5,   cycleTime: '2d',   objectCount: 4   } },
  { id: 'quot-1',  source: 'quot-created',         target: 'quot-sent',           type: 'count', data: { color: C.quot,  count: 71,  cycleTime: '1d',   objectCount: 66  } },
  { id: 'quot-2',  source: 'quot-sent',            target: 'quot-won',            type: 'count', data: { color: C.quot,  count: 52,  cycleTime: '3d',   objectCount: 49  } },
  { id: 'quot-3',  source: 'quot-won',             target: 'quot-lost',           type: 'count', data: { color: C.quot,  count: 19,  cycleTime: '2d',   objectCount: 17  } },
  { id: 'contr-1', source: 'contr-created',        target: 'contr-activated',     type: 'count', data: { color: C.contr, count: 28,  cycleTime: '2d',   objectCount: 26  } },
  { id: 'contr-2', source: 'contr-activated',      target: 'contr-expired',       type: 'count', data: { color: C.contr, count: 12,  cycleTime: '365d', objectCount: 11  } },
  { id: 'contr-3', source: 'contr-expired',        target: 'contr-renewed',       type: 'count', data: { color: C.contr, count: 7,   cycleTime: '5d',   objectCount: 6   } },
  { id: 'so-1',    source: 'so-created',           target: 'so-confirmed',        type: 'count', data: { color: C.so,    count: 141, cycleTime: '4h',   objectCount: 134 } },
  { id: 'so-2',    source: 'so-confirmed',         target: 'so-delivered',        type: 'count', data: { color: C.so,    count: 128, cycleTime: '2d',   objectCount: 121 } },
  { id: 'so-3',    source: 'so-delivered',         target: 'so-invoiced',         type: 'count', data: { color: C.so,    count: 112, cycleTime: '3d',   objectCount: 106 } },
  { id: 'so-4',    source: 'so-invoiced',          target: 'so-completed',        type: 'count', data: { color: C.so,    count: 98,  cycleTime: '5d',   objectCount: 93  } },
  { id: 'soi-1',   source: 'soi-created',          target: 'soi-confirmed',       type: 'count', data: { color: C.soi,   count: 287, cycleTime: '1h',   objectCount: 134 } },
  { id: 'soi-2',   source: 'soi-confirmed',        target: 'soi-delivered',       type: 'count', data: { color: C.soi,   count: 261, cycleTime: '3d',   objectCount: 121 } },
  { id: 'pc-1',    source: 'pc-created',           target: 'pc-activated',        type: 'count', data: { color: C.pc,    count: 398, cycleTime: '30m',  objectCount: 140 } },
  { id: 'pc-2',    source: 'pc-activated',         target: 'pc-updated',          type: 'count', data: { color: C.pc,    count: 67,  cycleTime: '1d',   objectCount: 62  } },
  { id: 'pc-3',    source: 'pc-updated',           target: 'pc-expired',          type: 'count', data: { color: C.pc,    count: 31,  cycleTime: '365d', objectCount: 28  } },
  { id: 'po-1',    source: 'po-created',           target: 'po-approved',         type: 'count', data: { color: C.po,    count: 61,  cycleTime: '6h',   objectCount: 58  } },
  { id: 'po-2',    source: 'po-approved',          target: 'po-received',         type: 'count', data: { color: C.po,    count: 54,  cycleTime: '4d',   objectCount: 51  } },
  { id: 'po-3',    source: 'po-received',          target: 'po-invoiced',         type: 'count', data: { color: C.po,    count: 48,  cycleTime: '5d',   objectCount: 45  } },
  { id: 'mat-1',   source: 'mat-reserved',         target: 'mat-picked',          type: 'count', data: { color: C.mat,   count: 184, cycleTime: '2h',   objectCount: 82  } },
  { id: 'mat-2',   source: 'mat-picked',           target: 'mat-issued',          type: 'count', data: { color: C.mat,   count: 171, cycleTime: '4h',   objectCount: 76  } },
  { id: 'mat-3',   source: 'mat-issued',           target: 'mat-returned',        type: 'count', data: { color: C.mat,   count: 23,  cycleTime: '2d',   objectCount: 19  } },
  { id: 'wt-1',    source: 'wt-created',           target: 'wt-assigned',         type: 'count', data: { color: C.wt,    count: 201, cycleTime: '1h',   objectCount: 92  } },
  { id: 'wt-2',    source: 'wt-assigned',          target: 'wt-confirmed',        type: 'count', data: { color: C.wt,    count: 189, cycleTime: '3h',   objectCount: 86  } },
  { id: 'wt-3',    source: 'wt-confirmed',         target: 'wt-cancelled',        type: 'count', data: { color: C.wt,    count: 14,  cycleTime: '2d',   objectCount: 12  } },
  { id: 'dlv-1',   source: 'dlv-created',          target: 'dlv-picked',          type: 'count', data: { color: C.dlv,   count: 121, cycleTime: '6h',   objectCount: 115 } },
  { id: 'dlv-2',   source: 'dlv-picked',           target: 'dlv-shipped',         type: 'count', data: { color: C.dlv,   count: 118, cycleTime: '1d',   objectCount: 112 } },
  { id: 'dlv-3',   source: 'dlv-shipped',          target: 'dlv-delivered',       type: 'count', data: { color: C.dlv,   count: 112, cycleTime: '3d',   objectCount: 106 } },
  { id: 'gi-1',    source: 'gi-posted',            target: 'gi-partial',          type: 'count', data: { color: C.gi,    count: 21,  cycleTime: '4h',   objectCount: 18  } },
  { id: 'gi-2',    source: 'gi-partial',           target: 'gi-reversed',         type: 'count', data: { color: C.gi,    count: 11,  cycleTime: '1d',   objectCount: 9   } },
  { id: 'bill-1',  source: 'bill-created',         target: 'bill-released',       type: 'count', data: { color: C.bill,  count: 138, cycleTime: '2h',   objectCount: 106 } },
  { id: 'bill-2',  source: 'bill-released',        target: 'bill-cancelled',      type: 'count', data: { color: C.bill,  count: 9,   cycleTime: '1d',   objectCount: 8   } },
  { id: 'inv-1',   source: 'inv-created',          target: 'inv-sent',            type: 'count', data: { color: C.inv,   count: 147, cycleTime: '1h',   objectCount: 108 } },
  { id: 'inv-2',   source: 'inv-sent',             target: 'inv-paid',            type: 'count', data: { color: C.inv,   count: 131, cycleTime: '28d',  objectCount: 96  } },
  { id: 'inv-3',   source: 'inv-paid',             target: 'inv-overdue',         type: 'count', data: { color: C.inv,   count: 28,  cycleTime: '35d',  objectCount: 22  } },
  { id: 'svo-1',   source: 'svo-created',          target: 'svo-assigned',        type: 'count', data: { color: C.svo,   count: 38,  cycleTime: '4h',   objectCount: 36  } },
  { id: 'svo-2',   source: 'svo-assigned',         target: 'svo-completed',       type: 'count', data: { color: C.svo,   count: 32,  cycleTime: '2d',   objectCount: 30  } },
  { id: 'svo-3',   source: 'svo-completed',        target: 'svo-billed',          type: 'count', data: { color: C.svo,   count: 28,  cycleTime: '3d',   objectCount: 26  } },
  { id: 'cm-1',    source: 'cm-created',           target: 'cm-approved',         type: 'count', data: { color: C.cm,    count: 27,  cycleTime: '6h',   objectCount: 24  } },
  { id: 'cm-2',    source: 'cm-approved',          target: 'cm-posted',           type: 'count', data: { color: C.cm,    count: 24,  cycleTime: '1d',   objectCount: 21  } },
  { id: 'ret-1',   source: 'ret-created',          target: 'ret-received',        type: 'count', data: { color: C.ret,   count: 16,  cycleTime: '3d',   objectCount: 15  } },
  { id: 'ret-2',   source: 'ret-received',         target: 'ret-inspected',       type: 'count', data: { color: C.ret,   count: 14,  cycleTime: '4d',   objectCount: 13  } },
  { id: 'ret-3',   source: 'ret-inspected',        target: 'ret-credited',        type: 'count', data: { color: C.ret,   count: 11,  cycleTime: '6d',   objectCount: 10  } },
  { id: 'ar-1',    source: 'ar-open',              target: 'ar-cleared',          type: 'count', data: { color: C.ar,    count: 131, cycleTime: '28d',  objectCount: 96  } },
  { id: 'ar-2',    source: 'ar-cleared',           target: 'ar-dunned',           type: 'count', data: { color: C.ar,    count: 28,  cycleTime: '35d',  objectCount: 22  } },
  { id: 'ar-3',    source: 'ar-dunned',            target: 'ar-written-off',      type: 'count', data: { color: C.ar,    count: 7,   cycleTime: '90d',  objectCount: 5   } },
  { id: 'pay-1',   source: 'pay-received',         target: 'pay-cleared',         type: 'count', data: { color: C.pay,   count: 128, cycleTime: '2d',   objectCount: 94  } },
  { id: 'pay-2',   source: 'pay-cleared',          target: 'pay-partial',         type: 'count', data: { color: C.pay,   count: 22,  cycleTime: '14d',  objectCount: 18  } },
  { id: 'pay-3',   source: 'pay-partial',          target: 'pay-reversed',        type: 'count', data: { color: C.pay,   count: 8,   cycleTime: '3d',   objectCount: 6   } },
  { id: 'dun-1',   source: 'dun-created',          target: 'dun-sent',            type: 'count', data: { color: C.dun,   count: 25,  cycleTime: '1d',   objectCount: 20  } },
  { id: 'dun-2',   source: 'dun-sent',             target: 'dun-escalated',       type: 'count', data: { color: C.dun,   count: 11,  cycleTime: '7d',   objectCount: 9   } },
  { id: 'bank-1',  source: 'bank-imported',        target: 'bank-matched',        type: 'count', data: { color: C.bank,  count: 128, cycleTime: '1d',   objectCount: 94  } },
  { id: 'bank-2',  source: 'bank-matched',         target: 'bank-unmatched',      type: 'count', data: { color: C.bank,  count: 14,  cycleTime: '2d',   objectCount: 11  } },

  // ── O2C cross-object connections (main process flow, left-to-right) ───────
  { id: 'cross-cust-so',   source: 'cust-credit-checked', sourceHandle: 'sr', target: 'so-created',   targetHandle: 'tl', type: 'count', data: { color: C.cust,  count: 42,  cycleTime: '2h',  objectCount: 39  } },
  { id: 'cross-quot-so',   source: 'quot-won',            sourceHandle: 'sr', target: 'so-created',   targetHandle: 'tl', type: 'count', data: { color: C.quot,  count: 52,  cycleTime: '3d',  objectCount: 49  } },
  { id: 'cross-contr-so',  source: 'contr-activated',     sourceHandle: 'sr', target: 'so-created',   targetHandle: 'tl', type: 'count', data: { color: C.contr, count: 28,  cycleTime: '1h',  objectCount: 26  } },
  { id: 'cross-so-soi',    source: 'so-created',          sourceHandle: 'sr', target: 'soi-created',  targetHandle: 'tl', type: 'count', data: { color: C.so,    count: 312, cycleTime: '30m', objectCount: 148 } },
  { id: 'cross-po-mat',    source: 'po-approved',         sourceHandle: 'sr', target: 'mat-reserved', targetHandle: 'tl', type: 'count', data: { color: C.po,    count: 61,  cycleTime: '6h',  objectCount: 58  } },
  { id: 'cross-mat-wt',    source: 'mat-picked',          sourceHandle: 'sr', target: 'wt-created',   targetHandle: 'tl', type: 'count', data: { color: C.mat,   count: 184, cycleTime: '2h',  objectCount: 82  } },
  { id: 'cross-wt-dlv',    source: 'wt-confirmed',        sourceHandle: 'sr', target: 'dlv-created',  targetHandle: 'tl', type: 'count', data: { color: C.wt,    count: 189, cycleTime: '3h',  objectCount: 86  } },
  { id: 'cross-dlv-gi',    source: 'dlv-shipped',         sourceHandle: 'sr', target: 'gi-posted',    targetHandle: 'tl', type: 'count', data: { color: C.dlv,   count: 118, cycleTime: '1d',  objectCount: 112 } },
  { id: 'cross-gi-bill',   source: 'gi-posted',           sourceHandle: 'sr', target: 'bill-created', targetHandle: 'tl', type: 'count', data: { color: C.gi,    count: 118, cycleTime: '1h',  objectCount: 112 } },
  { id: 'cross-bill-inv',  source: 'bill-released',       sourceHandle: 'sr', target: 'inv-created',  targetHandle: 'tl', type: 'count', data: { color: C.bill,  count: 138, cycleTime: '2h',  objectCount: 106 } },
  { id: 'cross-svo-inv',   source: 'svo-billed',          sourceHandle: 'sr', target: 'inv-created',  targetHandle: 'tl', type: 'count', data: { color: C.svo,   count: 28,  cycleTime: '1h',  objectCount: 26  } },
  { id: 'cross-inv-cm',    source: 'inv-sent',            sourceHandle: 'sr', target: 'cm-created',   targetHandle: 'tl', type: 'count', data: { color: C.inv,   count: 31,  cycleTime: '2h',  objectCount: 28  } },
  { id: 'cross-ret-cm',    source: 'ret-received',        sourceHandle: 'sr', target: 'cm-created',   targetHandle: 'tl', type: 'count', data: { color: C.ret,   count: 16,  cycleTime: '3d',  objectCount: 15  } },
  { id: 'cross-inv-ar',    source: 'inv-sent',            sourceHandle: 'sr', target: 'ar-open',      targetHandle: 'tl', type: 'count', data: { color: C.inv,   count: 147, cycleTime: '1h',  objectCount: 108 } },
  { id: 'cross-ar-pay',    source: 'ar-open',             sourceHandle: 'sr', target: 'pay-received', targetHandle: 'tl', type: 'count', data: { color: C.ar,    count: 131, cycleTime: '28d', objectCount: 96  } },
  { id: 'cross-ar-dun',    source: 'ar-dunned',           sourceHandle: 'sr', target: 'dun-created',  targetHandle: 'tl', type: 'count', data: { color: C.ar,    count: 28,  cycleTime: '1d',  objectCount: 22  } },
  { id: 'cross-pay-bank',  source: 'pay-cleared',         sourceHandle: 'sr', target: 'bank-imported',targetHandle: 'tl', type: 'count', data: { color: C.pay,   count: 128, cycleTime: '1d',  objectCount: 94  } },
]

// ── Auto fit-view when visible objects change ─────────────────────────────────
type ObjKey = 'changeTask' | 'changeRequest' | 'incident' | 'problem'
  | 'customer' | 'quotation' | 'contract' | 'salesOrder' | 'salesOrderItem'
  | 'pricingCondition' | 'purchaseOrder' | 'material' | 'warehouseTask'
  | 'delivery' | 'goodsIssue' | 'billingDoc' | 'invoice' | 'serviceOrder'
  | 'creditMemo' | 'returnOrder' | 'accountsReceivable' | 'payment'
  | 'dunningNotice' | 'bankStatement'

interface SliderHighlight {
  nodeIds: ReadonlySet<string>
  edgeIds: ReadonlySet<string>
}

const OBJECT_DEFS: { key: ObjKey; label: string; color: string; x: number }[] = [
  { key: 'incident',           label: 'Incident',             color: C.inc,   x: 82   },
  { key: 'problem',            label: 'Problem',              color: C.prob,  x: 318  },
  { key: 'changeRequest',      label: 'Change Request',       color: C.cr,    x: 556  },
  { key: 'changeTask',         label: 'Change Task',          color: C.ct,    x: 832  },
  { key: 'customer',           label: 'Customer',             color: C.cust,  x: 1100 },
  { key: 'quotation',          label: 'Quotation',            color: C.quot,  x: 1330 },
  { key: 'contract',           label: 'Contract',             color: C.contr, x: 1560 },
  { key: 'salesOrder',         label: 'Sales Order',          color: C.so,    x: 1790 },
  { key: 'salesOrderItem',     label: 'Sales Order Item',     color: C.soi,   x: 2020 },
  { key: 'pricingCondition',   label: 'Pricing Condition',    color: C.pc,    x: 2250 },
  { key: 'purchaseOrder',      label: 'Purchase Order',       color: C.po,    x: 2480 },
  { key: 'material',           label: 'Material',             color: C.mat,   x: 2710 },
  { key: 'warehouseTask',      label: 'Warehouse Task',       color: C.wt,    x: 2940 },
  { key: 'delivery',           label: 'Delivery',             color: C.dlv,   x: 3170 },
  { key: 'goodsIssue',         label: 'Goods Issue',          color: C.gi,    x: 3400 },
  { key: 'billingDoc',         label: 'Billing Document',     color: C.bill,  x: 3630 },
  { key: 'invoice',            label: 'Invoice',              color: C.inv,   x: 3860 },
  { key: 'serviceOrder',       label: 'Service Order',        color: C.svo,   x: 4090 },
  { key: 'creditMemo',         label: 'Credit Memo',          color: C.cm,    x: 4320 },
  { key: 'returnOrder',        label: 'Return Order',         color: C.ret,   x: 4550 },
  { key: 'accountsReceivable', label: 'Accounts Receivable',  color: C.ar,    x: 4780 },
  { key: 'payment',            label: 'Payment',              color: C.pay,   x: 5010 },
  { key: 'dunningNotice',      label: 'Dunning Notice',       color: C.dun,   x: 5240 },
  { key: 'bankStatement',      label: 'Bank Statement',       color: C.bank,  x: 5470 },
]

type AttrIcon = 'T' | '#' | '⏱'
const OBJECT_ATTRS: Record<ObjKey, { label: string; icon: AttrIcon }[]> = {
  incident:           [{ label: 'Category',         icon: 'T' }, { label: 'Impact',          icon: 'T'  }, { label: 'Priority',         icon: 'T' }, { label: 'Processor',       icon: 'T' }],
  problem:            [{ label: 'Category',         icon: 'T' }, { label: 'Priority',         icon: 'T'  }, { label: 'Root Cause',       icon: 'T' }],
  changeRequest:      [{ label: 'Category',         icon: 'T' }, { label: 'Priority',         icon: 'T'  }, { label: 'Risk',             icon: 'T' }, { label: 'Urgency',         icon: 'T' }],
  changeTask:         [{ label: 'Category',         icon: 'T' }, { label: 'Due Date',         icon: '⏱' }, { label: 'Processor',        icon: 'T' }],
  customer:           [{ label: 'Account Group',    icon: 'T' }, { label: 'Company Code',     icon: '#'  }, { label: 'Country',          icon: 'T' }, { label: 'Credit Limit',    icon: '#' }],
  quotation:          [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Net Value',        icon: '#' }, { label: 'Sales Org',       icon: '#' }, { label: 'Valid Until', icon: '⏱' }],
  contract:           [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'End Date',         icon: '⏱' }, { label: 'Net Value',       icon: '#' }, { label: 'Sales Org',   icon: '#' }],
  salesOrder:         [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Customer',         icon: '#' }, { label: 'Document Type',   icon: 'T' }, { label: 'Net Value',   icon: '#' }, { label: 'Sales Org', icon: '#' }],
  salesOrderItem:     [{ label: 'Item Category',    icon: 'T' }, { label: 'Material',         icon: '#'  }, { label: 'Net Price',        icon: '#' }, { label: 'Plant',           icon: '#' }, { label: 'Quantity',    icon: '#' }, { label: 'Unit', icon: 'T' }],
  pricingCondition:   [{ label: 'Condition Type',   icon: 'T' }, { label: 'Currency',         icon: 'T'  }, { label: 'Rate',             icon: '#' }, { label: 'Valid From',      icon: '⏱' }, { label: 'Valid To',    icon: '⏱' }],
  purchaseOrder:      [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Plant',            icon: '#' }, { label: 'Purchase Org',    icon: '#' }, { label: 'Vendor',      icon: '#' }],
  material:           [{ label: 'Base Unit',        icon: 'T' }, { label: 'Material Group',   icon: 'T'  }, { label: 'Material Type',    icon: 'T' }, { label: 'Plant',           icon: '#' }, { label: 'Stock Qty',   icon: '#' }],
  warehouseTask:      [{ label: 'Destination Bin',  icon: '#' }, { label: 'Product',          icon: '#'  }, { label: 'Quantity',         icon: '#' }, { label: 'Source Bin',      icon: '#' }, { label: 'Warehouse',   icon: '#' }],
  delivery:           [{ label: 'Category',         icon: 'T' }, { label: 'Company Code',     icon: '#'  }, { label: 'Cost Amount',      icon: '#' }, { label: 'Country',         icon: 'T' }, { label: 'Material',    icon: '#' }, { label: 'Plant', icon: '#' }, { label: 'Quantity', icon: '#' }],
  goodsIssue:         [{ label: 'Company Code',     icon: '#' }, { label: 'Material',         icon: '#'  }, { label: 'Plant',            icon: '#' }, { label: 'Posting Date',    icon: '⏱' }, { label: 'Quantity',    icon: '#' }],
  billingDoc:         [{ label: 'Billing Type',     icon: 'T' }, { label: 'Company Code',     icon: '#'  }, { label: 'Currency',         icon: 'T' }, { label: 'Net Value',       icon: '#' }, { label: 'Payer',       icon: '#' }],
  invoice:            [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Document Type',    icon: 'T' }, { label: 'Due Date',        icon: '⏱' }, { label: 'Net Amount',  icon: '#' }, { label: 'Tax Amount', icon: '#' }],
  serviceOrder:       [{ label: 'Company Code',     icon: '#' }, { label: 'Customer',         icon: '#'  }, { label: 'Priority',         icon: 'T' }, { label: 'Service Type',    icon: 'T' }],
  creditMemo:         [{ label: 'Amount',           icon: '#' }, { label: 'Company Code',     icon: '#'  }, { label: 'Currency',         icon: 'T' }, { label: 'Reason',          icon: 'T' }],
  returnOrder:        [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Material',         icon: '#' }, { label: 'Quantity',        icon: '#' }, { label: 'Return Reason', icon: 'T' }],
  accountsReceivable: [{ label: 'Company Code',     icon: '#' }, { label: 'Currency',         icon: 'T'  }, { label: 'Customer',         icon: '#' }, { label: 'Due Date',        icon: '⏱' }, { label: 'Open Amount', icon: '#' }],
  payment:            [{ label: 'Amount',           icon: '#' }, { label: 'Bank Account',     icon: '#'  }, { label: 'Company Code',     icon: '#' }, { label: 'Currency',        icon: 'T' }, { label: 'Payment Method', icon: 'T' }],
  dunningNotice:      [{ label: 'Company Code',     icon: '#' }, { label: 'Customer',         icon: '#'  }, { label: 'Dunning Level',    icon: '#' }, { label: 'Outstanding Amt', icon: '#' }],
  bankStatement:      [{ label: 'Account',          icon: '#' }, { label: 'Amount',           icon: '#'  }, { label: 'Bank',             icon: 'T' }, { label: 'Currency',        icon: 'T' }, { label: 'Transaction Date', icon: '⏱' }],
}

function FitViewOnChange({ trigger }: { trigger: unknown }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 150)
    return () => clearTimeout(t)
  }, [trigger, fitView])
  return null
}

// ── Custom zoom toolbar (bottom-center card) ──────────────────────────────────
function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useStore((s: any) => s.transform[2])
  const pct = Math.round((zoom ?? 1) * 100)

  const btn: React.CSSProperties = { width: 32, height: 32, padding: 0 }
  const divider: React.CSSProperties = {
    width: 1, height: 20, background: 'var(--sapGroup_ContentBorderColor)', flexShrink: 0,
  }
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      display: 'flex', alignItems: 'center',
      background: 'var(--sapList_Background, #fff)',
      border: '1px solid var(--sapGroup_ContentBorderColor)',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      overflow: 'hidden',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: 2 }}>
          <Button design="Transparent" icon="full-screen" tooltip="Fit view"
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
  const [hoveredObj, setHoveredObj] = useState<ObjKey | null>(null)
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
        <div key={obj.key} onClick={() => onSelect(obj.key)}
          onMouseEnter={() => setHoveredObj(obj.key)}
          onMouseLeave={() => setHoveredObj(null)}
          style={{
          position: 'absolute',
          left: obj.x * zoom + tx,
          top: '50%',
          transform: 'translateY(-50%)',
          background: obj.color, color: 'white',
          padding: '4px 12px', borderRadius: '14px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          border: '3px solid #f4f4f4',
          outline: selectedObj === obj.key ? `2.5px solid ${obj.color}` : '2.5px solid transparent',
          outlineOffset: '2px',
          zIndex: selectedObj === obj.key ? 3 : hoveredObj === obj.key ? 2 : 1,
        }}>
          {obj.label}
        </div>
      ))}
    </div>
  )
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({
  title, badge, defaultOpen = true, forceOpen, children,
}: {
  title: string; badge?: string; defaultOpen?: boolean; forceOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])
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
    incident: true, problem: true, changeRequest: true, changeTask: true,
    customer: true, quotation: true, contract: true, salesOrder: true,
    salesOrderItem: false, pricingCondition: false, purchaseOrder: false,
    material: false, warehouseTask: false, delivery: false, goodsIssue: false,
    billingDoc: false, invoice: false, serviceOrder: false, creditMemo: false,
    returnOrder: false, accountsReceivable: false, payment: false,
    dunningNotice: false, bankStatement: false,
  })
  const [metric, setMetric] = useState<'count' | 'cycle' | 'object'>('count')
  const [filterText, setFilterText] = useState('')
  const [filterSuggestionsOpen, setFilterSuggestionsOpen] = useState(false)
  const [filterHighlightIdx, setFilterHighlightIdx] = useState(-1)
  const rfRef = useRef<any>(null)

  useEffect(() => {
    if (!filterText) setSelectedObj(null)
  }, [filterText])

  const focusObject = (key: ObjKey) => {
    setObjects(prev => prev[key] ? prev : { ...prev, [key]: true })
    setSelectedObj(key)
    setFilterSuggestionsOpen(false)
    setFilterHighlightIdx(-1)
    setTimeout(() => {
      const ownedNodeIds = nodes
        .filter(n => (n.data as any).owner === key)
        .map(n => ({ id: n.id }))
      rfRef.current?.fitView({ nodes: ownedNodeIds, padding: 0.5, duration: 400 })
    }, 50)
  }
  const [filterView, setFilterView] = useState<'empty' | 'create'>('empty')
  const [filterAttrSearch, setFilterAttrSearch] = useState('')
  const [expandedFilterObjs, setExpandedFilterObjs] = useState<Set<string>>(new Set())
  const [filterObjSearches, setFilterObjSearches] = useState<Record<string, string>>({})
  const toggleFilterObj = (key: string) => setExpandedFilterObjs(prev => {
    const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next
  })
  const [stickyBarVisible, setStickyBarVisible] = useState(false)
  const [activePanel, setActivePanel] = useState<'controls' | 'filter' | 'legend' | 'settings' | null>('controls')
  const togglePanel = (panel: 'controls' | 'filter' | 'legend' | 'settings') =>
    setActivePanel(p => p === panel ? null : panel)
  useEffect(() => {
    if (activePanel !== 'filter') { setFilterView('empty'); setFilterAttrSearch('') }
  }, [activePanel])
  const [selectedObj, setSelectedObj] = useState<ObjKey | null>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [eventSliders, setEventSliders] = useState<Record<ObjKey, number>>({
    changeTask: 2, changeRequest: 4, incident: 4, problem: 3,
    customer: 2, quotation: 2, contract: 2, salesOrder: 2,
    salesOrderItem: 2, pricingCondition: 2, purchaseOrder: 2,
    material: 2, warehouseTask: 2, delivery: 2, goodsIssue: 2,
    billingDoc: 2, invoice: 2, serviceOrder: 2, creditMemo: 2,
    returnOrder: 2, accountsReceivable: 2, payment: 2,
    dunningNotice: 2, bankStatement: 2,
  })
  const [pathSliders, setPathSliders] = useState<Record<ObjKey, number>>({
    changeTask: 0, changeRequest: 5, incident: 0, problem: 0,
    customer: 0, quotation: 0, contract: 0, salesOrder: 0,
    salesOrderItem: 0, pricingCondition: 0, purchaseOrder: 0,
    material: 0, warehouseTask: 0, delivery: 0, goodsIssue: 0,
    billingDoc: 0, invoice: 0, serviceOrder: 0, creditMemo: 0,
    returnOrder: 0, accountsReceivable: 0, payment: 0,
    dunningNotice: 0, bankStatement: 0,
  })
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

  // Map node id → its owner ObjKey (colors repeat, so we use nodes not colors)
  const nodeOwner = useMemo(() =>
    new Map<string, ObjKey>(
      nodes.flatMap(n => n.data.owner ? [[n.id, n.data.owner as ObjKey]] : [])
    ), [nodes])

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
      data: { ...node.data, isSelected, metric, highlighted, isActiveEvent: node.id === activeEventId },
      style: opacity !== undefined ? { opacity } : {},
    }
  }), [nodes, objects, selectedObj, metric, eventSliders, sliderHighlight, activeEventId])

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
        const edgeOwner = nodeOwner.get(edge.source) ?? nodeOwner.get(edge.target)
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
  }, [edges, displayNodes, selectedObj, metric, objects, pathSliders, sliderHighlight, nodeOwner])

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
                icon="legend"
                tooltip="Legend"
                style={{ width: 32, height: 32, padding: 0, background: activePanel === 'legend' ? 'var(--sapButton_Selected_Background, #e8f0fe)' : undefined, color: activePanel === 'legend' ? 'var(--sapButton_Selected_TextColor)' : undefined }}
                onClick={() => togglePanel('legend')}
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
                  <div style={{ position: 'relative' }}>
                    <Input
                      placeholder="Search for objects"
                      value={filterText}
                      showClearIcon
                      onInput={(e: any) => { setFilterText((e.target as any).value ?? ''); setFilterSuggestionsOpen(true); setFilterHighlightIdx(-1) }}
                      onFocus={() => {}}
                      onKeyDown={(e: any) => {
                        const suggestions = OBJECT_DEFS.filter(o => o.label.toLowerCase().includes(filterText.toLowerCase()))
                        if (e.key === 'ArrowDown') { e.preventDefault(); setFilterHighlightIdx(i => Math.min(i + 1, suggestions.length - 1)) }
                        else if (e.key === 'ArrowUp') { e.preventDefault(); setFilterHighlightIdx(i => Math.max(i - 1, 0)) }
                        else if (e.key === 'Enter' && filterHighlightIdx >= 0) { setFilterText(suggestions[filterHighlightIdx].label); focusObject(suggestions[filterHighlightIdx].key) }
                        else if (e.key === 'Escape') { setFilterSuggestionsOpen(false); setFilterHighlightIdx(-1) }
                      }}
                      style={{ width: '100%' }}
                      />
                    {filterText && filterSuggestionsOpen && (() => {
                      const suggestions = OBJECT_DEFS.filter(o =>
                        o.label.toLowerCase().includes(filterText.toLowerCase())
                      )
                      return suggestions.length > 0 ? (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                          background: 'var(--sapGroup_ContentBackground)',
                          border: '1px solid var(--sapList_BorderColor)',
                          borderRadius: 4,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                          overflow: 'hidden', marginTop: 0,
                        }}>
                          <div style={{ padding: '8px 12px 4px', fontSize: 12, fontWeight: 700, color: 'var(--sapTextColor)' }}>
                            Objects
                          </div>
                          {suggestions.map((o, i) => (
                            <div key={o.key}
                              onMouseDown={() => { setFilterText(o.label); focusObject(o.key) }}
                              onMouseEnter={() => setFilterHighlightIdx(i)}
                              onMouseLeave={() => setFilterHighlightIdx(-1)}
                              style={{
                                padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                                color: 'var(--sapTextColor)',
                                borderTop: '1px solid var(--sapList_BorderColor)',
                                background: filterHighlightIdx === i ? 'var(--sapList_Hover_Background)' : '',
                              }}
                            >
                              {o.label}
                            </div>
                          ))}
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
                <div className={s.mapPanelBody}>
                  {(() => {
                    const filteredObjects = OBJECT_DEFS.filter(obj => obj.label.toLowerCase().includes(filterText.toLowerCase()))
                    return filterText && filteredObjects.length === 0
                      ? <p className={s.sectionDesc} style={{ padding: '8px 12px' }}>No results found</p>
                      : (
                        <Section title="Objects" badge={filterText ? undefined : `${activeCount}/${OBJECT_DEFS.length}`} forceOpen={!!filterText}>
                          <p className={s.sectionDesc}>
                            Toggle objects on or off to customize your view.
                          </p>
                          {filteredObjects.map(obj => (
                            <div key={obj.key} className={s.objectRow}>
                              <span className={s.objectLabel}>
                                <span className={s.objectDot} style={{ background: obj.color }} />
                                {obj.label}
                              </span>
                              <Switch checked={objects[obj.key]} onChange={() => toggleObj(obj.key)} accessibleName={obj.label} />
                            </div>
                          ))}
                        </Section>
                      )
                  })()}
                  {(() => {
                    const filteredEvents = OBJECT_DEFS.filter(obj => objects[obj.key] && obj.label.toLowerCase().includes(filterText.toLowerCase()))
                    return filterText && filteredEvents.length === 0
                      ? <p className={s.sectionDesc} style={{ padding: '8px 12px' }}>No results found</p>
                      : (
                        <Section title="Events" badge={filterText ? undefined : `${Math.round(Object.values(eventSliders).reduce((a, b) => a + b, 0) / (OBJECT_DEFS.length * 10) * 100)}%`} forceOpen={!!filterText}>
                          <p className={s.sectionDesc}>Add or remove events and paths. Most frequent items appear first.</p>
                          {filteredEvents.map(obj => (
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
                      )
                  })()}
                  {(() => {
                    const q = filterText.toLowerCase()
                    const metricOptions = [
                      { value: 'count'  as const, text: 'Event Occurrences' },
                      { value: 'object' as const, text: 'Object Occurrences' },
                      { value: 'cycle'  as const, text: 'Cycle Time (Average)' },
                    ]
                    const filtered = q ? metricOptions.filter(o => o.text.toLowerCase().includes(q)) : metricOptions
                    if (filtered.length === 0) return null
                    return (
                      <Section title="Metrics">
                        <p className={s.sectionDesc}>View how often events occur or how long they take.</p>
                        {filtered.map(o => (
                          <div key={o.value} className={s.radioRow}>
                            <RadioButton name="metric" text={o.text} checked={metric === o.value} onChange={() => setMetric(o.value)} />
                          </div>
                        ))}
                      </Section>
                    )
                  })()}
                </div>
                <div className={s.learnMore}><Link href="#">Learn More</Link></div>
              </div>
            )}

            {/* Filter panel */}
            {activePanel === 'filter' && (
              <div className={s.mapPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
                {filterView === 'empty' ? (
                  <>
                    <div className={s.mapPanelHeader}>Filter</div>
                    <div className={s.filterEmpty}>
                      <div className={s.filterEmptyIllustration}>
                        <Icon name="filter" style={{ fontSize: 40, color: '#fff' }} />
                      </div>
                      <div className={s.filterEmptyTitle}>No Filters Applied Yet</div>
                      <Button design="Emphasized" onClick={() => setFilterView('create')}>Create New Filter</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={s.mapPanelHeader}>Create Filter</div>
                    <div className={s.mapPanelBody}>
                      <Section title="Object Specific">
                        <p className={s.sectionDesc}>These attributes are different for every object and can only be filtered object specifically.</p>
                        {OBJECT_DEFS.filter(o => objects[o.key]).map(obj => {
                          const isExpanded = expandedFilterObjs.has(obj.key)
                          const objSearch = filterObjSearches[obj.key] ?? ''
                          const attrs = OBJECT_ATTRS[obj.key] ?? []
                          const visibleAttrs = objSearch ? attrs.filter(a => a.label.toLowerCase().includes(objSearch.toLowerCase())) : attrs
                          return (
                            <div key={obj.key}>
                              <div className={s.filterObjRow} onClick={() => toggleFilterObj(obj.key)}>
                                <Icon name={isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ fontSize: '0.7rem', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }} />
                                <span className={s.objectDot} style={{ background: obj.color }} />
                                <span style={{ fontSize: 'var(--sapFontSize)', fontWeight: 600, color: 'var(--sapTextColor)' }}>{obj.label}</span>
                              </div>
                              {isExpanded && (
                                <div className={s.filterObjExpanded}>
                                  <div style={{ marginBottom: '0.5rem' }}>
                                    <Input type="Search" placeholder="Search..." value={objSearch}
                                      onInput={(e: any) => setFilterObjSearches(prev => ({ ...prev, [obj.key]: (e.target as any).value ?? '' }))}
                                      style={{ width: '100%' }} />
                                  </div>
                                  {visibleAttrs.map(attr => (
                                    <div key={attr.label} className={s.filterAttrRow}>
                                      <span className={s.filterTypeIcon}>{attr.icon}</span>
                                      <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{attr.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </Section>
                      <Section title="All Events">
                        <p className={s.sectionDesc}>These attributes are shared across all events of all objects and affect the whole data set.</p>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <Input
                            type="Search"
                            placeholder="Search..."
                            value={filterAttrSearch}
                            onInput={(e: any) => setFilterAttrSearch((e.target as any).value ?? '')}
                            style={{ width: '100%' }}
                          />
                        </div>
                        {([
                          { label: 'Event Name', icon: 'T' },
                          { label: 'Event ID',   icon: '#' },
                          { label: 'End Time',   icon: '⏱' },
                          { label: 'Client',     icon: 'T' },
                        ] as { label: string; icon: string }[])
                          .filter(a => a.label.toLowerCase().includes(filterAttrSearch.toLowerCase()))
                          .map(attr => (
                            <div key={attr.label} className={s.filterAttrRow}>
                              <span className={s.filterTypeIcon}>{attr.icon}</span>
                              <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{attr.label}</span>
                            </div>
                          ))}
                      </Section>
                    </div>
                    <div className={s.filterCreateFooter}>
                      <Link href="#">Learn More</Link>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button design="Emphasized" onClick={() => setFilterView('empty')}>Apply</Button>
                        <Button onClick={() => setFilterView('empty')}>Cancel</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Legend panel */}
            {activePanel === 'legend' && (
              <div className={s.mapPanel} style={{ marginTop: stickyBarVisible ? 40 : 0, transition: 'margin-top 0.15s' }}>
                <div className={s.mapPanelHeader}>Legend</div>
                <div className={s.mapPanelBody} style={{ padding: '0.75rem 1.25rem' }}>
                  {([
                    {
                      label: 'Object',
                      icon: <div style={{ width: 40, height: 20, background: '#758CA4', borderRadius: 10 }} />,
                    },
                    {
                      label: 'Event',
                      icon: <div style={{ width: 40, height: 20, border: '1.5px solid #c0c8d0', borderRadius: 6, background: 'white' }} />,
                    },
                    {
                      label: 'Event Node',
                      icon: <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #758CA4', background: 'white', marginLeft: 11 }} />,
                    },
                    {
                      label: 'Path',
                      icon: (
                        <div style={{ width: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginLeft: 11 }}>
                          <div style={{ width: 2, height: 12, background: '#758CA4' }} />
                          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #788fa6' }} />
                        </div>
                      ),
                    },
                    {
                      label: 'Start/End Path',
                      icon: (
                        <div style={{ width: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginLeft: 11 }}>
                          <div style={{ width: 2, height: 5, borderLeft: '2px dashed #788fa6' }} />
                          <div style={{ width: 2, height: 5, borderLeft: '2px dashed #788fa6' }} />
                          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #788fa6' }} />
                        </div>
                      ),
                    },
                    {
                      label: 'Metric',
                      icon: <span style={{ fontSize: 12, fontWeight: 600, color: '#758CA4', marginLeft: 8, width: 28, textAlign: 'center' }}>10k</span>,
                    },
                    {
                      label: 'End Point',
                      icon: (
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#758CA4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
                          <div style={{ width: 8, height: 8, background: 'white', borderRadius: 2 }} />
                        </div>
                      ),
                    },
                  ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--sapGroup_ContentBorderColor)' }}>
                      <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
                        {icon}
                      </div>
                      <span style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className={s.learnMore}><Link href="#">Learn More</Link></div>
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
                onInit={(rf) => { rfRef.current = rf }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                onNodeClick={(_, node) => {
                  setSliderHighlight(null)
                  if (node.type === 'category') {
                    setActiveEventId(null)
                    const owner = (node.data as unknown as { owner: ObjKey }).owner
                    setSelectedObj(prev => prev === owner ? null : owner)
                  } else if (node.type === 'event') {
                    setActiveEventId(prev => prev === node.id ? null : node.id)
                  }
                }}
                onEdgeClick={(_, edge) => {
                  setSliderHighlight(null)
                  setActiveEventId(null)
                  const owner = nodeOwner.get(edge.source) ?? nodeOwner.get(edge.target)
                  if (owner) setSelectedObj(prev => prev === owner ? null : owner)
                }}
                onPaneClick={() => { setSelectedObj(null); setSliderHighlight(null); setActiveEventId(null) }}
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
