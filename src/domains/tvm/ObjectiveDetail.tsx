import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  Title, Text, Label, Avatar, Icon, Button, ToggleButton,
  Toolbar, ToolbarButton, ToolbarSeparator, ToolbarSpacer, ToolbarItem,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Dialog, Bar, Input, Select, Option,
  TabContainer, Tab,
  SplitterLayout, SplitterElement,
  Toast, DatePicker,
  Breadcrumbs, BreadcrumbsItem,
} from '@ui5/webcomponents-react'
import {
  SigTableWrapper, SigDomainObject, SigInlineEdit, SigChipV2, SigRightSidePanel,
  SigRichTextEditor,
} from '@signavio/sap-signavio-uixtension'
import { OBJECTIVES, INITIATIVES, STATUS_CHIP_DESIGN, type ItemStatus } from '../../data/ptm'
import { addEntry, getLog } from '../../data/activityLog'
import { useMockSave } from '../../hooks/useMockSave'
import CommentsPanel from '../../shared/components/panels/CommentsPanel'

const STATUS_OPTIONS: ItemStatus[] = ['Planned', 'In Progress', 'On Track', 'At Risk', 'Behind', 'Completed', 'Cancelled']
const MOCK_AUTHOR = { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' }

// ─── Autosave icon ────────────────────────────────────────────────────────────

function SaveIcon({ saveState }: { saveState: string }) {
  if (saveState === 'empty') return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}
      title={saveState === 'saving' ? 'Saving…' : 'Saved'}>
      <Icon
        name={saveState === 'saved' ? 'cloud-check' : 'synchronize'}
        style={{
          fontSize: '1rem',
          color: saveState === 'saved' ? 'var(--sapPositiveColor)' : 'var(--sapContent_LabelColor)',
          animation: saveState === 'saving' ? 'ptm-spin 1s linear infinite' : undefined,
          transition: 'color 0.3s',
        }}
      />
    </span>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ objectId }: { objectId: string }) {
  const entries = getLog(objectId)
  if (entries.length === 0) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          No activity yet
        </Text>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.75rem 0' }}>
      <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
        Today
      </Text>
      {entries.map(e => (
        <div key={e.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
          <div style={{
            width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
            background: 'var(--sapList_BorderColor)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={e.iconType === 'edit' ? 'edit' : 'add'} style={{ fontSize: '0.625rem', color: 'var(--sapContent_LabelColor)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', lineHeight: '1.4' }}>
              <strong>{e.author.name}</strong>
              {' updated the attribute '}
              <em>{e.attribute}</em>
              {' to:'}
            </Text>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSmallSize)' }}>{e.newValue}</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{e.timestamp}</Text>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ObjectiveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { saveState, triggerSave } = useMockSave()

  // Find or redirect
  const obj = OBJECTIVES.find(o => o.id === id)

  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate(n => n + 1)

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [showDescription, setShowDescription] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkSearch, setLinkSearch] = useState('')
  const [showDates, setShowDates] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [activityTick, setActivityTick] = useState(0)

  useEffect(() => {
    if (obj) document.title = `${obj.title} – SAP Signavio`
    else document.title = 'Objectives – SAP Signavio'
  }, [obj?.title])

  if (!obj) {
    return (
      <div style={{ padding: '2rem' }}>
        <Text>Objective not found.</Text>
        <Button design="Transparent" onClick={() => navigate('/objectives')}>← Back to Objectives</Button>
      </div>
    )
  }

  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  const save = (attribute: string, newValue: string, iconType: 'edit' | 'add' = 'edit') => {
    obj.changedOn = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    addEntry(obj.id, MOCK_AUTHOR, attribute, newValue, iconType)
    setActivityTick(n => n + 1)
    triggerSave()
    refresh()
  }

  const linkedInitiatives = INITIATIVES.filter(i => obj.linkedInitiativeIds.includes(i.id))
  const availableToLink = INITIATIVES.filter(i =>
    !obj.linkedInitiativeIds.includes(i.id) &&
    (linkSearch === '' || i.title.toLowerCase().includes(linkSearch.toLowerCase()))
  )

  // ── AnalyticalTable columns for initiatives sub-table ──────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const initiativeColumns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      Header: 'Name',
      accessor: 'title',
      minWidth: 160,
      Cell: ({ value }: any) => <Text style={{ fontWeight: '600' }}>{value}</Text>,
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: ({ value }: any) => (
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          {value ? (value.length > 60 ? value.slice(0, 60) + '…' : value) : '—'}
        </Text>
      ),
    },
    {
      Header: 'Created',
      accessor: 'changedOn',
      width: 110,
      Cell: ({ value }: any) => <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>,
    },
    {
      Header: 'Changed',
      accessor: 'changedOn',
      id: 'changedOnCol',
      width: 110,
      Cell: ({ value }: any) => <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{value}</Text>,
    },
    {
      id: '__ext',
      Header: '',
      accessor: 'id',
      width: 48,
      disableResizing: true,
      disableSortBy: true,
      Cell: ({ value }: any) => (
        <Button
          design="Transparent"
          icon="chain-link"
          tooltip="Open in new tab"
          onClick={e => {
            e.stopPropagation()
            window.open(`${window.location.origin}${window.location.pathname}#/initiatives/${value}`, '_blank')
          }}
        />
      ),
    },
  ], [])

  const panelSize = '400px'

  // ── Attributes panel ───────────────────────────────────────────────────────
  const attributesContent = (
    <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Description */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Description:
        </Label>
        {showDescription ? (
          <div>
            <SigRichTextEditor
              growing
              value={obj.description}
              onChange={(v: string) => {
                obj.description = v
                save('Description', v || '(empty)', 'edit')
                setShowDescription(false)
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            {obj.description ? (
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', flex: 1, lineHeight: '1.5' }}>
                {obj.description}
              </Text>
            ) : (
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontStyle: 'italic', flex: 1 }}>
                No description
              </Text>
            )}
            <Button design="Transparent" icon="edit" tooltip="Edit description" onClick={() => setShowDescription(true)}
              style={{ flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Status:
        </Label>
        <Select
          style={{ width: '100%' }}
          onChange={e => {
            const v = (e.target as unknown as { value: string }).value as ItemStatus
            obj.status = v
            save('Status', v, 'add')
          }}
        >
          {STATUS_OPTIONS.map(s => <Option key={s} value={s} selected={obj.status === s}>{s}</Option>)}
        </Select>
      </div>

      {/* Progress */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Progress:
        </Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Input
            type="Number"
            value={String(obj.progress)}
            onBlur={e => {
              const v = Math.min(100, Math.max(0, Number((e.target as unknown as HTMLInputElement).value) || 0))
              obj.progress = v
              save('Progress', `${v} %`, 'add')
            }}
            style={{ width: '5rem' }}
          />
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>%</Text>
          <Button design="Transparent" icon="sys-cancel" tooltip="Clear progress"
            onClick={() => { obj.progress = 0; save('Progress', '0 %', 'add') }}
            style={{ marginLeft: 'auto' }}
          />
        </div>
      </div>

      {/* Owner */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Owner:
        </Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Avatar initials={obj.owner.initials} colorScheme={obj.owner.colorScheme as never} size="S" accessibleName={obj.owner.name} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>{obj.owner.name}</Text>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
              {obj.owner.id}@acme.com
            </Text>
          </div>
          <Button design="Transparent" icon="group" tooltip="Reassign owner"
            onClick={() => showToast('Reassign owner — coming soon')}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          />
        </div>
      </div>

      {/* Start / End Date */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Start Date, End Date:
        </Label>
        {showDates || obj.startDate || obj.endDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Icon name="appointment-2" style={{ fontSize: '0.875rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            <DatePicker
              value={obj.startDate}
              onChange={e => {
                const v = (e.target as unknown as { value: string }).value
                obj.startDate = v
                if (v) save('Start Date', v, 'add')
              }}
              placeholder="Start date"
              style={{ minWidth: '7rem', flex: 1 }}
            />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>–</Text>
            <DatePicker
              value={obj.endDate}
              onChange={e => {
                const v = (e.target as unknown as { value: string }).value
                obj.endDate = v
                if (v) save('End Date', v, 'add')
              }}
              placeholder="End date"
              style={{ minWidth: '7rem', flex: 1 }}
            />
            <Button design="Transparent" icon="sys-cancel" tooltip="Clear dates"
              onClick={() => { obj.startDate = ''; obj.endDate = ''; setShowDates(false); refresh() }}
            />
          </div>
        ) : (
          <Button design="Transparent" icon="add" onClick={() => setShowDates(true)}>Add dates</Button>
        )}
      </div>

      {/* Initiatives linkage */}
      <div>
        <Label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
          Initiatives:
        </Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {linkedInitiatives.map(init => (
            <div key={init.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
              <SigDomainObject object="Initiative" size="XS" aria-label="Initiative" />
              <Text style={{ flex: 1, fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{init.title}</Text>
              <Button design="Transparent" icon="chain-link" tooltip="Open initiative"
                onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/initiatives/${init.id}`, '_blank')}
                style={{ flexShrink: 0 }}
              />
              <Button design="Transparent" icon="sys-cancel" tooltip="Unlink"
                onClick={() => {
                  obj.linkedInitiativeIds = obj.linkedInitiativeIds.filter(x => x !== init.id)
                  save('Initiatives', linkedInitiatives.filter(i => i.id !== init.id).map(i => i.title).join(', ') || '(none)', 'add')
                }}
                style={{ flexShrink: 0 }}
              />
            </div>
          ))}
          <Button design="Transparent" icon="add" onClick={() => { setLinkSearch(''); setLinkOpen(true) }}>
            Add initiative
          </Button>
        </div>
      </div>

    </div>
  )

  return (
    <>
      {/* Spin animation for autosave icon */}
      <style>{`@keyframes ptm-spin { to { transform: rotate(360deg); } }`}</style>

      <SplitterLayout
        options={{ resetOnSizeChange: true, resetOnChildrenChange: true }}
        style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)' }}
      >
        {/* ── Left: DynamicPage main content ── */}
        <SplitterElement style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <DynamicPage
            style={{ height: '100%', flex: 1 }}
            hidePinButton
            titleArea={
              <DynamicPageTitle
                breadcrumbs={
                  <Breadcrumbs onItemClick={() => navigate('/objectives')}>
                    <BreadcrumbsItem>Objectives</BreadcrumbsItem>
                  </Breadcrumbs>
                }
                heading={
                  <SigInlineEdit
                    text={obj.title}
                    size="H4"
                    wrappingType="Truncate"
                    onFinalValueChange={(v: string) => {
                      if (v.trim()) {
                        obj.title = v.trim()
                        document.title = `${obj.title} – SAP Signavio`
                        save('Name', obj.title, 'edit')
                      }
                    }}
                  />
                }
                snappedHeading={<Title level="H4" slot="snappedHeading">{obj.title}</Title>}
                actionsBar={
                  <Toolbar design="Transparent">
                    <ToolbarSpacer />
                    <SaveIcon saveState={saveState} />
                    <ToolbarSeparator />
                    <ToolbarButton
                      icon="comment"
                      text={String(obj.commentCount)}
                      design="Default"
                      onClick={() => { setCommentsOpen(v => !v); if (!panelOpen) setPanelOpen(true) }}
                      tooltip="Comments"
                    />
                    <ToggleButton
                      icon="SAP-icons-v4/panel-right"
                      pressed={panelOpen}
                      design="Transparent"
                      tooltip={panelOpen ? 'Close panel' : 'Open panel'}
                      onClick={() => { setPanelOpen(v => !v); setCommentsOpen(false) }}
                    />
                    <ToolbarButton
                      icon="overflow"
                      design="Transparent"
                      tooltip="More options"
                      onClick={() => showToast('More options — coming soon')}
                    />
                  </Toolbar>
                }
                subheading={
                  <div slot="subheading" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.5rem' }}>
                    <SigDomainObject object="Target Group" size="L" aria-label="Objective" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>Status</Text>
                      <SigChipV2
                        value={obj.status}
                        design={STATUS_CHIP_DESIGN[obj.status] as never}
                      />
                    </div>
                  </div>
                }
              ></DynamicPageTitle>
            }
          >
            {/* Content: Initiatives sub-section */}
            <div style={{ padding: '1.5rem 2rem 2rem' }}>
              <SigTableWrapper
                titleSlot={
                  <ToolbarItem>
                    <Title level="H5" size="H5">Initiatives ({linkedInitiatives.length})</Title>
                  </ToolbarItem>
                }
              >
                {linkedInitiatives.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No items yet</Text>
                  </div>
                ) : (
                  <AnalyticalTable
                    columns={initiativeColumns}
                    data={linkedInitiatives}
                    selectionMode="None"
                    visibleRows={linkedInitiatives.length}
                    minRows={linkedInitiatives.length}
                    style={{ width: '100%' }}
                    onRowClick={e => {
                      const initId = (e.detail as any)?.row?.original?.id
                      if (initId) navigate('/initiatives/' + initId)
                    }}
                  />
                )}
              </SigTableWrapper>
            </div>
          </DynamicPage>
        </SplitterElement>

        {/* ── Right: attributes/activity OR comments ── */}
        {panelOpen && (commentsOpen ? (
          <SplitterElement size={panelSize} minSize={360} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CommentsPanel
              onClose={() => setCommentsOpen(false)}
            />
          </SplitterElement>
        ) : (
          <SplitterElement size={panelSize} minSize={360} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <SigRightSidePanel
              headerTitle="Objective"
              isOpen
              toggleRightSidePanel={() => navigate('/objectives')}
              useBoldText={false}
              elementBeforeTitle={<SigDomainObject object="Target Group" size="XS" aria-label="Objective" slot="elementBeforeTitle" />}
              wrappingType="Wrap"
              style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
            >
              <TabContainer style={{ height: '100%' }}>
                <Tab text="Attributes" selected>
                  <div style={{ padding: '0 1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
                    {attributesContent}
                  </div>
                </Tab>
                <Tab text="Activity">
                  <div style={{ padding: '0 1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
                    <ActivityFeed key={activityTick} objectId={obj.id} />
                  </div>
                </Tab>
              </TabContainer>
            </SigRightSidePanel>
          </SplitterElement>
        ))}
      </SplitterLayout>

      {/* Link initiative dialog */}
      <Dialog
        open={linkOpen}
        headerText="Link Initiative"
        style={{ width: '520px' }}
        onClose={() => setLinkOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Input
            placeholder="Search initiatives…"
            value={linkSearch}
            showClearIcon
            onInput={e => setLinkSearch((e.target as unknown as HTMLInputElement).value)}
            style={{ width: '100%' }}
          >
            <Icon slot="icon" name="search" />
          </Input>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '260px', overflowY: 'auto' }}>
            {availableToLink.length === 0 ? (
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', padding: '0.5rem 0' }}>
                No available initiatives
              </Text>
            ) : availableToLink.map(init => (
              <div
                key={init.id}
                onClick={() => {
                  obj.linkedInitiativeIds = [...obj.linkedInitiativeIds, init.id]
                  save('Initiatives', [...linkedInitiatives, init].map(i => i.title).join(', '), 'add')
                  setLinkOpen(false)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', borderRadius: 'var(--sapElement_BorderCornerRadius)', border: '1px solid var(--sapList_BorderColor)', background: 'var(--sapList_Background)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--sapList_Background)')}
              >
                <SigDomainObject object="Initiative" size="XS" aria-label="Initiative" />
                <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{init.title}</Text>
              </div>
            ))}
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Transparent" onClick={() => setLinkOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}
