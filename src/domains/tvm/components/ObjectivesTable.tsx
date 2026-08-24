import {
  AnalyticalTable,
  Avatar,
  Button,
  Icon,
  ProgressIndicator,
  Text,
  Popover,
  List,
  ListItemStandard,
} from '@ui5/webcomponents-react';
import { ThemingParameters } from '@ui5/webcomponents-react-base';
import { SigChipV2 } from '@signavio/sap-signavio-uixtension/sig-chip-v2';
import { SigDomainObject } from '@signavio/sap-signavio-uixtension';
import ButtonDesign from '@ui5/webcomponents/dist/types/ButtonDesign.js';
import '@ui5/webcomponents-icons/dist/navigation-right-arrow.js';
import '@ui5/webcomponents-icons/dist/navigation-down-arrow.js';
import '@ui5/webcomponents-icons/dist/overflow.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/permission.js';
import '@ui5/webcomponents-icons/dist/chain-link.js';
import { useState } from 'react';
import type { Objective, ItemStatus as ObjectiveStatus, PTMOwner as Owner, EntityType } from '@/data/ptm';
import s from './ObjectivesTable.module.css';

interface ObjectivesTableProps {
  objectives: Objective[];
  onObjectiveClick?: (id: string) => void;
}

const getChipDesign = (status: string) => {
  switch (status) {
    case 'Planned':
      return 'none'; // Gray/neutral
    case 'On Track':
      return 'positive'; // Green
    case 'Behind':
      return 'indication3'; // Orange
    case 'At Risk':
      return 'negative'; // Red/Pink
    case 'Completed':
      return 'none'; // Gray/neutral
    case 'Archived':
      return 'indication10'; // Gray
    default:
      return 'none';
  }
};

interface FlattenedObjective extends Objective {
  level: number;
  hasChildren: boolean;
  entityType: EntityType;
}

const getDomainObjectType = (
  entityType?: EntityType,
  level?: number
): 'Business Goal' | 'Initiative' | 'Value Case' => {
  if (entityType) {
    switch (entityType) {
      case 'objective':
        return 'Business Goal';
      case 'initiative':
        return 'Initiative';
      case 'valueCase':
        return 'Value Case';
    }
  }
  // Fallback based on level
  if (level === 0) return 'Business Goal';
  if (level === 1) return 'Initiative';
  return 'Value Case';
};

export const ObjectivesTable = ({ objectives, onObjectiveClick }: ObjectivesTableProps) => {

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Calculate progress for initiatives based on their value cases
  const calculateProgress = (obj: Objective): number => {
    // If this is an initiative with value case children, calculate average
    if (obj.entityType === 'initiative' && obj.children && obj.children.length > 0) {
      const valueCases = obj.children.filter(child => child.entityType === 'valueCase');
      if (valueCases.length > 0) {
        const sum = valueCases.reduce((acc, vc) => acc + vc.progress, 0);
        return Math.round(sum / valueCases.length);
      }
    }
    // Otherwise return the original progress
    return obj.progress;
  };

  // Flatten tree structure for AnalyticalTable
  const flattenObjectives = (objs: Objective[], level = 0): FlattenedObjective[] => {
    const result: FlattenedObjective[] = [];
    objs.forEach((obj) => {
      const calculatedProgress = calculateProgress(obj);
      result.push({
        ...obj,
        progress: calculatedProgress,
        level,
        hasChildren: !!obj.children && obj.children.length > 0,
        entityType: obj.entityType || (level === 0 ? 'objective' : level === 1 ? 'initiative' : 'valueCase'),
      });
      if (obj.children && expandedRows.has(obj.id)) {
        result.push(...flattenObjectives(obj.children, level + 1));
      }
    });
    return result;
  };

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const data = flattenObjectives(objectives);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      Header: 'Name',
      accessor: 'name',
      width: 1070,
      Cell: ({ row }: { row: { original: FlattenedObjective } }) => {
        const { level, hasChildren, id, name, entityType } = row.original;
        const isExpanded = expandedRows.has(id);

        // Padding based on level: 40px (objective), 78px (initiative), 151px (value case)
        const paddingLeft = level === 0 ? 40 : level === 1 ? 78 : 151;

        // Font weight: Regular for all levels
        const fontWeight = 400;
        const fontFamily = '72';

        // Show arrow for objectives and initiatives (level 0 and 1), but not for value cases (level 2)
        const showArrow = level === 0 || level === 1;

        return (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              paddingLeft: `${paddingLeft}px`,
            }}
          >
            {showArrow && (
              <div
                onClick={() => hasChildren && toggleRow(id)}
                style={{
                  cursor: hasChildren ? 'pointer' : 'default',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: hasChildren ? 1 : 0.3,
                }}
              >
                <Icon name={isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'} />
              </div>
            )}
            <SigDomainObject object={getDomainObjectType(entityType, level)} size="XXS" />
            <Button
              design={ButtonDesign.Transparent}
              onClick={() => onObjectiveClick?.(id)}
              style={{
                fontSize: '16px',
                fontFamily,
                fontWeight,
                color: ThemingParameters.sapTextColor,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                textAlign: 'left',
                padding: 0,
                height: 'auto',
              }}
            >
              {name}
            </Button>
          </div>
        );
      },
    },
    {
      Header: 'Progress',
      accessor: 'progress',
      width: 200,
      Cell: ({ value }: { value: number }) => (
        <div style={{ padding: '0 16px', width: '100%' }}>
          <ProgressIndicator value={value} displayValue={`${value}%`} style={{ width: '100%' }} />
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: 160,
      Cell: ({ value, row }: { value: ObjectiveStatus; row: { original: FlattenedObjective } }) => {
        const { entityType } = row.original;
        // Only show status for objectives and initiatives, not value cases
        if (entityType === 'valueCase') {
          return null;
        }
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            <SigChipV2 value={value} condensed={true} design={getChipDesign(value)} />
          </div>
        );
      },
    },
    {
      Header: 'Owner',
      accessor: 'owner',
      width: 140,
      Cell: ({ value, row }: { value: Owner; row: { original: FlattenedObjective } }) => {
        const { entityType } = row.original;
        // Only show owner for objectives and initiatives, not value cases
        if (entityType === 'valueCase') {
          return null;
        }
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            <Avatar size="XS" initials={value.initials} />
          </div>
        );
      },
    },
    {
      Header: 'Changed On',
      accessor: 'lastUpdate',
      width: 177,
      Cell: ({ value }: { value: string }) => (
        <Text
          style={{
            fontSize: '14px',
            color: ThemingParameters.sapContent_LabelColor,
            textAlign: 'right',
            fontFeatureSettings: '"lnum" 1, "tnum" 1',
          }}
        >
          {value}
        </Text>
      ),
    },
    {
      Header: '',
      accessor: 'actions',
      width: 44,
      Cell: ({ row }: { row: { original: FlattenedObjective } }) => {
        const { id, entityType } = row.original;

        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              id={`overflow-${id}`}
              design={ButtonDesign.Transparent}
              icon="overflow"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(id);
              }}
            />
            <Popover
              opener={`overflow-${id}`}
              open={openMenuId === id}
              onClose={() => setOpenMenuId(null)}
              placement="Bottom"
              horizontalAlign="End"
              className="no-padding-popover"
              hideArrow
            >
              <List
                separators="None"
                onItemClick={(e) => {
                  const action = (e.detail.item as HTMLElement).dataset.action;
                  console.log(`Action: ${action} for item ${id}`);
                  setOpenMenuId(null);
                }}
              >
                <ListItemStandard icon="delete" type="Active" data-action="delete">
                  Delete
                </ListItemStandard>
                <ListItemStandard icon="permission" type="Active" data-action="manage-access">
                  Manage Access
                </ListItemStandard>
                {entityType === 'valueCase' && (
                  <ListItemStandard icon="chain-link" type="Active" data-action="remove-link">
                    Remove link
                  </ListItemStandard>
                )}
              </List>
            </Popover>
          </div>
        );
      },
    },
  ];

  return (
    <div className={s.container}>
      <div className={s.tableWrapper}>
        <AnalyticalTable
          columns={columns}
          data={data}
          minRows={5}
          visibleRows={data.length}
          header={null}
          rowHeight={44}
        />
      </div>
    </div>
  );
};
