import { useState, useRef } from 'react'
import { CheckBox, Label, Text, Input, Button, TextArea, Link, List, ListItemCustom, Icon } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

// TODO ask Sebastian: should this page have explicit Save/Reset buttons or auto-save?

type TrustedIP = { address: string; own: boolean }

type SavedNetworkState = {
  dataRetentionEnabled: boolean
  dataRetentionDays: string
  ipFilterEnabled: boolean
  trustedIPs: TrustedIP[]
  trustedDomains: string
  embeddedModeEnabled: boolean
}

export default function NetworkPrivacy() {
  const [dataRetentionEnabled, setDataRetentionEnabled] = useState(false)
  const [dataRetentionDays, setDataRetentionDays] = useState('7')
  const [ipFilterEnabled, setIpFilterEnabled] = useState(false)
  const [ipInput, setIpInput] = useState('')
  const [cidrInput, setCidrInput] = useState('32')
  const [trustedIPs, setTrustedIPs] = useState<TrustedIP[]>([
    { address: '213.71.7.221', own: true },
    { address: '192.168.1.0/24', own: false },
    { address: '10.0.0.1/32', own: false },
  ])
  const [trustedDomains, setTrustedDomains] = useState('')
  const [embeddedModeEnabled, setEmbeddedModeEnabled] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const savedState = useRef<SavedNetworkState>({
    dataRetentionEnabled: false,
    dataRetentionDays: '7',
    ipFilterEnabled: false,
    trustedIPs: [
      { address: '213.71.7.221', own: true },
      { address: '192.168.1.0/24', own: false },
      { address: '10.0.0.1/32', own: false },
    ],
    trustedDomains: '',
    embeddedModeEnabled: false,
  })

  const handleSave = () => {
    savedState.current = { dataRetentionEnabled, dataRetentionDays, ipFilterEnabled, trustedIPs, trustedDomains, embeddedModeEnabled }
    setIsDirty(false)
  }

  const handleReset = () => {
    const saved = savedState.current
    setDataRetentionEnabled(saved.dataRetentionEnabled)
    setDataRetentionDays(saved.dataRetentionDays)
    setIpFilterEnabled(saved.ipFilterEnabled)
    setTrustedIPs(saved.trustedIPs)
    setTrustedDomains(saved.trustedDomains)
    setEmbeddedModeEnabled(saved.embeddedModeEnabled)
    setIsDirty(false)
  }

  const addIP = () => {
    const addr = ipInput.trim()
    if (!addr) return
    setTrustedIPs(prev => [...prev, { address: `${addr}/${cidrInput}`, own: false }])
    setIpInput('')
    setCidrInput('32')
    setIsDirty(true)
  }

  const removeIP = (index: number) => {
    setTrustedIPs(prev => prev.filter((_, i) => i !== index))
    setIsDirty(true)
  }

  return (
    <>
    <PageHeader title="Network and Privacy" subtitle="Manage network access settings and configure privacy-related workspace options." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="1.5rem">
        <SettingsSection
          title="Data Protection and Privacy"
          subtitle="Configure how long personal information is kept after a user has been removed from this workspace. After this period, the user's personal information is irreversibly deleted from the workspace and comments, notifications and related feed entries will not show the user's name or email anymore."
        >
          <div className={s.policyRow}>
            <Text className={s.fieldDesc}>Data retention period</Text>
            <div className={s.unitsRow}>
              <CheckBox checked={dataRetentionEnabled} onChange={() => { setDataRetentionEnabled(v => !v); setIsDirty(true) }} accessibleName="Enable data retention period" />
              <Input
                value={dataRetentionDays}
                disabled={!dataRetentionEnabled}
                style={{ width: '4.5rem' }}
                accessibleName="Data retention days"
                onInput={e => { setDataRetentionDays((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
              />
              <Text className={s.unitLabel}>days</Text>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="IP Address Filter"
          subtitle="Limit the access to your workspace to certain IPv4 addresses. The IPv4 address is checked for modeling users, as well as read-only access and invitations to comment. The IPv4 address that corresponds to your current access point is added automatically and therefore it cannot be removed."
        >
          <div className={s.rowWide}>
            <CheckBox checked={ipFilterEnabled} text="Activate IP Filtering" onChange={() => { setIpFilterEnabled(v => !v); setIsDirty(true) }} style={{ marginLeft: '-0.5rem' }} />

            <div className={s.ipList}>
              <div className={s.ipListHeader}>Add Trusted Address</div>
              <div className={s.ipAddRow}>
                <Label for="ip-address-input" style={{ display: 'none' }}>IP address</Label>
                <Input id="ip-address-input" value={ipInput} disabled={!ipFilterEnabled} style={{ width: '12rem' }} placeholder="IP address"
                  accessibleName="IP address"
                  onInput={e => setIpInput((e.target as unknown as HTMLInputElement).value)} />
                <Text>/</Text>
                <Label for="cidr-prefix-input" style={{ display: 'none' }}>CIDR prefix length</Label>
                <Input id="cidr-prefix-input" value={cidrInput} disabled={!ipFilterEnabled} style={{ width: '4rem' }}
                  accessibleName="CIDR prefix length"
                  onInput={e => setCidrInput((e.target as unknown as HTMLInputElement).value)} />
                <Button disabled={!ipFilterEnabled} onClick={addIP}>Add</Button>
              </div>
            </div>

            <div className={s.ipList}>
              <div className={s.ipListHeader}>Trusted Addresses</div>
              <List separators="Inner">
                {trustedIPs.map((ip, i) => (
                  <ListItemCustom key={i} accessibleName={ip.address} type="Inactive">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', width: '100%' }}>
                      <Icon name="world" style={{ color: 'var(--sapContent_IconColor)', fontSize: '1rem', flexShrink: 0 }} />
                      <Text style={{ flex: 1 }}>{ip.address}{ip.own ? ' (own)' : ''}</Text>
                      {!ip.own && (
                        <Button design="Transparent" icon="decline" accessibleName={`Remove ${ip.address}`} onClick={() => removeIP(i)} />
                      )}
                    </div>
                  </ListItemCustom>
                ))}
              </List>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Domain Policies"
          subtitle="Allow embedding SAP Signavio in following domains."
        >
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Please enter a list of trusted domains separated by commas
            </Text>
            <Label for="trusted-domains" style={{ display: 'none' }}>Trusted domains</Label>
            <TextArea
              id="trusted-domains"
              value={trustedDomains}
              rows={4}
              className={s.fieldFull}
              placeholder="e.g. example.com, mycompany.com"
              accessibleName="Trusted domains"
              onInput={e => { setTrustedDomains((e.target as unknown as HTMLTextAreaElement).value); setIsDirty(true) }}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Embedded Mode">
          <div className={s.rowWide}>
            <CheckBox
              checked={embeddedModeEnabled}
              text="Enable SAP Signavio content to be embedded in third-party applications"
              onChange={() => { setEmbeddedModeEnabled(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
            <div className={s.checkboxIndent}>
              <Text className={s.fieldDesc}>
                Allow SAP Signavio content to be embedded in another system (for example Microsoft SharePoint)
                and hide the header and navigation panel when embedded.{' '}
                <Link href="#">Read more about embedded mode</Link>
              </Text>
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  </>
  )
}
