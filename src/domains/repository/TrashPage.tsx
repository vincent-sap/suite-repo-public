import { useState, useMemo, useCallback } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, AnalyticalTable,
  Text, Button, Menu, MenuItem,
  type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { ToolbarItem } from '@ui5/webcomponents-react'
import type { SelectedAssetInfo } from './AllResources'

interface TrashItem {
  id: string
  name: string
  objectType: string
  typeName: string
  description?: string
  deletedOn: string
  deletedBy: string
  originalLocation: string
  subRows?: TrashItem[]
}

const TRASH_DATA: TrashItem[] = [
  {
    id: 't10', name: 'Credit Management', objectType: 'Value Chain', typeName: 'Value Chain',
    description: 'Lorem ipsum', deletedOn: '06/15/26', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
  },
  {
    id: 't8', name: 'Procurement of Work Equipment', objectType: 'Process Model', typeName: 'BPMN',
    description: 'Lorem ipsum', deletedOn: '05/30/26', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
  },
  {
    id: 't1', name: 'Invoicing', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '05/14/26', deletedBy: 'You', originalLocation: 'Shared Documents',
    subRows: [
      { id: 't1-1', name: 'AP Invoices', objectType: 'Folder', typeName: 'Folder', description: 'Lorem ipsum', deletedOn: '05/14/26', deletedBy: 'You', originalLocation: 'Invoicing' },
      { id: 't1-2', name: 'AR Invoices', objectType: 'Folder', typeName: 'Folder', description: 'Lorem ipsum', deletedOn: '05/14/26', deletedBy: 'You', originalLocation: 'Invoicing' },
    ],
  },
  {
    id: 't9', name: 'Lead-to-Cash End-to-End Journey', objectType: 'Customer Journey', typeName: 'Customer Journey Map',
    description: 'Lorem ipsum', deletedOn: '04/22/26', deletedBy: 'Claire Westfield', originalLocation: 'Name of Parent Folder',
  },
  {
    id: 't4', name: 'Support Processes', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '04/08/26', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
    subRows: [
      { id: 't4-1', name: 'Incident Management', objectType: 'Process Model', typeName: 'BPMN', description: 'Lorem ipsum', deletedOn: '04/08/26', deletedBy: 'You', originalLocation: 'Support Processes' },
      { id: 't4-2', name: 'Change Management', objectType: 'Process Model', typeName: 'BPMN', description: 'Lorem ipsum', deletedOn: '04/08/26', deletedBy: 'Claire Westfield', originalLocation: 'Support Processes' },
    ],
  },
  {
    id: 't7', name: 'Make-to-Order [New Process]', objectType: 'Initiative', typeName: 'Investigation',
    description: 'Lorem ipsum', deletedOn: '03/19/26', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
  },
  {
    id: 't5', name: 'Accounts Receivables', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '02/27/26', deletedBy: 'Claire Westfield', originalLocation: 'Name of Parent Folder',
    subRows: [
      { id: 't5-1', name: 'Collections', objectType: 'Folder', typeName: 'Folder', description: 'Lorem ipsum', deletedOn: '02/27/26', deletedBy: 'Claire Westfield', originalLocation: 'Accounts Receivables' },
    ],
  },
  {
    id: 't2', name: 'Order Fulfillment', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '02/10/26', deletedBy: 'You', originalLocation: 'Shared Documents',
    subRows: [
      { id: 't2-1', name: 'Cash Collection', objectType: 'Folder', typeName: 'Folder', description: 'Lorem ipsum', deletedOn: '02/10/26', deletedBy: 'You', originalLocation: 'Order Fulfillment' },
      { id: 't2-2', name: 'Returns Processing', objectType: 'Process Model', typeName: 'BPMN', description: 'Lorem ipsum', deletedOn: '02/10/26', deletedBy: 'You', originalLocation: 'Order Fulfillment' },
    ],
  },
  {
    id: 't6', name: 'Lead-to-Cash', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '01/15/26', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
    subRows: [
      { id: 't6-1', name: 'Lead Qualification', objectType: 'Process Model', typeName: 'BPMN', description: 'Lorem ipsum', deletedOn: '01/15/26', deletedBy: 'You', originalLocation: 'Lead-to-Cash' },
    ],
  },
  {
    id: 't3', name: 'Shipping', objectType: 'Folder', typeName: 'Folder',
    description: 'Lorem ipsum', deletedOn: '12/03/25', deletedBy: 'You', originalLocation: 'Name of Parent Folder',
    subRows: [
      { id: 't3-1', name: 'Outbound Logistics', objectType: 'Process Model', typeName: 'BPMN', description: 'Lorem ipsum', deletedOn: '12/03/25', deletedBy: 'You', originalLocation: 'Shipping' },
    ],
  },
]


const totalCount = TRASH_DATA.length

export default function TrashPage({ onAssetClick: _onAssetClick }: { onAssetClick?: (asset: SelectedAssetInfo) => void }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openOverflowId, setOpenOverflowId] = useState<string | null>(null)

  const selectionCount = selectedIds.size
  const hasSelection = selectionCount > 0

  const handleRowSelect = useCallback((e: any) => {
    const detail = e?.detail
    if (!detail) return
    const internalSelectedRowIds: Record<string, boolean> = detail.selectedRowIds ?? {}
    const rowsById: Record<string, any> = detail.rowsById ?? {}
    const ids = new Set(
      Object.keys(internalSelectedRowIds)
        .filter(k => internalSelectedRowIds[k])
        .map(k => rowsById[k]?.original?.id)
        .filter(Boolean)
    )
    setSelectedIds(ids)
  }, [])

  const tableHooks = useMemo(() => [
    (hooks: any) => {
      hooks.getRowProps.push((_props: any, { row }: any) => {
        return [_props, row.isSelected ? { 'data-is-selected': '' } : {}]
      })
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  const columns: AnalyticalTableColumnDefinition[] = useMemo(() => [
    {
      id: 'name', accessor: 'name', Header: 'Name', minWidth: 280,
      Cell: ({ row, value }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SigDomainObject object={row.original.objectType} size="XXS" />
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Text>
        </div>
      ),
    },
    {
      id: 'typeName', accessor: 'typeName', Header: 'Type', minWidth: 140,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{value}</Text>,
    },
    {
      id: 'description', accessor: 'description', Header: 'Description', minWidth: 160,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value ?? ''}</Text>,
    },
    {
      id: 'deletedOn', accessor: 'deletedOn', Header: () => <div style={{ width: '100%', textAlign: 'right' }}>Deleted On</div>, minWidth: 100,
      Cell: ({ value }: any) => <div style={{ width: '100%', textAlign: 'right' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{value}</Text></div>,
    },
    {
      id: 'deletedBy', accessor: 'deletedBy', Header: 'Deleted By', minWidth: 120,
      Cell: ({ value }: any) => <Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{value}</Text>,
    },
    {
      id: 'originalLocation', accessor: 'originalLocation', Header: 'Original Location', minWidth: 180,
      Cell: ({ value }: any) => (
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapLink_Color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Text>
      ),
    },
    {
      id: '__actions', accessor: 'id', disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44, Header: '',
      Cell: ({ row }: any) => (
        <Button
          id={`trash-overflow-${row.original.id}`}
          icon="overflow" design="Transparent" tooltip="More Options"
          onClick={(e) => { e.stopPropagation(); setOpenOverflowId(row.original.id) }}
        />
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  return (
    <DynamicPage style={{ height: '100%', flex: 1 }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Title slot="heading" level="H3">Trash</Title>
      </DynamicPageTitle>
    }>
      <SigTableWrapper
          titleSlot={
            <ToolbarItem overflowPriority="NeverOverflow">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {hasSelection ? (
                  <>
                    <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Selected ({selectionCount} of {totalCount})</Title>
                    <Button design="Transparent" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
                  </>
                ) : (
                  <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>All ({totalCount})</Title>
                )}
              </div>
            </ToolbarItem>
          }
          businessActionsSlot={hasSelection ? (
            <>
              <ToolbarItem key="del"><Button design="Transparent" icon="delete">Delete Permanently</Button></ToolbarItem>
              <ToolbarItem key="res"><Button design="Transparent" icon="refresh">Restore</Button></ToolbarItem>
            </>
          ) : undefined}
        >
          <AnalyticalTable
            data={TRASH_DATA}
            columns={columns}
            subRowsKey="subRows"
            isTreeTable
            selectionMode="Multiple"
            onRowSelect={handleRowSelect}
            tableHooks={tableHooks}
            reactTableOptions={{
              autoResetSelectedRows: false,
              autoResetHiddenColumns: false,
            }}
            visibleRows={20}
            minRows={10}
            style={{ width: '100%' }}
          />
        </SigTableWrapper>

      {openOverflowId && (
        <Menu opener={`trash-overflow-${openOverflowId}`} open onClose={() => setOpenOverflowId(null)} onItemClick={() => setOpenOverflowId(null)}>
          <MenuItem text="Delete Permanently" icon="delete" />
          <MenuItem text="Restore" icon="refresh" />
        </Menu>
      )}
    </DynamicPage>
  )
}
