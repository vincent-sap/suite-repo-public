import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ObjectPage, ObjectPageTitle, ObjectPageHeader, ObjectPageSection,
  FlexibleColumnLayout,
  Title, Text, Button, Label, Avatar,
  Toolbar, ToolbarSpacer, ToolbarButton,
  BreadcrumbsItem, Breadcrumbs,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  IllustratedMessage,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { INITIATIVES, INITIATIVE_VALUE_CASES, INSIGHTS, getStatusDesign, type InitiativeValueCase, type Insight } from '../../data/initiativesCentral'

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [columnLayout, setColumnLayout] = useState<'OneColumn' | 'TwoColumnsMidExpanded'>('OneColumn')

  const initiative = INITIATIVES.find(i => i.id === id)

  if (!initiative) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <IllustratedMessage
          name="NoData"
          titleText="Initiative not found"
          subtitleText="The initiative you are looking for does not exist."
        >
          <Button design="Emphasized" onClick={() => navigate('/initiatives')}>Back to Initiatives</Button>
        </IllustratedMessage>
      </div>
    )
  }

  const valueCases = INITIATIVE_VALUE_CASES[initiative.id] ?? []
  const relatedInsights = INSIGHTS.filter(i => i.initiativeId === initiative.id)

  const vcColumns: AnalyticalTableColumnDefinition[] = [
    {
      id: 'name', accessor: 'name', Header: 'Value Case', minWidth: 220,
      Cell: ({ row }: any) => {
        const vc = row.original as InitiativeValueCase
        return <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vc.name}</Text>
      },
    },
    {
      id: 'type', accessor: 'type', Header: 'Type', minWidth: 140,
      Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)' }}>{(row.original as InitiativeValueCase).type}</Text>,
    },
    {
      id: 'status', accessor: 'status', Header: 'Status', minWidth: 110,
      Cell: ({ row }: any) => {
        const vc = row.original as InitiativeValueCase
        const design = vc.status === 'Realized' ? 'indication4' : vc.status === 'In Progress' ? 'indication5' : 'indication10'
        return <SigChipV2 value={vc.status} design={design as any} condensed />
      },
    },
    {
      id: 'estimatedValue', accessor: 'estimatedValue', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Estimated Value</div>, minWidth: 130,
      Cell: ({ row }: any) => <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as InitiativeValueCase).estimatedValue}</Text></div>,
    },
    {
      id: 'actualValue', accessor: 'actualValue', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Actual Value</div>, minWidth: 130,
      Cell: ({ row }: any) => {
        const vc = row.original as InitiativeValueCase
        return <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{vc.actualValue ?? '—'}</Text></div>
      },
    },
    {
      id: 'owner', accessor: 'owner', Header: 'Owner', minWidth: 150,
      Cell: ({ row }: any) => {
        const vc = row.original as InitiativeValueCase
        return <SigChipV2 value={vc.owner} avatarInitial={vc.ownerInitials} condensed />
      },
    },
  ]

  const insightColumns: AnalyticalTableColumnDefinition[] = [
    {
      id: 'title', accessor: 'title', Header: 'Insight', minWidth: 280,
      Cell: ({ row }: any) => {
        const ins = row.original as Insight
        return <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--sapLinkColor)', cursor: 'pointer' }} onClick={() => navigate(`/insights?selected=${ins.id}`)}>{ins.title}</Text>
      },
    },
    {
      id: 'type', accessor: 'type', Header: 'Type', minWidth: 120,
      Cell: ({ row }: any) => <Text style={{ fontSize: 'var(--sapFontSize)' }}>{(row.original as Insight).type}</Text>,
    },
    {
      id: 'status', accessor: 'status', Header: 'Status', minWidth: 110,
      Cell: ({ row }: any) => {
        const ins = row.original as Insight
        return <SigChipV2 value={ins.status} design={getStatusDesign(ins.status) as any} condensed />
      },
    },
    {
      id: 'assignee', accessor: 'assignee', Header: 'Assignee', minWidth: 150,
      Cell: ({ row }: any) => {
        const ins = row.original as Insight
        if (!ins.assignee) return <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>—</Text>
        return <SigChipV2 value={ins.assignee} avatarInitial={ins.assigneeInitials} condensed />
      },
    },
    {
      id: 'changedAt', accessor: 'changedAt', Header: () => <div style={{ textAlign: 'right', width: '100%' }}>Changed</div>, minWidth: 100,
      Cell: ({ row }: any) => <div style={{ textAlign: 'right', width: '100%' }}><Text style={{ fontSize: 'var(--sapFontSize)', whiteSpace: 'nowrap' }}>{(row.original as Insight).changedAt}</Text></div>,
    },
  ]

  const detailContent = (
    <ObjectPage
      style={{ height: '100%' }}
      titleArea={
        <ObjectPageTitle
          breadcrumbs={
            <Breadcrumbs onItemClick={() => navigate('/initiatives')}>
              <BreadcrumbsItem>Initiatives</BreadcrumbsItem>
            </Breadcrumbs>
          }
          header={<Title level="H3">{initiative.name}</Title>}
          subHeader={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <SigChipV2 value={initiative.status} design={getStatusDesign(initiative.status) as any} condensed />
              <SigChipV2 value={initiative.owner} avatarInitial={initiative.ownerInitials} condensed />
              {initiative.targetProcesses.map((p, i) => (
                <SigChipV2 key={i} value={p} condensed />
              ))}
            </div>
          }
          actionsBar={
            <Toolbar design="Transparent">
              <ToolbarButton design="Emphasized" icon="edit">Edit</ToolbarButton>
              <ToolbarButton design="Default" icon="share-2">Share</ToolbarButton>
              <ToolbarSpacer />
              <ToolbarButton
                icon="SAP-icons-v4/panel-right"
                design="Transparent"
                tooltip={columnLayout === 'TwoColumnsMidExpanded' ? 'Close Details' : 'Open Details'}
                onClick={() => setColumnLayout(v => v === 'OneColumn' ? 'TwoColumnsMidExpanded' : 'OneColumn')}
              />
            </Toolbar>
          }
        />
      }
      headerArea={
        <ObjectPageHeader>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <Label>Start Date</Label>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)' }}>{initiative.startDate}</Text>
            </div>
            <div>
              <Label>End Date</Label>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)' }}>{initiative.endDate}</Text>
            </div>
            <div>
              <Label>Insights</Label>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)' }}>{initiative.insights}</Text>
            </div>
            <div>
              <Label>Value Cases</Label>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)' }}>{valueCases.length}</Text>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Label>Description</Label>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{initiative.description}</Text>
            </div>
          </div>
        </ObjectPageHeader>
      }
    >
      {valueCases.length > 0 && (
        <ObjectPageSection id="valueCases" titleText="Value Cases">
          <AnalyticalTable
            data={valueCases}
            columns={vcColumns}
            selectionMode="None"
            visibleRows={valueCases.length}
            minRows={valueCases.length}
            style={{ width: '100%' }}
            className="ui5-content-density-compact"
          />
        </ObjectPageSection>
      )}

      {relatedInsights.length > 0 && (
        <ObjectPageSection id="insights" titleText="Insights">
          <AnalyticalTable
            data={relatedInsights}
            columns={insightColumns}
            selectionMode="None"
            visibleRows={relatedInsights.length}
            minRows={relatedInsights.length}
            style={{ width: '100%' }}
            className="ui5-content-density-compact"
          />
        </ObjectPageSection>
      )}

      {valueCases.length === 0 && relatedInsights.length === 0 && (
        <ObjectPageSection id="empty" titleText="Overview">
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <IllustratedMessage name="NoData" titleText="No data yet" subtitleText="Value cases and insights will appear here once added." />
          </div>
        </ObjectPageSection>
      )}
    </ObjectPage>
  )

  const sidePanelContent = (
    <div style={{ height: '100%', borderLeft: '1px solid var(--sapList_BorderColor)', overflow: 'auto', background: 'var(--sapGroup_ContentBackground)' }}>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Title level="H5">More Details</Title>
          <Button icon="decline" design="Transparent" tooltip="Close" onClick={() => setColumnLayout('OneColumn')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Label>Status</Label>
            <div style={{ marginTop: '0.25rem' }}>
              <SigChipV2 value={initiative.status} design={getStatusDesign(initiative.status) as any} />
            </div>
          </div>
          <div>
            <Label>Owner</Label>
            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar initials={initiative.ownerInitials} size="XS" colorScheme="Accent6" />
              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{initiative.owner}</Text>
            </div>
          </div>
          <div>
            <Label>Target Processes</Label>
            <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {initiative.targetProcesses.map((p, i) => (
                <SigChipV2 key={i} value={p} />
              ))}
            </div>
          </div>
          <div>
            <Label>Start Date</Label>
            <Text style={{ display: 'block', marginTop: '0.25rem', fontSize: 'var(--sapFontSize)' }}>{initiative.startDate}</Text>
          </div>
          <div>
            <Label>End Date</Label>
            <Text style={{ display: 'block', marginTop: '0.25rem', fontSize: 'var(--sapFontSize)' }}>{initiative.endDate}</Text>
          </div>
          <div>
            <Label>Changed</Label>
            <Text style={{ display: 'block', marginTop: '0.25rem', fontSize: 'var(--sapFontSize)' }}>{initiative.changedAt}</Text>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <FlexibleColumnLayout
      layout={columnLayout}
      startColumn={detailContent}
      midColumn={columnLayout !== 'OneColumn' ? sidePanelContent : undefined}
      style={{ height: '100%' }}
    />
  )
}
