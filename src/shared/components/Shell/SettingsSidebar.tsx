import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  SideNavigation, SideNavigationGroup, SideNavigationItem,
  Title, Input, Icon, Text, Button, IllustratedMessage,
} from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/UnableToLoad.js'
import { searchSettings } from '../../../settingsSearch'
import { SETTINGS_GROUPS, SETTINGS_PAGES } from '../../../data/settingsPages'

// text → path map, derived from the settings registry. Used by Shell's nav handler.
export const SETTINGS_NAV_TEXT_TO_PATH: Record<string, string> = Object.fromEntries(
  SETTINGS_PAGES.map(p => [p.text, p.path])
)

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  onNavChange: (e: CustomEvent) => void
  errorStateEnabled: boolean
}

export function SettingsSidebar({ searchQuery, onSearchChange, onNavChange, errorStateEnabled }: Props) {
  const location = useLocation()
  const currentPath = location.pathname
  const matchedPaths = searchSettings(searchQuery)
  const isFiltered = searchQuery.trim().length > 0
  const filteredNav = isFiltered
    ? SETTINGS_GROUPS.map(group => ({ ...group, items: group.items.filter(item => matchedPaths.has(item.path)) })).filter(group => group.items.length > 0)
    : SETTINGS_GROUPS

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: '17rem', flexShrink: 0, borderRight: '1px solid var(--sapList_BorderColor)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--sapGroup_ContentBackground)' }}>
        <div style={{ padding: '1.25rem 1rem 1rem 1.5rem', flexShrink: 0, background: 'var(--sapGroup_TitleBackground)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Title level="H5">Workspace Settings</Title>
          <Input
            placeholder="Search settings"
            icon={<Icon name="search" />}
            showClearIcon
            value={searchQuery}
            onInput={(e) => onSearchChange((e.target as unknown as { value?: string }).value ?? '')}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredNav.length === 0 ? (
            <div style={{ padding: '1rem 1.5rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>No settings found</Text>
            </div>
          ) : (
            <SideNavigation onSelectionChange={onNavChange} style={{ height: 'auto', boxShadow: 'none', '--_ui5_side_navigation_shadow': 'none', '--_ui5_side_nav_shadow': 'none' } as React.CSSProperties}>
              {filteredNav.map(group => (
                <SideNavigationGroup key={group.title} text={group.title} expanded>
                  {group.items.map(item => (
                    <SideNavigationItem
                      key={item.path}
                      text={item.text}
                      selected={currentPath === item.path || currentPath.startsWith(item.path + '/')}
                    />
                  ))}
                </SideNavigationGroup>
              ))}
            </SideNavigation>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', background: 'var(--sapBackgroundColor)' }}>
        {errorStateEnabled ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IllustratedMessage name="UnableToLoad" titleText="Something went wrong" subtitleText="There was a problem connecting to the service. Please try again or contact your administrator if the issue persists.">
              <Button design="Emphasized" onClick={() => {}}>Retry</Button>
            </IllustratedMessage>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}
