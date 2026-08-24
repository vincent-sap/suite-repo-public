import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { BpmnListItem } from '@/contexts/PCAContext';
import { SigDomainObject } from '@signavio/sap-signavio-uixtension';
import { Button as UI5Button, SegmentedButton, SegmentedButtonItem } from '@ui5/webcomponents-react';
import { Avatar } from '@ui5/webcomponents-react/dist/webComponents/Avatar/index.js';
import { Icon as UI5Icon } from '@ui5/webcomponents-react/dist/webComponents/Icon/index.js';

// @ts-expect-error no type declarations for @signavio/icons
import computerIcon from '@signavio/icons/dist/computer';
// @ts-expect-error no type declarations for @signavio/icons
import groupIcon from '@signavio/icons/dist/group';
// @ts-expect-error no type declarations for @signavio/icons
import riskIcon from '@signavio/icons/dist/risk';
// @ts-expect-error no type declarations for @signavio/icons
import organizationIcon from '@signavio/icons/dist/organization';
// @ts-expect-error no type declarations for @signavio/icons
import zoomFitIcon from '@signavio/icons/dist/zoom-fit';

import '@ui5/webcomponents-icons/dist/full-screen.js';
import '@ui5/webcomponents-icons/dist/exit-full-screen.js';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/less.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import '@ui5/webcomponents-icons/dist/document.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/flag.js';

const AVATAR_ICON_MAP: Record<string, string> = {
  computer: computerIcon,
  group: groupIcon,
  risk: riskIcon,
  organization: organizationIcon,
  'document-text': 'document-text',
  document: 'document',
  employee: 'employee',
};

// Layout constants
const NODE_W = 250;
const NODE_H = 60;
const NODE_GAP = 12;
const CENTER_W = 190;
const COL_GAP = 60;
const PAD = 24;

interface NodeCardProps {
  item: BpmnListItem;
  x: number;
  y: number;
  isCenter?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

function NodeCard({ item, x, y, isCenter, isSelected, onClick }: NodeCardProps) {
  const [hovered, setHovered] = useState(false);
  const domainObj = (item.domainObjectType as any) ?? 'Process Model';
  const typeLabel = item.displayAssetType ?? item.assetType ?? 'BPMN';
  const w = isCenter ? CENTER_W : NODE_W;
  const bgColor = isSelected
    ? '#EBF8FF'
    : item.warningHighlight
    ? 'var(--sapWarningBackground, #fef7e0)'
    : 'var(--sapTile_Background, #fff)';
  const borderColor = isSelected
    ? '#0064d9'
    : item.warningHighlight
    ? 'var(--sapWarningBorderColor, #e9730c)'
    : 'transparent';
  const shadow = isSelected
    ? '0 0 0 0.5px #0064d9, var(--sapContent_Shadow0, 0 2px 8px rgba(0,0,0,0.1))'
    : hovered
    ? 'var(--sapContent_Shadow2, 0 4px 12px rgba(0,0,0,0.12))'
    : 'var(--sapContent_Shadow0, 0 2px 8px rgba(0,0,0,0.08))';

  const renderIcon = () => {
    if (item.avatarColorScheme) {
      const num = item.avatarColorScheme.replace('Accent', '');
      const bg = `var(--sapAvatar_${num}_Background, #d1efff)`;
      const fg = `var(--sapAvatar_${num}_TextColor, #0057d2)`;
      if (item.avatarIcon) {
        return (
          <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: item.avatarShape === 'Square' ? 8 : '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UI5Icon name={AVATAR_ICON_MAP[item.avatarIcon] ?? item.avatarIcon} style={{ width: 16, height: 16, color: fg }} />
          </div>
        );
      }
      return <Avatar colorScheme={item.avatarColorScheme as any} size="S" shape={item.avatarShape ?? 'Circle'} initials={item.name.slice(0, 2).toUpperCase()} />;
    }
    return <SigDomainObject object={domainObj} size="XS" />;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute', left: x, top: y, width: w, height: NODE_H,
        backgroundColor: bgColor,
        border: borderColor !== 'transparent' ? `1px solid ${borderColor}` : 'none',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', cursor: 'pointer',
        boxShadow: shadow,
        transition: 'box-shadow 0.15s',
        gap: 12, userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {renderIcon()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: "'72', sans-serif", fontSize: 13, fontWeight: 700, color: '#1d2d3e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isCenter ? 100 : 165 }}>
              {item.name}
            </span>
            {item.flagIcon && <UI5Icon name="flag" style={{ color: '#e9730c', width: 12, height: 12, flexShrink: 0 }} />}
          </div>
          <span style={{ fontFamily: "'72', sans-serif", fontSize: 11, color: '#556b82', whiteSpace: 'nowrap' }}>{typeLabel}</span>
        </div>
      </div>
      <UI5Icon name="slim-arrow-right" style={{ width: 13, height: 13, color: '#a8b3bd', flexShrink: 0 }} />
    </div>
  );
}

interface Props {
  items: BpmnListItem[];
  onSelectNode?: (item: BpmnListItem | null) => void;
  centerNodeName?: string;
  centerFlagged?: boolean;
  centerWarning?: boolean;
  layout?: 'hops' | 'collision';
}

export function PCAGraphView({ items, onSelectNode, centerNodeName, centerFlagged, centerWarning, layout = 'hops' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [maxHops, setMaxHops] = useState<1 | 2 | 3>(() => {
    if (!items.some(i => i.parentId)) return 3;
    if (items.some(i => i.groupLabel === '3 Hops')) return 3;
    if (items.some(i => i.groupLabel === '2 Hops')) return 2;
    return 1;
  });

  const isHopLayout = layout === 'hops' && items.some(i => i.parentId);

  const totalHops = isHopLayout ? (
    items.some(i => i.groupLabel === '3 Hops') ? 3 :
    items.some(i => i.groupLabel === '2 Hops') ? 2 : 1
  ) as 1 | 2 | 3 : 1;

  const getHops = () => {
    const h1: BpmnListItem[] = [], h2: BpmnListItem[] = [], h3: BpmnListItem[] = [];
    let current = h1;
    items.forEach(item => {
      if (item.groupLabel === '1 Hop') current = h1;
      else if (item.groupLabel === '2 Hops') current = h2;
      else if (item.groupLabel === '3 Hops') current = h3;
      current.push(item);
    });
    return [h1, h2, h3];
  };
  const [hop1, hop2, hop3] = isHopLayout ? getHops() : [items, [], []];

  const centerNode: BpmnListItem = {
    name: centerNodeName ?? (isHopLayout ? 'Order-to-Cash' : 'Purchase-to-Pay'),
    version: '1.0', status: 'Published', processId: 'center',
    description: '', createdAt: '', changedAt: '', folder: '',
    domainObjectType: 'Process Model', assetType: 'BPMN',
    flagIcon: centerFlagged,
    warningHighlight: centerWarning,
  };

  // ── Collision layout ──────────────────────────────────────────────────────
  const isCollision = layout === 'collision';
  const leftItems = isCollision ? items.filter(i => i.collisionSide === 'left') : [];
  const rightItems = isCollision ? items.filter(i => i.collisionSide === 'right') : [];
  const centerItems = isCollision ? items.filter(i => i.collisionSide === 'center') : [];
  const leftInit = leftItems.find(i => !i.parentId);
  const rightInit = rightItems.find(i => !i.parentId);
  const leftChildren = leftItems.filter(i => i.parentId);
  const rightChildren = rightItems.filter(i => i.parentId);

  const COLL_W = NODE_W;
  const COLL_H = NODE_H;
  const COLL_ROW_GAP = NODE_GAP;
  const COLL_COL_GAP = 100;
  const COLL_INDENT = 32;

  const leftColH = leftItems.length * (COLL_H + COLL_ROW_GAP) - COLL_ROW_GAP;
  const rightColH = rightItems.length * (COLL_H + COLL_ROW_GAP) - COLL_ROW_GAP;
  const centerColH = (1 + centerItems.length) * (COLL_H + COLL_ROW_GAP) - COLL_ROW_GAP;
  const maxColH = Math.max(leftColH, rightColH, centerColH, COLL_H);

  const collCanvasH = PAD * 2 + maxColH;
  const collCenterX = PAD + COLL_W + COLL_COL_GAP;
  const collRightX = collCenterX + COLL_W + COLL_COL_GAP;
  const collCanvasW = collRightX + COLL_W + PAD;
  const collTopY = PAD;

  const collPosMap = new Map<string, { x: number; y: number }>();
  if (isCollision) {
    collPosMap.set('center', { x: collCenterX, y: collTopY });
    leftItems.forEach((item, i) => {
      const x = i === 0 ? PAD : PAD + COLL_INDENT;
      collPosMap.set(item.processId, { x, y: collTopY + i * (COLL_H + COLL_ROW_GAP) });
    });
    rightItems.forEach((item, i) => {
      const x = i === 0 ? collRightX : collRightX + COLL_INDENT;
      collPosMap.set(item.processId, { x, y: collTopY + i * (COLL_H + COLL_ROW_GAP) });
    });
    centerItems.forEach((item, i) => {
      collPosMap.set(item.processId, { x: collCenterX + COLL_INDENT, y: collTopY + (i + 1) * (COLL_H + COLL_ROW_GAP) });
    });
  }

  const collEdges: { from: string; to: string; kind: 'cross-left' | 'cross-right' | 'bracket-left' | 'bracket-right' | 'bracket-center' }[] = [];
  if (isCollision) {
    if (leftInit) collEdges.push({ from: leftInit.processId, to: 'center', kind: 'cross-left' });
    if (rightInit) collEdges.push({ from: 'center', to: rightInit.processId, kind: 'cross-right' });
    leftChildren.forEach(c => { if (leftInit) collEdges.push({ from: leftInit.processId, to: c.processId, kind: 'bracket-left' }); });
    rightChildren.forEach(c => { if (rightInit) collEdges.push({ from: rightInit.processId, to: c.processId, kind: 'bracket-right' }); });
    centerItems.forEach(c => collEdges.push({ from: 'center', to: c.processId, kind: 'bracket-center' }));
  }
  // ─────────────────────────────────────────────────────────────────────────

  const visibleHops = isHopLayout
    ? [hop1, maxHops >= 2 ? hop2 : [], maxHops >= 3 ? hop3 : []]
    : [items];

  const col0X = PAD;
  const col1X = col0X + CENTER_W + COL_GAP;
  const col2X = col1X + NODE_W + COL_GAP;
  const col3X = col2X + NODE_W + COL_GAP;
  const colXs = isHopLayout ? [col1X, col2X, col3X] : [col1X];

  const maxRows = Math.max(...visibleHops.map(h => h.length), 1);
  const canvasH = isCollision ? collCanvasH : Math.max(maxRows * (NODE_H + NODE_GAP) + PAD * 2, 460);
  const lastVisibleColX = isHopLayout ? colXs[visibleHops.filter(h => h.length > 0).length - 1] : col1X;
  const canvasW = isCollision ? collCanvasW : (lastVisibleColX + NODE_W + PAD);

  const posMap = isCollision ? collPosMap : (() => {
    const m = new Map<string, { x: number; y: number }>();
    const allHops = [hop1, hop2, hop3];
    allHops.forEach((hop, hi) => {
      const colX = colXs[hi] ?? col1X;
      const totalH = hop.length * (NODE_H + NODE_GAP) - NODE_GAP;
      const startY = canvasH / 2 - totalH / 2;
      hop.forEach((item, i) => {
        m.set(item.processId, { x: colX, y: startY + i * (NODE_H + NODE_GAP) });
      });
    });
    m.set('center', { x: col0X, y: canvasH / 2 - NODE_H / 2 });
    return m;
  })();

  const visibleItems = isCollision ? [...leftItems, ...rightItems, ...centerItems] : visibleHops.flat();
  const visibleIds = new Set(['center', ...visibleItems.map(i => i.processId)]);

  const edges = isCollision ? [] : visibleItems
    .filter(item => {
      const parentId = isHopLayout ? (item.parentId ?? 'center') : 'center';
      return visibleIds.has(parentId);
    })
    .map(item => ({
      from: isHopLayout ? (item.parentId ?? 'center') : 'center',
      to: item.processId,
      flagged: item.flaggedEdge ?? false,
    }));

  const getRightEdge = (id: string) => {
    const pos = posMap.get(id);
    if (!pos) return { x: 0, y: 0 };
    const w = id === 'center' ? CENTER_W : NODE_W;
    return { x: pos.x + w, y: pos.y + NODE_H / 2 };
  };
  const getLeftEdge = (id: string) => {
    const pos = posMap.get(id);
    if (!pos) return { x: 0, y: 0 };
    return { x: pos.x, y: pos.y + NODE_H / 2 };
  };

  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const s = Math.min((cw - PAD * 2) / canvasW, (ch - PAD * 2) / canvasH, 1);
    setScale(s);
    setTranslate({ x: (cw - canvasW * s) / 2, y: (ch - canvasH * s) / 2 });
  }, [canvasW, canvasH]);

  useEffect(() => { fitToView(); }, [fitToView, maxHops]);

  const zoom = (delta: number) => setScale(s => Math.min(3, Math.max(0.2, s + delta)));
  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(f => !f);
    setTimeout(fitToView, 150);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setTranslate({ x: panStart.current.tx + e.clientX - panStart.current.x, y: panStart.current.ty + e.clientY - panStart.current.y });
  }, [isPanning]);
  const onMouseUp = () => setIsPanning(false);
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); zoom(e.deltaY > 0 ? -0.08 : 0.08); };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', maxWidth: 1040, height: 460, border: '1px solid #d9d9d9', borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f6f7', cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
    >
      {/* Zoomable canvas */}
      <div style={{ position: 'absolute', transformOrigin: '0 0', transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, width: canvasW, height: canvasH }}>
        {/* SVG edges */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: canvasW, height: canvasH, overflow: 'visible', pointerEvents: 'none' }}>
          {isCollision ? (() => {
            const paths: React.ReactNode[] = [];

            collEdges.forEach((edge, i) => {
              const fp = posMap.get(edge.from);
              const tp = posMap.get(edge.to);
              if (!fp || !tp) return;
              const fy = fp.y + COLL_H / 2;
              const ty = tp.y + COLL_H / 2;

              if (edge.kind === 'cross-left') {
                paths.push(<path key={`e${i}`} d={`M ${fp.x + COLL_W} ${fy} L ${tp.x} ${fy}`} fill="none" stroke="var(--sapCriticalColor, #e9730c)" strokeWidth={1.5} />);
              } else if (edge.kind === 'cross-right') {
                paths.push(<path key={`e${i}`} d={`M ${fp.x + COLL_W} ${fy} L ${tp.x} ${fy}`} fill="none" stroke="var(--sapCriticalColor, #e9730c)" strokeWidth={1.5} />);
              } else if (edge.kind === 'bracket-left' || edge.kind === 'bracket-right' || edge.kind === 'bracket-center') {
                const x1 = fp.x, y1 = fy;
                const x2 = tp.x, y2 = ty;
                const ctrl = x1 - Math.abs(y2 - y1) * 0.08;
                paths.push(<path key={`e${i}`} d={`M ${x1} ${y1} C ${ctrl} ${y1}, ${ctrl} ${y2}, ${x2} ${y2}`} fill="none" stroke="#c0c8d0" strokeWidth={1.5} />);
              }
            });
            return paths;
          })() : edges.map((edge, i) => {
            const from = getRightEdge(edge.from);
            const to = getLeftEdge(edge.to);
            const mid = from.x + (to.x - from.x) * 0.5;
            return (
              <path key={i} d={`M ${from.x} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`}
                fill="none" stroke={edge.flagged ? '#e9730c' : '#d9d9d9'} strokeWidth={edge.flagged ? 2 : 1.5} />
            );
          })}
        </svg>

        {/* Center node */}
        <div data-node="center">
          <NodeCard item={centerNode} x={isCollision ? collCenterX : col0X} y={isCollision ? collTopY : canvasH / 2 - NODE_H / 2} isCenter={!isCollision} isSelected={selectedItemName === centerNode.name} onClick={() => { setSelectedItemName(centerNode.name); onSelectNode?.(centerNode); }} />
        </div>

        {/* Asset nodes */}
        {visibleItems.map((item, i) => {
          const pos = posMap.get(item.processId);
          if (!pos) return null;
          return (
            <div key={i} data-node={i}>
              <NodeCard
                item={item} x={pos.x} y={pos.y}
                isSelected={selectedItemName === item.name}
                onClick={() => { setSelectedItemName(item.name); onSelectNode?.(item); }}
              />
            </div>
          );
        })}
      </div>

      {/* Hop filter — top left, sticky */}
      {isHopLayout && !isCollision && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, backgroundColor: '#fff', borderRadius: 12, padding: 6, boxShadow: '0 0 1px rgba(34,54,73,0.2), 0 2px 4px rgba(34,54,73,0.15)' }}>
          <SegmentedButton
            style={{ width: 'auto' } as React.CSSProperties}
            onSelectionChange={(e) => {
              const text = (e.detail as any).selectedItems?.[0]?.textContent?.trim();
              if (text === '1 Hop') setMaxHops(1);
              else if (text === '2 Hops') setMaxHops(2);
              else if (text === '3 Hops') setMaxHops(3);
            }}
          >
            <SegmentedButtonItem selected={maxHops === 1}>1 Hop</SegmentedButtonItem>
            <SegmentedButtonItem selected={maxHops === 2}>2 Hops</SegmentedButtonItem>
            {totalHops >= 3 && <SegmentedButtonItem selected={maxHops === 3}>3 Hops</SegmentedButtonItem>}
          </SegmentedButton>
        </div>
      )}

      {/* Toolbar — bottom right, sticky */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10, backgroundColor: '#fff', borderRadius: 12, padding: 6, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 0 1px rgba(34,54,73,0.2), 0 2px 4px rgba(34,54,73,0.15)' }}>
        <UI5Button icon="full-screen" design="Transparent" onClick={toggleFullscreen} />
        <UI5Button icon={zoomFitIcon} design="Transparent" onClick={fitToView} />
        <div style={{ width: 1, height: 20, backgroundColor: '#d9d9d9', margin: '0 2px' }} />
        <UI5Button icon="less" design="Transparent" onClick={() => zoom(-0.15)} />
        <span style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#556b82', minWidth: 36, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
        <UI5Button icon="add" design="Transparent" onClick={() => zoom(0.15)} />
      </div>
    </div>
  );
}
