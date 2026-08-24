import { ThemeProvider as UI5ThemeProvider } from '@ui5/webcomponents-react';
import { PCAProvider, usePCA } from '@/contexts/PCAContext';
import { PCASidePanel } from './PCASidePanel';
import { PCAStartPage } from './PCAStartPage';
import { PCAConversationPage } from './PCAConversationPage';
import './pca.css';

function PCAContent() {
  const { getActiveConversation, sidebarOpen } = usePCA();
  const conversation = getActiveConversation();
  const hasMessages = conversation && conversation.messages.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: 'white' }}>
      {/* Animated sidebar wrapper — width animates to 0 to hide without unmounting */}
      <div
        style={{
          width: sidebarOpen ? 384 : 100,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <PCASidePanel />
      </div>
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        {hasMessages ? <PCAConversationPage /> : <PCAStartPage />}
      </div>
    </div>
  );
}

export function PCAShell() {
  return (
    <UI5ThemeProvider>
      <PCAProvider>
        <div className="pca-scope" style={{ display: 'contents' }}>
          <PCAContent />
          <button
            onClick={() => { localStorage.removeItem('pca_conversations'); window.location.reload(); }}
            title="Clear conversation cache"
            style={{
              position: 'fixed', bottom: 12, right: 12, zIndex: 9999,
              fontSize: 10, fontFamily: 'monospace', color: '#888',
              background: 'rgba(255,255,255,0.85)', border: '1px solid #ddd',
              borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            Clear Cache
          </button>
        </div>
      </PCAProvider>
    </UI5ThemeProvider>
  );
}
