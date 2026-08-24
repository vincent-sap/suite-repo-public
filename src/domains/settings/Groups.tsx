import React, { useCallback, useEffect, useRef, useState, useMemo, type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FlexibleColumnLayout,
  AnalyticalTable,
  Avatar,
  Bar,
  Button,
  CheckBox,
  Dialog,
  Icon,
  Input,
  Label,
  List,
  ListItemCustom,
  ListItemStandard,
  ObjectStatus,
  Popover,
  SegmentedButton,
  SegmentedButtonItem,
  Text,
  Title,
  Toast,
  ToolbarItem,
  type AnalyticalTableColumnDefinition,
  type PopoverDomRef,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import { USERS as USERS_REF, type User as UserRef } from '../../data/users'

// ── Types ────────────────────────────────────────────────────────────────────

type Group = {
  id: string
  name: string
  autoAddNewUsers: boolean
  memberIds: string[]
  colorScheme: string
}

// ── Data ────────────────────────────────────────────────────────────────────

const INITIAL_GROUPS: Group[] = [
  { id: 'g1', name: 'Administrators',    autoAddNewUsers: false, memberIds: ['1', '4', '7', '12'],        colorScheme: 'Accent6' },
  { id: 'g2', name: 'Analysts',          autoAddNewUsers: false, memberIds: ['3','7','8','11','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'], colorScheme: 'Accent3' },
  { id: 'g3', name: 'Human Resources',   autoAddNewUsers: false, memberIds: ['1', '5', '9', '14'],        colorScheme: 'Accent8' },
  { id: 'g4', name: 'Modelers',          autoAddNewUsers: true,  memberIds: ['2', '6', '9', '10', '13'], colorScheme: 'Accent2' },
  { id: 'g5', name: 'Process Owners',    autoAddNewUsers: false, memberIds: ['4', '6', '12', '13'],       colorScheme: 'Accent1' },
  { id: 'g6', name: 'Business Architects', autoAddNewUsers: false, memberIds: ['2', '8', '14'],           colorScheme: 'Accent4' },
  { id: 'g7', name: 'Compliance Officers', autoAddNewUsers: false, memberIds: ['5', '11', '12'],          colorScheme: 'Accent5' },
  { id: 'g8', name: 'External Reviewers', autoAddNewUsers: false, memberIds: ['13', '14'],                colorScheme: 'Accent7' },
  { id: 'g9', name: 'Finance Controllers', autoAddNewUsers: false, memberIds: ['4', '5', '10'],           colorScheme: 'Accent9' },
  { id: 'g10', name: 'IT Operations',    autoAddNewUsers: false, memberIds: ['1', '2', '6'],              colorScheme: 'Accent10' },
  { id: 'g11', name: 'Legal Team',       autoAddNewUsers: false, memberIds: ['7', '9', '11'],             colorScheme: 'Accent1' },
  { id: 'g12', name: 'Process Viewers',  autoAddNewUsers: true,  memberIds: ['3', '5', '8', '10', '14'], colorScheme: 'Accent3' },
]

const ACCENT_COLORS = ['Accent1','Accent2','Accent3','Accent4','Accent5','Accent6','Accent7','Accent8','Accent9','Accent10']

const LS_GROUPS_KEY = 'sig_mockup_groups'

function loadGroups(): Group[] {
  try {
    const raw = localStorage.getItem(LS_GROUPS_KEY)
    if (raw) return JSON.parse(raw) as Group[]
  } catch { /* ignore */ }
  return INITIAL_GROUPS
}

function saveGroups(groups: Group[]) {
  try { localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(groups)) } catch { /* ignore */ }
}

const SORT_OPTIONS = [
  { key: 'Alphabetically', type: 'text'   as const },
  { key: 'Member Count',   type: 'number' as const },
]

function sortDirLabel(type: 'text' | 'number', dir: 'asc' | 'desc'): string {
  if (type === 'number') return dir === 'asc' ? 'Fewest First' : 'Most First'
  return dir === 'asc' ? 'A–Z' : 'Z–A'
}

// ── AddGroupDialog (pre-migration — name only) ────────────────────────────────

function AddGroupDialog({ open, onClose, onCreate }: {
  open: boolean
  onClose: () => void
  onCreate: (data: Omit<Group, 'id' | 'colorScheme'>) => void
}) {
  const [name, setName] = useState('')
  const handleCreate = () => { if (name.trim()) { onCreate({ name: name.trim(), autoAddNewUsers: false, memberIds: [] }); setName('') } }
  const handleClose  = () => { setName(''); onClose() }

  return (
    <Dialog open={open} headerText="Create Group" onClose={handleClose} style={{ width: '380px' }}>
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Label for="new-group-name" showColon>Group Name</Label>
        <Input id="new-group-name" value={name} placeholder="Enter group name" style={{ width: '100%' }} onInput={e => setName((e.target as unknown as HTMLInputElement).value)} />
      </div>
      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Emphasized" disabled={!name.trim()} onClick={handleCreate}>Create Group</Button>
        <Button slot="endContent" design="Transparent" onClick={handleClose}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}

// ── CreateGroupDialog ────────────────────────────────────────────────────────

function CreateGroupDialog({ open, allUsers, onClose, onCreate }: {
  open: boolean
  allUsers: UserRef[]
  onClose: () => void
  onCreate: (data: Omit<Group, 'id' | 'colorScheme'>) => void
}) {
  const [name, setName]           = useState('')
  const [autoAdd, setAutoAdd]     = useState(false)
  const [pending, setPending]     = useState<Set<string>>(new Set())
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setAutoAdd(false)
    setPending(new Set())
    setUserSearch('')
  }, [open])

  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const canCreate = name.trim().length > 0

  return (
    <Dialog
      open={open}
      headerText="Create Group"
      style={{ width: '32rem' }}
      onClose={onClose}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!canCreate} onClick={() => onCreate({ name: name.trim(), autoAddNewUsers: autoAdd, memberIds: Array.from(pending) })}>
                Create Group
              </Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required for="create-group-name">Name</Label>
          <Input
            id="create-group-name"
            placeholder="Group name"
            value={name}
            style={{ width: '100%' }}
            onInput={e => setName((e.target as unknown as HTMLInputElement).value)}
          />
        </div>

        <div>
          <CheckBox
            text="Auto-add new users"
            checked={autoAdd}
            onChange={e => setAutoAdd((e.target as unknown as { checked: boolean }).checked)}
            style={{ marginLeft: '-0.5rem' }}
          />
          <div>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              New users added to this workspace are automatically added to this group.
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Label for="create-group-member-search">
            Members
            <span style={{ color: 'var(--sapContent_LabelColor)', fontWeight: 'normal', marginLeft: '0.25rem' }}>(optional)</span>
          </Label>
          <Input
            id="create-group-member-search"
            placeholder="Search users"
            value={userSearch}
            style={{ width: '100%' }}
            onInput={e => setUserSearch((e.target as unknown as HTMLInputElement).value)}
            icon={<Icon slot="icon" name="search" />}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--sapField_BorderColor)', borderRadius: '0.25rem' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '0.75rem 1rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No users match your search.</Text>
              </div>
            ) : (
              <List
                separators="Inner"
                selectionMode="Multiple"
                onSelectionChange={e => {
                  const ids = e.detail.selectedItems.map(item => item.getAttribute('data-key') as string)
                  setPending(new Set(ids))
                }}
              >
                {filteredUsers.map(u => (
                  <ListItemCustom key={u.id} data-key={u.id} accessibleName={u.name} selected={pending.has(u.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                      <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text>{u.name}</Text>
                        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{u.email}</Text>
                      </div>
                    </div>
                  </ListItemCustom>
                ))}
              </List>
            )}
          </div>
          {pending.size > 0 && (
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              {pending.size} member{pending.size !== 1 ? 's' : ''} selected
            </Text>
          )}
        </div>

      </div>
    </Dialog>
  )
}

// ── GroupDetailPanel ─────────────────────────────────────────────────────────

function GroupDetailPanel({ group, allUsers, allGroups, onClose, onUpdate, onDelete, migrationState }: {
  group: Group
  allUsers: UserRef[]
  allGroups: Group[]
  onClose: () => void
  onUpdate: (updated: Group) => void
  onDelete: (groupId: string) => void
  migrationState: 'pre' | 'post'
}) {
  const [name, setName]         = useState(group.name)
  const [autoAdd, setAutoAdd]   = useState(group.autoAddNewUsers)
  const [memberIds, setMemberIds] = useState(group.memberIds)
  const [dirty, setDirty]       = useState(false)
  const navigate                = useNavigate()

  const addMembersPopoverRef = useRef<PopoverDomRef>(null)
  const addParentPopoverRef  = useRef<PopoverDomRef>(null)
  const addMembersBtnId      = useRef('add-members-btn-' + group.id).current
  const addParentBtnId       = useRef('add-parent-btn-' + group.id).current
  const [pendingMembers, setPendingMembers] = useState<Set<string>>(new Set())
  const [memberSearch, setMemberSearch]     = useState('')
  const [parentGroupIds, setParentGroupIds] = useState<string[]>([])
  const [parentSearch, setParentSearch]     = useState('')
  const [editingName, setEditingName]       = useState(false)
  const [deleteOpen, setDeleteOpen]         = useState(false)
  const [saveToastOpen, setSaveToastOpen]   = useState(false)
  const [memberFilter, setMemberFilter]     = useState('')

  // Reset when switching groups
  useEffect(() => {
    setName(group.name)
    setAutoAdd(group.autoAddNewUsers)
    setMemberIds(group.memberIds)
    setParentGroupIds([])
    setEditingName(false)
    setDirty(false)
    setMemberFilter('')
  }, [group.id])

  const members      = allUsers.filter(u => memberIds.includes(u.id))
  const nonMembers   = allUsers.filter(u => !memberIds.includes(u.id))
  const filteredMembers = members.filter(u => {
    const q = memberFilter.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })
  const parentGroups = allGroups.filter(g => parentGroupIds.includes(g.id))
  const availableParentGroups = allGroups.filter(g => g.id !== group.id && !parentGroupIds.includes(g.id) && (!parentSearch || g.name.toLowerCase().includes(parentSearch.toLowerCase())))

  const handleRemoveMember = (userId: string) => {
    const updated = memberIds.filter(id => id !== userId)
    setMemberIds(updated)
    if (migrationState === 'pre') {
      onUpdate({ ...group, memberIds: updated })
      setSaveToastOpen(true)
    } else {
      setDirty(true)
    }
  }

  const memberColumns: AnalyticalTableColumnDefinition[] = useMemo(() => {
    const cols: AnalyticalTableColumnDefinition[] = [
      {
        id: 'member',
        accessor: 'name',
        Header: '',
        Cell: ({ row }: any) => {
          const u = row.original as { id: string; name: string; email: string; initials: string; colorScheme: string }
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</Text>
              </div>
            </div>
          )
        },
      },
    ]
    if (migrationState === 'pre') {
      cols.push({
        id: 'action',
        accessor: 'id',
        Header: '',
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        disableResizing: true,
        Cell: ({ row }: any) => {
          const u = row.original as { id: string; name: string }
          return (
            <Button
              design="Transparent"
              icon="decline"
              accessibleName={`Remove ${u.name}`}
              onClick={e => { e.stopPropagation(); handleRemoveMember(u.id) }}
            />
          )
        },
      })
    }
    return cols
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [migrationState, filteredMembers])

  const filteredNonMembers = nonMembers.filter(u => {
    const q = memberSearch.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const handleSave = () => {
    const updated = { ...group, name: name.trim(), autoAddNewUsers: autoAdd, memberIds }
    onUpdate(updated)
    setDirty(false)
    setSaveToastOpen(true)
  }

  const handleDiscard = () => {
    setName(group.name)
    setAutoAdd(group.autoAddNewUsers)
    setMemberIds(group.memberIds)
    setDirty(false)
  }

  const handleAddMembers = () => {
    const next = [...new Set([...memberIds, ...Array.from(pendingMembers)])]
    setMemberIds(next)
    if (migrationState === 'pre') {
      onUpdate({ ...group, memberIds: next })
      setSaveToastOpen(true)
    } else {
      setDirty(true)
    }
    if (addMembersPopoverRef.current) addMembersPopoverRef.current.open = false
  }

  const handleDelete = () => {
    onDelete(group.id)
    setDeleteOpen(false)
    onClose()
  }

  const headerActions: FunctionComponent[] = [
    () => migrationState === 'pre' ? (
      <>
        <Button design="Transparent" onClick={() => setEditingName(v => !v)}>Edit Group Name</Button>
        <Button design="Negative" onClick={() => setDeleteOpen(true)}>Delete Group</Button>
      </>
    ) : (
      <Button design="Transparent" icon="action-external-link" tooltip="Edit Group in SCI" onClick={() => window.open('https://as5u4itfg.accounts400.ondemand.com/saml2/idp/sso?sp=oac.accounts.sap.com&RelayState=https%3A%2F%2Fas5u4itfg.accounts400.ondemand.com%2Fadmin%2F', '_blank')}>
        Edit Group in SCI
      </Button>
    )
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SigRightSidePanel
        headerTitle={group.name}
        isOpen={true}
        toggleRightSidePanel={onClose}
        contentActionsSlot={headerActions}
        elementBeforeTitle={undefined}

        wrappingType="Wrap"
        footerArea={dirty ? (
          <Bar design="FloatingFooter">
            <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
            <Button slot="endContent" onClick={handleDiscard}>Discard Changes</Button>
          </Bar>
        ) : undefined}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
      >
        {/* ── Inline name edit (pre-migration) ── */}
        {migrationState === 'pre' && editingName && (
          <div style={{ paddingBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Input
              value={name}
              style={{ flex: 1 }}
              onInput={e => setName((e.target as unknown as HTMLInputElement).value)}
            />
            <Button design="Emphasized" onClick={() => { onUpdate({ ...group, name: name.trim(), autoAddNewUsers: autoAdd, memberIds }); setEditingName(false); setSaveToastOpen(true) }}>Save</Button>
            <Button design="Transparent" onClick={() => { setName(group.name); setEditingName(false) }}>Cancel</Button>
          </div>
        )}

        {/* ── Permissions ── */}
        <div style={{ paddingBottom: '1.5rem' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', display: 'block', marginBottom: '0.5rem' }}>
            Permissions
          </Text>
          <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
            <List separators="Inner">
              <ListItemCustom type="Active" onClick={() => navigate(`/feature-access?group=${encodeURIComponent(group.name)}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <Icon name="action-settings" />
                  <Text style={{ flex: 1, fontSize: 'var(--sapFontSize)' }}>Feature Access</Text>
                  <Icon name="SAP-icons-v4/link" />
                </div>
              </ListItemCustom>
              <ListItemCustom type="Active" onClick={() => navigate(`/resource-access?group=${encodeURIComponent(group.name)}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <Icon name="folder" />
                  <Text style={{ flex: 1, fontSize: 'var(--sapFontSize)' }}>Resource Access</Text>
                  <Icon name="SAP-icons-v4/link" />
                </div>
              </ListItemCustom>
            </List>
          </div>
        </div>

        {/* ── Auto-add toggle ── */}
        <div style={{ paddingBottom: '1.5rem' }}>
          <div>
            <CheckBox
              style={{ marginLeft: '-0.5rem' }}
              text="Add new users to this group automatically"
              checked={autoAdd}
              onChange={e => {
                const val = (e.target as unknown as { checked: boolean }).checked
                setAutoAdd(val)
                if (migrationState === 'pre') {
                  onUpdate({ ...group, name: name.trim(), autoAddNewUsers: val, memberIds })
                  setSaveToastOpen(true)
                } else {
                  setDirty(true)
                }
              }}
            />
            <div style={{ marginTop: '0.125rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                New users will be automatically added to this group, inheriting group permissions.
              </Text>
            </div>
          </div>
        </div>

        {/* ── Parent Groups (pre-migration only) ── */}
        {migrationState === 'pre' && (
          <div style={{ paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
                Parent Groups
              </Text>
              <Button id={addParentBtnId} design="Transparent" icon="add" onClick={() => { setParentSearch(''); if (addParentPopoverRef.current) addParentPopoverRef.current.open = true }}>
                Add to Group
              </Button>
            </div>
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
              {parentGroups.length === 0 ? (
                <List separators="Inner">
                  <ListItemStandard type="Inactive" text="This group has no parent groups." />
                </List>
              ) : (
                <List separators="Inner">
                  {parentGroups.map(g => (
                    <ListItemCustom key={g.id} accessibleName={g.name} type="Inactive">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', width: '100%' }}>
                        <Text style={{ flex: 1 }}>{g.name}</Text>
                        <Button design="Transparent" icon="decline" accessibleName={`Remove from ${g.name}`}
                          onClick={() => { setParentGroupIds(prev => prev.filter(id => id !== g.id)); }} />
                      </div>
                    </ListItemCustom>
                  ))}
                </List>
              )}
            </div>
          </div>
        )}

        {/* ── Members ── */}
        <div style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
              Members ({members.length})
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
              <Input
                accessibleName="Filter members"
                placeholder="Search members"
                value={memberFilter}
                onInput={e => setMemberFilter((e.target as unknown as HTMLInputElement).value)}
                icon={<Icon slot="icon" name="search" />}
                showClearIcon
                style={{ width: '200px' }}
              />
              {migrationState === 'pre' && (
                <Button id={addMembersBtnId} design="Transparent" icon="add" onClick={() => { setMemberSearch(''); setPendingMembers(new Set()); if (addMembersPopoverRef.current) addMembersPopoverRef.current.open = true }}>
                  Add Member
                </Button>
              )}
            </div>
          </div>
          <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
            {filteredMembers.length === 0 ? (
              <List separators="Inner">
                <ListItemStandard type="Inactive" text={members.length === 0 ? 'No members in this group' : 'No members match your search.'} />
              </List>
            ) : (
              <AnalyticalTable
                data={filteredMembers}
                columns={memberColumns}
                minRows={filteredMembers.length}
                visibleRows={filteredMembers.length}
                rowHeight={52}
                headerRowHeight={0}
                noDataText="No members"
                className="members-table"
                scaleWidthMode="Smart"
                style={{ width: '100%' }}
                onRowClick={migrationState === 'post' ? (e: any) => {
                  const userId = e.detail?.row?.original?.id
                  if (userId) navigate(`/users?userId=${userId}`)
                } : undefined}
              />
            )}
          </div>
        </div>

      </SigRightSidePanel>

      {/* ── Add Members popover ── */}
      <Popover
        ref={addMembersPopoverRef}
        opener={addMembersBtnId}
        placement="Bottom"
        horizontalAlign="End"
        className="no-padding-popover"
        style={{ width: '340px' }}
        onClose={() => { if (addMembersPopoverRef.current) addMembersPopoverRef.current.open = false }}
      >
        <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
          <Input
            accessibleName="Search users to add as members"
            placeholder="Search users"
            value={memberSearch}
            style={{ width: '100%' }}
            onInput={e => setMemberSearch((e.target as unknown as HTMLInputElement).value)}
            icon={<Icon slot="icon" name="search" />}
          />
        </div>
        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {filteredNonMembers.length === 0 ? (
            <div style={{ padding: '0.75rem 1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                {nonMembers.length === 0 ? 'All workspace members are already in this group.' : 'No users match your search.'}
              </Text>
            </div>
          ) : (
            <List
              separators="Inner"
              selectionMode="Multiple"
              onSelectionChange={e => {
                const ids = e.detail.selectedItems.map(item => item.getAttribute('data-key') as string)
                setPendingMembers(new Set(ids))
              }}
            >
              {filteredNonMembers.map(u => (
                <ListItemCustom key={u.id} data-key={u.id} accessibleName={u.name} selected={pendingMembers.has(u.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                    <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text>{u.name}</Text>
                      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{u.email}</Text>
                    </div>
                  </div>
                </ListItemCustom>
              ))}
            </List>
          )}
        </div>
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--sapList_BorderColor)' }}>
          <Button design="Emphasized" disabled={pendingMembers.size === 0} onClick={handleAddMembers}>
            Add{pendingMembers.size > 0 ? ` (${pendingMembers.size})` : ''}
          </Button>
          <Button design="Transparent" onClick={() => { if (addMembersPopoverRef.current) addMembersPopoverRef.current.open = false }}>Cancel</Button>
        </div>
      </Popover>

      {/* ── Add to Parent Group popover ── */}
      <Popover
        ref={addParentPopoverRef}
        opener={addParentBtnId}
        placement="Bottom"
        horizontalAlign="End"
        className="no-padding-popover"
        style={{ width: '300px' }}
        onClose={() => { if (addParentPopoverRef.current) addParentPopoverRef.current.open = false }}
      >
        <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
          <Input
            accessibleName="Search groups"
            placeholder="Search groups"
            value={parentSearch}
            style={{ width: '100%' }}
            onInput={e => setParentSearch((e.target as unknown as HTMLInputElement).value)}
            icon={<Icon slot="icon" name="search" />}
          />
        </div>
        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {availableParentGroups.length === 0 ? (
            <div style={{ padding: '0.75rem 1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No groups available</Text>
            </div>
          ) : (
            <List separators="Inner">
              {availableParentGroups.map(g => (
                <ListItemStandard
                  key={g.id}
                  onClick={() => {
                    setParentGroupIds(prev => [...prev, g.id])
                    setDirty(true)
                    if (addParentPopoverRef.current) addParentPopoverRef.current.open = false
                    setParentSearch('')
                  }}
                >
                  {g.name}
                </ListItemStandard>
              ))}
            </List>
          )}
        </div>
      </Popover>

      {/* ── Delete Group confirmation ── */}
      <Dialog open={deleteOpen} headerText="Delete Group" state="Critical" onClose={() => setDeleteOpen(false)}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '400px', maxWidth: '480px' }}>
          <Text>Do you want to delete the group <strong>"{group.name}"</strong>?</Text>
          <Text>Members of this group are not deleted, they remain in the workspace as individual users.</Text>
          <Text style={{ color: 'var(--sapCriticalColor)', fontSize: 'var(--sapFontSmallSize)' }}>This action cannot be undone.</Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Negative" onClick={handleDelete}>Delete Group</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setDeleteOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <Toast open={saveToastOpen} placement="BottomCenter" onClose={() => setSaveToastOpen(false)}>
        Group settings saved.
      </Toast>
    </div>
  )
}

// ── GroupsListColumn ──────────────────────────────────────────────────────────

function GroupsListColumn({ groups, selectedGroup, onSelectGroup, migrationState, onCreateGroup }: {
  groups: Group[]
  selectedGroup: Group | null
  onSelectGroup: (g: Group) => void
  migrationState: 'pre' | 'post'
  onCreateGroup: () => void
}) {
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('Alphabetically')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const sortPopoverRef        = useRef<PopoverDomRef>(null)

  const filtered = groups.filter(g => {
    const q = search.toLowerCase()
    return !q || g.name.toLowerCase().includes(q)
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'Member Count') return dir * (a.memberIds.length - b.memberIds.length)
    return dir * a.name.localeCompare(b.name)
  })

  return (
    <PageHeader title="Groups" subtitle="Organize workspace members into groups." isDirty={false}>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
              Groups
            </Title>
          </ToolbarItem>
        }
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName="Search groups"
              placeholder="Search groups"
              value={search}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
              icon={<Icon slot="icon" name="search" />}
              style={{ width: '240px' }}
            />
          </ToolbarItem>
        }
        sortSlot={
          <ToolbarItem>
            <span id="groups-sort-chip-anchor">
              <SigChipV2
                label="Sort by"
                value={sortBy}
                trailingIcon="slim-arrow-down"
                onClick={() => {
                  if (sortPopoverRef.current) {
                    sortPopoverRef.current.opener = 'groups-sort-chip-anchor'
                    sortPopoverRef.current.open = true
                  }
                }}
              />
            </span>
            <Popover
              ref={sortPopoverRef}
              placement="Bottom"
              horizontalAlign="Start"
              hideArrow
              className="no-padding-popover"
              style={{ width: '260px' }}
              onClose={() => { if (sortPopoverRef.current) sortPopoverRef.current.open = false }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.5rem 1rem' }}>
                  <SegmentedButton itemsFitContent={false} style={{ width: '100%' }}>
                    <SegmentedButtonItem icon="sort-ascending" accessibleName="Ascending" selected={sortDir === 'asc'} onClick={() => setSortDir('asc')}>Ascending</SegmentedButtonItem>
                    <SegmentedButtonItem icon="sort-descending" accessibleName="Descending" selected={sortDir === 'desc'} onClick={() => setSortDir('desc')}>Descending</SegmentedButtonItem>
                  </SegmentedButton>
                </div>
                <List
                  separators="None"
                  selectionMode="Single"
                  onItemClick={e => {
                    const key = (e.detail.item as HTMLElement).dataset.sortKey
                    if (key) { setSortBy(key); if (sortPopoverRef.current) sortPopoverRef.current.open = false }
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <ListItemCustom key={opt.key} type="Active" data-sort-key={opt.key} selected={sortBy === opt.key} accessibleName={opt.key}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 6px 0 3px', height: '32px' }}>
                        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{opt.key}</Text>
                        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', textAlign: 'right' }}>{sortDirLabel(opt.type, sortDir)}</Text>
                      </div>
                    </ListItemCustom>
                  ))}
                </List>
              </div>
            </Popover>
          </ToolbarItem>
        }
        businessActionsSlot={
          <ToolbarItem>
            {migrationState === 'post'
              ? <Button design="Emphasized" endIcon="action-external-link" onClick={() => window.open('https://as5u4itfg.accounts400.ondemand.com/saml2/idp/sso?sp=oac.accounts.sap.com&RelayState=https%3A%2F%2Fas5u4itfg.accounts400.ondemand.com%2Fadmin%2F', '_blank')}>Manage Groups in SCI</Button>
              : <Button design="Emphasized" onClick={onCreateGroup}>Create Group</Button>
            }
          </ToolbarItem>
        }
      >
        <List
          separators="Inner"
          noDataText="No groups found"
          onItemClick={e => {
            const key = (e.detail.item as HTMLElement).dataset.key
            const group = key ? groups.find(g => g.id === key) : undefined
            if (group) onSelectGroup(group)
          }}
        >
          {filtered.map(g => (
            <ListItemStandard key={g.id} data-key={g.id} selected={selectedGroup?.id === g.id}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Text>{g.name}</Text>
                {g.autoAddNewUsers && (
                  <ObjectStatus style={{ marginLeft: 'auto', fontSize: 'var(--sapFontSmallSize)' }} state="Information" inverted>
                    Auto-add new users
                  </ObjectStatus>
                )}
              </div>
            </ListItemStandard>
          ))}
        </List>
      </SigTableWrapper>
    </PageHeader>
  )
}

// ── Groups (page root with FCL) ───────────────────────────────────────────────

export default function Groups() {
  const [groups, setGroups]          = useState<Group[]>(loadGroups)
  const [selectedGroup, setSelected] = useState<Group | null>(null)
  const [layout, setLayout]          = useState<'OneColumn' | 'TwoColumnsMidExpanded'>('OneColumn')
  const [createOpen, setCreateOpen]  = useState(false)
  const [migrationState, setMigrationState] = useState<'pre' | 'post'>('pre')
  const nextGroupIdRef               = useRef(0)
  // seed from actual loaded groups so new IDs never collide
  if (nextGroupIdRef.current === 0) {
    const loaded = loadGroups()
    nextGroupIdRef.current = Math.max(...loaded.map(g => parseInt(g.id.replace(/\D/g, ''), 10) || 0), 0) + 1
  }

  const updateGroups = useCallback((updater: (prev: Group[]) => Group[]) => {
    setGroups(prev => {
      const next = updater(prev)
      saveGroups(next)
      return next
    })
  }, [])

  const handleSelectGroup = (group: Group) => {
    setSelected(group)
    setLayout('TwoColumnsMidExpanded')
  }

  const handleClose = () => {
    setSelected(null)
    setLayout('OneColumn')
  }

  const handleUpdate = (updated: Group) => {
    updateGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
    setSelected(updated)
  }

  const handleDelete = (groupId: string) => {
    updateGroups(prev => prev.filter(g => g.id !== groupId))
    setSelected(null)
    setLayout('OneColumn')
  }

  const handleCreate = (data: Omit<Group, 'id' | 'colorScheme'>) => {
    const id = nextGroupIdRef.current++
    const colorScheme = ACCENT_COLORS[id % ACCENT_COLORS.length]
    const newGroup: Group = { ...data, id: `g${id}`, colorScheme }
    updateGroups(prev => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)))
    setCreateOpen(false)
    handleSelectGroup(newGroup)
  }

  const layoutsConfiguration = {
    desktop: { TwoColumnsMidExpanded: { layout: ['49%', '51%', '0'] } },
    tablet:  { TwoColumnsMidExpanded: { layout: ['49%', '51%', '0'] } },
  }

  return (
    <>
      <FlexibleColumnLayout
        layout={layout}
        layoutsConfiguration={layoutsConfiguration}
        style={{ height: '100%', '--_ui5_fcl_separator_btn_display': 'none' } as React.CSSProperties}
        startColumn={
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <GroupsListColumn
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={handleSelectGroup}
              migrationState={migrationState}
              onCreateGroup={() => setCreateOpen(true)}
            />
          </div>
        }
        midColumn={
          selectedGroup
            ? (
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <GroupDetailPanel
                  key={selectedGroup.id}
                  group={selectedGroup}
                  allUsers={USERS_REF}
                  allGroups={groups}
                  onClose={handleClose}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  migrationState={migrationState}
                />
              </div>
            )
            : <div />
        }
      />

      {migrationState === 'pre'
        ? <AddGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        : <CreateGroupDialog open={createOpen} allUsers={USERS_REF} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      }
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: 'var(--sapButton_Emphasized_Background)', border: 'none', borderRadius: '0.5rem', boxShadow: 'var(--sapContent_Shadow2)', padding: '0.25rem' }}>
        <SegmentedButton onSelectionChange={(e: any) => setMigrationState(e.detail.selectedItems[0]?.dataset.key ?? 'post')}>
          <SegmentedButtonItem data-key="pre" selected={migrationState === 'pre'}>Pre-migration</SegmentedButtonItem>
          <SegmentedButtonItem data-key="post" selected={migrationState === 'post'}>Post-migration (SCI)</SegmentedButtonItem>
        </SegmentedButton>
      </div>
    </>
  )
}
