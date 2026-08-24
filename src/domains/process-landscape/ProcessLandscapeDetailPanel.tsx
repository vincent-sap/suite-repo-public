import React, { useState, useCallback } from 'react'
import { Tab, Text, Label, Avatar, Button, TextArea, Bar, ComboBox, ComboBoxItem, MultiComboBox, MultiComboBoxItem } from '@ui5/webcomponents-react'
import { SigRightSidePanel, SigChipV2, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import ActivityFeed from '../repository/Repository/ActivityFeed'
import { getElementById, getChildren } from './data'
import { resolveElements } from './variantUtils'
import type { ProcessElement, ProcessStatus } from './types'
import { USERS } from '../../data/users'
import { useProcessLandscape } from '../../contexts/ProcessLandscapeContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { LINE_COLOR_INDICES } from './canvas/layoutShared'
import { buildTree, flattenTree, renumberTree, cloneTree, findNode } from './treeUtils'
import type { TreeNode } from './treeUtils'
import AssetInfoPanel from '../repository/Repository/AssetInfoPanel'
import { getBpmnModel } from '../../data/bpmnModels'
import { processElementToFileItem } from './processElementAdapter'
import { BpmnPreviewDialog } from '../repository/components/BpmnPreviewDialog'

interface Props {
  hierarchyId: string
  elementId: string | null
  onClose: () => void
  mode?: 'view' | 'create'
  initialPredecessorIds?: string[]
  initialSuccessorIds?: string[]
  initialParentId?: string
}

const attrRow: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0',
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)',
}

function AttrRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={attrRow}>
      <Label style={labelStyle}>{label}</Label>
      {children}
    </div>
  )
}

function HierarchyGroupHeader() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0 2px' }}>
        <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)' }}>Hierarchy</Text>
      </div>
      <div style={{ height: '1px', background: 'var(--sapList_BorderColor)', marginBottom: '8px' }} />
    </>
  )
}

function inferLevel(
  elements: ProcessElement[],
  parentId: string,
  predecessorIds: string[],
  successorIds: string[],
  childIds: string[],
): 1 | 2 | 3 | 4 | 5 {
  if (parentId) {
    const p = elements.find(e => e.id === parentId)
    if (p && p.level < 5) return (p.level + 1) as 1 | 2 | 3 | 4 | 5
  }
  const refId = predecessorIds[0] ?? successorIds[0]
  if (refId) {
    const ref = elements.find(e => e.id === refId)
    if (ref) return ref.level
  }
  if (childIds[0]) {
    const child = elements.find(e => e.id === childIds[0])
    if (child && child.level > 1) return (child.level - 1) as 1 | 2 | 3 | 4 | 5
  }
  return 2
}

function CreateElementForm({ hierarchyId, onClose, initialPredecessorIds, initialSuccessorIds, initialParentId }: {
  hierarchyId: string
  onClose: () => void
  initialPredecessorIds?: string[]
  initialSuccessorIds?: string[]
  initialParentId?: string
}) {
  const { getElements, saveStructure } = useProcessLandscape()
  const { levelNames, userContextValues } = useWorkspace()
  const rawElements = getElements(hierarchyId)
  const resolved = resolveElements(rawElements, userContextValues)
  const elements = resolved.map(r => r.element)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [processType, setProcessType] = useState<ProcessElement['processType']>('Operating')
  const [status, setStatus] = useState<ProcessStatus>('Draft')
  const [ownerId, setOwnerId] = useState('')
  const [parentId, setParentId] = useState(initialParentId ?? '')
  const [predecessorIds, setPredecessorIds] = useState<string[]>(initialPredecessorIds ?? [])
  const [successorIds, setSuccessorIds] = useState<string[]>(initialSuccessorIds ?? [])
  const [childIds, setChildIds] = useState<string[]>([])

  const inferredLevel = inferLevel(elements, parentId, predecessorIds, successorIds, childIds)
  const parentEl = elements.find(e => e.id === parentId)

  function elementText(el: ProcessElement) {
    return `L${el.level} · ${el.name}`
  }

  function handleMultiChange(setter: (ids: string[]) => void) {
    return (e: any) => {
      const items: HTMLElement[] = Array.from(e.detail.items)
      const names = items.map(i => i.getAttribute('text') ?? '')
      setter(elements.filter(el => names.includes(el.name)).map(el => el.id))
    }
  }

  function handleCreate() {
    const roots = cloneTree(buildTree(getElements(hierarchyId)))

    const newId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newNode: TreeNode = {
      id: newId,
      hierarchyId: '',
      name: name.trim(),
      description,
      level: inferredLevel,
      parentId: parentId || null,
      processType,
      status,
      ownerId,
      assetCount: 0,
      childCount: 0,
      predecessorIds,
      successorIds,
      children: [],
    }

    const predId = predecessorIds[0] ?? null
    const succId = successorIds[0] ?? null

    if (predId) {
      const found = findNode(roots, predId)
      if (found) found.siblings.splice(found.index + 1, 0, newNode)
      else roots.push(newNode)
    } else if (succId) {
      const found = findNode(roots, succId)
      if (found) found.siblings.splice(found.index, 0, newNode)
      else roots.push(newNode)
    } else if (parentId) {
      const found = findNode(roots, parentId)
      if (found) found.node.children.push(newNode)
      else roots.push(newNode)
    } else {
      roots.push(newNode)
    }

    for (const childId of childIds) {
      const found = findNode(roots, childId)
      if (found) {
        found.siblings.splice(found.index, 1)
        newNode.children.push(found.node)
      }
    }

    saveStructure(hierarchyId, flattenTree(renumberTree(roots)))
    onClose()
  }

  const formContent = (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', paddingBottom: '60px' }}>
      <AttrRow label="Description">
        <TextArea
          value={description}
          onInput={(e: any) => setDescription(e.target.value)}
          rows={3}
          style={{ width: '100%' }}
        />
      </AttrRow>

      <AttrRow label="Process Type">
        <ComboBox
          filter="Contains"
          value={processType}
          onSelectionChange={(e: any) => {
            const text = e.detail?.item?.text ?? ''
            if (['Operating', 'Management', 'Support'].includes(text)) {
              setProcessType(text as ProcessElement['processType'])
            }
          }}
          style={{ width: '100%' }}
        >
          {(['Operating', 'Management', 'Support'] as const).map(t => (
            <ComboBoxItem key={t} text={t} />
          ))}
        </ComboBox>
      </AttrRow>

      <AttrRow label="Status">
        <ComboBox
          filter="Contains"
          value={status}
          onSelectionChange={(e: any) => {
            const text = e.detail?.item?.text ?? ''
            if (['Draft', 'In Review', 'Active', 'Deprecated'].includes(text)) {
              setStatus(text as ProcessStatus)
            }
          }}
          style={{ width: '100%' }}
        >
          {(['Draft', 'In Review', 'Active', 'Deprecated'] as const).map(s => (
            <ComboBoxItem key={s} text={s} />
          ))}
        </ComboBox>
      </AttrRow>

      <AttrRow label="Owner">
        <ComboBox
          filter="Contains"
          value={USERS.find(u => u.id === ownerId)?.name ?? ''}
          onSelectionChange={(e: any) => {
            const text = e.detail?.item?.text ?? ''
            setOwnerId(USERS.find(u => u.name === text)?.id ?? '')
          }}
          onInput={(e: any) => {
            if (!(e.target as any).value) setOwnerId('')
          }}
          style={{ width: '100%' }}
        >
          {USERS.map(u => (
            <ComboBoxItem key={u.id} text={u.name} />
          ))}
        </ComboBox>
      </AttrRow>

      <HierarchyGroupHeader />

      <AttrRow label="Parent">
        <ComboBox
          filter="Contains"
          value={parentEl ? elementText(parentEl) : ''}
          onSelectionChange={(e: any) => {
            const text = e.detail?.item?.text ?? ''
            setParentId(elements.find(el => elementText(el) === text)?.id ?? '')
          }}
          onInput={(e: any) => {
            if (!(e.target as any).value) setParentId('')
          }}
          style={{ width: '100%' }}
        >
          {elements.map(el => (
            <ComboBoxItem key={el.id} text={elementText(el)} />
          ))}
        </ComboBox>
      </AttrRow>

      <AttrRow label="Predecessors">
        <MultiComboBox style={{ width: '100%' }} onSelectionChange={handleMultiChange(setPredecessorIds)}>
          {elements.map(el => (
            <MultiComboBoxItem key={el.id} text={el.name} selected={predecessorIds.includes(el.id)} />
          ))}
        </MultiComboBox>
      </AttrRow>

      <AttrRow label="Successors">
        <MultiComboBox style={{ width: '100%' }} onSelectionChange={handleMultiChange(setSuccessorIds)}>
          {elements.map(el => (
            <MultiComboBoxItem key={el.id} text={el.name} selected={successorIds.includes(el.id)} />
          ))}
        </MultiComboBox>
      </AttrRow>

      <AttrRow label="Children">
        <MultiComboBox style={{ width: '100%' }} onSelectionChange={handleMultiChange(setChildIds)}>
          {elements.map(el => (
            <MultiComboBoxItem key={el.id} text={el.name} selected={childIds.includes(el.id)} />
          ))}
        </MultiComboBox>
      </AttrRow>
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SigRightSidePanel
        headerTitle={name}
        editable
        editableTitlePlaceholder="Element name"
        onEditableTitleChange={(value: string) => setName(value)}
        navigationSlot={[
          () => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SigDomainObject size="XXS" object={'Process Model' as never} />
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
                {levelNames[inferredLevel]}
              </Text>
            </div>
          )
        ]}
        isOpen={true}
        toggleRightSidePanel={onClose}
        style={{
          width: '100%', maxWidth: 'none', height: '100%',
          overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative',
        }}
        tabSlot={[
          <Tab text="Attributes" key="attributes">
            {formContent}
          </Tab>,
        ]}
      >
        {''}
      </SigRightSidePanel>
      <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" disabled={!name.trim()} onClick={handleCreate}>
            Create
          </Button>
          <Button slot="endContent" onClick={onClose}>
            Discard
          </Button>
        </Bar>
      </div>
    </div>
  )
}

export default function ProcessLandscapeDetailPanel({ hierarchyId, elementId, onClose, mode = 'view', initialPredecessorIds, initialSuccessorIds, initialParentId }: Props) {
  const { getElements } = useProcessLandscape()
  const { levelNames, userContextValues } = useWorkspace()

  const [bpmnModalOpen, setBpmnModalOpen] = useState(false)

  const handleThumbnailClick = useCallback(() => setBpmnModalOpen(true), [])

  if (mode === 'create') {
    return <CreateElementForm
      hierarchyId={hierarchyId}
      onClose={onClose}
      initialPredecessorIds={initialPredecessorIds}
      initialSuccessorIds={initialSuccessorIds}
      initialParentId={initialParentId}
    />
  }

  const rawElements = getElements(hierarchyId)
  const resolved = resolveElements(rawElements, userContextValues)
  const elements = resolved.map(r => r.element)
  const element = elementId ? getElementById(elements, elementId) : null

  if (!element) return null

  const owner = USERS.find(u => u.id === element.ownerId)
  const parent = element.parentId ? getElementById(elements, element.parentId) : null
  const children = getChildren(elements, elementId!)
  const predecessors = (element.predecessorIds ?? [])
    .map(id => getElementById(elements, id))
    .filter(Boolean) as ProcessElement[]
  const successors = (element.successorIds ?? [])
    .map(id => getElementById(elements, id))
    .filter(Boolean) as ProcessElement[]

  const levelName = levelNames[element.level as 1 | 2 | 3 | 4 | 5]

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
  const l1IndicationNum = l1ColorIdx >= 0 ? LINE_COLOR_INDICES[l1ColorIdx % LINE_COLOR_INDICES.length] : undefined
  const l1Design = l1IndicationNum ? (`indication${l1IndicationNum}` as 'indication1') : undefined

  const attributesContent = (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
      <AttrRow label="Description">
        <Text style={{ lineHeight: '1.5', wordBreak: 'break-word' }}>
          {element.description || '—'}
        </Text>
      </AttrRow>

      <AttrRow label="Status">
        <div><SigChipV2 value={element.status} /></div>
      </AttrRow>

      <AttrRow label="Process Type">
        <div><SigChipV2 value={element.processType} /></div>
      </AttrRow>

      <AttrRow label="Owner">
        {owner ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Avatar initials={owner.initials} colorScheme={owner.colorScheme as 'Accent1'} size="XS" />
            <div>
              <Text style={{ display: 'block', fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>
                {owner.name}
              </Text>
              <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                {owner.email}
              </Text>
            </div>
          </div>
        ) : (
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>
        )}
      </AttrRow>

      <AttrRow label="Level">
        <div><SigChipV2 value={`L${element.level} · ${levelName}`} /></div>
      </AttrRow>

      <AttrRow label="Linked Assets">
        <Text>{element.assetCount}</Text>
      </AttrRow>

      <HierarchyGroupHeader />

      <AttrRow label="Parent">
        {parent
          ? <div><SigChipV2 value={parent.name} /></div>
          : <Text style={{ color: 'var(--sapContent_LabelColor)' }}>—</Text>}
      </AttrRow>

      {children.length > 0 && (
        <AttrRow label={`Children (${children.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {children.slice(0, 5).map(child => (
              <div key={child.id}><SigChipV2 value={child.name} /></div>
            ))}
            {children.length > 5 && (
              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                +{children.length - 5} more
              </Text>
            )}
          </div>
        </AttrRow>
      )}

      {predecessors.length > 0 && (
        <AttrRow label={`Predecessors (${predecessors.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {predecessors.map(p => (
              <div key={p.id}><SigChipV2 value={p.name} /></div>
            ))}
          </div>
        </AttrRow>
      )}

      {successors.length > 0 && (
        <AttrRow label={`Successors (${successors.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {successors.map(s => (
              <div key={s.id}><SigChipV2 value={s.name} /></div>
            ))}
          </div>
        </AttrRow>
      )}
    </div>
  )

  const bpmnXml = element.level === 3 ? getBpmnModel(element.id) : undefined

  if (bpmnXml) {
    return (
      <>
        <AssetInfoPanel
        selectedAsset={processElementToFileItem(element)}
        selectedDictEntry={null}
        selectedDictCategory={null}
        dictCategories={[]}
        externalSelectedAsset={null}
        pageTitle="Process Landscape"
        selectionCount={1}
        zoomViewport={null}
        subscriptions={{}}
        onSubscriptionChange={() => {}}
        onThumbnailEnter={() => {}}
        onThumbnailLeave={() => {}}
        onThumbnailMove={() => {}}
        onThumbnailClick={handleThumbnailClick}
        onClose={onClose}
        onOpenModelDetail={() => {}}
        bpmnXml={bpmnXml}
        hideRevisionInfo
      />
      <BpmnPreviewDialog
        open={bpmnModalOpen}
        onClose={() => setBpmnModalOpen(false)}
        title={element.name}
        bpmnXml={bpmnXml}
      />
      </>
    )
  }

  return (
    <SigRightSidePanel
      headerTitle={element.name}
      subHeaderSlot={
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', padding: '0 0 4px' }}>
          <SigChipV2 condensed value={element.hierarchyId} />
          {l1Ancestor && element.level > 1 && (
            <SigChipV2 condensed value={l1Ancestor.name} design={l1Design} />
          )}
        </div>
      }
      navigationSlot={[
        () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SigDomainObject size="XXS" object={'Process Model' as never} />
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
              {levelName}
            </Text>
          </div>
        )
      ]}
      isOpen={true}
      toggleRightSidePanel={onClose}
      style={{
        width: '100%', maxWidth: 'none', height: '100%',
        overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative',
      }}
      tabSlot={[
        <Tab text="Attributes" key="attributes">
          {attributesContent}
        </Tab>,
        <Tab text="Activity" key="activity">
          <ActivityFeed assetType="Process Model" assetName={element.name} />
        </Tab>,
      ]}
    >
      {''}
    </SigRightSidePanel>
  )
}
