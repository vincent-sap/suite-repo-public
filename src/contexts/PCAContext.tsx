import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { resolveResponse, CONVERSATION_RESPONSES, FALLBACK_RESPONSE, conversationResponseIndex } from '../data/pca-responses'

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: 'text' | 'table' | 'mixed';
  tableData?: TableData;
  widgets?: WidgetData[];
  thinking?: string[];
  followUpPrompts?: string[];
  bpmnList?: BpmnListItem[];
  graphBpmnList?: BpmnListItem[];
  closingText?: string;
  graphEnabled?: boolean;
  graphCenterNodeName?: string;
  crossGraphEnabled?: boolean;
  treeListEnabled?: boolean;
  tableEnabled?: boolean;
  graphLayout?: 'hops' | 'collision';
  graphCenterFlagged?: boolean;
  graphCenterWarning?: boolean;
  mcpDisplayMode?: 'widget' | 'applet' | 'panel' | 'canvas';
  panelItems?: PanelListItem[];
  timestamp: Date;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface BarWidgetData {
  type: 'bar';
  title: string;
  data: Array<{ label: string; value: number }>;
  yLabel?: string;
  color?: string;
  benchmarkValue?: number;
  benchmarkLabel?: string;
}

export interface ScatterWidgetData {
  type: 'scatter';
  title: string;
  data: Array<{ x: number; y: number }>;
  xLabel?: string;
  yLabel?: string;
}

export type WidgetData = BarWidgetData | ScatterWidgetData;

export interface PanelListItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
}

export interface BpmnListItem {
  name: string;
  version: string;
  status: 'Published' | 'Modified' | 'Draft';
  processId: string;
  description: string;
  createdAt: string;
  changedAt: string;
  folder: string;
  groupLabel?: string;
  domainObjectType?: string;
  assetType?: string;
  avatarColorScheme?: string;
  avatarIcon?: string;
  avatarShape?: 'Circle' | 'Square';
  displayAssetType?: string;
  customChips?: { label: string; value: string; design?: string; avatarInitial?: string; leadingIcon?: string; avatarColor?: string }[];
  project?: string;
  department?: string;
  region?: string;
  flagIcon?: boolean;
  parentId?: string;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  changedHighlight?: boolean;
  warningHighlight?: boolean;
  treeParentId?: string;
  collisionSide?: 'left' | 'right' | 'center';
  flaggedEdge?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface PCAContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  isTyping: boolean;
  setActiveConversationId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  sendMessage: (content: string, convId?: string) => void;
  getActiveConversation: () => Conversation | null;
  resetSidebarToAuto: () => void;
}

const PCAContext = createContext<PCAContextValue | null>(null);

const STORAGE_KEY = 'pca_conversations';

function serializeConversations(convs: Conversation[]): string {
  return JSON.stringify(convs);
}

function deserializeConversations(raw: string): Conversation[] {
  const parsed = JSON.parse(raw) as Array<{
    id: string; title: string;
    messages: Array<{ id: string; role: MessageRole; content: string; type: ChatMessage['type']; tableData?: TableData; timestamp: string }>;
    createdAt: string; updatedAt: string;
  }>;
  return parsed.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
  }));
}

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-celonis',
    title: 'Show me all processes that use the IT System Celonis, and their Process Owners',
    messages: [],
    createdAt: new Date('2025-04-01'),
    updatedAt: new Date('2025-04-01'),
  },
  {
    id: 'conv-finance-transformation',
    title: 'Show me everything relevant for our project Finance Transformation 2026',
    messages: [],
    createdAt: new Date('2025-04-02'),
    updatedAt: new Date('2025-04-02'),
  },
  {
    id: 'conv-procurement',
    title: 'I recently joined the company, what should I know about our procurement processes in Germany?',
    messages: [],
    createdAt: new Date('2025-04-03'),
    updatedAt: new Date('2025-04-03'),
  },
  {
    id: 'conv-p2p',
    title: 'Show me all assets I need for the quarterly process health review of the Purchase-to-Pay process. Highlight those that changed since last quarter.',
    messages: [],
    createdAt: new Date('2025-04-04'),
    updatedAt: new Date('2025-04-04'),
  },
  {
    id: 'conv-otc',
    title: 'What are the downstream effects of changing the process Order-to-Cash?',
    messages: [],
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2025-04-05'),
  },
  {
    id: 'conv-s2p',
    title: 'Which initiatives are active for our Source-to-Pay processes? Are any of them targeting the same sub-process?',
    messages: [],
    createdAt: new Date('2025-04-06'),
    updatedAt: new Date('2025-04-06'),
  },
  {
    id: 'conv-onboarding',
    title: 'Employee Onboarding compliance training completions are below threshold in Germany. Which connected processes could be causing this?',
    messages: [],
    createdAt: new Date('2025-04-07'),
    updatedAt: new Date('2025-04-07'),
  },
  {
    id: 'conv-lena-keynote',
    title: 'What in my area needs my attention right now?',
    messages: [],
    createdAt: new Date('2025-04-08'),
    updatedAt: new Date('2025-04-08'),
  },
];

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = deserializeConversations(raw);
      // Ensure all seed conversations are always present
      const storedIds = new Set(stored.map(c => c.id));
      const missing = SEED_CONVERSATIONS.filter(c => !storedIds.has(c.id));
      return [...missing, ...stored];
    }
  } catch {
    // ignore corrupt data
  }
  return [...SEED_CONVERSATIONS];
}

const SIDEBAR_BREAKPOINT = 1024;

export function PCAProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Sidebar: auto-derived from viewport, overridable by user for the session
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const [sidebarUserOverride, setSidebarUserOverride] = useState(false);

  // Re-apply auto rule when viewport crosses the breakpoint (only if user hasn't overridden)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => {
      if (!sidebarUserOverride) {
        setSidebarOpenState(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [sidebarUserOverride]);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
    setSidebarUserOverride(true);
  }, []);

  const resetSidebarToAuto = useCallback(() => {
    setSidebarUserOverride(false);
    setSidebarOpenState(window.innerWidth >= SIDEBAR_BREAKPOINT);
  }, []);

  // Persist conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeConversations(conversations));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [conversations]);

  const getActiveConversation = useCallback(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const createConversation = useCallback(() => {
    const id = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveConversationId((prev) => (prev === id ? null : prev));
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: new Date() } : c))
    );
  }, []);

  const sendMessage = useCallback(
    (content: string, forceConvId?: string) => {
      if (!content.trim()) return;

      // Use forceConvId if provided (for seed conversation clicks), else fall back to active
      let convId = forceConvId ?? activeConversationId;
      if (!convId) {
        convId = `conv-${Date.now()}`;
        const newConv: Conversation = {
          id: convId,
          title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(convId);
      }


      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        type: 'text',
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          // Auto-title the conversation from first user message
          const newTitle = c.messages.length === 0
            ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
            : c.title;
          return {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMsg],
            updatedAt: new Date(),
          };
        })
      );

      setIsTyping(true);

      // Check if this message matches a scripted response
      const fixedResponse = resolveResponse(content);      // Otherwise pick next response for this specific conversation
      const responses = CONVERSATION_RESPONSES[convId] ?? [FALLBACK_RESPONSE];
      const idx = conversationResponseIndex[convId] ?? 0;
      const fakeResponse = fixedResponse ?? responses[idx % responses.length];
      if (!fixedResponse) conversationResponseIndex[convId] = idx + 1;

      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: fakeResponse.content,
          type: fakeResponse.type,
          tableData: fakeResponse.tableData,
          widgets: fakeResponse.widgets,
          thinking: fakeResponse.thinking,
          followUpPrompts: fakeResponse.followUpPrompts,
          bpmnList: fakeResponse.bpmnList,
          closingText: fakeResponse.closingText,
          graphEnabled: fakeResponse.graphEnabled,
          graphCenterNodeName: fakeResponse.graphCenterNodeName,
          graphBpmnList: fakeResponse.graphBpmnList,
          crossGraphEnabled: fakeResponse.crossGraphEnabled,
          treeListEnabled: fakeResponse.treeListEnabled,
          tableEnabled: fakeResponse.tableEnabled,
          graphLayout: fakeResponse.graphLayout,
          graphCenterFlagged: fakeResponse.graphCenterFlagged,
          graphCenterWarning: fakeResponse.graphCenterWarning,
          mcpDisplayMode: fakeResponse.mcpDisplayMode,
          panelItems: fakeResponse.panelItems,
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: [...c.messages, assistantMsg],
              updatedAt: new Date(),
            };
          })
        );
        setIsTyping(false);
      }, delay);
    },
    [activeConversationId]
  );

  return (
    <PCAContext.Provider
      value={{
        conversations,
        activeConversationId,
        sidebarOpen,
        isTyping,
        setActiveConversationId,
        setSidebarOpen,
        createConversation,
        deleteConversation,
        renameConversation,
        sendMessage,
        getActiveConversation,
        resetSidebarToAuto,
      }}
    >
      {children}
    </PCAContext.Provider>
  );
}

export function usePCA() {
  const ctx = useContext(PCAContext);
  if (!ctx) throw new Error('usePCA must be used within PCAProvider');
  return ctx;
}
