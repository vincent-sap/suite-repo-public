import React, { useState } from 'react'
import {
  UserSettingsDialog, UserSettingsItem, UserSettingsAccountView, UserSettingsView,
  UserMenuAccount, Title, Label, Input, Select, Option, Button, Switch,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, Text, Link,
  List, ListItemStandard, ListItemCustom, ListItemGroup, Avatar, Toast,
  IllustratedMessage, Menu, MenuItem, ToolbarItem,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/UnableToLoad.js'
import { SigChipV2, SigDomainObject, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { useMockSave } from '../../../hooks/useMockSave'
import { ConnectionsSettingsView } from './ConnectionsSettingsView'

const INTERFACE_LANGUAGES = ['Deutsch', 'English', 'Français', 'Italiano', 'Русский', 'Español', 'Nederlands', '日本語', '한국어', 'Português (Portugal)', 'Português (Brazil)', '中文 (simplified)', '中文 (traditional)']

type SettingsTab = 'account' | 'notifications' | 'cookies' | 'subscriptions' | 'connections'
type SubscriptionObject = 'Process Model' | 'Quick Model' | 'Archimate' | 'Org Chart'
type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly'

interface Props {
  open: boolean
  settingsTab: SettingsTab
  errorStateEnabled: boolean
  onClose: () => void
}

export function UserSettingsDialogView({ open, settingsTab, errorStateEnabled, onClose }: Props) {
  const [profileTitle, setProfileTitle] = useState('')
  const [firstName, setFirstName] = useState('Claire')
  const [lastName, setLastName] = useState('Westfield')
  const [profileEmail, setProfileEmail] = useState('claire@acme.com')
  const [phone, setPhone] = useState('017623707105')
  const [company, setCompany] = useState('SAP SE')
  const [savedProfile, setSavedProfile] = useState({ profileTitle: '', firstName: 'Claire', lastName: 'Westfield', profileEmail: 'claire@acme.com', phone: '017623707105', company: 'SAP SE' })
  const [profileDirty, setProfileDirty] = useState(false)
  const { saveState: profileSaveState, triggerSave: triggerProfileSave } = useMockSave()
  const [interfaceLanguage, setInterfaceLanguage] = useState('English')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [retypePassword, setRetypePassword] = useState('')

  const [subscriptions, setSubscriptions] = useState<{ id: string; label: string; object: SubscriptionObject; lastChanged: string; frequency: SubscriptionFrequency }[]>([
    { id: '1',  label: 'Dummy Process - German (variant)',       object: 'Process Model', lastChanged: '2025-12-10', frequency: 'daily'   },
    { id: '2',  label: 'Order to Cash - End-to-End',            object: 'Process Model', lastChanged: '2026-01-03', frequency: 'weekly'  },
    { id: '3',  label: 'Receipt of Goods',                      object: 'Process Model', lastChanged: '2025-11-22', frequency: 'monthly' },
    { id: '4',  label: 'Approval Process',                      object: 'Archimate',     lastChanged: '2026-02-14', frequency: 'weekly'  },
    { id: '5',  label: 'Organisation Hierarchy',                object: 'Org Chart',     lastChanged: '2025-10-05', frequency: 'monthly' },
    { id: '6',  label: 'Quick delivery process',                object: 'Quick Model',   lastChanged: '2026-03-01', frequency: 'daily'   },
    { id: '7',  label: 'Invoice to Delivery',                   object: 'Process Model', lastChanged: '2026-01-19', frequency: 'weekly'  },
    { id: '8',  label: 'IT Support Ticketing',                  object: 'Process Model', lastChanged: '2025-09-30', frequency: 'daily'   },
    { id: '9',  label: 'Employee Leave Request',                object: 'Archimate',     lastChanged: '2026-04-07', frequency: 'monthly' },
    { id: '10', label: 'Product Development Lifecycle',         object: 'Quick Model',   lastChanged: '2025-12-28', frequency: 'weekly'  },
    { id: '11', label: 'Sales Funnel Overview',                 object: 'Process Model', lastChanged: '2026-02-03', frequency: 'daily'   },
    { id: '12', label: 'Inventory Management',                  object: 'Quick Model',   lastChanged: '2025-08-15', frequency: 'monthly' },
    { id: '13', label: 'Quality Assurance Testing',             object: 'Archimate',     lastChanged: '2026-03-22', frequency: 'weekly'  },
    { id: '14', label: 'Executive Leadership Structure',        object: 'Org Chart',     lastChanged: '2026-05-01', frequency: 'daily'   },
    { id: '15', label: 'Procurement End-to-End',                object: 'Process Model', lastChanged: '2026-04-18', frequency: 'monthly' },
  ])
  const [subSortBy, setSubSortBy] = useState<'Name' | 'Last Changed'>('Name')
  const [subGroupBy, setSubGroupBy] = useState<'None' | 'Type'>('Type')
  const [subSortMenuOpen, setSubSortMenuOpen] = useState(false)
  const [subGroupMenuOpen, setSubGroupMenuOpen] = useState(false)

  const [notifications, setNotifications] = useState([
    { id: 'journey_change', label: 'When a process that is linked to a journey model is changed', enabled: false },
    { id: 'insight_assigned', label: 'When an insight is assigned', enabled: true },
    { id: 'insight_modified', label: 'When an insight is modified', enabled: false },
    { id: 'insight_deleted', label: 'When an insight is deleted', enabled: false },
    { id: 'comment_created', label: 'When a comment is created', enabled: true },
    { id: 'comment_mentioned', label: 'When the user is mentioned in a comment', enabled: true },
    { id: 'comment_state', label: 'When a comments state has changed', enabled: false },
    { id: 'task_assigned', label: 'When a task is assigned to a user', enabled: true },
    { id: 'task_completed', label: 'When a task has been completed', enabled: true },
  ])
  const toggleNotification = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n))

  type ProfileKey = keyof typeof savedProfile
  const setProfileField = (field: ProfileKey, value: string) => {
    if (field === 'profileTitle') setProfileTitle(value)
    else if (field === 'firstName') setFirstName(value)
    else if (field === 'lastName') setLastName(value)
    else if (field === 'profileEmail') setProfileEmail(value)
    else if (field === 'phone') setPhone(value)
    else if (field === 'company') setCompany(value)
    setProfileDirty(true)
  }

  const handleProfileSave = () => {
    setSavedProfile({ profileTitle, firstName, lastName, profileEmail, phone, company })
    setProfileDirty(false)
    triggerProfileSave()
  }

  const renderSubscriptionItem = (sub: typeof subscriptions[number]) => (
    <ListItemCustom key={sub.id} data-id={sub.id} type="Active" style={{ paddingBlock: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <SigDomainObject size="XS" object={sub.object as never} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            {sub.label}
          </Text>
          <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
            {sub.object} · {sub.frequency}
          </Text>
        </div>
      </div>
    </ListItemCustom>
  )

  return (
    <UserSettingsDialog
      open={open}
      headerText="Settings"
      className="ui5-content-density-compact"
      onClose={onClose}
      style={{ '--sapFontHeader4Size': 'var(--sapFontHeader5Size)' } as React.CSSProperties}
    >
      <UserSettingsItem icon="employee" text="Account" headerText="Account" selected={settingsTab === 'account'}>
        {errorStateEnabled ? (
          <UserSettingsView text="Account" selected>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
              <IllustratedMessage name="UnableToLoad" titleText="Your account information couldn't be loaded" subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists.">
                <Button design="Emphasized" onClick={() => {}}>Retry</Button>
              </IllustratedMessage>
            </div>
          </UserSettingsView>
        ) : (
          <UserSettingsAccountView text="Account" selected>
            <UserMenuAccount slot="account" titleText="Claire Westfield" subtitleText="claire@acme.com" avatarInitials="CW" avatarColorScheme="Accent6" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem 0 0' }}>
              <Title level="H4">Personal Data</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <Label for="profile-title">Title</Label>
                  <Input id="profile-title" value={profileTitle} style={{ width: '100%' }} onInput={e => setProfileField('profileTitle', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <Label for="profile-first-name">First name</Label>
                    <Input id="profile-first-name" value={firstName} style={{ width: '100%' }} onInput={e => setProfileField('firstName', (e.target as unknown as HTMLInputElement).value)} />
                  </div>
                  <div>
                    <Label for="profile-last-name">Last name</Label>
                    <Input id="profile-last-name" value={lastName} style={{ width: '100%' }} onInput={e => setProfileField('lastName', (e.target as unknown as HTMLInputElement).value)} />
                  </div>
                </div>
                <div>
                  <Label for="profile-email">Email</Label>
                  <Input id="profile-email" value={profileEmail} style={{ width: '100%' }} onInput={e => setProfileField('profileEmail', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="profile-phone">Phone</Label>
                  <Input id="profile-phone" value={phone} style={{ width: '100%' }} onInput={e => setProfileField('phone', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="profile-company">Company</Label>
                  <Input id="profile-company" value={company} style={{ width: '100%' }} onInput={e => setProfileField('company', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="ui-language">Interface Language</Label>
                  <Select id="ui-language" style={{ width: '100%' }} onChange={e => { setInterfaceLanguage((e.detail.selectedOption as HTMLElement).textContent ?? interfaceLanguage); setProfileDirty(true) }}>
                    {INTERFACE_LANGUAGES.map(l => <Option key={l} selected={l === interfaceLanguage}>{l}</Option>)}
                  </Select>
                </div>
              </div>
              <Button design="Default" disabled={!profileDirty} style={{ alignSelf: 'stretch' }} onClick={handleProfileSave}>Save</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0 0' }}>
              <Title level="H4">Security</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <Label for="current-password">Current password</Label>
                  <Input id="current-password" type="Password" value={currentPassword} style={{ width: '100%' }} onInput={e => setCurrentPassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="new-password">New password</Label>
                  <Input id="new-password" type="Password" value={newPassword} style={{ width: '100%' }} onInput={e => setNewPassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="retype-password">Confirm new password</Label>
                  <Input id="retype-password" type="Password" value={retypePassword} style={{ width: '100%' }} onInput={e => setRetypePassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
              </div>
              <Button design="Default" style={{ alignSelf: 'stretch' }}>Change Password</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0 1.5rem' }}>
              <Title level="H5">Groups</Title>
              <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
                <List>
                  <ListItemCustom type="Inactive" accessibleName="Administrators">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                      <Avatar icon="group" size="XS" colorScheme={"Accent6" as never} />
                      <Text>Administrators</Text>
                    </div>
                  </ListItemCustom>
                </List>
              </div>
              <Title level="H5">Licenses</Title>
              <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
                <List>
                  <ListItemStandard>Enterprise Plus Edition</ListItemStandard>
                  <ListItemStandard>Collaboration Hub</ListItemStandard>
                  <ListItemStandard>Process Transformation Manager</ListItemStandard>
                  <ListItemStandard>JM Advanced</ListItemStandard>
                  <ListItemStandard>Process Intelligence</ListItemStandard>
                  <ListItemStandard>Process Transformation Manager Insights and Initiatives</ListItemStandard>
                </List>
              </div>
            </div>
            <Toast open={profileSaveState === 'saved'} placement="BottomCenter">Changes saved</Toast>
          </UserSettingsAccountView>
        )}
      </UserSettingsItem>

      <UserSettingsItem icon="bell" text="Notifications" headerText="Notifications" selected={settingsTab === 'notifications'}>
        <UserSettingsView text="Notifications">
          <div style={{ padding: '0 0 1rem' }}>
            <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>
              <Table headerRow={<TableHeaderRow><TableHeaderCell>Event Type</TableHeaderCell><TableHeaderCell>Email Notifications</TableHeaderCell></TableHeaderRow>}>
                {notifications.map(n => (
                  <TableRow key={n.id}>
                    <TableCell><Text>{n.label}</Text></TableCell>
                    <TableCell><Switch checked={n.enabled} onChange={() => toggleNotification(n.id)} /></TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        </UserSettingsView>
      </UserSettingsItem>

      <UserSettingsItem icon="sys-find" text="Cookies" headerText="Cookies" selected={settingsTab === 'cookies'}>
        <UserSettingsView text="Cookies">
          <div style={{ padding: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Text>Allow or prevent SAP Signavio from using functional cookies to analyze application usage so we can measure and improve this software.</Text>
            <Text>Find more details on our cookie policy in our <Link href="#">Cookie Statement</Link>.</Text>
            <div><Button design="Default">Manage Cookies</Button></div>
          </div>
        </UserSettingsView>
      </UserSettingsItem>

      <UserSettingsItem icon="bell" text="Subscriptions" headerText="Subscriptions" selected={settingsTab === 'subscriptions'}>
        {errorStateEnabled ? (
          <UserSettingsView text="Subscriptions">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
              <IllustratedMessage name="UnableToLoad" titleText="Your subscriptions couldn't be loaded" subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists.">
                <Button design="Emphasized" onClick={() => {}}>Retry</Button>
              </IllustratedMessage>
            </div>
          </UserSettingsView>
        ) : (
          <UserSettingsView text="Subscriptions">
            {(() => {
              const sorted = [...subscriptions].sort((a, b) => subSortBy === 'Name' ? a.label.localeCompare(b.label) : b.lastChanged.localeCompare(a.lastChanged))
              const grouped = subGroupBy === 'Type'
                ? (['Process Model', 'Quick Model', 'Archimate', 'Org Chart'] as const).map(type => ({ type, items: sorted.filter(s => s.object === type) })).filter(g => g.items.length > 0)
                : null
              return (
                <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
                  <SigTableWrapper
                    titleSlot={<ToolbarItem><Title level="H5" wrappingType="None">All ({subscriptions.length})</Title></ToolbarItem>}
                    sortSlot={
                      <ToolbarItem>
                        <SigChipV2 id="sub-sort-chip" label="Sort by" value={subSortBy} trailingIcon="slim-arrow-down" onClick={() => setSubSortMenuOpen(true)} />
                        <Menu open={subSortMenuOpen} opener="sub-sort-chip" onClose={() => setSubSortMenuOpen(false)} onItemClick={(e: CustomEvent) => { setSubSortBy(e.detail.text as 'Name' | 'Last Changed'); setSubSortMenuOpen(false) }}>
                          <MenuItem text="Name" /><MenuItem text="Last Changed" />
                        </Menu>
                      </ToolbarItem>
                    }
                    groupSlot={
                      <ToolbarItem>
                        <SigChipV2 id="sub-group-chip" label="Group by" value={subGroupBy === 'None' ? 'Select' : subGroupBy} trailingIcon="slim-arrow-down" onClick={() => setSubGroupMenuOpen(true)} />
                        <Menu open={subGroupMenuOpen} opener="sub-group-chip" onClose={() => setSubGroupMenuOpen(false)} onItemClick={(e: CustomEvent) => { setSubGroupBy(e.detail.text as 'None' | 'Type'); setSubGroupMenuOpen(false) }}>
                          <MenuItem text="None" /><MenuItem text="Type" />
                        </Menu>
                      </ToolbarItem>
                    }
                  >
                    {subscriptions.length === 0 ? (
                      <Text style={{ color: 'var(--sapContent_LabelColor)', padding: '1rem' }}>No subscriptions</Text>
                    ) : grouped ? (
                      <List separators="Inner" selectionMode="Delete" onItemDelete={(e: CustomEvent) => { const id = (e.detail.item as HTMLElement).dataset.id; setSubscriptions(prev => prev.filter(s => s.id !== id)) }}>
                        {grouped.map(group => <ListItemGroup key={group.type} headerText={group.type}>{group.items.map(renderSubscriptionItem)}</ListItemGroup>)}
                      </List>
                    ) : (
                      <List separators="Inner" selectionMode="Delete" onItemDelete={(e: CustomEvent) => { const id = (e.detail.item as HTMLElement).dataset.id; setSubscriptions(prev => prev.filter(s => s.id !== id)) }}>
                        {sorted.map(renderSubscriptionItem)}
                      </List>
                    )}
                  </SigTableWrapper>
                </div>
              )
            })()}
          </UserSettingsView>
        )}
      </UserSettingsItem>

      <UserSettingsItem icon="chain-link" text="MCP Connections" headerText="MCP Connections" selected={settingsTab === 'connections'}>
        <ConnectionsSettingsView />
      </UserSettingsItem>
    </UserSettingsDialog>
  )
}
