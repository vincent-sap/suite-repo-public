import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Icon, Text, Menu, MenuItem, MessageStrip, Switch } from '@ui5/webcomponents-react'
import PageHeader from './components/PageHeader'
import { ITEM_ICONS, INITIAL_LANG_GROUPS, type Language } from '../../data/modelingLanguages'

// Per-item appearance state: 'default' | 'style-updated' | 'custom-graphics'
type AppearanceState = 'default' | 'style-updated' | 'custom-graphics'

const ItemIcon = ({ id }: { id: string }) => {
  const iconName = ITEM_ICONS[id]
  if (!iconName) return null
  if (iconName.startsWith('<')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 16 16" fill="none"
        style={{ color: 'var(--sapContent_IconColor)' }}
        dangerouslySetInnerHTML={{ __html: iconName }} />
    )
  }
  return <Icon name={iconName} style={{ width: '42px', height: '42px', color: 'var(--sapContent_IconColor)' }} />
}

const StateChip = ({ state }: { state: AppearanceState }) => {
  if (state === 'default') return null
  const isCustom = state === 'custom-graphics'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px',
      borderRadius: '4px',
      border: `1px solid ${isCustom ? 'var(--sapInformativeElementColor)' : 'var(--sapList_BorderColor)'}`,
      background: isCustom ? 'var(--sapInformativeBackground)' : 'var(--sapNeutralBackground)',
      color: isCustom ? 'var(--sapInformativeElementColor)' : 'var(--sapContent_LabelColor)',
      fontSize: 'var(--sapFontSmallSize)',
      whiteSpace: 'nowrap',
    }}>
      {isCustom && <Icon name="picture" style={{ width: '12px', height: '12px', color: 'var(--sapInformativeElementColor)' }} />}
      {isCustom ? 'Custom graphics' : 'Style updated'}
    </div>
  )
}

const findLang = (langId: string): Language | undefined =>
  INITIAL_LANG_GROUPS.flatMap(g => g.languages).find(l => l.id === langId)

export default function ModelingLanguageAppearance() {
  const { langId } = useParams<{ langId: string }>()
  const navigate = useNavigate()
  const lang = findLang(langId ?? '')

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [itemStates, setItemStates] = useState<Record<string, AppearanceState>>(() => {
    // Demo: a few items pre-set for visual interest
    return {
      'task': 'style-updated',
      'exclusive-xor-gateway': 'style-updated',
      'inclusive-gateway': 'custom-graphics',
      'parallel-gateway': 'style-updated',
      'start-event': 'custom-graphics',
      'start-conditional-event': 'style-updated',
    }
  })

  const setItemState = (itemId: string, state: AppearanceState) =>
    setItemStates(prev => ({ ...prev, [itemId]: state }))

  if (!lang) {
    return (
      <PageHeader title="Appearance">
        <Text>Language not found</Text>
      </PageHeader>
    )
  }

  const BORDER = '1px solid var(--sapList_BorderColor)'

  // All items flat for the "All Shapes" view
  const allGroups = lang.groups

  return (
    <PageHeader
      title="Modeling Languages and Elements"
      subtitle="Configure which modeling languages and elements are available in your workspace."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>

        {/* Page title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              icon="slim-arrow-left"
              design="Transparent"
              onClick={() => navigate('/modeling-languages')}
              accessibleName="Back"
            />
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontHeader4Size)', color: 'var(--sapTextColor)' }}>
              {lang.label}
            </Text>
            <Switch checked={lang.active} />
          </div>
        </div>

        {/* All Shapes section */}
        <div style={{ border: BORDER, borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: BORDER }}>
            <Icon
              name="navigation-down-arrow"
              style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0 }}
            />
            <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>All Shapes</Text>
          </div>

          {/* Info strip */}
          <div style={{ padding: '0.5rem 1rem', borderBottom: BORDER }}>
            <MessageStrip design="Information" hideCloseButton>
              Customize the appearance of all shapes in this modeling language, including custom graphics. Changes apply across the entire modeling language.
            </MessageStrip>
          </div>

          {/* Groups */}
          {allGroups.map(group => (
            <div key={group.id}>
              {/* Group label */}
              <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: BORDER }}>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
                  {group.label}
                </Text>
              </div>

              {/* Shape cards grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '0',
                padding: '1rem',
                borderBottom: BORDER,
              }}>
                {group.items.map(item => {
                  const state = itemStates[item.id] ?? 'default'
                  const menuId = `shape-menu-${item.id}`
                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        padding: '0.75rem 0.5rem 0.75rem',
                        border: BORDER,
                        borderRadius: '8px',
                        background: 'var(--sapBaseColor)',
                        margin: '4px',
                        minHeight: '120px',
                      }}
                    >
                      {/* State chip top-left */}
                      <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                        <StateChip state={state} />
                      </div>

                      {/* Overflow menu top-right */}
                      <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
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
                            if (text === 'Edit appearance') setItemState(item.id, 'style-updated')
                            else if (text === 'Upload Custom Graphics') setItemState(item.id, 'custom-graphics')
                            else if (text === 'Restore to Default') setItemState(item.id, 'default')
                          }}
                        >
                          <MenuItem text="Edit Appearance" />
                          <MenuItem text="Upload Custom Graphics" />
                          {state !== 'default' && <MenuItem text="Restore to Default" />}
                        </Menu>
                      </div>

                      {/* Icon */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: '1.5rem' }}>
                        <ItemIcon id={item.id} />
                      </div>

                      {/* Label */}
                      <Text style={{
                        fontSize: 'var(--sapFontSize)',
                        color: 'var(--sapTextColor)',
                        textAlign: 'center',
                        lineHeight: '1.3',
                      }}>
                        {item.label}
                      </Text>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageHeader>
  )
}
