import { useMemo } from 'react';
import type { BpmnListItem } from '@/contexts/PCAContext';
import { AnalyticalTable } from '@ui5/webcomponents-react';
import { Icon as UI5Icon } from '@ui5/webcomponents-react/dist/webComponents/Icon/index.js';
import { SigDomainObject, SigChipV2 } from '@signavio/sap-signavio-uixtension';

// @ts-expect-error no type declarations
import processManagerIcon from '@signavio/icons/dist/process-manager';

const SENTINEL_ICONS: Record<string, string> = {
  '$processManager': processManagerIcon,
};
const resolveIcon = (icon?: string) => icon ? (SENTINEL_ICONS[icon] ?? icon) : undefined;

const TEXT = { fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapTextColor, #1d2d3e)' };

interface Props {
  items: BpmnListItem[];
  selectedItem?: BpmnListItem | null;
  onSelect?: (item: BpmnListItem) => void;
}

export function InitiativeTable({ items, selectedItem, onSelect }: Props) {
  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name',
      width: 310,
      Cell: ({ row }: any) => {
        const item: BpmnListItem = row.original;
        const domainObj = (item.domainObjectType as any) ?? 'Initiative';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SigDomainObject object={domainObj} size="XXS" />
            <span style={{ ...TEXT, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </span>
            {item.flagIcon && (
              <UI5Icon name="flag" style={{ color: '#e9730c', width: 14, height: 14, flexShrink: 0 }} />
            )}
          </div>
        );
      },
    },
    {
      Header: 'Description',
      accessor: 'description',
      width: 240,
      Cell: ({ value }: any) => (
        <span style={{ ...TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
          {value}
        </span>
      ),
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'right', width: '100%' }}>Created</span>,
      accessor: 'createdAt',
      width: 110,
      Cell: ({ value }: any) => <span style={{ ...TEXT, display: 'block', textAlign: 'right', width: '100%' }}>{value}</span>,
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'right', width: '100%' }}>Changed</span>,
      accessor: 'changedAt',
      width: 110,
      Cell: ({ value }: any) => <span style={{ ...TEXT, display: 'block', textAlign: 'right', width: '100%' }}>{value}</span>,
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Status</span>,
      accessor: 'status_chip',
      width: 120,
      Cell: ({ row }: any) => {
        const item: BpmnListItem = row.original;
        const chip = item.customChips?.find(c => c.label === 'Status:');
        if (!chip) return null;
        return (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <SigChipV2
              value={chip.value}
              condensed
              {...(chip.design ? { design: chip.design as any } : {})}
              {...(chip.leadingIcon ? { leadingIcon: resolveIcon(chip.leadingIcon) } : {})}
            />
          </div>
        );
      },
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Owner</span>,
      accessor: 'owner_chip',
      width: 170,
      Cell: ({ row }: any) => {
        const item: BpmnListItem = row.original;
        const chip = item.customChips?.find(c => c.label === 'Owner:');
        if (!chip) return null;
        return (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <SigChipV2
              value={chip.value}
              condensed
              {...(chip.avatarInitial ? { avatarInitial: chip.avatarInitial } : {})}
            />
          </div>
        );
      },
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'center', width: '100%' }}>Target Processes</span>,
      accessor: 'target_processes',
      width: 210,
      Cell: ({ row }: any) => {
        const item: BpmnListItem = row.original;
        const chip = item.customChips?.find(c => c.label === 'Target Processes:' || c.label === 'Target Process:');
        if (!chip) return null;
        const plusChip = item.customChips?.find(c => c.label === '+2' || c.value === '+2');
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, width: '100%' }}>
            <SigChipV2
              value={chip.value}
              condensed
              {...(chip.leadingIcon ? { leadingIcon: resolveIcon(chip.leadingIcon) } : {})}
            />
            {plusChip && <SigChipV2 value="+2" condensed />}
          </div>
        );
      },
    },
    {
      Header: () => <span style={{ display: 'block', textAlign: 'right', width: '100%' }}>End Date</span>,
      accessor: 'end_date',
      width: 110,
      Cell: ({ row }: any) => {
        const item: BpmnListItem = row.original;
        const chip = item.customChips?.find(c => c.label === 'End Date:');
        return <span style={{ ...TEXT, display: 'block', textAlign: 'right', width: '100%' }}>{chip?.value ?? '—'}</span>;
      },
    },
  ], []);

  const selectedRowIds = useMemo(() => {
    if (!selectedItem) return {};
    const idx = items.findIndex(i => i.name === selectedItem.name);
    return idx >= 0 ? { [idx]: true } : {};
  }, [selectedItem, items]);

  return (
    <div className="initiative-table" style={{ width: '100%', maxWidth: 1040 }}>
      <AnalyticalTable
        data={items}
        columns={columns}
        visibleRows={items.length}
        minRows={items.length}
        selectionMode="Single"
        selectionBehavior="RowOnly"
        selectedRowIds={selectedRowIds}
        onRowClick={(e) => {
          const row = (e.detail as any)?.row?.original as BpmnListItem | undefined;
          if (row) onSelect?.(row);
        }}
        withRowHighlight={false}
        scaleWidthMode="Smart"
        withNavigationHighlight={false}
        style={{ fontFamily: "'72', sans-serif" }}
      />
    </div>
  );
}
