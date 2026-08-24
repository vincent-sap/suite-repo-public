// Shared layout primitives for the Process Landscape canvas.
// Constants, palette, and octilinear edge-path math used by every layout
// builder (metro, function columns, and the experimental creative layouts).

// ── Layout constants ──────────────────────────────────────────────────────────
export const L1_LABEL_W      = 240
export const L1_LABEL_H      = 24
export const L1_ROW_H        = 160
export const L2_START_X      = 320
export const L2_SPACING      = 200
export const L3_SPACING      = 140
export const L2_SIZE         = 24
export const L2_PILL_W       = 44   // kept for label centering math
export const L2_PILL_H       = 16   // kept for label offset math
export const L2_DOT_SIZE     = 20   // visual dot diameter (replaces pill for node size)
export const L3_SIZE         = 10
export const L2_NODE_W       = 184  // label box width; < L2_SPACING (200) so labels never overlap
export const L3_NODE_W       = 128  // label box width; < L3_SPACING (140) so labels never overlap
export const GROUP_PAD       = 20   // horizontal padding inside group rectangle on each side
export const GROUP_PAD_Y     = 10   // vertical padding above/below L3 within group rectangle
export const GROUP_LABEL_H   = 28   // height of label bar rendered above the rectangle
export const CANVAS_PAD_TOP  = 80
export const CANVAS_PAD_LEFT = 20

// Parallel-track layout for L3 variants (rendered below the main L3 stop inside
// an expanded group). Variants are positionally bound to their parent stop and
// add no horizontal span — they occupy vertical lanes beneath it.
export const VAR_LANE_FIRST_Y = 40    // Y offset below the L3 stop center to the first variant lane
export const VAR_LANE_H       = 46    // vertical pitch between successive variant lanes
export const VAR_STOP_SZ      = 8     // variant stop circle diameter (filled dot on the variant track)

// Y offset between parallel lines entering/leaving a shared interchange stop.
// Must exceed strokeWidth (10) to prevent visual overlap on parallel approach segments.
export const BUNDLE_SPACING    = 14

// Interchange stop pill size — tall enough to house (n-1)*BUNDLE_SPACING handles.
export const IC_W              = 14
export const IC_H              = 44

// Lane routing (byFunction backward-segment detours above the row spine)
export const LANE_PITCH_MAX    = 22   // max vertical gap between stacked detour lanes
export const LANE_MARGIN       = 12   // clearance kept below the previous row
export const LANE_LABEL_BELOW  = 44   // vertical room a row's node labels occupy below it

// ── Function column constants ─────────────────────────────────────────────────
export const FN_COL_HEADER_H  = 40   // function name header height at top of each column
export const FN_COL_MIN_W     = 120  // minimum column width
export const FN_COL_INNER_PAD = 24   // padding each side of node group within column
export const FN_COL_GAP       = 0    // no gap between adjacent function columns
export const FN_NODE_PITCH    = 130  // X spacing between consecutive nodes within one column
export const FN_ORDERED_IDS: string[] = ['fn-rd','fn-mkt','fn-sales','fn-proc','fn-scm','fn-prod','fn-fin','fn-hr']
export const FN_ORDERED_NAMES: Record<string, string> = {
  'fn-rd': 'R&D', 'fn-mkt': 'Marketing', 'fn-sales': 'Sales',
  'fn-proc': 'Procurement', 'fn-scm': 'Supply Chain',
  'fn-prod': 'Production', 'fn-fin': 'Finance & Controlling', 'fn-hr': 'Human Resources',
}

// Maps rowIdx → SAP Indication color number (for SigChipV2 design prop)
export const LINE_COLOR_INDICES = [6, 3, 2, 8, 1, 4, 5, 7, 9, 10]

export const LINE_COLORS = [
  'var(--sapIndicationColor_6)',
  'var(--sapIndicationColor_3)',
  'var(--sapIndicationColor_2)',
  'var(--sapIndicationColor_8)',
  'var(--sapIndicationColor_1)',
  'var(--sapIndicationColor_4)',
  'var(--sapIndicationColor_5)',
  'var(--sapIndicationColor_7)',
  'var(--sapIndicationColor_9)',
  'var(--sapIndicationColor_10)',
]

export type { DisplayLevel } from '../types'

// ── Edge path helpers ─────────────────────────────────────────────────────────
// Every edge in this canvas is octilinear: each segment is horizontal, vertical,
// or an exact 45° diagonal. The builders below produce a polyline of such
// segments; `roundedPath` renders it with rounded corners.

export type Pt = { x: number; y: number }

// Render a polyline with rounded corners. Consecutive duplicate points are
// dropped so zero-length segments never produce NaN control points.
export function roundedPath(pts: Pt[], r: number): string {
  const p: Pt[] = []
  for (const q of pts) {
    const last = p[p.length - 1]
    if (!last || Math.abs(last.x - q.x) > 0.01 || Math.abs(last.y - q.y) > 0.01) p.push(q)
  }
  if (p.length < 2) return ''
  if (p.length === 2) return `M ${p[0].x} ${p[0].y} L ${p[1].x} ${p[1].y}`
  const cmds = [`M ${p[0].x} ${p[0].y}`]
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1], b = p[i], c = p[i + 1]
    const inLen  = Math.hypot(b.x - a.x, b.y - a.y)
    const outLen = Math.hypot(c.x - b.x, c.y - b.y)
    const rr = Math.min(r, inLen / 2, outLen / 2)
    const inX  = b.x - (b.x - a.x) / inLen  * rr
    const inY  = b.y - (b.y - a.y) / inLen  * rr
    const outX = b.x + (c.x - b.x) / outLen * rr
    const outY = b.y + (c.y - b.y) / outLen * rr
    cmds.push(`L ${inX} ${inY}`, `Q ${b.x} ${b.y} ${outX} ${outY}`)
  }
  const last = p[p.length - 1]
  cmds.push(`L ${last.x} ${last.y}`)
  return cmds.join(' ')
}

// Octilinear polyline from source to target. `axis` is 'h' when both handles are
// horizontal (leave/enter left-right) or 'v' when both are vertical (top-bottom).
// sDir/tDir are +1/-1 along that axis. The middle run is a straight segment plus
// an exact 45° diagonal covering the shorter delta.
export function octilinearPoints(
  sx: number, sy: number, sDir: number,
  tx: number, ty: number, tDir: number,
  axis: 'h' | 'v', stub: number,
): Pt[] {
  if (axis === 'v') {
    // Solve in transposed space (y↔x), then swap back.
    return octilinearPoints(sy, sx, sDir, ty, tx, tDir, 'h', stub)
      .map(p => ({ x: p.y, y: p.x }))
  }
  const p1: Pt = { x: sx + sDir * stub, y: sy }
  const p2: Pt = { x: tx - tDir * stub, y: ty }
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  const adx = Math.abs(dx), ady = Math.abs(dy)
  const sgx = Math.sign(dx), sgy = Math.sign(dy)
  const pts: Pt[] = [{ x: sx, y: sy }, p1]
  if (ady < 0.5) {
    // straight horizontal — nothing extra
  } else if (adx >= ady) {
    pts.push({ x: p2.x - sgx * ady, y: p1.y }) // horizontal run, then 45° into p2
  } else {
    pts.push({ x: p2.x, y: p1.y + sgy * adx }) // 45° out of p1, then vertical into p2
  }
  pts.push(p2, { x: tx, y: ty })
  return pts
}
