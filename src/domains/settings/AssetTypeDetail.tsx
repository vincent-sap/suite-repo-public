import { useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DynamicPage, DynamicPageTitle,
  ObjectPage, ObjectPageTitle, ObjectPageSection,
  Title, Breadcrumbs, BreadcrumbsItem,
  Text, Button, MessageStrip,
  List, ListItemStandard,
  Bar, Toast,
  VariantManagement, VariantItem,
} from '@ui5/webcomponents-react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import AudienceSectionBar from './components/AudienceSectionBar'

const NOTATION_IDS = new Set(['bpmn', 'dmn', 'value-chain', 'nav-map'])
const NOTATION_ASSET_TYPES = ASSET_TYPES.filter(t => NOTATION_IDS.has(t.id))
const NON_NOTATION_ASSET_TYPES = ASSET_TYPES.filter(t => !NOTATION_IDS.has(t.id))
const NO_AUDIENCE_IDS = new Set(['objective', 'initiative', 'insight', 'dashboard', 'process-semantic-view'])
import AttributeEditorPanel, { makeInitialGroups, makeModelingGroups, type AttrGroup, AUDIENCES } from './components/AttributeEditorPanel'

import { ASSET_TYPES, SUB_ELEMENTS } from '../../data/assetTypes'

const ASSET_TYPE_ICON: Record<string, string> = {
  'bpmn':        'SAP-icons-v4/process-manager',
  'dmn':         'SAP-icons-v4/diagram-dmn',
  'value-chain': 'SAP-icons-v4/process-map',
  'nav-map':     'SAP-icons-v4/navigation-map',
}

// Generate varied initial groups per sidebar item so each item has independent, distinct defaults
function makeItemGroups(itemId: string, notation: boolean): AttrGroup[] {
  if (itemId === 'model') return notation ? makeModelingGroups() : makeInitialGroups()

  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as const]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))

  type Attr = AttrGroup['attrs'][number]
  const std = (id: string, name: string, type: string, description: string, extra?: Partial<Attr>): Attr =>
    ({ id, name, type, description, attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14', ...extra })
  const custom = (id: string, name: string, type: string, description: string, extra?: Partial<Attr>): Attr =>
    ({ id, name, type, description, attrClass: 'Custom', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Tom Becker', lastEditedAt: 'Jun 1, 2025, 09:02', ...extra })

  type GroupDef = { main: Attr[]; custom: Attr[] }

  const elementGroups: Record<string, GroupDef> = {
    default: {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The display name of the element.', { required: true }),
        std('desc', 'Description', 'Multi-Line Text', 'A free-text description of the element.'),
      ],
      custom: [
        custom('documentation', 'Documentation', 'Multi-Line Text', 'Technical documentation for this element.', { visibility: { ...vis, Viewer: 'Invisible' as const } }),
      ],
    },
    'seq-flow': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The label shown on the sequence flow.'),
      ],
      custom: [
        custom('condition', 'Condition', 'Multi-Line Text', 'The condition expression that determines when this flow is taken.'),
      ],
    },
    'msg-flow': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The label shown on the message flow.'),
      ],
      custom: [
        custom('message', 'Message', 'Single-Line Text', 'The message identifier exchanged on this flow.'),
      ],
    },
    'gateway': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The display name of the gateway.'),
      ],
      custom: [
        custom('type', 'Gateway Type', 'Selection', 'The type of gateway logic: XOR, OR, or AND.'),
      ],
    },
    'pool': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The name of the participant or lane.', { required: true }),
      ],
      custom: [
        custom('org-unit', 'Org Unit', 'Model Link', 'The organisational unit linked to this pool.'),
      ],
    },
    'decision': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The display name of the decision.', { required: true }),
        std('desc', 'Description', 'Multi-Line Text', 'A free-text description of the decision.'),
      ],
      custom: [
        custom('type', 'Decision Type', 'Selection', 'The type of decision logic applied.'),
        custom('owner', 'Owner', 'Single-Line Text', 'The person or team responsible for this decision.'),
      ],
    },
    'connection': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The label shown on the connection.'),
        std('desc', 'Description', 'Multi-Line Text', 'A free-text description of the connection.'),
      ],
      custom: [
        custom('weight', 'Weight', 'Number', 'The relative weighting of this connection.', { enabled: false }),
      ],
    },
    'link': {
      main: [
        std('name', 'Name', 'Single-Line Text', 'The label shown on the link.'),
        std('desc', 'Description', 'Multi-Line Text', 'A free-text description of the link.'),
      ],
      custom: [
        custom('url', 'Target URL', 'Single-Line Text', 'The target URL this link points to.'),
      ],
    },
    'info-req':      { main: [std('name', 'Name', 'Single-Line Text', 'The label shown on the information requirement.')], custom: [] },
    'knowledge-req': { main: [std('name', 'Name', 'Single-Line Text', 'The label shown on the knowledge requirement.')], custom: [] },
  }

  const groups = elementGroups[itemId] ?? elementGroups['default']
  const result: AttrGroup[] = [
    { id: 'main', name: 'Main Attributes', enabled: { ...grpEnabled }, expanded: true, attrs: groups.main },
  ]
  if (groups.custom.length > 0) {
    result.push({ id: 'custom1', name: 'New Attribute Group', enabled: { ...grpEnabled }, expanded: true, attrs: groups.custom })
  }
  return result
}

export default function AssetTypeDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { dictCategories } = useWorkspace()

  const assetType = ASSET_TYPES.find(t => t.id === id)

  const [attrGroupsMap, setAttrGroupsMap] = useState<Record<string, AttrGroup[]>>({})
  const [selectedSubEl, setSelectedSubEl] = useState<string | null>(null)
  const [viewingAttrGroupsState, setViewingAttrGroupsState] = useState<AttrGroup[] | null>(null)
  const [viewingAudience, setViewingAudience] = useState<string>('General audience')
  const [dirty, setDirty] = useState(false)
  const [saveToast, setSaveToast] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const roRef = useRef<ResizeObserver | null>(null)
  const layoutRef = useCallback((el: HTMLDivElement | null) => {
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setIsNarrow(prev => prev ? w < 740 : w < 700)
    })
    ro.observe(el)
    roRef.current = ro
  }, [])

  const markDirty = () => { if (!dirty) setDirty(true) }
  const handleSave = () => { setDirty(false); setSaveToast(true) }
  const handleReset = () => setDirty(false)

  const currentKey = selectedSubEl ?? 'model'
  const currentAttrGroups = attrGroupsMap[currentKey] ?? makeItemGroups(currentKey, !!assetType?.notation)
  const setCurrentAttrGroups = useCallback((updater: React.SetStateAction<AttrGroup[]>) => {
    setAttrGroupsMap(prev => {
      const current = prev[currentKey] ?? makeItemGroups(currentKey, !!assetType?.notation)
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [currentKey]: next }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey])

  if (!assetType) {
    return (
      <div style={{ padding: '2rem' }}>
        <Text>Asset type not found</Text>
        <Button design="Transparent" onClick={() => navigate('/settings/asset-types')}>Back to Asset Types</Button>
      </div>
    )
  }

  const subElements = SUB_ELEMENTS[id] ?? []
  const subGroups = [...new Set(subElements.map(e => e.group))]
  const selectedSubElName = subElements.find(e => e.id === selectedSubEl)?.name
  const selectedItemName = selectedSubEl === null ? 'Model' : (selectedSubElName ?? assetType.name)

  // Track which attr IDs appear in model-level vs element-level groups
  const modelOrigins = new Set<string>()
  const elementOrigins = new Set<string>();
  (() => {
    const modelGroups = attrGroupsMap['model'] ?? makeItemGroups('model', !!assetType?.notation)
    modelGroups.forEach(g => g.attrs.forEach(a => modelOrigins.add(a.id)))
    subElements.forEach(el => {
      const elGroups = attrGroupsMap[el.id] ?? makeItemGroups(el.id, !!assetType?.notation)
      elGroups.forEach(g => g.attrs.forEach(a => elementOrigins.add(a.id)))
    })
  })()

  // Deduplicated attr groups for Viewing tab — all element types merged into one "Ungrouped Attributes" group
  const viewingAttrGroups: AttrGroup[] = viewingAttrGroupsState ?? (() => {
    const allKeys = ['model', ...subElements.map(e => e.id)]
    const seen = new Set<string>()
    const allAttrs: AttrGroup['attrs'] = []
    allKeys.forEach(key => {
      const groups = attrGroupsMap[key] ?? makeItemGroups(key, !!assetType?.notation)
      groups.forEach(g => g.attrs.forEach(attr => {
        if (!seen.has(attr.id)) {
          seen.add(attr.id)
          allAttrs.push(attr)
        }
      }))
    })
    const grpEnabled = Object.fromEntries(['Everyone', 'Modeler', 'Viewer', 'Process Owner'].map(a => [a, true]))
    return [
      { id: 'main', name: 'Ungrouped Attributes', enabled: { ...grpEnabled }, expanded: true, attrs: allAttrs },
    ]
  })()

  const makePageContent = (hideVisibilityColumnsOverride?: boolean, hideGroupingOverride?: boolean, contentKey?: string, viewingModeOverride?: boolean) => (
    <div ref={layoutRef} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      {/* Left panel — sub-elements (notation types only, hidden on narrow viewports, hidden in viewing mode) */}
      {assetType.notation && !isNarrow && !viewingModeOverride && (
        <div style={{
          width: '240px',
          flexShrink: 0,
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          background: 'var(--sapList_Background)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          maxHeight: 'calc(100vh - 10rem)',
        }}>
          <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapTextColor)', userSelect: 'none' as const, fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>
            Asset
          </div>
          <List onItemClick={e => {
            const itemId = (e.detail.item as HTMLElement).id
            if (itemId === 'model') setSelectedSubEl(null)
          }}>
            <ListItemStandard id="model" icon={ASSET_TYPE_ICON[id] ?? 'product'} selected={selectedSubEl === null}>
              Model
            </ListItemStandard>
          </List>
          <div style={{ padding: '0.5rem 1rem 0.25rem', marginTop: '0.75rem', fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapTextColor)', userSelect: 'none' as const, fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>
            Elements
          </div>
          <List onItemClick={e => {
            const itemId = (e.detail.item as HTMLElement).id
            if (itemId.startsWith('sub-')) setSelectedSubEl(itemId.replace('sub-', ''))
          }}>
            {subGroups.map(group => (
              [
                <div key={`${group}-header`} style={{ padding: '0.5rem 1rem 0.25rem', marginTop: '0.5rem', fontSize: 'var(--sapFontSmallSize)', fontWeight: 600, color: 'var(--sapContent_LabelColor)', userSelect: 'none' as const, letterSpacing: '0.04em', fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>
                  {group}
                </div>,
                    ...subElements.filter(e => e.group === group).map(el => (
                      <ListItemStandard key={el.id} id={`sub-${el.id}`} icon={el.icon} selected={selectedSubEl === el.id}>
                        {el.name}
                      </ListItemStandard>
                    ))
                  ]
                ))}
              </List>
            </div>
          )}

          {/* Right panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {viewingModeOverride && (
              <AudienceSectionBar
                value={viewingAudience}
                onChange={setViewingAudience}
                subtitle="Visibility settings apply to the selected audience only. Attribute grouping applies to all audiences."
              />
            )}
            <AttributeEditorPanel
              key={contentKey}
              attrGroups={viewingModeOverride ? viewingAttrGroups : currentAttrGroups}
              setAttrGroups={viewingModeOverride ? ((updater: React.SetStateAction<AttrGroup[]>) => {
                setViewingAttrGroupsState(prev => {
                  const base = prev ?? viewingAttrGroups
                  return typeof updater === 'function' ? updater(base) : updater
                })
              }) : setCurrentAttrGroups}
              markDirty={markDirty}
              hideAudience={NO_AUDIENCE_IDS.has(id)}
              hideVisibilityColumns={hideVisibilityColumnsOverride}
              hideGrouping={hideGroupingOverride}
              viewingMode={viewingModeOverride}
              modelOrigins={viewingModeOverride ? modelOrigins : undefined}
              elementOrigins={viewingModeOverride ? elementOrigins : undefined}
              viewingAudience={viewingModeOverride ? viewingAudience : undefined}
              title={assetType.notation && !isNarrow && !viewingModeOverride ? selectedItemName : undefined}
              titleNode={assetType.notation && isNarrow && !viewingModeOverride ? (
                <VariantManagement
                  closeOnItemSelect
                  hideSaveAs
                  hideManageVariants
                  titleText="Asset Elements"
                  onSelect={e => {
                    const key = (e.detail.selectedVariant as any).children as string
                    if (key === 'Model') {
                      setSelectedSubEl(null)
                    } else {
                      const el = subElements.find(se => se.name === key)
                      if (el) setSelectedSubEl(el.id)
                    }
                  }}
                >
                  <VariantItem selected={selectedSubEl === null} isDefault labelReadOnly hideDelete readOnly>Model</VariantItem>
                  {subElements.map(el => (
                    <VariantItem key={el.id} selected={selectedSubEl === el.id} labelReadOnly hideDelete readOnly>{el.name}</VariantItem>
                  ))}
                </VariantManagement>
              ) : undefined}
              hideAssignSection={false}
              defaultAssignedTo={assetType.notation ? [assetType.name] : [assetType.name]}
              assignableAssetTypes={assetType.notation ? [
                ...NOTATION_ASSET_TYPES,
                ...dictCategories.map(c => ({ id: c.id, name: c.name })),
              ] : NON_NOTATION_ASSET_TYPES}
              modelingMode={assetType.notation}
              modelLevelMode={selectedSubEl === null}
              dictCategories={assetType.notation ? dictCategories : undefined}
              modelingSubElements={assetType.notation ? Object.values(SUB_ELEMENTS).flat().filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i) : undefined}
              inlinePadding={isNarrow ? '1rem' : undefined}
            />
          </div>
        </div>
  )

  const breadcrumbs = (
    <Breadcrumbs slot="breadcrumbs">
      <BreadcrumbsItem onClick={() => navigate('/settings/users')} style={{ cursor: 'pointer' }}>
        Workspace Settings
      </BreadcrumbsItem>
      <BreadcrumbsItem onClick={() => navigate('/settings/asset-types')} style={{ cursor: 'pointer' }}>
        Asset Types
      </BreadcrumbsItem>
      <BreadcrumbsItem>{assetType.name}</BreadcrumbsItem>
    </Breadcrumbs>
  )

  const footer = (
    <Bar design="FloatingFooter">
      <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
      <Button slot="endContent" onClick={handleReset}>Cancel</Button>
    </Bar>
  )

  if (assetType.notation) {
    return (
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ObjectPage
          mode="IconTabBar"
          hidePinButton
          style={{ height: '100%' }}
          titleArea={
            <ObjectPageTitle
              breadcrumbs={breadcrumbs}
              header={<Title level="H3">{assetType.name}</Title>}
              expandedContent={
                <MessageStrip design="Information" hideCloseButton style={{ marginTop: '0.5rem' }}>
                  In the <strong>Editing</strong> tab, configure attributes at the model and element level. In the <strong>Viewing</strong> tab, manage how attributes are grouped and control their visibility per audience. The settings for viewing aren't applied while modeling.
                </MessageStrip>
              }
              snappedContent={
                <MessageStrip design="Information" hideCloseButton style={{ marginTop: '0.5rem' }}>
                  In the <strong>Editing</strong> tab, configure attributes at the model and element level. In the <strong>Viewing</strong> tab, manage how attributes are grouped and control their visibility per audience. The settings for viewing aren't applied while modeling.
                </MessageStrip>
              }
            />
          }
        >
          <ObjectPageSection id="editing" titleText="Editing">
            {makePageContent(true, true, 'editing')}
          </ObjectPageSection>
          <ObjectPageSection id="viewing" titleText="Viewing">
            {makePageContent(false, false, 'viewing', true)}
          </ObjectPageSection>
        </ObjectPage>
        {dirty && (
          <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem', zIndex: 10 }}>
            {footer}
          </div>
        )}
        <Toast open={saveToast} placement="BottomCenter" onClose={() => setSaveToast(false)}>Changes saved</Toast>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DynamicPage className="body-scroll-dynamic-page" style={{ height: '100%' }} hidePinButton showFooter={dirty} titleArea={
        <DynamicPageTitle>
          {breadcrumbs}
          <Title slot="heading" level="H3">{assetType.name}</Title>
        </DynamicPageTitle>
      }
        footerArea={footer}
      >
        {makePageContent()}
      </DynamicPage>
      <Toast open={saveToast} placement="BottomCenter" onClose={() => setSaveToast(false)}>Changes saved</Toast>
    </div>
  )
}
