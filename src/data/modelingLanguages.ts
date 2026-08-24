export type Item = { id: string; label: string; enabled: boolean }
export type Group = { id: string; label: string; expanded: boolean; items: Item[] }
export type Language = { id: string; label: string; variant: 'Default' | 'Custom'; active: boolean; lastModified: string; groups: Group[] }
export type LangGroup = { id: string; label: string; expanded: boolean; languages: Language[] }

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

// Values starting with '<' are raw SVG content for icons unavailable in any registered collection
export const ITEM_ICONS: Record<string, string> = {
  // Activities
  'task': 'SAP-icons-v4/task-activity',
  'collapsed-subprocess': 'SAP-icons-v4/collapsed-subprocess',
  'expanded-subprocess': 'SAP-icons-v4/expanded-subprocess',
  'collapsed-event-subprocess': 'SAP-icons-v4/collapsed-event-subprocess',
  'event-subprocess': 'SAP-icons-v4/event-subprocess',
  // Gateways
  'exclusive-xor-gateway': 'SAP-icons-v4/exclusive-xor-gateway',
  'event-based-gateway': 'SAP-icons-v4/event-based-gateway',
  'parallel-gateway': 'SAP-icons-v4/parallel-gateway',
  'inclusive-gateway': 'SAP-icons-v4/inclusive-gateway',
  'complex-gateway': 'SAP-icons-v4/complex-gateway',
  // Swimlanes
  'pool-lane': 'SAP-icons-v4/pool-lane',
  'collapsed-pool': 'SAP-icons-v4/collapsed-pool',
  'lane': 'SAP-icons-v4/pool-lane',
  'additional-participant': 'person-placeholder',
  // Artifacts
  'group': 'SAP-icons-v4/bpmn-group',
  'text-annotation': 'SAP-icons-v4/text-annotation',
  'it-system': 'SAP-icons-v4/computer',
  // Data Objects
  'data-object': 'document',
  'data-store': 'SAP-icons-v4/source-data',
  'message': 'email',
  // Start Events
  'start-event': 'SAP-icons-v4/start-event',
  'start-message-event': 'SAP-icons-v4/start-message-event',
  'start-timer-event': 'SAP-icons-v4/start-timer-event',
  'start-escalation-event': 'SAP-icons-v4/start-escalation-event',
  'start-conditional-event': 'SAP-icons-v4/start-conditional-event',
  'start-error-event': 'SAP-icons-v4/start-error-event',
  'start-compensation-event': 'SAP-icons-v4/start-compensation-event',
  'start-signal-event': 'SAP-icons-v4/start-signal-event',
  'start-multiple-event': 'SAP-icons-v4/start-multiple-event',
  'start-parallel-multiple-event': 'SAP-icons-v4/start-parallel-multiple-event',
  // Catching Intermediate Events
  'intermediate-message-catching': 'SAP-icons-v4/catching-intermediate-message-event',
  'intermediate-timer': 'SAP-icons-v4/catching-intermediate-timer-event',
  'intermediate-escalation-catching': 'SAP-icons-v4/catching-intermediate-escalation-event',
  'intermediate-conditional': 'SAP-icons-v4/catching-intermediate-conditional-event',
  'intermediate-link-catching': 'SAP-icons-v4/catching-intermediate-link-event',
  'intermediate-error': 'SAP-icons-v4/catching-intermediate-error-event',
  'intermediate-cancel': 'SAP-icons-v4/catching-intermediate-cancel-event',
  'intermediate-compensation-catching': 'SAP-icons-v4/catching-intermediate-compensation-event',
  'intermediate-signal-catching': 'SAP-icons-v4/catching-intermediate-signal-event',
  'intermediate-multiple-catching': 'SAP-icons-v4/catching-intermediate-multiple-event',
  'intermediate-parallel-multiple': 'SAP-icons-v4/catching-intermediate-parallel-multiple-event',
  // Throwing Intermediate Events
  'intermediate-event-throwing': 'SAP-icons-v4/intermediate-event',
  'intermediate-message-throwing': 'SAP-icons-v4/throwing-intermediate-message-event',
  'intermediate-escalation-throwing': 'SAP-icons-v4/throwing-intermediate-escalation-event',
  'intermediate-link-throwing': 'SAP-icons-v4/intermediate-link-event',
  'intermediate-compensation-throwing': 'SAP-icons-v4/throwing-intermediate-compensation-event',
  'intermediate-signal-throwing': 'SAP-icons-v4/throwing-intermediate-signal-event',
  'intermediate-multiple-throwing': 'SAP-icons-v4/throwing-intermediate-multiple-event',
  // End Events
  'end-event': 'SAP-icons-v4/end-event',
  'end-message-event': 'SAP-icons-v4/end-message-event',
  'end-escalation-event': 'SAP-icons-v4/end-escalation-event',
  'end-error-event': 'SAP-icons-v4/end-error-event',
  'cancel-end-event': 'SAP-icons-v4/cancel-error-event',
  'end-compensation-event': 'SAP-icons-v4/end-compensation-event',
  'end-signal-event': 'SAP-icons-v4/end-signal-event',
  'end-multiple-event': 'SAP-icons-v4/end-multiple-event',
  'terminate-end-event': 'SAP-icons-v4/terminate-end-event',
  // Connecting Objects
  'sequence-flow': 'SAP-icons-v4/sequence-flow',
  'association-undirected': 'SAP-icons-v4/association-undirected',
  'association-unidirectional': 'SAP-icons-v4/association-unidirectional',
  'association-bidirectional': 'SAP-icons-v4/association-bidirectional',
  'message-flow': 'SAP-icons-v4/message-flow',
  // Live Insights
  'indicator': 'SAP-icons-v4/data-indicator',
  'traffic-light': 'SAP-icons-v4/traffic-light',
  'cockpit': 'SAP-icons-v4/gauge-cockpit',
  'value': 'record',
  'sentiment': 'SAP-icons-v4/emotion-positive',
  'trend': 'SAP-icons-v4/data-trend',
  'progress-bar': 'SAP-icons-v4/progress-bar',
  'ring-chart': 'SAP-icons-v4/ring-chart',
}

export const BASE_GROUPS: Group[] = [
  {
    id: 'activities', label: 'Activities', expanded: true, items: [
      { id: 'task', label: 'Task', enabled: true },
      { id: 'collapsed-subprocess', label: 'Collapsed Subprocess', enabled: true },
      { id: 'expanded-subprocess', label: 'Expanded Subprocess', enabled: false },
      { id: 'collapsed-event-subprocess', label: 'Collapsed Event-Subprocess', enabled: true },
      { id: 'event-subprocess', label: 'Event Subprocess', enabled: false },
    ],
  },
  {
    id: 'gateways', label: 'Gateways', expanded: true, items: [
      { id: 'exclusive-xor-gateway', label: 'Exclusive Gateway (XOR)', enabled: true },
      { id: 'event-based-gateway', label: 'Event-based Gateway', enabled: true },
      { id: 'parallel-gateway', label: 'Parallel Gateway', enabled: true },
      { id: 'inclusive-gateway', label: 'Inclusive Gateway', enabled: true },
      { id: 'complex-gateway', label: 'Complex Gateway', enabled: true },
    ],
  },
  {
    id: 'swimlanes', label: 'Swimlanes', expanded: true, items: [
      { id: 'pool-lane', label: 'Pool/Lane', enabled: true },
      { id: 'collapsed-pool', label: 'Collapsed Pool', enabled: true },
      { id: 'lane', label: 'Lane', enabled: true },
      { id: 'additional-participant', label: 'Additional Participant', enabled: false },
    ],
  },
  {
    id: 'artifacts', label: 'Artifacts', expanded: true, items: [
      { id: 'group', label: 'Group', enabled: true },
      { id: 'text-annotation', label: 'Text Annotation', enabled: true },
      { id: 'it-system', label: 'IT System', enabled: true },
    ],
  },
  {
    id: 'data-objects', label: 'Data Objects', expanded: true, items: [
      { id: 'data-object', label: 'Data Object', enabled: true },
      { id: 'data-store', label: 'Data Store', enabled: true },
      { id: 'message', label: 'Message', enabled: true },
    ],
  },
  {
    id: 'start-events', label: 'Start Events', expanded: true, items: [
      { id: 'start-event', label: 'Start Event', enabled: true },
      { id: 'start-message-event', label: 'Start Message Event', enabled: false },
      { id: 'start-timer-event', label: 'Start Timer Event', enabled: false },
      { id: 'start-escalation-event', label: 'Start Escalation Event', enabled: false },
      { id: 'start-conditional-event', label: 'Start Conditional Event', enabled: true },
      { id: 'start-error-event', label: 'Start Error Event', enabled: true },
      { id: 'start-compensation-event', label: 'Start Compensation Event', enabled: false },
      { id: 'start-signal-event', label: 'Start Signal Event', enabled: false },
      { id: 'start-multiple-event', label: 'Start Multiple Event', enabled: false },
      { id: 'start-parallel-multiple-event', label: 'Start Parallel Multiple Event', enabled: false },
    ],
  },
  {
    id: 'catching-intermediate-events', label: 'Catching Intermediate Events', expanded: true, items: [
      { id: 'intermediate-message-catching', label: 'Intermediate Message Event', enabled: true },
      { id: 'intermediate-timer', label: 'Intermediate Timer Event', enabled: true },
      { id: 'intermediate-escalation-catching', label: 'Intermediate Escalation Event', enabled: false },
      { id: 'intermediate-conditional', label: 'Intermediate Conditional Event', enabled: false },
      { id: 'intermediate-link-catching', label: 'Intermediate Link Event', enabled: false },
      { id: 'intermediate-error', label: 'Intermediate Error Event', enabled: true },
      { id: 'intermediate-cancel', label: 'Intermediate Cancel Event', enabled: false },
      { id: 'intermediate-compensation-catching', label: 'Intermediate Compensation Event', enabled: false },
      { id: 'intermediate-signal-catching', label: 'Intermediate Signal Event', enabled: false },
      { id: 'intermediate-multiple-catching', label: 'Intermediate Multiple Event', enabled: false },
      { id: 'intermediate-parallel-multiple', label: 'Intermediate Parallel Multiple Event', enabled: false },
    ],
  },
  {
    id: 'throwing-intermediate-events', label: 'Throwing Intermediate Events', expanded: true, items: [
      { id: 'intermediate-event-throwing', label: 'Intermediate Event', enabled: true },
      { id: 'intermediate-message-throwing', label: 'Intermediate Message Event', enabled: false },
      { id: 'intermediate-escalation-throwing', label: 'Intermediate Escalation Event', enabled: false },
      { id: 'intermediate-link-throwing', label: 'Intermediate Link Event', enabled: false },
      { id: 'intermediate-compensation-throwing', label: 'Intermediate Compensation Event', enabled: false },
      { id: 'intermediate-signal-throwing', label: 'Intermediate Signal Event', enabled: false },
      { id: 'intermediate-multiple-throwing', label: 'Intermediate Multiple Event', enabled: false },
    ],
  },
  {
    id: 'end-events', label: 'End Events', expanded: true, items: [
      { id: 'end-event', label: 'End Event', enabled: true },
      { id: 'end-message-event', label: 'End Message Event', enabled: false },
      { id: 'end-escalation-event', label: 'End Escalation Event', enabled: false },
      { id: 'end-error-event', label: 'End Error Event', enabled: true },
      { id: 'cancel-end-event', label: 'Cancel End Event', enabled: false },
      { id: 'end-compensation-event', label: 'End Compensation Event', enabled: false },
      { id: 'end-signal-event', label: 'End Signal Event', enabled: false },
      { id: 'end-multiple-event', label: 'End Multiple Event', enabled: false },
      { id: 'terminate-end-event', label: 'Terminate End Event', enabled: true },
    ],
  },
  {
    id: 'connecting-objects', label: 'Connecting Objects', expanded: true, items: [
      { id: 'sequence-flow', label: 'Sequence Flow', enabled: true },
      { id: 'association-undirected', label: 'Association (undirected)', enabled: true },
      { id: 'association-unidirectional', label: 'Association (unidirectional)', enabled: true },
      { id: 'association-bidirectional', label: 'Association (bidirectional)', enabled: false },
      { id: 'message-flow', label: 'Message Flow', enabled: true },
    ],
  },
  {
    id: 'live-insights', label: 'Live Insights', expanded: true, items: [
      { id: 'indicator', label: 'Indicator', enabled: true },
      { id: 'traffic-light', label: 'Traffic Light', enabled: true },
      { id: 'cockpit', label: 'Cockpit', enabled: true },
      { id: 'value', label: 'Value', enabled: true },
      { id: 'trend', label: 'Trend', enabled: true },
      { id: 'progress-bar', label: 'Progress Bar', enabled: true },
      { id: 'ring-chart', label: 'Ring Chart', enabled: true },
      { id: 'sentiment', label: 'Sentiment', enabled: true },
    ],
  },
]

export const INITIAL_LANG_GROUPS: LangGroup[] = [
  {
    id: 'bpmn', label: 'Business Process Diagram (BPMN 2.0)', expanded: true,
    languages: [
      { id: 'bpmn-basic', label: 'BPMN 2.0+Basic Shapes', variant: 'Default', active: true, lastModified: '21 Nov 2025', groups: clone(BASE_GROUPS.filter(g => g.id !== 'live-insights')) },
      { id: 'bpmn-live', label: 'BPMN 2.0+Live Insights', variant: 'Default', active: true, lastModified: '15 Oct 2025', groups: clone(BASE_GROUPS) },
      { id: 'custom-bpmn', label: 'Custom BPMN', variant: 'Custom', active: true, lastModified: '3 Nov 2025', groups: clone(BASE_GROUPS) },
      { id: 'testing-subset', label: 'Testing Subset', variant: 'Custom', active: false, lastModified: '10 Sep 2025', groups: clone(BASE_GROUPS) },
    ],
  },
  {
    id: 'bpmn12', label: 'BPMN 1.2', expanded: false,
    languages: [
      { id: 'bpmn12-default', label: 'BPMN 1.2', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: clone(BASE_GROUPS.filter(g => g.id !== 'live-insights')) },
    ],
  },
  {
    id: 'dmn', label: 'Business Decision Diagram (DMN 1.2)', expanded: false,
    languages: [
      { id: 'dmn-default', label: 'DMN 1.2', variant: 'Default', active: true, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'choreography', label: 'Choreography Diagram (BPMN 2.0)', expanded: false,
    languages: [
      { id: 'choreography-default', label: 'Choreography Diagram', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'conversation', label: 'Conversation Diagram (BPMN 2.0)', expanded: false,
    languages: [
      { id: 'conversation-default', label: 'Conversation Diagram', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'archimate', label: 'Enterprise Architecture Diagram (ArchiMate 3.0)', expanded: false,
    languages: [
      { id: 'archimate-default', label: 'ArchiMate 3.0', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'epc', label: 'Event-driven process chain (EPC)', expanded: false,
    languages: [
      { id: 'epc-default', label: 'EPC', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'org-chart', label: 'Organization Chart', expanded: false,
    languages: [
      { id: 'org-chart-default', label: 'Organization Chart', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'uml-class', label: 'UML Class Diagram', expanded: false,
    languages: [
      { id: 'uml-class-default', label: 'UML Class Diagram', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'uml-use-case', label: 'UML Use Case Diagram', expanded: false,
    languages: [
      { id: 'uml-use-case-default', label: 'UML Use Case Diagram', variant: 'Default', active: false, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
  {
    id: 'value-chain', label: 'Value Chain', expanded: false,
    languages: [
      { id: 'value-chain-default', label: 'Value Chain', variant: 'Default', active: true, lastModified: '21 Nov 2025', groups: [] },
    ],
  },
]
