import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, Button, Bar, Avatar, Text, Input, Icon, RadioButton, Link } from '@ui5/webcomponents-react'
import { ADMIN_USERS } from '../../../contexts/WorkspaceContext'
import { USERS } from '../../../data/users'

interface Props {
  open: boolean
  currentOwnerId: string
  onClose: () => void
  onTransfer: (newOwnerId: string) => void
}

type Filter = 'All' | 'Process Modeler' | 'Collaboration Hub'

const ADMIN_IDS = new Set(ADMIN_USERS.map(u => u.id))

export function TransferOwnershipDialog({ open, currentOwnerId, onClose, onTransfer }: Props) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  useEffect(() => {
    if (open) { setSelectedId(null); setSearch(''); setFilter('All') }
  }, [open])

  const q = search.toLowerCase()

  // When no search — show only eligible admins (excluding current owner)
  // When searching — show all matching users, eligible on top
  const allUsers = q
    ? USERS.filter(u =>
        u.id !== currentOwnerId &&
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
      )
    : USERS.filter(u => u.id !== currentOwnerId && ADMIN_IDS.has(u.id))

  const filtered = allUsers.filter(u => {
    if (filter === 'All') return true
    return u.licenses.some(l => l === filter)
  })

  // Sort: eligible first
  const sorted = [...filtered].sort((a, b) => {
    const aEligible = ADMIN_IDS.has(a.id)
    const bEligible = ADMIN_IDS.has(b.id)
    if (aEligible && !bEligible) return -1
    if (!aEligible && bEligible) return 1
    return 0
  })

  const FILTERS: Filter[] = ['All', 'Process Modeler', 'Collaboration Hub']

  return (
    <Dialog
      open={open}
      headerText="Transfer Ownership"
      style={{ width: '34rem' }}
      onClose={onClose}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!selectedId} onClick={() => { if (selectedId) onTransfer(selectedId) }}>
                Transfer
              </Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Text>
          Select an administrator to become the new workspace owner. They will gain full administrative control.
        </Text>

        <Input
          value={search}
          placeholder="Search by name, email or user ID"
          style={{ width: '100%' }}
          onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
          icon={<Icon slot="icon" name="search" />}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <div
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: 'var(--sapFontSmallSize)',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: filter === f ? 'var(--sapButton_BorderColor)' : 'var(--sapField_BorderColor)',
                background: filter === f ? 'var(--sapButton_Background)' : 'transparent',
                color: filter === f ? 'var(--sapButton_TextColor)' : 'var(--sapTextColor)',
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxHeight: '20rem', overflowY: 'auto', borderTop: '1px solid var(--sapList_BorderColor)', marginTop: '0.75rem' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
            No users match your search.
          </div>
        ) : sorted.map(user => {
          const eligible = ADMIN_IDS.has(user.id)
          return (
            <div
              key={user.id}
              onClick={() => eligible && setSelectedId(user.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 1rem',
                cursor: eligible ? 'pointer' : 'default',
                borderBottom: '1px solid var(--sapList_BorderColor)',
                background: selectedId === user.id ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent',
              }}
            >
              <RadioButton
                checked={selectedId === user.id}
                disabled={!eligible}
                accessibleName={user.name}
                onChange={() => eligible && setSelectedId(user.id)}
                style={{ flexShrink: 0, opacity: eligible ? 1 : 0.4 }}
              />
              <Avatar initials={user.initials} colorScheme={user.colorScheme as never} size="XS" style={{ opacity: eligible ? 1 : 0.4 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '0.125rem' }}>
                  <span style={{ fontWeight: 'var(--sapFontBoldWeight)', fontSize: 'var(--sapFontSize)', opacity: eligible ? 1 : 0.4 }}>{user.name}</span>
                  <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', opacity: eligible ? 1 : 0.4 }}>{user.email}</span>
                  <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', opacity: eligible ? 1 : 0.4 }}>{`S20${user.id.padStart(8, '0')}`}</span>
                  {!eligible && (
                    <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapCriticalElementColor)', marginTop: '0.125rem' }}>
                      Not an administrator —{' '}
                      <Link onClick={e => { e.stopPropagation(); onClose(); navigate(`/users?userId=${user.id}`) }}>
                        Edit user
                      </Link>
                    </span>
                  )}
                </div>
                {eligible && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.125rem', flexShrink: 0 }}>
                    <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>Admin</span>
                    <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{user.licenses[0]}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Dialog>
  )
}
