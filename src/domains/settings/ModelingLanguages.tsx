import { useState, useRef, useCallback, useEffect } from 'react'
import { Button, CheckBox, Text, Title, Menu, MenuItem, Icon, Dialog, Input, Label, Toast, MessageStrip, Panel, ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode, Bar, VariantManagement, VariantItem, ListItemGroup } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { clone, ITEM_ICONS, BASE_GROUPS, INITIAL_LANG_GROUPS, type Language, type LangGroup } from '../../data/modelingLanguages'
import EditAppearanceDialog from '../modeler/EditAppearanceDialog'

type Tool = 'pm-legacy' | 'modeler'

type AppearanceState = 'default' | 'style-updated' | 'custom-graphics' | 'both'

const ItemIcon = ({ id, size = 20 }: { id: string; size?: number }) => {
  const iconName = ITEM_ICONS[id]
  if (!iconName) return null
  if (iconName.startsWith('<')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none"
        style={{ color: 'var(--sapContent_IconColor)' }}
        dangerouslySetInnerHTML={{ __html: iconName }} />
    )
  }
  return <Icon name={iconName} style={{ width: `${size}px`, height: `${size}px`, color: 'var(--sapContent_IconColor)' }} />
}

const StateChip = ({ state }: { state: AppearanceState }) => {
  if (state === 'default') return null
  const tooltip =
    state === 'both' ? 'Style updated · Custom graphics' :
    state === 'style-updated' ? 'Style updated' :
    'Custom graphics'
  return (
    <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
      <SigChipV2 value="Modified" design="indication10" condensed tooltip={tooltip} />
    </div>
  )
}

const countEnabled = (lang: Language) => lang.groups.reduce((s, g) => s + g.items.filter(i => i.enabled).length, 0)
const countTotal = (lang: Language) => lang.groups.reduce((s, g) => s + g.items.length, 0)

export default function ModelingLanguages() {
  const [tool, setTool] = useState<Tool>('modeler')
  const [langGroups, setLangGroups] = useState<LangGroup[]>(INITIAL_LANG_GROUPS)
  const [selectedId, setSelectedId] = useState('bpmn-basic')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [rightView, setRightView] = useState<'elements' | 'appearance'>('elements')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [addElementSetGroupId, setAddElementSetGroupId] = useState<string | null>(null)
  const [newElementSetName, setNewElementSetName] = useState('')
  const [elementSetToast, setElementSetToast] = useState(false)
  const [groupDisabledToast, setGroupDisabledToast] = useState<string | null>(null)
  const [duplicateLang, setDuplicateLang] = useState<Language | null>(null)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateToast, setDuplicateToast] = useState(false)
  const [enabledToast, setEnabledToast] = useState<string | null>(null)
  const [renameLang, setRenameLang] = useState<Language | null>(null)
  const [renameName, setRenameName] = useState('')
  const [renamedToast, setRenamedToast] = useState(false)
  const [deleteLang, setDeleteLang] = useState<Language | null>(null)
  const [deletedToast, setDeletedToast] = useState<string | null>(null)
  const [itemStates, setItemStates] = useState<Record<string, AppearanceState>>({
    'task': 'style-updated',
    'exclusive-xor-gateway': 'style-updated',
    'inclusive-gateway': 'custom-graphics',
    'parallel-gateway': 'style-updated',
    'collapsed-subprocess': 'both',
    'event-based-gateway': 'both',
  })

  const [isNarrow, setIsNarrow] = useState(false)
  const [elementSearch, setElementSearch] = useState('')

  useEffect(() => {
    if (!elementSearch) return
    setLangGroups(prev => prev.map(g => ({
      ...g,
      languages: g.languages.map(l => {
        if (l.id !== selectedId) return l
        return {
          ...l,
          groups: l.groups.map(gr => {
            const hasMatch = gr.items.some(i => i.label.toLowerCase().includes(elementSearch.toLowerCase()))
            return hasMatch ? { ...gr, expanded: true } : gr
          })
        }
      })
    })))
  }, [elementSearch, selectedId])

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

  const savedLangGroupsRef = useRef<LangGroup[]>(clone(INITIAL_LANG_GROUPS))
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const selectLang = (id: string) => {
    setSelectedId(id)
    setSelectedGroupId(null)
    setSelectedElementId(null)
    setRightView('elements')
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0
  }

  const selectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setRightView('appearance')
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0
  }

  const allLangs = langGroups.flatMap(g => g.languages)
  const selected = allLangs.find(l => l.id === selectedId)!
  const selectedGroup = langGroups.find(g => g.id === selectedGroupId) ?? langGroups.find(g => g.languages.some(l => l.id === selectedId))!

  const updateLang = (langId: string, fn: (l: Language) => Language) =>
    setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.map(l => l.id === langId ? fn(l) : l) })))

  const toggleLangGroupExpand = (groupId: string) =>
    setLangGroups(prev => prev.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g))

  const toggleLangActive = (langId: string) => {
    updateLang(langId, l => ({ ...l, active: !l.active }))
    setIsDirty(true)
  }

  const toggleGroupExpand = (langId: string, groupId: string) =>
    updateLang(langId, l => ({ ...l, groups: l.groups.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g) }))

  const toggleGroupAll = (langId: string, groupId: string) => {
    const group = allLangs.find(l => l.id === langId)!.groups.find(g => g.id === groupId)!
    const allEnabled = group.items.every(i => i.enabled)
    updateLang(langId, l => ({
      ...l, groups: l.groups.map(g => g.id === groupId
        ? { ...g, items: g.items.map(i => ({ ...i, enabled: !allEnabled })) } : g)
    }))
    setIsDirty(true)
  }

  const toggleItem = (langId: string, groupId: string, itemId: string) => {
    updateLang(langId, l => ({
      ...l, groups: l.groups.map(g => g.id === groupId
        ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, enabled: !i.enabled } : i) } : g)
    }))
    setIsDirty(true)
  }

  const setItemState = (itemId: string, state: AppearanceState) =>
    setItemStates(prev => ({ ...prev, [itemId]: state }))

  const [editAppearanceItem, setEditAppearanceItem] = useState<{ id: string; label: string; initialTab?: string } | null>(null)
  const [itemAppearanceValues, setItemAppearanceValues] = useState<Record<string, { fontSize: number; bold: boolean; italic: boolean; fontColor: string; bgColor: string; borderColor: string }>>({
    'task': { fontSize: 12, bold: false, italic: false, fontColor: '#0070f2', bgColor: '#FFFFFF', borderColor: '#000000' },
    'exclusive-xor-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#fff5f5', borderColor: '#bb0000' },
    'parallel-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#f0fff0', borderColor: '#000000' },
    'collapsed-subprocess': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#f5f0ff', borderColor: '#6600cc' },
    'event-based-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#fff8f0', borderColor: '#000000' },
  })

  const handleSave = () => {
    savedLangGroupsRef.current = clone(langGroups)
    setIsDirty(false)
  }

  const handleReset = () => {
    setLangGroups(clone(savedLangGroupsRef.current))
    setIsDirty(false)
  }

  const BORDER = '1px solid var(--sapList_BorderColor)'

  const body = (
      <div ref={layoutRef} style={{ paddingBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%' }}>

        {/* Left panel — hidden on narrow viewports */}
        {!isNarrow && (
        <div style={{
          width: '26rem',
          flexShrink: 0,
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          background: 'var(--sapList_Background)',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          maxHeight: 'calc(100vh - 10rem)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: BORDER }}>
            <Title level="H5">Modeling Languages</Title>
            <div>
              <Button
                id="wide-create-lang-btn"
                design="Emphasized"
                endIcon="slim-arrow-down"
                onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'wide-create-lang' ? null : 'wide-create-lang') }}
              >Create Subset</Button>
              <Menu
                opener="wide-create-lang-btn"
                open={openMenu === 'wide-create-lang'}
                onClose={() => setOpenMenu(null)}
                onItemClick={(e: any) => {
                  const text = e.detail?.item?.text
                  setOpenMenu(null)
                  const group = langGroups.find(g => g.label === text)
                  if (group) { setAddElementSetGroupId(group.id); setNewElementSetName('') }
                }}
              >
                {langGroups.map(g => <MenuItem key={g.id} text={g.label} />)}
              </Menu>
            </div>
          </div>

          {langGroups.map(group => {
            const allDisabled = group.languages.every(l => !l.active)
            return (
            <div key={group.id}>
              <div
                role="button"
                tabIndex={0}
                className="lang-list-item"
                onClick={() => {
                  selectGroup(group.id)
                }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectGroup(group.id) } }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.25rem 0.5rem 1rem', borderBottom: BORDER, opacity: allDisabled ? 0.4 : 1, cursor: 'pointer', userSelect: 'none', background: (rightView === 'appearance' && selectedGroupId === group.id) ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)' }}
              >
                <Icon
                  name={group.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer', color: 'var(--sapContent_IconColor)', flexShrink: 0 }}
                  onClick={(e: any) => { e.stopPropagation(); toggleLangGroupExpand(group.id) }}
                />
                <Text style={{ flex: 1, fontWeight: '600' }}>{group.label} ({group.languages.length})</Text>
                <Button
                  id={`group-overflow-${group.id}`}
                  icon="overflow"
                  design="Transparent"
                  accessibleName={`Options for ${group.label}`}
                  onClick={(e: any) => { e.stopPropagation(); setOpenMenu(openMenu === `group-overflow-${group.id}` ? null : `group-overflow-${group.id}`) }}
                />
                <Menu
                  opener={`group-overflow-${group.id}`}
                  open={openMenu === `group-overflow-${group.id}`}
                  onClose={() => setOpenMenu(null)}
                  onItemClick={(e: any) => {
                    const text = e.detail?.item?.text
                    setOpenMenu(null)
                    if (text === 'Create Subset') {
                      setAddElementSetGroupId(group.id); setNewElementSetName('')
                    } else if (text === 'Disable Modeling Language') {
                      setLangGroups(prev => prev.map(g => g.id === group.id
                        ? { ...g, languages: g.languages.map(l => ({ ...l, active: false })) } : g))
                      setIsDirty(true)
                      setGroupDisabledToast(group.label)
                    } else if (text === 'Enable Modeling Language') {
                      setLangGroups(prev => prev.map(g => g.id === group.id
                        ? { ...g, languages: g.languages.map(l => ({ ...l, active: true })) } : g))
                      setIsDirty(true)
                    }
                  }}
                >
                  <MenuItem text="Create Subset" />
                  {allDisabled
                    ? <MenuItem text="Enable Modeling Language" />
                    : <MenuItem text="Disable Modeling Language" disabled={allLangs.filter(l => l.active).length === group.languages.filter(l => l.active).length} />
                  }
                </Menu>
              </div>

              {group.expanded && group.languages.map((lang) => (
                <div
                  key={lang.id}
                  role="button"
                  tabIndex={0}
                  className="lang-list-item"
                  onClick={() => selectLang(lang.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectLang(lang.id) } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.25rem 0.5rem 3.5rem',
                    background: (rightView === 'elements' && lang.id === selectedId) ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                    borderBottom: BORDER,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', opacity: lang.active ? 1 : 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Text style={{ display: 'block', fontWeight: (rightView === 'elements' && lang.id === selectedId) ? '600' : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang.label}
                      </Text>
                      {!lang.active && (
                        <Text style={{ display: 'block', fontStyle: 'italic', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', whiteSpace: 'nowrap' }}>
                          Disabled
                        </Text>
                      )}
                    </div>
                    <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                      {lang.variant} · {countEnabled(lang)}/{countTotal(lang)} Elements
                    </Text>
                  </div>
                  <Button
                    id={`lang-overflow-${lang.id}`}
                    icon="overflow"
                    design="Transparent"
                    accessibleName={`Options for ${lang.label}`}
                    style={{ opacity: lang.active ? 1 : 0.4 }}
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === lang.id ? null : lang.id) }}
                  />
                  <Menu
                    opener={`lang-overflow-${lang.id}`}
                    open={openMenu === lang.id}
                    onClose={() => setOpenMenu(null)}
                    onItemClick={(e: any) => {
                      const text = e.detail?.item?.text
                      setOpenMenu(null)
                      if (text === 'Enable') {
                        updateLang(lang.id, l => ({ ...l, active: true }))
                        setIsDirty(true)
                        setEnabledToast(lang.label)
                      } else if (text === 'Disable') {
                        updateLang(lang.id, l => ({ ...l, active: false }))
                        setIsDirty(true)
                        setGroupDisabledToast(lang.label)
                      } else if (text === 'Delete') {
                        setDeleteLang(lang)
                      } else if (text === 'Duplicate') {
                        setDuplicateLang(lang)
                        setDuplicateName(`${lang.label}_copy`)
                      } else if (text === 'Rename') {
                        setRenameLang(lang)
                        setRenameName(lang.label)
                      }
                    }}
                  >
                    {lang.active ? (
                      <>
                        {lang.variant !== 'Default' && <MenuItem text="Rename" />}
                        <MenuItem text="Duplicate" />
                        <MenuItem
                          text="Disable"
                          disabled={group.languages.filter(l => l.active).length === 1}
                          tooltip={group.languages.filter(l => l.active).length === 1 ? 'This is the only active subset. At least one subset must remain active per modeling language.' : undefined}
                        />
                        {lang.variant !== 'Default' && <MenuItem text="Delete" />}
                      </>
                    ) : (
                      <>
                        {lang.variant !== 'Default' && <MenuItem text="Rename" />}
                        <MenuItem text="Duplicate" />
                        <MenuItem text="Enable" />
                        {lang.variant !== 'Default' && <MenuItem text="Delete" />}
                      </>
                    )}
                  </Menu>
                </div>
              ))}
            </div>
          )})}
        </div>
        )}

        {/* Right panel */}
        <div ref={rightPanelRef} style={{ flex: 1, background: 'var(--sapList_Background)', minWidth: 0, overflowY: 'auto', borderRadius: 'var(--sapElement_BorderCornerRadius)' }}>

          {rightView === 'elements' ? (
            <>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  {isNarrow ? (
                    <VariantManagement
                      closeOnItemSelect
                      hideSaveAs
                      hideManageVariants
                      level="H5"
                      size="H5"
                      titleText="Modeling Languages"
                      onSelect={(e: any) => {
                        const key = (e.detail.selectedVariant as any).children as string
                        const lang = allLangs.find(l => l.label === key)
                        if (lang) selectLang(lang.id)
                      }}
                    >
                      {langGroups.map(group => (
                        <ListItemGroup key={group.id} headerText={group.label}>
                          {group.languages.map(lang => (
                            <VariantItem key={lang.id} selected={lang.id === selectedId} labelReadOnly hideDelete readOnly>
                              {lang.label}
                            </VariantItem>
                          ))}
                        </ListItemGroup>
                      ))}
                    </VariantManagement>
                  ) : (
                    <Title level="H5" style={{ fontStyle: selected.label ? 'normal' : 'italic' } as React.CSSProperties}>{selected.label}</Title>
                  )}
                  {!selected.active && <SigChipV2 value="Disabled" design="indication2" condensed />}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isNarrow && (
                      <>
                        <Button
                          id="narrow-create-lang-btn"
                          design="Emphasized"
                          endIcon="slim-arrow-down"
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'narrow-create-lang' ? null : 'narrow-create-lang') }}
                        >Create Subset</Button>
                        <Menu
                          opener="narrow-create-lang-btn"
                          open={openMenu === 'narrow-create-lang'}
                          onClose={() => setOpenMenu(null)}
                          onItemClick={(e: any) => {
                            const text = e.detail?.item?.text
                            setOpenMenu(null)
                            const group = langGroups.find(g => g.label === text)
                            if (group) { setAddElementSetGroupId(group.id); setNewElementSetName('') }
                          }}
                        >
                          {langGroups.map(g => <MenuItem key={g.id} text={g.label} />)}
                        </Menu>
                      </>
                    )}
                    <Button
                      design="Transparent"
                      disabled={selected.active && allLangs.filter(l => l.active).length === 1}
                      onClick={() => toggleLangActive(selected.id)}
                    >{selected.active ? 'Disable' : 'Enable'}</Button>
                    <Button
                      id="right-panel-lang-overflow-btn"
                      icon="overflow"
                      design="Transparent"
                      accessibleName={`Options for ${selected.label}`}
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'right-panel-lang-overflow' ? null : 'right-panel-lang-overflow') }}
                    />
                    <Menu
                      opener="right-panel-lang-overflow-btn"
                      open={openMenu === 'right-panel-lang-overflow'}
                      onClose={() => setOpenMenu(null)}
                      onItemClick={(e: any) => {
                        const text = e.detail?.item?.text
                        setOpenMenu(null)
                        if (text === 'Delete') {
                          setDeleteLang(selected)
                        } else if (text === 'Duplicate') {
                          setDuplicateLang(selected)
                          setDuplicateName(`${selected.label}_copy`)
                        } else if (text === 'Rename') {
                          setRenameLang(selected)
                          setRenameName(selected.label)
                        }
                      }}
                    >
                      {selected.variant !== 'Default' && <MenuItem text="Rename" />}
                      <MenuItem text="Duplicate" />
                      {selected.variant !== 'Default' && <MenuItem text="Delete" />}
                    </Menu>
                  </div>
                </div>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>
                  {'Usage: '}
                  <Text style={{ fontSize: '14px' }}>{countEnabled(selected)} of {countTotal(selected)} elements enabled</Text>
                  {'  ·  Last Modified: '}
                  <Text style={{ fontSize: '14px' }}>{selected.lastModified}</Text>
                </Text>
              </div>

              <div style={{ borderTop: BORDER }}>
              {/* Search + select-all bar */}
              {(() => {
                const allItems = selected.groups.flatMap(g => g.items)
                const filteredItems = elementSearch
                  ? allItems.filter(i => i.label.toLowerCase().includes(elementSearch.toLowerCase()))
                  : allItems
                const allFilteredEnabled = filteredItems.length > 0 && filteredItems.every(i => i.enabled)
                const someFilteredEnabled = filteredItems.some(i => i.enabled)
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.5rem 0.5rem 1rem', borderBottom: BORDER }}>
                    {/* spacer matches the expand chevron width so checkbox aligns with group checkboxes */}
                    <div style={{ width: '1rem', flexShrink: 0 }} />
                    <CheckBox
                      checked={allFilteredEnabled || (!allFilteredEnabled && someFilteredEnabled)}
                      indeterminate={!allFilteredEnabled && someFilteredEnabled}
                      accessibleName="Toggle all elements"
                      readonly={selected.variant === 'Default' || !selected.active}
                      onChange={() => {
                        if (selected.variant === 'Default') return
                        filteredItems.forEach(item => {
                          const group = selected.groups.find(g => g.items.some(i => i.id === item.id))
                          if (group && item.enabled === allFilteredEnabled) {
                            toggleItem(selected.id, group.id, item.id)
                          }
                        })
                      }}
                      style={{ opacity: selected.active ? 1 : 0.4 }}
                    />
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>

                      <Button design="Transparent" disabled={selected.groups.every(gr => gr.expanded)} onClick={() => setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.map(l => l.id === selected.id ? { ...l, groups: l.groups.map(gr => ({ ...gr, expanded: true })) } : l) })))}>Expand All</Button>
                      <Button design="Transparent" disabled={selected.groups.every(gr => !gr.expanded)} onClick={() => setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.map(l => l.id === selected.id ? { ...l, groups: l.groups.map(gr => ({ ...gr, expanded: false })) } : l) })))}>Collapse All</Button>

                      <Input
                        placeholder="Search"
                        value={elementSearch}
                        onInput={(e: any) => setElementSearch(e.target.value)}
                        icon={elementSearch
                          ? <Icon slot="icon" name="decline" style={{ cursor: 'pointer' }} onClick={() => setElementSearch('')} />
                          : <Icon slot="icon" name="search" />
                        }
                        style={{ width: '14rem' }}
                      />
                    </div>
                  </div>
                )
              })()}
              {selected.groups.map((group, groupIdx) => {
                const visibleItems = elementSearch
                  ? group.items.filter(i => i.label.toLowerCase().includes(elementSearch.toLowerCase()))
                  : group.items
                if (visibleItems.length === 0) return null
                const enabledCount = visibleItems.filter(i => i.enabled).length
                const allEnabled = enabledCount === visibleItems.length
                const noneEnabled = enabledCount === 0
                const isLastGroup = groupIdx === selected.groups.length - 1

                return (
                  <div key={group.id}>
                    <div
                      className="element-row"
                      onClick={() => toggleGroupExpand(selected.id, group.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: (!group.expanded && isLastGroup) ? 'none' : BORDER, cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Icon
                        name={group.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                        style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, opacity: selected.active ? 1 : 0.4 }}
                      />
                      <CheckBox
                        checked={allEnabled || (!allEnabled && !noneEnabled)}
                        indeterminate={!allEnabled && !noneEnabled}
                        accessibleName={`Toggle all items in ${group.label}`}
                        readonly={selected.variant === 'Default' || !selected.active}
                        onChange={() => {
                          if (selected.variant === 'Default') return
                          if (elementSearch) {
                            visibleItems.forEach(item => {
                              if (item.enabled === allEnabled) toggleItem(selected.id, group.id, item.id)
                            })
                          } else {
                            toggleGroupAll(selected.id, group.id)
                          }
                        }}
                        onClick={(e: any) => e.stopPropagation()}
                        style={{ opacity: selected.active ? 1 : 0.4 }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', opacity: selected.active ? 1 : 0.4 }}>
                        <Text style={{ display: 'block', fontWeight: '600' }}>{group.label} ({visibleItems.length})</Text>
                        <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                          {allEnabled ? `${enabledCount} enabled` : noneEnabled ? `${visibleItems.length} disabled` : `${enabledCount} enabled · ${visibleItems.length - enabledCount} disabled`}
                        </Text>
                      </div>
                    </div>

                    {group.expanded && visibleItems.map((item, itemIdx) => {
                      const isLastItem = itemIdx === visibleItems.length - 1
                      const isItemSelected = selectedElementId === item.id
                      return (
                        <div
                          key={item.id}
                          className="element-row"
                          onClick={() => {
                            if (selected.variant === 'Default') return
                            setSelectedElementId(isItemSelected ? null : item.id)
                            toggleItem(selected.id, group.id, item.id)
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.5rem 1rem 0.5rem 5.5rem',
                            background: isItemSelected ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                            borderBottom: (!isLastItem || !isLastGroup) ? BORDER : 'none',
                            cursor: selected.variant === 'Default' ? 'default' : 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <CheckBox checked={item.enabled} accessibleName={item.label} readonly={selected.variant === 'Default' || !selected.active} onChange={() => { if (selected.variant !== 'Default') toggleItem(selected.id, group.id, item.id) }} onClick={(e: any) => e.stopPropagation()} style={{ opacity: selected.active ? 1 : 0.4 }} />
                          <div style={{
                            width: '48px', height: '48px', flexShrink: 0,
                            border: '1px solid var(--sapGroup_ContentBorderColor)',
                            borderRadius: '8px',
                            opacity: item.enabled ? (selected.active ? 1 : 0.4) : 0.4,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <ItemIcon id={item.id} />
                          </div>
                          <Text style={{ opacity: item.enabled ? (selected.active ? 1 : 0.4) : 0.4 }}>{item.label}</Text>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              </div>
            </>
          ) : (
            /* Appearance view */
            <>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  {isNarrow ? (
                    <VariantManagement
                      closeOnItemSelect
                      hideSaveAs
                      hideManageVariants
                      level="H5"
                      size="H5"
                      titleText="Modeling Languages"
                      onSelect={(e: any) => {
                        const key = (e.detail.selectedVariant as any).children as string
                        const group = langGroups.find(g => g.label === key)
                        if (group) selectGroup(group.id)
                      }}
                    >
                      {langGroups.map(group => (
                        <VariantItem key={group.id} selected={group.id === selectedGroupId} labelReadOnly hideDelete readOnly>
                          {group.label}
                        </VariantItem>
                      ))}
                    </VariantManagement>
                  ) : (
                    <Title level="H5">{selectedGroup.label}</Title>
                  )}
                  {selectedGroup.languages.every(l => !l.active) && <SigChipV2 value="Disabled" design="indication2" condensed />}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isNarrow && (
                      <>
                        <Button
                          id="narrow-create-lang-btn-appearance"
                          design="Emphasized"
                          endIcon="slim-arrow-down"
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'narrow-create-lang-appearance' ? null : 'narrow-create-lang-appearance') }}
                        >Create Subset</Button>
                        <Menu
                          opener="narrow-create-lang-btn-appearance"
                          open={openMenu === 'narrow-create-lang-appearance'}
                          onClose={() => setOpenMenu(null)}
                          onItemClick={(e: any) => {
                            const text = e.detail?.item?.text
                            setOpenMenu(null)
                            const group = langGroups.find(g => g.label === text)
                            if (group) { setAddElementSetGroupId(group.id); setNewElementSetName('') }
                          }}
                        >
                          {langGroups.map(g => <MenuItem key={g.id} text={g.label} />)}
                        </Menu>
                      </>
                    )}
                    <Button
                      design="Transparent"
                      disabled={!selectedGroup.languages.every(l => !l.active) && allLangs.filter(l => l.active).length === selectedGroup.languages.filter(l => l.active).length}
                      onClick={() => {
                        const allDisabled = selectedGroup.languages.every(l => !l.active)
                        setLangGroups(prev => prev.map(g => g.id === selectedGroup.id
                          ? { ...g, languages: g.languages.map(l => ({ ...l, active: allDisabled })) }
                          : g
                        ))
                        setIsDirty(true)
                      }}
                    >{selectedGroup.languages.every(l => !l.active) ? 'Enable' : 'Disable'}</Button>
                    <Button
                      id="appearance-overflow-btn"
                      icon="overflow"
                      design="Transparent"
                      accessibleName={`Options for ${selectedGroup.label}`}
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === 'appearance-overflow' ? null : 'appearance-overflow') }}
                    />
                    <Menu
                      opener="appearance-overflow-btn"
                      open={openMenu === 'appearance-overflow'}
                      onClose={() => setOpenMenu(null)}
                      onItemClick={(e: any) => {
                        const text = e.detail?.item?.text
                        setOpenMenu(null)
                        if (text === 'Create Subset') {
                          setAddElementSetGroupId(selectedGroup.id); setNewElementSetName('')
                        }
                      }}
                    >
                      <MenuItem text="Create Subset" />
                    </Menu>
                  </div>
                </div>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>
                  {'Last Modified: '}
                  <Text style={{ fontSize: '14px' }}>{selected.lastModified}</Text>
                </Text>
              </div>

              {/* Info strip */}
              <div style={{ padding: '0.75rem 1rem' }}>
                <MessageStrip design="Information" hideCloseButton>
                  Customize the appearance of all shapes in this modeling language, including custom graphics. Changes apply to all configured modeling language subsets.
                </MessageStrip>
              </div>

              {/* Groups */}
              <div style={{ padding: '0 1rem' }}>
              {BASE_GROUPS.map(group => (
                <Panel key={group.id} headerText={group.label} style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                    gap: '0',
                  }}>
                      {group.items.map(item => {
                        const state = itemStates[item.id] ?? 'default'
                        const menuId = `shape-menu-${item.id}`
                        return (
                          <div
                            key={item.id}
                            className="shape-card"
                            style={{
                                position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '36px 8px 8px',
                              border: BORDER,
                              borderRadius: '8px',
                              background: 'var(--sapBaseColor)',
                              margin: '3px',
                              minHeight: '180px',
                            }}
                          >
                            {/* State chip — absolute top-left */}
                            {state !== 'default' && <StateChip state={state} />}

                            {/* Overflow menu top-right */}
                            <div style={{ position: 'absolute', top: '2px', right: '2px' }}>
                              <Button
                                id={menuId}
                                icon="overflow"
                                design="Transparent"
                                accessibleName={`Options for ${item.label}`}
                                onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id) }}
                              />
                              <Menu
                                opener={menuId}
                                open={openMenu === item.id}
                                onClose={() => setOpenMenu(null)}
                                onItemClick={(e: any) => {
                                  const text = e.detail?.item?.text
                                  setOpenMenu(null)
                                  if (text === 'Edit style') setEditAppearanceItem({ id: item.id, label: item.label })
                                  else if (text === 'Upload custom graphics') setEditAppearanceItem({ id: item.id, label: item.label, initialTab: 'custom-graphics' })
                                  else if (text === 'Restore to Default') setItemState(item.id, 'default')
                                }}
                              >
                                <MenuItem text="Edit Style" />
                                {['additional-participant', 'data-object', 'it-system'].includes(item.id) && <MenuItem text="Upload Custom Graphics" />}
                              </Menu>
                            </div>

                            {/* Icon — styled preview reflecting saved appearance */}
                            {(() => {
                              const appearance = itemAppearanceValues[item.id]
                              const bgColor = appearance?.bgColor ?? '#FFFFFF'
                              const fontColor = appearance?.fontColor
                              return (
                                <div style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: '64px', height: '64px',
                                  background: bgColor,
                                  ...(fontColor ? { color: fontColor } : {}),
                                }}>
                                  <ItemIcon id={item.id} size={42} />
                                </div>
                              )
                            })()}

                            {/* Label */}
                            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', textAlign: 'center', lineHeight: '1.3', paddingBottom: '0.5rem' }}>
                              {item.label}
                            </Text>
                          </div>
                      )
                    })}
                  </div>
                </Panel>
              ))}
              </div>
            </>
          )}
        </div>
      </div>
  )

  return (
    <>
    <ObjectPage
      style={{ height: '100%' } as React.CSSProperties}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      selectedSectionId={tool}
      onSelectedSectionChange={(e: any) => {
        const idx = e.detail?.selectedSectionIndex ?? 0
        setTool(idx === 0 ? 'modeler' : 'pm-legacy')
      }}
      titleArea={
        <ObjectPageTitle
          header="Modeling Languages and Elements"
          subHeader="Configure which modeling languages and elements are available in your workspace."
        />
      }
      footerArea={isDirty ? (
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
          <Button slot="endContent" onClick={handleReset}>Discard Changes</Button>
        </Bar>
      ) : undefined}
    >
      <ObjectPageSection id="modeler" titleText="Modeler" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the New Process Modeler only.</strong> It has no effect on the legacy Process Modeler.
          </MessageStrip>
        </div>
        {body}
      </ObjectPageSection>
      <ObjectPageSection id="pm-legacy" titleText="Process Manager (legacy)" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the legacy Process Modeler only.</strong> It has no effect on the New Process Modeler.
          </MessageStrip>
        </div>
        {body}
      </ObjectPageSection>
    </ObjectPage>

      <Dialog open={addElementSetGroupId !== null} onClose={() => setAddElementSetGroupId(null)} headerText="Create Subset">
        {addElementSetGroupId && (
          <div slot="header" style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0', width: '100%' }}>
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)' }}>Create Subset</Text>
            <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
              {langGroups.find(g => g.id === addElementSetGroupId)?.label}
            </Text>
          </div>
        )}
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '28rem' }}>
          <Label for="element-set-name-input">Subset Name:</Label>
          <Input id="element-set-name-input" placeholder="Enter a name for the new subset" value={newElementSetName} onInput={(e: any) => setNewElementSetName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Emphasized" onClick={() => {
            if (!newElementSetName.trim() || !addElementSetGroupId) return
            const newLang: Language = {
              id: `custom-${Date.now()}`, label: newElementSetName.trim(), variant: 'Custom', active: true,
              lastModified: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              groups: clone(BASE_GROUPS),
            }
            setLangGroups(prev => prev.map(g => g.id === addElementSetGroupId ? { ...g, expanded: true, languages: [...g.languages, newLang] } : g))
            setIsDirty(true); setAddElementSetGroupId(null); setElementSetToast(true); selectLang(newLang.id)
          }}>Create</Button>
          <Button design="Transparent" onClick={() => setAddElementSetGroupId(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Toast open={elementSetToast} placement="BottomCenter" onClose={() => setElementSetToast(false)}>Modeling language added</Toast>
      <Toast open={groupDisabledToast !== null} placement="BottomCenter" onClose={() => setGroupDisabledToast(null)}>"{groupDisabledToast}" disabled</Toast>
      <Toast open={duplicateToast} placement="BottomCenter" onClose={() => setDuplicateToast(false)}>Modeling language duplicated</Toast>
      <Toast open={enabledToast !== null} placement="BottomCenter" onClose={() => setEnabledToast(null)}>"{enabledToast}" enabled</Toast>
      <Toast open={renamedToast} placement="BottomCenter" onClose={() => setRenamedToast(false)}>Modeling language renamed</Toast>
      <Toast open={deletedToast !== null} placement="BottomCenter" onClose={() => setDeletedToast(null)}>"{deletedToast}" deleted</Toast>

      <Dialog open={deleteLang !== null} onClose={() => setDeleteLang(null)} className="delete-message-box">
        <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', width: '100%' }}>
          <Icon name="alert" style={{ color: 'var(--sapCriticalElementColor)', width: '1.25rem', height: '1.25rem' }} />
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)' }}>Delete</Text>
        </div>
        <div style={{ padding: '1rem', minWidth: '24rem' }}>
          <Text>This modeling language will be permanently deleted.</Text>
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Negative" onClick={() => {
            if (!deleteLang) return
            setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.filter(l => l.id !== deleteLang.id) })))
            setIsDirty(true); setDeletedToast(deleteLang.label)
            if (selectedId === deleteLang.id) {
              const remaining = langGroups.flatMap(g => g.languages).filter(l => l.id !== deleteLang.id)
              if (remaining.length > 0) selectLang(remaining[0].id)
            }
            setDeleteLang(null)
          }}>Delete</Button>
          <Button design="Transparent" onClick={() => setDeleteLang(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog open={renameLang !== null} onClose={() => setRenameLang(null)} headerText="Rename Modeling Language">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '28rem' }}>
          <Label for="rename-input">New Name:</Label>
          <Input id="rename-input" value={renameName} onInput={(e: any) => setRenameName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Emphasized" onClick={() => {
            if (!renameName.trim() || !renameLang) return
            updateLang(renameLang.id, l => ({ ...l, label: renameName.trim() }))
            setIsDirty(true); setRenameLang(null); setRenamedToast(true)
          }}>Rename</Button>
          <Button design="Transparent" onClick={() => setRenameLang(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog open={duplicateLang !== null} onClose={() => setDuplicateLang(null)} headerText="Duplicate Modeling Language">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '28rem' }}>
          <Label for="duplicate-name-input">New Modeling Language Name:</Label>
          <Input id="duplicate-name-input" value={duplicateName} onInput={(e: any) => setDuplicateName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Emphasized" onClick={() => {
            if (!duplicateName.trim() || !duplicateLang) return
            const newLang: Language = {
              ...clone(duplicateLang), id: `custom-${Date.now()}`, label: duplicateName.trim(), variant: 'Custom',
              lastModified: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            }
            setLangGroups(prev => prev.map(g => ({
              ...g, languages: g.languages.find(l => l.id === duplicateLang.id) ? [...g.languages, newLang] : g.languages
            })))
            setIsDirty(true); setDuplicateLang(null); setDuplicateToast(true)
          }}>Duplicate</Button>
          <Button design="Transparent" onClick={() => setDuplicateLang(null)}>Cancel</Button>
        </div>
      </Dialog>

      <EditAppearanceDialog
        open={editAppearanceItem !== null}
        itemId={editAppearanceItem?.id ?? ''}
        itemLabel={editAppearanceItem?.label ?? ''}
        showCustomGraphics={['additional-participant', 'data-object', 'it-system'].includes(editAppearanceItem?.id ?? '')}
        initialTab={editAppearanceItem?.initialTab}
        onClose={() => setEditAppearanceItem(null)}
        initialValues={editAppearanceItem ? itemAppearanceValues[editAppearanceItem.id] : undefined}
        onApply={(v) => {
          const id = editAppearanceItem?.id ?? ''
          setItemState(id, 'style-updated')
          setItemAppearanceValues(prev => ({ ...prev, [id]: v }))
          setIsDirty(true)
        }}
        onRestoreDefault={() => {
          const id = editAppearanceItem?.id ?? ''
          setItemState(id, 'default')
          setItemAppearanceValues(prev => { const n = { ...prev }; delete n[id]; return n })
          setIsDirty(true)
        }}
      />
    </>
  )
}
