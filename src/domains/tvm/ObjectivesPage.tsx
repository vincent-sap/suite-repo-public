import { useState } from 'react'
import {
  DynamicPage, DynamicPageTitle, Title, Button, Text,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Menu, MenuItem, MenuSeparator, Toast,
  Input, Icon, Toolbar, ToolbarSpacer, ToolbarButton,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { ToolbarItem } from '@ui5/webcomponents-react'
import { OBJECTIVES, getStatusDesign, type Objective } from '../../data/initiativesCentral'

export default function ObjectivesPage() {
  const [search, setSearch] = useState('')
  const [overflowId, setOverflowId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const filtered = OBJECTIVES.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.description.toLowerCase().includes(search.toLowerCase())
  )

  const columns: AnalyticalTableColumnDefinition[] = [
    {
      id: 'name', accessor: 'name', Header: 'Name', minWidth: 280, width: 280,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return (
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--sapLinkColor)', cursor: 'pointer' }}>
            {obj.name}
          </Text>
        )
      },
    },
    {
      id: 'status', accessor: 'status', Header: 'Status', minWidth: 120, width: 120,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <SigChipV2 value={obj.status} design={getStatusDesign(obj.status) as any} condensed />
      },
    },
    {
      id: 'owner', accessor: 'owner', Header: 'Owner', minWidth: 160, width: 160,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <SigChipV2 value={obj.owner} avatarInitial={obj.ownerInitials} condensed />
      },
    },
    {
      id: 'initiatives', accessor: 'initiatives', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Initiatives</div>, minWidth: 90,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)' }}>{obj.initiatives}</Text></div>
      },
    },
    {
      id: 'insights', accessor: 'insights', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Insights</div>, minWidth: 90,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)' }}>{obj.insights}</Text></div>
      },
    },
    {
      id: 'targetDate', accessor: 'targetDate', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Target Date</div>, minWidth: 110,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{obj.targetDate}</Text></div>
      },
    },
    {
      id: 'changedAt', accessor: 'changedAt', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Created</div>, minWidth: 100,
      Cell: ({ row }: any) => {
        const obj = row.original as Objective
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{obj.createdAt}</Text></div>
      },
    },
    {
      id: '__actions', Header: '', accessor: 'id',
      disableSortBy: true, disableFilters: true, disableGroupBy: true,
      minWidth: 44, width: 44,
      Cell: ({ row }: any) => (
        <Button
          id={`obj-overflow-${(row.original as Objective).id}`}
          icon="overflow" design="Transparent"
          tooltip="More options"
          onClick={(e) => { e.stopPropagation(); setOverflowId((row.original as Objective).id) }}
        />
      ),
    },
  ]

  return (
    <>
      <DynamicPage
        style={{ height: '100%' }}
        hidePinButton
        titleArea={
          <DynamicPageTitle>
            <Title slot="heading" level="H3">Objectives</Title>
            <Toolbar slot="actionsBar" design="Transparent">
              <ToolbarSpacer />
              <ToolbarButton design="Emphasized" icon="add">Create Objective</ToolbarButton>
            </Toolbar>
          </DynamicPageTitle>
        }
      >
          <SigTableWrapper
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
                  placeholder="Search objectives"
                  value={search}
                  showClearIcon
                  style={{ width: '240px' }}
                  onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
                  icon={<Icon slot="icon" name="search" />}
                />
              </ToolbarItem>
            }
          >
            <AnalyticalTable
              data={filtered}
              columns={columns}
              selectionMode="None"
              visibleRows={filtered.length}
              minRows={filtered.length || 5}
              style={{ width: '100%' }}
              className="ui5-content-density-compact"
            />
          </SigTableWrapper>
        
      </DynamicPage>

      {overflowId && (
        <Menu
          opener={`obj-overflow-${overflowId}`}
          open
          onClose={() => setOverflowId(null)}
          onItemClick={(e) => {
            const text = (e.detail as { text?: string }).text
            if (text === 'Copy Link') { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setToastMsg('Link copied') }
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
