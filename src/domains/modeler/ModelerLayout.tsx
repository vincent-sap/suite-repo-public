import { useState } from 'react'
import { SplitterLayout, SplitterElement } from '@ui5/webcomponents-react'
import { useParams } from 'react-router-dom'
import ModelerApp from './ModelerApp'
import { SuiteContextPanelContent, SuiteContextRail } from '../../shared/components/SuiteContextPanel'
import s from './ModelerLayout.module.css'

type ModelerPanelId = string | null

const DEFAULT_SCP_WIDTH = 464
const MIN_SCP_WIDTH = 464

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
              assetId={assetId}
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
