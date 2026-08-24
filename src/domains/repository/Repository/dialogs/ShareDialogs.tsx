import React, { useState, useRef } from 'react'
import {
  Dialog, Button, Bar, Avatar, Text, MultiInput, Token, TextArea,
  List, ListItemCustom, Icon, Popover, Select, Option,
} from '@ui5/webcomponents-react'
import type { FileItem } from '../data'
import { ACCESS_USERS, SELECTABLE_ROLES } from '../data'
import type { AccessRole } from '../data'

// ─── Suggested users for MultiInput ──────────────────────────────────────────
const SUGGESTION_USERS = [
  { id: 's1', name: 'Lin Adams',    email: 'l.adams@globalcorp.com',  initials: 'LA', colorScheme: 'Accent7' },
  { id: 's2', name: 'Linda Jones',  email: 'l.jones@globalcorp.com',  initials: 'LJ', colorScheme: 'Accent1' },
  { id: 's3', name: 'Lisa Taylor',  email: 'l.taylor@globalcorp.com', initials: 'LT', colorScheme: 'Accent4' },
  { id: 's4', name: 'Lena Müller',  email: 'l.mueller@globalcorp.com',initials: 'LM', colorScheme: 'Accent6' },
  ...ACCESS_USERS.filter(u => !u.isGroup).map(u => ({
    id: u.id, name: u.name, email: u.email, initials: u.avatarInitials, colorScheme: u.colorScheme ?? 'Accent1',
  })),
]

// ─── Role Dropdown (Select trigger + custom popover with icon + name + description) ──
function RoleDropdown({
  id,
  value,
  onChange,
  showRemove = false,
  useButton = false,
}: {
  id: string
  value: AccessRole | string
  onChange: (v: AccessRole | 'remove') => void
  showRemove?: boolean
  useButton?: boolean
}) {
  const [open, setOpen] = useState(false)
  const triggerId = `role-trigger-${id}`
  const selectRef = useRef<any>(null)
  const canEdit = SELECTABLE_ROLES.some(r => r.value === value) || showRemove

  const handleSelectOpen = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectRef.current) selectRef.current.open = false
    if (canEdit) setOpen(v => !v)
  }

  const trigger = useButton ? (
    <Button
      id={triggerId}
      design="Transparent"
      endIcon={canEdit ? 'slim-arrow-down' : undefined}
      onClick={() => canEdit && setOpen(v => !v)}
    >
      {value}
    </Button>
  ) : (
    <Select
      id={triggerId}
      ref={selectRef}
      onOpen={handleSelectOpen}
      style={{ minWidth: '120px', maxWidth: '120px' }}
    >
      <Option selected>{value as string}</Option>
    </Select>
  )

  return (
    <>
      {trigger}
      {canEdit && (
        <Popover
          opener={triggerId}
          open={open}
          onClose={() => setOpen(false)}
          placement="Bottom"
          horizontalAlign="End"
          hideArrow
          className="no-padding-popover"
        >
          <List separators="None" style={{ minWidth: '300px' }}>
            {SELECTABLE_ROLES.map(role => (
              <ListItemCustom
                key={role.value}
                type="Active"
                selected={value === role.value}
                onClick={() => { onChange(role.value as AccessRole); setOpen(false) }}
                style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  <Icon name={role.icon} style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                  <div>
                    <Text style={{ fontWeight: '600', display: 'block' }}>{role.value}</Text>
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{role.description}</Text>
                  </div>
                </div>
              </ListItemCustom>
            ))}
            {showRemove && (
              <ListItemCustom
                type="Active"
                onClick={() => { onChange('remove'); setOpen(false) }}
                style={{ '--_ui5_list_item_content_padding': '0' } as React.CSSProperties}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                  <Icon name="delete" style={{ width: '20px', height: '20px', flexShrink: 0, color: 'var(--sapNegativeTextColor)' }} />
                  <Text style={{ color: 'var(--sapNegativeTextColor)', display: 'block' }}>Remove Access</Text>
                </div>
              </ListItemCustom>
            )}
          </List>
        </Popover>
      )}
    </>
  )
}

// ─── Share Dialog ─────────────────────────────────────────────────────────────
interface ShareDialogProps {
  file: FileItem
  onClose: () => void
  onManageAccess: () => void
  onInvite?: (count: number) => void
}

export function ShareDialog({ file, onClose, onManageAccess, onInvite }: ShareDialogProps) {
  const [inviteRole, setInviteRole] = useState<AccessRole>('Viewer')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = SUGGESTION_USERS.filter(u =>
    !selectedUsers.includes(u.id) &&
    (u.name.toLowerCase().includes(inputValue.toLowerCase()) || u.email.toLowerCase().includes(inputValue.toLowerCase()))
  )

  const addUser = (userId: string) => {
    setSelectedUsers(prev => [...prev, userId])
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId))
  }

  return (
    <Dialog open headerText={`Share ${file.name}`} onClose={onClose} style={{ width: '560px' }}>
      <div style={{ width: '560px' }}>
        {/* Add users section */}
        <div style={{ padding: '16px 16px 4px' }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '8px' }}>Add Users</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 12px', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MultiInput
              placeholder={selectedUsers.length === 0 ? 'Search for name or email' : ''}
              value={inputValue}
              onInput={(e: any) => {
                setInputValue(e.target.value ?? '')
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{ width: '100%' }}
            >
              {selectedUsers.map(uid => {
                const u = SUGGESTION_USERS.find(s => s.id === uid)
                return u ? (
                  <Token key={uid} slot="tokens" text={u.name} {...{ onDelete: () => removeUser(uid) } as any} />
                ) : null
              })}
            </MultiInput>
            {showSuggestions && inputValue && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'var(--sapGroup_ContentBackground)', borderRadius: '8px',
                boxShadow: '0 0 0 1px rgba(34,54,73,0.48), 0 2px 8px rgba(34,54,73,0.3)',
                overflow: 'hidden', marginTop: '4px',
              }}>
                {filtered.slice(0, 5).map(u => (
                  <div
                    key={u.id}
                    onMouseDown={() => addUser(u.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'white' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" shape="Circle" />
                    <div>
                      <Text style={{ fontWeight: '600', display: 'block', fontSize: 'var(--sapFontLargeSize)' }}>{u.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{u.email}</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <RoleDropdown id="invite" value={inviteRole} onChange={v => v !== 'remove' && setInviteRole(v)} />
        </div>

        {/* Message */}
        <div style={{ padding: '0 16px 12px' }}>
          <TextArea placeholder="Add a message" rows={3} style={{ width: '100%' } as React.CSSProperties} />
        </div>

        {/* Users with access */}
        <div style={{ padding: '10px 16px 8px' }}>
          <Text style={{ fontWeight: '600', display: 'block', fontSize: 'var(--sapFontSize)' }}>Users with Access</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* AvatarGroup-style overlap */}
            <div style={{ position: 'relative', width: '2.75rem', height: '2rem', flexShrink: 0 }}>
              <Avatar icon="group" colorScheme={'Accent10' as never} size="XS" shape="Circle"
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }} />
              <span style={{
                position: 'absolute', left: '1.25rem', top: 0,
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: 'white', border: '1px solid var(--sapList_BorderColor)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.625rem', fontWeight: '600',
                color: 'var(--sapButton_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                zIndex: 2,
              }}>+11</span>
            </div>
            <Text>Process Owners and 12 others</Text>
          </div>
          <Button design="Transparent" onClick={onManageAccess}>Manage Access</Button>
        </div>
      </div>

      <Bar slot="footer" design="Footer">
        <Button slot="startContent" icon="chain-link" design="Transparent">Copy Link</Button>
        <Button slot="endContent" design="Emphasized" disabled={selectedUsers.length === 0} onClick={() => { onInvite?.(selectedUsers.length); onClose() }}>Invite</Button>
        <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
      </Bar>
    </Dialog>
  )
}

// ─── Manage Access Dialog ─────────────────────────────────────────────────────
interface ManageAccessDialogProps {
  file: FileItem
  accessLevels: Record<string, AccessRole>
  onAccessLevelChange: (id: string, role: AccessRole) => void
  onClose: () => void
  onBack?: () => void
  showBackButton?: boolean
}

const MANAGE_GROUPS = [
  { id: 'g1', name: 'Process Analysts', subtitle: '4 members', colorScheme: 'Accent10' },
  { id: 'g2', name: 'Process Owners',   subtitle: '7 members', colorScheme: 'Accent10' },
]

const MANAGE_USERS = [
  { id: 'u1', name: 'Lina Davis',    email: 'l.davis@globalcorp.com',   initials: 'LD', colorScheme: 'Accent1' },
  { id: 'u2', name: 'Ludwig Grohe',  email: 'l.grohe@globalcorp.com',   initials: 'LG', colorScheme: 'Accent6' },
  { id: 'u5', name: 'Marie Carlsen', email: 'm.carlsen@globalcorp.com', initials: 'MC', colorScheme: 'Accent3' },
  { id: 'u6', name: 'Paul Gray',     email: 'p.gray@globalcorp.com',    initials: 'PG', colorScheme: 'Accent8' },
  { id: 'u7', name: 'Saskia Wulf',   email: 's.wulf@globalcorp.com',    initials: 'SW', colorScheme: 'Accent5' },
  { id: 'u3', name: 'Tim Green',     email: 't.green@globalcorp.com',   initials: 'TG', colorScheme: 'Accent4' },
  { id: 'u8', name: 'Zahra Zorra',   email: 'z.zorra@globalcorp.com',   initials: 'ZZ', colorScheme: 'Accent2' },
]

export function ManageAccessDialog({ file, accessLevels, onAccessLevelChange, onClose, onBack, showBackButton = true }: ManageAccessDialogProps) {
  const [localLevels, setLocalLevels] = useState<Record<string, AccessRole>>(() => ({
    g1: 'Manager', g2: 'Viewer',
    u1: 'Editor', u2: 'Editor', u5: 'Organizer', u6: 'Manager', u7: 'Viewer', u3: 'Editor', u8: 'Viewer',
    ...accessLevels,
  }))
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [addInputValue, setAddInputValue] = useState('')
  const [addRole, setAddRole] = useState<AccessRole>('Viewer')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = SUGGESTION_USERS.filter(u =>
    addInputValue && (u.name.toLowerCase().includes(addInputValue.toLowerCase()) || u.email.toLowerCase().includes(addInputValue.toLowerCase()))
  )

  const handleChange = (id: string, role: AccessRole | 'remove') => {
    if (role === 'remove') {
      setRemoved(prev => new Set([...prev, id]))
    } else {
      setLocalLevels(prev => ({ ...prev, [id]: role }))
      onAccessLevelChange(id, role)
    }
  }

  return (
    <Dialog open onClose={onClose} headerText={showBackButton ? undefined : `Manage Access for ${file.name}`}>
      {showBackButton && (
        <Bar design="Header" slot="header">
          <div slot="startContent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button icon="slim-arrow-left" design="Transparent" onClick={onBack ?? onClose} />
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)' }}>Manage Access</Text>
          </div>
        </Bar>
      )}

      <div style={{ width: '560px', maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Add users section — shown only in direct (non-back-button) mode */}
        {!showBackButton && (
          <>
            <div style={{ padding: '16px 16px 4px' }}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '8px' }}>Add Users</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px 12px', position: 'relative' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <MultiInput
                  placeholder="Search for name or group"
                  value={addInputValue}
                  onInput={(e: any) => { setAddInputValue(e.target.value ?? ''); setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={{ width: '100%' }}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--sapGroup_ContentBackground)', borderRadius: '8px',
                    boxShadow: '0 0 0 1px rgba(34,54,73,0.48), 0 2px 8px rgba(34,54,73,0.3)',
                    overflow: 'hidden', marginTop: '4px',
                  }}>
                    {filteredSuggestions.slice(0, 5).map(u => (
                      <div key={u.id} onMouseDown={() => { setAddInputValue(u.name); setShowSuggestions(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'white' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <Avatar initials={u.initials} colorScheme={u.colorScheme as never} size="XS" shape="Circle" />
                        <div>
                          <Text style={{ fontWeight: '600', display: 'block', fontSize: 'var(--sapFontLargeSize)' }}>{u.name}</Text>
                          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{u.email}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <RoleDropdown id="manage-add" value={addRole} onChange={v => v !== 'remove' && setAddRole(v)} />
              <Button design="Emphasized" disabled={!addInputValue.trim()}>Add</Button>
            </div>
            <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', margin: '0 16px 12px' }} />
            <div style={{ padding: '4px 16px 8px' }}>
              <Text style={{ fontWeight: '700', display: 'block', fontSize: 'var(--sapFontSize)' }}>Users with Access</Text>
            </div>
          </>
        )}
        <div style={{ padding: '16px 16px 6px' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>User Groups</Text>
        </div>
        {MANAGE_GROUPS.map(group => (
          <div key={group.id} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '64px' }}>
            <Avatar icon="group" colorScheme={group.colorScheme as never} size="XS" shape="Circle" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
              <Text style={{ fontWeight: '600', display: 'block' }}>{group.name}</Text>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{group.subtitle}</Text>
            </div>
            <RoleDropdown id={group.id} value={localLevels[group.id] ?? 'Viewer'} onChange={v => handleChange(group.id, v)} showRemove useButton />
          </div>
        ))}

        <div style={{ padding: '10px 16px 6px' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Individual Users</Text>
        </div>
        {MANAGE_USERS.filter(u => !removed.has(u.id)).map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '64px' }}>
            <Avatar initials={user.initials} colorScheme={user.colorScheme as never} size="XS" shape="Circle" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
              <Text style={{ fontWeight: '600', display: 'block' }}>{user.name}</Text>
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>{user.email}</Text>
            </div>
            <RoleDropdown id={user.id} value={localLevels[user.id] ?? 'Viewer'} onChange={v => handleChange(user.id, v)} showRemove useButton />
          </div>
        ))}
      </div>

      <Bar slot="footer" design="Footer">
        <Button slot="endContent" design="Transparent" onClick={onClose}>Close</Button>
      </Bar>
    </Dialog>
  )
}
