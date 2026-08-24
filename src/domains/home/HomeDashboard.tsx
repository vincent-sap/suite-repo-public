import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Toast, MessageBox, Menu, MenuItem } from '@ui5/webcomponents-react'
import { usePCA } from '@/contexts/PCAContext'
import { DesignProvider } from '@/contexts/DesignContext'
import { PCASidePanel } from '../modeler/pca/PCASidePanel'
import { PCAConversationPage } from '../modeler/pca/PCAConversationPage'
import { PCAInputField } from '../modeler/pca/PCAInputField'
import '../modeler/pca/pca.css'
import { CardGridFlexWidth } from '../repository/components/CardGridFlexWidth'
import { FavoritesWidget } from './widgets/FavoritesWidget'
import { RecentlyViewedWidget } from './widgets/RecentlyViewedWidget'
import { MyTasksWidget, buildMyTasksPreviewGroups } from './widgets/MyTasksWidget'
import { QuickLinksWidget } from './widgets/QuickLinksWidget'
import { EntryDiagramCard } from '../repository/components/EntryDiagramCard'
import type { WidgetListItemData } from './widgets/WidgetListItem'
import LoginBackground from '../../LoginBackground.jpg'
import SampleProcess1 from '../../models/SampleProcess1.svg'
import SampleProcess2 from '../../models/SampleProcess2.svg'
import SampleProcess3 from '../../models/SampleProcess3.svg'
import SampleProcess4 from '../../models/SampleProcess4.svg'
import EntryDiagram from '../../models/EntryDiagram.svg'
import { REPOSITORY_ITEMS, formatAccessed } from '../../data/DataBase'
import type { MockItem } from '../../data/DataBase'
import type { QuickLinkItem } from './widgets/QuickLinksWidget'
import { WidgetCatalogDialog, WIDGET_LABELS } from '../../shared/components/WidgetCatalogDialog'
import ImportFileDialog from '../settings/components/ImportFileDialog'
import { QuickLinksEditDialog } from '../../shared/components/QuickLinksEditDialog'
import { SectionHeader } from '../../shared/components/SectionHeader'
import { getCookie, setCookie } from '../../utils/cookies'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import type { WidgetType } from './widgets/types'
export type { WidgetType }

const MODEL_SRCS: Record<string, string> = {
  SampleProcess1,
  SampleProcess2,
  SampleProcess3,
  SampleProcess4,
  EntryDiagram,
}


export interface WidgetConfig {
  id: string
  type: WidgetType
  instanceLabel?: number
  items?: QuickLinkItem[]
  customTitle?: string
}

const INITIAL_WIDGETS: WidgetConfig[] = []

const COOKIE_NAME = 'HomepageWidgetConfig'
const COOKIE_DAYS = 90

function loadWidgets(): WidgetConfig[] {
  try {
    const stored = getCookie(COOKIE_NAME)
    if (stored) return JSON.parse(stored) as WidgetConfig[]
  } catch {}
  return INITIAL_WIDGETS
}

function saveWidgets(widgets: WidgetConfig[]): void {
  setCookie(COOKIE_NAME, JSON.stringify(widgets), COOKIE_DAYS)
}

const SUGGESTED_PROMPTS = [
  'What can you help me with?',
  'Help me find relevant analyses for my processes',
  'I want to benchmark my processes',
  "What's impacting my process performance?",
  'Where should I focus to improve?',
]

// ─── PCA hero — custom centered layout matching HeroBanner visual style ─────

function PCAHero({ title, subtitle }: { title: string; subtitle: string }) {
  const { sendMessage } = usePCA()
  return (
    <div
      style={{
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 32px',
        gap: 20,
        textAlign: 'center',
      }}
    >
      {/* Title + subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'72', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.25,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "'72', sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Input + suggested prompts — full width, no background */}
      <div className="pca-scope" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', background: 'transparent' }}>
        <PCAInputField onSend={sendMessage} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '8px 16px', borderRadius: 16, backgroundColor: '#eae5ff', color: '#5d36ff',
                fontFamily: "'72', sans-serif", fontSize: 14, whiteSpace: 'nowrap',
                border: '1px solid transparent', cursor: 'pointer', transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff' }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Homepage (start state: hero + widgets), fully scrollable ───────────────

function HomepageContent() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { homeTitle, homeWelcomeMessage } = useWorkspace()
  const { sidebarOpen, setSidebarOpen } = usePCA()

  const overlayParam = searchParams.get('overlay')
  const catalogOpen = overlayParam === 'widget-catalog'
  const setCatalogOpen = (v: boolean) => setSearchParams(prev => {
    if (v) prev.set('overlay', 'widget-catalog')
    else prev.delete('overlay')
    return prev
  }, { replace: false })

  const qlEditOpen = overlayParam === 'quick-links-edit'
  const setQlEditOpen = (v: boolean) => setSearchParams(prev => {
    if (v) prev.set('overlay', 'quick-links-edit')
    else prev.delete('overlay')
    return prev
  }, { replace: false })

  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadWidgets)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importToast, setImportToast] = useState('')
  const [qlEditTarget, setQlEditTarget] = useState<string | null>(null)
  const [qlRemoveConfirmId, setQlRemoveConfirmId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastKey, setToastKey] = useState(0)

  const getModelSrc = (item: MockItem) => item.preview ? MODEL_SRCS[item.preview] : undefined

  const toListItem = (item: MockItem, showDate = true): WidgetListItemData => ({
    object: item.object,
    title: item.title,
    isFavorite: item.isFavorite,
    type: item.type,
    date: showDate ? formatAccessed(item.lastAccessed) : undefined,
    onClick: () => navigate('/repository'),
  })

  function showToast(message: string) {
    setToastMessage(message)
    setToastKey(k => k + 1)
  }

  const activeWidgetTypes = new Set(widgets.map(w => w.type))

  const removeWidget = (id: string) =>
    setWidgets(prev => {
      const removed = prev.find(w => w.id === id)
      const next = prev.filter(w => w.id !== id)
      saveWidgets(next)
      if (removed) showToast(`${WIDGET_LABELS[removed.type]} widget removed`)
      return next
    })

  const onOrderChange = (draggedIndex: number, dropIndex: number) =>
    setWidgets(prev => {
      const next = [...prev]
      const [moved] = next.splice(draggedIndex, 1)
      next.splice(dropIndex, 0, moved)
      saveWidgets(next)
      return next
    })

  const handleAddWidget = (type: WidgetType, items?: QuickLinkItem[]) => {
    if (type === 'quickLinks') {
      const count = widgets.filter(w => w.type === 'quickLinks').length
      setWidgets(prev => {
        const next = [...prev, { id: `quickLinks-${Date.now()}`, type: 'quickLinks' as WidgetType, instanceLabel: count + 1, items: items ?? [] }]
        saveWidgets(next)
        return next
      })
    } else if (!activeWidgetTypes.has(type)) {
      setWidgets(prev => {
        const next = [...prev, { id: type, type }]
        saveWidgets(next)
        return next
      })
    }
    showToast(`${WIDGET_LABELS[type]} widget added`)
  }

  const handleSaveQlItems = (id: string, items: QuickLinkItem[]) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, items } : w)
      saveWidgets(next)
      return next
    })
  }

  const handleRenameQl = (id: string, title: string) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, customTitle: title } : w)
      saveWidgets(next)
      return next
    })
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--sapBackgroundColor)' }}>

      {/* HeroBanner — full-width minus 16px margin on all sides, outside page-content */}
      <div
        className="home-hero-banner pca-scope"
        style={{
          margin: 16,
          position: 'relative',
          '--home-hero-bg-image': `url(${LoginBackground})`,
        } as React.CSSProperties}
      >
        {/* Sidebar toggle overlay — left side of the banner */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              position: 'absolute', top: 36, left: 24, zIndex: 10,
              width: 36, height: 36, flexShrink: 0,
              backgroundColor: '#eae5ff', border: '1px solid transparent', cursor: 'pointer',
            }}
            title="Open Sidebar"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="#5d36ff" strokeWidth="1.2" />
              <rect x="1" y="1" width="5" height="14" rx="2" fill="#5d36ff" fillOpacity="0.15" />
              <line x1="6" y1="1" x2="6" y2="15" stroke="#5d36ff" strokeWidth="1.2" />
              <path d="M9 6l2 2-2 2" stroke="#5d36ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Create button — top-right corner */}
        <div style={{ position: 'absolute', top: 36, right: 24, zIndex: 10, display: 'flex', alignItems: 'center' }}>
          <Button
            id="create-btn"
            design="Default"
            endIcon="slim-arrow-down"
            onClick={() => setCreateMenuOpen(true)}
            style={{ '--sapButton_Background': 'white', '--sapButton_BorderColor': 'white', '--sapButton_TextColor': '#5d36ff', '--sapButton_Hover_Background': 'rgba(255,255,255,0.85)', '--sapButton_Hover_BorderColor': 'white', '--sapButton_Hover_TextColor': '#5d36ff', '--sapButton_Active_Background': 'rgba(255,255,255,0.75)', '--sapButton_Active_BorderColor': 'white', '--sapButton_Active_TextColor': '#5d36ff', '--sapButton_IconColor': '#5d36ff' } as React.CSSProperties}
          >
            Create
          </Button>
          <Menu
            opener="create-btn"
            open={createMenuOpen}
            horizontalAlign="End"
            onClose={() => setCreateMenuOpen(false)}
            onItemClick={(e) => {
              setCreateMenuOpen(false)
              if ((e.detail as { text?: string })?.text === 'Import File') setImportDialogOpen(true)
            }}
          >
            <MenuItem icon="SAP-icons-v4/upload" text="Import File" />
            <MenuItem icon="SAP-icons-v4/process-manager" text="BPMN" />
            <MenuItem icon="SAP-icons-v4/quickmodel" text="QuickModel" />
            <MenuItem icon="SAP-icons-v4/customer-journey" text="Customer-Journey-Map" />
            <MenuItem icon="SAP-icons-v4/graph-unspecified" text="BPMN-Choreographie" />
            <MenuItem icon="SAP-icons-v4/graph-unspecified" text="BPMN-Konversation" />
            <MenuItem icon="SAP-icons-v4/process-manager" text="BPMN 1.2" />
          </Menu>
        </div>

        <PCAHero
          title={homeTitle || 'Welcome to SAP Signavio'}
          subtitle={homeWelcomeMessage || 'Your starting point for everything process'}
        />
      </div>

      {/* Content below hero — standard page padding, no sidebar offset */}
      <div className="page-content" style={{ marginInline: 0, padding: '0 3rem var(--spacing-md)' }}>
        <div className="page-content__grid">

          {/* My Widgets section */}
          <SectionHeader
            title="My Widgets"
            action={
              <>
                <span className="section-header__spacer" />
                <Button design="Default" onClick={() => setCatalogOpen(true)}>Add Widgets</Button>
              </>
            }
          />
          <CardGridFlexWidth stretch minCardWidth="320px">
            <RecentlyViewedWidget
              items={REPOSITORY_ITEMS.slice(0, 4).map(i => toListItem(i))}
              gridSpan={4}
              onViewAll={() => navigate('/repository')}
            />
            <FavoritesWidget
              items={REPOSITORY_ITEMS.filter(i => i.isFavorite).slice(0, 4).map(i => toListItem(i, false))}
              gridSpan={4}
              onViewAll={() => navigate('/favorites')}
            />
            <MyTasksWidget
              taskGroups={buildMyTasksPreviewGroups().slice(0, 4)}
              gridSpan={4}
              onItemClick={() => navigate('/repository')}
              onViewAll={() => navigate('/repository')}
            />
          </CardGridFlexWidth>
          {widgets.length > 0 && (
            <CardGridFlexWidth stretch draggable onOrderChange={onOrderChange}>
              {widgets.map((widget) => {
                if (widget.type === 'tasks') {
                  return (
                    <MyTasksWidget
                      key={widget.id}
                      gridSpan={4}
                      onItemClick={() => navigate('/repository')}
                      onViewAll={() => navigate('/repository')}
                      onRemove={() => removeWidget(widget.id)}
                    />
                  )
                }
                if (widget.type === 'quickLinks') {
                  return (
                    <QuickLinksWidget
                      key={widget.id}
                      gridSpan={4}
                      instanceLabel={widget.instanceLabel!}
                      title={widget.customTitle ?? (widget.instanceLabel === 1 ? 'Quick Links' : `Quick Links ${widget.instanceLabel}`)}
                      items={widget.items ?? []}
                      onRemove={() => setQlRemoveConfirmId(widget.id)}
                      onEdit={() => { setQlEditTarget(widget.id); setQlEditOpen(true) }}
                      onRename={(t) => handleRenameQl(widget.id, t)}
                    />
                  )
                }
              })}
            </CardGridFlexWidth>
          )}

          {/* Company Overview */}
          <SectionHeader title="Company Overview" onSeeAll={() => navigate('/repository')} />
          <EntryDiagramCard
            title={REPOSITORY_ITEMS[0].title}
            modelSrc={getModelSrc(REPOSITORY_ITEMS[0])}
            onDiagramClick={() => navigate('/repository')}
          />

        </div>
      </div>

      <WidgetCatalogDialog
        open={catalogOpen}
        activeWidgetTypes={activeWidgetTypes}
        onAdd={handleAddWidget}
        onConfigure={() => { setCatalogOpen(false); setQlEditTarget(null); setQlEditOpen(true) }}
        onClose={() => setCatalogOpen(false)}
      />

      <QuickLinksEditDialog
        open={qlEditOpen}
        mode={qlEditTarget ? 'edit' : 'add'}
        initialItems={qlEditTarget ? (widgets.find(w => w.id === qlEditTarget)?.items ?? []) : undefined}
        initialTitle={qlEditTarget
          ? (() => { const w = widgets.find(w => w.id === qlEditTarget); return w?.customTitle ?? `Quick Links ${w?.instanceLabel}` })()
          : (() => { const n = widgets.filter(w => w.type === 'quickLinks').length + 1; return n === 1 ? 'Quick Links' : `Quick Links ${n}` })()}
        onAdd={(items) => { setQlEditOpen(false); handleAddWidget('quickLinks', items) }}
        onSave={(items) => { if (qlEditTarget) handleSaveQlItems(qlEditTarget, items); setQlEditOpen(false) }}
        onBack={() => { setQlEditOpen(false); setCatalogOpen(true) }}
        onCancel={() => setQlEditOpen(false)}
      />

      {qlRemoveConfirmId && (
        <MessageBox
          open
          type="Warning"
          titleText="Delete"
          onClose={(action) => {
            const id = qlRemoveConfirmId
            setQlRemoveConfirmId(null)
            if (action === 'Delete') removeWidget(id)
          }}
          actions={['Delete', 'Cancel']}
          emphasizedAction="Delete"
        >
          Delete the Quick Links widget from the page?<br />This cannot be undone.
        </MessageBox>
      )}

      <ImportFileDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          setImportToast('Import completed')
          setTimeout(() => setImportToast(''), 3500)
        }}
      />

      {importToast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'white', color: '#1a2633',
          borderRadius: '12px', padding: '0.75rem 1.5rem',
          fontSize: '0.875rem', fontWeight: 400, textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          zIndex: 99999, pointerEvents: 'none',
          fontFamily: '"72", Arial, sans-serif',
        }}>
          {importToast}
        </div>
      )}

      <Toast
        key={toastKey}
        open={toastKey > 0}
        placement="BottomCenter"
        style={{
          zIndex: 9999, background: '#253040', color: 'white', borderRadius: '12px',
          fontSize: '1rem', fontWeight: 600, padding: '0.75rem 1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        } as React.CSSProperties}
      >
        {toastMessage}
      </Toast>
    </div>
  )
}

// ─── Inner shell: sidebar + (conversation | homepage) ───────────────────────

function HomeDashboardInner() {
  const { getActiveConversation, sidebarOpen, setActiveConversationId, setSidebarOpen } = usePCA()
  const [searchParams, setSearchParams] = useSearchParams()
  const conversation = getActiveConversation()
  const hasMessages = !!(conversation && conversation.messages.length > 0)
  const sidebarWidth = sidebarOpen ? 340 : 0

  // ?fresh=1 → reset to homepage initial state (drop active conversation, clear param)
  useEffect(() => {
    if (searchParams.get('fresh') === '1') {
      setActiveConversationId(null)
      setSidebarOpen(false)
      setSearchParams(prev => { prev.delete('fresh'); return prev }, { replace: true })
    }
  }, [searchParams]) // re-run whenever URL params change

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'white' }}>
      {/* Animated PCA sidebar — slides in from left, 0 width when closed */}
      <div
        className="pca-scope pca-sidebar-transparent"
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <PCASidePanel />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
        {hasMessages ? (
          <div className="pca-scope" style={{ height: '100%' }}>
            <PCAConversationPage />
          </div>
        ) : (
          <HomepageContent />
        )}
      </div>
    </div>
  )
}

// ─── Public export wraps providers ──────────────────────────────────────────

export default function HomeDashboard() {
  return (
    <DesignProvider>
      <HomeDashboardInner />
    </DesignProvider>
  )
}
