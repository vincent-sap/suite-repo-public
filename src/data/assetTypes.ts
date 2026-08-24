import type React from 'react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'

type DomainObjects = React.ComponentProps<typeof SigDomainObject>['object']

export type AssetType = {
  id: string; name: string; description: string; domainObject: DomainObjects; notation: boolean
}

export const ASSET_TYPES: AssetType[] = [
  { id: 'bpmn',        name: 'BPMN 2.0',       description: 'Business Process Model and Notation', domainObject: 'Process Model',  notation: true  },
  { id: 'dmn',         name: 'DMN 1.2',         description: 'Decision Model and Notation',          domainObject: 'DMN',            notation: true  },
  { id: 'value-chain', name: 'Value Chain',     description: 'Value chain diagram type',              domainObject: 'Value Chain',    notation: true  },
  { id: 'nav-map',     name: 'Navigation Map',  description: 'Navigation map diagram type',           domainObject: 'Navigation Map', notation: true  },
  { id: 'objective',   name: 'Objective',       description: 'A main goal guiding direction',         domainObject: 'Business Goal',  notation: false },
  { id: 'initiative',  name: 'Initiative',      description: 'Strategic initiative',                  domainObject: 'Initiative',     notation: false },
  { id: 'insight',     name: 'Insight',         description: 'Insights and observations',             domainObject: 'Insights',       notation: false },
  { id: 'dashboard',   name: 'Dashboard',       description: 'Analytics and reporting dashboard',     domainObject: 'Dashboard',      notation: false },
  { id: 'process-semantic-view', name: 'Process Semantic View', description: 'Semantic view of process models', domainObject: 'Process Model', notation: false },
]

export type SubElement = { id: string; name: string; icon: string; group: string }

export const SUB_ELEMENTS: Record<string, SubElement[]> = {
  bpmn: [
    { id: 'task',         name: 'Task',               icon: 'task',        group: 'Shapes' },
    { id: 'start-event',  name: 'Start Event',        icon: 'circle-task', group: 'Shapes' },
    { id: 'end-event',    name: 'End Event',          icon: 'record',      group: 'Shapes' },
    { id: 'int-event',    name: 'Intermediate Event', icon: 'circle-task', group: 'Shapes' },
    { id: 'gateway',      name: 'Gateway',            icon: 'decision',    group: 'Shapes' },
    { id: 'pool',         name: 'Pool',               icon: 'table-view',  group: 'Shapes' },
    { id: 'lane',         name: 'Lane',               icon: 'table-view',  group: 'Shapes' },
    { id: 'seq-flow',     name: 'Sequence Flow',      icon: 'arrow-right', group: 'Connectors' },
    { id: 'msg-flow',     name: 'Message Flow',       icon: 'arrow-right', group: 'Connectors' },
    { id: 'data-obj',     name: 'Data Object',        icon: 'document',    group: 'Artifacts' },
    { id: 'annotation',   name: 'Text Annotation',    icon: 'comment',     group: 'Artifacts' },
  ],
  dmn: [
    { id: 'decision',      name: 'Decision',                 icon: 'decision',    group: 'Shapes' },
    { id: 'input-data',    name: 'Input Data',               icon: 'download',    group: 'Shapes' },
    { id: 'knowledge-src', name: 'Knowledge Source',         icon: 'database',    group: 'Shapes' },
    { id: 'bkm',           name: 'Business Knowledge Model', icon: 'learning',    group: 'Shapes' },
    { id: 'info-req',      name: 'Information Requirement',  icon: 'arrow-right', group: 'Connectors' },
    { id: 'knowledge-req', name: 'Knowledge Requirement',    icon: 'arrow-right', group: 'Connectors' },
  ],
  'value-chain': [
    { id: 'activity',     name: 'Activity',            icon: 'task',        group: 'Shapes' },
    { id: 'sup-activity', name: 'Supporting Activity', icon: 'task',        group: 'Shapes' },
    { id: 'connection',   name: 'Connection',          icon: 'arrow-right', group: 'Connectors' },
  ],
  'nav-map': [
    { id: 'page',     name: 'Page',     icon: 'document',    group: 'Shapes' },
    { id: 'category', name: 'Category', icon: 'group',       group: 'Shapes' },
    { id: 'link',     name: 'Link',     icon: 'arrow-right', group: 'Connectors' },
  ],
}
