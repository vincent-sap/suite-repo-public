import React, { useState, useId, useRef, useCallback } from 'react'
import {
  Button, CheckBox, Input, TextArea,
  Text, Title, Label, Icon, Menu, MenuItem, MenuItemGroup, Popover, MessageStrip,
  Dialog, Bar, ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode,
  VariantManagement, VariantItem, ListItemGroup,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'


// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'error' | 'warning' | 'info' | null

type RuleItem = {
  id: string
  label: string
  description?: string
  paramType?: 'text' | 'number' | 'select' | 'multiselect' | 'attributemapping'
  paramOptions?: string[]
  paramPlaceholder?: string
}

type RuleSubsection = {
  id: string
  num: string
  label: string
  description?: string
  items: RuleItem[]
  canAddCustom?: boolean
}

type RuleSection = {
  id: string
  num: number
  label: string
  subsections: RuleSubsection[]
  canAddCustom?: boolean
}

type RuleState = {
  enabled: boolean
  severity: Severity
  paramValue?: string
  paramValues?: string[]
}

type Convention = {
  id: string
  name: string
  isBuiltin: boolean
  modelType: 'BPMN 2.0' | 'DMN'
  enabled: boolean
  checkInEditorPerButton: boolean
  checkInEditorSaveDialog: boolean
  lastModified: string
  ruleStates: Record<string, RuleState>
  customItems?: Record<string, RuleItem[]>  // subId → extra items
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITIES: { value: NonNullable<Severity>; label: string; desc: string; color: string; valueState: string; icon: string; iconColor: 'indication2' | 'indication3' | 'indication5' }[] = [
  { value: 'error',   label: 'Error',   desc: 'Violation is flagged as an error in the model.',  color: 'var(--sapErrorColor)',       valueState: 'Negative',    icon: 'error',               iconColor: 'indication2' },
  { value: 'warning', label: 'Warning', desc: 'The model deviates from best practices.',          color: 'var(--sapWarningColor)',     valueState: 'Critical',    icon: 'alert',               iconColor: 'indication3' },
  { value: 'info',    label: 'Hint',    desc: 'A suggestion to improve the model quality.',       color: 'var(--sapInformationColor)', valueState: 'Information', icon: 'message-information', iconColor: 'indication5' },
]
const SEVERITY_MAP = Object.fromEntries(SEVERITIES.map(s => [s.value, s])) as Record<NonNullable<Severity>, typeof SEVERITIES[0]>

// ─── Rule data ────────────────────────────────────────────────────────────────

const CUSTOM_ATTRS = [
  '(K)PI', '(K)PI reason for none', 'Ablaufdatum', 'Analysis', 'Ansprechpartner',
  'Applicable Link/URL', 'Applicable documents', 'Applicable processes', 'Approval Report',
  'Approved at', 'Approved by', 'Area of applicability', 'Attribute A', 'Attribute B',
  'Audit trail / Documentation', 'Business owner', 'Classification', 'Contact person',
]
const MAIN_PROPS = ['Name', 'Description', 'Responsible', 'Version', 'Status']
const MORE_PROPS = ['Created by', 'Created at', 'Last modified by', 'Last modified at']

type AttrCategory = { id: string; label: string; attrs: string[] }
type AttrElementType = { id: string; label: string; icon?: string; categories: AttrCategory[] }

const ATTR_ELEMENT_TYPES: AttrElementType[] = [
  { id: 'bpmn-diagram', label: 'BPMN-Diagram', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
    { id: 'main', label: 'Main properties', attrs: MAIN_PROPS },
    { id: 'more', label: 'More properties', attrs: MORE_PROPS },
  ]},
  { id: 'task', label: 'Task', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
    { id: 'main', label: 'Main properties', attrs: MAIN_PROPS },
  ]},
  { id: 'collapsed-subprocess', label: 'Collapsed Subprocess', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'expanded-subprocess', label: 'Expanded subprocess', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'collapsed-event-subprocess', label: 'Collapsed Event-Subprocess', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'event-subprocess', label: 'Event Subprocess', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'xor-gateway', label: 'Exclusive (XOR) Gateway', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'event-gateway', label: 'Event-based Gateway', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'parallel-gateway', label: 'Parallel Gateway', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'inclusive-gateway', label: 'Inclusive Gateway', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
  { id: 'complex-gateway', label: 'Complex Gateway', categories: [
    { id: 'custom', label: 'Custom attributes', attrs: CUSTOM_ATTRS },
  ]},
]

const BPMN_RULES: RuleSection[] = [
  {
    id: 's1', num: 1, label: 'Architecture',
    subsections: [
      { id: 's1-1', num: '1.1', label: 'Incorporation of open comments', description: 'Checks if all comments have been incorporated into the diagram.', items: [{ id: 'r1-1', label: 'Incorporation of open comments' }] },
      { id: 's1-2', num: '1.2', label: 'Usage of unique diagram names', description: 'Checks if all diagram names are unique.', items: [{ id: 'r1-2', label: 'Usage of unique diagram names' }] },
      { id: 's1-3', num: '1.3', label: 'Usage of a numbering schema in diagram names', description: 'Checks if all diagram names contain a numbered prefix.', items: [{ id: 'r1-3', label: 'Usage of a numbering schema in diagram names', paramType: 'select', paramOptions: ['1 .. 4.3.5', '1.0.0 .. 4.3.5', '1 .. 9999'] }] },
      { id: 's1-4', num: '1.4', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 's2', num: 2, label: 'Notation',
    subsections: [
      {
        id: 's2-1', num: '2.1', label: 'Usage of a defined BPMN subset', description: 'Checks if the defined BPMN subset is used in the diagram.',
        items: [
          { id: 'r2-1a', label: 'BPMN (Core Elements)' }, { id: 'r2-1b', label: 'BPMN (Descriptive Elements)' },
          { id: 'r2-1c', label: 'BPMN (Analytic Elements)' }, { id: 'r2-1d', label: 'BPMN (Common Executable Elements)' },
          { id: 'r2-1e', label: 'BPMN (Complete)' }, { id: 'r2-1f', label: 'BPMN (Complete) + Basic Shapes' },
          { id: 'r2-1g', label: 'eCH-0158 Elements' }, { id: 'r2-1h', label: 'BPMN Method and Style Elements' },
          { id: 'r2-1i', label: 'BPMN 2.0 for SAP Signavio Process Governance' }, { id: 'r2-1j', label: 'BPMN (Complete) + Live Insights' },
        ],
      },
      {
        id: 's2-2', num: '2.2', label: 'Definition of mandatory attributes', description: 'Checks if all mandatory attributes are set.',
        items: [
          { id: 'r2-2a', label: 'eCH Mandatory Attributes', paramType: 'attributemapping' },
          { id: 'r2-2b', label: 'Mandatory Subprocess Link', paramType: 'attributemapping' },
          { id: 'r2-2c', label: 'eCH Recommendations', paramType: 'attributemapping' },
          { id: 'r2-2d', label: 'Activity Documentations', paramType: 'attributemapping' },
        ], canAddCustom: true,
      },
      {
        id: 's2-3', num: '2.3', label: 'Definition of required dictionary links', description: 'Checks if elements are linked to dictionary entries.',
        items: [
          { id: 'r2-3a', label: 'Roles' },
          { id: 'r2-3b', label: 'Activities' },
          { id: 'r2-3c', label: 'Events' },
          { id: 'r2-3d', label: 'Data objects' },
          { id: 'r2-3e', label: 'IT systems' },
        ],
      },
      {
        id: 's2-4', num: '2.4', label: 'Consistency with attributes of the linked dictionary item', description: 'Checks whether element attributes match linked dictionary attributes, i.e. the element has no local changes.',
        items: [
          { id: 'r2-4a', label: 'Roles' }, { id: 'r2-4b', label: 'Activities' }, { id: 'r2-4c', label: 'Events' },
          { id: 'r2-4d', label: 'Data objects' }, { id: 'r2-4e', label: 'IT systems' },
        ],
      },
      {
        id: 's2-5', num: '2.5', label: 'Definition of required diagram links', description: 'Checks if elements are linked to diagrams.',
        items: [
          { id: 'r2-5a', label: 'Collapsed event subprocesses', paramType: 'select', paramOptions: ['Required', 'Prohibited', 'Optional'] },
          { id: 'r2-5b', label: 'Catching intermediate events', paramType: 'select', paramOptions: ['Required', 'Prohibited', 'Optional'] },
          { id: 'r2-5c', label: 'Collapsed subprocesses', paramType: 'select', paramOptions: ['Required', 'Prohibited', 'Optional'] },
          { id: 'r2-5d', label: 'Throwing intermediate events', paramType: 'select', paramOptions: ['Required', 'Prohibited', 'Optional'] },
        ],
      },
      { id: 's2-6', num: '2.6', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 's3', num: 3, label: 'Naming',
    subsections: [
      { id: 's3-1', num: '3.1', label: 'Usage of consistent activity naming style', description: 'Checks if activities are named using a consistent style.', items: [{ id: 'r3-1', label: 'Usage of consistent activity naming style', paramType: 'select', paramOptions: ['Verb-object', 'Object-verb', 'Any'] }] },
      { id: 's3-2', num: '3.2', label: 'Usage of unique element names', description: 'Checks if element names are unique within a diagram.', items: [{ id: 'r3-2', label: 'Usage of unique element names' }] },
      { id: 's3-3', num: '3.3', label: 'Usage of same names for end events', description: 'Checks if all end events of the diagram have distinct names.', items: [{ id: 'r3-3', label: 'Usage of same names for end events' }] },
      { id: 's3-4', num: '3.4', label: 'Usage of same names for the process and elements', description: 'Checks that the diagram does not contain any elements with the same name as the diagram.', items: [{ id: 'r3-4', label: 'Usage of same names for the process and elements' }] },
      {
        id: 's3-5', num: '3.5', label: 'Definition of required element names', description: 'Checks if elements are named.',
        items: [{ id: 'r3-5a', label: 'Roles' }, { id: 'r3-5b', label: 'Events' }, { id: 'r3-5c', label: 'Activities' }, { id: 'r3-5d', label: 'Data objects' }, { id: 'r3-5e', label: 'Message flows' }],
      },
      {
        id: 's3-6', num: '3.6', label: 'Usage of consistent event naming style', description: 'Checks if events are named using a consistent style.',
        items: [
          { id: 'r3-6a', label: 'End events', paramType: 'multiselect', paramOptions: ['State description', 'Categorisation', 'Conjunction', 'Activity description', 'Verb object', 'empty'] },
          { id: 'r3-6b', label: 'Start events', paramType: 'multiselect', paramOptions: ['State description', 'Categorisation', 'Conjunction', 'Activity description', 'Verb object', 'empty'] },
          { id: 'r3-6c', label: 'Throwing intermediate events', paramType: 'multiselect', paramOptions: ['State description', 'Categorisation', 'Conjunction', 'Activity description', 'Verb object', 'empty'] },
          { id: 'r3-6d', label: 'Catching intermediate events', paramType: 'multiselect', paramOptions: ['State description', 'Categorisation', 'Conjunction', 'Activity description', 'Verb object', 'empty'] },
        ],
      },
      { id: 's3-7', num: '3.7', label: '"Method and Style"-conform labelings of events', description: 'Checks if all triggered start events, all intermediate events and all end events (in diagrams with several end states) are labeled.', items: [{ id: 'r3-7', label: '"Method and Style"-conform labelings of events' }] },
      { id: 's3-8', num: '3.8', label: 'Consistent naming of subprocesses', description: 'Checks if collapsed subprocesses have the same name as the embedded diagrams.', items: [{ id: 'r3-8', label: 'Consistent naming of subprocesses' }] },
      { id: 's3-9', num: '3.9', label: 'XOR gateway naming style', description: 'Checks if XOR gateways are named using a consistent style.', items: [{ id: 'r3-9', label: 'XOR gateway naming style' }] },
      { id: 's3-10', num: '3.10', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 's4', num: 4, label: 'Process Structure',
    subsections: [
      { id: 's4-1',  num: '4.1',  label: 'Usage of activities in pools', description: 'Checks if every none-blackbox pool contains at least one activity.', items: [{ id: 'r4-1', label: 'Usage of activities in pools' }] },
      { id: 's4-2',  num: '4.2',  label: 'Usage of activities before or-splits', description: 'Checks if every or-split has an activity as predecessor.', items: [{ id: 'r4-2', label: 'Usage of activities before or-splits' }] },
      { id: 's4-3',  num: '4.3',  label: 'Correct usage of boundary events', description: 'Checks if boundary events are correctly attached to an activity.', items: [{ id: 'r4-3', label: 'Correct usage of boundary events' }] },
      { id: 's4-4',  num: '4.4',  label: 'Correct usage of conditional and default flows', description: 'Checks if conditional and default flows are only used if it is semantically correct.', items: [{ id: 'r4-4', label: 'Correct usage of conditional and default flows' }] },
      { id: 's4-5',  num: '4.5',  label: 'Test of subprocess end states', description: 'Subprocesses with more than one non-Error end state must be followed by a gateway that tests the end state.', items: [{ id: 'r4-5', label: 'Test of subprocess end states' }] },
      { id: 's4-6',  num: '4.6',  label: 'Consistency between superprocesses and subprocesses', description: 'Checks if errors, escalations and messages are consistent between super- and subprocesses.', items: [{ id: 'r4-6a', label: 'Boundary events' }, { id: 'r4-6b', label: 'Pools' }, { id: 'r4-6c', label: 'Message flows' }] },
      { id: 's4-7',  num: '4.7',  label: 'Consistent usage of signals', description: 'Checks if throwing and catching signal events are used consistently.', items: [{ id: 'r4-7', label: 'Consistent usage of signals' }] },
      { id: 's4-8',  num: '4.8',  label: 'Consistent usage of start and end events', description: 'Checks if start and end events are used in consistent combinations.', items: [{ id: 'r4-8', label: 'Consistent usage of start and end events' }] },
      { id: 's4-9',  num: '4.9',  label: 'Usage of correct syntax', description: 'Checks if all diagrams are modeled using correct syntax.', items: [{ id: 'r4-9', label: 'Usage of correct syntax' }] },
      { id: 's4-10', num: '4.10', label: 'SAP Signavio Process Governance conventions', description: 'Checks if the diagram follows the conventions required for interchange with SAP Signavio Process Governance.', items: [{ id: 'r4-10a', label: 'Usage of supported task types' }] },
      { id: 's4-11', num: '4.11', label: 'Usage of a restricted number of expanded pools', description: 'Checks if diagrams are modeled not using more than a maximum number of expanded pools.', items: [{ id: 'r4-11', label: 'Usage of a restricted number of expanded pools', paramType: 'number', paramPlaceholder: 'Max' }] },
      { id: 's4-12', num: '4.12', label: 'Consistent usage of pools', description: 'Checks if all events, activities and gateways reside within a pool.', items: [{ id: 'r4-12', label: 'Consistent usage of pools' }] },
      { id: 's4-13', num: '4.13', label: 'Correct usage of OR gateways', description: 'Checks that an OR gateway does not merge exclusive alternative paths.', items: [{ id: 'r4-13', label: 'Correct usage of OR gateways' }] },
      { id: 's4-14', num: '4.14', label: 'Absence of loops', description: 'Checks if all paths of the diagram are free from loops.', items: [{ id: 'r4-14', label: 'Absence of loops' }] },
      { id: 's4-15', num: '4.15', label: 'Usage of a restricted number of activities', description: 'Checks if diagrams are modeled using a maximum number of activities.', items: [{ id: 'r4-15', label: 'Usage of a restricted number of activities', paramType: 'number', paramPlaceholder: 'Max' }] },
      { id: 's4-16', num: '4.16', label: 'Usage of a restricted number of consecutive or-splits', description: 'Checks if all chains of consecutive or-splits are compressed into sufficiently small fragments.', items: [{ id: 'r4-16', label: 'Usage of a restricted number of consecutive or-splits', paramType: 'number', paramPlaceholder: 'Max' }] },
      { id: 's4-17', num: '4.17', label: 'Usage of meaningful gateways', description: 'Checks if all gateways have splitting or merging behavior.', items: [{ id: 'r4-17', label: 'Usage of meaningful gateways' }] },
      { id: 's4-18', num: '4.18', label: 'Usage of multiple edges between nodes', description: 'Checks if there are edges that have the same source and target node.', items: [{ id: 'r4-18', label: 'Usage of multiple edges between nodes' }] },
      { id: 's4-19', num: '4.19', label: 'Absence of deadlocks', description: 'Checks if the diagram is free of deadlocks.', items: [{ id: 'r4-19', label: 'Absence of deadlocks' }] },
      { id: 's4-20', num: '4.20', label: 'Usage of start message events in subprocesses', description: 'Checks if there is a start message event in a subprocess.', items: [{ id: 'r4-20', label: 'Usage of start message events in subprocesses' }] },
      { id: 's4-21', num: '4.21', label: 'Absence of multi merges', description: 'Checks if the diagram is free of multi merges.', items: [{ id: 'r4-21', label: 'Absence of multi merges' }] },
      { id: 's4-22', num: '4.22', label: 'Absence of subprocess relation cycles', description: 'Checks if all collapsed subprocesses only link diagrams contained in lower process levels.', items: [{ id: 'r4-22', label: 'Absence of subprocess relation cycles' }] },
      { id: 's4-23', num: '4.23', label: 'Absence of pools, lanes and participants in subprocesses', description: 'Checks if only as call activity referenced subprocesses contain pools, lanes and participants.', items: [{ id: 'r4-23', label: 'Absence of pools, lanes and participants in subprocesses' }] },
      { id: 's4-24', num: '4.24', label: 'Usage of message flows only on correct nodes', description: 'Checks if all message flows are annotated to sender and receiver elements.', items: [{ id: 'r4-24', label: 'Usage of message flows only on correct nodes' }] },
      { id: 's4-25', num: '4.25', label: 'Absence of multiple incoming sequence flows', description: 'Checks if all elements have only one incoming sequence flow.', items: [{ id: 'r4-25a', label: 'End events' }, { id: 'r4-25b', label: 'Activities' }, { id: 'r4-25c', label: 'Intermediate events' }] },
      { id: 's4-26', num: '4.26', label: 'Absence of multiple outgoing sequence flows', description: 'Checks if all elements have only one outgoing sequence flow.', items: [{ id: 'r4-26a', label: 'Activities' }, { id: 'r4-26b', label: 'Start events' }, { id: 'r4-26c', label: 'Intermediate events' }] },
      { id: 's4-27', num: '4.27', label: 'Absence of split and join behavior on one element', description: 'Checks if all gateways are either splitting or merging.', items: [{ id: 'r4-27', label: 'Absence of split and join behavior on one element' }] },
      { id: 's4-28', num: '4.28', label: 'Usage of only one start event', description: 'Checks if only one start event is used in a process or a subprocess.', items: [{ id: 'r4-28a', label: 'within subprocesses' }, { id: 'r4-28b', label: 'within processes' }] },
      { id: 's4-29', num: '4.29', label: 'Usage of attached boundary events', description: 'Checks if interrupting, non-interrupting or no attached boundary events at all are used in the diagram.', items: [{ id: 'r4-29', label: 'Usage of attached boundary events', paramType: 'select', paramOptions: ['Always', 'When available'] }] },
      { id: 's4-30', num: '4.30', label: 'Message exchange between pools', description: 'Checks if each pool exchanges messages with other pools modeled in same diagram.', items: [{ id: 'r4-30', label: 'Message exchange between pools' }] },
      { id: 's4-31', num: '4.31', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 's5', num: 5, label: 'Layout',
    subsections: [
      { id: 's5-1',  num: '5.1',  label: 'Usage of a restricted diagram size', description: 'Checks if the diagram size does not exceed the defined page format.', items: [{ id: 'r5-1', label: 'Usage of a restricted diagram size', paramType: 'select', paramOptions: ['DIN A3', 'DIN A4', 'Letter', 'A0'] }] },
      { id: 's5-2',  num: '5.2',  label: 'Usage of specified colors', description: 'Checks if the default colors have not been changed in the diagram.', items: [{ id: 'r5-2', label: 'Usage of specified colors' }] },
      { id: 's5-3',  num: '5.3',  label: 'Usage of the defined edge direction', description: 'Checks if the direction of edges matches with the configured modeling orientation.', items: [{ id: 'r5-3a', label: 'Sequence flows' }, { id: 'r5-3b', label: 'Message flows' }, { id: 'r5-3c', label: 'Associations' }] },
      {
        id: 's5-4', num: '5.4', label: 'Consistent edge folding', description: 'Checks if the layout of edges is either straight or right-angled.',
        items: [
          { id: 'r5-4a', label: 'Sequence flows', paramType: 'select', paramOptions: ['Perpendicular', 'Horizontal/Vertical', 'Straight'] },
          { id: 'r5-4b', label: 'Message flows', paramType: 'select', paramOptions: ['Horizontal/Vertical', 'Perpendicular', 'Straight'] },
          { id: 'r5-4c', label: 'Associations', paramType: 'select', paramOptions: ['Straight', 'Perpendicular', 'Horizontal/Vertical'] },
        ],
      },
      { id: 's5-5',  num: '5.5',  label: 'Absence of edge overlays', description: 'Checks if all edges run next to each other instead of overlaying each other.', items: [{ id: 'r5-5', label: 'Absence of edge overlays' }] },
      { id: 's5-6',  num: '5.6',  label: 'Usage of sufficient distances between elements', description: 'Checks if a minimum distance between two elements is used in the diagrams.', items: [{ id: 'r5-6', label: 'Usage of sufficient distances between elements' }] },
      { id: 's5-7',  num: '5.7',  label: 'Placing messages between pools', description: 'Checks if all message objects are located between two pools.', items: [{ id: 'r5-7', label: 'Placing messages between pools' }] },
      { id: 's5-8',  num: '5.8',  label: 'Definition of the correct modeling direction', description: 'Checks if the modeling direction is set as defined.', items: [{ id: 'r5-8', label: 'Definition of the correct modeling direction', paramType: 'select', paramOptions: ['Horizontal', 'Vertical'] }] },
      { id: 's5-9',  num: '5.9',  label: 'Absence of node intersections', description: 'Checks if all nodes lie next to other elements instead of overlapping each other.', items: [{ id: 'r5-9', label: 'Absence of node intersections' }] },
      {
        id: 's5-10', num: '5.10', label: 'Consistent incoming and outgoing behavior of edges', description: 'Checks if the modeled edges behave as defined by the modeling direction on diagram level.',
        items: [
          { id: 'r5-10a', label: 'Sequence flows', paramType: 'select', paramOptions: ['Perpendiculars allowed', 'Strictly perpendicular'] },
          { id: 'r5-10b', label: 'Message flows', paramType: 'select', paramOptions: ['Perpendiculars allowed', 'Strictly perpendicular'] },
        ],
      },
      { id: 's5-11', num: '5.11', label: 'Usage of specified element sizes', description: 'Checks if the default element sizes have not been changed in the diagram.', items: [{ id: 'r5-11', label: 'Usage of specified element sizes' }] },
      { id: 's5-12', num: '5.12', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 's6', num: 6, label: 'Consistency',
    subsections: [
      { id: 's6-1', num: '6.1', label: 'Usage of decision logic for decisions', description: 'Checks if all existing decisions have a decision logic defined.', items: [{ id: 'r6-1', label: 'Usage of decision logic for decisions' }] },
      { id: 's6-2', num: '6.2', label: 'Correct usage of gateways behind decisions', description: 'Checks if outputs of decisions match the gateways behind them.', items: [{ id: 'r6-2', label: 'Correct usage of gateways behind decisions' }] },
    ],
    canAddCustom: true,
  },
]

const MODEL_TYPES = ['BPMN 2.0', 'DMN'] as const
type ModelType = typeof MODEL_TYPES[number]

// ─── DMN Rules ────────────────────────────────────────────────────────────────

const DMN_RULES: RuleSection[] = [
  {
    id: 'dmn-s1', num: 1, label: 'Decision Modeling',
    subsections: [
      { id: 'dmn-s1-1', num: '1.1', label: 'Decision naming conventions', items: [{ id: 'dmn-r1-1', label: 'Decision naming conventions' }] },
      { id: 'dmn-s1-2', num: '1.2', label: 'Usage of unique decision names', items: [{ id: 'dmn-r1-2', label: 'Usage of unique decision names' }] },
      { id: 'dmn-s1-3', num: '1.3', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
  {
    id: 'dmn-s2', num: 2, label: 'Table Structure',
    subsections: [
      { id: 'dmn-s2-1', num: '2.1', label: 'Hit policy specification', items: [{ id: 'dmn-r2-1', label: 'Hit policy specification' }] },
      { id: 'dmn-s2-2', num: '2.2', label: 'Input/output column naming', items: [{ id: 'dmn-r2-2', label: 'Input/output column naming' }] },
      { id: 'dmn-s2-3', num: '2.3', label: 'Custom Rules', items: [], canAddCustom: true },
    ],
  },
]

// ─── Initial states ───────────────────────────────────────────────────────────

function s(severity: NonNullable<Severity>, paramValue?: string): RuleState {
  return { enabled: true, severity, paramValue }
}

const SAP_BP: Record<string, RuleState> = {
  'r1-1': s('warning'), 'r1-2': s('warning'), 'r1-3': s('warning', '1 .. 4.3.5'),
  'r2-1a': s('warning'), 'r2-1b': s('warning'), 'r2-1c': s('warning'), 'r2-1d': s('warning'),
  'r2-1e': s('warning'), 'r2-1f': s('warning'), 'r2-2d': s('info'),
  'r2-3a': s('warning', 'Required'), 'r2-3d': s('warning', 'Required'),
  'r2-4a': s('warning'), 'r2-4b': s('warning'), 'r2-4c': s('warning'), 'r2-4d': s('warning'), 'r2-4e': s('info'),
  'r2-5a': s('error', 'Required'), 'r2-5b': s('warning', 'Required'), 'r2-5c': s('error', 'Required'), 'r2-5d': s('warning', 'Required'),
  'r3-2': s('warning', 'Roles'), 'r3-5a': s('error'), 'r3-5b': s('warning'), 'r3-5c': s('error'), 'r3-5d': s('error'),
  'r3-8': s('warning'), 'r3-9': s('warning', 'Question with ...'),
  'r4-2': s('warning'), 'r4-3': s('error'), 'r4-4': s('warning'), 'r4-6b': s('warning'),
  'r4-8': s('warning', 'mandatory usage'), 'r4-9': s('error'), 'r4-11': s('warning', '2'), 'r4-12': s('warning'),
  'r4-17': s('warning'), 'r4-18': s('error'), 'r4-21': s('error'), 'r4-24': s('warning'),
  'r4-27': s('warning'), 'r4-28a': s('warning'), 'r4-28b': s('warning'), 'r4-30': s('warning'),
  'r5-1': s('warning', 'DIN A3'), 'r5-2': s('warning'),
  'r5-3a': s('warning'), 'r5-3b': s('warning'), 'r5-3c': s('warning'),
  'r5-4a': s('warning', 'Perpendicular'), 'r5-4b': s('warning', 'Horizontal/Vertical'), 'r5-4c': s('warning', 'Straight'),
  'r5-5': s('warning'), 'r5-6': s('warning', '75%'), 'r5-7': s('warning'),
  'r5-8': s('warning', 'Horizontal'), 'r5-9': s('warning'),
  'r5-10a': s('warning', 'Perpendiculars allowed'), 'r5-10b': s('warning', 'Perpendiculars allowed'), 'r5-11': s('warning'),
}

const ECH: Record<string, RuleState> = {
  'r1-2': s('warning'), 'r1-3': s('warning', '1 .. 4.3.5'), 'r2-1g': s('error'),
  'r2-2a': s('error'), 'r2-2b': s('warning'), 'r2-2c': s('warning'),
  'r3-2': s('warning', 'Roles'), 'r3-9': s('warning', 'Question with ...'),
  'r4-2': s('warning'), 'r4-8': s('error', 'mandatory usage'), 'r4-11': s('warning', '1'), 'r4-12': s('warning'),
  'r4-15': s('warning', '15'), 'r4-16': s('warning', '2'),
  'r5-1': s('warning', 'DIN A3'), 'r5-2': s('warning'), 'r5-4a': s('warning', 'Perpendicular'), 'r5-5': s('warning'),
  'r5-8': s('warning', 'Horizontal'), 'r5-9': s('warning'),
  'r5-10a': s('warning', 'Strictly perpendicular'), 'r5-10b': s('warning', 'Strictly perpendicular'), 'r5-11': s('warning'),
}

const TEST_INIT: Record<string, RuleState> = {
  'r2-1i': s('error'), 'r4-9': s('error'), 'r4-10a': s('error'),
  'r4-19': s('error'), 'r4-21': s('error'), 'r4-23': s('error'), 'r4-27': s('error'),
}

const INITIAL_CONVENTIONS: Convention[] = [
  { id: 'sap-bp',      name: 'SAP Signavio Best Practices',   isBuiltin: true,  modelType: 'BPMN 2.0', enabled: true,  checkInEditorPerButton: true,  checkInEditorSaveDialog: true,  lastModified: '12 Mar 2025', ruleStates: SAP_BP },
  { id: 'ech-0158',    name: 'eCH-0158 1.1 BPMN conventions', isBuiltin: true,  modelType: 'BPMN 2.0', enabled: true,  checkInEditorPerButton: false, checkInEditorSaveDialog: false, lastModified: '5 Jan 2025',  ruleStates: ECH },
  { id: 'test',        name: 'Test',                          isBuiltin: false, modelType: 'BPMN 2.0', enabled: true,  checkInEditorPerButton: true,  checkInEditorSaveDialog: false, lastModified: '3 Nov 2025',  ruleStates: TEST_INIT },
  { id: 'dmn-default', name: 'DMN Default',                   isBuiltin: true,  modelType: 'DMN',      enabled: true,  checkInEditorPerButton: false, checkInEditorSaveDialog: false, lastModified: '1 Feb 2025',  ruleStates: {} },
]

const BORDER = '1px solid var(--sapList_BorderColor)'
const BG = 'var(--sapList_Background)'
const CF: React.CSSProperties = { fontFamily: 'var(--sapFontFamily)' }

// ─── Shared cell helpers ──────────────────────────────────────────────────────

// Aggregate checkbox state for a list of rule IDs
function groupCheckState(ids: string[], ruleStates: Record<string, RuleState>): { checked: boolean; indeterminate: boolean } {
  if (ids.length === 0) return { checked: false, indeterminate: false }
  const enabledCount = ids.filter(id => ruleStates[id]?.enabled).length
  if (enabledCount === 0) return { checked: false, indeterminate: false }
  if (enabledCount === ids.length) return { checked: true, indeterminate: false }
  return { checked: true, indeterminate: true }
}

// ─── Severity picker ──────────────────────────────────────────────────────────

type SeverityPickerProps = {
  ruleId: string
  severity: Severity
  readonly?: boolean
  disabled?: boolean
  onChange: (sv: Severity) => void
}

function SeverityPicker({ ruleId, severity, readonly: ro, disabled, onChange }: SeverityPickerProps) {
  const [open, setOpen] = useState(false)
  const chipId = `severity-chip-${ruleId}`

  if (ro) {
    if (!severity) return null
    const sv = SEVERITY_MAP[severity]
    return <SigChipV2 value={sv.label} design={severity === 'error' ? 'indication2' : severity === 'warning' ? 'indication3' : 'indication5'} leadingIcon={sv.icon} leadingIconColor={sv.iconColor} condensed tooltip={sv.desc} />
  }

  const selected = severity ? SEVERITY_MAP[severity] : null

  return (
    <>
      <SigChipV2
        id={chipId}
        value={selected ? selected.label : 'Select'}
        design={selected ? (severity === 'error' ? 'indication2' : severity === 'warning' ? 'indication3' : 'indication5') : 'none'}
        leadingIcon={selected ? selected.icon : undefined}
        leadingIconColor={selected ? selected.iconColor : undefined}
        trailingIcon="slim-arrow-down"
        condensed
        disabled={disabled}
        tooltip={selected ? selected.desc : undefined}
        onClick={(e: any) => { if (!disabled) { e.stopPropagation?.(); setOpen(v => !v) } }}
      />
      <Menu
        opener={chipId}
        open={open}
        onClose={() => setOpen(false)}
        onItemClick={(e: any) => {
          e.stopPropagation?.()
          const text = e.detail?.item?.text
          const found = SEVERITIES.find(sv => sv.label === text)
          onChange(found ? found.value : null)
          setOpen(false)
        }}
      >
        {SEVERITIES.map(sv => (
          <MenuItem key={sv.value} text={sv.label} icon={sv.icon} />
        ))}
      </Menu>
    </>
  )
}

// ─── Column header row ────────────────────────────────────────────────────────

const SEVERITY_INFO_ID = 'severity-info-btn'

function ColumnHeaders() {
  const [legendOpen, setLegendOpen] = useState(false)
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 280px',
      background: 'var(--sapList_HeaderBackground)',
      borderBottom: `2px solid var(--sapList_BorderColor)`,
      position: 'sticky', top: 0, zIndex: 5,
      minHeight: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', borderRight: BORDER }}>
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Rule</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 1rem' }}>
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Violation Shown As</Text>
        <Button
          id={SEVERITY_INFO_ID}
          icon="message-information"
          design="Transparent"
          accessibleName="Severity legend"
          onClick={() => setLegendOpen(v => !v)}
        />
        <Popover opener={SEVERITY_INFO_ID} open={legendOpen} onClose={() => setLegendOpen(false)} placement="Bottom" className="no-padding-popover">
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '300px' }}>
            {[
              { label: 'Error',   desc: 'Violation is flagged as an error in the model.', color: 'var(--sapErrorColor)' },
              { label: 'Warning', desc: 'The model deviates from best practices.', color: 'var(--sapWarningColor)' },
              { label: 'Hint',    desc: 'A suggestion to improve the model quality.', color: 'var(--sapInformationColor)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', gap: '6px' }}>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 }}>•</Text>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                  <strong style={{ color: s.color }}>{s.label}</strong>{' : '}{s.desc}
                </Text>
              </div>
            ))}
          </div>
        </Popover>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ModelingConventions() {
  const addDialogId = useId()
  const [conventions, setConventions] = useState<Convention[]>(INITIAL_CONVENTIONS)
  const [selectedConvId, setSelectedConvId] = useState('sap-bp')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newConvName, setNewConvName] = useState('')
  const [copyFromId, setCopyFromId] = useState<string>('')
  const [isDirty, setIsDirty] = useState(false)
  const savedConventions = useRef<Convention[]>(INITIAL_CONVENTIONS)

  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false)
  const [addRuleTargetSubId, setAddRuleTargetSubId] = useState<string | null>(null)
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleDesc, setNewRuleDesc] = useState('')

  const [editRuleDialogOpen, setEditRuleDialogOpen] = useState(false)
  const [editRuleId, setEditRuleId] = useState<string | null>(null)
  const [editRuleName, setEditRuleName] = useState('')
  const [editRuleDesc, setEditRuleDesc] = useState('')

  const [deleteRuleDialogOpen, setDeleteRuleDialogOpen] = useState(false)
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuItemClickedRef = useRef(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [attrSectionExpanded, setAttrSectionExpanded] = useState(true)
  const [attrEtExpanded, setAttrEtExpanded] = useState<Record<string, boolean>>({})
  const [attrCatExpanded, setAttrCatExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ATTR_ELEMENT_TYPES.flatMap(et => et.categories.map(c => [`${et.id}::${c.id}`, true])))
  )
  const [attrMappingOpen, setAttrMappingOpen] = useState(false)
  const [attrMappingReadonly, setAttrMappingReadonly] = useState(false)
  const [attrMappingName, setAttrMappingName] = useState('')
  const [attrMappingSelected, setAttrMappingSelected] = useState<string[]>([])

  const mutateConventions = (updater: (prev: Convention[]) => Convention[]) => {
    setConventions(updater)
    setIsDirty(true)
  }

  const handleSave = () => {
    savedConventions.current = conventions
    setIsDirty(false)
  }

  const handleReset = () => {
    setConventions(savedConventions.current)
    setIsDirty(false)
  }

  const conv = conventions.find(c => c.id === selectedConvId) ?? conventions[0]

  const updateRule = (ruleId: string, patch: Partial<RuleState>) =>
    mutateConventions(prev => prev.map(c => {
      if (c.id !== selectedConvId) return c
      const existing: RuleState = c.ruleStates[ruleId] ?? { enabled: false, severity: null }
      return { ...c, ruleStates: { ...c.ruleStates, [ruleId]: { ...existing, ...patch } } }
    }))

  const toggleRule = (ruleId: string) => {
    const cur = conv.ruleStates[ruleId]
    updateRule(ruleId, { enabled: !cur?.enabled, severity: cur?.severity ?? null })
  }
  const setSeverity    = (ruleId: string, sv: Severity)    => updateRule(ruleId, { severity: sv })
  const setParam       = (ruleId: string, v: string)       => updateRule(ruleId, { paramValue: v })
  const setParamValues = (ruleId: string, vals: string[])  => updateRule(ruleId, { paramValues: vals })

  const toggleAllRules = (ruleIds: string[], enable: boolean) =>
    mutateConventions(prev => prev.map(c => {
      if (c.id !== selectedConvId) return c
      const patch: Record<string, RuleState> = {}
      ruleIds.forEach(id => {
        const existing = c.ruleStates[id] ?? { enabled: false, severity: null }
        patch[id] = { ...existing, enabled: enable, severity: existing.severity ?? null }
      })
      return { ...c, ruleStates: { ...c.ruleStates, ...patch } }
    }))

  const openAddRuleDialog = (subId: string) => {
    setAddRuleTargetSubId(subId)
    setNewRuleName('')
    setNewRuleDesc('')
    setAddRuleDialogOpen(true)
  }

  const handleAddRule = () => {
    if (!newRuleName.trim() || !addRuleTargetSubId) return
    const ruleId = `custom-rule-${Date.now()}`
    const newItem: RuleItem = { id: ruleId, label: newRuleName.trim() }
    mutateConventions(prev => prev.map(c => {
      if (c.id !== selectedConvId) return c
      const prevCustom = c.customItems ?? {}
      return {
        ...c,
        customItems: {
          ...prevCustom,
          [addRuleTargetSubId]: [...(prevCustom[addRuleTargetSubId] ?? []), newItem],
        },
        ruleStates: {
          ...c.ruleStates,
          [ruleId]: { enabled: true, severity: null },
        },
      }
    }))
    setAddRuleDialogOpen(false)
  }

  const openEditRuleDialog = (item: RuleItem) => {
    setEditRuleId(item.id)
    setEditRuleName(item.label)
    setEditRuleDesc(item.description ?? '')
    setEditRuleDialogOpen(true)
  }

  const handleEditRule = () => {
    if (!editRuleId || !editRuleName.trim()) return
    mutateConventions(prev => prev.map(c => {
      if (c.id !== selectedConvId) return c
      const prevCustom = c.customItems ?? {}
      return {
        ...c,
        customItems: Object.fromEntries(
          Object.entries(prevCustom).map(([subId, items]) => [
            subId,
            items.map(i => i.id === editRuleId ? { ...i, label: editRuleName.trim(), description: editRuleDesc.trim() || undefined } : i),
          ])
        ),
      }
    }))
    setEditRuleDialogOpen(false)
  }

  const openDeleteRuleDialog = (ruleId: string) => {
    setDeleteRuleId(ruleId)
    setDeleteRuleDialogOpen(true)
  }

  const handleDeleteRule = () => {
    if (!deleteRuleId) return
    mutateConventions(prev => prev.map(c => {
      if (c.id !== selectedConvId) return c
      const prevCustom = c.customItems ?? {}
      const { [deleteRuleId]: _, ...restStates } = c.ruleStates
      return {
        ...c,
        customItems: Object.fromEntries(
          Object.entries(prevCustom).map(([subId, items]) => [
            subId,
            items.filter(i => i.id !== deleteRuleId),
          ])
        ),
        ruleStates: restStates,
      }
    }))
    setDeleteRuleDialogOpen(false)
  }

  const handleDeleteConvention = () => {
    const remaining = conventions.filter(c => c.id !== selectedConvId)
    mutateConventions(() => remaining)
    setSelectedConvId(remaining[0].id)
    setDeleteDialogOpen(false)
  }

  const [newConvModelType, setNewConvModelType] = useState<ModelType>('BPMN 2.0')

  const handleAddConvention = () => {
    if (!newConvName.trim()) return
    const id = `custom-${Date.now()}`
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    if (copyFromId) {
      const source = conventions.find(c => c.id === copyFromId) ?? conventions[0]
      mutateConventions(prev => [...prev, { ...source, id, name: newConvName.trim(), isBuiltin: false, modelType: newConvModelType, enabled: true, lastModified: today }])
    } else {
      mutateConventions(prev => [...prev, { id, name: newConvName.trim(), isBuiltin: false, modelType: newConvModelType, enabled: true, checkInEditorPerButton: true, checkInEditorSaveDialog: false, lastModified: today, ruleStates: {} }])
    }
    setSelectedConvId(id)
    setAddDialogOpen(false)
  }

  // Expand state — sections and subsection groups start expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    ;[...BPMN_RULES, ...DMN_RULES].forEach(sec => {
      init[sec.id] = true
      sec.subsections.forEach(sub => { init[sub.id] = true })
    })
    return init
  })

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // ── Rule leaf row ──
  const renderRuleRow = (item: RuleItem, paddingLeft: string, num?: string, description?: string) => {
    const state    = conv.ruleStates[item.id]
    const enabled  = state?.enabled ?? false
    const severity = state?.severity ?? null
    const dim      = enabled ? 1 : 0.4
    const isCustom = item.id.startsWith('custom-rule-')
    const menuId   = `rule-menu-${item.id}`

    return (
      <div
        key={item.id}
        className="element-row"
        style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderBottom: BORDER, background: BG, minHeight: 44, userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: `0.5rem 0.5rem 0.5rem ${paddingLeft}`, borderRight: BORDER }}>
        {!conv.isBuiltin && (
          <CheckBox
            checked={enabled}
            onChange={() => toggleRule(item.id)}
            accessibleName={item.label}
            style={{ opacity: dim, flexShrink: 0 }}
          />
        )}
        {num && <Text style={{ color: 'var(--sapTextColor)', fontSize: 'var(--sapFontSize)', flexShrink: 0, opacity: dim, ...CF }}>{num}</Text>}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px', opacity: dim }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', ...CF }}>{item.label}</Text>
          {description && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', ...CF }}>{description}</Text>}
        </div>
        {item.paramType === 'attributemapping' && (
          <Button
            icon="search"
            design="Transparent"
            tooltip="Attribute Mappings"
            style={{ flexShrink: 0, '--ui5-button-base-padding': '0 4px' } as React.CSSProperties}
            onClick={(e: any) => {
              e.stopPropagation()
              setAttrMappingName(item.label)
              setAttrMappingReadonly(!isCustom)
              setAttrSectionExpanded(true)
              setAttrEtExpanded({})
              // Pre-populate sample selections for built-in rules
              if (!isCustom) {
                setAttrMappingSelected([
                  'bpmn-diagram::custom::(K)PI',
                  'bpmn-diagram::custom::Ablaufdatum',
                  'bpmn-diagram::custom::Analysis',
                  'bpmn-diagram::main::Name',
                  'bpmn-diagram::main::Description',
                  'task::custom::(K)PI',
                  'task::main::Name',
                ])
              } else {
                setAttrMappingSelected([])
              }
              setAttrMappingOpen(true)
            }}
          />
        )}
        {isCustom && !conv.isBuiltin && (
          <>
            <Button
              id={menuId}
              icon="overflow"
              design="Transparent"
              tooltip="More Actions"
              style={{ flexShrink: 0, opacity: 1, '--ui5-button-base-padding': '0 4px' } as React.CSSProperties}
              onClick={(e: any) => { e.stopPropagation(); setOpenMenuId(prev => prev === menuId ? null : menuId) }}
            />
            <Menu
              opener={menuId}
              open={openMenuId === menuId}
              onClose={() => setOpenMenuId(null)}
              onItemClick={(e: any) => {
                const text = e.detail?.item?.text
                setOpenMenuId(null)
                if (text === 'Edit') openEditRuleDialog(item)
                else if (text === 'Delete') openDeleteRuleDialog(item.id)
              }}
            >
              <MenuItem text="Edit" icon="edit" />
              <MenuItem text="Delete" icon="delete" />
            </Menu>
          </>
        )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 1rem', flexWrap: 'wrap' }}>
          <SeverityPicker ruleId={item.id} severity={severity} readonly={conv.isBuiltin} disabled={!enabled} onChange={sv => setSeverity(item.id, sv)} />
          {item.paramType === 'select' && !conv.isBuiltin && (() => {
            const paramChipId = `param-chip-${item.id}`
            const current = state?.paramValue ?? ''
            return (
              <>
                <SigChipV2
                  id={paramChipId}
                  value={current || 'Choose option'}
                  trailingIcon="slim-arrow-down"
                  condensed
                  disabled={!enabled}
                  onClick={(e: any) => { e.stopPropagation(); setOpenMenuId(prev => prev === paramChipId ? null : paramChipId) }}
                />
                <Menu
                  opener={paramChipId}
                  open={openMenuId === paramChipId}
                  onClose={() => setOpenMenuId(null)}
                  onItemClick={(e: any) => { setParam(item.id, e.detail.item.text); setOpenMenuId(null) }}
                >
                  {(item.paramOptions ?? []).map(opt => <MenuItem key={opt} text={opt} />)}
                </Menu>
              </>
            )
          })()}
          {item.paramType === 'multiselect' && !conv.isBuiltin && (() => {
            const paramChipId = `param-chip-${item.id}`
            const selected = state?.paramValues ?? []
            const label = selected.length === 0 ? 'Choose option' : selected.join(', ')
            const truncated = label.length > 20 ? label.slice(0, 18) + '…' : label
            return (
              <>
                <SigChipV2
                  id={paramChipId}
                  value={truncated}
                  trailingIcon="slim-arrow-down"
                  condensed
                  disabled={!enabled}
                  onClick={(e: any) => { e.stopPropagation(); setOpenMenuId(prev => prev === paramChipId ? null : paramChipId) }}
                />
                <Menu
                  opener={paramChipId}
                  open={openMenuId === paramChipId}
                  onClose={() => setOpenMenuId(null)}
                  onBeforeClose={(e: any) => { if (menuItemClickedRef.current) { menuItemClickedRef.current = false; e.preventDefault() } }}
                  onItemClick={(e: any) => {
                    menuItemClickedRef.current = true
                    const text = e.detail.item.text
                    const next = selected.includes(text) ? selected.filter(v => v !== text) : [...selected, text]
                    setParamValues(item.id, next)
                  }}
                >
                  <MenuItemGroup checkMode="Multiple">
                    {(item.paramOptions ?? []).map(opt => (
                      <MenuItem key={opt} text={opt} checked={selected.includes(opt)} />
                    ))}
                  </MenuItemGroup>
                </Menu>
              </>
            )
          })()}
          {item.paramType && conv.isBuiltin && state?.paramValue && (
            <SigChipV2 value={state.paramValue} condensed />
          )}
          {item.paramType === 'multiselect' && conv.isBuiltin && (state?.paramValues ?? []).map(v => (
            <SigChipV2 key={v} value={v} condensed />
          ))}
        </div>
      </div>
    )
  }

  // ── Build rows ──
  const activeRules = conv.modelType === 'DMN' ? DMN_RULES : BPMN_RULES

  const renderSections = () => activeRules.flatMap(section => {
    const rows: React.ReactNode[] = []

    // All rule IDs in this section (across all subsections, including custom)
    const sectionRuleIds = section.subsections.flatMap(sub => {
      const extras = conv.customItems?.[sub.id] ?? []
      return [...sub.items, ...extras].map(i => i.id)
    })
    const sectionState = groupCheckState(sectionRuleIds, conv.ruleStates)

    // Section header row (depth 0)
    rows.push(
      <div
        key={`${section.id}-hdr`}
        className="element-row"
        onClick={() => toggle(section.id)}
        style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderBottom: BORDER, background: BG, minHeight: 36, cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRight: BORDER }}>        <Icon name={expanded[section.id] ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
        {!conv.isBuiltin && <CheckBox
          checked={sectionState.checked}
          indeterminate={sectionState.indeterminate}
          accessibleName={`Enable all in ${section.label}`}
          onChange={() => toggleAllRules(sectionRuleIds, !sectionState.checked || sectionState.indeterminate)}
          onClick={(e: any) => e.stopPropagation()}
        />}
        <div style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', ...CF }}>{section.num}&nbsp;&nbsp;{section.label} ({sectionRuleIds.length})</Text>
        </div>
        </div>
        <div style={{ background: BG }} />
      </div>
    )

    if (!expanded[section.id]) return rows

    section.subsections.forEach(sub => {
      const extraItems = conv.customItems?.[sub.id] ?? []
      const allItems = [...sub.items, ...extraItems]
      const isAttrMapping = sub.items.some(i => i.paramType === 'attributemapping')

      const openCreateRule = (e: any) => {
        e.stopPropagation()
        if (isAttrMapping) {
          setAttrMappingName('')
          setAttrMappingReadonly(false)
          setAttrMappingSelected([])
          setAttrSectionExpanded(true)
          setAttrEtExpanded({})
          setAttrMappingOpen(true)
        } else {
          openAddRuleDialog(sub.id)
        }
      }

      // Custom-rules placeholder (no base items AND no custom items yet)
      if (sub.canAddCustom && sub.items.length === 0 && extraItems.length === 0) {
        if (conv.isBuiltin) return
        rows.push(
          <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderBottom: BORDER, background: BG, minHeight: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0.5rem 3.5rem', borderRight: BORDER }}>
            <Text style={{ color: 'var(--sapTextColor)', fontSize: 'var(--sapFontSize)', minWidth: 28, ...CF }}>{sub.num}</Text>
            <Text style={{ fontSize: 'var(--sapFontSize)', ...CF }}>Custom Rules</Text>
            {!conv.isBuiltin && (
              <Button design="Transparent" icon="add" style={{ marginLeft: 'auto', '--ui5-button-base-padding': '0 4px' } as React.CSSProperties} onClick={openCreateRule}>Create Custom Rule</Button>
            )}
            </div>
            <div style={{ background: BG }} />
          </div>
        )
        return
      }

      const isGroup = allItems.length > 1 || (allItems.length === 1 && sub.label !== allItems[0].label)

      if (isGroup) {
        const subRuleIds = allItems.map(i => i.id)
        const subState = groupCheckState(subRuleIds, conv.ruleStates)

        // Subsection group header row
        rows.push(
          <div
            key={`${sub.id}-hdr`}
            className="element-row"
            onClick={() => toggle(sub.id)}
            style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderBottom: BORDER, background: BG, minHeight: 36, cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0.5rem 3.5rem', borderRight: BORDER }}>
            <Icon name={expanded[sub.id] ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }} />
            {!conv.isBuiltin && <CheckBox
              checked={subState.checked}
              indeterminate={subState.indeterminate}
              accessibleName={`Enable all in ${sub.label}`}
              onChange={() => toggleAllRules(subRuleIds, !subState.checked || subState.indeterminate)}
              onClick={(e: any) => e.stopPropagation()}
            />}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Text style={{ fontWeight: '600', flexShrink: 0, ...CF }}>{sub.num}</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <Text style={{ fontWeight: '600', ...CF }}>{sub.label} ({allItems.length})</Text>
                {sub.description && <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: 'normal', ...CF }}>{sub.description}</Text>}
              </div>
            </div>
            {sub.canAddCustom && !conv.isBuiltin && (
              <Button design="Transparent" icon="add" style={{ marginLeft: 'auto', '--ui5-button-base-padding': '0 4px', flexShrink: 0 } as React.CSSProperties} onClick={openCreateRule}>Create Custom Rule</Button>
            )}
            </div>
            <div style={{ background: BG }} />
          </div>
        )
        if (expanded[sub.id]) {
          allItems.forEach(item => rows.push(renderRuleRow(item, '5.5rem')))
        }
      } else {
        // Single-item subsection: rule row with subsection number as prefix (depth 1)
        allItems.forEach(item => rows.push(renderRuleRow(item, '3.5rem', sub.num, sub.description)))
      }
    })

    return rows
  })

  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({ 'BPMN 2.0': true, 'DMN': true })
  const toggleGroup = (mt: string) => setGroupExpanded(prev => ({ ...prev, [mt]: !prev[mt] }))
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [isNarrow, setIsNarrow] = useState(false)
  const roRef = useRef<ResizeObserver | null>(null)
  const layoutRef = useCallback((el: HTMLDivElement | null) => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < 900)
    })
    ro.observe(el)
    roRef.current = ro
  }, [])

  const body = (
      <div ref={layoutRef} style={{ paddingBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>

        {/* Left panel — hidden on narrow viewports */}
        {!isNarrow && (
        <div style={{ width: '22rem', flexShrink: 0, borderRadius: 'var(--sapElement_BorderCornerRadius)', background: 'var(--sapList_Background)', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, maxHeight: 'calc(100vh - 10rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: BORDER }}>
            <Title level="H5">Modeling Conventions</Title>
            <div>
              <Button
                id="wide-create-conv-btn"
                design="Emphasized"
                endIcon="slim-arrow-down"
                onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'wide-create-conv' ? null : 'wide-create-conv') }}
              >Create</Button>
              <Menu
                opener="wide-create-conv-btn"
                open={openMenu === 'wide-create-conv'}
                onClose={() => setOpenMenu(null)}
                onItemClick={(e: any) => {
                  const mt = e.detail?.item?.text as ModelType
                  setOpenMenu(null)
                  if (mt) { setNewConvModelType(mt); setNewConvName(''); setCopyFromId(''); setAddDialogOpen(true) }
                }}
              >
                {MODEL_TYPES.map(mt => <MenuItem key={mt} text={mt} />)}
              </Menu>
            </div>
          </div>

          {MODEL_TYPES.map(mt => {
            const group = conventions.filter(c => c.modelType === mt)
            const isExpanded = groupExpanded[mt] ?? true
            return (
              <div key={mt}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.25rem 0.5rem 1rem', borderBottom: BORDER, background: 'var(--sapList_Background)' }}
                >
                  <Icon
                    name={isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                    style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => toggleGroup(mt)}
                  />
                  <Text
                    style={{ flex: 1, fontWeight: '600', fontSize: 'var(--sapFontSize)', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleGroup(mt)}
                  >{mt} ({group.length})</Text>
                  <Button
                    id={`group-overflow-conv-${mt}`}
                    icon="overflow"
                    design="Transparent"
                    accessibleName={`Options for ${mt}`}
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === `group-overflow-conv-${mt}` ? null : `group-overflow-conv-${mt}`) }}
                  />
                  <Menu
                    opener={`group-overflow-conv-${mt}`}
                    open={openMenu === `group-overflow-conv-${mt}`}
                    onClose={() => setOpenMenu(null)}
                    onItemClick={(e: any) => {
                      const text = e.detail?.item?.text
                      setOpenMenu(null)
                      if (text === 'Create') {
                        setNewConvModelType(mt as ModelType); setNewConvName(''); setCopyFromId(''); setAddDialogOpen(true)
                      } else if (text === 'Disable All') {
                        mutateConventions(prev => prev.map(c => c.modelType === mt ? { ...c, enabled: false } : c))
                      } else if (text === 'Enable All') {
                        mutateConventions(prev => prev.map(c => c.modelType === mt ? { ...c, enabled: true } : c))
                      }
                    }}
                  >
                    <MenuItem text="Create" />
                    {group.every(c => !c.enabled)
                      ? <MenuItem text="Enable All" />
                      : <MenuItem text="Disable All" />
                    }
                  </Menu>
                </div>
                {isExpanded && group.map(c => {
                  const rowMenuId = `conv-menu-${c.id}`
                  return (
                    <div
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      className="lang-list-item"
                      onClick={() => setSelectedConvId(c.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') setSelectedConvId(c.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.25rem 0.5rem 3rem',
                        background: c.id === selectedConvId ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                        borderBottom: BORDER,
                        cursor: 'pointer', userSelect: 'none',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px', opacity: c.enabled ? 1 : 0.4 }}>
                        <Text style={{ display: 'block', fontWeight: c.id === selectedConvId ? '600' : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </Text>
                        <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                          {c.isBuiltin ? 'Default' : 'Custom'}
                        </Text>
                      </div>
                      <Button
                        id={rowMenuId}
                        icon="overflow"
                        design="Transparent"
                        accessibleName={`Options for ${c.name}`}
                        style={{ opacity: c.enabled ? 1 : 0.4 }}
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === c.id ? null : c.id) }}
                      />
                      <Menu
                        opener={rowMenuId}
                        open={openMenu === c.id}
                        onClose={() => setOpenMenu(null)}
                        onItemClick={(e: any) => {
                          const text = e.detail?.item?.text
                          setOpenMenu(null)
                          if (text === 'Duplicate') {
                            setNewConvModelType(c.modelType)
                            setNewConvName(`${c.name} (copy)`)
                            setCopyFromId(c.id)
                            setAddDialogOpen(true)
                          } else if (text === 'Enable') {
                            mutateConventions(prev => prev.map(x => x.id === c.id ? { ...x, enabled: true } : x))
                          } else if (text === 'Disable') {
                            mutateConventions(prev => prev.map(x => x.id === c.id ? { ...x, enabled: false } : x))
                          } else if (text === 'Delete') {
                            setSelectedConvId(c.id)
                            setDeleteDialogOpen(true)
                          }
                        }}
                      >
                        <MenuItem text="Duplicate" />
                        {c.enabled ? <MenuItem text="Disable" /> : <MenuItem text="Enable" />}
                        {!c.isBuiltin && <MenuItem text="Delete" />}
                      </Menu>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        )}

        {/* Right panel — rule table */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: BG, borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
          {/* Convention title + toggle + overflow */}
          <div style={{ padding: '0.75rem 1rem', background: 'var(--sapList_Background)', borderBottom: BORDER }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              {isNarrow ? (
                <VariantManagement
                  closeOnItemSelect
                  hideSaveAs
                  hideManageVariants
                  level="H5"
                  size="H5"
                  titleText="Modeling Conventions"
                  onSelect={(e: any) => {
                    const key = (e.detail.selectedVariant as any).children as string
                    const found = conventions.find(c => c.name === key)
                    if (found) setSelectedConvId(found.id)
                  }}
                >
                  {MODEL_TYPES.map(mt => (
                    <ListItemGroup key={mt} headerText={mt}>
                      {conventions.filter(c => c.modelType === mt).map(c => (
                        <VariantItem key={c.id} selected={c.id === selectedConvId} labelReadOnly hideDelete readOnly>
                          {c.name}
                        </VariantItem>
                      ))}
                    </ListItemGroup>
                  ))}
                </VariantManagement>
              ) : (
                <Title level="H5">{conv.name}</Title>
              )}
              {!conv.enabled && <SigChipV2 value="Disabled" design="indication2" condensed />}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isNarrow && (
                  <>
                  <Button
                    id="narrow-create-conv-btn"
                    design="Emphasized"
                    endIcon="slim-arrow-down"
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'narrow-create-conv' ? null : 'narrow-create-conv') }}
                  >Create</Button>
                  <Menu
                    opener="narrow-create-conv-btn"
                    open={openMenu === 'narrow-create-conv'}
                    onClose={() => setOpenMenu(null)}
                    onItemClick={(e: any) => {
                      setOpenMenu(null)
                      const mt = e.detail?.item?.text as ModelType
                      if (mt) {
                        setNewConvModelType(mt)
                        setNewConvName('')
                        setCopyFromId('')
                        setAddDialogOpen(true)
                      }
                    }}
                  >
                    {MODEL_TYPES.map(mt => <MenuItem key={mt} text={mt} />)}
                  </Menu>
                  </>
                )}
                <Button
                  design="Transparent"
                  onClick={() => mutateConventions(prev => prev.map(c => c.id === selectedConvId ? { ...c, enabled: !c.enabled } : c))}
                >{conv.enabled ? 'Disable' : 'Enable'}</Button>
                <Button
                  id="right-panel-conv-overflow-btn"
                  icon="overflow"
                  design="Transparent"
                  accessibleName={`Options for ${conv.name}`}
                  onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'right-panel-conv-overflow' ? null : 'right-panel-conv-overflow') }}
                />
                <Menu
                  opener="right-panel-conv-overflow-btn"
                  open={openMenu === 'right-panel-conv-overflow'}
                  onClose={() => setOpenMenu(null)}
                  onItemClick={(e: any) => {
                    const text = e.detail?.item?.text
                    setOpenMenu(null)
                    if (text === 'Duplicate') {
                      setNewConvModelType(conv.modelType)
                      setNewConvName(`${conv.name} (copy)`)
                      setCopyFromId(conv.id)
                      setAddDialogOpen(true)
                    } else if (text === 'Delete') {
                      setDeleteDialogOpen(true)
                    }
                  }}
                >
                  <MenuItem text="Duplicate" />
                  {!conv.isBuiltin && <MenuItem text="Delete" />}
                </Menu>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>
                {'Last Modified: '}
                <Text style={{ fontSize: '14px' }}>{conv.lastModified}</Text>
              </Text>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>·</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor)', ...CF }}>Check in Editor:</Text>
                <CheckBox
                  text="Manual Check"
                  wrappingType="None"
                  title="Run the convention check manually from the editor toolbar"
                  checked={conv.checkInEditorPerButton}
                  onChange={() => mutateConventions(prev => prev.map(c => c.id === selectedConvId ? { ...c, checkInEditorPerButton: !c.checkInEditorPerButton } : c))}
                />
                <CheckBox
                  text="Check on Save"
                  wrappingType="None"
                  title="Automatically run the convention check when saving a diagram"
                  checked={conv.checkInEditorSaveDialog}
                  onChange={() => mutateConventions(prev => prev.map(c => c.id === selectedConvId ? { ...c, checkInEditorSaveDialog: !c.checkInEditorSaveDialog } : c))}
                />
              </div>
            </div>
            {conv.isBuiltin && (
              <div style={{ marginTop: '0.5rem' }}>
                <MessageStrip design="Information" hideCloseButton>
                  Default modeling conventions cannot be altered. Duplicate this convention to create a customizable copy.
                </MessageStrip>
              </div>
            )}
          </div>

          {/* Rule table */}
          <div style={{ overflowX: 'auto', position: 'relative' }}>
            <ColumnHeaders />
            <div style={{ background: BG }}>
              {renderSections()}
            </div>
          </div>
        </div>
      </div>
  )

  return (
    <>
    <ObjectPage
      style={{ height: '100%' } as React.CSSProperties}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      selectedSectionId="pm-legacy"
      titleArea={
        <ObjectPageTitle
          header="Modeling Conventions"
          subHeader="Define quality rules for your workspace's process models."
        />
      }
      footerArea={isDirty ? (
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
          <Button slot="endContent" onClick={handleReset}>Discard Changes</Button>
        </Bar>
      ) : undefined}
    >
      <ObjectPageSection id="pm-legacy" titleText="Process Manager (legacy)" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the Old Process Modeler only.</strong> It has no effect on the New Process Modeler.
          </MessageStrip>
        </div>
        {body}
      </ObjectPageSection>
    </ObjectPage>

      {/* Create Convention dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        headerText={copyFromId ? 'Duplicate Convention' : 'Create Convention'}
        aria-labelledby={addDialogId}
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '28rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label required for="create-convention-name">Name</Label>
            <Input
              id="create-convention-name"
              value={newConvName}
              placeholder="Convention name"
              style={{ width: '100%' }}
              onInput={e => setNewConvName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleAddConvention} disabled={!newConvName.trim()}>{copyFromId ? 'Duplicate' : 'Create'}</Button>
          <Button slot="endContent" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* Add Custom Rule dialog */}
      <Dialog
        open={addRuleDialogOpen}
        onClose={() => setAddRuleDialogOpen(false)}
        headerText="Add New Custom Rule"
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="new-rule-name">Rule Name:</Label>
            <Input
              id="new-rule-name"
              value={newRuleName}
              placeholder="Rule name"
              style={{ width: '100%' }}
              onInput={e => setNewRuleName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="new-rule-description">Rule Description:</Label>
            <TextArea
              id="new-rule-description"
              value={newRuleDesc}
              placeholder="Rule description"
              rows={4}
              style={{ width: '100%' }}
              onInput={e => setNewRuleDesc((e.target as unknown as HTMLTextAreaElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleAddRule} disabled={!newRuleName.trim()}>Create</Button>
          <Button slot="endContent" onClick={() => setAddRuleDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* Delete Convention confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        headerText="Delete Convention"
      >
        <div style={{ padding: '1rem', minWidth: 360 }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', ...CF }}>
            Do you want to delete the convention <strong>{conv.name}</strong>?
          </Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Negative" onClick={handleDeleteConvention}>Delete</Button>
          <Button slot="endContent" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* Attribute Mappings dialog */}
      <Dialog
        open={attrMappingOpen}
        onClose={() => setAttrMappingOpen(false)}
        headerText="Attribute mappings"
        preventFocusRestore
        initialFocus="attr-mapping-close"
        style={{ '--ui5-dialog-width': '600px' } as React.CSSProperties}
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 520 }}>
          {!attrMappingReadonly && (
            <Text style={{ fontSize: 'var(--sapFontSize)', ...CF }}>
              Define a name and select the attributes to include in this convention rule.
            </Text>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Label for="attr-mapping-name" style={{ flexShrink: 0 }}>Name:</Label>
            <Input
              id="attr-mapping-name"
              value={attrMappingName}
              placeholder="e.g. My mandatory attribute set"
              readonly={attrMappingReadonly}
              style={{ flex: 1 }}
              onInput={(e: any) => setAttrMappingName((e.target as HTMLInputElement).value)}
            />
          </div>
          <div style={{ border: BORDER, borderRadius: '4px', overflow: 'hidden' }}>
            {(() => {
              const allAttrs = ATTR_ELEMENT_TYPES.flatMap(et => et.categories.flatMap(c => c.attrs.map(a => `${et.id}::${c.id}::${a}`)))
              const totalSelected = attrMappingSelected.length
              return (
                <>
                  <div
                    style={{ background: 'var(--sapList_HeaderBackground)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: BORDER, cursor: 'pointer' }}
                    onClick={() => setAttrSectionExpanded(v => !v)}
                  >
                    <Icon name={attrSectionExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', flex: 1, ...CF }}>
                      Business Process Diagram (BPMN 2.0)
                      {totalSelected > 0 && <span style={{ fontWeight: 'normal', color: 'var(--sapContent_LabelColor)' }}> ({totalSelected} selected)</span>}
                    </Text>
                    {attrSectionExpanded && (
                      <div style={{ display: 'flex', gap: '0rem' }} onClick={e => e.stopPropagation()}>
                        <Button design="Transparent" disabled={attrMappingReadonly} onClick={() => setAttrMappingSelected(allAttrs)}>Select All</Button>
                        <Button design="Transparent" disabled={attrMappingReadonly} onClick={() => setAttrMappingSelected([])}>Deselect All</Button>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
            {attrSectionExpanded && <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {ATTR_ELEMENT_TYPES.map(et => {
                const etAttrs = et.categories.flatMap(c => c.attrs.map(a => `${et.id}::${c.id}::${a}`))
                const etSelected = etAttrs.filter(k => attrMappingSelected.includes(k)).length
                const etExpanded = attrEtExpanded[et.id] ?? false
                return (
                  <div key={et.id} style={{ borderBottom: BORDER }}>
                    {/* Element type row */}
                    <div
                      className="attr-tree-row"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0.5rem 2rem', cursor: 'pointer', background: 'var(--sapList_Background)' }}
                      onClick={() => setAttrEtExpanded(prev => ({ ...prev, [et.id]: !prev[et.id] }))}
                    >
                      <Icon name={etExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                      <CheckBox
                        checked={etSelected === etAttrs.length}
                        indeterminate={etSelected > 0 && etSelected < etAttrs.length}
                        disabled={attrMappingReadonly}
                        onChange={() => {
                          if (etSelected < etAttrs.length) setAttrMappingSelected(prev => [...new Set([...prev, ...etAttrs])])
                          else setAttrMappingSelected(prev => prev.filter(k => !etAttrs.includes(k)))
                        }}
                        onClick={(e: any) => e.stopPropagation()}
                        style={{ marginLeft: '-0.5rem' }}
                      />
                      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', flex: 1, ...CF }}>
                        {et.label}{etSelected > 0 && <span style={{ fontWeight: 'normal', color: 'var(--sapContent_LabelColor)' }}> ({etSelected} selected)</span>}
                      </Text>
                    </div>
                    {etExpanded && et.categories.map(cat => {
                      const catKey = `${et.id}::${cat.id}`
                      const catExpanded = attrCatExpanded[catKey] ?? true
                      return (
                        <div key={cat.id}>
                          {/* Category row */}
                          <div
                            className="attr-tree-row"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem 0.375rem 3.5rem', cursor: 'pointer', background: 'var(--sapList_Background)' }}
                            onClick={() => setAttrCatExpanded(prev => ({ ...prev, [catKey]: !prev[catKey] }))}
                          >
                            <Icon name={catExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'} style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', ...CF }}>{cat.label}</Text>
                          </div>
                          {catExpanded && cat.attrs.map(attr => {
                            const key = `${et.id}::${cat.id}::${attr}`
                            const isSelected = attrMappingSelected.includes(key)
                            return (
                              <div key={attr} className="attr-tree-row" style={{ padding: '0.2rem 1rem 0.2rem 5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--sapList_Background)' }}>
                                <CheckBox
                                  text={attr}
                                  checked={isSelected}
                                  disabled={attrMappingReadonly}
                                  onChange={() => setAttrMappingSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                                  onClick={() => setAttrMappingSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                                  style={{ marginLeft: '-0.5rem' }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>}
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          {!attrMappingReadonly && <Button slot="endContent" design="Emphasized" onClick={() => setAttrMappingOpen(false)}>Save</Button>}
          <Button id="attr-mapping-close" slot="endContent" onClick={() => setAttrMappingOpen(false)}>{attrMappingReadonly ? 'Close' : 'Cancel'}</Button>
        </Bar>
      </Dialog>

      {/* Edit Custom Rule dialog */}
      <Dialog
        open={editRuleDialogOpen}
        onClose={() => setEditRuleDialogOpen(false)}
        headerText="Edit Rule"
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="edit-rule-name">Rule name:</Label>
            <Input
              id="edit-rule-name"
              value={editRuleName}
              placeholder="Rule name"
              style={{ width: '100%' }}
              onInput={e => setEditRuleName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label for="edit-rule-desc">Description:</Label>
            <TextArea
              id="edit-rule-desc"
              value={editRuleDesc}
              placeholder="Rule description"
              rows={3}
              style={{ width: '100%' }}
              onInput={e => setEditRuleDesc((e.target as unknown as HTMLTextAreaElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" onClick={handleEditRule} disabled={!editRuleName.trim()}>Save</Button>
          <Button slot="endContent" onClick={() => setEditRuleDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      {/* Delete Custom Rule confirmation dialog */}
      <Dialog
        open={deleteRuleDialogOpen}
        onClose={() => setDeleteRuleDialogOpen(false)}
        headerText="Delete Rule"
      >
        <div style={{ padding: '1rem', minWidth: 360 }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', ...CF }}>
            Do you want to delete this custom rule?
          </Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Negative" onClick={handleDeleteRule}>Delete</Button>
          <Button slot="endContent" onClick={() => setDeleteRuleDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>
    </>
  )
}
