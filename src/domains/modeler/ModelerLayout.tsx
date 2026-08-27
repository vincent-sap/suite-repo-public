import { useState } from 'react'
import { SplitterLayout, SplitterElement } from '@ui5/webcomponents-react'
import { useParams } from 'react-router-dom'
import ModelerApp from './ModelerApp'
import { SuiteContextPanelContent, SuiteContextRail } from '../../shared/components/panels/SuiteContextPanel'
import AssetInfoPanel from '../repository/Repository/AssetInfoPanel'
import AtomsPanel from './AtomsPanel'
import type { SelectedAssetInfo } from '../repository/AllResources'
import s from './ModelerLayout.module.css'

type ModelerPanelId = string | null

const DEFAULT_SCP_WIDTH = 464
const MIN_SCP_WIDTH = 464

// Mock asset backing the Diagram Attributes panel. Lives here (not in the
// shared SuiteContextPanel) because it uses the repository's SelectedAssetInfo
// type — shared/ must not depend on a domain.
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

export default function ModelerLayout() {
  const { assetId } = useParams<{ assetId: string }>()
  const [activePanel, setActivePanel] = useState<ModelerPanelId>('diagram-attributes')
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const togglePanel = (id: ModelerPanelId) =>
    setActivePanel((prev: ModelerPanelId) => (prev === id ? null : id))

  const handlePadSend = (message: string) => {
    setPendingMessage(message)
    setActivePanel('joule-chat')
  }

  // Domain-specific panels handed to the shared SuiteContextPanel.
  const renderPanel = (id: string) => {
    if (id === 'diagram-attributes') {
      const asset = makeMockAsset(assetId)
      return (
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
          onClose={() => togglePanel(null)}
          onOpenModelDetail={() => {}}
          hideHeaderActions
        />
      )
    }
    if (id === 'atoms') {
      return <AtomsPanel onClose={() => togglePanel(null)} />
    }
    return null
  }

  return (
    <div className={s.root}>
      <SplitterLayout
        className={s.splitter}
        options={{ resetOnSizeChange: true, resetOnCustomDepsChange: [activePanel] }}
      >
        <SplitterElement size="auto" minSize={300}>
          <ModelerApp
            assetId={assetId}
            onOpenJouleChat={() => togglePanel('joule-chat')}
            joulePanelOpen={activePanel === 'joule-chat'}
            onPadSend={handlePadSend}
          />
        </SplitterElement>

        {activePanel ? (
          <SplitterElement size={`${DEFAULT_SCP_WIDTH}px`} minSize={MIN_SCP_WIDTH}>
            <SuiteContextPanelContent
              activePanel={activePanel}
              onTogglePanel={togglePanel}
              renderPanel={renderPanel}
              pendingMessage={pendingMessage}
              onPendingConsumed={() => setPendingMessage(null)}
            />
          </SplitterElement>
        ) : null}
      </SplitterLayout>

      <SuiteContextRail activePanel={activePanel} onTogglePanel={togglePanel} />
    </div>
  )
}
