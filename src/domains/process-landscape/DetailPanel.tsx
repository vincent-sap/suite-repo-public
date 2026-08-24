import { useEffect, useState } from 'react'
import {
  TabContainer, Tab, Title, Text, Avatar, Label, Input, Select, Option,
  List, ListItemStandard,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Button,
} from '@ui5/webcomponents-react'
import type { InputDomRef } from '@ui5/webcomponents-react'
import { getElementById, getChildren } from './data'
import { resolveElements } from './variantUtils'
import type { ProcessElement, VariantDeviation } from './types'
import { USERS } from '../../data/users'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { LINE_COLORS } from './canvas/layoutShared'

interface DetailPanelProps {
  hierarchyId: string
  elementId: string
  onClose: () => void
}

const RACI_DATA = [
  { role: 'Process Owner', r: true,  a: false, c: false, i: false },
  { role: 'Process Manager', r: false, a: true,  c: false, i: false },
  { role: 'Business Analyst', r: false, a: false, c: true,  i: false },
  { role: 'IT Team', r: false, a: false, c: true,  i: false },
  { role: 'Leadership', r: false, a: false, c: false, i: true  },
]

const ASSET_TYPES = [
  { name: 'Order-to-Cash BPMN', type: 'BPMN 2.0', icon: 'SAP-icons-v4/bpmn-type-service' },
  { name: 'Customer Segment DMN', type: 'DMN', icon: 'decision' },
  { name: 'Process KPI Dashboard', type: 'Process Intelligence', icon: 'SAP-icons-v4/process-intelligence' },
]

const STATUS_COLORS: Record<string, string> = {
  Active: 'var(--sapPositiveColor)',
  'In Review': 'var(--sapCriticalColor)',
  Draft: 'var(--sapNeutralColor)',
  Deprecated: 'var(--sapNegativeColor)',
}

const DEVIATION_LABEL: Record<VariantDeviation, string> = {
  standard: 'Standard',
  inherited: 'Inherited',
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
}

const DEVIATION_COLOR: Record<VariantDeviation, string> = {
  standard: 'var(--sapNeutralColor)',
  inherited: 'var(--sapInformativeColor)',
  added: 'var(--sapPositiveColor)',
  removed: 'var(--sapNegativeColor)',
  changed: 'var(--sapCriticalColor)',
}

function DeviationBadge({ deviation }: { deviation: VariantDeviation }) {
  if (deviation === 'standard') return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.0625rem 0.375rem',
      borderRadius: '0.625rem',
      fontSize: 'var(--sapFontSmallSize)',
      border: `1px solid ${DEVIATION_COLOR[deviation]}`,
      color: DEVIATION_COLOR[deviation],
      whiteSpace: 'nowrap',
    }}>
      {DEVIATION_LABEL[deviation]}
    </span>
  )
}

export default function DetailPanel({ hierarchyId, elementId, onClose }: DetailPanelProps) {
  const { getElements, updateElement } = useProcessLandscape()
  const { levelNames, userContextValues } = useWorkspace()
  const rawElements = getElements(hierarchyId)

  // Resolve against the active user context so overrides/deviation reflect the current scope.
  const resolved = resolveElements(rawElements, userContextValues)
  const elements = resolved.map(r => r.element)
  const deviationById = new Map(resolved.map(r => [r.element.id, r.deviation]))
  const element = getElementById(elements, elementId)
  const deviation = deviationById.get(elementId) ?? 'standard'

  // Staged Configuration edits
  const [name, setName] = useState('')
  const [processType, setProcessType] = useState<ProcessElement['processType']>('Operating')
  const [status, setStatus] = useState<ProcessElement['status']>('Draft')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (element) {
      setName(element.name)
      setProcessType(element.processType)
      setStatus(element.status)
      setDescription(element.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, hierarchyId])

  if (!element) return null

  const l1s = elements.filter(e => e.level === 1).sort((a, b) => a.hierarchyId.localeCompare(b.hierarchyId))
  let l1Ancestor: ProcessElement | undefined
  if (element.level === 1) {
    l1Ancestor = element
  } else {
    let cur: ProcessElement | undefined = element
    while (cur) {
      if (!cur.parentId) break
      const parent = elements.find(e => e.id === cur!.parentId)
      if (!parent) break
      if (parent.level === 1) { l1Ancestor = parent; break }
      cur = parent
    }
  }
  const l1ColorIdx = l1Ancestor ? l1s.findIndex(e => e.id === l1Ancestor!.id) : -1
  const l1LineColor = l1ColorIdx >= 0 ? LINE_COLORS[l1ColorIdx % LINE_COLORS.length] : undefined

  const owner = USERS.find(u => u.id === element.ownerId)
  const children = getChildren(elements, elementId).slice(0, 5)

  const isDirty =
    name !== element.name ||
    processType !== element.processType ||
    status !== element.status ||
    description !== element.description

  const handleSave = () => {
    updateElement(hierarchyId, { ...element, name, processType, status, description })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem',
        flexShrink: 0,
        background: 'var(--sapGroup_TitleBackground)',
      }}>
        <div style={{ minWidth: 0 }}>
          <Title level="H5">{element.name}</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <SigChipV2 condensed value={element.hierarchyId} />
            {l1Ancestor && element.level > 1 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '0.0625rem 0.5rem',
                borderRadius: '9999px',
                fontSize: 'var(--sapFontSmallSize)',
                background: l1LineColor ? `${l1LineColor}22` : 'var(--sapNeutralBackground)',
                border: `1px solid ${l1LineColor ?? 'var(--sapList_BorderColor)'}`,
                color: l1LineColor ?? 'var(--sapTextColor)',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
                {l1Ancestor.name}
              </span>
            )}
            <DeviationBadge deviation={deviation} />
          </div>
        </div>
        <Button design="Transparent" icon="decline" onClick={onClose} />
      </div>

      <TabContainer style={{ flex: 1, overflow: 'hidden' }}>
        <Tab text="Overview">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'auto', height: '100%' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', lineHeight: '1.5', fontSize: 'var(--sapFontSmallSize)' }}>
              {element.description}
            </Text>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <Title level="H4" style={{ color: 'var(--sapTextColor)' }}>{element.assetCount}</Title>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Assets</Text>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <Title level="H4" style={{ color: 'var(--sapTextColor)' }}>{element.childCount}</Title>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Sub-Processes</Text>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: STATUS_COLORS[element.status] }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '600' }}>{element.status}</Text>
                </div>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Status</Text>
              </div>
            </div>

            {children.length > 0 && (
              <div>
                <Label style={{ display: 'block', marginBottom: '0.5rem' }}>Child Processes</Label>
                <List separators="None">
                  {children.map(child => (
                    <ListItemStandard
                      key={child.id}
                      icon="SAP-icons-v4/process-level"
                      description={`${child.hierarchyId} · ${levelNames[child.level as 1 | 2 | 3 | 4 | 5]}`}
                    >
                      {child.name}
                    </ListItemStandard>
                  ))}
                </List>
              </div>
            )}
          </div>
        </Tab>

        <Tab text="People">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'auto', height: '100%' }}>
            <div>
              <Label style={{ display: 'block', marginBottom: '0.5rem' }}>Process Owner</Label>
              {owner ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem' }}>
                  <Avatar initials={owner.initials} colorScheme={owner.colorScheme as 'Accent1'} size="S" />
                  <div>
                    <Text style={{ display: 'block', fontWeight: '600' }}>{owner.name}</Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{owner.email}</Text>
                  </div>
                </div>
              ) : <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No owner assigned</Text>}
            </div>

            <div>
              <Label style={{ display: 'block', marginBottom: '0.5rem' }}>RACI Matrix</Label>
              <Table
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell width="50">R</TableHeaderCell>
                    <TableHeaderCell width="50">A</TableHeaderCell>
                    <TableHeaderCell width="50">C</TableHeaderCell>
                    <TableHeaderCell width="50">I</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {RACI_DATA.map(row => (
                  <TableRow key={row.role}>
                    <TableCell><Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{row.role}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.r ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.a ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.c ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.i ? '●' : ''}</Text></TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        </Tab>

        <Tab text="Assets">
          <div style={{ padding: '1rem', overflow: 'auto', height: '100%' }}>
            <List separators="Inner">
              {ASSET_TYPES.map((asset, i) => (
                <ListItemStandard
                  key={i}
                  icon={asset.icon}
                  description={asset.type}
                >
                  {asset.name}
                </ListItemStandard>
              ))}
            </List>
            <Text style={{ display: 'block', marginTop: '0.5rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', paddingLeft: '0.5rem' }}>
              {element.assetCount} asset{element.assetCount !== 1 ? 's' : ''} linked to this process
            </Text>
          </div>
        </Tab>

        <Tab text="Configuration">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto', height: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <div>
                <Label required style={{ display: 'block', marginBottom: '0.25rem' }}>Name</Label>
                <Input
                  value={name}
                  onInput={(e) => setName((e.target as unknown as InputDomRef).value ?? '')}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Hierarchy ID</Label>
                <Input value={element.hierarchyId} readonly style={{ width: '100%' }} />
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Process Type</Label>
                <Select
                  style={{ width: '100%' }}
                  onChange={(e) => setProcessType((e.detail.selectedOption.textContent ?? 'Operating') as ProcessElement['processType'])}
                >
                  <Option selected={processType === 'Operating'}>Operating</Option>
                  <Option selected={processType === 'Management'}>Management</Option>
                  <Option selected={processType === 'Support'}>Support</Option>
                </Select>
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Status</Label>
                <Select
                  style={{ width: '100%' }}
                  onChange={(e) => setStatus((e.detail.selectedOption.textContent ?? 'Draft') as ProcessElement['status'])}
                >
                  <Option selected={status === 'Active'}>Active</Option>
                  <Option selected={status === 'In Review'}>In Review</Option>
                  <Option selected={status === 'Draft'}>Draft</Option>
                  <Option selected={status === 'Deprecated'}>Deprecated</Option>
                </Select>
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</Label>
                <Input
                  value={description}
                  onInput={(e) => setDescription((e.target as unknown as InputDomRef).value ?? '')}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <Button design="Emphasized" disabled={!isDirty} onClick={handleSave}>Save</Button>
            </div>
          </div>
        </Tab>
      </TabContainer>
    </div>
  )
}
