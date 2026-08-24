import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, Title, Button, Text,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Menu, MenuItem, MenuSeparator, Toast,
  Input, Icon, Toolbar, ToolbarSpacer, ToolbarButton,
  List, ListItemCustom,
} from '@ui5/webcomponents-react'
import { ToolbarItem } from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { INITIATIVES, getStatusDesign, type Initiative } from '../../data/initiativesCentral'

type ViewMode = 'list' | 'table'

export default function InitiativesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [overflowId, setOverflowId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const filtered = INITIATIVES.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase())
  )

  const columns: AnalyticalTableColumnDefinition[] = [
    {
      id: 'name', accessor: 'name', Header: 'Name', minWidth: 260, width: 260,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SigDomainObject object="Initiative" size="XXS" />
            <Text
              style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--sapLinkColor)', cursor: 'pointer' }}
              onClick={() => navigate(`/initiatives/${init.id}`)}
            >
              {init.name}
            </Text>
          </div>
        )
      },
    },
    {
      id: 'status', accessor: 'status', Header: 'Status', minWidth: 110, width: 110,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return <SigChipV2 value={init.status} design={getStatusDesign(init.status) as any} condensed />
      },
    },
    {
      id: 'owner', accessor: 'owner', Header: 'Owner', minWidth: 160, width: 160,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return <SigChipV2 value={init.owner} avatarInitial={init.ownerInitials} condensed />
      },
    },
    {
      id: 'targetProcesses', accessor: 'targetProcesses', Header: 'Target Processes', minWidth: 200,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        const [first, ...rest] = init.targetProcesses
        if (!first) return null
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SigChipV2 value={first} condensed />
            {rest.length > 0 && <SigChipV2 value={`+${rest.length}`} condensed />}
          </div>
        )
      },
    },
    {
      id: 'insights', accessor: 'insights', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Insights</div>, minWidth: 80,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)' }}>{init.insights}</Text></div>
      },
    },
    {
      id: 'endDate', accessor: 'endDate', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>End Date</div>, minWidth: 100,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{init.endDate}</Text></div>
      },
    },
    {
      id: 'changedAt', accessor: 'changedAt', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Changed</div>, minWidth: 100,
      Cell: ({ row }: any) => {
        const init = row.original as Initiative
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{init.changedAt}</Text></div>
      },
    },
    {
      id: '__actions', Header: '', accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      Cell: ({ row }: any) => (
        <Button
          id={`init-overflow-${(row.original as Initiative).id}`}
          icon="overflow" design="Transparent"
          tooltip="More Options"
          onClick={(e) => { e.stopPropagation(); setOverflowId((row.original as Initiative).id) }}
        />
      ),
    },
  ]

  const renderListView = () => (
    <List separators="Inner">
      {filtered.map(init => (
        <ListItemCustom key={init.id} type="Active" onClick={() => navigate(`/initiatives/${init.id}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.25rem 0' }}>
            <SigDomainObject object="Initiative" size="XS" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--sapList_TextColor)' }}>
                {init.name}
              </Text>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {init.description}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <SigChipV2 value={init.status} design={getStatusDesign(init.status) as any} condensed />
              <SigChipV2 value={init.owner} avatarInitial={init.ownerInitials} condensed />
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', minWidth: '80px', textAlign: 'right' }}>
                {init.endDate}
              </Text>
            </div>
          </div>
        </ListItemCustom>
      ))}
    </List>
  )

  return (
    <>
      <DynamicPage
        style={{ height: '100%' }}
        hidePinButton
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Initiatives</Title>
            <Toolbar slot="actionsBar" design="Transparent">
              <ToolbarSpacer />
              <ToolbarButton design="Emphasized" icon="add">Create Initiative</ToolbarButton>
            </Toolbar>
          </DynamicPageTitle>
        }
      >
        <SigTableWrapper
            viewSwitcher={['table', 'list']}
            activeView={viewMode}
            onActiveViewChange={v => setViewMode(v as ViewMode)}
            titleSlot={
              <ToolbarItem>
                <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
                  All ({filtered.length})
                </Title>
              </ToolbarItem>
            }
            searchSlot={
              <ToolbarItem>
                <Input
                  accessibleName="Search"
                  placeholder="Search initiatives"
                  value={search}
                  showClearIcon
                  style={{ width: '240px' }}
                  onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
                  icon={<Icon slot="icon" name="search" />}
                />
              </ToolbarItem>
            }
          >
            {viewMode === 'table' && (
              <AnalyticalTable
                data={filtered}
                columns={columns}
                selectionMode="None"
                visibleRows={filtered.length}
                minRows={filtered.length || 5}
                style={{ width: '100%' }}
                className="ui5-content-density-compact"
                onRowClick={(e) => {
                  const init = (e.detail as any)?.row?.original as Initiative | undefined
                  if (init) navigate(`/initiatives/${init.id}`)
                }}
              />
            )}
            {viewMode === 'list' && renderListView()}
          </SigTableWrapper>
      </DynamicPage>

      {overflowId && (
        <Menu
          opener={`init-overflow-${overflowId}`}
          open
          onClose={() => setOverflowId(null)}
          onItemClick={(e) => {
            const text = (e.detail as { text?: string }).text
            if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setToastMsg('Link copied') }
            if (text === 'Open') navigate(`/initiatives/${overflowId}`)
            setOverflowId(null)
          }}
        >
          <MenuItem text="Open" icon="full-screen" />
          <MenuSeparator />
          <MenuItem text="Edit" icon="edit" />
          <MenuItem text="Copy Link" icon="chain-link" />
          <MenuSeparator />
          <MenuItem text="Delete" icon="delete" />
        </Menu>
      )}

      <Toast open={!!toastMsg} placement="BottomCenter" onClose={() => setToastMsg(null)}>
        {toastMsg}
      </Toast>
    </>
  )
}
