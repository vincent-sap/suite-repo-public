import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle, Title, Button, Text, Label, Avatar,
  FlexibleColumnLayout,
  List, ListItemCustom,
  Input, Icon,
  Toolbar, ToolbarSpacer,
  Select, Option,
  Breadcrumbs, BreadcrumbsItem,
  ObjectPage, ObjectPageTitle, ObjectPageHeader, ObjectPageSection,
} from '@ui5/webcomponents-react'
import { ToolbarItem } from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { INSIGHTS, getStatusDesign, type Insight } from '../../data/initiativesCentral'

export default function InsightsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  useEffect(() => {
    const selected = searchParams.get('selected')
    if (selected) {
      const found = INSIGHTS.find(i => i.id === selected)
      if (found) setSelectedInsight(found)
    }
  }, [searchParams])

  const filtered = INSIGHTS.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const layout = selectedInsight ? 'TwoColumnsMidExpanded' : 'OneColumn'

  const insightsList = (
    <DynamicPage
      style={{ height: '100%' }}
      hidePinButton
      titleArea={
        <DynamicPageTitle>
          <Title slot="heading" level="H3">Insights</Title>
          <Toolbar slot="actionsBar" design="Transparent">
            <ToolbarSpacer />
            <Button design="Emphasized" icon="add">Create Insight</Button>
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
                placeholder="Search insights"
                value={search}
                showClearIcon
                style={{ width: '240px' }}
                onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
                icon={<Icon slot="icon" name="search" />}
              />
            </ToolbarItem>
          }
          sortSlot={
            <ToolbarItem>
              <Select
                accessibleName="Filter by status"
                style={{ minWidth: '140px' }}
                onChange={e => setStatusFilter((e.detail.selectedOption as HTMLElement).dataset.value ?? 'all')}
              >
                <Option data-value="all" selected={statusFilter === 'all'}>All Statuses</Option>
                <Option data-value="Open" selected={statusFilter === 'Open'}>Open</Option>
                <Option data-value="In Progress" selected={statusFilter === 'In Progress'}>In Progress</Option>
                <Option data-value="Resolved" selected={statusFilter === 'Resolved'}>Resolved</Option>
                <Option data-value="Rejected" selected={statusFilter === 'Rejected'}>Rejected</Option>
              </Select>
            </ToolbarItem>
          }
        >
          <List separators="Inner" selectionMode="None">
            {filtered.map(insight => (
              <ListItemCustom
                key={insight.id}
                type="Active"
                onClick={() => setSelectedInsight(prev => prev?.id === insight.id ? null : insight)}
                style={selectedInsight?.id === insight.id ? { background: 'var(--sapList_SelectionBackgroundColor)' } : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', width: '100%', padding: '0.25rem 0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--sapList_TextColor)' }}>
                      {insight.title}
                    </Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {insight.description}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <SigChipV2 value={insight.status} design={getStatusDesign(insight.status) as any} condensed />
                      <SigChipV2 value={insight.type} condensed />
                      {insight.initiative && (
                        <SigChipV2 value={insight.initiative} condensed />
                      )}
                      {insight.assignee && (
                        <SigChipV2 value={insight.assignee} avatarInitial={insight.assigneeInitials} condensed />
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                      {insight.changedAt}
                    </Text>
                    {insight.commentsCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                        <Icon name="comment" style={{ width: '14px', height: '14px', color: 'var(--sapContent_LabelColor)' }} />
                        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{insight.commentsCount}</Text>
                      </div>
                    )}
                  </div>
                </div>
              </ListItemCustom>
            ))}
          </List>
        </SigTableWrapper>
      
    </DynamicPage>
  )

  const insightDetail = selectedInsight ? (
    <ObjectPage
      style={{ height: '100%' }}
      titleArea={
        <ObjectPageTitle
          breadcrumbs={
            <Breadcrumbs>
              <BreadcrumbsItem onClick={() => setSelectedInsight(null)} style={{ cursor: 'pointer' }}>Insights</BreadcrumbsItem>
            </Breadcrumbs>
          }
          header={<Title level="H3">{selectedInsight.title}</Title>}
          subHeader={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <SigChipV2 value={selectedInsight.status} design={getStatusDesign(selectedInsight.status) as any} condensed />
              <SigChipV2 value={selectedInsight.type} condensed />
            </div>
          }
          actionsBar={
            <Toolbar design="Transparent">
              <Button design="Default" icon="edit">Edit</Button>
              <Button design="Transparent" icon="decline" tooltip="Close" onClick={() => setSelectedInsight(null)} />
            </Toolbar>
          }
        />
      }
      headerArea={
        <ObjectPageHeader>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {selectedInsight.assignee && (
              <div>
                <Label>Assignee</Label>
                <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar initials={selectedInsight.assigneeInitials} size="XS" colorScheme="Accent6" />
                  <Text style={{ fontSize: 'var(--sapFontSize)' }}>{selectedInsight.assignee}</Text>
                </div>
              </div>
            )}
            {selectedInsight.initiative && (
              <div>
                <Label>Initiative</Label>
                <div style={{ marginTop: '0.25rem' }}>
                  <Button
                    design="Transparent"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => navigate(`/initiatives/${selectedInsight.initiativeId}`)}
                  >
                    {selectedInsight.initiative}
                  </Button>
                </div>
              </div>
            )}
            {selectedInsight.processName && (
              <div>
                <Label>Process</Label>
                <Text style={{ display: 'block', marginTop: '0.25rem', fontSize: 'var(--sapFontSize)' }}>{selectedInsight.processName}</Text>
              </div>
            )}
            <div>
              <Label>Changed</Label>
              <Text style={{ display: 'block', marginTop: '0.25rem', fontSize: 'var(--sapFontSize)' }}>{selectedInsight.changedAt}</Text>
            </div>
          </div>
        </ObjectPageHeader>
      }
    >
      <ObjectPageSection id="description" titleText="Description">
        <div style={{ padding: '0.5rem 0' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
            {selectedInsight.description}
          </Text>
        </div>
      </ObjectPageSection>

      <ObjectPageSection id="comments" titleText={`Comments (${selectedInsight.commentsCount})`}>
        {selectedInsight.commentsCount === 0 ? (
          <div style={{ padding: '1rem 0' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>No comments yet</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            {Array.from({ length: Math.min(selectedInsight.commentsCount, 3) }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                <Avatar initials={['CW', 'MJ', 'DC'][i % 3]} size="XS" colorScheme="Accent6" style={{ flexShrink: 0 }} />
                <div>
                  <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>
                    {['Claire Westfield', 'Mark Johansson', 'Daniel Chen'][i % 3]}
                  </Text>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                    {['2026-07-10', '2026-07-12', '2026-07-15'][i % 3]}
                  </Text>
                  <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', marginTop: '0.25rem' }}>
                    {['This needs to be prioritized in the next sprint.', 'Agreed — I\'ve already flagged this with the team lead.', 'We should track this as a key risk in the initiative.'][i % 3]}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </ObjectPageSection>
    </ObjectPage>
  ) : undefined

  return (
    <FlexibleColumnLayout
      layout={layout}
      startColumn={insightsList}
      midColumn={insightDetail}
      style={{ height: '100%' }}
    />
  )
}
