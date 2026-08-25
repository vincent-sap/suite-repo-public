import React, { useRef, useState, type FunctionComponent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  FlexibleColumnLayout,
  Avatar,
  Bar,
  Button,
  Dialog,
  Icon,
  Input,
  Label,
  List,
  ListItemCustom,
  ListItemStandard,
  Popover,
  SegmentedButton,
  SegmentedButtonItem,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  Tag,
  Text,
  Title,
  Toast,
  ToolbarItem,
  type PopoverDomRef,
} from '@ui5/webcomponents-react'
import { SigTableWrapper, SigChipV2, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import PageHeader from './components/PageHeader'
import { AddUserDialog, type AddUserData } from './components/AddUserDialog'
import { USERS as INITIAL_USERS, ALL_LICENSES, ALL_FEATURES, GROUP_FEATURES, type User, type License } from '../../data/users'

// ── Data ────────────────────────────────────────────────────────────────────

const ALL_GROUPS = ['Administrators', 'Human Resources', 'Modelers', 'Analysts',
  'Process Owners', 'Business Architects', 'Compliance Officers', 'External Reviewers',
  'Finance Controllers', 'IT Operations', 'Legal Team', 'Process Viewers']

const GROUP_COLOR_MAP: Record<string, string> = {
  'Administrators':  'Accent6',
  'Analysts':        'Accent3',
  'Human Resources': 'Accent8',
  'Modelers':        'Accent2',
}

const LS_USERS_KEY = 'sig_mockup_users'

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY)
    if (raw) return JSON.parse(raw) as User[]
  } catch { /* ignore */ }
  return INITIAL_USERS
}

function saveUsers(users: User[]) {
  try { localStorage.setItem(LS_USERS_KEY, JSON.stringify(users)) } catch { /* ignore */ }
}

// ── PermissionsSection ──────────────────────────────────────────────────────

const COLLAPSE_AT = 5

function PermissionsSection({ groups }: { groups: string[] }) {
  const navigate = useNavigate()
  const [featuresExpanded, setFeaturesExpanded] = useState(false)

  const effectiveFeatureIds = new Set(groups.flatMap(g => [...(GROUP_FEATURES[g] ?? [])]))
  const effectiveFeatures   = ALL_FEATURES.filter(f => effectiveFeatureIds.has(f.id))

  const renderFeatureList = (items: string[], expanded: boolean, onToggle: () => void) => {
    const visible  = expanded ? items : items.slice(0, COLLAPSE_AT)
    const overflow = items.length - COLLAPSE_AT
    return (
      <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
        <List separators="Inner"
          onItemClick={() => navigate('/settings/feature-access')}
        >
          {items.length === 0
            ? <ListItemStandard type="Inactive" text="None via current group membership." />
            : visible.map(item => <ListItemStandard key={item} type="Active" text={item} />)
          }
        </List>
        {overflow > 0 && (
          <div style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--sapLinkColor)', fontSize: 'var(--sapFontSmallSize)', borderTop: '1px solid var(--sapList_BorderColor)' }} onClick={onToggle}>
            {expanded ? 'Show less' : `+${overflow} more`}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Feature Access ── */}
      <div style={{ paddingBottom: '1.5rem' }}>
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', display: 'block' }}>
          Feature Access
        </Text>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.5rem' }}>
          Inherited from group membership
        </Text>
        {renderFeatureList(effectiveFeatures.map(f => f.name), featuresExpanded, () => setFeaturesExpanded(v => !v))}
      </div>

    </>
  )
}

// ── UserDetailPanel ──────────────────────────────────────────────────────────

function UserDetailPanel({ user, onClose, onRemoveUser, onUpdate, migrationState }: {
  user: User
  onClose: () => void
  onRemoveUser: (id: string) => void
  onUpdate: (updated: User) => void
  migrationState: 'pre' | 'post'
}) {
  const [userLicenses, setUserLicenses] = useState<License[]>(user.licenses)
  const [userGroups, setUserGroups] = useState<string[]>(user.groups)
  const navigate = useNavigate()

  // Editable fields (pre-migration)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName]   = useState(user.lastName)
  const [title, setTitle]         = useState(user.title)
  const [phone, setPhone]         = useState(user.phone)
  const [company, setCompany]     = useState(user.company)
  const [editingDetails, setEditingDetails] = useState(false)

  const [removeUserOpen, setRemoveUserOpen]   = useState(false)
  const [resetPwdOpen, setResetPwdOpen]       = useState(false)
  const [cancelInviteOpen, setCancelInviteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastOpen(false)
    setTimeout(() => { setToastMessage(msg); setToastOpen(true) }, 0)
  }

  const [pendingLicenses, setPendingLicenses] = useState<Set<License>>(new Set())
  const [pendingGroups, setPendingGroups] = useState<Set<string>>(new Set())
  const [groupSearch, setGroupSearch] = useState('')

  const addLicensePopoverRef = useRef<PopoverDomRef>(null)
  const addGroupPopoverRef   = useRef<PopoverDomRef>(null)
  const addGroupBtnId        = useRef('add-group-btn-' + user.id).current

  const isInvited = user.status === 'Invited' && migrationState === 'pre'

  const availableLicenses = ALL_LICENSES.filter(l => !userLicenses.includes(l))
  const availableGroups   = ALL_GROUPS.filter(g => !userGroups.includes(g))
  const filteredAvailableGroups = availableGroups.filter(g => !groupSearch || g.toLowerCase().includes(groupSearch.toLowerCase()))

  const openAddLicense = () => {
    setPendingLicenses(new Set())
    if (addLicensePopoverRef.current) {
      addLicensePopoverRef.current.opener = 'add-license-btn'
      addLicensePopoverRef.current.open = true
    }
  }

  const confirmAddLicenses = () => {
    const next = [...userLicenses, ...Array.from(pendingLicenses)]
    setUserLicenses(next)
    onUpdate({ ...user, licenses: next })
    if (addLicensePopoverRef.current) addLicensePopoverRef.current.open = false
    showToast('Licenses updated.')
  }

  const confirmAddGroups = () => {
    const next = [...userGroups, ...Array.from(pendingGroups)]
    setUserGroups(next)
    onUpdate({ ...user, groups: next })
    if (addGroupPopoverRef.current) addGroupPopoverRef.current.open = false
    showToast('Group membership updated.')
  }

  const removeLicense = (license: License) => {
    const next = userLicenses.filter(l => l !== license)
    setUserLicenses(next)
    onUpdate({ ...user, licenses: next })
    showToast('License removed.')
  }

  const removeGroup = (group: string) => {
    const next = userGroups.filter(g => g !== group)
    setUserGroups(next)
    onUpdate({ ...user, groups: next })
    showToast('Removed from group.')
  }

  const confirmRemoveUser = () => { setRemoveUserOpen(false); onRemoveUser(user.id); onClose() }

  const headerActions: FunctionComponent[] = [
    () => isInvited ? (
      <>
        <Button design="Transparent" onClick={() => showToast('Invitation resent to ' + user.email)}>Resend Invite</Button>
        <Button design="Negative" onClick={() => setCancelInviteOpen(true)}>Cancel Invitation</Button>
      </>
    ) : migrationState === 'post' ? (
      <Button design="Transparent" icon="action-external-link" tooltip="Edit User in SCI"
        onClick={() => window.open('https://as5u4itfg.accounts400.ondemand.com/saml2/idp/sso?sp=oac.accounts.sap.com&RelayState=https%3A%2F%2Fas5u4itfg.accounts400.ondemand.com%2Fadmin%2F', '_blank')}>
        Edit User in SCI
      </Button>
    ) : (
      <>
        <Button design="Transparent" onClick={() => setResetPwdOpen(true)}>Reset Password</Button>
        <Button design="Negative" onClick={() => setRemoveUserOpen(true)}>Delete User</Button>
      </>
    )
  ]

  const subHeader = (isInvited || user.isAdmin) ? (
    <div style={{ marginTop: '-0.25rem', paddingBottom: '0.25rem', display: 'flex', gap: '0.25rem' }}>
      {isInvited && <Tag design="Set1" colorScheme="2" hideStateIcon>Invited</Tag>}
      {user.isAdmin && !isInvited && <Tag design="Set2" colorScheme="6" hideStateIcon>Administrator</Tag>}
    </div>
  ) : undefined

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SigRightSidePanel
        headerTitle={isInvited ? user.email : user.name}
        isOpen={true}
        toggleRightSidePanel={onClose}
        contentActionsSlot={headerActions}
        elementBeforeTitle={
          isInvited
            ? <Avatar icon="mail" size="S" colorScheme="Accent4" />
            : <Avatar initials={user.initials} colorScheme={user.colorScheme as never} size="S" />
        }
        subHeaderSlot={subHeader}
        wrappingType="Wrap"
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)' }}
      >
        {/* ── Invited user: limited info ── */}
        {isInvited && (
          <div style={{ paddingBottom: '1.5rem' }}>
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.5rem 1rem', alignItems: 'center' }}>
                <Label showColon>Email</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Text>{user.email}</Text>
                  <Button design="Transparent" icon="copy" tooltip="Copy email address" onClick={() => navigator.clipboard.writeText(user.email)} />
                </div>
                <Label showColon>Invited</Label>
                <Text>{user.memberSince}</Text>
              </div>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                This user has not yet accepted the invitation. Profile details will be available once they sign in for the first time.
              </Text>
            </div>
          </div>
        )}

        {/* ── Details (active/suspended users only) ── */}
        {!isInvited && (
        <div style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
              Details
            </Text>
            {migrationState === 'pre' && !editingDetails && (
              <Button design="Transparent" onClick={() => setEditingDetails(true)}>Edit</Button>
            )}
          </div>
          <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.5rem 1rem', alignItems: 'center' }}>
              <Label showColon>Title</Label>
              {migrationState === 'pre' && editingDetails ? <Input value={title} onInput={e => setTitle((e.target as unknown as HTMLInputElement).value)} /> : <Text>{title || '—'}</Text>}
              <Label showColon>First Name</Label>
              {migrationState === 'pre' && editingDetails ? <Input value={firstName} onInput={e => setFirstName((e.target as unknown as HTMLInputElement).value)} /> : <Text>{firstName}</Text>}
              <Label showColon>Last Name</Label>
              {migrationState === 'pre' && editingDetails ? <Input value={lastName} onInput={e => setLastName((e.target as unknown as HTMLInputElement).value)} /> : <Text>{lastName}</Text>}
              <Label showColon>Email</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Text>{user.email}</Text>
                <Button design="Transparent" icon="copy" tooltip="Copy email address" onClick={() => navigator.clipboard.writeText(user.email)} />
              </div>
              <Label showColon>Phone</Label>
              {migrationState === 'pre' && editingDetails ? <Input value={phone} onInput={e => setPhone((e.target as unknown as HTMLInputElement).value)} /> : <Text>{phone || '—'}</Text>}
              <Label showColon>Company</Label>
              {migrationState === 'pre' && editingDetails ? <Input value={company} onInput={e => setCompany((e.target as unknown as HTMLInputElement).value)} /> : <Text>{company || '—'}</Text>}
            </div>
            {migrationState === 'pre' && editingDetails && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button design="Emphasized" onClick={() => { setEditingDetails(false); showToast('User details saved.') }}>Save</Button>
                <Button design="Transparent" onClick={() => { setFirstName(user.firstName); setLastName(user.lastName); setTitle(user.title); setPhone(user.phone); setCompany(user.company); setEditingDetails(false) }}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── Licenses ── */}
        <div style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
              Licenses
            </Text>
            <Button id="add-license-btn" design="Transparent" icon="add" disabled={availableLicenses.length === 0} onClick={openAddLicense}>
              Add License
            </Button>
          </div>
          <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
            {userLicenses.length === 0 ? (
              <List separators="Inner">
                <ListItemStandard type="Inactive" text="No licenses assigned" />
              </List>
            ) : (
              <List separators="Inner">
                {userLicenses.map(l => (
                  <ListItemCustom key={l} data-key={l} accessibleName={l} type="Inactive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', width: '100%' }}>
                      <Text style={{ flex: 1 }}>{l}</Text>
                      <Button design="Transparent" icon="decline" accessibleName={`Remove ${l}`}
                        onClick={() => removeLicense(l)} />
                    </div>
                  </ListItemCustom>
                ))}
              </List>
            )}
          </div>
        </div>

        {/* ── Groups ── */}
        <div style={{ paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
              Groups
            </Text>
            {migrationState === 'pre' && (
              <Button id={addGroupBtnId} design="Transparent" icon="add" onClick={() => { setGroupSearch(''); setPendingGroups(new Set()); if (addGroupPopoverRef.current) { addGroupPopoverRef.current.opener = addGroupBtnId; addGroupPopoverRef.current.open = true } }}>
                Add to More Groups
              </Button>
            )}
          </div>
          <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
            {userGroups.length === 0 ? (
              <List separators="Inner">
                <ListItemStandard type="Inactive" text="Not a member of any group." />
              </List>
            ) : migrationState === 'pre' ? (
              <List separators="Inner">
                {userGroups.map(g => (
                  <ListItemCustom key={g} data-key={g} accessibleName={g} type="Inactive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', width: '100%' }}>
                      <Text style={{ flex: 1 }}>{g}</Text>
                      <Button design="Transparent" icon="decline" accessibleName={`Remove from ${g}`}
                        onClick={() => removeGroup(g)} />
                    </div>
                  </ListItemCustom>
                ))}
              </List>
            ) : (
              <List
                separators="Inner"
                onItemClick={e => {
                  const groupName = (e.detail.item as HTMLElement).dataset.key
                  if (groupName) navigate(`/settings/groups`)
                }}
              >
                {userGroups.map(g => (
                  <ListItemStandard key={g} data-key={g} text={g} type="Active" />
                ))}
              </List>
            )}
          </div>
        </div>

        {/* ── Permissions ── */}
        <PermissionsSection groups={userGroups} />
      </SigRightSidePanel>

      {/* ── Add Licenses popover ── */}
      <Popover
        ref={addLicensePopoverRef}
        placement="Bottom"
        horizontalAlign="End"
        className="no-padding-popover"
        style={{ width: '320px' }}
        onClose={() => { if (addLicensePopoverRef.current) addLicensePopoverRef.current.open = false }}
      >
        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {availableLicenses.length === 0 ? (
            <div style={{ padding: '1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>All licenses are already assigned.</Text>
            </div>
          ) : (
            <List
              selectionMode="Multiple"
              onSelectionChange={(e) => {
                const selected = e.detail.selectedItems.map(item => item.getAttribute('data-key') as string)
                setPendingLicenses(new Set(selected as License[]))
              }}
            >
              {availableLicenses.map(l => (
                <ListItemStandard key={l} data-key={l} text={l} selected={pendingLicenses.has(l)} />
              ))}
            </List>
          )}
        </div>
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--sapList_BorderColor)' }}>
          <Button design="Emphasized" disabled={pendingLicenses.size === 0} onClick={confirmAddLicenses}>
            Add{pendingLicenses.size > 0 ? ` (${pendingLicenses.size})` : ''}
          </Button>
          <Button design="Transparent" onClick={() => { if (addLicensePopoverRef.current) addLicensePopoverRef.current.open = false }}>Cancel</Button>
        </div>
      </Popover>

      {/* ── Add to User Group popover ── */}
      <Popover
        ref={addGroupPopoverRef}
        placement="Bottom"
        horizontalAlign="End"
        className="no-padding-popover"
        style={{ width: '300px' }}
        onClose={() => { if (addGroupPopoverRef.current) addGroupPopoverRef.current.open = false }}
      >
        <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
          <Input
            accessibleName="Search groups"
            placeholder="Search groups"
            value={groupSearch}
            style={{ width: '100%' }}
            onInput={e => setGroupSearch((e.target as unknown as HTMLInputElement).value)}
            icon={<Icon slot="icon" name="search" />}
          />
        </div>
        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {filteredAvailableGroups.length === 0 ? (
            <div style={{ padding: '0.75rem 1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
                {availableGroups.length === 0 ? 'User is already a member of all groups.' : 'No groups match your search.'}
              </Text>
            </div>
          ) : (
            <List
              selectionMode="Multiple"
              onSelectionChange={(e) => {
                const selected = e.detail.selectedItems.map(item => item.getAttribute('data-key') as string)
                setPendingGroups(new Set(selected))
              }}
            >
              {filteredAvailableGroups.map(g => (
                <ListItemCustom key={g} data-key={g} accessibleName={g} selected={pendingGroups.has(g)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                    <Avatar icon="group" size="XS" colorScheme={(GROUP_COLOR_MAP[g] ?? 'Accent1') as never} />
                    <Text>{g}</Text>
                  </div>
                </ListItemCustom>
              ))}
            </List>
          )}
        </div>
        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--sapList_BorderColor)' }}>
          <Button design="Emphasized" disabled={pendingGroups.size === 0} onClick={confirmAddGroups}>
            Add{pendingGroups.size > 0 ? ` (${pendingGroups.size})` : ''}
          </Button>
          <Button design="Transparent" onClick={() => { if (addGroupPopoverRef.current) addGroupPopoverRef.current.open = false }}>Cancel</Button>
        </div>
      </Popover>

      {/* ── Reset Password dialog ── */}
      <Dialog open={resetPwdOpen} headerText="Reset Password" onClose={() => setResetPwdOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '400px', maxWidth: '480px' }}>
          <Text>Send a password reset email to <strong>{user.email}</strong>?</Text>
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>The user will receive an email with a link to set a new password.</Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={() => { setResetPwdOpen(false); showToast('Password reset email sent.') }}>Send Reset Email</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setResetPwdOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* ── Remove User / Delete User confirmation dialog ── */}
      <Dialog open={removeUserOpen} headerText="Delete User" state="Critical" onClose={() => setRemoveUserOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '400px', maxWidth: '480px' }}>
          <Text>Do you want to delete <strong>{user.name}</strong> from this workspace?</Text>
          <Text>Their assigned licenses and group memberships will be revoked.</Text>
          <Text style={{ color: 'var(--sapCriticalColor)', fontSize: 'var(--sapFontSmallSize)' }}>This action cannot be undone.</Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Negative" onClick={confirmRemoveUser}>Delete This User</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setRemoveUserOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* ── Cancel Invitation confirmation dialog ── */}
      <Dialog open={cancelInviteOpen} headerText="Cancel Invitation" state="Critical" onClose={() => setCancelInviteOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px', maxWidth: '480px' }}>
          <Text>
            {`Do you want to cancel the invitation for ${user.email}? They will no longer be able to join the workspace using the invitation link.`}
          </Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={() => { setCancelInviteOpen(false); showToast('Invitation cancelled.'); onRemoveUser(user.id); onClose() }}>Cancel Invitation</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setCancelInviteOpen(false)}>Keep Invitation</Button>
        </Bar>
      </Dialog>

      {/* ── Toast ── */}
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>{toastMessage}</Toast>
    </div>
  )
}

// ── UsersListColumn ──────────────────────────────────────────────────────────

function UsersListColumn({ users, selectedUser, onSelectUser, migrationState, onAddUser }: { users: User[]; selectedUser: User | null; onSelectUser: (u: User) => void; migrationState: 'pre' | 'post'; onAddUser: () => void }) {
  const [search, setSearch] = useState('')
  const [groupByStatus, setGroupByStatus] = useState(false)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  }).sort((a, b) => {
    if (migrationState === 'pre') {
      if (a.status === 'Invited' && b.status !== 'Invited') return -1
      if (a.status !== 'Invited' && b.status === 'Invited') return 1
    }
    return a.name.localeCompare(b.name)
  })

  const renderUserRow = (user: User) => {
    const isInvited = user.status === 'Invited' && migrationState === 'pre'
    return (
      <TableRow key={user.id} interactive rowKey={user.id}
        style={selectedUser?.id === user.id ? { background: 'var(--sapList_SelectionBackgroundColor)', borderBottom: '1px solid var(--sapList_BorderColor)' } as React.CSSProperties : { borderBottom: '1px solid var(--sapList_BorderColor)' } as React.CSSProperties}>
        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isInvited
              ? <Avatar icon="mail" colorScheme="Accent4" size="XS" />
              : <Avatar initials={user.initials} colorScheme={user.colorScheme as never} size="XS" />
            }
            <Text style={isInvited ? { color: 'var(--sapContent_LabelColor)' } : undefined}>
              {isInvited ? user.email : user.name}
            </Text>
            {isInvited && <Tag design="Set1" colorScheme="2" hideStateIcon>Invited</Tag>}
            {user.isAdmin && !isInvited && <Tag design="Set2" colorScheme="6" hideStateIcon>Administrator</Tag>}
          </div>
        </TableCell>
        <TableCell>
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
            {isInvited ? '—' : user.email}
          </Text>
        </TableCell>
      </TableRow>
    )
  }

  const renderRows = () => {
    if (!groupByStatus) {
      return filtered.map(renderUserRow)
    }

    const admins = filtered.filter(u => u.isAdmin && (migrationState === 'post' || u.status !== 'Invited'))
    const normalUsers = filtered.filter(u => !u.isAdmin && (migrationState === 'post' || u.status !== 'Invited'))
    const invited = migrationState === 'pre' ? filtered.filter(u => u.status === 'Invited') : []

    const renderGroup = (label: string, groupUsers: User[]) => {
      if (groupUsers.length === 0) return null
      return [
        <TableRow key={`group-${label}`} {...{ type: 'Inactive' } as object} style={{ background: 'var(--sapList_GroupHeaderBackground)' } as React.CSSProperties}>
          <TableCell {...{ colSpan: 2 } as object}>
            <Text style={{ fontWeight: 'bold', color: 'var(--sapList_GroupHeaderTextColor)', fontSize: 'var(--sapFontSize)' }}>
              {label} ({groupUsers.length})
            </Text>
          </TableCell>
        </TableRow>,
        ...groupUsers.map(renderUserRow),
      ]
    }

    return [
      renderGroup('Invited', invited),
      renderGroup('Administrators', admins),
      renderGroup('Users', normalUsers),
    ]
  }

  return (
    <PageHeader title="Users" subtitle="Manage workspace members and their licenses." isDirty={false}>
      <SigTableWrapper
        titleSlot={
          <ToolbarItem>
            <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>
              Users
            </Title>
          </ToolbarItem>
        }
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName="Search users"
              placeholder="Search users"
              value={search}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
              icon={<Icon slot="icon" name="search" />}
              style={{ width: '240px' }}
            />
          </ToolbarItem>
        }
        sortSlot={
          <ToolbarItem>
            <SigChipV2
              label="Group by"
              value="Role"
              selected={groupByStatus}
              onClick={() => setGroupByStatus(v => !v)}
            />
          </ToolbarItem>
        }
        businessActionsSlot={
          <ToolbarItem>
            {migrationState === 'post'
              ? <Button design="Emphasized" endIcon="SAP-icons-v4/link" onClick={() => window.open('https://as5u4itfg.accounts400.ondemand.com/saml2/idp/sso?sp=oac.accounts.sap.com&RelayState=https%3A%2F%2Fas5u4itfg.accounts400.ondemand.com%2Fadmin%2F', '_blank')}>Manage Users (SCI)</Button>
              : <Button design="Emphasized" onClick={onAddUser}>Add User</Button>
            }
          </ToolbarItem>
        }
      >
        <Table
          overflowMode="Popin"
          noDataText="No users found"
          onRowClick={(e) => {
            const row = e.detail?.row as (HTMLElement & { position?: number; rowKey?: string }) | undefined
            const byKey = row?.rowKey ? users.find(u => u.id === row.rowKey) : undefined
            const byPos = row?.position != null ? filtered[row.position] : undefined
            const user = byKey ?? byPos
            if (user) onSelectUser(user)
          }}
          headerRow={
            <TableHeaderRow>
              <TableHeaderCell minWidth="340px" importance={2}>Name</TableHeaderCell>
              <TableHeaderCell width="220px" importance={1} popinHidden>Email</TableHeaderCell>
            </TableHeaderRow>
          }
        >
          {renderRows()}
        </Table>
      </SigTableWrapper>
    </PageHeader>
  )
}

// ── Users (page root with FCL) ───────────────────────────────────────────────

export default function Users() {
  const [searchParams] = useSearchParams()
  const initialUserId  = searchParams.get('userId')
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(
    initialUserId ? (loadUsers().find(u => u.id === initialUserId) ?? null) : null
  )
  const [layout, setLayout] = useState<'OneColumn' | 'TwoColumnsMidExpanded'>(
    initialUserId ? 'TwoColumnsMidExpanded' : 'OneColumn'
  )
  const [migrationState, setMigrationState] = useState<'pre' | 'post'>('pre')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [inviteToastOpen, setInviteToastOpen] = useState(false)
  const [inviteToastMessage, setInviteToastMessage] = useState('')

  const updateUsers = (updater: (prev: User[]) => User[]) => {
    setUsers(prev => {
      const next = updater(prev)
      saveUsers(next)
      return next
    })
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setLayout('TwoColumnsMidExpanded')
  }

  const handleClose = () => {
    setSelectedUser(null)
    setLayout('OneColumn')
  }

  const handleRemoveUser = (id: string) => {
    updateUsers(prev => prev.filter(u => u.id !== id))
  }

  const handleUpdateUser = (updated: User) => {
    updateUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    setSelectedUser(updated)
  }

  const handleAddUser = (data: AddUserData) => {
    const now = new Date().toISOString().slice(0, 10)
    const newUsers: User[] = data.emails.map((email, i) => ({
      id: `invited-${Date.now()}-${i}`,
      initials: '',
      colorScheme: 'Accent4',
      name: email,
      email,
      title: '', firstName: '', lastName: '', phone: '', company: '',
      lastLogin: '—',
      memberSince: now,
      status: 'Invited' as const,
      authMethod: 'Local' as const,
      isAdmin: false,
      licenses: data.licenses as License[],
      groups: data.groups,
      accessRights: [],
    }))
    updateUsers(prev => [...prev, ...newUsers])
    setAddUserOpen(false)
    const count = data.emails.length
    setInviteToastMessage(
      data.skipInviteEmail
        ? count === 1 ? 'User added. No invitation email was sent.' : `${count} users added. No invitation emails were sent.`
        : count === 1 ? 'Invitation sent.' : `Invitations sent to ${count} users.`
    )
    setInviteToastOpen(true)
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
            <UsersListColumn
              users={users}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              migrationState={migrationState}
              onAddUser={() => setAddUserOpen(true)}
            />
          </div>
        }
        midColumn={
          selectedUser
            ? <div style={{ height: '100%', overflow: 'hidden' }}><UserDetailPanel key={selectedUser.id} user={selectedUser} onClose={handleClose} onRemoveUser={handleRemoveUser} onUpdate={handleUpdateUser} migrationState={migrationState} /></div>
            : <div />
        }
      />
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: 'var(--sapButton_Emphasized_Background)', border: 'none', borderRadius: '0.5rem', boxShadow: 'var(--sapContent_Shadow2)', padding: '0.25rem' }}>
        <SegmentedButton onSelectionChange={(e: any) => setMigrationState(e.detail.selectedItems[0]?.dataset.key ?? 'post')}>
          <SegmentedButtonItem data-key="pre" selected={migrationState === 'pre'}>Pre-migration</SegmentedButtonItem>
          <SegmentedButtonItem data-key="post" selected={migrationState === 'post'}>Post-migration (SCI)</SegmentedButtonItem>
        </SegmentedButton>
      </div>
      <AddUserDialog
        open={addUserOpen}
        availableLicenses={ALL_LICENSES}
        availableGroups={ALL_GROUPS}
        onClose={() => setAddUserOpen(false)}
        onAdd={handleAddUser}
      />
      <Toast open={inviteToastOpen} placement="BottomCenter" onClose={() => setInviteToastOpen(false)}>
        {inviteToastMessage}
      </Toast>
    </>
  )
}
