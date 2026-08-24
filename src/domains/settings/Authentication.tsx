import { useState, useRef } from 'react'
import { CheckBox, Text, Label, Input, TextArea, Link, SegmentedButton, SegmentedButtonItem, Button } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import SettingsPageLayout, { SettingsSection } from './components/SettingsPageLayout'
import s from './components/SettingsPage.module.css'

// TODO ask Sebastian: should this page have explicit Save/Reset buttons or auto-save?

type PolicyRow = {
  id: string
  label: string
  description: string
  checked: boolean
  value?: string
  unit?: string
}

const INITIAL_POLICIES: PolicyRow[] = [
  {
    id: 'sso',
    label: 'Enforce Single Sign-On:',
    description: 'This option prevents users from signing into your workspace with a password. If enabled, password policies have no effect.',
    checked: false,
  },
  {
    id: 'complexity',
    label: 'Complexity requirements:',
    description: 'To meet the complexity requirements, a password must fulfill three of the four following requirements: It must contain at least one capital letter (A to Z), one lower case letter (a to z), one number (0 to 9) and one special character (!,$,%,&,?,#).',
    checked: false,
  },
  {
    id: 'username',
    label: 'Consider user name:',
    description: "The password must not contain the user's first or last name.",
    checked: false,
  },
  {
    id: 'username_strict',
    label: 'Consider user name (strict):',
    description: 'The password must not contain easy to guess user data (eg., first name, last name, company name).',
    checked: false,
  },
  {
    id: 'min_age',
    label: 'Minimum password age:',
    description: 'Forbids choosing a new password before the entered number of days have passed.',
    checked: false,
    value: '1',
    unit: 'days',
  },
  {
    id: 'max_age',
    label: 'Maximum password age:',
    description: 'After the entered number of days have passed, the user must choose a new password.',
    checked: false,
    value: '1',
    unit: 'days',
  },
  {
    id: 'min_length',
    label: 'Minimum password length:',
    description: 'Minimum number of characters for a password. If this rule is deactivated, the minimum password length is six characters.',
    checked: true,
    value: '6',
    unit: 'characters',
  },
  {
    id: 'max_length',
    label: 'Maximum password length:',
    description: 'The maximum number of characters for a password.',
    checked: true,
    value: '100',
    unit: 'characters',
  },
  {
    id: 'history',
    label: 'Password history:',
    description: "Prevents users from reusing one of their recent passwords. The entered value indicates how many previous passwords the system remembers and blocks from reuse.",
    checked: false,
    value: '1',
    unit: 'passwords',
  },
]

type SavedAuth = {
  samlEnabled: boolean
  samlSpInitiated: boolean
  samlSignRequest: boolean
  samlCreateAccounts: boolean
  samlMetadata: string
  policies: PolicyRow[]
}

export default function Authentication() {
  const [samlEnabled, setSamlEnabled] = useState(false)
  const [samlSpInitiated, setSamlSpInitiated] = useState(false)
  const [samlSignRequest, setSamlSignRequest] = useState(false)
  const [samlCreateAccounts, setSamlCreateAccounts] = useState(false)
  const [samlMetadata, setSamlMetadata] = useState('')
  const [policies, setPolicies] = useState<PolicyRow[]>(INITIAL_POLICIES)
  const [isDirty, setIsDirty] = useState(false)
  const [migrationState, setMigrationState] = useState<'pre' | 'post'>('pre')

  const savedRef = useRef<SavedAuth>({
    samlEnabled: false,
    samlSpInitiated: false,
    samlSignRequest: false,
    samlCreateAccounts: false,
    samlMetadata: '',
    policies: INITIAL_POLICIES,
  })

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p))
    setIsDirty(true)
  }
  const updatePolicyValue = (id: string, value: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, value } : p))
    setIsDirty(true)
  }

  const handleSave = () => {
    savedRef.current = {
      samlEnabled,
      samlSpInitiated,
      samlSignRequest,
      samlCreateAccounts,
      samlMetadata,
      policies: JSON.parse(JSON.stringify(policies)),
    }
    setIsDirty(false)
  }

  const handleReset = () => {
    const saved = savedRef.current
    setSamlEnabled(saved.samlEnabled)
    setSamlSpInitiated(saved.samlSpInitiated)
    setSamlSignRequest(saved.samlSignRequest)
    setSamlCreateAccounts(saved.samlCreateAccounts)
    setSamlMetadata(saved.samlMetadata)
    setPolicies(JSON.parse(JSON.stringify(saved.policies)))
    setIsDirty(false)
  }

  return (
    <>
    <PageHeader title="Authentication" subtitle="Configure single sign-on (SSO) and password policy for your workspace." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="1.5rem">
        <SettingsSection title="SAML 2.0 Setup" subtitle="Security Assertion Markup Language (SAML) is a standard to exchange authentication and authorization data between a service provider (SP) and an identity provider (IdP). SAP Signavio acts as a service provider (SP) and agrees to trust an identity provider (IdP) to authenticate users.">
          <div className={s.rowWide}>
            <CheckBox
              checked={samlEnabled}
              text="Enable SAML 2.0 authentication"
              onChange={() => { setSamlEnabled(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
            <div className={s.checkboxIndent}>
              <div className={s.checkboxRow}>
                <CheckBox
                  checked={samlSpInitiated}
                  disabled={!samlEnabled}
                  text="Allow service provider initiated authentication"
                  onChange={() => { setSamlSpInitiated(v => !v); setIsDirty(true) }}
                />
                <div className={s.checkboxIndent}>
                  <CheckBox
                    checked={samlSignRequest}
                    disabled={!samlEnabled || !samlSpInitiated}
                    text="Sign authentication request"
                    onChange={() => { setSamlSignRequest(v => !v); setIsDirty(true) }}
                  />
                </div>
                <CheckBox
                  checked={samlCreateAccounts}
                  disabled={!samlEnabled}
                  text="Create new user accounts automatically"
                  onChange={() => { setSamlCreateAccounts(v => !v); setIsDirty(true) }}
                />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--sapList_BorderColor)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Label for="saml-metadata" style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Metadata</Label>
              <Text className={s.fieldDesc}>
                Paste the SAML metadata in XML format as provided by your identity provider here:
              </Text>
              <TextArea
                id="saml-metadata"
                value={samlMetadata}
                disabled={!samlEnabled}
                rows={6}
                className={s.fieldFull}
                placeholder="<?xml version=&quot;1.0&quot;?>..."
                onInput={e => { setSamlMetadata((e.target as unknown as HTMLTextAreaElement).value); setIsDirty(true) }}
              />
              <Link href="#">Download the SAML service provider metadata</Link>
            </div>
          </div>
        </SettingsSection>

        {migrationState === 'pre' ? (
          <SettingsSection
            title="Password Policies"
            subtitle="The password policies define security requirements that apply to all users when choosing a password."
          >
            {policies.map(policy => (
              <div key={policy.id} className={s.policyRow}>
                <div>
                  <span className={s.policyLabel}>{policy.label}</span>
                  <Text className={s.fieldDesc}>{policy.description}</Text>
                </div>
                <div className={s.unitsRow}>
                  <CheckBox checked={policy.checked} accessibleName={policy.label} onChange={() => togglePolicy(policy.id)} />
                  {policy.unit && (
                    <>
                      <Input
                        value={policy.value}
                        disabled={!policy.checked}
                        style={{ width: '4.5rem' }}
                        accessibleName={`${policy.label} value`}
                        onInput={e => updatePolicyValue(policy.id, (e.target as unknown as HTMLInputElement).value)}
                      />
                      <Text className={s.unitLabel}>{policy.unit}</Text>
                    </>
                  )}
                </div>
              </div>
            ))}
          </SettingsSection>
        ) : (
          <SettingsSection
            title="Password Policies"
            subtitle="SAP Cloud Identity Services (SCI) manages password policies."
            action={<Button endIcon="SAP-icons-v4/link" onClick={() => window.open('https://as5u4itfg.accounts400.ondemand.com/saml2/idp/sso?sp=oac.accounts.sap.com&RelayState=https%3A%2F%2Fas5u4itfg.accounts400.ondemand.com%2Fadmin%2F', '_blank')}>Manage in SCI</Button>}
          >
            <></>
          </SettingsSection>
        )}
      </SettingsPageLayout>
    </PageHeader>
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: 'var(--sapButton_Emphasized_Background)', border: 'none', borderRadius: '0.5rem', boxShadow: 'var(--sapContent_Shadow2)', padding: '0.25rem' }}>
      <SegmentedButton onSelectionChange={(e: any) => setMigrationState(e.detail.selectedItems[0]?.dataset.key ?? 'pre')}>
        <SegmentedButtonItem selected={migrationState === 'pre'} data-key="pre">Pre-migration</SegmentedButtonItem>
        <SegmentedButtonItem selected={migrationState === 'post'} data-key="post">Post-migration (SCI)</SegmentedButtonItem>
      </SegmentedButton>
    </div>
    </>
  )
}
