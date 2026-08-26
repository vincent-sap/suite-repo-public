import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  NavigationLayout, ShellBar, ShellBarItem, ShellBarSearch,
  Button, Switch, Text, Avatar,
  UserMenu, UserMenuAccount, UserMenuItem,
  Menu, MenuItem, MenuSeparator,
  Popover, Label, Select, Option,
  MessageBox,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { useWorkspace, USER_CONTEXT_DEFAULTS } from '../../contexts/WorkspaceContext'
import { useAuth } from '../../contexts/AuthContext'
import SearchDropdown from './SearchDropdown'
import WelcomeModal from './WelcomeModal'
import HotspotTooltip from './HotspotTooltip'
import ConventionsDialog from './Shell/ConventionsDialog'
import AboutDialog from './Shell/AboutDialog'
import { UserSettingsDialogView } from './Shell/UserSettingsDialogView'
import { ShellSideNavigation, NAV_ROUTES } from './Shell/ShellSideNavigation'
import { SettingsSidebar, SETTINGS_NAV_TEXT_TO_PATH } from './Shell/SettingsSidebar'
import { ADMIN_USERS } from '../../contexts/WorkspaceContext'
import { useNavigationLog } from '../../hooks/useNavigationLog'
import { useDirtyState } from '../../contexts/DirtyStateContext'

const STANDARD_HELP_ITEMS = [
  { text: 'SAP Help Portal' },
  { text: "What's New", separatorAfter: true },
  { text: 'Onboarding Resource Center' },
  { text: 'SAP Signavio Community', separatorAfter: true },
  { text: 'Get Support' },
  { text: 'Provide Feedback' },
]

export default function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { additionalInfo, helpLinks, smartFolders, workspaceName, ownerId, contentLanguages, contextDimensions, userContextValues, setUserContextValues } = useWorkspace()
  const auth = useAuth()
  useNavigationLog()
  const dirtyState = useDirtyState()
  const pendingNavRef = useRef<string | null>(null)
  const [unsavedChangesOpen, setUnsavedChangesOpen] = useState(false)

  // Overlays driven by ?overlay= URL param so they're directly linkable
  const overlayParam = searchParams.get('overlay')
  const clearOverlay = () => setSearchParams(prev => { prev.delete('overlay'); prev.delete('settingsTab'); return prev }, { replace: true })
  const openOverlay = (name: string, tab?: string) =>
    setSearchParams(prev => { prev.set('overlay', name); if (tab) prev.set('settingsTab', tab); else prev.delete('settingsTab'); return prev }, { replace: false })

  const settingsOpen = overlayParam === 'settings'
  const conventionsOpen = overlayParam === 'conventions'
  const aboutOpen = overlayParam === 'about'
  const showWelcome = overlayParam === 'welcome'
  type SettingsTab = 'account' | 'notifications' | 'cookies' | 'subscriptions' | 'connections'
  const settingsTab = (searchParams.get('settingsTab') as SettingsTab | null) ?? 'account'

  const setSettingsOpen = (v: boolean) => v ? openOverlay('settings') : clearOverlay()
  const setConventionsOpen = (v: boolean) => v ? openOverlay('conventions') : clearOverlay()
  const setAboutOpen = (v: boolean) => v ? openOverlay('about') : clearOverlay()

  const [audience, setAudience] = useState<'administrators' | 'modelers'>('administrators')
  const defaultContentLang = contentLanguages.find(l => l.isDefault)?.code ?? contentLanguages[0]?.code ?? 'en-US'
  const [activeContentLanguage, setActiveContentLanguage] = useState(defaultContentLang)
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(['Order to Cash', 'Customer Onboarding', 'Invoice Processing'])
  const [searchRect, setSearchRect] = useState<{ left: number; width: number; top: number } | null>(null)
  const [settingsSearchQuery, setSettingsSearchQuery] = useState('')
  const [navExpanded, setNavExpanded] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [wipBannerVisible, setWipBannerVisible] = useState(true)
  const [errorStateEnabled, setErrorStateEnabled] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [hotspotVisible, setHotspotVisible] = useState(
    () => localStorage.getItem('sig-consolidated-settings-tooltip-dismissed') !== 'true'
  )

  const getNativeName = (code: string) => {
    const base = code.split('-')[0]
    try { return new Intl.DisplayNames([base], { type: 'language' }).of(base) ?? base } catch { return base }
  }
  const getLocalName = (code: string) => {
    const base = code.split('-')[0]
    try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(base) ?? base } catch { return base }
  }

  const openSearchDropdown = () => {
    const el = document.getElementById('shellbar-search')
    if (el) {
      const r = el.getBoundingClientRect()
      setSearchRect({ left: r.left, width: r.width, top: r.bottom })
    }
    setSearchDropdownOpen(true)
  }

  useEffect(() => {
    const handler = (e: FocusEvent) => {
      const searchEl = document.getElementById('shellbar-search')
      if (searchEl && (e.target === searchEl || searchEl.contains(e.target as Node))) openSearchDropdown()
    }
    document.addEventListener('focusin', handler)
    return () => document.removeEventListener('focusin', handler)
  }, [])

  useEffect(() => {
    if (location.pathname === '/repository' && navExpanded) setNavExpanded(false)
  }, [location.pathname])

  useEffect(() => {
    const sb = document.querySelector('ui5-shellbar')
    const sr = (sb as Element & { shadowRoot: ShadowRoot | null })?.shadowRoot
    if (!sr) return
    const style = document.createElement('style')
    style.textContent = '.ui5-shellbar-logo-area { padding-inline-end: 20px !important; }'
    sr.appendChild(style)
    return () => { sr.removeChild(style) }
  }, [])

  const guardedNavigate = (path: string) => {
    if (dirtyState.isDirty()) {
      pendingNavRef.current = path
      setUnsavedChangesOpen(true)
    } else {
      navigate(path)
    }
  }

  const handleNavChange = (e: CustomEvent) => {
    const text = (e.detail?.item as any)?.text as string
    const path = SETTINGS_NAV_TEXT_TO_PATH[text]
    if (path) guardedNavigate(path)
  }

  const handleOuterNavChange = (e: CustomEvent) => {
    const text = (e.detail?.item as any)?.text as string
    const path = NAV_ROUTES[text]
    if (path) { guardedNavigate(path); setNavExpanded(false) }
  }

  const handleHelpMenuItemClick = (e: CustomEvent) => {
    const text = (e.detail?.item as any)?.text as string
    setHelpMenuOpen(false)
    if (text === 'Modeling Conventions') {
      setConventionsOpen(true)
    } else {
      const link = helpLinks.find(l => l.label === text)
      if (link && link.url) window.open('https://' + link.url, '_blank')
    }
  }

  const isSettings = location.pathname.startsWith('/settings')

  return (
    <>
    <NavigationLayout style={{ height: '100vh' }} mode={navExpanded ? 'Expanded' : 'Collapsed'}>
      <div slot="header">
        {wipBannerVisible && (
          <div style={{ height: '2.75rem', background: 'var(--sapPositiveColor)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3rem', position: 'relative' }}>
            <Text style={{ color: 'var(--sapHighlightTextColor)', textAlign: 'center', fontSize: 'var(--sapFontSmallSize)' }}>
              Suite Replica — a non-production prototype for exploring, testing, and building ideas.
            </Text>
            <div style={{ position: 'absolute', right: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Text style={{ color: 'var(--sapHighlightTextColor)', fontSize: 'var(--sapFontSmallSize)', whiteSpace: 'nowrap' }}>Error State</Text>
              <Switch checked={errorStateEnabled} onChange={() => setErrorStateEnabled(v => !v)} style={{ '--ui5-switch-track-checked-bg': 'rgba(255,255,255,0.35)', '--ui5-switch-track-checked-border-color': 'rgba(255,255,255,0.6)', '--ui5-switch-handle-checked-bg': 'var(--sapHighlightTextColor)', '--ui5-switch-track-bg': 'rgba(0,0,0,0.2)', '--ui5-switch-handle-bg': 'rgba(255,255,255,0.7)' } as React.CSSProperties} />
            </div>
            <Button design="Transparent" icon="decline" onClick={() => setWipBannerVisible(false)} tooltip="Dismiss" style={{ position: 'absolute', right: '0.75rem', '--ui5-button-text-color': 'var(--sapContent_ContrastIconColor)', '--ui5-button-base-background': 'transparent', '--ui5-button-base-border-color': 'transparent', '--ui5-button-hover-background': 'rgba(255,255,255,0.15)', '--ui5-button-hover-border-color': 'transparent', '--ui5-button-active-background': 'rgba(255,255,255,0.25)', '--ui5-button-active-border-color': 'transparent' } as React.CSSProperties} />
          </div>
        )}
        <ShellBar primaryTitle="Signavio" onLogoClick={() => navigate('/home')} onProfileClick={() => setUserMenuOpen(v => !v)} style={{ paddingInlineStart: '14px', paddingInlineEnd: '14px' } as React.CSSProperties}>
          <Button slot="startButton" icon="menu2" design="Transparent" tooltip="Toggle navigation" onClick={() => setNavExpanded(v => !v)} />
          <img slot="logo" src="https://www.sap.com/content/dam/application/shared/logos/sap-logo-svg.svg" alt="SAP" style={{ height: 32 }} />
          <div slot="content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SigChipV2 value={workspaceName} design="none" className="shellbar-chip--transparent" />
            <SigChipV2 id="context-chip" value={contextDimensions.filter(d => d.type === 'Selection' && userContextValues[d.id]).map(d => userContextValues[d.id]).join(' · ') || 'Set context'} design="none" className="shellbar-chip--outline" leadingIcon="employee-pane" trailingIcon="slim-arrow-down" onClick={() => setContextOpen(true)} />
          </div>
          <Avatar id="shellbar-profile" slot="profile" initials="CW" colorScheme="Accent6" size="XS" interactive />
          <ShellBarSearch id="shellbar-search" slot="searchField" placeholder="Search your workspace" showClearIcon
            onInput={(e) => { setSearchQuery((e.target as unknown as { value?: string }).value ?? ''); openSearchDropdown() }}
            onSearch={(e) => { const q = ((e.target as unknown as { value?: string }).value ?? '').trim(); if (q) { setSearchHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 5)); setSearchQuery(q); navigate(`/search?q=${encodeURIComponent(q)}`); setSearchDropdownOpen(false) } }}
          />
          <ShellBarItem icon="da" text="Joule" />
          <ShellBarItem icon="bell" text="Notifications" count="3" />
          <ShellBarItem icon="ai" text="Process Consulting Agent" />
          <ShellBarItem icon="px-survey" text="PX Survey" />
          <ShellBarItem icon="walk-me" text="WalkMe" />
          <ShellBarItem icon="headset" text="Built-In Support" />
          <ShellBarItem id="help-menu-btn" icon="sys-help" text="Help" onClick={() => setHelpMenuOpen(v => !v)} />
        </ShellBar>
      </div>

      <Menu opener="help-menu-btn" open={helpMenuOpen} onClose={() => setHelpMenuOpen(false)} onItemClick={handleHelpMenuItemClick}>
        {STANDARD_HELP_ITEMS.map(item => (
          <React.Fragment key={item.text}>
            <MenuItem text={item.text} />
            {item.separatorAfter && <MenuSeparator />}
          </React.Fragment>
        ))}
        <MenuSeparator />
        <MenuItem text="Modeling Conventions" />
        <MenuSeparator />
        {helpLinks.map(link => <MenuItem key={link.id} text={link.label} />)}
      </Menu>

      <UserMenu opener="shellbar-profile" open={userMenuOpen} showManageAccount onClose={() => setUserMenuOpen(false)}
        onItemClick={(e: CustomEvent) => {
          const text = (e.detail?.item as any)?.text
          if (text === 'Settings') { openOverlay('settings', 'account'); setUserMenuOpen(false) }
          else if (text === 'My Subscriptions') { openOverlay('settings', 'subscriptions'); setUserMenuOpen(false) }
          else if (text === 'About') { setAboutOpen(true); setUserMenuOpen(false) }
          else if (text === 'Administrators') setAudience('administrators')
          else if (text === 'Modelers') setAudience('modelers')
          else { const matchedLang = contentLanguages.find(l => getNativeName(l.code) === text); if (matchedLang) setActiveContentLanguage(matchedLang.code) }
        }}
        onManageAccountClick={() => { openOverlay('settings', 'account'); setUserMenuOpen(false) }}
        onSignOutClick={() => { setUserMenuOpen(false); auth.signOut() }}
      >
        <UserMenuAccount slot="accounts" titleText="Claire Westfield" subtitleText="claire@acme.com" avatarInitials="CW" avatarColorScheme="Accent6" selected />
        <UserMenuItem icon="action-settings" text="Settings" />
        <UserMenuItem icon="bell" text="My Subscriptions" />
        <UserMenuItem icon="customer" text="Audience">
          <UserMenuItem icon={audience === 'administrators' ? 'accept' : undefined} text="Administrators" />
          <UserMenuItem icon={audience === 'modelers' ? 'accept' : undefined} text="Modelers" />
        </UserMenuItem>
        <UserMenuItem icon="translate" text="Content Language">
          {contentLanguages.map(lang => <UserMenuItem key={lang.code} icon={activeContentLanguage === lang.code ? 'accept' : undefined} text={getNativeName(lang.code)} additionalText={getLocalName(lang.code)} />)}
        </UserMenuItem>
        <UserMenuItem icon="official-service" text="Legal information">
          <UserMenuItem icon="shield" text="Privacy Policy" />
          <UserMenuItem icon="document-text" text="Terms of Use" />
        </UserMenuItem>
        <UserMenuItem icon="hint" text="About" />
      </UserMenu>

      <UserSettingsDialogView open={settingsOpen} settingsTab={settingsTab} errorStateEnabled={errorStateEnabled} onClose={() => setSettingsOpen(false)} />

      <ConventionsDialog open={conventionsOpen} onClose={() => setConventionsOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} additionalInfo={additionalInfo} owner={ADMIN_USERS.find(u => u.id === ownerId)} />

      <Popover opener="context-chip" open={contextOpen} onClose={() => setContextOpen(false)} placement="Bottom" horizontalAlign="Start" className="no-padding-popover">
        <div style={{ minWidth: '20rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem 0.625rem', borderBottom: '1px solid var(--sapGroup_TitleBorderColor)' }}>
            <div style={{ fontWeight: 'var(--sapFontBoldWeight)', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Set Your Business Context</div>
            <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.125rem' }}>Select an organizational area to scope your Signavio experience</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {contextDimensions.filter(d => d.type === 'Selection').map(dim => (
              <div key={dim.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label>{dim.name}</Label>
                <Select style={{ width: '100%' }} value={(userContextValues[dim.id] as string) ?? ''} onChange={(e: CustomEvent) => { const val = (e.detail as { selectedOption: { value: string } }).selectedOption.value; setUserContextValues(prev => ({ ...prev, [dim.id]: val })) }}>
                  <Option key="all" value="" selected={!userContextValues[dim.id]}>{`All ${dim.name}s`}</Option>
                  {(dim.options ?? []).map(opt => <Option key={opt} value={opt} selected={userContextValues[dim.id] === opt}>{opt}</Option>)}
                </Select>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--sapGroup_TitleBorderColor)' }}>
            <Button design="Transparent" onClick={() => setUserContextValues({ ...USER_CONTEXT_DEFAULTS })}>Reset to profile defaults</Button>
          </div>
        </div>
      </Popover>

      <ShellSideNavigation audience={audience} onSelectionChange={handleOuterNavChange} />

      {isSettings ? (
        <SettingsSidebar searchQuery={settingsSearchQuery} onSearchChange={setSettingsSearchQuery} onNavChange={handleNavChange} errorStateEnabled={errorStateEnabled} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <Outlet />
        </div>
      )}
    </NavigationLayout>

    <SearchDropdown open={searchDropdownOpen} rect={searchRect} query={searchQuery} history={searchHistory} savedSearches={smartFolders} onAddHistory={(term) => setSearchHistory(prev => [term, ...prev.filter(h => h !== term)].slice(0, 5))} onRemoveHistory={(term) => setSearchHistory(prev => prev.filter(h => h !== term))} onClose={() => setSearchDropdownOpen(false)} />
    <WelcomeModal isOpen={showWelcome} onClose={() => { localStorage.setItem('welcomeDismissed', 'true'); clearOverlay() }} />
    {hotspotVisible && <HotspotTooltip onDismiss={() => { localStorage.setItem('sig-consolidated-settings-tooltip-dismissed', 'true'); setHotspotVisible(false) }} />}
    <MessageBox open={unsavedChangesOpen} type="Warning" titleText="Unsaved Changes" actions={['Save', 'Discard Changes', 'Cancel']} emphasizedAction="Save"
      onClose={(action) => {
        setUnsavedChangesOpen(false)
        if (action === 'Save') { dirtyState.save(); if (pendingNavRef.current) navigate(pendingNavRef.current); pendingNavRef.current = null }
        else if (action === 'Discard Changes') { dirtyState.reset(); if (pendingNavRef.current) navigate(pendingNavRef.current); pendingNavRef.current = null }
        else { pendingNavRef.current = null }
      }}
    >
      <div style={{ padding: '1rem' }}>You have unsaved changes. What would you like to do?</div>
    </MessageBox>
    </>
  )
}
