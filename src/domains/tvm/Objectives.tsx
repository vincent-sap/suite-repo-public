import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRelease } from '../../contexts/ReleaseContext'
import { MvpObjectivesOverview } from './MvpObjectivesOverview'
import {
  DynamicPage, DynamicPageTitle, DynamicPageHeader, Title, Text,
  AnalyticalTable, type AnalyticalTableColumnDefinition,
  Button,
  Toast, MessageBox, IllustratedMessage,
  ToolbarItem, Popover, List, ListItemCustom,
  type PopoverDomRef,
} from '@ui5/webcomponents-react'
import {
  SigTableWrapper, SigFilterBar, SigFilter, StringSelect,
  type FilterValues,
} from '@signavio/sap-signavio-uixtension'
import {
  OBJECTIVES,
  type Objective,
} from '../../data/ptm'


const SORT_OPTIONS = [
  { key: 'Changed On' },
  { key: 'Created On' },
  { key: 'Name (A–Z)' },
]

type Tab = 'all' | 'mine'

export default function Objectives() {
  const { currentRelease } = useRelease()
  return currentRelease === 'R27Q1' ? <ObjectivesTable /> : <MvpObjectivesOverview />
}

function ObjectivesTable() {
  const navigate = useNavigate()
  const location = useLocation()
  const [objectives, setObjectives] = useState<Objective[]>(() => [...OBJECTIVES])
  const [activeTab] = useState<Tab>('all')
  const [filters, setFilters] = useState<FilterValues>({})
  const [sortBy, setSortBy] = useState('Changed On')
  const sortPopoverRef = useRef<PopoverDomRef>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => { setToastMsg(msg); setToastOpen(true) }

  const handleCreateObjective = () => {
    const newObj: Objective = {
      id: `obj-${Date.now()}`,
      title: 'New Objective',
      description: '',
      owner: { id: 'jh', name: 'Josephine Holt', initials: 'JH', colorScheme: 'Accent6' },
      status: 'Planned',
      dueDate: '',
      parentObjectiveId: null,
      linkedInitiativeIds: [],
      createdOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      changedOn: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      commentCount: 0,
      progress: 0,
      startDate: '',
      endDate: '',
    }
    OBJECTIVES.unshift(newObj)
    navigate('/objectives/' + newObj.id)
  }

  useEffect(() => { document.title = 'Objectives – SAP Signavio' }, [])

  // Re-sync from module array whenever this page becomes active (navigation back from detail)
  useEffect(() => {
    setObjectives([...OBJECTIVES])
  }, [location.key])

  const filtered = objectives.filter(obj => {
    const searchVal = filters.search as string | undefined
    if (searchVal && !obj.title.toLowerCase().includes(searchVal.toLowerCase()) &&
        !obj.description.toLowerCase().includes(searchVal.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Name (A–Z)') return a.title.localeCompare(b.title)
    if (sortBy === 'Created On') return a.createdOn.localeCompare(b.createdOn)
    return b.changedOn.localeCompare(a.changedOn)
  })

  const tabFiltered = sorted.filter(obj =>
    activeTab === 'mine' ? obj.owner.id === 'jh' : true
  )

  const handleDeleteConfirm = () => {
    if (deletingId) {
      setObjectives(prev => prev.filter(o => o.id !== deletingId))
      // also remove from module array
      const idx = OBJECTIVES.findIndex(o => o.id === deletingId)
      if (idx !== -1) OBJECTIVES.splice(idx, 1)
      setDeletingId(null)
    }
    setDeleteOpen(false)
    showToast('Deleted')
  }

  const columns = useMemo<AnalyticalTableColumnDefinition[]>(() => [
    {
      Header: 'Name',
      accessor: 'title',
      minWidth: 200,
      Cell: ({ value }: any) => <Text style={{ fontWeight: '600' }}>{value}</Text>,
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: ({ value }: any) => (
        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>{value || '—'}</Text>
      ),
    },
    {
      Header: 'Created',
      accessor: 'createdOn',
      width: 130,
      disableResizing: true,
      Cell: ({ value }: any) => <Text style={{ color: 'var(--sapContent_LabelColor)' }}>{value}</Text>,
    },
    {
      Header: 'Changed',
      accessor: 'changedOn',
      width: 130,
      disableResizing: true,
      Cell: ({ value }: any) => <Text style={{ color: 'var(--sapContent_LabelColor)' }}>{value}</Text>,
    },
    {
      id: '__actions',
      Header: '',
      accessor: 'id',
      width: 60,
      disableResizing: true,
      disableSortBy: true,
      Cell: ({ value }: any) => (
        <Button design="Transparent" icon="overflow" tooltip="More options"
          onClick={e => { e.stopPropagation(); setDeletingId(value); setDeleteOpen(true) }} />
      ),
    },
  ], [])

  return (
    <>
      <div style={{ flex: 1, minHeight: 0, height: '100%', width: '100%', background: 'var(--sapBackgroundColor)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DynamicPage
            style={{ height: '100%', flex: 1 }}
            hidePinButton
            headerPinned
            titleArea={
              <DynamicPageTitle>
                <Title slot="heading" level="H3">Objectives</Title>
                <Title slot="snappedHeading" level="H3">Objectives</Title>
              </DynamicPageTitle>
            }
            headerArea={
              <DynamicPageHeader>
                <SigFilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  defaultFilters={{}}
                  defaultVisibleFilterKeys={['search']}
                >
                  <SigFilter filterKey="search" label="Search">
                    <StringSelect />
                  </SigFilter>
                </SigFilterBar>
              </DynamicPageHeader>
            }
          >
              <SigTableWrapper
                titleSlot={
                  <ToolbarItem>
                    <Title level="H3" size="H5">
                      {activeTab === 'all' ? `All items (${tabFiltered.length})` : `My Objectives (${tabFiltered.length})`}
                    </Title>
                  </ToolbarItem>
                }
                businessActionsSlot={
                  <ToolbarItem>
                    <Button design="Emphasized" icon="add" onClick={handleCreateObjective}>Create Objective</Button>
                  </ToolbarItem>
                }
                sortSlot={
                  <ToolbarItem>
                    <Button
                      id="obj-sort-btn"
                      design="Transparent"
                      icon="sort"
                      tooltip={`Sort by: ${sortBy}`}
                      onClick={() => {
                        if (sortPopoverRef.current) {
                          sortPopoverRef.current.opener = 'obj-sort-btn'
                          sortPopoverRef.current.open = true
                        }
                      }}
                    />
                    <Popover
                      ref={sortPopoverRef}
                      placement="Bottom"
                      horizontalAlign="Start"
                      hideArrow
                      className="no-padding-popover"
                      style={{ width: 'fit-content', minWidth: '200px' }}
                      onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
                    >
                      <List separators="None" selectionMode="Single"
                        onItemClick={e => {
                          const key = (e.detail.item as HTMLElement).dataset.sortKey
                          if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                        }}
                      >
                        {SORT_OPTIONS.map(opt => (
                          <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.key}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px 0 3px', height: '32px' }}>
                              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{opt.key}</Text>
                            </div>
                          </ListItemCustom>
                        ))}
                      </List>
                    </Popover>
                  </ToolbarItem>
                }
              >
                {tabFiltered.length === 0 ? (
                  <IllustratedMessage
                    name="NoFilterResults"
                    titleText="No results found"
                    subtitleText="Try adjusting your filters or creating a new objective."
                  />
                ) : (
                  <AnalyticalTable
                    columns={columns}
                    data={tabFiltered}
                    selectionMode="None"
                    visibleRows={tabFiltered.length}
                    minRows={tabFiltered.length}
                    style={{ width: '100%' }}
                    noDataText="No objectives found"
                    onRowClick={e => {
                      const row = (e.detail as any)?.row?.original as { id: string } | undefined
                      if (row) navigate('/objectives/' + row.id)
                    }}
                  />
                )}
              </SigTableWrapper>
            
          </DynamicPage>
      </div>

      <MessageBox
        open={deleteOpen}
        type="Warning"
        titleText="Delete Objective"
        onClose={(e: any) => {
          if (e.detail?.action === 'OK') handleDeleteConfirm()
          else { setDeleteOpen(false); setDeletingId(null) }
        }}
      >
        Are you sure you want to delete this objective? This action cannot be undone.
      </MessageBox>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} placement="BottomCenter">{toastMsg}</Toast>
    </>
  )
}
