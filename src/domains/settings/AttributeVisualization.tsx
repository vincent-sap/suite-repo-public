import { Fragment, useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'
import type { InputDomRef } from '@ui5/webcomponents-react'
import {
  Button, Icon, Select, Option, Input, Text, Title, Popover,
  RadioButton, MessageStrip, Dialog, Bar, Menu, MenuItem,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell, Label,
  ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode,
  VariantManagement, VariantItem,
} from '@ui5/webcomponents-react'
import { getIconData } from '@ui5/webcomponents-base/dist/asset-registries/Icons.js'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

const PROPERTIES = [
  'Critical Application', 'Priority', 'Status', 'accountable',
  'APQC Metric', 'APQC Metrics', 'Business Requirements', 'SAP Executable',
  'KPI Definition', 'linkedGlossary', 'Owner', 'Process owner',
  'Related SAP S/4HANA Best Practices', 'informed', 'consulted',
]

const RELATIONS = ['is', 'is not', 'is empty', 'is not empty']

const VALUE_OPTIONS: Record<string, string[]> = {
  Status: ['Design Phase', 'Build Phase', 'Test Phase', 'Go Live', 'Retired'],
  Priority: ['High', 'Medium', 'Low'],
  'Critical Application': ['Yes', 'No'],
  'KPI Definition': ['Yes', 'No'],
  'SAP Executable': ['Yes', 'No'],
}

const PALETTE_COLORS = [
  '#d27700', '#aa0808', '#ba066c', '#a100c2', '#5d36ff',
  '#0057d2', '#046c7a', '#256f3a', '#6c32a9', '#5b738b',
  '#fff3b8', '#ffd0e7', '#ffdbe7', '#ffdcf3', '#ded3ff',
  '#d1efff', '#c2fcee', '#ebf5cb', '#ddccf0', '#eaecee',
  '#000000', '#404040', '#808080', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff',
  '#cc0000', '#e65c00', '#e6b800', '#5cb85c', '#00b3b3', '#0066cc', '#6600cc', '#cc0099',
  '#ff3333', '#ff8533', '#ffd633', '#85e085', '#33cccc', '#3385ff', '#8533ff', '#ff33cc',
  '#ff9999', '#ffcc99', '#fff0b3', '#ccffcc', '#99ffff', '#99ccff', '#cc99ff', '#ffb3ec',
  '#800000', '#804000', '#806600', '#336633', '#004d4d', '#003380', '#330080', '#660033',
  '#4d0000', '#4d2600', '#4d3d00', '#1a331a', '#001a1a', '#001a4d', '#1a004d', '#33001a',
  '#ff6600', '#ffcc00', '#99cc00', '#009999', '#0066ff', '#9900cc', '#ff0066', '#ff6699',
  '#ff9966', '#ffdd66', '#bbdd66', '#66ccbb', '#66aaff', '#cc66ff', '#ff6688', '#ffbbcc',
]

const ICON_OPTIONS: { name: string; label: string }[] = [
  { name: 'lead', label: 'lead' },
  { name: 'person-placeholder', label: 'person placeholder' },
  { name: 'action-settings', label: 'action settings' },
  { name: 'SAP-icons-v4/flash', label: 'flash' },
  { name: 'away', label: 'away' },
  { name: 'performance', label: 'performance' },
  { name: 'document', label: 'document' },
  { name: 'high-priority', label: 'high priority' },
  { name: 'sys-monitor', label: 'sys monitor' },
  { name: 'email', label: 'email' },
  { name: 'activity-items', label: 'activity items' },
  { name: 'sys-enter', label: 'sys enter' },
  { name: 'sys-cancel', label: 'sys cancel' },
  { name: 'circle-task', label: 'circle task' },
  { name: 'text', label: 'text' },
]

type Condition = { id: string; property: string; relation: string; value: string }
type Rule = { id: string; name: string; color: string; icon: string; showIcon: boolean; showValue: boolean; logic: 'and' | 'or'; conditions: Condition[] }
type Layer = {
  id: string; active: boolean; name: string; rules: Rule[]
}

const INITIAL_LAYERS: Layer[] = [
  { id: '1', active: true, name: 'KPI Definition', rules: [{ id: 'r1', name: '', color: '#009900', icon: 'performance', showIcon: true, showValue: false, logic: 'and', conditions: [{ id: 'c1', property: 'KPI Definition', relation: 'is', value: 'Yes' }] }] },
  { id: '2', active: true, name: 'Requirements fulfilled', rules: [{ id: 'r2', name: '', color: '#99CC00', icon: 'sys-enter', showIcon: true, showValue: false, logic: 'and', conditions: [{ id: 'c2', property: 'Status', relation: 'is', value: 'Build Phase' }] }] },
  { id: '3', active: true, name: 'Requirements open', rules: [{ id: 'r3', name: '', color: '#CCCC00', icon: 'circle-task', showIcon: true, showValue: false, logic: 'and', conditions: [{ id: 'c3', property: 'Status', relation: 'is', value: 'Design Phase' }] }] },
  { id: '4', active: true, name: 'Is critical component', rules: [{ id: 'r4', name: '', color: '#FF9933', icon: 'high-priority', showIcon: true, showValue: false, logic: 'and', conditions: [{ id: 'c4', property: 'Critical Application', relation: 'is', value: 'Yes' }] }] },
  { id: '5', active: true, name: 'SAP Transactions', rules: [{ id: 'r5', name: '', color: '#0066FF', icon: 'sys-monitor', showIcon: true, showValue: true, logic: 'and', conditions: [{ id: 'c5', property: 'SAP Executable', relation: 'is', value: 'Yes' }] }] },
]

const AUDIENCES = ['General audience', 'Administrators', 'Acme Italy', 'Acme France']

type OverlayVis = 'visible-active' | 'visible' | 'hidden'
type IconPathData = { pathData: string | string[]; viewBox: string }

function makeColoredIconUrl(iconPathData: IconPathData | null, bgColor: string, iconColor: string): string {
  const validHex = (c: string) => /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#888888'
  const bg = validHex(bgColor)
  const fg = validHex(iconColor)
  const fallback = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" fill="${bg}" rx="3"/></svg>`)}`
  if (!iconPathData) return fallback
  try {
    const vb = iconPathData.viewBox.replace(/[^0-9 .]/g, '')
    const paths = (Array.isArray(iconPathData.pathData) ? iconPathData.pathData : [iconPathData.pathData])
      .map((p: string) => `<path d="${p.replace(/"/g, '')}" fill="${fg}"/>`)
      .join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">` +
      `<rect width="24" height="24" fill="${bg}" rx="3"/>` +
      `<svg x="4" y="4" width="16" height="16" viewBox="${vb}">${paths}</svg>` +
      `</svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  } catch { /* fall through */ }
  return fallback
}

function isLightColor(hex: string): boolean {
  const h = hex.startsWith('#') ? hex.slice(1) : hex
  if (h.length < 6) return true
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return L > 0.30
}

const border = 'var(--sapList_BorderColor)'

const makeInitialLayerVis = () =>
  Object.fromEntries(INITIAL_LAYERS.map(l => [l.id, Object.fromEntries(AUDIENCES.map(a => [a, 'visible-active' as OverlayVis]))]))

interface OverlayTabPanelHandle { reset: () => void; save: () => void }

const OverlayTabPanel = forwardRef<OverlayTabPanelHandle, { idPrefix: string; onDirtyChange: (dirty: boolean) => void }>(
  function OverlayTabPanel({ idPrefix, onDirtyChange }, ref) {
    const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
    const [openColorPicker, setOpenColorPicker] = useState<string | null>(null)
    const [colorHex, setColorHex] = useState('')
    const [lastValidHex, setLastValidHex] = useState('')
    const [hexBlurred, setHexBlurred] = useState(false)
    const hexInputRef = useRef<InputDomRef>(null)
    useEffect(() => {
      if (openColorPicker) setTimeout(() => hexInputRef.current?.focus(), 0)
    }, [openColorPicker])
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [renameLayerId, setRenameLayerId] = useState<string | null>(null)
    const [renameName, setRenameName] = useState('')
    const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null)
    const [iconSearch, setIconSearch] = useState('')
    const [, setIconPathData] = useState<Record<string, IconPathData | null>>({})
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [collapsedRules, setCollapsedRules] = useState<Record<string, boolean>>({})
    const toggleRuleCollapse = (ruleId: string) => setCollapsedRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }))
    const [renameRuleDialogOpen, setRenameRuleDialogOpen] = useState(false)
    const [renameRuleId, setRenameRuleId] = useState<string | null>(null)
    const [renameRuleName, setRenameRuleName] = useState('')
    const [layerVis, setLayerVis] = useState<Record<string, Record<string, OverlayVis>>>(makeInitialLayerVis)
    const [selectedCfgLayerId, setSelectedCfgLayerId] = useState<string | null>(INITIAL_LAYERS[0].id)
    const [showMatrix, setShowMatrix] = useState(false)
    const [layerVisSnapshot, setLayerVisSnapshot] = useState<Record<string, Record<string, OverlayVis>> | null>(null)
    const [newOverlayDialogOpen, setNewOverlayDialogOpen] = useState(false)
    const [newOverlayName, setNewOverlayName] = useState('')

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

    const markDirty = () => onDirtyChange(true)

    useImperativeHandle(ref, () => ({
      save: () => onDirtyChange(false),
      reset: () => {
        setLayers(INITIAL_LAYERS)
        setLayerVis(makeInitialLayerVis())
        setSelectedCfgLayerId(INITIAL_LAYERS[0].id)
        onDirtyChange(false)
      },
    }))

    const openMatrix = () => { setLayerVisSnapshot(JSON.parse(JSON.stringify(layerVis))); setShowMatrix(true) }
    const cancelMatrix = () => { if (layerVisSnapshot) setLayerVis(layerVisSnapshot); setShowMatrix(false) }
    const saveMatrix = () => { markDirty(); setShowMatrix(false) }
    const matrixHasChanges = layerVisSnapshot !== null && JSON.stringify(layerVis) !== JSON.stringify(layerVisSnapshot)

    const selectedCfgLayerData = layers.find(l => l.id === selectedCfgLayerId) ?? null

    useEffect(() => {
      if (!selectedCfgLayerData) return
      selectedCfgLayerData.rules.forEach(rule => {
        if (!rule.showIcon || !rule.icon) return
        getIconData(rule.icon).then(data => {
          if (data && typeof data === 'object' && 'pathData' in data && data.pathData) {
            setIconPathData(prev => ({ ...prev, [rule.id]: { pathData: data.pathData!, viewBox: data.viewBox ?? '0 0 16 16' } }))
          }
        })
      })
    }, [selectedCfgLayerData?.id, JSON.stringify(selectedCfgLayerData?.rules.map(r => ({ id: r.id, icon: r.icon, showIcon: r.showIcon })))])

    const toggleActive = (layerId: string) => {
      setLayers(prev => prev.map(l => l.id === layerId ? { ...l, active: !l.active } : l))
      markDirty()
    }

    const deleteLayer = (layerId: string) => {
      setLayers(prev => prev.filter(l => l.id !== layerId))
      setSelectedCfgLayerId(null)
      setConfirmDeleteOpen(false)
      markDirty()
    }

    const updateRule = (layerId: string, ruleId: string, updates: { color?: string; icon?: string; showIcon?: boolean; showValue?: boolean; logic?: 'and' | 'or' }) => {
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: l.rules.map(r => r.id !== ruleId ? r : { ...r, ...updates }),
      }))
      markDirty()
    }

    const addRule = (layerId: string) => {
      const ruleId = Date.now().toString()
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: [...l.rules, { id: ruleId, name: '', color: '#0066FF', icon: 'pie-chart', showIcon: true, showValue: false, logic: 'and' as const, conditions: [{ id: ruleId + '-c0', property: PROPERTIES[0], relation: 'is', value: '' }] }],
      }))
      markDirty()
    }

    const deleteRule = (layerId: string, ruleId: string) => {
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: l.rules.filter(r => r.id !== ruleId),
      }))
      markDirty()
    }

    const updateCondition = (layerId: string, ruleId: string, condId: string, updates: Partial<Condition>) => {
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: l.rules.map(r => r.id !== ruleId ? r : {
          ...r, conditions: r.conditions.map(c => c.id !== condId ? c : { ...c, ...updates }),
        }),
      }))
      markDirty()
    }

    const addCondition = (layerId: string, ruleId: string) => {
      const condId = Date.now().toString() + '-cond'
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: l.rules.map(r => r.id !== ruleId ? r : {
          ...r, conditions: [...r.conditions, { id: condId, property: PROPERTIES[0], relation: 'is', value: '' }],
        }),
      }))
      markDirty()
    }

    const deleteCondition = (layerId: string, ruleId: string, condId: string) => {
      setLayers(prev => prev.map(l => l.id !== layerId ? l : {
        ...l, rules: l.rules.map(r => r.id !== ruleId ? r : {
          ...r, conditions: r.conditions.filter(c => c.id !== condId),
        }),
      }))
      markDirty()
    }

    const setLayerVisibility = (layerId: string, audience: string, v: OverlayVis) => {
      setLayerVis(prev => ({ ...prev, [layerId]: { ...prev[layerId], [audience]: v } }))
      markDirty()
    }

    const addLayerCfg = (name: string) => {
      const newId = Date.now().toString()
      setLayers(prev => [...prev, { id: newId, active: true, name, icon: 'pie-chart', showIcon: true, showValue: false, valueLabel: '', rules: [] }])
      setLayerVis(prev => ({ ...prev, [newId]: Object.fromEntries(AUDIENCES.map(a => [a, 'visible-active' as OverlayVis])) }))
      setSelectedCfgLayerId(newId)
    }

    const p = idPrefix

    return (
      <>
        <div ref={layoutRef} style={{ paddingBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>

          {/* ── Left: overlay list — hidden on narrow viewports */}
          {!isNarrow && (
          <div style={{ width: '20rem', flexShrink: 0, borderRadius: 'var(--sapElement_BorderCornerRadius)', display: 'flex', flexDirection: 'column', background: 'white', position: 'sticky', top: 0, maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto' }}>
            <div style={{ padding: '0.625rem 0.75rem 0.625rem 1rem', borderBottom: `1px solid ${border}`, background: 'var(--sapList_HeaderBackground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Title level="H5" style={{ flex: 1 } as React.CSSProperties}>Attribute Overlays</Title>
              <Button
                design="Emphasized"
                onClick={() => { setNewOverlayName(''); setNewOverlayDialogOpen(true) }}
              >
                Create
              </Button>
            </div>

            <div role="listbox" aria-label="Overlays" style={{ flex: 1, overflowY: 'auto' }}>
              {layers.map(layer => {
                const isSelected = selectedCfgLayerId === layer.id
                return (
                  <div
                    key={layer.id}
                    role="option"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => setSelectedCfgLayerId(layer.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCfgLayerId(layer.id) } }}
                    style={{
                      padding: '0.5rem 0.25rem 0.5rem 0.875rem',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: isSelected ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent',
                      borderBottom: `1px solid ${border}`,
                      borderLeft: isSelected ? '3px solid var(--sapSelectedColor)' : '3px solid transparent',
                      opacity: layer.active ? 1 : 0.55,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontWeight: isSelected ? '600' : '400', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: layer.name ? 'normal' : 'italic', color: layer.name ? undefined : 'var(--sapContent_LabelColor)' }}>
                        {layer.name || 'New overlay'}
                      </Text>
                    </div>
                    <Button
                      id={`${p}-layer-menu-${layer.id}`}
                      icon="overflow"
                      design="Transparent"
                      accessibleName={`Options for ${layer.name || 'overlay'}`}
                      style={{ opacity: 1, '--ui5-button-base-padding': '0 4px' } as React.CSSProperties}
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === layer.id ? null : layer.id) }}
                    />
                    <Menu
                      opener={`${p}-layer-menu-${layer.id}`}
                      open={openMenu === layer.id}
                      onClose={() => setOpenMenu(null)}
                      onItemClick={(e: any) => {
                        const text = e.detail?.item?.text
                        setOpenMenu(null)
                        if (text === 'Rename') { setRenameLayerId(layer.id); setRenameName(layer.name); setRenameDialogOpen(true) }
                        else if (text === 'Enable' || text === 'Disable') toggleActive(layer.id)
                        else if (text === 'Delete') { setSelectedCfgLayerId(layer.id); setConfirmDeleteOpen(true) }
                      }}
                    >
                      <MenuItem text="Rename" />
                      <MenuItem text={layer.active ? 'Disable' : 'Enable'} />
                      <MenuItem text="Delete" />
                    </Menu>
                  </div>
                )
              })}
            </div>

            {/* Footer: Visibility Settings */}
            <div style={{ borderTop: `1px solid ${border}`, padding: '0.5rem 1rem', background: 'var(--sapList_HeaderBackground)', display: 'flex', alignItems: 'center' }}>
              <Button design="Transparent" onClick={openMatrix}>Manage Visibility</Button>
            </div>
          </div>
          )}

          {/* ── Right: detail panel */}
          {selectedCfgLayerData ? (
            <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>
              <div style={{ padding: '0.625rem 0.75rem 0.625rem 1rem', background: 'var(--sapList_HeaderBackground)', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  {isNarrow ? (
                    <VariantManagement
                      closeOnItemSelect
                      hideSaveAs
                      hideManageVariants
                      level="H5"
                      size="H5"
                      titleText="Attribute Overlays"
                      onSelect={(e: any) => {
                        const key = (e.detail.selectedVariant as any).children as string
                        const found = layers.find(l => (l.name || 'New overlay') === key)
                        if (found) setSelectedCfgLayerId(found.id)
                      }}
                    >
                      {layers.map(l => (
                        <VariantItem key={l.id} selected={l.id === selectedCfgLayerId} labelReadOnly hideDelete readOnly>
                          {l.name || 'New overlay'}
                        </VariantItem>
                      ))}
                    </VariantManagement>
                  ) : (
                    <Title level="H5" style={{ fontStyle: selectedCfgLayerData.name ? 'normal' : 'italic' }}>
                      {selectedCfgLayerData.name || 'New overlay'}
                    </Title>
                  )}
                  {!selectedCfgLayerData.active && <SigChipV2 value="Disabled" design="indication2" condensed />}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isNarrow && (
                      <Button
                        design="Emphasized"
                        onClick={() => setNewOverlayDialogOpen(true)}
                      >Create</Button>
                    )}
                    <Button
                      design="Transparent"
                      onClick={() => toggleActive(selectedCfgLayerData.id)}
                    >{selectedCfgLayerData.active ? 'Disable' : 'Enable'}</Button>
                    <Button
                      id={`${p}-right-panel-overflow-btn`}
                      icon="overflow"
                      design="Transparent"
                      accessibleName={`Options for ${selectedCfgLayerData.name || 'overlay'}`}
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === `${p}-right-panel-overflow` ? null : `${p}-right-panel-overflow`) }}
                    />
                    <Menu
                      opener={`${p}-right-panel-overflow-btn`}
                      open={openMenu === `${p}-right-panel-overflow`}
                      onClose={() => setOpenMenu(null)}
                      onItemClick={(e: any) => {
                        const text = e.detail?.item?.text
                        setOpenMenu(null)
                        if (text === 'Rename') { setRenameLayerId(selectedCfgLayerData.id); setRenameName(selectedCfgLayerData.name); setRenameDialogOpen(true) }
                        else if (text === 'Delete') setConfirmDeleteOpen(true)
                      }}
                    >
                      <MenuItem text="Rename" />
                      <MenuItem text="Delete" />
                    </Menu>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 1rem 24px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* ── Appearance */}
              <div>
                <div style={{ marginBottom: '24px' }} />
                <Title level="H5" style={{ marginBottom: '0.25rem' }}>Appearance</Title>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '1rem' }}>
                  The icon and visual indicator apply to all rules in this overlay.
                </Text>
                {(() => {
                  const firstRule = selectedCfgLayerData.rules[0]
                  if (!firstRule) return null
                  const layerIconBtnId = `${p}-layer-icon-btn-${selectedCfgLayerData.id}`
                  const visMode = firstRule.showIcon && !firstRule.showValue ? 'icon' : firstRule.showIcon && firstRule.showValue ? 'both' : 'value'
                  const visLabel = visMode === 'icon' ? 'Colored Icon' : visMode === 'both' ? 'Icon & Attribute Value' : 'Attribute Value'
                  const visIcon = visMode === 'icon' ? 'paint-bucket' : visMode === 'both' ? 'text' : 'letter'
                  const visBtnId = `${p}-vis-btn-layer-${selectedCfgLayerData.id}`
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                      {/* Visual indicator */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label>Visual indicator</Label>
                        <SigChipV2
                          id={visBtnId}
                          leadingIcon={visIcon}
                          value={visLabel}
                          trailingIcon="slim-arrow-down"
                          onClick={() => setOpenMenu(openMenu === visBtnId ? null : visBtnId)}
                        />
                        <Menu
                          opener={visBtnId}
                          open={openMenu === visBtnId}
                          onClose={() => setOpenMenu(null)}
                          onItemClick={(e: any) => {
                            const text = e.detail?.item?.text
                            setOpenMenu(null)
                            updateRule(selectedCfgLayerData.id, firstRule.id, {
                              showIcon: text !== 'Attribute Value',
                              showValue: text !== 'Colored Icon',
                            })
                          }}
                        >
                          <MenuItem text="Colored Icon" />
                          <MenuItem text="Icon & Attribute Value" />
                          <MenuItem text="Attribute Value" />
                        </Menu>
                      </div>

                      {/* Icon */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Label>Icon</Label>
                        <SigChipV2
                          id={layerIconBtnId}
                          leadingIcon={firstRule.icon}
                          value={ICON_OPTIONS.find(o => o.name === firstRule.icon)?.label ?? firstRule.icon}
                          trailingIcon="slim-arrow-down"
                          onClick={() => { setIconPickerOpen(iconPickerOpen === layerIconBtnId ? null : layerIconBtnId); setIconSearch('') }}
                        />
                        <Popover open={iconPickerOpen === layerIconBtnId} opener={layerIconBtnId} placement="Bottom" onClose={() => setIconPickerOpen(null)}>
                          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Input accessibleName="Search icons" placeholder="Search icons" value={iconSearch} style={{ width: '100%' }} onInput={e => setIconSearch((e.target as unknown as HTMLInputElement).value)} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 2rem)', gap: '0.125rem' }}>
                              {ICON_OPTIONS.filter(o => !iconSearch.trim() || o.label.includes(iconSearch.toLowerCase()) || o.name.includes(iconSearch.toLowerCase())).map(o => (
                                <Button key={o.name} icon={o.name} tooltip={o.label} design="Transparent"
                                  style={{ width: '2rem', height: '2rem', minWidth: 0, padding: 0, color: 'var(--sapTextColor)', border: firstRule.icon === o.name ? '2px solid var(--sapSelectedColor)' : 'none', borderRadius: '4px' } as React.CSSProperties}
                                  onClick={() => { updateRule(selectedCfgLayerData.id, firstRule.id, { icon: o.name }); setIconPickerOpen(null) }} />
                              ))}
                            </div>
                          </div>
                        </Popover>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* ── Rules */}
              <div>
                <div style={{ borderTop: `1px solid ${border}`, marginBottom: '24px' }} />
                <Title level="H5" style={{ marginBottom: '0.25rem' }}>Rules</Title>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '1rem' }}>
                  This overlay appears on diagram elements when at least one rule matches. Each rule defines how the overlay looks and when it appears.
                </Text>

                {selectedCfgLayerData.rules.length === 0 ? (
                  <MessageStrip design="Information" hideCloseButton style={{ marginBottom: '0.75rem' }}>
                    No rules defined. Add a rule to control when this overlay appears.
                  </MessageStrip>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    {selectedCfgLayerData.rules.map((rule, ruleIdx) => {
                      return (
                        <div key={rule.id} style={{ border: `1px solid ${border}`, borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>

                          {/* Rule header */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--sapList_HeaderBackground)', borderBottom: collapsedRules[rule.id] ? 'none' : `1px solid ${border}`, cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => toggleRuleCollapse(rule.id)}
                          >
                            <Icon name={collapsedRules[rule.id] ? 'navigation-right-arrow' : 'navigation-down-arrow'} style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, marginRight: '0.5rem' }} />
                            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', flex: 1 }}>
                              {rule.name || `Rule ${ruleIdx + 1}`}
                            </Text>
                            <Button
                              id={`${p}-rule-menu-btn-${rule.id}`}
                              icon="overflow"
                              design="Transparent"
                              tooltip="More Actions"
                              style={{ '--ui5-button-base-padding': '0 4px' } as React.CSSProperties}
                              onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === `rule-${rule.id}` ? null : `rule-${rule.id}`) }}
                            />
                            <Menu
                              opener={`${p}-rule-menu-btn-${rule.id}`}
                              open={openMenu === `rule-${rule.id}`}
                              onClose={() => setOpenMenu(null)}
                              onItemClick={(e: any) => {
                                const text = e.detail?.item?.text
                                setOpenMenu(null)
                                if (text === 'Rename') {
                                  setRenameRuleId(rule.id)
                                  setRenameRuleName(rule.name || `Rule ${ruleIdx + 1}`)
                                  setRenameRuleDialogOpen(true)
                                } else if (text === 'Duplicate') {
                                  const newId = Date.now().toString()
                                  const sourceName = rule.name || `Rule ${ruleIdx + 1}`
                                  setLayers(prev => prev.map(l => l.id !== selectedCfgLayerData.id ? l : {
                                    ...l, rules: [...l.rules, { ...rule, id: newId, name: `${sourceName} (copy)`, conditions: rule.conditions.map(c => ({ ...c, id: c.id + '-dup' })) }]
                                  }))
                                  markDirty()
                                } else if (text === 'Delete') {
                                  deleteRule(selectedCfgLayerData.id, rule.id)
                                }
                              }}
                            >
                              <MenuItem text="Rename" />
                              <MenuItem text="Copy" />
                              <MenuItem text="Delete" />
                            </Menu>
                          </div>

                          {/* Collapsible content */}
                          {!collapsedRules[rule.id] && <div style={{ display: 'flex', alignItems: 'flex-start' }}>

                          {/* Conditions */}
                          <div style={{ flex: 1, background: 'white', minWidth: 0, borderRight: `1px solid ${border}` }}>
                            <div style={{ padding: '8px 0.75rem 0 16px' }}>
                              <Text style={{ fontSize: '14px', fontWeight: '600' }}>Conditions</Text>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '8px 0.75rem 0 16px' }}>
                              <div style={{ flex: 2, minWidth: '10rem' }}><Label>Property</Label></div>
                              <div style={{ width: '8rem', flexShrink: 0 }}><Label>Relation</Label></div>
                              <div style={{ flex: 1, minWidth: '8rem' }}><Label>Value</Label></div>
                              <div style={{ width: '2rem', flexShrink: 0 }} />
                            </div>
                            {rule.conditions.map((cond) => {
                              const valueOptions = VALUE_OPTIONS[cond.property] ?? []
                              const needsValue = (cond.relation === 'is' || cond.relation === 'is not') && !cond.value.trim()
                              return (
                                <Fragment key={cond.id}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem 0.5rem 16px', flexWrap: 'wrap' }}>
                                    <Select accessibleName="Condition property" style={{ flex: 2, minWidth: '10rem' }} onChange={e => updateCondition(selectedCfgLayerData.id, rule.id, cond.id, { property: (e.detail.selectedOption as HTMLElement).textContent ?? cond.property })}>
                                      {PROPERTIES.map(p2 => <Option key={p2} selected={p2 === cond.property}>{p2}</Option>)}
                                    </Select>
                                    <Select accessibleName="Condition relation" style={{ width: '8rem', flexShrink: 0 }} onChange={e => updateCondition(selectedCfgLayerData.id, rule.id, cond.id, { relation: (e.detail.selectedOption as HTMLElement).textContent ?? cond.relation })}>
                                      {RELATIONS.map(r => <Option key={r} selected={r === cond.relation}>{r}</Option>)}
                                    </Select>
                                    {cond.relation !== 'is empty' && cond.relation !== 'is not empty' && (
                                      valueOptions.length > 0 ? (
                                        <Select accessibleName="Condition value" style={{ flex: 1, minWidth: '8rem' }} onChange={e => updateCondition(selectedCfgLayerData.id, rule.id, cond.id, { value: (e.detail.selectedOption as HTMLElement).textContent ?? cond.value })}>
                                          {valueOptions.map(v => <Option key={v} selected={v === cond.value}>{v}</Option>)}
                                        </Select>
                                      ) : (
                                        <Input
                                          accessibleName="Condition value"
                                          value={cond.value}
                                          valueState={needsValue ? 'Critical' : 'None'}
                                          placeholder="Value"
                                          style={{ flex: 1, minWidth: '8rem' }}
                                          onInput={e => updateCondition(selectedCfgLayerData.id, rule.id, cond.id, { value: (e.target as unknown as HTMLInputElement).value })}
                                        >
                                          <div slot="valueStateMessage">Enter a value for this condition.</div>
                                        </Input>
                                      )
                                    )}
                                    <Button icon="delete" design="Transparent" tooltip="Delete Condition" style={{ flexShrink: 0, width: '2rem' }} onClick={() => deleteCondition(selectedCfgLayerData.id, rule.id, cond.id)} />
                                  </div>
                                </Fragment>
                              )
                            })}
                            <div style={{ padding: '0.5rem 0.75rem' }}>
                              <Button design="Transparent" icon="add" onClick={() => addCondition(selectedCfgLayerData.id, rule.id)}>Add Condition</Button>
                            </div>
                          </div>

                          {/* Style */}
                          {(() => {
                            const pickerKey = `cfg-${selectedCfgLayerData.id}-${rule.id}`
                            const colorBtnId = `${p}-color-btn-cfg-${selectedCfgLayerData.id}-${rule.id}`
                            const ruleIconColor = isLightColor(rule.color) ? '#000000' : '#ffffff'
                            return (
                              <div style={{ background: 'var(--sapList_Background)', borderRight: `1px solid ${border}`, flexShrink: 0, alignSelf: 'stretch' }}>
                                <div style={{ padding: '8px 0.75rem 0 16px' }}>
                                  <Text style={{ fontSize: '14px', fontWeight: '600' }}>Style</Text>
                                </div>
                                <div style={{ padding: '8px 0.75rem 0 16px' }}>
                                  <Label>Color</Label>
                                </div>
                                <div style={{ padding: '0.25rem 0.75rem 0.5rem 16px' }}>
                                  <SigChipV2
                                    id={colorBtnId}
                                    trailingIcon="slim-arrow-down"
                                    avatarImageUrl={makeColoredIconUrl(null, rule.color, ruleIconColor)}
                                    value=""
                                    tooltip="Choose Color"
                                    onClick={() => { setOpenColorPicker(openColorPicker === pickerKey ? null : pickerKey); const h = rule.color.replace('#', ''); setColorHex(h); setLastValidHex(h); setHexBlurred(false) }}
                                  />
                                  <Popover opener={colorBtnId} open={openColorPicker === pickerKey} onClose={() => { setOpenColorPicker(null); setHexBlurred(false) }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      <Title level="H6" style={{ fontSize: 'var(--sapFontSize)', fontWeight: 600, marginBottom: '0.25rem' }}>Color</Title>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1.375rem)', gap: '0.2rem' }}>
                                        {PALETTE_COLORS.map(c => (
                                          <Button key={c} design="Transparent" tooltip={c.toUpperCase()} aria-label={c.toUpperCase()}
                                            style={{ width: '1.375rem', height: '1.375rem', background: c, padding: 0, border: c.toLowerCase() === rule.color.toLowerCase() ? '2px solid var(--sapSelectedColor)' : '1px solid rgba(0,0,0,0.18)', borderRadius: '3px', boxShadow: c.toLowerCase() === rule.color.toLowerCase() ? '0 0 0 1px var(--sapSelectedColor)' : 'none', minWidth: 'unset', '--ui5-button-base-background': c, '--ui5-button-hover-background': c } as React.CSSProperties}
                                            onClick={() => { updateRule(selectedCfgLayerData.id, rule.id, { color: c }); setColorHex(c.replace('#', '')); setLastValidHex(c.replace('#', '')); setHexBlurred(false); setOpenColorPicker(null) }}
                                          />
                                        ))}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>#</Text>
                                        {(() => { const hexValid = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(colorHex); return (<>
                                        <div onBlur={() => setHexBlurred(true)}>
                                        <Input ref={hexInputRef} accessibleName="Hex color value" value={colorHex} maxlength={6} valueState={hexBlurred && !hexValid && colorHex !== '' ? 'Negative' : 'None'} style={{ width: '5rem' }} onInput={e => { const v = (e.target as unknown as HTMLInputElement).value; setColorHex(v); if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(v)) setLastValidHex(v) }} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && hexValid) { updateRule(selectedCfgLayerData.id, rule.id, { color: '#' + colorHex }); setOpenColorPicker(null) } }}>
                                          {hexBlurred && !hexValid && colorHex !== '' && <div slot="valueStateMessage">Select a color or enter a valid hex color.</div>}
                                        </Input>
                                        </div>
                                        <div style={{ width: '1.375rem', height: '1.375rem', flexShrink: 0, borderRadius: '3px', border: '1px solid rgba(0,0,0,0.18)', background: lastValidHex ? '#' + lastValidHex : 'transparent' }} />
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
                                          <Button design="Transparent" disabled={!hexValid} onClick={() => { updateRule(selectedCfgLayerData.id, rule.id, { color: '#' + colorHex }); setOpenColorPicker(null) }}>Apply Color</Button>
                                        </div>
                                        </>)})()}
                                      </div>
                                    </div>
                                  </Popover>
                                </div>
                              </div>
                            )
                          })()}

                          {/* Preview */}
                          {(() => {
                            const globalRule = selectedCfgLayerData.rules[0]
                            const previewColor = rule.color
                            const previewIconColor = isLightColor(previewColor) ? '#000000' : '#ffffff'
                            const showIcon = globalRule?.showIcon ?? true
                            const showValue = globalRule?.showValue ?? false
                            const iconName = globalRule?.icon ?? 'circle-task'
                            return (
                              <div style={{ borderLeft: `1px solid ${border}`, flexShrink: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', padding: '8px 0.75rem 0.5rem 0.75rem', gap: '0.25rem' }}>
                                <Text style={{ fontSize: '14px', fontWeight: '600' }}>Preview</Text>
                                <div aria-hidden="true" style={{ paddingTop: '0.5rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                                    {(showIcon || showValue) && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: previewColor, borderRadius: '4px', width: showIcon && !showValue ? '20px' : 'auto', height: '20px', padding: showValue ? '0 6px' : '0', justifyContent: 'center', flexShrink: 0 }}>
                                        {showIcon && <Icon name={iconName} style={{ fontSize: '12px', width: '12px', height: '12px', color: previewIconColor, pointerEvents: 'none' }} />}
                                        {showValue && <Text style={{ fontSize: '10px', fontWeight: '600', color: previewIconColor, fontFamily: "var(--sapFontFamily, '72', sans-serif)", whiteSpace: 'nowrap', lineHeight: '1' }}>{rule.conditions[0]?.value || 'Value'}</Text>}
                                      </div>
                                    )}
                                    <div style={{ width: '64px', height: '48px', border: '1.5px solid #1a1a1a', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Text style={{ fontSize: '11px', color: '#131e29', fontFamily: "var(--sapFontFamily, '72', sans-serif)" }}>Task</Text>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}

                          </div>}
                        </div>
                      )
                    })}
                  </div>
                )}

                <Button design="Default" icon="add" onClick={() => addRule(selectedCfgLayerData.id)}>Add Rule</Button>
              </div>

              {/* ── Visibility per Audience */}
              <div>
                <div style={{ borderTop: `1px solid ${border}`, marginBottom: '24px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                  <Title level="H5">Visibility per Audience</Title>
                  <Button design="Transparent" onClick={openMatrix} style={{ marginLeft: 'auto' } as React.CSSProperties}>Manage Visibility</Button>
                </div>
                <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '1rem' }}>
                  Set the default visibility of this overlay for each audience. Users with edit access can always show or hide enabled overlays independently in the model editor.
                </Text>
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    headerRow={
                      <TableHeaderRow>
                        <TableHeaderCell>Audience</TableHeaderCell>
                        <TableHeaderCell>
                          <div title="Shown by default in the model editor." style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'default' }}>
                            <Icon name="accept" />
                            <Text style={{ fontWeight: '600' }}>Enabled and Active</Text>
                          </div>
                        </TableHeaderCell>
                        <TableHeaderCell>
                          <div title="Available but hidden by default." style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'default' }}>
                            <Icon name="show" />
                            <Text style={{ fontWeight: '600' }}>Enabled</Text>
                          </div>
                        </TableHeaderCell>
                        <TableHeaderCell>
                          <div title="Not available to this audience." style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'default' }}>
                            <Icon name="hide" />
                            <Text style={{ fontWeight: '600' }}>Disabled</Text>
                          </div>
                        </TableHeaderCell>
                      </TableHeaderRow>
                    }
                  >
                    {AUDIENCES.map(audience => {
                      const currentVis = layerVis[selectedCfgLayerData.id]?.[audience] ?? 'visible-active'
                      return (
                        <TableRow key={audience}>
                          <TableCell><Text>{audience}</Text></TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <RadioButton accessibleName={`${audience}: Enabled and Active`} name={`${p}-vis-${selectedCfgLayerData.id}-${audience}`} checked={currentVis === 'visible-active'} onChange={() => setLayerVisibility(selectedCfgLayerData.id, audience, 'visible-active')} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <RadioButton accessibleName={`${audience}: Enabled`} name={`${p}-vis-${selectedCfgLayerData.id}-${audience}`} checked={currentVis === 'visible'} onChange={() => setLayerVisibility(selectedCfgLayerData.id, audience, 'visible')} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <RadioButton accessibleName={`${audience}: Disabled`} name={`${p}-vis-${selectedCfgLayerData.id}-${audience}`} checked={currentVis === 'hidden'} onChange={() => setLayerVisibility(selectedCfgLayerData.id, audience, 'hidden')} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </Table>
                </div>
              </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Select an overlay from the list to configure it</Text>
            </div>
          )}

        </div>

        {/* ── Visibility Matrix dialog */}
        <Dialog
          open={showMatrix}
          headerText="Manage Visibility"
          className="dialog-padding-s"
          style={{ width: 'fit-content', maxWidth: '90vw', maxHeight: '80vh' } as React.CSSProperties}
          onClose={cancelMatrix}
        >
          <div style={{ padding: '1rem' }}>
            <MessageStrip design="Information" hideCloseButton style={{ marginBottom: '1rem' } as React.CSSProperties}>
              Set default visibility for all overlays and audience groups in one view.
            </MessageStrip>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Overlay</TableHeaderCell>
                  {AUDIENCES.map(a => <TableHeaderCell key={a}>{a}</TableHeaderCell>)}
                </TableHeaderRow>
              }
            >
              {layers.map(layer => (
                <TableRow key={layer.id}>
                  <TableCell style={{ padding: '0.4rem 0.5rem' } as React.CSSProperties}>
                    <Text style={{ fontStyle: layer.name ? 'normal' : 'italic', color: layer.name ? undefined : 'var(--sapContent_LabelColor)', opacity: layer.active ? 1 : 0.55 }}>
                      {layer.name || 'New overlay'}
                    </Text>
                  </TableCell>
                  {AUDIENCES.map(audience => {
                    const vis = layerVis[layer.id]?.[audience] ?? 'visible-active'
                    return (
                      <TableCell key={audience} style={{ padding: '0.4rem calc(0.5rem + 2.5px)' } as React.CSSProperties}>
                        <Select
                          accessibleName={`Visibility for ${layer.name || 'overlay'} - ${audience}`}
                          style={{ width: 'auto' } as React.CSSProperties}
                          onChange={e => {
                            const val = (e.detail.selectedOption as HTMLElement).dataset.value ?? ''
                            const v: OverlayVis = val === 'visible-active' ? 'visible-active' : val === 'visible' ? 'visible' : 'hidden'
                            setLayerVisibility(layer.id, audience, v)
                          }}
                        >
                          <Option icon="accept" data-value="visible-active" selected={vis === 'visible-active'}>Enabled and Active</Option>
                          <Option icon="show" data-value="visible" selected={vis === 'visible'}>Enabled</Option>
                          <Option icon="hide" data-value="hidden" selected={vis === 'hidden'}>Disabled</Option>
                        </Select>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </Table>
          </div>
          <Bar slot="footer" design="Footer">
            <Button slot="endContent" design="Emphasized" onClick={saveMatrix} disabled={!matrixHasChanges}>Save</Button>
            <Button slot="endContent" design="Transparent" onClick={cancelMatrix}>Cancel</Button>
          </Bar>
        </Dialog>
        <Dialog
          open={newOverlayDialogOpen}
          headerText="Create Overlay"
          onClose={() => setNewOverlayDialogOpen(false)}
        >
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '22rem' }}>
            <Label required for={`${p}-new-overlay-name`}>Name</Label>
            <Input
              id={`${p}-new-overlay-name`}
              value={newOverlayName}
              placeholder="Overlay name"
              style={{ width: '100%' }}
              onInput={e => setNewOverlayName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <Bar slot="footer" design="Footer">
            <Button slot="endContent" design="Emphasized" disabled={!newOverlayName.trim()} onClick={() => {
              addLayerCfg(newOverlayName.trim())
              markDirty()
              setNewOverlayDialogOpen(false)
            }}>Create</Button>
            <Button slot="endContent" design="Transparent" onClick={() => setNewOverlayDialogOpen(false)}>Cancel</Button>
          </Bar>
        </Dialog>

        {/* ── Rename Overlay dialog */}
        <Dialog
          open={renameDialogOpen}
          headerText="Rename Overlay"
          onClose={() => setRenameDialogOpen(false)}
        >
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '22rem' }}>
            <Label required for={`${p}-rename-overlay-name`}>Name</Label>
            <Input
              id={`${p}-rename-overlay-name`}
              value={renameName}
              placeholder="Overlay name"
              style={{ width: '100%' }}
              onInput={e => setRenameName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <Bar slot="footer" design="Footer">
            <Button slot="endContent" design="Emphasized" disabled={!renameName.trim()} onClick={() => {
              if (!renameLayerId || !renameName.trim()) return
              setLayers(prev => prev.map(l => l.id === renameLayerId ? { ...l, name: renameName.trim() } : l))
              markDirty()
              setRenameDialogOpen(false)
            }}>Rename</Button>
            <Button slot="endContent" design="Transparent" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          </Bar>
        </Dialog>

        {/* ── Rename Rule dialog */}
        <Dialog
          open={renameRuleDialogOpen}
          headerText="Rename"
          onClose={() => setRenameRuleDialogOpen(false)}
        >
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '22rem' }}>
            <Label required for={`${p}-rename-rule-name`}>Name</Label>
            <Input
              id={`${p}-rename-rule-name`}
              value={renameRuleName}
              placeholder="Rule name"
              style={{ width: '100%' }}
              onInput={e => setRenameRuleName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <Bar slot="footer" design="Footer">
            <Button slot="endContent" design="Emphasized" disabled={!renameRuleName.trim()} onClick={() => {
              if (!renameRuleId) return
              setLayers(prev => prev.map(l => l.id !== selectedCfgLayerData?.id ? l : {
                ...l, rules: l.rules.map(r => r.id === renameRuleId ? { ...r, name: renameRuleName.trim() } : r)
              }))
              markDirty()
              setRenameRuleDialogOpen(false)
            }}>Rename</Button>
            <Button slot="endContent" design="Transparent" onClick={() => setRenameRuleDialogOpen(false)}>Cancel</Button>
          </Bar>
        </Dialog>

        {/* ── Delete confirmation dialog */}
        {selectedCfgLayerData && (
          <Dialog
            open={confirmDeleteOpen}
            headerText="Delete Overlay"
            onClose={() => setConfirmDeleteOpen(false)}
          >
            <div style={{ padding: '1rem' }}>
              <p style={{ margin: 0, fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                Delete <strong>"{selectedCfgLayerData.name}"</strong>? This overlay and all its rules will be permanently removed and can no longer be used on diagrams.
              </p>
            </div>
            <Bar slot="footer" design="Footer">
              <Button slot="endContent" design="Negative" onClick={() => deleteLayer(selectedCfgLayerData.id)}>Delete</Button>
              <Button slot="endContent" design="Transparent" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            </Bar>
          </Dialog>
        )}
      </>
    )
  }
)

export default function AttributeVisualization() {
  const [pmDirty, setPmDirty] = useState(false)
  const pmRef = useRef<OverlayTabPanelHandle>(null)

  return (
    <ObjectPage
      style={{ height: '100%' } as React.CSSProperties}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      selectedSectionId="pm-legacy"
      titleArea={
        <ObjectPageTitle
          header="Attribute Overlays"
          subHeader="Define how attribute data is visually displayed on diagram elements."
        />
      }
      footerArea={pmDirty ? (
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" onClick={() => { pmRef.current?.save() }}>Save</Button>
          <Button slot="endContent" onClick={() => { pmRef.current?.reset() }}>Discard Changes</Button>
        </Bar>
      ) : undefined}
    >
      <ObjectPageSection id="pm-legacy" titleText="Process Manager (legacy)" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the legacy Process Manager only</strong>. It has no effect on the new Modeler.
          </MessageStrip>
        </div>
        <OverlayTabPanel ref={pmRef} idPrefix="pm" onDirtyChange={setPmDirty} />
      </ObjectPageSection>
    </ObjectPage>
  )
}
