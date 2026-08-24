import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  NavigationLayout,
  ShellBar,
  ShellBarItem,
  ShellBarSearch,
  SideNavigation,
  SideNavigationGroup,
  SideNavigationItem,
  Avatar,
  Button,
  Title,
  UserMenu,
  UserMenuAccount,
  UserMenuItem,
  UserSettingsDialog,
  UserSettingsItem,
  UserSettingsAccountView,
  UserSettingsView,
  Text,
  Label,
  Input,
  Select,
  Option,
  Link,
  Switch,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  List,
  ListItemStandard,
  ListItemCustom,
  ListItemGroup,
  Menu,
  MenuItem,
  MenuSeparator,
  Toast,
  ToolbarItem,
  Popover,
  Icon,
  IllustratedMessage,
  MessageBox,
  Tag,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/UnableToLoad.js'
import { SigChipV2, SigDomainObject, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { useWorkspace, USER_CONTEXT_DEFAULTS } from '../../contexts/WorkspaceContext'
import { usePCA } from '../../contexts/PCAContext'
import { useRelease } from '../../contexts/ReleaseContext'
import { useAuth } from '../../contexts/AuthContext'
import SearchDropdown from './SearchDropdown'
import WelcomeModal from './WelcomeModal'
import HotspotTooltip from './HotspotTooltip'
import ConventionsDialog from './Shell/ConventionsDialog'
import AboutDialog from './Shell/AboutDialog'
import { ConnectionsSettingsView } from './Shell/ConnectionsSettingsView'
import { ADMIN_USERS } from '../../contexts/WorkspaceContext'
import { useNavigationLog } from '../../hooks/useNavigationLog'
import { useMockSave } from '../../hooks/useMockSave'
import { searchSettings } from '../../settingsSearch'
import { useDirtyState } from '../../contexts/DirtyStateContext'


const STANDARD_HELP_ITEMS = [
  { text: 'SAP Help Portal' },
  { text: "What's New", separatorAfter: true },
  { text: 'Onboarding Resource Center' },
  { text: 'SAP Signavio Community', separatorAfter: true },
  { text: 'Get Support' },
  { text: 'Provide Feedback' },
]

const SETTINGS_NAV = [
  {
    title: 'Users and Access',
    items: [
      { text: 'Users', path: '/users' },
      { text: 'Groups', path: '/groups' },
      { text: 'Audiences', path: '/audience' },
      { text: 'Resource Access', path: '/resource-access' },
      { text: 'Feature Access', path: '/feature-access' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { text: 'Workspace Details', path: '/general-settings' },
      { text: 'Process Landscape', path: '/process-landscape-settings' },
      { text: 'Theming', path: '/theme' },
      { text: 'Navigation', path: '/navigation' },
      { text: 'Collaboration', path: '/collaboration' },
      { text: 'Help Resources', path: '/help-resources' },
    ],
  },
  {
    title: 'Page Layout',
    items: [
      { text: 'Home Page', path: '/home-page' },
      { text: 'Model Page', path: '/diagram-page' },
      { text: 'Fact Sheet', path: '/fact-sheet' },
    ],
  },
  {
    title: 'Assets and Attributes',
    items: [
      { text: 'Asset Types', path: '/asset-types' },
      { text: 'Dictionary Categories', path: '/dictionary-categories' },
      { text: 'Attribute Definitions', path: '/attribute-definitions' },
    ],
  },
  {
    title: 'Modeling and Governance',
    items: [
      { text: 'Modeling Preferences', path: '/modeling-preferences' },
      { text: 'Modeling Languages and Elements', path: '/modeling-languages' },
      { text: 'Modeling Conventions', path: '/modeling-conventions' },
      { text: 'Attribute Overlays', path: '/attribute-visualization' },
      { text: 'Approval Workflows', path: '/journey-model-approval' },
      { text: 'Process Rating', path: '/process-rating' },
    ],
  },
  {
    title: 'SAP-Defined Business Content',
    items: [
      { text: 'Data Sharing and Industry', path: '/data-sharing-industry' },
      { text: 'Data Collection Configuration', path: '/data-collection-config' },
      { text: 'Access Configuration', path: '/access-configuration' },
      { text: 'Data Privacy Management', path: '/data-privacy-management' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { text: 'SAP Signavio Process Insights', path: '/process-insights' },
      { text: 'SAP Cloud ALM', path: '/cloud-alm' },
      { text: 'WalkMe Digital Adoption Platform', path: '/walkme' },
    ],
  },
  {
    title: 'Security',
    items: [
      { text: 'Authentication', path: '/authentication' },
      { text: 'Network and Privacy', path: '/network-privacy' },
    ],
  },
]

const TEXT_TO_PATH: Record<string, string> = {}
SETTINGS_NAV.forEach(group => {
  group.items.forEach(item => {
    TEXT_TO_PATH[item.text] = item.path
  })
})

export default function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { additionalInfo, helpLinks, smartFolders, workspaceName, ownerId, contentLanguages, contextDimensions, userContextValues, setUserContextValues } = useWorkspace()
  const { getActiveConversation } = usePCA()
  const { currentRelease } = useRelease()
  const auth = useAuth()
  useNavigationLog()
  const dirtyState = useDirtyState()
  const pendingNavRef = useRef<string | null>(null)
  const [unsavedChangesOpen, setUnsavedChangesOpen] = useState(false)

  // Overlay state — driven by ?overlay= URL param so they're directly linkable
  const overlayParam = searchParams.get('overlay')

  const clearOverlay = () => {
    setSearchParams(prev => { prev.delete('overlay'); prev.delete('settingsTab'); return prev }, { replace: true })
  }

  const [audience, setAudience] = useState<'administrators' | 'modelers'>('administrators')
  const defaultContentLang = contentLanguages.find(l => l.isDefault)?.code ?? contentLanguages[0]?.code ?? 'en-US'
  const [activeContentLanguage, setActiveContentLanguage] = useState(defaultContentLang)
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(['Order to Cash', 'Customer Onboarding', 'Invoice Processing'])
  const [searchRect, setSearchRect] = useState<{ left: number; width: number; top: number } | null>(null)

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
      if (searchEl && (e.target === searchEl || searchEl.contains(e.target as Node))) {
        openSearchDropdown()
      }
    }
    document.addEventListener('focusin', handler)
    return () => document.removeEventListener('focusin', handler)
  }, [])

  const [settingsSearchQuery, setSettingsSearchQuery] = useState('')
  type SettingsTab = 'account' | 'notifications' | 'cookies' | 'subscriptions' | 'connections'
  const settingsTab = (searchParams.get('settingsTab') as SettingsTab | null) ?? 'account'
  // @ts-ignore
  const _setSettingsTab = (tab: SettingsTab) =>
    setSearchParams(prev => { prev.set('settingsTab', tab); return prev }, { replace: true })
  const [navExpanded, setNavExpanded] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [wipBannerVisible, setWipBannerVisible] = useState(true)
  const [errorStateEnabled, setErrorStateEnabled] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [hotspotVisible, setHotspotVisible] = useState(
    () => localStorage.getItem('sig-consolidated-settings-tooltip-dismissed') !== 'true'
  )

  // URL-driven overlays: ?overlay=welcome|about|conventions|settings
  const settingsOpen = overlayParam === 'settings'
  const conventionsOpen = overlayParam === 'conventions'
  const aboutOpen = overlayParam === 'about'
  const showWelcome = overlayParam === 'welcome'

  const openOverlay = (name: string, tab?: string) =>
    setSearchParams(prev => { prev.set('overlay', name); if (tab) prev.set('settingsTab', tab); else prev.delete('settingsTab'); return prev }, { replace: false })
  const setSettingsOpen = (v: boolean) => v ? openOverlay('settings') : clearOverlay()
  const setConventionsOpen = (v: boolean) => v ? openOverlay('conventions') : clearOverlay()
  const setAboutOpen = (v: boolean) => v ? openOverlay('about') : clearOverlay()

  // Profile fields
  const [profileTitle, setProfileTitle] = useState('')
  const [firstName, setFirstName] = useState('Claire')
  const [lastName, setLastName] = useState('Westfield')
  const [profileEmail, setProfileEmail] = useState('claire@acme.com')
  const [phone, setPhone] = useState('017623707105')
  const [company, setCompany] = useState('SAP SE')

  // Track initial profile values for cancel/reset
  const [savedProfile, setSavedProfile] = useState({ profileTitle: '', firstName: 'Claire', lastName: 'Westfield', profileEmail: 'claire@acme.com', phone: '017623707105', company: 'SAP SE' })
  const [profileDirty, setProfileDirty] = useState(false)
  const { saveState: profileSaveState, triggerSave: triggerProfileSave } = useMockSave()

  const INTERFACE_LANGUAGES = ['Deutsch', 'English', 'Français', 'Italiano', 'Русский', 'Español', 'Nederlands', '日本語', '한국어', 'Português (Portugal)', 'Português (Brazil)', '中文 (simplified)', '中文 (traditional)']

  const getNativeName = (code: string) => {
    const base = code.split('-')[0]
    try { return new Intl.DisplayNames([base], { type: 'language' }).of(base) ?? base } catch { return base }
  }
  const getLocalName = (code: string) => {
    const base = code.split('-')[0]
    try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(base) ?? base } catch { return base }
  }

  const [interfaceLanguage, setInterfaceLanguage] = useState('English')
  const [_dateFormat, _setDateFormat] = useState('DD/MM/YYYY')
  const [_timeFormat, _setTimeFormat] = useState('HH:MM (24-hour)')
  const [_userCurrency, _setUserCurrency] = useState('United States Dollar (USD)')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [retypePassword, setRetypePassword] = useState('')
  type SubscriptionObject = 'Process Model' | 'Quick Model' | 'Archimate' | 'Org Chart'
  type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly'
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

  const setProfileField = <K extends keyof typeof savedProfile>(field: K, value: typeof savedProfile[K]) => {
    if (field === 'profileTitle') setProfileTitle(value as string)
    else if (field === 'firstName') setFirstName(value as string)
    else if (field === 'lastName') setLastName(value as string)
    else if (field === 'profileEmail') setProfileEmail(value as string)
    else if (field === 'phone') setPhone(value as string)
    else if (field === 'company') setCompany(value as string)
    setProfileDirty(true)
  }

  const handleProfileSave = () => {
    setSavedProfile({ profileTitle, firstName, lastName, profileEmail, phone, company })
    setProfileDirty(false)
    triggerProfileSave()
  }

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
    const path = TEXT_TO_PATH[text]
    if (path) guardedNavigate(path)
  }

  const handleOuterNavChange = (e: CustomEvent) => {
    const text = (e.detail?.item as any)?.text as string
    if (text === 'Home') {
      guardedNavigate('/home?fresh=1')
      setNavExpanded(false)
    } else if (text === 'Repository') {
      guardedNavigate('/repository')
      setNavExpanded(false)
    } else if (text === 'Reporting') {
      guardedNavigate('/reporting')
      setNavExpanded(false)
    } else if (text === 'Process Consulting Agent') {
      guardedNavigate('/process-consulting-agent')
      setNavExpanded(false)
    } else if (text === 'Process Landscape') {
      guardedNavigate('/process-landscape')
      setNavExpanded(false)
    } else if (text === 'Workspace Settings') {
      guardedNavigate('/users')
      setNavExpanded(false)
    } else if (text === 'Modeler') {
      guardedNavigate('/modeler')
      setNavExpanded(false)
    } else if (text === 'Recent') {
      guardedNavigate('/recent')
      setNavExpanded(false)
    } else if (text === 'Newsfeed') {
      guardedNavigate('/newsfeed')
      setNavExpanded(false)
    } else if (text === 'Favorites') {
      guardedNavigate('/favorites')
      setNavExpanded(false)
    } else if (text === 'Strategy Execution') {
      guardedNavigate('/strategy-execution')
      setNavExpanded(false)
    } else if (text === 'Objectives') {
      guardedNavigate('/objectives')
      setNavExpanded(false)
    } else if (text === 'Initiatives') {
      guardedNavigate('/initiatives')
      setNavExpanded(false)
    } else if (text === 'Insights') {
      guardedNavigate('/insights')
      setNavExpanded(false)
    } else if (text === 'Value Accelerator Library') {
      guardedNavigate('/value-accelerator')
      setNavExpanded(false)
    } else if (text === 'Discover') {
      guardedNavigate('/discover')
      setNavExpanded(false)
    } else if (text === 'Benchmarking Analytics') {
      guardedNavigate('/benchmarking-analytics')
      setNavExpanded(false)
    } else if (text === 'Improvement Opportunities') {
      guardedNavigate('/improvement-opportunities')
      setNavExpanded(false)
    } else if (text === 'Recommendations') {
      guardedNavigate('/recommendations')
      setNavExpanded(false)
    } else if (text === 'Cloud Transformation') {
      guardedNavigate('/cloud-transformation')
      setNavExpanded(false)
    }
  }

  useEffect(() => {
    if (location.pathname === '/repository' && navExpanded) {
      setNavExpanded(false)
    }
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

  const isRepository = location.pathname === '/repository'
  const isSearch = location.pathname === '/search'
  const isReporting = location.pathname === '/reporting'
  const isHome = location.pathname === '/home' && !getActiveConversation()?.messages.length
  const isPCA = location.pathname === '/process-consulting-agent'
  const isProcessLandscape = location.pathname === '/process-landscape'
  const isNewsfeed = location.pathname === '/newsfeed'
  const isRecent = location.pathname === '/recent'
  const isFavorites = location.pathname === '/favorites'
  const isObjectives = location.pathname === '/objectives'
  const isInitiatives = /^\/initiatives/.test(location.pathname)
  const isStrategyExecution = location.pathname === '/strategy-execution'
  const isInsights = location.pathname === '/insights'
  const isValueAccelerator = location.pathname === '/value-accelerator'
  const isDiscover = location.pathname === '/discover'
  const isRecommendations = /^\/recommendations/.test(location.pathname)
  const isImprovementOpportunities = location.pathname === '/improvement-opportunities'
  const isCloudTransformation = /^\/cloud-transformation/.test(location.pathname)
  const isBenchmarkingAnalytics = /^\/benchmarking-analytics/.test(location.pathname)
  const isModeler = /^\/modeler/.test(location.pathname)
  const isModelingAssetType = /^\/asset-types\/(bpmn|dmn|value-chain|nav-map)/.test(location.pathname)

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

  return (
    <>
    <NavigationLayout style={{ height: '100vh' }} mode={navExpanded ? 'Expanded' : 'Collapsed'}>
      <div slot="header">
        {wipBannerVisible && (
          <div style={{
            height: '2.75rem',
            background: 'var(--sapPositiveColor)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3rem',
            position: 'relative',
          }}>
            <Text style={{ color: 'var(--sapHighlightTextColor)', textAlign: 'center', fontSize: 'var(--sapFontSmallSize)' }}>
              Suite Replica — a non-production prototype for exploring, testing, and building ideas.
            </Text>
            <div style={{ position: 'absolute', right: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Text style={{ color: 'var(--sapHighlightTextColor)', fontSize: 'var(--sapFontSmallSize)', whiteSpace: 'nowrap' }}>
                Error State
              </Text>
              <Switch
                checked={errorStateEnabled}
                onChange={() => setErrorStateEnabled(v => !v)}
                style={{
                  '--ui5-switch-track-checked-bg': 'rgba(255,255,255,0.35)',
                  '--ui5-switch-track-checked-border-color': 'rgba(255,255,255,0.6)',
                  '--ui5-switch-handle-checked-bg': 'var(--sapHighlightTextColor)',
                  '--ui5-switch-track-bg': 'rgba(0,0,0,0.2)',
                  '--ui5-switch-handle-bg': 'rgba(255,255,255,0.7)',
                } as React.CSSProperties}
              />
            </div>
            <Button
              design="Transparent"
              icon="decline"
              onClick={() => setWipBannerVisible(false)}
              tooltip="Dismiss"
              style={{
                position: 'absolute', right: '0.75rem',
                '--ui5-button-text-color': 'var(--sapContent_ContrastIconColor)',
                '--ui5-button-base-background': 'transparent',
                '--ui5-button-base-border-color': 'transparent',
                '--ui5-button-hover-background': 'rgba(255,255,255,0.15)',
                '--ui5-button-hover-border-color': 'transparent',
                '--ui5-button-active-background': 'rgba(255,255,255,0.25)',
                '--ui5-button-active-border-color': 'transparent',
              } as React.CSSProperties}
            />
          </div>
        )}
      <ShellBar
        primaryTitle="Signavio"
        onLogoClick={() => navigate('/home')}
        onProfileClick={() => setUserMenuOpen(v => !v)}
        style={{ paddingInlineStart: '14px', paddingInlineEnd: '14px' } as React.CSSProperties}
      >
        <Button
          slot="startButton"
          icon="menu2"
          design="Transparent"
          tooltip="Toggle navigation"
          onClick={() => setNavExpanded(v => !v)}
        />
        <img slot="logo" src="https://www.sap.com/content/dam/application/shared/logos/sap-logo-svg.svg" alt="SAP" style={{ height: 32 }} />
        <div slot="content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SigChipV2
            value={workspaceName}
            design="none"
            className="shellbar-chip--transparent"
          />
          <SigChipV2
            id="context-chip"
            value={contextDimensions.filter(d => d.type === 'Selection' && userContextValues[d.id]).map(d => userContextValues[d.id]).join(' · ') || 'Set context'}
            design="none"
            className="shellbar-chip--outline"
            leadingIcon="employee-pane"
            trailingIcon="slim-arrow-down"
            onClick={() => setContextOpen(true)}
          />
        </div>
        <Avatar id="shellbar-profile" slot="profile" initials="CW" colorScheme="Accent6" size="XS" interactive />
        <ShellBarSearch
          id="shellbar-search"
          slot="searchField"
          placeholder="Search your workspace"
          showClearIcon
          onInput={(e) => {
            setSearchQuery((e.target as unknown as { value?: string }).value ?? '')
            openSearchDropdown()
          }}
          onSearch={(e) => {
            const q = ((e.target as unknown as { value?: string }).value ?? '').trim()
            if (q) {
              setSearchHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 5))
              setSearchQuery(q)
              navigate(`/search?q=${encodeURIComponent(q)}`)
              setSearchDropdownOpen(false)
            }
          }}
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

      <Menu
        opener="help-menu-btn"
        open={helpMenuOpen}
        onClose={() => setHelpMenuOpen(false)}
        onItemClick={handleHelpMenuItemClick}
      >
        {STANDARD_HELP_ITEMS.map(item => (
          <React.Fragment key={item.text}>
            <MenuItem text={item.text} />
            {item.separatorAfter && <MenuSeparator />}
          </React.Fragment>
        ))}
        <MenuSeparator />
        <MenuItem text="Modeling Conventions" />
        <MenuSeparator />
        {helpLinks.map(link => (
          <MenuItem key={link.id} text={link.label} />
        ))}
      </Menu>

      <UserMenu
        opener="shellbar-profile"
        open={userMenuOpen}
        showManageAccount
        onClose={() => setUserMenuOpen(false)}
        onItemClick={(e: CustomEvent) => {
          const text = (e.detail?.item as any)?.text
          if (text === 'Settings') {
            openOverlay('settings', 'account')
            setUserMenuOpen(false)
          } else if (text === 'My Subscriptions') {
            openOverlay('settings', 'subscriptions')
            setUserMenuOpen(false)
          } else if (text === 'About') {
            setAboutOpen(true)
            setUserMenuOpen(false)
          } else if (text === 'Administrators') {
            setAudience('administrators')
          } else if (text === 'Modelers') {
            setAudience('modelers')
          } else {
            const matchedLang = contentLanguages.find(l => getNativeName(l.code) === text)
            if (matchedLang) setActiveContentLanguage(matchedLang.code)
          }
        }}
        onManageAccountClick={() => { openOverlay('settings', 'account'); setUserMenuOpen(false) }}
        onSignOutClick={() => { setUserMenuOpen(false); auth.signOut() }}
      >
        <UserMenuAccount
          slot="accounts"
          titleText="Claire Westfield"
          subtitleText="claire@acme.com"
          avatarInitials="CW"
          avatarColorScheme="Accent6"
          selected
        />
        <UserMenuItem icon="action-settings" text="Settings" />
        <UserMenuItem icon="bell" text="My Subscriptions" />
        <UserMenuItem icon="customer" text="Audience">
          <UserMenuItem icon={audience === 'administrators' ? 'accept' : undefined} text="Administrators" />
          <UserMenuItem icon={audience === 'modelers' ? 'accept' : undefined} text="Modelers" />
        </UserMenuItem>
        <UserMenuItem icon="translate" text="Content Language">
            {contentLanguages.map(lang => (
              <UserMenuItem
                key={lang.code}
                icon={activeContentLanguage === lang.code ? 'accept' : undefined}
                text={getNativeName(lang.code)}
                additionalText={getLocalName(lang.code)}
              />
            ))}
          </UserMenuItem>
        <UserMenuItem icon="official-service" text="Legal information">
          <UserMenuItem icon="shield" text="Privacy Policy" />
          <UserMenuItem icon="document-text" text="Terms of Use" />
        </UserMenuItem>
        <UserMenuItem icon="hint" text="About" />
      </UserMenu>

      <UserSettingsDialog
        open={settingsOpen}
        headerText="Settings"
        className="ui5-content-density-compact"
        onClose={() => { setSettingsOpen(false) }}
        style={{ '--sapFontHeader4Size': 'var(--sapFontHeader5Size)' } as React.CSSProperties}
      >
        <UserSettingsItem icon="employee" text="Account" headerText="Account" selected={settingsTab === 'account'}>
          {errorStateEnabled ? (
            <UserSettingsView text="Account" selected>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
                <IllustratedMessage
                  name="UnableToLoad"
                  titleText="Your account information couldn't be loaded"
                  subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists."
                >
                  <Button design="Emphasized" onClick={() => {}}>Retry</Button>
                </IllustratedMessage>
              </div>
            </UserSettingsView>
          ) : (
          <UserSettingsAccountView text="Account" selected>
            <UserMenuAccount
              slot="account"
              titleText="Claire Westfield"
              subtitleText="claire@acme.com"
              avatarInitials="CW"
              avatarColorScheme="Accent6"
            />
            {/* Personal Data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem 0 0' }}>
              <Title level="H4">Personal Data</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <Label for="profile-title">Title</Label>
                  <Input id="profile-title" value={profileTitle} style={{ width: '100%' }}
                    onInput={e => setProfileField('profileTitle', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <Label for="profile-first-name">First name</Label>
                    <Input id="profile-first-name" value={firstName} style={{ width: '100%' }}
                      onInput={e => setProfileField('firstName', (e.target as unknown as HTMLInputElement).value)} />
                  </div>
                  <div>
                    <Label for="profile-last-name">Last name</Label>
                    <Input id="profile-last-name" value={lastName} style={{ width: '100%' }}
                      onInput={e => setProfileField('lastName', (e.target as unknown as HTMLInputElement).value)} />
                  </div>
                </div>
                <div>
                  <Label for="profile-email">Email</Label>
                  <Input id="profile-email" value={profileEmail} style={{ width: '100%' }}
                    onInput={e => setProfileField('profileEmail', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="profile-phone">Phone</Label>
                  <Input id="profile-phone" value={phone} style={{ width: '100%' }}
                    onInput={e => setProfileField('phone', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="profile-company">Company</Label>
                  <Input id="profile-company" value={company} style={{ width: '100%' }}
                    onInput={e => setProfileField('company', (e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="ui-language">Interface Language</Label>
                  <Select id="ui-language" style={{ width: '100%' }}
                    onChange={e => { setInterfaceLanguage((e.detail.selectedOption as HTMLElement).textContent ?? interfaceLanguage); setProfileDirty(true) }}>
                    {INTERFACE_LANGUAGES.map(l => <Option key={l} selected={l === interfaceLanguage}>{l}</Option>)}
                  </Select>
                </div>
              </div>
              <Button design="Default" disabled={!profileDirty} style={{ alignSelf: 'stretch' }} onClick={handleProfileSave}>Save</Button>
            </div>

            {/* Security */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0 0' }}>
              <Title level="H4">Security</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <Label for="current-password">Current password</Label>
                  <Input id="current-password" type="Password" value={currentPassword} style={{ width: '100%' }}
                    onInput={e => setCurrentPassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="new-password">New password</Label>
                  <Input id="new-password" type="Password" value={newPassword} style={{ width: '100%' }}
                    onInput={e => setNewPassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
                <div>
                  <Label for="retype-password">Confirm new password</Label>
                  <Input id="retype-password" type="Password" value={retypePassword} style={{ width: '100%' }}
                    onInput={e => setRetypePassword((e.target as unknown as HTMLInputElement).value)} />
                </div>
              </div>
              <Button design="Default" style={{ alignSelf: 'stretch' }}>Change Password</Button>
            </div>

            {/* Groups & Licenses */}
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
              <Table
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell>Event Type</TableHeaderCell>
                    <TableHeaderCell>Email Notifications</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {notifications.map(n => (
                  <TableRow key={n.id}>
                    <TableCell><Text>{n.label}</Text></TableCell>
                    <TableCell>
                      <Switch checked={n.enabled} onChange={() => toggleNotification(n.id)} />
                    </TableCell>
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
              <Text>
                Allow or prevent SAP Signavio from using functional cookies to analyze application usage so we can measure and improve this software.
              </Text>
              <Text>
                Find more details on our cookie policy in our <Link href="#">Cookie Statement</Link>.
              </Text>
              <div>
                <Button design="Default">Manage Cookies</Button>
              </div>
            </div>
          </UserSettingsView>
        </UserSettingsItem>
        <UserSettingsItem icon="bell" text="Subscriptions" headerText="Subscriptions" selected={settingsTab === 'subscriptions'}>
          {errorStateEnabled ? (
            <UserSettingsView text="Subscriptions">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
                <IllustratedMessage
                  name="UnableToLoad"
                  titleText="Your subscriptions couldn't be loaded"
                  subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists."
                >
                  <Button design="Emphasized" onClick={() => {}}>Retry</Button>
                </IllustratedMessage>
              </div>
            </UserSettingsView>
          ) : (
          <UserSettingsView text="Subscriptions">
            {(() => {
              const sorted = [...subscriptions].sort((a, b) => {
                if (subSortBy === 'Name') return a.label.localeCompare(b.label)
                return b.lastChanged.localeCompare(a.lastChanged)
              })

              const renderItem = (sub: typeof subscriptions[number]) => {
                return (
                  <ListItemCustom
                    key={sub.id}
                    data-id={sub.id}
                    type="Active"
                    style={{ paddingBlock: '6px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <SigDomainObject size="XS" object={sub.object as never} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)',
                          color: 'var(--sapList_TextColor, #1d2d3e)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                        }}>
                          {sub.label}
                        </Text>
                        <Text style={{
                          display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                        }}>
                          {sub.object} · {sub.frequency}
                        </Text>
                      </div>
                    </div>
                  </ListItemCustom>
                )
              }

              const grouped = subGroupBy === 'Type'
                ? (['Process Model', 'Quick Model', 'Archimate', 'Org Chart'] as const)
                    .map(type => ({ type, items: sorted.filter(s => s.object === type) }))
                    .filter(g => g.items.length > 0)
                : null

              return (
                <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
                  <SigTableWrapper
                    titleSlot={
                      <ToolbarItem>
                        <Title level="H5" wrappingType="None">
                          All ({subscriptions.length})
                        </Title>
                      </ToolbarItem>
                    }
                    sortSlot={
                      <ToolbarItem>
                        <SigChipV2
                          id="sub-sort-chip"
                          label="Sort by"
                          value={subSortBy}
                          trailingIcon="slim-arrow-down"
                          onClick={() => setSubSortMenuOpen(true)}
                        />
                        <Menu
                          open={subSortMenuOpen}
                          opener="sub-sort-chip"
                          onClose={() => setSubSortMenuOpen(false)}
                          onItemClick={(e: CustomEvent) => { setSubSortBy(e.detail.text as 'Name' | 'Last Changed'); setSubSortMenuOpen(false) }}
                        >
                          <MenuItem text="Name" />
                          <MenuItem text="Last Changed" />
                        </Menu>
                      </ToolbarItem>
                    }
                    groupSlot={
                      <ToolbarItem>
                        <SigChipV2
                          id="sub-group-chip"
                          label="Group by"
                          value={subGroupBy === 'None' ? 'Select' : subGroupBy}
                          trailingIcon="slim-arrow-down"
                          onClick={() => setSubGroupMenuOpen(true)}
                        />
                        <Menu
                          open={subGroupMenuOpen}
                          opener="sub-group-chip"
                          onClose={() => setSubGroupMenuOpen(false)}
                          onItemClick={(e: CustomEvent) => { setSubGroupBy(e.detail.text as 'None' | 'Type'); setSubGroupMenuOpen(false) }}
                        >
                          <MenuItem text="None" />
                          <MenuItem text="Type" />
                        </Menu>
                      </ToolbarItem>
                    }
                  >
                    {subscriptions.length === 0 ? (
                      <Text style={{ color: 'var(--sapContent_LabelColor)', padding: '1rem' }}>No subscriptions</Text>
                    ) : grouped ? (
                      <List separators="Inner" selectionMode="Delete" onItemDelete={(e: CustomEvent) => {
                          const id = (e.detail.item as HTMLElement).dataset.id
                          setSubscriptions(prev => prev.filter(s => s.id !== id))
                        }}>
                        {grouped.map(group => (
                          <ListItemGroup key={group.type} headerText={group.type}>
                            {group.items.map(renderItem)}
                          </ListItemGroup>
                        ))}
                      </List>
                    ) : (
                      <List separators="Inner" selectionMode="Delete" onItemDelete={(e: CustomEvent) => {
                          const id = (e.detail.item as HTMLElement).dataset.id
                          setSubscriptions(prev => prev.filter(s => s.id !== id))
                        }}>
                        {sorted.map(renderItem)}
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

      <ConventionsDialog open={conventionsOpen} onClose={() => setConventionsOpen(false)} />

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} additionalInfo={additionalInfo} owner={ADMIN_USERS.find(u => u.id === ownerId)} />

      <Popover
        opener="context-chip"
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        placement="Bottom"
        horizontalAlign="Start"
        className="no-padding-popover"
      >
        <div style={{ minWidth: '20rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem 0.625rem', borderBottom: '1px solid var(--sapGroup_TitleBorderColor)' }}>
            <div style={{ fontWeight: 'var(--sapFontBoldWeight)', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>Set Your Business Context</div>
            <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.125rem' }}>Select an organizational area to scope your Signavio experience</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {contextDimensions.filter(d => d.type === 'Selection').map(dim => (
              <div key={dim.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label>{dim.name}</Label>
                <Select
                  style={{ width: '100%' }}
                  value={(userContextValues[dim.id] as string) ?? ''}
                  onChange={(e: CustomEvent) => {
                    const val = (e.detail as { selectedOption: { value: string } }).selectedOption.value
                    setUserContextValues(prev => ({ ...prev, [dim.id]: val }))
                  }}
                >
                  <Option key="all" value="" selected={!userContextValues[dim.id]}>{`All ${dim.name}s`}</Option>
                  {(dim.options ?? []).map(opt => (
                    <Option key={opt} value={opt} selected={userContextValues[dim.id] === opt}>{opt}</Option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--sapGroup_TitleBorderColor)' }}>
            <Button
              design="Transparent"
              onClick={() => setUserContextValues({ ...USER_CONTEXT_DEFAULTS })}
            >
              Reset to profile defaults
            </Button>
          </div>
        </div>
      </Popover>

      <SideNavigation slot="sideContent" onSelectionChange={handleOuterNavChange}>
        <SideNavigationItem icon="home" text="Home" selected={isHome} />
        <SideNavigationItem icon="SAP-icons-v4/news" text="Newsfeed" selected={isNewsfeed} />
        <SideNavigationItem icon="unfavorite" text="Favorites" selected={isFavorites} />
        <SideNavigationItem icon="history" text="Recent" selected={isRecent} />
        <SideNavigationItem icon="task" text="Tasks" />
        <SideNavigationGroup text="Browse and Manage" expanded>
          <SideNavigationItem icon="folder-blank" text="Repository" selected={isRepository} />
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/navigation-map" text="Process Landscape" selected={isProcessLandscape} />}
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/company-memory" text="Company Memory" />}
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/rocket" text="Value Accelerator Library" selected={isValueAccelerator} />}
        </SideNavigationGroup>
        {currentRelease !== 'NS2' && (
          <SideNavigationGroup text="Transform and Realize Value" expanded>
            {currentRelease !== 'R27Q1' && <SideNavigationItem icon="explorer" text="Discover" selected={isDiscover} />}
            {currentRelease !== 'R27Q1'
              ? audience === 'administrators' && <SideNavigationItem icon="overview-chart" text="Strategy Execution" selected={isStrategyExecution} />
              : <>
                  {audience === 'administrators' && <SideNavigationItem icon="target-group" text="Objectives" selected={isObjectives} />}
                  {audience === 'administrators' && <SideNavigationItem icon="overview-chart" text="Initiatives" selected={isInitiatives} />}
                </>
            }
            {audience === 'administrators' && <SideNavigationItem icon="compare-2" text="Benchmarking Analytics" selected={isBenchmarkingAnalytics} />}
            <SideNavigationItem icon="lightbulb" text="Insights" selected={isInsights} />
            {audience === 'administrators' && <SideNavigationItem icon="money-bills" text="Improvement Opportunities" selected={isImprovementOpportunities} />}
            {audience === 'administrators' && <SideNavigationItem icon="accept" text="Recommendations" selected={isRecommendations} />}
            {audience === 'administrators' && <SideNavigationItem icon="cloud" text="Cloud Transformation" selected={isCloudTransformation} />}
          </SideNavigationGroup>
        )}
        {currentRelease !== 'NS2' && audience === 'administrators' && (
          <SideNavigationGroup text="Mine and Analyze" expanded>
            <SideNavigationItem icon="provision" text="Data Management" />
            <SideNavigationItem icon="developer-settings" text="Analysis Configuration" />
            <SideNavigationItem icon="SAP-icons-v4/process-intelligence" text="Process Analysis" />
            <SideNavigationItem icon="workflow-tasks" text="Analysis Workflows" />
          </SideNavigationGroup>
        )}
        <SideNavigationGroup text="Model and Govern" expanded>
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/process-manager" text="Process Manager" />}
          <SideNavigationItem icon="write-new" text="Modeler" selected={isModeler}>
            <Tag slot="tag" design="Set2" colorScheme="5" hideStateIcon>Beta</Tag>
          </SideNavigationItem>
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/customer-journey" text="Journey Models" />}
          {currentRelease !== 'NS2' && <SideNavigationItem icon="SAP-icons-v4/bpmn-type-service" text="Governance Workflows" />}
        </SideNavigationGroup>
        {currentRelease !== 'NS2' && <SideNavigationItem slot="fixedItems" icon="lab" text="Lab Space" />}
        {audience === 'administrators' && <SideNavigationItem slot="fixedItems" icon="SAP-icons-v4/report" text="Reporting" selected={isReporting} />}
        {audience === 'administrators' && <SideNavigationItem slot="fixedItems" icon="action-settings" text="Workspace Settings" selected={!isRepository && !isSearch && !isReporting && !isHome && !isPCA && !isProcessLandscape && !isRecent && !isFavorites && !isNewsfeed && !isObjectives && !isInitiatives && !isStrategyExecution && !isInsights && !isValueAccelerator && !isDiscover && !isRecommendations && !isImprovementOpportunities && !isCloudTransformation && !isBenchmarkingAnalytics} />}
      </SideNavigation>

      {isRepository || isSearch || isReporting || isHome || isPCA || isModeler || isModelingAssetType || isProcessLandscape || isRecent || isFavorites || isNewsfeed || isObjectives || isInitiatives || isStrategyExecution || isInsights || isValueAccelerator || isDiscover || isRecommendations || isImprovementOpportunities || isCloudTransformation || isBenchmarkingAnalytics || (location.pathname === '/home' && !!getActiveConversation()?.messages.length) ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
          <Outlet />
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          <div style={{ width: '17rem', flexShrink: 0, borderRight: '1px solid var(--sapList_BorderColor)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--sapGroup_ContentBackground)' }}>
            <div style={{ padding: '1.25rem 1rem 1rem 1.5rem', flexShrink: 0, background: 'var(--sapGroup_TitleBackground)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Title level="H5">Workspace Settings</Title>
              <Input
                placeholder="Search settings"
                icon={<Icon name="search" />}
                showClearIcon
                value={settingsSearchQuery}
                onInput={(e) => setSettingsSearchQuery((e.target as unknown as { value?: string }).value ?? '')}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(() => {
                const matchedPaths = searchSettings(settingsSearchQuery)
                const isFiltered = settingsSearchQuery.trim().length > 0
                const releaseNav = SETTINGS_NAV
                  .map(group => ({
                    ...group,
                    items: group.items.filter(item =>
                      item.path !== '/process-landscape-settings' || currentRelease !== 'NS2'
                    ),
                  }))
                  .filter(group => group.items.length > 0)
                const filteredNav = isFiltered
                  ? releaseNav
                      .map(group => ({
                        ...group,
                        items: group.items.filter(item => matchedPaths.has(item.path)),
                      }))
                      .filter(group => group.items.length > 0)
                  : releaseNav

                return filteredNav.length === 0 ? (
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                      No settings found
                    </Text>
                  </div>
                ) : (
                  <SideNavigation onSelectionChange={handleNavChange} style={{ height: 'auto', boxShadow: 'none', '--_ui5_side_navigation_shadow': 'none', '--_ui5_side_nav_shadow': 'none' } as React.CSSProperties}>
                    {filteredNav.map(group => (
                      <SideNavigationGroup key={group.title} text={group.title} expanded>
                        {group.items.map(item => (
                          <SideNavigationItem
                            key={item.path}
                            text={item.text}
                            selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                          />
                        ))}
                      </SideNavigationGroup>
                    ))}
                  </SideNavigation>
                )
              })()}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', background: 'var(--sapBackgroundColor)' }}>
            {errorStateEnabled ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <IllustratedMessage
                  name="UnableToLoad"
                  titleText="Something went wrong"
                  subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists."
                >
                  <Button design="Emphasized" onClick={() => {}}>Retry</Button>
                </IllustratedMessage>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      )}
    </NavigationLayout>
    <SearchDropdown
      open={searchDropdownOpen}
      rect={searchRect}
      query={searchQuery}
      history={searchHistory}
      savedSearches={smartFolders}
      onAddHistory={(term) => setSearchHistory(prev => [term, ...prev.filter(h => h !== term)].slice(0, 5))}
      onRemoveHistory={(term) => setSearchHistory(prev => prev.filter(h => h !== term))}
      onClose={() => setSearchDropdownOpen(false)}
    />
    <WelcomeModal
      isOpen={showWelcome}
      onClose={() => { localStorage.setItem('welcomeDismissed', 'true'); clearOverlay() }}
    />
    {hotspotVisible && <HotspotTooltip onDismiss={() => { localStorage.setItem('sig-consolidated-settings-tooltip-dismissed', 'true'); setHotspotVisible(false) }} />}
    <MessageBox
      open={unsavedChangesOpen}
      type="Warning"
      titleText="Unsaved Changes"
      actions={['Save', 'Discard Changes', 'Cancel']}
      emphasizedAction="Save"
      onClose={(action) => {
        setUnsavedChangesOpen(false)
        if (action === 'Save') {
          dirtyState.save()
          if (pendingNavRef.current) navigate(pendingNavRef.current)
          pendingNavRef.current = null
        } else if (action === 'Discard Changes') {
          dirtyState.reset()
          if (pendingNavRef.current) navigate(pendingNavRef.current)
          pendingNavRef.current = null
        } else {
          pendingNavRef.current = null
        }
      }}
    >
      <div style={{ padding: '1rem' }}>You have unsaved changes. What would you like to do?</div>
    </MessageBox>
    </>
  )
}
