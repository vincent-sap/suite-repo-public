import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

type FakeResponse = { content: string; type: ChatMessage['type']; tableData?: TableData; widgets?: WidgetData[]; thinking?: string[]; followUpPrompts?: string[]; bpmnList?: BpmnListItem[]; graphBpmnList?: BpmnListItem[]; closingText?: string; graphEnabled?: boolean; graphCenterNodeName?: string; graphCenterFlagged?: boolean; graphCenterWarning?: boolean; crossGraphEnabled?: boolean; treeListEnabled?: boolean; tableEnabled?: boolean; graphLayout?: 'hops' | 'collision'; mcpDisplayMode?: 'widget' | 'applet' | 'panel' | 'canvas'; panelItems?: PanelListItem[] };

const COMING_SOON_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'I don\'t have enough information to answer that question yet. This capability is coming soon.',
  followUpPrompts: ['Draft a migration impact summary', 'Which models have active Celonis analyses?', 'Are there other IT systems with similar dependencies?', 'Help me plan the replacement rollout'],
};

const MCP_INTRO_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'MCP Apps can be embedded in the Process Consulting Agent in four distinct ways, each suited to a different type of answer:\n\n**Widget** — compact data cards rendered inline in the chat stream, ideal for KPIs, charts, or metrics that complement a text answer.\n\n**Applet** — a self-contained mini-application embedded in the chat, providing richer interaction without leaving the conversation.\n\n**Panel** — a resizable side panel that opens alongside the conversation, keeping context visible while working in a dedicated view.\n\n**Canvas** — a full two-thirds-width immersive area next to the chat, for tasks that need maximum space like process maps, dashboards, or editing tools.\n\nWhich pattern would you like to explore?',
  followUpPrompts: ['As Widget', 'As Applet', 'As Panel', 'As Canvas'],
};

const MCP_WIDGET_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'In **Widget** mode, MCP Apps appear as compact, side-by-side data cards embedded directly in the chat response. Each card can show a KPI, a mini chart, or a metric summary — giving the user a quick overview without leaving the conversation flow.',
  mcpDisplayMode: 'widget',
  followUpPrompts: ['As Applet', 'As Panel', 'As Canvas', 'How can MCP apps be embedded in the UI?'],
};

const MCP_APPLET_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'In **Applet** mode, the MCP App is rendered as a self-contained embedded application directly in the chat stream. It provides richer interaction — forms, drill-downs, filters — within a dedicated card, while keeping the conversation context visible above and below.',
  mcpDisplayMode: 'applet',
  followUpPrompts: ['As Widget', 'As Panel', 'As Canvas', 'How can MCP apps be embedded in the UI?'],
};

const MCP_PANEL_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'In **Panel** mode, the MCP App opens in a resizable side panel alongside the conversation. This keeps the chat visible while giving the app a dedicated, draggable-width workspace — ideal for reference content, process detail views, or configuration screens.\n\nHere are the available process detail views. Select one to open it in the panel:',
  mcpDisplayMode: 'panel',
  panelItems: [
    { id: 'p1', title: 'Order to Cash', subtitle: 'End-to-end process · 12 steps' },
    { id: 'p2', title: 'Purchase Order Creation', subtitle: 'Procurement · 8 steps' },
    { id: 'p3', title: 'Employee Onboarding', subtitle: 'HR · 15 steps' },
    { id: 'p4', title: 'Incident Management', subtitle: 'IT Service · 6 steps' },
  ],
  followUpPrompts: ['As Widget', 'As Applet', 'As Canvas', 'How can MCP apps be embedded in the UI?'],
};

const MCP_CANVAS_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'In **Canvas** mode, the MCP App takes up two-thirds of the screen width alongside the conversation. The chat narrows to one-third, and the canvas fills the rest — perfect for process maps, dashboards, or immersive editing tools that need maximum space.',
  mcpDisplayMode: 'canvas',
  followUpPrompts: ['As Widget', 'As Applet', 'As Panel', 'How can MCP apps be embedded in the UI?'],
};


const CELONIS_OWNERS_RESPONSE: FakeResponse = {
  type: 'mixed',
  thinking: [
    'The user wants to know the process owners for each of the 9 BPMN models.',
    'Resolving ownership from the process registry and organizational hierarchy.',
    'Grouping models by owner to make the list easier to scan.',
    'Three owners identified: Maria Hoffmann (Procurement & Finance), James Okafor (Supply Chain & Ops), Laura Chen (Sales & Customer).',
  ],
  content: 'The IT System **Celonis** is used in **9 BPMN models** across GlobalMfg AG. Here they are grouped by Process Owner so you know who to contact for each part of the migration.',
  bpmnList: [
    { groupLabel: 'Maria Hoffmann · Head of Procurement Excellence', name: 'Purchase Order Processing', version: '3.1', status: 'Published', processId: '4421', description: 'Covers the end-to-end creation, approval, and monitoring of purchase orders using Celonis process mining data.', createdAt: 'Mar 12, 2024', changedAt: 'Jan 08, 2025', folder: 'Procurement' },
    { name: 'Invoice Verification & Clearance', version: '2.4', status: 'Published', processId: '4422', description: 'Handles three-way matching and exception handling for supplier invoices; Celonis monitors cycle time deviations.', createdAt: 'Apr 03, 2024', changedAt: 'Feb 14, 2025', folder: 'Accounts Payable' },
    { name: 'Accounts Payable Month-End Close', version: '2.1', status: 'Modified', processId: '6034', description: 'Defines tasks for closing AP sub-ledger at period end; Celonis tracks open items and aging.', createdAt: 'Aug 01, 2024', changedAt: 'Apr 22, 2025', folder: 'Finance' },
    { name: 'Vendor Master Data Maintenance', version: '1.3', status: 'Published', processId: '5521', description: 'Covers creation, change, and deactivation of vendor master records; Celonis monitors data quality KPIs.', createdAt: 'Sep 10, 2024', changedAt: 'Jan 30, 2025', folder: 'Master Data Management' },
    { groupLabel: 'James Okafor · VP Supply Chain Operations', name: 'Goods Receipt & Inventory Update', version: '1.8', status: 'Published', processId: '5103', description: 'Documents the receiving and posting of goods; Celonis flags late receipts and discrepancies automatically.', createdAt: 'Jun 15, 2024', changedAt: 'Dec 10, 2024', folder: 'Logistics' },
    { name: 'Production Order Execution', version: '4.2', status: 'Published', processId: '2988', description: 'End-to-end production order lifecycle including scheduling and confirmation; Celonis detects bottlenecks on the shop floor.', createdAt: 'Feb 18, 2023', changedAt: 'Feb 27, 2025', folder: 'Manufacturing' },
    { groupLabel: 'Laura Chen · Director Customer & Sales Operations', name: 'Order-to-Cash Execution', version: '5.0', status: 'Published', processId: '3817', description: 'Manages the full order-to-cash cycle from sales order entry to cash receipt; Celonis provides conformance metrics.', createdAt: 'Jan 20, 2023', changedAt: 'Mar 01, 2025', folder: 'Sales & Distribution' },
    { name: 'Credit Management & Release', version: '1.5', status: 'Draft', processId: '7201', description: 'Manages credit limit checks and order release decisions; Celonis provides real-time hold rate analytics.', createdAt: 'Nov 05, 2024', changedAt: 'Mar 18, 2025', folder: 'Credit Control' },
    { name: 'Returns & Reverse Logistics', version: '2.0', status: 'Published', processId: '4890', description: 'Handles customer returns, inspections, and credit note creation; Celonis tracks return cycle time against SLA.', createdAt: 'Jul 22, 2024', changedAt: 'Apr 05, 2025', folder: 'Customer Service' },
  ],
  closingText: 'Before replacing Celonis, I recommend starting outreach with **Maria Hoffmann** — her four models cover the highest-value processes. Consider scheduling a joint impact assessment with all three owners before confirming the migration timeline.',
  followUpPrompts: ['Which models have active Celonis analyses?', 'Are there other IT systems with similar dependencies?', 'Help me plan the replacement rollout', 'Draft a migration impact summary'],
};

const FINANCE_TRANSFORMATION_RESPONSE: FakeResponse = {
  type: 'mixed',
  thinking: [
    'User is asking for all assets tagged with the Finance Transformation 2026 initiative.',
    'Scanning SPM, PINT, and TM for assets in Finance scope.',
    'Found 11 BPMN process models, 6 dashboards, 3 initiatives, 3 objectives — 23 total.',
    'Grouping by asset type for readability.',
  ],
  content: 'Here are **23 assets** that are relevant for the **Finance Transformation 2026** project, grouped by type.',
  bpmnList: [
    // BPMN group — 11 items
    {
      groupLabel: 'BPMN',
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Accounts Payable Invoice Processing', version: '4.2', status: 'Published', processId: '3301',
      description: 'End-to-end process for receiving, matching, and approving supplier invoices in SAP.',
      createdAt: 'Jan 10, 2024', changedAt: 'Mar 05, 2025', folder: 'Finance / Accounts Payable',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Financial Period Close', version: '3.1', status: 'Modified', processId: '3302',
      description: 'Monthly close process covering journal entries, reconciliations and reporting.',
      createdAt: 'Feb 14, 2023', changedAt: 'Apr 22, 2025', folder: 'Finance / Record to Report',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Budget Planning & Forecasting', version: '2.8', status: 'Published', processId: '3303',
      description: 'Annual budget cycle from cost center input to executive approval and SAP upload.',
      createdAt: 'Mar 01, 2023', changedAt: 'Feb 18, 2025', folder: 'Finance / Controlling',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Cost Center Allocation', version: '1.5', status: 'Published', processId: '3304',
      description: 'Distributes shared service costs across business units using allocation keys.',
      createdAt: 'Jun 20, 2023', changedAt: 'Jan 10, 2025', folder: 'Finance / Controlling',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Intercompany Reconciliation', version: '2.0', status: 'Published', processId: '3305',
      description: 'Matches intercompany payables and receivables across 14 legal entities.',
      createdAt: 'Sep 12, 2023', changedAt: 'Mar 30, 2025', folder: 'Finance / Record to Report',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Fixed Asset Management', version: '3.4', status: 'Published', processId: '3306',
      description: 'Covers acquisition, depreciation, transfer and retirement of fixed assets.',
      createdAt: 'Nov 05, 2022', changedAt: 'Dec 15, 2024', folder: 'Finance / Asset Accounting',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Treasury Cash Management', version: '1.9', status: 'Draft', processId: '3307',
      description: 'Daily cash positioning, bank reconciliation and liquidity forecasting process.',
      createdAt: 'Aug 01, 2024', changedAt: 'Apr 10, 2025', folder: 'Finance / Treasury',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Tax Compliance Reporting', version: '2.3', status: 'Published', processId: '3308',
      description: 'Quarterly VAT and corporate tax reporting workflow across all EU entities.',
      createdAt: 'Apr 15, 2023', changedAt: 'Feb 28, 2025', folder: 'Finance / Tax',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Accounts Receivable Collections', version: '3.0', status: 'Published', processId: '3309',
      description: 'Dispute management, dunning, and escalation process for overdue receivables.',
      createdAt: 'Jul 22, 2023', changedAt: 'Jan 20, 2025', folder: 'Finance / Accounts Receivable',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Profit Center Reporting', version: '1.7', status: 'Modified', processId: '3310',
      description: 'Generates P&L and balance sheet views at profit center level for management reporting.',
      createdAt: 'Oct 08, 2023', changedAt: 'Mar 14, 2025', folder: 'Finance / Controlling',
      project: 'Finance Transformation 2026',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'External Financial Reporting', version: '4.0', status: 'Published', processId: '3311',
      description: 'Annual report preparation including IFRS consolidation and auditor handoff.',
      createdAt: 'May 30, 2022', changedAt: 'Apr 01, 2025', folder: 'Finance / Record to Report',
      project: 'Finance Transformation 2026',
    },
    // Dashboard group — 6 items
    {
      groupLabel: 'Dashboard',
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Finance KPI Overview', version: '2.1', status: 'Published', processId: 'DASH-101',
      description: 'Executive dashboard showing DSO, DPO, working capital ratio and close cycle time.',
      createdAt: 'Feb 01, 2024', changedAt: 'Apr 15, 2025', folder: 'Finance / Reporting',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'Finance KPIs Q1' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'AP Aging & Exception Monitor', version: '1.8', status: 'Published', processId: 'DASH-102',
      description: 'Live view of overdue payables, blocked invoices, and exception queues by entity.',
      createdAt: 'May 12, 2024', changedAt: 'Mar 20, 2025', folder: 'Finance / Accounts Payable',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'AP Aging 2025' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Period Close Tracker', version: '3.0', status: 'Modified', processId: 'DASH-103',
      description: 'Tracks close task completion status, bottlenecks and variance against SLA.',
      createdAt: 'Mar 08, 2023', changedAt: 'Apr 28, 2025', folder: 'Finance / Record to Report',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'Close Cycle 2025' }, { label: 'Owner:', value: 'Laura Chen', avatarInitial: 'LC' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Budget vs Actuals', version: '2.5', status: 'Published', processId: 'DASH-104',
      description: 'Monthly comparison of planned vs actual spend by cost center and GL account.',
      createdAt: 'Jan 20, 2024', changedAt: 'Feb 14, 2025', folder: 'Finance / Controlling',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'Budget FY2025' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Intercompany Mismatch Report', version: '1.3', status: 'Published', processId: 'DASH-105',
      description: 'Highlights unmatched IC transactions across entities ahead of close.',
      createdAt: 'Jun 15, 2024', changedAt: 'Jan 31, 2025', folder: 'Finance / Record to Report',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'IC Recon 2025' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Treasury Liquidity Monitor', version: '1.0', status: 'Draft', processId: 'DASH-106',
      description: 'Real-time cash position and 30-day liquidity forecast across all bank accounts.',
      createdAt: 'Aug 10, 2024', changedAt: 'Apr 05, 2025', folder: 'Finance / Treasury',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Analysis Configuration:', value: 'Treasury Q2 2025' }, { label: 'Owner:', value: 'Laura Chen', avatarInitial: 'LC' }],
    },
    // Initiative group — 3 items
    {
      groupLabel: 'Initiative',
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'AP Automation Rollout', version: '1.0', status: 'Published', processId: 'INI-201',
      description: 'Deploy OCR and 3-way match automation for all PO-backed invoices across 6 entities.',
      createdAt: 'Mar 01, 2025', changedAt: 'Apr 20, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }, { label: 'End Date:', value: 'Dec 31, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Close Cycle Reduction', version: '1.0', status: 'Published', processId: 'INI-202',
      description: 'Reduce financial close from 9.2 to 5 days by automating recurring journals and IC netting.',
      createdAt: 'Feb 15, 2025', changedAt: 'Apr 18, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'At Risk', design: 'indication2', leadingIcon: 'warning' }, { label: 'Owner:', value: 'Laura Chen', avatarInitial: 'LC' }, { label: 'End Date:', value: 'Sep 30, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Treasury Centralisation', version: '1.0', status: 'Draft', processId: 'INI-203',
      description: 'Consolidate cash management from 4 regional treasury teams into a single centre of excellence.',
      createdAt: 'Apr 01, 2025', changedAt: 'Apr 25, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }, { label: 'End Date:', value: 'Dec 31, 2026' }],
    },
    // Objective group — 3 items
    {
      groupLabel: 'Objective',
      domainObjectType: 'Business Goal', assetType: 'Objective',
      name: 'Reduce Finance Operating Cost by 20%', version: '1.0', status: 'Published', processId: 'OBJ-301',
      description: 'Cut finance function cost-to-revenue ratio from 1.8% to 1.4% through automation and simplification.',
      createdAt: 'Jan 05, 2025', changedAt: 'Apr 10, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }, { label: 'Progress:', value: '34%' }],
    },
    {
      domainObjectType: 'Business Goal', assetType: 'Objective',
      name: 'Achieve 5-Day Financial Close', version: '1.0', status: 'Published', processId: 'OBJ-302',
      description: 'Accelerate period-end close to best-in-class 5 days by end of FY2026.',
      createdAt: 'Jan 05, 2025', changedAt: 'Apr 10, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }, { label: 'Progress:', value: '18%' }],
    },
    {
      domainObjectType: 'Business Goal', assetType: 'Objective',
      name: 'Improve Finance Data Quality Score to 95%', version: '1.0', status: 'Modified', processId: 'OBJ-303',
      description: 'Raise master data completeness, accuracy and timeliness scores across all finance entities.',
      createdAt: 'Jan 05, 2025', changedAt: 'Apr 22, 2025', folder: 'Finance Transformation 2026',
      project: 'Finance Transformation 2026',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Jan Holt', avatarInitial: 'JH' }, { label: 'Progress:', value: '51%' }],
    },
  ],
  closingText: 'I can help you go deeper on any of these areas. For example, I can show you which initiatives are behind schedule, identify gaps in process coverage, or pull the latest KPI data from the dashboards.',
  followUpPrompts: [
    'Which initiatives are behind schedule?',
    'What KPIs are most critical to track?',
    'Are there any gaps in process coverage?',
    'Summarise this for a steering committee slide',
  ],
};

const PROCUREMENT_ONBOARDING_RESPONSE: FakeResponse = {
  type: 'mixed',
  thinking: [
    'Anna is a new joiner looking to understand procurement processes in Germany.',
    'Scanning all assets tagged with Procurement scope and Germany location.',
    'Found 2 value chains, 6 BPMN models, 8 dashboards, 2 initiatives — 18 total.',
    'Grouping by asset type to give a clear picture of the landscape.',
  ],
  content: 'Here are **18 assets** that are relevant for **Procurement in Germany**. For each asset you can see more details by clicking on the list item.',
  bpmnList: [
    // Value Chain group — 2 items
    {
      groupLabel: 'Value Chain',
      domainObjectType: 'Value Chain', assetType: 'Value Chain',
      name: 'Source to Pay — Germany', version: '2.1', status: 'Published', processId: '5201',
      description: 'End-to-end value chain from sourcing strategy through supplier payment, scoped to German entities.',
      createdAt: 'Mar 10, 2023', changedAt: 'Jan 15, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Value Chain', assetType: 'Value Chain',
      name: 'Indirect Procurement — DE', version: '1.4', status: 'Modified', processId: '5202',
      description: 'Value chain for non-production goods and services procurement in Germany.',
      createdAt: 'Sep 01, 2023', changedAt: 'Mar 22, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
    },
    // BPMN group — 6 items
    {
      groupLabel: 'BPMN',
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Purchase Requisition to Order', version: '3.5', status: 'Published', processId: '5211',
      description: 'Covers creation, approval and conversion of purchase requisitions to purchase orders in SAP.',
      createdAt: 'Jan 20, 2023', changedAt: 'Feb 10, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Supplier Onboarding Germany', version: '2.2', status: 'Published', processId: '5212',
      description: 'End-to-end supplier qualification, registration and master data creation for German entities.',
      createdAt: 'Apr 05, 2023', changedAt: 'Jan 28, 2025', folder: 'Procurement / Supplier Management',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Contract Management — Direct', version: '1.8', status: 'Published', processId: '5213',
      description: 'Handles creation, negotiation, approval and lifecycle management of direct material contracts.',
      createdAt: 'Jun 12, 2023', changedAt: 'Mar 05, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Goods Receipt & Invoice Matching', version: '4.0', status: 'Published', processId: '5214',
      description: '3-way match process for goods receipts, purchase orders and supplier invoices.',
      createdAt: 'Feb 14, 2022', changedAt: 'Apr 01, 2025', folder: 'Procurement / Accounts Payable',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Spot Buy & Emergency Purchase', version: '1.2', status: 'Draft', processId: '5215',
      description: 'Covers unplanned purchases outside framework agreements, including approval escalation.',
      createdAt: 'Oct 15, 2024', changedAt: 'Apr 10, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Vendor Performance Evaluation', version: '2.0', status: 'Published', processId: '5216',
      description: 'Quarterly supplier scorecard process covering delivery, quality and compliance KPIs.',
      createdAt: 'Aug 20, 2023', changedAt: 'Feb 20, 2025', folder: 'Procurement / Supplier Management',
      department: 'Procurement',
      region: 'Germany',
    },
    // Dashboard group — 8 items
    {
      groupLabel: 'Dashboard',
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Procurement Performance Overview', version: '3.1', status: 'Published', processId: 'DASH-501',
      description: 'KPI dashboard covering spend under management, PO cycle time and contract compliance.',
      createdAt: 'Mar 01, 2024', changedAt: 'Apr 20, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Procurement KPIs Q1' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Supplier Delivery Tracker', version: '2.0', status: 'Published', processId: 'DASH-502',
      description: 'Real-time tracking of on-time delivery rates, rejection rates and open orders by supplier.',
      createdAt: 'Jun 10, 2024', changedAt: 'Mar 15, 2025', folder: 'Procurement / Supplier Management',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Supplier OTD 2025' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Spend Analysis — Germany', version: '1.5', status: 'Published', processId: 'DASH-503',
      description: 'Category and supplier spend breakdown for German entities with benchmark comparison.',
      createdAt: 'Jan 15, 2024', changedAt: 'Feb 28, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Spend DE 2025' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Contract Compliance Rate', version: '2.3', status: 'Published', processId: 'DASH-504',
      description: 'Tracks share of spend covered by contracts and highlights off-contract purchases.',
      createdAt: 'Apr 22, 2024', changedAt: 'Apr 05, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Contract KPIs Q1' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'PO Cycle Time Analysis', version: '1.8', status: 'Modified', processId: 'DASH-505',
      description: 'Breaks down purchase order processing time by step, category and approver level.',
      createdAt: 'Jul 08, 2024', changedAt: 'Mar 30, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'PO Cycle 2025' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Invoice Exception Dashboard', version: '1.2', status: 'Published', processId: 'DASH-506',
      description: 'Shows blocked invoices, mismatch reasons and resolution status across all German suppliers.',
      createdAt: 'Sep 12, 2024', changedAt: 'Jan 22, 2025', folder: 'Procurement / Accounts Payable',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Invoice Exceptions' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Spot Buy Monitor', version: '1.0', status: 'Draft', processId: 'DASH-507',
      description: 'Tracks volume and value of emergency purchases outside framework agreements.',
      createdAt: 'Nov 01, 2024', changedAt: 'Apr 12, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Spot Buy 2025' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    {
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'Supplier Risk Scorecard', version: '2.1', status: 'Published', processId: 'DASH-508',
      description: 'Aggregates financial, compliance and delivery risk signals for top 50 German suppliers.',
      createdAt: 'Feb 20, 2024', changedAt: 'Mar 10, 2025', folder: 'Procurement / Supplier Management',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Analysis Configuration:', value: 'Supplier Risk Q1' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    // Initiative group — 2 items
    {
      groupLabel: 'Initiative',
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Procurement Digitalisation DE', version: '1.0', status: 'Published', processId: 'INI-501',
      description: 'Automate PO creation, approvals and invoice matching for all German procurement categories.',
      createdAt: 'Feb 01, 2025', changedAt: 'Apr 18, 2025', folder: 'Procurement / Germany',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }, { label: 'End Date:', value: 'Dec 31, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Supplier Consolidation Program', version: '1.0', status: 'Published', processId: 'INI-502',
      description: 'Reduce German supplier base by 30% through category rationalisation and dual-source strategy.',
      createdAt: 'Mar 15, 2025', changedAt: 'Apr 22, 2025', folder: 'Procurement / Supplier Management',
      department: 'Procurement',
      region: 'Germany',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }, { label: 'End Date:', value: 'Jun 30, 2026' }],
    },
  ],
  closingText: 'This is a good starting point to understand the procurement landscape in Germany. I can help you dive deeper into any of these areas — for example, I can walk you through the most important processes step by step, show you who the process owners are, or highlight which areas are currently being improved.',
  followUpPrompts: [
    'Who are the process owners I should talk to?',
    'Which processes are most important to know first?',
    'Are there any open issues or exceptions I should be aware of?',
    'Show me processes that are currently being changed',
  ],
};

const P2P_QUARTERLY_RESPONSE: FakeResponse = {
  type: 'mixed',
  graphEnabled: true,
  thinking: [
    'Sarah is preparing a quarterly process health review for Purchase-to-Pay.',
    'Finding the BPMN model, related dashboards, active initiatives, and dictionary entries.',
    'Identified 2 initiatives, 1 dashboard, and 6 dictionary entries linked to the P2P process.',
    '11 related assets total — grouping by type for the review.',
  ],
  content: 'The **Purchase-to-Pay** BPMN model is related to **11 assets** that are relevant for your quarterly review. The **AP Automation Rollout** initiative has been updated since last quarter.',
  bpmnList: [
    // Initiatives — 2 items
    {
      groupLabel: 'Initiatives',
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'AP Automation Rollout', version: '1.0', status: 'Published', processId: 'INI-601',
      description: 'Deploy OCR and 3-way match automation for all PO-backed invoices — targets 80% straight-through processing.',
      createdAt: 'Jan 15, 2025', changedAt: 'Apr 20, 2025', folder: 'Purchase-to-Pay',
      flagIcon: true,
      warningHighlight: true,
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }, { label: 'End Date:', value: 'Dec 31, 2025' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Supplier Onboarding Simplification', version: '1.0', status: 'Published', processId: 'INI-602',
      description: 'Reduce supplier onboarding cycle time from 14 to 5 days by digitising qualification and approval workflows.',
      createdAt: 'Feb 10, 2025', changedAt: 'Apr 22, 2025', folder: 'Purchase-to-Pay',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }, { label: 'End Date:', value: 'Mar 31, 2026' }],
    },
    // Dashboards — 1 item
    {
      groupLabel: 'Dashboards',
      domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'P2P Process Health Monitor', version: '2.4', status: 'Published', processId: 'DASH-601',
      description: 'Live dashboard showing PO cycle time, invoice exception rate, on-time delivery and contract compliance KPIs.',
      createdAt: 'Mar 05, 2024', changedAt: 'Apr 15, 2025', folder: 'Purchase-to-Pay',
      customChips: [{ label: 'Analysis Configuration:', value: 'P2P Health Q2 2025' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    // Dictionary Entries — 6 items
    {
      groupLabel: 'Dictionary Entries',
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'IT System',
      name: 'SAP Ariba', version: '2.0', status: 'Published', processId: 'DE-701',
      description: 'Procurement platform used for supplier management, contract negotiation and purchase order processing across Purchase-to-Pay.',
      createdAt: 'Jun 10, 2023', changedAt: 'Jan 08, 2025', folder: 'IT Systems',
      avatarColorScheme: 'Accent1',
      avatarIcon: 'SAP-icons-v4/computer',
      avatarShape: 'Square',
      customChips: [],
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Organisational Unit',
      name: 'Accounts Payable Team — Germany', version: '1.0', status: 'Published', processId: 'DE-702',
      description: 'Organisational unit responsible for invoice processing, payment runs and AP period close in German entities.',
      createdAt: 'Apr 12, 2023', changedAt: 'Feb 14, 2025', folder: 'Organisational Units',
      avatarColorScheme: 'Accent5',
      avatarIcon: 'organization',
      avatarShape: 'Square',
      customChips: [],
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Policy',
      name: 'Purchase Order Approval Policy', version: '2.1', status: 'Published', processId: 'DE-703',
      description: 'Policy defining approval thresholds, dual-control requirements and delegation rules for purchase orders.',
      createdAt: 'Jul 20, 2023', changedAt: 'Mar 01, 2025', folder: 'Policies & Regulations',
      avatarColorScheme: 'Accent8',
      avatarIcon: 'document',
      avatarShape: 'Square',
      customChips: [],
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Role',
      name: 'Procurement Manager', version: '1.1', status: 'Published', processId: 'DE-704',
      description: 'Role responsible for strategic sourcing, category management and supplier relationship oversight.',
      createdAt: 'Sep 05, 2023', changedAt: 'Jan 20, 2025', folder: 'Roles',
      avatarColorScheme: 'Accent3',
      avatarIcon: 'employee',
      avatarShape: 'Square',
      customChips: [],
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Risk',
      name: 'Maverick Spend Risk', version: '1.0', status: 'Draft', processId: 'DE-705',
      description: 'Risk of purchasing outside approved contracts or without a purchase order, leading to uncontrolled spend.',
      createdAt: 'Nov 01, 2024', changedAt: 'Apr 05, 2025', folder: 'Risks',
      avatarColorScheme: 'Accent7',
      avatarIcon: 'risk',
      avatarShape: 'Square',
      customChips: [],
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'IT System',
      name: 'SAP S/4HANA Procurement', version: '3.0', status: 'Published', processId: 'DE-706',
      description: 'Core ERP system used for purchase requisitions, purchase orders, goods receipts and invoice verification.',
      createdAt: 'Jan 10, 2022', changedAt: 'Feb 28, 2025', folder: 'IT Systems',
      avatarColorScheme: 'Accent1',
      avatarIcon: 'computer',
      avatarShape: 'Square',
      customChips: [],
    },
  ],
  closingText: 'This covers everything you need for the quarterly review: the two active improvement initiatives, the live process health dashboard, and the six key dictionary entries that define the systems, roles, policies and risks linked to Purchase-to-Pay. The **AP Automation Rollout** initiative has been updated since last quarter — check the latest milestones before the meeting.',
  followUpPrompts: [
    'Show me the KPIs from the P2P dashboard',
    'What are the biggest risks in this process?',
    'Summarise this for the VP presentation',
    'Are there any open issues or exceptions?',
  ],
};

const OTC_DOWNSTREAM_RESPONSE: FakeResponse = {
  type: 'mixed',
  graphEnabled: true,
  thinking: [
    'Lin is asking about downstream dependencies of the Order-to-Cash process.',
    'Scanning all assets that reference or depend on Order-to-Cash.',
    'Found 6 assets in hop 1, 5 in hop 2, and 3 in hop 3 — 14 total.',
    'Grouping by hop distance from the changed process.',
  ],
  content: 'The changes to the **Order-to-Cash** process propagate across **3 hops** of downstream dependencies, **14 assets** in total.',
  bpmnList: [
    // Hop 1 — 6 assets, all parent = 'center'
    {
      groupLabel: '1 Hop',
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Invoice-to-Cash Execution', version: '3.2', status: 'Published', processId: '6101',
      description: 'Handles invoice generation, payment collection and cash application following order fulfilment.',
      createdAt: 'Mar 10, 2023', changedAt: 'Feb 20, 2025', folder: 'Order-to-Cash',
      parentId: 'center',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Customer Credit Check', version: '2.1', status: 'Published', processId: '6102',
      description: 'Evaluates customer creditworthiness before order confirmation; triggers holds when limits are exceeded.',
      createdAt: 'Jun 15, 2023', changedAt: 'Jan 12, 2025', folder: 'Order-to-Cash',
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'IT System',
      name: 'SAP Order Management', version: '2.0', status: 'Published', processId: 'DE-801',
      description: 'Core system for sales order creation, scheduling, pricing and order confirmation in SAP S/4HANA.',
      createdAt: 'Jan 08, 2022', changedAt: 'Mar 01, 2025', folder: 'IT Systems',
      avatarColorScheme: 'Accent2', avatarIcon: 'computer', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Role',
      name: 'Order Management Specialist', version: '1.0', status: 'Published', processId: 'DE-802',
      description: 'Role responsible for order entry, exception handling and customer communication throughout the O2C cycle.',
      createdAt: 'Apr 20, 2023', changedAt: 'Dec 10, 2024', folder: 'Roles',
      avatarColorScheme: 'Accent3', avatarIcon: 'employee', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Risk',
      name: 'Revenue Recognition Risk', version: '1.1', status: 'Published', processId: 'DE-803',
      description: 'Risk of incorrectly timing or measuring revenue recognition under IFRS 15 during order fulfilment changes.',
      createdAt: 'Sep 05, 2023', changedAt: 'Feb 08, 2025', folder: 'Risks',
      avatarColorScheme: 'Accent7', avatarIcon: 'risk', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Organisational Unit',
      name: 'Customer Service — EMEA', version: '1.0', status: 'Published', processId: 'DE-804',
      description: 'Organisational unit handling customer order queries, escalations and dispute resolution for EMEA.',
      createdAt: 'Jul 14, 2023', changedAt: 'Jan 25, 2025', folder: 'Organisational Units',
      avatarColorScheme: 'Accent5', avatarIcon: 'organization', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    {
    // Hop 2 — 5 assets
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Accounts Receivable Collections', version: '2.8', status: 'Published', processId: '6201',
      groupLabel: '2 Hops',
      description: 'Manages dunning, dispute resolution and collections for overdue receivables generated by O2C.',
      createdAt: 'Feb 12, 2023', changedAt: 'Apr 01, 2025', folder: 'Accounts Receivable',
      parentId: '6101',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Returns & Credit Note Processing', version: '1.9', status: 'Modified', processId: '6202',
      description: 'Handles customer returns, inspection, restocking and credit note issuance linked to original sales orders.',
      createdAt: 'May 08, 2023', changedAt: 'Mar 18, 2025', folder: 'Order-to-Cash',
      parentId: '6101',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Revenue Reporting & Accruals', version: '3.0', status: 'Published', processId: '6203',
      description: 'Monthly revenue accrual and financial reporting process consuming order fulfilment data from O2C.',
      createdAt: 'Jan 20, 2022', changedAt: 'Feb 14, 2025', folder: 'Record to Report',
      parentId: '6101',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Policy',
      name: 'Payment Terms Policy', version: '1.4', status: 'Published', processId: 'DE-901',
      description: 'Defines standard and negotiated payment terms applied to customer invoices generated through O2C.',
      createdAt: 'Aug 01, 2023', changedAt: 'Jan 30, 2025', folder: 'Policies & Regulations',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: '6102',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'IT System',
      name: 'CRM — Salesforce', version: '4.1', status: 'Published', processId: 'DE-902',
      description: 'Customer relationship management system feeding opportunity and contract data into the O2C process.',
      createdAt: 'Mar 15, 2022', changedAt: 'Apr 10, 2025', folder: 'IT Systems',
      avatarColorScheme: 'Accent2', avatarIcon: 'computer', avatarShape: 'Square', customChips: [],
      parentId: '6102',
    },
    // Hop 3 — 3 assets
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Cash Flow Forecasting', version: '2.2', status: 'Published', processId: '6301',
      description: 'Treasury process consuming receivables ageing data from O2C to project short-term cash positions.',
      createdAt: 'Oct 10, 2022', changedAt: 'Mar 25, 2025', folder: 'Treasury',
      groupLabel: '3 Hops',
      parentId: '6201',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Risk',
      name: 'Liquidity Risk', version: '1.2', status: 'Published', processId: 'DE-1001',
      description: 'Risk that delayed collections from O2C changes reduce available cash and breach liquidity covenants.',
      createdAt: 'Nov 20, 2023', changedAt: 'Feb 22, 2025', folder: 'Risks',
      avatarColorScheme: 'Accent7', avatarIcon: 'risk', avatarShape: 'Square', customChips: [],
      parentId: '6203',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Organisational Unit',
      name: 'Group Treasury', version: '1.0', status: 'Published', processId: 'DE-1002',
      description: 'Central treasury function responsible for cash management, FX exposure and liquidity planning.',
      createdAt: 'Jun 01, 2022', changedAt: 'Jan 08, 2025', folder: 'Organisational Units',
      avatarColorScheme: 'Accent5', avatarIcon: 'organization', avatarShape: 'Square', customChips: [],
      parentId: '6203',
    },
  ],
  closingText: 'Any change to Order-to-Cash will cascade downstream. The most critical first-hop impacts are **Invoice-to-Cash** and **Customer Credit Check**. Before proceeding, I recommend notifying the process owners of those assets and assessing whether downstream dashboards or controls need to be updated.',
  followUpPrompts: [
    'Show upstream dependencies',
    'Draft stakeholder notice',
    'Which assets are most critical to validate?',
    'Show me the process owners for each hop',
  ],
};

const S2P_INITIATIVES_RESPONSE: FakeResponse = {
  type: 'mixed',
  graphEnabled: true,
  tableEnabled: true,
  graphCenterNodeName: 'Source-to-Pay',
  thinking: [
    'Lin is asking about active initiatives for the Source-to-Pay process.',
    'Scanning all initiatives tagged with Source-to-Pay scope.',
    'Found 6 initiatives. Cross-referencing their target sub-processes.',
    'Identified 2 initiatives that overlap on Supplier Onboarding and Contract Management sub-processes.',
  ],
  content: 'Here are **6 initiatives** currently active for the **Source-to-Pay** process. **2 of them** are flagged as potentially overlapping — they both target the same sub-process.',
  bpmnList: [
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'S2P Digitalisation Programme', version: '1.0', status: 'Published', processId: 'INI-S2P-01',
      description: 'End-to-end digitalisation of Source-to-Pay covering e-procurement, digital contracting and automated invoice matching.',
      createdAt: 'Jan 10, 2025', changedAt: 'Apr 18, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Target Process:', value: 'Source-to-Pay', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }, { label: 'End Date:', value: 'Dec 31, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'PO Automation & Digital Approval', version: '1.0', status: 'Published', processId: 'INI-S2P-02',
      description: 'Automate purchase order creation and multi-level approval workflows — directly targets the Purchase Order Creation sub-process.',
      createdAt: 'Feb 01, 2025', changedAt: 'Apr 20, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Target Process:', value: 'Purchase Order Creation', design: 'none', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }, { label: 'End Date:', value: 'Sep 30, 2025' }],
      flagIcon: true,
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Procure-to-Order Simplification', version: '1.0', status: 'Published', processId: 'INI-S2P-03',
      description: 'Streamline the end-to-end flow from purchase requisition to order confirmation — includes redesign of Purchase Order Creation.',
      createdAt: 'Mar 15, 2025', changedAt: 'Apr 22, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Target Process:', value: 'Purchase Order Creation', design: 'none', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }, { label: 'End Date:', value: 'Dec 31, 2025' }],
      flagIcon: true,
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Spend Analytics Enhancement', version: '1.0', status: 'Published', processId: 'INI-S2P-04',
      description: 'Improve spend visibility with AI-driven category analysis, benchmarking and savings tracking across all procurement categories.',
      createdAt: 'Nov 01, 2024', changedAt: 'Apr 15, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Target Process:', value: 'Contract Management', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }, { label: 'End Date:', value: 'Jun 30, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Maverick Spend Reduction', version: '1.0', status: 'Published', processId: 'INI-S2P-05',
      description: 'Reduce off-contract purchasing by enforcing preferred supplier compliance and automating PO generation from approved catalogues.',
      createdAt: 'Dec 01, 2024', changedAt: 'Apr 10, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'At Risk', design: 'indication2', leadingIcon: 'warning' }, { label: 'Target Process:', value: 'Invoice Processing & Verification', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }, { label: 'End Date:', value: 'Mar 31, 2026' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Sustainable Procurement Programme', version: '1.0', status: 'Published', processId: 'INI-S2P-06',
      description: 'Embed ESG scoring into supplier evaluation and sourcing decisions to meet GlobalMfg AG 2030 sustainability targets.',
      createdAt: 'Apr 01, 2025', changedAt: 'Apr 25, 2025', folder: 'Source-to-Pay',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Target Process:', value: 'Supplier Evaluation & Selection', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }, { label: 'End Date:', value: 'Dec 31, 2026' }],
    },
  ],
  closingText: 'The **PO Automation & Digital Approval** and **Procure-to-Order Simplification** initiatives both target the **Purchase Order Creation** sub-process of Source-to-Pay. Running them in parallel without coordination risks duplicate effort, conflicting process designs and change fatigue for the same stakeholder group.',
  graphBpmnList: [
    // 1 Hop: 1 initiative + 4 sub-processes + 2 dictionary entries
    {
      groupLabel: '1 Hop',
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'S2P Digitalisation Programme', version: '1.0', status: 'Published', processId: 'INI-S2P-01',
      description: 'End-to-end digitalisation of Source-to-Pay covering e-procurement, digital contracting and automated invoice matching.',
      createdAt: 'Jan 10, 2025', changedAt: 'Apr 18, 2025', folder: 'Source-to-Pay',
      parentId: 'center',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Purchase Order Creation', version: '3.1', status: 'Published', processId: 'S2P-SUB-01',
      description: 'Creation, approval and conversion of purchase requisitions to purchase orders.',
      flagIcon: true,
      warningHighlight: true,
      createdAt: 'Feb 10, 2023', changedAt: 'Mar 15, 2025', folder: 'Source-to-Pay',
      parentId: 'center',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Contract Management', version: '2.4', status: 'Published', processId: 'S2P-SUB-02',
      description: 'End-to-end lifecycle management of supplier contracts including creation, approval, renewal and compliance monitoring.',
      createdAt: 'Mar 08, 2023', changedAt: 'Feb 20, 2025', folder: 'Source-to-Pay',
      parentId: 'center',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Supplier Evaluation & Selection', version: '1.8', status: 'Published', processId: 'S2P-SUB-03',
      description: 'Structured process for qualifying, scoring and selecting suppliers for preferred vendor lists.',
      createdAt: 'Apr 15, 2023', changedAt: 'Jan 28, 2025', folder: 'Source-to-Pay',
      parentId: 'center',
    },
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Invoice Processing & Verification', version: '2.9', status: 'Published', processId: 'S2P-SUB-04',
      description: 'Three-way matching, exception handling and approval of supplier invoices before payment.',
      createdAt: 'Jun 20, 2023', changedAt: 'Apr 05, 2025', folder: 'Source-to-Pay',
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'IT System',
      name: 'SAP Ariba', version: '2.0', status: 'Published', processId: 'DE-S2P-01',
      description: 'Procurement platform for supplier management, sourcing and purchase order processing.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'IT Systems',
      avatarColorScheme: 'Accent1', avatarIcon: 'computer', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    {
      domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry',
      displayAssetType: 'Policy',
      name: 'Procurement Policy Framework', version: '1.3', status: 'Published', processId: 'DE-S2P-02',
      description: 'Corporate policy defining approval thresholds, preferred supplier obligations and compliance requirements for procurement.',
      createdAt: 'Sep 10, 2023', changedAt: 'Feb 18, 2025', folder: 'Policies & Regulations',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: 'center',
    },
    // 2 Hops: 5 initiatives linked via sub-processes
    {
      groupLabel: '2 Hops',
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'PO Automation & Digital Approval', version: '1.0', status: 'Published', processId: 'INI-S2P-02',
      description: 'Automate purchase order creation and multi-level approval workflows — directly targets the Purchase Order Creation sub-process.',
      flagIcon: true,
      warningHighlight: true,
      createdAt: 'Feb 01, 2025', changedAt: 'Apr 20, 2025', folder: 'Source-to-Pay',
      parentId: 'S2P-SUB-01',
      flaggedEdge: true,
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Procure-to-Order Simplification', version: '1.0', status: 'Published', processId: 'INI-S2P-03',
      description: 'Streamline the end-to-end flow from purchase requisition to order confirmation — includes redesign of Purchase Order Creation.',
      createdAt: 'Mar 01, 2025', changedAt: 'Apr 20, 2025', folder: 'Source-to-Pay',
      parentId: 'S2P-SUB-01',
      flaggedEdge: true,
      flagIcon: true,
      warningHighlight: true,
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Spend Analytics Enhancement', version: '1.0', status: 'Published', processId: 'INI-S2P-04',
      description: 'Improve spend visibility with AI-driven category analysis and savings tracking across all procurement categories.',
      createdAt: 'Nov 01, 2024', changedAt: 'Apr 15, 2025', folder: 'Source-to-Pay',
      parentId: 'S2P-SUB-02',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Maverick Spend Reduction', version: '1.0', status: 'Published', processId: 'INI-S2P-05',
      description: 'Reduce off-contract purchasing by enforcing preferred supplier compliance and automating PO generation from approved catalogues.',
      createdAt: 'Dec 01, 2024', changedAt: 'Apr 10, 2025', folder: 'Source-to-Pay',
      parentId: 'S2P-SUB-04',
      customChips: [{ label: 'Status:', value: 'At Risk', design: 'indication2', leadingIcon: 'warning' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Sustainable Procurement Programme', version: '1.0', status: 'Published', processId: 'INI-S2P-06',
      description: 'Embed ESG scoring into supplier evaluation and sourcing decisions to meet GlobalMfg AG 2030 sustainability targets.',
      createdAt: 'Apr 01, 2025', changedAt: 'Apr 25, 2025', folder: 'Source-to-Pay',
      parentId: 'S2P-SUB-03',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
  ],
  followUpPrompts: [
    'Show me the overlapping sub-processes in detail',
    'Who owns each of these initiatives?',
    'Suggest how to consolidate the overlapping initiatives',
    'Are there similar overlaps in other processes?',
  ],
};

// --- Scenario 7: Sandra — Employee Onboarding compliance audit ---

const EMPLOYEE_ONBOARDING_CONTEXT_RESPONSE: FakeResponse = {
  type: 'text',
  thinking: [
    'Querying Suite Repository relation graph for Employee Onboarding…',
    'Resolving parent, sub-process, predecessor and successor relations…',
    'Filtering by region: Germany…',
    'Returning 11 connected assets across 4 relation types.',
  ],
  content: 'Here is the full process context for **Employee Onboarding** in the Germany region. It connects to **1 parent process**, **4 sub-processes**, **3 predecessor processes**, and **3 successor processes**.',
  crossGraphEnabled: true,
  bpmnList: [
    // Top — parent
    { direction: 'top', name: 'Hire-to-Retire', version: '3.0', status: 'Published', processId: '8821', description: 'End-to-end employee lifecycle management.', createdAt: 'Jan 12, 2022', changedAt: 'Mar 04, 2025', folder: 'Human Resources', domainObjectType: 'Value Chain', assetType: 'Value Chain', displayAssetType: 'Value Chain' },
    // Bottom — sub-processes
    { direction: 'bottom', name: 'Create System Access & User Accounts', version: '1.4', status: 'Published', processId: '9134', description: 'Provision IT accounts, LMS access, and collaboration tools for new employees.', createdAt: 'Feb 20, 2023', changedAt: 'Apr 28, 2025', folder: 'Human Resources / Onboarding', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'bottom', name: 'Enroll in Payroll & Benefits', version: '2.0', status: 'Published', processId: '9135', description: 'Register the new employee in payroll, select benefit packages.', createdAt: 'Mar 01, 2023', changedAt: 'Jan 15, 2025', folder: 'Human Resources / Onboarding', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'bottom', name: 'Complete Compliance & Legal Training', version: '1.1', status: 'Draft', processId: '9136', description: 'Data Privacy, Code of Conduct, and Health & Safety modules — mandatory within 30 days.', createdAt: 'Jun 10, 2023', changedAt: 'May 02, 2025', folder: 'Human Resources / Onboarding', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'bottom', name: 'Procure Work Equipment', version: '1.7', status: 'Published', processId: '9137', description: 'Order and deliver hardware, software licenses, and office equipment.', createdAt: 'Apr 05, 2022', changedAt: 'Feb 11, 2025', folder: 'Human Resources / Onboarding', domainObjectType: 'Process Model', assetType: 'BPMN' },
    // Left — predecessors
    { direction: 'left', name: 'Employment Contract Signing', version: '2.3', status: 'Published', processId: '8802', description: 'Finalise and execute the employment contract with the new hire.', createdAt: 'Sep 14, 2021', changedAt: 'Apr 30, 2025', folder: 'Human Resources / Recruiting', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'left', name: 'Pre-employment Background Check', version: '1.0', status: 'Published', processId: '8803', description: 'Identity, criminal record, and reference verification.', createdAt: 'Oct 01, 2021', changedAt: 'Dec 03, 2024', folder: 'Human Resources / Recruiting', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'left', name: 'Headcount & Budget Approval', version: '1.2', status: 'Published', processId: '8804', description: 'Finance and management approval for the new position.', createdAt: 'Jan 08, 2022', changedAt: 'Nov 20, 2024', folder: 'Human Resources / Planning', domainObjectType: 'Process Model', assetType: 'BPMN' },
    // Right — successors
    { direction: 'right', name: 'Performance Goal Setting', version: '1.5', status: 'Published', processId: '9201', description: 'Define OKRs and KPIs with the new employee for the first review period.', createdAt: 'Feb 14, 2022', changedAt: 'Jan 27, 2025', folder: 'Human Resources / Performance', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'right', name: 'Probation Period Initiation', version: '1.0', status: 'Published', processId: '9202', description: 'Formally start the probation period and schedule mid-point review.', createdAt: 'Mar 03, 2022', changedAt: 'Feb 01, 2025', folder: 'Human Resources / Performance', domainObjectType: 'Process Model', assetType: 'BPMN' },
    { direction: 'right', name: 'IT Asset Tracking', version: '2.1', status: 'Published', processId: '7743', description: 'Register issued equipment and licenses in the IT asset management system.', createdAt: 'Apr 12, 2022', changedAt: 'Mar 10, 2025', folder: 'IT / Asset Management', domainObjectType: 'Process Model', assetType: 'BPMN' },
  ],
  closingText: 'To investigate which of these processes may be contributing to the low completion rates, you can ask me to analyse the metadata signals across connected assets.',
  followUpPrompts: [
    'Which of these could be contributing to the issue?',
    'Who are the process owners for these connected processes?',
    'Show me only the sub-processes',
  ],
};


// --- Scenario 8: Lena — Keynote 3-turn flow ---

const LENA_T1_RESPONSE: FakeResponse = {
  type: 'mixed',
  thinking: [
    'Lena is Head of Procurement EMEA — loading her area of responsibility.',
    'Scanning all procurement EMEA processes, initiatives, KPIs, and maturity signals.',
    'Cross-referencing initiative scope against process targets to detect overlaps.',
    'Found 1 performance gap without coverage, 1 initiative overlap on Purchase Order Creation, 2 active programmes on track, 1 KPI covered by an active initiative, 2 maturity gaps.',
  ],
  content: 'Here is what needs your attention across **Procurement EMEA** right now.',
  bpmnList: [
    // Alarm 1 — performance gap
    {
      domainObjectType: 'Metric', assetType: 'Metric', displayAssetType: 'Metric',
      avatarColorScheme: 'Accent6', avatarIcon: 'metric', avatarShape: 'Square',
      name: 'Invoice Dispute Resolution Time', version: '2.1', status: 'Published', processId: 'PROC-101',
      description: 'Tracks average time to resolve disputed supplier invoices from opening to clearance. Current performance: 8.2 days against a 5-day target.',
      createdAt: 'Mar 14, 2023', changedAt: 'Feb 06, 2025', folder: 'Procurement EMEA / Accounts Payable',
      flagIcon: true,
      customChips: [
        { label: 'Current Value:', value: '8.2 Days', design: 'indication10' },
        { label: 'Target Value:', value: '5 Days', design: 'indication10' },
        { label: 'Linked Processes:', value: 'Invoice Dispute Resolution', leadingIcon: '$processManager' },
        { label: 'Linked Initiatives:', value: 'None', design: 'none', leadingIcon: 'overview-chart' },
      ],
    },
    // Alarm 2 — initiative overlap (punchline)
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Purchase Order Creation', version: '3.1', status: 'Published', processId: 'PROC-102',
      description: 'Covers the creation, approval and conversion of purchase requisitions into purchase orders in SAP, including multi-level approval workflows and preferred vendor assignment.',
      createdAt: 'Feb 10, 2023', changedAt: 'Mar 15, 2025', folder: 'Procurement EMEA / Purchase-to-Pay',
      flagIcon: true,
      customChips: [
        { label: 'Status:', value: 'Published', design: 'indication5', leadingIcon: '$published' },
        { label: 'Linked Initiatives:', value: 'AP Automation Rollout', design: 'none', leadingIcon: 'overview-chart' },
        { label: 'Linked Initiatives:', value: 'Procure-to-Order Simplification', design: 'none', leadingIcon: 'overview-chart' },
      ],
    },
    {
      domainObjectType: 'Metric', assetType: 'Metric', displayAssetType: 'Metric',
      avatarColorScheme: 'Accent6', avatarIcon: 'metric', avatarShape: 'Square',
      name: 'Contract Compliance Rate', version: '2.3', status: 'Published', processId: 'DASH-W01',
      description: 'Measures the percentage of total procurement spend covered by active contracts. Current performance: 78% against an 80% target.',
      createdAt: 'Apr 22, 2024', changedAt: 'Apr 05, 2025', folder: 'Procurement EMEA',
      customChips: [{ label: 'Current Value:', value: '78%', design: 'indication10' }, { label: 'Target Value:', value: '80%', design: 'indication10' }, { label: 'Linked Initiatives:', value: 'AP Automation Rollout', leadingIcon: 'overview-chart' }],
    },
    // Watch — healthy initiatives
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'S2P Digitalisation Programme', version: '1.0', status: 'Published', processId: 'INI-W01',
      description: 'End-to-end digitalisation of procurement operations across EMEA — covering e-procurement adoption, digital contracting with suppliers, and automated invoice matching for PO-backed spend.',
      createdAt: 'Jan 10, 2025', changedAt: 'Apr 18, 2025', folder: 'Procurement EMEA',
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Target Processes:', value: 'Source to Pay', leadingIcon: '$processManager' }, { label: '', value: '+2' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Supplier Consolidation Programme', version: '1.0', status: 'Draft', processId: 'INI-W02',
      description: 'Reduce the active supplier base by rationalising low-spend and duplicate vendors — targeting a 30% reduction in Germany through category consolidation and preferred supplier enforcement.',
      createdAt: 'Mar 15, 2025', changedAt: 'Apr 22, 2025', folder: 'Procurement EMEA',
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Target Processes:', value: 'None', design: 'none', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    // Blind Spots — maturity gaps
    {
      domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Indirect Procurement (DE)', version: '—', status: 'Published', processId: 'PROC-BS01',
      description: 'Covers non-production goods and services procurement in Germany — including MRO, facility services, and IT consumables. No published process model or performance dashboard exists for this area.',
      createdAt: 'Nov 12, 2023', changedAt: 'Feb 03, 2025', folder: 'Procurement EMEA / Germany',
      customChips: [
        { label: 'Status:', value: 'Published', design: 'indication5', leadingIcon: '$published' },
        { label: 'Linked Dashboards:', value: 'None', design: 'none', leadingIcon: 'business-objects-mobile' },
        { label: 'Linked Initiatives:', value: 'None', design: 'none', leadingIcon: 'overview-chart' },
      ],
    },
    {
      domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Spot Buy Optimisation', version: '1.0', status: 'Published', processId: 'INI-BS01',
      description: 'Reduce unplanned and off-catalogue purchasing by enforcing preferred supplier usage and automating approval for low-value spot buys — no target process model currently linked in SR.',
      createdAt: 'Feb 01, 2025', changedAt: 'Apr 10, 2025', folder: 'Procurement EMEA',
      customChips: [{ label: 'Status:', value: 'In Progress', design: 'indication5', leadingIcon: 'in-progress' }, { label: 'Target Processes:', value: 'None', design: 'none', leadingIcon: '$processManager' }, { label: 'Owner:', value: 'Tim Bauer', avatarInitial: 'TB' }],
    },
  ],
  closingText: 'Two items stand out. **Invoice Dispute Resolution** is running at 8.2 days against a 5-day target with no active initiative covering it — a known performance gap with no one assigned to close it. And two initiatives — **AP Automation Rollout** and **Procure-to-Order Simplification** — are both targeting **Purchase Order Creation** with different owners and no coordination on record.\n\n**Contract compliance** is currently at 78% against an 80% target, and the S2P programme is the active initiative covering that gap — no intervention needed here right now.\n\nThe **S2P Digitalisation Programme** is on track and the most significant active programme in your area, so keep an eye on it. It covers three processes — e-procurement, digital contracting, and invoice matching — under Maria Hoffmann\'s ownership.\n\nThe **Supplier Consolidation Programme** is in planning phase with no target process model linked yet. Sophie Wagner owns it, but until a process design is committed in SR, there\'s no baseline to change against — worth flagging in your next check-in with her.\n\n**Indirect Procurement (DE)** is the most significant blind spot. There is no linked dashboard and no active initiative covering it. If something goes wrong here — a compliance issue, a cost spike — there\'s nothing to reference and no metric to detect it.\n\n**Spot Buy Optimisation** is an active initiative running without a target process model in SR. The team is working on reducing unplanned purchasing, but no one has designed what \"better\" looks like in process terms. The change is happening without a baseline.',
  followUpPrompts: [
    'Walk me through what\'s actually happening between those two initiatives.',
    'Show me all the responsible people for Invoice Dispute Resolution.',
  ],
};

const LENA_IDR_PEOPLE_RESPONSE: FakeResponse = {
  type: 'text',
  thinking: [
    'Resolving all people connected to Invoice Dispute Resolution via process ownership, analysis, and active initiatives.',
    'Checking process owner, responsible roles, dashboard owners, and initiative owners in SR.',
    'Found 5 people connected across SPM, PINT, and TM.',
  ],
  content: 'Here are all the people connected to **Invoice Dispute Resolution** across Signavio:\n\n**Process ownership (SPM)**\n- **Laure Chen** — Process Owner. Responsible for the design and maintenance of the process model.\n- **Marcus Holt** — Process Responsible. Accountable for day-to-day execution and exception handling.\n\n**Performance monitoring (PINT)**\n- **Sophie Wagner** — Owner of the *AP Efficiency* dashboard, which includes the metric that tracks the invoice dispute resolution time.\n\n**No active initiative** is currently targeting this process. No programme owner is assigned.\n\n**Related dictionary entries**\n- **Jan Holt** — Owner of the *Invoice* dictionary entry, which is referenced by this process.\n\nIn total: 4 people are connected to this process via SR today. The gap — no programme owner — is why the performance issue has no one assigned to close it.',
  followUpPrompts: [
    'Walk me through what\'s actually happening between those two initiatives.',
    'What needs my attention next?',
  ],
};

const LENA_T1_DETAIL_RESPONSE: FakeResponse = {  type: 'text',
  thinking: [
    'Expanding on the Monitor and Be Aware sections from the attention briefing.',
    'Summarising initiative health, coverage gaps, and maturity signals.',
  ],
  content: '**Monitor**\n\nThe **S2P Digitalisation Programme** is on track and the most significant active programme in your area. It covers three processes — e-procurement, digital contracting, and invoice matching — under Maria Hoffmann\'s ownership. Contract compliance is currently at 78% against an 80% target, and the programme is the active initiative covering that gap, so no intervention is needed here right now.\n\nThe **Supplier Consolidation Programme** is in planning phase with no target process model linked yet. Sophie Wagner owns it, but until a process design is committed in SR, there\'s no baseline to change against — worth flagging in your next check-in with her.\n\n**Be Aware**\n\n**Indirect Procurement (DE)** is the most significant blind spot. It exists as a folder and a label in your area, but there is no published process model, no linked dashboard, and no active initiative covering it. If something goes wrong here — a compliance issue, a cost spike — there\'s nothing to reference and no metric to detect it.\n\n**Spot Buy Optimisation** is an active initiative running without a target process model in SR. The team is working on reducing unplanned purchasing, but no one has designed what "better" looks like in process terms. The change is happening without a baseline.',
  followUpPrompts: [
    'Walk me through what\'s actually happening between those two initiatives.',
    'Who owns Invoice Dispute Resolution?',
    'What needs my attention next?',
  ],
};

const LENA_T2_RESPONSE: FakeResponse = {
  type: 'mixed',
  graphEnabled: true,
  tableEnabled: true,
  graphCenterNodeName: 'Purchase Order Creation',
  graphCenterFlagged: true,
  graphCenterWarning: true,
  thinking: [
    'Loading full asset map for AP Automation Rollout and Procure-to-Order Simplification.',
    'Resolving all linked processes, KPIs, dashboards, and dictionary entries for each initiative.',
    'Cross-referencing asset maps to identify the intersection point.',
    'Found 1 shared process: Purchase Order Creation. All other assets are distinct.',
  ],
  content: 'Here are the details and relation graph for both initiatives – and where they collide.',
  bpmnList: [
    { domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'AP Automation Rollout', version: '1.0', status: 'Published', processId: 'INI-T2-01',
      description: 'Deploy OCR-based invoice capture and 3-way match automation for PO-backed invoices. Reduce manual invoice processing cost by 40%; eliminate late payment penalties.',
      createdAt: 'Jan 15, 2025', changedAt: 'Apr 20, 2025', folder: 'S2P Digitalisation Programme',
      flagIcon: true,
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Target Processes:', value: 'Purchase Order Creation', design: 'none', leadingIcon: '$processManager' }, { label: '+2', value: '' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }, { label: 'End Date:', value: 'Jun 30, 2027' }],
    },
    { domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Procure-to-Order Simplification', version: '1.0', status: 'Published', processId: 'INI-T2-02',
      description: 'Streamline the flow from purchase requisition to order confirmation, including redesign of approval steps. Reduce PO cycle time from 12 days to 8 days.',
      createdAt: 'Mar 15, 2025', changedAt: 'Apr 22, 2025', folder: 'Operational Excellence Programme',
      flagIcon: true,
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Target Processes:', value: 'Purchase Order Creation', design: 'none', leadingIcon: '$processManager' }, { label: '+2', value: '' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }, { label: 'End Date:', value: 'Mar 31, 2027' }],
    },
  ],
  graphBpmnList: [
    // Hop 1 — Purchase Order Creation is the center node (no items needed, it IS the center)
    // Hop 2 — 2 initiatives + 3 sub-processes, all connected to center
    { groupLabel: '1 Hop', domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'AP Automation Rollout', version: '1.0', status: 'Published', processId: 'INI-T2-01',
      description: 'On Track — build phase. Owner: Maria Hoffmann.',
      createdAt: 'Jan 15, 2025', changedAt: 'Apr 20, 2025', folder: 'S2P Digitalisation Programme',
      parentId: 'center', flagIcon: true, warningHighlight: true,
      customChips: [{ label: 'Status:', value: 'On Track', design: 'indication4', leadingIcon: 'trend-up' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    { domainObjectType: 'Initiative', assetType: 'Initiative',
      name: 'Procure-to-Order Simplification', version: '1.0', status: 'Published', processId: 'INI-T2-02',
      description: 'Planning — design phase not started. Owner: Sophie Wagner.',
      createdAt: 'Mar 15, 2025', changedAt: 'Apr 22, 2025', folder: 'Operational Excellence Programme',
      parentId: 'center', flagIcon: true, warningHighlight: true,
      customChips: [{ label: 'Status:', value: 'Planning', design: 'indication6', leadingIcon: 'calendar' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'PO Approval', version: '1.2', status: 'Published', processId: 'SUB-T2-01',
      description: 'Sub-process of Purchase Order Creation.',
      createdAt: 'Feb 10, 2023', changedAt: 'Mar 15, 2025', folder: 'Procurement EMEA',
      parentId: 'center',
    },
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Vendor Invoice Matching', version: '1.0', status: 'Published', processId: 'SUB-T2-02',
      description: 'Sub-process of Purchase Order Creation.',
      createdAt: 'Feb 10, 2023', changedAt: 'Mar 15, 2025', folder: 'Procurement EMEA',
      parentId: 'center',
    },
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'PO Amendment Handling', version: '1.0', status: 'Published', processId: 'SUB-T2-03',
      description: 'Sub-process of Purchase Order Creation.',
      createdAt: 'Feb 10, 2023', changedAt: 'Mar 15, 2025', folder: 'Procurement EMEA',
      parentId: 'center',
    },
    // Hop 2 — 6 assets linked to AP Automation Rollout
    { groupLabel: '2 Hops', domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Invoice Processing', version: '2.4', status: 'Published', processId: 'PROC-T2-01',
      description: 'Three-way matching and exception handling for supplier invoices.',
      createdAt: 'Apr 03, 2024', changedAt: 'Feb 14, 2025', folder: 'Procurement EMEA / Accounts Payable',
      parentId: 'INI-T2-01',
    },
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Payment Run', version: '1.8', status: 'Published', processId: 'PROC-T2-02',
      description: 'Automated payment execution for cleared invoices.',
      createdAt: 'Jun 20, 2023', changedAt: 'Jan 10, 2025', folder: 'Procurement EMEA / Accounts Payable',
      parentId: 'INI-T2-01',
    },
    { domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'AP Efficiency', version: '1.5', status: 'Published', processId: 'DASH-T2-01',
      description: 'AP performance dashboard.',
      createdAt: 'Mar 01, 2024', changedAt: 'Apr 15, 2025', folder: 'Procurement EMEA',
      parentId: 'INI-T2-01',
      customChips: [{ label: 'Invoice Processing Time:', value: '4.2 Days', design: 'indication2' }, { label: 'Owner:', value: 'Sophie Wagner', avatarInitial: 'SW' }],
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Role',
      name: 'Vendor', version: '1.0', status: 'Published', processId: 'DE-T2-01',
      description: 'Approved supplier in the vendor master.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent3', avatarIcon: 'employee', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-01',
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Document',
      name: 'Invoice', version: '1.0', status: 'Published', processId: 'DE-T2-02',
      description: 'Formal payment request submitted by a vendor.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-01',
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Policy',
      name: 'Payment Terms', version: '1.0', status: 'Published', processId: 'DE-T2-03',
      description: 'Agreed schedule for settling invoices.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-01',
    },
    // 6 assets linked to Procure-to-Order Simplification
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Purchase Requisition Creation', version: '3.5', status: 'Published', processId: 'PROC-T2-03',
      description: 'Creation and approval of purchase requisitions before conversion to POs.',
      createdAt: 'Jan 20, 2023', changedAt: 'Feb 10, 2025', folder: 'Procurement EMEA / Purchase-to-Pay',
      parentId: 'INI-T2-02',
    },
    { domainObjectType: 'Process Model', assetType: 'BPMN',
      name: 'Vendor Selection', version: '1.8', status: 'Published', processId: 'PROC-T2-04',
      description: 'Structured process for selecting preferred vendors.',
      createdAt: 'Apr 15, 2023', changedAt: 'Jan 28, 2025', folder: 'Procurement EMEA / Supplier Management',
      parentId: 'INI-T2-02',
    },
    { domainObjectType: 'Dashboard', assetType: 'Dashboard',
      name: 'P2P Cycle Time & Compliance', version: '1.8', status: 'Published', processId: 'DASH-T2-02',
      description: 'P2P cycle time and compliance dashboard.',
      createdAt: 'Jul 08, 2024', changedAt: 'Mar 30, 2025', folder: 'Procurement EMEA',
      parentId: 'INI-T2-02',
      customChips: [{ label: 'PO Cycle Time:', value: '12 Days', design: 'indication2' }, { label: 'Owner:', value: 'Maria Hoffmann', avatarInitial: 'MH' }],
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Document',
      name: 'Purchase Order', version: '1.0', status: 'Published', processId: 'DE-T2-04',
      description: 'Formal commitment to purchase goods or services from a vendor.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-02',
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Policy',
      name: 'Approval Threshold', version: '1.0', status: 'Published', processId: 'DE-T2-06',
      description: 'Spend limit above which additional sign-off is required.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent8', avatarIcon: 'document', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-02',
    },
    { domainObjectType: 'Dictionary Entry', assetType: 'Dictionary Entry', displayAssetType: 'Role',
      name: 'Preferred Vendor', version: '1.0', status: 'Published', processId: 'DE-T2-07',
      description: 'Vendor with a negotiated framework agreement.',
      createdAt: 'Jan 08, 2022', changedAt: 'Jan 08, 2025', folder: 'Dictionary',
      avatarColorScheme: 'Accent3', avatarIcon: 'employee', avatarShape: 'Square', customChips: [],
      parentId: 'INI-T2-02',
    },
  ],
  closingText: '**Procure-to-Order Simplification** owned by Sophie Wagner is upstream of **AP Automation Rollout** owned by Maria Hoffmann. The simplification needs to land before the automation can be built on a stable baseline. Right now, neither team knows the other is working on the same process.',
  followUpPrompts: [
    'Sort out the PO one — who do I loop in and what do I tell them?',
    'Can you show me only the shared process?',
    'Who owns the Purchase Order Creation BPMN model?',
  ],
};

const LENA_T3_RESPONSE: FakeResponse = {
  type: 'text',
  thinking: [
    'Lena wants to align Maria Hoffmann and Sophie Wagner on the Purchase Order Creation overlap.',
    'Sophie\'s simplification is upstream — it must complete before Maria\'s automation builds on top.',
    'Drafting a consolidation recommendation and a message Lena can send directly.',
    'Generating a named shareable view with the full T2 asset set.',
  ],
  content: 'The two people you need are **Maria Hoffmann** (AP Automation Rollout) and **Sophie Wagner** (Procure-to-Order Simplification). Sophie\'s work is upstream — her redesign needs to land before Maria\'s automation is layered on top.\n\n**Recommendation:** Bring Sophie\'s redesign in as a design phase under Maria\'s programme. One change programme, one communication track. Sophie\'s workstream doesn\'t stop — it becomes the prerequisite.\n\nI can draft a message for Maria and Sophie, and create a saved view with the full asset picture for the alignment call.',
  closingText: undefined,
  followUpPrompts: [
    'Save the PO overlap view for the alignment call',
    'Draft the message to Maria and Sophie',
    'Show me other overlaps in my area',
    'What needs my attention next?',
  ],
};

const BUTTON_RESPONSE_MAP: Record<string, FakeResponse> = {
  'Show me all our processes that use the IT System Celonis': CELONIS_OWNERS_RESPONSE,
  'Show me all processes that use Celonis': CELONIS_OWNERS_RESPONSE,
  'Show me the process owners for each model': CELONIS_OWNERS_RESPONSE,
  'Which models have active Celonis analyses?': COMING_SOON_RESPONSE,
  'Are there other IT systems with similar dependencies?': COMING_SOON_RESPONSE,
  'Help me plan the replacement rollout': COMING_SOON_RESPONSE,
  'Draft a migration impact summary': COMING_SOON_RESPONSE,
  'Which initiatives are behind schedule?': COMING_SOON_RESPONSE,
  'What KPIs are most critical to track?': COMING_SOON_RESPONSE,
  'Are there any gaps in process coverage?': COMING_SOON_RESPONSE,
  'Summarise this for a steering committee slide': COMING_SOON_RESPONSE,
  'Who are the process owners I should talk to?': COMING_SOON_RESPONSE,
  'Which processes are most important to know first?': COMING_SOON_RESPONSE,
  'Are there any open issues or exceptions I should be aware of?': COMING_SOON_RESPONSE,
  'Show me processes that are currently being changed': COMING_SOON_RESPONSE,
  'Show me the KPIs from the P2P dashboard': COMING_SOON_RESPONSE,
  'What are the biggest risks in this process?': COMING_SOON_RESPONSE,
  'Summarise this for the VP presentation': COMING_SOON_RESPONSE,
  'Are there any open issues or exceptions?': COMING_SOON_RESPONSE,
  'Show upstream dependencies': COMING_SOON_RESPONSE,
  'Draft stakeholder notice': COMING_SOON_RESPONSE,
  'Which assets are most critical to validate?': COMING_SOON_RESPONSE,
  'Show me the process owners for each hop': COMING_SOON_RESPONSE,
  'Which of these could be contributing to the issue?': COMING_SOON_RESPONSE,
  'Who are the process owners for these connected processes?': COMING_SOON_RESPONSE,
  'Show me only the sub-processes': COMING_SOON_RESPONSE,
  'Who owns Complete Compliance & Legal Training?': COMING_SOON_RESPONSE,
  'Are there similar issues in other HR processes?': COMING_SOON_RESPONSE,
  'Show me the overlapping sub-processes in detail': COMING_SOON_RESPONSE,
  'Who owns each of these initiatives?': COMING_SOON_RESPONSE,
  'Suggest how to consolidate the overlapping initiatives': COMING_SOON_RESPONSE,
  'Are there similar overlaps in other processes?': COMING_SOON_RESPONSE,
  // Lena keynote 3-turn flow
  'What in my area needs my attention right now?': LENA_T1_RESPONSE,
  'Walk me through what\'s actually happening between those two initiatives.': LENA_T2_RESPONSE,
  'Walk me through what\'s actually happening between those two programmes.': LENA_T2_RESPONSE,
  'Sort out the PO one — who do I loop in and what do I tell them?': LENA_T3_RESPONSE,
  'Draft the message to Maria and Sophie': {
    type: 'text',
    content: '**Draft message:**\n\n> *"Hi Maria and Sophie — I want to flag that both your programmes are currently targeting the Purchase Order Creation process independently. Before we go further, I\'d like you two to connect and assess whether Sophie\'s simplification work should run as a design phase inside the S2P programme. I\'ve shared a view of the overlap below. Can we set up a 30-min call this week? Lena"*',
    followUpPrompts: [
      'Send this message to Maria and Sophie',
      'Save the PO overlap view for the alignment call',
      'What needs my attention next?',
    ],
  },
  'Save the PO overlap view for the alignment call': {
    type: 'text',
    content: 'The **PO Creation Overlap** view has been saved and pinned to the Repository\'s side navigation under Pinned Views. [Open View](#)',
    followUpPrompts: [
      'Draft the message to Maria and Sophie',
      'Show me other overlaps in my area',
      'What needs my attention next?',
    ],
  },
  'Send this message to Maria and Sophie': COMING_SOON_RESPONSE,
  'Show me other overlaps in my area': COMING_SOON_RESPONSE,
  'Give me a summary of the Monitor and Be Aware items.': LENA_T1_DETAIL_RESPONSE,
  'Show me all the responsible people for Invoice Dispute Resolution.': LENA_IDR_PEOPLE_RESPONSE,
  'What needs my attention next?': LENA_T1_RESPONSE,
  'Who owns Invoice Dispute Resolution?': COMING_SOON_RESPONSE,
  'Show me everything in my area': COMING_SOON_RESPONSE,
  'Can you show me only the shared process?': COMING_SOON_RESPONSE,
  'Who owns the Purchase Order Creation BPMN model?': COMING_SOON_RESPONSE,
  // MCP display mode demos
  'How can MCP apps be embedded in the UI?': MCP_INTRO_RESPONSE,
  'As Widget': MCP_WIDGET_RESPONSE,
  'As Applet': MCP_APPLET_RESPONSE,
  'As Panel': MCP_PANEL_RESPONSE,
  'As Canvas': MCP_CANVAS_RESPONSE,
};

function resolveResponse(content: string): FakeResponse | undefined {
  const text = content.trim();
  // Exact match first
  if (BUTTON_RESPONSE_MAP[text]) return BUTTON_RESPONSE_MAP[text];

  const STOPWORDS = new Set(['a','an','the','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','i','me','my','we','our','you','your','it','its','this','that','these','those','for','of','in','on','at','to','from','by','with','and','or','but','not','so','as','all','any','some','what','which','who','how','when','where','show','tell','give','find','get','list','please','about','into','there','their']);

  const SYNONYMS: Record<string, string> = {
    'p2p': 'purchase pay',
    'o2c': 'order cash',
    's2p': 'source pay',
    'downstream': 'downstream effect impact depend',
    'dependencies': 'depend dependency',
    'dependency': 'depend',
    'impacts': 'impact effect',
    'affecting': 'affect effect',
    'affected': 'affect effect',
    'changing': 'change',
    'changed': 'change',
    'transformation': 'transform',
    'initiatives': 'initiative',
    'processes': 'process',
    'overlapping': 'overlap',
    'overlaps': 'overlap',
    'quarterly': 'quarterly review',
    'onboarding': 'onboard join',
    'joined': 'join onboard',
    'procurement': 'procurement procure purchase',
    'replacing': 'replace replacement',
    'migration': 'migrate replacement rollout',
  };

  const tokenize = (str: string): Set<string> => {
    const tokens = new Set<string>();
    str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOPWORDS.has(t))
      .forEach(t => {
        tokens.add(t);
        if (SYNONYMS[t]) SYNONYMS[t].split(' ').forEach(s => tokens.add(s));
      });
    return tokens;
  };

  const CANDIDATES: { response: FakeResponse; must?: string[]; keywords: string[] }[] = [
    {
      response: EMPLOYEE_ONBOARDING_CONTEXT_RESPONSE,
      must: ['onboarding'],
      keywords: ['onboarding', 'employee', 'hr', 'human resources', 'compliance', 'training', 'completion', 'connected', 'context', 'germany', 'threshold', 'audit'],
    },
    {
      response: CELONIS_OWNERS_RESPONSE,
      must: ['celonis'],
      keywords: ['celonis', 'system', 'depend', 'process', 'owner', 'use', 'model', 'dependency'],
    },
    {
      response: FINANCE_TRANSFORMATION_RESPONSE,
      must: ['finance'],
      keywords: ['finance', 'transformation', 'transform', '2026', 'program', 'scope', 'project', 'initiative', 'asset', 'relevant', 'everything'],
    },
    {
      response: PROCUREMENT_ONBOARDING_RESPONSE,
      must: ['procurement'],
      keywords: ['procurement', 'procure', 'purchase', 'onboard', 'join', 'germany', 'department', 'know', 'familiar', 'start'],
    },
    {
      response: P2P_QUARTERLY_RESPONSE,
      keywords: ['purchase', 'pay', 'p2p', 'quarterly', 'review', 'quarter', 'health', 'asset', 'need', 'highlight', 'change', 'dashboard', 'initiative'],
    },
    {
      response: OTC_DOWNSTREAM_RESPONSE,
      keywords: ['order', 'cash', 'o2c', 'downstream', 'effect', 'impact', 'depend', 'change', 'propagat', 'affect'],
    },
    {
      response: S2P_INITIATIVES_RESPONSE,
      keywords: ['source', 'pay', 's2p', 'initiative', 'overlap', 'same', 'target', 'sub-process', 'subprocess', 'active', 'which'],
    },
    {
      response: COMING_SOON_RESPONSE,
      keywords: ['active', 'analys', 'plan', 'rollout', 'replacement', 'migrate', 'migration', 'kpi', 'risk', 'gap', 'schedule'],
    },
    {
      response: LENA_T1_RESPONSE,
      must: ['attention'],
      keywords: ['attention', 'area', 'right', 'now', 'procurement', 'emea', 'needs', 'my'],
    },
    {
      response: MCP_INTRO_RESPONSE,
      must: ['mcp'],
      keywords: ['mcp', 'app', 'embed', 'display', 'mode', 'pattern', 'show', 'render'],
    },
    {
      response: MCP_WIDGET_RESPONSE,
      must: ['widget'],
      keywords: ['widget', 'card', 'inline', 'compact', 'kpi', 'chart'],
    },
    {
      response: MCP_APPLET_RESPONSE,
      must: ['applet'],
      keywords: ['applet', 'embed', 'app', 'self-contained', 'mini'],
    },
    {
      response: MCP_PANEL_RESPONSE,
      must: ['panel'],
      keywords: ['panel', 'side', 'resizable', 'alongside'],
    },
    {
      response: MCP_CANVAS_RESPONSE,
      must: ['canvas'],
      keywords: ['canvas', 'immersive', 'full', 'width', 'two-thirds'],
    },
  ];

  const queryTokens = tokenize(text);
  let bestResponse: FakeResponse | undefined;
  let bestScore = 0;

  for (const candidate of CANDIDATES) {
    if (candidate.must) {
      const mustTokens = tokenize(candidate.must.join(' '));
      const satisfied = [...mustTokens].every(m => [...queryTokens].some(q => q.includes(m) || m.includes(q)));
      if (!satisfied) continue;
    }
    let score = 0;
    const keyTokens = tokenize(candidate.keywords.join(' '));
    for (const qt of queryTokens) {
      for (const kt of keyTokens) {
        if (qt === kt) score += 2;
        else if (qt.includes(kt) || kt.includes(qt)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = candidate.response;
    }
  }

  return bestScore >= 2 ? bestResponse : undefined;
}

// Add per-conversation responses here when needed.
const CONVERSATION_RESPONSES: Record<string, FakeResponse[]> = {};

const FALLBACK_RESPONSE: FakeResponse = {
  type: 'text',
  content: 'No response configured for this conversation yet.',
  followUpPrompts: ['Follow up prompt', 'Follow up prompt', 'Follow up prompt', 'Follow up prompt'],
};

// Per-conversation response index counters
const conversationResponseIndex: Record<string, number> = {};

const STORAGE_KEY = 'pca_conversations';

function serializeConversations(convs: Conversation[]): string {
  return JSON.stringify(convs);
}

function deserializeConversations(raw: string): Conversation[] {
  const parsed = JSON.parse(raw) as Array<{
    id: string;
    title: string;
    messages: Array<{
      id: string;
      role: MessageRole;
      content: string;
      type: ChatMessage['type'];
      tableData?: TableData;
      timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
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
