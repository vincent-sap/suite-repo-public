import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Text, Breadcrumbs, BreadcrumbsItem,
  AnalyticalTable, CheckBox, Input, Button, ToolbarItem,
  type AnalyticalTableColumnDefinition,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigDomainObject } from '@signavio/sap-signavio-uixtension'

type ViewType = 'table' | 'grid'

const UNPUBLISHED_MODELS = [
  { id: 'u1',  name: 'Order-to-Cash Process Draft',   type: 'Value Chain',      folder: 'Finance & Accounting',     lastModified: 'Jun 12, 2026', modifiedBy: 'Sebastian Kaim' },
  { id: 'u2',  name: 'HR Onboarding v2 Draft',         type: 'Process Model',    folder: 'Human Resources',          lastModified: 'Jun 5, 2026',  modifiedBy: 'Maria Schmidt'  },
  { id: 'u3',  name: 'Supplier Qualification Review',  type: 'Value Chain',      folder: 'Procurement',              lastModified: 'May 28, 2026', modifiedBy: 'John Carter'    },
  { id: 'u4',  name: 'Customer Journey – Onboarding',  type: 'Customer Journey', folder: 'Sales & Customer Service', lastModified: 'May 20, 2026', modifiedBy: 'Hannah Schwan' },
  { id: 'u5',  name: 'IT Incident Management Draft',   type: 'Process Model',    folder: 'IT & Operations',          lastModified: 'May 15, 2026', modifiedBy: 'Sebastian Kaim' },
  { id: 'u6',  name: 'Budget Approval Workflow v3',    type: 'Process Model',    folder: 'Finance & Accounting',     lastModified: 'May 10, 2026', modifiedBy: 'Maria Schmidt'  },
  { id: 'u7',  name: 'Procurement to Pay Flow',        type: 'Navigation Map',   folder: 'Procurement',              lastModified: 'Apr 30, 2026', modifiedBy: 'John Carter'    },
  { id: 'u8',  name: 'Employee Exit Process',          type: 'Process Model',    folder: 'Human Resources',          lastModified: 'Apr 22, 2026', modifiedBy: 'Hannah Schwan' },
  { id: 'u9',  name: 'Change Management Workflow',     type: 'Process Model',    folder: 'IT & Operations',          lastModified: 'Apr 18, 2026', modifiedBy: 'Sebastian Kaim' },
  { id: 'u10', name: 'Sales Order Processing Draft',   type: 'Process Model',    folder: 'Sales & Customer Service', lastModified: 'Apr 5, 2026',  modifiedBy: 'Maria Schmidt'  },
]

function GridTile({ item, selected, hovered, onSelect, onHover, onLeave }: {
  item: typeof UNPUBLISHED_MODELS[0]
  selected: boolean
  hovered: boolean
  onSelect: () => void
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      style={{
        width: '146px',
        height: '120px',
        position: 'relative',
        borderRadius: '8px',
        border: selected ? '1px solid var(--sapSelectedColor)' : '1px solid transparent',
        background: selected ? 'var(--sapList_SelectionBackgroundColor)' : hovered ? 'var(--sapList_Hover_Background)' : 'var(--sapGroup_ContentBackground)',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      {(hovered || selected) && (
        <div
          style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 4 }}
          onClick={e => { e.stopPropagation(); onSelect() }}
        >
          <CheckBox checked={selected} />
        </div>
      )}
      {(hovered || selected) && (
        <Button
          design="Transparent"
          icon="overflow"
          style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 4, width: '24px', height: '24px', padding: 0 } as React.CSSProperties}
          onClick={e => e.stopPropagation()}
        />
      )}
      <div style={{
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', justifyContent: 'center',
      }}>
        <SigDomainObject size="S" object={item.type as never} />
      </div>
      <div style={{
        position: 'absolute', top: '66px', left: '6px', right: '6px',
        textAlign: 'center', fontSize: 'var(--sapFontSmallSize)', fontWeight: '600',
        color: 'var(--sapTextColor)', overflow: 'hidden', wordBreak: 'break-word', lineHeight: 1.3,
      }}>
        {item.name}
      </div>
      <div style={{
        position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
        fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: '134px', textAlign: 'center',
      }}>
        {item.type}
      </div>
    </div>
  )
}

export default function UnpublishedModelsPage({ onBack, onBackToReporting }: { onBack: () => void; onBackToReporting?: () => void }) {
  const [activeView, setActiveView] = useState<ViewType>('grid')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = UNPUBLISHED_MODELS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.folder.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const allSelected = filtered.length > 0 && filtered.every(m => selectedIds.has(m.id))
  const someSelected = !allSelected && filtered.some(m => selectedIds.has(m.id))
  const toggleAll = () => allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(m => m.id)))

  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Breadcrumbs slot="breadcrumbs">
          {onBackToReporting && <BreadcrumbsItem onClick={onBackToReporting} style={{ cursor: 'pointer' }}>Reporting</BreadcrumbsItem>}
          <BreadcrumbsItem onClick={onBack} style={{ cursor: 'pointer' }}>Process Governance Dashboard</BreadcrumbsItem>
          <BreadcrumbsItem>Not Published</BreadcrumbsItem>
        </Breadcrumbs>
        <Title slot="heading" level="H3">Not Published</Title>
      </DynamicPageTitle>
    }>
      <SigTableWrapper
          viewSwitcher={['table', 'grid']}
          activeView={activeView}
          onActiveViewChange={v => setActiveView(v as ViewType)}
          titleSlot={
            <ToolbarItem overflowPriority="NeverOverflow">
              <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>All ({filtered.length})</Title>
            </ToolbarItem>
          }
          searchSlot={
            <ToolbarItem>
              <Input
                placeholder="Search for name or description"
                value={search}
                onInput={e => setSearch((e.target as EventTarget & { value: string }).value)}
                style={{ width: '260px' }}
              />
            </ToolbarItem>
          }
        >
          {activeView === 'table' && (
            <AnalyticalTable
              data={filtered}
              columns={[
                {
                  Header: '',
                  accessor: '__sel',
                  isResizable: false,
                  width: 48,
                  Cell: ({ row }: { row: { original: typeof UNPUBLISHED_MODELS[0] } }) => (
                    <CheckBox
                      checked={selectedIds.has(row.original.id)}
                      onChange={() => toggleSelect(row.original.id)}
                    />
                  ),
                },
                {
                  Header: 'Name',
                  accessor: 'name',
                  isResizable: true,
                  Cell: ({ row }: { row: { original: typeof UNPUBLISHED_MODELS[0] } }) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <SigDomainObject size="XXS" object={row.original.type as never} />
                      <Text style={{ fontWeight: '500' }}>{row.original.name}</Text>
                    </div>
                  ),
                },
                { Header: 'Type', accessor: 'type', isResizable: true },
                { Header: 'Folder', accessor: 'folder', isResizable: true },
                { Header: 'Last Modified', accessor: 'lastModified', isResizable: true },
                { Header: 'Modified By', accessor: 'modifiedBy', isResizable: true },
              ] as AnalyticalTableColumnDefinition[]}
              onRowClick={e => toggleSelect((e.detail as unknown as { row?: { original?: { id: string } } }).row?.original?.id ?? '')}
              rowHeight={44}
              style={{ width: '100%' }}
            />
          )}

          {activeView === 'grid' && (
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckBox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                <Text style={{ fontSize: 'var(--sapFontSize)' }}>Select All</Text>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 146px)', columnGap: '3px', rowGap: '8px' }}>
                {filtered.map(m => (
                  <GridTile
                    key={m.id}
                    item={m}
                    selected={selectedIds.has(m.id)}
                    hovered={hoveredId === m.id}
                    onSelect={() => toggleSelect(m.id)}
                    onHover={() => setHoveredId(m.id)}
                    onLeave={() => setHoveredId(null)}
                  />
                ))}
              </div>
            </div>
          )}
        </SigTableWrapper>
    </DynamicPage>
  )
}
