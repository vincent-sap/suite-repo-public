import React, { useState } from 'react';
import type { BpmnListItem } from '@/contexts/PCAContext';
import { SigDomainObject } from '@signavio/sap-signavio-uixtension';
import { SigChipV2 } from '@signavio/sap-signavio-uixtension';
import { Button as UI5Button } from '@ui5/webcomponents-react';
import { Avatar } from '@ui5/webcomponents-react/dist/webComponents/Avatar/index.js';
import { Icon as UI5Icon } from '@ui5/webcomponents-react/dist/webComponents/Icon/index.js';

// @ts-expect-error no type declarations
import publishedIcon from '@signavio/icons/dist/published';
// @ts-expect-error no type declarations
import publishedChangedIcon from '@signavio/icons/dist/published-changed';
// @ts-expect-error no type declarations
import computerIcon from '@signavio/icons/dist/computer';
// @ts-expect-error no type declarations
import groupIcon from '@signavio/icons/dist/group';
// @ts-expect-error no type declarations
import riskIcon from '@signavio/icons/dist/risk';
// @ts-expect-error no type declarations
import organizationIcon from '@signavio/icons/dist/organization';
// @ts-expect-error no type declarations
import processManagerIcon from '@signavio/icons/dist/process-manager';

import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js';

const AVATAR_ICON_MAP: Record<string, string> = {
  computer: computerIcon,
  group: groupIcon,
  risk: riskIcon,
  organization: organizationIcon,
  'document-text': 'document-text',
  document: 'document',
  employee: 'employee',
};

const SENTINEL_ICONS: Record<string, string> = {
  '$published': publishedIcon,
  '$publishedChanged': publishedChangedIcon,
  '$processManager': processManagerIcon,
};

function resolveLeadingIcon(icon?: string): string | undefined {
  if (!icon) return undefined;
  return SENTINEL_ICONS[icon] ?? icon;
}

interface ItemRowProps {
  item: BpmnListItem;
  isLevel2?: boolean;
  isSelected?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onSelect: () => void;
  onToggle?: () => void;
}

function ItemRow({ item, isLevel2, isSelected, isExpanded, hasChildren, onSelect, onToggle }: ItemRowProps) {
  const [hovered, setHovered] = useState(false);
  const domainObj = (item.domainObjectType as any) ?? 'Process Model';
  const assetType = item.displayAssetType ?? item.assetType ?? 'BPMN';

  const bgColor = isSelected
    ? 'var(--sapList_SelectionBackgroundColor, #ebf8ff)'
    : hovered
    ? 'var(--sapList_Hover_Background, #eaecee)'
    : 'var(--sapList_Background, #fff)';
  const borderBottom = isSelected
    ? '1px solid var(--sapList_SelectionBorderColor, #0064d9)'
    : '1px solid var(--sapList_BorderColor, #e5e5e5)';

  const renderIcon = () => {
    if (item.avatarColorScheme) {
      const num = item.avatarColorScheme.replace('Accent', '');
      const bg = `var(--sapAvatar_${num}_Background, #d1efff)`;
      const fg = `var(--sapAvatar_${num}_TextColor, #0057d2)`;
      if (item.avatarIcon) {
        return (
          <div style={{ width: 26, height: 26, flexShrink: 0, borderRadius: item.avatarShape === 'Square' ? 8 : '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UI5Icon name={AVATAR_ICON_MAP[item.avatarIcon] ?? item.avatarIcon} style={{ width: 14, height: 14, color: fg }} />
          </div>
        );
      }
      return <Avatar colorScheme={item.avatarColorScheme as any} size="XS" shape={item.avatarShape ?? 'Circle'} initials={item.name.slice(0, 2).toUpperCase()} />;
    }
    return <SigDomainObject object={domainObj} size="XXS" />;
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%',
        padding: '8px 16px',
        paddingLeft: isLevel2 ? 72 : 16,
        backgroundColor: bgColor,
        borderBottom,
        cursor: 'pointer',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {!isLevel2 && (
        <div style={{ flexShrink: 0, width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasChildren && (
            <UI5Button
              design="Transparent"
              icon={isExpanded ? 'slim-arrow-down' : 'slim-arrow-right'}
             
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            />
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
        {renderIcon()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--sapList_TextColor, #1d2d3e)', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {item.customChips && item.customChips.length > 0
              ? item.customChips.map(chip => (
                <SigChipV2
                  key={chip.label + chip.value}
                  label={chip.label}
                  value={chip.value}
                  condensed
                  {...(chip.design ? { design: chip.design as any } : {})}
                  {...(chip.avatarInitial ? { avatarInitial: chip.avatarInitial } : {})}
                  {...(chip.leadingIcon ? { leadingIcon: resolveLeadingIcon(chip.leadingIcon) } : {})}
                />
              ))
              : null
            }
          </div>
        </div>
        {item.description && (
          <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapList_TextColor, #1d2d3e)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.description}
          </p>
        )}
        <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapContent_LabelColor, #556b82)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {assetType}{item.createdAt ? ` · Created ${item.createdAt}` : ''}{item.changedAt ? ` · Changed ${item.changedAt}` : ''}
          {domainObj === 'Process Model' && item.folder ? ` · In ` : ''}
          {domainObj === 'Process Model' && item.folder ? <span style={{ textDecoration: 'underline' }}>{item.folder}</span> : null}
        </p>
      </div>

      <UI5Icon name="slim-arrow-right" style={{ color: 'var(--sapContent_NonInteractiveIconColor, #556b82)', flexShrink: 0, width: 16, height: 16, alignSelf: 'center' }} />
    </div>
  );
}

interface Props {
  items: BpmnListItem[];
  selectedItem: BpmnListItem | null;
  onSelect: (item: BpmnListItem) => void;
}

export function BpmnTreeList({ items, selectedItem, onSelect }: Props) {
  const level1 = items.filter(i => !i.treeParentId);
  const childrenMap = new Map<string, BpmnListItem[]>();
  items.filter(i => i.treeParentId).forEach(i => {
    const arr = childrenMap.get(i.treeParentId!) ?? [];
    arr.push(i);
    childrenMap.set(i.treeParentId!, arr);
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: 1040, overflow: 'hidden' }}>
      {level1.map((item) => {
        const children = childrenMap.get(item.processId) ?? [];
        const isOpen = expanded.has(item.processId);
        return (
          <React.Fragment key={item.processId}>
            <ItemRow
              item={item}
              isSelected={selectedItem?.name === item.name}
              isExpanded={isOpen}
              hasChildren={children.length > 0}
              onSelect={() => onSelect(item)}
              onToggle={() => toggle(item.processId)}
            />
            {isOpen && children.map((child) => (
              <ItemRow
                key={child.processId}
                item={child}
                isLevel2
                isSelected={selectedItem?.name === child.name}
                onSelect={() => onSelect(child)}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
