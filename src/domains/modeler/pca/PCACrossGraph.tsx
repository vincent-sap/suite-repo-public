import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { BpmnListItem } from '@/contexts/PCAContext';
import { SigDomainObject } from '@signavio/sap-signavio-uixtension';
import { Button as UI5Button } from '@ui5/webcomponents-react';
import { Avatar } from '@ui5/webcomponents-react/dist/webComponents/Avatar/index.js';
import { Icon as UI5Icon } from '@ui5/webcomponents-react/dist/webComponents/Icon/index.js';

// @ts-expect-error no type declarations
import computerIcon from '@signavio/icons/dist/computer';
// @ts-expect-error no type declarations
import groupIcon from '@signavio/icons/dist/group';
// @ts-expect-error no type declarations
import riskIcon from '@signavio/icons/dist/risk';
// @ts-expect-error no type declarations
import organizationIcon from '@signavio/icons/dist/organization';
// @ts-expect-error no type declarations
import zoomFitIcon from '@signavio/icons/dist/zoom-fit';

import '@ui5/webcomponents-icons/dist/full-screen.js';
import '@ui5/webcomponents-icons/dist/exit-full-screen.js';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/less.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-up.js';

const AVATAR_ICON_MAP: Record<string, string> = {
  computer: computerIcon,
  group: groupIcon,
  risk: riskIcon,
  organization: organizationIcon,
  'document-text': 'document-text',
  document: 'document',
  employee: 'employee',
};

// Layout
const NODE_W = 220;
const NODE_H = 56;
const NODE_GAP = 10;
const ARM_GAP = 150;
const CENTER_W = 200;
const CENTER_H = 64;
const PAD = 32;
const ARM_LABEL_H = 28;

const ARM_LABELS: Record<string, string> = {
  top: 'Parent Processes',
  bottom: 'Sub-Processes',
  left: 'Predecessor Processes',
  right: 'Successor Processes',
};

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
  const h = isCenter ? CENTER_H : NODE_H;
  const bgColor = isSelected ? '#EBF8FF' : 'var(--sapTile_Background, #fff)';
  const shadow = isSelected
    ? '0 0 0 0.5px #0064d9, var(--sapContent_Shadow0, 0 2px 8px rgba(0,0,0,0.1))'
    : hovered
    ? 'var(--sapContent_Shadow2, 0 4px 12px rgba(0,0,0,0.12))'
    : 'var(--sapContent_Shadow0, 0 2px 8px rgba(0,0,0,0.08))';
  const borderColor = item.flagIcon ? '#e9730c' : isSelected ? '#0064d9' : 'transparent';
  const borderWidth = item.flagIcon || isSelected ? '0.5px' : '0';

  const renderIcon = () => {
    if (item.avatarColorScheme) {
      const num = item.avatarColorScheme.replace('Accent', '');
      const bg = `var(--sapAvatar_${num}_Background, #d1efff)`;
      const fg = `var(--sapAvatar_${num}_TextColor, #0057d2)`;
      if (item.avatarIcon) {
        return (
          <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: item.avatarShape === 'Square' ? 8 : '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UI5Icon name={AVATAR_ICON_MAP[item.avatarIcon] ?? item.avatarIcon} style={{ width: 14, height: 14, color: fg }} />
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
        position: 'absolute', left: x, top: y, width: w, height: h,
        backgroundColor: bgColor,
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center',
        padding: '0 12px', cursor: 'pointer',
        boxShadow: shadow,
        transition: 'box-shadow 0.15s',
        gap: 10, userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        {renderIcon()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "'72', sans-serif", fontSize: isCenter ? 14 : 12, fontWeight: 700, color: '#1d2d3e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isCenter ? CENTER_W - 56 : NODE_W - 56 }}>
            {item.name}
          </span>
          <span style={{ fontFamily: "'72', sans-serif", fontSize: 11, color: '#556b82', whiteSpace: 'nowrap' }}>{typeLabel}</span>
        </div>
      </div>
      {item.flagIcon && (
        <UI5Icon name="warning" style={{ width: 14, height: 14, color: '#e9730c', flexShrink: 0 }} />
      )}
    </div>
  );
}

interface Props {
  items: BpmnListItem[];
  centerNodeName?: string;
  onSelectNode?: (item: BpmnListItem | null) => void;
}

export function PCACrossGraph({ items, centerNodeName, onSelectNode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  const top = items.filter(i => i.direction === 'top');
  const bottom = items.filter(i => i.direction === 'bottom');
  const left = items.filter(i => i.direction === 'left');
  const right = items.filter(i => i.direction === 'right');

  const leftArmW = left.length > 0 ? NODE_W + ARM_GAP : 0;
  const rightArmW = right.length > 0 ? NODE_W + ARM_GAP : 0;
  const topArmH = top.length > 0 ? top.length * (NODE_H + NODE_GAP) - NODE_GAP + ARM_GAP + ARM_LABEL_H : 0;
  const bottomArmH = bottom.length > 0 ? bottom.length * (NODE_H + NODE_GAP) - NODE_GAP + ARM_GAP + ARM_LABEL_H : 0;

  const canvasW = PAD + leftArmW + CENTER_W + rightArmW + PAD;
  const canvasH = PAD + topArmH + CENTER_H + bottomArmH + PAD;

  const centerX = PAD + leftArmW + (CENTER_W / 2);
  const centerY = PAD + topArmH + (CENTER_H / 2);
  const centerLeft = centerX - CENTER_W / 2;
  const centerTop = centerY - CENTER_H / 2;

  const positionVertical = (arm: BpmnListItem[], direction: 'top' | 'bottom') => {
    const totalW = arm.length * (NODE_W + NODE_GAP) - NODE_GAP;
    const startX = centerX - totalW / 2;
    return arm.map((item, i) => ({
      item,
      x: startX + i * (NODE_W + NODE_GAP),
      y: direction === 'top'
        ? centerTop - ARM_GAP - NODE_H
        : centerTop + CENTER_H + ARM_GAP + ARM_LABEL_H,
    }));
  };

  const positionHorizontal = (arm: BpmnListItem[], direction: 'left' | 'right') => {
    const totalH = arm.length * (NODE_H + NODE_GAP) - NODE_GAP;
    const startY = centerY - totalH / 2;
    return arm.map((item, i) => ({
      item,
      x: direction === 'left'
        ? centerLeft - ARM_GAP - NODE_W
        : centerLeft + CENTER_W + ARM_GAP,
      y: startY + i * (NODE_H + NODE_GAP),
    }));
  };

  const topNodes = positionVertical(top, 'top');
  const bottomNodes = positionVertical(bottom, 'bottom');
  const leftNodes = positionHorizontal(left, 'left');
  const rightNodes = positionHorizontal(right, 'right');

  const allNodes = [...topNodes, ...bottomNodes, ...leftNodes, ...rightNodes];

  const getEdgePoints = (node: { item: BpmnListItem; x: number; y: number }, dir: 'top' | 'bottom' | 'left' | 'right') => {
    const nx = node.x, ny = node.y;
    if (dir === 'top') return {
      from: { x: nx + NODE_W / 2, y: ny + NODE_H },
      to: { x: centerX, y: centerTop },
    };
    if (dir === 'bottom') return {
      from: { x: centerX, y: centerTop + CENTER_H },
      to: { x: nx + NODE_W / 2, y: ny },
    };
    if (dir === 'left') return {
      from: { x: nx + NODE_W, y: ny + NODE_H / 2 },
      to: { x: centerLeft, y: centerY },
    };
    return {
      from: { x: centerLeft + CENTER_W, y: centerY },
      to: { x: nx, y: ny + NODE_H / 2 },
    };
  };

  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const s = Math.min((cw - PAD * 2) / canvasW, (ch - PAD * 2) / canvasH, 1);
    setScale(s);
    setTranslate({ x: (cw - canvasW * s) / 2, y: (ch - canvasH * s) / 2 });
  }, [canvasW, canvasH]);

  useEffect(() => { fitToView(); }, [fitToView]);

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

  const topNodeY = centerTop - ARM_GAP - NODE_H;
  const topLabelY = topNodeY - ARM_LABEL_H;
  const bottomLabelY = centerTop + CENTER_H + ARM_GAP;
  const leftLabelX = centerLeft - ARM_GAP - NODE_W;
  const rightLabelX = centerLeft + CENTER_W + ARM_GAP;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', maxWidth: 1040, height: 500, border: '1px solid #d9d9d9', borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f6f7', cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
    >
      <div style={{ position: 'absolute', transformOrigin: '0 0', transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, width: canvasW, height: canvasH }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: canvasW, height: canvasH, overflow: 'visible', pointerEvents: 'none' }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#a8b3bd" />
            </marker>
          </defs>
          {allNodes.map(({ item, x, y }, i) => {
            const dir = item.direction!;
            const pts = getEdgePoints({ item, x, y }, dir);
            const isV = dir === 'top' || dir === 'bottom';
            const mx = isV ? pts.from.x : (pts.from.x + pts.to.x) / 2;
            const my = isV ? (pts.from.y + pts.to.y) / 2 : pts.from.y;
            return (
              <path
                key={i}
                d={isV
                  ? `M ${pts.from.x} ${pts.from.y} C ${pts.from.x} ${my}, ${pts.to.x} ${my}, ${pts.to.x} ${pts.to.y}`
                  : `M ${pts.from.x} ${pts.from.y} C ${mx} ${pts.from.y}, ${mx} ${pts.to.y}, ${pts.to.x} ${pts.to.y}`
                }
                fill="none" stroke="#c0c8d0" strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
            );
          })}
          {top.length > 0 && (
            <text x={centerX} y={topLabelY + ARM_LABEL_H - 8} textAnchor="middle" style={{ fontFamily: "'72', sans-serif", fontSize: 11, fill: 'var(--sapContent_LabelColor, #556b82)', fontWeight: 400, letterSpacing: 0.3 }}>{ARM_LABELS.top}</text>
          )}
          {bottom.length > 0 && (
            <text x={centerX} y={bottomLabelY + ARM_LABEL_H - 8} textAnchor="middle" style={{ fontFamily: "'72', sans-serif", fontSize: 11, fill: 'var(--sapContent_LabelColor, #556b82)', fontWeight: 400, letterSpacing: 0.3 }}>{ARM_LABELS.bottom}</text>
          )}
          {left.length > 0 && (
            <text x={leftLabelX + NODE_W / 2} y={centerY - (left.length * (NODE_H + NODE_GAP)) / 2 - 6} textAnchor="middle" style={{ fontFamily: "'72', sans-serif", fontSize: 11, fill: 'var(--sapContent_LabelColor, #556b82)', fontWeight: 400, letterSpacing: 0.3 }}>{ARM_LABELS.left}</text>
          )}
          {right.length > 0 && (
            <text x={rightLabelX + NODE_W / 2} y={centerY - (right.length * (NODE_H + NODE_GAP)) / 2 - 6} textAnchor="middle" style={{ fontFamily: "'72', sans-serif", fontSize: 11, fill: 'var(--sapContent_LabelColor, #556b82)', fontWeight: 400, letterSpacing: 0.3 }}>{ARM_LABELS.right}</text>
          )}
        </svg>

        <div data-node="center">
          <NodeCard
            item={{ name: centerNodeName ?? 'Employee Onboarding', version: '2.1', status: 'Published', processId: 'center', description: '', createdAt: '', changedAt: '', folder: '' }}
            x={centerLeft} y={centerTop}
            isCenter
            onClick={() => {}}
          />
        </div>

        {allNodes.map(({ item, x, y }, i) => (
          <div key={i} data-node={i}>
            <NodeCard
              item={item} x={x} y={y}
              isSelected={selectedItemName === item.name}
              onClick={() => { setSelectedItemName(item.name); onSelectNode?.(item); }}
            />
          </div>
        ))}
      </div>

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
