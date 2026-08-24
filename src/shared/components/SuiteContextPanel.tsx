import React from 'react'
import {
  SideNavigation,
  SideNavigationItem,
  Icon,
} from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { CommentsTab } from '../../domains/repository/Repository/CommentsTab'
import AssetInfoPanel from '../../domains/repository/Repository/AssetInfoPanel'
import AtomsPanel from './SuiteContextPanel/AtomsPanel'
import JouleChatPanel from './SuiteContextPanel/JouleChatPanel'
import type { SelectedAssetInfo } from '../../domains/repository/AllResources'
import s from './SuiteContextPanel.module.css'

type ModelerPanelId = string | null

// ── Panel registry ────────────────────────────────────────────────────────────

type PanelDef = {
  id: string
  label: string
  icon: string
  section: 1 | 2
}

const PANELS: PanelDef[] = [
  // Section 1 — Asset Context
  { id: 'diagram-attributes', label: 'Diagram Attributes',   icon: 'detail-view',          section: 1 },
  { id: 'comments',           label: 'Comments',             icon: 'comment',               section: 1 },
  // Section 2 — Platform Capabilities
  { id: 'joule-chat',         label: 'Modeling AI Assistant', icon: 'ai',                   section: 2 },
  { id: 'tasks',              label: 'Tasks',                icon: 'checklist',             section: 2 },
  { id: 'insights',           label: 'Insights',             icon: 'lightbulb',             section: 2 },
  { id: 'initiatives',        label: 'Initiatives',          icon: 'grid',                  section: 2 },
  { id: 'atoms',              label: 'Atoms',                icon: 'SAP-icons-v4/value-any', section: 2 },
]

const PANEL_TITLE: Record<string, string> = {
  'diagram-attributes': 'Diagram Attributes',
  'comments':           'Comments',
  'tasks':              'Tasks',
  'insights':           'Insights',
  'initiatives':        'Initiatives',
  'atoms':              'Atoms',
  'joule-chat':         'Modeling AI Assistant',
}

type SharedProps = {
  activePanel: ModelerPanelId
  onTogglePanel: (id: ModelerPanelId) => void
  pendingMessage?: string | null
  onPendingConsumed?: () => void
}

// ── Mock asset data for the modeler context ──────────────────────────────────
// In the real app this would be driven by the loaded asset; here we match the
// Onboarding Process fixture that matches the canvas placeholder.
function makeMockAsset(assetId?: string): SelectedAssetInfo {
  return {
    id: assetId ?? 'a1',
    name: assetId === 'a1' ? 'Onboarding Process'
        : assetId === 'a2' ? 'Incident Management'
        : assetId === 'a3' ? 'Order-to-Cash Value Chain'
        : 'Untitled',
    objectType: 'Process Model',
    typeName: 'BPMN Model',
    folder: 'Human Resources',
    version: 'Draft',
    lastUpdateBy: 'Sebastian Kaim',
    lastUpdateDate: '2 hours ago',
    chips: [{ value: 'Draft', design: 'none' }],
    canEdit: true,
  }
}

// ── Panel content (goes inside the SplitterElement) ───────────────────────────

export function SuiteContextPanelContent({ activePanel, onTogglePanel, assetId, pendingMessage, onPendingConsumed }: SharedProps & { assetId?: string }) {
  if (!activePanel) return null

  // diagram-attributes uses the existing AssetInfoPanel which owns its own SigRightSidePanel
  if (activePanel === 'diagram-attributes') {
    const asset = makeMockAsset(assetId)
    return (
      <div className={s.panelContent}>
        <AssetInfoPanel
          selectedAsset={null}
          selectedDictEntry={null}
          dictCategories={[]}
          externalSelectedAsset={asset}
          pageTitle={asset.name}
          selectionCount={0}
          zoomViewport={null}
          subscriptions={{}}
          onSubscriptionChange={() => {}}
          onThumbnailEnter={() => {}}
          onThumbnailLeave={() => {}}
          onThumbnailMove={() => {}}
          onClose={() => onTogglePanel(null)}
          onOpenModelDetail={() => {}}
          hideHeaderActions
        />
      </div>
    )
  }

  // atoms panel
  if (activePanel === 'atoms') {
    return (
      <div className={s.panelContent}>
        <AtomsPanel onClose={() => onTogglePanel(null)} />
      </div>
    )
  }

  // joule chat panel
  if (activePanel === 'joule-chat') {
    return (
      <div className={s.panelContent}>
        <JouleChatPanel
          onClose={() => onTogglePanel(null)}
          pendingMessage={pendingMessage}
          onPendingConsumed={onPendingConsumed}
        />
      </div>
    )
  }

  // comments uses SigRightSidePanel with CommentsTab as direct content
  if (activePanel === 'comments') {
    return (
      <div className={s.panelContent}>
        <SigRightSidePanel
          headerTitle="Comments"
          isOpen
          toggleRightSidePanel={() => onTogglePanel(null)}
          contentActionsSlot={[]}
          style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
        ><CommentsTab /></SigRightSidePanel>
      </div>
    )
  }

  // placeholder for not-yet-implemented panels
  const icon = PANELS.find(p => p.id === activePanel)?.icon ?? 'grid'
  return (
    <div className={s.panelContent}>
      <SigRightSidePanel
        headerTitle={PANEL_TITLE[activePanel] ?? ''}
        isOpen
        toggleRightSidePanel={() => onTogglePanel(null)}
        contentActionsSlot={[]}
        style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
      >
        <div className={s.placeholderPanel}>
          <Icon name={icon} style={{ width: '2rem', height: '2rem', color: 'var(--sapContent_LabelColor)' }} />
        </div>
      </SigRightSidePanel>
    </div>
  )
}

// ── Navigation rail (always visible, sits outside the SplitterLayout) ─────────
// dir="rtl" so hover popups open leftward instead of off-screen.
// z-index + overflow:visible so tooltips paint over the panel content.

export function SuiteContextRail({ activePanel, onTogglePanel }: SharedProps) {
  const makeItemClick = (panelId: string) => () =>
    onTogglePanel(panelId === activePanel ? null : panelId as ModelerPanelId)

  const section1 = PANELS.filter(p => p.section === 1)
  const section2 = PANELS.filter(p => p.section === 2)

  return (
    <div className={s.rail} dir="rtl">
      <SideNavigation collapsed style={{ height: '100%' } as React.CSSProperties}>
        {section1.map(p => (
          <SideNavigationItem
            key={p.id}
            icon={p.icon}
            text={p.label}
            tooltip={p.label}
            selected={activePanel === p.id}
            onClick={makeItemClick(p.id)}
          />
        ))}
        <SideNavigationItem
          key="sep"
          icon=""
          text=""
          unselectable
          style={{ pointerEvents: 'none', height: '1px', padding: 0, margin: '2px 8px',
            background: 'var(--sapList_BorderColor)', overflow: 'hidden' } as React.CSSProperties}
        />
        {section2.map(p => (
          <SideNavigationItem
            key={p.id}
            icon={p.icon}
            text={p.label}
            tooltip={p.label}
            selected={activePanel === p.id}
            onClick={makeItemClick(p.id)}
          />
        ))}
      </SideNavigation>
    </div>
  )
}
